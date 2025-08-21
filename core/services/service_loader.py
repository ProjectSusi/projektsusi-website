"""
Service Loader for Dependency Injection
Loads and initializes all services for the application
"""

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class ServiceContainer:
    """Simple service container for dependency injection"""

    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._initialized = False

    def register(self, name: str, service: Any):
        """Register a service"""
        self._services[name] = service
        logger.info(f"Registered service: {name}")

    def get(self, name: str) -> Any:
        """Get a service by name"""
        return self._services.get(name)

    def initialize_services(self):
        """Initialize all core services"""
        if self._initialized:
            return

        logger.info("Initializing services...")

        try:
            # Import and register actual services
            from ..di.services import get_container
            from ..repositories.interfaces import IDocumentRepository, IVectorSearchRepository
            from ..repositories.audit_repository import SwissAuditRepository
            from ..services import (
                DocumentProcessingService,
                QueryProcessingService,
                ValidationService,
            )
            
            container = get_container()
            
            # Register repository services
            if container.is_registered(IDocumentRepository):
                self.register("documents_storage", container.get(IDocumentRepository))
            
            if container.is_registered(IVectorSearchRepository):
                self.register("vector_service", container.get(IVectorSearchRepository))
            
            if container.is_registered(SwissAuditRepository):
                self.register("audit_service", container.get(SwissAuditRepository))
            
            # Register business services
            if container.is_registered(DocumentProcessingService):
                self.register("document_processor", container.get(DocumentProcessingService))
            
            if container.is_registered(QueryProcessingService):
                self.register("query_service", container.get(QueryProcessingService))
            
            if container.is_registered(ValidationService):
                self.register("file_validator", container.get(ValidationService))
            
            # Register LLM services
            try:
                from ..ollama_client import OllamaClient
                if container.is_registered(OllamaClient):
                    self.register("ollama_client", container.get(OllamaClient))
                    self.register("llm_service", container.get(OllamaClient))
            except (ImportError, ValueError):
                logger.warning("Ollama client not available")
            
            # Register cache manager if available
            try:
                from ..services.response_cache import ResponseCache
                self.register("cache_manager", ResponseCache())
            except ImportError:
                logger.warning("Response cache not available")
            
            # System monitor and analytics can remain as None for now
            self.register("system_monitor", None)
            self.register("analytics_service", None)
            self.register("llm_manager", None)
            
        except Exception as e:
            logger.error(f"Failed to initialize services: {e}")
            # Fall back to None services
            self.register("documents_storage", None)
            self.register("document_processor", None)
            self.register("file_validator", None)
            self.register("query_service", None)
            self.register("llm_service", None)
            self.register("vector_service", None)
            self.register("system_monitor", None)
            self.register("cache_manager", None)
            self.register("analytics_service", None)
            self.register("llm_manager", None)
            self.register("ollama_client", None)

        self._initialized = True
        logger.info("Services initialized successfully")

    def is_initialized(self) -> bool:
        """Check if services are initialized"""
        return self._initialized
    
    def refresh_from_container(self):
        """Refresh services from the DI container"""
        try:
            from ..di.services import get_container
            container = get_container()
            
            # Re-initialize with fresh services
            self._initialized = False
            self.initialize_services()
            
            logger.info("Services refreshed from DI container")
        except Exception as e:
            logger.error(f"Failed to refresh services: {e}")
    
    def get_service_stats(self) -> Dict[str, bool]:
        """Get status of all registered services"""
        return {
            name: (service is not None)
            for name, service in self._services.items()
        }


# Global service container
services = ServiceContainer()


def get_service_container() -> ServiceContainer:
    """Get the global service container"""
    return services
