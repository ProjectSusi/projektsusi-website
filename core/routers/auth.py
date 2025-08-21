"""
Authentication API Routes
Handles user authentication, registration, and MFA operations
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from ..services.auth_service import AuthenticationService, UserRole, LoginResult, MFASetupResult
from ..repositories.interfaces import IUserRepository  
from ..repositories.models import User
from ..di.services import get_container
from ..middleware import TenantContext

logger = logging.getLogger(__name__)

# Pydantic models for API requests/responses
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"

class LoginRequest(BaseModel):
    username: str
    password: str

class MFAVerifyRequest(BaseModel):
    mfa_token: str
    mfa_code: str

class MFASetupResponse(BaseModel):
    secret: str
    qr_code_data_uri: str
    backup_codes: list[str]

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    mfa_enabled: bool
    tenant_id: int

class MessageResponse(BaseModel):
    message: str
    success: bool = True

# Security
security = HTTPBearer()

# Router
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


def get_auth_service() -> AuthenticationService:
    """Get authentication service from DI container"""
    try:
        from ..di.services import get_auth_service as get_di_auth_service
        service = get_di_auth_service()
        if service:
            return service
    except:
        pass
    
    # Fallback: create service directly
    container = get_container()
    user_repo = container.get(IUserRepository)
    return AuthenticationService(user_repo)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthenticationService = Depends(get_auth_service)
) -> User:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        user = await auth_service.get_user_by_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Authentication Routes

@router.post("/register", response_model=MessageResponse)
async def register_user(
    request: RegisterRequest,
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Register a new user"""
    try:
        # Get tenant context
        tenant_id = TenantContext.get_current_tenant_id()
        
        # Validate role
        try:
            role = UserRole(request.role)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role"
            )
        
        # Register user
        success, message, user = await auth_service.register_user(
            username=request.username,
            email=request.email,
            password=request.password,
            tenant_id=tenant_id,
            role=role
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return MessageResponse(message=message, success=True)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login")
async def login_user(
    request: LoginRequest,
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Login user with optional MFA"""
    try:
        result = await auth_service.login(request.username, request.password)
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.message
            )
        
        if result.requires_mfa:
            return {
                "message": result.message,
                "requires_mfa": True,
                "mfa_token": result.mfa_token
            }
        else:
            return TokenResponse(
                access_token=result.access_token,
                refresh_token=result.refresh_token
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/mfa/verify", response_model=TokenResponse)
async def verify_mfa(
    request: MFAVerifyRequest,
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Verify MFA code and complete login"""
    try:
        result = await auth_service.verify_mfa_and_complete_login(
            request.mfa_token, 
            request.mfa_code
        )
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.message
            )
        
        return TokenResponse(
            access_token=result.access_token,
            refresh_token=result.refresh_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MFA verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MFA verification failed"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Refresh access token"""
    try:
        new_access_token = await auth_service.refresh_access_token(refresh_token)
        
        if not new_access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_token  # Reuse existing refresh token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Logout user and revoke token"""
    try:
        token = credentials.credentials
        success = auth_service.revoke_token(token)
        
        if success:
            return MessageResponse(message="Logged out successfully")
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


# User Profile Routes

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        mfa_enabled=current_user.metadata.get('mfa_enabled', False),
        tenant_id=current_user.tenant_id
    )


@router.post("/password/change", response_model=MessageResponse)
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Change user password"""
    try:
        success, message = await auth_service.change_password(
            current_user.id,
            request.current_password,
            request.new_password
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return MessageResponse(message=message)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )


# MFA Routes

@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(
    current_user: User = Depends(get_current_user),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Setup MFA for current user"""
    try:
        result = await auth_service.setup_mfa(current_user.id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="MFA setup failed"
            )
        
        return MFASetupResponse(
            secret=result.secret,
            qr_code_data_uri=result.qr_code_data_uri,
            backup_codes=result.backup_codes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MFA setup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MFA setup failed"
        )


@router.post("/mfa/enable", response_model=MessageResponse)
async def enable_mfa(
    verification_code: str,
    current_user: User = Depends(get_current_user),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Enable MFA after verification"""
    try:
        success = await auth_service.enable_mfa(current_user.id, verification_code)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        return MessageResponse(message="MFA enabled successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MFA enable failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MFA enable failed"
        )


@router.post("/mfa/disable", response_model=MessageResponse)
async def disable_mfa(
    verification_code: str,
    current_user: User = Depends(get_current_user),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Disable MFA for current user"""
    try:
        success = await auth_service.disable_mfa(current_user.id, verification_code)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        return MessageResponse(message="MFA disabled successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MFA disable failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MFA disable failed"
        )


# Admin Routes

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: User = Depends(require_admin),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """List all users (admin only)"""
    try:
        # Get user repository
        container = get_container()
        user_repo = container.get(IUserRepository)
        
        # Get all active users
        users = await user_repo.get_active_users()
        
        return [
            UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                role=user.role,
                is_active=user.is_active,
                mfa_enabled=user.metadata.get('mfa_enabled', False),
                tenant_id=user.tenant_id
            )
            for user in users
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"List users failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )


@router.post("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    auth_service: AuthenticationService = Depends(get_auth_service)
):
    """Deactivate a user (admin only)"""
    try:
        # Get user repository
        container = get_container()
        user_repo = container.get(IUserRepository)
        
        # Deactivate user
        await user_repo.deactivate_user(user_id)
        
        return MessageResponse(message="User deactivated successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User deactivation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User deactivation failed"
        )