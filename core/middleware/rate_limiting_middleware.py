"""
Rate Limiting Middleware
Protects against API abuse and DoS attacks
"""

import time
import logging
from typing import Dict, Optional
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
import os

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with sliding window algorithm"""
    
    def __init__(
        self, 
        app, 
        calls: int = 100,
        period: int = 60,
        per_ip: bool = True,
        per_user: bool = False,
        exempt_paths: Optional[list] = None
    ):
        super().__init__(app)
        self.calls = int(os.getenv('RATE_LIMIT_CALLS', calls))
        self.period = int(os.getenv('RATE_LIMIT_PERIOD', period))
        self.per_ip = per_ip
        self.per_user = per_user
        self.exempt_paths = exempt_paths or ['/health', '/metrics', '/docs', '/openapi.json']
        
        # In-memory storage (use Redis in production)
        self.requests: Dict[str, list] = defaultdict(list)
        
        logger.info(f"Rate limiting: {self.calls} calls per {self.period}s")
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting"""
        
        # Check if path is exempt
        if any(request.url.path.startswith(exempt) for exempt in self.exempt_paths):
            return await call_next(request)
        
        # Determine rate limit key
        rate_limit_key = self._get_rate_limit_key(request)
        
        # Check rate limit
        if self._is_rate_limited(rate_limit_key):
            return self._rate_limit_response(request)
        
        # Record request
        self._record_request(rate_limit_key)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        remaining, reset_time = self._get_rate_limit_info(rate_limit_key)
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(reset_time))
        
        return response
    
    def _get_rate_limit_key(self, request: Request) -> str:
        """Generate rate limit key based on IP or user"""
        if self.per_user:
            # Try to get user ID from JWT token
            auth_header = request.headers.get('authorization', '')
            if auth_header.startswith('Bearer '):
                try:
                    import jwt
                    token = auth_header.split(' ')[1]
                    payload = jwt.decode(token, options={"verify_signature": False})
                    user_id = payload.get('sub')
                    if user_id:
                        return f"user:{user_id}"
                except:
                    pass
        
        # Fallback to IP-based limiting
        client_ip = self._get_client_ip(request)
        return f"ip:{client_ip}"
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP considering proxies"""
        # Check forwarded headers (for reverse proxies)
        forwarded_for = request.headers.get('x-forwarded-for')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('x-real-ip')
        if real_ip:
            return real_ip
        
        # Fallback to direct connection
        if hasattr(request.client, 'host'):
            return request.client.host
        
        return 'unknown'
    
    def _is_rate_limited(self, key: str) -> bool:
        """Check if key is rate limited"""
        current_time = time.time()
        
        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if current_time - req_time < self.period
        ]
        
        # Check if over limit
        return len(self.requests[key]) >= self.calls
    
    def _record_request(self, key: str):
        """Record a request timestamp"""
        self.requests[key].append(time.time())
    
    def _get_rate_limit_info(self, key: str) -> tuple:
        """Get remaining requests and reset time"""
        current_time = time.time()
        request_times = self.requests.get(key, [])
        
        # Clean old requests
        valid_requests = [
            req_time for req_time in request_times
            if current_time - req_time < self.period
        ]
        
        remaining = max(0, self.calls - len(valid_requests))
        
        # Calculate reset time (when oldest request expires)
        if valid_requests:
            oldest_request = min(valid_requests)
            reset_time = oldest_request + self.period
        else:
            reset_time = current_time + self.period
        
        return remaining, reset_time
    
    def _rate_limit_response(self, request: Request) -> Response:
        """Return rate limit exceeded response"""
        client_ip = self._get_client_ip(request)
        
        logger.warning(
            f"Rate limit exceeded: {client_ip} on {request.url.path}"
        )
        
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Limit: {self.calls} per {self.period} seconds",
                "retry_after": self.period
            },
            headers={
                "Retry-After": str(self.period),
                "X-RateLimit-Limit": str(self.calls),
                "X-RateLimit-Remaining": "0"
            }
        )


class AdvancedRateLimitMiddleware(BaseHTTPMiddleware):
    """Advanced rate limiting with multiple limits and burst handling"""
    
    def __init__(self, app):
        super().__init__(app)
        
        # Different limits for different endpoint types
        self.limits = {
            # API endpoints - strict limits
            'api': {
                'calls': int(os.getenv('API_RATE_LIMIT', '100')),
                'period': 60,
                'burst': int(os.getenv('API_BURST_LIMIT', '20'))
            },
            # Auth endpoints - very strict
            'auth': {
                'calls': int(os.getenv('AUTH_RATE_LIMIT', '10')),
                'period': 60,
                'burst': int(os.getenv('AUTH_BURST_LIMIT', '3'))
            },
            # Upload endpoints - file size based
            'upload': {
                'calls': int(os.getenv('UPLOAD_RATE_LIMIT', '20')),
                'period': 60,
                'burst': int(os.getenv('UPLOAD_BURST_LIMIT', '5'))
            },
            # Default for other endpoints
            'default': {
                'calls': int(os.getenv('DEFAULT_RATE_LIMIT', '200')),
                'period': 60,
                'burst': int(os.getenv('DEFAULT_BURST_LIMIT', '50'))
            }
        }
        
        # Request tracking
        self.requests = defaultdict(list)
        self.burst_requests = defaultdict(list)
        
        logger.info("Advanced rate limiting initialized")
    
    async def dispatch(self, request: Request, call_next):
        """Process request with advanced rate limiting"""
        
        # Determine endpoint category
        category = self._categorize_endpoint(request.url.path)
        
        # Skip rate limiting for exempt paths
        if category == 'exempt':
            return await call_next(request)
        
        # Get rate limit configuration
        config = self.limits.get(category, self.limits['default'])
        
        # Check both regular and burst limits
        rate_limit_key = self._get_rate_limit_key(request)
        
        if self._is_burst_limited(rate_limit_key, config):
            return self._burst_limit_response()
        
        if self._is_rate_limited(rate_limit_key, config):
            return self._rate_limit_response(config)
        
        # Record request
        self._record_request(rate_limit_key, config)
        
        # Process request
        response = await call_next(request)
        
        # Add headers
        remaining, reset_time = self._get_rate_limit_info(rate_limit_key, config)
        response.headers["X-RateLimit-Category"] = category
        response.headers["X-RateLimit-Limit"] = str(config['calls'])
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(reset_time))
        
        return response
    
    def _categorize_endpoint(self, path: str) -> str:
        """Categorize endpoint for different rate limits"""
        # Exempt paths
        if any(path.startswith(exempt) for exempt in ['/health', '/metrics', '/docs', '/static']):
            return 'exempt'
        
        # Authentication endpoints
        if any(path.startswith(auth) for auth in ['/api/v1/auth', '/login', '/register']):
            return 'auth'
        
        # Upload endpoints
        if any(path.startswith(upload) for upload in ['/api/v1/documents', '/upload']):
            return 'upload'
        
        # API endpoints
        if path.startswith('/api/'):
            return 'api'
        
        return 'default'
    
    def _get_rate_limit_key(self, request: Request) -> str:
        """Generate rate limit key"""
        client_ip = request.client.host if request.client else 'unknown'
        
        # Try to get user from auth header
        auth_header = request.headers.get('authorization', '')
        if auth_header.startswith('Bearer '):
            try:
                import jwt
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, options={"verify_signature": False})
                user_id = payload.get('sub')
                if user_id:
                    return f"user:{user_id}"
            except:
                pass
        
        return f"ip:{client_ip}"
    
    def _is_burst_limited(self, key: str, config: dict) -> bool:
        """Check burst limit (short time window)"""
        current_time = time.time()
        burst_window = 10  # 10 seconds
        
        # Clean old burst requests
        self.burst_requests[key] = [
            req_time for req_time in self.burst_requests[key]
            if current_time - req_time < burst_window
        ]
        
        return len(self.burst_requests[key]) >= config['burst']
    
    def _is_rate_limited(self, key: str, config: dict) -> bool:
        """Check regular rate limit"""
        current_time = time.time()
        
        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if current_time - req_time < config['period']
        ]
        
        return len(self.requests[key]) >= config['calls']
    
    def _record_request(self, key: str, config: dict):
        """Record request timestamps"""
        current_time = time.time()
        self.requests[key].append(current_time)
        self.burst_requests[key].append(current_time)
    
    def _get_rate_limit_info(self, key: str, config: dict) -> tuple:
        """Get remaining requests and reset time"""
        current_time = time.time()
        request_times = self.requests.get(key, [])
        
        valid_requests = [
            req_time for req_time in request_times
            if current_time - req_time < config['period']
        ]
        
        remaining = max(0, config['calls'] - len(valid_requests))
        
        if valid_requests:
            oldest_request = min(valid_requests)
            reset_time = oldest_request + config['period']
        else:
            reset_time = current_time + config['period']
        
        return remaining, reset_time
    
    def _rate_limit_response(self, config: dict) -> Response:
        """Return rate limit response"""
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "message": f"Too many requests. Limit: {config['calls']} per {config['period']} seconds",
                "retry_after": config['period']
            },
            headers={
                "Retry-After": str(config['period']),
                "X-RateLimit-Limit": str(config['calls']),
                "X-RateLimit-Remaining": "0"
            }
        )
    
    def _burst_limit_response(self) -> Response:
        """Return burst limit response"""
        return JSONResponse(
            status_code=429,
            content={
                "error": "Burst limit exceeded",
                "message": "Too many requests in short time. Please slow down",
                "retry_after": 10
            },
            headers={
                "Retry-After": "10",
                "X-RateLimit-Type": "burst"
            }
        )