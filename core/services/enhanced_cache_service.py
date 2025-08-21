"""
Enhanced Caching Service for RAG System
Combines Redis cache with file-based fallback for optimal performance
"""

import asyncio
import hashlib
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

from .redis_cache_service import (
    CacheKeyType,
    RedisCacheService,
    get_cache_service,
    initialize_cache_service,
)
from .response_cache import ResponseCache

logger = logging.getLogger(__name__)


class EnhancedCacheService:
    """Enhanced caching service with Redis primary and file-based fallback"""

    def __init__(
        self,
        redis_url: Optional[str] = None,
        file_cache_dir: str = "data/cache",
        enable_redis: bool = True,
        enable_file_cache: bool = True,
        ttl_hours: int = 24,
    ):
        self.enable_redis = enable_redis
        self.enable_file_cache = enable_file_cache
        self.ttl_hours = ttl_hours
        
        # Initialize Redis cache service
        self.redis_cache: Optional[RedisCacheService] = None
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        
        # Initialize file-based cache as fallback
        self.file_cache = ResponseCache(cache_dir=file_cache_dir, ttl_hours=ttl_hours)
        
        # Cache statistics
        self.stats = {
            "redis_hits": 0,
            "redis_misses": 0,
            "file_hits": 0,
            "file_misses": 0,
            "sets": 0,
            "errors": 0,
        }
        
        logger.info(f"Enhanced cache service initialized with Redis: {enable_redis}, File: {enable_file_cache}")

    async def initialize(self) -> bool:
        """Initialize the cache service"""
        success = True
        
        if self.enable_redis:
            try:
                self.redis_cache = await initialize_cache_service(
                    redis_url=self.redis_url,
                    redis_db=0,
                    default_ttl=self.ttl_hours * 3600,  # Convert to seconds
                    enable_compression=True,
                    key_prefix="rag_enhanced"
                )
                
                if self.redis_cache and self.redis_cache.is_available:
                    logger.info("✅ Redis cache initialized successfully")
                else:
                    logger.warning("⚠️ Redis cache initialization failed, using file cache only")
                    self.enable_redis = False
                    
            except Exception as e:
                logger.error(f"❌ Redis cache initialization error: {e}")
                self.enable_redis = False
                
        if not self.enable_redis:
            logger.info("📁 Using file-based cache only")
            
        return success

    async def close(self):
        """Close cache connections"""
        if self.redis_cache:
            await self.redis_cache.close()
            
        # Cleanup file cache if needed
        try:
            self.file_cache.clear_expired()
        except Exception as e:
            logger.warning(f"File cache cleanup error: {e}")

    def _generate_query_key(self, query: str, context: str) -> str:
        """Generate a standardized cache key for query results"""
        # Create deterministic hash from query and context
        combined = f"{query}|{context[:2000]}"  # Limit context for performance
        return hashlib.sha256(combined.encode()).hexdigest()

    async def get_query_result(
        self, 
        query: str, 
        context: str, 
        tenant_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get cached query result with Redis primary, file fallback"""
        try:
            cache_key = self._generate_query_key(query, context)
            
            # Try Redis cache first
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                try:
                    cached_result = await self.redis_cache.get_query_cache(
                        query=cache_key,  # Use hash as query for Redis
                        tenant_id=tenant_id
                    )
                    
                    if cached_result:
                        self.stats["redis_hits"] += 1
                        logger.debug(f"🎯 Redis cache hit for query: {query[:50]}...")
                        return cached_result.get("result", cached_result)
                    else:
                        self.stats["redis_misses"] += 1
                        
                except Exception as e:
                    logger.warning(f"Redis cache get error: {e}")
                    self.stats["errors"] += 1
            
            # Fallback to file cache
            if self.enable_file_cache:
                try:
                    cached_result = self.file_cache.get(query, context)
                    if cached_result:
                        self.stats["file_hits"] += 1
                        logger.debug(f"📁 File cache hit for query: {query[:50]}...")
                        
                        # Promote to Redis cache if available
                        if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                            asyncio.create_task(self._promote_to_redis(
                                cache_key, cached_result, tenant_id
                            ))
                            
                        return cached_result
                    else:
                        self.stats["file_misses"] += 1
                        
                except Exception as e:
                    logger.warning(f"File cache get error: {e}")
                    self.stats["errors"] += 1
            
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            self.stats["errors"] += 1
            return None

    async def set_query_result(
        self,
        query: str,
        context: str,
        result: Dict[str, Any],
        tenant_id: Optional[str] = None,
        ttl_override: Optional[int] = None
    ) -> bool:
        """Set query result in cache with both Redis and file storage"""
        try:
            cache_key = self._generate_query_key(query, context)
            success = False
            
            # Store in Redis cache
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                try:
                    redis_ttl = ttl_override or (self.ttl_hours * 3600)
                    redis_success = await self.redis_cache.set_query_cache(
                        query=cache_key,  # Use hash as query for Redis
                        result=result,
                        tenant_id=tenant_id,
                        ttl=redis_ttl
                    )
                    
                    if redis_success:
                        success = True
                        logger.debug(f"💾 Redis cache set for query: {query[:50]}...")
                        
                except Exception as e:
                    logger.warning(f"Redis cache set error: {e}")
                    self.stats["errors"] += 1
            
            # Store in file cache as backup
            if self.enable_file_cache:
                try:
                    self.file_cache.set(query, context, result)
                    success = True
                    logger.debug(f"📁 File cache set for query: {query[:50]}...")
                    
                except Exception as e:
                    logger.warning(f"File cache set error: {e}")
                    self.stats["errors"] += 1
            
            if success:
                self.stats["sets"] += 1
                
            return success
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            self.stats["errors"] += 1
            return False

    async def _promote_to_redis(
        self, 
        cache_key: str, 
        result: Dict[str, Any], 
        tenant_id: Optional[str]
    ) -> None:
        """Promote file cache result to Redis cache"""
        try:
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                await self.redis_cache.set_query_cache(
                    query=cache_key,
                    result=result,
                    tenant_id=tenant_id,
                    ttl=self.ttl_hours * 3600
                )
                logger.debug(f"⬆️ Promoted result to Redis cache: {cache_key[:16]}...")
                
        except Exception as e:
            logger.warning(f"Cache promotion error: {e}")

    async def invalidate_query_cache(
        self, 
        query: str, 
        context: str, 
        tenant_id: Optional[str] = None
    ) -> bool:
        """Invalidate specific query cache entry"""
        try:
            cache_key = self._generate_query_key(query, context)
            success = False
            
            # Invalidate Redis cache
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                try:
                    redis_success = await self.redis_cache.delete(
                        CacheKeyType.QUERY_RESULT, cache_key, tenant_id
                    )
                    if redis_success:
                        success = True
                        
                except Exception as e:
                    logger.warning(f"Redis cache invalidation error: {e}")
            
            # File cache doesn't have direct invalidation, but TTL will handle it
            # For now, we could implement a blacklist mechanism if needed
            
            return success
            
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return False

    async def invalidate_tenant_cache(self, tenant_id: str) -> int:
        """Invalidate all cache entries for a tenant"""
        try:
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                return await self.redis_cache.invalidate_tenant_cache(tenant_id)
            return 0
            
        except Exception as e:
            logger.error(f"Tenant cache invalidation error: {e}")
            return 0

    async def clear_expired_cache(self) -> None:
        """Clear expired cache entries"""
        try:
            # Clear expired file cache
            if self.enable_file_cache:
                self.file_cache.clear_expired()
                
            # Redis handles expiration automatically, but we can get stats
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                stats = await self.redis_cache.get_cache_stats()
                logger.debug(f"Redis cache stats: {stats.get('key_counts', {})}")
                
        except Exception as e:
            logger.warning(f"Cache cleanup error: {e}")

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get comprehensive cache statistics"""
        stats = {
            "enhanced_cache": self.stats.copy(),
            "file_cache": self.file_cache.stats() if self.enable_file_cache else {},
            "redis_enabled": self.enable_redis,
            "file_enabled": self.enable_file_cache,
            "total_hits": self.stats["redis_hits"] + self.stats["file_hits"],
            "total_misses": self.stats["redis_misses"] + self.stats["file_misses"],
        }
        
        # Calculate hit rates
        total_requests = stats["total_hits"] + stats["total_misses"]
        if total_requests > 0:
            stats["hit_rate"] = stats["total_hits"] / total_requests
            stats["redis_hit_rate"] = self.stats["redis_hits"] / total_requests
            stats["file_hit_rate"] = self.stats["file_hits"] / total_requests
        else:
            stats["hit_rate"] = 0.0
            stats["redis_hit_rate"] = 0.0
            stats["file_hit_rate"] = 0.0
            
        return stats

    async def get_async_cache_stats(self) -> Dict[str, Any]:
        """Get comprehensive cache statistics including Redis stats"""
        stats = self.get_cache_stats()
        
        # Add Redis stats if available
        if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
            try:
                redis_stats = await self.redis_cache.get_cache_stats()
                stats["redis_cache"] = redis_stats
            except Exception as e:
                logger.warning(f"Error getting Redis stats: {e}")
                stats["redis_cache"] = {"error": str(e)}
                
        return stats

    async def flush_cache(self, tenant_id: Optional[str] = None) -> bool:
        """Flush cache (optionally for specific tenant)"""
        try:
            success = False
            
            # Flush Redis cache
            if self.enable_redis and self.redis_cache and self.redis_cache.is_available:
                try:
                    redis_success = await self.redis_cache.flush_cache(tenant_id)
                    if redis_success:
                        success = True
                        logger.info(f"🧹 Redis cache flushed for tenant: {tenant_id or 'all'}")
                        
                except Exception as e:
                    logger.warning(f"Redis cache flush error: {e}")
            
            # Flush file cache (all entries, no tenant filtering)
            if self.enable_file_cache and not tenant_id:  # Only flush all for file cache
                try:
                    self.file_cache.clear_all()
                    success = True
                    logger.info("🧹 File cache cleared")
                    
                except Exception as e:
                    logger.warning(f"File cache flush error: {e}")
            
            # Reset stats
            if success:
                self.stats = {key: 0 for key in self.stats}
                
            return success
            
        except Exception as e:
            logger.error(f"Cache flush error: {e}")
            return False


# Global enhanced cache service instance
_enhanced_cache_service: Optional[EnhancedCacheService] = None


def get_enhanced_cache_service() -> Optional[EnhancedCacheService]:
    """Get global enhanced cache service instance"""
    return _enhanced_cache_service


async def initialize_enhanced_cache_service(
    redis_url: Optional[str] = None,
    file_cache_dir: str = "data/cache",
    enable_redis: bool = True,
    enable_file_cache: bool = True,
    ttl_hours: int = 24,
) -> EnhancedCacheService:
    """Initialize global enhanced cache service"""
    global _enhanced_cache_service
    
    _enhanced_cache_service = EnhancedCacheService(
        redis_url=redis_url,
        file_cache_dir=file_cache_dir,
        enable_redis=enable_redis,
        enable_file_cache=enable_file_cache,
        ttl_hours=ttl_hours,
    )
    
    await _enhanced_cache_service.initialize()
    logger.info("Enhanced cache service initialized")
    
    return _enhanced_cache_service


async def shutdown_enhanced_cache_service():
    """Shutdown global enhanced cache service"""
    global _enhanced_cache_service
    if _enhanced_cache_service:
        await _enhanced_cache_service.close()
        _enhanced_cache_service = None
        logger.info("Enhanced cache service shutdown completed")