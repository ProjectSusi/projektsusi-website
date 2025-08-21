"""
Connection Manager for RAG System
Manages database connections with automatic failover and health monitoring
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from enum import Enum
from typing import Any, Dict, Optional, Union

from .connection_pool import PostgreSQLConnectionPool, RedisConnectionPool

logger = logging.getLogger(__name__)


class ConnectionType(Enum):
    """Database connection types"""
    SQLITE = "sqlite"
    POSTGRESQL = "postgresql" 
    REDIS = "redis"


class ConnectionManager:
    """Manages database connections with automatic failover"""
    
    def __init__(self):
        self.pools: Dict[str, Any] = {}
        self.primary_db_type = ConnectionType.SQLITE
        self.health_status: Dict[str, bool] = {}
        self._health_check_interval = 30  # seconds
        self._health_check_task = None
    
    async def initialize(self, config: Dict[str, Any]):
        """Initialize connection pools based on configuration"""
        try:
            # Initialize primary database connection
            db_config = config.get("database", {})
            db_type = db_config.get("type", "sqlite").lower()
            
            if db_type == "postgresql":
                await self._init_postgresql(db_config)
                self.primary_db_type = ConnectionType.POSTGRESQL
            elif db_type == "sqlite":
                await self._init_sqlite(db_config) 
                self.primary_db_type = ConnectionType.SQLITE
            else:
                logger.warning(f"Unsupported database type: {db_type}, falling back to SQLite")
                await self._init_sqlite(db_config)
            
            # Initialize cache connection (Redis)
            cache_config = config.get("cache", {})
            if cache_config.get("enabled", False):
                await self._init_redis(cache_config)
            
            # Start health monitoring
            await self._start_health_monitoring()
            
            logger.info("Connection manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize connection manager: {e}")
            raise
    
    async def _init_postgresql(self, config: Dict[str, Any]):
        """Initialize PostgreSQL connection pool"""
        try:
            connection_string = config.get(
                "connection_string",
                "postgresql://user:password@localhost/rag_db"
            )
            
            pool = PostgreSQLConnectionPool(
                connection_string=connection_string,
                min_size=config.get("min_connections", 2),
                max_size=config.get("max_connections", 10),
                command_timeout=config.get("command_timeout", 60),
            )
            
            await pool.initialize()
            self.pools["postgresql"] = pool
            self.health_status["postgresql"] = True
            
            logger.info("PostgreSQL connection pool initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")
            # Fall back to SQLite
            await self._init_sqlite(config)
    
    async def _init_sqlite(self, config: Dict[str, Any]):
        """Initialize SQLite connection (no pooling needed)"""
        try:
            # SQLite doesn't need connection pooling, but we track it
            self.pools["sqlite"] = {
                "path": config.get("path", "data/rag_database.db"),
                "type": "sqlite"
            }
            self.health_status["sqlite"] = True
            
            logger.info("SQLite connection configured")
            
        except Exception as e:
            logger.error(f"Failed to configure SQLite: {e}")
            raise
    
    async def _init_redis(self, config: Dict[str, Any]):
        """Initialize Redis connection pool"""
        try:
            redis_url = config.get("url", "redis://localhost:6379")
            
            pool = RedisConnectionPool(
                redis_url=redis_url,
                max_connections=config.get("max_connections", 50),
                retry_on_timeout=config.get("retry_on_timeout", True),
            )
            
            await pool.initialize()
            self.pools["redis"] = pool
            self.health_status["redis"] = True
            
            logger.info("Redis connection pool initialized")
            
        except Exception as e:
            logger.warning(f"Failed to initialize Redis pool: {e}")
            # Redis is optional, continue without it
            self.health_status["redis"] = False
    
    async def _start_health_monitoring(self):
        """Start background health monitoring"""
        self._health_check_task = asyncio.create_task(self._health_monitor())
    
    async def _health_monitor(self):
        """Background health monitoring task"""
        while True:
            try:
                await asyncio.sleep(self._health_check_interval)
                await self._check_all_connections()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Health monitoring error: {e}")
    
    async def _check_all_connections(self):
        """Check health of all connections"""
        for pool_name, pool in self.pools.items():
            try:
                if pool_name == "postgresql" and hasattr(pool, 'pool'):
                    # Test PostgreSQL connection
                    async with pool.acquire() as conn:
                        await conn.fetchval("SELECT 1")
                    self.health_status[pool_name] = True
                    
                elif pool_name == "redis" and hasattr(pool, 'pool'):
                    # Test Redis connection
                    async with pool.acquire() as conn:
                        await conn.ping()
                    self.health_status[pool_name] = True
                    
                elif pool_name == "sqlite":
                    # SQLite is always healthy if file accessible
                    import os
                    path = pool.get("path", "data/rag_database.db")
                    self.health_status[pool_name] = os.path.exists(os.path.dirname(path))
                    
            except Exception as e:
                logger.warning(f"Health check failed for {pool_name}: {e}")
                self.health_status[pool_name] = False
    
    @asynccontextmanager
    async def get_connection(self, connection_type: Optional[str] = None):
        """Get database connection with automatic failover"""
        if connection_type is None:
            connection_type = self.primary_db_type.value
        
        pool = self.pools.get(connection_type)
        if not pool or not self.health_status.get(connection_type, False):
            # Try fallback connections
            if connection_type == "postgresql" and "sqlite" in self.pools:
                logger.warning("PostgreSQL unavailable, falling back to SQLite")
                connection_type = "sqlite"
                pool = self.pools["sqlite"]
            else:
                raise RuntimeError(f"No healthy {connection_type} connection available")
        
        if connection_type == "sqlite":
            # SQLite doesn't use connection pooling
            import aiosqlite
            async with aiosqlite.connect(pool["path"]) as conn:
                yield conn
        elif hasattr(pool, 'acquire'):
            # PostgreSQL/Redis with connection pooling
            async with pool.acquire() as conn:
                yield conn
        else:
            raise RuntimeError(f"Invalid connection pool for {connection_type}")
    
    async def get_cache_connection(self):
        """Get Redis cache connection if available"""
        if "redis" in self.pools and self.health_status.get("redis", False):
            async with self.pools["redis"].acquire() as conn:
                yield conn
        else:
            # No cache available
            yield None
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        stats = {
            "primary_type": self.primary_db_type.value,
            "health_status": self.health_status.copy(),
            "pools": {}
        }
        
        for pool_name, pool in self.pools.items():
            if hasattr(pool, 'get_stats'):
                stats["pools"][pool_name] = pool.get_stats()
            else:
                stats["pools"][pool_name] = {"type": pool.get("type", "unknown")}
        
        return stats
    
    async def close_all(self):
        """Close all connection pools"""
        if self._health_check_task:
            self._health_check_task.cancel()
            try:
                await self._health_check_task
            except asyncio.CancelledError:
                pass
        
        for pool_name, pool in self.pools.items():
            try:
                if hasattr(pool, 'close'):
                    await pool.close()
                logger.info(f"Closed {pool_name} connection pool")
            except Exception as e:
                logger.error(f"Error closing {pool_name} pool: {e}")
        
        self.pools.clear()
        self.health_status.clear()


# Global connection manager instance
_connection_manager = None


async def get_connection_manager() -> ConnectionManager:
    """Get global connection manager"""
    global _connection_manager
    if _connection_manager is None:
        _connection_manager = ConnectionManager()
    return _connection_manager


async def initialize_connection_manager(config: Dict[str, Any]):
    """Initialize the global connection manager"""
    manager = await get_connection_manager()
    await manager.initialize(config)
    return manager