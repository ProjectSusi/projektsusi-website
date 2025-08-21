"""
Async Request Handler for RAG System Concurrency Enhancement
Implements connection pooling, load balancing, and scalable async patterns
"""

import asyncio
import aiohttp
import time
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from contextlib import asynccontextmanager
import logging
from concurrent.futures import ThreadPoolExecutor
import weakref
from collections import defaultdict, deque
import threading
import json

@dataclass
class ConnectionConfig:
    """Configuration for connection pooling and async operations"""
    max_connections: int = 100
    max_connections_per_host: int = 20
    connection_timeout: float = 30.0
    read_timeout: float = 60.0
    max_retries: int = 3
    backoff_factor: float = 0.3
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: float = 60.0
    worker_pool_size: int = 10
    queue_max_size: int = 1000

class CircuitBreaker:
    """Circuit breaker pattern for fault tolerance"""
    
    def __init__(self, failure_threshold: int = 5, recovery_timeout: float = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'closed'  # closed, open, half-open
        self._lock = threading.Lock()
    
    async def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        with self._lock:
            if self.state == 'open':
                if self.last_failure_time and \
                   time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = 'half-open'
                else:
                    raise Exception("Circuit breaker is OPEN")
            
            try:
                result = await func(*args, **kwargs)
                if self.state == 'half-open':
                    self.reset()
                return result
            except Exception as e:
                self.record_failure()
                raise e
    
    def record_failure(self):
        """Record a failure and update circuit breaker state"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = 'open'
    
    def reset(self):
        """Reset circuit breaker to closed state"""
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'closed'

class ConnectionPool:
    """Advanced connection pool with load balancing"""
    
    def __init__(self, config: ConnectionConfig):
        self.config = config
        self.sessions = {}
        self.session_stats = defaultdict(lambda: {'requests': 0, 'errors': 0, 'last_used': 0})
        self._lock = asyncio.Lock()
        self.circuit_breaker = CircuitBreaker(
            config.circuit_breaker_threshold, 
            config.circuit_breaker_timeout
        )
    
    @asynccontextmanager
    async def get_session(self, host: str = 'default'):
        """Get connection session with automatic load balancing"""
        async with self._lock:
            if host not in self.sessions:
                connector = aiohttp.TCPConnector(
                    limit=self.config.max_connections,
                    limit_per_host=self.config.max_connections_per_host,
                    ttl_dns_cache=300,
                    use_dns_cache=True,
                    keepalive_timeout=30,
                    enable_cleanup_closed=True
                )
                
                timeout = aiohttp.ClientTimeout(
                    total=self.config.connection_timeout,
                    sock_read=self.config.read_timeout
                )
                
                self.sessions[host] = aiohttp.ClientSession(
                    connector=connector,
                    timeout=timeout,
                    headers={'User-Agent': 'RAG-System-Phase2/1.0'}
                )
        
        session = self.sessions[host]
        self.session_stats[host]['last_used'] = time.time()
        
        try:
            yield session
            self.session_stats[host]['requests'] += 1
        except Exception as e:
            self.session_stats[host]['errors'] += 1
            raise e
    
    async def close_all(self):
        """Close all connection sessions"""
        for session in self.sessions.values():
            await session.close()
        self.sessions.clear()

class RequestQueue:
    """Intelligent request queue with priority handling"""
    
    def __init__(self, max_size: int = 1000):
        self.queue = asyncio.PriorityQueue(maxsize=max_size)
        self.processing_count = 0
        self.completed_count = 0
        self.failed_count = 0
        self._stats_lock = threading.Lock()
    
    async def enqueue(self, priority: int, request_id: str, 
                     coro: Callable, *args, **kwargs):
        """Add request to queue with priority"""
        request_item = (priority, time.time(), request_id, coro, args, kwargs)
        await self.queue.put(request_item)
    
    async def process_queue(self, worker_count: int = 10):
        """Process requests from queue with worker pool"""
        async def worker():
            while True:
                try:
                    priority, timestamp, req_id, coro, args, kwargs = await self.queue.get()
                    
                    with self._stats_lock:
                        self.processing_count += 1
                    
                    try:
                        await coro(*args, **kwargs)
                        with self._stats_lock:
                            self.completed_count += 1
                    except Exception as e:
                        logging.error(f"Request {req_id} failed: {e}")
                        with self._stats_lock:
                            self.failed_count += 1
                    finally:
                        with self._stats_lock:
                            self.processing_count -= 1
                        self.queue.task_done()
                        
                except asyncio.CancelledError:
                    break
        
        # Start worker tasks
        workers = [asyncio.create_task(worker()) for _ in range(worker_count)]
        return workers
    
    def get_stats(self) -> dict:
        """Get queue processing statistics"""
        with self._stats_lock:
            return {
                'queue_size': self.queue.qsize(),
                'processing': self.processing_count,
                'completed': self.completed_count,
                'failed': self.failed_count,
                'success_rate': self.completed_count / max(1, self.completed_count + self.failed_count)
            }

class AsyncRequestHandler:
    """Main async request handler with advanced concurrency features"""
    
    def __init__(self, config: ConnectionConfig):
        self.config = config
        self.connection_pool = ConnectionPool(config)
        self.request_queue = RequestQueue(config.queue_max_size)
        self.worker_pool = ThreadPoolExecutor(max_workers=config.worker_pool_size)
        self.rate_limiter = RateLimiter(requests_per_second=100)
        self.cache = RequestCache(max_size=5000, ttl_seconds=300)
        self.logger = logging.getLogger(__name__)
        self._workers = []
        self._running = False
    
    async def start(self):
        """Start the async request handler"""
        self._running = True
        self._workers = await self.request_queue.process_queue(
            self.config.worker_pool_size
        )
        self.logger.info("Async request handler started")
    
    async def stop(self):
        """Stop the async request handler"""
        self._running = False
        for worker in self._workers:
            worker.cancel()
        await asyncio.gather(*self._workers, return_exceptions=True)
        await self.connection_pool.close_all()
        self.worker_pool.shutdown(wait=True)
        self.logger.info("Async request handler stopped")
    
    async def make_request(self, method: str, url: str, 
                          priority: int = 5, cache_key: str = None,
                          **kwargs) -> dict:
        """Make async HTTP request with all optimizations"""
        # Check cache first
        if cache_key:
            cached_result = self.cache.get(cache_key)
            if cached_result:
                return cached_result
        
        # Apply rate limiting
        await self.rate_limiter.acquire()
        
        # Execute request with circuit breaker protection
        result = await self.connection_pool.circuit_breaker.call(
            self._execute_request, method, url, **kwargs
        )
        
        # Cache successful results
        if cache_key and result:
            self.cache.put(cache_key, result)
        
        return result
    
    async def _execute_request(self, method: str, url: str, **kwargs) -> dict:
        """Execute the actual HTTP request"""
        async with self.connection_pool.get_session() as session:
            async with session.request(method, url, **kwargs) as response:
                if response.status >= 400:
                    raise aiohttp.ClientResponseError(
                        request_info=response.request_info,
                        history=response.history,
                        status=response.status
                    )
                
                # Handle different content types
                content_type = response.headers.get('content-type', '').lower()
                if 'application/json' in content_type:
                    return await response.json()
                else:
                    return {'text': await response.text(), 'status': response.status}
    
    async def batch_requests(self, requests: List[dict]) -> List[dict]:
        """Process multiple requests concurrently"""
        semaphore = asyncio.Semaphore(self.config.max_connections_per_host)
        
        async def process_request(request_data):
            async with semaphore:
                return await self.make_request(**request_data)
        
        tasks = [process_request(req) for req in requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and log errors
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                self.logger.error(f"Request {i} failed: {result}")
                processed_results.append({'error': str(result)})
            else:
                processed_results.append(result)
        
        return processed_results
    
    def get_performance_metrics(self) -> dict:
        """Get comprehensive performance metrics"""
        queue_stats = self.request_queue.get_stats()
        cache_stats = self.cache.get_stats()
        
        return {
            'queue': queue_stats,
            'cache': cache_stats,
            'connection_pool': {
                'active_sessions': len(self.connection_pool.sessions),
                'session_stats': dict(self.connection_pool.session_stats)
            },
            'circuit_breaker': {
                'state': self.connection_pool.circuit_breaker.state,
                'failure_count': self.connection_pool.circuit_breaker.failure_count
            },
            'rate_limiter': {
                'current_rate': self.rate_limiter.get_current_rate(),
                'tokens_available': self.rate_limiter.tokens
            }
        }

class RateLimiter:
    """Token bucket rate limiter for request throttling"""
    
    def __init__(self, requests_per_second: float = 100):
        self.rate = requests_per_second
        self.tokens = requests_per_second
        self.last_update = time.time()
        self._lock = asyncio.Lock()
    
    async def acquire(self, tokens: int = 1):
        """Acquire tokens for rate limiting"""
        async with self._lock:
            now = time.time()
            elapsed = now - self.last_update
            self.tokens = min(self.rate, self.tokens + elapsed * self.rate)
            self.last_update = now
            
            if self.tokens >= tokens:
                self.tokens -= tokens
                return
            
            # Wait for tokens to become available
            wait_time = (tokens - self.tokens) / self.rate
            await asyncio.sleep(wait_time)
            self.tokens = 0
    
    def get_current_rate(self) -> float:
        """Get current rate limit utilization"""
        return (self.rate - self.tokens) / self.rate

class RequestCache:
    """LRU cache with TTL for request results"""
    
    def __init__(self, max_size: int = 5000, ttl_seconds: int = 300):
        self.cache = {}
        self.access_order = deque()
        self.access_times = {}
        self.max_size = max_size
        self.ttl = ttl_seconds
        self._lock = threading.Lock()
        self.hit_count = 0
        self.miss_count = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value with TTL check"""
        with self._lock:
            if key in self.cache:
                # Check TTL
                if time.time() - self.access_times[key] < self.ttl:
                    # Move to end (most recently used)
                    self.access_order.remove(key)
                    self.access_order.append(key)
                    self.hit_count += 1
                    return self.cache[key]
                else:
                    # Expired, remove
                    self._remove_key(key)
            
            self.miss_count += 1
            return None
    
    def put(self, key: str, value: Any):
        """Put value in cache with LRU eviction"""
        with self._lock:
            if key in self.cache:
                self.cache[key] = value
                self.access_times[key] = time.time()
                self.access_order.remove(key)
                self.access_order.append(key)
            else:
                if len(self.cache) >= self.max_size:
                    # Evict least recently used
                    oldest_key = self.access_order.popleft()
                    self._remove_key(oldest_key)
                
                self.cache[key] = value
                self.access_times[key] = time.time()
                self.access_order.append(key)
    
    def _remove_key(self, key: str):
        """Remove key from all data structures"""
        if key in self.cache:
            del self.cache[key]
        if key in self.access_times:
            del self.access_times[key]
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        total_requests = self.hit_count + self.miss_count
        return {
            'size': len(self.cache),
            'hit_count': self.hit_count,
            'miss_count': self.miss_count,
            'hit_rate': self.hit_count / max(1, total_requests),
            'max_size': self.max_size
        }

# Load balancer for multiple backend instances
class LoadBalancer:
    """Round-robin load balancer with health checking"""
    
    def __init__(self, backends: List[str]):
        self.backends = backends
        self.current = 0
        self.health_status = {backend: True for backend in backends}
        self._lock = threading.Lock()
    
    def get_backend(self) -> str:
        """Get next available backend using round-robin"""
        with self._lock:
            attempts = 0
            while attempts < len(self.backends):
                backend = self.backends[self.current]
                self.current = (self.current + 1) % len(self.backends)
                
                if self.health_status[backend]:
                    return backend
                
                attempts += 1
            
            # If no healthy backends, return first one anyway
            return self.backends[0]
    
    def mark_unhealthy(self, backend: str):
        """Mark backend as unhealthy"""
        self.health_status[backend] = False
    
    def mark_healthy(self, backend: str):
        """Mark backend as healthy"""
        self.health_status[backend] = True
    
    def get_healthy_backends(self) -> List[str]:
        """Get list of currently healthy backends"""
        return [backend for backend, healthy in self.health_status.items() if healthy]