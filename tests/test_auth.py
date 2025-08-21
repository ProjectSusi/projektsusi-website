"""
Test suite for authentication system with MFA support
"""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timezone

from core.services.auth_service import AuthenticationService, UserRole, LoginResult
from core.repositories.user_repository import SQLiteUserRepository
from core.repositories.models import User


class TestAuthenticationService:
    """Test authentication service functionality"""

    @pytest.fixture
    def user_repo(self):
        """Create test user repository"""
        repo = SQLiteUserRepository(":memory:")  # In-memory database for testing
        return repo

    @pytest.fixture
    def auth_service(self, user_repo):
        """Create authentication service"""
        return AuthenticationService(user_repo)

    @pytest.fixture
    async def test_user(self, user_repo):
        """Create test user"""
        user = User(
            tenant_id=1,
            username="testuser",
            email="test@example.com",
            password_hash="$2b$12$dummy_hash",
            role="user",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            metadata={}
        )
        return await user_repo.create(user)

    async def test_user_registration(self, auth_service):
        """Test user registration"""
        success, message, user = await auth_service.register_user(
            username="newuser",
            email="newuser@example.com", 
            password="testpassword123",
            tenant_id=1,
            role=UserRole.USER
        )
        
        assert success is True
        assert "successfully" in message.lower()
        assert user.username == "newuser"
        assert user.email == "newuser@example.com"
        assert user.role == "user"

    async def test_duplicate_username_registration(self, auth_service, test_user):
        """Test registration with duplicate username"""
        success, message, user = await auth_service.register_user(
            username=test_user.username,
            email="different@example.com",
            password="testpassword123",
            tenant_id=1,
            role=UserRole.USER
        )
        
        assert success is False
        assert "already exists" in message.lower()
        assert user is None

    async def test_duplicate_email_registration(self, auth_service, test_user):
        """Test registration with duplicate email"""
        success, message, user = await auth_service.register_user(
            username="differentuser",
            email=test_user.email,
            password="testpassword123",
            tenant_id=1,
            role=UserRole.USER
        )
        
        assert success is False
        assert "already exists" in message.lower()
        assert user is None

    @patch('core.services.auth_service.verify_password')
    async def test_successful_authentication(self, mock_verify, auth_service, test_user):
        """Test successful user authentication"""
        mock_verify.return_value = True
        
        is_authenticated, user = await auth_service.authenticate_user(
            test_user.username, 
            "correctpassword"
        )
        
        assert is_authenticated is True
        assert user.username == test_user.username

    @patch('core.services.auth_service.verify_password')
    async def test_failed_authentication(self, mock_verify, auth_service, test_user):
        """Test failed user authentication"""
        mock_verify.return_value = False
        
        is_authenticated, user = await auth_service.authenticate_user(
            test_user.username,
            "wrongpassword"
        )
        
        assert is_authenticated is False
        assert user is None

    async def test_authentication_inactive_user(self, auth_service, user_repo, test_user):
        """Test authentication with inactive user"""
        # Deactivate user
        await user_repo.deactivate_user(test_user.id)
        
        is_authenticated, user = await auth_service.authenticate_user(
            test_user.username,
            "anypassword"
        )
        
        assert is_authenticated is False
        assert user is None

    @patch('core.services.auth_service.verify_password')
    async def test_login_without_mfa(self, mock_verify, auth_service, test_user):
        """Test login without MFA enabled"""
        mock_verify.return_value = True
        
        result = await auth_service.login(test_user.username, "correctpassword")
        
        assert result.success is True
        assert result.requires_mfa is False
        assert result.access_token is not None
        assert result.refresh_token is not None
        assert result.mfa_token is None

    @patch('core.services.auth_service.verify_password')
    async def test_login_with_mfa_enabled(self, mock_verify, auth_service, user_repo, test_user):
        """Test login with MFA enabled"""
        mock_verify.return_value = True
        
        # Enable MFA for user
        metadata = test_user.metadata.copy()
        metadata['mfa_enabled'] = True
        await user_repo.update(test_user.id, {'metadata': metadata})
        
        result = await auth_service.login(test_user.username, "correctpassword")
        
        assert result.success is True
        assert result.requires_mfa is True
        assert result.access_token is None
        assert result.refresh_token is None
        assert result.mfa_token is not None

    async def test_token_verification(self, auth_service, test_user):
        """Test JWT token verification"""
        # Create access token
        access_token = auth_service._create_access_token(test_user, mfa_verified=True)
        
        # Verify token
        token_data = auth_service.verify_token(access_token)
        
        assert token_data is not None
        assert token_data.user_id == test_user.id
        assert token_data.username == test_user.username
        assert token_data.role == test_user.role
        assert token_data.mfa_verified is True

    async def test_token_revocation(self, auth_service, test_user):
        """Test token revocation"""
        # Create and revoke token
        access_token = auth_service._create_access_token(test_user)
        
        success = auth_service.revoke_token(access_token)
        assert success is True
        
        # Verify revoked token is invalid
        token_data = auth_service.verify_token(access_token)
        assert token_data is None

    async def test_refresh_token(self, auth_service, test_user):
        """Test refresh token functionality"""
        # Create refresh token
        refresh_token = auth_service._create_refresh_token(test_user)
        
        # Use refresh token to get new access token
        new_access_token = await auth_service.refresh_access_token(refresh_token)
        
        assert new_access_token is not None
        
        # Verify new access token
        token_data = auth_service.verify_token(new_access_token)
        assert token_data is not None
        assert token_data.user_id == test_user.id

    async def test_password_change(self, auth_service, user_repo, test_user):
        """Test password change functionality"""
        with patch('core.services.auth_service.verify_password') as mock_verify, \
             patch('core.services.auth_service.hash_password') as mock_hash:
            
            mock_verify.return_value = True
            mock_hash.return_value = "new_hashed_password"
            
            success, message = await auth_service.change_password(
                test_user.id,
                "oldpassword",
                "newpassword123"
            )
            
            assert success is True
            assert "successfully" in message.lower()
            mock_hash.assert_called_once_with("newpassword123")

    async def test_password_change_wrong_current(self, auth_service, test_user):
        """Test password change with wrong current password"""
        with patch('core.services.auth_service.verify_password') as mock_verify:
            mock_verify.return_value = False
            
            success, message = await auth_service.change_password(
                test_user.id,
                "wrongpassword",
                "newpassword123"
            )
            
            assert success is False
            assert "incorrect" in message.lower()


class TestMFAFunctionality:
    """Test MFA-specific functionality"""

    @pytest.fixture
    def user_repo(self):
        """Create test user repository"""
        return SQLiteUserRepository(":memory:")

    @pytest.fixture
    def auth_service(self, user_repo):
        """Create authentication service"""
        return AuthenticationService(user_repo)

    @pytest.fixture
    async def test_user(self, user_repo):
        """Create test user"""
        user = User(
            tenant_id=1,
            username="mfauser",
            email="mfa@example.com",
            password_hash="$2b$12$dummy_hash",
            role="user",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            metadata={}
        )
        return await user_repo.create(user)

    async def test_mfa_setup(self, auth_service, test_user):
        """Test MFA setup"""
        result = await auth_service.setup_mfa(test_user.id)
        
        assert result is not None
        assert result.secret is not None
        assert len(result.secret) == 32  # Base32 encoded secret
        assert result.qr_code_data_uri.startswith("data:image/png;base64,")
        assert len(result.backup_codes) == 10
        assert all(len(code) == 16 for code in result.backup_codes)  # 8-byte hex codes

    @patch('pyotp.TOTP.verify')
    async def test_mfa_enable(self, mock_verify, auth_service, user_repo, test_user):
        """Test MFA enabling after setup"""
        mock_verify.return_value = True
        
        # Setup MFA first
        await auth_service.setup_mfa(test_user.id)
        
        # Enable MFA with correct code
        success = await auth_service.enable_mfa(test_user.id, "123456")
        assert success is True
        
        # Verify MFA is enabled in user metadata
        updated_user = await user_repo.get_by_id(test_user.id)
        assert updated_user.metadata.get('mfa_enabled') is True

    @patch('pyotp.TOTP.verify')
    async def test_mfa_enable_wrong_code(self, mock_verify, auth_service, test_user):
        """Test MFA enabling with wrong verification code"""
        mock_verify.return_value = False
        
        # Setup MFA first
        await auth_service.setup_mfa(test_user.id)
        
        # Try to enable MFA with wrong code
        success = await auth_service.enable_mfa(test_user.id, "wrong123")
        assert success is False

    @patch('core.services.auth_service.AuthenticationService._verify_mfa_code')
    async def test_mfa_disable(self, mock_verify, auth_service, user_repo, test_user):
        """Test MFA disabling"""
        mock_verify.return_value = True
        
        # Setup and enable MFA first
        await auth_service.setup_mfa(test_user.id)
        metadata = test_user.metadata.copy()
        metadata['mfa_enabled'] = True
        await user_repo.update(test_user.id, {'metadata': metadata})
        
        # Disable MFA
        success = await auth_service.disable_mfa(test_user.id, "123456")
        assert success is True
        
        # Verify MFA is disabled
        updated_user = await user_repo.get_by_id(test_user.id)
        assert updated_user.metadata.get('mfa_enabled') is False

    @patch('pyotp.TOTP.verify')
    async def test_mfa_verification_totp(self, mock_verify, auth_service, user_repo, test_user):
        """Test MFA verification with TOTP code"""
        mock_verify.return_value = True
        
        # Setup MFA
        await auth_service.setup_mfa(test_user.id)
        metadata = test_user.metadata.copy()
        metadata['mfa_enabled'] = True
        metadata['mfa_secret'] = 'TESTSECRET123456'
        await user_repo.update(test_user.id, {'metadata': metadata})
        
        # Get updated user
        updated_user = await user_repo.get_by_id(test_user.id)
        
        # Verify MFA code
        is_valid = await auth_service._verify_mfa_code(updated_user, "123456")
        assert is_valid is True

    async def test_mfa_verification_backup_code(self, auth_service, user_repo, test_user):
        """Test MFA verification with backup code"""
        # Setup MFA with backup codes
        backup_codes = ["backupcode1", "backupcode2", "backupcode3"]
        metadata = test_user.metadata.copy()
        metadata.update({
            'mfa_enabled': True,
            'mfa_secret': 'TESTSECRET123456',
            'mfa_backup_codes': backup_codes
        })
        await user_repo.update(test_user.id, {'metadata': metadata})
        
        # Get updated user
        updated_user = await user_repo.get_by_id(test_user.id)
        
        # Verify backup code
        is_valid = await auth_service._verify_mfa_code(updated_user, "backupcode1")
        assert is_valid is True
        
        # Verify backup code was removed
        final_user = await user_repo.get_by_id(test_user.id)
        remaining_codes = final_user.metadata.get('mfa_backup_codes', [])
        assert "backupcode1" not in remaining_codes
        assert len(remaining_codes) == 2

    @patch('core.services.auth_service.verify_password')
    @patch('core.services.auth_service.AuthenticationService._verify_mfa_code')
    async def test_complete_mfa_login_flow(self, mock_mfa_verify, mock_verify, auth_service, user_repo, test_user):
        """Test complete MFA login flow"""
        mock_verify.return_value = True
        mock_mfa_verify.return_value = True
        
        # Setup MFA
        metadata = test_user.metadata.copy()
        metadata['mfa_enabled'] = True
        await user_repo.update(test_user.id, {'metadata': metadata})
        
        # Step 1: Initial login (should require MFA)
        login_result = await auth_service.login(test_user.username, "password")
        assert login_result.success is True
        assert login_result.requires_mfa is True
        assert login_result.mfa_token is not None
        
        # Step 2: Complete MFA verification
        mfa_result = await auth_service.verify_mfa_and_complete_login(
            login_result.mfa_token,
            "123456"
        )
        assert mfa_result.success is True
        assert mfa_result.access_token is not None
        assert mfa_result.refresh_token is not None


if __name__ == "__main__":
    pytest.main([__file__])