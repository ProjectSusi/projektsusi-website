#!/usr/bin/env python3
"""
Test MFA integration with API endpoints
"""
import os
import requests
import json
import time
from pathlib import Path
import tempfile

# API endpoint
BASE_URL = "http://localhost:8000"

def test_authentication_integration():
    """Test MFA authentication with actual API endpoints"""
    
    print("=== Testing MFA Authentication Integration ===")
    
    # 1. Register a new user
    print("\n1. Registering new user...")
    register_data = {
        "username": "testuser_mfa",
        "email": "testuser@example.com", 
        "password": "SecurePassword123!",
        "role": "user"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=register_data)
    if response.status_code == 200:
        print("✅ User registered successfully")
    else:
        print(f"Registration failed: {response.status_code}")
        print(response.json())
        return
    
    # 2. Login without MFA (should work)
    print("\n2. Testing login without MFA...")
    login_data = {
        "username": "testuser_mfa",
        "password": "SecurePassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    if response.status_code == 200:
        login_result = response.json()
        if login_result.get("access_token") and not login_result.get("requires_mfa"):
            print("✅ Login successful without MFA")
            access_token = login_result["access_token"]
        else:
            print("❌ Unexpected MFA requirement")
            return
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.json())
        return
    
    # 3. Test authenticated document upload
    print("\n3. Testing authenticated document upload...")
    
    # Create test document
    test_content = "This is a test document uploaded by authenticated user with MFA support."
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write(test_content)
        tmp_file_path = tmp_file.name
    
    try:
        # Upload with authentication
        headers = {"Authorization": f"Bearer {access_token}"}
        with open(tmp_file_path, 'rb') as f:
            files = {'file': ('test_auth_document.txt', f, 'text/plain')}
            response = requests.post(f"{BASE_URL}/api/v1/documents", files=files, headers=headers)
        
        if response.status_code == 200:
            upload_result = response.json()
            document_id = upload_result['id']
            print(f"✅ Authenticated document upload successful. ID: {document_id}")
        else:
            print(f"❌ Authenticated upload failed: {response.status_code}")
            print(response.json())
            return
    
    finally:
        os.unlink(tmp_file_path)
    
    # 4. Test authenticated query
    print("\n4. Testing authenticated query...")
    query_data = {
        "query": "test document uploaded by authenticated user"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data, headers=headers)
    if response.status_code == 200:
        query_result = response.json()
        print("✅ Authenticated query successful")
        print(f"Answer preview: {query_result['answer'][:100]}...")
    else:
        print(f"❌ Authenticated query failed: {response.status_code}")
        print(response.json())
    
    # 5. Setup MFA for the user
    print("\n5. Setting up MFA...")
    response = requests.post(f"{BASE_URL}/api/v1/auth/mfa/setup", headers=headers)
    
    if response.status_code == 200:
        mfa_setup = response.json()
        print("✅ MFA setup initiated")
        print(f"Secret key length: {len(mfa_setup['secret'])}")
        print(f"QR code data length: {len(mfa_setup['qr_code_data_uri'])}")
        print(f"Backup codes generated: {len(mfa_setup['backup_codes'])}")
        
        # For demo purposes, we'll generate a TOTP code
        import pyotp
        totp = pyotp.TOTP(mfa_setup['secret'])
        current_code = totp.now()
        print(f"Current TOTP code: {current_code}")
        
        # Enable MFA with the current code
        print("\n6. Enabling MFA...")
        enable_data = {"mfa_code": current_code}
        response = requests.post(f"{BASE_URL}/api/v1/auth/mfa/enable", json=enable_data, headers=headers)
        
        if response.status_code == 200:
            print("✅ MFA enabled successfully")
        else:
            print(f"❌ MFA enable failed: {response.status_code}")
            print(response.json())
            return
        
    else:
        print(f"❌ MFA setup failed: {response.status_code}")
        print(response.json())
        return
    
    # 7. Test login with MFA enabled
    print("\n7. Testing login with MFA enabled...")
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=login_data)
    
    if response.status_code == 200:
        login_result = response.json()
        if login_result.get("requires_mfa"):
            print("✅ Login requires MFA as expected")
            mfa_token = login_result["mfa_token"]
            
            # Complete MFA verification
            print("\n8. Completing MFA verification...")
            # Generate new TOTP code (codes change every 30 seconds)
            time.sleep(1)  # Ensure we get a fresh code
            current_code = totp.now()
            
            mfa_verify_data = {
                "mfa_token": mfa_token,
                "mfa_code": current_code
            }
            
            response = requests.post(f"{BASE_URL}/api/v1/auth/mfa/verify", json=mfa_verify_data)
            
            if response.status_code == 200:
                final_login = response.json()
                new_access_token = final_login["access_token"]
                print("✅ MFA verification successful")
                
                # Test authenticated request with MFA-verified token
                print("\n9. Testing request with MFA-verified token...")
                mfa_headers = {"Authorization": f"Bearer {new_access_token}"}
                query_data = {
                    "query": "document with MFA authentication"
                }
                
                response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data, headers=mfa_headers)
                if response.status_code == 200:
                    print("✅ MFA-authenticated query successful")
                else:
                    print(f"❌ MFA-authenticated query failed: {response.status_code}")
            
            else:
                print(f"❌ MFA verification failed: {response.status_code}")
                print(response.json())
        else:
            print("❌ MFA not required (unexpected)")
    else:
        print(f"❌ Login with MFA failed: {response.status_code}")
        print(response.json())
    
    print("\n=== MFA Authentication Test Complete ===")

def check_auth_status():
    """Check authentication status in the system"""
    print("\n=== Checking Authentication Status ===")
    
    response = requests.get(f"{BASE_URL}/api/v1/status")
    if response.status_code == 200:
        status = response.json()
        
        # Look for authentication information in configuration
        if 'configuration' in status:
            config = status['configuration']
            auth_enabled = config.get('auth_enabled', False)
            mfa_enabled = config.get('mfa_enabled', False)
            
            print(f"Authentication enabled: {auth_enabled}")
            print(f"MFA enabled: {mfa_enabled}")
            
            if auth_enabled:
                print("✅ Authentication is ENABLED")
                if mfa_enabled:
                    print("✅ MFA is ENABLED")
                else:
                    print("⚠️ MFA is DISABLED")
            else:
                print("❌ Authentication is DISABLED")
        else:
            print("⚠️ Could not determine authentication status from API")
    else:
        print(f"Failed to get status: {response.status_code}")

if __name__ == "__main__":
    # First check if the server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("Error: Server is not running. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("Error: Cannot connect to server. Please start the server first.")
        exit(1)
    
    # Check authentication status
    check_auth_status()
    
    # Run MFA integration test
    test_authentication_integration()