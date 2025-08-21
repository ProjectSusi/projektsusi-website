#!/usr/bin/env python3
"""
Demo script for Background Job Management System
Shows enhanced job scheduling, monitoring, and execution
"""

import asyncio
import sys
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.services.background_job_service import (
    BackgroundJobService, JobPriority, JobStatus
)


# Sample job functions for demonstration
async def document_processing_job(document_id: int, processing_type: str = "ocr"):
    """Simulate document processing"""
    print(f"  Processing document {document_id} with {processing_type}...")
    
    # Simulate processing time
    total_steps = 5
    for step in range(1, total_steps + 1):
        await asyncio.sleep(0.5)  # Simulate work
        progress = int((step / total_steps) * 100)
        print(f"    Step {step}/{total_steps}: {progress}% complete")
    
    return {
        "document_id": document_id,
        "processing_type": processing_type,
        "pages_processed": random.randint(1, 20),
        "text_extracted": f"Sample text from document {document_id}",
        "processing_time_seconds": total_steps * 0.5
    }


async def data_backup_job(backup_type: str, include_documents: bool = True):
    """Simulate data backup operation"""
    print(f"  Starting {backup_type} backup (documents: {include_documents})...")
    
    # Simulate backup stages
    stages = ["Preparing", "Compressing", "Uploading", "Verifying"]
    
    for i, stage in enumerate(stages):
        await asyncio.sleep(0.3)
        progress = int(((i + 1) / len(stages)) * 100)
        print(f"    {stage}: {progress}% complete")
    
    backup_size_mb = random.randint(100, 5000)
    
    return {
        "backup_type": backup_type,
        "backup_size_mb": backup_size_mb,
        "files_backed_up": random.randint(50, 500),
        "include_documents": include_documents,
        "backup_location": f"/backups/{backup_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    }


async def analytics_report_job(report_type: str, date_range_days: int = 30):
    """Simulate analytics report generation"""
    print(f"  Generating {report_type} report for last {date_range_days} days...")
    
    # Simulate report generation
    tasks = ["Collecting data", "Processing metrics", "Generating charts", "Creating PDF"]
    
    for i, task in enumerate(tasks):
        await asyncio.sleep(0.4)
        progress = int(((i + 1) / len(tasks)) * 100)
        print(f"    {task}: {progress}% complete")
    
    return {
        "report_type": report_type,
        "date_range_days": date_range_days,
        "total_queries": random.randint(100, 10000),
        "unique_users": random.randint(10, 500),
        "avg_response_time_ms": random.randint(100, 2000),
        "report_size_pages": random.randint(5, 50)
    }


async def email_notification_job(recipient: str, notification_type: str, data: dict = None):
    """Simulate email notification sending"""
    print(f"  Sending {notification_type} notification to {recipient}...")
    
    await asyncio.sleep(0.2)  # Simulate email sending
    
    return {
        "recipient": recipient,
        "notification_type": notification_type,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "message_id": f"msg_{random.randint(100000, 999999)}",
        "data": data
    }


async def failing_job():
    """Job that always fails (for testing error handling)"""
    print("  This job is designed to fail...")
    await asyncio.sleep(0.5)
    raise ValueError("Simulated job failure for testing")


async def long_running_job(duration_seconds: int = 10):
    """Long-running job for testing cancellation and timeouts"""
    print(f"  Starting long-running job ({duration_seconds} seconds)...")
    
    for i in range(duration_seconds):
        await asyncio.sleep(1)
        progress = int(((i + 1) / duration_seconds) * 100)
        print(f"    Progress: {progress}%")
    
    return {"duration": duration_seconds, "completed": True}


async def demo_background_jobs():
    """Demonstrate background job management system"""
    print("Background Job Management System Demo")
    print("=" * 50)
    
    # Initialize job service
    print("\n1. Initializing Background Job Service...")
    job_service = BackgroundJobService(
        max_workers=3,
        redis_url=None,  # Use in-memory storage for demo
        job_timeout_seconds=300
    )
    
    # Register job functions
    print("Registering job functions...")
    job_service.register_job_function("document_processing", document_processing_job)
    job_service.register_job_function("data_backup", data_backup_job)
    job_service.register_job_function("analytics_report", analytics_report_job)
    job_service.register_job_function("email_notification", email_notification_job)
    job_service.register_job_function("failing_job", failing_job)
    job_service.register_job_function("long_running_job", long_running_job)
    
    print(f"Registered {len(job_service.job_functions)} job functions")
    
    # Start the service
    await job_service.start()
    print("Job service started successfully")
    
    try:
        # Demo job scheduling
        print("\n2. Job Scheduling Demo...")
        scheduled_jobs = []
        
        # Schedule various types of jobs
        jobs_to_schedule = [
            {
                "name": "Process Invoice Document",
                "function": "document_processing",
                "args": [12345],
                "kwargs": {"processing_type": "invoice_extraction"},
                "priority": JobPriority.HIGH,
                "tenant_id": 1
            },
            {
                "name": "Daily Data Backup",
                "function": "data_backup",
                "kwargs": {"backup_type": "daily", "include_documents": True},
                "priority": JobPriority.NORMAL,
                "tenant_id": 1
            },
            {
                "name": "Weekly Analytics Report",
                "function": "analytics_report",
                "kwargs": {"report_type": "usage_summary", "date_range_days": 7},
                "priority": JobPriority.LOW,
                "tenant_id": 2
            },
            {
                "name": "Welcome Email",
                "function": "email_notification",
                "kwargs": {
                    "recipient": "newuser@company.com",
                    "notification_type": "welcome",
                    "data": {"username": "newuser", "tenant": "Company Inc"}
                },
                "priority": JobPriority.HIGH,
                "tenant_id": 1
            },
            {
                "name": "Test Failure Handling",
                "function": "failing_job",
                "priority": JobPriority.LOW,
                "tenant_id": 1,
                "max_retries": 2
            }
        ]
        
        for job_config in jobs_to_schedule:
            job_id = await job_service.schedule_job(
                name=job_config["name"],
                function_name=job_config["function"],
                args=job_config.get("args", []),
                kwargs=job_config.get("kwargs", {}),
                priority=job_config["priority"],
                tenant_id=job_config["tenant_id"],
                max_retries=job_config.get("max_retries", 3)
            )
            
            scheduled_jobs.append({
                "id": job_id,
                "name": job_config["name"],
                "tenant_id": job_config["tenant_id"]
            })
            
            print(f"  Scheduled: {job_config['name']} (ID: {job_id[:8]}...)")
        
        print(f"Successfully scheduled {len(scheduled_jobs)} jobs")
        
        # Demo job monitoring
        print("\n3. Job Monitoring Demo...")
        print("Waiting for jobs to execute...")
        
        # Monitor job execution
        monitoring_rounds = 0
        max_monitoring_rounds = 20
        
        while monitoring_rounds < max_monitoring_rounds:
            await asyncio.sleep(1)
            monitoring_rounds += 1
            
            # Get service statistics
            stats = await job_service.get_statistics()
            
            print(f"\nRound {monitoring_rounds}: Service Stats:")
            print(f"  Total Jobs: {stats['total_jobs']}")
            print(f"  Pending: {stats['pending_jobs']}")
            print(f"  Running: {stats['running_jobs']}")
            print(f"  Completed: {stats['completed_jobs']}")
            print(f"  Failed: {stats['failed_jobs']}")
            print(f"  Active Workers: {stats['active_workers']}/{stats['max_workers']}")
            
            # Check individual job statuses
            active_jobs = 0
            for job_info in scheduled_jobs:
                job = await job_service.get_job_status(job_info["id"])
                if job:
                    status_icon = {
                        JobStatus.PENDING: "[PENDING]",
                        JobStatus.RUNNING: "[RUNNING]",
                        JobStatus.COMPLETED: "[DONE]",
                        JobStatus.FAILED: "[FAILED]",
                        JobStatus.CANCELLED: "[CANCELLED]",
                        JobStatus.RETRYING: "[RETRY]"
                    }.get(job.status, "[UNKNOWN]")
                    
                    print(f"  {status_icon} {job.name[:30]:<30} | {job.status.value:<10}")
                    
                    if job.status in [JobStatus.PENDING, JobStatus.RUNNING, JobStatus.RETRYING]:
                        active_jobs += 1
            
            # Break if all jobs are finished
            if active_jobs == 0:
                print("\nAll jobs completed!")
                break
        
        # Demo job history and results
        print("\n4. Job Results Demo...")
        
        for job_info in scheduled_jobs:
            job = await job_service.get_job_status(job_info["id"])
            if job:
                print(f"\nJob: {job.name}")
                print(f"  Status: {job.status.value}")
                print(f"  Priority: {job.priority.value}")
                print(f"  Tenant: {job.tenant_id}")
                print(f"  Created: {job.created_at}")
                print(f"  Retries: {job.retry_count}/{job.max_retries}")
                
                if job.started_at:
                    print(f"  Started: {job.started_at}")
                
                if job.completed_at:
                    print(f"  Completed: {job.completed_at}")
                    execution_time = (job.completed_at - job.started_at).total_seconds()
                    print(f"  Execution Time: {execution_time:.2f}s")
                
                if job.result:
                    print(f"  Success: {job.result.success}")
                    if job.result.success and job.result.result:
                        print(f"  Result Preview: {str(job.result.result)[:100]}...")
                    elif not job.result.success:
                        print(f"  Error: {job.result.error_message}")
        
        # Demo scheduled jobs
        print("\n5. Scheduled Jobs Demo...")
        
        # Schedule a job for the future
        future_time = datetime.now(timezone.utc) + timedelta(seconds=5)
        future_job_id = await job_service.schedule_job(
            name="Scheduled Maintenance Report",
            function_name="analytics_report",
            kwargs={"report_type": "maintenance", "date_range_days": 1},
            priority=JobPriority.NORMAL,
            tenant_id=1,
            scheduled_for=future_time
        )
        
        print(f"Scheduled future job for {future_time}")
        print(f"Job ID: {future_job_id}")
        
        print("Waiting for scheduled job to execute...")
        
        # Wait for scheduled job
        for i in range(10):
            await asyncio.sleep(1)
            job = await job_service.get_job_status(future_job_id)
            if job and job.status != JobStatus.PENDING:
                print(f"Scheduled job status: {job.status.value}")
                break
            print(f"  Waiting... {i+1}/10")
        
        # Demo job cancellation
        print("\n6. Job Cancellation Demo...")
        
        # Schedule a long-running job
        long_job_id = await job_service.schedule_job(
            name="Long Running Task",
            function_name="long_running_job",
            kwargs={"duration_seconds": 30},
            priority=JobPriority.LOW,
            tenant_id=1
        )
        
        print(f"Scheduled long-running job: {long_job_id}")
        
        # Wait a moment, then cancel
        await asyncio.sleep(2)
        
        success = await job_service.cancel_job(long_job_id)
        if success:
            print("[SUCCESS] Successfully cancelled long-running job")
        else:
            print("[FAILED] Failed to cancel job (may have already started)")
        
        # Check cancellation status
        cancelled_job = await job_service.get_job_status(long_job_id)
        if cancelled_job:
            print(f"Job status after cancellation: {cancelled_job.status.value}")
        
        # Demo tenant isolation
        print("\n7. Tenant Isolation Demo...")
        
        # Get jobs for each tenant
        tenant1_jobs = await job_service.get_job_history(tenant_id=1, limit=50)
        tenant2_jobs = await job_service.get_job_history(tenant_id=2, limit=50)
        
        print(f"Tenant 1 has {len(tenant1_jobs)} jobs")
        print(f"Tenant 2 has {len(tenant2_jobs)} jobs")
        
        print("Tenant 1 jobs:")
        for job in tenant1_jobs[:3]:  # Show first 3
            print(f"  - {job.name} ({job.status.value})")
        
        print("Tenant 2 jobs:")
        for job in tenant2_jobs[:3]:  # Show first 3
            print(f"  - {job.name} ({job.status.value})")
        
        # Demo job retry
        print("\n8. Job Retry Demo...")
        
        # Find a failed job to retry
        failed_jobs = await job_service.get_job_history(status=JobStatus.FAILED, limit=5)
        
        if failed_jobs:
            failed_job = failed_jobs[0]
            print(f"Found failed job: {failed_job.name}")
            print(f"Retry count: {failed_job.retry_count}/{failed_job.max_retries}")
            
            if failed_job.retry_count < failed_job.max_retries:
                retry_success = await job_service.retry_job(failed_job.id)
                if retry_success:
                    print("[SUCCESS] Job retry scheduled successfully")
                    
                    # Check retry status
                    await asyncio.sleep(1)
                    retried_job = await job_service.get_job_status(failed_job.id)
                    if retried_job:
                        print(f"Job status after retry: {retried_job.status.value}")
                        print(f"New retry count: {retried_job.retry_count}")
                else:
                    print("[FAILED] Failed to schedule job retry")
            else:
                print("Job has exceeded maximum retry attempts")
        else:
            print("No failed jobs found to retry")
        
        # Demo cleanup
        print("\n9. Cleanup Demo...")
        
        # Show cleanup stats
        print("Current job statistics before cleanup:")
        final_stats = await job_service.get_statistics()
        for key, value in final_stats.items():
            print(f"  {key}: {value}")
        
        # Cleanup old jobs (use 0 days for demo to clean everything)
        removed_count = await job_service.cleanup_old_jobs(older_than_days=0)
        print(f"Cleaned up {removed_count} jobs")
        
    except Exception as e:
        print(f"Demo error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Stop the service
        print("\n10. Shutting down...")
        await job_service.stop()
        print("Job service stopped")
    
    print("\nBackground Job Management Demo Complete!")
    print("Features demonstrated:")
    print("  [OK] Job scheduling with priorities and tenant isolation")
    print("  [OK] Real-time job monitoring and statistics")
    print("  [OK] Job execution with progress tracking")
    print("  [OK] Error handling and retry mechanisms")
    print("  [OK] Future job scheduling")
    print("  [OK] Job cancellation capabilities")
    print("  [OK] Multi-tenant job isolation")
    print("  [OK] Job history and result tracking")
    print("  [OK] Automatic cleanup of old jobs")
    print("  [OK] Concurrent execution with worker pools")


if __name__ == "__main__":
    try:
        asyncio.run(demo_background_jobs())
    except KeyboardInterrupt:
        print("\nDemo interrupted by user")
    except Exception as e:
        print(f"\nDemo failed: {e}")
        import traceback
        traceback.print_exc()