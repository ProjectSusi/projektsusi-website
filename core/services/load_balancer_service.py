"""
Load Balancing Service
Intelligent load balancing and traffic distribution
"""

import asyncio
import logging
import hashlib
import json
import random
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import statistics
from collections import defaultdict, deque

logger = logging.getLogger(__name__)


class LoadBalancingStrategy(Enum):
    """Load balancing strategies"""
    ROUND_ROBIN = "round_robin"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin" 
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED_LEAST_CONNECTIONS = "weighted_least_connections"
    RANDOM = "random"
    WEIGHTED_RANDOM = "weighted_random"
    IP_HASH = "ip_hash"
    CONSISTENT_HASH = "consistent_hash"
    RESPONSE_TIME = "response_time"
    HEALTH_BASED = "health_based"
    ADAPTIVE = "adaptive"


class BackendHealth(Enum):
    """Backend server health status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


@dataclass
class Backend:
    """Backend server configuration"""
    id: str
    host: str
    port: int
    weight: float = 1.0
    max_connections: int = 100
    health_check_url: str = "/health"
    timeout_ms: int = 5000
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    @property
    def endpoint(self) -> str:
        """Get backend endpoint URL"""
        return f"http://{self.host}:{self.port}"

    @property
    def health_check_endpoint(self) -> str:
        """Get health check endpoint URL"""
        return f"{self.endpoint}{self.health_check_url}"


@dataclass
class BackendStatus:
    """Current status of a backend server"""
    backend: Backend
    health: BackendHealth
    current_connections: int
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time_ms: float
    last_health_check: Optional[datetime]
    last_error: Optional[str]
    consecutive_failures: int
    is_enabled: bool = True

    @property
    def success_rate(self) -> float:
        """Calculate success rate percentage"""
        if self.total_requests == 0:
            return 100.0
        return (self.successful_requests / self.total_requests) * 100.0

    @property
    def error_rate(self) -> float:
        """Calculate error rate percentage"""
        return 100.0 - self.success_rate

    @property
    def utilization(self) -> float:
        """Calculate connection utilization percentage"""
        if self.backend.max_connections == 0:
            return 0.0
        return (self.current_connections / self.backend.max_connections) * 100.0


@dataclass
class RequestContext:
    """Context information for load balancing decisions"""
    client_ip: str
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    tenant_id: Optional[int] = None
    request_path: str = "/"
    request_method: str = "GET"
    headers: Dict[str, str] = None
    timestamp: datetime = None

    def __post_init__(self):
        if self.headers is None:
            self.headers = {}
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)


@dataclass
class RoutingDecision:
    """Load balancing routing decision"""
    backend: Backend
    strategy_used: LoadBalancingStrategy
    decision_time_ms: float
    reason: str
    alternatives_considered: int
    session_affinity: bool = False


class HealthChecker:
    """Backend health monitoring"""

    def __init__(self, check_interval_seconds: int = 30):
        self.check_interval_seconds = check_interval_seconds
        self.running = False
        self.health_check_task: Optional[asyncio.Task] = None
        self.backends_status: Dict[str, BackendStatus] = {}

    async def start(self, backends: List[Backend]):
        """Start health checking"""
        if self.running:
            return

        self.running = True
        
        # Initialize backend status
        for backend in backends:
            self.backends_status[backend.id] = BackendStatus(
                backend=backend,
                health=BackendHealth.UNKNOWN,
                current_connections=0,
                total_requests=0,
                successful_requests=0,
                failed_requests=0,
                avg_response_time_ms=0.0,
                last_health_check=None,
                last_error=None,
                consecutive_failures=0
            )

        self.health_check_task = asyncio.create_task(self._health_check_loop())
        logger.info(f"Health checker started for {len(backends)} backends")

    async def stop(self):
        """Stop health checking"""
        if not self.running:
            return

        self.running = False
        
        if self.health_check_task:
            self.health_check_task.cancel()
            try:
                await self.health_check_task
            except asyncio.CancelledError:
                pass

        logger.info("Health checker stopped")

    async def _health_check_loop(self):
        """Main health check loop"""
        while self.running:
            try:
                # Check all backends
                check_tasks = []
                for backend_id, status in self.backends_status.items():
                    task = asyncio.create_task(
                        self._check_backend_health(status)
                    )
                    check_tasks.append(task)

                # Wait for all checks to complete
                await asyncio.gather(*check_tasks, return_exceptions=True)

                # Wait for next check interval
                await asyncio.sleep(self.check_interval_seconds)

            except Exception as e:
                logger.error(f"Health check loop error: {e}")
                await asyncio.sleep(self.check_interval_seconds)

    async def _check_backend_health(self, status: BackendStatus):
        """Check health of a single backend"""
        backend = status.backend
        start_time = time.time()

        try:
            # Simulate health check (replace with actual HTTP request)
            await asyncio.sleep(0.1)  # Simulate network delay
            
            # Simulate occasional failures (5% chance)
            if random.random() < 0.05:
                raise Exception("Simulated health check failure")

            # Health check successful
            response_time = (time.time() - start_time) * 1000
            
            status.health = BackendHealth.HEALTHY
            status.last_health_check = datetime.now(timezone.utc)
            status.consecutive_failures = 0
            status.last_error = None

            # Update average response time
            if status.avg_response_time_ms == 0:
                status.avg_response_time_ms = response_time
            else:
                # Simple moving average
                status.avg_response_time_ms = (
                    status.avg_response_time_ms * 0.9 + response_time * 0.1
                )

            logger.debug(f"Health check passed for {backend.id}: {response_time:.2f}ms")

        except Exception as e:
            # Health check failed
            status.consecutive_failures += 1
            status.last_error = str(e)
            status.last_health_check = datetime.now(timezone.utc)

            # Determine health status based on consecutive failures
            if status.consecutive_failures >= 3:
                status.health = BackendHealth.UNHEALTHY
            elif status.consecutive_failures >= 1:
                status.health = BackendHealth.DEGRADED
            
            logger.warning(f"Health check failed for {backend.id}: {e} "
                         f"(failures: {status.consecutive_failures})")

    def get_healthy_backends(self) -> List[BackendStatus]:
        """Get list of healthy backends"""
        return [
            status for status in self.backends_status.values()
            if status.health == BackendHealth.HEALTHY and status.is_enabled
        ]

    def get_backend_status(self, backend_id: str) -> Optional[BackendStatus]:
        """Get status of specific backend"""
        return self.backends_status.get(backend_id)

    def update_request_stats(self, backend_id: str, success: bool, response_time_ms: float):
        """Update request statistics for a backend"""
        if backend_id not in self.backends_status:
            return

        status = self.backends_status[backend_id]
        status.total_requests += 1

        if success:
            status.successful_requests += 1
        else:
            status.failed_requests += 1

        # Update average response time
        if status.avg_response_time_ms == 0:
            status.avg_response_time_ms = response_time_ms
        else:
            status.avg_response_time_ms = (
                status.avg_response_time_ms * 0.95 + response_time_ms * 0.05
            )

    def update_connection_count(self, backend_id: str, delta: int):
        """Update connection count for a backend"""
        if backend_id not in self.backends_status:
            return

        status = self.backends_status[backend_id]
        status.current_connections = max(0, status.current_connections + delta)


class LoadBalancingEngine:
    """Core load balancing logic"""

    def __init__(self, default_strategy: LoadBalancingStrategy = LoadBalancingStrategy.ROUND_ROBIN):
        self.default_strategy = default_strategy
        self.round_robin_counters: Dict[str, int] = defaultdict(int)
        self.session_affinity: Dict[str, str] = {}  # session_id -> backend_id
        self.consistent_hash_ring: Dict[int, str] = {}
        self.recent_decisions: deque = deque(maxlen=1000)  # For adaptive strategy

    def select_backend(
        self, 
        backends: List[BackendStatus], 
        context: RequestContext,
        strategy: Optional[LoadBalancingStrategy] = None
    ) -> Optional[RoutingDecision]:
        """Select best backend for request"""
        if not backends:
            return None

        start_time = time.time()
        strategy = strategy or self.default_strategy

        try:
            # Filter healthy backends
            healthy_backends = [b for b in backends if b.health == BackendHealth.HEALTHY]
            
            if not healthy_backends:
                # Fallback to degraded backends if no healthy ones
                healthy_backends = [b for b in backends if b.health != BackendHealth.UNHEALTHY]
                
            if not healthy_backends:
                return None

            # Select backend based on strategy
            selected_backend = None
            reason = ""

            if strategy == LoadBalancingStrategy.ROUND_ROBIN:
                selected_backend, reason = self._round_robin(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
                selected_backend, reason = self._weighted_round_robin(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
                selected_backend, reason = self._least_connections(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.WEIGHTED_LEAST_CONNECTIONS:
                selected_backend, reason = self._weighted_least_connections(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.RANDOM:
                selected_backend, reason = self._random(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.WEIGHTED_RANDOM:
                selected_backend, reason = self._weighted_random(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.IP_HASH:
                selected_backend, reason = self._ip_hash(healthy_backends, context.client_ip)
            
            elif strategy == LoadBalancingStrategy.CONSISTENT_HASH:
                selected_backend, reason = self._consistent_hash(healthy_backends, context.client_ip)
            
            elif strategy == LoadBalancingStrategy.RESPONSE_TIME:
                selected_backend, reason = self._response_time(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.HEALTH_BASED:
                selected_backend, reason = self._health_based(healthy_backends)
            
            elif strategy == LoadBalancingStrategy.ADAPTIVE:
                selected_backend, reason = self._adaptive(healthy_backends, context)
            
            else:
                # Fallback to round robin
                selected_backend, reason = self._round_robin(healthy_backends)

            if not selected_backend:
                return None

            # Check for session affinity
            session_affinity = False
            if context.session_id and context.session_id in self.session_affinity:
                affinity_backend_id = self.session_affinity[context.session_id]
                # Check if affinity backend is still healthy
                for backend_status in healthy_backends:
                    if backend_status.backend.id == affinity_backend_id:
                        selected_backend = backend_status
                        reason = f"Session affinity to {affinity_backend_id}"
                        session_affinity = True
                        break

            # Set session affinity for new sessions
            elif context.session_id and not session_affinity:
                self.session_affinity[context.session_id] = selected_backend.backend.id

            decision_time = (time.time() - start_time) * 1000

            decision = RoutingDecision(
                backend=selected_backend.backend,
                strategy_used=strategy,
                decision_time_ms=decision_time,
                reason=reason,
                alternatives_considered=len(healthy_backends),
                session_affinity=session_affinity
            )

            # Store decision for adaptive learning
            self.recent_decisions.append({
                'timestamp': datetime.now(timezone.utc),
                'backend_id': selected_backend.backend.id,
                'strategy': strategy.value,
                'response_time': selected_backend.avg_response_time_ms,
                'success_rate': selected_backend.success_rate
            })

            return decision

        except Exception as e:
            logger.error(f"Backend selection failed: {e}")
            return None

    def _round_robin(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Round robin selection"""
        if not backends:
            return None, "No backends available"

        key = "global"
        index = self.round_robin_counters[key] % len(backends)
        self.round_robin_counters[key] += 1
        
        selected = backends[index]
        return selected, f"Round robin selection (index {index})"

    def _weighted_round_robin(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Weighted round robin selection"""
        if not backends:
            return None, "No backends available"

        # Calculate total weight
        total_weight = sum(b.backend.weight for b in backends)
        if total_weight == 0:
            return self._round_robin(backends)

        # Weighted selection
        key = "weighted"
        counter = self.round_robin_counters[key]
        self.round_robin_counters[key] += 1

        cumulative_weight = 0
        target_weight = (counter * max(b.backend.weight for b in backends)) % total_weight

        for backend_status in backends:
            cumulative_weight += backend_status.backend.weight
            if cumulative_weight > target_weight:
                return backend_status, f"Weighted round robin (weight: {backend_status.backend.weight})"

        # Fallback
        return backends[0], "Weighted round robin fallback"

    def _least_connections(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Least connections selection"""
        if not backends:
            return None, "No backends available"

        selected = min(backends, key=lambda b: b.current_connections)
        return selected, f"Least connections ({selected.current_connections} connections)"

    def _weighted_least_connections(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Weighted least connections selection"""
        if not backends:
            return None, "No backends available"

        # Calculate connection ratio weighted by backend weight
        def connection_ratio(backend_status):
            weight = backend_status.backend.weight
            if weight == 0:
                return float('inf')
            return backend_status.current_connections / weight

        selected = min(backends, key=connection_ratio)
        ratio = connection_ratio(selected)
        return selected, f"Weighted least connections (ratio: {ratio:.2f})"

    def _random(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Random selection"""
        if not backends:
            return None, "No backends available"

        selected = random.choice(backends)
        return selected, "Random selection"

    def _weighted_random(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Weighted random selection"""
        if not backends:
            return None, "No backends available"

        weights = [b.backend.weight for b in backends]
        total_weight = sum(weights)
        
        if total_weight == 0:
            return self._random(backends)

        selected = random.choices(backends, weights=weights)[0]
        return selected, f"Weighted random (weight: {selected.backend.weight})"

    def _ip_hash(self, backends: List[BackendStatus], client_ip: str) -> Tuple[Optional[BackendStatus], str]:
        """IP hash-based selection"""
        if not backends:
            return None, "No backends available"

        # Hash client IP
        hash_value = hashlib.sha256(client_ip.encode()).hexdigest()
        hash_int = int(hash_value[:8], 16)
        
        index = hash_int % len(backends)
        selected = backends[index]
        
        return selected, f"IP hash ({client_ip} -> index {index})"

    def _consistent_hash(self, backends: List[BackendStatus], client_ip: str) -> Tuple[Optional[BackendStatus], str]:
        """Consistent hash selection"""
        if not backends:
            return None, "No backends available"

        # Build hash ring if needed
        if not self.consistent_hash_ring:
            self._build_hash_ring(backends)

        # Hash client IP
        client_hash = int(hashlib.sha256(client_ip.encode()).hexdigest()[:8], 16)
        
        # Find closest backend in hash ring
        ring_keys = sorted(self.consistent_hash_ring.keys())
        selected_key = ring_keys[0]  # Default to first
        
        for key in ring_keys:
            if key >= client_hash:
                selected_key = key
                break

        backend_id = self.consistent_hash_ring[selected_key]
        
        # Find backend status
        for backend_status in backends:
            if backend_status.backend.id == backend_id:
                return backend_status, f"Consistent hash ({client_ip} -> {backend_id})"

        # Fallback
        return backends[0], "Consistent hash fallback"

    def _build_hash_ring(self, backends: List[BackendStatus]):
        """Build consistent hash ring"""
        self.consistent_hash_ring.clear()
        
        for backend_status in backends:
            backend_id = backend_status.backend.id
            # Add multiple points for better distribution
            for i in range(3):
                hash_key = f"{backend_id}:{i}"
                hash_value = int(hashlib.sha256(hash_key.encode()).hexdigest()[:8], 16)
                self.consistent_hash_ring[hash_value] = backend_id

    def _response_time(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Response time-based selection"""
        if not backends:
            return None, "No backends available"

        # Select backend with lowest average response time
        selected = min(backends, key=lambda b: b.avg_response_time_ms or float('inf'))
        return selected, f"Lowest response time ({selected.avg_response_time_ms:.2f}ms)"

    def _health_based(self, backends: List[BackendStatus]) -> Tuple[Optional[BackendStatus], str]:
        """Health-based selection"""
        if not backends:
            return None, "No backends available"

        # Score backends based on health metrics
        def health_score(backend_status):
            score = 0
            
            # Health status score
            if backend_status.health == BackendHealth.HEALTHY:
                score += 100
            elif backend_status.health == BackendHealth.DEGRADED:
                score += 50
            
            # Success rate score
            score += backend_status.success_rate
            
            # Response time score (lower is better)
            if backend_status.avg_response_time_ms > 0:
                score -= (backend_status.avg_response_time_ms / 10)
            
            # Utilization score (lower is better)
            score -= backend_status.utilization
            
            return score

        selected = max(backends, key=health_score)
        score = health_score(selected)
        return selected, f"Health-based selection (score: {score:.2f})"

    def _adaptive(self, backends: List[BackendStatus], context: RequestContext) -> Tuple[Optional[BackendStatus], str]:
        """Adaptive selection based on recent performance"""
        if not backends:
            return None, "No backends available"

        # Analyze recent decisions
        if len(self.recent_decisions) < 10:
            # Not enough data, use weighted least connections
            return self._weighted_least_connections(backends)

        # Calculate performance scores based on recent data
        recent_performance = defaultdict(list)
        
        for decision in list(self.recent_decisions)[-50:]:  # Last 50 decisions
            backend_id = decision['backend_id']
            # Combine response time and success rate into performance score
            perf_score = decision['success_rate'] - (decision['response_time'] / 10)
            recent_performance[backend_id].append(perf_score)

        # Select backend with best recent performance
        best_backend = None
        best_score = float('-inf')
        
        for backend_status in backends:
            backend_id = backend_status.backend.id
            if backend_id in recent_performance:
                avg_score = statistics.mean(recent_performance[backend_id])
                if avg_score > best_score:
                    best_score = avg_score
                    best_backend = backend_status

        if best_backend:
            return best_backend, f"Adaptive selection (performance score: {best_score:.2f})"
        
        # Fallback to weighted least connections
        return self._weighted_least_connections(backends)


class LoadBalancerService:
    """Main load balancing service"""

    def __init__(self, default_strategy: LoadBalancingStrategy = LoadBalancingStrategy.ROUND_ROBIN):
        self.backends: Dict[str, Backend] = {}
        self.health_checker = HealthChecker()
        self.load_balancing_engine = LoadBalancingEngine(default_strategy)
        self.default_strategy = default_strategy
        
        # Statistics
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.request_history: deque = deque(maxlen=1000)

    async def start(self):
        """Start the load balancer service"""
        if self.backends:
            await self.health_checker.start(list(self.backends.values()))
        
        logger.info("Load balancer service started")

    async def stop(self):
        """Stop the load balancer service"""
        await self.health_checker.stop()
        logger.info("Load balancer service stopped")

    def add_backend(self, backend: Backend):
        """Add a backend server"""
        self.backends[backend.id] = backend
        logger.info(f"Added backend: {backend.id} ({backend.endpoint})")

    def remove_backend(self, backend_id: str):
        """Remove a backend server"""
        if backend_id in self.backends:
            del self.backends[backend_id]
            logger.info(f"Removed backend: {backend_id}")

    def get_backend(self, backend_id: str) -> Optional[Backend]:
        """Get backend by ID"""
        return self.backends.get(backend_id)

    def list_backends(self) -> List[Backend]:
        """List all backends"""
        return list(self.backends.values())

    def get_backend_status(self, backend_id: str) -> Optional[BackendStatus]:
        """Get backend status"""
        return self.health_checker.get_backend_status(backend_id)

    def list_backend_status(self) -> List[BackendStatus]:
        """List all backend statuses"""
        return list(self.health_checker.backends_status.values())

    async def route_request(self, context: RequestContext, 
                          strategy: Optional[LoadBalancingStrategy] = None) -> Optional[RoutingDecision]:
        """Route a request to appropriate backend"""
        try:
            # Get healthy backends
            healthy_backends = self.health_checker.get_healthy_backends()
            
            if not healthy_backends:
                logger.warning("No healthy backends available for request routing")
                return None

            # Select backend
            decision = self.load_balancing_engine.select_backend(
                healthy_backends, context, strategy
            )

            if decision:
                # Update connection count
                self.health_checker.update_connection_count(decision.backend.id, 1)
                
                # Record request
                self.total_requests += 1
                self.request_history.append({
                    'timestamp': datetime.now(timezone.utc),
                    'backend_id': decision.backend.id,
                    'client_ip': context.client_ip,
                    'strategy': decision.strategy_used.value,
                    'decision_time_ms': decision.decision_time_ms
                })

            return decision

        except Exception as e:
            logger.error(f"Request routing failed: {e}")
            return None

    def complete_request(self, backend_id: str, success: bool, response_time_ms: float):
        """Mark request as completed and update statistics"""
        try:
            # Update backend statistics
            self.health_checker.update_request_stats(backend_id, success, response_time_ms)
            
            # Update connection count
            self.health_checker.update_connection_count(backend_id, -1)
            
            # Update global statistics
            if success:
                self.successful_requests += 1
            else:
                self.failed_requests += 1

        except Exception as e:
            logger.error(f"Failed to update request completion stats: {e}")

    def get_load_balancer_stats(self) -> Dict[str, Any]:
        """Get load balancer statistics"""
        healthy_backends = len(self.health_checker.get_healthy_backends())
        total_backends = len(self.backends)
        
        return {
            'total_backends': total_backends,
            'healthy_backends': healthy_backends,
            'unhealthy_backends': total_backends - healthy_backends,
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'failed_requests': self.failed_requests,
            'success_rate': (self.successful_requests / max(1, self.total_requests)) * 100,
            'default_strategy': self.default_strategy.value,
            'recent_requests': len(self.request_history)
        }

    def get_traffic_distribution(self) -> Dict[str, Any]:
        """Get traffic distribution statistics"""
        backend_requests = defaultdict(int)
        
        # Count requests per backend from recent history
        for request in self.request_history:
            backend_requests[request['backend_id']] += 1

        total_recent = len(self.request_history)
        
        distribution = {}
        for backend_id, count in backend_requests.items():
            percentage = (count / max(1, total_recent)) * 100
            distribution[backend_id] = {
                'requests': count,
                'percentage': percentage
            }

        return {
            'total_recent_requests': total_recent,
            'distribution': distribution,
            'analysis_period': 'Last 1000 requests'
        }

    def set_default_strategy(self, strategy: LoadBalancingStrategy):
        """Set default load balancing strategy"""
        self.default_strategy = strategy
        self.load_balancing_engine.default_strategy = strategy
        logger.info(f"Default load balancing strategy set to: {strategy.value}")

    def enable_backend(self, backend_id: str) -> bool:
        """Enable a backend"""
        status = self.health_checker.get_backend_status(backend_id)
        if status:
            status.is_enabled = True
            logger.info(f"Backend {backend_id} enabled")
            return True
        return False

    def disable_backend(self, backend_id: str) -> bool:
        """Disable a backend"""
        status = self.health_checker.get_backend_status(backend_id)
        if status:
            status.is_enabled = False
            logger.info(f"Backend {backend_id} disabled")
            return True
        return False

    def get_strategy_recommendations(self) -> Dict[str, Any]:
        """Get recommendations for optimal load balancing strategy"""
        if len(self.request_history) < 50:
            return {
                'recommendation': LoadBalancingStrategy.ROUND_ROBIN.value,
                'reason': 'Insufficient data for analysis',
                'confidence': 'low'
            }

        # Analyze recent performance by strategy
        strategy_performance = defaultdict(list)
        
        for request in list(self.request_history)[-100:]:
            strategy = request['strategy']
            decision_time = request['decision_time_ms']
            strategy_performance[strategy].append(decision_time)

        # Find strategy with best performance
        best_strategy = None
        best_avg_time = float('inf')
        
        for strategy, times in strategy_performance.items():
            if len(times) >= 5:  # Minimum sample size
                avg_time = statistics.mean(times)
                if avg_time < best_avg_time:
                    best_avg_time = avg_time
                    best_strategy = strategy

        if best_strategy:
            confidence = 'high' if len(strategy_performance[best_strategy]) >= 20 else 'medium'
            return {
                'recommendation': best_strategy,
                'reason': f'Best average decision time: {best_avg_time:.2f}ms',
                'confidence': confidence,
                'analysis_sample_size': len(strategy_performance[best_strategy])
            }
        
        return {
            'recommendation': LoadBalancingStrategy.ADAPTIVE.value,
            'reason': 'Multiple strategies available, adaptive recommended',
            'confidence': 'medium'
        }


# Global load balancer service instance
_load_balancer_service: Optional[LoadBalancerService] = None


async def initialize_load_balancer_service(
    default_strategy: LoadBalancingStrategy = LoadBalancingStrategy.ROUND_ROBIN
) -> LoadBalancerService:
    """Initialize global load balancer service"""
    global _load_balancer_service
    
    _load_balancer_service = LoadBalancerService(default_strategy)
    await _load_balancer_service.start()
    
    logger.info("Global load balancer service initialized")
    return _load_balancer_service


async def shutdown_load_balancer_service():
    """Shutdown global load balancer service"""
    global _load_balancer_service
    
    if _load_balancer_service:
        await _load_balancer_service.stop()
        _load_balancer_service = None
        logger.info("Global load balancer service shutdown")


def get_load_balancer_service() -> LoadBalancerService:
    """Get global load balancer service instance"""
    if not _load_balancer_service:
        raise RuntimeError("Load balancer service not initialized. Call initialize_load_balancer_service() first.")
    
    return _load_balancer_service