"""
Horizontal Scaling Service
Dynamic scaling logic for RAG system components
"""

import asyncio
import logging
import os
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import psutil

logger = logging.getLogger(__name__)


class ScalingAction(Enum):
    """Scaling action types"""
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    NO_ACTION = "no_action"


class ComponentType(Enum):
    """Scalable component types"""
    API_WORKERS = "api_workers"
    BACKGROUND_JOBS = "background_jobs"
    DOCUMENT_PROCESSORS = "document_processors"
    CACHE_INSTANCES = "cache_instances"
    DATABASE_CONNECTIONS = "database_connections"


@dataclass
class MetricThreshold:
    """Scaling threshold configuration"""
    component: ComponentType
    metric_name: str
    scale_up_threshold: float
    scale_down_threshold: float
    min_instances: int
    max_instances: int
    cooldown_seconds: int = 300  # 5 minutes default cooldown


@dataclass
class SystemMetrics:
    """Current system metrics"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_io_mbps: float
    active_connections: int
    queue_length: int
    response_time_ms: float
    error_rate_percent: float
    custom_metrics: Dict[str, float]


@dataclass
class ScalingEvent:
    """Record of a scaling action"""
    timestamp: datetime
    component: ComponentType
    action: ScalingAction
    old_instances: int
    new_instances: int
    trigger_metric: str
    trigger_value: float
    reason: str


@dataclass
class ComponentStatus:
    """Current status of a scalable component"""
    component: ComponentType
    current_instances: int
    target_instances: int
    min_instances: int
    max_instances: int
    last_scaled: Optional[datetime]
    last_action: Optional[ScalingAction]
    is_scaling: bool
    health_status: str


class MetricsCollector:
    """Collects system and application metrics"""
    
    def __init__(self):
        self.custom_metrics: Dict[str, Callable[[], float]] = {}
        
    def register_metric(self, name: str, collector_func: Callable[[], float]):
        """Register a custom metric collector"""
        self.custom_metrics[name] = collector_func
        logger.info(f"Registered custom metric: {name}")
    
    async def collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # CPU and Memory
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # Network I/O (simplified)
            network = psutil.net_io_counters()
            network_io_mbps = (network.bytes_sent + network.bytes_recv) / (1024 * 1024)
            
            # Connection count (approximate)
            connections = len(psutil.net_connections())
            
            # Collect custom metrics
            custom_metrics = {}
            for name, collector_func in self.custom_metrics.items():
                try:
                    custom_metrics[name] = collector_func()
                except Exception as e:
                    logger.warning(f"Failed to collect custom metric {name}: {e}")
                    custom_metrics[name] = 0.0
            
            return SystemMetrics(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                disk_percent=disk_percent,
                network_io_mbps=network_io_mbps,
                active_connections=connections,
                queue_length=custom_metrics.get('queue_length', 0),
                response_time_ms=custom_metrics.get('response_time_ms', 0),
                error_rate_percent=custom_metrics.get('error_rate_percent', 0),
                custom_metrics=custom_metrics
            )
            
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
            # Return fallback metrics
            return SystemMetrics(
                timestamp=datetime.now(timezone.utc),
                cpu_percent=0.0,
                memory_percent=0.0,
                disk_percent=0.0,
                network_io_mbps=0.0,
                active_connections=0,
                queue_length=0,
                response_time_ms=0,
                error_rate_percent=0,
                custom_metrics={}
            )


class ScalingDecisionEngine:
    """Makes scaling decisions based on metrics and thresholds"""
    
    def __init__(self):
        self.thresholds: Dict[ComponentType, List[MetricThreshold]] = {}
        self.scaling_history: List[ScalingEvent] = []
        self.component_status: Dict[ComponentType, ComponentStatus] = {}
        
    def add_threshold(self, threshold: MetricThreshold):
        """Add a scaling threshold"""
        if threshold.component not in self.thresholds:
            self.thresholds[threshold.component] = []
        
        self.thresholds[threshold.component].append(threshold)
        
        # Initialize component status if not exists
        if threshold.component not in self.component_status:
            self.component_status[threshold.component] = ComponentStatus(
                component=threshold.component,
                current_instances=threshold.min_instances,
                target_instances=threshold.min_instances,
                min_instances=threshold.min_instances,
                max_instances=threshold.max_instances,
                last_scaled=None,
                last_action=None,
                is_scaling=False,
                health_status="healthy"
            )
        
        logger.info(f"Added scaling threshold for {threshold.component.value}: "
                   f"{threshold.metric_name} up>{threshold.scale_up_threshold}, "
                   f"down<{threshold.scale_down_threshold}")
    
    def evaluate_scaling(self, metrics: SystemMetrics) -> Dict[ComponentType, ScalingAction]:
        """Evaluate if scaling is needed for any components"""
        scaling_decisions = {}
        
        for component, thresholds in self.thresholds.items():
            status = self.component_status[component]
            
            # Skip if currently scaling or in cooldown
            if status.is_scaling:
                scaling_decisions[component] = ScalingAction.NO_ACTION
                continue
            
            if (status.last_scaled and 
                (metrics.timestamp - status.last_scaled).total_seconds() < 
                max(t.cooldown_seconds for t in thresholds)):
                scaling_decisions[component] = ScalingAction.NO_ACTION
                continue
            
            # Evaluate each threshold for this component
            scale_up_votes = 0
            scale_down_votes = 0
            trigger_info = []
            
            for threshold in thresholds:
                metric_value = self._get_metric_value(metrics, threshold.metric_name)
                
                if metric_value > threshold.scale_up_threshold:
                    scale_up_votes += 1
                    trigger_info.append(f"{threshold.metric_name}={metric_value:.2f} > {threshold.scale_up_threshold}")
                elif metric_value < threshold.scale_down_threshold:
                    scale_down_votes += 1
                    trigger_info.append(f"{threshold.metric_name}={metric_value:.2f} < {threshold.scale_down_threshold}")
            
            # Make scaling decision
            if scale_up_votes > 0 and status.current_instances < status.max_instances:
                scaling_decisions[component] = ScalingAction.SCALE_UP
                logger.info(f"Scale up decision for {component.value}: {'; '.join(trigger_info)}")
            elif (scale_down_votes > 0 and status.current_instances > status.min_instances and 
                  scale_up_votes == 0):  # Don't scale down if there are scale up signals
                scaling_decisions[component] = ScalingAction.SCALE_DOWN
                logger.info(f"Scale down decision for {component.value}: {'; '.join(trigger_info)}")
            else:
                scaling_decisions[component] = ScalingAction.NO_ACTION
        
        return scaling_decisions
    
    def _get_metric_value(self, metrics: SystemMetrics, metric_name: str) -> float:
        """Get metric value by name"""
        metric_map = {
            'cpu_percent': metrics.cpu_percent,
            'memory_percent': metrics.memory_percent,
            'disk_percent': metrics.disk_percent,
            'network_io_mbps': metrics.network_io_mbps,
            'active_connections': metrics.active_connections,
            'queue_length': metrics.queue_length,
            'response_time_ms': metrics.response_time_ms,
            'error_rate_percent': metrics.error_rate_percent
        }
        
        # Check standard metrics first
        if metric_name in metric_map:
            return metric_map[metric_name]
        
        # Check custom metrics
        if metric_name in metrics.custom_metrics:
            return metrics.custom_metrics[metric_name]
        
        logger.warning(f"Unknown metric: {metric_name}")
        return 0.0
    
    def record_scaling_event(self, event: ScalingEvent):
        """Record a scaling event"""
        self.scaling_history.append(event)
        
        # Update component status
        if event.component in self.component_status:
            status = self.component_status[event.component]
            status.current_instances = event.new_instances
            status.target_instances = event.new_instances
            status.last_scaled = event.timestamp
            status.last_action = event.action
            status.is_scaling = False
        
        logger.info(f"Recorded scaling event: {event.component.value} "
                   f"{event.action.value} {event.old_instances}->{event.new_instances}")
    
    def get_scaling_history(self, component: Optional[ComponentType] = None, 
                          hours: int = 24) -> List[ScalingEvent]:
        """Get scaling history"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        events = [e for e in self.scaling_history if e.timestamp > cutoff_time]
        
        if component:
            events = [e for e in events if e.component == component]
        
        return sorted(events, key=lambda e: e.timestamp, reverse=True)


class ComponentScaler:
    """Handles actual scaling operations for different components"""
    
    def __init__(self):
        self.scalers: Dict[ComponentType, Callable] = {}
        
    def register_scaler(self, component: ComponentType, 
                       scaler_func: Callable[[ComponentType, int, ScalingAction], bool]):
        """Register a component scaler function"""
        self.scalers[component] = scaler_func
        logger.info(f"Registered scaler for {component.value}")
    
    async def scale_component(self, component: ComponentType, 
                            current_instances: int, action: ScalingAction) -> bool:
        """Scale a component"""
        if component not in self.scalers:
            logger.error(f"No scaler registered for {component.value}")
            return False
        
        try:
            # Calculate target instances
            if action == ScalingAction.SCALE_UP:
                target_instances = min(current_instances + 1, 10)  # Max 10 instances
            elif action == ScalingAction.SCALE_DOWN:
                target_instances = max(current_instances - 1, 1)   # Min 1 instance
            else:
                return True  # No action needed
            
            logger.info(f"Scaling {component.value}: {current_instances} -> {target_instances}")
            
            # Call the registered scaler function
            scaler_func = self.scalers[component]
            success = await scaler_func(component, target_instances, action)
            
            if success:
                logger.info(f"Successfully scaled {component.value} to {target_instances} instances")
            else:
                logger.error(f"Failed to scale {component.value}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error scaling {component.value}: {e}")
            return False


class HorizontalScalingService:
    """Main horizontal scaling service"""
    
    def __init__(self, 
                 check_interval_seconds: int = 60,
                 enable_auto_scaling: bool = True):
        self.check_interval_seconds = check_interval_seconds
        self.enable_auto_scaling = enable_auto_scaling
        
        self.metrics_collector = MetricsCollector()
        self.decision_engine = ScalingDecisionEngine()
        self.component_scaler = ComponentScaler()
        
        self.running = False
        self.scaling_task: Optional[asyncio.Task] = None
        
        # Performance tracking
        self.metrics_history: List[SystemMetrics] = []
        self.max_history_size = 1440  # 24 hours at 1-minute intervals
        
        logger.info("Horizontal scaling service initialized")
    
    def configure_component_scaling(self, component: ComponentType,
                                  metric_name: str,
                                  scale_up_threshold: float,
                                  scale_down_threshold: float,
                                  min_instances: int = 1,
                                  max_instances: int = 10,
                                  cooldown_seconds: int = 300):
        """Configure scaling for a component"""
        threshold = MetricThreshold(
            component=component,
            metric_name=metric_name,
            scale_up_threshold=scale_up_threshold,
            scale_down_threshold=scale_down_threshold,
            min_instances=min_instances,
            max_instances=max_instances,
            cooldown_seconds=cooldown_seconds
        )
        
        self.decision_engine.add_threshold(threshold)
    
    def register_metric_collector(self, name: str, collector_func: Callable[[], float]):
        """Register a custom metric collector"""
        self.metrics_collector.register_metric(name, collector_func)
    
    def register_component_scaler(self, component: ComponentType,
                                scaler_func: Callable[[ComponentType, int, ScalingAction], bool]):
        """Register a component scaler"""
        self.component_scaler.register_scaler(component, scaler_func)
    
    async def _scaling_loop(self):
        """Main scaling loop"""
        logger.info("Starting scaling monitoring loop")
        
        while self.running:
            try:
                # Collect current metrics
                metrics = await self.metrics_collector.collect_system_metrics()
                
                # Store metrics history
                self.metrics_history.append(metrics)
                if len(self.metrics_history) > self.max_history_size:
                    self.metrics_history.pop(0)
                
                # Log current system state
                logger.debug(f"System metrics: CPU={metrics.cpu_percent:.1f}%, "
                           f"Memory={metrics.memory_percent:.1f}%, "
                           f"Connections={metrics.active_connections}, "
                           f"Queue={metrics.queue_length}")
                
                # Evaluate scaling decisions if auto-scaling is enabled
                if self.enable_auto_scaling:
                    scaling_decisions = self.decision_engine.evaluate_scaling(metrics)
                    
                    # Execute scaling actions
                    for component, action in scaling_decisions.items():
                        if action != ScalingAction.NO_ACTION:
                            await self._execute_scaling_action(component, action, metrics)
                
                # Wait for next check
                await asyncio.sleep(self.check_interval_seconds)
                
            except Exception as e:
                logger.error(f"Error in scaling loop: {e}")
                await asyncio.sleep(self.check_interval_seconds)
    
    async def _execute_scaling_action(self, component: ComponentType, 
                                    action: ScalingAction, metrics: SystemMetrics):
        """Execute a scaling action"""
        try:
            # Get current component status
            status = self.decision_engine.component_status[component]
            
            # Mark as scaling to prevent concurrent scaling
            status.is_scaling = True
            
            old_instances = status.current_instances
            
            # Perform the scaling
            success = await self.component_scaler.scale_component(
                component, old_instances, action
            )
            
            if success:
                # Calculate new instance count
                if action == ScalingAction.SCALE_UP:
                    new_instances = min(old_instances + 1, status.max_instances)
                else:  # SCALE_DOWN
                    new_instances = max(old_instances - 1, status.min_instances)
                
                # Record the scaling event
                event = ScalingEvent(
                    timestamp=datetime.now(timezone.utc),
                    component=component,
                    action=action,
                    old_instances=old_instances,
                    new_instances=new_instances,
                    trigger_metric="composite",
                    trigger_value=0.0,  # Could be enhanced to track specific trigger
                    reason=f"Auto-scaling based on system metrics"
                )
                
                self.decision_engine.record_scaling_event(event)
                
            else:
                logger.error(f"Scaling action failed for {component.value}")
                status.is_scaling = False
                
        except Exception as e:
            logger.error(f"Error executing scaling action for {component.value}: {e}")
            # Reset scaling flag on error
            if component in self.decision_engine.component_status:
                self.decision_engine.component_status[component].is_scaling = False
    
    async def start(self):
        """Start the scaling service"""
        if self.running:
            return
        
        self.running = True
        self.scaling_task = asyncio.create_task(self._scaling_loop())
        logger.info("Horizontal scaling service started")
    
    async def stop(self):
        """Stop the scaling service"""
        if not self.running:
            return
        
        self.running = False
        
        if self.scaling_task:
            self.scaling_task.cancel()
            try:
                await self.scaling_task
            except asyncio.CancelledError:
                pass
        
        logger.info("Horizontal scaling service stopped")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        latest_metrics = self.metrics_history[-1] if self.metrics_history else None
        
        return {
            "scaling_enabled": self.enable_auto_scaling,
            "running": self.running,
            "check_interval_seconds": self.check_interval_seconds,
            "components": {
                comp.value: asdict(status) 
                for comp, status in self.decision_engine.component_status.items()
            },
            "latest_metrics": asdict(latest_metrics) if latest_metrics else None,
            "metrics_history_size": len(self.metrics_history)
        }
    
    def get_scaling_recommendations(self) -> Dict[str, Any]:
        """Get scaling recommendations based on recent metrics"""
        if not self.metrics_history:
            return {"message": "No metrics available"}
        
        # Analyze recent metrics (last 10 minutes)
        recent_metrics = [
            m for m in self.metrics_history[-10:] 
            if (datetime.now(timezone.utc) - m.timestamp).total_seconds() < 600
        ]
        
        if not recent_metrics:
            return {"message": "No recent metrics available"}
        
        # Calculate averages
        avg_cpu = sum(m.cpu_percent for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m.memory_percent for m in recent_metrics) / len(recent_metrics)
        avg_queue = sum(m.queue_length for m in recent_metrics) / len(recent_metrics)
        avg_response_time = sum(m.response_time_ms for m in recent_metrics) / len(recent_metrics)
        
        recommendations = []
        
        # Generate recommendations
        if avg_cpu > 80:
            recommendations.append("High CPU usage detected - consider scaling up API workers")
        elif avg_cpu < 20:
            recommendations.append("Low CPU usage - consider scaling down if cost optimization is desired")
        
        if avg_memory > 85:
            recommendations.append("High memory usage - consider scaling up or optimizing memory usage")
        
        if avg_queue > 10:
            recommendations.append("High queue length - consider scaling up background job workers")
        
        if avg_response_time > 1000:
            recommendations.append("High response times - consider scaling up API workers or database connections")
        
        if not recommendations:
            recommendations.append("System appears to be running optimally")
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analysis_period_minutes": 10,
            "metrics_analyzed": len(recent_metrics),
            "averages": {
                "cpu_percent": round(avg_cpu, 2),
                "memory_percent": round(avg_memory, 2),
                "queue_length": round(avg_queue, 2),
                "response_time_ms": round(avg_response_time, 2)
            },
            "recommendations": recommendations
        }
    
    async def manual_scale(self, component: ComponentType, 
                          action: ScalingAction, reason: str = "Manual scaling") -> bool:
        """Manually trigger scaling for a component"""
        try:
            if component not in self.decision_engine.component_status:
                logger.error(f"Component {component.value} not configured for scaling")
                return False
            
            status = self.decision_engine.component_status[component]
            
            if status.is_scaling:
                logger.warning(f"Component {component.value} is already scaling")
                return False
            
            # Check if scaling is valid
            if (action == ScalingAction.SCALE_UP and 
                status.current_instances >= status.max_instances):
                logger.warning(f"Cannot scale up {component.value} - already at maximum instances")
                return False
            
            if (action == ScalingAction.SCALE_DOWN and 
                status.current_instances <= status.min_instances):
                logger.warning(f"Cannot scale down {component.value} - already at minimum instances")
                return False
            
            # Execute the scaling
            metrics = await self.metrics_collector.collect_system_metrics()
            await self._execute_scaling_action(component, action, metrics)
            
            logger.info(f"Manual scaling completed for {component.value}: {action.value}")
            return True
            
        except Exception as e:
            logger.error(f"Manual scaling failed for {component.value}: {e}")
            return False


# Global scaling service instance
_scaling_service: Optional[HorizontalScalingService] = None


async def initialize_scaling_service(
    check_interval_seconds: int = 60,
    enable_auto_scaling: bool = True
) -> HorizontalScalingService:
    """Initialize global scaling service"""
    global _scaling_service
    
    _scaling_service = HorizontalScalingService(
        check_interval_seconds=check_interval_seconds,
        enable_auto_scaling=enable_auto_scaling
    )
    
    await _scaling_service.start()
    logger.info("Global scaling service initialized")
    
    return _scaling_service


async def shutdown_scaling_service():
    """Shutdown global scaling service"""
    global _scaling_service
    
    if _scaling_service:
        await _scaling_service.stop()
        _scaling_service = None
        logger.info("Global scaling service shutdown")


def get_scaling_service() -> HorizontalScalingService:
    """Get global scaling service instance"""
    if not _scaling_service:
        raise RuntimeError("Scaling service not initialized. Call initialize_scaling_service() first.")
    
    return _scaling_service