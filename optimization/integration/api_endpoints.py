#!/usr/bin/env python3
"""
Phase 1 API Integration Endpoints
Provides API endpoints for monitoring and controlling Phase 1 optimizations
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
import logging
from typing import Dict, Any, Optional
import asyncio
import time
from pathlib import Path

from .phase1_coordinator import (
    get_phase1_coordinator,
    initialize_phase1_coordinator
)

logger = logging.getLogger(__name__)

# Create API router for Phase 1 endpoints
phase1_router = APIRouter(prefix="/api/v1/phase1", tags=["Phase 1 Optimization"])


@phase1_router.get("/status")
async def get_phase1_status() -> Dict[str, Any]:
    """Get comprehensive Phase 1 status"""
    try:
        coordinator = get_phase1_coordinator()
        if not coordinator:
            return {
                "status": "not_initialized",
                "message": "Phase 1 coordinator not initialized",
                "components": {},
                "metrics": {}
            }
        
        return await coordinator.get_phase1_status_report()
        
    except Exception as e:
        logger.error(f"Status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/dashboard")
async def get_dashboard_data() -> Dict[str, Any]:
    """Get real-time dashboard data"""
    try:
        coordinator = get_phase1_coordinator()
        if not coordinator:
            return {
                "error": "Phase 1 coordinator not initialized",
                "timestamp": time.time()
            }
        
        return await coordinator.get_performance_dashboard_data()
        
    except Exception as e:
        logger.error(f"Dashboard endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/dashboard/ui")
async def get_dashboard_ui() -> HTMLResponse:
    """Serve the real-time monitoring dashboard"""
    try:
        # Load the dashboard HTML file
        dashboard_path = Path(__file__).parent.parent / "monitoring" / "real_time_dashboard.html"
        
        if not dashboard_path.exists():
            raise HTTPException(status_code=404, detail="Dashboard file not found")
        
        with open(dashboard_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        logger.error(f"Dashboard UI error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.post("/initialize")
async def initialize_phase1(
    background_tasks: BackgroundTasks,
    redis_url: Optional[str] = "redis://localhost:6379",
    document_storage: Optional[str] = "./documents",
    enable_monitoring: bool = True
) -> Dict[str, Any]:
    """Initialize Phase 1 optimizations"""
    try:
        # Check if already initialized
        coordinator = get_phase1_coordinator()
        if coordinator and coordinator.is_initialized:
            return {
                "status": "already_initialized",
                "message": "Phase 1 already initialized",
                "coordinator_status": coordinator.overall_status.value
            }
        
        # Initialize in background
        async def init_phase1():
            try:
                await initialize_phase1_coordinator(
                    redis_url=redis_url,
                    document_storage_path=document_storage,
                    enable_monitoring=enable_monitoring
                )
            except Exception as e:
                logger.error(f"Background initialization failed: {e}")
        
        background_tasks.add_task(init_phase1)
        
        return {
            "status": "initializing",
            "message": "Phase 1 initialization started",
            "expected_duration": "2-5 minutes",
            "check_status_endpoint": "/api/v1/phase1/status"
        }
        
    except Exception as e:
        logger.error(f"Initialize endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/metrics/current")
async def get_current_metrics() -> Dict[str, Any]:
    """Get current system metrics"""
    try:
        coordinator = get_phase1_coordinator()
        if not coordinator:
            raise HTTPException(status_code=404, detail="Phase 1 coordinator not initialized")
        
        if not coordinator.current_metrics:
            return {
                "status": "no_metrics",
                "message": "Metrics not yet collected",
                "timestamp": time.time()
            }
        
        return {
            "status": "success",
            "metrics": coordinator.current_metrics.__dict__,
            "baseline": coordinator.baseline_metrics.__dict__ if coordinator.baseline_metrics else None,
            "improvement": coordinator._calculate_performance_improvement() * 100
        }
        
    except Exception as e:
        logger.error(f"Metrics endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/metrics/history")
async def get_metrics_history(limit: int = 50) -> Dict[str, Any]:
    """Get metrics history"""
    try:
        coordinator = get_phase1_coordinator()
        if not coordinator:
            raise HTTPException(status_code=404, detail="Phase 1 coordinator not initialized")
        
        history = coordinator.metrics_history[-limit:] if coordinator.metrics_history else []
        
        return {
            "status": "success",
            "count": len(history),
            "history": [metric.__dict__ for metric in history],
            "baseline": coordinator.baseline_metrics.__dict__ if coordinator.baseline_metrics else None
        }
        
    except Exception as e:
        logger.error(f"History endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/cache/stats")
async def get_cache_statistics() -> Dict[str, Any]:
    """Get Redis cache statistics"""
    try:
        from ..caching.enhanced_redis_config import get_system_cache_report
        
        cache_report = await get_system_cache_report()
        
        return {
            "status": "success" if cache_report else "error",
            "cache_report": cache_report,
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Cache stats endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/documents/stats")
async def get_document_statistics() -> Dict[str, Any]:
    """Get document corpus statistics"""
    try:
        from ..corpus.document_expansion_service import get_document_expansion_service
        
        doc_service = get_document_expansion_service()
        if not doc_service:
            return {
                "status": "not_initialized",
                "message": "Document expansion service not initialized"
            }
        
        corpus_report = await doc_service.get_corpus_report()
        
        return {
            "status": "success" if not corpus_report.get('error') else "error",
            "corpus_report": corpus_report,
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Document stats endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.post("/documents/process")
async def process_documents(
    background_tasks: BackgroundTasks,
    file_paths: list[str],
    processing_strategy: str = "standard"
) -> Dict[str, Any]:
    """Process documents for corpus expansion"""
    try:
        from ..corpus.document_expansion_service import get_document_expansion_service, ProcessingStrategy
        
        doc_service = get_document_expansion_service()
        if not doc_service:
            raise HTTPException(status_code=404, detail="Document service not initialized")
        
        # Validate processing strategy
        strategy_map = {
            'standard': ProcessingStrategy.STANDARD,
            'aggressive_split': ProcessingStrategy.AGGRESSIVE_SPLIT,
            'semantic_chunks': ProcessingStrategy.SEMANTIC_CHUNKS,
            'hierarchical': ProcessingStrategy.HIERARCHICAL
        }
        
        strategy = strategy_map.get(processing_strategy.lower(), ProcessingStrategy.STANDARD)
        
        # Process documents in background
        async def process_docs():
            try:
                results = await doc_service.batch_process_documents(file_paths, strategy)
                logger.info(f"Processed {len(results)} documents")
            except Exception as e:
                logger.error(f"Background document processing failed: {e}")
        
        background_tasks.add_task(process_docs)
        
        return {
            "status": "processing",
            "message": f"Started processing {len(file_paths)} documents",
            "strategy": processing_strategy,
            "check_progress": "/api/v1/phase1/documents/stats"
        }
        
    except Exception as e:
        logger.error(f"Document processing endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/components/{component_name}")
async def get_component_status(component_name: str) -> Dict[str, Any]:
    """Get detailed status for a specific component"""
    try:
        coordinator = get_phase1_coordinator()
        if not coordinator:
            raise HTTPException(status_code=404, detail="Phase 1 coordinator not initialized")
        
        if component_name not in coordinator.components:
            raise HTTPException(status_code=404, detail=f"Component '{component_name}' not found")
        
        component = coordinator.components[component_name]
        
        return {
            "status": "success",
            "component": {
                "name": component.name,
                "status": component.status.value,
                "health_score": component.health_score,
                "last_update": component.last_update,
                "metrics": component.metrics,
                "errors": component.errors,
                "error_count": len(component.errors)
            },
            "timestamp": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Component status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.post("/optimization/run")
async def run_optimization(
    background_tasks: BackgroundTasks,
    optimization_type: str = "all"
) -> Dict[str, Any]:
    """Manually trigger optimization routines"""
    try:
        coordinator = get_phase1_coordinator()
        if not coordinator:
            raise HTTPException(status_code=404, detail="Phase 1 coordinator not initialized")
        
        async def run_optimizations():
            try:
                if optimization_type in ["all", "cache"]:
                    await coordinator._run_cache_optimization()
                
                if optimization_type in ["all", "documents"]:
                    await coordinator._run_document_optimization()
                
                if optimization_type in ["all", "performance"]:
                    await coordinator._run_performance_optimization()
                
                logger.info(f"Manual optimization completed: {optimization_type}")
                
            except Exception as e:
                logger.error(f"Manual optimization failed: {e}")
        
        background_tasks.add_task(run_optimizations)
        
        return {
            "status": "started",
            "message": f"Optimization '{optimization_type}' started",
            "expected_duration": "1-3 minutes"
        }
        
    except Exception as e:
        logger.error(f"Optimization endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@phase1_router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint for Phase 1 system"""
    try:
        coordinator = get_phase1_coordinator()
        
        if not coordinator:
            return {
                "status": "unhealthy",
                "message": "Phase 1 coordinator not initialized",
                "timestamp": time.time()
            }
        
        # Calculate overall health
        if not coordinator.components:
            overall_health = 0.0
        else:
            overall_health = sum(comp.health_score for comp in coordinator.components.values()) / len(coordinator.components)
        
        # Determine health status
        if overall_health >= 0.8:
            health_status = "healthy"
        elif overall_health >= 0.6:
            health_status = "warning"
        else:
            health_status = "unhealthy"
        
        return {
            "status": health_status,
            "overall_health_score": overall_health,
            "phase1_status": coordinator.overall_status.value,
            "components_healthy": sum(1 for comp in coordinator.components.values() if comp.health_score > 0.5),
            "total_components": len(coordinator.components),
            "performance_improvement": coordinator._calculate_performance_improvement() * 100,
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": time.time()
        }


@phase1_router.post("/reset")
async def reset_phase1(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """Reset Phase 1 system (for development/testing)"""
    try:
        from .phase1_coordinator import shutdown_phase1_coordinator
        
        async def reset_system():
            try:
                await shutdown_phase1_coordinator()
                logger.info("Phase 1 system reset completed")
            except Exception as e:
                logger.error(f"Reset failed: {e}")
        
        background_tasks.add_task(reset_system)
        
        return {
            "status": "resetting",
            "message": "Phase 1 system reset initiated",
            "warning": "This will shut down all optimizations"
        }
        
    except Exception as e:
        logger.error(f"Reset endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Error handlers
@phase1_router.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "status": "not_found",
            "message": str(exc.detail) if hasattr(exc, 'detail') else "Resource not found",
            "timestamp": time.time()
        }
    )


@phase1_router.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "status": "internal_error",
            "message": "Internal server error occurred",
            "timestamp": time.time()
        }
    )


# Utility function to integrate with main application
def integrate_phase1_routes(main_app):
    """Integrate Phase 1 routes with the main FastAPI application"""
    try:
        main_app.include_router(phase1_router)
        logger.info("Phase 1 API routes integrated successfully")
    except Exception as e:
        logger.error(f"Failed to integrate Phase 1 routes: {e}")
        raise