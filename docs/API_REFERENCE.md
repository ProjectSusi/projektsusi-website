# Enterprise API Reference

## Overview

This document provides a comprehensive API reference for all enterprise features implemented in the RAG System. All endpoints require authentication unless otherwise specified.

## Table of Contents

1. [Authentication](#authentication)
2. [Multi-Tenancy](#multi-tenancy)
3. [SSO (Single Sign-On)](#sso-single-sign-on)
4. [Data Retention](#data-retention)
5. [Compliance & Audit](#compliance--audit)
6. [Metrics & Monitoring](#metrics--monitoring)
7. [Performance Monitoring](#performance-monitoring)
8. [Horizontal Scaling](#horizontal-scaling)
9. [Load Balancing](#load-balancing)
10. [S3 Storage](#s3-storage)

---

## Authentication

### Base URL: `/api/v1/auth`

#### Login with MFA
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "mfa_token": "string"  // Optional, required if MFA enabled
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "expires_in": 1800,
  "requires_mfa": false,
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "admin"
  }
}
```

#### Setup MFA
```http
POST /api/v1/auth/mfa/setup
Authorization: Bearer <token>
```

**Response:**
```json
{
  "secret": "string",
  "qr_code_data_uri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backup_codes": ["12345678", "87654321", ...]
}
```

#### Verify MFA Token
```http
POST /api/v1/auth/mfa/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}
```

#### Disable MFA
```http
POST /api/v1/auth/mfa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "string",
  "mfa_token": "123456"
}
```

---

## Multi-Tenancy

### Base URL: `/api/v1/tenants`

#### List Tenants
```http
GET /api/v1/tenants
Authorization: Bearer <token>
X-Tenant-ID: 1
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Company A",
    "slug": "company-a",
    "domain": "company-a.example.com",
    "is_active": true,
    "created_at": "2025-01-06T12:00:00Z",
    "settings": {},
    "limits": {
      "max_documents": 1000,
      "max_users": 50
    }
  }
]
```

#### Create Tenant
```http
POST /api/v1/tenants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Company B",
  "slug": "company-b",
  "domain": "company-b.example.com",
  "settings": {},
  "limits": {
    "max_documents": 500,
    "max_users": 25
  }
}
```

#### Get Tenant Details
```http
GET /api/v1/tenants/{tenant_id}
Authorization: Bearer <token>
X-Tenant-ID: 1
```

#### Update Tenant
```http
PUT /api/v1/tenants/{tenant_id}
Authorization: Bearer <token>
X-Tenant-ID: 1
Content-Type: application/json

{
  "name": "Updated Company Name",
  "is_active": true,
  "limits": {
    "max_documents": 2000
  }
}
```

#### Delete Tenant
```http
DELETE /api/v1/tenants/{tenant_id}
Authorization: Bearer <token>
X-Tenant-ID: 1
```

---

## SSO (Single Sign-On)

### Base URL: `/api/v1/sso`

#### List Available Providers
```http
GET /api/v1/sso/providers
```

**Response:**
```json
[
  {
    "name": "SAML",
    "type": "saml",
    "enabled": true,
    "login_url": "/api/v1/sso/saml/login"
  },
  {
    "name": "OIDC",
    "type": "oidc",
    "enabled": true,
    "login_url": "/api/v1/sso/oidc/login"
  }
]
```

#### Initiate SSO Login
```http
POST /api/v1/sso/initiate
Content-Type: application/json

{
  "provider": "saml",
  "tenant_id": 1
}
```

**Response:**
```json
{
  "auth_url": "https://idp.example.com/sso/saml?SAMLRequest=..."
}
```

#### SAML Login
```http
GET /api/v1/sso/saml/login?tenant_id=1
```
*Returns redirect to SAML IdP*

#### OIDC Login
```http
GET /api/v1/sso/oidc/login?tenant_id=1
```
*Returns redirect to OIDC provider*

#### SAML Metadata
```http
GET /api/v1/sso/saml/metadata
```
*Returns SAML SP metadata XML*

#### Get SSO Status
```http
GET /api/v1/sso/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "linked_providers": ["saml", "oidc"],
  "available_providers": [
    {
      "name": "SAML",
      "type": "saml",
      "enabled": true,
      "login_url": "/api/v1/sso/saml/link"
    }
  ]
}
```

#### Link SSO Account
```http
POST /api/v1/sso/link
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "saml"
}
```

#### Unlink SSO Account
```http
DELETE /api/v1/sso/link/{provider}
Authorization: Bearer <token>
```

---

## Data Retention

### Base URL: `/api/v1/data-retention`

#### Get Retention Policies
```http
GET /api/v1/data-retention/policies
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "category": "personal_data",
    "retention_days": 2555,
    "auto_delete": true,
    "archive_before_delete": true,
    "legal_hold_override": false,
    "tenant_specific": false,
    "created_at": "2025-01-06T12:00:00Z",
    "metadata": {
      "legal_basis": "Swiss DSG Art. 12",
      "description": "Personal identifiers and contact information"
    }
  }
]
```

#### Create Retention Policy
```http
POST /api/v1/data-retention/policies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "category": "custom_data",
  "retention_days": 365,
  "auto_delete": true,
  "archive_before_delete": false,
  "legal_hold_override": false,
  "tenant_specific": true,
  "metadata": {
    "description": "Custom data category"
  }
}
```

#### Get Specific Policy
```http
GET /api/v1/data-retention/policies/{category}?tenant_id=1
Authorization: Bearer <token>
```

#### Get Retention Status
```http
GET /api/v1/data-retention/status/{entity_id}?entity_type=document
Authorization: Bearer <token>
```

**Response:**
```json
{
  "entity_id": "123",
  "entity_type": "document",
  "category": "document_content",
  "created_at": "2024-01-06T12:00:00Z",
  "retention_until": "2029-01-06T12:00:00Z",
  "days_until_expiry": 1460,
  "is_expired": false,
  "is_archived": false,
  "legal_hold": false,
  "tenant_id": 1
}
```

#### Find Expired Data
```http
GET /api/v1/data-retention/expired?category=document_content&tenant_id=1
Authorization: Bearer <token>
```

#### Cleanup Expired Data
```http
POST /api/v1/data-retention/cleanup
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "dry_run": true,
  "category": "technical_data",
  "tenant_id": 1
}
```

**Response:**
```json
{
  "examined": 50,
  "archived": 10,
  "deleted": 15,
  "skipped": 20,
  "errors": 5,
  "dry_run": true
}
```

#### Generate Retention Report
```http
GET /api/v1/data-retention/report?tenant_id=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "report_date": "2025-01-06T12:00:00Z",
  "total_entities": 1000,
  "expiring_soon": 25,
  "expired": 10,
  "deleted": 0,
  "archived": 5,
  "legal_holds": 3,
  "categories": {
    "document_content": 800,
    "personal_data": 150,
    "technical_data": 50
  },
  "tenants": {
    "1": 900,
    "2": 100
  },
  "recommendations": [
    "Run cleanup to remove 10 expired documents",
    "Review 3 legal holds for continued necessity"
  ]
}
```

#### Add Legal Hold
```http
POST /api/v1/data-retention/legal-holds
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "entity_id": "document_123",
  "reason": "Litigation hold - Case #2025-001"
}
```

#### Remove Legal Hold
```http
DELETE /api/v1/data-retention/legal-holds/{entity_id}
Authorization: Bearer <admin_token>
```

#### List Legal Holds
```http
GET /api/v1/data-retention/legal-holds
Authorization: Bearer <token>
```

**Response:**
```json
{
  "legal_holds": ["document_123", "user_456"],
  "count": 2
}
```

#### List Data Categories
```http
GET /api/v1/data-retention/categories
Authorization: Bearer <token>
```

**Response:**
```json
{
  "categories": [
    {
      "value": "personal_data",
      "description": "Personal identifiers and contact information"
    },
    {
      "value": "financial_data", 
      "description": "Financial records and transaction data"
    }
  ]
}
```

---

## Compliance & Audit

### Base URL: `/api/v1/compliance`

#### Get Audit Logs
```http
GET /api/v1/compliance/audit-logs?limit=100&offset=0&start_date=2025-01-01&end_date=2025-01-06
Authorization: Bearer <token>
X-Tenant-ID: 1
```

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "timestamp": "2025-01-06T12:00:00Z",
      "tenant_id": 1,
      "user_id": "admin",
      "action": "document_upload",
      "resource_type": "document",
      "resource_id": "doc_123",
      "details": {
        "filename": "report.pdf",
        "size": 1024000
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "success": true
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

#### Create Data Subject Request
```http
POST /api/v1/compliance/data-subject-request
Content-Type: application/json

{
  "request_type": "export",
  "email": "user@example.com",
  "description": "GDPR data export request",
  "verification_token": "abc123"
}
```

#### Get Data Subject Request Status
```http
GET /api/v1/compliance/data-subject-request/{request_id}?verification_token=abc123
```

**Response:**
```json
{
  "id": 1,
  "request_type": "export",
  "status": "completed",
  "email": "user@example.com",
  "created_at": "2025-01-06T10:00:00Z",
  "completed_at": "2025-01-06T12:00:00Z",
  "download_url": "/api/v1/compliance/download/abc123",
  "expires_at": "2025-01-13T12:00:00Z"
}
```

#### Get Compliance Reports
```http
GET /api/v1/compliance/reports/privacy?tenant_id=1&period=monthly
Authorization: Bearer <admin_token>
X-Tenant-ID: 1
```

#### Cleanup Expired Data
```http
POST /api/v1/compliance/cleanup/expired-data
Authorization: Bearer <admin_token>
X-Tenant-ID: 1
```

#### Health Check
```http
GET /api/v1/compliance/health
```

**Response:**
```json
{
  "status": "healthy",
  "audit_logging": true,
  "data_retention": true,
  "privacy_protection": true,
  "gdpr_compliance": true
}
```

---

## Metrics & Monitoring

### Base URL: `/api/v1/metrics`

#### Get Metrics Summary
```http
GET /api/v1/metrics/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T12:00:00Z",
  "http_metrics": {
    "total_requests": 1000,
    "success_rate": 98.5,
    "avg_response_time": 150.5,
    "error_count": 15
  },
  "rag_metrics": {
    "queries_processed": 500,
    "avg_confidence_score": 0.85,
    "avg_processing_time": 2.5
  },
  "system_metrics": {
    "cpu_usage": 45.2,
    "memory_usage": 62.1,
    "disk_usage": 75.0
  }
}
```

#### Prometheus Metrics Endpoint
```http
GET /metrics
```
*Returns Prometheus-formatted metrics*

#### Health Check
```http
GET /api/v1/metrics/health
```

**Response:**
```json
{
  "status": "healthy",
  "metrics_enabled": true,
  "collection_active": true,
  "last_collection": "2025-01-06T12:00:00Z"
}
```

---

## Performance Monitoring

### Base URL: `/api/v1/performance`

#### Get Performance Summary
```http
GET /api/v1/performance/summary?period=1h
Authorization: Bearer <token>
```

**Response:**
```json
{
  "period": "1h",
  "timestamp": "2025-01-06T12:00:00Z",
  "overview": {
    "avg_response_time": 125.5,
    "p95_response_time": 250.0,
    "error_rate": 1.5,
    "throughput": 100.5
  },
  "alerts_summary": {
    "active_alerts": 2,
    "warning_alerts": 1,
    "critical_alerts": 1
  },
  "top_slow_endpoints": [
    {
      "endpoint": "/api/v1/query",
      "avg_response_time": 2500.0,
      "request_count": 100
    }
  ]
}
```

#### Get Active Alerts
```http
GET /api/v1/performance/alerts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "alerts": [
    {
      "id": "high_response_time_001",
      "severity": "warning",
      "title": "High Response Time Detected",
      "description": "Average response time exceeded 2000ms",
      "metric": "response_time",
      "threshold": 2000,
      "current_value": 2150,
      "created_at": "2025-01-06T11:55:00Z",
      "recommendations": [
        "Consider increasing server resources",
        "Review database query performance"
      ]
    }
  ],
  "count": 1
}
```

#### Get Performance Recommendations
```http
GET /api/v1/performance/recommendations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "recommendations": [
    {
      "category": "scaling",
      "title": "Increase API Workers",
      "description": "Current CPU usage is consistently above 80%",
      "priority": "high",
      "impact": "Improve response times by 30%",
      "action": "Scale up API workers from 2 to 4"
    }
  ],
  "count": 1
}
```

#### Configure Performance Thresholds
```http
PUT /api/v1/performance/thresholds
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "response_time_warning": 1000,
  "response_time_critical": 2000,
  "error_rate_warning": 5.0,
  "error_rate_critical": 10.0,
  "cpu_usage_warning": 80.0,
  "cpu_usage_critical": 95.0
}
```

#### Health Check
```http
GET /api/v1/performance/health
```

---

## Horizontal Scaling

### Base URL: `/api/v1/scaling`

#### Get Scaling Status
```http
GET /api/v1/scaling/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "scaling_enabled": true,
  "running": true,
  "check_interval_seconds": 60,
  "metrics_history_size": 100,
  "components": {
    "api_workers": {
      "current_instances": 3,
      "target_instances": 3,
      "min_instances": 2,
      "max_instances": 8,
      "is_scaling": false,
      "health_status": "healthy",
      "last_scaled": "2025-01-06T10:30:00Z",
      "last_action": "scale_up"
    },
    "background_jobs": {
      "current_instances": 2,
      "target_instances": 2,
      "min_instances": 1,
      "max_instances": 6,
      "is_scaling": false,
      "health_status": "healthy"
    }
  }
}
```

#### Get Current Metrics
```http
GET /api/v1/scaling/metrics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "timestamp": "2025-01-06T12:00:00Z",
  "system_metrics": {
    "cpu_percent": 65.5,
    "memory_percent": 72.1,
    "disk_percent": 45.0,
    "network_io_mbps": 12.5,
    "active_connections": 150
  },
  "application_metrics": {
    "queue_length": 5,
    "response_time_ms": 180.5,
    "error_rate_percent": 2.1
  },
  "custom_metrics": {
    "llm_requests_per_second": 25.0,
    "document_processing_queue": 3
  }
}
```

#### Manual Scaling
```http
POST /api/v1/scaling/manual
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "component": "api_workers",
  "action": "scale_up",
  "reason": "High CPU usage detected manually"
}
```

**Response:**
```json
{
  "success": true,
  "component": "api_workers",
  "action": "scale_up",
  "old_instances": 3,
  "new_instances": 4,
  "triggered_by": "admin",
  "timestamp": "2025-01-06T12:00:00Z"
}
```

#### Configure Scaling
```http
POST /api/v1/scaling/configure
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "component": "background_jobs",
  "metric_name": "queue_length",
  "scale_up_threshold": 10.0,
  "scale_down_threshold": 2.0,
  "min_instances": 1,
  "max_instances": 5,
  "cooldown_seconds": 180
}
```

#### Get Scaling Recommendations
```http
GET /api/v1/scaling/recommendations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "analysis_period_minutes": 60,
  "metrics_analyzed": 60,
  "averages": {
    "cpu_percent": 75.5,
    "memory_percent": 68.2,
    "queue_length": 8.5,
    "response_time_ms": 195.0
  },
  "recommendations": [
    "Scale up API workers due to sustained high CPU usage",
    "Consider increasing memory allocation",
    "Background job queue is within normal range"
  ]
}
```

#### Get Scaling History
```http
GET /api/v1/scaling/history?hours=24&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "events": [
    {
      "timestamp": "2025-01-06T11:30:00Z",
      "component": "api_workers",
      "action": "scale_up",
      "old_instances": 2,
      "new_instances": 3,
      "trigger_metric": "cpu_percent",
      "trigger_value": 82.5,
      "reason": "CPU usage exceeded scale-up threshold"
    }
  ],
  "total": 1,
  "period": "24 hours"
}
```

#### Enable/Disable Auto-scaling
```http
POST /api/v1/scaling/admin/enable
Authorization: Bearer <admin_token>
```

```http
POST /api/v1/scaling/admin/disable
Authorization: Bearer <admin_token>
```

#### Health Check
```http
GET /api/v1/scaling/health
```

---

## Load Balancing

### Base URL: `/api/v1/load-balancer`

#### Get Load Balancer Status
```http
GET /api/v1/load-balancer/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_backends": 3,
  "healthy_backends": 2,
  "unhealthy_backends": 1,
  "total_requests": 1000,
  "successful_requests": 950,
  "failed_requests": 50,
  "success_rate": 95.0,
  "default_strategy": "adaptive",
  "recent_requests": 100
}
```

#### List Backends
```http
GET /api/v1/load-balancer/backends
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "backend_1",
    "host": "127.0.0.1",
    "port": 8000,
    "weight": 2.0,
    "max_connections": 100,
    "health_check_url": "/health",
    "timeout_ms": 5000,
    "endpoint": "http://127.0.0.1:8000",
    "metadata": {
      "role": "primary",
      "zone": "local"
    }
  }
]
```

#### Get Backend Status
```http
GET /api/v1/load-balancer/backends/status
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "backend": {
      "id": "backend_1",
      "host": "127.0.0.1",
      "port": 8000,
      "endpoint": "http://127.0.0.1:8000"
    },
    "health": "healthy",
    "current_connections": 15,
    "total_requests": 500,
    "successful_requests": 485,
    "failed_requests": 15,
    "success_rate": 97.0,
    "error_rate": 3.0,
    "avg_response_time_ms": 125.5,
    "utilization": 15.0,
    "last_health_check": "2025-01-06T12:00:00Z",
    "consecutive_failures": 0,
    "is_enabled": true
  }
]
```

#### Simulate Request Routing
```http
POST /api/v1/load-balancer/route
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "session_id": "session_123",
  "tenant_id": 1,
  "request_path": "/api/v1/query",
  "request_method": "POST",
  "strategy": "adaptive"
}
```

**Response:**
```json
{
  "backend": {
    "id": "backend_1",
    "endpoint": "http://127.0.0.1:8000"
  },
  "strategy_used": "adaptive",
  "decision_time_ms": 1.25,
  "reason": "Adaptive selection (performance score: 95.5)",
  "alternatives_considered": 3,
  "session_affinity": false
}
```

#### Get Traffic Distribution
```http
GET /api/v1/load-balancer/traffic/distribution
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_recent_requests": 1000,
  "distribution": {
    "backend_1": {
      "requests": 600,
      "percentage": 60.0
    },
    "backend_2": {
      "requests": 400,
      "percentage": 40.0
    }
  },
  "analysis_period": "Last 1000 requests"
}
```

#### Get Strategy Recommendations
```http
GET /api/v1/load-balancer/strategy/recommendations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "recommendation": "adaptive",
  "reason": "Best average decision time: 1.15ms",
  "confidence": "high",
  "analysis_sample_size": 50
}
```

#### Create Backend (Admin)
```http
POST /api/v1/load-balancer/admin/backends
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "id": "backend_3",
  "host": "127.0.0.1",
  "port": 8002,
  "weight": 1.5,
  "max_connections": 150,
  "health_check_url": "/health",
  "timeout_ms": 5000,
  "metadata": {
    "role": "secondary",
    "zone": "backup"
  }
}
```

#### Set Load Balancing Strategy (Admin)
```http
PUT /api/v1/load-balancer/admin/strategy
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "strategy": "weighted_round_robin"
}
```

#### List Available Strategies
```http
GET /api/v1/load-balancer/strategies
```

**Response:**
```json
{
  "strategies": [
    {
      "name": "round_robin",
      "description": "Distribute requests evenly across all healthy backends"
    },
    {
      "name": "adaptive",
      "description": "Dynamically select best strategy based on performance"
    }
  ]
}
```

#### Health Check
```http
GET /api/v1/load-balancer/health
```

---

## S3 Storage

### Base URL: `/api/v1/s3`

#### Get S3 Status
```http
GET /api/v1/s3/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "enabled": true,
  "connected": true,
  "endpoint": "https://minio.example.com",
  "bucket": "rag-documents",
  "region": "us-east-1",
  "objects_count": 150,
  "total_size_mb": 1024.5,
  "last_sync": "2025-01-06T12:00:00Z"
}
```

#### List Buckets
```http
GET /api/v1/s3/buckets
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "buckets": [
    {
      "name": "rag-documents",
      "creation_date": "2025-01-01T00:00:00Z",
      "objects": 150,
      "size_mb": 1024.5
    },
    {
      "name": "rag-backups",
      "creation_date": "2025-01-01T00:00:00Z",
      "objects": 50,
      "size_mb": 512.0
    }
  ],
  "total_buckets": 2
}
```

#### Test Upload
```http
POST /api/v1/s3/test-upload
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "test_file": "test_upload_20250106120000.txt",
  "upload_time_ms": 125.5,
  "file_size": 1024,
  "s3_url": "s3://rag-documents/tests/test_upload_20250106120000.txt"
}
```

#### Get Storage Statistics
```http
GET /api/v1/s3/statistics?tenant_id=1
Authorization: Bearer <token>
X-Tenant-ID: 1
```

**Response:**
```json
{
  "tenant_id": 1,
  "total_objects": 75,
  "total_size_mb": 512.25,
  "by_type": {
    "pdf": {
      "count": 45,
      "size_mb": 350.0
    },
    "docx": {
      "count": 20,
      "size_mb": 125.5
    },
    "txt": {
      "count": 10,
      "size_mb": 36.75
    }
  },
  "upload_trend": {
    "last_24h": 5,
    "last_week": 25,
    "last_month": 75
  }
}
```

#### Health Check
```http
GET /api/v1/s3/health
```

**Response:**
```json
{
  "status": "healthy",
  "s3_enabled": true,
  "connection_status": "connected",
  "last_health_check": "2025-01-06T12:00:00Z",
  "response_time_ms": 45.5
}
```

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin required or insufficient permissions)
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Common Headers

**Authentication:**
```
Authorization: Bearer <jwt_token>
```

**Multi-tenancy:**
```
X-Tenant-ID: 1
X-Tenant-Slug: company-name
```

**Content Type:**
```
Content-Type: application/json
```

**CSRF Protection:**
```
X-CSRF-Token: <csrf_token>
```

## Rate Limits

- **Authentication endpoints**: 10 requests/minute per IP
- **Data modification endpoints**: 100 requests/minute per user
- **Read-only endpoints**: 1000 requests/minute per user
- **Admin endpoints**: 200 requests/minute per admin

## Error Response Format

```json
{
  "detail": "Error description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2025-01-06T12:00:00Z",
  "request_id": "req_123456789"
}
```

## Webhooks

Some enterprise features support webhooks for event notifications:

### Compliance Events
- Data retention cleanup completed
- GDPR request processed
- Audit threshold exceeded

### Scaling Events  
- Auto-scaling action performed
- Performance threshold exceeded
- System resource alerts

### Storage Events
- S3 connectivity issues
- Storage quota warnings
- Backup completion

Configure webhooks in the admin interface or via environment variables:
```bash
WEBHOOK_URL=https://your-app.com/webhooks/rag-system
WEBHOOK_SECRET=your-secret-key
```