#!/usr/bin/env python3
"""
Test SSO Integration
Comprehensive test of SAML and OIDC SSO functionality
"""
import os
import requests
import json
import time
from typing import Dict, List, Any, Optional

# API endpoint
BASE_URL = "http://localhost:8000"

def check_sso_status():
    """Check if SSO service is available and configured"""
    print("=== Checking SSO Service Status ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/sso/providers")
        if response.status_code == 200:
            providers = response.json()
            print(f"✅ SSO service is available")
            print(f"   Found {len(providers)} configured providers:")
            
            for provider in providers:
                print(f"   📡 {provider.get('name', 'Unknown')} ({provider.get('type', 'unknown')})")
                print(f"      Enabled: {provider.get('enabled', False)}")
                print(f"      Login URL: {provider.get('login_url', 'N/A')}")
                print()
            
            return True, providers
        else:
            print(f"❌ SSO service check failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, []
    except Exception as e:
        print(f"❌ Error checking SSO status: {e}")
        return False, []

def test_sso_initiate():
    """Test SSO login initiation"""
    print("\n=== Testing SSO Login Initiation ===")
    
    results = {}
    
    # Test SAML initiation
    print("1. Testing SAML login initiation...")
    try:
        response = requests.post(f"{BASE_URL}/api/v1/sso/initiate", json={
            "provider": "saml",
            "tenant_id": 1
        })
        
        if response.status_code == 200:
            result = response.json()
            auth_url = result.get('auth_url')
            print(f"   ✅ SAML initiation successful")
            print(f"      Auth URL: {auth_url[:100]}..." if len(auth_url) > 100 else f"      Auth URL: {auth_url}")
            results['saml'] = {'success': True, 'auth_url': auth_url}
        else:
            print(f"   ❌ SAML initiation failed: {response.status_code}")
            print(f"      Error: {response.text}")
            results['saml'] = {'success': False, 'error': response.text}
    except Exception as e:
        print(f"   ❌ SAML initiation error: {e}")
        results['saml'] = {'success': False, 'error': str(e)}
    
    # Test OIDC initiation
    print("\n2. Testing OIDC login initiation...")
    try:
        response = requests.post(f"{BASE_URL}/api/v1/sso/initiate", json={
            "provider": "oidc",
            "tenant_id": 1
        })
        
        if response.status_code == 200:
            result = response.json()
            auth_url = result.get('auth_url')
            print(f"   ✅ OIDC initiation successful")
            print(f"      Auth URL: {auth_url[:100]}..." if len(auth_url) > 100 else f"      Auth URL: {auth_url}")
            results['oidc'] = {'success': True, 'auth_url': auth_url}
        else:
            print(f"   ❌ OIDC initiation failed: {response.status_code}")
            print(f"      Error: {response.text}")
            results['oidc'] = {'success': False, 'error': response.text}
    except Exception as e:
        print(f"   ❌ OIDC initiation error: {e}")
        results['oidc'] = {'success': False, 'error': str(e)}
    
    return results

def test_direct_sso_endpoints():
    """Test direct SSO login endpoints"""
    print("\n=== Testing Direct SSO Endpoints ===")
    
    results = {}
    
    # Test direct SAML login
    print("1. Testing direct SAML login endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/sso/saml/login", allow_redirects=False)
        
        if response.status_code in [302, 307]:
            redirect_url = response.headers.get('Location', '')
            print(f"   ✅ SAML direct login successful (redirect)")
            print(f"      Redirect URL: {redirect_url[:100]}..." if len(redirect_url) > 100 else f"      Redirect URL: {redirect_url}")
            results['saml_direct'] = {'success': True, 'redirect_url': redirect_url}
        elif response.status_code == 400:
            print(f"   ⚠️ SAML not configured (expected if no SAML provider)")
            results['saml_direct'] = {'success': False, 'not_configured': True}
        else:
            print(f"   ❌ SAML direct login failed: {response.status_code}")
            print(f"      Error: {response.text}")
            results['saml_direct'] = {'success': False, 'error': response.text}
    except Exception as e:
        print(f"   ❌ SAML direct login error: {e}")
        results['saml_direct'] = {'success': False, 'error': str(e)}
    
    # Test direct OIDC login
    print("\n2. Testing direct OIDC login endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/sso/oidc/login", allow_redirects=False)
        
        if response.status_code in [302, 307]:
            redirect_url = response.headers.get('Location', '')
            print(f"   ✅ OIDC direct login successful (redirect)")
            print(f"      Redirect URL: {redirect_url[:100]}..." if len(redirect_url) > 100 else f"      Redirect URL: {redirect_url}")
            results['oidc_direct'] = {'success': True, 'redirect_url': redirect_url}
        elif response.status_code == 400:
            print(f"   ⚠️ OIDC not configured (expected if no OIDC provider)")
            results['oidc_direct'] = {'success': False, 'not_configured': True}
        else:
            print(f"   ❌ OIDC direct login failed: {response.status_code}")
            print(f"      Error: {response.text}")
            results['oidc_direct'] = {'success': False, 'error': response.text}
    except Exception as e:
        print(f"   ❌ OIDC direct login error: {e}")
        results['oidc_direct'] = {'success': False, 'error': str(e)}
    
    return results

def test_saml_metadata():
    """Test SAML metadata endpoint"""
    print("\n=== Testing SAML Metadata ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/sso/saml/metadata")
        
        if response.status_code == 200:
            metadata = response.text
            print(f"✅ SAML metadata retrieved successfully")
            print(f"   Content type: {response.headers.get('content-type', 'unknown')}")
            print(f"   Metadata length: {len(metadata)} characters")
            
            # Check for key SAML metadata elements
            if 'EntityDescriptor' in metadata:
                print("   ✅ Contains EntityDescriptor")
            if 'SPSSODescriptor' in metadata:
                print("   ✅ Contains SPSSODescriptor")
            if 'AssertionConsumerService' in metadata:
                print("   ✅ Contains AssertionConsumerService")
            
            # Show first few lines of metadata
            lines = metadata.split('\n')[:5]
            print("   First few lines:")
            for line in lines:
                if line.strip():
                    print(f"     {line.strip()}")
            
            return True, metadata
        else:
            print(f"❌ SAML metadata failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ SAML metadata error: {e}")
        return False, None

def test_sso_configuration_validation():
    """Test SSO configuration validation"""
    print("\n=== SSO Configuration Validation ===")
    
    try:
        from core.utils.sso_providers import validate_sso_configuration
        
        validation = validate_sso_configuration()
        
        print(f"✅ SSO configuration validation completed")
        print(f"   SSO Enabled: {validation.get('sso_enabled', False)}")
        print(f"   Status: {validation.get('status', 'unknown')}")
        
        providers = validation.get('providers', {})
        print(f"   Configured providers: {len(providers)}")
        
        for provider_name, config in providers.items():
            print(f"   📡 {provider_name.upper()}:")
            print(f"      Enabled: {config.get('enabled', False)}")
            if provider_name == 'saml':
                print(f"      Has SSO URL: {bool(config.get('sso_url'))}")
                print(f"      Has Certificate: {config.get('has_certificate', False)}")
            elif provider_name == 'oidc':
                print(f"      Has Credentials: {config.get('client_id', False) and config.get('client_secret', False)}")
                print(f"      Has Discovery URL: {bool(config.get('discovery_url'))}")
        
        issues = validation.get('issues', [])
        if issues:
            print(f"   ⚠️ Configuration issues ({len(issues)}):")
            for issue in issues:
                print(f"     - {issue}")
        
        recommendations = validation.get('recommendations', [])
        if recommendations:
            print(f"   💡 Recommendations ({len(recommendations)}):")
            for rec in recommendations:
                print(f"     - {rec}")
        
        return validation
        
    except Exception as e:
        print(f"❌ Configuration validation error: {e}")
        return None

def test_sso_admin_endpoints():
    """Test SSO admin endpoints (requires authentication)"""
    print("\n=== Testing SSO Admin Endpoints ===")
    
    # First, try to get admin providers without auth (should fail)
    print("1. Testing admin providers endpoint (without auth)...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/sso/admin/providers")
        
        if response.status_code == 401:
            print("   ✅ Admin endpoint properly protected (401 Unauthorized)")
        elif response.status_code == 403:
            print("   ✅ Admin endpoint properly protected (403 Forbidden)")
        else:
            print(f"   ⚠️ Unexpected response: {response.status_code}")
            if response.status_code == 200:
                providers = response.json()
                print(f"      Retrieved {len(providers.get('providers', []))} provider configs")
    except Exception as e:
        print(f"   ❌ Admin endpoint test error: {e}")

def generate_sso_setup_examples():
    """Generate SSO setup examples"""
    print("\n=== SSO Setup Examples ===")
    
    try:
        from core.utils.sso_providers import create_sso_configuration_examples, get_sso_setup_guide
        
        examples = create_sso_configuration_examples()
        setup_guide = get_sso_setup_guide()
        
        print("Available SSO provider examples:")
        for provider_name in examples.keys():
            print(f"   📋 {provider_name}")
        
        print(f"\nSetup guide includes:")
        print(f"   • Supported protocols: {', '.join(setup_guide['supported_protocols'])}")
        print(f"   • Popular providers: {', '.join(setup_guide['popular_providers'])}")
        
        # Show one example
        if 'google_oidc' in examples:
            print(f"\nExample: Google OIDC configuration:")
            google_config = examples['google_oidc']
            for key, value in google_config.items():
                # Mask sensitive values
                display_value = value if 'SECRET' not in key else f"{value[:10]}...***"
                print(f"   export {key}='{display_value}'")
        
        return examples, setup_guide
        
    except Exception as e:
        print(f"❌ Setup examples error: {e}")
        return None, None

def test_environment_detection():
    """Test environment-based SSO configuration detection"""
    print("\n=== Environment Configuration Detection ===")
    
    detected_configs = []
    
    # Check current environment variables
    env_vars = [
        'SSO_ENABLED', 'SAML_ENABLED', 'OIDC_ENABLED',
        'SAML_SSO_URL', 'SAML_ENTITY_ID',
        'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_DISCOVERY_URL',
        'GOOGLE_CLIENT_ID', 'MICROSOFT_TENANT_ID', 'AUTH0_DOMAIN'
    ]
    
    print("Current SSO environment variables:")
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            display_value = value if 'SECRET' not in var and 'CLIENT_SECRET' not in var else f"{value[:8]}...***"
            print(f"   ✅ {var}={display_value}")
            detected_configs.append(var)
        else:
            print(f"   ⚪ {var}=(not set)")
    
    if detected_configs:
        print(f"\n✅ Found {len(detected_configs)} SSO configuration variables")
    else:
        print("\n⚠️ No SSO configuration variables detected")
        print("   To enable SSO, set the appropriate environment variables")
    
    return detected_configs

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("❌ Server is not running properly. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Please start the server first.")
        exit(1)
    
    print("=== SSO Integration Test ===")
    
    # Run comprehensive SSO tests
    service_available, providers = check_sso_status()
    initiation_results = test_sso_initiate()
    direct_results = test_direct_sso_endpoints()
    saml_metadata_success, metadata = test_saml_metadata()
    config_validation = test_sso_configuration_validation()
    test_sso_admin_endpoints()
    examples, setup_guide = generate_sso_setup_examples()
    env_configs = test_environment_detection()
    
    # Summary
    print("\n=== SSO Integration Test Summary ===")
    print(f"✅ Service availability: {service_available}")
    print(f"✅ Configured providers: {len(providers)}")
    
    # Initiation test results
    saml_init_success = initiation_results.get('saml', {}).get('success', False)
    oidc_init_success = initiation_results.get('oidc', {}).get('success', False)
    print(f"✅ SAML initiation: {saml_init_success}")
    print(f"✅ OIDC initiation: {oidc_init_success}")
    
    # Direct endpoint results
    saml_direct_success = direct_results.get('saml_direct', {}).get('success', False)
    oidc_direct_success = direct_results.get('oidc_direct', {}).get('success', False)
    print(f"✅ SAML direct login: {saml_direct_success}")
    print(f"✅ OIDC direct login: {oidc_direct_success}")
    
    print(f"✅ SAML metadata: {saml_metadata_success}")
    print(f"✅ Configuration validation: {config_validation is not None}")
    print(f"✅ Setup examples: {examples is not None}")
    print(f"✅ Environment configs found: {len(env_configs)}")
    
    # Overall assessment
    if not service_available:
        print(f"\n⚠️ SSO service is not properly available")
    elif len(providers) == 0:
        print(f"\n⚠️ SSO service is available but no providers are configured")
        print("   To configure SSO providers, set the appropriate environment variables:")
        print("   • For SAML: SAML_ENABLED=true, SAML_SSO_URL=your-saml-url")
        print("   • For OIDC: OIDC_ENABLED=true, OIDC_CLIENT_ID=your-id, OIDC_CLIENT_SECRET=your-secret")
    elif not (saml_init_success or oidc_init_success):
        print(f"\n⚠️ SSO providers configured but initiation failing")
        print("   Check provider configuration and network connectivity")
    else:
        print(f"\n🎉 SSO integration is working properly!")
        
        working_protocols = []
        if saml_init_success:
            working_protocols.append('SAML')
        if oidc_init_success:
            working_protocols.append('OIDC')
        
        print(f"   Working protocols: {', '.join(working_protocols)}")
        print(f"   {len(providers)} provider(s) configured and functional")
    
    print("\nSSO Endpoints for manual testing:")
    print(f"  - Available providers: {BASE_URL}/api/v1/sso/providers")
    print(f"  - SAML login: {BASE_URL}/api/v1/sso/saml/login")
    print(f"  - OIDC login: {BASE_URL}/api/v1/sso/oidc/login")
    print(f"  - SAML metadata: {BASE_URL}/api/v1/sso/saml/metadata")
    
    if config_validation and config_validation.get('issues'):
        print("\n⚠️ Configuration issues found:")
        for issue in config_validation['issues']:
            print(f"  • {issue}")
    
    if config_validation and config_validation.get('recommendations'):
        print("\n💡 Configuration recommendations:")
        for rec in config_validation['recommendations']:
            print(f"  • {rec}")