"""
Error Handling Middleware
Prevents information disclosure while maintaining debugging capabilities
"""

import logging
import traceback
import uuid
from typing import Any, Dict, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
import os

logger = logging.getLogger(__name__)


class SecurityErrorHandler(BaseHTTPMiddleware):
    """Secure error handler that prevents information disclosure"""
    
    def __init__(self, app, debug: bool = False):
        super().__init__(app)
        self.debug = debug or os.getenv('DEBUG', 'false').lower() == 'true'
        
        # Generic error messages by status code
        self.generic_messages = {
            400: "Bad request - please check your input",
            401: "Authentication required",
            403: "Access denied",
            404: "Resource not found",
            405: "Method not allowed",
            429: "Too many requests - please slow down",
            500: "Internal server error - please try again later",
            502: "Service temporarily unavailable",
            503: "Service temporarily unavailable"
        }
        
        logger.info(f"Error handler initialized (debug: {self.debug})")
    
    async def dispatch(self, request: Request, call_next):
        """Handle requests with secure error processing"""
        
        try:
            response = await call_next(request)
            return response
            
        except Exception as e:
            # Generate unique error ID for tracking
            error_id = str(uuid.uuid4())[:8]
            
            # Log detailed error for debugging
            self._log_error(error_id, request, e)
            
            # Return sanitized error response
            return self._create_error_response(error_id, e, request)
    
    def _log_error(self, error_id: str, request: Request, exception: Exception):
        """Log detailed error information for debugging"""
        
        # Collect request context (sanitized)
        request_info = {
            'error_id': error_id,
            'method': request.method,
            'url': str(request.url),
            'user_agent': request.headers.get('user-agent', 'unknown')[:200],
            'ip': self._get_client_ip(request),
        }
        
        # Add user info if available (without sensitive data)
        auth_header = request.headers.get('authorization', '')
        if auth_header.startswith('Bearer '):
            try:
                import jwt
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, options={"verify_signature": False})
                request_info['user_id'] = payload.get('sub', 'unknown')
            except:
                request_info['user_id'] = 'invalid_token'
        
        # Log error with full context
        logger.error(
            f"[{error_id}] {exception.__class__.__name__}: {str(exception)}",
            extra={
                'error_id': error_id,
                'request_info': request_info,
                'exception_type': exception.__class__.__name__,
                'exception_msg': str(exception)
            },
            exc_info=True if self.debug else False
        )
        
        # In debug mode, also log stack trace
        if self.debug:
            logger.debug(f"[{error_id}] Stack trace:\n{traceback.format_exc()}")
    
    def _create_error_response(
        self, 
        error_id: str, 
        exception: Exception, 
        request: Request
    ) -> Response:
        """Create sanitized error response"""
        
        # Determine status code
        status_code = getattr(exception, 'status_code', 500)
        if not isinstance(status_code, int) or status_code < 400:
            status_code = 500
        
        # Create response content
        response_data = {
            "error": True,
            "error_id": error_id,
            "message": self._get_safe_error_message(exception, status_code),
            "status_code": status_code
        }
        
        # In debug mode, add more details
        if self.debug:
            response_data["debug"] = {
                "exception_type": exception.__class__.__name__,
                "exception_message": str(exception)[:500],  # Limit length
            }
        
        # Add helpful hints for common errors
        if status_code == 401:
            response_data["hint"] = "Please provide valid authentication credentials"
        elif status_code == 403:
            response_data["hint"] = "You don't have permission to access this resource"
        elif status_code == 429:
            response_data["hint"] = "Please wait before making more requests"
        elif status_code == 500:
            response_data["hint"] = f"If this persists, please contact support with error ID: {error_id}"
        
        return JSONResponse(
            status_code=status_code,
            content=response_data,
            headers={
                "X-Error-ID": error_id,
                "Cache-Control": "no-cache, no-store, must-revalidate"
            }
        )
    
    def _get_safe_error_message(self, exception: Exception, status_code: int) -> str:
        """Get safe error message that doesn't leak information"""
        
        # Use generic message for status code
        generic_message = self.generic_messages.get(status_code, "An error occurred")
        
        # For certain exception types, we can provide specific messages
        safe_exceptions = {
            'ValidationError': 'Invalid input data',
            'PermissionError': 'Access denied',
            'FileNotFoundError': 'Resource not found',
            'ValueError': 'Invalid value provided',
            'KeyError': 'Required field missing',
            'TimeoutError': 'Request timeout',
        }
        
        exception_name = exception.__class__.__name__
        if exception_name in safe_exceptions:
            return safe_exceptions[exception_name]
        
        # For HTTP exceptions with safe messages
        if hasattr(exception, 'detail') and isinstance(exception.detail, str):
            detail = exception.detail
            # Check if detail looks safe (no file paths, secrets, etc.)
            if self._is_safe_message(detail):
                return detail
        
        # Default to generic message
        return generic_message
    
    def _is_safe_message(self, message: str) -> bool:
        """Check if error message is safe to expose"""
        
        # Convert to lowercase for checking
        msg_lower = message.lower()
        
        # Block messages containing sensitive patterns
        unsafe_patterns = [
            'password', 'secret', 'key', 'token', 'connection string',
            'database', 'config', 'environment', 'stacktrace', 'traceback',
            'file not found', 'no such file', 'permission denied',
            'access denied', 'sql', 'query', 'table', 'column'
        ]
        
        for pattern in unsafe_patterns:
            if pattern in msg_lower:
                return False
        
        # Block file paths
        if '/' in message or '\\' in message:
            return False
        
        # Block long messages (likely to contain sensitive info)
        if len(message) > 200:
            return False
        
        return True
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP for logging"""
        # Check forwarded headers
        forwarded_for = request.headers.get('x-forwarded-for')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get('x-real-ip')
        if real_ip:
            return real_ip
        
        if hasattr(request.client, 'host'):
            return request.client.host
        
        return 'unknown'


class ValidationErrorHandler:
    """Handler for validation errors with safe messages"""
    
    @staticmethod
    def format_validation_error(error) -> Dict[str, Any]:
        """Format validation error safely"""
        
        # Extract safe field names and messages
        safe_errors = []
        
        if hasattr(error, 'errors'):
            for err in error.errors():
                field = '.'.join(str(loc) for loc in err.get('loc', []))
                msg = err.get('msg', 'Invalid value')
                
                # Sanitize field name and message
                safe_field = ValidationErrorHandler._sanitize_field_name(field)
                safe_msg = ValidationErrorHandler._sanitize_error_message(msg)
                
                safe_errors.append({
                    'field': safe_field,
                    'message': safe_msg
                })
        
        return {
            'error': 'Validation failed',
            'details': safe_errors[:10]  # Limit number of errors
        }
    
    @staticmethod
    def _sanitize_field_name(field: str) -> str:
        """Sanitize field name to prevent information disclosure"""
        import re
        
        # Only allow alphanumeric and common field characters
        sanitized = re.sub(r'[^a-zA-Z0-9._-]', '', field)
        
        # Limit length
        if len(sanitized) > 50:
            sanitized = sanitized[:50]
        
        return sanitized or 'field'
    
    @staticmethod
    def _sanitize_error_message(message: str) -> str:
        """Sanitize error message"""
        
        # Map of specific validation errors to safe messages
        safe_messages = {
            'field required': 'This field is required',
            'ensure this value': 'Invalid value',
            'string too short': 'Value too short',
            'string too long': 'Value too long',
            'invalid email': 'Invalid email format',
            'invalid url': 'Invalid URL format',
            'value is not a valid': 'Invalid format',
        }
        
        message_lower = message.lower()
        for pattern, safe_msg in safe_messages.items():
            if pattern in message_lower:
                return safe_msg
        
        # Default safe message
        return 'Invalid value'


# Custom exception for rate limiting
class RateLimitExceeded(Exception):
    """Exception for rate limiting"""
    def __init__(self, message: str = "Rate limit exceeded"):
        self.message = message
        self.status_code = 429
        super().__init__(self.message)


# Custom exception for authentication
class AuthenticationError(Exception):
    """Exception for authentication errors"""
    def __init__(self, message: str = "Authentication failed"):
        self.message = message
        self.status_code = 401
        super().__init__(self.message)


# Custom exception for authorization
class AuthorizationError(Exception):
    """Exception for authorization errors"""
    def __init__(self, message: str = "Access denied"):
        self.message = message
        self.status_code = 403
        super().__init__(self.message)