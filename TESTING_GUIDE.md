# Comprehensive Testing Guide - ProjektSusui RAG System

## 🧪 Testing Strategy Overview

### Testing Pyramid
```
        /\
       /  \   E2E Tests (10%)
      /    \  - User workflows
     /      \ - System integration
    /--------\
   /          \ Integration Tests (30%)
  /            \ - API endpoints
 /              \ - Service interactions
/________________\
     Unit Tests (60%)
  - Business logic
  - Data validation
  - Utility functions
```

## 🔬 Unit Testing

### 1. Service Tests
```python
# tests/unit/test_auth_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from core.services.auth_service import AuthService

@pytest.fixture
def auth_service():
    mock_user_repo = AsyncMock()
    return AuthService(user_repository=mock_user_repo)

@pytest.mark.asyncio
async def test_authenticate_user_success(auth_service):
    # Arrange
    auth_service.user_repo.get_by_username = AsyncMock(return_value=Mock(
        id=1,
        password_hash="hashed",
        metadata={'password_salt': 'c2FsdA=='},
        is_active=True
    ))
    
    # Act
    with patch('core.utils.security.verify_password', return_value=True):
        is_auth, user = await auth_service.authenticate_user("user", "pass")
    
    # Assert
    assert is_auth is True
    assert user.id == 1

@pytest.mark.asyncio
async def test_authenticate_user_invalid_password(auth_service):
    # Test invalid password scenario
    auth_service.user_repo.get_by_username = AsyncMock(return_value=Mock(
        password_hash="hashed",
        metadata={'password_salt': 'c2FsdA=='}
    ))
    
    with patch('core.utils.security.verify_password', return_value=False):
        is_auth, user = await auth_service.authenticate_user("user", "wrong")
    
    assert is_auth is False
    assert user is None
```

### 2. Repository Tests
```python
# tests/unit/test_document_repository.py
import pytest
import tempfile
from core.repositories.sqlite_repository import SQLiteRepository

@pytest.fixture
def temp_db():
    with tempfile.NamedTemporaryFile(suffix='.db') as f:
        yield f.name

@pytest.fixture
def repository(temp_db):
    return SQLiteRepository(temp_db)

@pytest.mark.asyncio
async def test_create_document(repository):
    # Arrange
    document = {
        'filename': 'test.pdf',
        'content_type': 'application/pdf',
        'file_size': 1024
    }
    
    # Act
    doc_id = await repository.create_document(document)
    
    # Assert
    assert doc_id is not None
    retrieved = await repository.get_document(doc_id)
    assert retrieved['filename'] == 'test.pdf'

@pytest.mark.asyncio
async def test_document_not_found(repository):
    # Act & Assert
    with pytest.raises(DocumentNotFoundError):
        await repository.get_document(999)
```

### 3. Utility Tests
```python
# tests/unit/test_security_utils.py
import pytest
from core.utils.security import hash_password, verify_password, sanitize_filename

def test_password_hashing():
    # Arrange
    password = "secure_password_123"
    
    # Act
    hashed, salt = hash_password(password)
    
    # Assert
    assert hashed != password
    assert len(salt) == 32
    assert verify_password(password, hashed, salt)

def test_password_verification_fails_with_wrong_password():
    password = "correct"
    wrong = "incorrect"
    hashed, salt = hash_password(password)
    
    assert not verify_password(wrong, hashed, salt)

@pytest.mark.parametrize("input_filename,expected", [
    ("../../../etc/passwd", "passwd"),
    ("file with spaces.pdf", "file_with_spaces.pdf"),
    ("file<>:\"|?*.pdf", "file.pdf"),
    ("", "unnamed"),
])
def test_sanitize_filename(input_filename, expected):
    assert sanitize_filename(input_filename) == expected
```

## 🔌 Integration Testing

### 1. API Endpoint Tests
```python
# tests/integration/test_api_endpoints.py
import pytest
from fastapi.testclient import TestClient
from core.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_query_endpoint(client):
    # Arrange
    query_data = {
        "query": "What is the rental price?",
        "top_k": 5
    }
    
    # Act
    response = client.post("/api/v1/query", json=query_data)
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) <= 5

def test_document_upload(client):
    # Arrange
    with open("tests/fixtures/sample.pdf", "rb") as f:
        files = {"file": ("sample.pdf", f, "application/pdf")}
        
        # Act
        response = client.post("/api/v1/documents", files=files)
    
    # Assert
    assert response.status_code == 200
    assert "document_id" in response.json()

def test_authentication_required(client):
    # Test protected endpoint without auth
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 401
```

### 2. Service Integration Tests
```python
# tests/integration/test_rag_service.py
import pytest
from core.services.simple_rag_service import SimpleRAGService
from core.repositories.vector_repository import VectorRepository
from core.ollama_client import OllamaClient

@pytest.fixture
async def rag_service():
    vector_repo = VectorRepository()
    llm_client = OllamaClient()
    return SimpleRAGService(vector_repo, llm_client)

@pytest.mark.asyncio
async def test_rag_query_with_sources(rag_service):
    # Arrange
    query = "What are the office hours?"
    
    # Act
    result = await rag_service.answer_query(query)
    
    # Assert
    assert result["answer"] is not None
    assert len(result["sources"]) > 0
    assert result["confidence"] >= 0.0
    assert result["confidence"] <= 1.0

@pytest.mark.asyncio
async def test_rag_handles_no_results(rag_service):
    # Arrange
    query = "Random nonsense query xyz123"
    
    # Act
    result = await rag_service.answer_query(query)
    
    # Assert
    assert "keine Information" in result["answer"].lower()
    assert len(result["sources"]) == 0
```

### 3. Database Integration Tests
```python
# tests/integration/test_database.py
import pytest
import asyncio
from core.repositories.sqlite_repository import SQLiteRepository

@pytest.mark.asyncio
async def test_concurrent_database_access():
    """Test thread safety with concurrent access"""
    repo = SQLiteRepository(":memory:")
    
    async def create_document(i):
        return await repo.create_document({
            'filename': f'doc_{i}.pdf',
            'content_type': 'application/pdf'
        })
    
    # Create 10 documents concurrently
    tasks = [create_document(i) for i in range(10)]
    doc_ids = await asyncio.gather(*tasks)
    
    assert len(doc_ids) == 10
    assert len(set(doc_ids)) == 10  # All unique

@pytest.mark.asyncio
async def test_transaction_rollback():
    """Test transaction rollback on error"""
    repo = SQLiteRepository(":memory:")
    
    with pytest.raises(Exception):
        async with repo.transaction():
            await repo.create_document({'filename': 'test.pdf'})
            raise Exception("Simulated error")
    
    # Document should not exist due to rollback
    docs = await repo.list_documents()
    assert len(docs) == 0
```

## 🌐 End-to-End Testing

### 1. User Workflow Tests
```python
# tests/e2e/test_user_workflows.py
import pytest
from playwright.sync_api import sync_playwright

@pytest.fixture
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        yield browser
        browser.close()

def test_document_upload_and_query_workflow(browser):
    page = browser.new_page()
    page.goto("http://localhost:8000")
    
    # Upload document
    page.click("text=Upload Document")
    page.set_input_files('input[type="file"]', "tests/fixtures/sample.pdf")
    page.click("text=Upload")
    
    # Wait for processing
    page.wait_for_selector("text=Upload successful", timeout=10000)
    
    # Query the document
    page.fill('input[placeholder="Ask a question"]', "What is this document about?")
    page.click("text=Search")
    
    # Verify response
    response = page.wait_for_selector(".answer-text", timeout=15000)
    assert response.is_visible()
    
    # Verify sources
    sources = page.query_selector_all(".source-item")
    assert len(sources) > 0

def test_authentication_flow(browser):
    page = browser.new_page()
    page.goto("http://localhost:8000/login")
    
    # Login
    page.fill('input[name="username"]', "testuser")
    page.fill('input[name="password"]', "testpass")
    page.click("text=Login")
    
    # Verify redirect to dashboard
    page.wait_for_url("**/dashboard")
    assert page.url.endswith("/dashboard")
    
    # Verify user menu
    assert page.is_visible("text=testuser")
```

### 2. API Workflow Tests
```python
# tests/e2e/test_api_workflows.py
import requests
import time

def test_complete_document_lifecycle():
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Upload document
    with open("tests/fixtures/sample.pdf", "rb") as f:
        response = requests.post(
            f"{base_url}/documents",
            files={"file": f}
        )
    assert response.status_code == 200
    doc_id = response.json()["document_id"]
    
    # 2. Wait for processing
    for _ in range(30):  # Max 30 seconds
        response = requests.get(f"{base_url}/documents/{doc_id}/status")
        if response.json()["status"] == "completed":
            break
        time.sleep(1)
    else:
        pytest.fail("Document processing timeout")
    
    # 3. Query the document
    response = requests.post(
        f"{base_url}/query",
        json={"query": "summarize this document"}
    )
    assert response.status_code == 200
    assert len(response.json()["answer"]) > 0
    
    # 4. Delete document
    response = requests.delete(f"{base_url}/documents/{doc_id}")
    assert response.status_code == 200
    
    # 5. Verify deletion
    response = requests.get(f"{base_url}/documents/{doc_id}")
    assert response.status_code == 404
```

## 🔒 Security Testing

### 1. Authentication Tests
```python
# tests/security/test_authentication.py
import pytest
import jwt
from datetime import datetime, timedelta

def test_jwt_token_expiry():
    """Test that expired tokens are rejected"""
    # Create expired token
    expired_token = jwt.encode({
        "sub": "user123",
        "exp": datetime.utcnow() - timedelta(hours=1)
    }, "secret", algorithm="HS256")
    
    response = requests.get(
        "http://localhost:8000/api/v1/protected",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401

def test_sql_injection_prevention():
    """Test SQL injection attempts are blocked"""
    malicious_query = "'; DROP TABLE documents; --"
    
    response = requests.post(
        "http://localhost:8000/api/v1/query",
        json={"query": malicious_query}
    )
    
    # Should return results or no results, not error
    assert response.status_code in [200, 404]
    
    # Verify table still exists
    response = requests.get("http://localhost:8000/api/v1/documents")
    assert response.status_code == 200

def test_path_traversal_prevention():
    """Test path traversal attempts are blocked"""
    malicious_filename = "../../../etc/passwd"
    
    response = requests.post(
        "http://localhost:8000/api/v1/documents",
        files={"file": (malicious_filename, b"content", "text/plain")}
    )
    
    if response.status_code == 200:
        doc = response.json()
        # Filename should be sanitized
        assert doc["filename"] != malicious_filename
        assert "/" not in doc["filename"]
```

### 2. Rate Limiting Tests
```python
# tests/security/test_rate_limiting.py
import asyncio
import aiohttp

async def test_rate_limiting():
    """Test that rate limits are enforced"""
    async with aiohttp.ClientSession() as session:
        url = "http://localhost:8000/api/v1/query"
        
        # Send 100 requests rapidly
        tasks = []
        for _ in range(100):
            task = session.post(url, json={"query": "test"})
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Count rate limited responses
        rate_limited = sum(
            1 for r in responses 
            if not isinstance(r, Exception) and r.status == 429
        )
        
        # Should have some rate limited requests
        assert rate_limited > 0
```

## 🚀 Performance Testing

### 1. Load Testing with Locust
```python
# tests/performance/locustfile.py
from locust import HttpUser, task, between, events
import random

class RAGSystemUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login once before testing"""
        response = self.client.post("/api/v1/auth/login", json={
            "username": "testuser",
            "password": "testpass"
        })
        self.token = response.json()["access_token"]
    
    @task(5)
    def search_query(self):
        """Most common operation"""
        queries = [
            "What is the rental price?",
            "Office hours?",
            "Contact information",
            "Payment methods",
            "Cancellation policy"
        ]
        
        with self.client.post(
            "/api/v1/query",
            json={"query": random.choice(queries)},
            headers={"Authorization": f"Bearer {self.token}"},
            catch_response=True
        ) as response:
            if response.elapsed.total_seconds() > 2:
                response.failure("Query took too long")
    
    @task(1)
    def upload_document(self):
        """Less common operation"""
        with open("tests/fixtures/small.pdf", "rb") as f:
            self.client.post(
                "/api/v1/documents",
                files={"file": f},
                headers={"Authorization": f"Bearer {self.token}"}
            )

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Generate performance report"""
    print(f"Average response time: {environment.stats.total.avg_response_time}ms")
    print(f"95th percentile: {environment.stats.total.get_response_time_percentile(0.95)}ms")
    print(f"Requests per second: {environment.stats.total.current_rps}")
```

### 2. Stress Testing
```python
# tests/performance/test_stress.py
import pytest
import asyncio
import aiohttp

@pytest.mark.stress
async def test_concurrent_uploads():
    """Test system under heavy upload load"""
    async def upload_file(session, file_content):
        url = "http://localhost:8000/api/v1/documents"
        data = aiohttp.FormData()
        data.add_field('file', file_content, filename='test.pdf')
        
        async with session.post(url, data=data) as response:
            return response.status
    
    async with aiohttp.ClientSession() as session:
        # Create 50 concurrent uploads
        file_content = b"x" * 1024 * 1024  # 1MB file
        tasks = [upload_file(session, file_content) for _ in range(50)]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # System should handle load gracefully
        successful = sum(1 for r in results if r == 200)
        assert successful > 40  # At least 80% success rate

@pytest.mark.stress
async def test_memory_leak():
    """Test for memory leaks under sustained load"""
    import psutil
    import gc
    
    process = psutil.Process()
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB
    
    # Run 1000 queries
    async with aiohttp.ClientSession() as session:
        for _ in range(1000):
            await session.post(
                "http://localhost:8000/api/v1/query",
                json={"query": "test query"}
            )
            if _ % 100 == 0:
                gc.collect()  # Force garbage collection
    
    final_memory = process.memory_info().rss / 1024 / 1024  # MB
    memory_increase = final_memory - initial_memory
    
    # Memory increase should be reasonable (< 100MB)
    assert memory_increase < 100, f"Memory leak detected: {memory_increase}MB increase"
```

## 🧹 Test Data Management

### 1. Fixtures
```python
# tests/fixtures/conftest.py
import pytest
import tempfile
import shutil
from pathlib import Path

@pytest.fixture(scope="session")
def test_data_dir():
    """Create temporary test data directory"""
    temp_dir = tempfile.mkdtemp()
    
    # Copy test files
    test_files = Path("tests/fixtures/data")
    if test_files.exists():
        shutil.copytree(test_files, Path(temp_dir) / "data")
    
    yield temp_dir
    
    # Cleanup
    shutil.rmtree(temp_dir)

@pytest.fixture
def sample_documents():
    """Provide sample documents for testing"""
    return [
        {
            "filename": "rental_agreement.pdf",
            "content": "Sample rental agreement content...",
            "metadata": {"type": "legal", "language": "de"}
        },
        {
            "filename": "office_info.docx",
            "content": "Office hours: 9-5 Monday to Friday",
            "metadata": {"type": "info", "language": "en"}
        }
    ]

@pytest.fixture
async def populated_database(repository, sample_documents):
    """Database with sample data"""
    for doc in sample_documents:
        await repository.create_document(doc)
    return repository
```

### 2. Test Database
```python
# tests/fixtures/database.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="function")
def test_db():
    """Create isolated test database"""
    engine = create_engine("sqlite:///:memory:")
    
    # Create tables
    from core.models import Base
    Base.metadata.create_all(engine)
    
    # Create session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    yield session
    
    session.close()
    engine.dispose()
```

## 📊 Test Coverage

### 1. Coverage Configuration
```ini
# .coveragerc
[run]
source = core
omit = 
    */tests/*
    */migrations/*
    */__pycache__/*
    */venv/*

[report]
precision = 2
show_missing = True
skip_covered = False

[html]
directory = htmlcov

[xml]
output = coverage.xml
```

### 2. Coverage Commands
```bash
# Run tests with coverage
pytest --cov=core --cov-report=html --cov-report=term

# Coverage targets
# - Unit tests: 80% minimum
# - Integration tests: 60% minimum
# - Overall: 70% minimum

# Generate coverage badge
coverage-badge -o coverage.svg
```

## 🚦 CI/CD Testing

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run unit tests
      run: pytest tests/unit -v
    
    - name: Run integration tests
      run: pytest tests/integration -v
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost/test
        REDIS_URL: redis://localhost:6379
    
    - name: Run security tests
      run: |
        bandit -r core/
        safety check
    
    - name: Check coverage
      run: |
        pytest --cov=core --cov-fail-under=70
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## 🎯 Testing Best Practices

### 1. Test Naming
```python
# Good test names
def test_should_return_error_when_document_not_found():
    pass

def test_should_hash_password_with_unique_salt():
    pass

# Bad test names
def test_1():
    pass

def test_document():
    pass
```

### 2. Test Structure (AAA Pattern)
```python
def test_example():
    # Arrange - Set up test data
    user = create_test_user()
    
    # Act - Perform the action
    result = authenticate_user(user.username, "password")
    
    # Assert - Verify the outcome
    assert result.success is True
    assert result.user.id == user.id
```

### 3. Test Isolation
```python
# Each test should be independent
@pytest.fixture(autouse=True)
def reset_database():
    """Reset database before each test"""
    yield
    cleanup_database()

def test_one():
    # This test doesn't affect test_two
    pass

def test_two():
    # This test doesn't depend on test_one
    pass
```

## 📝 Testing Checklist

### Before Commit
- [ ] All unit tests pass
- [ ] Code coverage > 70%
- [ ] No security warnings
- [ ] No linting errors

### Before Release
- [ ] All integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Security scan clean
- [ ] Load testing completed
- [ ] Documentation updated

### Production Validation
- [ ] Smoke tests pass
- [ ] Health checks green
- [ ] Metrics collecting
- [ ] Logs accessible
- [ ] Rollback plan ready

---
*Testing is not about finding bugs, it's about building confidence in your system.*