#!/usr/bin/env python3
"""
Demo script for MFA authentication system
Shows complete authentication flow with MFA setup and verification
"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.repositories.user_repository import SQLiteUserRepository
from core.services.auth_service import AuthenticationService, UserRole


async def demo_mfa_system():
    """Demonstrate the complete MFA authentication system"""
    print("MFA Authentication System Demo")
    print("=" * 50)
    
    # Initialize services
    print("\n1. Initializing authentication system...")
    repo = SQLiteUserRepository(':memory:')
    auth_service = AuthenticationService(repo)
    print("Authentication service ready")
    
    # Register a user
    print("\n2. Registering new user...")
    success, message, user = await auth_service.register_user(
        username="demo_user",
        email="demo@example.com",
        password="secure_password_123",
        tenant_id=1,
        role=UserRole.USER
    )
    
    if success:
        print(f"User registered: {user.username} (ID: {user.id})")
    else:
        print(f"Registration failed: {message}")
        return
    
    # Test login without MFA
    print("\n3. Testing login without MFA...")
    login_result = await auth_service.login("demo_user", "secure_password_123")
    
    if login_result.success and not login_result.requires_mfa:
        print("Login successful without MFA")
        print(f"Access token: {login_result.access_token[:50]}...")
        
        # Verify token
        token_data = auth_service.verify_token(login_result.access_token)
        print(f"Token valid for user: {token_data.username}")
    else:
        print("FAIL Login failed")
    
    # Setup MFA
    print("\n4. Setting up MFA for user...")
    mfa_setup = await auth_service.setup_mfa(user.id)
    
    if mfa_setup:
        print("OK MFA setup successful")
        print(f"Secret: {mfa_setup.secret}")
        print(f"QR code length: {len(mfa_setup.qr_code_data_uri)} characters")
        print(f"Backup codes: {len(mfa_setup.backup_codes)} codes generated")
        print(f"First backup code: {mfa_setup.backup_codes[0]}")
    else:
        print("FAIL MFA setup failed")
        return
    
    # Simulate TOTP verification (normally user would scan QR code)
    print("\n5. Enabling MFA with verification code...")
    # For demo, we'll use a mock verification
    import pyotp
    totp = pyotp.TOTP(mfa_setup.secret)
    current_code = totp.now()
    print(f"Current TOTP code: {current_code}")
    
    mfa_enabled = await auth_service.enable_mfa(user.id, current_code)
    
    if mfa_enabled:
        print("OK MFA enabled successfully")
    else:
        print("FAIL MFA enable failed")
        return
    
    # Test login with MFA enabled
    print("\n6. Testing login with MFA enabled...")
    login_result = await auth_service.login("demo_user", "secure_password_123")
    
    if login_result.success and login_result.requires_mfa:
        print("OK Login initiated, MFA required")
        print(f"MFA token: {login_result.mfa_token[:50]}...")
    else:
        print("FAIL Login failed or MFA not required")
        return
    
    # Complete MFA verification
    print("\n7. Completing MFA verification...")
    new_code = totp.now()  # Get fresh code
    print(f"Using TOTP code: {new_code}")
    
    final_result = await auth_service.verify_mfa_and_complete_login(
        login_result.mfa_token, 
        new_code
    )
    
    if final_result.success:
        print("OK MFA verification successful")
        print(f"Final access token: {final_result.access_token[:50]}...")
        
        # Verify MFA token includes MFA verification
        token_data = auth_service.verify_token(final_result.access_token)
        print(f"Token MFA verified: {token_data.mfa_verified}")
    else:
        print(f"FAIL MFA verification failed: {final_result.message}")
        return
    
    # Test backup code
    print("\n8. Testing backup code authentication...")
    login_result2 = await auth_service.login("demo_user", "secure_password_123")
    
    if login_result2.success and login_result2.requires_mfa:
        backup_code = mfa_setup.backup_codes[0]  # Use first backup code
        print(f"Using backup code: {backup_code}")
        
        backup_result = await auth_service.verify_mfa_and_complete_login(
            login_result2.mfa_token,
            backup_code
        )
        
        if backup_result.success:
            print("OK Backup code authentication successful")
        else:
            print(f"FAIL Backup code failed: {backup_result.message}")
    
    # Test password change
    print("\n9. Testing password change...")
    change_result = await auth_service.change_password(
        user.id,
        "secure_password_123",
        "new_secure_password_456"
    )
    
    if change_result[0]:
        print("OK Password changed successfully")
        
        # Test login with new password
        new_login = await auth_service.login("demo_user", "new_secure_password_456")
        if new_login.success:
            print("OK Login with new password successful")
        else:
            print("FAIL Login with new password failed")
    else:
        print(f"FAIL Password change failed: {change_result[1]}")
    
    # Test token revocation
    print("\n10. Testing token revocation...")
    test_token = final_result.access_token
    
    # Verify token is valid
    valid_token = auth_service.verify_token(test_token)
    print(f"Token valid before revocation: {valid_token is not None}")
    
    # Revoke token
    revoked = auth_service.revoke_token(test_token)
    print(f"Token revocation successful: {revoked}")
    
    # Verify token is now invalid
    invalid_token = auth_service.verify_token(test_token)
    print(f"Token valid after revocation: {invalid_token is not None}")
    
    print("\nMFA Authentication Demo Complete!")
    print("Features demonstrated:")
    print("  - User registration")
    print("  - Password authentication")
    print("  - JWT token generation and verification")
    print("  - MFA setup with QR code generation")
    print("  - TOTP verification")
    print("  - Backup code generation and usage")
    print("  - Password changes")
    print("  - Token revocation")
    print("  - Multi-tenant support")
    print("  - Role-based authentication")


if __name__ == "__main__":
    asyncio.run(demo_mfa_system())