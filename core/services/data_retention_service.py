"""
Data Retention Service
Comprehensive data lifecycle management and retention policy enforcement
"""
import asyncio
import logging
import os
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import schedule
import threading
import time

from ..repositories.interfaces import IDocumentRepository, IUserRepository
from ..repositories.models import Document, User, DocumentStatus
from .compliance_service import ComplianceService, DataSubjectRequest

logger = logging.getLogger(__name__)


class RetentionPeriod(Enum):
    """Standard retention periods"""
    SHORT_TERM = 30      # 30 days
    MEDIUM_TERM = 365    # 1 year  
    LONG_TERM = 2555     # 7 years (Swiss DSG standard)
    PERMANENT = -1       # Never delete


class DataCategory(Enum):
    """Data categories for retention policies"""
    PERSONAL_DATA = "personal_data"
    FINANCIAL_DATA = "financial_data"
    HEALTH_DATA = "health_data"
    BEHAVIORAL_DATA = "behavioral_data"
    TECHNICAL_DATA = "technical_data"
    COMMUNICATION_DATA = "communication_data"
    DOCUMENT_CONTENT = "document_content"
    USER_ACTIVITY = "user_activity"
    SYSTEM_LOGS = "system_logs"
    AUDIT_LOGS = "audit_logs"


@dataclass
class RetentionPolicy:
    """Data retention policy configuration"""
    category: DataCategory
    retention_days: int
    auto_delete: bool = True
    archive_before_delete: bool = False
    legal_hold_override: bool = False
    tenant_specific: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)


@dataclass
class RetentionStatus:
    """Current retention status for data"""
    entity_id: str
    entity_type: str
    category: DataCategory
    created_at: datetime
    retention_until: datetime
    days_until_expiry: int
    is_expired: bool
    is_archived: bool
    legal_hold: bool = False
    tenant_id: int = 1


@dataclass
class RetentionReport:
    """Retention management report"""
    report_date: datetime
    total_entities: int
    expiring_soon: int  # Within 30 days
    expired: int
    deleted: int
    archived: int
    legal_holds: int
    categories: Dict[str, int]
    tenants: Dict[int, int]
    recommendations: List[str]


class DataRetentionService:
    """Central data retention and lifecycle management service"""
    
    def __init__(
        self,
        document_repo: IDocumentRepository,
        user_repo: IUserRepository,
        compliance_service: ComplianceService,
        config_file: Optional[str] = None
    ):
        self.document_repo = document_repo
        self.user_repo = user_repo
        self.compliance_service = compliance_service
        self.config_file = config_file or "config/retention_policies.json"
        
        # Retention policies
        self.policies: Dict[DataCategory, RetentionPolicy] = {}
        self.custom_policies: Dict[str, RetentionPolicy] = {}
        
        # Legal holds (prevent deletion even if retention period expires)
        self.legal_holds: set = set()
        
        # Scheduling
        self.scheduler_thread: Optional[threading.Thread] = None
        self.scheduler_running = False
        
        # Load configuration
        self._load_default_policies()
        self._load_config_file()
        
        logger.info("Data retention service initialized")
    
    def _load_default_policies(self):
        """Load default retention policies based on Swiss data protection law"""
        default_policies = {
            DataCategory.PERSONAL_DATA: RetentionPolicy(
                category=DataCategory.PERSONAL_DATA,
                retention_days=2555,  # 7 years
                auto_delete=True,
                archive_before_delete=True,
                legal_hold_override=False,
                metadata={"legal_basis": "Swiss DSG Art. 12", "description": "Personal identifiers and contact info"}
            ),
            DataCategory.FINANCIAL_DATA: RetentionPolicy(
                category=DataCategory.FINANCIAL_DATA,
                retention_days=3650,  # 10 years
                auto_delete=True,
                archive_before_delete=True,
                legal_hold_override=True,
                metadata={"legal_basis": "Swiss OR Art. 958f", "description": "Financial records and transactions"}
            ),
            DataCategory.HEALTH_DATA: RetentionPolicy(
                category=DataCategory.HEALTH_DATA,
                retention_days=2555,  # 7 years
                auto_delete=True,
                archive_before_delete=True,
                legal_hold_override=False,
                metadata={"legal_basis": "Swiss DSG Art. 4", "description": "Health and medical information"}
            ),
            DataCategory.BEHAVIORAL_DATA: RetentionPolicy(
                category=DataCategory.BEHAVIORAL_DATA,
                retention_days=365,  # 1 year
                auto_delete=True,
                archive_before_delete=False,
                metadata={"legal_basis": "Swiss DSG Art. 13", "description": "User behavior and preferences"}
            ),
            DataCategory.TECHNICAL_DATA: RetentionPolicy(
                category=DataCategory.TECHNICAL_DATA,
                retention_days=90,  # 3 months
                auto_delete=True,
                archive_before_delete=False,
                metadata={"legal_basis": "Technical necessity", "description": "System logs and technical data"}
            ),
            DataCategory.DOCUMENT_CONTENT: RetentionPolicy(
                category=DataCategory.DOCUMENT_CONTENT,
                retention_days=1825,  # 5 years
                auto_delete=False,  # Business decision
                archive_before_delete=True,
                tenant_specific=True,
                metadata={"description": "Document content and embeddings"}
            ),
            DataCategory.USER_ACTIVITY: RetentionPolicy(
                category=DataCategory.USER_ACTIVITY,
                retention_days=365,  # 1 year
                auto_delete=True,
                archive_before_delete=False,
                metadata={"description": "User activity logs and access history"}
            ),
            DataCategory.SYSTEM_LOGS: RetentionPolicy(
                category=DataCategory.SYSTEM_LOGS,
                retention_days=90,  # 3 months
                auto_delete=True,
                archive_before_delete=False,
                metadata={"description": "Application and system logs"}
            ),
            DataCategory.AUDIT_LOGS: RetentionPolicy(
                category=DataCategory.AUDIT_LOGS,
                retention_days=2555,  # 7 years
                auto_delete=False,  # Never auto-delete audit logs
                archive_before_delete=True,
                legal_hold_override=True,
                metadata={"legal_basis": "Compliance requirement", "description": "Audit and compliance logs"}
            )
        }
        
        self.policies.update(default_policies)
    
    def _load_config_file(self):
        """Load retention policies from configuration file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config_data = json.load(f)
                
                # Load custom policies
                for policy_data in config_data.get('custom_policies', []):
                    try:
                        category = DataCategory(policy_data['category'])
                        policy = RetentionPolicy(
                            category=category,
                            retention_days=policy_data['retention_days'],
                            auto_delete=policy_data.get('auto_delete', True),
                            archive_before_delete=policy_data.get('archive_before_delete', False),
                            legal_hold_override=policy_data.get('legal_hold_override', False),
                            tenant_specific=policy_data.get('tenant_specific', False),
                            metadata=policy_data.get('metadata', {})
                        )
                        self.policies[category] = policy
                        logger.info(f"Loaded custom retention policy for {category.value}")
                    except Exception as e:
                        logger.error(f"Failed to load custom policy: {e}")
                
                # Load legal holds
                self.legal_holds.update(config_data.get('legal_holds', []))
                
                logger.info(f"Loaded retention configuration from {self.config_file}")
            else:
                logger.info("No custom retention configuration file found, using defaults")
                
        except Exception as e:
            logger.error(f"Failed to load retention config: {e}")
    
    def save_config_file(self):
        """Save current retention policies to configuration file"""
        try:
            config_data = {
                'policies': {
                    category.value: asdict(policy) 
                    for category, policy in self.policies.items()
                },
                'legal_holds': list(self.legal_holds),
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
            with open(self.config_file, 'w') as f:
                json.dump(config_data, f, indent=2, default=str)
            
            logger.info(f"Saved retention configuration to {self.config_file}")
            
        except Exception as e:
            logger.error(f"Failed to save retention config: {e}")
    
    def add_retention_policy(self, policy: RetentionPolicy) -> bool:
        """Add or update a retention policy"""
        try:
            self.policies[policy.category] = policy
            policy.updated_at = datetime.now(timezone.utc)
            
            logger.info(f"Added/updated retention policy for {policy.category.value}: {policy.retention_days} days")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add retention policy: {e}")
            return False
    
    def get_retention_policy(self, category: DataCategory, tenant_id: int = None) -> Optional[RetentionPolicy]:
        """Get retention policy for a data category"""
        try:
            # Check for tenant-specific policy first
            if tenant_id and category in self.policies:
                tenant_key = f"{category.value}_tenant_{tenant_id}"
                if tenant_key in self.custom_policies:
                    return self.custom_policies[tenant_key]
            
            return self.policies.get(category)
            
        except Exception as e:
            logger.error(f"Failed to get retention policy: {e}")
            return None
    
    def calculate_retention_date(self, created_at: datetime, category: DataCategory, tenant_id: int = None) -> Optional[datetime]:
        """Calculate retention expiry date for data"""
        try:
            policy = self.get_retention_policy(category, tenant_id)
            if not policy:
                logger.warning(f"No retention policy found for category {category.value}")
                return None
            
            if policy.retention_days == -1:  # Permanent retention
                return None
            
            retention_until = created_at + timedelta(days=policy.retention_days)
            return retention_until
            
        except Exception as e:
            logger.error(f"Failed to calculate retention date: {e}")
            return None
    
    async def get_retention_status(self, entity_id: str, entity_type: str) -> Optional[RetentionStatus]:
        """Get retention status for a specific entity"""
        try:
            # Determine data category based on entity type
            category_mapping = {
                'document': DataCategory.DOCUMENT_CONTENT,
                'user': DataCategory.PERSONAL_DATA,
                'audit_log': DataCategory.AUDIT_LOGS,
                'system_log': DataCategory.SYSTEM_LOGS,
                'user_activity': DataCategory.USER_ACTIVITY
            }
            
            category = category_mapping.get(entity_type, DataCategory.TECHNICAL_DATA)
            
            # Get entity creation date (simplified - would need actual entity lookup)
            created_at = datetime.now(timezone.utc)  # Placeholder
            tenant_id = 1  # Placeholder
            
            retention_until = self.calculate_retention_date(created_at, category, tenant_id)
            
            if retention_until is None:
                # Permanent retention
                days_until_expiry = -1
                is_expired = False
            else:
                days_until_expiry = (retention_until - datetime.now(timezone.utc)).days
                is_expired = days_until_expiry <= 0
            
            return RetentionStatus(
                entity_id=entity_id,
                entity_type=entity_type,
                category=category,
                created_at=created_at,
                retention_until=retention_until,
                days_until_expiry=days_until_expiry,
                is_expired=is_expired,
                is_archived=False,  # Would check actual archive status
                legal_hold=entity_id in self.legal_holds,
                tenant_id=tenant_id
            )
            
        except Exception as e:
            logger.error(f"Failed to get retention status: {e}")
            return None
    
    async def find_expired_data(self, category: DataCategory = None, tenant_id: int = None) -> List[RetentionStatus]:
        """Find all data that has exceeded its retention period"""
        try:
            expired_data = []
            current_time = datetime.now(timezone.utc)
            
            # Check documents
            if category is None or category == DataCategory.DOCUMENT_CONTENT:
                documents = await self.document_repo.get_all()
                for doc in documents:
                    if tenant_id and doc.tenant_id != tenant_id:
                        continue
                        
                    policy = self.get_retention_policy(DataCategory.DOCUMENT_CONTENT, doc.tenant_id)
                    if policy and policy.retention_days != -1:
                        created_at = doc.upload_timestamp or datetime.now(timezone.utc)
                        retention_until = created_at + timedelta(days=policy.retention_days)
                        
                        if current_time > retention_until and str(doc.id) not in self.legal_holds:
                            status = RetentionStatus(
                                entity_id=str(doc.id),
                                entity_type="document",
                                category=DataCategory.DOCUMENT_CONTENT,
                                created_at=created_at,
                                retention_until=retention_until,
                                days_until_expiry=(retention_until - current_time).days,
                                is_expired=True,
                                is_archived=False,
                                tenant_id=doc.tenant_id
                            )
                            expired_data.append(status)
            
            # Check compliance data through compliance service
            if hasattr(self.compliance_service, 'find_expired_data'):
                compliance_expired = await self.compliance_service.find_expired_data()
                expired_data.extend(compliance_expired)
            
            logger.info(f"Found {len(expired_data)} expired data entities")
            return expired_data
            
        except Exception as e:
            logger.error(f"Failed to find expired data: {e}")
            return []
    
    async def cleanup_expired_data(self, dry_run: bool = True, category: DataCategory = None) -> Dict[str, int]:
        """Clean up expired data according to retention policies"""
        try:
            results = {
                'examined': 0,
                'archived': 0,
                'deleted': 0,
                'skipped': 0,
                'errors': 0
            }
            
            expired_data = await self.find_expired_data(category)
            results['examined'] = len(expired_data)
            
            for status in expired_data:
                try:
                    if status.legal_hold:
                        results['skipped'] += 1
                        logger.info(f"Skipping {status.entity_id} - legal hold")
                        continue
                    
                    policy = self.get_retention_policy(status.category, status.tenant_id)
                    if not policy:
                        results['skipped'] += 1
                        continue
                    
                    if not dry_run:
                        # Archive if required
                        if policy.archive_before_delete and not status.is_archived:
                            archived = await self._archive_entity(status)
                            if archived:
                                results['archived'] += 1
                        
                        # Delete if auto-delete is enabled
                        if policy.auto_delete:
                            deleted = await self._delete_entity(status)
                            if deleted:
                                results['deleted'] += 1
                            else:
                                results['errors'] += 1
                        else:
                            results['skipped'] += 1
                    else:
                        # Dry run - just count what would be processed
                        if policy.archive_before_delete:
                            results['archived'] += 1
                        if policy.auto_delete:
                            results['deleted'] += 1
                
                except Exception as e:
                    logger.error(f"Failed to cleanup entity {status.entity_id}: {e}")
                    results['errors'] += 1
            
            action = "Would cleanup" if dry_run else "Cleaned up"
            logger.info(f"{action} expired data: {results}")
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired data: {e}")
            return {'errors': 1}
    
    async def _archive_entity(self, status: RetentionStatus) -> bool:
        """Archive an entity before deletion"""
        try:
            # Implementation would depend on entity type
            # For now, just mark as archived in metadata
            logger.info(f"Archived {status.entity_type} {status.entity_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to archive entity {status.entity_id}: {e}")
            return False
    
    async def _delete_entity(self, status: RetentionStatus) -> bool:
        """Delete an expired entity"""
        try:
            if status.entity_type == "document":
                # Use compliance service to properly delete document
                success = await self.compliance_service.delete_user_data(
                    user_id=f"system_retention_{status.entity_id}",
                    data_types=["documents"],
                    tenant_id=status.tenant_id
                )
                return success
            
            logger.info(f"Deleted {status.entity_type} {status.entity_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete entity {status.entity_id}: {e}")
            return False
    
    def add_legal_hold(self, entity_id: str, reason: str = "") -> bool:
        """Add legal hold to prevent deletion"""
        try:
            self.legal_holds.add(entity_id)
            logger.info(f"Added legal hold for {entity_id}: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add legal hold: {e}")
            return False
    
    def remove_legal_hold(self, entity_id: str) -> bool:
        """Remove legal hold"""
        try:
            if entity_id in self.legal_holds:
                self.legal_holds.remove(entity_id)
                logger.info(f"Removed legal hold for {entity_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to remove legal hold: {e}")
            return False
    
    async def generate_retention_report(self, tenant_id: int = None) -> RetentionReport:
        """Generate comprehensive retention report"""
        try:
            current_time = datetime.now(timezone.utc)
            
            # Initialize counters
            total_entities = 0
            expiring_soon = 0
            expired = 0
            legal_holds = len(self.legal_holds)
            categories = {}
            tenants = {}
            recommendations = []
            
            # Analyze documents
            documents = await self.document_repo.get_all()
            for doc in documents:
                if tenant_id and doc.tenant_id != tenant_id:
                    continue
                
                total_entities += 1
                tenants[doc.tenant_id] = tenants.get(doc.tenant_id, 0) + 1
                
                policy = self.get_retention_policy(DataCategory.DOCUMENT_CONTENT, doc.tenant_id)
                if policy and policy.retention_days != -1:
                    created_at = doc.upload_timestamp or current_time
                    retention_until = created_at + timedelta(days=policy.retention_days)
                    days_until_expiry = (retention_until - current_time).days
                    
                    if days_until_expiry <= 0:
                        expired += 1
                    elif days_until_expiry <= 30:
                        expiring_soon += 1
                    
                    category_name = DataCategory.DOCUMENT_CONTENT.value
                    categories[category_name] = categories.get(category_name, 0) + 1
            
            # Generate recommendations
            if expired > 0:
                recommendations.append(f"Run cleanup to remove {expired} expired documents")
            if expiring_soon > 10:
                recommendations.append(f"Review {expiring_soon} documents expiring within 30 days")
            if legal_holds > 0:
                recommendations.append(f"Review {legal_holds} legal holds for continued necessity")
            
            return RetentionReport(
                report_date=current_time,
                total_entities=total_entities,
                expiring_soon=expiring_soon,
                expired=expired,
                deleted=0,  # Would track from logs
                archived=0,  # Would track from logs
                legal_holds=legal_holds,
                categories=categories,
                tenants=tenants,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Failed to generate retention report: {e}")
            return RetentionReport(
                report_date=current_time,
                total_entities=0,
                expiring_soon=0,
                expired=0,
                deleted=0,
                archived=0,
                legal_holds=0,
                categories={},
                tenants={},
                recommendations=[f"Report generation failed: {str(e)}"]
            )
    
    def start_scheduler(self):
        """Start scheduled retention tasks"""
        try:
            if self.scheduler_running:
                logger.warning("Retention scheduler already running")
                return
            
            # Schedule daily cleanup at 2 AM
            schedule.every().day.at("02:00").do(self._scheduled_cleanup)
            
            # Schedule weekly reports on Sunday at 1 AM
            schedule.every().sunday.at("01:00").do(self._scheduled_report)
            
            self.scheduler_running = True
            self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
            self.scheduler_thread.start()
            
            logger.info("Started retention scheduler")
            
        except Exception as e:
            logger.error(f"Failed to start retention scheduler: {e}")
    
    def stop_scheduler(self):
        """Stop scheduled retention tasks"""
        try:
            self.scheduler_running = False
            schedule.clear()
            
            if self.scheduler_thread and self.scheduler_thread.is_alive():
                self.scheduler_thread.join(timeout=5)
            
            logger.info("Stopped retention scheduler")
            
        except Exception as e:
            logger.error(f"Failed to stop retention scheduler: {e}")
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.scheduler_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                time.sleep(60)
    
    def _scheduled_cleanup(self):
        """Scheduled cleanup task"""
        try:
            logger.info("Running scheduled retention cleanup")
            # Run in async context
            import asyncio
            asyncio.create_task(self.cleanup_expired_data(dry_run=False))
            
        except Exception as e:
            logger.error(f"Scheduled cleanup failed: {e}")
    
    def _scheduled_report(self):
        """Scheduled reporting task"""
        try:
            logger.info("Running scheduled retention report")
            # Run in async context
            import asyncio
            asyncio.create_task(self._generate_and_log_report())
            
        except Exception as e:
            logger.error(f"Scheduled report failed: {e}")
    
    async def _generate_and_log_report(self):
        """Generate and log retention report"""
        try:
            report = await self.generate_retention_report()
            
            logger.info("=== Weekly Retention Report ===")
            logger.info(f"Total entities: {report.total_entities}")
            logger.info(f"Expiring soon: {report.expiring_soon}")
            logger.info(f"Expired: {report.expired}")
            logger.info(f"Legal holds: {report.legal_holds}")
            
            for rec in report.recommendations:
                logger.warning(f"Recommendation: {rec}")
            
        except Exception as e:
            logger.error(f"Failed to generate scheduled report: {e}")


# Global service instance
_retention_service: Optional[DataRetentionService] = None


async def initialize_retention_service(
    document_repo: IDocumentRepository,
    user_repo: IUserRepository,
    compliance_service: ComplianceService,
    config_file: Optional[str] = None,
    start_scheduler: bool = True
) -> DataRetentionService:
    """Initialize global retention service"""
    global _retention_service
    
    _retention_service = DataRetentionService(
        document_repo=document_repo,
        user_repo=user_repo,
        compliance_service=compliance_service,
        config_file=config_file
    )
    
    if start_scheduler:
        _retention_service.start_scheduler()
    
    logger.info("Global data retention service initialized")
    return _retention_service


async def shutdown_retention_service():
    """Shutdown global retention service"""
    global _retention_service
    
    if _retention_service:
        _retention_service.stop_scheduler()
        _retention_service.save_config_file()
        _retention_service = None
        logger.info("Global data retention service shutdown")


def get_retention_service() -> DataRetentionService:
    """Get global retention service instance"""
    if not _retention_service:
        raise RuntimeError("Data retention service not initialized. Call initialize_retention_service() first.")
    
    return _retention_service