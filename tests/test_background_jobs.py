"""
Test suite for Background Job Management System
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch, AsyncMock

from core.services.background_job_service import (
    BackgroundJobService, Job, JobStatus, JobPriority, JobResult, JobQueue
)


class TestJobQueue:
    """Test job queue functionality"""

    @pytest.fixture
    def job_queue(self):
        """Create job queue for testing"""
        return JobQueue()

    @pytest.fixture
    def sample_job(self):
        """Create sample job for testing"""
        return Job(
            id="test-job-1",
            name="Test Job",
            function_name="test_function",
            args=[1, 2, 3],
            kwargs={"key": "value"},
            priority=JobPriority.NORMAL,
            status=JobStatus.PENDING,
            tenant_id=1
        )

    async def test_add_and_get_job(self, job_queue, sample_job):
        """Test adding and retrieving jobs"""
        # Add job
        success = await job_queue.add_job(sample_job)
        assert success is True

        # Get job
        retrieved_job = await job_queue.get_job(sample_job.id)
        assert retrieved_job is not None
        assert retrieved_job.id == sample_job.id
        assert retrieved_job.name == sample_job.name
        assert retrieved_job.status == JobStatus.PENDING

    async def test_get_nonexistent_job(self, job_queue):
        """Test getting non-existent job"""
        job = await job_queue.get_job("nonexistent")
        assert job is None

    async def test_update_job(self, job_queue, sample_job):
        """Test updating job"""
        # Add job
        await job_queue.add_job(sample_job)

        # Update job
        sample_job.status = JobStatus.RUNNING
        sample_job.started_at = datetime.now(timezone.utc)

        success = await job_queue.update_job(sample_job)
        assert success is True

        # Verify update
        updated_job = await job_queue.get_job(sample_job.id)
        assert updated_job.status == JobStatus.RUNNING
        assert updated_job.started_at is not None

    async def test_get_pending_jobs(self, job_queue):
        """Test getting pending jobs"""
        # Create jobs with different priorities
        high_priority_job = Job(
            id="high-job",
            name="High Priority Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.HIGH,
            status=JobStatus.PENDING,
            tenant_id=1
        )

        low_priority_job = Job(
            id="low-job",
            name="Low Priority Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.LOW,
            status=JobStatus.PENDING,
            tenant_id=1
        )

        # Add jobs
        await job_queue.add_job(low_priority_job)  # Add low priority first
        await job_queue.add_job(high_priority_job)  # Add high priority second

        # Get pending jobs
        pending_jobs = await job_queue.get_pending_jobs()

        assert len(pending_jobs) == 2
        # High priority job should come first
        assert pending_jobs[0].priority == JobPriority.HIGH
        assert pending_jobs[1].priority == JobPriority.LOW

    async def test_get_jobs_by_status(self, job_queue):
        """Test filtering jobs by status"""
        # Create jobs with different statuses
        pending_job = Job(
            id="pending-job",
            name="Pending Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.NORMAL,
            status=JobStatus.PENDING,
            tenant_id=1
        )

        completed_job = Job(
            id="completed-job",
            name="Completed Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.NORMAL,
            status=JobStatus.COMPLETED,
            tenant_id=1
        )

        await job_queue.add_job(pending_job)
        await job_queue.add_job(completed_job)

        # Get pending jobs
        pending_jobs = await job_queue.get_jobs_by_status(JobStatus.PENDING)
        assert len(pending_jobs) == 1
        assert pending_jobs[0].id == "pending-job"

        # Get completed jobs
        completed_jobs = await job_queue.get_jobs_by_status(JobStatus.COMPLETED)
        assert len(completed_jobs) == 1
        assert completed_jobs[0].id == "completed-job"

    async def test_get_tenant_jobs(self, job_queue):
        """Test filtering jobs by tenant"""
        # Create jobs for different tenants
        tenant1_job = Job(
            id="tenant1-job",
            name="Tenant 1 Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.NORMAL,
            status=JobStatus.PENDING,
            tenant_id=1
        )

        tenant2_job = Job(
            id="tenant2-job",
            name="Tenant 2 Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.NORMAL,
            status=JobStatus.PENDING,
            tenant_id=2
        )

        await job_queue.add_job(tenant1_job)
        await job_queue.add_job(tenant2_job)

        # Get tenant 1 jobs
        tenant1_jobs = await job_queue.get_tenant_jobs(1)
        assert len(tenant1_jobs) == 1
        assert tenant1_jobs[0].id == "tenant1-job"

        # Get tenant 2 jobs
        tenant2_jobs = await job_queue.get_tenant_jobs(2)
        assert len(tenant2_jobs) == 1
        assert tenant2_jobs[0].id == "tenant2-job"

    async def test_remove_job(self, job_queue, sample_job):
        """Test removing job"""
        # Add job
        await job_queue.add_job(sample_job)
        assert await job_queue.get_job(sample_job.id) is not None

        # Remove job
        success = await job_queue.remove_job(sample_job.id)
        assert success is True

        # Verify removal
        assert await job_queue.get_job(sample_job.id) is None

    async def test_cleanup_old_jobs(self, job_queue):
        """Test cleaning up old jobs"""
        # Create old completed job
        old_job = Job(
            id="old-job",
            name="Old Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.NORMAL,
            status=JobStatus.COMPLETED,
            tenant_id=1,
            completed_at=datetime.now(timezone.utc) - timedelta(days=10)
        )

        # Create recent completed job
        recent_job = Job(
            id="recent-job",
            name="Recent Job",
            function_name="test_function",
            args=[],
            kwargs={},
            priority=JobPriority.NORMAL,
            status=JobStatus.COMPLETED,
            tenant_id=1,
            completed_at=datetime.now(timezone.utc) - timedelta(hours=1)
        )

        await job_queue.add_job(old_job)
        await job_queue.add_job(recent_job)

        # Cleanup jobs older than 7 days
        removed_count = await job_queue.cleanup_old_jobs(older_than_days=7)

        assert removed_count == 1  # Only old job should be removed
        assert await job_queue.get_job(old_job.id) is None
        assert await job_queue.get_job(recent_job.id) is not None


class TestBackgroundJobService:
    """Test background job service functionality"""

    @pytest.fixture
    async def job_service(self):
        """Create job service for testing"""
        service = BackgroundJobService(max_workers=2, redis_url=None)
        
        # Register test function
        async def test_function(x, y, result_key="result"):
            await asyncio.sleep(0.1)  # Simulate work
            return {result_key: x + y}
        
        async def failing_function():
            raise ValueError("Test error")
        
        async def timeout_function():
            await asyncio.sleep(10)  # Will timeout
            return "should not reach here"
        
        service.register_job_function("test_function", test_function)
        service.register_job_function("failing_function", failing_function)
        service.register_job_function("timeout_function", timeout_function)
        
        await service.start()
        yield service
        await service.stop()

    async def test_register_job_function(self, job_service):
        """Test registering job functions"""
        assert "test_function" in job_service.job_functions
        assert "failing_function" in job_service.job_functions

    async def test_schedule_job(self, job_service):
        """Test scheduling a job"""
        job_id = await job_service.schedule_job(
            name="Test Addition",
            function_name="test_function",
            args=[5, 3],
            kwargs={"result_key": "sum"},
            priority=JobPriority.HIGH,
            tenant_id=1
        )
        
        assert job_id is not None
        assert isinstance(job_id, str)
        
        # Get job status
        job = await job_service.get_job_status(job_id)
        assert job is not None
        assert job.name == "Test Addition"
        assert job.priority == JobPriority.HIGH
        assert job.tenant_id == 1

    async def test_schedule_job_invalid_function(self, job_service):
        """Test scheduling job with invalid function"""
        with pytest.raises(ValueError, match="Job function 'nonexistent' not registered"):
            await job_service.schedule_job(
                name="Invalid Job",
                function_name="nonexistent",
                tenant_id=1
            )

    async def test_job_execution_success(self, job_service):
        """Test successful job execution"""
        job_id = await job_service.schedule_job(
            name="Test Addition",
            function_name="test_function",
            args=[10, 20],
            tenant_id=1
        )
        
        # Wait for job to complete
        for _ in range(50):  # Max 5 seconds
            job = await job_service.get_job_status(job_id)
            if job.status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                break
            await asyncio.sleep(0.1)
        
        assert job.status == JobStatus.COMPLETED
        assert job.result is not None
        assert job.result.success is True
        assert job.result.result == {"result": 30}
        assert job.result.execution_time_seconds is not None

    async def test_job_execution_failure(self, job_service):
        """Test failed job execution"""
        job_id = await job_service.schedule_job(
            name="Failing Job",
            function_name="failing_function",
            tenant_id=1,
            max_retries=1  # Limit retries for faster test
        )
        
        # Wait for job to fail
        for _ in range(50):
            job = await job_service.get_job_status(job_id)
            if job.status == JobStatus.FAILED:
                break
            await asyncio.sleep(0.1)
        
        assert job.status == JobStatus.FAILED
        assert job.result is not None
        assert job.result.success is False
        assert "Test error" in job.result.error_message

    async def test_job_timeout(self, job_service):
        """Test job timeout"""
        job_id = await job_service.schedule_job(
            name="Timeout Job",
            function_name="timeout_function",
            tenant_id=1,
            timeout_seconds=1,  # 1 second timeout
            max_retries=0  # No retries
        )
        
        # Wait for job to timeout
        for _ in range(50):
            job = await job_service.get_job_status(job_id)
            if job.status == JobStatus.FAILED:
                break
            await asyncio.sleep(0.1)
        
        assert job.status == JobStatus.FAILED
        assert job.result is not None
        assert job.result.success is False
        assert "timed out" in job.result.error_message

    async def test_cancel_job(self, job_service):
        """Test cancelling a job"""
        # Schedule a job for the future
        job_id = await job_service.schedule_job(
            name="Future Job",
            function_name="test_function",
            args=[1, 2],
            tenant_id=1,
            scheduled_for=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        
        # Cancel the job
        success = await job_service.cancel_job(job_id)
        assert success is True
        
        # Verify cancellation
        job = await job_service.get_job_status(job_id)
        assert job.status == JobStatus.CANCELLED

    async def test_retry_job(self, job_service):
        """Test retrying a failed job"""
        job_id = await job_service.schedule_job(
            name="Retry Job",
            function_name="failing_function",
            tenant_id=1,
            max_retries=0  # Let it fail immediately
        )
        
        # Wait for job to fail
        for _ in range(50):
            job = await job_service.get_job_status(job_id)
            if job.status == JobStatus.FAILED:
                break
            await asyncio.sleep(0.1)
        
        assert job.status == JobStatus.FAILED
        
        # Retry the job
        success = await job_service.retry_job(job_id)
        assert success is True
        
        # Check that retry was scheduled
        job = await job_service.get_job_status(job_id)
        assert job.retry_count == 1
        assert job.status == JobStatus.PENDING

    async def test_update_job_progress(self, job_service):
        """Test updating job progress"""
        job_id = await job_service.schedule_job(
            name="Progress Job",
            function_name="test_function",
            args=[1, 2],
            tenant_id=1,
            scheduled_for=datetime.now(timezone.utc) + timedelta(hours=1)  # Don't execute yet
        )
        
        # Update progress
        success = await job_service.update_job_progress(
            job_id=job_id,
            percentage=50,
            message="Halfway done",
            data={"step": "processing"}
        )
        
        assert success is True
        
        # Verify progress update
        job = await job_service.get_job_status(job_id)
        assert job.progress["percentage"] == 50
        assert job.progress["message"] == "Halfway done"
        assert job.progress["step"] == "processing"

    async def test_get_statistics(self, job_service):
        """Test getting service statistics"""
        # Schedule some jobs
        await job_service.schedule_job("Job 1", "test_function", [1, 2], tenant_id=1)
        await job_service.schedule_job("Job 2", "test_function", [3, 4], tenant_id=1)
        
        stats = await job_service.get_statistics()
        
        assert isinstance(stats, dict)
        assert "total_jobs" in stats
        assert "pending_jobs" in stats
        assert "running_jobs" in stats
        assert "completed_jobs" in stats
        assert "failed_jobs" in stats
        assert "active_workers" in stats
        assert "max_workers" in stats
        assert "service_running" in stats
        
        assert stats["max_workers"] == 2  # As configured
        assert stats["service_running"] is True

    async def test_get_job_history(self, job_service):
        """Test getting job history"""
        # Schedule jobs for different tenants
        job1_id = await job_service.schedule_job("Tenant 1 Job", "test_function", [1, 2], tenant_id=1)
        job2_id = await job_service.schedule_job("Tenant 2 Job", "test_function", [3, 4], tenant_id=2)
        
        # Get all jobs
        all_jobs = await job_service.get_job_history()
        assert len(all_jobs) >= 2
        
        # Get tenant-specific jobs
        tenant1_jobs = await job_service.get_job_history(tenant_id=1)
        tenant1_job_ids = [job.id for job in tenant1_jobs]
        assert job1_id in tenant1_job_ids
        assert job2_id not in tenant1_job_ids
        
        # Get status-specific jobs
        pending_jobs = await job_service.get_job_history(status=JobStatus.PENDING)
        assert all(job.status == JobStatus.PENDING for job in pending_jobs)

    async def test_cleanup_old_jobs(self, job_service):
        """Test cleaning up old jobs"""
        # This test would require mocking datetime or creating old jobs
        # For now, just test that the method exists and doesn't crash
        removed_count = await job_service.cleanup_old_jobs(older_than_days=30)
        assert isinstance(removed_count, int)
        assert removed_count >= 0


@pytest.mark.asyncio
class TestBackgroundJobsAPI:
    """Test background jobs API endpoints"""

    @pytest.fixture
    def mock_job_service(self):
        """Create mock job service"""
        service = Mock()
        
        # Mock methods
        service.schedule_job = AsyncMock(return_value="test-job-id")
        service.get_job_status = AsyncMock()
        service.cancel_job = AsyncMock(return_value=True)
        service.retry_job = AsyncMock(return_value=True)
        service.update_job_progress = AsyncMock(return_value=True)
        service.get_statistics = AsyncMock(return_value={
            'total_jobs': 10,
            'completed_jobs': 5,
            'failed_jobs': 1,
            'pending_jobs': 3,
            'running_jobs': 1,
            'active_workers': 2,
            'max_workers': 4,
            'service_running': True
        })
        service.get_job_history = AsyncMock(return_value=[])
        service.cleanup_old_jobs = AsyncMock(return_value=5)
        service.job_functions = {"test_function": Mock()}
        
        return service

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock()
        user.tenant_id = 1
        user.role = 'user'
        return user

    @pytest.fixture
    def mock_admin_user(self):
        """Create mock admin user"""
        user = Mock()
        user.tenant_id = 1
        user.role = 'admin'
        return user

    async def test_schedule_job_success(self, mock_job_service, mock_user):
        """Test successful job scheduling via API"""
        from core.routers.background_jobs import schedule_job, JobCreateRequest
        
        request = JobCreateRequest(
            name="Test Job",
            function_name="test_function",
            args=[1, 2, 3],
            kwargs={"key": "value"}
        )
        
        result = await schedule_job(request, mock_user, mock_job_service)
        
        assert result["job_id"] == "test-job-id"
        assert result["message"] == "Job scheduled successfully"
        
        # Verify service call
        mock_job_service.schedule_job.assert_called_once_with(
            name="Test Job",
            function_name="test_function",
            args=[1, 2, 3],
            kwargs={"key": "value"},
            priority=JobPriority.NORMAL,
            tenant_id=1,
            scheduled_for=None,
            max_retries=3,
            timeout_seconds=None,
            metadata={}
        )

    async def test_get_job_status_success(self, mock_job_service, mock_user):
        """Test getting job status via API"""
        from core.routers.background_jobs import get_job_status
        
        # Mock job
        mock_job = Mock()
        mock_job.id = "test-job-id"
        mock_job.name = "Test Job"
        mock_job.function_name = "test_function"
        mock_job.status = JobStatus.COMPLETED
        mock_job.priority = JobPriority.NORMAL
        mock_job.tenant_id = 1
        mock_job.created_at = datetime.now(timezone.utc)
        mock_job.started_at = None
        mock_job.completed_at = None
        mock_job.scheduled_for = None
        mock_job.retry_count = 0
        mock_job.max_retries = 3
        mock_job.progress = {"percentage": 100}
        mock_job.metadata = {}
        mock_job.result = None
        
        mock_job_service.get_job_status.return_value = mock_job
        
        result = await get_job_status("test-job-id", mock_user, mock_job_service)
        
        assert result.id == "test-job-id"
        assert result.name == "Test Job"
        assert result.status == JobStatus.COMPLETED
        assert result.tenant_id == 1

    async def test_get_job_statistics(self, mock_job_service, mock_user):
        """Test getting job statistics via API"""
        from core.routers.background_jobs import get_job_statistics
        
        result = await get_job_statistics(mock_user, mock_job_service)
        
        assert result.total_jobs == 10
        assert result.completed_jobs == 5
        assert result.failed_jobs == 1
        assert result.pending_jobs == 3
        assert result.running_jobs == 1
        assert result.active_workers == 2
        assert result.max_workers == 4
        assert result.service_running is True

    async def test_list_registered_functions(self, mock_job_service, mock_user):
        """Test listing registered functions via API"""
        from core.routers.background_jobs import list_registered_functions
        
        result = await list_registered_functions(mock_user, mock_job_service)
        
        assert result["functions"] == ["test_function"]
        assert result["count"] == 1
        assert result["message"] == "Available job functions"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])