# Docker Deployment Cycle for ProjektSusui RAG System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Development Cycle](#development-cycle)
3. [Testing Cycle](#testing-cycle)
4. [Staging Cycle](#staging-cycle)
5. [Production Cycle](#production-cycle)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements
```bash
# Check Docker version (required: 20.10+)
docker --version

# Check Docker Compose version (required: 2.0+)
docker-compose --version

# Install if missing
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd ProjektSusui/ProjectSusi-main

# Create secure environment configuration
./scripts/generate-secrets.sh  # Create this script first
```

## Development Cycle

### 1. Environment Preparation
```bash
# Create development environment file
cat > .env.development <<EOF
# Application Settings
RAG_ENV=development
RAG_DEBUG=true
RAG_LOG_LEVEL=debug
RAG_HOST=0.0.0.0
RAG_PORT=8000

# Database
DATABASE_URL=postgresql://raguser:devpass123@postgres:5432/ragdb_dev
REDIS_URL=redis://redis:6379/0

# Security (generate these!)
JWT_SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Ollama
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2:1b

# Development Features
HOT_RELOAD=true
PROFILING_ENABLED=true
EOF
```

### 2. Build Development Images
```bash
# Create optimized Dockerfile for development
cat > Dockerfile.dev <<'DOCKERFILE'
# Multi-stage build for development
FROM python:3.11-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim

# Security: Run as non-root user
RUN useradd -m -u 1000 raguser && \
    mkdir -p /app/data /app/logs && \
    chown -R raguser:raguser /app

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=raguser:raguser /root/.local /home/raguser/.local

# Copy application code
COPY --chown=raguser:raguser . .

# Switch to non-root user
USER raguser

# Add local bin to PATH
ENV PATH=/home/raguser/.local/bin:$PATH

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "core.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
DOCKERFILE

# Build development image
docker build -f Dockerfile.dev -t projektSusui-rag:dev .
```

### 3. Development Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  rag-api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    image: projektSusui-rag:dev
    container_name: rag-api-dev
    env_file: .env.development
    ports:
      - "8000:8000"
    volumes:
      - ./core:/app/core:ro  # Read-only for security
      - ./config:/app/config:ro
      - ./tests:/app/tests:ro
      - rag-data-dev:/app/data
      - rag-logs-dev:/app/logs
    networks:
      - rag-network-dev
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  postgres:
    image: postgres:15-alpine
    container_name: rag-postgres-dev
    environment:
      POSTGRES_USER: raguser
      POSTGRES_PASSWORD: devpass123
      POSTGRES_DB: ragdb_dev
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "5432:5432"  # Only for development
    volumes:
      - postgres-data-dev:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - rag-network-dev
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U raguser -d ragdb_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: rag-redis-dev
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"  # Only for development
    volumes:
      - redis-data-dev:/data
    networks:
      - rag-network-dev
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: rag-nginx-dev
    volumes:
      - ./nginx/nginx.dev.conf:/etc/nginx/nginx.conf:ro
      - ./static:/usr/share/nginx/html/static:ro
    ports:
      - "80:80"
    networks:
      - rag-network-dev
    depends_on:
      - rag-api
    restart: unless-stopped

volumes:
  postgres-data-dev:
  redis-data-dev:
  rag-data-dev:
  rag-logs-dev:

networks:
  rag-network-dev:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 4. Start Development Environment
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access shell for debugging
docker exec -it rag-api-dev bash

# Run development tests
docker exec rag-api-dev pytest tests/ -v
```

## Testing Cycle

### 1. Build Test Environment
```bash
# docker-compose.test.yml
cat > docker-compose.test.yml <<'YAML'
version: '3.8'

services:
  rag-api-test:
    build:
      context: .
      dockerfile: Dockerfile.test
      target: test
    image: projektSusui-rag:test
    container_name: rag-api-test
    environment:
      RAG_ENV: test
      DATABASE_URL: postgresql://testuser:testpass@postgres-test:5432/ragdb_test
      REDIS_URL: redis://redis-test:6379/0
      COVERAGE: "true"
    volumes:
      - ./coverage:/app/coverage
    networks:
      - rag-network-test
    depends_on:
      - postgres-test
      - redis-test
    command: |
      sh -c "
        pytest tests/ -v --cov=core --cov-report=html:/app/coverage --cov-report=term
      "

  postgres-test:
    image: postgres:15-alpine
    container_name: rag-postgres-test
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: ragdb_test
    networks:
      - rag-network-test
    tmpfs:
      - /var/lib/postgresql/data  # Use tmpfs for faster tests

  redis-test:
    image: redis:7-alpine
    container_name: rag-redis-test
    networks:
      - rag-network-test
    tmpfs:
      - /data

networks:
  rag-network-test:
    driver: bridge
YAML

# Run tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
docker-compose -f docker-compose.test.yml down -v
```

### 2. Security Scanning
```bash
# Create security scanning script
cat > scripts/security-scan.sh <<'SCRIPT'
#!/bin/bash
set -e

echo "🔒 Running Security Scans..."

# Scan Docker images for vulnerabilities
echo "📦 Scanning Docker images..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image projektSusui-rag:dev

# Scan Python dependencies
echo "🐍 Scanning Python dependencies..."
docker run --rm -v $(pwd):/app \
  pyupio/safety safety check --file /app/requirements.txt

# Static code analysis
echo "📝 Running static analysis..."
docker run --rm -v $(pwd):/app \
  python:3.11-slim sh -c "
    pip install bandit flake8 mypy &&
    bandit -r /app/core -f json -o /app/bandit-report.json &&
    flake8 /app/core --output-file=/app/flake8-report.txt &&
    mypy /app/core --html-report /app/mypy-report
  "

echo "✅ Security scans complete!"
SCRIPT

chmod +x scripts/security-scan.sh
./scripts/security-scan.sh
```

## Staging Cycle

### 1. Build Staging Images
```bash
# Dockerfile.staging - Optimized multi-stage build
cat > Dockerfile.staging <<'DOCKERFILE'
# Build stage
FROM python:3.11-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim

# Install security updates
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      curl \
      ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 -s /bin/bash raguser && \
    mkdir -p /app/data /app/logs && \
    chown -R raguser:raguser /app

WORKDIR /app

# Copy dependencies
COPY --from=builder --chown=raguser:raguser /root/.local /home/raguser/.local

# Copy application
COPY --chown=raguser:raguser . .

# Security hardening
RUN chmod -R 755 /app && \
    find /app -type f -name "*.py" -exec chmod 644 {} \;

USER raguser
ENV PATH=/home/raguser/.local/bin:$PATH

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["gunicorn", "core.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
DOCKERFILE

# Build staging image
docker build -f Dockerfile.staging -t projektSusui-rag:staging .
```

### 2. Staging Deployment
```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  rag-api:
    image: projektSusui-rag:staging
    container_name: rag-api-staging
    env_file: .env.staging
    networks:
      - rag-network-staging
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  postgres:
    image: postgres:15-alpine
    container_name: rag-postgres-staging
    env_file: .env.staging
    volumes:
      - postgres-data-staging:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - rag-network-staging
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      placement:
        constraints:
          - node.role == manager

  redis:
    image: redis:7-alpine
    container_name: rag-redis-staging
    command: >
      redis-server
      --appendonly yes
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --requirepass $${REDIS_PASSWORD}
    env_file: .env.staging
    volumes:
      - redis-data-staging:/data
    networks:
      - rag-network-staging
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: rag-nginx-staging
    volumes:
      - ./nginx/nginx.staging.conf:/etc/nginx/nginx.conf:ro
      - ./static:/usr/share/nginx/html/static:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "443:443"
      - "80:80"
    networks:
      - rag-network-staging
    depends_on:
      - rag-api
    deploy:
      replicas: 2

volumes:
  postgres-data-staging:
    driver: local
  redis-data-staging:
    driver: local

networks:
  rag-network-staging:
    driver: overlay
    attachable: true
    encrypted: true
```

## Production Cycle

### 1. Production Build
```bash
# Dockerfile.production - Hardened production image
cat > Dockerfile.production <<'DOCKERFILE'
# Build stage
FROM python:3.11-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Security scanner stage
FROM aquasec/trivy:latest as scanner
COPY --from=builder /root/.local /scan
RUN trivy fs /scan --exit-code 1 --severity HIGH,CRITICAL

# Runtime stage
FROM python:3.11-slim

# Install security updates only
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create non-root user with specific UID
RUN groupadd -g 1000 raggroup && \
    useradd -m -u 1000 -g raggroup -s /sbin/nologin raguser

# Set up application directory
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=raguser:raggroup /root/.local /home/raguser/.local

# Copy application code
COPY --chown=raguser:raggroup . .

# Remove unnecessary files
RUN find . -type f -name "*.pyc" -delete && \
    find . -type d -name "__pycache__" -delete && \
    find . -type f -name "*.md" -delete && \
    find . -type f -name "*.txt" ! -name "requirements.txt" -delete && \
    rm -rf tests/ scripts/ .git/ .github/

# Set strict permissions
RUN chmod -R 550 /app && \
    chmod -R 770 /app/data /app/logs

# Security: Drop all capabilities
USER raguser
ENV PATH=/home/raguser/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

EXPOSE 8000

# Run with production server
CMD ["gunicorn", "core.main:app", \
     "-w", "4", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "50"]
DOCKERFILE

# Build and scan production image
docker build -f Dockerfile.production -t projektSusui-rag:production .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image projektSusui-rag:production
```

### 2. Production Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  rag-api:
    image: projektSusui-rag:production
    container_name: rag-api-prod
    env_file: .env.production
    networks:
      - rag-network-prod
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 30s
        failure_action: rollback
        monitor: 60s
        max_failure_ratio: 0.3
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3
        window: 120s
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 2G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=rag-api"
    security_opt:
      - no-new-privileges:true
      - seccomp:unconfined
    read_only: true
    tmpfs:
      - /tmp
      - /var/run

  postgres:
    image: postgres:15-alpine
    container_name: rag-postgres-prod
    env_file: .env.production
    volumes:
      - postgres-data-prod:/var/lib/postgresql/data
      - ./backups:/backups:rw
    networks:
      - rag-network-prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      placement:
        constraints:
          - node.labels.db == true
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
    security_opt:
      - no-new-privileges:true

  redis:
    image: redis:7-alpine
    container_name: rag-redis-prod
    command: >
      redis-server
      --appendonly yes
      --maxmemory 1gb
      --maxmemory-policy allkeys-lru
      --requirepass $${REDIS_PASSWORD}
      --tcp-keepalive 60
      --tcp-backlog 511
      --bind 0.0.0.0
      --protected-mode yes
    env_file: .env.production
    volumes:
      - redis-data-prod:/data
    networks:
      - rag-network-prod
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    security_opt:
      - no-new-privileges:true

  nginx:
    image: nginx:alpine
    container_name: rag-nginx-prod
    volumes:
      - ./nginx/nginx.production.conf:/etc/nginx/nginx.conf:ro
      - ./static:/usr/share/nginx/html/static:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    ports:
      - "443:443"
      - "80:80"
    networks:
      - rag-network-prod
    depends_on:
      - rag-api
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    security_opt:
      - no-new-privileges:true

  # Monitoring stack
  prometheus:
    image: prom/prometheus:latest
    container_name: rag-prometheus-prod
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - rag-network-prod
    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: '1'
          memory: 1G

  grafana:
    image: grafana/grafana:latest
    container_name: rag-grafana-prod
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=$${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=redis-datasource
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    networks:
      - rag-network-prod
    depends_on:
      - prometheus
    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: '1'
          memory: 512M

volumes:
  postgres-data-prod:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/postgres
  redis-data-prod:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/redis
  nginx-cache:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local

networks:
  rag-network-prod:
    driver: overlay
    attachable: true
    encrypted: true
    ipam:
      config:
        - subnet: 10.0.0.0/24
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/docker-deploy.yml
name: Docker Deployment Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [created]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          pytest tests/ --cov=core --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.production
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment"
          # Add actual deployment commands here

  deploy-production:
    needs: build-and-push
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment"
          # Add actual deployment commands here
```

## Monitoring & Maintenance

### 1. Health Monitoring Script
```bash
#!/bin/bash
# scripts/health-check.sh

set -e

echo "🏥 Running Health Checks..."

# Check API health
API_HEALTH=$(curl -s http://localhost:8000/health | jq -r '.status')
if [ "$API_HEALTH" != "healthy" ]; then
    echo "❌ API is unhealthy: $API_HEALTH"
    exit 1
fi

# Check database connection
DB_HEALTH=$(docker exec rag-postgres-prod pg_isready -U raguser -d ragdb | grep -c "accepting connections")
if [ "$DB_HEALTH" -ne 1 ]; then
    echo "❌ Database is not accepting connections"
    exit 1
fi

# Check Redis
REDIS_HEALTH=$(docker exec rag-redis-prod redis-cli ping)
if [ "$REDIS_HEALTH" != "PONG" ]; then
    echo "❌ Redis is not responding"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print int($5)}')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  Disk usage is above 80%: ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEM_USAGE" -gt 80 ]; then
    echo "⚠️  Memory usage is above 80%: ${MEM_USAGE}%"
fi

echo "✅ All health checks passed!"
```

### 2. Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Starting backup..."

# Backup database
docker exec rag-postgres-prod pg_dump -U raguser ragdb | gzip > "$BACKUP_DIR/database.sql.gz"

# Backup Redis
docker exec rag-redis-prod redis-cli --rdb /data/dump.rdb
docker cp rag-redis-prod:/data/dump.rdb "$BACKUP_DIR/redis.rdb"

# Backup application data
docker cp rag-api-prod:/app/data "$BACKUP_DIR/app-data"

# Backup configurations
cp .env.production "$BACKUP_DIR/"
cp docker-compose.production.yml "$BACKUP_DIR/"

# Create checksum
find "$BACKUP_DIR" -type f -exec sha256sum {} \; > "$BACKUP_DIR/checksums.txt"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"
rm -rf "$BACKUP_DIR"

echo "✅ Backup complete: $BACKUP_DIR.tar.gz"

# Clean old backups (keep last 30 days)
find /backups -name "*.tar.gz" -mtime +30 -delete
```

## Rollback Procedures

### 1. Quick Rollback
```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=${1:-"latest-stable"}

echo "🔄 Rolling back to version: $PREVIOUS_VERSION"

# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Pull previous version
docker pull projektSusui-rag:$PREVIOUS_VERSION

# Update tag
docker tag projektSusui-rag:$PREVIOUS_VERSION projektSusui-rag:production

# Restart with previous version
docker-compose -f docker-compose.production.yml up -d

# Verify rollback
sleep 10
./scripts/health-check.sh

echo "✅ Rollback complete!"
```

### 2. Database Rollback
```bash
#!/bin/bash
# scripts/restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

echo "⚠️  WARNING: This will restore the database from backup!"
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop API to prevent writes
    docker-compose -f docker-compose.production.yml stop rag-api
    
    # Restore database
    gunzip < "$BACKUP_FILE" | docker exec -i rag-postgres-prod psql -U raguser ragdb
    
    # Restart API
    docker-compose -f docker-compose.production.yml start rag-api
    
    echo "✅ Database restored!"
else
    echo "❌ Restore cancelled"
fi
```

## Deployment Commands Summary

```bash
# Development
make dev-start    # Start development environment
make dev-stop     # Stop development environment
make dev-logs     # View development logs
make dev-test     # Run tests in development

# Staging
make staging-deploy    # Deploy to staging
make staging-rollback  # Rollback staging
make staging-backup    # Backup staging

# Production
make prod-deploy       # Deploy to production
make prod-rollback     # Rollback production
make prod-backup       # Create production backup
make prod-restore      # Restore from backup
make prod-health       # Check production health
make prod-scale n=5    # Scale to n replicas

# Monitoring
make monitor-start     # Start monitoring stack
make monitor-stop      # Stop monitoring stack
make metrics           # View current metrics
make alerts            # View active alerts

# Maintenance
make cleanup           # Clean unused resources
make update-secrets    # Rotate secrets
make security-scan     # Run security audit
make performance-test  # Run performance tests
```

## Security Checklist

- [ ] All secrets are stored in environment variables or secret management
- [ ] Images are scanned for vulnerabilities
- [ ] Containers run as non-root users
- [ ] Network segmentation is implemented
- [ ] TLS/SSL certificates are valid and up-to-date
- [ ] Database connections are encrypted
- [ ] Logs are centralized and monitored
- [ ] Backup encryption is enabled
- [ ] Rate limiting is configured
- [ ] CORS policies are properly set
- [ ] Security headers are configured in Nginx
- [ ] Container resource limits are set
- [ ] Health checks are implemented
- [ ] Automatic rollback is configured
- [ ] Audit logging is enabled

## Performance Optimization

1. **Image Optimization**
   - Multi-stage builds to reduce size
   - Layer caching for faster builds
   - Minimal base images (alpine)

2. **Resource Management**
   - CPU and memory limits
   - Horizontal scaling with replicas
   - Connection pooling for databases

3. **Caching Strategy**
   - Redis for session and query caching
   - Nginx caching for static assets
   - Docker layer caching in CI/CD

4. **Network Optimization**
   - Keep services in same network
   - Use internal DNS names
   - Enable compression in Nginx

## Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**
   ```bash
   docker logs rag-api-prod
   docker inspect rag-api-prod
   ```

2. **Database connection issues**
   ```bash
   docker exec rag-postgres-prod pg_isready
   docker network inspect rag-network-prod
   ```

3. **High memory usage**
   ```bash
   docker stats
   docker system prune -a
   ```

4. **Slow performance**
   ```bash
   docker exec rag-api-prod python -m cProfile -o profile.stats core/main.py
   ```

5. **SSL certificate issues**
   ```bash
   docker exec rag-nginx-prod nginx -t
   openssl s_client -connect localhost:443
   ```

This comprehensive Docker deployment cycle provides a complete workflow from development through production, with proper security, monitoring, and rollback procedures.