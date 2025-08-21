"""
Service Registration for RAG System
Configures all services in the DI container
"""

import logging
from typing import Optional

from ..repositories.audit_repository import SwissAuditRepository
from ..repositories.factory import RepositoryFactory, get_rag_repository
from ..repositories.interfaces import IDocumentRepository, IVectorSearchRepository, IUserRepository
from ..repositories.user_repository import SQLiteUserRepository
from .container import DIContainer, get_container

try:
    from ..config.config import config
except ImportError:
    config = None
from ..services import (
    DocumentProcessingService,
    QueryProcessingService,
    ValidationService,
)

logger = logging.getLogger(__name__)


class ServiceConfiguration:
    """Centralizes service configuration for the RAG system"""

    @staticmethod
    def configure_repositories(container: DIContainer) -> DIContainer:
        """Configure repository services"""

        # Register repository factory as singleton
        container.register_singleton(RepositoryFactory, lambda: RepositoryFactory())

        # Register main repository aggregate
        container.register_singleton(
            type(get_rag_repository()),  # ProductionRAGRepository type
            lambda: RepositoryFactory.create_production_repository(),
        )

        # Register individual repository interfaces
        container.register_singleton(
            IDocumentRepository, lambda: get_rag_repository().documents
        )

        container.register_singleton(
            IVectorSearchRepository, lambda: get_rag_repository().vector_search
        )

        container.register_singleton(
            SwissAuditRepository, lambda: get_rag_repository().audit
        )

        # Register user repository
        container.register_singleton(
            IUserRepository, lambda: SQLiteUserRepository()
        )

        logger.info("Configured repository services")
        return container

    @staticmethod
    def configure_llm_services(container: DIContainer) -> DIContainer:
        """Configure LLM and AI services"""

        # These will be implemented when we extract services from simple_api.py
        try:
            # Register Ollama client if available
            from ..ollama_client import OllamaClient

            # Test if Ollama is accessible
            OllamaClient()

            container.register_singleton(OllamaClient, lambda: OllamaClient())
            logger.info("✅ Configured Ollama client service successfully")
        except ImportError as e:
            logger.warning(f"Ollama client import failed: {e}")
        except Exception as e:
            logger.warning(f"Ollama client not available: {e}")

        # TODO: Register other LLM services
        # - EmbeddingService
        # - QueryService
        # - LLMManagerService

        return container

    @staticmethod
    def configure_business_services(container: DIContainer) -> DIContainer:
        """Configure business logic services"""

        # Register ValidationService as singleton
        container.register_singleton(ValidationService, lambda: ValidationService())

        # Register S3 Storage Service (if enabled)
        s3_storage = None
        try:
            if config and getattr(config, 'USE_S3_STORAGE', False):
                from ..services.s3_storage_service import S3StorageService
                
                s3_storage = S3StorageService(
                    endpoint_url=getattr(config, 'S3_ENDPOINT_URL', None),
                    aws_access_key_id=getattr(config, 'S3_ACCESS_KEY_ID', None),
                    aws_secret_access_key=getattr(config, 'S3_SECRET_ACCESS_KEY', None),
                    bucket_name=getattr(config, 'S3_BUCKET_NAME', 'rag-documents'),
                    region_name=getattr(config, 'S3_REGION', 'us-east-1'),
                )
                
                container.register_singleton(S3StorageService, lambda: s3_storage)
                logger.info("✅ S3 storage service registered")
        except ImportError as e:
            logger.warning(f"S3 storage service not available: {e}")
        except Exception as e:
            logger.error(f"S3 storage service initialization failed: {e}")

        # Register DocumentProcessingService with metrics
        container.register_singleton(
            DocumentProcessingService,
            lambda: DocumentProcessingService(
                doc_repo=container.get(IDocumentRepository),
                vector_repo=container.get(IVectorSearchRepository),
                audit_repo=container.get(SwissAuditRepository),
                s3_storage=s3_storage,
            ),
        )

        # Register QueryProcessingService
        container.register_singleton(
            QueryProcessingService,
            lambda: QueryProcessingService(
                doc_repo=container.get(IDocumentRepository),
                vector_repo=container.get(IVectorSearchRepository),
                audit_repo=container.get(SwissAuditRepository),
                ollama_client=container.get_optional("OllamaClient"),
            ),
        )

        # Register AuthenticationService (if auth is enabled)
        try:
            if config and getattr(config, 'AUTH_ENABLED', False):
                from ..services.auth_service import AuthenticationService
                
                container.register_singleton(
                    AuthenticationService,
                    lambda: AuthenticationService(
                        user_repository=container.get(IUserRepository)
                    ),
                )
                logger.info("✅ Authentication service registered")
            else:
                logger.info("Authentication service disabled in configuration")
        except ImportError as e:
            logger.warning(f"Authentication service not available: {e}")

        logger.info("Business services configured")
        return container

    @staticmethod
    def configure_infrastructure_services(container: DIContainer) -> DIContainer:
        """Configure infrastructure services"""

        # Configuration service
        if config:
            container.register_instance(type(config), config)
            logger.info("Registered configuration service")

        # Register metrics service
        try:
            from ..services.metrics_service import get_metrics_service, MetricsService
            metrics_service = get_metrics_service()
            container.register_instance(MetricsService, metrics_service)
            logger.info("✅ Metrics service registered in DI container")
        except ImportError as e:
            logger.warning(f"Metrics service not available: {e}")
        except Exception as e:
            logger.error(f"Metrics service registration failed: {e}")

        # Register performance monitoring service
        try:
            from ..services.performance_monitoring_service import get_performance_service, PerformanceMonitoringService
            performance_service = get_performance_service()
            container.register_instance(PerformanceMonitoringService, performance_service)
            logger.info("✅ Performance monitoring service registered in DI container")
        except ImportError as e:
            logger.warning(f"Performance monitoring service not available: {e}")
        except Exception as e:
            logger.error(f"Performance monitoring service registration failed: {e}")

        # TODO: Register other infrastructure services
        # - LoggingService
        # - MonitoringService
        # - HealthCheckService

        return container

    @staticmethod
    def configure_all(container: Optional[DIContainer] = None) -> DIContainer:
        """Configure all services for the RAG system"""

        if container is None:
            container = get_container()

        try:
            # Configure in dependency order
            ServiceConfiguration.configure_infrastructure_services(container)
            ServiceConfiguration.configure_repositories(container)
            ServiceConfiguration.configure_llm_services(container)
            ServiceConfiguration.configure_business_services(container)

            logger.info("All services configured successfully")
            return container

        except Exception as e:
            logger.error(f"Service configuration failed: {e}")
            raise


# FastAPI dependency providers
def get_document_repository() -> IDocumentRepository:
    """FastAPI dependency for document repository"""
    return get_container().get(IDocumentRepository)


def get_vector_search_repository() -> IVectorSearchRepository:
    """FastAPI dependency for vector search repository"""
    return get_container().get(IVectorSearchRepository)


def get_audit_repository() -> SwissAuditRepository:
    """FastAPI dependency for audit repository"""
    return get_container().get(SwissAuditRepository)


def get_ollama_client():
    """FastAPI dependency for Ollama client"""
    try:
        from ..ollama_client import OllamaClient

        return get_container().get(OllamaClient)
    except (ImportError, ValueError):
        return None


def get_document_service() -> DocumentProcessingService:
    """FastAPI dependency for document processing service"""
    return get_container().get(DocumentProcessingService)


def get_query_service() -> QueryProcessingService:
    """FastAPI dependency for query processing service"""
    return get_container().get(QueryProcessingService)


def get_validation_service() -> ValidationService:
    """FastAPI dependency for validation service"""
    return get_container().get(ValidationService)


def get_auth_service():
    """FastAPI dependency for authentication service"""
    try:
        from ..services.auth_service import AuthenticationService
        return get_container().get(AuthenticationService)
    except (ImportError, ValueError):
        return None


def get_user_repository() -> IUserRepository:
    """FastAPI dependency for user repository"""
    return get_container().get(IUserRepository)


# Convenience functions for common patterns
def with_repositories(func):
    """Decorator that injects common repositories"""
    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        container = get_container()

        if "doc_repo" not in kwargs:
            kwargs["doc_repo"] = container.get(IDocumentRepository)
        if "vector_repo" not in kwargs:
            kwargs["vector_repo"] = container.get(IVectorSearchRepository)
        if "audit_repo" not in kwargs:
            kwargs["audit_repo"] = container.get(SwissAuditRepository)

        return func(*args, **kwargs)

    return wrapper


async def initialize_services() -> bool:
    """Initialize all services in the container"""
    try:
        container = get_container()

        # Configure services if not already done
        if not container.is_registered(IDocumentRepository):
            ServiceConfiguration.configure_all(container)

        # Initialize all services
        success = await container.initialize_all()

        if success:
            logger.info("All services initialized successfully")
        else:
            logger.error("Service initialization failed")

        return success

    except Exception as e:
        logger.error(f"Service initialization error: {e}")
        return False


async def shutdown_services():
    """Shutdown all services"""
    try:
        container = get_container()
        await container.shutdown_all()
        logger.info("All services shutdown completed")
    except Exception as e:
        logger.error(f"Service shutdown error: {e}")


def get_service_status() -> dict:
    """Get status of all services"""
    try:
        container = get_container()
        return container.get_service_info()
    except Exception as e:
        return {"error": str(e)}
