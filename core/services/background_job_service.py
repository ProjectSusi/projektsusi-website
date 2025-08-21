"""
Background Job Management Service
Enhanced job scheduling, monitoring, and execution
"""

import asyncio
import logging
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, Callable, Awaitable
from enum import Enum
from dataclasses import dataclass, asdict
from pathlib import Path
import traceback

logger = logging.getLogger(__name__)

try:
    import aioredis
    REDIS_AVAILABLE = True
except (ImportError, TypeError) as e:
    # Handle both import errors and aioredis compatibility issues
    logger.warning(f"Redis not available: {e}")
    REDIS_AVAILABLE = False


class JobStatus(Enum):
    """Job execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"


class JobPriority(Enum):
    """Job priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class JobResult:
    """Job execution result"""
    success: bool
    result: Any = None
    error_message: Optional[str] = None
    execution_time_seconds: Optional[float] = None
    output_data: Optional[Dict[str, Any]] = None


@dataclass
class Job:
    """Background job definition"""
    id: str
    name: str
    function_name: str
    args: List[Any]
    kwargs: Dict[str, Any]
    priority: JobPriority
    status: JobStatus
    tenant_id: Optional[int] = None
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    scheduled_for: Optional[datetime] = None
    max_retries: int = 3
    retry_count: int = 0
    retry_delay_seconds: int = 60
    timeout_seconds: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    result: Optional[JobResult] = None
    progress: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
        if self.metadata is None:
            self.metadata = {}
        if self.progress is None:
            self.progress = {"percentage": 0, "message": "Pending"}


class JobQueue:
    """In-memory job queue with Redis backing (if available)"""

    def __init__(self, redis_url: Optional[str] = None):
        self.jobs: Dict[str, Job] = {}
        self.redis_client = None
        self.redis_url = redis_url
        
        if REDIS_AVAILABLE and redis_url:
            asyncio.create_task(self._init_redis())

    async def _init_redis(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = aioredis.from_url(self.redis_url)
            await self.redis_client.ping()
            logger.info("Redis connection established for job queue")
        except Exception as e:
            logger.warning(f"Redis connection failed, using in-memory storage: {e}")
            self.redis_client = None

    async def add_job(self, job: Job) -> bool:
        """Add job to queue"""
        try:
            self.jobs[job.id] = job
            
            if self.redis_client:
                # Store in Redis for persistence
                await self.redis_client.hset(
                    "jobs", 
                    job.id, 
                    json.dumps(asdict(job), default=str)
                )
            
            logger.info(f"Job {job.id} added to queue: {job.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add job {job.id}: {e}")
            return False

    async def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID"""
        try:
            if job_id in self.jobs:
                return self.jobs[job_id]
            
            # Try Redis if not in memory
            if self.redis_client:
                job_data = await self.redis_client.hget("jobs", job_id)
                if job_data:
                    job_dict = json.loads(job_data)
                    # Convert string dates back to datetime
                    for field in ['created_at', 'started_at', 'completed_at', 'scheduled_for']:
                        if job_dict.get(field):
                            job_dict[field] = datetime.fromisoformat(job_dict[field])
                    
                    # Convert enums
                    job_dict['status'] = JobStatus(job_dict['status'])
                    job_dict['priority'] = JobPriority(job_dict['priority'])
                    
                    job = Job(**job_dict)
                    self.jobs[job_id] = job  # Cache in memory
                    return job
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get job {job_id}: {e}")
            return None

    async def update_job(self, job: Job) -> bool:
        """Update job in queue"""
        try:
            self.jobs[job.id] = job
            
            if self.redis_client:
                await self.redis_client.hset(
                    "jobs", 
                    job.id, 
                    json.dumps(asdict(job), default=str)
                )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update job {job.id}: {e}")
            return False

    async def get_pending_jobs(self, limit: int = 100) -> List[Job]:
        """Get pending jobs sorted by priority and creation time"""
        try:
            pending_jobs = []
            
            # Check in-memory jobs
            for job in self.jobs.values():
                if job.status == JobStatus.PENDING:
                    # Check if job is scheduled for future
                    if job.scheduled_for and job.scheduled_for > datetime.now(timezone.utc):
                        continue
                    pending_jobs.append(job)
            
            # Sort by priority (highest first) then by created_at (oldest first)
            pending_jobs.sort(key=lambda j: (-j.priority.value, j.created_at))
            
            return pending_jobs[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get pending jobs: {e}")
            return []

    async def get_jobs_by_status(self, status: JobStatus, limit: int = 100) -> List[Job]:
        """Get jobs by status"""
        try:
            filtered_jobs = [
                job for job in self.jobs.values() 
                if job.status == status
            ]
            
            # Sort by creation time (newest first)
            filtered_jobs.sort(key=lambda j: j.created_at, reverse=True)
            
            return filtered_jobs[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get jobs by status {status}: {e}")
            return []

    async def get_tenant_jobs(self, tenant_id: int, limit: int = 100) -> List[Job]:
        """Get jobs for specific tenant"""
        try:
            tenant_jobs = [
                job for job in self.jobs.values()
                if job.tenant_id == tenant_id
            ]
            
            # Sort by creation time (newest first)
            tenant_jobs.sort(key=lambda j: j.created_at, reverse=True)
            
            return tenant_jobs[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get tenant jobs for {tenant_id}: {e}")
            return []

    async def remove_job(self, job_id: str) -> bool:
        """Remove job from queue"""
        try:
            if job_id in self.jobs:
                del self.jobs[job_id]
            
            if self.redis_client:
                await self.redis_client.hdel("jobs", job_id)
            
            logger.info(f"Job {job_id} removed from queue")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove job {job_id}: {e}")
            return False

    async def cleanup_old_jobs(self, older_than_days: int = 7) -> int:
        """Remove old completed/failed jobs"""
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=older_than_days)
            removed_count = 0
            
            jobs_to_remove = []
            for job in self.jobs.values():
                if (job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED] and
                    job.completed_at and job.completed_at < cutoff_date):
                    jobs_to_remove.append(job.id)
            
            for job_id in jobs_to_remove:
                if await self.remove_job(job_id):
                    removed_count += 1
            
            logger.info(f"Cleaned up {removed_count} old jobs")
            return removed_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old jobs: {e}")
            return 0


class BackgroundJobService:
    """Enhanced background job management service"""

    def __init__(
        self,
        max_workers: int = 4,
        redis_url: Optional[str] = None,
        job_timeout_seconds: int = 300,
        enable_monitoring: bool = True
    ):
        self.max_workers = max_workers
        self.job_timeout_seconds = job_timeout_seconds
        self.enable_monitoring = enable_monitoring
        
        self.job_queue = JobQueue(redis_url)
        self.job_functions: Dict[str, Callable] = {}
        self.workers: List[asyncio.Task] = []
        self.running = False
        self.stats = {
            'total_jobs': 0,
            'completed_jobs': 0,
            'failed_jobs': 0,
            'active_workers': 0
        }
        
        logger.info(f"Background job service initialized with {max_workers} workers")

    def register_job_function(self, name: str, function: Callable[..., Awaitable[Any]]):
        """Register a function that can be called as a background job"""
        self.job_functions[name] = function
        logger.info(f"Registered job function: {name}")

    async def schedule_job(
        self,
        name: str,
        function_name: str,
        args: List[Any] = None,
        kwargs: Dict[str, Any] = None,
        priority: JobPriority = JobPriority.NORMAL,
        tenant_id: Optional[int] = None,
        scheduled_for: Optional[datetime] = None,
        max_retries: int = 3,
        timeout_seconds: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Schedule a new background job"""
        
        if function_name not in self.job_functions:
            raise ValueError(f"Job function '{function_name}' not registered")
        
        job_id = str(uuid.uuid4())
        
        job = Job(
            id=job_id,
            name=name,
            function_name=function_name,
            args=args or [],
            kwargs=kwargs or {},
            priority=priority,
            status=JobStatus.PENDING,
            tenant_id=tenant_id,
            scheduled_for=scheduled_for,
            max_retries=max_retries,
            timeout_seconds=timeout_seconds or self.job_timeout_seconds,
            metadata=metadata or {}
        )
        
        success = await self.job_queue.add_job(job)
        if success:
            self.stats['total_jobs'] += 1
            logger.info(f"Scheduled job {job_id}: {name}")
            return job_id
        else:
            raise RuntimeError(f"Failed to schedule job: {name}")

    async def get_job_status(self, job_id: str) -> Optional[Job]:
        """Get current job status and details"""
        return await self.job_queue.get_job(job_id)

    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a pending or running job"""
        try:
            job = await self.job_queue.get_job(job_id)
            if not job:
                return False
            
            if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
                return False  # Cannot cancel finished jobs
            
            job.status = JobStatus.CANCELLED
            job.completed_at = datetime.now(timezone.utc)
            
            await self.job_queue.update_job(job)
            logger.info(f"Cancelled job {job_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to cancel job {job_id}: {e}")
            return False

    async def retry_job(self, job_id: str) -> bool:
        """Retry a failed job"""
        try:
            job = await self.job_queue.get_job(job_id)
            if not job or job.status != JobStatus.FAILED:
                return False
            
            if job.retry_count >= job.max_retries:
                return False
            
            job.status = JobStatus.PENDING
            job.retry_count += 1
            job.started_at = None
            job.completed_at = None
            
            # Schedule retry with delay
            job.scheduled_for = datetime.now(timezone.utc) + timedelta(seconds=job.retry_delay_seconds)
            
            await self.job_queue.update_job(job)
            logger.info(f"Scheduled retry for job {job_id} (attempt {job.retry_count})")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to retry job {job_id}: {e}")
            return False

    async def update_job_progress(
        self, 
        job_id: str, 
        percentage: int, 
        message: str = "",
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update job progress"""
        try:
            job = await self.job_queue.get_job(job_id)
            if not job:
                return False
            
            job.progress = {
                'percentage': min(100, max(0, percentage)),
                'message': message,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            if data:
                job.progress.update(data)
            
            await self.job_queue.update_job(job)
            return True
            
        except Exception as e:
            logger.error(f"Failed to update job progress {job_id}: {e}")
            return False

    async def _execute_job(self, job: Job) -> JobResult:
        """Execute a single job"""
        start_time = datetime.now(timezone.utc)
        
        try:
            # Get job function
            job_function = self.job_functions.get(job.function_name)
            if not job_function:
                raise ValueError(f"Job function '{job.function_name}' not found")
            
            # Update job status
            job.status = JobStatus.RUNNING
            job.started_at = start_time
            await self.job_queue.update_job(job)
            
            # Execute job with timeout
            if job.timeout_seconds:
                result = await asyncio.wait_for(
                    job_function(*job.args, **job.kwargs),
                    timeout=job.timeout_seconds
                )
            else:
                result = await job_function(*job.args, **job.kwargs)
            
            # Calculate execution time
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            return JobResult(
                success=True,
                result=result,
                execution_time_seconds=execution_time
            )
            
        except asyncio.TimeoutError:
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            return JobResult(
                success=False,
                error_message=f"Job timed out after {execution_time:.2f} seconds",
                execution_time_seconds=execution_time
            )
            
        except Exception as e:
            execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            error_message = f"{type(e).__name__}: {str(e)}"
            
            # Include traceback in debug mode
            if logger.isEnabledFor(logging.DEBUG):
                error_message += f"\nTraceback: {traceback.format_exc()}"
            
            return JobResult(
                success=False,
                error_message=error_message,
                execution_time_seconds=execution_time
            )

    async def _worker(self, worker_id: int):
        """Background worker process"""
        logger.info(f"Worker {worker_id} started")
        
        while self.running:
            try:
                # Get next pending job
                pending_jobs = await self.job_queue.get_pending_jobs(limit=1)
                
                if not pending_jobs:
                    await asyncio.sleep(1)  # No jobs available, wait
                    continue
                
                job = pending_jobs[0]
                
                # Execute job
                self.stats['active_workers'] += 1
                logger.info(f"Worker {worker_id} executing job {job.id}: {job.name}")
                
                result = await self._execute_job(job)
                
                # Update job with result
                job.result = result
                job.completed_at = datetime.now(timezone.utc)
                
                if result.success:
                    job.status = JobStatus.COMPLETED
                    job.progress = {"percentage": 100, "message": "Completed"}
                    self.stats['completed_jobs'] += 1
                    logger.info(f"Job {job.id} completed successfully")
                else:
                    if job.retry_count < job.max_retries:
                        job.status = JobStatus.RETRYING
                        job.retry_count += 1
                        job.scheduled_for = datetime.now(timezone.utc) + timedelta(seconds=job.retry_delay_seconds)
                        logger.warning(f"Job {job.id} failed, scheduling retry {job.retry_count}/{job.max_retries}")
                    else:
                        job.status = JobStatus.FAILED
                        self.stats['failed_jobs'] += 1
                        logger.error(f"Job {job.id} failed permanently: {result.error_message}")
                
                await self.job_queue.update_job(job)
                self.stats['active_workers'] -= 1
                
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}")
                self.stats['active_workers'] -= 1
                await asyncio.sleep(5)  # Error recovery delay
        
        logger.info(f"Worker {worker_id} stopped")

    async def start(self):
        """Start the background job service"""
        if self.running:
            return
        
        self.running = True
        
        # Start worker tasks
        for i in range(self.max_workers):
            worker_task = asyncio.create_task(self._worker(i))
            self.workers.append(worker_task)
        
        logger.info(f"Background job service started with {self.max_workers} workers")

    async def stop(self):
        """Stop the background job service"""
        if not self.running:
            return
        
        self.running = False
        
        # Cancel all worker tasks
        for worker in self.workers:
            worker.cancel()
        
        # Wait for workers to finish
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.workers.clear()
        
        logger.info("Background job service stopped")

    async def get_statistics(self) -> Dict[str, Any]:
        """Get job service statistics"""
        pending_jobs = await self.job_queue.get_pending_jobs(limit=1000)
        running_jobs = await self.job_queue.get_jobs_by_status(JobStatus.RUNNING, limit=1000)
        
        return {
            'total_jobs': self.stats['total_jobs'],
            'completed_jobs': self.stats['completed_jobs'],
            'failed_jobs': self.stats['failed_jobs'],
            'pending_jobs': len(pending_jobs),
            'running_jobs': len(running_jobs),
            'active_workers': self.stats['active_workers'],
            'max_workers': self.max_workers,
            'service_running': self.running
        }

    async def get_job_history(
        self, 
        tenant_id: Optional[int] = None,
        status: Optional[JobStatus] = None,
        limit: int = 100
    ) -> List[Job]:
        """Get job history with optional filtering"""
        if tenant_id:
            jobs = await self.job_queue.get_tenant_jobs(tenant_id, limit)
        elif status:
            jobs = await self.job_queue.get_jobs_by_status(status, limit)
        else:
            # Get all jobs
            jobs = list(self.job_queue.jobs.values())
            jobs.sort(key=lambda j: j.created_at, reverse=True)
            jobs = jobs[:limit]
        
        return jobs

    async def cleanup_old_jobs(self, older_than_days: int = 7) -> int:
        """Clean up old completed/failed jobs"""
        return await self.job_queue.cleanup_old_jobs(older_than_days)


# Global job service instance
_job_service: Optional[BackgroundJobService] = None


async def initialize_job_service(
    max_workers: int = 4,
    redis_url: Optional[str] = None,
    job_timeout_seconds: int = 300
) -> BackgroundJobService:
    """Initialize global job service"""
    global _job_service
    
    _job_service = BackgroundJobService(
        max_workers=max_workers,
        redis_url=redis_url,
        job_timeout_seconds=job_timeout_seconds
    )
    
    await _job_service.start()
    logger.info("Global job service initialized")
    
    return _job_service


async def shutdown_job_service():
    """Shutdown global job service"""
    global _job_service
    
    if _job_service:
        await _job_service.stop()
        _job_service = None
        logger.info("Global job service shutdown")


def get_job_service() -> BackgroundJobService:
    """Get global job service instance"""
    if not _job_service:
        raise RuntimeError("Job service not initialized. Call initialize_job_service() first.")
    
    return _job_service