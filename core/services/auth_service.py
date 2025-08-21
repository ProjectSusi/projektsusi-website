"""
Authentication Service with MFA Support
Handles user authentication, JWT tokens, and multi-factor authentication
"""

import os
import jwt
import secrets
import logging
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

import pyotp
import qrcode
from io import BytesIO

from ..repositories.interfaces import IUserRepository
from ..repositories.models import User
from ..utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)


class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"


@dataclass
class TokenData:
    """JWT token payload data"""
    user_id: int
    username: str
    role: str
    tenant_id: int
    exp: int
    iat: int
    jti: str  # JWT ID for token revocation
    mfa_verified: bool = False


@dataclass
class LoginResult:
    """Result of login attempt"""
    success: bool
    message: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    requires_mfa: bool = False
    mfa_token: Optional[str] = None  # Temporary token for MFA verification


@dataclass
class MFASetupResult:
    """Result of MFA setup"""
    secret: str
    qr_code_data_uri: str
    backup_codes: List[str]


class AuthenticationService:
    """Central authentication service with MFA support"""

    def __init__(self, user_repository: IUserRepository):
        self.user_repo = user_repository
        self.secret_key = os.getenv('JWT_SECRET_KEY', self._generate_secret_key())
        self.algorithm = "HS256"
        self.access_token_expire_minutes = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
        self.refresh_token_expire_days = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRE_DAYS', '7'))
        self.mfa_token_expire_minutes = int(os.getenv('MFA_TOKEN_EXPIRE_MINUTES', '5'))
        
        # In-memory storage for revoked tokens (in production, use Redis)
        self.revoked_tokens = set()
        
        logger.info("Authentication service initialized")

    def _generate_secret_key(self) -> str:
        """Generate a secure random secret key"""
        return secrets.token_urlsafe(32)

    async def register_user(
        self, 
        username: str, 
        email: str, 
        password: str, 
        tenant_id: int = 1,
        role: UserRole = UserRole.USER
    ) -> Tuple[bool, str, Optional[User]]:
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = await self.user_repo.get_by_username(username)
            if existing_user:
                return False, "Username already exists", None
            
            existing_email = await self.user_repo.get_by_email(email)
            if existing_email:
                return False, "Email already exists", None
            
            # Create new user
            password_hash, salt = hash_password(password)
            user = User(
                tenant_id=tenant_id,
                username=username,
                email=email,
                password_hash=password_hash,
                role=role.value,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                metadata={'password_salt': base64.b64encode(salt).decode()}
            )
            
            created_user = await self.user_repo.create(user)
            logger.info(f"User registered successfully: {username}")
            return True, "User registered successfully", created_user
            
        except Exception as e:
            logger.error(f"User registration failed: {e}")
            return False, f"Registration failed: {str(e)}", None

    async def authenticate_user(
        self, 
        username: str, 
        password: str
    ) -> Tuple[bool, Optional[User]]:
        """Authenticate user credentials"""
        try:
            user = await self.user_repo.get_by_username(username)
            if not user or not user.is_active:
                return False, None
            
            # Get salt from metadata
            salt_b64 = user.metadata.get('password_salt')
            if not salt_b64:
                logger.error(f"No password salt found for user {username}")
                return False, None
            
            salt = base64.b64decode(salt_b64.encode())
            
            if verify_password(password, user.password_hash, salt):
                # Update last login
                await self.user_repo.update_last_login(user.id, datetime.now(timezone.utc))
                return True, user
            
            return False, None
            
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return False, None

    async def login(self, username: str, password: str) -> LoginResult:
        """Login user with optional MFA"""
        try:
            # Authenticate user credentials
            is_authenticated, user = await self.authenticate_user(username, password)
            if not is_authenticated or not user:
                return LoginResult(
                    success=False,
                    message="Invalid username or password"
                )
            
            # Check if user has MFA enabled
            user_mfa_enabled = user.metadata.get('mfa_enabled', False)
            
            if user_mfa_enabled:
                # Generate temporary MFA token
                mfa_token = self._create_mfa_token(user)
                return LoginResult(
                    success=True,
                    message="MFA verification required",
                    requires_mfa=True,
                    mfa_token=mfa_token
                )
            else:
                # No MFA required, generate access tokens
                access_token = self._create_access_token(user, mfa_verified=True)
                refresh_token = self._create_refresh_token(user)
                
                return LoginResult(
                    success=True,
                    message="Login successful",
                    access_token=access_token,
                    refresh_token=refresh_token
                )
                
        except Exception as e:
            logger.error(f"Login failed: {e}")
            return LoginResult(
                success=False,
                message="Login failed due to server error"
            )

    async def verify_mfa_and_complete_login(
        self, 
        mfa_token: str, 
        mfa_code: str
    ) -> LoginResult:
        """Verify MFA code and complete login"""
        try:
            # Verify MFA token
            mfa_data = self._verify_mfa_token(mfa_token)
            if not mfa_data:
                return LoginResult(
                    success=False,
                    message="Invalid or expired MFA token"
                )
            
            # Get user
            user = await self.user_repo.get_by_id(mfa_data['user_id'])
            if not user:
                return LoginResult(
                    success=False,
                    message="User not found"
                )
            
            # Verify MFA code
            is_valid = await self._verify_mfa_code(user, mfa_code)
            if not is_valid:
                return LoginResult(
                    success=False,
                    message="Invalid MFA code"
                )
            
            # Generate access tokens
            access_token = self._create_access_token(user, mfa_verified=True)
            refresh_token = self._create_refresh_token(user)
            
            return LoginResult(
                success=True,
                message="Login successful",
                access_token=access_token,
                refresh_token=refresh_token
            )
            
        except Exception as e:
            logger.error(f"MFA verification failed: {e}")
            return LoginResult(
                success=False,
                message="MFA verification failed"
            )

    def _create_access_token(self, user: User, mfa_verified: bool = False) -> str:
        """Create JWT access token"""
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=self.access_token_expire_minutes)
        
        payload = {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "tenant_id": user.tenant_id,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "jti": secrets.token_urlsafe(16),
            "type": "access",
            "mfa_verified": mfa_verified
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def _create_refresh_token(self, user: User) -> str:
        """Create JWT refresh token"""
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=self.refresh_token_expire_days)
        
        payload = {
            "user_id": user.id,
            "username": user.username,
            "tenant_id": user.tenant_id,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "jti": secrets.token_urlsafe(16),
            "type": "refresh"
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def _create_mfa_token(self, user: User) -> str:
        """Create temporary MFA verification token"""
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=self.mfa_token_expire_minutes)
        
        payload = {
            "user_id": user.id,
            "username": user.username,
            "tenant_id": user.tenant_id,
            "iat": int(now.timestamp()),
            "exp": int(expire.timestamp()),
            "jti": secrets.token_urlsafe(16),
            "type": "mfa"
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify JWT token"""
        try:
            # Check if token is revoked
            if token in self.revoked_tokens:
                return None
            
            # Decode token
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get("type") != "access":
                return None
            
            return TokenData(
                user_id=payload["user_id"],
                username=payload["username"],
                role=payload["role"],
                tenant_id=payload["tenant_id"],
                exp=payload["exp"],
                iat=payload["iat"],
                jti=payload["jti"],
                mfa_verified=payload.get("mfa_verified", False)
            )
            
        except jwt.ExpiredSignatureError:
            logger.debug("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.debug(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None

    def _verify_mfa_token(self, token: str) -> Optional[Dict]:
        """Verify MFA token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get("type") != "mfa":
                return None
                
            return payload
                
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def revoke_token(self, token: str) -> bool:
        """Revoke a JWT token"""
        try:
            # In production, store in Redis with expiration
            self.revoked_tokens.add(token)
            return True
        except Exception as e:
            logger.error(f"Token revocation failed: {e}")
            return False

    async def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Refresh access token using refresh token"""
        try:
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.algorithm])
            
            if payload.get("type") != "refresh":
                return None
            
            # Get user
            user = await self.user_repo.get_by_id(payload["user_id"])
            if not user or not user.is_active:
                return None
            
            # Create new access token
            return self._create_access_token(user, mfa_verified=True)
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    # MFA Methods

    async def setup_mfa(self, user_id: int) -> Optional[MFASetupResult]:
        """Setup MFA for a user"""
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                return None
            
            # Generate secret
            secret = pyotp.random_base32()
            
            # Generate QR code
            totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
                name=user.email,
                issuer_name="ProjectSusi RAG System"
            )
            
            # Create QR code image
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to data URI
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            
            qr_code_data = base64.b64encode(buffer.getvalue()).decode()
            qr_code_data_uri = f"data:image/png;base64,{qr_code_data}"
            
            # Generate backup codes
            backup_codes = [secrets.token_hex(8) for _ in range(10)]
            
            # Store MFA data (not enabled yet)
            metadata = user.metadata.copy()
            metadata.update({
                'mfa_secret': secret,
                'mfa_backup_codes': backup_codes,
                'mfa_enabled': False  # Will be enabled after verification
            })
            
            await self.user_repo.update(user_id, {'metadata': metadata})
            
            return MFASetupResult(
                secret=secret,
                qr_code_data_uri=qr_code_data_uri,
                backup_codes=backup_codes
            )
            
        except Exception as e:
            logger.error(f"MFA setup failed: {e}")
            return None

    async def enable_mfa(self, user_id: int, verification_code: str) -> bool:
        """Enable MFA after verifying setup"""
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                return False
            
            secret = user.metadata.get('mfa_secret')
            if not secret:
                return False
            
            # Verify the code
            totp = pyotp.TOTP(secret)
            if not totp.verify(verification_code):
                return False
            
            # Enable MFA
            metadata = user.metadata.copy()
            metadata['mfa_enabled'] = True
            
            await self.user_repo.update(user_id, {'metadata': metadata})
            logger.info(f"MFA enabled for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"MFA enable failed: {e}")
            return False

    async def disable_mfa(self, user_id: int, verification_code: str) -> bool:
        """Disable MFA for a user"""
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                return False
            
            # Verify current MFA code or backup code
            is_valid = await self._verify_mfa_code(user, verification_code)
            if not is_valid:
                return False
            
            # Disable MFA and clear secrets
            metadata = user.metadata.copy()
            metadata.update({
                'mfa_enabled': False,
                'mfa_secret': None,
                'mfa_backup_codes': []
            })
            
            await self.user_repo.update(user_id, {'metadata': metadata})
            logger.info(f"MFA disabled for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"MFA disable failed: {e}")
            return False

    async def _verify_mfa_code(self, user: User, code: str) -> bool:
        """Verify MFA code (TOTP or backup code)"""
        try:
            secret = user.metadata.get('mfa_secret')
            backup_codes = user.metadata.get('mfa_backup_codes', [])
            
            if not secret:
                return False
            
            # Try TOTP verification
            totp = pyotp.TOTP(secret)
            if totp.verify(code):
                return True
            
            # Try backup code verification
            if code in backup_codes:
                # Remove used backup code
                backup_codes.remove(code)
                metadata = user.metadata.copy()
                metadata['mfa_backup_codes'] = backup_codes
                await self.user_repo.update(user.id, {'metadata': metadata})
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"MFA verification failed: {e}")
            return False

    async def get_user_by_token(self, token: str) -> Optional[User]:
        """Get user from valid token"""
        token_data = self.verify_token(token)
        if not token_data:
            return None
        
        return await self.user_repo.get_by_id(token_data.user_id)

    async def change_password(
        self, 
        user_id: int, 
        current_password: str, 
        new_password: str
    ) -> Tuple[bool, str]:
        """Change user password"""
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                return False, "User not found"
            
            # Verify current password
            if not verify_password(current_password, user.password_hash):
                return False, "Current password is incorrect"
            
            # Hash new password
            new_password_hash = hash_password(new_password)
            
            # Update password
            await self.user_repo.update(user_id, {'password_hash': new_password_hash})
            
            logger.info(f"Password changed for user {user_id}")
            return True, "Password changed successfully"
            
        except Exception as e:
            logger.error(f"Password change failed: {e}")
            return False, "Password change failed"