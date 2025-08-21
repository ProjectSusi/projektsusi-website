"""
Performance Monitoring API Router
Provides endpoints for performance monitoring, alerting, and optimization
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..services.performance_monitoring_service import (
    get_performance_service, 
    PerformanceThreshold,
    PerformanceAlert
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/performance", tags=["performance"])


# Pydantic models for API
class ThresholdModel(BaseModel):
    """Performance threshold configuration"""
    metric_name: str
    warning_threshold: float
    critical_threshold: float
    duration_window: int = Field(default=300, description="Window in seconds")
    evaluation_method: str = Field(default="average", description="average, max, min, percentile_95")


class AlertModel(BaseModel):
    """Performance alert information"""
    alert_id: str
    metric_name: str
    severity: str
    current_value: float
    threshold_value: float
    timestamp: datetime
    description: str
    recommendations: List[str]


class PerformanceStatsModel(BaseModel):
    """Performance statistics"""
    count: int
    min: float
    max: float
    average: float
    median: float
    std_dev: float
    percentile_95: float
    percentile_99: float


class PerformanceSummaryModel(BaseModel):
    """Performance monitoring summary"""
    timestamp: datetime
    monitoring_period_hours: int
    metrics: Dict[str, PerformanceStatsModel]
    alerts: Dict[str, any]
    recommendations: List[str]


@router.get("/summary", response_model=Dict)
async def get_performance_summary(
    hours: int = Query(default=1, ge=1, le=72, description="Hours of data to analyze")
):
    """
    Get comprehensive performance monitoring summary
    
    Returns performance statistics, active alerts, and recommendations
    for the specified time period.
    """
    try:
        service = get_performance_service()
        summary = service.get_performance_summary(since_hours=hours)
        
        return {
            "status": "success",
            "data": summary
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance summary")


@router.get("/metrics/{metric_name}/report", response_model=Dict)
async def get_metric_report(
    metric_name: str,
    hours: int = Query(default=24, ge=1, le=168, description="Hours of data to include")
):
    """
    Get detailed performance report for a specific metric
    
    Returns time series data, statistics, and analysis for the specified metric.
    """
    try:
        service = get_performance_service()
        report = service.get_performance_report(metric_name, hours)
        
        if not report["time_series"]:
            raise HTTPException(
                status_code=404, 
                detail=f"No data found for metric '{metric_name}'"
            )
        
        return {
            "status": "success",
            "data": report
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get metric report for {metric_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metric report")


@router.get("/metrics", response_model=Dict)
async def list_available_metrics():
    """
    List all available performance metrics
    
    Returns a list of all metrics currently being collected.
    """
    try:
        service = get_performance_service()
        
        # Get list of metrics with sample counts
        metrics_info = {}
        for metric_name in service.collector.samples.keys():
            samples = service.collector.get_samples(metric_name)
            stats = service.collector.calculate_statistics(metric_name)
            
            metrics_info[metric_name] = {
                "sample_count": len(samples),
                "latest_value": samples[-1].value if samples else None,
                "latest_timestamp": samples[-1].timestamp.isoformat() if samples else None,
                "statistics": stats
            }
        
        return {
            "status": "success",
            "data": {
                "total_metrics": len(metrics_info),
                "metrics": metrics_info
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to list metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to list available metrics")


@router.get("/alerts", response_model=Dict)
async def get_active_alerts():
    """
    Get all active performance alerts
    
    Returns current active alerts with severity levels and recommendations.
    """
    try:
        service = get_performance_service()
        
        alerts_data = []
        for alert in service.active_alerts.values():
            alerts_data.append({
                "alert_id": alert.alert_id,
                "metric_name": alert.metric_name,
                "severity": alert.severity,
                "current_value": alert.current_value,
                "threshold_value": alert.threshold_value,
                "timestamp": alert.timestamp.isoformat(),
                "description": alert.description,
                "recommendations": alert.recommendations
            })
        
        # Sort by severity and timestamp
        alerts_data.sort(
            key=lambda x: (
                0 if x["severity"] == "critical" else 1,
                x["timestamp"]
            ),
            reverse=True
        )
        
        return {
            "status": "success",
            "data": {
                "total_alerts": len(alerts_data),
                "critical_alerts": len([a for a in alerts_data if a["severity"] == "critical"]),
                "warning_alerts": len([a for a in alerts_data if a["severity"] == "warning"]),
                "alerts": alerts_data
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get active alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve active alerts")


@router.post("/thresholds", response_model=Dict)
async def create_threshold(threshold: ThresholdModel):
    """
    Create or update a performance threshold
    
    Sets up alerting thresholds for performance metrics.
    """
    try:
        service = get_performance_service()
        
        perf_threshold = PerformanceThreshold(
            metric_name=threshold.metric_name,
            warning_threshold=threshold.warning_threshold,
            critical_threshold=threshold.critical_threshold,
            duration_window=threshold.duration_window,
            evaluation_method=threshold.evaluation_method
        )
        
        service.add_threshold(perf_threshold)
        
        return {
            "status": "success",
            "message": f"Threshold created for {threshold.metric_name}",
            "data": {
                "metric_name": threshold.metric_name,
                "warning_threshold": threshold.warning_threshold,
                "critical_threshold": threshold.critical_threshold,
                "duration_window": threshold.duration_window,
                "evaluation_method": threshold.evaluation_method
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to create threshold: {e}")
        raise HTTPException(status_code=500, detail="Failed to create performance threshold")


@router.get("/thresholds", response_model=Dict)
async def list_thresholds():
    """
    List all configured performance thresholds
    
    Returns all configured alerting thresholds.
    """
    try:
        service = get_performance_service()
        
        thresholds_data = []
        for metric_name, threshold in service.thresholds.items():
            thresholds_data.append({
                "metric_name": threshold.metric_name,
                "warning_threshold": threshold.warning_threshold,
                "critical_threshold": threshold.critical_threshold,
                "duration_window": threshold.duration_window,
                "evaluation_method": threshold.evaluation_method
            })
        
        return {
            "status": "success",
            "data": {
                "total_thresholds": len(thresholds_data),
                "thresholds": thresholds_data
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to list thresholds: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve thresholds")


@router.delete("/thresholds/{metric_name}", response_model=Dict)
async def delete_threshold(metric_name: str):
    """
    Delete a performance threshold
    
    Removes alerting threshold for the specified metric.
    """
    try:
        service = get_performance_service()
        
        if metric_name not in service.thresholds:
            raise HTTPException(
                status_code=404,
                detail=f"Threshold for metric '{metric_name}' not found"
            )
        
        del service.thresholds[metric_name]
        
        # Also clear any active alerts for this metric
        alerts_to_remove = [
            alert_id for alert_id, alert in service.active_alerts.items()
            if alert.metric_name == metric_name
        ]
        
        for alert_id in alerts_to_remove:
            del service.active_alerts[alert_id]
        
        return {
            "status": "success",
            "message": f"Threshold deleted for {metric_name}",
            "alerts_cleared": len(alerts_to_remove)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete threshold: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete threshold")


@router.post("/optimize", response_model=Dict)
async def optimize_performance():
    """
    Trigger automatic performance optimization
    
    Runs automatic performance optimization based on current metrics.
    """
    try:
        service = get_performance_service()
        
        if not service.auto_optimization_enabled:
            return {
                "status": "info",
                "message": "Auto-optimization is disabled",
                "optimizations_applied": []
            }
        
        optimizations = service.optimize_performance()
        
        return {
            "status": "success",
            "message": f"Applied {len(optimizations)} optimizations",
            "optimizations_applied": optimizations
        }
        
    except Exception as e:
        logger.error(f"Performance optimization failed: {e}")
        raise HTTPException(status_code=500, detail="Performance optimization failed")


@router.get("/config", response_model=Dict)
async def get_performance_config():
    """
    Get performance monitoring configuration
    
    Returns current configuration and status of performance monitoring.
    """
    try:
        service = get_performance_service()
        
        config = {
            "monitoring_enabled": service.monitoring_enabled,
            "monitoring_interval_seconds": service.monitoring_interval,
            "auto_optimization_enabled": service.auto_optimization_enabled,
            "max_samples": service.collector.max_samples,
            "active_thresholds": len(service.thresholds),
            "active_alerts": len(service.active_alerts),
            "alert_handlers": len(service.alert_handlers),
            "monitoring_thread_alive": service.monitoring_thread.is_alive() if service.monitoring_thread else False
        }
        
        return {
            "status": "success",
            "data": config
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance config: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance configuration")


@router.post("/config", response_model=Dict)
async def update_performance_config(
    monitoring_enabled: Optional[bool] = None,
    monitoring_interval_seconds: Optional[int] = None,
    auto_optimization_enabled: Optional[bool] = None
):
    """
    Update performance monitoring configuration
    
    Updates performance monitoring settings.
    """
    try:
        service = get_performance_service()
        
        updated_fields = []
        
        if monitoring_enabled is not None:
            service.monitoring_enabled = monitoring_enabled
            updated_fields.append("monitoring_enabled")
            
            if monitoring_enabled:
                service.start_monitoring()
            else:
                service.stop_monitoring()
        
        if monitoring_interval_seconds is not None:
            if monitoring_interval_seconds < 10:
                raise HTTPException(
                    status_code=400,
                    detail="Monitoring interval must be at least 10 seconds"
                )
            service.monitoring_interval = monitoring_interval_seconds
            updated_fields.append("monitoring_interval_seconds")
        
        if auto_optimization_enabled is not None:
            service.auto_optimization_enabled = auto_optimization_enabled
            updated_fields.append("auto_optimization_enabled")
        
        return {
            "status": "success",
            "message": f"Updated {len(updated_fields)} configuration fields",
            "updated_fields": updated_fields
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update performance config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update performance configuration")


@router.get("/export", response_model=Dict)
async def export_performance_data(
    format: str = Query(default="json", regex="^(json|csv)$", description="Export format")
):
    """
    Export performance data for analysis
    
    Exports performance data in the specified format for external analysis.
    """
    try:
        service = get_performance_service()
        
        exported_data = service.export_performance_data(format)
        
        return {
            "status": "success",
            "format": format,
            "data": exported_data if format == "json" else None,
            "raw_data": exported_data if format != "json" else None
        }
        
    except Exception as e:
        logger.error(f"Failed to export performance data: {e}")
        raise HTTPException(status_code=500, detail="Failed to export performance data")


@router.get("/health", response_model=Dict)
async def get_performance_monitoring_health():
    """
    Get performance monitoring system health
    
    Returns health status of the performance monitoring system.
    """
    try:
        service = get_performance_service()
        
        health = {
            "status": "healthy" if service.monitoring_enabled else "disabled",
            "monitoring_enabled": service.monitoring_enabled,
            "monitoring_thread_alive": service.monitoring_thread.is_alive() if service.monitoring_thread else False,
            "total_samples": sum(len(samples) for samples in service.collector.samples.values()),
            "total_metrics": len(service.collector.samples),
            "active_alerts": len(service.active_alerts),
            "critical_alerts": len([a for a in service.active_alerts.values() if a.severity == "critical"]),
            "last_collection": datetime.now(timezone.utc).isoformat(),
        }
        
        return {
            "status": "success",
            "data": health
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance monitoring health: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve performance monitoring health")