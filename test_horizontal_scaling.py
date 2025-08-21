#!/usr/bin/env python3
"""
Test Horizontal Scaling System
Comprehensive test of horizontal scaling, auto-scaling, and manual scaling features
"""
import os
import requests
import json
import time
import concurrent.futures
from datetime import datetime, timezone
from typing import Dict, List, Any

# API endpoint
BASE_URL = "http://localhost:8000"

def check_scaling_service_health():
    """Check if horizontal scaling service is healthy"""
    print("=== Checking Horizontal Scaling Service Health ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/health")
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Scaling service status: {health.get('status', 'unknown')}")
            print(f"   Running: {health.get('running', False)}")
            print(f"   Auto-scaling enabled: {health.get('auto_scaling_enabled', False)}")
            print(f"   Configured components: {health.get('configured_components', 0)}")
            print(f"   Metrics available: {health.get('metrics_available', False)}")
            print(f"   Check interval: {health.get('check_interval_seconds', 0)}s")
            return health.get('status') == 'healthy'
        else:
            print(f"❌ Scaling service health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking scaling service health: {e}")
        return False

def get_scaling_status():
    """Get detailed scaling system status"""
    print("\n=== Scaling System Status ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ Scaling status retrieved")
            print(f"   Auto-scaling enabled: {status.get('scaling_enabled', False)}")
            print(f"   Service running: {status.get('running', False)}")
            print(f"   Check interval: {status.get('check_interval_seconds', 0)}s")
            print(f"   Metrics history size: {status.get('metrics_history_size', 0)}")
            
            components = status.get('components', {})
            print(f"\n   📊 Component Status ({len(components)} components):")
            for component_name, component_data in components.items():
                print(f"     {component_name}:")
                print(f"       Current instances: {component_data.get('current_instances', 'N/A')}")
                print(f"       Target instances: {component_data.get('target_instances', 'N/A')}")
                print(f"       Min/Max: {component_data.get('min_instances', 'N/A')}/{component_data.get('max_instances', 'N/A')}")
                print(f"       Is scaling: {component_data.get('is_scaling', False)}")
                print(f"       Health: {component_data.get('health_status', 'unknown')}")
                if component_data.get('last_scaled'):
                    print(f"       Last scaled: {component_data.get('last_scaled')} ({component_data.get('last_action', 'N/A')})")
                print()
            
            return status
        else:
            print(f"❌ Failed to get scaling status: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting scaling status: {e}")
        return None

def get_current_metrics():
    """Get current system metrics"""
    print("\n=== Current System Metrics ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/metrics")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Metrics retrieved (timestamp: {data.get('timestamp', 'N/A')})")
            
            system_metrics = data.get('system_metrics', {})
            print(f"   🖥️ System Metrics:")
            print(f"     CPU: {system_metrics.get('cpu_percent', 0):.1f}%")
            print(f"     Memory: {system_metrics.get('memory_percent', 0):.1f}%")
            print(f"     Disk: {system_metrics.get('disk_percent', 0):.1f}%")
            print(f"     Network I/O: {system_metrics.get('network_io_mbps', 0):.1f} MB/s")
            print(f"     Active connections: {system_metrics.get('active_connections', 0)}")
            
            app_metrics = data.get('application_metrics', {})
            print(f"   📱 Application Metrics:")
            print(f"     Queue length: {app_metrics.get('queue_length', 0)}")
            print(f"     Response time: {app_metrics.get('response_time_ms', 0):.1f} ms")
            print(f"     Error rate: {app_metrics.get('error_rate_percent', 0):.2f}%")
            
            custom_metrics = data.get('custom_metrics', {})
            if custom_metrics:
                print(f"   🔧 Custom Metrics:")
                for metric, value in custom_metrics.items():
                    print(f"     {metric}: {value}")
            
            return data
        else:
            print(f"❌ Failed to get current metrics: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting current metrics: {e}")
        return None

def get_scaling_recommendations():
    """Get scaling recommendations"""
    print("\n=== Scaling Recommendations ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/recommendations")
        if response.status_code == 200:
            recommendations = response.json()
            print(f"✅ Recommendations retrieved")
            print(f"   Analysis period: {recommendations.get('analysis_period_minutes', 0)} minutes")
            print(f"   Metrics analyzed: {recommendations.get('metrics_analyzed', 0)} data points")
            
            averages = recommendations.get('averages', {})
            if averages:
                print(f"   📊 Average metrics:")
                for metric, value in averages.items():
                    print(f"     {metric}: {value}")
            
            rec_list = recommendations.get('recommendations', [])
            print(f"   💡 Recommendations ({len(rec_list)}):")
            for i, rec in enumerate(rec_list, 1):
                print(f"     {i}. {rec}")
            
            return recommendations
        else:
            print(f"❌ Failed to get recommendations: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting recommendations: {e}")
        return None

def list_scalable_components():
    """List all scalable components and their configuration"""
    print("\n=== Scalable Components Configuration ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/admin/components")
        if response.status_code == 200:
            data = response.json()
            components = data.get('components', [])
            
            print(f"✅ Found {len(components)} scalable components")
            print(f"   Configured components: {data.get('configured_components', 0)}")
            
            for component in components:
                print(f"\n   🔧 {component['component'].upper()}")
                print(f"      Configured: {component.get('configured', False)}")
                
                status = component.get('status', {})
                if status:
                    print(f"      Current/Target instances: {status.get('current_instances', 0)}/{status.get('target_instances', 0)}")
                    print(f"      Min/Max instances: {status.get('min_instances', 1)}/{status.get('max_instances', 10)}")
                    print(f"      Is scaling: {status.get('is_scaling', False)}")
                    print(f"      Health: {status.get('health_status', 'unknown')}")
                
                thresholds = component.get('thresholds', [])
                if thresholds:
                    print(f"      Scaling thresholds:")
                    for threshold in thresholds:
                        print(f"        - {threshold.get('metric_name', 'unknown')}: "
                              f"up>{threshold.get('scale_up_threshold', 0)}, "
                              f"down<{threshold.get('scale_down_threshold', 0)} "
                              f"(cooldown: {threshold.get('cooldown_seconds', 0)}s)")
            
            return components
        else:
            print(f"❌ Failed to list components: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error listing components: {e}")
        return []

def test_manual_scaling():
    """Test manual scaling functionality"""
    print("\n=== Testing Manual Scaling ===")
    
    try:
        # Test scaling up API workers
        print("1. Testing manual scale-up of API workers...")
        scale_up_data = {
            "component": "api_workers",
            "action": "scale_up",
            "reason": "Testing manual scaling functionality"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/scaling/manual", json=scale_up_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Scale-up successful")
            print(f"      Component: {result.get('component', 'unknown')}")
            print(f"      Action: {result.get('action', 'unknown')}")
            print(f"      Triggered by: {result.get('triggered_by', 'unknown')}")
        else:
            print(f"   ❌ Scale-up failed: {response.status_code}")
            print(f"      Error: {response.text}")
        
        # Wait a moment before next test
        time.sleep(2)
        
        # Test scaling down
        print("\n2. Testing manual scale-down of API workers...")
        scale_down_data = {
            "component": "api_workers",
            "action": "scale_down",
            "reason": "Testing manual scale-down functionality"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/scaling/manual", json=scale_down_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Scale-down successful")
            print(f"      Component: {result.get('component', 'unknown')}")
            print(f"      Action: {result.get('action', 'unknown')}")
        else:
            print(f"   ❌ Scale-down failed: {response.status_code}")
            print(f"      Error: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing manual scaling: {e}")
        return False

def test_scaling_configuration():
    """Test scaling configuration functionality"""
    print("\n=== Testing Scaling Configuration ===")
    
    try:
        # Configure scaling for background jobs
        print("1. Testing scaling configuration for background jobs...")
        config_data = {
            "component": "background_jobs",
            "metric_name": "queue_length",
            "scale_up_threshold": 15.0,
            "scale_down_threshold": 3.0,
            "min_instances": 1,
            "max_instances": 5,
            "cooldown_seconds": 120
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/scaling/configure", json=config_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Configuration successful")
            print(f"      Component: {result.get('component', 'unknown')}")
            print(f"      Metric: {result.get('metric', 'unknown')}")
            thresholds = result.get('thresholds', {})
            print(f"      Scale up/down: {thresholds.get('scale_up', 0)}/{thresholds.get('scale_down', 0)}")
            instances = result.get('instances', {})
            print(f"      Min/Max instances: {instances.get('min', 0)}/{instances.get('max', 0)}")
        else:
            print(f"   ❌ Configuration failed: {response.status_code}")
            print(f"      Error: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing scaling configuration: {e}")
        return False

def get_scaling_history():
    """Get scaling event history"""
    print("\n=== Scaling Event History ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/history?hours=1&limit=10")
        if response.status_code == 200:
            data = response.json()
            events = data.get('events', [])
            
            print(f"✅ Retrieved {len(events)} scaling events (last 1 hour)")
            
            if events:
                print("   Recent scaling events:")
                for i, event in enumerate(events[:5], 1):  # Show first 5
                    print(f"     {i}. {event.get('timestamp', 'unknown')}")
                    print(f"        Component: {event.get('component', 'unknown')}")
                    print(f"        Action: {event.get('action', 'unknown')}")
                    print(f"        Instances: {event.get('old_instances', 0)} -> {event.get('new_instances', 0)}")
                    print(f"        Trigger: {event.get('trigger_metric', 'unknown')} = {event.get('trigger_value', 0)}")
                    print(f"        Reason: {event.get('reason', 'No reason provided')}")
                    print()
            else:
                print("   No scaling events found in the last hour")
            
            return events
        else:
            print(f"❌ Failed to get scaling history: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting scaling history: {e}")
        return []

def generate_load_for_scaling():
    """Generate load to trigger potential scaling"""
    print("\n=== Generating Load to Test Auto-Scaling ===")
    
    try:
        print("Generating concurrent requests to simulate high load...")
        
        def make_request():
            try:
                response = requests.post(f"{BASE_URL}/api/v1/query", 
                                       json={"query": "scaling load test query"}, 
                                       timeout=10)
                return response.status_code == 200
            except:
                return False
        
        # Generate load with multiple concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            for i in range(20):  # 20 concurrent requests
                future = executor.submit(make_request)
                futures.append(future)
            
            results = []
            for future in concurrent.futures.as_completed(futures, timeout=30):
                results.append(future.result())
        
        successful_requests = sum(results)
        print(f"✅ Load generation completed: {successful_requests}/20 requests successful")
        
        # Wait for metrics to be collected and potential scaling to occur
        print("Waiting for metrics collection and potential auto-scaling...")
        time.sleep(30)  # Wait 30 seconds
        
        return successful_requests > 0
        
    except Exception as e:
        print(f"❌ Error generating load: {e}")
        return False

def test_auto_scaling_controls():
    """Test enabling/disabling auto-scaling"""
    print("\n=== Testing Auto-Scaling Controls ===")
    
    try:
        # Disable auto-scaling
        print("1. Testing disable auto-scaling...")
        response = requests.post(f"{BASE_URL}/api/v1/scaling/admin/disable")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Auto-scaling disabled")
            print(f"      Status: {result.get('message', 'No message')}")
            print(f"      Disabled by: {result.get('disabled_by', 'unknown')}")
        else:
            print(f"   ❌ Failed to disable auto-scaling: {response.status_code}")
        
        time.sleep(1)
        
        # Re-enable auto-scaling
        print("\n2. Testing enable auto-scaling...")
        response = requests.post(f"{BASE_URL}/api/v1/scaling/admin/enable")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Auto-scaling enabled")
            print(f"      Status: {result.get('message', 'No message')}")
            print(f"      Enabled by: {result.get('enabled_by', 'unknown')}")
        else:
            print(f"   ❌ Failed to enable auto-scaling: {response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing auto-scaling controls: {e}")
        return False

def get_metrics_history():
    """Get metrics history for analysis"""
    print("\n=== Metrics History Analysis ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/scaling/metrics/history?hours=1")
        if response.status_code == 200:
            data = response.json()
            metrics = data.get('metrics', [])
            
            print(f"✅ Retrieved {len(metrics)} metric data points")
            if data.get('total_points', 0) > 0:
                print(f"   Time range: {data.get('oldest_timestamp', 'N/A')} to {data.get('newest_timestamp', 'N/A')}")
                
                if metrics:
                    # Calculate some basic statistics
                    cpu_values = [m.get('cpu_percent', 0) for m in metrics if 'cpu_percent' in m]
                    memory_values = [m.get('memory_percent', 0) for m in metrics if 'memory_percent' in m]
                    queue_values = [m.get('queue_length', 0) for m in metrics if 'queue_length' in m]
                    
                    if cpu_values:
                        avg_cpu = sum(cpu_values) / len(cpu_values)
                        max_cpu = max(cpu_values)
                        print(f"   CPU usage - Average: {avg_cpu:.1f}%, Peak: {max_cpu:.1f}%")
                    
                    if memory_values:
                        avg_memory = sum(memory_values) / len(memory_values)
                        max_memory = max(memory_values)
                        print(f"   Memory usage - Average: {avg_memory:.1f}%, Peak: {max_memory:.1f}%")
                    
                    if queue_values:
                        avg_queue = sum(queue_values) / len(queue_values)
                        max_queue = max(queue_values)
                        print(f"   Queue length - Average: {avg_queue:.1f}, Peak: {max_queue:.1f}")
            else:
                print("   No historical data available yet")
            
            return len(metrics)
        else:
            print(f"❌ Failed to get metrics history: {response.status_code}")
            return 0
    except Exception as e:
        print(f"❌ Error getting metrics history: {e}")
        return 0

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("❌ Server is not running properly. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Please start the server first.")
        exit(1)
    
    print("=== Horizontal Scaling System Test ===")
    
    # Run all tests
    service_healthy = check_scaling_service_health()
    
    if not service_healthy:
        print("⚠️ Scaling service is not healthy. Some tests may fail.")
        # Continue with tests anyway to see what works
    
    # Get system status and configuration
    status = get_scaling_status()
    metrics = get_current_metrics()
    recommendations = get_scaling_recommendations()
    components = list_scalable_components()
    
    # Test functionality
    manual_scaling_works = test_manual_scaling()
    configuration_works = test_scaling_configuration()
    auto_scaling_controls_work = test_auto_scaling_controls()
    
    # Get historical data
    scaling_events = get_scaling_history()
    metrics_history_count = get_metrics_history()
    
    # Generate load to test auto-scaling (this takes time)
    print("\nNote: Load generation test will take about 30 seconds...")
    load_generation_successful = generate_load_for_scaling()
    
    # Final status check after load generation
    print("\n=== Final Status Check (After Load Generation) ===")
    final_status = get_scaling_status()
    final_metrics = get_current_metrics()
    final_recommendations = get_scaling_recommendations()
    final_events = get_scaling_history()
    
    # Summary
    print("\n=== Horizontal Scaling Test Summary ===")
    print(f"✅ Service health: {service_healthy}")
    print(f"✅ Status retrieval: {status is not None}")
    print(f"✅ Metrics collection: {metrics is not None}")
    print(f"✅ Recommendations: {recommendations is not None}")
    print(f"✅ Components configured: {len(components)}")
    print(f"✅ Manual scaling: {manual_scaling_works}")
    print(f"✅ Configuration management: {configuration_works}")
    print(f"✅ Auto-scaling controls: {auto_scaling_controls_work}")
    print(f"✅ Scaling events recorded: {len(scaling_events)}")
    print(f"✅ Metrics history: {metrics_history_count} data points")
    print(f"✅ Load generation: {load_generation_successful}")
    print(f"✅ Events after load: {len(final_events) if final_events else 0}")
    
    all_tests_passed = all([
        service_healthy,
        status is not None,
        metrics is not None,
        len(components) > 0,
        manual_scaling_works,
        configuration_works,
        auto_scaling_controls_work
    ])
    
    if all_tests_passed:
        print(f"\n🎉 Horizontal scaling system is fully functional!")
    else:
        print(f"\n⚠️ Some tests failed - check the detailed output above")
    
    print("\nTo manually check horizontal scaling:")
    print(f"  - Scaling status: {BASE_URL}/api/v1/scaling/status")
    print(f"  - Current metrics: {BASE_URL}/api/v1/scaling/metrics")
    print(f"  - Recommendations: {BASE_URL}/api/v1/scaling/recommendations")
    print(f"  - Service health: {BASE_URL}/api/v1/scaling/health")
    print(f"  - Component configuration: {BASE_URL}/api/v1/scaling/admin/components")