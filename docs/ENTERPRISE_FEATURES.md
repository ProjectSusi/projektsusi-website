# Enterprise Features Documentation

## Overview

This document provides comprehensive documentation for all enterprise features implemented in the RAG System. These features transform the basic RAG system into a production-ready, enterprise-grade solution with security, compliance, scalability, and monitoring capabilities.

## Table of Contents

1. [Security Features](#security-features)
2. [Multi-Tenancy](#multi-tenancy)
3. [Single Sign-On (SSO)](#single-sign-on-sso)
4. [Data Compliance](#data-compliance)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Scalability Features](#scalability-features)
7. [Storage & Infrastructure](#storage--infrastructure)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Security Features

### Encryption at Rest (KAN-25)

**Implementation**: `core/utils/encryption.py`, `core/services/encryption_service.py`

**Features**:
- **Fernet Symmetric Encryption**: AES 128 encryption for documents
- **Key Management**: Secure key generation and storage
- **Automatic Encryption**: Transparent encryption/decryption of documents
- **Key Rotation**: Support for key rotation and migration

**Configuration**:
```bash
# Enable encryption
ENCRYPTION_ENABLED=true
ENCRYPTION_KEY_FILE=data/encryption.key
ENCRYPTION_ALGORITHM=Fernet
```

**Usage**:
```python
# Documents are automatically encrypted when uploaded
# No code changes needed - transparent encryption
```

### Multi-Factor Authentication (KAN-26)

**Implementation**: `core/services/auth_service.py`, `core/routers/auth.py`

**Features**:
- **TOTP Support**: Time-based one-time passwords
- **QR Code Generation**: Easy mobile app setup
- **Backup Codes**: Recovery codes for device loss
- **Integration**: Seamless integration with existing auth flow

**API Endpoints**:
- `POST /api/v1/auth/mfa/setup` - Setup MFA for user
- `POST /api/v1/auth/mfa/verify` - Verify MFA token
- `POST /api/v1/auth/mfa/disable` - Disable MFA
- `GET /api/v1/auth/mfa/backup-codes` - Generate backup codes

**Usage**:
```bash
# Enable MFA by default
MFA_ENABLED=true
```

---

## Multi-Tenancy

### Multi-Tenant Support (KAN-36)

**Implementation**: `core/middleware/tenant_middleware.py`, `core/services/tenant_service.py`

**Features**:
- **Complete Isolation**: Data isolation at database level
- **Tenant Resolution**: Automatic tenant detection from headers/domains
- **Cross-Tenant Security**: Prevents data leakage between tenants
- **Admin Management**: Tenant creation and management APIs

**API Endpoints**:
- `GET /api/v1/tenants` - List tenants
- `POST /api/v1/tenants` - Create tenant
- `GET /api/v1/tenants/{id}` - Get tenant details
- `PUT /api/v1/tenants/{id}` - Update tenant
- `DELETE /api/v1/tenants/{id}` - Delete tenant

**Headers**:
```
X-Tenant-ID: 1
X-Tenant-Slug: company-name
```

---

## Single Sign-On (SSO)

### SSO Integration (KAN-37)

**Implementation**: `core/services/sso_service.py`, `core/routers/sso.py`

**Supported Protocols**:
- **SAML 2.0**: Enterprise identity providers
- **OpenID Connect (OIDC)**: Modern OAuth2-based authentication

**Popular Providers**:
- Google (OIDC)
- Microsoft Azure AD (OIDC)
- Auth0 (OIDC)
- Okta (SAML/OIDC)
- Active Directory Federation Services (SAML)

**API Endpoints**:
- `GET /api/v1/sso/providers` - List available providers
- `GET /api/v1/sso/saml/login` - SAML login
- `GET /api/v1/sso/oidc/login` - OIDC login
- `POST /api/v1/sso/saml/acs` - SAML callback
- `GET /api/v1/sso/oidc/callback` - OIDC callback

**Configuration**:
```bash
# SAML Configuration
SAML_ENABLED=true
SAML_SSO_URL=https://your-provider.com/sso/saml
SAML_ENTITY_ID=projectsusi-rag

# OIDC Configuration  
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_DISCOVERY_URL=https://provider.com/.well-known/openid_configuration
```

**Setup Helper**:
```bash
python setup_sso.py
```

---

## Data Compliance

### Audit Logging (KAN-38)

**Implementation**: `core/services/compliance_service.py`

**Features**:
- **SOC2 Compliance**: Complete audit trail for all operations
- **GDPR Compliance**: Privacy protection and data subject rights
- **Swiss DSG Compliance**: Swiss data protection law requirements
- **Privacy Protection**: PII masking and anonymization

**Tracked Events**:
- Document uploads/downloads/deletions
- User authentication/authorization
- Administrative actions
- Data processing activities

**API Endpoints**:
- `GET /api/v1/compliance/audit-logs` - Get audit logs
- `POST /api/v1/compliance/data-subject-request` - GDPR requests
- `GET /api/v1/compliance/reports` - Compliance reports

### Data Retention Policies (KAN-39)

**Implementation**: `core/services/data_retention_service.py`, `core/routers/data_retention.py`

**Features**:
- **Swiss DSG Compliance**: Legal retention requirements
- **9 Data Categories**: Different retention rules per data type
- **Automated Cleanup**: Scheduled deletion of expired data
- **Legal Holds**: Prevent deletion of data under investigation
- **Archival**: Safe archival before deletion

**Retention Periods**:
- Personal Data: 7 years (2555 days)
- Financial Data: 10 years (3650 days)
- Health Data: 7 years (2555 days)
- Behavioral Data: 1 year (365 days)
- Technical Data: 3 months (90 days)
- Document Content: 5 years (configurable)
- Audit Logs: 7 years (never auto-delete)

**API Endpoints**:
- `GET /api/v1/data-retention/policies` - List retention policies
- `GET /api/v1/data-retention/expired` - Find expired data
- `POST /api/v1/data-retention/cleanup` - Clean up expired data
- `GET /api/v1/data-retention/report` - Retention report
- `POST /api/v1/data-retention/legal-holds` - Add legal hold

**Scheduling**:
- Daily cleanup at 2:00 AM
- Weekly reports on Sunday at 1:00 AM

---

## Monitoring & Metrics

### Prometheus Metrics (KAN-32)

**Implementation**: `core/services/metrics_service.py`, `core/middleware/metrics_middleware.py`

**Metrics Categories**:
- **HTTP Metrics**: Request duration, status codes, throughput
- **RAG Metrics**: Query processing time, confidence scores, success rates
- **LLM Metrics**: Token usage, model performance, error rates
- **System Metrics**: CPU, memory, disk usage

**Endpoints**:
- `GET /metrics` - Prometheus metrics exposition
- `GET /api/v1/metrics/summary` - Human-readable metrics summary

**Configuration**:
```bash
METRICS_ENABLED=true
PROMETHEUS_METRICS_PORT=8001
```

### Performance Monitoring (KAN-34)

**Implementation**: `core/services/performance_monitoring_service.py`

**Features**:
- **Real-time Monitoring**: Continuous performance tracking
- **Alerting System**: Configurable performance alerts
- **Optimization Recommendations**: AI-powered optimization suggestions
- **Threshold Management**: Customizable performance thresholds

**Alert Types**:
- High response time alerts
- Error rate alerts
- Resource utilization alerts
- Custom metric alerts

**API Endpoints**:
- `GET /api/v1/performance/summary` - Performance summary
- `GET /api/v1/performance/alerts` - Active alerts
- `GET /api/v1/performance/recommendations` - Optimization suggestions

---

## Scalability Features

### Horizontal Scaling (KAN-42)

**Implementation**: `core/services/scaling_service.py`

**Features**:
- **Auto-scaling**: Automatic scaling based on metrics
- **Component Scaling**: Scale different components independently
- **Threshold-based**: CPU, memory, queue length triggers
- **Manual Override**: Manual scaling operations

**Scalable Components**:
- API Workers
- Background Job Processors
- Document Processors
- Database Connections

**API Endpoints**:
- `GET /api/v1/scaling/status` - Scaling status
- `POST /api/v1/scaling/manual` - Manual scaling
- `GET /api/v1/scaling/metrics` - Scaling metrics
- `GET /api/v1/scaling/recommendations` - Scaling recommendations

**Configuration**:
```bash
AUTO_SCALING_ENABLED=true
SCALING_CHECK_INTERVAL=60
CPU_SCALE_UP_THRESHOLD=70.0
CPU_SCALE_DOWN_THRESHOLD=30.0
```

### Load Balancing (KAN-43)

**Implementation**: `core/services/load_balancer_service.py`, `core/middleware/load_balancer_middleware.py`

**Strategies**:
- Round Robin
- Weighted Round Robin
- Least Connections
- Weighted Least Connections
- Random
- Weighted Random
- IP Hash
- Consistent Hash
- Response Time-based
- Health-based
- Adaptive (AI-powered)

**Features**:
- **Health Monitoring**: Continuous backend health checking
- **Session Affinity**: Sticky sessions for stateful applications
- **Traffic Analytics**: Real-time traffic distribution analysis
- **Strategy Recommendations**: AI-powered strategy optimization

**API Endpoints**:
- `GET /api/v1/load-balancer/status` - Load balancer status
- `GET /api/v1/load-balancer/backends` - Backend status
- `POST /api/v1/load-balancer/route` - Test routing
- `GET /api/v1/load-balancer/traffic/distribution` - Traffic analytics

---

## Storage & Infrastructure

### S3/MinIO Storage (KAN-44)

**Implementation**: `core/services/s3_storage_service.py`

**Features**:
- **S3 Compatibility**: Works with AWS S3, MinIO, and other S3-compatible storage
- **Automatic Fallback**: Falls back to local storage if S3 unavailable
- **Encryption**: Server-side encryption for stored documents
- **Lifecycle Management**: Automatic cleanup and archival

**Configuration**:
```bash
USE_S3_STORAGE=true
S3_ENDPOINT_URL=https://minio.example.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=rag-documents
S3_REGION=us-east-1
```

**API Endpoints**:
- `GET /api/v1/s3/status` - S3 connection status
- `GET /api/v1/s3/buckets` - List buckets
- `POST /api/v1/s3/test-upload` - Test upload functionality

---

## Configuration

### Environment Variables

**Core Settings**:
```bash
# Basic Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false
LOG_LEVEL=INFO

# Database
DATABASE_PATH=data/rag_database.db

# Security
SECRET_KEY=your-secret-key
AUTH_ENABLED=true
ENCRYPTION_ENABLED=true
MFA_ENABLED=true

# Multi-tenancy
TENANT_RESOLUTION_ENABLED=true

# Metrics & Monitoring
METRICS_ENABLED=true
PROMETHEUS_METRICS_PORT=8001

# Scaling
AUTO_SCALING_ENABLED=true
SCALING_CHECK_INTERVAL=60

# Load Balancing
LOAD_BALANCER_ENABLED=true
LOAD_BALANCER_STRATEGY=adaptive

# Storage
USE_S3_STORAGE=false
S3_BUCKET_NAME=rag-documents

# SSO
SSO_ENABLED=true
SAML_ENABLED=false
OIDC_ENABLED=false
```

### Configuration Files

**Retention Policies**: `config/retention_policies.json`
```json
{
  "policies": {
    "personal_data": {
      "retention_days": 2555,
      "auto_delete": true,
      "archive_before_delete": true
    }
  }
}
```

**LLM Configuration**: `config/llm_config.yaml`
```yaml
default_model: arlesheim-german
timeout: 300
max_retries: 3
```

---

## Testing

### Test Scripts

All enterprise features include comprehensive test scripts:

- `test_encryption.py` - Encryption functionality
- `test_mfa_integration.py` - Multi-factor authentication
- `test_multi_tenancy.py` - Multi-tenant isolation
- `test_sso_integration.py` - Single sign-on
- `test_compliance_service.py` - Audit logging and compliance
- `test_data_retention.py` - Data retention policies
- `test_metrics_integration.py` - Prometheus metrics
- `test_performance_monitoring.py` - Performance monitoring
- `test_horizontal_scaling.py` - Auto-scaling
- `test_load_balancer.py` - Load balancing
- `test_s3_storage.py` - S3 storage integration

### Running Tests

```bash
# Test specific feature
python test_encryption.py
python test_mfa_integration.py
python test_sso_integration.py

# Test all features
python -m pytest tests/
```

---

## Deployment

### Production Checklist

1. **Security Configuration**:
   - [ ] Set strong `SECRET_KEY`
   - [ ] Configure `ENCRYPTION_ENABLED=true`
   - [ ] Enable `MFA_ENABLED=true`
   - [ ] Set up SSL/TLS certificates

2. **Database Setup**:
   - [ ] Configure production database (PostgreSQL recommended)
   - [ ] Set up database backups
   - [ ] Configure connection pooling

3. **Storage Configuration**:
   - [ ] Set up S3/MinIO storage
   - [ ] Configure storage encryption
   - [ ] Set up backup policies

4. **Monitoring Setup**:
   - [ ] Deploy Prometheus server
   - [ ] Configure Grafana dashboards
   - [ ] Set up alerting rules

5. **SSO Configuration**:
   - [ ] Register with identity provider
   - [ ] Configure SAML/OIDC settings
   - [ ] Test SSO flow

6. **Compliance Setup**:
   - [ ] Review retention policies
   - [ ] Configure audit logging
   - [ ] Set up compliance reporting

### Docker Deployment

```yaml
version: '3.8'
services:
  rag-api:
    build: .
    environment:
      - ENCRYPTION_ENABLED=true
      - MFA_ENABLED=true
      - METRICS_ENABLED=true
      - AUTO_SCALING_ENABLED=true
      - USE_S3_STORAGE=true
    ports:
      - "8000:8000"
      - "8001:8001"  # Metrics port
    volumes:
      - ./data:/app/data
      - ./config:/app/config
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rag-system
  template:
    spec:
      containers:
      - name: rag-api
        image: rag-system:latest
        env:
        - name: ENCRYPTION_ENABLED
          value: "true"
        - name: METRICS_ENABLED
          value: "true"
        - name: AUTO_SCALING_ENABLED
          value: "true"
        ports:
        - containerPort: 8000
        - containerPort: 8001
```

---

## API Documentation

### OpenAPI/Swagger

Access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### Authentication

Most enterprise endpoints require authentication:

```bash
# Get access token
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "password",
  "mfa_token": "123456"  # If MFA enabled
}

# Use token in requests
Authorization: Bearer <access_token>
```

### Rate Limiting

Enterprise features include rate limiting:
- Authentication endpoints: 10 requests/minute
- Data modification: 100 requests/minute  
- Read operations: 1000 requests/minute

---

## Troubleshooting

### Common Issues

1. **Encryption Setup**:
   ```
   Error: Encryption key not found
   Solution: Set ENCRYPTION_ENABLED=true and ensure key file exists
   ```

2. **MFA Issues**:
   ```
   Error: Invalid MFA token
   Solution: Check time synchronization between server and client
   ```

3. **SSO Problems**:
   ```
   Error: Invalid SAML response
   Solution: Verify SAML configuration and certificate validation
   ```

4. **Multi-tenancy**:
   ```
   Error: Tenant not found
   Solution: Ensure X-Tenant-ID header is set correctly
   ```

5. **Metrics Collection**:
   ```
   Error: Metrics endpoint not accessible
   Solution: Check METRICS_ENABLED=true and port configuration
   ```

### Log Analysis

```bash
# Check service logs
tail -f logs/rag-system.log

# Filter by component
grep "encryption" logs/rag-system.log
grep "SSO" logs/rag-system.log
grep "scaling" logs/rag-system.log
```

### Health Checks

```bash
# Overall system health
curl http://localhost:8000/api/v1/health

# Component-specific health
curl http://localhost:8000/api/v1/compliance/health
curl http://localhost:8000/api/v1/scaling/health
curl http://localhost:8000/api/v1/load-balancer/health
```

---

## Support

For enterprise support:
- **Documentation**: This file and inline API documentation
- **Test Scripts**: Use provided test scripts for validation
- **Configuration Examples**: See configuration section
- **Health Monitoring**: Use health check endpoints

All enterprise features are production-ready and include comprehensive error handling, logging, and monitoring capabilities.