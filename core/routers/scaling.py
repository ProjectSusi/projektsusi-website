"""
Horizontal Scaling Management API
Dynamic scaling control and monitoring endpoints
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from ..services.scaling_service import (
    HorizontalScalingService, ComponentType, ScalingAction, MetricThreshold,
    get_scaling_service
)
from ..middleware.auth_middleware import require_authentication, require_admin_role
from ..repositories.models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/scaling", tags=["Horizontal Scaling"])


# Pydantic models for API

class ComponentScalingConfig(BaseModel):
    """Request model for configuring component scaling"""
    component: ComponentType
    metric_name: str = Field(..., description="Metric to monitor for scaling decisions")
    scale_up_threshold: float = Field(..., gt=0, description="Threshold to trigger scale up")
    scale_down_threshold: float = Field(..., gt=0, description="Threshold to trigger scale down")
    min_instances: int = Field(default=1, ge=1, le=100, description="Minimum instances")
    max_instances: int = Field(default=10, ge=1, le=100, description="Maximum instances")
    cooldown_seconds: int = Field(default=300, ge=60, le=3600, description="Cooldown period in seconds")


class ManualScalingRequest(BaseModel):
    """Request model for manual scaling"""
    component: ComponentType
    action: ScalingAction
    reason: str = Field(default="Manual scaling via API", description="Reason for scaling")


class SystemStatusResponse(BaseModel):
    """Response model for system status"""
    scaling_enabled: bool
    running: bool
    check_interval_seconds: int
    components: Dict[str, Any]
    latest_metrics: Optional[Dict[str, Any]]
    metrics_history_size: int


class ScalingRecommendationsResponse(BaseModel):
    """Response model for scaling recommendations"""
    timestamp: str
    analysis_period_minutes: int
    metrics_analyzed: int
    averages: Dict[str, float]
    recommendations: List[str]


class MetricCollectorRequest(BaseModel):
    """Request model for registering metric collectors"""
    name: str = Field(..., description="Metric name")
    description: str = Field(default="", description="Metric description")


# API Endpoints

@router.get("/status", response_model=SystemStatusResponse)
async def get_scaling_status(
    current_user: User = Depends(require_authentication),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Get current scaling system status"""
    try:
        status = scaling_service.get_system_status()
        return SystemStatusResponse(**status)
        
    except Exception as e:
        logger.error(f"Failed to get scaling status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve scaling status")


@router.get("/recommendations", response_model=ScalingRecommendationsResponse)
async def get_scaling_recommendations(
    current_user: User = Depends(require_authentication),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Get scaling recommendations based on recent metrics"""
    try:
        recommendations = scaling_service.get_scaling_recommendations()
        
        if "message" in recommendations:
            # No data available
            return ScalingRecommendationsResponse(
                timestamp=datetime.now(timezone.utc).isoformat(),
                analysis_period_minutes=10,
                metrics_analyzed=0,
                averages={},
                recommendations=[recommendations["message"]]
            )
        
        return ScalingRecommendationsResponse(**recommendations)
        
    except Exception as e:
        logger.error(f"Failed to get scaling recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve scaling recommendations")


@router.post("/configure")
async def configure_component_scaling(
    config: ComponentScalingConfig,
    current_user: User = Depends(require_admin_role),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Configure scaling parameters for a component (admin only)"""
    try:
        # Validate thresholds
        if config.scale_down_threshold >= config.scale_up_threshold:
            raise HTTPException(
                status_code=400, 
                detail="Scale down threshold must be less than scale up threshold"
            )
        
        if config.min_instances > config.max_instances:
            raise HTTPException(
                status_code=400,
                detail="Minimum instances cannot be greater than maximum instances"
            )
        
        # Configure scaling
        scaling_service.configure_component_scaling(
            component=config.component,
            metric_name=config.metric_name,
            scale_up_threshold=config.scale_up_threshold,
            scale_down_threshold=config.scale_down_threshold,
            min_instances=config.min_instances,
            max_instances=config.max_instances,
            cooldown_seconds=config.cooldown_seconds
        )
        
        return {
            "message": f"Scaling configured for {config.component.value}",
            "component": config.component.value,
            "metric": config.metric_name,
            "thresholds": {
                "scale_up": config.scale_up_threshold,
                "scale_down": config.scale_down_threshold
            },
            "instances": {
                "min": config.min_instances,
                "max": config.max_instances
            },
            "cooldown_seconds": config.cooldown_seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to configure component scaling: {e}")
        raise HTTPException(status_code=500, detail="Failed to configure scaling")


@router.post("/manual")
async def manual_scaling(
    request: ManualScalingRequest,
    current_user: User = Depends(require_admin_role),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Manually trigger scaling for a component (admin only)"""
    try:
        success = await scaling_service.manual_scale(
            component=request.component,
            action=request.action,
            reason=f"{request.reason} (triggered by {current_user.username})"
        )
        
        if success:
            return {
                "message": f"Manual scaling {request.action.value} initiated for {request.component.value}",
                "component": request.component.value,
                "action": request.action.value,
                "reason": request.reason,
                "triggered_by": current_user.username
            }
        else:
            raise HTTPException(status_code=400, detail="Manual scaling failed - check component status and limits")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Manual scaling failed: {e}")
        raise HTTPException(status_code=500, detail="Manual scaling request failed")


@router.get("/history")
async def get_scaling_history(
    component: Optional[ComponentType] = Query(default=None, description="Filter by component"),
    hours: int = Query(default=24, ge=1, le=168, description="Hours of history to retrieve"),
    limit: int = Query(default=100, ge=1, le=1000, description="Maximum number of events"),
    current_user: User = Depends(require_authentication),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Get scaling event history"""
    try:
        history = scaling_service.decision_engine.get_scaling_history(
            component=component,
            hours=hours
        )
        
        # Limit results
        history = history[:limit]
        
        # Convert to response format
        events = []
        for event in history:
            events.append({
                "timestamp": event.timestamp.isoformat(),
                "component": event.component.value,
                "action": event.action.value,
                "old_instances": event.old_instances,
                "new_instances": event.new_instances,
                "trigger_metric": event.trigger_metric,
                "trigger_value": event.trigger_value,
                "reason": event.reason
            })
        
        return {
            "events": events,
            "total_events": len(events),
            "filter_component": component.value if component else None,
            "hours_requested": hours,
            "limit_applied": limit
        }
        
    except Exception as e:
        logger.error(f"Failed to get scaling history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve scaling history")


@router.get("/metrics")
async def get_current_metrics(
    current_user: User = Depends(require_authentication),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Get current system metrics"""
    try:
        # Get latest metrics
        if not scaling_service.metrics_history:
            raise HTTPException(status_code=404, detail="No metrics available")
        
        latest_metrics = scaling_service.metrics_history[-1]
        
        return {
            "timestamp": latest_metrics.timestamp.isoformat(),
            "system_metrics": {
                "cpu_percent": latest_metrics.cpu_percent,
                "memory_percent": latest_metrics.memory_percent,
                "disk_percent": latest_metrics.disk_percent,
                "network_io_mbps": latest_metrics.network_io_mbps,
                "active_connections": latest_metrics.active_connections
            },
            "application_metrics": {
                "queue_length": latest_metrics.queue_length,
                "response_time_ms": latest_metrics.response_time_ms,
                "error_rate_percent": latest_metrics.error_rate_percent
            },
            "custom_metrics": latest_metrics.custom_metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")


@router.get("/metrics/history")
async def get_metrics_history(
    hours: int = Query(default=1, ge=1, le=24, description="Hours of history"),
    current_user: User = Depends(require_authentication),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Get metrics history for monitoring and analysis"""
    try:
        if not scaling_service.metrics_history:
            return {"metrics": [], "message": "No metrics history available"}
        
        # Filter by time range
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        filtered_metrics = [
            m for m in scaling_service.metrics_history 
            if m.timestamp > cutoff_time
        ]
        
        # Convert to response format
        metrics_data = []
        for metrics in filtered_metrics[-100:]:  # Limit to last 100 points
            metrics_data.append({
                "timestamp": metrics.timestamp.isoformat(),
                "cpu_percent": metrics.cpu_percent,
                "memory_percent": metrics.memory_percent,
                "queue_length": metrics.queue_length,
                "response_time_ms": metrics.response_time_ms,
                "active_connections": metrics.active_connections,
                "custom_metrics": metrics.custom_metrics
            })
        
        return {
            "metrics": metrics_data,
            "total_points": len(metrics_data),
            "hours_requested": hours,
            "oldest_timestamp": metrics_data[0]["timestamp"] if metrics_data else None,
            "newest_timestamp": metrics_data[-1]["timestamp"] if metrics_data else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get metrics history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics history")


# Admin-only endpoints

@router.post("/admin/enable")
async def enable_auto_scaling(
    current_user: User = Depends(require_admin_role),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Enable automatic scaling (admin only)"""
    try:
        scaling_service.enable_auto_scaling = True
        
        return {
            "message": "Automatic scaling enabled",
            "enabled": True,
            "enabled_by": current_user.username
        }
        
    except Exception as e:
        logger.error(f"Failed to enable auto scaling: {e}")
        raise HTTPException(status_code=500, detail="Failed to enable auto scaling")


@router.post("/admin/disable")
async def disable_auto_scaling(
    current_user: User = Depends(require_admin_role),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Disable automatic scaling (admin only)"""
    try:
        scaling_service.enable_auto_scaling = False
        
        return {
            "message": "Automatic scaling disabled",
            "enabled": False,
            "disabled_by": current_user.username
        }
        
    except Exception as e:
        logger.error(f"Failed to disable auto scaling: {e}")
        raise HTTPException(status_code=500, detail="Failed to disable auto scaling")


@router.get("/admin/components")
async def list_scalable_components(
    current_user: User = Depends(require_admin_role),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """List all scalable components and their current configuration (admin only)"""
    try:
        components_info = []
        
        for component_type in ComponentType:
            component_status = scaling_service.decision_engine.component_status.get(component_type)
            thresholds = scaling_service.decision_engine.thresholds.get(component_type, [])
            
            component_info = {
                "component": component_type.value,
                "configured": component_status is not None,
                "status": {
                    "current_instances": component_status.current_instances if component_status else 0,
                    "target_instances": component_status.target_instances if component_status else 0,
                    "min_instances": component_status.min_instances if component_status else 1,
                    "max_instances": component_status.max_instances if component_status else 10,
                    "is_scaling": component_status.is_scaling if component_status else False,
                    "last_scaled": component_status.last_scaled.isoformat() if component_status and component_status.last_scaled else None,
                    "last_action": component_status.last_action.value if component_status and component_status.last_action else None,
                    "health_status": component_status.health_status if component_status else "unknown"
                },
                "thresholds": [
                    {
                        "metric_name": t.metric_name,
                        "scale_up_threshold": t.scale_up_threshold,
                        "scale_down_threshold": t.scale_down_threshold,
                        "cooldown_seconds": t.cooldown_seconds
                    }
                    for t in thresholds
                ]
            }
            
            components_info.append(component_info)
        
        return {
            "components": components_info,
            "total_components": len(ComponentType),
            "configured_components": len([c for c in components_info if c["configured"]])
        }
        
    except Exception as e:
        logger.error(f"Failed to list scalable components: {e}")
        raise HTTPException(status_code=500, detail="Failed to list scalable components")


@router.delete("/admin/reset/{component}")
async def reset_component_scaling(
    component: ComponentType,
    current_user: User = Depends(require_admin_role),
    scaling_service: HorizontalScalingService = Depends(get_scaling_service)
):
    """Reset scaling configuration for a component (admin only)"""
    try:
        # Remove thresholds
        if component in scaling_service.decision_engine.thresholds:
            del scaling_service.decision_engine.thresholds[component]
        
        # Remove component status
        if component in scaling_service.decision_engine.component_status:
            del scaling_service.decision_engine.component_status[component]
        
        return {
            "message": f"Scaling configuration reset for {component.value}",
            "component": component.value,
            "reset_by": current_user.username
        }
        
    except Exception as e:
        logger.error(f"Failed to reset component scaling: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset component scaling")


# Health and utility endpoints

@router.get("/health")
async def scaling_service_health():
    """Check scaling service health"""
    try:
        scaling_service = get_scaling_service()
        status = scaling_service.get_system_status()
        
        return {
            "status": "healthy" if status["running"] else "unhealthy",
            "running": status["running"],
            "auto_scaling_enabled": status["scaling_enabled"],
            "configured_components": len(status["components"]),
            "metrics_available": status["latest_metrics"] is not None,
            "check_interval_seconds": status["check_interval_seconds"]
        }
        
    except Exception as e:
        logger.error(f"Scaling service health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "running": False
        }


@router.get("/info")
async def get_scaling_info():
    """Get general information about scaling capabilities"""
    return {
        "service": "Horizontal Scaling Service",
        "version": "1.0.0",
        "description": "Dynamic scaling for RAG system components",
        "supported_components": [component.value for component in ComponentType],
        "supported_actions": [action.value for action in ScalingAction],
        "features": [
            "Automatic scaling based on metrics",
            "Manual scaling control",
            "Configurable thresholds",
            "Multi-component support",
            "Scaling history tracking",
            "Real-time monitoring",
            "Admin controls"
        ]
    }