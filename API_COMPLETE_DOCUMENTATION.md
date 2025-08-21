# ProjectSusi API Complete Documentation
## Comprehensive API Reference and Usage Guide

### Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Document Management](#document-management)
4. [Query Processing](#query-processing)
5. [Admin Interface](#admin-interface)
6. [System Management](#system-management)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Client Examples](#client-examples)

## API Overview

The ProjectSusi RAG system provides a comprehensive REST API built with FastAPI. All endpoints support JSON responses and follow RESTful conventions.

### Base Configuration
- **Base URL**: `http://localhost:8000` (development) / `https://your-domain.com` (production)
- **API Version**: `v1`
- **Content Type**: `application/json` (except file uploads)
- **Authentication**: CSRF token required for state-changing operations

### API Structure
```
/api/v1/
├── auth/          # Authentication endpoints
├── documents/     # Document management
├── query/         # RAG query processing
├── admin/         # Administrative functions
├── metrics/       # System metrics
├── tenants/       # Multi-tenant management
├── compliance/    # Compliance and audit
└── system/        # System information
```

## Authentication

### CSRF Token Management

**Get CSRF Token**
```http
GET /api/v1/csrf-token
```

**Response:**
```json
{
  "csrf_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600
}
```

**Usage in Requests:**
```javascript
// Get CSRF token
const response = await fetch('/api/v1/csrf-token');
const { csrf_token } = await response.json();

// Use in subsequent requests
await fetch('/api/v1/documents/upload', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrf_token
  },
  body: formData
});
```

### Authentication Endpoints

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password",
  "tenant_id": "tenant_1"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "username": "admin",
    "tenant_id": "tenant_1",
    "permissions": ["read", "write", "admin"]
  }
}
```

**Logout**
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

## Document Management

### Upload Document

**Endpoint**: `POST /api/v1/documents/upload`

**Request:**
```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data
X-CSRF-Token: <csrf_token>

file: <binary_file_data>
tenant_id: tenant_1
uploader: admin_user
metadata: {"category": "policy", "department": "hr"}
```

**Response:**
```json
{
  "id": 123,
  "filename": "company_policy.pdf",
  "file_size": 2048576,
  "file_hash": "a1b2c3d4e5f6...",
  "content_type": "application/pdf",
  "upload_date": "2025-01-15T10:30:00Z",
  "status": "uploaded",
  "tenant_id": "tenant_1",
  "uploader": "admin_user",
  "metadata": {
    "category": "policy",
    "department": "hr"
  }
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "X-CSRF-Token: <csrf_token>" \
  -F "file=@document.pdf" \
  -F "tenant_id=tenant_1" \
  -F "uploader=admin_user" \
  -F "metadata={\"category\":\"policy\"}"
```

### List Documents

**Endpoint**: `GET /api/v1/documents/`

**Parameters:**
- `tenant_id` (required): Tenant identifier
- `offset` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 50, max: 100)
- `status` (optional): Filter by status (uploaded, processing, completed, failed)
- `search` (optional): Search in filenames

**Request:**
```http
GET /api/v1/documents/?tenant_id=tenant_1&limit=20&offset=0&status=completed&search=policy
```

**Response:**
```json
{
  "documents": [
    {
      "id": 123,
      "filename": "company_policy.pdf",
      "file_size": 2048576,
      "file_hash": "a1b2c3d4e5f6...",
      "content_type": "application/pdf",
      "upload_date": "2025-01-15T10:30:00Z",
      "status": "completed",
      "tenant_id": "tenant_1",
      "uploader": "admin_user",
      "processing_stats": {
        "chunks_created": 15,
        "embeddings_generated": 15,
        "processing_time": 23.5
      }
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 45,
    "has_next": true,
    "has_prev": false
  }
}
```

### Get Document Details

**Endpoint**: `GET /api/v1/documents/{document_id}`

**Request:**
```http
GET /api/v1/documents/123?tenant_id=tenant_1
```

**Response:**
```json
{
  "id": 123,
  "filename": "company_policy.pdf",
  "file_size": 2048576,
  "file_hash": "a1b2c3d4e5f6...",
  "content_type": "application/pdf",
  "upload_date": "2025-01-15T10:30:00Z",
  "status": "completed",
  "tenant_id": "tenant_1",
  "uploader": "admin_user",
  "metadata": {
    "category": "policy",
    "department": "hr"
  },
  "processing_info": {
    "chunks_created": 15,
    "embeddings_generated": 15,
    "processing_time": 23.5,
    "model_used": "all-MiniLM-L6-v2"
  },
  "chunks": [
    {
      "id": 1001,
      "chunk_index": 0,
      "word_count": 150,
      "preview": "This company policy document outlines..."
    }
  ]
}
```

### Update Document

**Endpoint**: `PUT /api/v1/documents/{document_id}`

**Request:**
```http
PUT /api/v1/documents/123
Content-Type: application/json
X-CSRF-Token: <csrf_token>

{
  "metadata": {
    "category": "updated_policy",
    "department": "hr",
    "version": "2.0"
  },
  "status": "archived"
}
```

### Delete Document

**Endpoint**: `DELETE /api/v1/documents/{document_id}`

**Request:**
```http
DELETE /api/v1/documents/123?tenant_id=tenant_1
X-CSRF-Token: <csrf_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "deleted_items": {
    "document": 1,
    "chunks": 15,
    "embeddings": 15,
    "files": 1
  }
}
```

### Bulk Operations

**Bulk Delete**
```http
DELETE /api/v1/documents/bulk
Content-Type: application/json
X-CSRF-Token: <csrf_token>

{
  "document_ids": [123, 124, 125],
  "tenant_id": "tenant_1",
  "confirm": true
}
```

**Bulk Status Update**
```http
PUT /api/v1/documents/bulk
Content-Type: application/json
X-CSRF-Token: <csrf_token>

{
  "document_ids": [123, 124, 125],
  "tenant_id": "tenant_1",
  "updates": {
    "status": "archived",
    "metadata": {"archived_date": "2025-01-15T10:30:00Z"}
  }
}
```

## Query Processing

### Submit Query

**Endpoint**: `POST /api/v1/query`

**Request:**
```http
POST /api/v1/query
Content-Type: application/json
X-CSRF-Token: <csrf_token>

{
  "query": "What is the company's remote work policy?",
  "tenant_id": "tenant_1",
  "options": {
    "max_chunks": 5,
    "confidence_threshold": 0.7,
    "include_sources": true,
    "strategy": "enhanced"
  }
}
```

**Response:**
```json
{
  "query_id": "q_1737891234567",
  "query": "What is the company's remote work policy?",
  "answer": "The company's remote work policy allows employees to work remotely up to 3 days per week, with prior approval from their manager. Full remote work is available for specific roles and circumstances...",
  "confidence": 0.873,
  "sources": [
    {
      "document_id": 123,
      "document_name": "company_policy.pdf",
      "chunk_id": 1005,
      "chunk_text": "Remote work policy: Employees may work remotely...",
      "relevance_score": 0.92,
      "page_number": 15
    },
    {
      "document_id": 124,
      "document_name": "hr_handbook.pdf",
      "chunk_id": 2010,
      "chunk_text": "Guidelines for remote work arrangements...",
      "relevance_score": 0.85,
      "page_number": 8
    }
  ],
  "metadata": {
    "processing_time": 1.23,
    "chunks_searched": 1500,
    "strategy_used": "enhanced",
    "model_used": "qwen2:1.5b"
  },
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Get Query Result

**Endpoint**: `GET /api/v1/query/{query_id}`

**Request:**
```http
GET /api/v1/query/q_1737891234567?tenant_id=tenant_1
```

**Response:**
```json
{
  "query_id": "q_1737891234567",
  "status": "completed",
  "result": {
    "query": "What is the company's remote work policy?",
    "answer": "The company's remote work policy allows...",
    "confidence": 0.873,
    "sources": [...],
    "metadata": {...}
  },
  "created_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:30:01Z"
}
```

### Query History

**Endpoint**: `GET /api/v1/query/history`

**Request:**
```http
GET /api/v1/query/history?tenant_id=tenant_1&limit=10&offset=0
```

**Response:**
```json
{
  "queries": [
    {
      "query_id": "q_1737891234567",
      "query": "What is the company's remote work policy?",
      "confidence": 0.873,
      "created_at": "2025-01-15T10:30:00Z",
      "response_time": 1.23
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 156
  }
}
```

### Advanced Query Options

**Query with Filters**
```json
{
  "query": "What are the security requirements?",
  "tenant_id": "tenant_1",
  "filters": {
    "document_ids": [123, 124],
    "categories": ["security", "compliance"],
    "date_range": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2025-01-15T23:59:59Z"
    }
  },
  "options": {
    "max_chunks": 10,
    "confidence_threshold": 0.6,
    "rerank": true,
    "expand_query": true
  }
}
```

## Admin Interface

### Admin Dashboard Data

**Endpoint**: `GET /admin/dashboard/data`

**Response:**
```json
{
  "system_stats": {
    "total_documents": 1250,
    "total_chunks": 18750,
    "total_embeddings": 18750,
    "active_tenants": 25,
    "queries_today": 342,
    "average_confidence": 0.834
  },
  "recent_activity": [
    {
      "type": "document_upload",
      "tenant_id": "tenant_1",
      "filename": "new_policy.pdf",
      "timestamp": "2025-01-15T10:25:00Z"
    }
  ],
  "system_health": {
    "database_status": "healthy",
    "ollama_status": "healthy",
    "queue_length": 5,
    "error_rate": 0.002
  }
}
```

### Configuration Management

**Get Configuration**
```http
GET /admin/config
```

**Update Configuration**
```http
PUT /admin/config
Content-Type: application/json
X-CSRF-Token: <csrf_token>

{
  "llm": {
    "default_model": "qwen2:1.5b",
    "temperature": 0.1,
    "max_tokens": 2048
  },
  "processing": {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "batch_size": 32
  },
  "security": {
    "max_file_size": 52428800,
    "allowed_extensions": [".pdf", ".txt", ".docx"]
  }
}
```

### System Management

**Restart Services**
```http
POST /admin/system/restart
X-CSRF-Token: <csrf_token>

{
  "services": ["ollama", "embeddings"],
  "force": false
}
```

**Clear Cache**
```http
DELETE /admin/system/cache
X-CSRF-Token: <csrf_token>

{
  "cache_types": ["query_cache", "embedding_cache"],
  "tenant_id": "tenant_1"
}
```

## System Management

### Health Check

**Endpoint**: `GET /api/v1/system/health`

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 86400,
  "services": {
    "database": {
      "status": "healthy",
      "response_time": 12,
      "connections": {
        "active": 15,
        "idle": 35,
        "max": 50
      }
    },
    "ollama": {
      "status": "healthy",
      "response_time": 234,
      "models": ["qwen2:1.5b", "llama2:7b"]
    },
    "vector_store": {
      "status": "healthy",
      "indexed_chunks": 18750
    }
  },
  "resources": {
    "cpu_usage": 45.2,
    "memory_usage": 2048,
    "memory_total": 8192,
    "disk_usage": 75.5
  }
}
```

### System Information

**Endpoint**: `GET /api/v1/system/info`

**Response:**
```json
{
  "application": {
    "name": "ProjectSusi RAG System",
    "version": "2.0.0",
    "build_date": "2025-01-15T00:00:00Z",
    "environment": "production"
  },
  "database": {
    "type": "postgresql",
    "version": "15.0",
    "schema_version": "2.0.0"
  },
  "features": {
    "multi_tenant": true,
    "enterprise_auth": true,
    "compliance_logging": true,
    "real_time_processing": true
  }
}
```

## Monitoring & Metrics

### Prometheus Metrics

**Endpoint**: `GET /metrics`

**Response:**
```prometheus
# HELP rag_documents_total Total number of documents
# TYPE rag_documents_total counter
rag_documents_total{tenant_id="tenant_1"} 125

# HELP rag_queries_total Total number of queries processed
# TYPE rag_queries_total counter
rag_queries_total{tenant_id="tenant_1"} 1542

# HELP rag_query_duration_seconds Query processing duration
# TYPE rag_query_duration_seconds histogram
rag_query_duration_seconds_bucket{le="0.5"} 234
rag_query_duration_seconds_bucket{le="1.0"} 567
rag_query_duration_seconds_bucket{le="2.0"} 789

# HELP rag_confidence_score Query confidence scores
# TYPE rag_confidence_score histogram
rag_confidence_score_bucket{le="0.5"} 12
rag_confidence_score_bucket{le="0.7"} 45
rag_confidence_score_bucket{le="0.9"} 234
```

### Custom Metrics

**Endpoint**: `GET /api/v1/metrics/custom`

**Response:**
```json
{
  "performance": {
    "average_query_time": 1.23,
    "average_confidence": 0.834,
    "success_rate": 0.998,
    "cache_hit_rate": 0.67
  },
  "usage": {
    "queries_per_hour": 45,
    "documents_per_day": 12,
    "active_users": 25,
    "storage_used_gb": 15.7
  },
  "quality": {
    "high_confidence_rate": 0.78,
    "zero_result_rate": 0.05,
    "user_satisfaction": 4.2
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document with ID 123 not found",
    "details": {
      "document_id": 123,
      "tenant_id": "tenant_1"
    },
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "req_1737891234567"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Authentication token required |
| `CSRF_TOKEN_INVALID` | 403 | CSRF token missing or invalid |
| `DOCUMENT_NOT_FOUND` | 404 | Document does not exist |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | 415 | File type not supported |
| `PROCESSING_FAILED` | 500 | Document processing error |
| `QUERY_TIMEOUT` | 504 | Query processing timeout |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1737891300
X-RateLimit-Retry-After: 60
```

### Rate Limits by Endpoint

| Endpoint Pattern | Limit | Window |
|-----------------|-------|---------|
| `/api/v1/documents/upload` | 10 requests | 1 minute |
| `/api/v1/query` | 100 requests | 1 minute |
| `/api/v1/documents/` | 1000 requests | 1 hour |
| `/admin/*` | 100 requests | 1 hour |

## Client Examples

### Python Client

```python
import requests
import json
from typing import Optional, Dict, Any

class RAGClient:
    def __init__(self, base_url: str, tenant_id: str):
        self.base_url = base_url
        self.tenant_id = tenant_id
        self.csrf_token = None
        self.session = requests.Session()
    
    def get_csrf_token(self) -> str:
        """Get CSRF token for authenticated requests"""
        response = self.session.get(f"{self.base_url}/api/v1/csrf-token")
        response.raise_for_status()
        self.csrf_token = response.json()["csrf_token"]
        return self.csrf_token
    
    def upload_document(self, file_path: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Upload a document"""
        if not self.csrf_token:
            self.get_csrf_token()
        
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'tenant_id': self.tenant_id,
                'uploader': 'api_client'
            }
            if metadata:
                data['metadata'] = json.dumps(metadata)
            
            headers = {'X-CSRF-Token': self.csrf_token}
            
            response = self.session.post(
                f"{self.base_url}/api/v1/documents/upload",
                files=files,
                data=data,
                headers=headers
            )
            response.raise_for_status()
            return response.json()
    
    def query(self, query_text: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Submit a query"""
        if not self.csrf_token:
            self.get_csrf_token()
        
        payload = {
            'query': query_text,
            'tenant_id': self.tenant_id
        }
        if options:
            payload['options'] = options
        
        headers = {
            'Content-Type': 'application/json',
            'X-CSRF-Token': self.csrf_token
        }
        
        response = self.session.post(
            f"{self.base_url}/api/v1/query",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    
    def list_documents(self, offset: int = 0, limit: int = 50) -> Dict[str, Any]:
        """List documents"""
        params = {
            'tenant_id': self.tenant_id,
            'offset': offset,
            'limit': limit
        }
        
        response = self.session.get(
            f"{self.base_url}/api/v1/documents/",
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage example
client = RAGClient("http://localhost:8000", "tenant_1")

# Upload document
result = client.upload_document("policy.pdf", {"category": "hr"})
print(f"Uploaded document ID: {result['id']}")

# Query system
result = client.query("What is the remote work policy?")
print(f"Answer: {result['answer']}")
print(f"Confidence: {result['confidence']}")
```

### JavaScript Client

```javascript
class RAGClient {
    constructor(baseUrl, tenantId) {
        this.baseUrl = baseUrl;
        this.tenantId = tenantId;
        this.csrfToken = null;
    }
    
    async getCSRFToken() {
        const response = await fetch(`${this.baseUrl}/api/v1/csrf-token`);
        const data = await response.json();
        this.csrfToken = data.csrf_token;
        return this.csrfToken;
    }
    
    async uploadDocument(file, metadata = {}) {
        if (!this.csrfToken) {
            await this.getCSRFToken();
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tenant_id', this.tenantId);
        formData.append('uploader', 'web_client');
        formData.append('metadata', JSON.stringify(metadata));
        
        const response = await fetch(`${this.baseUrl}/api/v1/documents/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-Token': this.csrfToken
            }
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    async query(queryText, options = {}) {
        if (!this.csrfToken) {
            await this.getCSRFToken();
        }
        
        const payload = {
            query: queryText,
            tenant_id: this.tenantId,
            options
        };
        
        const response = await fetch(`${this.baseUrl}/api/v1/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Query failed: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    async listDocuments(offset = 0, limit = 50) {
        const params = new URLSearchParams({
            tenant_id: this.tenantId,
            offset: offset.toString(),
            limit: limit.toString()
        });
        
        const response = await fetch(`${this.baseUrl}/api/v1/documents/?${params}`);
        
        if (!response.ok) {
            throw new Error(`List failed: ${response.statusText}`);
        }
        
        return response.json();
    }
}

// Usage
const client = new RAGClient('http://localhost:8000', 'tenant_1');

// Upload document
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const result = await client.uploadDocument(file, {category: 'policy'});
console.log('Uploaded:', result);

// Query system
const queryResult = await client.query('What is the remote work policy?');
console.log('Answer:', queryResult.answer);
console.log('Confidence:', queryResult.confidence);
```

---

## API Summary

✅ **Complete REST API**: All CRUD operations implemented
✅ **Authentication**: CSRF token and JWT support
✅ **Multi-tenant**: Tenant-isolated data access
✅ **File Upload**: Secure multi-format document upload
✅ **RAG Queries**: Advanced query processing with confidence scoring
✅ **Admin Interface**: Comprehensive system management
✅ **Monitoring**: Prometheus metrics and health checks
✅ **Error Handling**: Standardized error responses
✅ **Rate Limiting**: Protection against abuse
✅ **Client Libraries**: Python and JavaScript examples

The API is production-ready with comprehensive documentation, security features, and monitoring capabilities.