#!/usr/bin/env python3
"""
Modular RAG System API Server
Main application entry point with router-based architecture
"""
import hashlib
import hmac
import logging
import os
import secrets
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

# Import routers
from .routers import (
    admin,
    async_processing,
    auth,
    background_jobs,
    compliance,
    data_retention,
    document_manager,
    documents,
    llm,
    load_balancer,
    metrics,
    performance,
    query,
    s3_storage,
    scaling,
    sso,
    system,
    tenants,
)

# Import DI system
from .di.services import ServiceConfiguration, initialize_services, shutdown_services

# Import multi-tenancy
from .middleware import initialize_tenant_resolver, tenant_middleware
from .middleware.metrics_middleware import MetricsMiddleware
from .processors import register_document_processors
from .repositories.tenant_repository import TenantRepository

# Import async processing
from .services.async_processing_service import (
    initialize_async_processor,
    shutdown_async_processor,
)

# Import compliance service
from .services.compliance_service import initialize_compliance_service

# Import metrics
from .services.metrics_service import init_metrics_service
from .utils.encryption import setup_encryption_from_config

# Import security
from .utils.security import initialize_id_obfuscator

# Import load balancer service and middleware
from .services.load_balancer_service import (
    initialize_load_balancer_service,
    shutdown_load_balancer_service,
    LoadBalancingStrategy
)
from .middleware.load_balancer_middleware import create_load_balancer_middleware
from .utils.load_balancer_setup import setup_default_backends, configure_load_balancer_strategy

# Logger setup
logger = logging.getLogger(__name__)

# Optional routers (may not be available in all environments)
try:
    from .routers import progress

    PROGRESS_ROUTER_AVAILABLE = True
except ImportError:
    PROGRESS_ROUTER_AVAILABLE = False

try:
    from .routers import cache

    CACHE_ROUTER_AVAILABLE = True
except ImportError:
    CACHE_ROUTER_AVAILABLE = False

# Import progress tracking
try:
    from .services.progress_tracking_service import initialize_progress_tracker

    PROGRESS_TRACKING_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Progress tracking not available: {e}")
    PROGRESS_TRACKING_AVAILABLE = False

    async def initialize_progress_tracker(*args, **kwargs):
        return None


# Import cache service
try:
    from .services.redis_cache_service import (
        initialize_cache_service,
        shutdown_cache_service,
    )

    CACHE_SERVICE_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Cache service not available: {e}")
    CACHE_SERVICE_AVAILABLE = False

    async def initialize_cache_service(*args, **kwargs):
        return None

    async def shutdown_cache_service():
        pass


# Import configuration
try:
    from .config.config import config

    CONFIG_AVAILABLE = True
except ImportError:
    config = None
    CONFIG_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    # Startup
    logger.info("Starting modular RAG API server...")

    try:
        # Configure and initialize all services via DI
        logger.info("Configuring dependency injection...")
        ServiceConfiguration.configure_all()

        logger.info("Initializing services...")
        success = await initialize_services()

        if not success:
            logger.error("Service initialization failed!")
            raise RuntimeError("Failed to initialize services")

        logger.info("All services initialized successfully")

        # Initialize security
        logger.info("Initializing security systems...")
        secret_key = (
            config.SECRET_KEY
            if CONFIG_AVAILABLE and config and hasattr(config, "SECRET_KEY")
            else "default-secret-key"
        )
        initialize_id_obfuscator(secret_key)

        # Initialize encryption if enabled
        if CONFIG_AVAILABLE and config:
            encryption_setup = setup_encryption_from_config(config)
            if encryption_setup:
                logger.info("Encryption enabled and configured")
            else:
                logger.info("Encryption disabled or not configured")
        else:
            logger.info("No config available, encryption disabled")

        logger.info("Security systems initialized successfully")

        # Initialize multi-tenancy
        logger.info("Initializing multi-tenancy...")
        db_path = (
            config.DATABASE_PATH
            if CONFIG_AVAILABLE and config and hasattr(config, "DATABASE_PATH")
            else "data/rag_database.db"
        )
        tenant_repo = TenantRepository(db_path)
        initialize_tenant_resolver(tenant_repo)
        logger.info("Multi-tenancy initialized successfully")

        # Initialize metrics service
        logger.info("Initializing metrics service...")
        init_metrics_service()
        logger.info("Metrics service initialized successfully")

        # Initialize performance monitoring service
        logger.info("Initializing performance monitoring service...")
        from .services.performance_monitoring_service import init_performance_service
        perf_service = init_performance_service()
        
        # Setup alert handlers
        def log_performance_alert(alert):
            logger.warning(f"Performance Alert [{alert.severity.upper()}]: {alert.description}")
            if alert.recommendations:
                logger.info(f"Recommendations: {', '.join(alert.recommendations[:3])}")
        
        perf_service.add_alert_handler(log_performance_alert)
        logger.info("Performance monitoring service initialized successfully")

        # Initialize async processing service
        logger.info("Initializing async document processing...")
        await initialize_async_processor(max_workers=4)
        await register_document_processors()
        logger.info("Async document processing initialized successfully")

        # Initialize compliance service
        logger.info("Initializing compliance service...")
        initialize_compliance_service(
            storage_path="data/compliance",
            enable_audit_logging=True,
            data_residency_region="CH",
        )
        logger.info("Compliance service initialized successfully")

        # Initialize SSO service
        logger.info("Initializing SSO service...")
        try:
            from .utils.sso_providers import auto_configure_sso_from_environment, validate_sso_configuration
            
            # Auto-configure SSO from environment
            await auto_configure_sso_from_environment()
            
            # Validate SSO configuration
            validation = validate_sso_configuration()
            if validation.get('status') == 'valid':
                logger.info("SSO service initialized successfully")
                
                providers = validation.get('providers', {})
                if providers:
                    provider_names = list(providers.keys())
                    logger.info(f"SSO providers available: {', '.join(provider_names)}")
                else:
                    logger.info("SSO service ready but no providers configured")
            else:
                issues = validation.get('issues', [])
                if issues:
                    logger.warning(f"SSO configuration issues: {'; '.join(issues)}")
                else:
                    logger.info("SSO service initialized (configuration not fully validated)")
                    
        except Exception as e:
            logger.warning(f"SSO service initialization failed: {e}")
            logger.info("System will continue without SSO capabilities")

        # Initialize data retention service
        logger.info("Initializing data retention service...")
        try:
            from .services.data_retention_service import initialize_retention_service
            from .services.compliance_service import get_compliance_service
            from .repositories.document_repository import DocumentRepository
            from .repositories.user_repository import UserRepository
            from .di.services import get_container
            
            # Get repositories
            container = get_container()
            document_repo = container.get("IDocumentRepository", DocumentRepository("data/rag_database.db"))
            user_repo = container.get("IUserRepository", UserRepository("data/rag_database.db"))
            
            # Get compliance service
            compliance_service = get_compliance_service()
            
            # Initialize retention service
            retention_service = await initialize_retention_service(
                document_repo=document_repo,
                user_repo=user_repo,
                compliance_service=compliance_service,
                config_file="config/retention_policies.json",
                start_scheduler=True
            )
            
            # Generate initial report
            report = await retention_service.generate_retention_report()
            logger.info(f"Data retention service initialized successfully")
            logger.info(f"Retention overview: {report.total_entities} entities, {report.expired} expired, {report.legal_holds} legal holds")
            
        except Exception as e:
            logger.warning(f"Data retention service initialization failed: {e}")
            logger.info("System will continue without data retention capabilities")

        # Initialize progress tracking service
        if PROGRESS_TRACKING_AVAILABLE:
            logger.info("Initializing progress tracking service...")
            await initialize_progress_tracker(
                persistence_file="data/progress_operations.json"
            )
            logger.info("Progress tracking service initialized successfully")
        else:
            logger.info("Progress tracking service not available")

        # Initialize cache service (Redis)
        if CACHE_SERVICE_AVAILABLE:
            logger.info("Initializing cache service...")
            redis_url = (
                config.REDIS_URL
                if CONFIG_AVAILABLE and config and hasattr(config, "REDIS_URL")
                else "redis://localhost:6379"
            )
            redis_db = (
                config.REDIS_DB
                if CONFIG_AVAILABLE and config and hasattr(config, "REDIS_DB")
                else 0
            )
            await initialize_cache_service(
                redis_url=redis_url, redis_db=redis_db, enable_compression=True
            )
            logger.info("Cache service initialization completed")
        else:
            logger.info("Cache service not available")

        # Initialize load balancer service
        logger.info("Initializing load balancer service...")
        default_strategy = (
            LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN
            if CONFIG_AVAILABLE and config and hasattr(config, "LOAD_BALANCER_STRATEGY")
            else LoadBalancingStrategy.ROUND_ROBIN
        )
        lb_service = await initialize_load_balancer_service(default_strategy)
        
        # Set up default backends
        await setup_default_backends(lb_service)
        
        # Configure strategy from environment
        await configure_load_balancer_strategy()
        
        logger.info("Load balancer service initialized successfully")

        # Initialize horizontal scaling service
        logger.info("Initializing horizontal scaling service...")
        try:
            from .services.scaling_service import initialize_scaling_service, ComponentType
            
            # Configure scaling settings from environment
            auto_scaling_enabled = (
                config.AUTO_SCALING_ENABLED
                if CONFIG_AVAILABLE and config and hasattr(config, "AUTO_SCALING_ENABLED")
                else os.getenv("AUTO_SCALING_ENABLED", "true").lower() == "true"
            )
            
            scaling_check_interval = (
                config.SCALING_CHECK_INTERVAL
                if CONFIG_AVAILABLE and config and hasattr(config, "SCALING_CHECK_INTERVAL")
                else int(os.getenv("SCALING_CHECK_INTERVAL", "60"))
            )
            
            scaling_service = await initialize_scaling_service(
                check_interval_seconds=scaling_check_interval,
                enable_auto_scaling=auto_scaling_enabled
            )
            
            # Configure default scaling thresholds for key components
            await _configure_default_scaling_thresholds(scaling_service)
            
            logger.info(f"Horizontal scaling service initialized (auto-scaling: {auto_scaling_enabled})")
        except Exception as e:
            logger.warning(f"Failed to initialize scaling service: {e}")
            logger.info("System will continue without horizontal scaling capabilities")

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down modular RAG API server...")
    try:
        # Shutdown services in reverse order
        try:
            from .services.scaling_service import shutdown_scaling_service
            await shutdown_scaling_service()
            logger.info("Horizontal scaling service shutdown completed")
        except Exception as e:
            logger.warning(f"Scaling service shutdown error: {e}")
        
        try:
            from .services.data_retention_service import shutdown_retention_service
            await shutdown_retention_service()
            logger.info("Data retention service shutdown completed")
        except Exception as e:
            logger.warning(f"Data retention service shutdown error: {e}")
        
        await shutdown_load_balancer_service()
        if CACHE_SERVICE_AVAILABLE:
            await shutdown_cache_service()
        await shutdown_async_processor()
        await shutdown_services()
    except Exception as e:
        logger.error(f"Shutdown error: {e}")


async def _configure_default_scaling_thresholds(scaling_service):
    """Configure default scaling thresholds for system components"""
    try:
        from .services.scaling_service import ComponentType
        
        # Configure API Workers scaling based on CPU and response time
        scaling_service.configure_component_scaling(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=70.0,      # Scale up when CPU > 70%
            scale_down_threshold=30.0,    # Scale down when CPU < 30%
            min_instances=2,              # Always keep at least 2 workers
            max_instances=8,              # Maximum 8 workers
            cooldown_seconds=300          # 5 minute cooldown
        )
        
        # Configure Background Job processing
        scaling_service.configure_component_scaling(
            component=ComponentType.BACKGROUND_JOBS,
            metric_name="queue_length",
            scale_up_threshold=10.0,      # Scale up when queue > 10
            scale_down_threshold=2.0,     # Scale down when queue < 2
            min_instances=1,
            max_instances=6,
            cooldown_seconds=180          # 3 minute cooldown
        )
        
        # Configure Document Processors
        scaling_service.configure_component_scaling(
            component=ComponentType.DOCUMENT_PROCESSORS,
            metric_name="response_time_ms",
            scale_up_threshold=2000.0,    # Scale up when response time > 2s
            scale_down_threshold=500.0,   # Scale down when response time < 0.5s
            min_instances=1,
            max_instances=4,
            cooldown_seconds=240          # 4 minute cooldown
        )
        
        # Configure Database Connections based on connection count
        scaling_service.configure_component_scaling(
            component=ComponentType.DATABASE_CONNECTIONS,
            metric_name="active_connections",
            scale_up_threshold=80.0,      # Scale up when connections > 80
            scale_down_threshold=20.0,    # Scale down when connections < 20
            min_instances=5,              # Minimum connection pool size
            max_instances=50,             # Maximum connections
            cooldown_seconds=120          # 2 minute cooldown
        )
        
        # Register custom metric collectors
        await _register_custom_metrics(scaling_service)
        
        # Register component scalers
        await _register_component_scalers(scaling_service)
        
        logger.info("Default scaling thresholds configured successfully")
        
    except Exception as e:
        logger.error(f"Failed to configure default scaling thresholds: {e}")


async def _register_custom_metrics(scaling_service):
    """Register custom metrics for scaling decisions"""
    try:
        # Register queue length metric (placeholder - would connect to actual queue)
        def get_queue_length():
            try:
                # In a real implementation, this would check Redis queue, database, etc.
                # For now, return a simulated value based on system load
                import psutil
                return max(0, (psutil.cpu_percent() - 50) / 10)  # Rough approximation
            except:
                return 0.0
        
        scaling_service.register_metric_collector("queue_length", get_queue_length)
        
        # Register response time metric (would integrate with performance monitoring)
        def get_avg_response_time():
            try:
                # This would integrate with the performance monitoring service
                from .services.performance_monitoring_service import get_performance_service
                perf_service = get_performance_service()
                samples = perf_service.collector.get_samples("http_request_duration_seconds")
                if samples:
                    recent_samples = samples[-10:]  # Last 10 samples
                    avg_duration = sum(s.value for s in recent_samples) / len(recent_samples)
                    return avg_duration * 1000  # Convert to milliseconds
                return 0.0
            except:
                return 0.0
        
        scaling_service.register_metric_collector("response_time_ms", get_avg_response_time)
        
        logger.info("Custom metrics registered successfully")
        
    except Exception as e:
        logger.error(f"Failed to register custom metrics: {e}")


async def _register_component_scalers(scaling_service):
    """Register component scaler functions"""
    try:
        from .services.scaling_service import ComponentType, ScalingAction
        
        # API Workers scaler (placeholder - would integrate with process manager)
        async def scale_api_workers(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
            try:
                logger.info(f"Scaling API workers: target={target_instances}, action={action.value}")
                # In production, this would:
                # - Start/stop worker processes
                # - Update load balancer configuration
                # - Coordinate with container orchestrator (K8s, Docker Compose)
                
                # For now, simulate successful scaling
                import asyncio
                await asyncio.sleep(1)  # Simulate scaling time
                return True
            except Exception as e:
                logger.error(f"Failed to scale API workers: {e}")
                return False
        
        # Background Jobs scaler
        async def scale_background_jobs(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
            try:
                logger.info(f"Scaling background job workers: target={target_instances}, action={action.value}")
                # Would integrate with Redis/Celery worker management
                await asyncio.sleep(0.5)
                return True
            except Exception as e:
                logger.error(f"Failed to scale background jobs: {e}")
                return False
        
        # Document Processors scaler
        async def scale_document_processors(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
            try:
                logger.info(f"Scaling document processors: target={target_instances}, action={action.value}")
                # Would integrate with document processing service
                await asyncio.sleep(0.5)
                return True
            except Exception as e:
                logger.error(f"Failed to scale document processors: {e}")
                return False
        
        # Database Connections scaler
        async def scale_database_connections(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
            try:
                logger.info(f"Scaling database connections: target={target_instances}, action={action.value}")
                # Would update connection pool size
                await asyncio.sleep(0.2)
                return True
            except Exception as e:
                logger.error(f"Failed to scale database connections: {e}")
                return False
        
        # Register all scalers
        scaling_service.register_component_scaler(ComponentType.API_WORKERS, scale_api_workers)
        scaling_service.register_component_scaler(ComponentType.BACKGROUND_JOBS, scale_background_jobs)
        scaling_service.register_component_scaler(ComponentType.DOCUMENT_PROCESSORS, scale_document_processors)
        scaling_service.register_component_scaler(ComponentType.DATABASE_CONNECTIONS, scale_database_connections)
        
        logger.info("Component scalers registered successfully")
        
    except Exception as e:
        logger.error(f"Failed to register component scalers: {e}")


# Create FastAPI app
app = FastAPI(
    title="RAG System API",
    description="Modular Retrieval-Augmented Generation System",
    version="1.0.0",
    lifespan=lifespan,
)

# CSRF Token Management
CSRF_SECRET_KEY = (
    getattr(config, "SECRET_KEY", "default-secret-key")
    if CONFIG_AVAILABLE and config
    else "default-secret-key"
)


def generate_csrf_token() -> str:
    """Generate a secure CSRF token"""
    token = secrets.token_urlsafe(32)
    timestamp = str(int(time.time()))
    message = f"{token}:{timestamp}"
    signature = hmac.new(
        CSRF_SECRET_KEY.encode(), message.encode(), hashlib.sha256
    ).hexdigest()
    return f"{token}:{timestamp}:{signature}"


def validate_csrf_token(token: str) -> bool:
    """Validate CSRF token"""
    try:
        parts = token.split(":")
        if len(parts) != 3:
            return False

        token_part, timestamp, signature = parts
        message = f"{token_part}:{timestamp}"
        expected_signature = hmac.new(
            CSRF_SECRET_KEY.encode(), message.encode(), hashlib.sha256
        ).hexdigest()

        # Check signature
        if not hmac.compare_digest(signature, expected_signature):
            return False

        # Check if token is not too old (24 hours)
        token_age = time.time() - int(timestamp)
        if token_age > 86400:  # 24 hours
            return False

        return True
    except (ValueError, TypeError):
        return False


# Security Headers Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)

    # Content Security Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # HSTS (only add if HTTPS)
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

    # Remove server information
    if "server" in response.headers:
        del response.headers["server"]

    return response


# CSRF Middleware
@app.middleware("http")
async def csrf_middleware(request: Request, call_next):
    """CSRF protection middleware"""
    # Skip CSRF for GET, HEAD, OPTIONS requests
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        response = await call_next(request)
        return response

    # Skip CSRF for health checks and system endpoints
    if request.url.path in ["/health", "/api/v1/health", "/api/v1/status"]:
        response = await call_next(request)
        return response

    # For state-changing requests, check CSRF token
    csrf_token = request.headers.get("X-CSRF-Token")
    if not csrf_token:
        # Also check in form data for HTML forms
        if request.headers.get("content-type", "").startswith(
            "application/x-www-form-urlencoded"
        ):
            try:
                form = await request.form()
                csrf_token = form.get("csrf_token")
            except Exception as e:
                logger.debug(f"Failed to parse form data for CSRF token: {e}")
                csrf_token = None

    if not csrf_token or not validate_csrf_token(csrf_token):
        raise HTTPException(status_code=403, detail="CSRF token missing or invalid")

    response = await call_next(request)
    return response


# Add security middleware
app.add_middleware(SessionMiddleware, secret_key=CSRF_SECRET_KEY)
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["*"]
)  # Configure for production

# Add tenant middleware
app.middleware("http")(tenant_middleware)

# Add metrics middleware
app.add_middleware(MetricsMiddleware, collect_detailed_metrics=True)

# Add load balancer middleware
load_balancer_enabled = (
    config.LOAD_BALANCER_ENABLED
    if CONFIG_AVAILABLE and config and hasattr(config, "LOAD_BALANCER_ENABLED")
    else os.getenv("LOAD_BALANCER_ENABLED", "true").lower() == "true"
)
if load_balancer_enabled:
    LoadBalancerMiddleware = create_load_balancer_middleware(
        enabled=True,
        strategy=LoadBalancingStrategy.ADAPTIVE,
        bypass_paths=["/health", "/docs", "/openapi.json", "/static", "/api/v1/load-balancer", "/ui"]
    )
    app.add_middleware(LoadBalancerMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(documents.router)
app.include_router(query.router)
app.include_router(system.router)
app.include_router(llm.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(sso.router)
app.include_router(s3_storage.router)
app.include_router(background_jobs.router)
app.include_router(scaling.router)
app.include_router(load_balancer.router)
app.include_router(document_manager.router)
app.include_router(metrics.router)
app.include_router(performance.router)
app.include_router(async_processing.router)
app.include_router(compliance.router)
app.include_router(data_retention.router)
if PROGRESS_ROUTER_AVAILABLE:
    app.include_router(progress.router)
if CACHE_ROUTER_AVAILABLE:
    app.include_router(cache.router)

app.include_router(tenants.router)


# Root endpoint - redirect to UI
@app.get("/", response_class=HTMLResponse)
async def root():
    """Redirect root to the web interface"""
    return HTMLResponse(
        """
    <script>window.location.href = '/ui'</script>
    <p>Redirecting to <a href="/ui">web interface</a>...</p>
    """
    )


# API info endpoint
@app.get("/api")
async def api_info():
    """API information endpoint"""
    return {
        "message": "RAG System API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "ui": "/ui",
    }


# CSRF token endpoint
@app.get("/api/v1/csrf-token")
async def get_csrf_token():
    """Get CSRF token for form submissions"""
    return {"csrf_token": generate_csrf_token(), "expires_in": 86400}  # 24 hours


# Modern frontend
@app.get("/ui", response_class=HTMLResponse)
async def get_ui():
    """Modern web interface"""
    try:
        static_path = Path("static/index.html")
        if static_path.exists():
            with open(static_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            # Fallback to simple interface
            return HTMLResponse(
                """
            <!DOCTYPE html>
            <html>
            <head>
                <title>RAG System</title>
                <style>body { font-family: Arial, sans-serif; margin: 40px; }</style>
            </head>
            <body>
                <h1>RAG System</h1>
                <p>Frontend file not found. Please ensure static/index.html exists.</p>
                <ul>
                    <li><a href="/docs">API Documentation</a></li>
                    <li><a href="/health">Health Check</a></li>
                    <li><a href="/api">API Info</a></li>
                </ul>
            </body>
            </html>
            """
            )
    except Exception as e:
        return HTMLResponse(
            f"""
        <h1>Error loading frontend</h1>
        <p>Error: {str(e)}</p>
        <p><a href="/docs">Go to API Documentation</a></p>
        """
        )


if __name__ == "__main__":
    import uvicorn

    # Get configuration
    host = config.API_HOST if CONFIG_AVAILABLE and config else "127.0.0.1"
    port = config.API_PORT if CONFIG_AVAILABLE and config else 8002

    # Run the application
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,  # Disable reload to avoid import issues
        log_level="info",
    )
