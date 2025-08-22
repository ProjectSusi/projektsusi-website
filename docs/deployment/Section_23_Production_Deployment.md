# Section 23: Production Deployment

## Overview

This section provides comprehensive guidance for deploying the RAG System to production environments using Docker and docker-compose. The deployment strategy includes containerization, environment management, SSL/TLS configuration, reverse proxy setup, monitoring integration, and backup procedures.

## 23.1 Docker Deployment with Docker Compose

### 23.1.1 Multi-Stage Dockerfile Architecture

The production deployment uses a multi-stage Dockerfile that optimizes for security, size, and performance:

```dockerfile
# Multi-stage Dockerfile for ProjektSusui RAG System

# Stage 1: Builder
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy requirements first for better caching
COPY simple_requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1000 raguser && \
    useradd -r -u 1000 -g raguser -m -s /bin/bash raguser && \
    mkdir -p /app/data /app/logs /app/uploads && \
    chown -R raguser:raguser /app

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder --chown=raguser:raguser /root/.local /home/raguser/.local

# Copy application code
COPY --chown=raguser:raguser . .

# Ensure scripts are executable
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Set Python path
ENV PATH=/home/raguser/.local/bin:$PATH \
    PYTHONPATH=/app:$PYTHONPATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Switch to non-root user
USER raguser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command - can be overridden
CMD ["python", "run_core.py"]
```

### 23.1.2 Production Docker Compose Configuration

The production docker-compose.yml includes all services with production-ready configurations:

```yaml
version: '3.8'

services:
  # Main RAG API Service
  rag-api:
    build:
      context: .
      dockerfile: Dockerfile
    image: projektsusui-rag:latest
    container_name: rag-api
    env_file:
      - .env
    environment:
      - PYTHONUNBUFFERED=1
      - USE_POSTGRESQL=true
      - DATABASE_URL=postgresql://${POSTGRES_USER:-raguser}:${POSTGRES_PASSWORD:-ragpass}@postgres:5432/${POSTGRES_DB:-ragdb}
      - REDIS_URL=redis://:${REDIS_PASSWORD:-redispass}@redis:6379/0
      - OLLAMA_HOST=http://10.0.0.59:11435
    entrypoint: ["/bin/bash", "-c", "find /app/config -type f -exec chmod 664 {} \\; 2>/dev/null || true; find /app/config -type d -exec chmod 755 {} \\; 2>/dev/null || true; python run_core.py"]
    ports:
      - "${RAG_PORT:-8000}:8000"
    networks:
      - rag-network
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config_new:/app/config
      - ./static:/app/static
      - ./templates:/app/templates
      - ./core:/app/core
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: rag-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-raguser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-ragpass}
      POSTGRES_DB: ${POSTGRES_DB:-ragdb}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
      - ./backups:/backups
    networks:
      - rag-network
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-raguser} -d ${POSTGRES_DB:-ragdb}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: rag-redis
    command: >
      redis-server
      --appendonly yes
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      ${REDIS_PASSWORD:+--requirepass ${REDIS_PASSWORD}}
    volumes:
      - redis-data:/data
    networks:
      - rag-network
    ports:
      - "${REDIS_PORT:-6379}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

networks:
  rag-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
```

### 23.1.3 Multi-Service Architecture

For larger deployments, the system supports a microservices architecture:

```yaml
# Extended microservices deployment
services:
  # API Gateway
  api-gateway:
    build: 
      context: ./services/api-gateway
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://raguser:${POSTGRES_PASSWORD}@postgres:5432/ragdb
      - QDRANT_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379/0
      - LLM_SERVICE_URL=http://ollama:11434
      - LLM_MODEL_NAME=${LLM_MODEL_NAME:-llama3.1:8b}
    volumes:
      - ./storage:/app/storage
      - ./logs:/app/logs
    depends_on:
      - postgres
      - qdrant
      - redis
      - ollama
    restart: unless-stopped

  # Document Processing Service
  document-processor:
    build:
      context: ./services/document-processor
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://raguser:${POSTGRES_PASSWORD}@postgres:5432/ragdb
      - QDRANT_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER=redis://redis:6379/0
      - EMBEDDING_MODEL=${EMBEDDING_MODEL:-sentence-transformers/all-mpnet-base-v2}
    volumes:
      - ./storage:/app/storage
      - ./models:/app/models
    depends_on:
      - postgres
      - qdrant
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  # Celery Worker for Background Tasks
  celery-worker:
    build:
      context: ./services/document-processor
      dockerfile: Dockerfile
    command: celery -A app.celery worker --loglevel=info --concurrency=4
    environment:
      - DATABASE_URL=postgresql://raguser:${POSTGRES_PASSWORD}@postgres:5432/ragdb
      - QDRANT_URL=http://qdrant:6333
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER=redis://redis:6379/0
    volumes:
      - ./storage:/app/storage
      - ./models:/app/models
    depends_on:
      - postgres
      - qdrant
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  # Qdrant Vector Database
  qdrant:
    image: qdrant/qdrant:v1.7.4
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__LOG_LEVEL=INFO
    restart: unless-stopped

  # Local LLM Service (Ollama)
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_HOST=0.0.0.0:11434
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## 23.2 Environment Configuration for Production

### 23.2.1 Production Environment Variables

Create a comprehensive `.env.production` file:

```bash
# Application Configuration
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=your-super-secure-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
USE_POSTGRESQL=true
POSTGRES_USER=raguser
POSTGRES_PASSWORD=secure-postgres-password
POSTGRES_DB=ragdb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://raguser:secure-postgres-password@postgres:5432/ragdb

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secure-redis-password
REDIS_URL=redis://:secure-redis-password@redis:6379/0

# Vector Database Configuration
QDRANT_URL=http://qdrant:6333
QDRANT_API_KEY=secure-qdrant-api-key

# LLM Configuration
OLLAMA_HOST=http://ollama:11434
LLM_MODEL_NAME=llama3.1:8b
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
EMBEDDING_DEVICE=cuda
MAX_TOKENS=2048
TEMPERATURE=0.7

# File Upload Configuration
UPLOAD_DIRECTORY=/app/storage/uploads
MAX_FILE_SIZE_MB=100
ALLOWED_EXTENSIONS=pdf,txt,docx,md

# Performance Configuration
WORKERS=4
WORKER_CONNECTIONS=1000
MAX_CONCURRENT_REQUESTS=100
CHUNK_SIZE=512
CHUNK_OVERLAP=50
EMBEDDING_BATCH_SIZE=32

# Security Configuration
CORS_ORIGINS=["https://your-domain.com"]
TRUSTED_HOSTS=["your-domain.com", "www.your-domain.com"]
CSRF_PROTECTION=true
RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=60

# Monitoring and Logging
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=secure-grafana-password
METRICS_ENABLED=true
LOG_FORMAT=json
LOG_RETENTION_DAYS=30

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# SSL/TLS Configuration
SSL_ENABLED=true
SSL_CERT_PATH=/etc/nginx/ssl/server.crt
SSL_KEY_PATH=/etc/nginx/ssl/server.key
FORCE_HTTPS=true

# External Services
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook-url
EMAIL_SMTP_HOST=smtp.your-email-provider.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your-email@domain.com
EMAIL_PASSWORD=your-email-password

# Health Check Configuration
HEALTH_CHECK_TIMEOUT=300
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=30
```

### 23.2.2 Environment-Specific Configuration Files

Create separate docker-compose override files for different environments:

**docker-compose.production.yml:**
```yaml
version: '3.8'

services:
  rag-api:
    environment:
      - ENVIRONMENT=production
      - DEBUG=false
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 2G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  postgres:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 2G
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  redis:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
    command: >
      redis-server
      --appendonly yes
      --maxmemory 768mb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
```

## 23.3 SSL/TLS Setup and Reverse Proxy Configuration

### 23.3.1 Nginx Reverse Proxy Configuration

The production deployment includes a comprehensive Nginx configuration:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log main;
    
    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/s;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
    
    # Hide nginx version
    server_tokens off;
    
    # Upstream servers
    upstream api_gateway {
        server rag-api:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # SSL/HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;
        
        # SSL configuration
        ssl_certificate /etc/nginx/ssl/server.crt;
        ssl_certificate_key /etc/nginx/ssl/server.key;
        
        # SSL security settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_session_tickets off;
        ssl_stapling on;
        ssl_stapling_verify on;
        
        # Security headers for HTTPS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://api_gateway;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # API-specific settings
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
            
            # CORS headers for API
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        }
        
        # Document upload endpoint
        location /api/v1/documents {
            limit_req zone=upload burst=10 nodelay;
            
            # Increase body size for document uploads
            client_max_body_size 500M;
            
            proxy_pass http://api_gateway;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Extended timeouts for large uploads
            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
            
            # Disable buffering for large uploads
            proxy_request_buffering off;
            proxy_buffering off;
        }
    }
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

### 23.3.2 SSL Certificate Generation

For production, use Let's Encrypt certificates:

```bash
#!/bin/bash
# SSL certificate generation script

# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal setup
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Copy certificates to Docker volume
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/server.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/server.key
sudo chmod 644 ./ssl/server.crt
sudo chmod 600 ./ssl/server.key
```

### 23.3.3 Docker Compose with Nginx

Complete Nginx integration:

```yaml
# Nginx Reverse Proxy
nginx:
  image: nginx:alpine
  container_name: rag-nginx
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/conf.d:/etc/nginx/conf.d:ro
    - ./static:/usr/share/nginx/html/static:ro
    - ./ssl:/etc/nginx/ssl:ro
    - nginx-cache:/var/cache/nginx
    - nginx-logs:/var/log/nginx
  ports:
    - "80:80"
    - "443:443"
  networks:
    - rag-network
  depends_on:
    - rag-api
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
  restart: unless-stopped
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 256M
```

## 23.4 Monitoring and Logging Setup

### 23.4.1 Prometheus Configuration

Production monitoring with Prometheus:

```yaml
# Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'rag-system'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Load rules once and periodically evaluate them
rule_files:
  - "alerts.yml"
  - "recording_rules.yml"

# Scrape configurations
scrape_configs:
  # RAG System API Gateway
  - job_name: 'rag-api-gateway'
    static_configs:
      - targets: ['rag-api:8000']
    scrape_interval: 15s
    metrics_path: /metrics
    scrape_timeout: 10s
    
  # PostgreSQL Database
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s
    metrics_path: /metrics
    
  # Redis Cache
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s
    metrics_path: /metrics
    
  # Node Exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 30s
```

### 23.4.2 Grafana Dashboard Configuration

```yaml
# Grafana for visualization
grafana:
  image: grafana/grafana:latest
  container_name: rag-grafana
  ports:
    - "3001:3000"
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    - GF_USERS_ALLOW_SIGN_UP=false
    - GF_INSTALL_PLUGINS=grafana-piechart-panel
  networks:
    - rag-network
  restart: unless-stopped
  depends_on:
    - prometheus
```

## 23.5 Backup and Disaster Recovery Procedures

### 23.5.1 Automated Backup System

The system includes a comprehensive backup service:

```python
# Key features of the backup system:
# - Automated database backups with SQLite consistency
# - Document storage backup
# - Configuration files backup
# - Vector index backup
# - Compressed backup archives
# - Retention policy management
# - Restore capabilities

# Backup configuration
BACKUP_CONFIG = {
    "backup_dir": "/app/backups",
    "retention_days": 30,
    "compress_backups": True,
    "schedule": "0 2 * * *",  # Daily at 2 AM
    "components": [
        "databases",
        "documents", 
        "configuration",
        "vector_indices"
    ]
}
```

### 23.5.2 Automated Deployment Script

The production deployment includes an advanced deployment script:

```bash
# Key features of deploy.sh:
# - Multi-environment support (development, staging, production)
# - Automated testing before deployment
# - Health checks and rollback capabilities
# - Parallel deployment options
# - Comprehensive logging
# - Slack notifications
# - Backup creation before deployment

# Usage examples:
./scripts/deploy.sh -e production -s all
./scripts/deploy.sh -e staging --skip-tests
./scripts/deploy.sh --rollback v1.2.3
./scripts/deploy.sh --dry-run -e production
```

### 23.5.3 Disaster Recovery Procedures

**Backup Verification:**
```bash
# Verify backup integrity
docker-compose exec rag-api python -c "
from core.services.backup_service import BackupService
backup_service = BackupService()
backups = await backup_service.list_backups()
print(f'Available backups: {len(backups)}')
"
```

**Full System Restore:**
```bash
# Stop services
docker-compose down

# Restore from backup
docker-compose exec rag-api python -c "
from core.services.backup_service import BackupService
backup_service = BackupService()
result = await backup_service.restore_backup('rag_backup_20241201_020000')
print(f'Restore result: {result}')
"

# Restart services
docker-compose up -d

# Verify system health
docker-compose exec rag-api curl -f http://localhost:8000/health
```

**Database Recovery:**
```bash
# PostgreSQL point-in-time recovery
docker-compose exec postgres pg_restore \
  --clean --if-exists --no-owner --no-privileges \
  --dbname=ragdb /backups/database_backup.sql

# Redis data recovery
docker-compose exec redis redis-cli --rdb /data/dump.rdb
```

This comprehensive production deployment guide provides all the necessary configurations and procedures for deploying the RAG System in a production environment with proper security, monitoring, and backup procedures.