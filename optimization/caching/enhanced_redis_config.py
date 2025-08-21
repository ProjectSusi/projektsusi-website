#!/usr/bin/env python3
"""
Enhanced Redis Caching Configuration for Phase 1 Optimization
Implements intelligent caching strategies for 30% performance improvement
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple
from enum import Enum
import hashlib
import pickle
import gzip
from collections import defaultdict

try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

logger = logging.getLogger(__name__)


class CacheTier(Enum):
    """Cache tier levels for intelligent storage"""
    HOT = "hot"        # Frequently accessed, keep in memory
    WARM = "warm"      # Moderately accessed, compress but keep accessible
    COLD = "cold"      # Rarely accessed, heavily compressed


@dataclass
class CacheAnalytics:
    """Advanced cache analytics for optimization"""
    total_hits: int = 0
    total_misses: int = 0
    total_sets: int = 0
    total_deletes: int = 0
    total_evictions: int = 0
    avg_response_time_ms: float = 0.0
    tier_distribution: Dict[str, int] = field(default_factory=dict)
    popular_keys: List[Tuple[str, int]] = field(default_factory=list)
    memory_savings: float = 0.0
    
    @property
    def hit_rate(self) -> float:
        total = self.total_hits + self.total_misses
        return (self.total_hits / total * 100) if total > 0 else 0.0
    
    @property
    def efficiency_score(self) -> float:
        """Calculate cache efficiency score (0-100)"""
        hit_rate = self.hit_rate
        response_factor = max(0, 100 - self.avg_response_time_ms)
        memory_factor = min(100, self.memory_savings)
        
        return (hit_rate * 0.5 + response_factor * 0.3 + memory_factor * 0.2)


@dataclass
class CacheKey:
    """Enhanced cache key with metadata"""
    key: str
    tier: CacheTier
    ttl: int
    access_count: int = 0
    last_accessed: float = field(default_factory=time.time)
    creation_time: float = field(default_factory=time.time)
    data_size: int = 0
    compression_ratio: float = 1.0


class IntelligentRedisCache:
    """Enhanced Redis cache with intelligent optimization"""
    
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        redis_db: int = 0,
        max_connections: int = 50,
        enable_compression: bool = True,
        enable_analytics: bool = True,
        key_prefix: str = "rag_optimized",
        tier_thresholds: Optional[Dict[str, int]] = None
    ):
        self.redis_url = redis_url
        self.redis_db = redis_db
        self.max_connections = max_connections
        self.enable_compression = enable_compression
        self.enable_analytics = enable_analytics
        self.key_prefix = key_prefix
        
        # Intelligent tier thresholds
        self.tier_thresholds = tier_thresholds or {
            "hot_access_count": 10,
            "warm_access_count": 3,
            "hot_ttl": 1800,  # 30 minutes
            "warm_ttl": 7200,  # 2 hours
            "cold_ttl": 86400,  # 24 hours
        }
        
        self.redis_client: Optional[aioredis.Redis] = None
        self.connection_pool: Optional[aioredis.ConnectionPool] = None
        self.analytics = CacheAnalytics()
        self.key_metadata: Dict[str, CacheKey] = {}
        self.is_available = False
        
        # Performance optimization features
        self.query_patterns: Dict[str, int] = defaultdict(int)
        self.optimization_queue: Set[str] = set()
        self.batch_operations: List[Tuple[str, str, Any]] = []
        
    async def initialize(self) -> bool:
        """Initialize enhanced Redis connection with optimization"""
        if not REDIS_AVAILABLE:
            logger.warning("Redis not available, caching disabled")
            return False
        
        try:
            # Create optimized connection pool
            self.connection_pool = aioredis.ConnectionPool.from_url(
                self.redis_url,
                db=self.redis_db,
                max_connections=self.max_connections,
                retry_on_timeout=True,
                socket_keepalive=True,
                socket_keepalive_options={
                    'TCP_KEEPIDLE': 1,
                    'TCP_KEEPINTVL': 3,
                    'TCP_KEEPCNT': 5
                },
                health_check_interval=30,
            )
            
            # Create Redis client with optimizations
            self.redis_client = aioredis.Redis(
                connection_pool=self.connection_pool,
                decode_responses=False,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            
            # Test connection and configure optimizations
            await self.redis_client.ping()
            await self._configure_redis_optimizations()
            
            self.is_available = True
            
            # Start background optimization tasks
            if self.enable_analytics:
                asyncio.create_task(self._analytics_collector())
                asyncio.create_task(self._intelligent_optimizer())
            
            logger.info(f"Enhanced Redis cache initialized: {self.redis_url}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize enhanced Redis cache: {e}")
            self.is_available = False
            return False
    
    async def _configure_redis_optimizations(self):
        """Configure Redis for optimal performance"""
        try:
            # Set optimized configuration
            optimizations = {
                'maxmemory-policy': 'allkeys-lru',
                'tcp-keepalive': '300',
                'timeout': '0',
                'save': '900 1',  # Save every 15 minutes if at least 1 key changed
            }
            
            for config, value in optimizations.items():
                try:
                    await self.redis_client.config_set(config, value)
                except Exception as e:
                    logger.warning(f"Could not set {config}: {e}")
                    
        except Exception as e:
            logger.warning(f"Redis optimization configuration failed: {e}")
    
    def _generate_intelligent_key(self, base_key: str, key_type: str, metadata: Dict = None) -> str:
        """Generate intelligent cache key with optimization hints"""
        parts = [self.key_prefix, key_type]
        
        # Add metadata for intelligent routing
        if metadata:
            if 'tenant_id' in metadata:
                parts.append(f"tenant:{metadata['tenant_id']}")
            if 'priority' in metadata:
                parts.append(f"p{metadata['priority']}")
        
        # Add hash for complex keys
        if len(base_key) > 100:
            key_hash = hashlib.sha256(base_key.encode()).hexdigest()[:12]
            parts.append(key_hash)
        else:
            parts.append(base_key)
        
        return ":".join(parts)
    
    def _determine_cache_tier(self, access_pattern: Dict) -> CacheTier:
        """Intelligently determine cache tier based on access patterns"""
        access_count = access_pattern.get('access_count', 0)
        recency = time.time() - access_pattern.get('last_accessed', 0)
        
        # Hot tier: frequently accessed and recent
        if (access_count >= self.tier_thresholds['hot_access_count'] and 
            recency < 3600):  # Last hour
            return CacheTier.HOT
        
        # Warm tier: moderately accessed
        elif access_count >= self.tier_thresholds['warm_access_count']:
            return CacheTier.WARM
        
        # Cold tier: rarely accessed
        else:
            return CacheTier.COLD
    
    def _compress_data(self, data: Any, tier: CacheTier) -> Tuple[bytes, float]:
        """Compress data based on cache tier"""
        serialized = pickle.dumps(data)
        original_size = len(serialized)
        
        if not self.enable_compression or tier == CacheTier.HOT:
            return serialized, 1.0
        
        # Compression levels based on tier
        if tier == CacheTier.WARM:
            compressed = gzip.compress(serialized, compresslevel=6)
        else:  # COLD
            compressed = gzip.compress(serialized, compresslevel=9)
        
        compression_ratio = len(compressed) / original_size
        return compressed, compression_ratio
    
    def _decompress_data(self, data: bytes, is_compressed: bool) -> Any:
        """Decompress data if needed"""
        if is_compressed:
            decompressed = gzip.decompress(data)
            return pickle.loads(decompressed)
        else:
            return pickle.loads(data)
    
    async def intelligent_set(
        self,
        key: str,
        value: Any,
        key_type: str = "generic",
        ttl: Optional[int] = None,
        metadata: Optional[Dict] = None,
        access_pattern: Optional[Dict] = None
    ) -> bool:
        """Intelligently cache data with optimization"""
        if not self.is_available:
            return False
        
        start_time = time.time()
        
        try:
            # Generate intelligent key
            cache_key = self._generate_intelligent_key(key, key_type, metadata)
            
            # Determine optimal cache tier
            tier = self._determine_cache_tier(access_pattern or {})
            
            # Compress data based on tier
            compressed_data, compression_ratio = self._compress_data(value, tier)
            
            # Set TTL based on tier
            if ttl is None:
                if tier == CacheTier.HOT:
                    ttl = self.tier_thresholds['hot_ttl']
                elif tier == CacheTier.WARM:
                    ttl = self.tier_thresholds['warm_ttl']
                else:
                    ttl = self.tier_thresholds['cold_ttl']
            
            # Store data with metadata
            cache_metadata = {
                'tier': tier.value,
                'compressed': compression_ratio < 1.0,
                'compression_ratio': compression_ratio,
                'original_size': len(pickle.dumps(value)),
                'created_at': time.time(),
                'access_count': 0
            }
            
            # Use pipeline for atomic operation
            pipe = self.redis_client.pipeline()
            pipe.setex(cache_key, ttl, compressed_data)
            pipe.setex(f"{cache_key}:meta", ttl, json.dumps(cache_metadata))
            await pipe.execute()
            
            # Update local metadata
            self.key_metadata[cache_key] = CacheKey(
                key=cache_key,
                tier=tier,
                ttl=ttl,
                data_size=len(compressed_data),
                compression_ratio=compression_ratio
            )
            
            # Update analytics
            if self.enable_analytics:
                self.analytics.total_sets += 1
                self.analytics.memory_savings += (1 - compression_ratio) * 100
                self.analytics.tier_distribution[tier.value] = \
                    self.analytics.tier_distribution.get(tier.value, 0) + 1
            
            response_time = (time.time() - start_time) * 1000
            logger.debug(f"Intelligent cache set: {cache_key} ({tier.value}, {response_time:.2f}ms)")
            
            return True
            
        except Exception as e:
            logger.error(f"Intelligent cache set failed: {e}")
            return False
    
    async def intelligent_get(
        self,
        key: str,
        key_type: str = "generic",
        metadata: Optional[Dict] = None
    ) -> Tuple[Optional[Any], Dict]:
        """Intelligently retrieve cached data with analytics"""
        if not self.is_available:
            return None, {'cache_miss': True}
        
        start_time = time.time()
        
        try:
            # Generate intelligent key
            cache_key = self._generate_intelligent_key(key, key_type, metadata)
            
            # Get data and metadata in pipeline
            pipe = self.redis_client.pipeline()
            pipe.get(cache_key)
            pipe.get(f"{cache_key}:meta")
            results = await pipe.execute()
            
            cached_data, cached_metadata = results
            
            if cached_data is None:
                # Cache miss
                if self.enable_analytics:
                    self.analytics.total_misses += 1
                return None, {'cache_miss': True}
            
            # Parse metadata
            try:
                meta_info = json.loads(cached_metadata or '{}')
            except:
                meta_info = {}
            
            # Decompress data
            is_compressed = meta_info.get('compressed', False)
            value = self._decompress_data(cached_data, is_compressed)
            
            # Update access patterns
            if cache_key in self.key_metadata:
                cache_obj = self.key_metadata[cache_key]
                cache_obj.access_count += 1
                cache_obj.last_accessed = time.time()
            
            # Update metadata access count
            meta_info['access_count'] = meta_info.get('access_count', 0) + 1
            await self.redis_client.setex(
                f"{cache_key}:meta", 
                3600,  # Keep metadata longer
                json.dumps(meta_info)
            )
            
            # Update analytics
            if self.enable_analytics:
                self.analytics.total_hits += 1
                response_time = (time.time() - start_time) * 1000
                self.analytics.avg_response_time_ms = (
                    (self.analytics.avg_response_time_ms * self.analytics.total_hits + response_time) /
                    (self.analytics.total_hits + 1)
                )
            
            # Add to optimization queue if frequently accessed
            if meta_info.get('access_count', 0) > 5:
                self.optimization_queue.add(cache_key)
            
            cache_info = {
                'cache_hit': True,
                'tier': meta_info.get('tier', 'unknown'),
                'compression_ratio': meta_info.get('compression_ratio', 1.0),
                'access_count': meta_info.get('access_count', 0),
                'response_time_ms': (time.time() - start_time) * 1000
            }
            
            return value, cache_info
            
        except Exception as e:
            logger.error(f"Intelligent cache get failed: {e}")
            if self.enable_analytics:
                self.analytics.total_misses += 1
            return None, {'cache_miss': True, 'error': str(e)}
    
    async def batch_set(self, operations: List[Tuple[str, Any, str, Optional[int], Optional[Dict]]]) -> int:
        """Batch set operations for optimal performance"""
        if not self.is_available or not operations:
            return 0
        
        success_count = 0
        pipe = self.redis_client.pipeline()
        
        for key, value, key_type, ttl, metadata in operations:
            try:
                cache_key = self._generate_intelligent_key(key, key_type, metadata)
                tier = self._determine_cache_tier(metadata or {})
                compressed_data, compression_ratio = self._compress_data(value, tier)
                
                effective_ttl = ttl or self.tier_thresholds.get(f"{tier.value}_ttl", 3600)
                
                pipe.setex(cache_key, effective_ttl, compressed_data)
                success_count += 1
                
            except Exception as e:
                logger.error(f"Batch operation failed for key {key}: {e}")
        
        try:
            await pipe.execute()
            logger.info(f"Batch set completed: {success_count} operations")
            return success_count
        except Exception as e:
            logger.error(f"Batch pipeline execution failed: {e}")
            return 0
    
    async def _analytics_collector(self):
        """Background analytics collection"""
        while self.is_available:
            try:
                await asyncio.sleep(300)  # Collect every 5 minutes
                
                # Update popular keys
                if self.key_metadata:
                    sorted_keys = sorted(
                        self.key_metadata.items(),
                        key=lambda x: x[1].access_count,
                        reverse=True
                    )
                    self.analytics.popular_keys = [
                        (k, v.access_count) for k, v in sorted_keys[:10]
                    ]
                
                # Log analytics summary
                logger.info(
                    f"Cache Analytics - Hit Rate: {self.analytics.hit_rate:.1f}%, "
                    f"Efficiency: {self.analytics.efficiency_score:.1f}, "
                    f"Memory Savings: {self.analytics.memory_savings:.1f}%"
                )
                
            except Exception as e:
                logger.error(f"Analytics collection error: {e}")
    
    async def _intelligent_optimizer(self):
        """Background intelligent optimization"""
        while self.is_available:
            try:
                await asyncio.sleep(600)  # Optimize every 10 minutes
                
                if self.optimization_queue:
                    # Process optimization queue
                    keys_to_optimize = list(self.optimization_queue)
                    self.optimization_queue.clear()
                    
                    for cache_key in keys_to_optimize[:50]:  # Process up to 50 keys
                        await self._optimize_key(cache_key)
                    
                    logger.info(f"Optimized {len(keys_to_optimize)} cache keys")
                
            except Exception as e:
                logger.error(f"Intelligent optimization error: {e}")
    
    async def _optimize_key(self, cache_key: str):
        """Optimize individual cache key"""
        try:
            # Get current metadata
            metadata_raw = await self.redis_client.get(f"{cache_key}:meta")
            if not metadata_raw:
                return
            
            metadata = json.loads(metadata_raw)
            access_count = metadata.get('access_count', 0)
            current_tier = metadata.get('tier', 'cold')
            
            # Determine if tier upgrade is needed
            new_tier = None
            if access_count >= self.tier_thresholds['hot_access_count'] and current_tier != 'hot':
                new_tier = CacheTier.HOT
            elif access_count >= self.tier_thresholds['warm_access_count'] and current_tier == 'cold':
                new_tier = CacheTier.WARM
            
            if new_tier:
                # Upgrade cache tier
                cached_data = await self.redis_client.get(cache_key)
                if cached_data:
                    # Decompress current data
                    value = self._decompress_data(cached_data, metadata.get('compressed', False))
                    
                    # Recompress with new tier
                    new_compressed_data, new_compression_ratio = self._compress_data(value, new_tier)
                    
                    # Update with new tier TTL
                    new_ttl = self.tier_thresholds[f"{new_tier.value}_ttl"]
                    
                    # Atomic update
                    pipe = self.redis_client.pipeline()
                    pipe.setex(cache_key, new_ttl, new_compressed_data)
                    
                    metadata.update({
                        'tier': new_tier.value,
                        'compression_ratio': new_compression_ratio,
                        'optimized_at': time.time()
                    })
                    pipe.setex(f"{cache_key}:meta", new_ttl, json.dumps(metadata))
                    
                    await pipe.execute()
                    
                    logger.debug(f"Optimized cache key {cache_key}: {current_tier} -> {new_tier.value}")
                    
        except Exception as e:
            logger.error(f"Key optimization failed for {cache_key}: {e}")
    
    async def get_optimization_report(self) -> Dict[str, Any]:
        """Get comprehensive optimization report"""
        try:
            # Redis info
            redis_info = await self.redis_client.info() if self.redis_client else {}
            
            # Key distribution by tier
            tier_stats = defaultdict(int)
            total_keys = len(self.key_metadata)
            
            for key_obj in self.key_metadata.values():
                tier_stats[key_obj.tier.value] += 1
            
            return {
                'analytics': {
                    'hit_rate': self.analytics.hit_rate,
                    'total_operations': (self.analytics.total_hits + self.analytics.total_misses),
                    'avg_response_time_ms': self.analytics.avg_response_time_ms,
                    'efficiency_score': self.analytics.efficiency_score,
                    'memory_savings_percent': self.analytics.memory_savings,
                },
                'tier_distribution': dict(tier_stats),
                'popular_keys': self.analytics.popular_keys[:5],
                'redis_info': {
                    'memory_usage_mb': redis_info.get('used_memory', 0) / 1024 / 1024,
                    'keyspace_hits': redis_info.get('keyspace_hits', 0),
                    'keyspace_misses': redis_info.get('keyspace_misses', 0),
                    'connected_clients': redis_info.get('connected_clients', 0),
                },
                'optimization_queue_size': len(self.optimization_queue),
                'total_managed_keys': total_keys,
                'is_available': self.is_available,
                'generated_at': time.time()
            }
            
        except Exception as e:
            logger.error(f"Failed to generate optimization report: {e}")
            return {'error': str(e), 'is_available': False}
    
    async def close(self):
        """Cleanup resources"""
        self.is_available = False
        
        if self.redis_client:
            await self.redis_client.close()
        if self.connection_pool:
            await self.connection_pool.disconnect()
        
        logger.info("Enhanced Redis cache service closed")


# Specialized cache implementations for different use cases
class QueryCacheOptimized(IntelligentRedisCache):
    """Optimized cache specifically for query results"""
    
    def __init__(self, **kwargs):
        super().__init__(
            key_prefix="rag_query_opt",
            tier_thresholds={
                "hot_access_count": 5,    # Queries accessed 5+ times
                "warm_access_count": 2,   # Queries accessed 2+ times
                "hot_ttl": 900,           # 15 minutes for hot queries
                "warm_ttl": 3600,         # 1 hour for warm queries
                "cold_ttl": 7200,         # 2 hours for cold queries
            },
            **kwargs
        )
    
    async def cache_query_result(
        self,
        query: str,
        result: Dict,
        tenant_id: Optional[str] = None,
        confidence_score: Optional[float] = None
    ) -> bool:
        """Cache query result with optimization"""
        query_hash = hashlib.sha256(query.encode()).hexdigest()[:16]
        
        metadata = {
            'tenant_id': tenant_id,
            'query_length': len(query),
            'confidence_score': confidence_score or 0.0,
            'result_count': len(result.get('documents', [])) if isinstance(result, dict) else 0
        }
        
        # High confidence queries get priority
        access_pattern = {'access_count': 3 if confidence_score and confidence_score > 0.8 else 1}
        
        return await self.intelligent_set(
            key=query_hash,
            value=result,
            key_type="query_result",
            metadata=metadata,
            access_pattern=access_pattern
        )
    
    async def get_cached_query_result(
        self,
        query: str,
        tenant_id: Optional[str] = None
    ) -> Tuple[Optional[Dict], Dict]:
        """Retrieve cached query result"""
        query_hash = hashlib.sha256(query.encode()).hexdigest()[:16]
        
        metadata = {
            'tenant_id': tenant_id,
            'query_length': len(query)
        }
        
        return await self.intelligent_get(
            key=query_hash,
            key_type="query_result",
            metadata=metadata
        )


# Global optimized cache instances
_query_cache: Optional[QueryCacheOptimized] = None
_general_cache: Optional[IntelligentRedisCache] = None


async def initialize_optimized_caches(redis_url: str = "redis://localhost:6379") -> bool:
    """Initialize optimized cache instances"""
    global _query_cache, _general_cache
    
    try:
        # Initialize query-optimized cache
        _query_cache = QueryCacheOptimized(redis_url=redis_url, redis_db=1)
        query_success = await _query_cache.initialize()
        
        # Initialize general optimized cache
        _general_cache = IntelligentRedisCache(redis_url=redis_url, redis_db=2)
        general_success = await _general_cache.initialize()
        
        logger.info(f"Optimized caches initialized - Query: {query_success}, General: {general_success}")
        return query_success and general_success
        
    except Exception as e:
        logger.error(f"Failed to initialize optimized caches: {e}")
        return False


def get_query_cache() -> Optional[QueryCacheOptimized]:
    """Get optimized query cache instance"""
    return _query_cache


def get_general_cache() -> Optional[IntelligentRedisCache]:
    """Get general optimized cache instance"""
    return _general_cache


async def get_system_cache_report() -> Dict[str, Any]:
    """Get comprehensive system cache report"""
    reports = {}
    
    if _query_cache:
        reports['query_cache'] = await _query_cache.get_optimization_report()
    
    if _general_cache:
        reports['general_cache'] = await _general_cache.get_optimization_report()
    
    # Calculate system-wide metrics
    total_hit_rate = 0
    total_operations = 0
    
    for cache_name, report in reports.items():
        if 'analytics' in report:
            analytics = report['analytics']
            ops = analytics['total_operations']
            hit_rate = analytics['hit_rate']
            
            total_operations += ops
            total_hit_rate += hit_rate * ops
    
    system_hit_rate = (total_hit_rate / total_operations) if total_operations > 0 else 0
    
    return {
        'system_metrics': {
            'overall_hit_rate': system_hit_rate,
            'total_operations': total_operations,
            'cache_instances': len(reports)
        },
        'cache_reports': reports,
        'generated_at': time.time()
    }