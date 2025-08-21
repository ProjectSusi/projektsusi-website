"""
SSO Provider Presets and Configuration Helpers
Pre-configured settings for popular SSO providers
"""
import logging
from typing import Dict, Any, Optional
from ..services.sso_service import SSOService

logger = logging.getLogger(__name__)


class SSOProviderPresets:
    """Pre-configured SSO provider settings for popular services"""
    
    @staticmethod
    def get_google_oidc_config(client_id: str, client_secret: str, redirect_uri: str = None) -> Dict[str, Any]:
        """Get Google OIDC configuration"""
        return {
            'name': 'Google',
            'client_id': client_id,
            'client_secret': client_secret,
            'discovery_url': 'https://accounts.google.com/.well-known/openid-configuration',
            'redirect_uri': redirect_uri or '/api/v1/sso/oidc/callback',
            'scope': 'openid profile email',
            'user_info_endpoint': 'https://openidconnect.googleapis.com/v1/userinfo'
        }
    
    @staticmethod
    def get_microsoft_oidc_config(tenant_id: str, client_id: str, client_secret: str, redirect_uri: str = None) -> Dict[str, Any]:
        """Get Microsoft Azure AD OIDC configuration"""
        return {
            'name': 'Microsoft',
            'client_id': client_id,
            'client_secret': client_secret,
            'discovery_url': f'https://login.microsoftonline.com/{tenant_id}/v2.0/.well-known/openid_configuration',
            'redirect_uri': redirect_uri or '/api/v1/sso/oidc/callback',
            'scope': 'openid profile email',
        }
    
    @staticmethod
    def get_auth0_oidc_config(domain: str, client_id: str, client_secret: str, redirect_uri: str = None) -> Dict[str, Any]:
        """Get Auth0 OIDC configuration"""
        return {
            'name': 'Auth0',
            'client_id': client_id,
            'client_secret': client_secret,
            'discovery_url': f'https://{domain}/.well-known/openid_configuration',
            'redirect_uri': redirect_uri or '/api/v1/sso/oidc/callback',
            'scope': 'openid profile email',
        }
    
    @staticmethod
    def get_okta_oidc_config(okta_domain: str, client_id: str, client_secret: str, redirect_uri: str = None) -> Dict[str, Any]:
        """Get Okta OIDC configuration"""
        return {
            'name': 'Okta',
            'client_id': client_id,
            'client_secret': client_secret,
            'discovery_url': f'https://{okta_domain}/.well-known/openid_configuration',
            'redirect_uri': redirect_uri or '/api/v1/sso/oidc/callback',
            'scope': 'openid profile email',
        }
    
    @staticmethod
    def get_okta_saml_config(okta_domain: str, app_id: str, entity_id: str = None, acs_url: str = None) -> Dict[str, Any]:
        """Get Okta SAML configuration"""
        return {
            'name': 'Okta SAML',
            'entity_id': entity_id or 'projectsusi-rag',
            'acs_url': acs_url or '/api/v1/sso/saml/acs',
            'sso_url': f'https://{okta_domain}/app/{app_id}/sso/saml',
            'metadata_url': f'https://{okta_domain}/app/{app_id}/sso/saml/metadata',
        }
    
    @staticmethod
    def get_adfs_saml_config(adfs_server: str, entity_id: str = None, acs_url: str = None) -> Dict[str, Any]:
        """Get Active Directory Federation Services SAML configuration"""
        return {
            'name': 'ADFS SAML',
            'entity_id': entity_id or 'projectsusi-rag',
            'acs_url': acs_url or '/api/v1/sso/saml/acs',
            'sso_url': f'https://{adfs_server}/adfs/ls/',
            'metadata_url': f'https://{adfs_server}/adfs/services/trust/mex',
        }
    
    @staticmethod
    def get_generic_saml_config(
        sso_url: str, 
        entity_id: str = None, 
        acs_url: str = None,
        x509_cert: str = None
    ) -> Dict[str, Any]:
        """Get generic SAML configuration"""
        return {
            'name': 'Generic SAML',
            'entity_id': entity_id or 'projectsusi-rag',
            'acs_url': acs_url or '/api/v1/sso/saml/acs',
            'sso_url': sso_url,
            'x509_cert': x509_cert,
        }


def create_sso_configuration_examples() -> Dict[str, Dict[str, str]]:
    """Create example SSO configurations for documentation"""
    
    examples = {
        'google_oidc': {
            'SSO_ENABLED': 'true',
            'OIDC_ENABLED': 'true',
            'OIDC_CLIENT_ID': 'your-google-client-id.apps.googleusercontent.com',
            'OIDC_CLIENT_SECRET': 'your-google-client-secret',
            'OIDC_DISCOVERY_URL': 'https://accounts.google.com/.well-known/openid-configuration',
            'OIDC_REDIRECT_URI': 'https://your-domain.com/api/v1/sso/oidc/callback'
        },
        
        'microsoft_oidc': {
            'SSO_ENABLED': 'true',
            'OIDC_ENABLED': 'true',
            'OIDC_CLIENT_ID': 'your-azure-application-id',
            'OIDC_CLIENT_SECRET': 'your-azure-client-secret',
            'OIDC_DISCOVERY_URL': 'https://login.microsoftonline.com/your-tenant-id/v2.0/.well-known/openid_configuration',
            'OIDC_REDIRECT_URI': 'https://your-domain.com/api/v1/sso/oidc/callback'
        },
        
        'auth0_oidc': {
            'SSO_ENABLED': 'true',
            'OIDC_ENABLED': 'true',
            'OIDC_CLIENT_ID': 'your-auth0-client-id',
            'OIDC_CLIENT_SECRET': 'your-auth0-client-secret',
            'OIDC_DISCOVERY_URL': 'https://your-domain.auth0.com/.well-known/openid_configuration',
            'OIDC_REDIRECT_URI': 'https://your-domain.com/api/v1/sso/oidc/callback'
        },
        
        'okta_oidc': {
            'SSO_ENABLED': 'true',
            'OIDC_ENABLED': 'true',
            'OIDC_CLIENT_ID': 'your-okta-client-id',
            'OIDC_CLIENT_SECRET': 'your-okta-client-secret',
            'OIDC_DISCOVERY_URL': 'https://your-org.okta.com/.well-known/openid_configuration',
            'OIDC_REDIRECT_URI': 'https://your-domain.com/api/v1/sso/oidc/callback'
        },
        
        'okta_saml': {
            'SSO_ENABLED': 'true',
            'SAML_ENABLED': 'true',
            'SAML_ENTITY_ID': 'projectsusi-rag',
            'SAML_SSO_URL': 'https://your-org.okta.com/app/your-app-id/sso/saml',
            'SAML_ACS_URL': 'https://your-domain.com/api/v1/sso/saml/acs'
        },
        
        'adfs_saml': {
            'SSO_ENABLED': 'true',
            'SAML_ENABLED': 'true',
            'SAML_ENTITY_ID': 'projectsusi-rag',
            'SAML_SSO_URL': 'https://your-adfs-server.com/adfs/ls/',
            'SAML_ACS_URL': 'https://your-domain.com/api/v1/sso/saml/acs'
        }
    }
    
    return examples


async def auto_configure_sso_from_environment() -> bool:
    """Auto-configure SSO providers based on environment variables"""
    try:
        import os
        
        configured_providers = []
        
        # Check for Google OIDC configuration
        if (os.getenv('GOOGLE_CLIENT_ID') and os.getenv('GOOGLE_CLIENT_SECRET')):
            logger.info("Google OIDC configuration detected")
            configured_providers.append('Google OIDC')
        
        # Check for Microsoft OIDC configuration
        if (os.getenv('MICROSOFT_CLIENT_ID') and os.getenv('MICROSOFT_CLIENT_SECRET') and os.getenv('MICROSOFT_TENANT_ID')):
            logger.info("Microsoft Azure AD OIDC configuration detected")
            configured_providers.append('Microsoft OIDC')
        
        # Check for Auth0 OIDC configuration
        if (os.getenv('AUTH0_CLIENT_ID') and os.getenv('AUTH0_CLIENT_SECRET') and os.getenv('AUTH0_DOMAIN')):
            logger.info("Auth0 OIDC configuration detected")
            configured_providers.append('Auth0 OIDC')
        
        # Check for Okta configuration
        if (os.getenv('OKTA_CLIENT_ID') and os.getenv('OKTA_CLIENT_SECRET') and os.getenv('OKTA_DOMAIN')):
            logger.info("Okta OIDC configuration detected")
            configured_providers.append('Okta OIDC')
        
        # Check for generic SAML configuration
        if os.getenv('SAML_SSO_URL'):
            logger.info("Generic SAML configuration detected")
            configured_providers.append('Generic SAML')
        
        if configured_providers:
            logger.info(f"Auto-configured SSO providers: {', '.join(configured_providers)}")
            return True
        else:
            logger.info("No SSO providers auto-configured - add environment variables to enable")
            return False
            
    except Exception as e:
        logger.error(f"Failed to auto-configure SSO: {e}")
        return False


def validate_sso_configuration() -> Dict[str, Any]:
    """Validate current SSO configuration and return status"""
    import os
    
    validation_result = {
        'sso_enabled': os.getenv('SSO_ENABLED', 'true').lower() == 'true',
        'providers': {},
        'issues': [],
        'recommendations': []
    }
    
    try:
        # Validate SAML configuration
        saml_enabled = os.getenv('SAML_ENABLED', 'false').lower() == 'true'
        if saml_enabled:
            saml_config = {
                'enabled': True,
                'entity_id': os.getenv('SAML_ENTITY_ID'),
                'sso_url': os.getenv('SAML_SSO_URL'),
                'acs_url': os.getenv('SAML_ACS_URL'),
                'has_certificate': bool(os.getenv('SAML_X509_CERT')),
                'has_private_key': bool(os.getenv('SAML_PRIVATE_KEY'))
            }
            
            if not saml_config['sso_url']:
                validation_result['issues'].append("SAML enabled but SAML_SSO_URL not configured")
            
            validation_result['providers']['saml'] = saml_config
        
        # Validate OIDC configuration
        oidc_enabled = os.getenv('OIDC_ENABLED', 'false').lower() == 'true'
        if oidc_enabled:
            oidc_config = {
                'enabled': True,
                'client_id': bool(os.getenv('OIDC_CLIENT_ID')),
                'client_secret': bool(os.getenv('OIDC_CLIENT_SECRET')),
                'discovery_url': os.getenv('OIDC_DISCOVERY_URL'),
                'manual_endpoints': bool(os.getenv('OIDC_AUTH_ENDPOINT')),
                'redirect_uri': os.getenv('OIDC_REDIRECT_URI')
            }
            
            if not oidc_config['client_id'] or not oidc_config['client_secret']:
                validation_result['issues'].append("OIDC enabled but client credentials not configured")
            
            if not oidc_config['discovery_url'] and not oidc_config['manual_endpoints']:
                validation_result['issues'].append("OIDC enabled but no discovery URL or manual endpoints configured")
            
            validation_result['providers']['oidc'] = oidc_config
        
        # Provide recommendations
        if not saml_enabled and not oidc_enabled:
            validation_result['recommendations'].append("Consider enabling SAML or OIDC for single sign-on")
        
        if saml_enabled and not os.getenv('SAML_X509_CERT'):
            validation_result['recommendations'].append("Add SAML_X509_CERT for signature verification")
        
        if oidc_enabled and not os.getenv('OIDC_DISCOVERY_URL'):
            validation_result['recommendations'].append("Use OIDC_DISCOVERY_URL for automatic endpoint discovery")
        
        validation_result['status'] = 'valid' if not validation_result['issues'] else 'issues_found'
        
    except Exception as e:
        validation_result['status'] = 'error'
        validation_result['error'] = str(e)
    
    return validation_result


def get_sso_setup_guide() -> Dict[str, Any]:
    """Get SSO setup guide with step-by-step instructions"""
    
    return {
        'overview': 'SSO (Single Sign-On) allows users to authenticate using external identity providers',
        'supported_protocols': ['SAML 2.0', 'OpenID Connect (OIDC)'],
        'popular_providers': ['Google', 'Microsoft Azure AD', 'Okta', 'Auth0', 'ADFS'],
        
        'setup_steps': {
            'oidc': [
                '1. Register application with your OIDC provider',
                '2. Obtain client ID and client secret',
                '3. Configure redirect URI: https://your-domain.com/api/v1/sso/oidc/callback',
                '4. Set environment variables: OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_DISCOVERY_URL',
                '5. Enable OIDC: OIDC_ENABLED=true',
                '6. Test SSO login at /api/v1/sso/oidc/login'
            ],
            
            'saml': [
                '1. Configure your SAML identity provider',
                '2. Set entity ID (default: projectsusi-rag)',
                '3. Configure ACS URL: https://your-domain.com/api/v1/sso/saml/acs',
                '4. Get SSO URL from your provider',
                '5. Set environment variables: SAML_SSO_URL, SAML_ENTITY_ID',
                '6. Enable SAML: SAML_ENABLED=true',
                '7. Test SAML login at /api/v1/sso/saml/login'
            ]
        },
        
        'environment_variables': {
            'required_oidc': ['OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET'],
            'optional_oidc': ['OIDC_DISCOVERY_URL', 'OIDC_REDIRECT_URI'],
            'required_saml': ['SAML_SSO_URL'],
            'optional_saml': ['SAML_ENTITY_ID', 'SAML_ACS_URL', 'SAML_X509_CERT']
        },
        
        'testing': {
            'endpoints': {
                'providers': '/api/v1/sso/providers',
                'oidc_login': '/api/v1/sso/oidc/login',
                'saml_login': '/api/v1/sso/saml/login',
                'saml_metadata': '/api/v1/sso/saml/metadata'
            }
        }
    }