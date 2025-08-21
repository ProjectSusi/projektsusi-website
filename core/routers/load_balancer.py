"""
Load Balancing Management API
Configuration and monitoring endpoints for load balancing
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from ..services.load_balancer_service import (
    LoadBalancerService, Backend, LoadBalancingStrategy, RequestContext,
    get_load_balancer_service
)
from ..middleware.auth_middleware import require_authentication, require_admin_role
from ..repositories.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/load-balancer", tags=["Load Balancing"])


# Pydantic models for API

class BackendCreateRequest(BaseModel):
    """Request model for creating a backend"""
    id: str = Field(..., description="Unique backend identifier")
    host: str = Field(..., description="Backend host/IP address")
    port: int = Field(..., ge=1, le=65535, description="Backend port")
    weight: float = Field(default=1.0, ge=0.1, le=10.0, description="Backend weight for weighted algorithms")
    max_connections: int = Field(default=100, ge=1, le=10000, description="Maximum concurrent connections")
    health_check_url: str = Field(default="/health", description="Health check endpoint path")
    timeout_ms: int = Field(default=5000, ge=100, le=30000, description="Request timeout in milliseconds")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional backend metadata")


class BackendResponse(BaseModel):
    """Response model for backend information"""
    id: str
    host: str
    port: int
    weight: float
    max_connections: int
    health_check_url: str
    timeout_ms: int
    endpoint: str
    metadata: Dict[str, Any]


class BackendStatusResponse(BaseModel):
    """Response model for backend status"""
    backend: BackendResponse
    health: str
    current_connections: int
    total_requests: int
    successful_requests: int
    failed_requests: int
    success_rate: float
    error_rate: float
    avg_response_time_ms: float
    utilization: float
    last_health_check: Optional[str]
    last_error: Optional[str]
    consecutive_failures: int
    is_enabled: bool


class RouteRequest(BaseModel):
    """Request model for routing simulation"""
    client_ip: str = Field(..., description="Client IP address")
    user_agent: Optional[str] = Field(default=None, description="User agent string")
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    tenant_id: Optional[int] = Field(default=None, description="Tenant ID")
    request_path: str = Field(default="/", description="Request path")
    request_method: str = Field(default="GET", description="HTTP method")
    strategy: Optional[LoadBalancingStrategy] = Field(default=None, description="Override load balancing strategy")


class RouteResponse(BaseModel):
    """Response model for routing decision"""
    backend: BackendResponse
    strategy_used: str
    decision_time_ms: float
    reason: str
    alternatives_considered: int
    session_affinity: bool


class LoadBalancerStatsResponse(BaseModel):
    """Response model for load balancer statistics"""
    total_backends: int
    healthy_backends: int
    unhealthy_backends: int
    total_requests: int
    successful_requests: int
    failed_requests: int
    success_rate: float
    default_strategy: str
    recent_requests: int


class TrafficDistributionResponse(BaseModel):
    """Response model for traffic distribution"""
    total_recent_requests: int
    distribution: Dict[str, Dict[str, Any]]
    analysis_period: str


class StrategyRecommendationResponse(BaseModel):
    """Response model for strategy recommendations"""
    recommendation: str
    reason: str
    confidence: str
    analysis_sample_size: Optional[int] = None


# API Endpoints

@router.get("/status", response_model=LoadBalancerStatsResponse)
async def get_load_balancer_status(
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Get load balancer status and statistics"""
    try:
        stats = lb_service.get_load_balancer_stats()
        return LoadBalancerStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Failed to get load balancer status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve load balancer status")


@router.get("/backends", response_model=List[BackendResponse])
async def list_backends(
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """List all configured backends"""
    try:
        backends = lb_service.list_backends()
        
        return [
            BackendResponse(
                id=backend.id,
                host=backend.host,
                port=backend.port,
                weight=backend.weight,
                max_connections=backend.max_connections,
                health_check_url=backend.health_check_url,
                timeout_ms=backend.timeout_ms,
                endpoint=backend.endpoint,
                metadata=backend.metadata or {}
            )
            for backend in backends
        ]
        
    except Exception as e:
        logger.error(f"Failed to list backends: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve backends")


@router.get("/backends/status", response_model=List[BackendStatusResponse])
async def list_backend_status(
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """List status of all backends"""
    try:
        backend_statuses = lb_service.list_backend_status()
        
        response = []
        for status in backend_statuses:
            backend_info = BackendResponse(
                id=status.backend.id,
                host=status.backend.host,
                port=status.backend.port,
                weight=status.backend.weight,
                max_connections=status.backend.max_connections,
                health_check_url=status.backend.health_check_url,
                timeout_ms=status.backend.timeout_ms,
                endpoint=status.backend.endpoint,
                metadata=status.backend.metadata or {}
            )
            
            response.append(BackendStatusResponse(
                backend=backend_info,
                health=status.health.value,
                current_connections=status.current_connections,
                total_requests=status.total_requests,
                successful_requests=status.successful_requests,
                failed_requests=status.failed_requests,
                success_rate=status.success_rate,
                error_rate=status.error_rate,
                avg_response_time_ms=status.avg_response_time_ms,
                utilization=status.utilization,
                last_health_check=status.last_health_check.isoformat() if status.last_health_check else None,
                last_error=status.last_error,
                consecutive_failures=status.consecutive_failures,
                is_enabled=status.is_enabled
            ))
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to get backend status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve backend status")


@router.get("/backends/{backend_id}/status", response_model=BackendStatusResponse)
async def get_backend_status(
    backend_id: str,
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Get status of specific backend"""
    try:
        status = lb_service.get_backend_status(backend_id)
        
        if not status:
            raise HTTPException(status_code=404, detail=f"Backend {backend_id} not found")
        
        backend_info = BackendResponse(
            id=status.backend.id,
            host=status.backend.host,
            port=status.backend.port,
            weight=status.backend.weight,
            max_connections=status.backend.max_connections,
            health_check_url=status.backend.health_check_url,
            timeout_ms=status.backend.timeout_ms,
            endpoint=status.backend.endpoint,
            metadata=status.backend.metadata or {}
        )
        
        return BackendStatusResponse(
            backend=backend_info,
            health=status.health.value,
            current_connections=status.current_connections,
            total_requests=status.total_requests,
            successful_requests=status.successful_requests,
            failed_requests=status.failed_requests,
            success_rate=status.success_rate,
            error_rate=status.error_rate,
            avg_response_time_ms=status.avg_response_time_ms,
            utilization=status.utilization,
            last_health_check=status.last_health_check.isoformat() if status.last_health_check else None,
            last_error=status.last_error,
            consecutive_failures=status.consecutive_failures,
            is_enabled=status.is_enabled
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get backend status for {backend_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve backend status")


@router.post("/route", response_model=RouteResponse)
async def simulate_route_request(
    route_request: RouteRequest,
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Simulate request routing (for testing and analysis)"""
    try:
        # Create request context
        context = RequestContext(
            client_ip=route_request.client_ip,
            user_agent=route_request.user_agent,
            session_id=route_request.session_id,
            tenant_id=route_request.tenant_id,
            request_path=route_request.request_path,
            request_method=route_request.request_method,
            timestamp=datetime.now(timezone.utc)
        )
        
        # Route request
        decision = await lb_service.route_request(context, route_request.strategy)
        
        if not decision:
            raise HTTPException(status_code=503, detail="No healthy backends available")
        
        backend_info = BackendResponse(
            id=decision.backend.id,
            host=decision.backend.host,
            port=decision.backend.port,
            weight=decision.backend.weight,
            max_connections=decision.backend.max_connections,
            health_check_url=decision.backend.health_check_url,
            timeout_ms=decision.backend.timeout_ms,
            endpoint=decision.backend.endpoint,
            metadata=decision.backend.metadata or {}
        )
        
        return RouteResponse(
            backend=backend_info,
            strategy_used=decision.strategy_used.value,
            decision_time_ms=decision.decision_time_ms,
            reason=decision.reason,
            alternatives_considered=decision.alternatives_considered,
            session_affinity=decision.session_affinity
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to route request: {e}")
        raise HTTPException(status_code=500, detail="Request routing failed")


@router.get("/traffic/distribution", response_model=TrafficDistributionResponse)
async def get_traffic_distribution(
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Get traffic distribution statistics"""
    try:
        distribution = lb_service.get_traffic_distribution()
        return TrafficDistributionResponse(**distribution)
        
    except Exception as e:
        logger.error(f"Failed to get traffic distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve traffic distribution")


@router.get("/strategy/recommendations", response_model=StrategyRecommendationResponse)
async def get_strategy_recommendations(
    current_user: User = Depends(require_authentication),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Get load balancing strategy recommendations"""
    try:
        recommendations = lb_service.get_strategy_recommendations()
        return StrategyRecommendationResponse(**recommendations)
        
    except Exception as e:
        logger.error(f"Failed to get strategy recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve strategy recommendations")


# Admin-only endpoints

@router.post("/admin/backends")
async def create_backend(
    backend_request: BackendCreateRequest,
    current_user: User = Depends(require_admin_role),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Create a new backend (admin only)"""
    try:
        # Check if backend already exists
        if lb_service.get_backend(backend_request.id):
            raise HTTPException(status_code=409, detail=f"Backend {backend_request.id} already exists")
        
        # Create backend
        backend = Backend(
            id=backend_request.id,
            host=backend_request.host,
            port=backend_request.port,
            weight=backend_request.weight,
            max_connections=backend_request.max_connections,
            health_check_url=backend_request.health_check_url,
            timeout_ms=backend_request.timeout_ms,
            metadata=backend_request.metadata or {}
        )
        
        lb_service.add_backend(backend)
        
        return {
            "message": f"Backend {backend.id} created successfully",
            "backend_id": backend.id,
            "endpoint": backend.endpoint,
            "created_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create backend: {e}")
        raise HTTPException(status_code=500, detail="Failed to create backend")


@router.delete("/admin/backends/{backend_id}")
async def delete_backend(
    backend_id: str,
    current_user: User = Depends(require_admin_role),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Delete a backend (admin only)"""
    try:
        backend = lb_service.get_backend(backend_id)
        if not backend:
            raise HTTPException(status_code=404, detail=f"Backend {backend_id} not found")
        
        lb_service.remove_backend(backend_id)
        
        return {
            "message": f"Backend {backend_id} deleted successfully",
            "backend_id": backend_id,
            "deleted_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete backend {backend_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete backend")


@router.post("/admin/backends/{backend_id}/enable")
async def enable_backend(
    backend_id: str,
    current_user: User = Depends(require_admin_role),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Enable a backend (admin only)"""
    try:
        success = lb_service.enable_backend(backend_id)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Backend {backend_id} not found")
        
        return {
            "message": f"Backend {backend_id} enabled successfully",
            "backend_id": backend_id,
            "enabled_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to enable backend {backend_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to enable backend")


@router.post("/admin/backends/{backend_id}/disable")
async def disable_backend(
    backend_id: str,
    current_user: User = Depends(require_admin_role),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Disable a backend (admin only)"""
    try:
        success = lb_service.disable_backend(backend_id)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Backend {backend_id} not found")
        
        return {
            "message": f"Backend {backend_id} disabled successfully",
            "backend_id": backend_id,
            "disabled_by": current_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to disable backend {backend_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to disable backend")


@router.put("/admin/strategy")
async def set_default_strategy(
    strategy: LoadBalancingStrategy,
    current_user: User = Depends(require_admin_role),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Set default load balancing strategy (admin only)"""
    try:
        lb_service.set_default_strategy(strategy)
        
        return {
            "message": f"Default load balancing strategy set to {strategy.value}",
            "strategy": strategy.value,
            "set_by": current_user.username
        }
        
    except Exception as e:
        logger.error(f"Failed to set default strategy: {e}")
        raise HTTPException(status_code=500, detail="Failed to set default strategy")


@router.post("/admin/request-complete")
async def complete_request(
    backend_id: str,
    success: bool,
    response_time_ms: float,
    current_user: User = Depends(require_admin_role),
    lb_service: LoadBalancerService = Depends(get_load_balancer_service)
):
    """Mark a request as completed (admin only - typically called by proxy/gateway)"""
    try:
        lb_service.complete_request(backend_id, success, response_time_ms)
        
        return {
            "message": "Request completion recorded",
            "backend_id": backend_id,
            "success": success,
            "response_time_ms": response_time_ms
        }
        
    except Exception as e:
        logger.error(f"Failed to record request completion: {e}")
        raise HTTPException(status_code=500, detail="Failed to record request completion")


# Utility and info endpoints

@router.get("/strategies")
async def list_available_strategies():
    """List all available load balancing strategies"""
    return {
        "strategies": [
            {
                "name": strategy.value,
                "description": _get_strategy_description(strategy)
            }
            for strategy in LoadBalancingStrategy
        ]
    }


@router.get("/health")
async def load_balancer_health():
    """Check load balancer service health"""
    try:
        lb_service = get_load_balancer_service()
        stats = lb_service.get_load_balancer_stats()
        
        healthy_ratio = stats['healthy_backends'] / max(1, stats['total_backends'])
        
        return {
            "status": "healthy" if healthy_ratio > 0.5 else "degraded" if healthy_ratio > 0 else "unhealthy",
            "total_backends": stats['total_backends'],
            "healthy_backends": stats['healthy_backends'],
            "healthy_ratio": healthy_ratio,
            "total_requests": stats['total_requests'],
            "success_rate": stats['success_rate']
        }
        
    except Exception as e:
        logger.error(f"Load balancer health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get("/info")
async def get_load_balancer_info():
    """Get general information about load balancing capabilities"""
    return {
        "service": "Load Balancing Service",
        "version": "1.0.0",
        "description": "Intelligent load balancing and traffic distribution",
        "supported_strategies": [strategy.value for strategy in LoadBalancingStrategy],
        "features": [
            "Multiple load balancing algorithms",
            "Health monitoring and automatic failover",
            "Session affinity support",
            "Weighted backend configuration",
            "Real-time traffic distribution analytics",
            "Adaptive strategy selection",
            "Backend management and monitoring"
        ]
    }


def _get_strategy_description(strategy: LoadBalancingStrategy) -> str:
    """Get description for load balancing strategy"""
    descriptions = {
        LoadBalancingStrategy.ROUND_ROBIN: "Distribute requests evenly across all healthy backends",
        LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN: "Distribute requests based on backend weights",
        LoadBalancingStrategy.LEAST_CONNECTIONS: "Route to backend with fewest active connections",
        LoadBalancingStrategy.WEIGHTED_LEAST_CONNECTIONS: "Route to backend with lowest connection/weight ratio",
        LoadBalancingStrategy.RANDOM: "Randomly select from healthy backends",
        LoadBalancingStrategy.WEIGHTED_RANDOM: "Randomly select with probability based on weights",
        LoadBalancingStrategy.IP_HASH: "Route based on client IP hash for session persistence",
        LoadBalancingStrategy.CONSISTENT_HASH: "Use consistent hashing for better distribution",
        LoadBalancingStrategy.RESPONSE_TIME: "Route to backend with fastest response time",
        LoadBalancingStrategy.HEALTH_BASED: "Route based on comprehensive health scoring",
        LoadBalancingStrategy.ADAPTIVE: "Dynamically select best strategy based on performance"
    }
    
    return descriptions.get(strategy, "Unknown strategy")