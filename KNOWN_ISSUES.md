# Known Issues & Solutions - ProjektSusui RAG System

## 🔴 Critical Issues (Fix Immediately)

### 1. Hardcoded Secret Keys
**File**: `config/config.py:29`
**Issue**: Default SECRET_KEY value
**Impact**: Complete security breach if deployed unchanged
**Solution**:
```python
# Replace line 29 in config/config.py
SECRET_KEY: str = Field(
    default=...,  # No default value
    description="Secret key for JWT encoding - MUST be set in production"
)
```
**Workaround**: Set environment variable
```bash
export SECRET_KEY=$(openssl rand -hex 32)
```

### 2. JWT Token Generation Vulnerability  
**File**: `core/services/auth_service.py:70`
**Issue**: Auto-generates JWT secret if missing
**Impact**: Unpredictable token validation
**Solution**:
```python
# Replace the initialization
if not jwt_secret_key:
    raise ValueError("JWT_SECRET_KEY must be provided")
self.jwt_secret_key = jwt_secret_key
```

### 3. Fixed Database Encryption Salt
**File**: `core/utils/encryption.py:172`
**Issue**: Uses static salt `b"database_salt_v1"`
**Impact**: Weakens encryption, enables rainbow tables
**Solution**:
```python
# Generate unique salt per field
import secrets
salt = secrets.token_bytes(16)
```

## 🟡 High Priority Issues

### 4. Memory Leak - Token Revocation
**File**: `core/services/auth_service.py:77`
**Issue**: `self.revoked_tokens` grows indefinitely
**Impact**: Memory exhaustion in production
**Solution**:
```python
# Implement TTL-based cleanup
from datetime import datetime, timedelta
import threading

def cleanup_revoked_tokens(self):
    while True:
        current_time = datetime.utcnow()
        expired = [
            token for token, revoked_at in self.revoked_tokens.items()
            if current_time - revoked_at > timedelta(days=1)
        ]
        for token in expired:
            del self.revoked_tokens[token]
        time.sleep(3600)  # Run hourly

# Start cleanup thread
threading.Thread(target=cleanup_revoked_tokens, daemon=True).start()
```

### 5. SQL Injection Risk (Mitigated)
**File**: `core/repositories/sqlite_repository.py:342`
**Issue**: Dynamic SQL construction
**Current Mitigation**: Uses parameterized queries
**Additional Protection**:
```python
# Validate column names against whitelist
ALLOWED_COLUMNS = {'filename', 'content_type', 'updated_at'}
for column in update_data.keys():
    if column not in ALLOWED_COLUMNS:
        raise ValueError(f"Invalid column: {column}")
```

### 6. Information Disclosure in Errors
**Multiple Files**
**Issue**: Exception details exposed to users
**Impact**: Internal system information leakage
**Solution**:
```python
# Generic error handling pattern
try:
    # risky operation
except Exception as e:
    logger.error(f"Detailed error: {e}", exc_info=True)
    return {"error": "Operation failed. Please try again."}
```

## 🟠 Medium Priority Issues

### 7. Missing Rate Limiting
**All API endpoints**
**Issue**: No request throttling
**Impact**: API abuse, DoS vulnerability
**Solution**: Add middleware
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

### 8. Thread Safety in SQLite
**File**: `core/repositories/sqlite_repository.py:35`
**Issue**: Thread-local connections without proper locking
**Impact**: Race conditions under load
**Solution**:
```python
import threading
from contextlib import contextmanager

class ThreadSafeRepository:
    def __init__(self):
        self._lock = threading.RLock()
        self._connections = {}
    
    @contextmanager
    def get_connection(self):
        with self._lock:
            thread_id = threading.get_ident()
            if thread_id not in self._connections:
                self._connections[thread_id] = create_connection()
            yield self._connections[thread_id]
```

### 9. File Upload Path Traversal
**File**: `core/services/document_service.py`
**Issue**: Limited filename sanitization
**Impact**: Directory traversal attacks
**Solution**:
```python
import os
from pathlib import Path

def sanitize_filename(filename: str) -> str:
    # Remove path components
    filename = os.path.basename(filename)
    # Remove special characters
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    # Ensure not empty
    if not filename:
        filename = "unnamed"
    return filename
```

## 🟢 Low Priority Issues

### 10. Predictable ID Generation
**File**: `core/utils/security.py:108`
**Issue**: Timestamp-based IDs
**Impact**: ID enumeration
**Solution**:
```python
import secrets
def generate_secure_id():
    return secrets.token_urlsafe(16)
```

### 11. Missing CORS Preflight Cache
**File**: `core/main.py`
**Issue**: CORS headers not cached
**Impact**: Extra preflight requests
**Solution**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    max_age=3600,  # Cache preflight for 1 hour
)
```

## 🐛 Functional Bugs

### 12. German Umlaut Handling
**File**: `core/repositories/vector_repository.py:319`
**Issue**: Umlaut replacement too aggressive
**Impact**: Poor German text search
**Solution**:
```python
# Only replace for search, not storage
def normalize_for_search(text: str) -> str:
    # Keep original text, create search variants
    variants = [text]
    if 'ä' in text:
        variants.append(text.replace('ä', 'ae'))
    return variants
```

### 13. Vector Dimension Mismatch
**Issue**: Switching models causes dimension errors
**Impact**: Search failures after model change
**Solution**:
```python
# Check and rebuild index on dimension change
if new_dimension != self.dimension:
    logger.warning(f"Dimension change: {self.dimension} -> {new_dimension}")
    self.rebuild_index()
```

### 14. Cache Invalidation Missing
**File**: `core/services/response_cache.py`
**Issue**: Cache not cleared on document updates
**Impact**: Stale responses
**Solution**:
```python
# Clear cache on document operations
async def on_document_change(self, document_id: int):
    keys_to_clear = [
        key for key in self.cache.keys()
        if f"doc_{document_id}" in key
    ]
    for key in keys_to_clear:
        del self.cache[key]
```

## 🎭 UI/UX Issues

### 15. No Loading States
**File**: `static/index.html`
**Issue**: No feedback during operations
**Solution**: Add loading indicators
```javascript
function showLoading() {
    document.getElementById('spinner').style.display = 'block';
}
```

### 16. Error Messages Not Localized
**Issue**: English-only error messages
**Impact**: Poor German user experience
**Solution**: Implement i18n
```python
MESSAGES = {
    'en': {'error': 'An error occurred'},
    'de': {'error': 'Ein Fehler ist aufgetreten'}
}
```

## 🔧 Performance Issues

### 17. No Connection Pooling
**File**: Database connections
**Issue**: New connection per request
**Impact**: Poor scalability
**Solution**:
```python
from sqlalchemy.pool import QueuePool
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40
)
```

### 18. Synchronous File I/O
**Issue**: Blocking file operations
**Impact**: Thread starvation
**Solution**: Use aiofiles
```python
import aiofiles
async def read_file_async(path):
    async with aiofiles.open(path, 'rb') as f:
        return await f.read()
```

### 19. No Query Result Pagination
**Issue**: Returns all results at once
**Impact**: Memory/network overhead
**Solution**:
```python
class PaginatedQuery:
    def __init__(self, page: int = 1, per_page: int = 20):
        self.offset = (page - 1) * per_page
        self.limit = per_page
```

## 🔍 Monitoring Gaps

### 20. Missing Distributed Tracing
**Issue**: No request tracing across services
**Solution**: Implement OpenTelemetry
```python
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("operation"):
    # traced operation
```

### 21. No Dead Letter Queue
**Issue**: Failed async tasks lost
**Solution**: Implement DLQ
```python
async def process_with_dlq(task):
    try:
        await process_task(task)
    except Exception as e:
        await dead_letter_queue.put(task)
```

## 📝 Documentation Issues

### 22. Missing API Versioning
**Issue**: No version in URLs
**Impact**: Breaking changes affect all clients
**Solution**: Add version prefix
```python
app.include_router(router, prefix="/api/v1")
```

### 23. No Migration Guide
**Issue**: Database schema changes undocumented
**Solution**: Use Alembic
```bash
alembic init migrations
alembic revision --autogenerate -m "Initial"
alembic upgrade head
```

## 🚀 Quick Fixes Script

```bash
#!/bin/bash
# quick_fixes.sh - Apply immediate security fixes

echo "Applying critical security fixes..."

# 1. Generate secure keys
echo "Generating secure keys..."
cat >> .env <<EOF
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 64)
DATABASE_ENCRYPTION_KEY=$(openssl rand -hex 32)
EOF

# 2. Fix file permissions
echo "Securing file permissions..."
chmod 600 .env
chmod 750 data/
chmod 640 data/*.db

# 3. Update dependencies
echo "Updating dependencies..."
pip install --upgrade -r requirements.txt
safety check

# 4. Clear sensitive data
echo "Clearing sensitive data..."
find . -name "*.pyc" -delete
find . -name "__pycache__" -delete
find . -name "*.log" -exec truncate -s 0 {} \;

echo "Quick fixes applied. Review SECURITY_AUDIT.md for full list."
```

## 🔄 Update Schedule

| Issue | Severity | Fix By | Status |
|-------|----------|--------|--------|
| Hardcoded secrets | Critical | Immediately | 🔴 Pending |
| JWT vulnerability | Critical | Immediately | 🔴 Pending |
| Password salt bug | Critical | Immediately | ✅ Fixed |
| Memory leaks | High | Week 1 | 🔴 Pending |
| Rate limiting | High | Week 1 | 🔴 Pending |
| Error disclosure | High | Week 2 | 🔴 Pending |
| Thread safety | Medium | Month 1 | 🔴 Pending |
| File traversal | Medium | Month 1 | 🔴 Pending |

## 📞 Report New Issues

Found a new issue? Report it:
1. Create GitHub issue with `[BUG]` prefix
2. Include reproduction steps
3. Tag with severity label
4. Assign to security team if critical

---
*Last Updated: 2024-12-30*
*Version: 1.0.0*