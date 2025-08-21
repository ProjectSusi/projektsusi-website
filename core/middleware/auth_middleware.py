"""
Authentication Middleware
Handles JWT token validation and user context
"""

import logging
from typing import Optional, Callable

from fastapi import Request, HTTPException, status
from fastapi.security.utils import get_authorization_scheme_param
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from ..services.auth_service import AuthenticationService, TokenData
from ..repositories.interfaces import IUserRepository
from ..repositories.models import User
from ..di.services import get_container

logger = logging.getLogger(__name__)


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware for JWT authentication"""
    
    def __init__(self, app, exclude_paths: Optional[list] = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or [
            "/api/v1/auth/login",
            "/api/v1/auth/register", 
            "/api/v1/auth/refresh",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/v1/health",
            "/api/v1/status",
            "/favicon.ico"
        ]
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with authentication"""
        
        # Skip authentication for excluded paths
        if self._should_skip_auth(request.url.path):
            return await call_next(request)
        
        try:
            # Get authentication service
            auth_service = self._get_auth_service()
            
            # Extract token from Authorization header
            token = self._extract_token(request)
            
            if not token:
                return self._unauthorized_response("Missing authentication token")
            
            # Verify token
            token_data = auth_service.verify_token(token)
            if not token_data:
                return self._unauthorized_response("Invalid or expired token")
            
            # Get user
            user = await auth_service.get_user_by_token(token)
            if not user or not user.is_active:
                return self._unauthorized_response("User not found or inactive")
            
            # Add user context to request
            request.state.current_user = user
            request.state.token_data = token_data
            
        except Exception as e:
            logger.error(f"Authentication middleware error: {e}")
            return self._unauthorized_response("Authentication failed")
        
        # Continue with request
        return await call_next(request)
    
    def _should_skip_auth(self, path: str) -> bool:
        """Check if path should skip authentication"""
        return any(path.startswith(excluded) for excluded in self.exclude_paths)
    
    def _extract_token(self, request: Request) -> Optional[str]:
        """Extract JWT token from Authorization header"""
        authorization = request.headers.get("Authorization")
        if not authorization:
            return None
        
        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() != "bearer":
            return None
        
        return token
    
    def _get_auth_service(self) -> AuthenticationService:
        """Get authentication service from DI container"""
        container = get_container()
        user_repo = container.get(IUserRepository)
        return AuthenticationService(user_repo)
    
    def _unauthorized_response(self, detail: str) -> Response:
        """Return 401 Unauthorized response"""
        from fastapi.responses import JSONResponse
        
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": detail},
            headers={"WWW-Authenticate": "Bearer"}
        )


class MFARequiredMiddleware(BaseHTTPMiddleware):
    """Middleware to enforce MFA for sensitive operations"""
    
    def __init__(self, app, mfa_required_paths: Optional[list] = None):
        super().__init__(app)
        self.mfa_required_paths = mfa_required_paths or [
            "/api/v1/admin",
            "/api/v1/users",
            "/api/v1/auth/password/change"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check MFA requirement for sensitive paths"""
        
        # Skip MFA check for non-sensitive paths
        if not self._requires_mfa(request.url.path):
            return await call_next(request)
        
        # Get token data from request state (set by AuthenticationMiddleware)
        token_data = getattr(request.state, 'token_data', None)
        
        if not token_data or not token_data.mfa_verified:
            from fastapi.responses import JSONResponse
            
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "detail": "MFA verification required for this operation",
                    "error_code": "MFA_REQUIRED"
                }
            )
        
        return await call_next(request)
    
    def _requires_mfa(self, path: str) -> bool:
        """Check if path requires MFA"""
        return any(path.startswith(mfa_path) for mfa_path in self.mfa_required_paths)


# Helper functions for dependency injection

def get_current_user_from_request(request: Request) -> Optional[User]:
    """Get current user from request state"""
    return getattr(request.state, 'current_user', None)


def get_token_data_from_request(request: Request) -> Optional[TokenData]:
    """Get token data from request state"""
    return getattr(request.state, 'token_data', None)


def require_authentication(request: Request) -> User:
    """Require authentication and return user"""
    user = get_current_user_from_request(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return user


def require_mfa_verification(request: Request) -> TokenData:
    """Require MFA verification and return token data"""
    token_data = get_token_data_from_request(request)
    if not token_data or not token_data.mfa_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="MFA verification required"
        )
    return token_data


def require_admin_role(request: Request) -> User:
    """Require admin role and return user"""
    user = require_authentication(request)
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return user