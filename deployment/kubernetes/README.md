# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying ProjectSusi RAG System at scale.

## Architecture

- **rag-app**: Main RAG application (3+ replicas with HPA)
- **postgresql**: Primary database with persistent storage
- **redis**: Cache layer for improved performance
- **ollama**: Local LLM service with model storage
- **ingress**: Load balancer with SSL termination
- **monitoring**: Prometheus metrics and Grafana dashboards

## Prerequisites

1. **Kubernetes cluster** (1.24+) with:
   - NGINX Ingress Controller
   - cert-manager for SSL certificates
   - Prometheus Operator for monitoring
   - Storage classes: `fast-ssd`, `nfs-storage`

2. **Docker image**: Build and push RAG system image
   ```bash
   docker build -t projectsusi/rag-system:latest .
   docker push projectsusi/rag-system:latest
   ```

## Quick Deployment

```bash
# Deploy all components
kubectl apply -f deployment/kubernetes/

# Check deployment status
kubectl get pods -n rag-system

# Get ingress URL
kubectl get ingress -n rag-system
```

## Step-by-Step Deployment

### 1. Create Namespace and ConfigMap
```bash
kubectl apply -f namespace.yaml
```

### 2. Deploy Database Layer
```bash
kubectl apply -f postgresql.yaml
kubectl apply -f redis.yaml
```

### 3. Deploy LLM Service
```bash
kubectl apply -f ollama.yaml

# Wait for Ollama to be ready, then load models
kubectl wait --for=condition=ready pod -l app=ollama -n rag-system --timeout=300s
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: model-loader
  namespace: rag-system
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: loader
        image: curlimages/curl
        command: ["/bin/sh", "-c"]
        args:
        - |
          curl -d '{"name":"arlesheim-german"}' http://ollama-service:11434/api/pull
          curl -d '{"name":"llama3.2"}' http://ollama-service:11434/api/pull
EOF
```

### 4. Deploy RAG Application
```bash
kubectl apply -f rag-app.yaml

# Wait for deployment to be ready
kubectl wait --for=condition=available deployment/rag-app -n rag-system --timeout=300s
```

### 5. Setup Ingress and SSL
```bash
# Update ingress.yaml with your domain
kubectl apply -f ingress.yaml

# Verify SSL certificate
kubectl get certificate -n rag-system
```

### 6. Deploy Monitoring
```bash
kubectl apply -f monitoring.yaml
```

## Configuration

### Environment Variables
Edit `namespace.yaml` ConfigMap to customize:

- **RAG_SIMILARITY_THRESHOLD**: Document similarity threshold (0.0-1.0)
- **RAG_MAX_RESULTS**: Maximum search results per query
- **OLLAMA_DEFAULT_MODEL**: Default LLM model name
- **DATABASE_***: Database connection settings

### Scaling
```bash
# Manual scaling
kubectl scale deployment rag-app --replicas=5 -n rag-system

# Auto-scaling (HPA already configured)
kubectl get hpa -n rag-system
```

### GPU Support
For GPU-accelerated Ollama:

1. Ensure GPU nodes are available
2. Uncomment GPU resource limits in `ollama.yaml`
3. Uncomment nodeSelector for GPU nodes

## Monitoring

### Prometheus Metrics
Available at: `/api/v1/metrics`

Key metrics:
- `rag_queries_total`: Total queries processed
- `rag_query_duration_seconds`: Query response time
- `rag_documents_total`: Total documents indexed
- `rag_cache_hits_total`: Cache hit rate

### Grafana Dashboard
Import the dashboard from `monitoring.yaml` ConfigMap.

### Health Checks
```bash
# Application health
kubectl get pods -n rag-system
kubectl logs -f deployment/rag-app -n rag-system

# Service health
curl https://rag.projectsusi.com/api/v1/health
```

## Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod -n rag-system
   kubectl logs -f <pod-name> -n rag-system
   ```

2. **Database connection issues**
   ```bash
   kubectl exec -it deployment/postgresql -n rag-system -- psql -U postgres
   ```

3. **Ollama model loading**
   ```bash
   kubectl exec -it deployment/ollama -n rag-system -- ollama list
   ```

4. **Storage issues**
   ```bash
   kubectl get pvc -n rag-system
   kubectl describe pvc <pvc-name> -n rag-system
   ```

### Performance Tuning

1. **Increase replicas** for higher throughput
2. **Adjust resource limits** based on usage
3. **Use faster storage classes** for database and models
4. **Enable GPU acceleration** for Ollama

## Security

- All secrets are base64 encoded in manifests
- Use external secret management in production
- Network policies can be added for isolation
- RBAC is configured for service accounts

## Backup & Recovery

### Database Backup
```bash
kubectl exec deployment/postgresql -n rag-system -- pg_dump -U postgres rag_db > backup.sql
```

### Document Storage Backup
```bash
kubectl cp rag-system/rag-app-xxx:/app/data/storage ./storage-backup
```

## Updates

### Rolling Updates
```bash
# Update image
kubectl set image deployment/rag-app rag-app=projectsusi/rag-system:v2.0 -n rag-system

# Check rollout status
kubectl rollout status deployment/rag-app -n rag-system
```

### Rollback
```bash
kubectl rollout undo deployment/rag-app -n rag-system
```