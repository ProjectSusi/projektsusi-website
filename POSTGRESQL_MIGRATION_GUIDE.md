# PostgreSQL Migration Guide
## Complete Migration from SQLite to PostgreSQL

### Table of Contents
1. [Migration Overview](#migration-overview)
2. [Prerequisites](#prerequisites)
3. [Configuration Changes](#configuration-changes)
4. [Database Schema](#database-schema)
5. [Code Changes](#code-changes)
6. [Migration Steps](#migration-steps)
7. [Verification](#verification)
8. [Rollback Plan](#rollback-plan)
9. [Performance Tuning](#performance-tuning)
10. [Troubleshooting](#troubleshooting)

## Migration Overview

The ProjectSusi system has been successfully migrated from SQLite to PostgreSQL to support:
- **Production scalability**: Better concurrent access and performance
- **Data integrity**: ACID compliance and foreign key constraints  
- **Advanced features**: JSON support, full-text search, and complex queries
- **Monitoring**: Better integration with monitoring tools
- **Backup/Recovery**: Enterprise-grade backup solutions

### Migration Status
✅ **Repository pattern implemented** - Database abstraction layer complete
✅ **PostgreSQL repository created** - Full CRUD operations implemented
✅ **Factory pattern added** - Environment-based database selection
✅ **Schema auto-creation** - Tables, indexes, and constraints
✅ **Data migration** - Document, chunk, and embedding data
✅ **Integration testing** - Full RAG pipeline verified
✅ **Production deployment** - Docker Compose configuration ready

## Prerequisites

### System Requirements
- Docker and Docker Compose
- PostgreSQL 15+ (via Docker)
- Python 3.9+ with asyncpg
- Available ports: 5432 (PostgreSQL), 8000 (API)

### Dependencies
```bash
# Python packages (already in requirements.txt)
asyncpg>=0.28.0
psycopg2-binary>=2.9.0
sqlalchemy[asyncio]>=2.0.0
```

### Environment Setup
```bash
# Database configuration
USE_POSTGRESQL=true
DATABASE_URL=postgresql://raguser:NIOGSV46lDlvrAySq5wY@postgres:5432/ragdb_dev

# Connection pool settings
DATABASE_POOL_MIN_SIZE=10
DATABASE_POOL_MAX_SIZE=50
DATABASE_POOL_TIMEOUT=30
```

## Configuration Changes

### Docker Compose Configuration (`docker-compose.yml`)

**PostgreSQL Service Addition**:
```yaml
services:
  postgres:
    image: postgres:15
    container_name: rag-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-ragdb_dev}
      POSTGRES_USER: ${POSTGRES_USER:-raguser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-NIOGSV46lDlvrAySq5wY}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    networks:
      - rag-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-raguser} -d ${POSTGRES_DB:-ragdb_dev}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  rag-app:
    build: .
    container_name: rag-app
    environment:
      - USE_POSTGRESQL=true
      - DATABASE_URL=postgresql://${POSTGRES_USER:-raguser}:${POSTGRES_PASSWORD:-NIOGSV46lDlvrAySq5wY}@postgres:5432/${POSTGRES_DB:-ragdb_dev}
      - DATABASE_POOL_MIN_SIZE=10
      - DATABASE_POOL_MAX_SIZE=50
      - OLLAMA_HOST=http://ollama:11434
    volumes:
      - ./config_new:/app/config:ro
      - ./data/storage:/app/data/storage
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      ollama:
        condition: service_started
    networks:
      - rag-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  ollama_data:
    driver: local

networks:
  rag-network:
    driver: bridge
```

### Environment Variables (`.env`)

**Production Configuration**:
```bash
# Database Selection
USE_POSTGRESQL=true

# PostgreSQL Configuration
DATABASE_URL=postgresql://raguser:NIOGSV46lDlvrAySq5wY@postgres:5432/ragdb_dev
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ragdb_dev
POSTGRES_USER=raguser
POSTGRES_PASSWORD=NIOGSV46lDlvrAySq5wY

# Connection Pool Settings
DATABASE_POOL_MIN_SIZE=10
DATABASE_POOL_MAX_SIZE=50
DATABASE_POOL_TIMEOUT=30

# Application Settings
OLLAMA_HOST=http://ollama:11434
DEFAULT_MODEL=qwen2:1.5b
STORAGE_PATH=/app/data/storage

# Security
SECRET_KEY=your-production-secret-key
CSRF_SECRET=your-csrf-secret-key
```

## Database Schema

### Core Tables

**Documents Table**:
```sql
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    file_hash VARCHAR(64) UNIQUE,
    content_type VARCHAR(100),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'uploaded',
    tenant_id VARCHAR(100) NOT NULL,
    uploader VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(file_hash);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documents_filename_fts ON documents 
USING gin(to_tsvector('english', filename));
```

**Chunks Table**:
```sql
CREATE TABLE IF NOT EXISTS chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    chunk_hash VARCHAR(64),
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_hash ON chunks(chunk_hash);
CREATE INDEX IF NOT EXISTS idx_chunks_index ON chunks(document_id, chunk_index);

-- Full-text search on chunk content
CREATE INDEX IF NOT EXISTS idx_chunks_content_fts ON chunks 
USING gin(to_tsvector('english', chunk_text));
```

**Embeddings Table**:
```sql
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER NOT NULL,
    embedding_data BYTEA NOT NULL,
    dimensions INTEGER NOT NULL DEFAULT 384,
    model_name VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_model ON embeddings(model_name);
```

**Audit Log Table**:
```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    tenant_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
```

### Database Initialization Script (`scripts/init.sql`)

```sql
-- ProjectSusi PostgreSQL Initialization Script
-- This script runs automatically when PostgreSQL container starts

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'raguser') THEN
        CREATE USER raguser WITH PASSWORD 'NIOGSV46lDlvrAySq5wY';
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ragdb_dev TO raguser;
GRANT ALL ON SCHEMA public TO raguser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO raguser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO raguser;

-- Create tables (tables created by application code)
-- This script ensures proper permissions are set
```

## Code Changes

### Repository Factory Implementation

**Database Factory** (`core/repositories/database_factory.py`):
```python
import os
import asyncio
from typing import Optional
from .interfaces import IDocumentRepository
from .postgresql_repository import PostgreSQLDocumentRepository
from .sqlite_repository import SQLiteDocumentRepository

class DatabaseFactory:
    """Factory for database repository creation"""
    
    @staticmethod
    def from_environment() -> IDocumentRepository:
        """Create repository based on USE_POSTGRESQL environment variable"""
        use_postgresql = os.getenv("USE_POSTGRESQL", "false").lower() == "true"
        
        if use_postgresql:
            return PostgreSQLDocumentRepository()
        else:
            db_path = os.getenv("SQLITE_PATH", "data/rag_database.db")
            return SQLiteDocumentRepository(db_path)
    
    @staticmethod
    async def initialize_database():
        """Initialize database connection and schema"""
        repo = DatabaseFactory.from_environment()
        if hasattr(repo, 'initialize'):
            await repo.initialize()
        return repo
```

**Updated Repository Factory** (`core/repositories/factory.py`):
```python
from .database_factory import DatabaseFactory
from .interfaces import IDocumentRepository

class RepositoryFactory:
    """Main repository factory using database factory"""
    
    def __init__(self):
        # Use DatabaseFactory instead of hardcoded SQLite
        self._documents = DatabaseFactory.from_environment()
    
    def get_document_repository(self) -> IDocumentRepository:
        return self._documents
```

### PostgreSQL Repository Implementation

**Key Methods** (`core/repositories/postgresql_repository.py`):

```python
import os
import asyncpg
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from .interfaces import IDocumentRepository
from .models import Document
from .base import QueryResult

logger = logging.getLogger(__name__)

class PostgreSQLDocumentRepository(IDocumentRepository):
    """PostgreSQL implementation with connection pooling"""
    
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable required")
        
        self.pool: Optional[asyncpg.Pool] = None
        self.min_size = int(os.getenv("DATABASE_POOL_MIN_SIZE", "10"))
        self.max_size = int(os.getenv("DATABASE_POOL_MAX_SIZE", "50"))
        self.timeout = int(os.getenv("DATABASE_POOL_TIMEOUT", "30"))
    
    async def initialize(self):
        """Initialize connection pool and create schema"""
        try:
            self.pool = await asyncpg.create_pool(
                self.db_url,
                min_size=self.min_size,
                max_size=self.max_size,
                command_timeout=self.timeout
            )
            await self._create_schema()
            logger.info("PostgreSQL repository initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL repository: {e}")
            raise
    
    async def _create_schema(self):
        """Create database schema if not exists"""
        async with self.pool.acquire() as conn:
            # Documents table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    file_size BIGINT NOT NULL DEFAULT 0,
                    file_hash VARCHAR(64) UNIQUE,
                    content_type VARCHAR(100),
                    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'uploaded',
                    tenant_id VARCHAR(100) NOT NULL,
                    uploader VARCHAR(100),
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            
            # Create indexes
            await conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
                CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
                CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(file_hash);
            ''')
            
            # Chunks table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER NOT NULL,
                    chunk_text TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);
            ''')
            
            # Embeddings table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS embeddings (
                    id SERIAL PRIMARY KEY,
                    chunk_id INTEGER NOT NULL,
                    embedding_data BYTEA NOT NULL,
                    dimensions INTEGER NOT NULL DEFAULT 384,
                    model_name VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_embeddings_chunk ON embeddings(chunk_id);
            ''')
    
    async def create(self, document: Document) -> Document:
        """Create new document with transaction"""
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                doc_id = await conn.fetchval(
                    '''INSERT INTO documents 
                       (filename, file_size, file_hash, content_type, tenant_id, uploader, status)
                       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id''',
                    document.filename, document.file_size, document.file_hash,
                    document.content_type, document.tenant_id, document.uploader,
                    document.status or 'uploaded'
                )
                return await self.get_by_id(doc_id)
    
    async def update(self, doc_id: int, updates: Dict[str, Any]) -> Optional[Document]:
        """Update document with type casting for PostgreSQL"""
        if not updates:
            return await self.get_by_id(doc_id)
        
        set_clauses = []
        values = []
        param_idx = 1
        
        for field, value in updates.items():
            if field == 'status':
                # Explicit type casting for PostgreSQL
                set_clauses.append(f"status = ${param_idx}::varchar")
            else:
                set_clauses.append(f"{field} = ${param_idx}")
            
            values.append(value)
            param_idx += 1
        
        set_clauses.append(f"updated_at = ${param_idx}")
        values.append(datetime.utcnow())
        values.append(doc_id)  # WHERE clause parameter
        
        query = f'''UPDATE documents 
                   SET {', '.join(set_clauses)}
                   WHERE id = ${param_idx + 1}'''
        
        async with self.pool.acquire() as conn:
            await conn.execute(query, *values)
            return await self.get_by_id(doc_id)
    
    async def list_by_tenant(self, tenant_id: str, offset: int = 0, limit: int = 50) -> List[Document]:
        """List documents with pagination"""
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                '''SELECT * FROM documents 
                   WHERE tenant_id = $1 
                   ORDER BY upload_date DESC 
                   LIMIT $2 OFFSET $3''',
                tenant_id, limit, offset
            )
            return [Document.from_row(row) for row in rows]
```

### Service Layer Updates

**Document Service** (`core/services/document_service.py`):
```python
async def _store_chunks(self, document_id: int, chunks: List[str]) -> List[int]:
    """Store chunks with database-specific implementation"""
    chunk_ids = []
    
    if hasattr(self.doc_repo, 'pool') and self.doc_repo.pool:
        # PostgreSQL implementation
        async with self.doc_repo.pool.acquire() as conn:
            async with conn.transaction():
                for idx, chunk_text in enumerate(chunks):
                    chunk_id = await conn.fetchval(
                        """INSERT INTO chunks (document_id, chunk_text, chunk_index)
                           VALUES ($1, $2, $3) RETURNING id""",
                        document_id, chunk_text, idx
                    )
                    chunk_ids.append(chunk_id)
    else:
        # SQLite fallback
        for idx, chunk_text in enumerate(chunks):
            chunk_id = await self.doc_repo.create_chunk(document_id, chunk_text, idx)
            chunk_ids.append(chunk_id)
    
    return chunk_ids

async def _store_embeddings(self, chunk_ids: List[int], embeddings, dimensions: int):
    """Store embeddings with proper binary handling"""
    import numpy as np
    
    if hasattr(self.doc_repo, 'pool') and self.doc_repo.pool:
        # PostgreSQL implementation
        async with self.doc_repo.pool.acquire() as conn:
            async with conn.transaction():
                for chunk_id, embedding in zip(chunk_ids, embeddings):
                    # Convert to bytes for PostgreSQL BYTEA
                    embedding_bytes = embedding.astype(np.float32).tobytes()
                    
                    await conn.execute(
                        """INSERT INTO embeddings (chunk_id, embedding_data, dimensions, model_name)
                           VALUES ($1, $2, $3, $4)""",
                        chunk_id, embedding_bytes, dimensions, 'all-MiniLM-L6-v2'
                    )
```

## Migration Steps

### Step 1: Backup Existing Data
```bash
# Backup SQLite database
cp data/rag_database.db data/rag_database_backup.db

# Backup uploaded files
tar -czf data_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/storage/
```

### Step 2: Update Configuration
```bash
# Update environment variables
echo "USE_POSTGRESQL=true" >> .env
echo "DATABASE_URL=postgresql://raguser:NIOGSV46lDlvrAySq5wY@postgres:5432/ragdb_dev" >> .env
```

### Step 3: Start PostgreSQL
```bash
# Start PostgreSQL service
docker-compose up -d postgres

# Verify PostgreSQL is running
docker-compose exec postgres psql -U raguser -d ragdb_dev -c "SELECT version();"
```

### Step 4: Initialize Schema
```bash
# Start application (will auto-create schema)
docker-compose up -d rag-app

# Check logs for successful initialization
docker-compose logs rag-app | grep -i "postgresql repository initialized"
```

### Step 5: Migrate Data (if needed)
```python
# Migration script (run once)
python scripts/migrate_sqlite_to_postgresql.py
```

### Step 6: Verify Migration
```bash
# Check document count
docker-compose exec postgres psql -U raguser -d ragdb_dev -c "SELECT COUNT(*) FROM documents;"

# Check chunks
docker-compose exec postgres psql -U raguser -d ragdb_dev -c "SELECT COUNT(*) FROM chunks;"

# Check embeddings  
docker-compose exec postgres psql -U raguser -d ragdb_dev -c "SELECT COUNT(*) FROM embeddings;"
```

## Verification

### Database Connection Test
```bash
# Test PostgreSQL connection
docker-compose exec rag-app python -c "
import asyncio
from core.repositories.factory import RepositoryFactory

async def test():
    repo = RepositoryFactory().get_document_repository()
    await repo.initialize()
    docs = await repo.list_by_tenant('tenant_1', limit=5)
    print(f'Found {len(docs)} documents')

asyncio.run(test())
"
```

### RAG Pipeline Test
```bash
# Upload test document
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -F "file=@test_document.pdf" \
  -F "tenant_id=tenant_1"

# Query system
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "tenant_id": "tenant_1"}'
```

### Performance Test
```python
# Performance comparison script
import time
import asyncio
from core.repositories.factory import RepositoryFactory

async def benchmark_queries():
    repo = RepositoryFactory().get_document_repository()
    
    start_time = time.time()
    docs = await repo.list_by_tenant("tenant_1", limit=100)
    end_time = time.time()
    
    print(f"Retrieved {len(docs)} documents in {end_time - start_time:.3f}s")

asyncio.run(benchmark_queries())
```

## Rollback Plan

### Emergency Rollback to SQLite
```bash
# Stop services
docker-compose down

# Update environment
sed -i 's/USE_POSTGRESQL=true/USE_POSTGRESQL=false/' .env

# Restore SQLite database
cp data/rag_database_backup.db data/rag_database.db

# Start with SQLite
docker-compose up -d rag-app
```

### Gradual Migration Rollback
```python
# Data export from PostgreSQL
python scripts/export_postgresql_to_sqlite.py

# Verify data integrity
python scripts/verify_migration_rollback.py
```

## Performance Tuning

### PostgreSQL Configuration

**postgresql.conf optimizations**:
```bash
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB

# Connection settings  
max_connections = 100
max_prepared_transactions = 100

# Write-ahead logging
wal_buffers = 16MB
checkpoint_segments = 32

# Query planner
random_page_cost = 1.1
effective_io_concurrency = 200
```

### Connection Pool Tuning
```bash
# Environment variables
DATABASE_POOL_MIN_SIZE=10
DATABASE_POOL_MAX_SIZE=50
DATABASE_POOL_TIMEOUT=30
DATABASE_POOL_RECYCLE=3600
```

### Index Optimization
```sql
-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_documents_composite 
ON documents(tenant_id, status, upload_date DESC);

CREATE INDEX CONCURRENTLY idx_chunks_text_search 
ON chunks USING gin(to_tsvector('english', chunk_text));

-- Analyze tables for optimal query plans
ANALYZE documents;
ANALYZE chunks;  
ANALYZE embeddings;
```

## Troubleshooting

### Common Issues

**1. Connection Pool Exhaustion**
```python
# Monitor pool status
async def check_pool_status():
    repo = RepositoryFactory().get_document_repository()
    if hasattr(repo, 'pool'):
        print(f"Pool size: {repo.pool.get_size()}")
        print(f"Available: {repo.pool.get_idle_size()}")
```

**2. Type Casting Errors**
```sql
-- Explicit type casting in PostgreSQL
UPDATE documents SET status = $1::varchar WHERE id = $2;
```

**3. Foreign Key Constraint Errors**
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM chunks c 
LEFT JOIN documents d ON c.document_id = d.id 
WHERE d.id IS NULL;
```

**4. Encoding Issues**
```python
# Ensure UTF-8 encoding
import locale
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
```

### Monitoring Queries

**Database Performance**:
```sql
-- Active connections
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';

-- Slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Connection Pool Monitoring**:
```python
# Add to metrics endpoint
async def get_db_metrics():
    repo = RepositoryFactory().get_document_repository()
    if hasattr(repo, 'pool') and repo.pool:
        return {
            "total_connections": repo.pool.get_size(),
            "idle_connections": repo.pool.get_idle_size(),
            "max_size": repo.max_size,
            "min_size": repo.min_size
        }
```

---

## Migration Success Summary

✅ **Repository Pattern**: Clean abstraction layer implemented
✅ **Factory Pattern**: Environment-based database selection  
✅ **PostgreSQL Integration**: Full CRUD operations with connection pooling
✅ **Schema Management**: Auto-creation with proper indexes
✅ **Data Migration**: Seamless transition from SQLite
✅ **Performance Optimization**: Connection pooling and query optimization
✅ **Error Handling**: Comprehensive exception handling and logging
✅ **Testing**: Integration tests verify functionality
✅ **Documentation**: Complete migration guide and troubleshooting

The system is now running on PostgreSQL with improved scalability, performance, and enterprise features ready for production deployment.