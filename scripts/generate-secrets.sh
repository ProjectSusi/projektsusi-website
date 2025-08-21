#!/bin/bash

# Generate Secure Secrets for ProjektSusui RAG System
# This script generates cryptographically secure secrets for all environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}    ProjektSusui RAG System - Secret Generator    ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Function to generate secure random string
generate_secret() {
    local length=${1:-32}
    openssl rand -hex $length
}

# Function to generate secure password
generate_password() {
    local length=${1:-16}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Check if openssl is installed
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}Error: openssl is not installed${NC}"
    echo "Please install openssl: apt-get install openssl"
    exit 1
fi

# Create backup of existing .env files if they exist
if [ -f .env ]; then
    echo -e "${YELLOW}Backing up existing .env to .env.backup.$(date +%Y%m%d_%H%M%S)${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Generate secrets
echo -e "${GREEN}Generating secure secrets...${NC}"

JWT_SECRET=$(generate_secret 32)
ENCRYPTION_KEY=$(generate_secret 32)
SECRET_KEY=$(generate_secret 32)
POSTGRES_PASSWORD=$(generate_password 20)
REDIS_PASSWORD=$(generate_password 20)
GRAFANA_PASSWORD=$(generate_password 16)
ADMIN_PASSWORD=$(generate_password 16)
API_KEY=$(generate_secret 24)
CSRF_TOKEN=$(generate_secret 24)

# Create .env.example with placeholders
cat > .env.example <<EOF
# ProjektSusui RAG System - Environment Configuration Template
# Copy this file to .env and replace with actual values
# Generated: $(date)

# ==============================================================================
# APPLICATION SETTINGS
# ==============================================================================
RAG_ENV=development
RAG_DEBUG=false
RAG_LOG_LEVEL=info
RAG_HOST=0.0.0.0
RAG_PORT=8000

# ==============================================================================
# SECURITY KEYS (CHANGE ALL OF THESE!)
# ==============================================================================
JWT_SECRET_KEY=CHANGE_THIS_JWT_SECRET_KEY
ENCRYPTION_KEY=CHANGE_THIS_ENCRYPTION_KEY
SECRET_KEY=CHANGE_THIS_SECRET_KEY
API_KEY=CHANGE_THIS_API_KEY
CSRF_TOKEN_SECRET=CHANGE_THIS_CSRF_TOKEN

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
DATABASE_URL=postgresql://raguser:CHANGE_THIS_PASSWORD@postgres:5432/ragdb
POSTGRES_USER=raguser
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=ragdb
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# ==============================================================================
# REDIS CONFIGURATION
# ==============================================================================
REDIS_URL=redis://:CHANGE_THIS_PASSWORD@redis:6379/0
REDIS_PASSWORD=CHANGE_THIS_PASSWORD
REDIS_HOST=redis
REDIS_PORT=6379

# ==============================================================================
# OLLAMA CONFIGURATION
# ==============================================================================
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_TIMEOUT=120
OLLAMA_NUM_PARALLEL=2

# ==============================================================================
# RAG SETTINGS
# ==============================================================================
RAG_SIMILARITY_THRESHOLD=0.3
RAG_MAX_RESULTS=5
RAG_REQUIRE_SOURCES=true
RAG_MAX_QUERY_LENGTH=500
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200

# ==============================================================================
# MONITORING
# ==============================================================================
GRAFANA_ADMIN_PASSWORD=CHANGE_THIS_PASSWORD
PROMETHEUS_RETENTION_TIME=30d
METRICS_ENABLED=true

# ==============================================================================
# PERFORMANCE
# ==============================================================================
MAX_WORKERS=4
CONNECTION_POOL_SIZE=20
CACHE_TTL=3600
BATCH_SIZE=100
REQUEST_TIMEOUT=30

# ==============================================================================
# FILE UPLOAD
# ==============================================================================
MAX_UPLOAD_SIZE=52428800  # 50MB in bytes
ALLOWED_EXTENSIONS=pdf,docx,txt,csv,json,md
UPLOAD_PATH=/app/data/uploads

# ==============================================================================
# CORS SETTINGS
# ==============================================================================
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8001
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=*
EOF

# Create development environment file
cat > .env.development <<EOF
# ProjektSusui RAG System - Development Environment
# Generated: $(date)
# WARNING: These are development secrets. DO NOT use in production!

# ==============================================================================
# APPLICATION SETTINGS
# ==============================================================================
RAG_ENV=development
RAG_DEBUG=true
RAG_LOG_LEVEL=debug
RAG_HOST=0.0.0.0
RAG_PORT=8000

# ==============================================================================
# SECURITY KEYS (Development Only)
# ==============================================================================
JWT_SECRET_KEY=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
SECRET_KEY=${SECRET_KEY}
API_KEY=${API_KEY}
CSRF_TOKEN_SECRET=${CSRF_TOKEN}

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
DATABASE_URL=postgresql://raguser:${POSTGRES_PASSWORD}@postgres:5432/ragdb_dev
POSTGRES_USER=raguser
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=ragdb_dev
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# ==============================================================================
# REDIS CONFIGURATION
# ==============================================================================
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_HOST=redis
REDIS_PORT=6379

# ==============================================================================
# OLLAMA CONFIGURATION
# ==============================================================================
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_TIMEOUT=120
OLLAMA_NUM_PARALLEL=2

# ==============================================================================
# RAG SETTINGS
# ==============================================================================
RAG_SIMILARITY_THRESHOLD=0.3
RAG_MAX_RESULTS=5
RAG_REQUIRE_SOURCES=true
RAG_MAX_QUERY_LENGTH=500
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200

# ==============================================================================
# MONITORING
# ==============================================================================
GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
PROMETHEUS_RETENTION_TIME=7d
METRICS_ENABLED=true

# ==============================================================================
# PERFORMANCE
# ==============================================================================
MAX_WORKERS=2
CONNECTION_POOL_SIZE=10
CACHE_TTL=300
BATCH_SIZE=50
REQUEST_TIMEOUT=60
HOT_RELOAD=true
PROFILING_ENABLED=true

# ==============================================================================
# FILE UPLOAD
# ==============================================================================
MAX_UPLOAD_SIZE=104857600  # 100MB for development
ALLOWED_EXTENSIONS=pdf,docx,txt,csv,json,md,py,yml,yaml
UPLOAD_PATH=/app/data/uploads

# ==============================================================================
# CORS SETTINGS (Permissive for development)
# ==============================================================================
CORS_ORIGINS=*
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=*
CORS_ALLOW_HEADERS=*

# ==============================================================================
# ADMIN SETTINGS
# ==============================================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_EMAIL=admin@localhost
EOF

# Create production environment template
cat > .env.production.template <<EOF
# ProjektSusui RAG System - Production Environment Template
# Generated: $(date)
# IMPORTANT: Generate new secrets for production! Do not use development secrets!

# ==============================================================================
# APPLICATION SETTINGS
# ==============================================================================
RAG_ENV=production
RAG_DEBUG=false
RAG_LOG_LEVEL=warning
RAG_HOST=0.0.0.0
RAG_PORT=8000

# ==============================================================================
# SECURITY KEYS (MUST BE CHANGED FOR PRODUCTION!)
# ==============================================================================
JWT_SECRET_KEY=\${JWT_SECRET_KEY}
ENCRYPTION_KEY=\${ENCRYPTION_KEY}
SECRET_KEY=\${SECRET_KEY}
API_KEY=\${API_KEY}
CSRF_TOKEN_SECRET=\${CSRF_TOKEN_SECRET}

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@\${POSTGRES_HOST}:5432/\${POSTGRES_DB}
POSTGRES_USER=\${POSTGRES_USER}
POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
POSTGRES_DB=\${POSTGRES_DB}
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_SSL_MODE=require

# ==============================================================================
# REDIS CONFIGURATION
# ==============================================================================
REDIS_URL=redis://:\${REDIS_PASSWORD}@\${REDIS_HOST}:6379/0
REDIS_PASSWORD=\${REDIS_PASSWORD}
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_MAX_CONNECTIONS=50
REDIS_SSL=true

# ==============================================================================
# OLLAMA CONFIGURATION
# ==============================================================================
OLLAMA_HOST=\${OLLAMA_HOST}
OLLAMA_MODEL=mistral
OLLAMA_TIMEOUT=60
OLLAMA_NUM_PARALLEL=4

# ==============================================================================
# RAG SETTINGS
# ==============================================================================
RAG_SIMILARITY_THRESHOLD=0.4
RAG_MAX_RESULTS=10
RAG_REQUIRE_SOURCES=true
RAG_MAX_QUERY_LENGTH=1000
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200

# ==============================================================================
# MONITORING
# ==============================================================================
GRAFANA_ADMIN_PASSWORD=\${GRAFANA_ADMIN_PASSWORD}
PROMETHEUS_RETENTION_TIME=90d
METRICS_ENABLED=true
SENTRY_DSN=\${SENTRY_DSN}

# ==============================================================================
# PERFORMANCE
# ==============================================================================
MAX_WORKERS=8
CONNECTION_POOL_SIZE=50
CACHE_TTL=3600
BATCH_SIZE=100
REQUEST_TIMEOUT=30
GUNICORN_WORKERS=4
GUNICORN_THREADS=2

# ==============================================================================
# FILE UPLOAD
# ==============================================================================
MAX_UPLOAD_SIZE=52428800  # 50MB
ALLOWED_EXTENSIONS=pdf,docx,txt,csv
UPLOAD_PATH=/app/data/uploads
SCAN_UPLOADS=true

# ==============================================================================
# CORS SETTINGS (Restrict for production)
# ==============================================================================
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOW_HEADERS=Content-Type,Authorization

# ==============================================================================
# SSL/TLS
# ==============================================================================
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem
FORCE_HTTPS=true

# ==============================================================================
# RATE LIMITING
# ==============================================================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# ==============================================================================
# BACKUP
# ==============================================================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION=true
EOF

# Create secrets file for sensitive values
cat > .secrets <<EOF
# ProjektSusui RAG System - Generated Secrets
# Generated: $(date)
# IMPORTANT: Keep this file secure and never commit to version control!

JWT_SECRET_KEY=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
SECRET_KEY=${SECRET_KEY}
API_KEY=${API_KEY}
CSRF_TOKEN_SECRET=${CSRF_TOKEN}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
GRAFANA_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

# Set proper permissions
chmod 600 .secrets
chmod 644 .env.example .env.production.template
chmod 600 .env.development

# Add to .gitignore if not already present
if ! grep -q "^.env$" .gitignore 2>/dev/null; then
    echo -e "\n# Environment files" >> .gitignore
    echo ".env" >> .gitignore
    echo ".env.*" >> .gitignore
    echo "!.env.example" >> .gitignore
    echo "!.env.*.template" >> .gitignore
    echo ".secrets" >> .gitignore
    echo "*.backup.*" >> .gitignore
fi

# Summary
echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}           Secret Generation Complete!            ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}Generated files:${NC}"
echo "  - .env.example (template for reference)"
echo "  - .env.development (ready for development use)"
echo "  - .env.production.template (template for production)"
echo "  - .secrets (secure secrets - DO NOT COMMIT!)"
echo ""
echo -e "${YELLOW}Important Security Notes:${NC}"
echo "  1. The .secrets file contains sensitive data - keep it secure!"
echo "  2. Never commit .env or .secrets files to version control"
echo "  3. For production, generate NEW secrets - don't reuse development ones"
echo "  4. Store production secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Review .env.development for development"
echo "  2. Copy .env.development to .env to use with Docker"
echo "  3. For production, use .env.production.template and generate new secrets"
echo ""
echo -e "${BLUE}To use these secrets:${NC}"
echo "  cp .env.development .env"
echo "  docker-compose up -d"
echo ""