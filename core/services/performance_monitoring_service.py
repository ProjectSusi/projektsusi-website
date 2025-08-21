"""
Performance Monitoring Service
Advanced performance tracking, alerting, and optimization for the RAG system
"""

import asyncio
import logging
import statistics
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple, Callable
from threading import Lock, Thread
import json
import os

# Import metrics service
try:
    from .metrics_service import get_metrics_service
    METRICS_AVAILABLE = True
except ImportError:
    METRICS_AVAILABLE = False

# Import system monitoring
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class PerformanceThreshold:
    """Performance threshold configuration"""
    metric_name: str
    warning_threshold: float
    critical_threshold: float
    duration_window: int = 300  # 5 minutes
    evaluation_method: str = "average"  # average, max, percentile_95


@dataclass
class PerformanceAlert:
    """Performance alert information"""
    alert_id: str
    metric_name: str
    severity: str  # warning, critical
    current_value: float
    threshold_value: float
    timestamp: datetime
    description: str
    recommendations: List[str] = field(default_factory=list)


@dataclass
class PerformanceSample:
    """Individual performance measurement"""
    timestamp: datetime
    metric_name: str
    value: float
    labels: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


class PerformanceCollector:
    """Collects and stores performance samples"""
    
    def __init__(self, max_samples: int = 10000):
        self.max_samples = max_samples
        self.samples = defaultdict(lambda: deque(maxlen=max_samples))
        self._lock = Lock()
    
    def add_sample(self, sample: PerformanceSample):
        """Add a performance sample"""
        with self._lock:
            self.samples[sample.metric_name].append(sample)
    
    def get_samples(
        self, 
        metric_name: str, 
        since: Optional[datetime] = None, 
        limit: Optional[int] = None
    ) -> List[PerformanceSample]:
        """Get samples for a specific metric"""
        with self._lock:
            samples = list(self.samples[metric_name])
        
        if since:
            samples = [s for s in samples if s.timestamp >= since]
        
        if limit:
            samples = samples[-limit:]
        
        return samples
    
    def calculate_statistics(
        self, 
        metric_name: str, 
        since: Optional[datetime] = None
    ) -> Dict[str, float]:
        """Calculate statistics for a metric"""
        samples = self.get_samples(metric_name, since)
        if not samples:
            return {}
        
        values = [s.value for s in samples]
        return {
            'count': len(values),
            'min': min(values),
            'max': max(values),
            'average': statistics.mean(values),
            'median': statistics.median(values),
            'std_dev': statistics.stdev(values) if len(values) > 1 else 0.0,
            'percentile_95': sorted(values)[int(len(values) * 0.95)] if values else 0.0,
            'percentile_99': sorted(values)[int(len(values) * 0.99)] if values else 0.0,
        }


class PerformanceMonitoringService:
    """Advanced performance monitoring and alerting service"""
    
    def __init__(self):
        self.collector = PerformanceCollector()
        self.thresholds: Dict[str, PerformanceThreshold] = {}
        self.active_alerts: Dict[str, PerformanceAlert] = {}
        self.alert_handlers: List[Callable[[PerformanceAlert], None]] = []
        
        # Monitoring state
        self.monitoring_enabled = True
        self.monitoring_interval = 30  # seconds
        self.monitoring_thread: Optional[Thread] = None
        self._shutdown_event = asyncio.Event()
        
        # Performance optimization features
        self.optimization_recommendations = []
        self.auto_optimization_enabled = False
        
        # Initialize default thresholds
        self._setup_default_thresholds()
        
        # Start background monitoring
        self.start_monitoring()
        
        logger.info("Performance monitoring service initialized")
    
    def _setup_default_thresholds(self):
        """Setup default performance thresholds"""
        default_thresholds = [
            # Response time thresholds
            PerformanceThreshold("query_duration_seconds", 5.0, 10.0),
            PerformanceThreshold("document_processing_duration_seconds", 30.0, 60.0),
            PerformanceThreshold("llm_request_duration_seconds", 15.0, 30.0),
            PerformanceThreshold("http_request_duration_seconds", 2.0, 5.0),
            
            # System resource thresholds
            PerformanceThreshold("system_cpu_usage_percent", 80.0, 95.0),
            PerformanceThreshold("system_memory_usage_percent", 85.0, 95.0),
            PerformanceThreshold("system_disk_usage_percent", 80.0, 90.0),
            
            # Error rate thresholds
            PerformanceThreshold("error_rate_percent", 5.0, 10.0),
            PerformanceThreshold("llm_failure_rate_percent", 2.0, 5.0),
            
            # Throughput thresholds (minimum expected)
            PerformanceThreshold("queries_per_minute", 10.0, 5.0, evaluation_method="min"),
        ]
        
        for threshold in default_thresholds:
            self.thresholds[threshold.metric_name] = threshold
    
    def add_threshold(self, threshold: PerformanceThreshold):
        """Add or update a performance threshold"""
        self.thresholds[threshold.metric_name] = threshold
        logger.info(f"Added performance threshold for {threshold.metric_name}")
    
    def add_alert_handler(self, handler: Callable[[PerformanceAlert], None]):
        """Add an alert handler function"""
        self.alert_handlers.append(handler)
    
    def record_performance(
        self, 
        metric_name: str, 
        value: float, 
        labels: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Record a performance measurement"""
        if not self.monitoring_enabled:
            return
        
        sample = PerformanceSample(
            timestamp=datetime.now(timezone.utc),
            metric_name=metric_name,
            value=value,
            labels=labels or {},
            metadata=metadata or {}
        )
        
        self.collector.add_sample(sample)
        
        # Check for threshold violations
        self._check_threshold_violation(metric_name, value)
    
    def record_operation_timing(self, operation_name: str):
        """Context manager for timing operations"""
        return OperationTimer(self, operation_name)
    
    def _check_threshold_violation(self, metric_name: str, current_value: float):
        """Check if a metric violates its thresholds"""
        threshold = self.thresholds.get(metric_name)
        if not threshold:
            return
        
        # Get recent samples for evaluation
        since = datetime.now(timezone.utc) - timedelta(seconds=threshold.duration_window)
        samples = self.collector.get_samples(metric_name, since)
        
        if not samples:
            return
        
        # Calculate evaluation value based on method
        values = [s.value for s in samples]
        if threshold.evaluation_method == "average":
            eval_value = statistics.mean(values)
        elif threshold.evaluation_method == "max":
            eval_value = max(values)
        elif threshold.evaluation_method == "min":
            eval_value = min(values)
        elif threshold.evaluation_method == "percentile_95":
            eval_value = sorted(values)[int(len(values) * 0.95)] if values else 0.0
        else:
            eval_value = current_value
        
        # Check thresholds
        alert_severity = None
        threshold_value = None
        
        if eval_value >= threshold.critical_threshold:
            alert_severity = "critical"
            threshold_value = threshold.critical_threshold
        elif eval_value >= threshold.warning_threshold:
            alert_severity = "warning"
            threshold_value = threshold.warning_threshold
        
        if alert_severity:
            alert_id = f"{metric_name}_{alert_severity}"
            
            # Check if alert already exists
            if alert_id not in self.active_alerts:
                alert = PerformanceAlert(
                    alert_id=alert_id,
                    metric_name=metric_name,
                    severity=alert_severity,
                    current_value=eval_value,
                    threshold_value=threshold_value,
                    timestamp=datetime.now(timezone.utc),
                    description=f"{metric_name} {alert_severity}: {eval_value:.2f} >= {threshold_value:.2f}",
                    recommendations=self._get_recommendations(metric_name, alert_severity)
                )
                
                self.active_alerts[alert_id] = alert
                self._trigger_alert(alert)
        else:
            # Clear existing alerts if value is now normal
            alert_id_warning = f"{metric_name}_warning"
            alert_id_critical = f"{metric_name}_critical"
            
            if alert_id_warning in self.active_alerts:
                del self.active_alerts[alert_id_warning]
            if alert_id_critical in self.active_alerts:
                del self.active_alerts[alert_id_critical]
    
    def _get_recommendations(self, metric_name: str, severity: str) -> List[str]:
        """Get optimization recommendations for performance issues"""
        recommendations = []
        
        if "query_duration" in metric_name:
            recommendations.extend([
                "Consider enabling query result caching",
                "Review document indexing for optimization",
                "Check if LLM model can be optimized or replaced",
                "Implement query complexity analysis"
            ])
        elif "document_processing" in metric_name:
            recommendations.extend([
                "Enable async document processing",
                "Implement document preprocessing optimization",
                "Consider batch processing for multiple documents",
                "Check storage I/O performance"
            ])
        elif "llm_request" in metric_name:
            recommendations.extend([
                "Consider using a faster LLM model",
                "Implement LLM response caching",
                "Optimize context window size",
                "Check Ollama server performance"
            ])
        elif "cpu_usage" in metric_name:
            recommendations.extend([
                "Consider horizontal scaling",
                "Implement CPU-intensive task queuing",
                "Optimize algorithm efficiency",
                "Check for infinite loops or resource leaks"
            ])
        elif "memory_usage" in metric_name:
            recommendations.extend([
                "Implement memory-efficient data structures",
                "Add memory cleanup procedures",
                "Consider memory caching optimization",
                "Check for memory leaks"
            ])
        
        return recommendations
    
    def _trigger_alert(self, alert: PerformanceAlert):
        """Trigger alert handlers"""
        logger.warning(f"Performance alert: {alert.description}")
        
        for handler in self.alert_handlers:
            try:
                handler(alert)
            except Exception as e:
                logger.error(f"Alert handler failed: {e}")
    
    def start_monitoring(self):
        """Start background performance monitoring"""
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            return
        
        self.monitoring_thread = Thread(target=self._monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        logger.info("Performance monitoring thread started")
    
    def stop_monitoring(self):
        """Stop background performance monitoring"""
        self.monitoring_enabled = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5)
        logger.info("Performance monitoring stopped")
    
    def _monitoring_loop(self):
        """Background monitoring loop"""
        while self.monitoring_enabled:
            try:
                self._collect_system_metrics()
                self._analyze_performance_trends()
                time.sleep(self.monitoring_interval)
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                time.sleep(self.monitoring_interval)
    
    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        if not PSUTIL_AVAILABLE:
            return
        
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            self.record_performance("system_cpu_usage_percent", cpu_percent)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            self.record_performance("system_memory_usage_percent", memory.percent)
            
            # Disk metrics
            for partition in psutil.disk_partitions():
                try:
                    disk_usage = psutil.disk_usage(partition.mountpoint)
                    disk_percent = (disk_usage.used / disk_usage.total) * 100
                    self.record_performance(
                        "system_disk_usage_percent", 
                        disk_percent,
                        labels={"mountpoint": partition.mountpoint}
                    )
                except PermissionError:
                    continue
            
            # Network metrics if available
            try:
                network = psutil.net_io_counters()
                self.record_performance("network_bytes_sent_per_second", network.bytes_sent)
                self.record_performance("network_bytes_recv_per_second", network.bytes_recv)
            except Exception:
                pass
                
        except Exception as e:
            logger.error(f"System metrics collection failed: {e}")
    
    def _analyze_performance_trends(self):
        """Analyze performance trends and generate recommendations"""
        # This is a placeholder for more advanced trend analysis
        # Could implement ML-based anomaly detection here
        pass
    
    def get_performance_summary(self, since_hours: int = 1) -> Dict[str, Any]:
        """Get comprehensive performance summary"""
        since = datetime.now(timezone.utc) - timedelta(hours=since_hours)
        
        summary = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "monitoring_period_hours": since_hours,
            "metrics": {},
            "alerts": {
                "active": len(self.active_alerts),
                "critical": len([a for a in self.active_alerts.values() if a.severity == "critical"]),
                "warning": len([a for a in self.active_alerts.values() if a.severity == "warning"]),
                "details": list(self.active_alerts.values())
            },
            "recommendations": self.optimization_recommendations
        }
        
        # Calculate statistics for each metric
        for metric_name in self.collector.samples.keys():
            stats = self.collector.calculate_statistics(metric_name, since)
            if stats:
                summary["metrics"][metric_name] = stats
        
        return summary
    
    def get_performance_report(self, metric_name: str, hours: int = 24) -> Dict[str, Any]:
        """Get detailed performance report for a specific metric"""
        since = datetime.now(timezone.utc) - timedelta(hours=hours)
        samples = self.collector.get_samples(metric_name, since)
        stats = self.collector.calculate_statistics(metric_name, since)
        
        # Create time series data
        time_series = [
            {
                "timestamp": s.timestamp.isoformat(),
                "value": s.value,
                "labels": s.labels,
                "metadata": s.metadata
            }
            for s in samples
        ]
        
        return {
            "metric_name": metric_name,
            "period_hours": hours,
            "statistics": stats,
            "time_series": time_series,
            "threshold": self.thresholds.get(metric_name).__dict__ if metric_name in self.thresholds else None,
            "active_alerts": [
                a.__dict__ for a in self.active_alerts.values() 
                if a.metric_name == metric_name
            ]
        }
    
    def optimize_performance(self) -> List[str]:
        """Run automatic performance optimization"""
        optimizations_applied = []
        
        if not self.auto_optimization_enabled:
            return ["Auto-optimization is disabled"]
        
        # Implement automatic optimizations based on performance data
        # This is a placeholder for more sophisticated optimization logic
        
        summary = self.get_performance_summary()
        
        # Example optimizations
        if "system_memory_usage_percent" in summary["metrics"]:
            memory_stats = summary["metrics"]["system_memory_usage_percent"]
            if memory_stats.get("average", 0) > 80:
                # Could trigger garbage collection, cache cleanup, etc.
                optimizations_applied.append("Memory cleanup triggered")
        
        return optimizations_applied
    
    def export_performance_data(self, format: str = "json") -> str:
        """Export performance data for analysis"""
        summary = self.get_performance_summary(since_hours=24)
        
        if format == "json":
            return json.dumps(summary, indent=2, default=str)
        elif format == "csv":
            # Implement CSV export if needed
            return "CSV export not implemented"
        else:
            return str(summary)


class OperationTimer:
    """Context manager for timing operations"""
    
    def __init__(self, performance_service: PerformanceMonitoringService, operation_name: str):
        self.performance_service = performance_service
        self.operation_name = operation_name
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration = time.time() - self.start_time
            self.performance_service.record_performance(
                f"{self.operation_name}_duration_seconds",
                duration,
                metadata={"success": exc_type is None}
            )


# Global performance monitoring service
_performance_service: Optional[PerformanceMonitoringService] = None


def get_performance_service() -> PerformanceMonitoringService:
    """Get global performance monitoring service"""
    global _performance_service
    if _performance_service is None:
        _performance_service = PerformanceMonitoringService()
    return _performance_service


def init_performance_service() -> PerformanceMonitoringService:
    """Initialize global performance monitoring service"""
    global _performance_service
    _performance_service = PerformanceMonitoringService()
    return _performance_service


# Convenience functions
def record_performance(metric_name: str, value: float, **kwargs):
    """Record a performance measurement"""
    service = get_performance_service()
    service.record_performance(metric_name, value, **kwargs)


def time_operation(operation_name: str):
    """Decorator for timing operations"""
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            service = get_performance_service()
            with service.record_operation_timing(operation_name):
                return await func(*args, **kwargs)
        
        def sync_wrapper(*args, **kwargs):
            service = get_performance_service()
            with service.record_operation_timing(operation_name):
                return func(*args, **kwargs)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator