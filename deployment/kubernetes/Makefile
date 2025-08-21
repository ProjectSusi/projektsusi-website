# Kubernetes Deployment Makefile for ProjectSusi RAG System

# Configuration
NAMESPACE = rag-system
APP_NAME = rag-app
IMAGE_NAME = projectsusi/rag-system
IMAGE_TAG = latest
DOMAIN = projectsusi.com

.PHONY: help deploy clean status logs build push

help: ## Show this help message
	@echo "ProjectSusi RAG System - Kubernetes Deployment"
	@echo "=============================================="
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Build & Push
build: ## Build Docker image
	@echo "🔨 Building Docker image..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) -f ../docker/Dockerfile ../../
	@echo "✅ Build complete: $(IMAGE_NAME):$(IMAGE_TAG)"

push: build ## Build and push Docker image
	@echo "📦 Pushing Docker image..."
	docker push $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "✅ Push complete: $(IMAGE_NAME):$(IMAGE_TAG)"

##@ Deployment
deploy: ## Deploy all components to Kubernetes
	@echo "🚀 Deploying RAG System to Kubernetes..."
	kubectl apply -f namespace.yaml
	kubectl apply -f postgresql.yaml
	kubectl apply -f redis.yaml
	kubectl apply -f ollama.yaml
	@echo "⏳ Waiting for database services..."
	kubectl wait --for=condition=ready pod -l app=postgresql -n $(NAMESPACE) --timeout=300s
	kubectl wait --for=condition=ready pod -l app=redis -n $(NAMESPACE) --timeout=300s
	kubectl wait --for=condition=ready pod -l app=ollama -n $(NAMESPACE) --timeout=300s
	kubectl apply -f rag-app.yaml
	@echo "⏳ Waiting for RAG application..."
	kubectl wait --for=condition=available deployment/$(APP_NAME) -n $(NAMESPACE) --timeout=300s
	kubectl apply -f ingress.yaml
	kubectl apply -f monitoring.yaml
	@echo "✅ Deployment complete!"
	@make status

deploy-app: ## Deploy only the RAG application
	@echo "🚀 Deploying RAG application..."
	kubectl apply -f rag-app.yaml
	kubectl wait --for=condition=available deployment/$(APP_NAME) -n $(NAMESPACE) --timeout=300s
	@echo "✅ Application deployed!"

deploy-infra: ## Deploy only infrastructure (DB, Redis, Ollama)
	@echo "🔧 Deploying infrastructure..."
	kubectl apply -f namespace.yaml
	kubectl apply -f postgresql.yaml
	kubectl apply -f redis.yaml
	kubectl apply -f ollama.yaml
	@echo "✅ Infrastructure deployed!"

##@ Management
status: ## Show deployment status
	@echo "📊 RAG System Status"
	@echo "==================="
	@echo "Namespace:"
	@kubectl get namespace $(NAMESPACE) 2>/dev/null || echo "❌ Namespace not found"
	@echo
	@echo "Pods:"
	@kubectl get pods -n $(NAMESPACE) -o wide 2>/dev/null || echo "❌ No pods found"
	@echo
	@echo "Services:"
	@kubectl get services -n $(NAMESPACE) 2>/dev/null || echo "❌ No services found"
	@echo
	@echo "Ingress:"
	@kubectl get ingress -n $(NAMESPACE) 2>/dev/null || echo "❌ No ingress found"
	@echo
	@echo "HPA:"
	@kubectl get hpa -n $(NAMESPACE) 2>/dev/null || echo "❌ No HPA found"
	@echo
	@echo "PVC:"
	@kubectl get pvc -n $(NAMESPACE) 2>/dev/null || echo "❌ No PVC found"

logs: ## Show application logs
	@echo "📝 RAG Application Logs"
	@echo "======================="
	kubectl logs -f deployment/$(APP_NAME) -n $(NAMESPACE) --tail=100

logs-all: ## Show logs for all components
	@echo "📝 All Component Logs"
	@echo "===================="
	@echo "RAG Application:"
	@kubectl logs deployment/$(APP_NAME) -n $(NAMESPACE) --tail=20 | head -10
	@echo
	@echo "PostgreSQL:"
	@kubectl logs deployment/postgresql -n $(NAMESPACE) --tail=20 | head -10
	@echo
	@echo "Redis:"
	@kubectl logs deployment/redis -n $(NAMESPACE) --tail=20 | head -10
	@echo
	@echo "Ollama:"
	@kubectl logs deployment/ollama -n $(NAMESPACE) --tail=20 | head -10

##@ Scaling
scale-up: ## Scale application to 5 replicas
	@echo "📈 Scaling up to 5 replicas..."
	kubectl scale deployment $(APP_NAME) --replicas=5 -n $(NAMESPACE)
	kubectl wait --for=condition=available deployment/$(APP_NAME) -n $(NAMESPACE) --timeout=300s
	@echo "✅ Scaled to 5 replicas"

scale-down: ## Scale application to 2 replicas
	@echo "📉 Scaling down to 2 replicas..."
	kubectl scale deployment $(APP_NAME) --replicas=2 -n $(NAMESPACE)
	@echo "✅ Scaled to 2 replicas"

##@ Maintenance
update: ## Update application with latest image
	@echo "🔄 Updating application..."
	kubectl set image deployment/$(APP_NAME) rag-app=$(IMAGE_NAME):$(IMAGE_TAG) -n $(NAMESPACE)
	kubectl rollout status deployment/$(APP_NAME) -n $(NAMESPACE)
	@echo "✅ Update complete"

rollback: ## Rollback to previous version
	@echo "⏪ Rolling back..."
	kubectl rollout undo deployment/$(APP_NAME) -n $(NAMESPACE)
	kubectl rollout status deployment/$(APP_NAME) -n $(NAMESPACE)
	@echo "✅ Rollback complete"

restart: ## Restart application pods
	@echo "🔄 Restarting application..."
	kubectl rollout restart deployment/$(APP_NAME) -n $(NAMESPACE)
	kubectl rollout status deployment/$(APP_NAME) -n $(NAMESPACE)
	@echo "✅ Restart complete"

##@ Health & Testing
health: ## Check system health
	@echo "🏥 Health Check"
	@echo "==============="
	@echo "Checking RAG service health..."
	@if kubectl get ingress -n $(NAMESPACE) -o jsonpath='{.items[0].spec.rules[0].host}' > /dev/null 2>&1; then \
		DOMAIN=$$(kubectl get ingress -n $(NAMESPACE) -o jsonpath='{.items[0].spec.rules[0].host}'); \
		echo "Testing: https://$$DOMAIN/api/v1/health"; \
		curl -f -s https://$$DOMAIN/api/v1/health | jq . || echo "❌ Health check failed"; \
	else \
		echo "Port-forwarding for health check..."; \
		kubectl port-forward service/$(APP_NAME)-service 8080:80 -n $(NAMESPACE) & \
		sleep 3; \
		curl -f -s http://localhost:8080/api/v1/health | jq . || echo "❌ Health check failed"; \
		kill %%1; \
	fi

test-query: ## Test a sample query
	@echo "🧪 Testing sample query..."
	@if kubectl get ingress -n $(NAMESPACE) -o jsonpath='{.items[0].spec.rules[0].host}' > /dev/null 2>&1; then \
		DOMAIN=$$(kubectl get ingress -n $(NAMESPACE) -o jsonpath='{.items[0].spec.rules[0].host}'); \
		echo "Testing query on: https://$$DOMAIN"; \
		curl -X POST https://$$DOMAIN/api/v1/query \
			-H "Content-Type: application/json" \
			-d '{"query": "What is the RAG system?"}' | jq .; \
	else \
		echo "❌ Ingress not available for testing"; \
	fi

##@ Database
db-backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	kubectl exec deployment/postgresql -n $(NAMESPACE) -- pg_dump -U postgres rag_db > backups/rag-db-backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

db-restore: ## Restore database from backup (requires BACKUP_FILE)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE=path/to/backup.sql"; \
		exit 1; \
	fi
	@echo "📥 Restoring database from $(BACKUP_FILE)..."
	kubectl exec -i deployment/postgresql -n $(NAMESPACE) -- psql -U postgres rag_db < $(BACKUP_FILE)
	@echo "✅ Database restored"

##@ Cleanup
clean: ## Remove all deployed resources
	@echo "🧹 Cleaning up RAG System..."
	@echo "This will delete all data! Are you sure? (Press Ctrl+C to cancel)"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	kubectl delete namespace $(NAMESPACE) --ignore-not-found=true
	@echo "✅ Cleanup complete"

clean-app: ## Remove only application (keep data)
	@echo "🧹 Removing RAG application..."
	kubectl delete deployment $(APP_NAME) -n $(NAMESPACE) --ignore-not-found=true
	kubectl delete service $(APP_NAME)-service -n $(NAMESPACE) --ignore-not-found=true
	kubectl delete hpa $(APP_NAME)-hpa -n $(NAMESPACE) --ignore-not-found=true
	@echo "✅ Application removed"

##@ Development
port-forward: ## Port forward for local development
	@echo "🔌 Port forwarding RAG service to localhost:8080..."
	@echo "Access at: http://localhost:8080/ui"
	kubectl port-forward service/$(APP_NAME)-service 8080:80 -n $(NAMESPACE)

shell: ## Get shell access to application pod
	@echo "🐚 Opening shell in RAG application..."
	kubectl exec -it deployment/$(APP_NAME) -n $(NAMESPACE) -- /bin/bash

describe: ## Describe all resources
	@echo "📋 Resource Description"
	@echo "======================="
	kubectl describe all -n $(NAMESPACE)

##@ Monitoring
metrics: ## Show Prometheus metrics
	@echo "📈 Prometheus Metrics"
	@echo "===================="
	@if kubectl get service prometheus-operated -n monitoring > /dev/null 2>&1; then \
		kubectl port-forward service/prometheus-operated 9090:9090 -n monitoring & \
		echo "Prometheus available at: http://localhost:9090"; \
		sleep 2; \
		echo "Sample metrics:"; \
		curl -s http://localhost:9090/api/v1/query?query=up | jq .; \
		kill %%1; \
	else \
		echo "❌ Prometheus not available"; \
	fi

dashboard: ## Open Grafana dashboard
	@echo "📊 Opening Grafana dashboard..."
	@if kubectl get service grafana -n monitoring > /dev/null 2>&1; then \
		kubectl port-forward service/grafana 3000:80 -n monitoring & \
		echo "Grafana available at: http://localhost:3000"; \
		echo "Default login: admin/admin"; \
		read -p "Press Enter to stop port-forward..."; \
		kill %%1; \
	else \
		echo "❌ Grafana not available"; \
	fi