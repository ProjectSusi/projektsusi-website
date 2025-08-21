# Production Deployment Guide - ProjektSusui RAG System

## 🚨 PRE-DEPLOYMENT SECURITY CHECKLIST

### Critical Security Fixes Required
- [x] Fixed password verification salt bug (auth_service.py:542-563)
- [ ] Remove hardcoded SECRET_KEY default (config/config.py:29)
- [ ] Make JWT_SECRET_KEY mandatory (auth_service.py:70)
- [ ] Fix database encryption salt (encryption.py:172)
- [ ] Implement token revocation with Redis
- [ ] Add rate limiting middleware
- [ ] Sanitize error messages

## 🔧 SYSTEM REQUIREMENTS

### Minimum Hardware
- **CPU**: 4 cores (8 recommended)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 50GB SSD (100GB recommended)
- **Network**: 100 Mbps

### Software Requirements
- **OS**: Ubuntu 20.04+ / RHEL 8+
- **Python**: 3.10+
- **Docker**: 20.10+
- **PostgreSQL**: 13+
- **Redis**: 6.2+
- **Nginx**: 1.18+
- **Ollama**: Latest

## 📦 INSTALLATION STEPS

### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3-pip python3-venv \
    postgresql postgresql-contrib redis-server nginx \
    git curl wget build-essential

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Database Setup
```bash
# PostgreSQL setup
sudo -u postgres psql <<EOF
CREATE DATABASE projektsusui;
CREATE USER projektsusui WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE projektsusui TO projektsusui;
EOF

# Enable extensions
sudo -u postgres psql -d projektsusui <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOF
```

### 3. Redis Configuration
```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Add these settings:
maxmemory 2gb
maxmemory-policy allkeys-lru
requirepass your_redis_password
bind 127.0.0.1
protected-mode yes

# Restart Redis
sudo systemctl restart redis-server
```

### 4. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/projektsusui.git
cd projektsusui

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn uvicorn[standard]

# Create data directories
mkdir -p data/uploads data/embeddings data/logs data/backup
chmod 750 data/*
```

### 5. Environment Configuration
```bash
# Create production .env file
cat > .env.production <<EOF
# SECURITY - CRITICAL: Generate unique values!
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 64)
DATABASE_ENCRYPTION_KEY=$(openssl rand -hex 32)
ENCRYPTION_SALT=$(openssl rand -hex 16)

# Database
DATABASE_URL=postgresql://projektsusui:your_secure_password@localhost/projektsusui
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40

# Redis
REDIS_URL=redis://:your_redis_password@localhost:6379/0
REDIS_MAX_CONNECTIONS=50

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
WORKERS=4
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral:latest
OLLAMA_TIMEOUT=180

# Security Settings
ENFORCE_HTTPS=true
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=60
MAX_UPLOAD_SIZE_MB=50
ALLOWED_FILE_TYPES=pdf,docx,txt,csv

# Monitoring
ENABLE_METRICS=true
ENABLE_AUDIT_LOGGING=true
LOG_LEVEL=INFO
SENTRY_DSN=your_sentry_dsn

# Performance
ENABLE_CACHING=true
CACHE_TTL_SECONDS=3600
VECTOR_SEARCH_CACHE_SIZE=1000
CONNECTION_POOL_SIZE=10

# Compliance
DATA_RESIDENCY_REGION=CH
ENABLE_GDPR_COMPLIANCE=true
DATA_RETENTION_DAYS=365
EOF

# Set permissions
chmod 600 .env.production
```

### 6. Systemd Service Setup
```bash
# Create service file
sudo tee /etc/systemd/system/projektsusui.service <<EOF
[Unit]
Description=ProjektSusui RAG System
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/opt/projektsusui
Environment="PATH=/opt/projektsusui/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=/opt/projektsusui/.env.production
ExecStart=/opt/projektsusui/venv/bin/gunicorn \
    -k uvicorn.workers.UvicornWorker \
    -w 4 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --graceful-timeout 30 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --access-logfile /var/log/projektsusui/access.log \
    --error-logfile /var/log/projektsusui/error.log \
    core.main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable projektsusui
sudo systemctl start projektsusui
```

### 7. Nginx Configuration
```nginx
# /etc/nginx/sites-available/projektsusui
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # File Upload Limits
    client_max_body_size 50M;
    client_body_timeout 60s;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }

    # Static Files
    location /static {
        alias /opt/projektsusui/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }

    # Metrics (restrict access)
    location /metrics {
        proxy_pass http://127.0.0.1:8000/metrics;
        allow 10.0.0.0/8;
        deny all;
    }
}
```

### 8. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 9. Firewall Configuration
```bash
# UFW setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 10. Monitoring Setup
```bash
# Install Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvf prometheus-2.45.0.linux-amd64.tar.gz
sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus

# Configure Prometheus
cat > /opt/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'projektsusui'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
EOF

# Install Grafana
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana

# Start services
sudo systemctl enable prometheus grafana-server
sudo systemctl start prometheus grafana-server
```

## 🔍 POST-DEPLOYMENT VERIFICATION

### Health Checks
```bash
# API health
curl https://yourdomain.com/health

# Database connectivity
psql -U projektsusui -d projektsusui -c "SELECT 1;"

# Redis connectivity
redis-cli -a your_redis_password ping

# Ollama status
curl http://localhost:11434/api/tags

# Service status
sudo systemctl status projektsusui
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis
```

### Security Scan
```bash
# Install security tools
pip install bandit safety

# Run security scan
bandit -r core/ -f json -o security_report.json
safety check --json

# Check SSL
curl -I https://yourdomain.com
nmap --script ssl-enum-ciphers -p 443 yourdomain.com
```

### Performance Testing
```bash
# Install locust
pip install locust

# Run load test
locust -f tests/performance/locustfile.py \
    --host=https://yourdomain.com \
    --users=100 \
    --spawn-rate=10
```

## 🔄 BACKUP & RECOVERY

### Automated Backups
```bash
# Create backup script
cat > /opt/projektsusui/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backup/projektsusui"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -U projektsusui projektsusui | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# File backup
tar czf "$BACKUP_DIR/files_$DATE.tar.gz" /opt/projektsusui/data/

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 sync "$BACKUP_DIR" s3://your-bucket/backups/
EOF

chmod +x /opt/projektsusui/backup.sh

# Add to crontab
echo "0 2 * * * /opt/projektsusui/backup.sh" | sudo crontab -
```

### Disaster Recovery
```bash
# Restore database
gunzip < backup.sql.gz | psql -U projektsusui projektsusui

# Restore files
tar xzf files_backup.tar.gz -C /
```

## 📊 MONITORING ALERTS

### Critical Alerts to Configure
1. **API Response Time** > 2 seconds
2. **Error Rate** > 1%
3. **CPU Usage** > 80%
4. **Memory Usage** > 90%
5. **Disk Usage** > 85%
6. **Database Connections** > 80% of pool
7. **Redis Memory** > 90%
8. **SSL Certificate Expiry** < 30 days

### Alert Configuration (Prometheus)
```yaml
groups:
  - name: projektsusui
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.99"} > 2
        for: 5m
        annotations:
          summary: "High API response time"
          
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High error rate detected"
```

## 🚀 SCALING GUIDELINES

### Horizontal Scaling
```bash
# Add more workers
WORKERS=8  # in .env.production

# Multiple instances behind load balancer
upstream projektsusui {
    least_conn;
    server 127.0.0.1:8000 weight=1;
    server 127.0.0.1:8001 weight=1;
    server 127.0.0.1:8002 weight=1;
}
```

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_chunks_document_id ON chunks(document_id);
CREATE INDEX idx_embeddings_chunk_id ON embeddings(chunk_id);

-- Analyze tables
ANALYZE documents;
ANALYZE chunks;
ANALYZE embeddings;
```

## 🔐 SECURITY HARDENING

### Additional Security Measures
1. **Enable SELinux/AppArmor**
2. **Configure fail2ban**
3. **Implement IP whitelisting**
4. **Setup VPN for admin access**
5. **Enable audit logging**
6. **Regular security updates**
7. **Penetration testing quarterly**

## 📝 MAINTENANCE PROCEDURES

### Daily Tasks
- Monitor error logs
- Check disk space
- Verify backups

### Weekly Tasks
- Update dependencies
- Review security alerts
- Performance analysis

### Monthly Tasks
- Security patches
- Database optimization
- Certificate renewal check
- Disaster recovery test

## 🆘 TROUBLESHOOTING

### Common Issues

#### High Memory Usage
```bash
# Check memory consumers
ps aux | sort -nrk 4 | head
# Restart service
sudo systemctl restart projektsusui
```

#### Slow Queries
```bash
# Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

#### Connection Errors
```bash
# Check connection pool
netstat -an | grep 5432 | wc -l
# Increase pool size in .env
DATABASE_POOL_SIZE=40
```

## 📞 SUPPORT CONTACTS

- **Security Issues**: security@yourdomain.com
- **System Admin**: admin@yourdomain.com
- **On-Call**: +41-XX-XXX-XXXX
- **Escalation**: management@yourdomain.com

## ✅ DEPLOYMENT CHECKLIST

- [ ] All security fixes applied
- [ ] Environment variables set
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Load testing passed
- [ ] Security scan clean
- [ ] Documentation updated
- [ ] Team trained
- [ ] Incident response plan ready
- [ ] Compliance verified