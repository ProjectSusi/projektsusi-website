#!/usr/bin/env python3
"""
Demo script for Horizontal Scaling Service
Shows dynamic scaling capabilities and monitoring
"""

import asyncio
import sys
import random
import time
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.services.scaling_service import (
    HorizontalScalingService, ComponentType, ScalingAction, MetricThreshold
)


# Mock component scalers for demonstration
async def api_workers_scaler(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
    """Mock API workers scaler"""
    print(f"    API Workers Scaler: {action.value} to {target_instances} instances")
    
    # Simulate scaling operation
    await asyncio.sleep(0.5)
    
    # Simulate occasional failures (10% chance)
    if random.random() < 0.1:
        print(f"      FAILED: Scaling operation failed")
        return False
    
    print(f"      SUCCESS: API workers scaled to {target_instances}")
    return True


async def background_jobs_scaler(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
    """Mock background jobs scaler"""
    print(f"    Background Jobs Scaler: {action.value} to {target_instances} instances")
    
    await asyncio.sleep(0.3)
    
    print(f"      SUCCESS: Background job workers scaled to {target_instances}")
    return True


async def document_processors_scaler(component: ComponentType, target_instances: int, action: ScalingAction) -> bool:
    """Mock document processors scaler"""
    print(f"    Document Processors Scaler: {action.value} to {target_instances} instances")
    
    await asyncio.sleep(0.7)
    
    print(f"      SUCCESS: Document processors scaled to {target_instances}")
    return True


# Mock metric collectors
def mock_cpu_metric():
    """Mock CPU metric that varies over time"""
    # Simulate load patterns
    base_cpu = 30 + (time.time() % 60) * 2  # Varies from 30-150%
    noise = random.uniform(-10, 10)
    return max(0, min(100, base_cpu + noise))


def mock_memory_metric():
    """Mock memory metric"""
    return random.uniform(40, 90)


def mock_queue_length_metric():
    """Mock queue length metric"""
    # Simulate varying queue lengths
    base_queue = 5 + random.randint(-3, 15)
    return max(0, base_queue)


def mock_response_time_metric():
    """Mock response time metric"""
    # Simulate response time variations
    base_time = 200 + random.randint(-50, 800)
    return max(50, base_time)


def mock_error_rate_metric():
    """Mock error rate metric"""
    return random.uniform(0, 5)


async def simulate_load_test(scaling_service: HorizontalScalingService, duration_seconds: int = 30):
    """Simulate a load test that triggers scaling"""
    print(f"\nSimulating load test for {duration_seconds} seconds...")
    
    # Override metrics to simulate high load
    def high_cpu_metric():
        return random.uniform(85, 95)  # High CPU
    
    def high_queue_metric():
        return random.uniform(20, 40)  # High queue
    
    def high_response_time_metric():
        return random.uniform(1200, 2000)  # High response time
    
    # Temporarily replace metrics
    scaling_service.register_metric_collector("cpu_percent_override", high_cpu_metric)
    scaling_service.register_metric_collector("queue_length", high_queue_metric)
    scaling_service.register_metric_collector("response_time_ms", high_response_time_metric)
    
    print("High load metrics active - should trigger scale up actions")
    
    # Wait for load test duration
    await asyncio.sleep(duration_seconds)
    
    # Restore normal metrics
    def normal_cpu_metric():
        return random.uniform(15, 25)  # Low CPU
    
    def normal_queue_metric():
        return random.uniform(0, 3)  # Low queue
    
    def normal_response_time_metric():
        return random.uniform(100, 300)  # Normal response time
    
    scaling_service.register_metric_collector("cpu_percent_override", normal_cpu_metric)
    scaling_service.register_metric_collector("queue_length", normal_queue_metric)
    scaling_service.register_metric_collector("response_time_ms", normal_response_time_metric)
    
    print("Load test completed - normal metrics restored, should trigger scale down")


async def demo_horizontal_scaling():
    """Demonstrate horizontal scaling functionality"""
    print("Horizontal Scaling Service Demo")
    print("=" * 50)
    
    # Initialize scaling service
    print("\n1. Initializing Horizontal Scaling Service...")
    scaling_service = HorizontalScalingService(
        check_interval_seconds=5,  # Check every 5 seconds for demo
        enable_auto_scaling=True
    )
    
    print("Scaling service initialized")
    print(f"Auto-scaling: {scaling_service.enable_auto_scaling}")
    print(f"Check interval: {scaling_service.check_interval_seconds} seconds")
    
    # Register custom metric collectors
    print("\n2. Registering Custom Metrics...")
    scaling_service.register_metric_collector("mock_cpu", mock_cpu_metric)
    scaling_service.register_metric_collector("mock_memory", mock_memory_metric)
    scaling_service.register_metric_collector("queue_length", mock_queue_length_metric)
    scaling_service.register_metric_collector("response_time_ms", mock_response_time_metric)
    scaling_service.register_metric_collector("error_rate_percent", mock_error_rate_metric)
    
    print("Registered 5 custom metrics:")
    print("  - mock_cpu: Simulated CPU usage")
    print("  - mock_memory: Simulated memory usage")
    print("  - queue_length: Job queue length")
    print("  - response_time_ms: API response time")
    print("  - error_rate_percent: Error rate")
    
    # Register component scalers
    print("\n3. Registering Component Scalers...")
    scaling_service.register_component_scaler(ComponentType.API_WORKERS, api_workers_scaler)
    scaling_service.register_component_scaler(ComponentType.BACKGROUND_JOBS, background_jobs_scaler)
    scaling_service.register_component_scaler(ComponentType.DOCUMENT_PROCESSORS, document_processors_scaler)
    
    print("Registered scalers for 3 component types:")
    print("  - API Workers")
    print("  - Background Jobs")
    print("  - Document Processors")
    
    # Configure scaling thresholds
    print("\n4. Configuring Scaling Thresholds...")
    
    # API Workers - based on CPU and response time
    scaling_service.configure_component_scaling(
        component=ComponentType.API_WORKERS,
        metric_name="mock_cpu",
        scale_up_threshold=70.0,
        scale_down_threshold=30.0,
        min_instances=2,
        max_instances=8,
        cooldown_seconds=15  # Short cooldown for demo
    )
    
    scaling_service.configure_component_scaling(
        component=ComponentType.API_WORKERS,
        metric_name="response_time_ms",
        scale_up_threshold=800.0,
        scale_down_threshold=200.0,
        min_instances=2,
        max_instances=8,
        cooldown_seconds=15
    )
    
    # Background Jobs - based on queue length
    scaling_service.configure_component_scaling(
        component=ComponentType.BACKGROUND_JOBS,
        metric_name="queue_length",
        scale_up_threshold=15.0,
        scale_down_threshold=5.0,
        min_instances=1,
        max_instances=6,
        cooldown_seconds=20
    )
    
    # Document Processors - based on memory
    scaling_service.configure_component_scaling(
        component=ComponentType.DOCUMENT_PROCESSORS,
        metric_name="mock_memory",
        scale_up_threshold=80.0,
        scale_down_threshold=40.0,
        min_instances=1,
        max_instances=4,
        cooldown_seconds=25
    )
    
    print("Configured scaling thresholds:")
    print("  API Workers:")
    print("    - CPU: scale up >70%, scale down <30%")
    print("    - Response time: scale up >800ms, scale down <200ms")
    print("    - Instances: 2-8")
    print("  Background Jobs:")
    print("    - Queue length: scale up >15, scale down <5")
    print("    - Instances: 1-6")
    print("  Document Processors:")
    print("    - Memory: scale up >80%, scale down <40%")
    print("    - Instances: 1-4")
    
    # Start the scaling service
    print("\n5. Starting Scaling Service...")
    await scaling_service.start()
    print("Scaling service started and monitoring")
    
    try:
        # Monitor initial state
        print("\n6. Initial System Monitoring...")
        
        for i in range(3):
            await asyncio.sleep(2)
            
            # Get current metrics
            if scaling_service.metrics_history:
                latest_metrics = scaling_service.metrics_history[-1]
                print(f"\nMetrics snapshot {i+1}:")
                print(f"  CPU: {latest_metrics.cpu_percent:.1f}%")
                print(f"  Memory: {latest_metrics.memory_percent:.1f}%")
                print(f"  Queue Length: {latest_metrics.queue_length}")
                print(f"  Response Time: {latest_metrics.response_time_ms:.0f}ms")
                print(f"  Error Rate: {latest_metrics.error_rate_percent:.2f}%")
                
                # Custom metrics
                custom = latest_metrics.custom_metrics
                if custom:
                    print(f"  Mock CPU: {custom.get('mock_cpu', 0):.1f}%")
                    print(f"  Mock Memory: {custom.get('mock_memory', 0):.1f}%")
        
        # Show system status
        print("\n7. System Status Report...")
        status = scaling_service.get_system_status()
        
        print(f"Scaling enabled: {status['scaling_enabled']}")
        print(f"Service running: {status['running']}")
        print(f"Configured components: {len(status['components'])}")
        
        print("\nComponent Status:")
        for comp_name, comp_status in status['components'].items():
            print(f"  {comp_name}:")
            print(f"    Current instances: {comp_status['current_instances']}")
            print(f"    Target instances: {comp_status['target_instances']}")
            print(f"    Range: {comp_status['min_instances']}-{comp_status['max_instances']}")
            print(f"    Is scaling: {comp_status['is_scaling']}")
            print(f"    Health: {comp_status['health_status']}")
        
        # Demo manual scaling
        print("\n8. Manual Scaling Demo...")
        print("Triggering manual scale up for API Workers...")
        
        success = await scaling_service.manual_scale(
            ComponentType.API_WORKERS,
            ScalingAction.SCALE_UP,
            "Manual demo scaling"
        )
        
        if success:
            print("Manual scale up successful!")
        else:
            print("Manual scale up failed (may be at limits)")
        
        await asyncio.sleep(3)
        
        # Show scaling history
        print("\n9. Scaling History...")
        history = scaling_service.decision_engine.get_scaling_history(hours=1)
        
        if history:
            print(f"Found {len(history)} scaling events:")
            for event in history[:5]:  # Show last 5 events
                print(f"  {event.timestamp.strftime('%H:%M:%S')} - "
                      f"{event.component.value} {event.action.value} "
                      f"({event.old_instances}->{event.new_instances}) "
                      f"- {event.reason}")
        else:
            print("No scaling events recorded yet")
        
        # Demo load test
        print("\n10. Load Test Simulation...")
        await simulate_load_test(scaling_service, duration_seconds=20)
        
        # Monitor during and after load test
        print("\n11. Post-Load Test Monitoring...")
        
        for i in range(6):
            await asyncio.sleep(8)  # Wait for scaling decisions
            
            # Get updated status
            status = scaling_service.get_system_status()
            
            print(f"\nPost-load check {i+1}:")
            
            # Show latest metrics
            if scaling_service.metrics_history:
                latest = scaling_service.metrics_history[-1]
                print(f"  Current metrics:")
                print(f"    CPU: {latest.cpu_percent:.1f}%")
                print(f"    Queue: {latest.queue_length}")
                print(f"    Response time: {latest.response_time_ms:.0f}ms")
            
            # Show instance counts
            print(f"  Instance counts:")
            for comp_name, comp_status in status['components'].items():
                current = comp_status['current_instances']
                target = comp_status['target_instances']
                scaling = " (scaling)" if comp_status['is_scaling'] else ""
                print(f"    {comp_name}: {current}/{target}{scaling}")
            
            # Check for recent scaling events
            recent_history = scaling_service.decision_engine.get_scaling_history(hours=1)
            recent_events = [e for e in recent_history if 
                           (datetime.now(timezone.utc) - e.timestamp).total_seconds() < 30]
            
            if recent_events:
                print(f"  Recent scaling events:")
                for event in recent_events:
                    print(f"    {event.component.value} {event.action.value} "
                          f"({event.old_instances}->{event.new_instances})")
        
        # Demo scaling recommendations
        print("\n12. Scaling Recommendations...")
        recommendations = scaling_service.get_scaling_recommendations()
        
        print(f"Analysis period: {recommendations['analysis_period_minutes']} minutes")
        print(f"Metrics analyzed: {recommendations['metrics_analyzed']} data points")
        
        print("Average metrics:")
        for metric, value in recommendations['averages'].items():
            print(f"  {metric}: {value:.2f}")
        
        print("Recommendations:")
        for i, rec in enumerate(recommendations['recommendations'], 1):
            print(f"  {i}. {rec}")
        
        # Demo configuration changes
        print("\n13. Dynamic Configuration Demo...")
        
        print("Updating API Workers scaling thresholds...")
        scaling_service.configure_component_scaling(
            component=ComponentType.API_WORKERS,
            metric_name="mock_cpu",
            scale_up_threshold=60.0,  # Lower threshold
            scale_down_threshold=20.0,  # Lower threshold
            min_instances=3,  # Higher minimum
            max_instances=10,  # Higher maximum
            cooldown_seconds=10
        )
        
        print("Configuration updated:")
        print("  - Lower CPU thresholds (more sensitive)")
        print("  - Higher minimum instances (3 instead of 2)")
        print("  - Higher maximum instances (10 instead of 8)")
        print("  - Shorter cooldown (more responsive)")
        
        # Final monitoring
        print("\n14. Final System State...")
        await asyncio.sleep(5)
        
        final_status = scaling_service.get_system_status()
        final_history = scaling_service.decision_engine.get_scaling_history(hours=1)
        
        print("Final component states:")
        for comp_name, comp_status in final_status['components'].items():
            print(f"  {comp_name}: {comp_status['current_instances']} instances")
        
        print(f"\nTotal scaling events during demo: {len(final_history)}")
        
        # Show metrics summary
        if scaling_service.metrics_history:
            metrics_count = len(scaling_service.metrics_history)
            print(f"Total metrics collected: {metrics_count}")
            
            if metrics_count > 0:
                first_metric = scaling_service.metrics_history[0]
                last_metric = scaling_service.metrics_history[-1]
                duration = (last_metric.timestamp - first_metric.timestamp).total_seconds()
                print(f"Monitoring duration: {duration:.0f} seconds")
    
    except Exception as e:
        print(f"Demo error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Stop the service
        print("\n15. Shutting down...")
        await scaling_service.stop()
        print("Scaling service stopped")
    
    print("\nHorizontal Scaling Demo Complete!")
    print("Features demonstrated:")
    print("  [OK] Automatic scaling based on multiple metrics")
    print("  [OK] Component-specific scaling configurations")
    print("  [OK] Manual scaling control")
    print("  [OK] Real-time metrics collection and monitoring")
    print("  [OK] Scaling history and event tracking")
    print("  [OK] Dynamic threshold reconfiguration")
    print("  [OK] Load test simulation and response")
    print("  [OK] Intelligent scaling recommendations")
    print("  [OK] Multi-component scaling orchestration")
    print("  [OK] Cooldown periods and rate limiting")


if __name__ == "__main__":
    try:
        asyncio.run(demo_horizontal_scaling())
    except KeyboardInterrupt:
        print("\nDemo interrupted by user")
    except Exception as e:
        print(f"\nDemo failed: {e}")
        import traceback
        traceback.print_exc()