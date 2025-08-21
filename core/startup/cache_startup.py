"""
Cache Service Startup Module
Initializes caching services during application startup
"""

import logging
import os
from typing import Optional

from ..services.enhanced_cache_service import initialize_enhanced_cache_service

logger = logging.getLogger(__name__)


async def initialize_cache_services() -> bool:
    """
    Initialize cache services during application startup
    
    Returns:
        bool: True if cache services initialized successfully
    """
    try:
        # Get cache configuration from environment
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        file_cache_dir = os.getenv("CACHE_DIR", "data/cache")
        enable_redis = os.getenv("ENABLE_REDIS_CACHE", "true").lower() == "true"
        enable_file_cache = os.getenv("ENABLE_FILE_CACHE", "true").lower() == "true"
        cache_ttl_hours = int(os.getenv("CACHE_TTL_HOURS", "24"))
        
        logger.info(f"Initializing cache services with Redis: {enable_redis}, File: {enable_file_cache}")
        
        # Initialize enhanced cache service
        enhanced_cache = await initialize_enhanced_cache_service(
            redis_url=redis_url,
            file_cache_dir=file_cache_dir,
            enable_redis=enable_redis,
            enable_file_cache=enable_file_cache,
            ttl_hours=cache_ttl_hours,
        )
        
        if enhanced_cache:
            # Get initial stats
            stats = enhanced_cache.get_cache_stats()
            logger.info(f"✅ Cache services initialized successfully")
            logger.info(f"Cache configuration: Redis={enable_redis}, File={enable_file_cache}, TTL={cache_ttl_hours}h")
            
            if enable_redis and enhanced_cache.redis_cache and enhanced_cache.redis_cache.is_available:
                logger.info("🔴 Redis cache: Available")
            else:
                logger.warning("🔴 Redis cache: Not available")
                
            if enable_file_cache:
                logger.info("📁 File cache: Available")
                
            return True
        else:
            logger.error("❌ Failed to initialize cache services")
            return False
            
    except Exception as e:
        logger.error(f"❌ Cache service initialization error: {e}")
        return False


async def cleanup_cache_services():
    """
    Cleanup cache services during application shutdown
    """
    try:
        from ..services.enhanced_cache_service import shutdown_enhanced_cache_service
        
        logger.info("🧹 Shutting down cache services...")
        await shutdown_enhanced_cache_service()
        logger.info("✅ Cache services shutdown completed")
        
    except Exception as e:
        logger.error(f"❌ Cache service cleanup error: {e}")


def get_cache_config() -> dict:
    """
    Get current cache configuration
    
    Returns:
        dict: Cache configuration settings
    """
    return {
        "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379"),
        "cache_dir": os.getenv("CACHE_DIR", "data/cache"),
        "enable_redis": os.getenv("ENABLE_REDIS_CACHE", "true").lower() == "true",
        "enable_file_cache": os.getenv("ENABLE_FILE_CACHE", "true").lower() == "true",
        "ttl_hours": int(os.getenv("CACHE_TTL_HOURS", "24")),
        "redis_db": int(os.getenv("REDIS_DB", "0")),
        "redis_max_connections": int(os.getenv("REDIS_MAX_CONNECTIONS", "20")),
        "enable_compression": os.getenv("ENABLE_CACHE_COMPRESSION", "true").lower() == "true",
    }