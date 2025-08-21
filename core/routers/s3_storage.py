"""
S3/MinIO Storage Management API
Provides endpoints for object storage operations
"""

import logging
from typing import Optional, Dict, Any
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from ..services.s3_storage_service import S3StorageService, get_s3_storage_service
from ..middleware.auth_middleware import require_authentication
from ..repositories.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/storage", tags=["S3 Storage"])


class StorageUploadResponse(BaseModel):
    """Response model for storage upload"""
    success: bool
    message: str
    object_key: str
    bucket: str
    file_size: int
    file_hash: str
    presigned_url: str
    upload_timestamp: str


class StorageStatsResponse(BaseModel):
    """Response model for storage statistics"""
    total_documents: int
    total_size_bytes: int
    total_size_mb: float
    document_types: Dict[str, int]
    bucket_name: str
    tenant_id: Optional[int] = None


class MigrationResponse(BaseModel):
    """Response model for migration operation"""
    success: bool
    message: str
    total_files: int
    migrated_files: int
    failed_files: int
    total_size: int
    errors: list


@router.post("/upload", response_model=StorageUploadResponse)
async def upload_document_to_storage(
    file: UploadFile = File(...),
    document_id: int = Form(...),
    document_type: str = Form(default="upload"),
    metadata: Optional[str] = Form(default=None),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Upload document to S3/MinIO storage"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        # Read file content
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Parse metadata if provided
        custom_metadata = {}
        if metadata:
            try:
                import json
                custom_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                logger.warning(f"Invalid metadata JSON: {metadata}")
        
        # Upload to storage
        result = storage_service.upload_document(
            tenant_id=current_user.tenant_id,
            document_id=document_id,
            filename=file.filename,
            file_content=content,
            metadata=custom_metadata,
            document_type=document_type
        )
        
        return StorageUploadResponse(
            success=True,
            message="Document uploaded successfully",
            object_key=result['object_key'],
            bucket=result['bucket'],
            file_size=result['file_size'],
            file_hash=result['file_hash'],
            presigned_url=result['presigned_url'],
            upload_timestamp=result['upload_timestamp'].isoformat()
        )
        
    except Exception as e:
        logger.error(f"Storage upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/download/{document_id}/{filename}")
async def download_document_from_storage(
    document_id: int,
    filename: str,
    document_type: str = Query(default="upload"),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Download document from S3/MinIO storage"""
    try:
        # Download from storage
        content, metadata = storage_service.download_document(
            tenant_id=current_user.tenant_id,
            document_id=document_id,
            filename=filename,
            document_type=document_type
        )
        
        # Return file as streaming response
        return StreamingResponse(
            iter([content]),
            media_type=metadata.get('content_type', 'application/octet-stream'),
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"',
                'Content-Length': str(len(content))
            }
        )
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Storage download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.delete("/delete/{document_id}/{filename}")
async def delete_document_from_storage(
    document_id: int,
    filename: str,
    document_type: str = Query(default="upload"),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Delete document from S3/MinIO storage"""
    try:
        success = storage_service.delete_document(
            tenant_id=current_user.tenant_id,
            document_id=document_id,
            filename=filename,
            document_type=document_type
        )
        
        if success:
            return {"success": True, "message": "Document deleted successfully"}
        else:
            return {"success": False, "message": "Document not found"}
            
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Storage deletion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")


@router.get("/list", response_model=list)
async def list_tenant_documents(
    document_type: Optional[str] = Query(default=None),
    max_keys: int = Query(default=1000, le=10000),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """List documents in storage for current tenant"""
    try:
        documents = storage_service.list_tenant_documents(
            tenant_id=current_user.tenant_id,
            document_type=document_type,
            max_keys=max_keys
        )
        
        return documents
        
    except Exception as e:
        logger.error(f"Storage listing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Listing failed: {str(e)}")


@router.get("/presigned-url/{document_id}/{filename}")
async def get_presigned_url(
    document_id: int,
    filename: str,
    expires_in: int = Query(default=3600, le=86400),  # Max 24 hours
    document_type: str = Query(default="upload"),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Generate presigned URL for temporary document access"""
    try:
        presigned_url = storage_service.generate_presigned_url(
            tenant_id=current_user.tenant_id,
            document_id=document_id,
            filename=filename,
            expires_in=expires_in,
            document_type=document_type
        )
        
        return {
            "presigned_url": presigned_url,
            "expires_in": expires_in,
            "document_id": document_id,
            "filename": filename
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        logger.error(f"Presigned URL generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"URL generation failed: {str(e)}")


@router.get("/stats", response_model=StorageStatsResponse)
async def get_storage_statistics(
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Get storage statistics for current tenant"""
    try:
        stats = storage_service.get_storage_stats(tenant_id=current_user.tenant_id)
        
        return StorageStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Storage stats failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stats retrieval failed: {str(e)}")


@router.post("/migrate", response_model=MigrationResponse)
async def migrate_from_local_storage(
    local_path: str = Form(...),
    dry_run: bool = Form(default=True),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Migrate documents from local file storage to S3/MinIO"""
    try:
        # Only admin users can perform migrations
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Migration requires admin privileges")
        
        # Validate local path
        if not Path(local_path).exists():
            raise HTTPException(status_code=400, detail=f"Local path does not exist: {local_path}")
        
        # Perform migration
        result = storage_service.migrate_from_local_storage(
            local_storage_path=local_path,
            tenant_id=current_user.tenant_id,
            dry_run=dry_run
        )
        
        action = "Would migrate" if dry_run else "Migrated"
        message = f"{action} {result['migrated_files']}/{result['total_files']} files"
        
        return MigrationResponse(
            success=result['failed_files'] == 0,
            message=message,
            total_files=result['total_files'],
            migrated_files=result['migrated_files'],
            failed_files=result['failed_files'],
            total_size=result['total_size'],
            errors=result['errors']
        )
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")


# Admin endpoints for global storage management
@router.get("/admin/stats", response_model=StorageStatsResponse)
async def get_global_storage_statistics(
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Get global storage statistics (admin only)"""
    try:
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        stats = storage_service.get_storage_stats()  # No tenant_id = global stats
        
        return StorageStatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Global storage stats failed: {e}")
        raise HTTPException(status_code=500, detail=f"Stats retrieval failed: {str(e)}")


@router.get("/admin/list", response_model=list)
async def list_all_documents(
    tenant_id: Optional[int] = Query(default=None),
    document_type: Optional[str] = Query(default=None),
    max_keys: int = Query(default=1000, le=10000),
    current_user: User = Depends(require_authentication),
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """List documents across tenants (admin only)"""
    try:
        if current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="Admin privileges required")
        
        # Use specified tenant_id or list all
        documents = storage_service.list_tenant_documents(
            tenant_id=tenant_id or current_user.tenant_id,
            document_type=document_type,
            max_keys=max_keys
        )
        
        return documents
        
    except Exception as e:
        logger.error(f"Admin listing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Listing failed: {str(e)}")


@router.get("/health")
async def storage_health_check(
    storage_service: S3StorageService = Depends(get_s3_storage_service)
):
    """Check S3/MinIO storage service health"""
    try:
        # Test bucket access
        storage_service.s3_client.head_bucket(Bucket=storage_service.bucket_name)
        
        return {
            "status": "healthy",
            "bucket": storage_service.bucket_name,
            "endpoint": storage_service.endpoint_url,
            "message": "S3/MinIO storage is accessible"
        }
        
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        return {
            "status": "unhealthy",
            "bucket": storage_service.bucket_name,
            "endpoint": storage_service.endpoint_url,
            "error": str(e),
            "message": "S3/MinIO storage is not accessible"
        }