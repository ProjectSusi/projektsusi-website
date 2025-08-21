# ProjektSusui RAG System - Docker Deployment Makefile

.PHONY: help install dev prod test clean setup build deploy stop restart logs backup restore health

# Variables
PROJECT_NAME = projektsusui-rag
COMPOSE_FILE = docker-compose.yml
ENV_FILE = .env

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Default target
help: ## Show this help message
	@echo "$(BLUE)======================================================"
	@echo "  ProjektSusui RAG System - Docker Management"
	@echo "======================================================$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(GREEN)Quick Start:$(NC)"
	@echo "  1. make setup         # Generate secrets and setup environment"
	@echo "  2. make build         # Build Docker images"
	@echo "  3. make up            # Start all services"
	@echo "  4. make logs          # View logs"
	@echo ""

# Environment Setup
setup: ## Generate secrets and setup environment
	@echo "$(GREEN)Setting up ProjektSusui RAG System...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)Generating secure secrets...$(NC)"; \
		chmod +x scripts/generate-secrets.sh; \
		./scripts/generate-secrets.sh; \
		cp .env.development $(ENV_FILE); \
		echo "$(GREEN)Environment file created: $(ENV_FILE)$(NC)"; \
	else \
		echo "$(YELLOW)Environment file already exists: $(ENV_FILE)$(NC)"; \
	fi
	@echo "$(GREEN)Checking Docker installation...$(NC)"
	@docker --version || (echo "$(RED)Docker not found. Please install Docker$(NC)" && exit 1)
	@docker-compose --version || (echo "$(RED)Docker Compose not found. Please install Docker Compose$(NC)" && exit 1)
	@echo "$(GREEN)Setup complete! Use 'make build' to build images.$(NC)"

check-env: ## Check if environment file exists
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(RED)Environment file not found: $(ENV_FILE)$(NC)"; \
		echo "$(YELLOW)Run 'make setup' first$(NC)"; \
		exit 1; \
	fi

# Docker Operations
build: check-env ## Build Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)Build complete!$(NC)"

build-dev: check-env ## Build development images with cache
	@echo "$(GREEN)Building development images (with cache)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)Development build complete!$(NC)"

up: check-env ## Start all services
	@echo "$(GREEN)Starting ProjektSusui RAG System...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services started!$(NC)"
	@echo ""
	@echo "$(BLUE)Access URLs:$(NC)"
	@echo "  API Server:    http://localhost:8000"
	@echo "  Admin Panel:   http://localhost:8000/admin"
	@echo "  API Docs:      http://localhost:8000/docs"
	@echo "  Grafana:       http://localhost:3001 (admin/admin)"
	@echo "  Prometheus:    http://localhost:9090"
	@echo "  Database GUI:  http://localhost:8080 (adminer)"
	@echo "  Redis GUI:     http://localhost:8081"
	@echo ""

up-dev: check-env ## Start with development profile (includes dev tools)
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) --profile dev up -d
	@echo "$(GREEN)Development environment started!$(NC)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services stopped$(NC)"

stop: ## Stop services without removing containers
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)Services restarted$(NC)"

# Service Management
logs: ## Show logs for all services
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-api: ## Show API logs
	docker-compose -f $(COMPOSE_FILE) logs -f rag-api

logs-db: ## Show database logs
	docker-compose -f $(COMPOSE_FILE) logs -f postgres

logs-redis: ## Show Redis logs
	docker-compose -f $(COMPOSE_FILE) logs -f redis

logs-nginx: ## Show Nginx logs
	docker-compose -f $(COMPOSE_FILE) logs -f nginx

ps: ## Show running containers
	docker-compose -f $(COMPOSE_FILE) ps

# Development Tools
shell: ## Open shell in API container
	docker-compose -f $(COMPOSE_FILE) exec rag-api bash

shell-db: ## Open PostgreSQL shell
	docker-compose -f $(COMPOSE_FILE) exec postgres psql -U raguser -d ragdb

shell-redis: ## Open Redis CLI
	docker-compose -f $(COMPOSE_FILE) exec redis redis-cli

# Testing
test: ## Run tests inside container
	@echo "$(GREEN)Running tests...$(NC)"
	docker-compose -f $(COMPOSE_FILE) exec rag-api pytest tests/ -v
	@echo "$(GREEN)Tests complete!$(NC)"

test-cov: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	docker-compose -f $(COMPOSE_FILE) exec rag-api pytest tests/ -v --cov=core --cov-report=html
	@echo "$(GREEN)Coverage report generated in htmlcov/$(NC)"

# Health Checks
health: ## Check system health
	@echo "$(GREEN)Checking system health...$(NC)"
	@echo ""
	@echo "$(BLUE)API Health:$(NC)"
	@curl -s http://localhost:8000/health || echo "$(RED)API not responding$(NC)"
	@echo ""
	@echo "$(BLUE)Database Health:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_isready -U raguser -d ragdb || echo "$(RED)Database not ready$(NC)"
	@echo ""
	@echo "$(BLUE)Redis Health:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec redis redis-cli ping || echo "$(RED)Redis not responding$(NC)"
	@echo ""

stats: ## Show container resource usage
	docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Backup and Restore
backup: ## Create system backup
	@echo "$(GREEN)Creating system backup...$(NC)"
	@mkdir -p backups
	@BACKUP_DIR="backups/backup_$(shell date +%Y%m%d_%H%M%S)"; \
	mkdir -p "$$BACKUP_DIR"; \
	echo "$(BLUE)Backing up database...$(NC)"; \
	docker-compose -f $(COMPOSE_FILE) exec -T postgres pg_dump -U raguser ragdb | gzip > "$$BACKUP_DIR/database.sql.gz"; \
	echo "$(BLUE)Backing up application data...$(NC)"; \
	docker cp rag-api:/app/data "$$BACKUP_DIR/app-data" 2>/dev/null || true; \
	echo "$(BLUE)Backing up configuration...$(NC)"; \
	cp $(ENV_FILE) "$$BACKUP_DIR/" 2>/dev/null || true; \
	echo "$(GREEN)Backup created: $$BACKUP_DIR$(NC)"

restore-db: ## Restore database from backup (Usage: make restore-db BACKUP_FILE=path/to/backup.sql.gz)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Usage: make restore-db BACKUP_FILE=path/to/backup.sql.gz$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)WARNING: This will overwrite the current database!$(NC)"
	@read -p "Continue? (y/N) " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(GREEN)Restoring database from $(BACKUP_FILE)...$(NC)"
	gunzip < $(BACKUP_FILE) | docker-compose -f $(COMPOSE_FILE) exec -T postgres psql -U raguser ragdb
	@echo "$(GREEN)Database restore complete$(NC)"

# Cleanup
clean: ## Clean up Docker resources
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "$(GREEN)Cleanup complete$(NC)"

clean-all: ## Clean everything including images
	@echo "$(YELLOW)Cleaning up all Docker resources...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans --rmi all
	docker system prune -a -f --volumes
	@echo "$(GREEN)Full cleanup complete$(NC)"

# Ollama Management
ollama-models: ## Download recommended Ollama models
	@echo "$(GREEN)Downloading recommended Ollama models...$(NC)"
	@echo "$(BLUE)This requires Ollama to be installed on the host system$(NC)"
	ollama pull llama3.2:1b
	ollama pull phi3-mini
	ollama pull mistral
	@echo "$(GREEN)Models downloaded! Update OLLAMA_MODEL in .env to use them$(NC)"

# Development Helpers
format: ## Format code with Black
	docker-compose -f $(COMPOSE_FILE) exec rag-api black core/ tests/ --line-length 100

lint: ## Run linting
	docker-compose -f $(COMPOSE_FILE) exec rag-api flake8 core/ tests/

type-check: ## Run type checking
	docker-compose -f $(COMPOSE_FILE) exec rag-api mypy core/

security-scan: ## Run security scans
	@echo "$(GREEN)Running security scans...$(NC)"
	docker-compose -f $(COMPOSE_FILE) exec rag-api bandit -r core/
	docker-compose -f $(COMPOSE_FILE) exec rag-api safety check

# Monitoring
monitor-start: ## Start monitoring stack
	@echo "$(GREEN)Starting monitoring services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d prometheus grafana
	@echo "$(GREEN)Monitoring started!$(NC)"
	@echo "  Grafana: http://localhost:3001"
	@echo "  Prometheus: http://localhost:9090"

monitor-stop: ## Stop monitoring stack
	docker-compose -f $(COMPOSE_FILE) stop prometheus grafana

# Update and Maintenance
update: ## Pull latest images and restart
	@echo "$(GREEN)Updating system...$(NC)"
	docker-compose -f $(COMPOSE_FILE) pull
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Update complete!$(NC)"

# Production helpers
prod-check: ## Check production readiness
	@echo "$(BLUE)Production Readiness Check$(NC)"
	@echo ""
	@echo "Checking environment variables..."
	@if grep -q "CHANGE_THIS" $(ENV_FILE); then \
		echo "$(RED)❌ Found placeholder values in $(ENV_FILE)$(NC)"; \
		echo "$(YELLOW)   Please update all CHANGE_THIS values$(NC)"; \
	else \
		echo "$(GREEN)✅ No placeholder values found$(NC)"; \
	fi
	@echo ""
	@echo "Checking Docker images..."
	@docker images | grep $(PROJECT_NAME) || echo "$(YELLOW)⚠️  No project images found$(NC)"
	@echo ""
	@echo "Checking SSL certificates..."
	@if [ -f ssl/cert.pem ]; then \
		echo "$(GREEN)✅ SSL certificate found$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  SSL certificate not found$(NC)"; \
	fi

# First-time setup workflow
first-run: setup build up ## Complete first-time setup and start system
	@echo ""
	@echo "$(GREEN)🎉 ProjektSusui RAG System is now running!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "1. Visit http://localhost:8000/admin to access the admin panel"
	@echo "2. Upload some documents to test the system"
	@echo "3. Try asking questions about your documents"
	@echo "4. Monitor the system at http://localhost:3001 (Grafana)"
	@echo ""
	@echo "$(YELLOW)For production deployment:$(NC)"
	@echo "1. Run 'make prod-check' to verify production readiness"
	@echo "2. Update SSL certificates in ssl/ directory"
	@echo "3. Update environment variables for production"
	@echo ""