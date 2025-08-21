"""
Single Sign-On (SSO) Service
Handles SAML and OIDC authentication providers
"""

import os
import jwt
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass
from urllib.parse import urlencode, parse_qs, urlparse
import requests
import base64
import hashlib
import secrets

from ..repositories.interfaces import IUserRepository
from ..repositories.models import User
from .auth_service import AuthenticationService, UserRole

logger = logging.getLogger(__name__)


@dataclass
class SSOProvider:
    """SSO provider configuration"""
    name: str
    type: str  # 'saml' or 'oidc'
    enabled: bool
    config: Dict[str, Any]


@dataclass
class SSOUserInfo:
    """User information from SSO provider"""
    provider: str
    external_id: str
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    groups: List[str] = None
    attributes: Dict[str, Any] = None


class SAMLHandler:
    """SAML 2.0 authentication handler"""
    
    def __init__(self, provider_config: Dict[str, Any]):
        self.config = provider_config
        self.entity_id = provider_config.get('entity_id', 'projectsusi-rag')
        self.acs_url = provider_config.get('acs_url', '/api/v1/sso/saml/acs')
        self.sso_url = provider_config['sso_url']
        self.x509_cert = provider_config.get('x509_cert')
        self.private_key = provider_config.get('private_key')
        
    def generate_auth_request(self, relay_state: Optional[str] = None) -> Tuple[str, str]:
        """Generate SAML authentication request"""
        try:
            request_id = f"_{secrets.token_hex(16)}"
            timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
            
            # Build SAML AuthnRequest
            saml_request = f"""<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest 
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="{request_id}"
    Version="2.0"
    IssueInstant="{timestamp}"
    Destination="{self.sso_url}"
    AssertionConsumerServiceURL="{self.acs_url}"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    <saml:Issuer>{self.entity_id}</saml:Issuer>
    <samlp:NameIDPolicy 
        Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
        AllowCreate="true"/>
</samlp:AuthnRequest>"""
            
            # Base64 encode and deflate
            encoded_request = base64.b64encode(saml_request.encode()).decode()
            
            # Build redirect URL
            params = {'SAMLRequest': encoded_request}
            if relay_state:
                params['RelayState'] = relay_state
                
            redirect_url = f"{self.sso_url}?{urlencode(params)}"
            
            return redirect_url, request_id
            
        except Exception as e:
            logger.error(f"Failed to generate SAML auth request: {e}")
            raise
    
    def process_response(self, saml_response: str, relay_state: Optional[str] = None) -> SSOUserInfo:
        """Process SAML response and extract user info"""
        try:
            # Decode base64 response
            decoded_response = base64.b64decode(saml_response).decode()
            
            # Parse XML
            root = ET.fromstring(decoded_response)
            
            # Define namespaces
            namespaces = {
                'saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
                'samlp': 'urn:oasis:names:tc:SAML:2.0:protocol'
            }
            
            # Extract assertion
            assertion = root.find('.//saml:Assertion', namespaces)
            if assertion is None:
                raise ValueError("No assertion found in SAML response")
            
            # Extract subject (user identifier)
            subject = assertion.find('.//saml:Subject/saml:NameID', namespaces)
            if subject is None:
                raise ValueError("No subject found in SAML assertion")
            
            external_id = subject.text
            username = external_id  # Default to email as username
            email = external_id if '@' in external_id else None
            
            # Extract attributes
            attributes = {}
            first_name = None
            last_name = None
            groups = []
            
            for attr in assertion.findall('.//saml:AttributeStatement/saml:Attribute', namespaces):
                attr_name = attr.get('Name')
                attr_values = [v.text for v in attr.findall('saml:AttributeValue', namespaces)]
                
                attributes[attr_name] = attr_values
                
                # Map common attributes
                if attr_name in ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname', 'firstName']:
                    first_name = attr_values[0] if attr_values else None
                elif attr_name in ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname', 'lastName']:
                    last_name = attr_values[0] if attr_values else None
                elif attr_name in ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', 'email']:
                    email = attr_values[0] if attr_values else email
                elif attr_name in ['http://schemas.microsoft.com/ws/2008/06/identity/claims/groups', 'groups']:
                    groups = attr_values
            
            return SSOUserInfo(
                provider='saml',
                external_id=external_id,
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                groups=groups,
                attributes=attributes
            )
            
        except Exception as e:
            logger.error(f"Failed to process SAML response: {e}")
            raise


class OIDCHandler:
    """OpenID Connect authentication handler"""
    
    def __init__(self, provider_config: Dict[str, Any]):
        self.config = provider_config
        self.client_id = provider_config['client_id']
        self.client_secret = provider_config['client_secret']
        self.discovery_url = provider_config.get('discovery_url')
        self.auth_endpoint = provider_config.get('authorization_endpoint')
        self.token_endpoint = provider_config.get('token_endpoint')
        self.userinfo_endpoint = provider_config.get('userinfo_endpoint')
        self.redirect_uri = provider_config.get('redirect_uri', '/api/v1/sso/oidc/callback')
        
        # Discover endpoints if discovery URL provided
        if self.discovery_url and not all([self.auth_endpoint, self.token_endpoint, self.userinfo_endpoint]):
            try:
                self._discover_endpoints()
            except Exception as e:
                logger.warning(f"OIDC endpoint discovery failed: {e}")
                # Continue without discovery
    
    def _discover_endpoints(self):
        """Discover OIDC endpoints from well-known configuration"""
        try:
            response = requests.get(self.discovery_url, timeout=10)
            response.raise_for_status()
            
            discovery_doc = response.json()
            
            self.auth_endpoint = discovery_doc.get('authorization_endpoint')
            self.token_endpoint = discovery_doc.get('token_endpoint')
            self.userinfo_endpoint = discovery_doc.get('userinfo_endpoint')
            
            logger.info(f"Discovered OIDC endpoints for {self.config.get('name', 'unknown')}")
            
        except Exception as e:
            logger.error(f"Failed to discover OIDC endpoints: {e}")
            raise
    
    def generate_auth_request(self, state: Optional[str] = None) -> Tuple[str, str]:
        """Generate OIDC authorization request"""
        try:
            if not state:
                state = secrets.token_urlsafe(32)
            
            nonce = secrets.token_urlsafe(16)
            
            params = {
                'response_type': 'code',
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,
                'scope': 'openid profile email',
                'state': state,
                'nonce': nonce,
            }
            
            auth_url = f"{self.auth_endpoint}?{urlencode(params)}"
            
            return auth_url, state
            
        except Exception as e:
            logger.error(f"Failed to generate OIDC auth request: {e}")
            raise
    
    def exchange_code_for_token(self, code: str, state: str) -> Dict[str, Any]:
        """Exchange authorization code for tokens"""
        try:
            token_data = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': self.redirect_uri,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
            }
            
            response = requests.post(
                self.token_endpoint,
                data=token_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=10
            )
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Failed to exchange code for token: {e}")
            raise
    
    def get_user_info(self, access_token: str, id_token: str = None) -> SSOUserInfo:
        """Get user information from OIDC provider"""
        try:
            # Get user info from userinfo endpoint
            response = requests.get(
                self.userinfo_endpoint,
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            response.raise_for_status()
            
            user_info = response.json()
            
            # Also decode ID token if available
            id_token_claims = {}
            if id_token:
                try:
                    # Decode without verification for now (should verify in production)
                    payload = id_token.split('.')[1]
                    # Add padding if needed
                    payload += '=' * (4 - len(payload) % 4)
                    id_token_claims = jwt.decode(
                        payload, 
                        options={"verify_signature": False}
                    )
                except Exception as e:
                    logger.warning(f"Failed to decode ID token: {e}")
            
            # Merge claims
            combined_info = {**user_info, **id_token_claims}
            
            # Extract standard fields
            external_id = combined_info.get('sub') or combined_info.get('id')
            username = combined_info.get('preferred_username') or combined_info.get('email') or external_id
            email = combined_info.get('email')
            first_name = combined_info.get('given_name')
            last_name = combined_info.get('family_name')
            groups = combined_info.get('groups', [])
            
            return SSOUserInfo(
                provider='oidc',
                external_id=external_id,
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                groups=groups,
                attributes=combined_info
            )
            
        except Exception as e:
            logger.error(f"Failed to get OIDC user info: {e}")
            raise


class SSOService:
    """Central SSO service managing multiple providers"""
    
    def __init__(self, user_repository: IUserRepository, auth_service: AuthenticationService):
        self.user_repo = user_repository
        self.auth_service = auth_service
        self.providers: Dict[str, SSOProvider] = {}
        self.handlers: Dict[str, Any] = {}
        
        # Load providers from configuration
        self._load_providers()
        
        logger.info("SSO service initialized")
    
    def _load_providers(self):
        """Load SSO providers from configuration"""
        try:
            # SAML provider configuration
            saml_config = {
                'entity_id': os.getenv('SAML_ENTITY_ID', 'projectsusi-rag'),
                'acs_url': os.getenv('SAML_ACS_URL', '/api/v1/sso/saml/acs'),
                'sso_url': os.getenv('SAML_SSO_URL'),
                'x509_cert': os.getenv('SAML_X509_CERT'),
                'private_key': os.getenv('SAML_PRIVATE_KEY'),
            }
            
            if saml_config['sso_url']:
                self.providers['saml'] = SSOProvider(
                    name='SAML',
                    type='saml',
                    enabled=True,
                    config=saml_config
                )
                self.handlers['saml'] = SAMLHandler(saml_config)
                logger.info("SAML provider configured")
            
            # OIDC provider configuration
            oidc_config = {
                'client_id': os.getenv('OIDC_CLIENT_ID'),
                'client_secret': os.getenv('OIDC_CLIENT_SECRET'),
                'discovery_url': os.getenv('OIDC_DISCOVERY_URL'),
                'authorization_endpoint': os.getenv('OIDC_AUTH_ENDPOINT'),
                'token_endpoint': os.getenv('OIDC_TOKEN_ENDPOINT'),
                'userinfo_endpoint': os.getenv('OIDC_USERINFO_ENDPOINT'),
                'redirect_uri': os.getenv('OIDC_REDIRECT_URI', '/api/v1/sso/oidc/callback'),
            }
            
            if oidc_config['client_id'] and oidc_config['client_secret']:
                self.providers['oidc'] = SSOProvider(
                    name='OIDC',
                    type='oidc',
                    enabled=True,
                    config=oidc_config
                )
                self.handlers['oidc'] = OIDCHandler(oidc_config)
                logger.info("OIDC provider configured")
            
            # Additional providers can be added here
            # Google, Microsoft, Auth0, etc.
            
        except Exception as e:
            logger.error(f"Failed to load SSO providers: {e}")
    
    def get_available_providers(self) -> List[SSOProvider]:
        """Get list of available SSO providers"""
        return [provider for provider in self.providers.values() if provider.enabled]
    
    def initiate_sso_login(self, provider_name: str, tenant_id: int = 1) -> str:
        """Initiate SSO login with specified provider"""
        try:
            if provider_name not in self.providers:
                raise ValueError(f"Provider {provider_name} not found")
            
            provider = self.providers[provider_name]
            handler = self.handlers[provider_name]
            
            # Generate state/relay_state with tenant info
            state = f"{tenant_id}:{secrets.token_urlsafe(24)}"
            
            if provider.type == 'saml':
                auth_url, request_id = handler.generate_auth_request(relay_state=state)
                # Store request_id for validation if needed
                return auth_url
            elif provider.type == 'oidc':
                auth_url, state = handler.generate_auth_request(state=state)
                return auth_url
            else:
                raise ValueError(f"Unsupported provider type: {provider.type}")
                
        except Exception as e:
            logger.error(f"Failed to initiate SSO login: {e}")
            raise
    
    async def process_sso_callback(
        self, 
        provider_name: str, 
        callback_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[User]]:
        """Process SSO callback and authenticate user"""
        try:
            if provider_name not in self.providers:
                return False, f"Provider {provider_name} not found", None
            
            provider = self.providers[provider_name]
            handler = self.handlers[provider_name]
            
            # Extract tenant from state
            tenant_id = 1  # Default
            if provider.type == 'saml':
                relay_state = callback_data.get('RelayState', '')
                if ':' in relay_state:
                    tenant_id = int(relay_state.split(':')[0])
            elif provider.type == 'oidc':
                state = callback_data.get('state', '')
                if ':' in state:
                    tenant_id = int(state.split(':')[0])
            
            # Get user info from provider
            user_info = None
            
            if provider.type == 'saml':
                saml_response = callback_data.get('SAMLResponse')
                if not saml_response:
                    return False, "No SAML response received", None
                
                user_info = handler.process_response(saml_response, callback_data.get('RelayState'))
                
            elif provider.type == 'oidc':
                code = callback_data.get('code')
                state = callback_data.get('state')
                
                if not code:
                    error = callback_data.get('error', 'No authorization code received')
                    return False, f"OIDC error: {error}", None
                
                # Exchange code for tokens
                tokens = handler.exchange_code_for_token(code, state)
                access_token = tokens.get('access_token')
                id_token = tokens.get('id_token')
                
                if not access_token:
                    return False, "No access token received", None
                
                user_info = handler.get_user_info(access_token, id_token)
            
            if not user_info:
                return False, "Failed to get user information", None
            
            # Find or create user
            user = await self._find_or_create_sso_user(user_info, tenant_id, provider_name)
            
            if user:
                logger.info(f"SSO login successful for user {user.username} via {provider_name}")
                return True, "SSO login successful", user
            else:
                return False, "Failed to create or find user", None
                
        except Exception as e:
            logger.error(f"Failed to process SSO callback: {e}")
            return False, f"SSO callback processing failed: {str(e)}", None
    
    async def _find_or_create_sso_user(
        self, 
        user_info: SSOUserInfo, 
        tenant_id: int,
        provider_name: str
    ) -> Optional[User]:
        """Find existing user or create new one from SSO info"""
        try:
            # Try to find user by email first
            existing_user = None
            if user_info.email:
                existing_user = await self.user_repo.get_by_email(user_info.email)
            
            if existing_user:
                # Update SSO info in metadata
                metadata = existing_user.metadata.copy()
                metadata.update({
                    f'sso_{provider_name}_id': user_info.external_id,
                    f'sso_{provider_name}_last_login': datetime.now(timezone.utc).isoformat(),
                    'sso_provider': provider_name,
                })
                
                await self.user_repo.update(existing_user.id, {'metadata': metadata})
                return existing_user
            
            # Create new user
            username = user_info.username or user_info.email
            if not username:
                raise ValueError("No username or email provided by SSO provider")
            
            # Ensure username is unique
            counter = 1
            base_username = username
            while await self.user_repo.get_by_username(username):
                username = f"{base_username}_{counter}"
                counter += 1
            
            # Determine role from groups
            role = UserRole.USER  # Default role
            if user_info.groups:
                # Map groups to roles
                if any(group.lower() in ['admin', 'administrator'] for group in user_info.groups):
                    role = UserRole.ADMIN
            
            # Generate a random password (SSO users don't need passwords)
            dummy_password = secrets.token_urlsafe(32)
            from ..utils.security import hash_password
            password_hash, salt = hash_password(dummy_password)
            
            user = User(
                tenant_id=tenant_id,
                username=username,
                email=user_info.email or f"{username}@sso.local",
                password_hash=password_hash,
                role=role.value,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                metadata={
                    'password_salt': base64.b64encode(salt).decode(),
                    f'sso_{provider_name}_id': user_info.external_id,
                    f'sso_{provider_name}_last_login': datetime.now(timezone.utc).isoformat(),
                    'sso_provider': provider_name,
                    'sso_user': True,
                    'first_name': user_info.first_name,
                    'last_name': user_info.last_name,
                    'groups': user_info.groups or [],
                }
            )
            
            created_user = await self.user_repo.create(user)
            logger.info(f"Created new SSO user: {username} from {provider_name}")
            
            return created_user
            
        except Exception as e:
            logger.error(f"Failed to find or create SSO user: {e}")
            return None
    
    async def link_sso_account(
        self, 
        user_id: int, 
        provider_name: str, 
        sso_user_info: SSOUserInfo
    ) -> bool:
        """Link existing account with SSO provider"""
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                return False
            
            metadata = user.metadata.copy()
            metadata.update({
                f'sso_{provider_name}_id': sso_user_info.external_id,
                f'sso_{provider_name}_linked': datetime.now(timezone.utc).isoformat(),
            })
            
            await self.user_repo.update(user_id, {'metadata': metadata})
            logger.info(f"Linked user {user.username} with {provider_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to link SSO account: {e}")
            return False
    
    async def unlink_sso_account(self, user_id: int, provider_name: str) -> bool:
        """Unlink SSO provider from user account"""
        try:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                return False
            
            metadata = user.metadata.copy()
            
            # Remove SSO-related keys
            keys_to_remove = []
            for key in metadata.keys():
                if key.startswith(f'sso_{provider_name}_'):
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del metadata[key]
            
            await self.user_repo.update(user_id, {'metadata': metadata})
            logger.info(f"Unlinked user {user.username} from {provider_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to unlink SSO account: {e}")
            return False