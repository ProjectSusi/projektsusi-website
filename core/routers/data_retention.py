"""
Data Retention Management API
REST endpoints for data lifecycle and retention policy management
"""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

from ..services.data_retention_service import (
    DataRetentionService, 
    RetentionPolicy, 
    DataCategory,
    RetentionStatus,
    RetentionReport,
    get_retention_service
)
from ..middleware.auth_middleware import require_authentication, require_admin_role
from ..repositories.models import User

logger = logging.getLogger(__name__)

# Pydantic models for API

class RetentionPolicyRequest(BaseModel):
    """Request model for creating/updating retention policy"""
    category: str = Field(..., description="Data category")
    retention_days: int = Field(..., ge=-1, description="Retention period in days (-1 for permanent)")
    auto_delete: bool = Field(default=True, description="Enable automatic deletion")
    archive_before_delete: bool = Field(default=False, description="Archive before deletion")
    legal_hold_override: bool = Field(default=False, description="Override legal holds")
    tenant_specific: bool = Field(default=False, description="Tenant-specific policy")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")


class RetentionPolicyResponse(BaseModel):
    """Response model for retention policy"""
    category: str
    retention_days: int
    auto_delete: bool
    archive_before_delete: bool
    legal_hold_override: bool
    tenant_specific: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class RetentionStatusResponse(BaseModel):
    """Response model for retention status"""
    entity_id: str
    entity_type: str
    category: str
    created_at: str
    retention_until: Optional[str] = None
    days_until_expiry: int
    is_expired: bool
    is_archived: bool
    legal_hold: bool = False
    tenant_id: int


class RetentionReportResponse(BaseModel):
    """Response model for retention report"""
    report_date: str
    total_entities: int
    expiring_soon: int
    expired: int
    deleted: int
    archived: int
    legal_holds: int
    categories: Dict[str, int]
    tenants: Dict[int, int]
    recommendations: List[str]


class CleanupRequest(BaseModel):
    """Request model for data cleanup"""
    dry_run: bool = Field(default=True, description="Run without making changes")
    category: Optional[str] = Field(default=None, description="Specific data category to clean")
    tenant_id: Optional[int] = Field(default=None, description="Specific tenant")


class CleanupResponse(BaseModel):
    """Response model for cleanup results"""
    examined: int
    archived: int
    deleted: int
    skipped: int
    errors: int
    dry_run: bool


class LegalHoldRequest(BaseModel):
    """Request model for legal hold"""
    entity_id: str = Field(..., description="Entity ID to hold")
    reason: Optional[str] = Field(default="", description="Reason for legal hold")


# Router
router = APIRouter(prefix="/api/v1/data-retention", tags=["Data Retention"])


# Policy Management Endpoints

@router.get("/policies", response_model=List[RetentionPolicyResponse])
async def get_retention_policies(
    current_user: User = Depends(require_authentication),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Get all retention policies"""
    try:
        policies = []
        
        for category, policy in retention_service.policies.items():
            policies.append(RetentionPolicyResponse(
                category=category.value,
                retention_days=policy.retention_days,
                auto_delete=policy.auto_delete,
                archive_before_delete=policy.archive_before_delete,
                legal_hold_override=policy.legal_hold_override,
                tenant_specific=policy.tenant_specific,
                created_at=policy.created_at.isoformat() if policy.created_at else None,
                updated_at=policy.updated_at.isoformat() if policy.updated_at else None,
                metadata=policy.metadata
            ))
        
        return policies
        
    except Exception as e:
        logger.error(f"Failed to get retention policies: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve retention policies"
        )


@router.post("/policies", response_model=RetentionPolicyResponse)
async def create_retention_policy(
    policy_request: RetentionPolicyRequest,
    current_user: User = Depends(require_admin_role),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Create or update retention policy (admin only)"""
    try:
        # Validate category
        try:
            category = DataCategory(policy_request.category)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid data category: {policy_request.category}"
            )
        
        # Create policy
        policy = RetentionPolicy(
            category=category,
            retention_days=policy_request.retention_days,
            auto_delete=policy_request.auto_delete,
            archive_before_delete=policy_request.archive_before_delete,
            legal_hold_override=policy_request.legal_hold_override,
            tenant_specific=policy_request.tenant_specific,
            metadata=policy_request.metadata or {}
        )
        
        success = retention_service.add_retention_policy(policy)
        
        if success:
            # Save configuration
            retention_service.save_config_file()
            
            return RetentionPolicyResponse(
                category=category.value,
                retention_days=policy.retention_days,
                auto_delete=policy.auto_delete,
                archive_before_delete=policy.archive_before_delete,
                legal_hold_override=policy.legal_hold_override,
                tenant_specific=policy.tenant_specific,
                created_at=policy.created_at.isoformat() if policy.created_at else None,
                updated_at=policy.updated_at.isoformat() if policy.updated_at else None,
                metadata=policy.metadata
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create retention policy"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create retention policy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create retention policy"
        )


@router.get("/policies/{category}", response_model=RetentionPolicyResponse)
async def get_retention_policy(
    category: str,
    tenant_id: Optional[int] = None,
    current_user: User = Depends(require_authentication),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Get specific retention policy"""
    try:
        # Validate category
        try:
            data_category = DataCategory(category)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid data category: {category}"
            )
        
        policy = retention_service.get_retention_policy(data_category, tenant_id)
        
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No retention policy found for category: {category}"
            )
        
        return RetentionPolicyResponse(
            category=data_category.value,
            retention_days=policy.retention_days,
            auto_delete=policy.auto_delete,
            archive_before_delete=policy.archive_before_delete,
            legal_hold_override=policy.legal_hold_override,
            tenant_specific=policy.tenant_specific,
            created_at=policy.created_at.isoformat() if policy.created_at else None,
            updated_at=policy.updated_at.isoformat() if policy.updated_at else None,
            metadata=policy.metadata
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get retention policy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve retention policy"
        )


# Data Status and Management Endpoints

@router.get("/status/{entity_id}", response_model=RetentionStatusResponse)
async def get_retention_status(
    entity_id: str,
    entity_type: str,
    current_user: User = Depends(require_authentication),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Get retention status for specific entity"""
    try:
        status = await retention_service.get_retention_status(entity_id, entity_type)
        
        if not status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No retention status found for {entity_type} {entity_id}"
            )
        
        return RetentionStatusResponse(
            entity_id=status.entity_id,
            entity_type=status.entity_type,
            category=status.category.value,
            created_at=status.created_at.isoformat(),
            retention_until=status.retention_until.isoformat() if status.retention_until else None,
            days_until_expiry=status.days_until_expiry,
            is_expired=status.is_expired,
            is_archived=status.is_archived,
            legal_hold=status.legal_hold,
            tenant_id=status.tenant_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get retention status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve retention status"
        )


@router.get("/expired", response_model=List[RetentionStatusResponse])
async def get_expired_data(
    category: Optional[str] = None,
    tenant_id: Optional[int] = None,
    current_user: User = Depends(require_authentication),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Get all expired data"""
    try:
        # Validate category if provided
        data_category = None
        if category:
            try:
                data_category = DataCategory(category)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid data category: {category}"
                )
        
        expired_data = await retention_service.find_expired_data(data_category, tenant_id)
        
        return [
            RetentionStatusResponse(
                entity_id=status.entity_id,
                entity_type=status.entity_type,
                category=status.category.value,
                created_at=status.created_at.isoformat(),
                retention_until=status.retention_until.isoformat() if status.retention_until else None,
                days_until_expiry=status.days_until_expiry,
                is_expired=status.is_expired,
                is_archived=status.is_archived,
                legal_hold=status.legal_hold,
                tenant_id=status.tenant_id
            )
            for status in expired_data
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get expired data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expired data"
        )


# Data Cleanup Endpoints

@router.post("/cleanup", response_model=CleanupResponse)
async def cleanup_expired_data(
    cleanup_request: CleanupRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin_role),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Clean up expired data (admin only)"""
    try:
        # Validate category if provided
        data_category = None
        if cleanup_request.category:
            try:
                data_category = DataCategory(cleanup_request.category)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid data category: {cleanup_request.category}"
                )
        
        # Run cleanup
        if cleanup_request.dry_run:
            # Synchronous dry run
            results = await retention_service.cleanup_expired_data(
                dry_run=True, 
                category=data_category
            )
        else:
            # Asynchronous actual cleanup
            background_tasks.add_task(
                _background_cleanup,
                retention_service,
                data_category,
                current_user.username
            )
            
            # Return immediate response for background task
            results = {
                'examined': 0,
                'archived': 0,
                'deleted': 0,
                'skipped': 0,
                'errors': 0
            }
        
        return CleanupResponse(
            examined=results.get('examined', 0),
            archived=results.get('archived', 0),
            deleted=results.get('deleted', 0),
            skipped=results.get('skipped', 0),
            errors=results.get('errors', 0),
            dry_run=cleanup_request.dry_run
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cleanup expired data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup expired data"
        )


async def _background_cleanup(
    retention_service: DataRetentionService, 
    category: Optional[DataCategory],
    username: str
):
    """Background task for data cleanup"""
    try:
        logger.info(f"Starting background cleanup initiated by {username}")
        results = await retention_service.cleanup_expired_data(
            dry_run=False,
            category=category
        )
        logger.info(f"Background cleanup completed: {results}")
        
    except Exception as e:
        logger.error(f"Background cleanup failed: {e}")


# Reporting Endpoints

@router.get("/report", response_model=RetentionReportResponse)
async def get_retention_report(
    tenant_id: Optional[int] = None,
    current_user: User = Depends(require_authentication),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Generate retention report"""
    try:
        report = await retention_service.generate_retention_report(tenant_id)
        
        return RetentionReportResponse(
            report_date=report.report_date.isoformat(),
            total_entities=report.total_entities,
            expiring_soon=report.expiring_soon,
            expired=report.expired,
            deleted=report.deleted,
            archived=report.archived,
            legal_holds=report.legal_holds,
            categories=report.categories,
            tenants=report.tenants,
            recommendations=report.recommendations
        )
        
    except Exception as e:
        logger.error(f"Failed to generate retention report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate retention report"
        )


# Legal Hold Management

@router.post("/legal-holds")
async def add_legal_hold(
    legal_hold_request: LegalHoldRequest,
    current_user: User = Depends(require_admin_role),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Add legal hold to prevent deletion (admin only)"""
    try:
        success = retention_service.add_legal_hold(
            legal_hold_request.entity_id,
            legal_hold_request.reason
        )
        
        if success:
            retention_service.save_config_file()
            return {
                "message": f"Legal hold added for {legal_hold_request.entity_id}",
                "entity_id": legal_hold_request.entity_id,
                "reason": legal_hold_request.reason,
                "added_by": current_user.username
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add legal hold"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add legal hold: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add legal hold"
        )


@router.delete("/legal-holds/{entity_id}")
async def remove_legal_hold(
    entity_id: str,
    current_user: User = Depends(require_admin_role),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """Remove legal hold (admin only)"""
    try:
        success = retention_service.remove_legal_hold(entity_id)
        
        if success:
            retention_service.save_config_file()
            return {
                "message": f"Legal hold removed for {entity_id}",
                "entity_id": entity_id,
                "removed_by": current_user.username
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No legal hold found for {entity_id}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove legal hold: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove legal hold"
        )


@router.get("/legal-holds")
async def list_legal_holds(
    current_user: User = Depends(require_authentication),
    retention_service: DataRetentionService = Depends(get_retention_service)
):
    """List all legal holds"""
    try:
        return {
            "legal_holds": list(retention_service.legal_holds),
            "count": len(retention_service.legal_holds)
        }
        
    except Exception as e:
        logger.error(f"Failed to list legal holds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list legal holds"
        )


# Utility Endpoints

@router.get("/categories")
async def list_data_categories(
    current_user: User = Depends(require_authentication)
):
    """List all available data categories"""
    try:
        return {
            "categories": [
                {
                    "value": category.value,
                    "description": _get_category_description(category)
                }
                for category in DataCategory
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to list data categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list data categories"
        )


def _get_category_description(category: DataCategory) -> str:
    """Get description for data category"""
    descriptions = {
        DataCategory.PERSONAL_DATA: "Personal identifiers and contact information",
        DataCategory.FINANCIAL_DATA: "Financial records and transaction data",
        DataCategory.HEALTH_DATA: "Health and medical information",
        DataCategory.BEHAVIORAL_DATA: "User behavior and preference data",
        DataCategory.TECHNICAL_DATA: "System logs and technical information",
        DataCategory.COMMUNICATION_DATA: "Communication records and messages",
        DataCategory.DOCUMENT_CONTENT: "Document content and embeddings",
        DataCategory.USER_ACTIVITY: "User activity logs and access history",
        DataCategory.SYSTEM_LOGS: "Application and system logs",
        DataCategory.AUDIT_LOGS: "Audit and compliance logs"
    }
    
    return descriptions.get(category, "No description available")