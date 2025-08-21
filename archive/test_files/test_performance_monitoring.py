#!/usr/bin/env python3
"""
Test Performance Monitoring System
Comprehensive test of performance monitoring, alerting, and optimization features
"""
import os
import requests
import json
import time
import tempfile
from pathlib import Path
import asyncio
import concurrent.futures
from typing import List, Dict

# API endpoint
BASE_URL = "http://localhost:8000"

def check_performance_monitoring_health():
    """Check if performance monitoring system is healthy"""
    print("=== Checking Performance Monitoring Health ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/health")
        if response.status_code == 200:
            health = response.json()["data"]
            print(f"✅ Performance monitoring status: {health.get('status', 'unknown')}")
            print(f"   Monitoring enabled: {health.get('monitoring_enabled', False)}")
            print(f"   Thread alive: {health.get('monitoring_thread_alive', False)}")
            print(f"   Total samples: {health.get('total_samples', 0)}")
            print(f"   Total metrics: {health.get('total_metrics', 0)}")
            print(f"   Active alerts: {health.get('active_alerts', 0)}")
            return health.get('monitoring_enabled', False)
        else:
            print(f"❌ Performance monitoring health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking performance monitoring health: {e}")
        return False

def get_performance_config():
    """Get and display performance monitoring configuration"""
    print("\n=== Performance Monitoring Configuration ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/config")
        if response.status_code == 200:
            config = response.json()["data"]
            print(f"✅ Configuration retrieved")
            print(f"   Monitoring enabled: {config.get('monitoring_enabled', False)}")
            print(f"   Monitoring interval: {config.get('monitoring_interval_seconds', 0)}s")
            print(f"   Auto-optimization: {config.get('auto_optimization_enabled', False)}")
            print(f"   Max samples: {config.get('max_samples', 0)}")
            print(f"   Active thresholds: {config.get('active_thresholds', 0)}")
            print(f"   Alert handlers: {config.get('alert_handlers', 0)}")
            return config
        else:
            print(f"❌ Failed to get configuration: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting configuration: {e}")
        return None

def list_performance_thresholds():
    """List all configured performance thresholds"""
    print("\n=== Performance Thresholds ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/thresholds")
        if response.status_code == 200:
            data = response.json()["data"]
            thresholds = data["thresholds"]
            print(f"✅ Found {len(thresholds)} configured thresholds")
            
            for threshold in thresholds[:10]:  # Show first 10
                print(f"   📊 {threshold['metric_name']}")
                print(f"      Warning: {threshold['warning_threshold']}")
                print(f"      Critical: {threshold['critical_threshold']}")
                print(f"      Method: {threshold['evaluation_method']}")
                print(f"      Window: {threshold['duration_window']}s")
                print()
            
            if len(thresholds) > 10:
                print(f"   ... and {len(thresholds) - 10} more")
            
            return thresholds
        else:
            print(f"❌ Failed to get thresholds: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting thresholds: {e}")
        return []

def test_custom_threshold():
    """Test creating a custom performance threshold"""
    print("\n=== Testing Custom Threshold Creation ===")
    
    try:
        # Create a test threshold
        threshold_data = {
            "metric_name": "test_response_time",
            "warning_threshold": 2.0,
            "critical_threshold": 5.0,
            "duration_window": 60,
            "evaluation_method": "average"
        }
        
        response = requests.post(f"{BASE_URL}/performance/thresholds", json=threshold_data)
        if response.status_code == 200:
            result = response.json()
            print("✅ Custom threshold created successfully")
            print(f"   Metric: {result['data']['metric_name']}")
            print(f"   Warning: {result['data']['warning_threshold']}")
            print(f"   Critical: {result['data']['critical_threshold']}")
            return True
        else:
            print(f"❌ Failed to create threshold: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating threshold: {e}")
        return False

def generate_performance_load():
    """Generate load to create performance data"""
    print("\n=== Generating Performance Load ===")
    
    # Create test document
    test_content = "Performance monitoring test document with various metrics and data points for analysis."
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write(test_content)
        tmp_file_path = tmp_file.name
    
    operations_completed = []
    
    try:
        # 1. Upload multiple documents
        print("1. Uploading test documents...")
        for i in range(3):
            with open(tmp_file_path, 'rb') as f:
                files = {'file': (f'perf_test_doc_{i}.txt', f, 'text/plain')}
                response = requests.post(f"{BASE_URL}/api/v1/documents", files=files)
            
            if response.status_code == 200:
                operations_completed.append(f"Document {i+1} uploaded")
            else:
                operations_completed.append(f"Document {i+1} upload failed: {response.status_code}")
            
            time.sleep(0.5)  # Small delay between uploads
        
        # 2. Execute multiple queries
        print("2. Executing performance test queries...")
        test_queries = [
            "performance monitoring test",
            "document analysis metrics",
            "system performance evaluation",
            "response time measurement",
            "throughput analysis"
        ]
        
        for i, query in enumerate(test_queries):
            query_data = {"query": query}
            response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data)
            
            if response.status_code == 200:
                operations_completed.append(f"Query {i+1} executed successfully")
            else:
                operations_completed.append(f"Query {i+1} failed: {response.status_code}")
            
            time.sleep(1.0)  # Delay between queries to create realistic load
        
        # 3. Generate some load with concurrent requests
        print("3. Running concurrent load test...")
        def make_query(query_text):
            try:
                response = requests.post(f"{BASE_URL}/api/v1/query", 
                                       json={"query": query_text},
                                       timeout=30)
                return response.status_code == 200
            except:
                return False
        
        # Run 5 concurrent queries
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for i in range(5):
                future = executor.submit(make_query, f"concurrent test query {i}")
                futures.append(future)
            
            concurrent_results = []
            for future in concurrent.futures.as_completed(futures, timeout=60):
                concurrent_results.append(future.result())
        
        successful_concurrent = sum(concurrent_results)
        operations_completed.append(f"Concurrent queries: {successful_concurrent}/5 successful")
        
        print(f"✅ Load generation completed")
        print("   Operations summary:")
        for op in operations_completed:
            print(f"     {op}")
        
        return True
        
    finally:
        os.unlink(tmp_file_path)

def check_performance_metrics():
    """Check available performance metrics and their data"""
    print("\n=== Checking Performance Metrics ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/metrics")
        if response.status_code == 200:
            data = response.json()["data"]
            metrics = data["metrics"]
            print(f"✅ Found {len(metrics)} performance metrics")
            
            # Show metrics with recent data
            metrics_with_data = [(name, info) for name, info in metrics.items() 
                               if info.get("sample_count", 0) > 0]
            
            print(f"   Metrics with data: {len(metrics_with_data)}")
            
            for name, info in sorted(metrics_with_data, key=lambda x: x[1].get("sample_count", 0), reverse=True)[:10]:
                print(f"   📈 {name}")
                print(f"      Samples: {info.get('sample_count', 0)}")
                print(f"      Latest value: {info.get('latest_value', 'N/A')}")
                if info.get('statistics'):
                    stats = info['statistics']
                    print(f"      Average: {stats.get('average', 0):.3f}")
                    print(f"      Min/Max: {stats.get('min', 0):.3f} / {stats.get('max', 0):.3f}")
                print()
            
            return len(metrics_with_data)
        else:
            print(f"❌ Failed to get metrics: {response.status_code}")
            return 0
    except Exception as e:
        print(f"❌ Error getting metrics: {e}")
        return 0

def get_performance_summary():
    """Get comprehensive performance summary"""
    print("\n=== Performance Summary ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/summary?hours=1")
        if response.status_code == 200:
            data = response.json()["data"]
            print(f"✅ Performance summary for last {data.get('monitoring_period_hours', 1)} hour(s)")
            
            metrics = data.get("metrics", {})
            alerts = data.get("alerts", {})
            recommendations = data.get("recommendations", [])
            
            print(f"   Total metrics tracked: {len(metrics)}")
            print(f"   Active alerts: {alerts.get('active', 0)}")
            print(f"   Critical alerts: {alerts.get('critical', 0)}")
            print(f"   Warning alerts: {alerts.get('warning', 0)}")
            
            if metrics:
                print("\n   📊 Top metrics by activity:")
                sorted_metrics = sorted(metrics.items(), 
                                      key=lambda x: x[1].get('count', 0), 
                                      reverse=True)[:5]
                
                for metric_name, stats in sorted_metrics:
                    print(f"     {metric_name}: {stats.get('count', 0)} samples, avg={stats.get('average', 0):.3f}")
            
            if alerts.get('details'):
                print("\n   🚨 Active alerts:")
                for alert in alerts['details'][:3]:  # Show first 3 alerts
                    severity = alert.severity.upper() if hasattr(alert, 'severity') else 'UNKNOWN'
                    print(f"     [{severity}] {getattr(alert, 'description', 'Unknown alert')}")
            
            if recommendations:
                print(f"\n   💡 Recommendations: {len(recommendations)}")
                for rec in recommendations[:3]:
                    print(f"     - {rec}")
            
            return True
        else:
            print(f"❌ Failed to get performance summary: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting performance summary: {e}")
        return False

def test_metric_report():
    """Test getting detailed metric report"""
    print("\n=== Testing Metric Report ===")
    
    try:
        # Try to get a report for a common metric
        test_metrics = [
            "http_request_duration_seconds",
            "query_duration_seconds", 
            "system_cpu_usage_percent",
            "rag_query_processing_duration_seconds"
        ]
        
        for metric_name in test_metrics:
            response = requests.get(f"{BASE_URL}/performance/metrics/{metric_name}/report?hours=1")
            if response.status_code == 200:
                data = response.json()["data"]
                time_series = data.get("time_series", [])
                stats = data.get("statistics", {})
                
                print(f"✅ Report for {metric_name}")
                print(f"   Data points: {len(time_series)}")
                if stats:
                    print(f"   Average: {stats.get('average', 0):.3f}")
                    print(f"   Min/Max: {stats.get('min', 0):.3f} / {stats.get('max', 0):.3f}")
                    print(f"   95th percentile: {stats.get('percentile_95', 0):.3f}")
                
                if data.get('active_alerts'):
                    print(f"   Active alerts: {len(data['active_alerts'])}")
                
                return True
            elif response.status_code == 404:
                print(f"   No data for {metric_name}")
                continue
            else:
                print(f"❌ Failed to get report for {metric_name}: {response.status_code}")
        
        return False
    except Exception as e:
        print(f"❌ Error getting metric report: {e}")
        return False

def check_active_alerts():
    """Check for active performance alerts"""
    print("\n=== Checking Active Alerts ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/alerts")
        if response.status_code == 200:
            data = response.json()["data"]
            alerts = data.get("alerts", [])
            
            print(f"✅ Found {len(alerts)} active alerts")
            print(f"   Critical: {data.get('critical_alerts', 0)}")
            print(f"   Warning: {data.get('warning_alerts', 0)}")
            
            if alerts:
                print("\n   Alert details:")
                for alert in alerts[:5]:  # Show first 5 alerts
                    print(f"     [{alert['severity'].upper()}] {alert['metric_name']}")
                    print(f"       {alert['description']}")
                    print(f"       Current: {alert['current_value']:.3f}, Threshold: {alert['threshold_value']:.3f}")
                    if alert.get('recommendations'):
                        print(f"       Recommendations: {len(alert['recommendations'])}")
                    print()
            else:
                print("   No active alerts (system is performing well)")
            
            return len(alerts)
        else:
            print(f"❌ Failed to get alerts: {response.status_code}")
            return -1
    except Exception as e:
        print(f"❌ Error getting alerts: {e}")
        return -1

def test_performance_optimization():
    """Test performance optimization feature"""
    print("\n=== Testing Performance Optimization ===")
    
    try:
        response = requests.post(f"{BASE_URL}/performance/optimize")
        if response.status_code == 200:
            result = response.json()
            optimizations = result.get("optimizations_applied", [])
            
            print(f"✅ Optimization completed")
            print(f"   Status: {result.get('status', 'unknown')}")
            print(f"   Message: {result.get('message', 'No message')}")
            print(f"   Optimizations applied: {len(optimizations)}")
            
            for opt in optimizations:
                print(f"     - {opt}")
            
            return len(optimizations) > 0
        else:
            print(f"⚠️ Optimization returned: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"   Message: {result.get('message', 'No details')}")
            return False
    except Exception as e:
        print(f"❌ Error running optimization: {e}")
        return False

def export_performance_data():
    """Test performance data export"""
    print("\n=== Testing Performance Data Export ===")
    
    try:
        response = requests.get(f"{BASE_URL}/performance/export?format=json")
        if response.status_code == 200:
            result = response.json()
            export_data = result.get("data")
            
            if export_data:
                print("✅ Performance data exported successfully")
                print(f"   Format: {result.get('format', 'unknown')}")
                print(f"   Data size: {len(str(export_data))} characters")
                
                # Try to parse the exported data
                if isinstance(export_data, str):
                    try:
                        parsed_data = json.loads(export_data)
                        print(f"   Parsed data keys: {list(parsed_data.keys()) if isinstance(parsed_data, dict) else 'Not a dict'}")
                    except:
                        print("   Data is string format")
                else:
                    print(f"   Data type: {type(export_data)}")
                
                return True
            else:
                print("⚠️ No data in export")
                return False
        else:
            print(f"❌ Export failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error exporting data: {e}")
        return False

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
    
    print("=== Performance Monitoring System Test ===")
    
    # Run all tests
    monitoring_enabled = check_performance_monitoring_health()
    
    if not monitoring_enabled:
        print("⚠️ Performance monitoring is not enabled. Limited testing possible.")
        exit(1)
    
    # Get and display configuration
    config = get_performance_config()
    
    # List existing thresholds
    thresholds = list_performance_thresholds()
    
    # Test custom threshold creation
    custom_threshold_created = test_custom_threshold()
    
    # Generate load for testing
    print("\nGenerating performance data (this may take a moment)...")
    load_generated = generate_performance_load()
    
    # Wait for metrics to be collected
    print("Waiting for metrics collection...")
    time.sleep(10)
    
    # Check metrics
    metrics_count = check_performance_metrics()
    
    # Get performance summary
    summary_available = get_performance_summary()
    
    # Test metric report
    report_available = test_metric_report()
    
    # Check for alerts
    alerts_count = check_active_alerts()
    
    # Test optimization
    optimization_tested = test_performance_optimization()
    
    # Test data export
    export_successful = export_performance_data()
    
    print("\n=== Performance Monitoring Test Summary ===")
    print(f"✅ Monitoring enabled: {monitoring_enabled}")
    print(f"✅ Configuration accessible: {config is not None}")
    print(f"✅ Default thresholds: {len(thresholds)}")
    print(f"✅ Custom threshold created: {custom_threshold_created}")
    print(f"✅ Load generation: {load_generated}")
    print(f"✅ Metrics with data: {metrics_count}")
    print(f"✅ Performance summary: {summary_available}")
    print(f"✅ Metric reports: {report_available}")
    print(f"✅ Active alerts: {alerts_count}")
    print(f"✅ Optimization tested: {optimization_tested}")
    print(f"✅ Data export: {export_successful}")
    
    print(f"\nPerformance monitoring system is {'fully functional' if all([monitoring_enabled, config, load_generated, metrics_count > 0]) else 'partially functional'}!")
    
    print("\nTo manually check performance monitoring:")
    print(f"  - Performance summary: {BASE_URL}/performance/summary")
    print(f"  - Active alerts: {BASE_URL}/performance/alerts") 
    print(f"  - Available metrics: {BASE_URL}/performance/metrics")
    print(f"  - Configuration: {BASE_URL}/performance/config")