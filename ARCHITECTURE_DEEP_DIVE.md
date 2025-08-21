# ProjectSusi Architecture Deep Dive
## Comprehensive Code Structure and Design Patterns

### Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Design Patterns](#design-patterns)
3. [Code Structure Analysis](#code-structure-analysis)
4. [Data Flow](#data-flow)
5. [Key Components Deep Dive](#key-components-deep-dive)
6. [Integration Points](#integration-points)
7. [Security Architecture](#security-architecture)
8. [Performance Considerations](#performance-considerations)

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   Database      │
│                 │    │   Backend       │    │                 │
│ - HTML/JS/CSS   │◄──►│ - REST API      │◄──►│ - PostgreSQL    │
│ - Document UI   │    │ - Business      │    │ - SQLite        │
│ - Admin Panel   │    │   Logic         │    │ - Vector Store  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │   Ollama LLM    │             │
         └──────────────│   Integration   │─────────────┘
                        │ - Model Serving │
                        │ - RAG Pipeline  │
                        └─────────────────┘
```

### Layered Architecture Implementation

#### 1. Presentation Layer (`core/templates/`, `core/routers/`)
- **Purpose**: HTTP interface and user interaction
- **Components**: HTML templates, FastAPI routers
- **Responsibilities**: Request handling, response formatting, authentication

#### 2. Business Logic Layer (`core/services/`)
- **Purpose**: Core business rules and workflows
- **Components**: Service classes with domain logic
- **Responsibilities**: Data validation, business rules, orchestration

#### 3. Data Access Layer (`core/repositories/`)
- **Purpose**: Database abstraction and data persistence
- **Components**: Repository interfaces and implementations
- **Responsibilities**: CRUD operations, query optimization, data mapping

#### 4. Infrastructure Layer (`core/utils/`, `core/middleware/`)
- **Purpose**: Cross-cutting concerns and external integrations
- **Components**: Security, logging, monitoring, external services
- **Responsibilities**: Authentication, caching, error handling

## Design Patterns

### 1. Repository Pattern

**Interface Definition** (`core/repositories/interfaces.py`):
```python
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from .models import Document

class IDocumentRepository(ABC):
    """Abstract base class for document data access"""
    
    @abstractmethod
    async def create(self, document: Document) -> Document:
        """Create a new document record"""
        pass
    
    @abstractmethod
    async def get_by_id(self, doc_id: int) -> Optional[Document]:
        """Retrieve document by ID"""
        pass
    
    @abstractmethod
    async def update(self, doc_id: int, updates: Dict[str, Any]) -> Optional[Document]:
        """Update document fields"""
        pass
    
    @abstractmethod
    async def delete(self, doc_id: int) -> bool:
        """Delete document by ID"""
        pass
    
    @abstractmethod
    async def list_by_tenant(self, tenant_id: str, offset: int = 0, limit: int = 50) -> List[Document]:
        """List documents for a tenant with pagination"""
        pass
```

**PostgreSQL Implementation** (`core/repositories/postgresql_repository.py`):
```python
import asyncpg
from typing import List, Optional, Dict, Any
from .interfaces import IDocumentRepository
from .models import Document

class PostgreSQLDocumentRepository(IDocumentRepository):
    """PostgreSQL implementation of document repository"""
    
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        self.pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self):
        """Initialize database connection pool"""
        self.pool = await asyncpg.create_pool(
            self.db_url,
            min_size=10,
            max_size=50,
            command_timeout=60
        )
        await self._create_tables()
    
    async def _create_tables(self):
        """Auto-create database schema if not exists"""
        async with self.pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    file_size BIGINT,
                    file_hash VARCHAR(64) UNIQUE,
                    content_type VARCHAR(100),
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'uploaded',
                    tenant_id VARCHAR(100) NOT NULL,
                    uploader VARCHAR(100),
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
                CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
                CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(file_hash);
            ''')
    
    async def create(self, document: Document) -> Document:
        """Create new document with auto-generated ID"""
        async with self.pool.acquire() as conn:
            doc_id = await conn.fetchval(
                '''INSERT INTO documents 
                   (filename, file_size, file_hash, content_type, tenant_id, uploader, status)
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id''',
                document.filename, document.file_size, document.file_hash,
                document.content_type, document.tenant_id, document.uploader,
                document.status or 'uploaded'
            )
            return await self.get_by_id(doc_id)
    
    async def get_by_id(self, doc_id: int) -> Optional[Document]:
        """Retrieve document with error handling"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(
                    'SELECT * FROM documents WHERE id = $1', doc_id
                )
                return Document.from_row(row) if row else None
        except Exception as e:
            logger.error(f"Error retrieving document {doc_id}: {e}")
            return None
    
    async def update(self, doc_id: int, updates: Dict[str, Any]) -> Optional[Document]:
        """Dynamic field updates with validation"""
        if not updates:
            return await self.get_by_id(doc_id)
        
        # Build dynamic SQL
        set_clauses = []
        values = []
        param_idx = 1
        
        for field, value in updates.items():
            if field in ['filename', 'status', 'metadata']:
                set_clauses.append(f"{field} = ${param_idx}")
                values.append(value)
                param_idx += 1
        
        if not set_clauses:
            return await self.get_by_id(doc_id)
        
        set_clauses.append(f"updated_at = ${param_idx}")
        values.append(datetime.utcnow())
        values.append(doc_id)  # WHERE clause
        
        query = f'''UPDATE documents 
                   SET {', '.join(set_clauses)}
                   WHERE id = ${param_idx + 1}'''
        
        async with self.pool.acquire() as conn:
            await conn.execute(query, *values)
            return await self.get_by_id(doc_id)
```

### 2. Factory Pattern

**Database Factory** (`core/repositories/database_factory.py`):
```python
import os
from .interfaces import IDocumentRepository
from .postgresql_repository import PostgreSQLDocumentRepository
from .sqlite_repository import SQLiteDocumentRepository

class DatabaseFactory:
    """Factory for creating database repository instances"""
    
    @staticmethod
    def from_environment() -> IDocumentRepository:
        """Create repository based on environment configuration"""
        use_postgresql = os.getenv("USE_POSTGRESQL", "false").lower() == "true"
        
        if use_postgresql:
            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                raise ValueError("DATABASE_URL required for PostgreSQL")
            return PostgreSQLDocumentRepository()
        else:
            db_path = os.getenv("SQLITE_PATH", "data/rag_database.db")
            return SQLiteDocumentRepository(db_path)
    
    @staticmethod
    def create_postgresql(db_url: str) -> IDocumentRepository:
        """Create PostgreSQL repository explicitly"""
        return PostgreSQLDocumentRepository(db_url)
    
    @staticmethod  
    def create_sqlite(db_path: str) -> IDocumentRepository:
        """Create SQLite repository explicitly"""
        return SQLiteDocumentRepository(db_path)
```

**Repository Factory** (`core/repositories/factory.py`):
```python
from typing import Optional
from .interfaces import IDocumentRepository, IAuditRepository, ITenantRepository
from .database_factory import DatabaseFactory

class RepositoryFactory:
    """Main factory for all repository instances"""
    
    def __init__(self):
        self._documents: Optional[IDocumentRepository] = None
        self._audit: Optional[IAuditRepository] = None
        self._tenants: Optional[ITenantRepository] = None
    
    def get_document_repository(self) -> IDocumentRepository:
        """Lazy-loaded document repository"""
        if self._documents is None:
            self._documents = DatabaseFactory.from_environment()
        return self._documents
    
    def get_audit_repository(self) -> IAuditRepository:
        """Lazy-loaded audit repository"""
        if self._audit is None:
            self._audit = DatabaseFactory.create_audit_repository()
        return self._audit
    
    def get_tenant_repository(self) -> ITenantRepository:
        """Lazy-loaded tenant repository"""
        if self._tenants is None:
            self._tenants = DatabaseFactory.create_tenant_repository()
        return self._tenants
```

### 3. Dependency Injection Pattern

**Container Implementation** (`core/di/container.py`):
```python
from typing import Dict, Any, Callable, TypeVar, Type
from functools import lru_cache

T = TypeVar('T')

class DIContainer:
    """Simple dependency injection container"""
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, Callable] = {}
        self._singletons: Dict[str, Any] = {}
    
    def register_singleton(self, interface: Type[T], implementation: T):
        """Register singleton instance"""
        key = interface.__name__
        self._singletons[key] = implementation
    
    def register_factory(self, interface: Type[T], factory: Callable[[], T]):
        """Register factory function"""
        key = interface.__name__
        self._factories[key] = factory
    
    def get(self, interface: Type[T]) -> T:
        """Resolve dependency"""
        key = interface.__name__
        
        # Check singletons first
        if key in self._singletons:
            return self._singletons[key]
        
        # Check factories
        if key in self._factories:
            instance = self._factories[key]()
            return instance
        
        raise ValueError(f"No registration found for {interface}")

# Global container instance
container = DIContainer()
```

**Service Registration** (`core/di/services.py`):
```python
from .container import container
from ..repositories.factory import RepositoryFactory
from ..services.document_service import DocumentService
from ..services.query_service import QueryService

def setup_dependencies():
    """Configure all service dependencies"""
    
    # Repositories
    repo_factory = RepositoryFactory()
    container.register_singleton(RepositoryFactory, repo_factory)
    
    # Services  
    container.register_factory(
        DocumentService, 
        lambda: DocumentService(repo_factory.get_document_repository())
    )
    
    container.register_factory(
        QueryService,
        lambda: QueryService(
            repo_factory.get_document_repository(),
            container.get(DocumentService)
        )
    )

# FastAPI dependency injection
async def get_document_service() -> DocumentService:
    return container.get(DocumentService)

async def get_query_service() -> QueryService:
    return container.get(QueryService)
```

### 4. Strategy Pattern

**Query Processing Strategies** (`core/services/query_service.py`):
```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class QueryStrategy(ABC):
    """Abstract query processing strategy"""
    
    @abstractmethod
    async def process_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

class SimpleRAGStrategy(QueryStrategy):
    """Basic RAG implementation"""
    
    async def process_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Embed query
        query_embedding = await self.embed_text(query)
        
        # 2. Search similar chunks
        similar_chunks = await self.vector_search(query_embedding, context.get('tenant_id'))
        
        # 3. Generate response
        response = await self.generate_response(query, similar_chunks)
        
        return {
            'answer': response,
            'sources': similar_chunks,
            'confidence': self.calculate_confidence(similar_chunks)
        }

class EnhancedRAGStrategy(QueryStrategy):
    """Advanced RAG with query expansion and reranking"""
    
    async def process_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Query expansion
        expanded_queries = await self.expand_query(query)
        
        # 2. Multi-query retrieval
        all_chunks = []
        for exp_query in expanded_queries:
            embedding = await self.embed_text(exp_query)
            chunks = await self.vector_search(embedding, context.get('tenant_id'))
            all_chunks.extend(chunks)
        
        # 3. Rerank results
        reranked_chunks = await self.rerank_chunks(query, all_chunks)
        
        # 4. Generate response
        response = await self.generate_response(query, reranked_chunks[:5])
        
        return {
            'answer': response,
            'sources': reranked_chunks[:5],
            'confidence': self.calculate_confidence(reranked_chunks),
            'expanded_queries': expanded_queries
        }

class QueryService:
    """Main query service with strategy pattern"""
    
    def __init__(self):
        self.strategies = {
            'simple': SimpleRAGStrategy(),
            'enhanced': EnhancedRAGStrategy()
        }
    
    async def process_query(self, query: str, strategy: str = 'simple', **context) -> Dict[str, Any]:
        if strategy not in self.strategies:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        return await self.strategies[strategy].process_query(query, context)
```

## Code Structure Analysis

### Core Application (`core/main.py`)
```python
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .routers import (
    documents, query, admin, auth, metrics,
    background_jobs, compliance, tenants
)
from .middleware import (
    auth_middleware, error_handling_middleware,
    metrics_middleware, rate_limiting_middleware
)
from .di.services import setup_dependencies
from .startup_checks import perform_startup_checks

class RAGApplication:
    """Main application class with initialization"""
    
    def __init__(self):
        self.app = FastAPI(
            title="ProjectSusi RAG System",
            description="Swiss-compliant RAG system",
            version="2.0.0"
        )
        self._setup_middleware()
        self._setup_routes()
        self._setup_static_files()
    
    def _setup_middleware(self):
        """Configure middleware stack"""
        # CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"]
        )
        
        # Custom middleware
        self.app.add_middleware(auth_middleware.CSRFMiddleware)
        self.app.add_middleware(error_handling_middleware.ErrorHandlingMiddleware)
        self.app.add_middleware(metrics_middleware.MetricsMiddleware)
        self.app.add_middleware(rate_limiting_middleware.RateLimitingMiddleware)
    
    def _setup_routes(self):
        """Register all API routes"""
        api_prefix = "/api/v1"
        
        self.app.include_router(auth.router, prefix=api_prefix)
        self.app.include_router(documents.router, prefix=api_prefix)
        self.app.include_router(query.router, prefix=api_prefix)
        self.app.include_router(admin.router, prefix="/admin")
        self.app.include_router(metrics.router, prefix=api_prefix)
        self.app.include_router(background_jobs.router, prefix=api_prefix)
        self.app.include_router(compliance.router, prefix=api_prefix)
        self.app.include_router(tenants.router, prefix=api_prefix)
    
    def _setup_static_files(self):
        """Configure static file serving"""
        self.app.mount("/static", StaticFiles(directory="static"), name="static")
        self.app.mount("/templates", StaticFiles(directory="core/templates"), name="templates")
    
    @property
    def application(self) -> FastAPI:
        return self.app

async def create_app() -> FastAPI:
    """Application factory function"""
    
    # Setup dependencies
    setup_dependencies()
    
    # Perform startup checks
    await perform_startup_checks()
    
    # Create and configure app
    rag_app = RAGApplication()
    
    return rag_app.application

if __name__ == "__main__":
    app = create_app()
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
```

### Document Processing Service (`core/services/document_service.py`)

```python
import hashlib
import mimetypes
from typing import List, Optional, Dict, Any
from pathlib import Path

from ..repositories.interfaces import IDocumentRepository
from ..repositories.models import Document
from ..processors.document_processors import DocumentProcessorFactory
from ..utils.file_security import FileSecurityValidator

class DocumentService:
    """Core document processing and management service"""
    
    def __init__(self, doc_repo: IDocumentRepository):
        self.doc_repo = doc_repo
        self.processor_factory = DocumentProcessorFactory()
        self.security_validator = FileSecurityValidator()
    
    async def upload_document(self, 
                            file_data: bytes, 
                            filename: str, 
                            tenant_id: str, 
                            uploader: str) -> Document:
        """Complete document upload and processing workflow"""
        
        # 1. Security validation
        file_size = len(file_data)
        if not self.security_validator.validate_file(filename, file_size):
            raise ValueError("File validation failed")
        
        # 2. Generate file hash for deduplication
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        # 3. Check for duplicates
        existing_doc = await self.doc_repo.get_by_hash(file_hash)
        if existing_doc:
            raise ValueError(f"Document already exists: {existing_doc.filename}")
        
        # 4. Determine content type
        content_type, _ = mimetypes.guess_type(filename)
        
        # 5. Create document record
        document = Document(
            filename=filename,
            file_size=file_size,
            file_hash=file_hash,
            content_type=content_type,
            tenant_id=tenant_id,
            uploader=uploader,
            status='uploaded'
        )
        
        doc_record = await self.doc_repo.create(document)
        
        # 6. Save file to storage
        storage_path = await self._save_to_storage(file_data, filename, tenant_id, doc_record.id)
        
        # 7. Process document asynchronously
        await self._process_document_async(doc_record.id, storage_path)
        
        return doc_record
    
    async def _save_to_storage(self, file_data: bytes, filename: str, tenant_id: str, doc_id: int) -> str:
        """Save file to tenant-specific storage"""
        storage_dir = Path(f"data/storage/{tenant_id}")
        storage_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = int(time.time())
        safe_filename = self._make_filename_safe(filename)
        unique_filename = f"{safe_filename}_{timestamp}_{doc_id:08x}.{Path(filename).suffix}"
        
        storage_path = storage_dir / unique_filename
        
        with open(storage_path, 'wb') as f:
            f.write(file_data)
        
        return str(storage_path)
    
    async def _process_document_async(self, doc_id: int, storage_path: str):
        """Process document: extract text, chunk, embed"""
        try:
            # Update status
            await self.doc_repo.update(doc_id, {'status': 'processing'})
            
            # 1. Extract text content
            processor = self.processor_factory.get_processor(storage_path)
            text_content = await processor.extract_text(storage_path)
            
            # 2. Chunk text
            chunks = await self._chunk_text(text_content)
            
            # 3. Store chunks
            chunk_ids = await self._store_chunks(doc_id, chunks)
            
            # 4. Generate embeddings
            await self._generate_embeddings(chunk_ids, chunks)
            
            # 5. Update status
            await self.doc_repo.update(doc_id, {'status': 'completed'})
            
        except Exception as e:
            logger.error(f"Document processing failed for {doc_id}: {e}")
            await self.doc_repo.update(doc_id, {'status': 'failed'})
    
    async def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Chunk text with overlap for better context retention"""
        if not text or len(text) < chunk_size:
            return [text] if text else []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + chunk_size, len(text))
            
            # Try to break at word boundaries
            if end < len(text):
                last_space = text.rfind(' ', start, end)
                if last_space > start:
                    end = last_space
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start <= 0:
                break
        
        return chunks
    
    async def _store_chunks(self, document_id: int, chunks: List[str]) -> List[int]:
        """Store chunks in database with proper transaction handling"""
        chunk_ids = []
        
        if hasattr(self.doc_repo, 'pool') and self.doc_repo.pool:
            # PostgreSQL implementation
            async with self.doc_repo.pool.acquire() as conn:
                for idx, chunk_text in enumerate(chunks):
                    chunk_id = await conn.fetchval(
                        """INSERT INTO chunks (document_id, chunk_text, chunk_index)
                           VALUES ($1, $2, $3) RETURNING id""",
                        document_id, chunk_text, idx
                    )
                    chunk_ids.append(chunk_id)
        else:
            # SQLite implementation
            for idx, chunk_text in enumerate(chunks):
                chunk_id = await self.doc_repo.create_chunk(document_id, chunk_text, idx)
                chunk_ids.append(chunk_id)
        
        return chunk_ids
    
    async def _generate_embeddings(self, chunk_ids: List[int], chunks: List[str]):
        """Generate and store embeddings for chunks"""
        from sentence_transformers import SentenceTransformer
        
        # Load embedding model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Generate embeddings in batches
        batch_size = 32
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i+batch_size]
            batch_ids = chunk_ids[i:i+batch_size]
            
            # Generate embeddings
            embeddings = model.encode(batch_chunks)
            
            # Store embeddings
            await self._store_embeddings(batch_ids, embeddings, model.get_sentence_embedding_dimension())
    
    async def _store_embeddings(self, chunk_ids: List[int], embeddings, dimensions: int):
        """Store embeddings in database"""
        import numpy as np
        
        if hasattr(self.doc_repo, 'pool') and self.doc_repo.pool:
            # PostgreSQL implementation
            async with self.doc_repo.pool.acquire() as conn:
                for chunk_id, embedding in zip(chunk_ids, embeddings):
                    embedding_bytes = embedding.astype(np.float32).tobytes()
                    await conn.execute(
                        """INSERT INTO embeddings (chunk_id, embedding_data, dimensions, model_name)
                           VALUES ($1, $2, $3, $4)""",
                        chunk_id, embedding_bytes, dimensions, 'all-MiniLM-L6-v2'
                    )
```

## Data Flow

### Document Upload Flow
```
1. Frontend Upload Request
   ├── File validation (size, type, security)
   ├── CSRF token verification
   └── Multipart form parsing

2. Document Service Processing
   ├── Security validation
   ├── Hash generation for deduplication
   ├── Database record creation
   ├── File storage (tenant-specific)
   └── Async processing trigger

3. Background Processing
   ├── Text extraction (PDF/DOC/TXT)
   ├── Text chunking (overlap handling)
   ├── Chunk storage in database
   ├── Embedding generation (sentence-transformers)
   └── Vector storage for retrieval

4. Status Updates
   ├── uploaded → processing → completed
   └── Error handling: failed status
```

### Query Processing Flow
```
1. Query Input
   ├── Text query from user
   ├── Tenant context extraction
   └── Authentication verification

2. Query Processing
   ├── Query embedding generation
   ├── Vector similarity search (FAISS)
   ├── Chunk retrieval and ranking
   └── Context preparation

3. LLM Integration
   ├── Ollama API call
   ├── Context + query formatting
   ├── Response generation
   └── Confidence calculation

4. Response Assembly
   ├── Answer formatting
   ├── Source citation
   ├── Confidence scoring
   └── JSON response
```

This architecture provides a solid foundation for the Swiss RAG system with proper separation of concerns, testability, and maintainability.