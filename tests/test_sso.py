"""
Test suite for SSO authentication system
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone

from core.services.sso_service import SSOService, SAMLHandler, OIDCHandler, SSOUserInfo
from core.services.auth_service import AuthenticationService, UserRole
from core.repositories.user_repository import SQLiteUserRepository
from core.repositories.models import User


class TestSAMLHandler:
    """Test SAML authentication handler"""

    def test_generate_auth_request(self):
        """Test SAML authentication request generation"""
        config = {
            'entity_id': 'test-entity',
            'acs_url': '/test/acs',
            'sso_url': 'https://idp.example.com/sso',
        }
        
        handler = SAMLHandler(config)
        auth_url, request_id = handler.generate_auth_request('test-state')
        
        assert 'https://idp.example.com/sso' in auth_url
        assert 'SAMLRequest=' in auth_url
        assert 'RelayState=test-state' in auth_url
        assert request_id.startswith('_')

    def test_process_response(self):
        """Test SAML response processing"""
        config = {
            'entity_id': 'test-entity', 
            'acs_url': '/test/acs',
            'sso_url': 'https://idp.example.com/sso',
        }
        
        # Mock SAML response (base64 encoded XML)
        saml_xml = """<?xml version="1.0"?>
<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
    <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
        <saml:Subject>
            <saml:NameID>test@example.com</saml:NameID>
        </saml:Subject>
        <saml:AttributeStatement>
            <saml:Attribute Name="firstName">
                <saml:AttributeValue>John</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="lastName">
                <saml:AttributeValue>Doe</saml:AttributeValue>
            </saml:Attribute>
        </saml:AttributeStatement>
    </saml:Assertion>
</samlp:Response>"""
        
        import base64
        saml_response = base64.b64encode(saml_xml.encode()).decode()
        
        handler = SAMLHandler(config)
        user_info = handler.process_response(saml_response)
        
        assert user_info.provider == 'saml'
        assert user_info.external_id == 'test@example.com'
        assert user_info.username == 'test@example.com'
        assert user_info.email == 'test@example.com'
        assert user_info.first_name == 'John'
        assert user_info.last_name == 'Doe'


class TestOIDCHandler:
    """Test OIDC authentication handler"""

    def test_generate_auth_request(self):
        """Test OIDC authorization request generation"""
        config = {
            'client_id': 'test-client',
            'client_secret': 'test-secret',
            'authorization_endpoint': 'https://provider.com/auth',
            'token_endpoint': 'https://provider.com/token',
            'userinfo_endpoint': 'https://provider.com/userinfo',
            'redirect_uri': '/callback',
        }
        
        handler = OIDCHandler(config)
        auth_url, state = handler.generate_auth_request('test-state')
        
        assert 'https://provider.com/auth' in auth_url
        assert 'client_id=test-client' in auth_url
        assert 'response_type=code' in auth_url
        assert 'state=test-state' in auth_url
        assert state == 'test-state'

    @patch('requests.post')
    def test_exchange_code_for_token(self, mock_post):
        """Test authorization code exchange"""
        config = {
            'client_id': 'test-client',
            'client_secret': 'test-secret',
            'authorization_endpoint': 'https://provider.com/auth',
            'token_endpoint': 'https://provider.com/token',
            'userinfo_endpoint': 'https://provider.com/userinfo',
            'redirect_uri': '/callback',
        }
        
        # Mock token response
        mock_response = Mock()
        mock_response.json.return_value = {
            'access_token': 'test-access-token',
            'id_token': 'test-id-token',
            'token_type': 'Bearer'
        }
        mock_response.raise_for_status = Mock()
        mock_post.return_value = mock_response
        
        handler = OIDCHandler(config)
        tokens = handler.exchange_code_for_token('test-code', 'test-state')
        
        assert tokens['access_token'] == 'test-access-token'
        assert tokens['id_token'] == 'test-id-token'

    @patch('requests.get')
    def test_get_user_info(self, mock_get):
        """Test user info retrieval"""
        config = {
            'client_id': 'test-client',
            'client_secret': 'test-secret',
            'authorization_endpoint': 'https://provider.com/auth',
            'token_endpoint': 'https://provider.com/token',
            'userinfo_endpoint': 'https://provider.com/userinfo',
            'redirect_uri': '/callback',
        }
        
        # Mock userinfo response
        mock_response = Mock()
        mock_response.json.return_value = {
            'sub': '12345',
            'preferred_username': 'johndoe',
            'email': 'john@example.com',
            'given_name': 'John',
            'family_name': 'Doe',
            'groups': ['users', 'developers']
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        handler = OIDCHandler(config)
        user_info = handler.get_user_info('test-access-token')
        
        assert user_info.provider == 'oidc'
        assert user_info.external_id == '12345'
        assert user_info.username == 'johndoe'
        assert user_info.email == 'john@example.com'
        assert user_info.first_name == 'John'
        assert user_info.last_name == 'Doe'
        assert user_info.groups == ['users', 'developers']


class TestSSOService:
    """Test SSO service functionality"""

    @pytest.fixture
    def user_repo(self):
        """Create test user repository"""
        return SQLiteUserRepository(':memory:')

    @pytest.fixture
    def auth_service(self, user_repo):
        """Create authentication service"""
        return AuthenticationService(user_repo)

    @pytest.fixture
    def sso_service(self, user_repo, auth_service):
        """Create SSO service"""
        with patch.dict('os.environ', {
            'SAML_SSO_URL': 'https://idp.example.com/sso',
            'OIDC_CLIENT_ID': 'test-client',
            'OIDC_CLIENT_SECRET': 'test-secret',
            'OIDC_DISCOVERY_URL': 'https://provider.com/.well-known/openid_configuration'
        }):
            return SSOService(user_repo, auth_service)

    def test_get_available_providers(self, sso_service):
        """Test getting available SSO providers"""
        providers = sso_service.get_available_providers()
        
        # Should have SAML and OIDC providers based on environment
        provider_types = [p.type for p in providers]
        assert 'saml' in provider_types
        assert 'oidc' in provider_types

    def test_initiate_sso_login(self, sso_service):
        """Test SSO login initiation"""
        # Test SAML login
        auth_url = sso_service.initiate_sso_login('saml', tenant_id=1)
        assert 'https://idp.example.com/sso' in auth_url
        assert 'SAMLRequest=' in auth_url

    async def test_find_or_create_sso_user_new(self, sso_service):
        """Test creating new user from SSO info"""
        user_info = SSOUserInfo(
            provider='oidc',
            external_id='12345',
            username='johndoe',
            email='john@example.com',
            first_name='John',
            last_name='Doe',
            groups=['users']
        )
        
        with patch.object(sso_service.auth_service, 'hash_password') as mock_hash:
            mock_hash.return_value = ('hashed_password', b'salt')
            
            user = await sso_service._find_or_create_sso_user(user_info, 1, 'oidc')
            
            assert user is not None
            assert user.username == 'johndoe'
            assert user.email == 'john@example.com'
            assert user.metadata['sso_oidc_id'] == '12345'
            assert user.metadata['sso_provider'] == 'oidc'
            assert user.metadata['sso_user'] is True

    async def test_find_or_create_sso_user_existing(self, sso_service, user_repo):
        """Test finding existing user by email"""
        # Create existing user
        existing_user = User(
            tenant_id=1,
            username='existing',
            email='john@example.com',
            password_hash='hash',
            role='user',
            is_active=True,
            created_at=datetime.now(timezone.utc),
            metadata={'password_salt': 'salt'}
        )
        await user_repo.create(existing_user)
        
        user_info = SSOUserInfo(
            provider='oidc',
            external_id='12345',
            username='johndoe',
            email='john@example.com',
            first_name='John',
            last_name='Doe'
        )
        
        user = await sso_service._find_or_create_sso_user(user_info, 1, 'oidc')
        
        assert user is not None
        assert user.username == 'existing'  # Keeps existing username
        assert user.email == 'john@example.com'
        assert user.metadata['sso_oidc_id'] == '12345'

    async def test_process_sso_callback_success(self, sso_service):
        """Test successful SSO callback processing"""
        callback_data = {
            'code': 'test-auth-code',
            'state': '1:test-state'
        }
        
        # Mock OIDC handler methods
        with patch.object(sso_service.handlers['oidc'], 'exchange_code_for_token') as mock_exchange, \
             patch.object(sso_service.handlers['oidc'], 'get_user_info') as mock_userinfo, \
             patch.object(sso_service, '_find_or_create_sso_user') as mock_create:
            
            mock_exchange.return_value = {
                'access_token': 'test-token',
                'id_token': 'test-id-token'
            }
            
            mock_userinfo.return_value = SSOUserInfo(
                provider='oidc',
                external_id='12345',
                username='johndoe',
                email='john@example.com'
            )
            
            mock_user = User(
                id=1,
                tenant_id=1,
                username='johndoe',
                email='john@example.com',
                password_hash='hash',
                role='user',
                is_active=True,
                created_at=datetime.now(timezone.utc),
                metadata={}
            )
            mock_create.return_value = mock_user
            
            success, message, user = await sso_service.process_sso_callback('oidc', callback_data)
            
            assert success is True
            assert user is not None
            assert user.username == 'johndoe'

    async def test_process_sso_callback_error(self, sso_service):
        """Test SSO callback with error"""
        callback_data = {
            'error': 'access_denied',
            'error_description': 'User denied access'
        }
        
        success, message, user = await sso_service.process_sso_callback('oidc', callback_data)
        
        assert success is False
        assert 'access_denied' in message
        assert user is None

    async def test_link_sso_account(self, sso_service, user_repo):
        """Test linking SSO account to existing user"""
        # Create user
        user = User(
            tenant_id=1,
            username='testuser',
            email='test@example.com',
            password_hash='hash',
            role='user',
            is_active=True,
            created_at=datetime.now(timezone.utc),
            metadata={'password_salt': 'salt'}
        )
        created_user = await user_repo.create(user)
        
        sso_user_info = SSOUserInfo(
            provider='oidc',
            external_id='12345',
            username='johndoe',
            email='john@example.com'
        )
        
        success = await sso_service.link_sso_account(created_user.id, 'oidc', sso_user_info)
        
        assert success is True
        
        # Verify linking
        updated_user = await user_repo.get_by_id(created_user.id)
        assert updated_user.metadata['sso_oidc_id'] == '12345'

    async def test_unlink_sso_account(self, sso_service, user_repo):
        """Test unlinking SSO account"""
        # Create user with SSO linking
        user = User(
            tenant_id=1,
            username='testuser',
            email='test@example.com',
            password_hash='hash',
            role='user',
            is_active=True,
            created_at=datetime.now(timezone.utc),
            metadata={
                'password_salt': 'salt',
                'sso_oidc_id': '12345',
                'sso_oidc_linked': '2023-01-01T00:00:00Z'
            }
        )
        created_user = await user_repo.create(user)
        
        success = await sso_service.unlink_sso_account(created_user.id, 'oidc')
        
        assert success is True
        
        # Verify unlinking
        updated_user = await user_repo.get_by_id(created_user.id)
        assert 'sso_oidc_id' not in updated_user.metadata
        assert 'sso_oidc_linked' not in updated_user.metadata


if __name__ == "__main__":
    pytest.main([__file__])