# ProjektSusui - Complete API Endpoints Guide

## 🎯 Overview

ProjektSusui provides a comprehensive REST API with **25+ production-ready endpoints** covering document management, RAG queries, authentication, administration, and Swiss compliance features.

**Base URL**: `http://localhost:8000` (development) | `https://your-domain.com` (production)
**API Version**: `v1`
**Documentation**: Available at `/docs` (Swagger UI) and `/redoc` (ReDoc)

---

## 🔐 Authentication & Security

### Get CSRF Token
**Essential for all state-changing operations**

```http
GET /api/v1/csrf-token
```

**Response:**
```json
{
  "csrf_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 86400
}
```

**Usage in subsequent requests:**
```javascript
const response = await fetch('/api/v1/csrf-token');
const { csrf_token } = await response.json();

// Include in headers for POST/PUT/DELETE requests
const headers = {
  'Content-Type': 'application/json',
  'X-CSRF-Token': csrf_token
};
```

### Authentication Endpoints

#### User Registration
```http
POST /api/v1/auth/register
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "username": "newuser",
  "password": "SecurePass123!",
  "email": "user@company.ch",
  "tenant_id": "company_tenant"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user_id": 123
}
```

#### User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "tenant_id": "default"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "username": "admin",
    "tenant_id": "default",
    "permissions": ["read", "write", "admin"]
  }
}
```

#### User Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

#### Multi-Factor Authentication Setup
```http
POST /api/v1/auth/mfa/setup
Authorization: Bearer {access_token}
X-CSRF-Token: {csrf_token}
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backup_codes": ["12345678", "87654321", "..."]
}
```

---

## 📄 Document Management

### Upload Document
**Primary endpoint for document ingestion**

```http
POST /api/v1/documents/upload
Content-Type: multipart/form-data
X-CSRF-Token: {csrf_token}

# Form data:
file: {binary_file_data}
tenant_id: company_tenant
uploader: username
metadata: {"category": "policy", "department": "hr"}
```

**Response (201 Created):**
```json
{
  "id": 456,
  "filename": "company_policy.pdf",
  "file_size": 2048576,
  "file_hash": "sha256:a1b2c3d4e5f6...",
  "content_type": "application/pdf",
  "upload_date": "2025-01-20T10:30:00Z",
  "status": "uploaded",
  "tenant_id": "company_tenant",
  "uploader": "username",
  "metadata": {
    "category": "policy",
    "department": "hr"
  }
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "X-CSRF-Token: $(curl -s http://localhost:8000/api/v1/csrf-token | jq -r .csrf_token)" \
  -F "file=@policy.pdf" \
  -F "tenant_id=company_tenant" \
  -F "uploader=admin" \
  -F "metadata={\"category\":\"policy\"}"
```

### List Documents
```http
GET /api/v1/documents/?tenant_id=company_tenant&limit=20&offset=0&status=completed
```

**Query Parameters:**
- `tenant_id` (required): Tenant identifier
- `offset` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 50, max: 100)
- `status` (optional): Filter by status (uploaded, processing, completed, failed)
- `search` (optional): Search in filenames

**Response (200 OK):**
```json
{
  "documents": [
    {
      "id": 456,
      "filename": "company_policy.pdf",
      "file_size": 2048576,
      "upload_date": "2025-01-20T10:30:00Z",
      "status": "completed",
      "confidence_score": 0.89,
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
```http
GET /api/v1/documents/456?tenant_id=company_tenant
```

**Response (200 OK):**
```json
{
  "id": 456,
  "filename": "company_policy.pdf",
  "file_size": 2048576,
  "status": "completed",
  "processing_info": {
    "chunks_created": 15,
    "embeddings_generated": 15,
    "processing_time": 23.5,
    "model_used": "all-MiniLM-L6-v2",
    "confidence_score": 0.89
  },
  "chunks": [
    {
      "id": 1001,
      "chunk_index": 0,
      "word_count": 150,
      "preview": "This company policy document outlines our remote work guidelines..."
    }
  ]
}
```

### Update Document
```http
PUT /api/v1/documents/456
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "metadata": {
    "category": "updated_policy",
    "version": "2.0",
    "department": "hr"
  },
  "status": "archived"
}
```

### Delete Document
```http
DELETE /api/v1/documents/456?tenant_id=company_tenant
X-CSRF-Token: {csrf_token}
```

**Response (200 OK):**
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
```http
DELETE /api/v1/documents/bulk
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "document_ids": [456, 457, 458],
  "tenant_id": "company_tenant",
  "confirm": true
}
```

---

## 🤖 RAG Query System

### Submit Query
**Core RAG functionality with high confidence responses**

```http
POST /api/v1/query
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "query": "What is our remote work policy?",
  "tenant_id": "company_tenant",
  "options": {
    "max_chunks": 5,
    "confidence_threshold": 0.7,
    "include_sources": true,
    "strategy": "enhanced"
  }
}
```

**Response (200 OK):**
```json
{
  "query_id": "q_1737891234567",
  "query": "What is our remote work policy?",
  "answer": "According to the company policy document, employees may work remotely up to 3 days per week with prior manager approval. Full remote work is available for specific roles and circumstances as outlined in section 4.2.",
  "confidence": 0.873,
  "sources": [
    {
      "document_id": 456,
      "document_name": "company_policy.pdf",
      "chunk_id": 1005,
      "chunk_text": "Remote work policy: Employees may work remotely up to 3 days per week...",
      "relevance_score": 0.92,
      "page_number": 15
    }
  ],
  "metadata": {
    "processing_time": 1.23,
    "chunks_searched": 1500,
    "strategy_used": "enhanced",
    "model_used": "qwen2:1.5b",
    "language_detected": "en"
  },
  "created_at": "2025-01-20T10:30:00Z"
}
```

### Advanced Query with Filters
```http
POST /api/v1/query
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "query": "What are the security requirements for Swiss banking?",
  "tenant_id": "bank_tenant",
  "filters": {
    "document_ids": [123, 124, 125],
    "categories": ["security", "compliance", "banking"],
    "date_range": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2025-01-20T23:59:59Z"
    }
  },
  "options": {
    "max_chunks": 10,
    "confidence_threshold": 0.8,
    "rerank": true,
    "expand_query": true,
    "language": "de"
  }
}
```

### Query History
```http
GET /api/v1/query/history?tenant_id=company_tenant&limit=10&offset=0
```

**Response:**
```json
{
  "queries": [
    {
      "query_id": "q_1737891234567",
      "query": "What is our remote work policy?",
      "confidence": 0.873,
      "created_at": "2025-01-20T10:30:00Z",
      "response_time": 1.23,
      "language": "en"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 156
  }
}
```

### Get Query Result
```http
GET /api/v1/query/q_1737891234567?tenant_id=company_tenant
```

---

## 👨‍💼 Admin Management

### Admin Dashboard Data
```http
GET /admin/dashboard/data
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "system_stats": {
    "total_documents": 1250,
    "total_chunks": 18750,
    "total_embeddings": 18750,
    "active_tenants": 25,
    "queries_today": 342,
    "average_confidence": 0.834,
    "storage_used_gb": 15.7
  },
  "recent_activity": [
    {
      "type": "document_upload",
      "tenant_id": "company_tenant",
      "filename": "new_policy.pdf",
      "timestamp": "2025-01-20T10:25:00Z",
      "user": "admin"
    }
  ],
  "system_health": {
    "database_status": "healthy",
    "ollama_status": "healthy",
    "redis_status": "healthy",
    "queue_length": 5,
    "error_rate": 0.002,
    "response_time_avg": 0.85
  },
  "performance_metrics": {
    "queries_per_hour": 45,
    "documents_processed_today": 12,
    "cache_hit_rate": 0.67,
    "active_users": 25
  }
}
```

### System Configuration
```http
GET /admin/config
Authorization: Bearer {admin_token}
```

```http
PUT /admin/config
Content-Type: application/json
Authorization: Bearer {admin_token}
X-CSRF-Token: {csrf_token}

{
  "llm": {
    "default_model": "qwen2:1.5b",
    "temperature": 0.1,
    "max_tokens": 2048,
    "timeout_seconds": 30
  },
  "processing": {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "batch_size": 32,
    "max_file_size_mb": 50
  },
  "security": {
    "session_timeout": 3600,
    "max_login_attempts": 5,
    "password_min_length": 8
  },
  "swiss_compliance": {
    "data_residency_region": "CH",
    "audit_logging_enabled": true,
    "data_retention_days": 2555
  }
}
```

### User Management
```http
GET /api/v1/auth/users
Authorization: Bearer {admin_token}
```

```http
POST /api/v1/auth/users/{user_id}/deactivate
Authorization: Bearer {admin_token}
X-CSRF-Token: {csrf_token}

{
  "reason": "User requested account closure",
  "effective_date": "2025-01-20T23:59:59Z"
}
```

---

## 🏢 Multi-Tenant Management

### Create Tenant
```http
POST /api/v1/tenants
Content-Type: application/json
Authorization: Bearer {admin_token}
X-CSRF-Token: {csrf_token}

{
  "name": "Swiss Bank AG",
  "tenant_id": "swiss_bank",
  "settings": {
    "max_documents": 10000,
    "max_storage_gb": 100,
    "compliance_level": "banking",
    "data_residency": "CH"
  },
  "contact": {
    "email": "admin@swissbank.ch",
    "phone": "+41 44 123 4567"
  }
}
```

### List Tenants
```http
GET /api/v1/tenants?active=true&limit=50
Authorization: Bearer {admin_token}
```

### Tenant Statistics
```http
GET /api/v1/tenants/swiss_bank/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "tenant_id": "swiss_bank",
  "documents": {
    "total": 2500,
    "processed": 2450,
    "failed": 50
  },
  "storage": {
    "used_gb": 45.7,
    "limit_gb": 100,
    "utilization": 0.457
  },
  "queries": {
    "total": 15670,
    "today": 234,
    "avg_confidence": 0.891
  },
  "users": {
    "active": 45,
    "inactive": 5,
    "total": 50
  }
}
```

---

## 🔄 Background Jobs & Processing

### Schedule Background Job
```http
POST /api/v1/background-jobs/schedule
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "function_name": "process_document_batch",
  "parameters": {
    "document_ids": [123, 124, 125],
    "tenant_id": "company_tenant",
    "priority": "high"
  },
  "schedule_type": "immediate"
}
```

### Job Status
```http
GET /api/v1/background-jobs/status/{job_id}
```

**Response:**
```json
{
  "job_id": "job_1737891234567",
  "status": "completed",
  "progress": 100,
  "result": {
    "processed_documents": 3,
    "successful": 3,
    "failed": 0,
    "processing_time": 45.2
  },
  "created_at": "2025-01-20T10:30:00Z",
  "completed_at": "2025-01-20T10:30:45Z"
}
```

### Queue Statistics
```http
GET /api/v1/background-jobs/statistics
```

---

## 📊 Monitoring & Metrics

### System Health Check
```http
GET /api/v1/system/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "uptime": 86400,
  "timestamp": "2025-01-20T10:30:00Z",
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
      "models": ["qwen2:1.5b", "llama3.2:1b"],
      "memory_usage": "2.1GB"
    },
    "redis": {
      "status": "healthy",
      "memory_usage": "512MB",
      "connected_clients": 25
    },
    "vector_store": {
      "status": "healthy",
      "indexed_chunks": 18750,
      "index_size": "1.2GB"
    }
  },
  "resources": {
    "cpu_usage": 45.2,
    "memory_usage": 2048,
    "memory_total": 8192,
    "disk_usage": 75.5,
    "disk_available": "25.5GB"
  }
}
```

### Prometheus Metrics
```http
GET /metrics
```

**Response (Prometheus format):**
```prometheus
# HELP rag_documents_total Total number of documents
# TYPE rag_documents_total counter
rag_documents_total{tenant_id="company_tenant"} 125

# HELP rag_queries_total Total number of queries processed  
# TYPE rag_queries_total counter
rag_queries_total{tenant_id="company_tenant",confidence_level="high"} 1542

# HELP rag_query_duration_seconds Query processing duration
# TYPE rag_query_duration_seconds histogram
rag_query_duration_seconds_bucket{le="0.5"} 234
rag_query_duration_seconds_bucket{le="1.0"} 567
rag_query_duration_seconds_bucket{le="2.0"} 789

# HELP rag_confidence_score Query confidence scores
# TYPE rag_confidence_score histogram  
rag_confidence_score_bucket{le="0.7"} 45
rag_confidence_score_bucket{le="0.8"} 234
rag_confidence_score_bucket{le="0.9"} 789
```

### Performance Metrics
```http
GET /api/v1/performance/metrics
```

### Custom Metrics
```http
GET /api/v1/metrics/custom
```

---

## 🔒 Swiss Compliance & Security

### Compliance Status
```http
GET /api/v1/compliance/status?tenant_id=swiss_bank
```

**Response:**
```json
{
  "fadp_compliance": {
    "status": "compliant",
    "data_residency": "CH",
    "data_protection_measures": ["encryption", "access_controls", "audit_logging"],
    "last_audit": "2025-01-15T00:00:00Z"
  },
  "audit_logging": {
    "enabled": true,
    "retention_days": 3650,
    "events_logged": ["data_access", "admin_actions", "user_activities"]
  },
  "data_retention": {
    "policies_active": 3,
    "entities_tracked": 15670,
    "expired_entities": 23,
    "legal_holds": 2
  }
}
```

### Data Retention Policies
```http
GET /api/v1/data-retention/policies
```

```http
POST /api/v1/data-retention/policies
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "category": "user_data",
  "retention_period_days": 2555,
  "description": "Swiss banking user data retention (7 years)",
  "legal_basis": "Swiss Banking Act Article 957",
  "auto_delete": true
}
```

### Audit Log Export
```http
GET /api/v1/compliance/audit-log?tenant_id=swiss_bank&from=2025-01-01&to=2025-01-20
```

### Data Deletion Request (FADP Right to Erasure)
```http
DELETE /api/v1/compliance/user-data/{user_id}
X-CSRF-Token: {csrf_token}

{
  "reason": "User requested data deletion",
  "legal_basis": "FADP Article 32"
}
```

---

## 🚀 Load Balancing & Scaling

### Load Balancer Status
```http
GET /api/v1/load-balancer/status
```

**Response:**
```json
{
  "strategy": "weighted_round_robin",
  "backends": [
    {
      "id": "backend_1",
      "url": "http://api-1:8000",
      "status": "healthy",
      "weight": 100,
      "current_connections": 25
    }
  ],
  "total_requests": 15670,
  "failed_requests": 23,
  "average_response_time": 0.85
}
```

### Scaling Operations
```http
GET /api/v1/scaling/recommendations
```

```http
POST /api/v1/scaling/manual
Content-Type: application/json
X-CSRF-Token: {csrf_token}

{
  "component": "api_workers",
  "target_instances": 5,
  "reason": "High load expected for demo"
}
```

---

## 🎯 Error Handling

### Standard Error Response
All endpoints return errors in this format:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document with ID 456 not found in tenant company_tenant",
    "details": {
      "document_id": 456,
      "tenant_id": "company_tenant",
      "suggestions": ["Check document ID", "Verify tenant access"]
    },
    "timestamp": "2025-01-20T10:30:00Z",
    "request_id": "req_1737891234567"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description | Common Solutions |
|-------------|------------|-------------|------------------|
| 400 | `INVALID_REQUEST` | Malformed request data | Check request format |
| 401 | `AUTHENTICATION_REQUIRED` | Missing/invalid auth token | Login and get valid token |
| 403 | `CSRF_TOKEN_INVALID` | CSRF token missing/invalid | Get fresh CSRF token |
| 403 | `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | Contact admin for access |
| 404 | `DOCUMENT_NOT_FOUND` | Document doesn't exist | Check document ID and tenant |
| 404 | `TENANT_NOT_FOUND` | Tenant doesn't exist | Verify tenant ID |
| 413 | `FILE_TOO_LARGE` | File exceeds size limit | Reduce file size or split |
| 415 | `UNSUPPORTED_FILE_TYPE` | File type not supported | Use PDF, DOCX, or TXT |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retry |
| 500 | `PROCESSING_FAILED` | Document processing error | Check file integrity |
| 503 | `SERVICE_UNAVAILABLE` | System temporarily unavailable | Try again later |
| 504 | `QUERY_TIMEOUT` | Query processing timeout | Simplify query or retry |

---

## 🔧 Rate Limiting

### Rate Limit Headers
All responses include rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999  
X-RateLimit-Reset: 1737891300
X-RateLimit-Retry-After: 60
```

### Rate Limits by Endpoint

| Endpoint Pattern | Limit | Window | Notes |
|------------------|-------|--------|-------|
| `/api/v1/documents/upload` | 10 requests | 1 minute | Per user |
| `/api/v1/query` | 100 requests | 1 minute | Per user |
| `/api/v1/documents/` | 1000 requests | 1 hour | Per user |
| `/admin/*` | 100 requests | 1 hour | Admin only |
| `/api/v1/csrf-token` | 20 requests | 1 minute | Per IP |

---

## 📚 Client Libraries & SDKs

### Python Client Example
```python
import asyncio
import aiohttp
from typing import Dict, Any, Optional

class ProjektSusuiClient:
    def __init__(self, base_url: str, tenant_id: str):
        self.base_url = base_url
        self.tenant_id = tenant_id
        self.session = None
        self.csrf_token = None
        self.access_token = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        await self._get_csrf_token()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _get_csrf_token(self):
        async with self.session.get(f"{self.base_url}/api/v1/csrf-token") as response:
            data = await response.json()
            self.csrf_token = data["csrf_token"]
    
    async def login(self, username: str, password: str) -> Dict[str, Any]:
        data = {
            "username": username,
            "password": password,
            "tenant_id": self.tenant_id
        }
        
        async with self.session.post(
            f"{self.base_url}/api/v1/auth/login",
            json=data
        ) as response:
            result = await response.json()
            if response.status == 200:
                self.access_token = result["access_token"]
            return result
    
    async def upload_document(self, file_path: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        headers = {"X-CSRF-Token": self.csrf_token}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        data = aiohttp.FormData()
        data.add_field('file', open(file_path, 'rb'), filename=file_path.split('/')[-1])
        data.add_field('tenant_id', self.tenant_id)
        if metadata:
            data.add_field('metadata', json.dumps(metadata))
        
        async with self.session.post(
            f"{self.base_url}/api/v1/documents/upload",
            data=data,
            headers=headers
        ) as response:
            return await response.json()
    
    async def query(self, query_text: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "X-CSRF-Token": self.csrf_token
        }
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        payload = {
            "query": query_text,
            "tenant_id": self.tenant_id
        }
        if options:
            payload["options"] = options
        
        async with self.session.post(
            f"{self.base_url}/api/v1/query",
            json=payload,
            headers=headers
        ) as response:
            return await response.json()

# Usage example
async def main():
    async with ProjektSusuiClient("http://localhost:8000", "company_tenant") as client:
        # Login
        await client.login("admin", "admin123")
        
        # Upload document
        result = await client.upload_document("policy.pdf", {"category": "hr"})
        print(f"Document uploaded: {result['id']}")
        
        # Query system
        result = await client.query("What is our remote work policy?")
        print(f"Answer: {result['answer']}")
        print(f"Confidence: {result['confidence']}")

if __name__ == "__main__":
    asyncio.run(main())
```

### JavaScript/TypeScript Client
```typescript
interface QueryOptions {
  maxChunks?: number;
  confidenceThreshold?: number;
  includeSources?: boolean;
  strategy?: 'basic' | 'enhanced';
}

interface QueryResult {
  query_id: string;
  answer: string;
  confidence: number;
  sources: Array<{
    document_id: number;
    document_name: string;
    chunk_text: string;
    relevance_score: number;
  }>;
  metadata: {
    processing_time: number;
    chunks_searched: number;
    model_used: string;
  };
}

class ProjektSusuiClient {
  private baseUrl: string;
  private tenantId: string;
  private csrfToken: string | null = null;
  private accessToken: string | null = null;

  constructor(baseUrl: string, tenantId: string) {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
  }

  private async getCSRFToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    
    const response = await fetch(`${this.baseUrl}/api/v1/csrf-token`);
    const data = await response.json();
    this.csrfToken = data.csrf_token;
    return this.csrfToken;
  }

  async login(username: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        tenant_id: this.tenantId
      })
    });

    const result = await response.json();
    if (response.ok) {
      this.accessToken = result.access_token;
    }
    return result;
  }

  async uploadDocument(file: File, metadata?: Record<string, any>): Promise<any> {
    const csrfToken = await this.getCSRFToken();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', this.tenantId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const headers: Record<string, string> = {
      'X-CSRF-Token': csrfToken
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/documents/upload`, {
      method: 'POST',
      body: formData,
      headers
    });

    return response.json();
  }

  async query(queryText: string, options?: QueryOptions): Promise<QueryResult> {
    const csrfToken = await this.getCSRFToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const payload = {
      query: queryText,
      tenant_id: this.tenantId,
      ...(options && { options })
    };

    const response = await fetch(`${this.baseUrl}/api/v1/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
  }

  async listDocuments(limit: number = 50, offset: number = 0): Promise<any> {
    const params = new URLSearchParams({
      tenant_id: this.tenantId,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await fetch(`${this.baseUrl}/api/v1/documents/?${params}`);
    return response.json();
  }
}

// Usage example
const client = new ProjektSusuiClient('http://localhost:8000', 'company_tenant');

// Login
await client.login('admin', 'admin123');

// Upload document
const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
if (fileInput.files?.[0]) {
  const result = await client.uploadDocument(
    fileInput.files[0], 
    { category: 'policy', department: 'hr' }
  );
  console.log('Document uploaded:', result);
}

// Query system
const queryResult = await client.query('What is our remote work policy?', {
  confidenceThreshold: 0.8,
  includeSources: true,
  strategy: 'enhanced'
});

console.log('Answer:', queryResult.answer);
console.log('Confidence:', queryResult.confidence);
console.log('Sources:', queryResult.sources);
```

---

## 🎯 Best Practices

### Authentication & Security
1. **Always get CSRF token** before state-changing operations
2. **Store access tokens securely** (not in localStorage for sensitive apps)
3. **Implement token refresh** for long-running applications
4. **Validate SSL certificates** in production
5. **Use HTTPS only** for production deployments

### Document Upload
1. **Check file size limits** before upload
2. **Validate file types** on client side
3. **Implement progress tracking** for large files
4. **Handle upload failures** gracefully with retry logic
5. **Provide metadata** for better document organization

### Query Optimization
1. **Use appropriate confidence thresholds** (0.7+ recommended)
2. **Include source attribution** for transparency
3. **Implement caching** for frequently asked questions
4. **Batch related queries** when possible
5. **Monitor query performance** and adjust parameters

### Error Handling
1. **Check HTTP status codes** before processing responses
2. **Implement exponential backoff** for rate limiting
3. **Log errors appropriately** without exposing sensitive data
4. **Provide user-friendly error messages**
5. **Handle network failures** with appropriate fallbacks

### Performance
1. **Use connection pooling** for high-volume applications
2. **Implement request debouncing** for search interfaces
3. **Cache frequently accessed data** appropriately
4. **Monitor API usage** against rate limits
5. **Implement pagination** for large result sets

---

## 📞 API Support

### Getting Help
- **📖 Interactive Documentation**: Available at `/docs` and `/redoc`
- **🔧 API Status Page**: Real-time status at `/api/v1/system/health`
- **📊 Metrics Dashboard**: Monitor usage at `/metrics`
- **🐛 Issue Reporting**: GitHub issues for bug reports and feature requests

### Swiss Compliance Support
- **🇨🇭 FADP Compliance**: Built-in Swiss data protection features
- **📋 Audit Support**: Complete audit trails and reporting
- **🏛️ Government Integration**: Ready for Swiss federal requirements
- **🏦 Banking Grade**: Meets Swiss banking security standards

**The ProjektSusui API is production-ready and powers secure, compliant document intelligence solutions across Swiss enterprises.**