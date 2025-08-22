# Section 24: Monitoring & Maintenance

## Overview

This section provides comprehensive guidance for monitoring system health, maintaining optimal performance, and ensuring reliable operation of the RAG System in production environments. It covers monitoring procedures, performance optimization, maintenance schedules, troubleshooting, and capacity planning.

## 24.1 System Health Monitoring Procedures

### 24.1.1 Multi-Layer Monitoring Architecture

The RAG System implements a comprehensive monitoring stack with multiple layers:

**Application Layer Monitoring:**
```python
# Built-in health check endpoints
@app.route('/health')
def health_check():
    """Comprehensive health check endpoint"""
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': app.config.get('VERSION', '1.0.0'),
        'components': {}
    }
    
    # Database connectivity
    try:
        db.session.execute('SELECT 1')
        health_status['components']['database'] = 'healthy'
    except Exception as e:
        health_status['components']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Redis connectivity
    try:
        redis_client.ping()
        health_status['components']['redis'] = 'healthy'
    except Exception as e:
        health_status['components']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Vector database connectivity
    try:
        qdrant_client.get_collections()
        health_status['components']['vector_db'] = 'healthy'
    except Exception as e:
        health_status['components']['vector_db'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # LLM service connectivity
    try:
        ollama_client.list_models()
        health_status['components']['llm_service'] = 'healthy'
    except Exception as e:
        health_status['components']['llm_service'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    return jsonify(health_status), 200 if health_status['status'] == 'healthy' else 503
```

**Infrastructure Layer Monitoring:**
```yaml
# Complete monitoring stack with Prometheus, Grafana, and AlertManager
version: '3.8'

services:
  # Prometheus metrics collection
  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: rag-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    networks:
      - rag-monitoring
    restart: unless-stopped

  # Grafana for visualization
  grafana:
    image: grafana/grafana:10.1.0
    container_name: rag-grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    networks:
      - rag-monitoring
    restart: unless-stopped

  # Node Exporter for system metrics
  node-exporter:
    image: prom/node-exporter:v1.6.1
    container_name: rag-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - rag-monitoring
    restart: unless-stopped

  # AlertManager for alerting
  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: rag-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    networks:
      - rag-monitoring
    restart: unless-stopped
```

### 24.1.2 Key Performance Indicators (KPIs)

**Application Performance Metrics:**
- Response time (p50, p95, p99)
- Request rate (requests per second)
- Error rate (4xx, 5xx responses)
- Document processing throughput
- Vector search latency
- LLM response time

**System Resource Metrics:**
- CPU utilization per service
- Memory usage and allocation
- Disk I/O and space usage
- Network throughput
- Container health status

**Business Logic Metrics:**
- Document upload success rate
- Search query accuracy
- User session duration
- API endpoint usage patterns

### 24.1.3 Alerting Rules Configuration

```yaml
# monitoring/rules/rag-system-alerts.yml
groups:
  - name: rag-system
    rules:
      # High response time alert
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is above 2 seconds"

      # High error rate alert
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 5% for the last 5 minutes"

      # Database connection issues
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL database is not responding"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is above 85%"

      # Disk space running low
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Disk space running low"
          description: "Available disk space is below 10%"

      # Vector database issues
      - alert: QdrantDown
        expr: up{job="qdrant"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Vector database is down"
          description: "Qdrant vector database is not responding"

      # LLM service issues
      - alert: OllamaDown
        expr: up{job="ollama"} == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "LLM service is down"
          description: "Ollama LLM service is not responding"
```

### 24.1.4 Monitoring Dashboard Configuration

```json
// Grafana Dashboard Configuration
{
  "dashboard": {
    "title": "RAG System Overview",
    "panels": [
      {
        "title": "API Response Times",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "p99"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100",
            "legendFormat": "Error Rate %"
          }
        ]
      },
      {
        "title": "System Resources",
        "type": "row",
        "panels": [
          {
            "title": "CPU Usage",
            "type": "graph",
            "targets": [
              {
                "expr": "100 - (avg(irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
                "legendFormat": "CPU Usage %"
              }
            ]
          },
          {
            "title": "Memory Usage",
            "type": "graph",
            "targets": [
              {
                "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
                "legendFormat": "Memory Usage %"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## 24.2 Performance Optimization Guidelines

### 24.2.1 Application-Level Optimizations

**Database Query Optimization:**
```python
# Optimized database queries with proper indexing
class OptimizedDocumentRepository:
    def __init__(self, db_session):
        self.db = db_session
    
    def search_documents_optimized(self, query: str, limit: int = 10):
        """Optimized document search with proper indexing"""
        # Use database indices for efficient full-text search
        return self.db.query(Document)\
            .filter(Document.content.match(query))\
            .order_by(Document.created_at.desc())\
            .limit(limit)\
            .options(selectinload(Document.chunks))\
            .all()
    
    def get_documents_by_status_batch(self, status: str, batch_size: int = 100):
        """Batch processing for large datasets"""
        offset = 0
        while True:
            batch = self.db.query(Document)\
                .filter(Document.status == status)\
                .offset(offset)\
                .limit(batch_size)\
                .all()
            
            if not batch:
                break
                
            yield batch
            offset += batch_size
```

**Caching Strategy Implementation:**
```python
# Redis-based caching for frequent operations
class CacheService:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour
    
    def cache_vector_search_results(self, query_hash: str, results: List[Dict], ttl: int = None):
        """Cache vector search results"""
        cache_key = f"vector_search:{query_hash}"
        self.redis.setex(
            cache_key, 
            ttl or self.default_ttl, 
            json.dumps(results, default=str)
        )
    
    def get_cached_vector_search(self, query_hash: str) -> Optional[List[Dict]]:
        """Retrieve cached vector search results"""
        cache_key = f"vector_search:{query_hash}`
        cached_result = self.redis.get(cache_key)
        return json.loads(cached_result) if cached_result else None
    
    def cache_llm_response(self, prompt_hash: str, response: str, ttl: int = 7200):
        """Cache LLM responses for repeated queries"""
        cache_key = f"llm_response:{prompt_hash}"
        self.redis.setex(cache_key, ttl, response)
    
    def invalidate_document_caches(self, document_id: str):
        """Invalidate caches when document is updated"""
        pattern = f"*{document_id}*"
        for key in self.redis.scan_iter(match=pattern):
            self.redis.delete(key)
```

**Asynchronous Processing:**
```python
# Celery task optimization for background processing
from celery import Celery
from celery.signals import task_postrun

app = Celery('rag_system')

@app.task(bind=True, max_retries=3)
def process_document_async(self, document_id: str):
    """Asynchronous document processing with retry logic"""
    try:
        # Process document with progress tracking
        document = Document.query.get(document_id)
        
        # Update progress
        self.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': 100, 'status': 'Starting processing...'}
        )
        
        # Chunk document
        chunks = chunk_document(document)
        self.update_state(
            state='PROGRESS',
            meta={'current': 30, 'total': 100, 'status': 'Document chunked'}
        )
        
        # Generate embeddings
        embeddings = generate_embeddings_batch(chunks)
        self.update_state(
            state='PROGRESS',
            meta={'current': 70, 'total': 100, 'status': 'Embeddings generated'}
        )
        
        # Store in vector database
        store_embeddings(embeddings)
        self.update_state(
            state='PROGRESS',
            meta={'current': 100, 'total': 100, 'status': 'Processing complete'}
        )
        
        return {'status': 'SUCCESS', 'document_id': document_id}
        
    except Exception as exc:
        self.retry(countdown=60, exc=exc)

@task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, retval=None, state=None, **kwds):
    """Monitor task performance"""
    if state == 'SUCCESS':
        # Log successful task completion
        performance_logger.info(f"Task {task_id} completed successfully")
    elif state == 'FAILURE':
        # Alert on task failures
        alert_service.send_alert(f"Task {task_id} failed", severity='high')
```

### 24.2.2 Infrastructure Optimizations

**Container Resource Optimization:**
```yaml
# Optimized Docker Compose configuration
version: '3.8'

services:
  rag-api:
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
    environment:
      # Performance tuning
      - GUNICORN_WORKERS=4
      - GUNICORN_WORKER_CONNECTIONS=1000
      - GUNICORN_MAX_REQUESTS=1000
      - GUNICORN_MAX_REQUESTS_JITTER=100
      - GUNICORN_TIMEOUT=30
      - GUNICORN_KEEPALIVE=2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

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
      -c shared_buffers=1GB
      -c effective_cache_size=3GB
      -c maintenance_work_mem=256MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
    volumes:
      - type: tmpfs
        target: /dev/shm
        tmpfs:
          size: 1G

  redis:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
    command: >
      redis-server
      --maxmemory 768mb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
      --tcp-keepalive 60
      --timeout 300
```

**Load Balancing Configuration:**
```nginx
# Advanced Nginx load balancing
upstream rag_api_backend {
    least_conn;
    server rag-api-1:8000 max_fails=3 fail_timeout=30s weight=1;
    server rag-api-2:8000 max_fails=3 fail_timeout=30s weight=1;
    server rag-api-3:8000 max_fails=3 fail_timeout=30s weight=1;
    keepalive 32;
}

upstream vector_search_backend {
    ip_hash;  # Sticky sessions for vector operations
    server vector-engine-1:8002 max_fails=2 fail_timeout=20s;
    server vector-engine-2:8002 max_fails=2 fail_timeout=20s;
    keepalive 16;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    # Connection optimizations
    keepalive_timeout 65;
    keepalive_requests 1000;
    
    # API endpoints
    location /api/v1/search {
        proxy_pass http://vector_search_backend;
        proxy_set_header Connection "";
        proxy_http_version 1.1;
        
        # Caching for search results
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri$is_args$args";
    }
    
    location /api/ {
        proxy_pass http://rag_api_backend;
        proxy_set_header Connection "";
        proxy_http_version 1.1;
        
        # Load balancing headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 24.3 Regular Maintenance Tasks and Schedules

### 24.3.1 Automated Maintenance Scripts

**Database Maintenance:**
```python
#!/usr/bin/env python3
"""
Automated database maintenance script
Runs daily via cron job
"""

import logging
from datetime import datetime, timedelta
from sqlalchemy import text
from core.database import get_db_session

class DatabaseMaintenance:
    def __init__(self):
        self.db = get_db_session()
        self.logger = logging.getLogger(__name__)
    
    def vacuum_analyze_tables(self):
        """Optimize database performance"""
        tables = ['documents', 'chunks', 'embeddings', 'audit_logs']
        
        for table in tables:
            try:
                self.db.execute(text(f"VACUUM ANALYZE {table}"))
                self.logger.info(f"VACUUM ANALYZE completed for {table}")
            except Exception as e:
                self.logger.error(f"VACUUM ANALYZE failed for {table}: {e}")
    
    def cleanup_old_logs(self, retention_days: int = 30):
        """Remove old audit logs"""
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        
        try:
            result = self.db.execute(
                text("DELETE FROM audit_logs WHERE created_at < :cutoff_date"),
                {"cutoff_date": cutoff_date}
            )
            self.logger.info(f"Deleted {result.rowcount} old audit log entries")
        except Exception as e:
            self.logger.error(f"Failed to cleanup old logs: {e}")
    
    def update_statistics(self):
        """Update database statistics for query optimization"""
        try:
            self.db.execute(text("ANALYZE"))
            self.logger.info("Database statistics updated")
        except Exception as e:
            self.logger.error(f"Failed to update statistics: {e}")
    
    def check_index_health(self):
        """Check and report on index usage"""
        query = text("""
            SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
            FROM pg_stat_user_indexes
            WHERE idx_scan = 0
            ORDER BY schemaname, tablename
        """)
        
        unused_indexes = self.db.execute(query).fetchall()
        
        if unused_indexes:
            self.logger.warning(f"Found {len(unused_indexes)} unused indexes")
            for index in unused_indexes:
                self.logger.warning(f"Unused index: {index.indexname} on {index.tablename}")
    
    def run_maintenance(self):
        """Run all maintenance tasks"""
        self.logger.info("Starting database maintenance")
        
        self.vacuum_analyze_tables()
        self.cleanup_old_logs()
        self.update_statistics()
        self.check_index_health()
        
        self.logger.info("Database maintenance completed")

if __name__ == "__main__":
    maintenance = DatabaseMaintenance()
    maintenance.run_maintenance()
```

**Vector Database Maintenance:**
```python
#!/usr/bin/env python3
"""
Vector database maintenance script
"""

import logging
from qdrant_client import QdrantClient
from core.config import get_settings

class VectorDatabaseMaintenance:
    def __init__(self):
        settings = get_settings()
        self.client = QdrantClient(url=settings.QDRANT_URL)
        self.logger = logging.getLogger(__name__)
    
    def optimize_collections(self):
        """Optimize vector collections for better performance"""
        collections = self.client.get_collections()
        
        for collection in collections.collections:
            try:
                # Optimize collection
                self.client.update_collection(
                    collection_name=collection.name,
                    optimizer_config={
                        "deleted_threshold": 0.2,
                        "vacuum_min_vector_number": 1000,
                        "default_segment_number": 0,
                        "max_segment_size": 200000,
                        "memmap_threshold": 200000,
                        "indexing_threshold": 10000,
                        "flush_interval_sec": 5,
                        "max_optimization_threads": 2
                    }
                )
                self.logger.info(f"Optimized collection: {collection.name}")
            except Exception as e:
                self.logger.error(f"Failed to optimize collection {collection.name}: {e}")
    
    def check_collection_health(self):
        """Check vector collection health and statistics"""
        collections = self.client.get_collections()
        
        for collection in collections.collections:
            try:
                info = self.client.get_collection(collection.name)
                self.logger.info(f"Collection {collection.name}: {info.vectors_count} vectors")
                
                # Check for optimal configuration
                if info.vectors_count > 100000 and info.config.params.vectors.distance != "Cosine":
                    self.logger.warning(f"Consider using Cosine distance for large collection: {collection.name}")
                    
            except Exception as e:
                self.logger.error(f"Failed to check collection {collection.name}: {e}")
    
    def run_maintenance(self):
        """Run all vector database maintenance tasks"""
        self.logger.info("Starting vector database maintenance")
        
        self.optimize_collections()
        self.check_collection_health()
        
        self.logger.info("Vector database maintenance completed")

if __name__ == "__main__":
    maintenance = VectorDatabaseMaintenance()
    maintenance.run_maintenance()
```

### 24.3.2 Maintenance Schedule

**Cron Job Configuration:**
```bash
# /etc/crontab - Production maintenance schedule

# Daily maintenance (2 AM)
0 2 * * * root /app/scripts/daily_maintenance.sh

# Weekly maintenance (Sunday 3 AM)
0 3 * * 0 root /app/scripts/weekly_maintenance.sh

# Monthly maintenance (1st of month, 4 AM)
0 4 1 * * root /app/scripts/monthly_maintenance.sh

# Log rotation (daily at 1 AM)
0 1 * * * root /usr/sbin/logrotate /etc/logrotate.d/rag-system

# Backup cleanup (daily at 6 AM)
0 6 * * * root /app/scripts/backup_cleanup.sh

# Health check monitoring (every 5 minutes)
*/5 * * * * root /app/scripts/health_check.sh

# Certificate renewal check (daily at 5 AM)
0 5 * * * root /usr/bin/certbot renew --quiet

# Performance metrics collection (hourly)
0 * * * * root /app/scripts/collect_metrics.sh
```

**Daily Maintenance Script:**
```bash
#!/bin/bash
# daily_maintenance.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/rag-system/maintenance.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting daily maintenance"

# Database maintenance
log "Running database maintenance"
python3 /app/scripts/db_maintenance.py

# Vector database maintenance
log "Running vector database maintenance"
python3 /app/scripts/vector_db_maintenance.py

# Log cleanup
log "Cleaning up application logs"
find /app/logs -name "*.log" -mtime +7 -delete

# Temporary file cleanup
log "Cleaning up temporary files"
find /tmp -name "rag_*" -mtime +1 -delete

# Docker system cleanup
log "Running Docker cleanup"
docker system prune -f --volumes --filter "until=24h"

# Update system metrics
log "Updating system metrics"
python3 /app/scripts/update_metrics.py

log "Daily maintenance completed"
```

## 24.4 Troubleshooting Common Production Issues

### 24.4.1 Performance Degradation Issues

**High Response Time Diagnosis:**
```python
#!/usr/bin/env python3
"""
Performance diagnostics script
"""

import psutil
import time
import requests
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class PerformanceMetric:
    timestamp: float
    cpu_percent: float
    memory_percent: float
    disk_io: Dict
    network_io: Dict
    response_time: float

class PerformanceDiagnostics:
    def __init__(self):
        self.api_endpoint = "http://localhost:8000/health"
    
    def collect_system_metrics(self) -> Dict:
        """Collect comprehensive system metrics"""
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        load_avg = psutil.getloadavg()
        
        # Memory metrics
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Disk metrics
        disk_usage = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        # Network metrics
        network_io = psutil.net_io_counters()
        
        return {
            'cpu': {
                'percent': cpu_percent,
                'count': cpu_count,
                'load_avg': load_avg
            },
            'memory': {
                'percent': memory.percent,
                'available': memory.available,
                'total': memory.total,
                'swap_percent': swap.percent
            },
            'disk': {
                'percent': (disk_usage.used / disk_usage.total) * 100,
                'free': disk_usage.free,
                'total': disk_usage.total,
                'read_bytes': disk_io.read_bytes if disk_io else 0,
                'write_bytes': disk_io.write_bytes if disk_io else 0
            },
            'network': {
                'bytes_sent': network_io.bytes_sent,
                'bytes_recv': network_io.bytes_recv,
                'packets_sent': network_io.packets_sent,
                'packets_recv': network_io.packets_recv
            }
        }
    
    def measure_api_response_time(self) -> float:
        """Measure API response time"""
        try:
            start_time = time.time()
            response = requests.get(self.api_endpoint, timeout=30)
            end_time = time.time()
            
            if response.status_code == 200:
                return end_time - start_time
            else:
                return -1  # Error indicator
        except Exception:
            return -1
    
    def diagnose_performance_issues(self) -> List[str]:
        """Diagnose potential performance issues"""
        issues = []
        metrics = self.collect_system_metrics()
        response_time = self.measure_api_response_time()
        
        # CPU issues
        if metrics['cpu']['percent'] > 80:
            issues.append(f"High CPU usage: {metrics['cpu']['percent']:.1f}%")
        
        if metrics['cpu']['load_avg'][0] > metrics['cpu']['count']:
            issues.append(f"High load average: {metrics['cpu']['load_avg'][0]:.2f}")
        
        # Memory issues
        if metrics['memory']['percent'] > 85:
            issues.append(f"High memory usage: {metrics['memory']['percent']:.1f}%")
        
        if metrics['memory']['swap_percent'] > 50:
            issues.append(f"High swap usage: {metrics['memory']['swap_percent']:.1f}%")
        
        # Disk issues
        if metrics['disk']['percent'] > 90:
            issues.append(f"Low disk space: {metrics['disk']['percent']:.1f}% used")
        
        # API response time issues
        if response_time == -1:
            issues.append("API endpoint not responding")
        elif response_time > 5:
            issues.append(f"Slow API response time: {response_time:.2f}s")
        
        return issues
    
    def generate_performance_report(self) -> str:
        """Generate comprehensive performance report"""
        metrics = self.collect_system_metrics()
        response_time = self.measure_api_response_time()
        issues = self.diagnose_performance_issues()
        
        report = f"""
Performance Diagnostics Report
Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}

System Metrics:
- CPU Usage: {metrics['cpu']['percent']:.1f}%
- CPU Load Average: {metrics['cpu']['load_avg'][0]:.2f}
- Memory Usage: {metrics['memory']['percent']:.1f}%
- Swap Usage: {metrics['memory']['swap_percent']:.1f}%
- Disk Usage: {metrics['disk']['percent']:.1f}%
- API Response Time: {response_time:.3f}s

Issues Detected:
"""
        
        if issues:
            for issue in issues:
                report += f"- {issue}\n"
        else:
            report += "- No issues detected\n"
        
        return report

if __name__ == "__main__":
    diagnostics = PerformanceDiagnostics()
    print(diagnostics.generate_performance_report())
```

### 24.4.2 Common Issue Resolution

**Database Connection Issues:**
```bash
#!/bin/bash
# Database connection troubleshooting script

check_postgres_connectivity() {
    echo "Checking PostgreSQL connectivity..."
    
    # Check if container is running
    if docker ps | grep -q rag-postgres; then
        echo "✓ PostgreSQL container is running"
    else
        echo "✗ PostgreSQL container is not running"
        echo "Attempting to restart..."
        docker-compose restart postgres
        sleep 10
    fi
    
    # Check connection
    if docker-compose exec postgres pg_isready -U raguser -d ragdb; then
        echo "✓ PostgreSQL is accepting connections"
    else
        echo "✗ PostgreSQL connection failed"
        echo "Checking logs..."
        docker-compose logs postgres --tail 20
    fi
    
    # Check disk space
    DISK_USAGE=$(docker-compose exec postgres df -h /var/lib/postgresql/data | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo "✗ PostgreSQL disk usage is high: ${DISK_USAGE}%"
    else
        echo "✓ PostgreSQL disk usage is normal: ${DISK_USAGE}%"
    fi
}

fix_postgres_issues() {
    echo "Attempting to fix PostgreSQL issues..."
    
    # Restart PostgreSQL
    docker-compose restart postgres
    sleep 30
    
    # Check if restart resolved the issue
    if check_postgres_connectivity; then
        echo "✓ PostgreSQL issues resolved"
    else
        echo "✗ Manual intervention required"
        echo "Consider:"
        echo "1. Checking disk space"
        echo "2. Reviewing PostgreSQL logs"
        echo "3. Checking database corruption"
        echo "4. Restoring from backup if necessary"
    fi
}
```

**Memory Leak Detection:**
```python
#!/usr/bin/env python3
"""
Memory leak detection and analysis
"""

import psutil
import docker
import time
from datetime import datetime, timedelta

class MemoryMonitor:
    def __init__(self):
        self.docker_client = docker.from_env()
    
    def monitor_container_memory(self, container_name: str, duration_minutes: int = 30):
        """Monitor container memory usage over time"""
        try:
            container = self.docker_client.containers.get(container_name)
        except docker.errors.NotFound:
            print(f"Container {container_name} not found")
            return
        
        memory_samples = []
        end_time = datetime.now() + timedelta(minutes=duration_minutes)
        
        print(f"Monitoring {container_name} memory usage for {duration_minutes} minutes...")
        
        while datetime.now() < end_time:
            try:
                stats = container.stats(stream=False)
                memory_usage = stats['memory_stats']['usage']
                memory_limit = stats['memory_stats']['limit']
                memory_percent = (memory_usage / memory_limit) * 100
                
                sample = {
                    'timestamp': datetime.now(),
                    'usage_bytes': memory_usage,
                    'usage_mb': memory_usage / (1024 * 1024),
                    'percent': memory_percent
                }
                
                memory_samples.append(sample)
                print(f"{sample['timestamp'].strftime('%H:%M:%S')} - Memory: {sample['usage_mb']:.1f}MB ({sample['percent']:.1f}%)")
                
                time.sleep(30)  # Sample every 30 seconds
                
            except Exception as e:
                print(f"Error collecting memory stats: {e}")
                time.sleep(30)
        
        # Analyze for memory leaks
        self.analyze_memory_trend(memory_samples, container_name)
    
    def analyze_memory_trend(self, samples: list, container_name: str):
        """Analyze memory usage trend for leaks"""
        if len(samples) < 5:
            print("Insufficient data for trend analysis")
            return
        
        # Calculate memory growth rate
        first_half = samples[:len(samples)//2]
        second_half = samples[len(samples)//2:]
        
        avg_first_half = sum(s['usage_mb'] for s in first_half) / len(first_half)
        avg_second_half = sum(s['usage_mb'] for s in second_half) / len(second_half)
        
        growth_rate = ((avg_second_half - avg_first_half) / avg_first_half) * 100
        
        print(f"\nMemory Trend Analysis for {container_name}:")
        print(f"Average memory usage (first half): {avg_first_half:.1f}MB")
        print(f"Average memory usage (second half): {avg_second_half:.1f}MB")
        print(f"Growth rate: {growth_rate:.2f}%")
        
        if growth_rate > 10:
            print("⚠️  Potential memory leak detected!")
            print("Recommendations:")
            print("1. Review application logs for errors")
            print("2. Check for unclosed database connections")
            print("3. Monitor garbage collection patterns")
            print("4. Consider restarting the container")
        elif growth_rate < -5:
            print("ℹ️  Memory usage is decreasing (normal)")
        else:
            print("✓ Memory usage appears stable")

if __name__ == "__main__":
    monitor = MemoryMonitor()
    monitor.monitor_container_memory('rag-api', duration_minutes=30)
```

## 24.5 Scaling and Capacity Planning

### 24.5.1 Horizontal Scaling Strategy

**Auto-scaling Configuration:**
```yaml
# Docker Swarm auto-scaling configuration
version: '3.8'

services:
  rag-api:
    image: projektsusui-rag:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
      restart_policy:
        condition: on-failure
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        monitor: 60s
        max_failure_ratio: 0.3
      rollback_config:
        parallelism: 1
        delay: 0s
        failure_action: pause
        monitor: 60s
        max_failure_ratio: 0.3
    networks:
      - rag-network
    
  # Load balancer for API services
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/load-balancer.conf:/etc/nginx/nginx.conf:ro
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager
    networks:
      - rag-network
```

**Kubernetes Horizontal Pod Autoscaler:**
```yaml
# hpa.yaml - Kubernetes autoscaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: rag-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: rag-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
```

### 24.5.2 Capacity Planning Tools

**Capacity Planning Script:**
```python
#!/usr/bin/env python3
"""
Capacity planning and resource projection
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

class CapacityPlanner:
    def __init__(self):
        self.metrics_data = []
    
    def collect_historical_metrics(self, days: int = 30) -> pd.DataFrame:
        """Collect historical performance metrics"""
        # This would typically query Prometheus or your metrics database
        # For demo purposes, generating sample data
        
        date_range = pd.date_range(
            start=datetime.now() - timedelta(days=days),
            end=datetime.now(),
            freq='H'
        )
        
        # Generate realistic-looking metrics
        np.random.seed(42)
        data = []
        
        for timestamp in date_range:
            # Simulate daily patterns
            hour = timestamp.hour
            day_factor = 1 + 0.3 * np.sin(2 * np.pi * hour / 24)
            
            metrics = {
                'timestamp': timestamp,
                'cpu_usage': min(95, max(10, 30 * day_factor + np.random.normal(0, 10))),
                'memory_usage': min(95, max(20, 40 * day_factor + np.random.normal(0, 8))),
                'request_rate': max(0, 100 * day_factor + np.random.normal(0, 20)),
                'response_time': max(0.1, 0.5 + 0.2 * day_factor + np.random.normal(0, 0.1)),
                'error_rate': max(0, 2 + np.random.normal(0, 1))
            }
            
            data.append(metrics)
        
        return pd.DataFrame(data)
    
    def analyze_growth_trends(self, df: pd.DataFrame) -> dict:
        """Analyze growth trends in key metrics"""
        df['days_since_start'] = (df['timestamp'] - df['timestamp'].min()).dt.days
        
        trends = {}
        metrics = ['cpu_usage', 'memory_usage', 'request_rate', 'response_time']
        
        for metric in metrics:
            X = df['days_since_start'].values.reshape(-1, 1)
            y = df[metric].values
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate growth rate per day
            growth_rate = model.coef_[0]
            r_squared = model.score(X, y)
            
            trends[metric] = {
                'growth_rate_per_day': growth_rate,
                'r_squared': r_squared,
                'current_average': df[metric].tail(7).mean(),
                'trend': 'increasing' if growth_rate > 0 else 'decreasing'
            }
        
        return trends
    
    def project_future_capacity(self, trends: dict, days_ahead: int = 90) -> dict:
        """Project future capacity requirements"""
        projections = {}
        
        for metric, trend_data in trends.items():
            current_avg = trend_data['current_average']
            daily_growth = trend_data['growth_rate_per_day']
            
            future_value = current_avg + (daily_growth * days_ahead)
            
            projections[metric] = {
                'current': current_avg,
                'projected': future_value,
                'growth_total': future_value - current_avg,
                'growth_percent': ((future_value - current_avg) / current_avg) * 100 if current_avg > 0 else 0
            }
        
        return projections
    
    def generate_scaling_recommendations(self, projections: dict) -> list:
        """Generate scaling recommendations based on projections"""
        recommendations = []
        
        # CPU scaling recommendations
        cpu_projected = projections['cpu_usage']['projected']
        if cpu_projected > 80:
            recommendations.append({
                'type': 'CPU',
                'action': 'Scale up',
                'reason': f'Projected CPU usage: {cpu_projected:.1f}%',
                'urgency': 'high' if cpu_projected > 90 else 'medium'
            })
        
        # Memory scaling recommendations
        memory_projected = projections['memory_usage']['projected']
        if memory_projected > 85:
            recommendations.append({
                'type': 'Memory',
                'action': 'Scale up',
                'reason': f'Projected memory usage: {memory_projected:.1f}%',
                'urgency': 'high' if memory_projected > 95 else 'medium'
            })
        
        # Request rate scaling
        request_growth = projections['request_rate']['growth_percent']
        if request_growth > 50:
            recommendations.append({
                'type': 'Horizontal',
                'action': 'Add replicas',
                'reason': f'Request rate growth: {request_growth:.1f}%',
                'urgency': 'medium'
            })
        
        # Response time degradation
        response_time_growth = projections['response_time']['growth_percent']
        if response_time_growth > 25:
            recommendations.append({
                'type': 'Performance',
                'action': 'Optimize or scale',
                'reason': f'Response time degradation: {response_time_growth:.1f}%',
                'urgency': 'high'
            })
        
        return recommendations
    
    def generate_capacity_report(self) -> str:
        """Generate comprehensive capacity planning report"""
        df = self.collect_historical_metrics()
        trends = self.analyze_growth_trends(df)
        projections = self.project_future_capacity(trends)
        recommendations = self.generate_scaling_recommendations(projections)
        
        report = f"""
RAG System Capacity Planning Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

CURRENT STATE:
"""
        
        for metric, trend_data in trends.items():
            report += f"- {metric.replace('_', ' ').title()}: {trend_data['current_average']:.1f} (trend: {trend_data['trend']})\n"
        
        report += f"""
90-DAY PROJECTIONS:
"""
        
        for metric, projection in projections.items():
            report += f"- {metric.replace('_', ' ').title()}: {projection['current']:.1f} → {projection['projected']:.1f} ({projection['growth_percent']:+.1f}%)\n"
        
        report += f"""
SCALING RECOMMENDATIONS:
"""
        
        if recommendations:
            for rec in recommendations:
                report += f"- {rec['type']}: {rec['action']} ({rec['urgency']} priority)\n"
                report += f"  Reason: {rec['reason']}\n"
        else:
            report += "- No immediate scaling required\n"
        
        return report

if __name__ == "__main__":
    planner = CapacityPlanner()
    print(planner.generate_capacity_report())
```

This comprehensive monitoring and maintenance documentation provides all the necessary tools and procedures for maintaining a healthy, performant RAG System in production, including monitoring dashboards, automated maintenance scripts, troubleshooting guides, and capacity planning tools.