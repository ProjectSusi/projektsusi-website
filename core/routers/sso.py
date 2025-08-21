"""
Single Sign-On (SSO) API Routes
Handles SAML and OIDC authentication flows
"""

import logging
from typing import Optional, Dict, Any
from urllib.parse import quote, unquote

from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from ..services.sso_service import SSOService, SSOProvider
from ..services.auth_service import AuthenticationService
from ..repositories.interfaces import IUserRepository
from ..repositories.models import User
from ..di.services import get_container
from ..middleware import TenantContext
from ..routers.auth import get_current_user

logger = logging.getLogger(__name__)

# Pydantic models
class SSOInitiateRequest(BaseModel):
    provider: str
    tenant_id: Optional[int] = None

class SSOLinkRequest(BaseModel):
    provider: str

class SSOProviderResponse(BaseModel):
    name: str
    type: str
    enabled: bool
    login_url: str

class SSOStatusResponse(BaseModel):
    linked_providers: list[str]
    available_providers: list[SSOProviderResponse]

# Router
router = APIRouter(prefix="/api/v1/sso", tags=["sso"])


def get_sso_service() -> SSOService:
    """Get SSO service from DI container"""
    container = get_container()
    user_repo = container.get(IUserRepository)
    
    # Get auth service
    auth_service = AuthenticationService(user_repo)
    
    return SSOService(user_repo, auth_service)


# SSO Endpoints

@router.get("/providers", response_model=list[SSOProviderResponse])
async def get_sso_providers(
    sso_service: SSOService = Depends(get_sso_service)
):
    """Get available SSO providers"""
    try:
        providers = sso_service.get_available_providers()
        
        response = []
        for provider in providers:
            response.append(SSOProviderResponse(
                name=provider.name,
                type=provider.type,
                enabled=provider.enabled,
                login_url=f"/api/v1/sso/{provider.type}/login"
            ))
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to get SSO providers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get SSO providers"
        )


@router.post("/initiate")
async def initiate_sso_login(
    request: SSOInitiateRequest,
    sso_service: SSOService = Depends(get_sso_service)
):
    """Initiate SSO login with specified provider"""
    try:
        tenant_id = request.tenant_id or TenantContext.get_current_tenant_id()
        
        auth_url = sso_service.initiate_sso_login(request.provider, tenant_id)
        
        return {"auth_url": auth_url}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to initiate SSO login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate SSO login"
        )


# SAML Endpoints

@router.get("/saml/login")
async def saml_login(
    tenant_id: Optional[int] = None,
    sso_service: SSOService = Depends(get_sso_service)
):
    """Initiate SAML login"""
    try:
        if not tenant_id:
            tenant_id = TenantContext.get_current_tenant_id()
        
        auth_url = sso_service.initiate_sso_login('saml', tenant_id)
        
        return RedirectResponse(url=auth_url, status_code=302)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to initiate SAML login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate SAML login"
        )


@router.post("/saml/acs")
async def saml_acs(
    request: Request,
    SAMLResponse: str = Form(...),
    RelayState: Optional[str] = Form(None),
    sso_service: SSOService = Depends(get_sso_service)
):
    """SAML Assertion Consumer Service (ACS)"""
    try:
        callback_data = {
            'SAMLResponse': SAMLResponse,
            'RelayState': RelayState
        }
        
        success, message, user = await sso_service.process_sso_callback('saml', callback_data)
        
        if success and user:
            # Create JWT token for successful SSO login
            container = get_container()
            auth_service = container.get(AuthenticationService)
            
            # Generate JWT token
            access_token = auth_service.create_access_token(
                user_id=user.id,
                username=user.username,
                role=user.role,
                tenant_id=user.tenant_id,
                mfa_verified=True  # SSO users are considered MFA verified
            )
            
            refresh_token = auth_service.create_refresh_token(
                user_id=user.id,
                username=user.username
            )
            
            return {
                "success": True,
                "message": message,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "tenant_id": user.tenant_id
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=message or "SAML authentication failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SAML ACS error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SAML authentication processing failed"
        )


@router.get("/saml/metadata")
async def saml_metadata():
    """SAML Service Provider metadata"""
    try:
        # Generate SAML metadata XML
        entity_id = "projectsusi-rag"  # Should come from config
        acs_url = "/api/v1/sso/saml/acs"  # Should be full URL
        
        metadata_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor 
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="{entity_id}">
    <md:SPSSODescriptor 
        AuthnRequestsSigned="false" 
        WantAssertionsSigned="true" 
        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <!-- Certificate would go here -->
        </md:KeyDescriptor>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:AssertionConsumerService 
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
            Location="{acs_url}" 
            index="1" 
            isDefault="true"/>
    </md:SPSSODescriptor>
</md:EntityDescriptor>"""
        
        return HTMLResponse(
            content=metadata_xml,
            media_type="application/xml"
        )
        
    except Exception as e:
        logger.error(f"Failed to generate SAML metadata: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate SAML metadata"
        )


# OIDC Endpoints

@router.get("/oidc/login")
async def oidc_login(
    tenant_id: Optional[int] = None,
    sso_service: SSOService = Depends(get_sso_service)
):
    """Initiate OIDC login"""
    try:
        if not tenant_id:
            tenant_id = TenantContext.get_current_tenant_id()
        
        auth_url = sso_service.initiate_sso_login('oidc', tenant_id)
        
        return RedirectResponse(url=auth_url, status_code=302)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to initiate OIDC login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate OIDC login"
        )


@router.get("/oidc/callback")
async def oidc_callback(
    request: Request,
    sso_service: SSOService = Depends(get_sso_service)
):
    """OIDC callback endpoint"""
    try:
        # Get query parameters
        query_params = dict(request.query_params)
        
        success, message, user = await sso_service.process_sso_callback('oidc', query_params)
        
        if success and user:
            # Create JWT token for successful SSO login
            container = get_container()
            auth_service = container.get(AuthenticationService)
            
            # Generate JWT token
            access_token = auth_service.create_access_token(
                user_id=user.id,
                username=user.username,
                role=user.role,
                tenant_id=user.tenant_id,
                mfa_verified=True  # SSO users are considered MFA verified
            )
            
            refresh_token = auth_service.create_refresh_token(
                user_id=user.id,
                username=user.username
            )
            
            return {
                "success": True,
                "message": message,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "tenant_id": user.tenant_id
                }
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=message or "OIDC authentication failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OIDC callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OIDC authentication processing failed"
        )


# User Account Linking

@router.get("/status", response_model=SSOStatusResponse)
async def get_sso_status(
    current_user: User = Depends(get_current_user),
    sso_service: SSOService = Depends(get_sso_service)
):
    """Get user's SSO status and available providers"""
    try:
        # Get linked providers from user metadata
        linked_providers = []
        for key in current_user.metadata.keys():
            if key.startswith('sso_') and key.endswith('_id'):
                provider = key.replace('sso_', '').replace('_id', '')
                linked_providers.append(provider)
        
        # Get available providers
        available_providers = []
        providers = sso_service.get_available_providers()
        
        for provider in providers:
            available_providers.append(SSOProviderResponse(
                name=provider.name,
                type=provider.type,
                enabled=provider.enabled,
                login_url=f"/api/v1/sso/{provider.type}/link"
            ))
        
        return SSOStatusResponse(
            linked_providers=linked_providers,
            available_providers=available_providers
        )
        
    except Exception as e:
        logger.error(f"Failed to get SSO status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get SSO status"
        )


@router.post("/link")
async def link_sso_account(
    request: SSOLinkRequest,
    current_user: User = Depends(get_current_user),
    sso_service: SSOService = Depends(get_sso_service)
):
    """Initiate linking current account with SSO provider"""
    try:
        # This would typically redirect to SSO provider with special state
        # indicating this is a linking operation
        tenant_id = current_user.tenant_id
        
        # Add user ID to state for linking
        import secrets
        state = f"link:{current_user.id}:{tenant_id}:{secrets.token_urlsafe(16)}"
        
        if request.provider == 'saml':
            auth_url = sso_service.initiate_sso_login('saml', tenant_id)
        elif request.provider == 'oidc':
            auth_url = sso_service.initiate_sso_login('oidc', tenant_id)
        else:
            raise ValueError(f"Unsupported provider: {request.provider}")
        
        return {"auth_url": auth_url, "message": "Redirect to SSO provider to link account"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to initiate account linking: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate account linking"
        )


@router.delete("/link/{provider}")
async def unlink_sso_account(
    provider: str,
    current_user: User = Depends(get_current_user),
    sso_service: SSOService = Depends(get_sso_service)
):
    """Unlink SSO provider from current account"""
    try:
        success = await sso_service.unlink_sso_account(current_user.id, provider)
        
        if success:
            return {"message": f"Successfully unlinked {provider} account"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No {provider} account linked"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to unlink SSO account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unlink SSO account"
        )


# Admin Endpoints

@router.get("/admin/providers")
async def admin_get_sso_providers(
    current_user: User = Depends(get_current_user),
    sso_service: SSOService = Depends(get_sso_service)
):
    """Get SSO provider configuration (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        providers = sso_service.get_available_providers()
        
        return {
            "providers": [
                {
                    "name": p.name,
                    "type": p.type,
                    "enabled": p.enabled,
                    "config_keys": list(p.config.keys())  # Don't expose values
                }
                for p in providers
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get SSO provider config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get SSO provider configuration"
        )