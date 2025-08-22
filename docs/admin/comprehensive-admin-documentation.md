# Comprehensive Admin Interface Documentation
## Projekt Susi RAG System Administrative Guide

**Version:** 2.0  
**Last Updated:** January 2025  
**Document Status:** Production Ready  

---

## Table of Contents

### Section 9: Admin Dashboard (5 pages)
- [9.1 Access and Authentication Procedures](#91-access-and-authentication-procedures)
- [9.2 Dashboard Overview and Navigation](#92-dashboard-overview-and-navigation)
- [9.3 Real-time Monitoring Capabilities](#93-real-time-monitoring-capabilities)
- [9.4 Quick Actions and Management Tools](#94-quick-actions-and-management-tools)
- [9.5 Admin Dashboard Configuration](#95-admin-dashboard-configuration)

### Section 10: Document Management (8 pages)
- [10.1 Bulk Upload and Processing Workflows](#101-bulk-upload-and-processing-workflows)
- [10.2 Content Analysis and Quality Assessment](#102-content-analysis-and-quality-assessment)
- [10.3 Keyword Filtering and Management](#103-keyword-filtering-and-management)
- [10.4 Page/Row Extraction Configuration](#104-pagerow-extraction-configuration)
- [10.5 Batch Operations Overview](#105-batch-operations-overview)
- [10.6 Document Lifecycle Management](#106-document-lifecycle-management)
- [10.7 Storage and Encryption Management](#107-storage-and-encryption-management)
- [10.8 Document Management APIs](#108-document-management-apis)

### Section 11: Page Citation Configuration (5 pages)
- [11.1 German Localization Settings](#111-german-localization-settings)
- [11.2 Citation Format Configuration](#112-citation-format-configuration)
- [11.3 Document Type Detection](#113-document-type-detection)
- [11.4 Metadata Extraction Setup](#114-metadata-extraction-setup)
- [11.5 Testing and Validation Procedures](#115-testing-and-validation-procedures)

### Section 12: Model & Database Management (4 pages)
- [12.1 Ollama Model Management](#121-ollama-model-management)
- [12.2 Database Configuration Options](#122-database-configuration-options)
- [12.3 Performance Monitoring](#123-performance-monitoring)
- [12.4 Backup and Recovery Procedures](#124-backup-and-recovery-procedures)

### Section 13: System Monitoring (3 pages)
- [13.1 Health Monitoring and Analytics](#131-health-monitoring-and-analytics)
- [13.2 Performance Metrics Tracking](#132-performance-metrics-tracking)
- [13.3 Error Analysis and Reporting](#133-error-analysis-and-reporting)

---

## Section 9: Admin Dashboard

### 9.1 Access and Authentication Procedures

#### 9.1.1 Authentication Methods

The Projekt Susi RAG system provides multiple authentication methods for administrative access:

**Web Interface Authentication:**
- **Development Mode:** Simple password authentication using environment variable `NEXT_PUBLIC_CMS_PASSWORD`
- **Production Mode:** Multi-factor authentication with SSO integration
- **Default Access:** Navigate to `/admin/cms` for content management interface

**Authentication Flow:**
```javascript
// Simple auth check for CMS access
const checkAuth = () => {
  const isAuth = localStorage.getItem('cms_auth') === 'true' || 
                 process.env.NODE_ENV === 'development'
  if (!isAuth) {
    const password = prompt('Enter CMS password:')
    if (password === 'admin' || password === process.env.NEXT_PUBLIC_CMS_PASSWORD) {
      localStorage.setItem('cms_auth', 'true')
    } else {
      router.push('/')
    }
  }
}
```

**API Authentication:**
- **Bearer Token:** Use `Authorization: Bearer <token>` header
- **Development Token:** Default token "dev" for development environments
- **Production:** JWT tokens with proper expiration and refresh mechanisms

**SSO Integration:**
The system supports Single Sign-On through the SSO service:

```python
from core.services.sso_service import SSOService

# SSO provider configuration
sso_providers = {
    'oauth2': {
        'provider': 'oauth2',
        'client_id': 'your-client-id',
        'client_secret': 'your-client-secret',
        'authorization_url': 'https://provider.com/oauth/authorize',
        'token_url': 'https://provider.com/oauth/token'
    }
}
```

#### 9.1.2 Access Control and Permissions

**Role-Based Access Control (RBAC):**
- **Super Admin:** Full system access including model management and configuration
- **Content Manager:** Document management and content operations
- **Monitor:** Read-only access to monitoring and analytics
- **Tenant Admin:** Access limited to specific tenant resources

**Permission Matrix:**
| Resource | Super Admin | Content Manager | Monitor | Tenant Admin |
|----------|-------------|-----------------|---------|--------------|
| Model Management | ✓ | ✗ | ✗ | ✗ |
| Document Management | ✓ | ✓ | ✗ | ✓ (tenant-scoped) |
| System Configuration | ✓ | ✗ | ✗ | ✗ |
| Monitoring Dashboard | ✓ | ✓ | ✓ | ✓ (tenant-scoped) |
| Audit Logs | ✓ | ✗ | ✓ | ✓ (tenant-scoped) |

#### 9.1.3 Security Best Practices

**Authentication Security:**
- Always use HTTPS in production environments
- Implement proper session timeout (default: 24 hours)
- Use strong passwords with minimum complexity requirements
- Enable audit logging for all administrative actions

**Network Security:**
- Restrict admin interface access to authorized IP ranges
- Use VPN for remote administrative access
- Implement rate limiting on authentication endpoints

**Session Management:**
```python
# Session configuration
SESSION_CONFIG = {
    'timeout': 86400,  # 24 hours
    'secure': True,    # HTTPS only
    'httponly': True,  # No JavaScript access
    'samesite': 'strict'
}
```

#### 9.1.4 Multi-Factor Authentication Setup

**Enabling MFA:**
1. Navigate to User Profile Settings
2. Select "Enable Multi-Factor Authentication"
3. Scan QR code with authenticator app
4. Enter verification code to confirm setup

**Supported MFA Methods:**
- TOTP (Time-based One-Time Password) via apps like Google Authenticator
- SMS-based verification (production environments)
- Hardware security keys (FIDO2/WebAuthn)

**MFA Recovery:**
- Generate and securely store recovery codes
- Admin override capability for account recovery
- Backup authentication methods configuration

#### 9.1.5 Audit Trail and Compliance

**Authentication Events Logged:**
- Successful and failed login attempts
- Password changes and resets
- MFA setup and usage
- Session timeout and manual logouts
- Permission changes and role assignments

**Audit Log Format:**
```json
{
  "timestamp": "2025-01-28T10:30:00Z",
  "event_type": "ADMIN_LOGIN",
  "user_id": "admin@company.com",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "mfa_used": true,
  "session_id": "sess_abc123"
}
```

**Compliance Features:**
- GDPR-compliant data handling
- FINMA regulatory compliance for Swiss financial institutions
- SOC 2 Type II controls implementation
- Data retention policies with automatic cleanup

---

### 9.2 Dashboard Overview and Navigation

#### 9.2.1 Main Dashboard Layout

The admin dashboard provides a comprehensive overview of system status and quick access to management functions.

**Dashboard Components:**
- **Header Navigation:** Quick access to main sections and user profile
- **System Status Panel:** Real-time health indicators and alerts
- **Metrics Overview:** Key performance indicators and usage statistics
- **Quick Actions:** Frequently used administrative functions
- **Recent Activity:** Latest system events and user actions

**Responsive Design:**
- Desktop: Full feature set with multi-column layout
- Tablet: Collapsed navigation with priority content visible
- Mobile: Stack layout with hamburger menu navigation

#### 9.2.2 Navigation Structure

**Primary Navigation Menu:**
```
├── Dashboard (Overview)
├── Document Management
│   ├── Upload & Processing
│   ├── Content Analysis
│   ├── Batch Operations
│   └── Storage Management
├── Model Management
│   ├── Ollama Models
│   ├── Model Configuration
│   └── Performance Tuning
├── System Configuration
│   ├── Database Settings
│   ├── Authentication
│   └── Localization
├── Monitoring
│   ├── Performance Metrics
│   ├── Error Tracking
│   └── Audit Logs
└── User Management
    ├── Roles & Permissions
    ├── Tenant Management
    └── SSO Configuration
```

**Breadcrumb Navigation:**
- Shows current location in admin hierarchy
- Clickable path elements for quick navigation
- Context-aware based on current admin section

#### 9.2.3 Dashboard Widgets and Cards

**System Health Card:**
```typescript
interface SystemHealthWidget {
  overall_status: 'healthy' | 'warning' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  last_updated: string;
}
```

**Performance Metrics Card:**
- Average response time (1min, 5min, 15min windows)
- Error rate trending
- Query volume and success rates
- Cache hit ratios

**Recent Activity Feed:**
- Document uploads and processing status
- Model switches and configuration changes
- User authentication events
- System alerts and warnings

#### 9.2.4 Customizable Dashboard

**Widget Configuration:**
- Drag-and-drop widget rearrangement
- Show/hide widgets based on user role
- Custom time ranges for metrics display
- Personalized alert thresholds

**Dashboard Layouts:**
- **Operations View:** Focus on monitoring and alerts
- **Content Manager View:** Document-centric widgets
- **Developer View:** Technical metrics and logs
- **Executive View:** High-level KPIs and trends

#### 9.2.5 Keyboard Shortcuts and Accessibility

**Navigation Shortcuts:**
- `Ctrl + /` - Show keyboard shortcuts help
- `Alt + D` - Return to dashboard
- `Alt + M` - Model management
- `Alt + U` - Document upload
- `Esc` - Close modals and overlays

**Accessibility Features:**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- High contrast mode support
- Keyboard-only navigation capability
- Focus indicators and skip links

---

### 9.3 Real-time Monitoring Capabilities

#### 9.3.1 Live Performance Monitoring

The system provides comprehensive real-time monitoring through WebSocket connections and automated data collection.

**Real-time Metrics Display:**
```typescript
interface LiveMetrics {
  response_time: {
    current: number;
    avg_1min: number;
    avg_5min: number;
    p95: number;
  };
  error_rate: number;
  active_queries: number;
  system_resources: {
    cpu_percent: number;
    memory_percent: number;
    disk_usage: number;
  };
  timestamp: number;
}
```

**WebSocket Connection:**
```javascript
// Real-time monitoring connection
const monitoringSocket = new WebSocket('ws://localhost:8765');

monitoringSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'performance_metric':
      updatePerformanceChart(data);
      break;
    case 'system_metrics':
      updateSystemStatus(data);
      break;
    case 'alert_status':
      updateAlertPanel(data);
      break;
  }
};
```

#### 9.3.2 Alert and Notification System

**Alert Types:**
- **Critical:** System failures, security breaches
- **Warning:** Performance degradation, resource limits
- **Info:** Successful operations, configuration changes

**Alert Channels:**
```python
# Alert configuration
alert_config = {
    'webhook_urls': [
        'https://hooks.slack.com/your-webhook-url',
        'https://your-teams-webhook-url'
    ],
    'email_config': {
        'smtp_host': 'smtp.gmail.com',
        'smtp_port': 587,
        'from': 'monitoring@yourcompany.com',
        'to': 'ops-team@yourcompany.com'
    }
}
```

**Alert Thresholds:**
- Response Time Alert: > 100ms average
- Response Time Rollback: > 150ms average
- Error Rate Alert: > 5%
- Error Rate Rollback: > 15%
- CPU Usage Alert: > 80%
- Memory Usage Alert: > 85%

#### 9.3.3 Automated Health Checks

**Health Check Endpoints:**
```python
# Health check configuration
health_checks = {
    'api_health': '/api/health',
    'database': '/health/database',
    'ollama_models': '/health/models',
    'cache_system': '/health/cache'
}
```

**Health Check Frequency:**
- API endpoints: Every 5 seconds
- Database connections: Every 30 seconds
- Model availability: Every 60 seconds
- External dependencies: Every 120 seconds

#### 9.3.4 Performance Trend Analysis

**Metric Collection:**
```python
@dataclass
class PerformanceMetric:
    timestamp: float
    response_time: float
    status_code: int
    error_message: Optional[str]
    endpoint: str
    method: str
    user_agent: str = "monitor"
```

**Trend Visualization:**
- Real-time line charts for response times
- Error rate trending with moving averages
- Resource usage heat maps
- Query volume patterns and predictions

#### 9.3.5 Automated Rollback System

**Rollback Triggers:**
```python
rollback_conditions = {
    'consecutive_failures': 5,
    'response_time_threshold': 0.150,  # 150ms
    'error_rate_threshold': 0.15,     # 15%
    'monitoring_window': 60           # seconds
}
```

**Rollback Process:**
1. **Detection:** Monitor identifies degraded performance
2. **Validation:** Confirms issue across multiple metrics
3. **Alert:** Sends critical alert to operations team
4. **Rollback:** Executes automated rollback procedure
5. **Verification:** Confirms system stability post-rollback
6. **Notification:** Reports rollback completion and status

---

### 9.4 Quick Actions and Management Tools

#### 9.4.1 One-Click Operations

**System Management:**
- **Restart Services:** Graceful restart of RAG components
- **Clear Cache:** Redis cache flush with warming procedures
- **Reload Configuration:** Hot reload of system settings
- **Health Check:** Manual system health verification

**Model Management:**
```typescript
interface QuickModelActions {
  switch_model: (modelKey: string) => Promise<ModelSwitchResult>;
  install_model: (modelName: string) => Promise<InstallationResult>;
  check_availability: (modelKey: string) => Promise<AvailabilityStatus>;
  download_config: () => Promise<ConfigBackup>;
}
```

**Document Operations:**
- **Bulk Upload:** Drag-and-drop multiple file upload
- **Processing Queue:** View and manage document processing status
- **Emergency Stop:** Halt all document processing operations
- **Cleanup Tools:** Remove problematic or outdated documents

#### 9.4.2 Bulk Operations Interface

**Bulk Document Management:**
```jsx
const BulkOperations = () => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [operation, setOperation] = useState('');
  
  const handleBulkOperation = async () => {
    switch(operation) {
      case 'delete':
        await bulkDeleteDocuments(selectedDocuments);
        break;
      case 'reprocess':
        await bulkReprocessDocuments(selectedDocuments);
        break;
      case 'export':
        await bulkExportDocuments(selectedDocuments);
        break;
    }
  };
  
  return (
    <div className="bulk-operations">
      <DocumentSelector onSelectionChange={setSelectedDocuments} />
      <OperationSelector onOperationChange={setOperation} />
      <ExecuteButton onClick={handleBulkOperation} />
    </div>
  );
};
```

#### 9.4.3 Configuration Management

**Quick Configuration Updates:**
- Model switching with availability checking
- Cache configuration adjustments
- Authentication settings modification
- Localization and language updates

**Configuration Backup and Restore:**
```python
@router.get("/config/download")
async def download_config():
    """Download current configuration as backup"""
    config_path = Path("config/llm_config.yaml")
    with open(config_path, "r") as f:
        config_content = f.read()
    
    return Response(
        content=config_content,
        media_type="application/x-yaml",
        headers={
            "Content-Disposition": "attachment; filename=llm_config_backup.yaml"
        }
    )
```

#### 9.4.4 Emergency Response Tools

**Crisis Management Panel:**
- **System Lockdown:** Disable all external access temporarily
- **Emergency Rollback:** Immediate rollback to last known good state
- **Alert Escalation:** Notify emergency response team
- **Maintenance Mode:** Enable maintenance page with custom messaging

**Incident Response Workflow:**
1. **Incident Detection:** Automated or manual incident identification
2. **Impact Assessment:** Evaluate affected systems and users
3. **Response Activation:** Execute appropriate emergency procedures
4. **Status Communication:** Update stakeholders and users
5. **Resolution Tracking:** Monitor progress and document actions

#### 9.4.5 Integrated Tool Access

**External Tool Integration:**
- **Prometheus Dashboard:** Direct link to metrics visualization
- **Grafana Dashboards:** Custom RAG system monitoring views
- **Log Analysis:** ELK stack integration for log exploration
- **Database Administration:** phpMyAdmin or similar tool access

**Tool Launch Configuration:**
```yaml
external_tools:
  prometheus:
    url: "http://localhost:9090"
    description: "System metrics and alerting"
  grafana:
    url: "http://localhost:3000"
    description: "Performance dashboards"
  logs:
    url: "http://localhost:5601"
    description: "Centralized log analysis"
```

---

### 9.5 Admin Dashboard Configuration

#### 9.5.1 Dashboard Customization Options

**Layout Configuration:**
```typescript
interface DashboardConfig {
  layout: 'grid' | 'flex' | 'masonry';
  columns: number;
  widget_spacing: number;
  refresh_interval: number;
  auto_refresh: boolean;
  theme: 'light' | 'dark' | 'auto';
}
```

**Widget Management:**
- Add/remove widgets from dashboard
- Resize widgets with drag handles
- Configure widget-specific settings
- Save custom dashboard layouts per user

#### 9.5.2 User Preferences and Profiles

**Personal Settings:**
- Dashboard layout preferences
- Default time ranges for metrics
- Notification preferences and thresholds
- Timezone and locale settings

**Profile Management:**
```python
@dataclass
class AdminUserProfile:
    user_id: str
    display_name: str
    role: str
    preferences: Dict[str, Any]
    dashboard_config: DashboardConfig
    notification_settings: NotificationConfig
    last_login: datetime
    created_at: datetime
```

#### 9.5.3 System-wide Configuration

**Global Dashboard Settings:**
- Default widgets for new users
- Maximum refresh rate limits
- Available widget types per role
- Mandatory widgets for compliance

**Configuration Storage:**
```yaml
dashboard:
  global_settings:
    default_refresh_interval: 30
    max_widgets_per_dashboard: 20
    mandatory_widgets:
      - system_health
      - security_alerts
  widget_permissions:
    monitor:
      - performance_metrics
      - system_health
      - recent_activity
    content_manager:
      - document_status
      - upload_queue
      - content_metrics
    super_admin:
      - all_widgets
```

#### 9.5.4 Theme and Appearance

**Theme Options:**
- Light mode with blue accent colors
- Dark mode with orange highlights
- High contrast for accessibility
- Custom color schemes for branding

**Responsive Breakpoints:**
```css
.admin-dashboard {
  /* Desktop: 1200px+ */
  @media (min-width: 1200px) {
    .widget-grid { grid-template-columns: repeat(4, 1fr); }
  }
  
  /* Tablet: 768px - 1199px */
  @media (min-width: 768px) and (max-width: 1199px) {
    .widget-grid { grid-template-columns: repeat(2, 1fr); }
  }
  
  /* Mobile: < 768px */
  @media (max-width: 767px) {
    .widget-grid { grid-template-columns: 1fr; }
  }
}
```

#### 9.5.5 Integration and API Configuration

**Third-party Integrations:**
- Slack webhook configuration for alerts
- Microsoft Teams notifications
- Email SMTP settings for reports
- Custom webhook endpoints

**API Access Configuration:**
```python
api_config = {
    'rate_limiting': {
        'requests_per_minute': 60,
        'burst_allowance': 10
    },
    'authentication': {
        'required': True,
        'token_expiry': 3600,
        'refresh_enabled': True
    },
    'cors_settings': {
        'allowed_origins': ['http://localhost:3000'],
        'allowed_methods': ['GET', 'POST', 'PUT', 'DELETE'],
        'allow_credentials': True
    }
}
```

---

## Section 10: Document Management

### 10.1 Bulk Upload and Processing Workflows

#### 10.1.1 Bulk Upload Interface

The document management system provides a comprehensive bulk upload interface designed for efficient processing of large document collections.

**Upload Interface Features:**
- **Drag-and-Drop:** Multi-file selection with visual feedback
- **Progress Tracking:** Real-time upload progress for each file
- **Validation:** Client-side file type and size validation
- **Queue Management:** Prioritization and scheduling of upload batches

```typescript
interface BulkUploadConfig {
  max_files_per_batch: number;
  supported_formats: string[];
  max_file_size: number;
  auto_process: boolean;
  notification_settings: NotificationConfig;
}

const defaultUploadConfig: BulkUploadConfig = {
  max_files_per_batch: 100,
  supported_formats: ['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx'],
  max_file_size: 52428800, // 50MB
  auto_process: true,
  notification_settings: {
    on_completion: true,
    on_error: true,
    email_notifications: false
  }
};
```

**Supported File Formats:**
- **Documents:** PDF, Word (.docx), Text (.txt), Markdown (.md)
- **Spreadsheets:** Excel (.xlsx), CSV
- **Archives:** ZIP containing supported document types
- **Images:** PDF extraction from scanned documents

#### 10.1.2 Upload Validation and Security

**File Validation Process:**
```python
async def validate_upload(filename: str, content: bytes, content_type: str) -> Tuple[bool, str]:
    """Comprehensive file validation"""
    
    # File extension validation
    allowed_extensions = {".pdf", ".docx", ".txt", ".md", ".csv", ".xlsx"}
    file_ext = Path(filename).suffix.lower()
    if file_ext not in allowed_extensions:
        return False, f"File type {file_ext} not allowed"
    
    # File size validation
    max_size = 50 * 1024 * 1024  # 50MB
    if len(content) > max_size:
        return False, f"File size exceeds maximum {max_size} bytes"
    
    # Security validations
    if any(sequence in filename for sequence in ["..", "../", "..\\"]):
        return False, "Path traversal attempt detected"
    
    # Content validation
    if len(content) == 0:
        return False, "File cannot be empty"
    
    return True, "Valid file"
```

**Security Features:**
- **Path Traversal Protection:** Prevents directory traversal attacks
- **Filename Sanitization:** Removes dangerous characters and sequences
- **Content Scanning:** Basic malware detection and content analysis
- **Duplicate Detection:** SHA-256 hash-based deduplication

#### 10.1.3 Processing Workflow Engine

**Document Processing Pipeline:**
```python
@dataclass
class ProcessingStage:
    name: str
    handler: Callable
    timeout: int
    retry_count: int
    depends_on: List[str]

processing_pipeline = [
    ProcessingStage("validation", validate_document, 30, 2, []),
    ProcessingStage("text_extraction", extract_text_content, 120, 3, ["validation"]),
    ProcessingStage("content_analysis", analyze_content, 60, 2, ["text_extraction"]),
    ProcessingStage("chunking", create_document_chunks, 90, 2, ["content_analysis"]),
    ProcessingStage("embedding", generate_embeddings, 300, 1, ["chunking"]),
    ProcessingStage("indexing", store_in_vector_db, 60, 3, ["embedding"])
]
```

**Workflow States:**
- **Queued:** Document added to processing queue
- **Processing:** Active processing through pipeline stages
- **Completed:** Successfully processed and indexed
- **Failed:** Processing failed with error details
- **Paused:** Temporarily halted for review
- **Retry:** Automatic retry after transient failure

#### 10.1.4 Batch Processing Management

**Batch Configuration:**
```yaml
batch_processing:
  max_concurrent_files: 10
  chunk_size: 500
  overlap_size: 50
  embedding_model: "all-MiniLM-L6-v2"
  processing_timeout: 1800  # 30 minutes
  retry_policy:
    max_retries: 3
    backoff_factor: 2
    initial_delay: 5
```

**Queue Management Interface:**
- **Priority Assignment:** High/Normal/Low priority processing
- **Resource Allocation:** CPU and memory limits per batch
- **Scheduling:** Time-based processing schedules
- **Monitoring:** Real-time progress tracking and ETA calculation

#### 10.1.5 Error Handling and Recovery

**Error Categories:**
- **Validation Errors:** File format, size, or content issues
- **Processing Errors:** Text extraction or analysis failures
- **System Errors:** Resource limitations or infrastructure issues
- **Network Errors:** Storage or database connectivity problems

**Recovery Mechanisms:**
```python
class ProcessingErrorHandler:
    def __init__(self):
        self.retry_strategies = {
            'transient_error': ExponentialBackoff(max_retries=3),
            'validation_error': NoRetry(),
            'system_error': LinearBackoff(max_retries=5),
            'network_error': ExponentialBackoff(max_retries=10)
        }
    
    async def handle_error(self, error: ProcessingError, document_id: int):
        strategy = self.retry_strategies.get(error.category)
        if strategy.should_retry(error.attempt_count):
            await self.schedule_retry(document_id, strategy.next_delay())
        else:
            await self.mark_as_failed(document_id, error)
```

---

### 10.2 Content Analysis and Quality Assessment

#### 10.2.1 Automated Content Analysis

The system performs comprehensive content analysis to ensure document quality and relevance for the RAG system.

**Analysis Components:**
```python
class ContentAnalyzer:
    def __init__(self):
        self.bio_waste_keywords = [
            "bioabfall", "bio waste", "organic waste", "kompost", 
            "grünabfall", "küchenabfälle", "obst", "gemüse",
            "fruit", "vegetable", "food waste"
        ]
        
        self.problematic_keywords = [
            "zero-hallucination", "guidelines for following",
            "only use information", "training instructions", "quelels"
        ]
        
        self.exclude_keywords = [
            "javascript", "console.log", "function", "cloud computing",
            "programming", "software", "algorithm"
        ]
```

**Content Classification:**
- **Bio Waste Content:** Municipal waste management documents
- **Training Instructions:** LLM training artifacts (flagged for removal)
- **Computer Science:** Programming and technical content (filtered)
- **Unknown:** General content requiring manual review

#### 10.2.2 Quality Metrics and Scoring

**Quality Assessment Criteria:**
```python
@dataclass
class QualityMetrics:
    content_length: int
    bio_waste_score: int
    problematic_score: int
    corruption_score: int
    language_detection: str
    readability_score: float
    relevance_score: float
    completeness_score: float
```

**Scoring Algorithm:**
```python
def calculate_quality_score(content: str) -> QualityMetrics:
    """Calculate comprehensive quality metrics"""
    
    content_lower = content.lower()
    
    # Bio waste relevance scoring
    bio_waste_score = sum(1 for keyword in bio_waste_keywords 
                         if keyword in content_lower)
    
    # Problematic content detection
    problematic_score = sum(1 for keyword in problematic_keywords 
                           if keyword in content_lower)
    
    # Corruption detection (encoding issues)
    corruption_score = content.count("�")
    
    # Content length assessment
    content_length = len(content.strip())
    
    # Language detection
    language = detect_language(content)
    
    return QualityMetrics(
        content_length=content_length,
        bio_waste_score=bio_waste_score,
        problematic_score=problematic_score,
        corruption_score=corruption_score,
        language_detection=language,
        readability_score=calculate_readability(content),
        relevance_score=calculate_relevance(content),
        completeness_score=assess_completeness(content)
    )
```

#### 10.2.3 Content Filtering Rules

**Acceptance Criteria:**
```yaml
content_filters:
  minimum_length: 100
  maximum_corruption_chars: 10
  required_bio_waste_score: 2
  maximum_problematic_score: 0
  supported_languages: ["de", "en"]
  minimum_relevance_score: 0.6
```

**Filtering Logic:**
```python
def should_accept_document(metrics: QualityMetrics) -> Tuple[bool, str]:
    """Determine if document should be accepted"""
    
    if metrics.problematic_score > 0:
        return False, "Contains problematic training instructions"
    
    if metrics.corruption_score > 10:
        return False, "Excessive encoding corruption detected"
    
    if metrics.content_length < 100:
        return False, "Content too short for meaningful analysis"
    
    if metrics.bio_waste_score < 2 and metrics.relevance_score < 0.6:
        return False, "Content not relevant to bio waste management"
    
    return True, "Document accepted for processing"
```

#### 10.2.4 Manual Review Interface

**Review Queue Management:**
- Documents flagged for manual review
- Reviewer assignment and workload balancing
- Review criteria and guidelines
- Approval/rejection workflow with comments

**Review Interface:**
```typescript
interface DocumentReviewItem {
  document_id: number;
  filename: string;
  upload_date: string;
  quality_metrics: QualityMetrics;
  flagged_reasons: string[];
  content_preview: string;
  reviewer_notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
}
```

#### 10.2.5 Quality Reporting and Analytics

**Quality Dashboard Metrics:**
- Document acceptance rate trends
- Common rejection reasons
- Quality score distributions
- Reviewer performance statistics

**Analytics Queries:**
```sql
-- Daily quality metrics summary
SELECT 
    DATE(upload_date) as date,
    COUNT(*) as total_documents,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
    AVG(quality_score) as avg_quality_score
FROM document_processing_logs
WHERE upload_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(upload_date)
ORDER BY date DESC;
```

---

### 10.3 Keyword Filtering and Management

#### 10.3.1 Keyword Filter Configuration

The system provides sophisticated keyword filtering capabilities for content classification and quality control.

**Filter Categories:**
```python
@dataclass
class KeywordFilterConfig:
    bio_waste_keywords: List[str]
    problematic_keywords: List[str]
    exclude_keywords: List[str]
    language_specific_filters: Dict[str, List[str]]
    custom_filters: Dict[str, List[str]]
```

**Filter Management Interface:**
```yaml
keyword_filters:
  bio_waste:
    de: ["bioabfall", "kompost", "grünabfall", "biomüll"]
    en: ["bio waste", "organic waste", "food waste", "compost"]
  
  problematic:
    - "zero-hallucination"
    - "guidelines for following"
    - "training instructions"
    - "additional guidelines"
  
  exclude:
    technical: ["javascript", "programming", "software"]
    irrelevant: ["cloud computing", "algorithm", "database"]
```

#### 10.3.2 Dynamic Filter Updates

**Real-time Filter Management:**
```python
class KeywordFilterManager:
    def __init__(self):
        self.filters = self.load_filters()
        self.update_callbacks = []
    
    async def update_filters(self, category: str, keywords: List[str]):
        """Update filter keywords with validation"""
        
        # Validate keywords
        validated_keywords = [kw.strip().lower() for kw in keywords if kw.strip()]
        
        # Update in memory
        self.filters[category] = validated_keywords
        
        # Persist to database
        await self.save_filters()
        
        # Notify subscribers
        for callback in self.update_callbacks:
            await callback(category, validated_keywords)
    
    def register_update_callback(self, callback: Callable):
        """Register callback for filter updates"""
        self.update_callbacks.append(callback)
```

#### 10.3.3 Advanced Pattern Matching

**Pattern Types:**
- **Exact Match:** Direct keyword matching
- **Fuzzy Match:** Levenshtein distance-based matching
- **Regex Patterns:** Complex pattern matching
- **Semantic Similarity:** Embedding-based similarity matching

**Pattern Configuration:**
```python
class AdvancedPatternMatcher:
    def __init__(self):
        self.exact_patterns = set()
        self.fuzzy_patterns = []
        self.regex_patterns = []
        self.semantic_threshold = 0.8
    
    def add_pattern(self, pattern: str, pattern_type: str, metadata: Dict):
        """Add pattern with specified type"""
        
        if pattern_type == "exact":
            self.exact_patterns.add(pattern.lower())
        elif pattern_type == "fuzzy":
            self.fuzzy_patterns.append((pattern, metadata.get('threshold', 0.8)))
        elif pattern_type == "regex":
            self.regex_patterns.append(re.compile(pattern, re.IGNORECASE))
    
    def match_content(self, content: str) -> List[PatternMatch]:
        """Find all pattern matches in content"""
        matches = []
        
        # Exact matches
        content_lower = content.lower()
        for pattern in self.exact_patterns:
            if pattern in content_lower:
                matches.append(PatternMatch(pattern, "exact", content.count(pattern)))
        
        # Fuzzy matches
        for pattern, threshold in self.fuzzy_patterns:
            fuzzy_matches = self.find_fuzzy_matches(content, pattern, threshold)
            matches.extend(fuzzy_matches)
        
        # Regex matches
        for regex_pattern in self.regex_patterns:
            regex_matches = regex_pattern.findall(content)
            if regex_matches:
                matches.append(PatternMatch(regex_pattern.pattern, "regex", len(regex_matches)))
        
        return matches
```

#### 10.3.4 Filter Performance Optimization

**Caching Strategy:**
```python
class FilterCache:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.local_cache = {}
        self.cache_ttl = 3600  # 1 hour
    
    async def get_filter_result(self, content_hash: str) -> Optional[FilterResult]:
        """Get cached filter result"""
        
        # Check local cache first
        if content_hash in self.local_cache:
            return self.local_cache[content_hash]
        
        # Check Redis cache
        cached_result = await self.redis.get(f"filter:{content_hash}")
        if cached_result:
            result = FilterResult.from_json(cached_result)
            self.local_cache[content_hash] = result
            return result
        
        return None
    
    async def cache_filter_result(self, content_hash: str, result: FilterResult):
        """Cache filter result"""
        
        # Store in local cache
        self.local_cache[content_hash] = result
        
        # Store in Redis with TTL
        await self.redis.setex(
            f"filter:{content_hash}",
            self.cache_ttl,
            result.to_json()
        )
```

#### 10.3.5 Filter Analytics and Reporting

**Filter Effectiveness Metrics:**
- Keyword match frequency
- False positive rates
- Processing time impact
- Filter update history

**Reporting Interface:**
```typescript
interface FilterAnalytics {
  keyword_statistics: {
    [keyword: string]: {
      match_count: number;
      document_count: number;
      last_match: string;
      effectiveness_score: number;
    }
  };
  
  filter_performance: {
    total_documents_processed: number;
    filtered_documents: number;
    false_positives: number;
    average_processing_time: number;
  };
  
  trending_keywords: Array<{
    keyword: string;
    frequency_change: number;
    relevance_score: number;
  }>;
}
```

---

### 10.4 Page/Row Extraction Configuration

#### 10.4.1 Document Structure Analysis

The system provides advanced document structure analysis for precise content extraction.

**Structure Detection:**
```python
class DocumentStructureAnalyzer:
    def __init__(self):
        self.pdf_analyzer = PDFStructureAnalyzer()
        self.excel_analyzer = ExcelStructureAnalyzer()
        self.word_analyzer = WordStructureAnalyzer()
    
    async def analyze_structure(self, file_path: Path, file_type: str) -> DocumentStructure:
        """Analyze document structure based on file type"""
        
        if file_type == "pdf":
            return await self.pdf_analyzer.analyze(file_path)
        elif file_type == "xlsx":
            return await self.excel_analyzer.analyze(file_path)
        elif file_type == "docx":
            return await self.word_analyzer.analyze(file_path)
        else:
            return await self.generic_analyzer.analyze(file_path)
```

**PDF Structure Analysis:**
```python
class PDFStructureAnalyzer:
    def __init__(self):
        self.page_detectors = [
            HeaderFooterDetector(),
            TableDetector(),
            FormFieldDetector(),
            TextBlockDetector()
        ]
    
    async def analyze(self, pdf_path: Path) -> PDFStructure:
        """Analyze PDF document structure"""
        
        structure = PDFStructure()
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_structure = PageStructure(page_number=page_num)
                
                # Extract text with positioning
                text_elements = self.extract_positioned_text(page)
                page_structure.text_elements = text_elements
                
                # Detect structural elements
                for detector in self.page_detectors:
                    elements = detector.detect(page, text_elements)
                    page_structure.add_elements(elements)
                
                structure.pages.append(page_structure)
        
        return structure
```

#### 10.4.2 Excel Data Extraction Configuration

**Sheet and Range Configuration:**
```python
@dataclass
class ExcelExtractionConfig:
    sheet_selection: str  # "all", "specific", "pattern"
    sheet_names: List[str]
    sheet_pattern: Optional[str]
    header_row: int
    data_start_row: int
    column_mapping: Dict[str, str]
    skip_empty_rows: bool
    merge_sheets: bool
```

**Excel Processor:**
```python
class ExcelProcessor:
    def __init__(self, config: ExcelExtractionConfig):
        self.config = config
    
    async def extract_data(self, excel_path: Path) -> List[ExcelData]:
        """Extract data from Excel file based on configuration"""
        
        workbook = openpyxl.load_workbook(excel_path, data_only=True)
        extracted_data = []
        
        # Determine sheets to process
        sheets_to_process = self.select_sheets(workbook, self.config)
        
        for sheet_name in sheets_to_process:
            sheet = workbook[sheet_name]
            
            # Extract headers
            headers = self.extract_headers(sheet, self.config.header_row)
            
            # Extract data rows
            data_rows = []
            for row_num in range(self.config.data_start_row, sheet.max_row + 1):
                row_data = self.extract_row(sheet, row_num, headers)
                
                if not self.config.skip_empty_rows or self.is_row_non_empty(row_data):
                    data_rows.append(row_data)
            
            extracted_data.append(ExcelData(
                sheet_name=sheet_name,
                headers=headers,
                data=data_rows
            ))
        
        return extracted_data
```

#### 10.4.3 Table Extraction from PDFs

**Table Detection and Extraction:**
```python
class PDFTableExtractor:
    def __init__(self):
        self.table_detector = TableDetector()
        self.cell_parser = CellParser()
    
    async def extract_tables(self, pdf_path: Path) -> List[TableData]:
        """Extract tables from PDF document"""
        
        tables = []
        
        # Use tabula-py for table detection and extraction
        try:
            import tabula
            
            # Detect tables in PDF
            table_areas = tabula.read_pdf(
                str(pdf_path),
                pages="all",
                output_format="dataframe",
                stream=True,
                guess=True
            )
            
            for page_num, page_tables in enumerate(table_areas):
                for table_index, df in enumerate(page_tables):
                    
                    # Clean and process table data
                    cleaned_df = self.clean_table_data(df)
                    
                    table_data = TableData(
                        page_number=page_num + 1,
                        table_index=table_index,
                        headers=list(cleaned_df.columns),
                        rows=cleaned_df.to_dict('records')
                    )
                    
                    tables.append(table_data)
        
        except ImportError:
            # Fallback to manual table detection
            tables = await self.manual_table_extraction(pdf_path)
        
        return tables
```

#### 10.4.4 Content Chunk Configuration

**Chunking Strategies:**
```python
class ChunkingStrategy:
    def __init__(self, strategy_type: str, config: Dict[str, Any]):
        self.strategy_type = strategy_type
        self.config = config
    
    def create_chunks(self, content: str) -> List[ContentChunk]:
        """Create chunks based on strategy"""
        
        if self.strategy_type == "fixed_size":
            return self.fixed_size_chunking(content)
        elif self.strategy_type == "sentence_based":
            return self.sentence_based_chunking(content)
        elif self.strategy_type == "paragraph_based":
            return self.paragraph_based_chunking(content)
        elif self.strategy_type == "semantic":
            return self.semantic_chunking(content)
        else:
            raise ValueError(f"Unknown chunking strategy: {self.strategy_type}")
```

**Chunking Configuration:**
```yaml
chunking_config:
  strategy: "sentence_based"
  max_chunk_size: 500
  overlap_size: 50
  min_chunk_size: 100
  preserve_paragraphs: true
  split_on_headers: true
  semantic_similarity_threshold: 0.75
```

#### 10.4.5 Metadata Preservation

**Metadata Extraction:**
```python
@dataclass
class DocumentMetadata:
    source_file: str
    page_number: Optional[int]
    section_title: Optional[str]
    table_reference: Optional[str]
    extraction_method: str
    confidence_score: float
    language: str
    creation_date: datetime
    last_modified: datetime
```

**Metadata Processing:**
```python
class MetadataProcessor:
    def __init__(self):
        self.extractors = {
            'pdf': PDFMetadataExtractor(),
            'docx': WordMetadataExtractor(),
            'xlsx': ExcelMetadataExtractor()
        }
    
    async def extract_metadata(self, file_path: Path, content: str) -> DocumentMetadata:
        """Extract comprehensive metadata from document"""
        
        file_type = file_path.suffix.lower()[1:]  # Remove the dot
        extractor = self.extractors.get(file_type)
        
        if extractor:
            return await extractor.extract(file_path, content)
        else:
            return self.create_basic_metadata(file_path, content)
```

---

### 10.5 Batch Operations Overview

#### 10.5.1 Batch Operation Types

The system supports comprehensive batch operations for efficient bulk document management.

**Available Batch Operations:**
```typescript
enum BatchOperationType {
  DELETE = 'delete',
  REPROCESS = 'reprocess',
  EXPORT = 'export',
  UPDATE_METADATA = 'update_metadata',
  CHANGE_STATUS = 'change_status',
  MOVE_TENANT = 'move_tenant',
  ANALYZE_QUALITY = 'analyze_quality',
  REGENERATE_EMBEDDINGS = 'regenerate_embeddings'
}
```

**Batch Operation Interface:**
```python
@dataclass
class BatchOperation:
    operation_id: str
    operation_type: BatchOperationType
    document_ids: List[int]
    parameters: Dict[str, Any]
    created_by: str
    created_at: datetime
    scheduled_for: Optional[datetime]
    status: str  # 'pending', 'running', 'completed', 'failed'
    progress: int  # 0-100
    error_details: Optional[str]
```

#### 10.5.2 Batch Selection and Filtering

**Document Selection Methods:**
- **Manual Selection:** Individual document checkbox selection
- **Filter-based Selection:** Select documents matching specific criteria
- **Query-based Selection:** SQL-like queries for complex selection
- **Saved Selections:** Reusable document sets for regular operations

**Selection Interface:**
```jsx
const BatchSelector = () => {
  const [selectionMethod, setSelectionMethod] = useState('manual');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});
  
  const handleSelectionChange = (method, criteria) => {
    switch(method) {
      case 'manual':
        // Manual checkbox selection
        break;
      case 'filter':
        // Apply filters and select matching documents
        selectByFilter(criteria);
        break;
      case 'query':
        // Execute custom query
        selectByQuery(criteria.query);
        break;
      case 'saved':
        // Load saved selection
        loadSavedSelection(criteria.selectionId);
        break;
    }
  };
  
  return (
    <div className="batch-selector">
      <SelectionMethodTabs onChange={setSelectionMethod} />
      <DocumentGrid 
        documents={documents}
        selection={selectedDocuments}
        onSelectionChange={setSelectedDocuments}
      />
      <SelectionSummary count={selectedDocuments.length} />
    </div>
  );
};
```

#### 10.5.3 Batch Processing Engine

**Processing Architecture:**
```python
class BatchProcessor:
    def __init__(self):
        self.task_queue = asyncio.Queue()
        self.workers = []
        self.progress_tracker = ProgressTracker()
        self.notification_service = NotificationService()
    
    async def execute_batch_operation(self, operation: BatchOperation):
        """Execute batch operation with progress tracking"""
        
        try:
            # Validate operation
            await self.validate_operation(operation)
            
            # Update status
            operation.status = 'running'
            await self.update_operation_status(operation)
            
            # Create work items
            work_items = self.create_work_items(operation)
            
            # Process with progress tracking
            completed = 0
            total = len(work_items)
            
            for item in work_items:
                try:
                    await self.process_work_item(item, operation)
                    completed += 1
                    
                    # Update progress
                    progress = int((completed / total) * 100)
                    operation.progress = progress
                    await self.update_operation_progress(operation)
                    
                except Exception as e:
                    await self.handle_item_error(item, e, operation)
            
            # Finalize operation
            operation.status = 'completed'
            await self.finalize_operation(operation)
            
        except Exception as e:
            operation.status = 'failed'
            operation.error_details = str(e)
            await self.update_operation_status(operation)
            raise
```

#### 10.5.4 Progress Monitoring and Control

**Real-time Progress Tracking:**
```typescript
interface BatchOperationProgress {
  operation_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress_percentage: number;
  items_total: number;
  items_completed: number;
  items_failed: number;
  estimated_completion: string;
  current_item: string;
  error_summary: string[];
}
```

**Progress Monitoring Component:**
```jsx
const BatchProgressMonitor = ({ operationId }) => {
  const [progress, setProgress] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  
  useEffect(() => {
    let interval;
    
    if (isPolling) {
      interval = setInterval(async () => {
        const progressData = await fetchBatchProgress(operationId);
        setProgress(progressData);
        
        if (['completed', 'failed', 'cancelled'].includes(progressData.status)) {
          setIsPolling(false);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [operationId, isPolling]);
  
  return (
    <div className="batch-progress-monitor">
      <ProgressBar 
        percentage={progress?.progress_percentage || 0}
        status={progress?.status}
      />
      <ProgressDetails progress={progress} />
      <ControlButtons 
        operationId={operationId}
        status={progress?.status}
        onCancel={handleCancel}
        onPause={handlePause}
        onResume={handleResume}
      />
    </div>
  );
};
```

#### 10.5.5 Error Handling and Rollback

**Error Recovery Strategies:**
```python
class BatchErrorHandler:
    def __init__(self):
        self.retry_policies = {
            'transient_error': RetryPolicy(max_attempts=3, backoff='exponential'),
            'validation_error': RetryPolicy(max_attempts=0),
            'permission_error': RetryPolicy(max_attempts=1),
            'system_error': RetryPolicy(max_attempts=5, backoff='linear')
        }
    
    async def handle_batch_error(self, operation: BatchOperation, error: Exception):
        """Handle errors during batch processing"""
        
        error_type = self.classify_error(error)
        retry_policy = self.retry_policies.get(error_type)
        
        if retry_policy.should_retry(operation.retry_count):
            # Schedule retry
            operation.retry_count += 1
            await self.schedule_retry(operation, retry_policy.get_delay())
        else:
            # Handle failure
            await self.handle_operation_failure(operation, error)
```

**Rollback Capabilities:**
```python
class BatchRollbackManager:
    def __init__(self):
        self.rollback_handlers = {
            'delete': self.rollback_delete_operation,
            'update_metadata': self.rollback_metadata_update,
            'change_status': self.rollback_status_change,
            'move_tenant': self.rollback_tenant_move
        }
    
    async def rollback_operation(self, operation: BatchOperation):
        """Rollback a completed batch operation"""
        
        rollback_handler = self.rollback_handlers.get(operation.operation_type)
        if not rollback_handler:
            raise ValueError(f"Rollback not supported for {operation.operation_type}")
        
        # Create rollback operation
        rollback_op = BatchOperation(
            operation_id=f"rollback_{operation.operation_id}",
            operation_type=f"rollback_{operation.operation_type}",
            document_ids=operation.document_ids,
            parameters=operation.rollback_parameters,
            created_by=operation.created_by,
            created_at=datetime.now()
        )
        
        await rollback_handler(rollback_op)
```

---

### 10.6 Document Lifecycle Management

#### 10.6.1 Document Status Management

**Document Lifecycle States:**
```python
class DocumentStatus(Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    QUARANTINED = "quarantined"
    ARCHIVED = "archived"
    DELETED = "deleted"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
```

**Status Transition Rules:**
```python
class DocumentLifecycleManager:
    def __init__(self):
        self.valid_transitions = {
            DocumentStatus.UPLOADING: [DocumentStatus.PROCESSING, DocumentStatus.FAILED],
            DocumentStatus.PROCESSING: [DocumentStatus.COMPLETED, DocumentStatus.FAILED, DocumentStatus.QUARANTINED],
            DocumentStatus.COMPLETED: [DocumentStatus.ARCHIVED, DocumentStatus.PENDING_REVIEW],
            DocumentStatus.FAILED: [DocumentStatus.PROCESSING, DocumentStatus.DELETED],
            DocumentStatus.QUARANTINED: [DocumentStatus.PROCESSING, DocumentStatus.DELETED],
            DocumentStatus.PENDING_REVIEW: [DocumentStatus.APPROVED, DocumentStatus.REJECTED],
            DocumentStatus.APPROVED: [DocumentStatus.ARCHIVED],
            DocumentStatus.REJECTED: [DocumentStatus.DELETED, DocumentStatus.PROCESSING],
            DocumentStatus.ARCHIVED: [DocumentStatus.DELETED],
            DocumentStatus.DELETED: []  # Terminal state
        }
    
    async def transition_status(self, document_id: int, new_status: DocumentStatus, 
                               user_id: str, reason: str = None):
        """Transition document to new status with validation"""
        
        current_doc = await self.doc_repo.get_by_id(document_id)
        current_status = DocumentStatus(current_doc.status)
        
        # Validate transition
        if new_status not in self.valid_transitions[current_status]:
            raise ValueError(f"Invalid transition from {current_status} to {new_status}")
        
        # Perform transition
        await self.doc_repo.update_status(document_id, new_status.value)
        
        # Log transition
        await self.audit_repo.log_status_transition(
            document_id, current_status, new_status, user_id, reason
        )
```

#### 10.6.2 Retention Policies

**Retention Configuration:**
```yaml
retention_policies:
  document_retention:
    default_retention_days: 2555  # 7 years
    minimum_retention_days: 365   # 1 year
    maximum_retention_days: 3650  # 10 years
  
  status_based_retention:
    completed: 2555    # 7 years
    failed: 90         # 3 months
    rejected: 365      # 1 year
    archived: 3650     # 10 years
  
  tenant_specific:
    financial_institution:
      retention_days: 3650
      compliance_requirements: ["FINMA", "GDPR"]
    municipal:
      retention_days: 2555
      compliance_requirements: ["Swiss_Municipal_Law"]
```

**Retention Enforcement:**
```python
class RetentionPolicyManager:
    def __init__(self):
        self.policies = self.load_retention_policies()
        self.compliance_handlers = {
            'FINMA': FinmaComplianceHandler(),
            'GDPR': GdprComplianceHandler(),
            'Swiss_Municipal_Law': SwissMunicipalComplianceHandler()
        }
    
    async def apply_retention_policy(self, document: Document):
        """Apply retention policy to document"""
        
        # Determine applicable policy
        policy = self.get_policy_for_document(document)
        
        # Calculate retention end date
        retention_end = document.upload_date + timedelta(days=policy.retention_days)
        
        # Update document with retention info
        await self.doc_repo.update(document.id, {
            'retention_end_date': retention_end,
            'retention_policy': policy.name,
            'compliance_requirements': policy.compliance_requirements
        })
        
        # Schedule deletion if needed
        if policy.auto_delete:
            await self.schedule_deletion(document.id, retention_end)
```

#### 10.6.3 Archival and Backup

**Archival Process:**
```python
class DocumentArchivalService:
    def __init__(self, s3_storage: S3StorageService):
        self.s3_storage = s3_storage
        self.archive_bucket = "document-archive"
        self.compression_enabled = True
    
    async def archive_document(self, document_id: int):
        """Archive document to long-term storage"""
        
        document = await self.doc_repo.get_by_id(document_id)
        
        # Read document content
        content = await self.read_document_content(document)
        
        # Compress if enabled
        if self.compression_enabled:
            content = await self.compress_content(content)
        
        # Generate archive key
        archive_key = self.generate_archive_key(document)
        
        # Upload to archive storage
        await self.s3_storage.upload_to_bucket(
            self.archive_bucket,
            archive_key,
            content,
            metadata={
                'original_document_id': str(document_id),
                'archive_date': datetime.now().isoformat(),
                'compression_used': str(self.compression_enabled),
                'original_size': str(len(content))
            }
        )
        
        # Update document record
        await self.doc_repo.update(document_id, {
            'status': DocumentStatus.ARCHIVED.value,
            'archive_location': f"s3://{self.archive_bucket}/{archive_key}",
            'archive_date': datetime.now()
        })
        
        # Remove from active storage if configured
        if self.remove_after_archive:
            await self.remove_from_active_storage(document)
```

#### 10.6.4 Data Retention Compliance

**Compliance Framework:**
```python
class ComplianceManager:
    def __init__(self):
        self.regulations = {
            'GDPR': GDPRComplianceRules(),
            'FINMA': FINMAComplianceRules(),
            'Swiss_DPA': SwissDataProtectionRules()
        }
    
    async def assess_compliance(self, document: Document) -> ComplianceAssessment:
        """Assess document against applicable regulations"""
        
        applicable_regs = self.determine_applicable_regulations(document)
        assessment = ComplianceAssessment()
        
        for reg_name in applicable_regs:
            regulation = self.regulations[reg_name]
            reg_assessment = await regulation.assess_document(document)
            assessment.add_regulation_assessment(reg_name, reg_assessment)
        
        return assessment
    
    async def ensure_compliance(self, document: Document):
        """Ensure document handling meets compliance requirements"""
        
        assessment = await self.assess_compliance(document)
        
        if not assessment.is_compliant():
            # Apply necessary compliance measures
            for requirement in assessment.get_requirements():
                await self.apply_compliance_measure(document, requirement)
```

#### 10.6.5 Deletion and Purging

**Secure Deletion Process:**
```python
class SecureDeletionService:
    def __init__(self):
        self.deletion_methods = {
            'soft_delete': self.soft_delete,
            'hard_delete': self.hard_delete,
            'secure_wipe': self.secure_wipe
        }
    
    async def delete_document(self, document_id: int, method: str = 'soft_delete'):
        """Delete document using specified method"""
        
        deletion_handler = self.deletion_methods.get(method)
        if not deletion_handler:
            raise ValueError(f"Unknown deletion method: {method}")
        
        document = await self.doc_repo.get_by_id(document_id)
        
        # Perform deletion
        await deletion_handler(document)
        
        # Log deletion
        await self.audit_repo.log_deletion(
            document_id, method, user_id="system"
        )
    
    async def secure_wipe(self, document: Document):
        """Securely wipe document data"""
        
        # Remove from vector database
        await self.vector_repo.delete_document(document.id)
        
        # Remove embeddings
        await self.embedding_repo.delete_by_document_id(document.id)
        
        # Remove chunks
        await self.chunk_repo.delete_by_document_id(document.id)
        
        # Secure file deletion
        if document.file_path and Path(document.file_path).exists():
            await self.secure_file_deletion(document.file_path)
        
        # Remove database record
        await self.doc_repo.delete(document.id)
```

---

### 10.7 Storage and Encryption Management

#### 10.7.1 Storage Architecture

**Multi-tier Storage System:**
```python
class StorageManager:
    def __init__(self):
        self.storage_tiers = {
            'hot': LocalFileSystemStorage(),
            'warm': S3StandardStorage(),
            'cold': S3InfrequentAccessStorage(),
            'archive': S3GlacierStorage()
        }
        
        self.tier_policies = {
            'new_documents': 'hot',
            'active_documents': 'warm',
            'inactive_documents': 'cold',
            'archived_documents': 'archive'
        }
```

**Storage Configuration:**
```yaml
storage_config:
  default_tier: "warm"
  encryption:
    enabled: true
    algorithm: "AES-256-GCM"
    key_rotation_days: 90
  
  tier_policies:
    hot_storage:
      location: "local"
      path: "/data/storage/hot"
      max_size_gb: 100
      max_age_days: 30
    
    warm_storage:
      location: "s3"
      bucket: "rag-documents-warm"
      storage_class: "STANDARD"
      max_age_days: 365
    
    cold_storage:
      location: "s3"
      bucket: "rag-documents-cold"
      storage_class: "STANDARD_IA"
      max_age_days: 2555
    
    archive_storage:
      location: "s3"
      bucket: "rag-documents-archive"
      storage_class: "GLACIER"
      retention_years: 10
```

#### 10.7.2 Encryption Management

**Encryption Service:**
```python
class EncryptionManager:
    def __init__(self):
        self.encryption_enabled = is_encryption_enabled()
        self.key_manager = KeyManager()
        self.cipher_suite = Fernet(self.key_manager.get_current_key())
    
    def encrypt_document_content(self, content: bytes, tenant_id: int) -> Tuple[bytes, bytes]:
        """Encrypt document content with tenant-specific salt"""
        
        if not self.encryption_enabled:
            return content, None
        
        # Generate salt for this document
        salt = os.urandom(32)
        
        # Derive encryption key using tenant ID and salt
        key = self.derive_key(tenant_id, salt)
        cipher = Fernet(key)
        
        # Encrypt content
        encrypted_content = cipher.encrypt(content)
        
        return encrypted_content, salt
    
    def decrypt_document_content(self, encrypted_content: bytes, 
                                salt: bytes, tenant_id: int) -> bytes:
        """Decrypt document content"""
        
        # Derive decryption key
        key = self.derive_key(tenant_id, salt)
        cipher = Fernet(key)
        
        # Decrypt content
        decrypted_content = cipher.decrypt(encrypted_content)
        
        return decrypted_content
```

**Key Management:**
```python
class KeyManager:
    def __init__(self):
        self.key_store = self.initialize_key_store()
        self.rotation_schedule = RotationSchedule()
    
    def get_current_key(self) -> bytes:
        """Get current encryption key"""
        return self.key_store.get_active_key()
    
    def rotate_keys(self):
        """Rotate encryption keys"""
        
        # Generate new key
        new_key = Fernet.generate_key()
        
        # Add to key store
        key_version = self.key_store.add_key(new_key)
        
        # Schedule re-encryption of documents
        self.schedule_document_re_encryption(key_version)
        
        # Update key rotation log
        self.log_key_rotation(key_version)
```

#### 10.7.3 Storage Optimization

**Deduplication Service:**
```python
class DeduplicationService:
    def __init__(self):
        self.hash_cache = HashCache()
        self.duplicate_tracker = DuplicateTracker()
    
    async def check_for_duplicates(self, content: bytes) -> Optional[Document]:
        """Check if document content already exists"""
        
        # Calculate content hash
        content_hash = hashlib.sha256(content).hexdigest()
        
        # Check hash cache first
        cached_doc = await self.hash_cache.get(content_hash)
        if cached_doc:
            return cached_doc
        
        # Check database
        existing_doc = await self.doc_repo.find_by_hash(content_hash)
        if existing_doc:
            # Cache for future lookups
            await self.hash_cache.set(content_hash, existing_doc)
            return existing_doc
        
        return None
    
    async def handle_duplicate(self, existing_doc: Document, new_upload: DocumentUpload):
        """Handle duplicate document discovery"""
        
        # Log duplicate attempt
        await self.duplicate_tracker.log_duplicate(existing_doc.id, new_upload)
        
        # Update reference count
        await self.doc_repo.increment_reference_count(existing_doc.id)
        
        # Return existing document reference
        return existing_doc
```

#### 10.7.4 Backup and Recovery

**Backup Strategy:**
```python
class BackupManager:
    def __init__(self):
        self.backup_destinations = {
            'primary': S3BackupDestination('backup-primary'),
            'secondary': S3BackupDestination('backup-secondary'),
            'offsite': ExternalBackupProvider()
        }
        
        self.backup_schedule = BackupSchedule()
    
    async def create_backup(self, backup_type: str = 'incremental'):
        """Create system backup"""
        
        backup_id = self.generate_backup_id()
        
        try:
            # Create backup manifest
            manifest = await self.create_backup_manifest()
            
            # Backup documents
            document_backup = await self.backup_documents(backup_type)
            
            # Backup database
            database_backup = await self.backup_database()
            
            # Backup configuration
            config_backup = await self.backup_configuration()
            
            # Create backup package
            backup_package = BackupPackage(
                backup_id=backup_id,
                manifest=manifest,
                documents=document_backup,
                database=database_backup,
                configuration=config_backup
            )
            
            # Store in backup destinations
            await self.store_backup(backup_package)
            
            # Update backup catalog
            await self.update_backup_catalog(backup_package)
            
        except Exception as e:
            await self.handle_backup_failure(backup_id, e)
            raise
```

#### 10.7.5 Storage Monitoring and Alerts

**Storage Metrics:**
```python
class StorageMonitor:
    def __init__(self):
        self.metrics_collector = MetricsCollector()
        self.alert_manager = AlertManager()
    
    async def collect_storage_metrics(self):
        """Collect storage utilization metrics"""
        
        metrics = StorageMetrics()
        
        # Local storage metrics
        local_usage = await self.get_local_storage_usage()
        metrics.local_storage = local_usage
        
        # S3 storage metrics
        s3_usage = await self.get_s3_storage_usage()
        metrics.s3_storage = s3_usage
        
        # Document count by tier
        tier_distribution = await self.get_tier_distribution()
        metrics.tier_distribution = tier_distribution
        
        # Storage costs
        cost_analysis = await self.calculate_storage_costs()
        metrics.costs = cost_analysis
        
        return metrics
    
    async def check_storage_alerts(self, metrics: StorageMetrics):
        """Check for storage-related alerts"""
        
        # Disk space alerts
        if metrics.local_storage.usage_percent > 85:
            await self.alert_manager.send_alert(
                'storage_high_usage',
                f"Local storage usage at {metrics.local_storage.usage_percent}%"
            )
        
        # Cost alerts
        if metrics.costs.monthly_cost > self.cost_threshold:
            await self.alert_manager.send_alert(
                'storage_cost_high',
                f"Monthly storage cost: ${metrics.costs.monthly_cost}"
            )
```

---

### 10.8 Document Management APIs

#### 10.8.1 REST API Endpoints

**Document Upload API:**
```python
@router.post("/api/v1/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    tenant_id: int = Header(None),
    metadata: Optional[str] = Form(None)
):
    """Upload single document with metadata"""
    
    try:
        # Validate file
        content = await file.read()
        is_valid, message = await doc_service.validate_upload(
            file.filename, content, file.content_type
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Process upload
        result = await doc_service.process_upload(
            file.filename, content, file.content_type
        )
        
        return DocumentUploadResponse(
            document_id=result.id,
            filename=result.filename,
            status=result.status,
            message="Document uploaded successfully"
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

**Bulk Upload API:**
```python
@router.post("/api/v1/documents/bulk-upload")
async def bulk_upload_documents(
    files: List[UploadFile] = File(...),
    batch_config: BulkUploadConfig = Depends()
):
    """Upload multiple documents in batch"""
    
    if len(files) > batch_config.max_files_per_batch:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum: {batch_config.max_files_per_batch}"
        )
    
    batch_id = generate_batch_id()
    upload_results = []
    
    for file in files:
        try:
            content = await file.read()
            result = await doc_service.process_upload(
                file.filename, content, file.content_type, batch_id=batch_id
            )
            upload_results.append(result)
            
        except Exception as e:
            upload_results.append(DocumentUploadResponse(
                filename=file.filename,
                status="failed",
                message=str(e)
            ))
    
    return BulkUploadResponse(
        batch_id=batch_id,
        total_files=len(files),
        results=upload_results
    )
```

#### 10.8.2 Document Query API

**Search and Filter API:**
```python
@router.get("/api/v1/documents")
async def list_documents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    tenant_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("upload_date"),
    sort_order: str = Query("desc")
):
    """List documents with filtering and pagination"""
    
    filter_params = DocumentFilter(
        status=status,
        content_type=content_type,
        tenant_id=tenant_id,
        search_term=search
    )
    
    sort_params = SortParams(
        field=sort_by,
        order=sort_order
    )
    
    pagination = PaginationParams(
        page=page,
        size=size
    )
    
    result = await doc_service.list_documents(
        filter_params, sort_params, pagination
    )
    
    return DocumentListResponse(
        documents=result.documents,
        total_count=result.total_count,
        page=page,
        size=size,
        total_pages=result.total_pages
    )
```

#### 10.8.3 Document Management Operations

**Document Status Management API:**
```python
@router.patch("/api/v1/documents/{document_id}/status")
async def update_document_status(
    document_id: int,
    status_update: DocumentStatusUpdate
):
    """Update document status"""
    
    try:
        result = await doc_service.update_document_status(
            document_id,
            status_update.new_status,
            status_update.reason,
            status_update.user_id
        )
        
        return StatusUpdateResponse(
            document_id=document_id,
            old_status=result.old_status,
            new_status=result.new_status,
            updated_at=result.updated_at,
            message="Status updated successfully"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**Batch Operations API:**
```python
@router.post("/api/v1/documents/batch")
async def execute_batch_operation(
    batch_request: BatchOperationRequest
):
    """Execute batch operation on documents"""
    
    # Validate operation
    if not batch_request.document_ids:
        raise HTTPException(status_code=400, detail="No documents specified")
    
    if len(batch_request.document_ids) > 1000:
        raise HTTPException(status_code=400, detail="Too many documents")
    
    # Create batch operation
    operation = BatchOperation(
        operation_id=generate_operation_id(),
        operation_type=batch_request.operation_type,
        document_ids=batch_request.document_ids,
        parameters=batch_request.parameters,
        created_by=batch_request.user_id,
        created_at=datetime.now()
    )
    
    # Queue for processing
    await batch_processor.queue_operation(operation)
    
    return BatchOperationResponse(
        operation_id=operation.operation_id,
        status="queued",
        estimated_duration=estimate_duration(operation),
        message="Batch operation queued for processing"
    )
```

#### 10.8.4 Analytics and Reporting API

**Document Analytics API:**
```python
@router.get("/api/v1/documents/analytics")
async def get_document_analytics(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    tenant_id: Optional[int] = Query(None),
    metrics: List[str] = Query(default=['count', 'size', 'processing_time'])
):
    """Get document analytics and metrics"""
    
    date_range = DateRange(
        start=start_date or date.today() - timedelta(days=30),
        end=end_date or date.today()
    )
    
    analytics = await analytics_service.generate_document_analytics(
        date_range, tenant_id, metrics
    )
    
    return DocumentAnalyticsResponse(
        date_range=date_range,
        metrics=analytics.metrics,
        trends=analytics.trends,
        summary=analytics.summary
    )
```

#### 10.8.5 Webhook and Event APIs

**Webhook Configuration API:**
```python
@router.post("/api/v1/webhooks")
async def create_webhook(webhook_config: WebhookConfig):
    """Create webhook for document events"""
    
    webhook = await webhook_service.create_webhook(
        url=webhook_config.url,
        events=webhook_config.events,
        secret=webhook_config.secret,
        headers=webhook_config.headers
    )
    
    return WebhookResponse(
        webhook_id=webhook.id,
        url=webhook.url,
        events=webhook.events,
        status="active",
        created_at=webhook.created_at
    )

@router.get("/api/v1/documents/{document_id}/events")
async def get_document_events(
    document_id: int,
    limit: int = Query(50, le=1000)
):
    """Get event history for document"""
    
    events = await event_service.get_document_events(document_id, limit)
    
    return DocumentEventsResponse(
        document_id=document_id,
        events=events,
        total_count=len(events)
    )
```

---

## Section 11: Page Citation Configuration

### 11.1 German Localization Settings

#### 11.1.1 Language Configuration

The Projekt Susi system provides comprehensive German localization for the Swiss market, including German language processing, locale-specific formatting, and regional compliance requirements.

**Language Settings:**
```yaml
localization:
  default_language: "de"
  supported_languages: ["de", "en", "fr", "it"]
  
  german_settings:
    locale: "de_CH"  # Swiss German
    date_format: "dd.MM.yyyy"
    time_format: "HH:mm"
    currency: "CHF"
    decimal_separator: "."
    thousands_separator: "'"
    
  swiss_specific:
    postal_code_format: "[0-9]{4}"
    phone_number_format: "+41 [0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}"
    iban_format: "CH[0-9]{2} [0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4} [0-9]{1}"
```

**Text Processing Configuration:**
```python
class GermanTextProcessor:
    def __init__(self):
        self.language_model = "de_core_news_lg"  # spaCy German model
        self.stemmer = GermanStemmer()
        self.stop_words = self.load_german_stop_words()
        
        # German-specific text processing
        self.umlaut_mapping = {
            'ä': 'ae', 'ö': 'oe', 'ü': 'ue',
            'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ß': 'ss'
        }
        
        # Swiss German variations
        self.swiss_variants = {
            'ss': 'ß',  # Eszett handling
            'dass': 'daß',  # Traditional spelling variations
        }
    
    def normalize_german_text(self, text: str) -> str:
        """Normalize German text for processing"""
        
        # Handle umlauts
        normalized = text
        for umlaut, replacement in self.umlaut_mapping.items():
            normalized = normalized.replace(umlaut, replacement)
        
        # Swiss German normalization
        normalized = self.normalize_swiss_german(normalized)
        
        return normalized
    
    def extract_german_keywords(self, text: str) -> List[str]:
        """Extract German keywords with language-specific processing"""
        
        # Process with spaCy
        doc = self.nlp(text)
        
        # Extract meaningful keywords
        keywords = []
        for token in doc:
            if (token.pos_ in ['NOUN', 'ADJ', 'VERB'] and 
                not token.is_stop and 
                len(token.text) > 2):
                
                # Add root form
                keywords.append(token.lemma_.lower())
        
        return list(set(keywords))
```

#### 11.1.2 Municipal Terminology

**Swiss Municipal Terms Configuration:**
```python
SWISS_MUNICIPAL_TERMS = {
    'waste_management': {
        'de': [
            'Abfallwirtschaft', 'Kehrichtabfuhr', 'Grünabfuhr',
            'Bioabfall', 'Sperrgut', 'Wertstoffsammlung',
            'Entsorgung', 'Recycling', 'Kompostierung'
        ],
        'locations': [
            'Gemeinde', 'Bezirk', 'Kanton', 'Kommune',
            'Verwaltung', 'Gemeindeverwaltung', 'Rathaus'
        ],
        'regulations': [
            'Abfallreglement', 'Gebührenordnung', 'Verordnung',
            'Bestimmungen', 'Vorschriften', 'Richtlinien'
        ]
    }
}

class SwissMunicipalTermProcessor:
    def __init__(self):
        self.terms_database = SWISS_MUNICIPAL_TERMS
        self.region_mappings = self.load_regional_mappings()
    
    def identify_municipal_content(self, text: str) -> MunicipalContentAnalysis:
        """Identify municipal waste management content"""
        
        analysis = MunicipalContentAnalysis()
        text_lower = text.lower()
        
        # Waste management relevance
        waste_terms = self.terms_database['waste_management']['de']
        waste_score = sum(1 for term in waste_terms if term.lower() in text_lower)
        analysis.waste_relevance_score = waste_score
        
        # Location identification
        locations = self.terms_database['waste_management']['locations']
        identified_locations = [loc for loc in locations if loc.lower() in text_lower]
        analysis.municipalities = identified_locations
        
        # Regulation type detection
        regulations = self.terms_database['waste_management']['regulations']
        regulation_types = [reg for reg in regulations if reg.lower() in text_lower]
        analysis.regulation_types = regulation_types
        
        return analysis
```

#### 11.1.3 Date and Time Formatting

**Swiss Date/Time Configuration:**
```python
class SwissDateTimeFormatter:
    def __init__(self):
        self.locale = locale.setlocale(locale.LC_TIME, 'de_CH.UTF-8')
        
        # Swiss date formats
        self.date_formats = {
            'short': '%d.%m.%Y',
            'medium': '%d. %B %Y',
            'long': '%A, %d. %B %Y',
            'iso': '%Y-%m-%d'
        }
        
        # Swiss time formats
        self.time_formats = {
            'short': '%H:%M',
            'medium': '%H:%M:%S',
            'long': '%H:%M:%S %Z'
        }
    
    def format_swiss_date(self, date_obj: datetime, format_type: str = 'short') -> str:
        """Format date according to Swiss conventions"""
        
        date_format = self.date_formats.get(format_type, self.date_formats['short'])
        formatted = date_obj.strftime(date_format)
        
        # Handle Swiss German month names
        month_translations = {
            'January': 'Januar', 'February': 'Februar', 'March': 'März',
            'April': 'April', 'May': 'Mai', 'June': 'Juni',
            'July': 'Juli', 'August': 'August', 'September': 'September',
            'October': 'Oktober', 'November': 'November', 'December': 'Dezember'
        }
        
        for english, german in month_translations.items():
            formatted = formatted.replace(english, german)
        
        return formatted
```

#### 11.1.4 Currency and Number Formatting

**Swiss Number Formatting:**
```python
class SwissNumberFormatter:
    def __init__(self):
        self.locale = locale.setlocale(locale.LC_NUMERIC, 'de_CH.UTF-8')
    
    def format_swiss_currency(self, amount: float) -> str:
        """Format currency according to Swiss conventions"""
        
        # Swiss Franc formatting: CHF 1'234.56
        formatted = f"CHF {amount:,.2f}"
        
        # Replace comma with apostrophe for thousands separator
        formatted = formatted.replace(',', "'")
        
        return formatted
    
    def format_swiss_number(self, number: float, decimals: int = 2) -> str:
        """Format numbers according to Swiss conventions"""
        
        formatted = f"{number:,.{decimals}f}"
        
        # Replace comma with apostrophe for thousands separator
        formatted = formatted.replace(',', "'")
        
        return formatted
```

#### 11.1.5 Address and Contact Formatting

**Swiss Address Format:**
```python
class SwissAddressFormatter:
    def __init__(self):
        self.canton_codes = {
            'Aargau': 'AG', 'Appenzell Ausserrhoden': 'AR',
            'Appenzell Innerrhoden': 'AI', 'Basel-Landschaft': 'BL',
            'Basel-Stadt': 'BS', 'Bern': 'BE', 'Freiburg': 'FR',
            'Genf': 'GE', 'Glarus': 'GL', 'Graubünden': 'GR',
            'Jura': 'JU', 'Luzern': 'LU', 'Neuenburg': 'NE',
            'Nidwalden': 'NW', 'Obwalden': 'OW', 'Schaffhausen': 'SH',
            'Schwyz': 'SZ', 'Solothurn': 'SO', 'St. Gallen': 'SG',
            'Tessin': 'TI', 'Thurgau': 'TG', 'Uri': 'UR',
            'Waadt': 'VD', 'Wallis': 'VS', 'Zug': 'ZG', 'Zürich': 'ZH'
        }
    
    def format_swiss_address(self, address_data: Dict[str, str]) -> str:
        """Format address according to Swiss postal conventions"""
        
        # Swiss address format:
        # Name
        # Street Number
        # PLZ Ort
        # Kanton (optional)
        # Switzerland
        
        lines = []
        
        if address_data.get('name'):
            lines.append(address_data['name'])
        
        if address_data.get('street') and address_data.get('number'):
            lines.append(f"{address_data['street']} {address_data['number']}")
        
        if address_data.get('postal_code') and address_data.get('city'):
            lines.append(f"{address_data['postal_code']} {address_data['city']}")
        
        if address_data.get('canton'):
            canton_code = self.canton_codes.get(address_data['canton'])
            if canton_code:
                lines.append(f"Kanton {address_data['canton']} ({canton_code})")
        
        lines.append('Schweiz')
        
        return '\n'.join(lines)
```

---

### 11.2 Citation Format Configuration

#### 11.2.1 German Citation Standards

**Citation Format Configuration:**
```python
class GermanCitationFormatter:
    def __init__(self):
        self.citation_styles = {
            'swiss_legal': SwissLegalCitationStyle(),
            'academic': GermanAcademicCitationStyle(),
            'municipal': SwissMunicipalCitationStyle(),
            'finma': FinmaDocumentCitationStyle()
        }
        
        self.default_style = 'municipal'
    
    def format_document_citation(self, document: Document, style: str = None) -> str:
        """Format document citation according to German standards"""
        
        citation_style = self.citation_styles.get(style or self.default_style)
        return citation_style.format_citation(document)

class SwissMunicipalCitationStyle:
    def format_citation(self, document: Document) -> str:
        """Format citation for Swiss municipal documents"""
        
        # Swiss municipal citation format:
        # Gemeinde [Municipality], Titel des Dokuments, 
        # [Document Type], Datum, Seite [Page]
        
        citation_parts = []
        
        # Municipality
        municipality = self.extract_municipality(document)
        if municipality:
            citation_parts.append(f"Gemeinde {municipality}")
        
        # Document title
        if document.title:
            citation_parts.append(f'"{document.title}"')
        
        # Document type
        doc_type = self.determine_document_type(document)
        if doc_type:
            citation_parts.append(f"[{doc_type}]")
        
        # Date
        if document.creation_date:
            date_str = document.creation_date.strftime('%d.%m.%Y')
            citation_parts.append(date_str)
        
        # Page reference
        if hasattr(document, 'page_number') and document.page_number:
            citation_parts.append(f"S. {document.page_number}")
        
        return ', '.join(citation_parts)
```

#### 11.2.2 Page Reference System

**Page Citation Configuration:**
```python
class PageReferenceSystem:
    def __init__(self):
        self.reference_formats = {
            'german': 'S. {page}',  # Seite
            'german_range': 'S. {start}-{end}',
            'german_multiple': 'S. {pages}',
            'paragraph': 'Abs. {paragraph}',  # Absatz
            'article': 'Art. {article}',  # Artikel
            'section': 'Ziff. {section}'  # Ziffer
        }
    
    def generate_page_reference(self, document: Document, page_info: PageInfo) -> str:
        """Generate German page reference"""
        
        if page_info.page_range:
            start, end = page_info.page_range
            return self.reference_formats['german_range'].format(start=start, end=end)
        elif page_info.multiple_pages:
            pages_str = ', '.join(map(str, page_info.multiple_pages))
            return self.reference_formats['german_multiple'].format(pages=pages_str)
        elif page_info.single_page:
            return self.reference_formats['german'].format(page=page_info.single_page)
        
        return ""
    
    def extract_page_references(self, content: str) -> List[PageReference]:
        """Extract page references from German text"""
        
        import re
        
        patterns = [
            r'S\.?\s*(\d+)(?:-(\d+))?',  # S. 5 or S. 5-10
            r'Seite\s*(\d+)(?:-(\d+))?',  # Seite 5
            r'Abs\.?\s*(\d+)',  # Abs. 3
            r'Art\.?\s*(\d+)',  # Art. 15
            r'Ziff\.?\s*(\d+)'  # Ziff. 2.1
        ]
        
        references = []
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                ref = PageReference(
                    text=match.group(0),
                    start_pos=match.start(),
                    end_pos=match.end(),
                    page_numbers=self.parse_page_numbers(match)
                )
                references.append(ref)
        
        return references
```

#### 11.2.3 Metadata Citation Integration

**Metadata-Based Citations:**
```python
class MetadataCitationBuilder:
    def __init__(self):
        self.metadata_mappers = {
            'author': self.format_author,
            'organization': self.format_organization,
            'publication_date': self.format_date,
            'document_number': self.format_document_number,
            'version': self.format_version
        }
    
    def build_citation_from_metadata(self, document: Document) -> CitationInfo:
        """Build citation information from document metadata"""
        
        citation_info = CitationInfo()
        metadata = document.metadata or {}
        
        # Extract citation elements
        for element, formatter in self.metadata_mappers.items():
            if element in metadata:
                formatted_value = formatter(metadata[element])
                setattr(citation_info, element, formatted_value)
        
        # Generate full citation
        citation_info.full_citation = self.compose_citation(citation_info)
        
        return citation_info
    
    def format_author(self, author_data: Union[str, Dict]) -> str:
        """Format author according to German citation standards"""
        
        if isinstance(author_data, str):
            return author_data
        
        # Format: Nachname, Vorname
        if 'last_name' in author_data and 'first_name' in author_data:
            return f"{author_data['last_name']}, {author_data['first_name']}"
        
        return str(author_data)
    
    def format_organization(self, org_data: Union[str, Dict]) -> str:
        """Format organization for German citations"""
        
        if isinstance(org_data, str):
            return org_data
        
        # Include department if available
        org_name = org_data.get('name', '')
        department = org_data.get('department', '')
        
        if department:
            return f"{org_name}, {department}"
        
        return org_name
```

#### 11.2.4 Legal Document Citations

**Swiss Legal Citation Format:**
```python
class SwissLegalCitationFormatter:
    def __init__(self):
        self.legal_abbreviations = {
            'Bundesgesetz': 'BG',
            'Verordnung': 'VO',
            'Reglement': 'Regl.',
            'Beschluss': 'Beschl.',
            'Verfügung': 'Verf.',
            'Urteil': 'Urt.',
            'Entscheid': 'Entsch.'
        }
        
        self.court_abbreviations = {
            'Bundesgericht': 'BGer',
            'Verwaltungsgericht': 'VwG',
            'Kantonsgericht': 'KG',
            'Bezirksgericht': 'BezG'
        }
    
    def format_legal_citation(self, document: Document) -> str:
        """Format legal document citation according to Swiss standards"""
        
        # Swiss legal citation format:
        # [Court/Authority] [Document Type] [Number/Reference] vom [Date]
        
        citation_parts = []
        
        # Authority/Court
        authority = self.extract_authority(document)
        if authority:
            abbrev = self.court_abbreviations.get(authority, authority)
            citation_parts.append(abbrev)
        
        # Document type
        doc_type = self.extract_document_type(document)
        if doc_type:
            abbrev = self.legal_abbreviations.get(doc_type, doc_type)
            citation_parts.append(abbrev)
        
        # Reference number
        ref_number = self.extract_reference_number(document)
        if ref_number:
            citation_parts.append(ref_number)
        
        # Date
        if document.creation_date:
            date_str = f"vom {document.creation_date.strftime('%d.%m.%Y')}"
            citation_parts.append(date_str)
        
        return ' '.join(citation_parts)
```

#### 11.2.5 Automatic Citation Generation

**AI-Powered Citation Generation:**
```python
class AutomaticCitationGenerator:
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.citation_templates = self.load_citation_templates()
    
    async def generate_citation(self, document: Document, style: str) -> str:
        """Generate citation using AI and templates"""
        
        # Extract document information
        doc_info = await self.extract_document_information(document)
        
        # Select appropriate template
        template = self.citation_templates.get(style)
        
        # Generate citation with AI assistance
        prompt = f"""
        Erstelle eine korrekte deutsche Zitation für folgendes Dokument:
        
        Titel: {doc_info.title}
        Autor: {doc_info.author}
        Organisation: {doc_info.organization}
        Datum: {doc_info.date}
        Dokumenttyp: {doc_info.document_type}
        
        Zitationsstil: {style}
        
        Die Zitation soll deutschen/schweizerischen Standards entsprechen.
        """
        
        generated_citation = await self.llm_client.generate_response(prompt)
        
        # Validate and format
        validated_citation = self.validate_citation(generated_citation, style)
        
        return validated_citation
```

---

### 11.3 Document Type Detection

#### 11.3.1 Automated Document Classification

**Document Type Classifier:**
```python
class GermanDocumentTypeClassifier:
    def __init__(self):
        self.document_types = {
            'municipal_regulation': MunicipalRegulationDetector(),
            'waste_management_guide': WasteGuideDetector(),
            'legal_document': LegalDocumentDetector(),
            'administrative_form': AdministrativeFormDetector(),
            'technical_specification': TechnicalSpecDetector(),
            'public_notice': PublicNoticeDetector()
        }
        
        self.classification_model = self.load_classification_model()
    
    async def classify_document(self, document: Document) -> DocumentClassification:
        """Classify document type based on content and metadata"""
        
        classification = DocumentClassification()
        
        # Extract features for classification
        features = await self.extract_classification_features(document)
        
        # Run through type-specific detectors
        type_scores = {}
        for doc_type, detector in self.document_types.items():
            score = detector.calculate_score(features)
            type_scores[doc_type] = score
        
        # Determine primary type
        primary_type = max(type_scores.items(), key=lambda x: x[1])
        classification.primary_type = primary_type[0]
        classification.confidence = primary_type[1]
        
        # Determine secondary types
        secondary_types = sorted(type_scores.items(), key=lambda x: x[1], reverse=True)[1:3]
        classification.secondary_types = [t[0] for t in secondary_types if t[1] > 0.3]
        
        return classification

class MunicipalRegulationDetector:
    def __init__(self):
        self.regulation_keywords = [
            'Reglement', 'Verordnung', 'Bestimmung', 'Vorschrift',
            'Artikel', 'Paragraph', 'Absatz', 'Ziffer'
        ]
        
        self.structural_patterns = [
            r'Art\.\s*\d+',  # Article references
            r'§\s*\d+',     # Paragraph references
            r'Abs\.\s*\d+', # Paragraph subsections
            r'Ziff\.\s*\d+' # Number references
        ]
    
    def calculate_score(self, features: DocumentFeatures) -> float:
        """Calculate probability that document is a municipal regulation"""
        
        score = 0.0
        text = features.text_content.lower()
        
        # Keyword presence
        keyword_score = sum(1 for kw in self.regulation_keywords 
                           if kw.lower() in text) / len(self.regulation_keywords)
        score += keyword_score * 0.4
        
        # Structural patterns
        import re
        pattern_score = sum(1 for pattern in self.structural_patterns 
                           if re.search(pattern, features.text_content)) / len(self.structural_patterns)
        score += pattern_score * 0.3
        
        # Document metadata indicators
        metadata = features.metadata
        if 'document_type' in metadata:
            if any(reg_type in metadata['document_type'].lower() 
                   for reg_type in ['reglement', 'verordnung', 'bestimmung']):
                score += 0.3
        
        return min(score, 1.0)
```

#### 11.3.2 Content-Based Detection

**Content Analysis for Type Detection:**
```python
class ContentBasedTypeDetector:
    def __init__(self):
        self.content_analyzers = {
            'structure_analyzer': DocumentStructureAnalyzer(),
            'language_analyzer': LanguagePatternAnalyzer(),
            'format_analyzer': DocumentFormatAnalyzer(),
            'semantic_analyzer': SemanticContentAnalyzer()
        }
    
    async def analyze_document_content(self, document: Document) -> ContentAnalysis:
        """Analyze document content for type detection"""
        
        analysis = ContentAnalysis()
        
        # Run all analyzers
        for analyzer_name, analyzer in self.content_analyzers.items():
            analyzer_result = await analyzer.analyze(document)
            setattr(analysis, analyzer_name, analyzer_result)
        
        # Combine results
        analysis.combined_score = self.combine_analysis_results(analysis)
        
        return analysis

class DocumentStructureAnalyzer:
    def __init__(self):
        self.structure_patterns = {
            'hierarchical': r'(\d+\.)+\s*\d*',  # 1.1.1 numbering
            'legal': r'(Art\.|§|Abs\.)\s*\d+',  # Legal references
            'list': r'[•\-\*]\s*',  # Bullet points
            'table': r'\|.*\|',  # Table structures
            'form': r'_+|\.{3,}'  # Form fields
        }
    
    async def analyze(self, document: Document) -> StructureAnalysis:
        """Analyze document structure"""
        
        analysis = StructureAnalysis()
        text = document.text_content
        
        # Detect structural patterns
        import re
        for pattern_name, pattern in self.structure_patterns.items():
            matches = re.findall(pattern, text)
            setattr(analysis, f'{pattern_name}_count', len(matches))
        
        # Analyze paragraph structure
        paragraphs = text.split('\n\n')
        analysis.paragraph_count = len(paragraphs)
        analysis.avg_paragraph_length = sum(len(p) for p in paragraphs) / len(paragraphs) if paragraphs else 0
        
        # Detect headers and sections
        analysis.headers = self.extract_headers(text)
        analysis.sections = self.extract_sections(text)
        
        return analysis
```

#### 11.3.3 Machine Learning Classification

**ML-Based Document Classification:**
```python
class MLDocumentClassifier:
    def __init__(self):
        self.model = self.load_trained_model()
        self.vectorizer = self.load_vectorizer()
        self.label_encoder = self.load_label_encoder()
        
        # Feature extractors
        self.feature_extractors = [
            TextLengthExtractor(),
            KeywordDensityExtractor(),
            StructuralFeatureExtractor(),
            LanguageFeatureExtractor()
        ]
    
    def predict_document_type(self, document: Document) -> TypePrediction:
        """Predict document type using ML model"""
        
        # Extract features
        features = self.extract_features(document)
        
        # Vectorize text content
        text_vector = self.vectorizer.transform([document.text_content])
        
        # Combine features
        combined_features = np.hstack([text_vector.toarray(), features])
        
        # Predict
        prediction_probs = self.model.predict_proba(combined_features)[0]
        predicted_class = self.model.predict(combined_features)[0]
        
        # Decode labels
        class_labels = self.label_encoder.classes_
        
        return TypePrediction(
            predicted_type=self.label_encoder.inverse_transform([predicted_class])[0],
            confidence=max(prediction_probs),
            type_probabilities=dict(zip(class_labels, prediction_probs))
        )
    
    def extract_features(self, document: Document) -> np.ndarray:
        """Extract numerical features for ML classification"""
        
        features = []
        
        for extractor in self.feature_extractors:
            feature_values = extractor.extract(document)
            features.extend(feature_values)
        
        return np.array(features)

class KeywordDensityExtractor:
    def __init__(self):
        self.keyword_categories = {
            'legal': ['artikel', 'paragraph', 'gesetz', 'verordnung', 'recht'],
            'administrative': ['verwaltung', 'behörde', 'amt', 'dienst', 'stelle'],
            'technical': ['technisch', 'verfahren', 'methode', 'system', 'prozess'],
            'waste_management': ['abfall', 'müll', 'entsorgung', 'recycling', 'kompost']
        }
    
    def extract(self, document: Document) -> List[float]:
        """Extract keyword density features"""
        
        text = document.text_content.lower()
        word_count = len(text.split())
        
        densities = []
        for category, keywords in self.keyword_categories.items():
            category_count = sum(text.count(keyword) for keyword in keywords)
            density = category_count / word_count if word_count > 0 else 0
            densities.append(density)
        
        return densities
```

#### 11.3.4 Template-Based Detection

**Template Matching for Document Types:**
```python
class TemplateBasedDetector:
    def __init__(self):
        self.templates = self.load_document_templates()
        self.similarity_threshold = 0.7
    
    def detect_by_template_matching(self, document: Document) -> TemplateMatch:
        """Detect document type by matching against templates"""
        
        best_match = None
        best_score = 0
        
        for template_name, template in self.templates.items():
            similarity_score = self.calculate_similarity(document, template)
            
            if similarity_score > best_score and similarity_score > self.similarity_threshold:
                best_score = similarity_score
                best_match = template_name
        
        return TemplateMatch(
            template_name=best_match,
            similarity_score=best_score,
            matching_elements=self.identify_matching_elements(document, template) if best_match else []
        )
    
    def calculate_similarity(self, document: Document, template: DocumentTemplate) -> float:
        """Calculate similarity between document and template"""
        
        similarity_scores = []
        
        # Text similarity
        text_sim = self.calculate_text_similarity(document.text_content, template.sample_text)
        similarity_scores.append(text_sim * 0.4)
        
        # Structure similarity
        doc_structure = self.extract_structure(document)
        template_structure = template.expected_structure
        structure_sim = self.calculate_structure_similarity(doc_structure, template_structure)
        similarity_scores.append(structure_sim * 0.3)
        
        # Metadata similarity
        metadata_sim = self.calculate_metadata_similarity(document.metadata, template.expected_metadata)
        similarity_scores.append(metadata_sim * 0.3)
        
        return sum(similarity_scores)
```

#### 11.3.5 Validation and Quality Assurance

**Type Detection Validation:**
```python
class TypeDetectionValidator:
    def __init__(self):
        self.validation_rules = self.load_validation_rules()
        self.confidence_thresholds = {
            'high': 0.8,
            'medium': 0.6,
            'low': 0.4
        }
    
    def validate_classification(self, document: Document, 
                              classification: DocumentClassification) -> ValidationResult:
        """Validate document type classification"""
        
        validation = ValidationResult()
        
        # Confidence validation
        if classification.confidence >= self.confidence_thresholds['high']:
            validation.confidence_level = 'high'
        elif classification.confidence >= self.confidence_thresholds['medium']:
            validation.confidence_level = 'medium'
        else:
            validation.confidence_level = 'low'
            validation.requires_manual_review = True
        
        # Rule-based validation
        rule_violations = []
        for rule in self.validation_rules.get(classification.primary_type, []):
            if not rule.validate(document):
                rule_violations.append(rule.description)
        
        validation.rule_violations = rule_violations
        validation.is_valid = len(rule_violations) == 0
        
        # Cross-validation with multiple methods
        if classification.confidence < self.confidence_thresholds['medium']:
            validation.alternative_classifications = self.get_alternative_classifications(document)
        
        return validation
```

This continues the comprehensive admin documentation with the remaining sections focused on German localization, citation configuration, and document type detection. The documentation maintains consistency with the actual system capabilities discovered in the codebase analysis.