"""
Load Balancer Middleware
Routes requests through the load balancing system for high availability
"""
import logging
import time
from typing import Optional
from datetime import datetime, timezone

from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from ..services.load_balancer_service import (
    get_load_balancer_service,
    LoadBalancerService,
    RequestContext,
    LoadBalancingStrategy
)

logger = logging.getLogger(__name__)


class LoadBalancerMiddleware(BaseHTTPMiddleware):
    """Middleware to route requests through load balancer"""
    
    def __init__(
        self,
        app,
        enabled: bool = True,
        bypass_paths: Optional[list] = None,
        strategy: Optional[LoadBalancingStrategy] = None
    ):
        super().__init__(app)
        self.enabled = enabled
        self.bypass_paths = bypass_paths or [
            "/health",
            "/docs", 
            "/openapi.json",
            "/static",
            "/api/v1/load-balancer",
            "/api/v1/status",
            "/api/v1/health"
        ]
        self.default_strategy = strategy
        
    async def dispatch(self, request: Request, call_next):
        """Route request through load balancer if enabled"""
        
        # Skip load balancing if disabled
        if not self.enabled:
            return await call_next(request)
            
        # Skip load balancing for certain paths
        if any(request.url.path.startswith(path) for path in self.bypass_paths):
            return await call_next(request)
            
        # Skip for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
            
        try:
            # Get load balancer service
            lb_service = get_load_balancer_service()
            
            # Create request context
            context = RequestContext(
                client_ip=self._get_client_ip(request),
                user_agent=request.headers.get("user-agent"),
                session_id=self._get_session_id(request),
                tenant_id=getattr(request.state, 'tenant_id', None),
                request_path=request.url.path,
                request_method=request.method,
                headers=dict(request.headers),
                timestamp=datetime.now(timezone.utc)
            )
            
            # Route request through load balancer
            start_time = time.time()
            decision = await lb_service.route_request(context, self.default_strategy)
            
            if not decision:
                # No healthy backends available - proceed with original request
                logger.warning("No healthy backends available, proceeding with original request")
                response = await call_next(request)
                
                # Record failed request
                response_time = (time.time() - start_time) * 1000
                lb_service.complete_request("localhost", False, response_time)
                
                return response
            
            # Add load balancer headers to track routing
            request.state.load_balancer_backend = decision.backend.id
            request.state.load_balancer_strategy = decision.strategy_used.value
            request.state.load_balancer_decision_time = decision.decision_time_ms
            
            # Process request
            try:
                response = await call_next(request)
                success = 200 <= response.status_code < 400
                
                # Calculate response time
                response_time = (time.time() - start_time) * 1000
                
                # Record request completion
                lb_service.complete_request(decision.backend.id, success, response_time)
                
                # Add load balancer info to response headers (for debugging)
                response.headers["X-Load-Balancer-Backend"] = decision.backend.id
                response.headers["X-Load-Balancer-Strategy"] = decision.strategy_used.value
                response.headers["X-Load-Balancer-Decision-Time"] = f"{decision.decision_time_ms:.2f}ms"
                
                if decision.session_affinity:
                    response.headers["X-Load-Balancer-Session-Affinity"] = "true"
                
                return response
                
            except Exception as e:
                # Request failed
                response_time = (time.time() - start_time) * 1000
                lb_service.complete_request(decision.backend.id, False, response_time)
                
                logger.error(f"Request failed for backend {decision.backend.id}: {e}")
                raise
                
        except RuntimeError:
            # Load balancer service not initialized - proceed normally
            logger.debug("Load balancer service not initialized, proceeding with original request")
            return await call_next(request)
            
        except Exception as e:
            # Load balancing failed - proceed with original request
            logger.error(f"Load balancing failed: {e}")
            return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        # Check for forwarded headers first (proxy/load balancer)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
            
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
            
        # Fallback to direct connection
        if hasattr(request, "client") and request.client:
            return request.client.host
            
        return "unknown"
    
    def _get_session_id(self, request: Request) -> Optional[str]:
        """Extract session ID from request"""
        # Check for session cookie
        session_id = request.cookies.get("session_id")
        if session_id:
            return session_id
            
        # Check for session header
        session_id = request.headers.get("x-session-id")
        if session_id:
            return session_id
            
        # Check for JWT token (extract session from claims if needed)
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # This could decode JWT and extract session info
                # For now, just use the token as session identifier
                token = auth_header[7:]  # Remove "Bearer " prefix
                return f"jwt:{token[:8]}"  # Use first 8 chars as session ID
            except Exception:
                pass
                
        return None


class LoadBalancerProxyMiddleware(BaseHTTPMiddleware):
    """
    Advanced middleware that can proxy requests to different backends
    (For future use with actual distributed backends)
    """
    
    def __init__(
        self,
        app,
        enabled: bool = False,  # Disabled by default - requires backend configuration
        proxy_enabled: bool = False
    ):
        super().__init__(app)
        self.enabled = enabled
        self.proxy_enabled = proxy_enabled
        
    async def dispatch(self, request: Request, call_next):
        """Proxy request to load balanced backend"""
        
        # Currently disabled - would require actual backend services
        if not self.enabled or not self.proxy_enabled:
            return await call_next(request)
            
        # Future implementation would:
        # 1. Get backend from load balancer decision
        # 2. Forward request to backend server
        # 3. Return backend response
        # 4. Handle backend failures and retries
        
        return await call_next(request)


def create_load_balancer_middleware(
    enabled: bool = True,
    strategy: Optional[LoadBalancingStrategy] = None,
    bypass_paths: Optional[list] = None
) -> type:
    """Factory function to create configured load balancer middleware"""
    
    class ConfiguredLoadBalancerMiddleware(LoadBalancerMiddleware):
        def __init__(self, app):
            super().__init__(
                app, 
                enabled=enabled,
                strategy=strategy,
                bypass_paths=bypass_paths
            )
    
    return ConfiguredLoadBalancerMiddleware