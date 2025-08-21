# ProjektSusui - Complete Setup Guide (2025 Edition)

## 🎯 Quick Start (5 Minutes)

### Prerequisites Check
- ✅ **Docker Desktop** installed and running
- ✅ **8GB RAM** available
- ✅ **10GB disk space** free
- ✅ **Git** installed

### 1-Command Setup
```bash
# Clone and start everything
git clone https://github.com/ProjektSusui/ProjectSusi.git
cd ProjectSusi/website
cp .env.example .env && docker-compose up -d
```

### Verify Installation
```bash
# Check all services are running
docker-compose ps

# Expected output: All services show "Up"
# rag-app, postgres, ollama, redis
```

### Access Points
- **🌐 Website**: http://localhost:3000
- **🚀 API**: http://localhost:8000/docs
- **👨‍💼 Admin**: http://localhost:8000/admin
- **📊 Health**: http://localhost:8000/health

---

## 🏗️ Detailed Installation Guide

### Step 1: Environment Setup

#### Windows Setup
```cmd
# Install Docker Desktop from docker.com
# Install Git from git-scm.com

# Verify installations
docker --version
git --version
```

#### macOS Setup
```bash
# Using Homebrew
brew install docker git

# Start Docker Desktop app
open -a Docker
```

#### Linux Setup
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose git

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### Step 2: Project Configuration

#### Clone Repository
```bash
git clone https://github.com/ProjektSusui/ProjectSusi.git
cd ProjectSusi/website
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (required)
nano .env  # or use your preferred editor
```

#### Required Environment Variables
```bash
# Database Configuration
POSTGRES_USER=raguser
POSTGRES_PASSWORD=your_secure_password_here_change_this
POSTGRES_DB=ragdb_dev
DATABASE_URL=postgresql://raguser:your_secure_password_here_change_this@postgres:5432/ragdb_dev
USE_POSTGRESQL=true

# Security (CRITICAL - Change these!)
SECRET_KEY=generate_a_32_character_secret_key_here
JWT_SECRET_KEY=another_32_character_jwt_secret_key

# LLM Configuration
OLLAMA_HOST=http://ollama:11434
DEFAULT_MODEL=qwen2:1.5b

# Swiss Compliance
DATA_RESIDENCY_REGION=CH
ENABLE_AUDIT_LOGGING=true
FADP_COMPLIANCE=true

# Performance
REDIS_URL=redis://redis:6379
CACHE_TTL=3600
MAX_FILE_SIZE_MB=50
```

### Step 3: Start Services

#### Using Docker Compose
```bash
# Start all services in background
docker-compose up -d

# View startup logs
docker-compose logs -f

# Check service status
docker-compose ps
```

#### Service Health Check
```bash
# Wait for all services to be healthy
./deployment/scripts/wait-for-services.sh

# Or manually check each service
curl http://localhost:8000/health
curl http://localhost:3000
```

### Step 4: Initialize System

#### Download LLM Model
```bash
# Connect to Ollama container
docker exec -it website_ollama_1 ollama pull qwen2:1.5b

# Verify model is available
docker exec -it website_ollama_1 ollama list
```

#### Create Admin User
```bash
# Access the RAG container
docker exec -it website_rag-app_1 python -c "
from core.repositories.user_repository import UserRepository
from core.utils.security import hash_password
repo = UserRepository('data/rag_database.db')
repo.create_user('admin', hash_password('admin123'), 'admin@projektsusui.ch', 'default')
"
```

### Step 5: Verify Setup

#### Upload Test Document
```bash
# Upload a test document via API
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "X-CSRF-Token: $(curl -s http://localhost:8000/api/v1/csrf-token | jq -r .csrf_token)" \
  -F "file=@README.md" \
  -F "tenant_id=default"
```

#### Test RAG Query
```bash
# Query the system
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $(curl -s http://localhost:8000/api/v1/csrf-token | jq -r .csrf_token)" \
  -d '{
    "query": "What is ProjektSusui?",
    "tenant_id": "default"
  }'
```

#### Test Swiss Website
```bash
# Check German homepage
curl -s http://localhost:3000/de | grep -i "projektsusui"

# Check English homepage  
curl -s http://localhost:3000/en | grep -i "projektsusui"
```

---

## 🔧 Advanced Configuration

### Production Setup

#### SSL/TLS Configuration
```bash
# Generate SSL certificates
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key -out ssl/certificate.crt

# Update nginx configuration
cp deployment/nginx/ssl.conf nginx/conf.d/
```

#### Environment Hardening
```bash
# Generate secure secrets
python scripts/generate-secrets.py > .env.production

# Set proper permissions
chmod 600 .env.production
chmod 700 data/
```

### Swiss Compliance Setup

#### FADP Configuration
```bash
# Enable compliance features
export FADP_COMPLIANCE=true
export DATA_RETENTION_DAYS=2555  # 7 years
export AUDIT_LOG_RETENTION_DAYS=3650  # 10 years
export DATA_RESIDENCY_REGION=CH
```

#### Audit Logging
```bash
# Configure audit settings
cat >> .env <<EOF
ENABLE_AUDIT_LOGGING=true
AUDIT_LOG_LEVEL=INFO
AUDIT_RETENTION_POLICY=strict
LOG_USER_ACTIONS=true
LOG_DATA_ACCESS=true
EOF
```

### Performance Optimization

#### Resource Limits
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  rag-app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  postgres:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
```

#### Database Tuning
```sql
-- PostgreSQL optimization
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

---

## 🚀 Deployment Options

### Development Deployment

#### Local Development
```bash
# Start with hot-reload for development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Access development features
# - Hot reload for code changes
# - Debug logging enabled
# - SQLite for faster development
```

### Production Deployment

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.production.yml projektsusui

# Scale services
docker service scale projektsusui_rag-app=3
```

#### Kubernetes Deployment
```bash
# Create namespace
kubectl create namespace projektsusui

# Apply configurations
kubectl apply -f deployment/kubernetes/

# Check deployment
kubectl get pods -n projektsusui
```

### Cloud Deployment

#### AWS ECS
```bash
# Push to ECR
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.eu-central-1.amazonaws.com

# Deploy with CDK
cd deployment/aws-cdk
npm install
cdk deploy
```

#### Google Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/projektsusui

# Deploy
gcloud run deploy projektsusui \
  --image gcr.io/PROJECT_ID/projektsusui \
  --region europe-west6  # Zurich
```

---

## 🔍 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Docker not running
sudo systemctl start docker  # Linux
# or restart Docker Desktop

# Port conflicts
docker-compose down
netstat -tulpn | grep :8000  # Find conflicting process
```

#### Database Issues
```bash
# Connection failed
docker-compose logs postgres
docker exec -it website_postgres_1 psql -U raguser -d ragdb_dev -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### LLM Issues
```bash
# Ollama not responding
docker exec -it website_ollama_1 ollama list
docker exec -it website_ollama_1 ollama pull qwen2:1.5b

# Model not loaded
curl http://localhost:11434/api/generate -d '{"model":"qwen2:1.5b","prompt":"test"}'
```

#### Website Issues
```bash
# Next.js build failed
docker-compose logs website
docker exec -it website_website_1 npm run build

# Translation missing
# Check public/locales/de/common.json
# Check public/locales/en/common.json
```

### Performance Issues

#### Slow Queries
```bash
# Check database performance
docker exec -it website_postgres_1 psql -U raguser -d ragdb_dev -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;"

# Check vector search performance
curl -X GET http://localhost:8000/api/v1/metrics | grep vector_search
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Reduce memory usage
export OLLAMA_NUM_PARALLEL=1  # Reduce parallel processing
export MAX_WORKERS=2  # Reduce worker processes
```

### Swiss Compliance Issues

#### Data Residency
```bash
# Verify Swiss data residency
curl http://localhost:8000/api/v1/compliance/residency

# Check audit logs
docker exec -it website_rag-app_1 ls -la data/compliance/audit/
```

#### FADP Compliance
```bash
# Generate compliance report
curl -X GET http://localhost:8000/api/v1/compliance/fadp/report

# Test data deletion
curl -X DELETE http://localhost:8000/api/v1/compliance/user-data/{user_id}
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

#### System Health
```bash
# Overall system health
curl http://localhost:8000/api/v1/system/health | jq

# Individual service health
docker-compose ps
docker-compose logs --tail=100 rag-app
```

#### Performance Metrics
```bash
# Prometheus metrics
curl http://localhost:8000/metrics

# Custom metrics API
curl http://localhost:8000/api/v1/metrics/custom | jq
```

### Maintenance Tasks

#### Daily Tasks
```bash
#!/bin/bash
# daily-maintenance.sh

# Backup database
docker exec website_postgres_1 pg_dump -U raguser ragdb_dev > "backup-$(date +%Y%m%d).sql"

# Clean old logs
docker system prune -f

# Check system health
curl -f http://localhost:8000/health || echo "ALERT: System unhealthy"
```

#### Weekly Tasks
```bash
#!/bin/bash
# weekly-maintenance.sh

# Update Docker images
docker-compose pull
docker-compose up -d

# Optimize database
docker exec website_postgres_1 psql -U raguser -d ragdb_dev -c "VACUUM ANALYZE;"

# Generate compliance report
curl http://localhost:8000/api/v1/compliance/weekly-report > "compliance-$(date +%Y%m%d).json"
```

---

## 🎓 Training & Usage

### User Training

#### Admin Training
1. **Access admin panel**: http://localhost:8000/admin
2. **Manage users**: Create, update, deactivate users
3. **Monitor system**: Check performance metrics
4. **Configure settings**: Update system parameters

#### End User Training
1. **Upload documents**: Drag and drop in web interface
2. **Ask questions**: Use natural language queries
3. **Review answers**: Check confidence scores and sources
4. **Export results**: Download query results

### API Usage Examples

#### Python Client
```python
import requests

# Upload document
with open('document.pdf', 'rb') as f:
    response = requests.post('http://localhost:8000/api/v1/documents/upload', 
                           files={'file': f}, 
                           data={'tenant_id': 'default'})

# Query document
response = requests.post('http://localhost:8000/api/v1/query',
                        json={'query': 'What is the main topic?', 
                             'tenant_id': 'default'})
print(response.json()['answer'])
```

#### JavaScript Client
```javascript
// Upload document
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('tenant_id', 'default');

const uploadResponse = await fetch('/api/v1/documents/upload', {
  method: 'POST',
  body: formData
});

// Query document
const queryResponse = await fetch('/api/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What is the main topic?',
    tenant_id: 'default'
  })
});
```

---

## 🔐 Security Checklist

### Pre-Production Security

- [ ] **Change default passwords** in .env file
- [ ] **Generate unique secret keys** for JWT and CSRF
- [ ] **Enable HTTPS** with proper SSL certificates  
- [ ] **Configure firewall** rules for production
- [ ] **Set up backup encryption**
- [ ] **Enable audit logging**
- [ ] **Test data deletion** procedures
- [ ] **Validate Swiss compliance** settings

### Swiss Compliance Checklist

- [ ] **Data residency**: All data in Switzerland
- [ ] **FADP compliance**: Data protection measures
- [ ] **Audit logging**: Complete activity logs
- [ ] **Right to deletion**: User data removal
- [ ] **Data portability**: Export capabilities
- [ ] **Consent management**: User permissions
- [ ] **Breach notification**: Alert procedures

---

## 🎯 Success Metrics

### Performance Targets
- **Query Response Time**: < 1 second (95th percentile)
- **Document Upload**: < 30 seconds for 10MB files
- **System Uptime**: > 99.9%
- **Confidence Score**: > 85% average

### User Experience
- **Website Load Time**: < 3 seconds
- **Mobile Responsiveness**: 100% compatibility
- **Accessibility**: WCAG 2.1 AA compliance
- **Language Support**: German/English complete

### Business Metrics
- **Swiss Market Focus**: 100% compliant
- **Enterprise Features**: Full feature set
- **Security Rating**: Zero critical vulnerabilities
- **Documentation**: Complete and up-to-date

---

## 📞 Support

### Getting Help

#### Documentation
- **Setup Guide**: This document
- **API Reference**: http://localhost:8000/docs
- **User Manual**: `/docs/USER_GUIDE.md`
- **Admin Guide**: `/docs/ADMIN_GUIDE.md`

#### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community Q&A and tips
- **Wiki**: Additional guides and examples
- **Swiss Community**: Local user group and events

#### Professional Support
- **Implementation Services**: Setup and customization
- **Training Programs**: User and admin training
- **Compliance Consulting**: Swiss law expertise
- **24/7 Support**: Enterprise support packages

---

## 🎉 Congratulations!

**You now have ProjektSusui fully operational!**

### Next Steps:
1. **Upload your first document** via the web interface
2. **Ask questions** and see the AI responses
3. **Explore the admin panel** for system management
4. **Check the API documentation** for integration
5. **Join the Swiss community** for ongoing support

### Success Indicators:
- ✅ All Docker containers running
- ✅ Website accessible at http://localhost:3000
- ✅ API responding at http://localhost:8000
- ✅ Document upload and query working
- ✅ Swiss compliance features enabled

**Welcome to the future of Swiss AI document intelligence!** 🇨🇭🤖