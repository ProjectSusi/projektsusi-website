"""
Background Job Management API
Enhanced job scheduling, monitoring, and control endpoints
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, Field

from ..services.background_job_service import (
    BackgroundJobService, Job, JobStatus, JobPriority, JobResult,
    get_job_service
)
from ..middleware.auth_middleware import require_authentication, require_admin_role
from ..repositories.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/jobs", tags=["Background Jobs"])


# Pydantic models for API

class JobCreateRequest(BaseModel):
    """Request model for creating a job"""
    name: str = Field(..., description="Human-readable job name")
    function_name: str = Field(..., description="Registered function to execute")
    args: List[Any] = Field(default_factory=list, description="Function positional arguments")
    kwargs: Dict[str, Any] = Field(default_factory=dict, description="Function keyword arguments")
    priority: JobPriority = Field(default=JobPriority.NORMAL, description="Job priority level")
    scheduled_for: Optional[datetime] = Field(default=None, description="Schedule job for future execution")
    max_retries: int = Field(default=3, ge=0, le=10, description="Maximum retry attempts")
    timeout_seconds: Optional[int] = Field(default=None, ge=1, le=3600, description="Job timeout in seconds")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional job metadata")


class JobResponse(BaseModel):
    """Response model for job information"""
    id: str
    name: str
    function_name: str
    status: JobStatus
    priority: JobPriority
    tenant_id: Optional[int]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    scheduled_for: Optional[datetime]
    retry_count: int
    max_retries: int
    progress: Optional[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    result: Optional[Dict[str, Any]] = None


class JobStatisticsResponse(BaseModel):
    """Response model for job statistics"""
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    pending_jobs: int
    running_jobs: int
    active_workers: int
    max_workers: int
    service_running: bool


class JobProgressUpdate(BaseModel):
    """Request model for updating job progress"""
    percentage: int = Field(..., ge=0, le=100)
    message: str = Field(default="")
    data: Optional[Dict[str, Any]] = None


# API Endpoints

@router.post("/schedule", response_model=Dict[str, str])
async def schedule_job(
    job_request: JobCreateRequest,
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Schedule a new background job"""
    try:
        job_id = await job_service.schedule_job(
            name=job_request.name,
            function_name=job_request.function_name,
            args=job_request.args,
            kwargs=job_request.kwargs,
            priority=job_request.priority,
            tenant_id=current_user.tenant_id,
            scheduled_for=job_request.scheduled_for,
            max_retries=job_request.max_retries,
            timeout_seconds=job_request.timeout_seconds,
            metadata=job_request.metadata
        )
        
        return {"job_id": job_id, "message": "Job scheduled successfully"}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to schedule job: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule job")


@router.get("/status/{job_id}", response_model=JobResponse)
async def get_job_status(
    job_id: str,
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Get job status and details"""
    try:
        job = await job_service.get_job_status(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check tenant access (users can only see their own jobs, admins can see all)
        if current_user.role != 'admin' and job.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Convert Job to response model
        return JobResponse(
            id=job.id,
            name=job.name,
            function_name=job.function_name,
            status=job.status,
            priority=job.priority,
            tenant_id=job.tenant_id,
            created_at=job.created_at,
            started_at=job.started_at,
            completed_at=job.completed_at,
            scheduled_for=job.scheduled_for,
            retry_count=job.retry_count,
            max_retries=job.max_retries,
            progress=job.progress,
            metadata=job.metadata,
            result=job.result.__dict__ if job.result else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job status")


@router.put("/progress/{job_id}")
async def update_job_progress(
    job_id: str,
    progress_update: JobProgressUpdate,
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Update job progress (typically called by the job itself)"""
    try:
        # Verify job exists and user has access
        job = await job_service.get_job_status(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if current_user.role != 'admin' and job.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await job_service.update_job_progress(
            job_id=job_id,
            percentage=progress_update.percentage,
            message=progress_update.message,
            data=progress_update.data
        )
        
        if success:
            return {"message": "Progress updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update progress")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update job progress {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update job progress")


@router.post("/cancel/{job_id}")
async def cancel_job(
    job_id: str,
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Cancel a pending or running job"""
    try:
        # Verify job exists and user has access
        job = await job_service.get_job_status(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if current_user.role != 'admin' and job.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await job_service.cancel_job(job_id)
        
        if success:
            return {"message": "Job cancelled successfully"}
        else:
            return {"message": "Job cannot be cancelled (may already be completed)"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel job")


@router.post("/retry/{job_id}")
async def retry_job(
    job_id: str,
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Retry a failed job"""
    try:
        # Verify job exists and user has access
        job = await job_service.get_job_status(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if current_user.role != 'admin' and job.tenant_id != current_user.tenant_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await job_service.retry_job(job_id)
        
        if success:
            return {"message": "Job retry scheduled successfully"}
        else:
            return {"message": "Job cannot be retried (not failed or max retries exceeded)"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retry job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retry job")


@router.get("/list", response_model=List[JobResponse])
async def list_jobs(
    status: Optional[JobStatus] = Query(default=None, description="Filter by job status"),
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of jobs to return"),
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """List jobs for current user (or all jobs for admin)"""
    try:
        if current_user.role == 'admin':
            # Admin can see all jobs
            jobs = await job_service.get_job_history(
                tenant_id=None,
                status=status,
                limit=limit
            )
        else:
            # Regular users see only their tenant's jobs
            jobs = await job_service.get_job_history(
                tenant_id=current_user.tenant_id,
                status=status,
                limit=limit
            )
        
        # Convert to response models
        return [
            JobResponse(
                id=job.id,
                name=job.name,
                function_name=job.function_name,
                status=job.status,
                priority=job.priority,
                tenant_id=job.tenant_id,
                created_at=job.created_at,
                started_at=job.started_at,
                completed_at=job.completed_at,
                scheduled_for=job.scheduled_for,
                retry_count=job.retry_count,
                max_retries=job.max_retries,
                progress=job.progress,
                metadata=job.metadata,
                result=job.result.__dict__ if job.result else None
            )
            for job in jobs
        ]
        
    except Exception as e:
        logger.error(f"Failed to list jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job list")


@router.get("/statistics", response_model=JobStatisticsResponse)
async def get_job_statistics(
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Get job service statistics"""
    try:
        stats = await job_service.get_statistics()
        
        return JobStatisticsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Failed to get job statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


# Admin-only endpoints

@router.post("/admin/cleanup")
async def cleanup_old_jobs(
    older_than_days: int = Query(default=7, ge=1, le=365, description="Remove jobs older than N days"),
    current_user: User = Depends(require_admin_role),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Clean up old completed/failed jobs (admin only)"""
    try:
        removed_count = await job_service.cleanup_old_jobs(older_than_days)
        
        return {
            "message": f"Cleaned up {removed_count} old jobs",
            "removed_count": removed_count,
            "older_than_days": older_than_days
        }
        
    except Exception as e:
        logger.error(f"Failed to cleanup old jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to cleanup old jobs")


@router.get("/admin/all", response_model=List[JobResponse])
async def list_all_jobs(
    status: Optional[JobStatus] = Query(default=None),
    tenant_id: Optional[int] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    current_user: User = Depends(require_admin_role),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """List all jobs across all tenants (admin only)"""
    try:
        jobs = await job_service.get_job_history(
            tenant_id=tenant_id,
            status=status,
            limit=limit
        )
        
        return [
            JobResponse(
                id=job.id,
                name=job.name,
                function_name=job.function_name,
                status=job.status,
                priority=job.priority,
                tenant_id=job.tenant_id,
                created_at=job.created_at,
                started_at=job.started_at,
                completed_at=job.completed_at,
                scheduled_for=job.scheduled_for,
                retry_count=job.retry_count,
                max_retries=job.max_retries,
                progress=job.progress,
                metadata=job.metadata,
                result=job.result.__dict__ if job.result else None
            )
            for job in jobs
        ]
        
    except Exception as e:
        logger.error(f"Failed to list all jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job list")


@router.post("/admin/cancel-all")
async def cancel_all_pending_jobs(
    tenant_id: Optional[int] = Query(default=None, description="Cancel jobs for specific tenant"),
    current_user: User = Depends(require_admin_role),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """Cancel all pending jobs (admin only)"""
    try:
        # Get pending jobs
        if tenant_id:
            jobs = await job_service.get_job_history(tenant_id=tenant_id, status=JobStatus.PENDING, limit=1000)
        else:
            jobs = await job_service.get_job_history(status=JobStatus.PENDING, limit=1000)
        
        cancelled_count = 0
        for job in jobs:
            if await job_service.cancel_job(job.id):
                cancelled_count += 1
        
        return {
            "message": f"Cancelled {cancelled_count} pending jobs",
            "cancelled_count": cancelled_count,
            "tenant_id": tenant_id
        }
        
    except Exception as e:
        logger.error(f"Failed to cancel all pending jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel pending jobs")


# Utility endpoints

@router.get("/health")
async def job_service_health():
    """Check job service health"""
    try:
        job_service = get_job_service()
        stats = await job_service.get_statistics()
        
        return {
            "status": "healthy" if stats['service_running'] else "unhealthy",
            "service_running": stats['service_running'],
            "active_workers": stats['active_workers'],
            "max_workers": stats['max_workers'],
            "pending_jobs": stats['pending_jobs'],
            "running_jobs": stats['running_jobs']
        }
        
    except Exception as e:
        logger.error(f"Job service health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "service_running": False
        }


@router.get("/functions")
async def list_registered_functions(
    current_user: User = Depends(require_authentication),
    job_service: BackgroundJobService = Depends(get_job_service)
):
    """List available job functions"""
    try:
        functions = list(job_service.job_functions.keys())
        
        return {
            "functions": functions,
            "count": len(functions),
            "message": "Available job functions"
        }
        
    except Exception as e:
        logger.error(f"Failed to list job functions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve job functions")