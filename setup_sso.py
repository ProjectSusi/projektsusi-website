#!/usr/bin/env python3
"""
SSO Configuration Helper
Interactive script to help set up SSO providers
"""
import os
import sys
from typing import Dict, Any

def print_banner():
    """Print setup banner"""
    print("=" * 60)
    print("🔐 SSO Configuration Helper")
    print("=" * 60)
    print("This script helps you configure Single Sign-On (SSO) providers")
    print("for the RAG System. Choose from popular providers or configure")
    print("custom SAML/OIDC settings.\n")

def show_provider_options():
    """Show available provider options"""
    print("Available SSO Provider Options:")
    print("1. Google (OIDC)")
    print("2. Microsoft Azure AD (OIDC)")
    print("3. Auth0 (OIDC)")
    print("4. Okta (OIDC)")
    print("5. Okta (SAML)")
    print("6. Active Directory Federation Services (SAML)")
    print("7. Generic OIDC Provider")
    print("8. Generic SAML Provider")
    print("9. Show current configuration")
    print("10. Generate configuration file")
    print("0. Exit")
    print()

def configure_google_oidc() -> Dict[str, str]:
    """Configure Google OIDC"""
    print("\n🔧 Configuring Google OIDC")
    print("=" * 40)
    print("Prerequisites:")
    print("1. Create a project in Google Cloud Console")
    print("2. Enable Google+ API")
    print("3. Create OAuth 2.0 credentials")
    print("4. Add redirect URI: https://your-domain.com/api/v1/sso/oidc/callback")
    print()
    
    client_id = input("Enter Google Client ID: ").strip()
    client_secret = input("Enter Google Client Secret: ").strip()
    redirect_uri = input("Enter Redirect URI (press Enter for default): ").strip()
    
    if not redirect_uri:
        redirect_uri = "https://your-domain.com/api/v1/sso/oidc/callback"
    
    return {
        'SSO_ENABLED': 'true',
        'OIDC_ENABLED': 'true',
        'OIDC_CLIENT_ID': client_id,
        'OIDC_CLIENT_SECRET': client_secret,
        'OIDC_DISCOVERY_URL': 'https://accounts.google.com/.well-known/openid-configuration',
        'OIDC_REDIRECT_URI': redirect_uri
    }

def configure_microsoft_oidc() -> Dict[str, str]:
    """Configure Microsoft Azure AD OIDC"""
    print("\n🔧 Configuring Microsoft Azure AD OIDC")
    print("=" * 45)
    print("Prerequisites:")
    print("1. Register application in Azure Active Directory")
    print("2. Note down Application (client) ID")
    print("3. Create client secret")
    print("4. Add redirect URI: https://your-domain.com/api/v1/sso/oidc/callback")
    print()
    
    tenant_id = input("Enter Azure Tenant ID: ").strip()
    client_id = input("Enter Application (Client) ID: ").strip()
    client_secret = input("Enter Client Secret: ").strip()
    redirect_uri = input("Enter Redirect URI (press Enter for default): ").strip()
    
    if not redirect_uri:
        redirect_uri = "https://your-domain.com/api/v1/sso/oidc/callback"
    
    return {
        'SSO_ENABLED': 'true',
        'OIDC_ENABLED': 'true',
        'OIDC_CLIENT_ID': client_id,
        'OIDC_CLIENT_SECRET': client_secret,
        'OIDC_DISCOVERY_URL': f'https://login.microsoftonline.com/{tenant_id}/v2.0/.well-known/openid_configuration',
        'OIDC_REDIRECT_URI': redirect_uri
    }

def configure_auth0_oidc() -> Dict[str, str]:
    """Configure Auth0 OIDC"""
    print("\n🔧 Configuring Auth0 OIDC")
    print("=" * 35)
    print("Prerequisites:")
    print("1. Create application in Auth0 Dashboard")
    print("2. Set application type to 'Regular Web Application'")
    print("3. Add callback URL: https://your-domain.com/api/v1/sso/oidc/callback")
    print()
    
    domain = input("Enter Auth0 Domain (e.g., your-tenant.auth0.com): ").strip()
    client_id = input("Enter Client ID: ").strip()
    client_secret = input("Enter Client Secret: ").strip()
    redirect_uri = input("Enter Redirect URI (press Enter for default): ").strip()
    
    if not redirect_uri:
        redirect_uri = "https://your-domain.com/api/v1/sso/oidc/callback"
    
    return {
        'SSO_ENABLED': 'true',
        'OIDC_ENABLED': 'true',
        'OIDC_CLIENT_ID': client_id,
        'OIDC_CLIENT_SECRET': client_secret,
        'OIDC_DISCOVERY_URL': f'https://{domain}/.well-known/openid_configuration',
        'OIDC_REDIRECT_URI': redirect_uri
    }

def configure_okta_oidc() -> Dict[str, str]:
    """Configure Okta OIDC"""
    print("\n🔧 Configuring Okta OIDC")
    print("=" * 35)
    print("Prerequisites:")
    print("1. Create application in Okta Admin Console")
    print("2. Choose 'Web Application'")
    print("3. Add redirect URI: https://your-domain.com/api/v1/sso/oidc/callback")
    print()
    
    okta_domain = input("Enter Okta Domain (e.g., your-org.okta.com): ").strip()
    client_id = input("Enter Client ID: ").strip()
    client_secret = input("Enter Client Secret: ").strip()
    redirect_uri = input("Enter Redirect URI (press Enter for default): ").strip()
    
    if not redirect_uri:
        redirect_uri = "https://your-domain.com/api/v1/sso/oidc/callback"
    
    return {
        'SSO_ENABLED': 'true',
        'OIDC_ENABLED': 'true',
        'OIDC_CLIENT_ID': client_id,
        'OIDC_CLIENT_SECRET': client_secret,
        'OIDC_DISCOVERY_URL': f'https://{okta_domain}/.well-known/openid_configuration',
        'OIDC_REDIRECT_URI': redirect_uri
    }

def configure_okta_saml() -> Dict[str, str]:
    """Configure Okta SAML"""
    print("\n🔧 Configuring Okta SAML")
    print("=" * 35)
    print("Prerequisites:")
    print("1. Create SAML 2.0 application in Okta")
    print("2. Set ACS URL: https://your-domain.com/api/v1/sso/saml/acs")
    print("3. Set Entity ID: projectsusi-rag")
    print()
    
    okta_domain = input("Enter Okta Domain (e.g., your-org.okta.com): ").strip()
    app_id = input("Enter Okta App ID: ").strip()
    entity_id = input("Enter Entity ID (press Enter for default): ").strip()
    acs_url = input("Enter ACS URL (press Enter for default): ").strip()
    
    if not entity_id:
        entity_id = "projectsusi-rag"
    if not acs_url:
        acs_url = "https://your-domain.com/api/v1/sso/saml/acs"
    
    return {
        'SSO_ENABLED': 'true',
        'SAML_ENABLED': 'true',
        'SAML_ENTITY_ID': entity_id,
        'SAML_SSO_URL': f'https://{okta_domain}/app/{app_id}/sso/saml',
        'SAML_ACS_URL': acs_url
    }

def configure_adfs_saml() -> Dict[str, str]:
    """Configure ADFS SAML"""
    print("\n🔧 Configuring Active Directory Federation Services SAML")
    print("=" * 60)
    print("Prerequisites:")
    print("1. Configure ADFS Relying Party Trust")
    print("2. Set ACS URL: https://your-domain.com/api/v1/sso/saml/acs")
    print("3. Configure claims rules")
    print()
    
    adfs_server = input("Enter ADFS Server (e.g., adfs.company.com): ").strip()
    entity_id = input("Enter Entity ID (press Enter for default): ").strip()
    acs_url = input("Enter ACS URL (press Enter for default): ").strip()
    
    if not entity_id:
        entity_id = "projectsusi-rag"
    if not acs_url:
        acs_url = "https://your-domain.com/api/v1/sso/saml/acs"
    
    return {
        'SSO_ENABLED': 'true',
        'SAML_ENABLED': 'true',
        'SAML_ENTITY_ID': entity_id,
        'SAML_SSO_URL': f'https://{adfs_server}/adfs/ls/',
        'SAML_ACS_URL': acs_url
    }

def configure_generic_oidc() -> Dict[str, str]:
    """Configure generic OIDC provider"""
    print("\n🔧 Configuring Generic OIDC Provider")
    print("=" * 40)
    
    client_id = input("Enter Client ID: ").strip()
    client_secret = input("Enter Client Secret: ").strip()
    discovery_url = input("Enter Discovery URL (optional): ").strip()
    auth_endpoint = input("Enter Authorization Endpoint (if no discovery): ").strip()
    token_endpoint = input("Enter Token Endpoint (if no discovery): ").strip()
    userinfo_endpoint = input("Enter UserInfo Endpoint (if no discovery): ").strip()
    redirect_uri = input("Enter Redirect URI (press Enter for default): ").strip()
    
    if not redirect_uri:
        redirect_uri = "https://your-domain.com/api/v1/sso/oidc/callback"
    
    config = {
        'SSO_ENABLED': 'true',
        'OIDC_ENABLED': 'true',
        'OIDC_CLIENT_ID': client_id,
        'OIDC_CLIENT_SECRET': client_secret,
        'OIDC_REDIRECT_URI': redirect_uri
    }
    
    if discovery_url:
        config['OIDC_DISCOVERY_URL'] = discovery_url
    else:
        if auth_endpoint:
            config['OIDC_AUTH_ENDPOINT'] = auth_endpoint
        if token_endpoint:
            config['OIDC_TOKEN_ENDPOINT'] = token_endpoint
        if userinfo_endpoint:
            config['OIDC_USERINFO_ENDPOINT'] = userinfo_endpoint
    
    return config

def configure_generic_saml() -> Dict[str, str]:
    """Configure generic SAML provider"""
    print("\n🔧 Configuring Generic SAML Provider")
    print("=" * 40)
    
    sso_url = input("Enter SSO URL: ").strip()
    entity_id = input("Enter Entity ID (press Enter for default): ").strip()
    acs_url = input("Enter ACS URL (press Enter for default): ").strip()
    x509_cert = input("Enter X.509 Certificate (optional): ").strip()
    
    if not entity_id:
        entity_id = "projectsusi-rag"
    if not acs_url:
        acs_url = "https://your-domain.com/api/v1/sso/saml/acs"
    
    config = {
        'SSO_ENABLED': 'true',
        'SAML_ENABLED': 'true',
        'SAML_ENTITY_ID': entity_id,
        'SAML_SSO_URL': sso_url,
        'SAML_ACS_URL': acs_url
    }
    
    if x509_cert:
        config['SAML_X509_CERT'] = x509_cert
    
    return config

def show_current_configuration():
    """Show current SSO configuration"""
    print("\n📋 Current SSO Configuration")
    print("=" * 40)
    
    sso_vars = [
        'SSO_ENABLED', 'SAML_ENABLED', 'OIDC_ENABLED',
        'SAML_ENTITY_ID', 'SAML_SSO_URL', 'SAML_ACS_URL', 'SAML_X509_CERT',
        'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_DISCOVERY_URL',
        'OIDC_AUTH_ENDPOINT', 'OIDC_TOKEN_ENDPOINT', 'OIDC_USERINFO_ENDPOINT',
        'OIDC_REDIRECT_URI'
    ]
    
    current_config = {}
    for var in sso_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'SECRET' in var or 'CERT' in var:
                display_value = f"{value[:8]}...***"
            else:
                display_value = value
            print(f"✅ {var}={display_value}")
            current_config[var] = value
        else:
            print(f"⚪ {var}=(not set)")
    
    if current_config:
        print(f"\n✅ Found {len(current_config)} SSO configuration variables")
    else:
        print("\n⚠️ No SSO configuration found")
    
    return current_config

def generate_configuration_file(config: Dict[str, str], filename: str = ".env.sso"):
    """Generate configuration file"""
    print(f"\n📄 Generating configuration file: {filename}")
    print("=" * 50)
    
    try:
        with open(filename, 'w') as f:
            f.write("# SSO Configuration\n")
            f.write("# Generated by SSO Configuration Helper\n")
            f.write(f"# Created: {__import__('datetime').datetime.now()}\n\n")
            
            for key, value in config.items():
                f.write(f"{key}={value}\n")
            
            f.write("\n# Usage:\n")
            f.write("# 1. Review and update the configuration values\n")
            f.write("# 2. Source this file: source .env.sso\n")
            f.write("# 3. Or copy variables to your main .env file\n")
            f.write("# 4. Restart the RAG system to apply changes\n")
        
        print(f"✅ Configuration saved to {filename}")
        print("\nTo use this configuration:")
        print(f"1. Review and update values in {filename}")
        print(f"2. Load variables: source {filename}")
        print("3. Restart the RAG system")
        
    except Exception as e:
        print(f"❌ Failed to create configuration file: {e}")

def main():
    """Main configuration interface"""
    print_banner()
    
    config = {}
    
    while True:
        show_provider_options()
        choice = input("Select an option (0-10): ").strip()
        
        try:
            if choice == '0':
                print("👋 Goodbye!")
                break
            elif choice == '1':
                config = configure_google_oidc()
            elif choice == '2':
                config = configure_microsoft_oidc()
            elif choice == '3':
                config = configure_auth0_oidc()
            elif choice == '4':
                config = configure_okta_oidc()
            elif choice == '5':
                config = configure_okta_saml()
            elif choice == '6':
                config = configure_adfs_saml()
            elif choice == '7':
                config = configure_generic_oidc()
            elif choice == '8':
                config = configure_generic_saml()
            elif choice == '9':
                show_current_configuration()
                continue
            elif choice == '10':
                if not config:
                    print("⚠️ No configuration to generate. Please configure a provider first.")
                    continue
                generate_configuration_file(config)
                continue
            else:
                print("❌ Invalid option. Please try again.")
                continue
            
            # Show configured values
            if config:
                print("\n✅ Configuration Complete!")
                print("=" * 30)
                for key, value in config.items():
                    # Mask sensitive values
                    if 'SECRET' in key:
                        display_value = f"{value[:8]}...***"
                    else:
                        display_value = value
                    print(f"{key}={display_value}")
                
                print("\n🔄 Next Steps:")
                print("1. Set these environment variables")
                print("2. Restart the RAG system")
                print("3. Test SSO login at /api/v1/sso/providers")
                
                save = input("\nSave configuration to file? (y/n): ").lower().strip()
                if save in ['y', 'yes']:
                    filename = input("Enter filename (press Enter for .env.sso): ").strip()
                    if not filename:
                        filename = ".env.sso"
                    generate_configuration_file(config, filename)
                
        except KeyboardInterrupt:
            print("\n\n👋 Configuration cancelled.")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again.")

if __name__ == "__main__":
    main()