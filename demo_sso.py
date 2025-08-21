#!/usr/bin/env python3
"""
Demo script for SSO authentication system
Shows SAML and OIDC integration capabilities
"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.repositories.user_repository import SQLiteUserRepository
from core.services.auth_service import AuthenticationService
from core.services.sso_service import SSOService, SSOUserInfo


async def demo_sso_system():
    """Demonstrate the SSO authentication system"""
    print("SSO Authentication System Demo")
    print("=" * 50)
    
    # Initialize services
    print("\n1. Initializing SSO system...")
    repo = SQLiteUserRepository(':memory:')
    auth_service = AuthenticationService(repo)
    
    # Mock environment for demo
    import os
    os.environ.update({
        'SAML_SSO_URL': 'https://idp.example.com/sso',
        'SAML_ENTITY_ID': 'projectsusi-rag-demo',
        'OIDC_CLIENT_ID': 'demo-client-id',
        'OIDC_CLIENT_SECRET': 'demo-client-secret',
        'OIDC_DISCOVERY_URL': 'https://auth.example.com/.well-known/openid_configuration'
    })
    
    sso_service = SSOService(repo, auth_service)
    print("SSO service ready")
    
    # Show available providers
    print("\n2. Available SSO Providers:")
    providers = sso_service.get_available_providers()
    for provider in providers:
        print(f"  - {provider.name} ({provider.type}): {'Enabled' if provider.enabled else 'Disabled'}")
    
    # Demo SAML flow
    print("\n3. SAML Authentication Flow Demo...")
    try:
        saml_url = sso_service.initiate_sso_login('saml', tenant_id=1)
        print(f"SAML Auth URL generated: {saml_url[:80]}...")
        
        # Simulate SAML response processing
        print("Simulating SAML response processing...")
        mock_saml_user = SSOUserInfo(
            provider='saml',
            external_id='saml-user@company.com',
            username='saml-user',
            email='saml-user@company.com',
            first_name='SAML',
            last_name='User',
            groups=['employees', 'developers']
        )
        
        # Create user from SAML info
        saml_user = await sso_service._find_or_create_sso_user(mock_saml_user, 1, 'saml')
        if saml_user:
            print(f"SAML user created: {saml_user.username} (ID: {saml_user.id})")
            print(f"SSO metadata: {list(saml_user.metadata.keys())}")
        else:
            print("FAIL: SAML user creation failed")
            
    except Exception as e:
        print(f"SAML demo error: {e}")
    
    # Demo OIDC flow
    print("\n4. OIDC Authentication Flow Demo...")
    try:
        oidc_url = sso_service.initiate_sso_login('oidc', tenant_id=1)
        print(f"OIDC Auth URL generated: {oidc_url[:80]}...")
        
        # Simulate OIDC response processing
        print("Simulating OIDC response processing...")
        mock_oidc_user = SSOUserInfo(
            provider='oidc',
            external_id='oidc-12345',
            username='oidc-user',
            email='oidc-user@company.com',
            first_name='OIDC',
            last_name='User',
            groups=['users', 'managers']
        )
        
        # Create user from OIDC info
        oidc_user = await sso_service._find_or_create_sso_user(mock_oidc_user, 1, 'oidc')
        if oidc_user:
            print(f"OIDC user created: {oidc_user.username} (ID: {oidc_user.id})")
            print(f"SSO metadata: {list(oidc_user.metadata.keys())}")
        else:
            print("FAIL: OIDC user creation failed")
            
    except Exception as e:
        print(f"OIDC demo error: {e}")
    
    # Demo account linking
    print("\n5. Account Linking Demo...")
    if 'saml_user' in locals() and 'oidc_user' in locals():
        try:
            # Link OIDC to SAML user
            success = await sso_service.link_sso_account(
                saml_user.id, 
                'oidc', 
                mock_oidc_user
            )
            
            if success:
                print("Account linking successful")
                
                # Check updated metadata
                updated_user = await repo.get_by_id(saml_user.id)
                linked_providers = []
                for key in updated_user.metadata.keys():
                    if key.startswith('sso_') and key.endswith('_id'):
                        provider = key.replace('sso_', '').replace('_id', '')
                        linked_providers.append(provider)
                
                print(f"User {updated_user.username} linked to providers: {linked_providers}")
                
                # Test unlinking
                print("Testing account unlinking...")
                unlink_success = await sso_service.unlink_sso_account(saml_user.id, 'oidc')
                if unlink_success:
                    print("Account unlinking successful")
                else:
                    print("Account unlinking failed")
                    
            else:
                print("Account linking failed")
                
        except Exception as e:
            print(f"Account linking demo error: {e}")
    
    # Demo existing user SSO login
    print("\n6. Existing User SSO Login Demo...")
    try:
        # Create a regular user first
        regular_success, message, regular_user = await auth_service.register_user(
            username="regular_user",
            email="regular@company.com",
            password="password123",
            tenant_id=1
        )
        
        if regular_success:
            print(f"Regular user created: {regular_user.username}")
            
            # Simulate SSO login for existing email
            existing_sso_user = SSOUserInfo(
                provider='saml',
                external_id='existing-saml-id',
                username='different-username',
                email='regular@company.com',  # Same email as regular user
                first_name='Regular',
                last_name='User'
            )
            
            # This should find and update the existing user
            found_user = await sso_service._find_or_create_sso_user(existing_sso_user, 1, 'saml')
            
            if found_user and found_user.id == regular_user.id:
                print("Existing user found and updated with SSO info")
                print(f"SSO provider added: {found_user.metadata.get('sso_provider')}")
            else:
                print("Existing user lookup failed")
        
    except Exception as e:
        print(f"Existing user demo error: {e}")
    
    # Demo role mapping
    print("\n7. Role Mapping Demo...")
    try:
        # Admin user from SSO
        admin_sso_user = SSOUserInfo(
            provider='oidc',
            external_id='admin-12345',
            username='admin-user',
            email='admin@company.com',
            first_name='Admin',
            last_name='User',
            groups=['administrators', 'managers']  # Should map to admin role
        )
        
        admin_user = await sso_service._find_or_create_sso_user(admin_sso_user, 1, 'oidc')
        if admin_user:
            print(f"Admin user created: {admin_user.username}")
            print(f"User role: {admin_user.role}")
            print(f"Groups from SSO: {admin_user.metadata.get('groups', [])}")
        
    except Exception as e:
        print(f"Role mapping demo error: {e}")
    
    print("\nSSO Authentication Demo Complete!")
    print("Features demonstrated:")
    print("  - Multiple SSO providers (SAML, OIDC)")
    print("  - Authentication URL generation")
    print("  - User creation from SSO attributes")
    print("  - Account linking/unlinking")
    print("  - Existing user SSO integration")
    print("  - Role mapping from groups")
    print("  - Multi-tenant support")
    print("  - Metadata management")


if __name__ == "__main__":
    asyncio.run(demo_sso_system())