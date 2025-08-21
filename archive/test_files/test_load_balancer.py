#!/usr/bin/env python3
"""
Test Load Balancer Integration
Comprehensive test of load balancing system with actual request routing
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

def check_load_balancer_health():
    """Check if load balancer service is healthy"""
    print("=== Checking Load Balancer Service Health ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/health")
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Load balancer status: {health.get('status', 'unknown')}")
            print(f"   Total backends: {health.get('total_backends', 0)}")
            print(f"   Healthy backends: {health.get('healthy_backends', 0)}")
            print(f"   Healthy ratio: {health.get('healthy_ratio', 0):.2%}")
            print(f"   Total requests: {health.get('total_requests', 0)}")
            print(f"   Success rate: {health.get('success_rate', 0):.2f}%")
            return health.get('status') == 'healthy'
        else:
            print(f"❌ Load balancer health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking load balancer health: {e}")
        return False

def get_load_balancer_info():
    """Get general load balancer information"""
    print("\n=== Load Balancer Information ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/info")
        if response.status_code == 200:
            info = response.json()
            print(f"✅ Service: {info.get('service', 'Unknown')}")
            print(f"   Version: {info.get('version', 'Unknown')}")
            print(f"   Description: {info.get('description', 'No description')}")
            
            strategies = info.get('supported_strategies', [])
            print(f"   Supported strategies ({len(strategies)}): {', '.join(strategies)}")
            
            features = info.get('features', [])
            print(f"   Features ({len(features)}):")
            for feature in features:
                print(f"     - {feature}")
            
            return info
        else:
            print(f"❌ Failed to get load balancer info: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting load balancer info: {e}")
        return None

def list_backends():
    """List all configured backends"""
    print("\n=== Backend Configuration ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/backends")
        if response.status_code == 200:
            backends = response.json()
            print(f"✅ Found {len(backends)} configured backends:")
            
            for backend in backends:
                print(f"   🖥️ {backend.get('id', 'unknown')}")
                print(f"      Endpoint: {backend.get('endpoint', 'unknown')}")
                print(f"      Weight: {backend.get('weight', 1.0)}")
                print(f"      Max connections: {backend.get('max_connections', 100)}")
                print(f"      Health check: {backend.get('health_check_url', '/health')}")
                print(f"      Timeout: {backend.get('timeout_ms', 5000)}ms")
                if backend.get('metadata'):
                    print(f"      Metadata: {backend.get('metadata')}")
                print()
            
            return backends
        else:
            print(f"❌ Failed to list backends: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error listing backends: {e}")
        return []

def get_backend_status():
    """Get status of all backends"""
    print("\n=== Backend Health Status ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/backends/status")
        if response.status_code == 200:
            statuses = response.json()
            print(f"✅ Retrieved status for {len(statuses)} backends:")
            
            for status in statuses:
                backend = status.get('backend', {})
                print(f"   🖥️ {backend.get('id', 'unknown')} ({backend.get('endpoint', 'unknown')})")
                print(f"      Health: {status.get('health', 'unknown')}")
                print(f"      Connections: {status.get('current_connections', 0)}/{backend.get('max_connections', 100)}")
                print(f"      Requests: {status.get('total_requests', 0)} (success: {status.get('success_rate', 0):.1f}%)")
                print(f"      Avg response time: {status.get('avg_response_time_ms', 0):.2f}ms")
                print(f"      Utilization: {status.get('utilization', 0):.1f}%")
                print(f"      Enabled: {status.get('is_enabled', False)}")
                
                last_check = status.get('last_health_check')
                if last_check:
                    print(f"      Last health check: {last_check}")
                
                last_error = status.get('last_error')
                if last_error:
                    print(f"      Last error: {last_error}")
                    print(f"      Consecutive failures: {status.get('consecutive_failures', 0)}")
                
                print()
            
            return statuses
        else:
            print(f"❌ Failed to get backend status: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting backend status: {e}")
        return []

def test_routing_simulation():
    """Test routing simulation with different strategies"""
    print("\n=== Testing Routing Simulation ===")
    
    strategies = [
        "round_robin",
        "weighted_round_robin", 
        "least_connections",
        "random",
        "adaptive"
    ]
    
    results = {}
    
    for strategy in strategies:
        print(f"Testing {strategy} strategy...")
        
        route_data = {
            "client_ip": "192.168.1.100",
            "user_agent": "TestClient/1.0",
            "session_id": f"test_session_{int(time.time())}",
            "request_path": "/api/v1/query",
            "request_method": "POST",
            "strategy": strategy
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/v1/load-balancer/route", json=route_data)
            if response.status_code == 200:
                result = response.json()
                backend = result.get('backend', {})
                print(f"   ✅ Routed to: {backend.get('id', 'unknown')} ({backend.get('endpoint', 'unknown')})")
                print(f"      Strategy used: {result.get('strategy_used', 'unknown')}")
                print(f"      Decision time: {result.get('decision_time_ms', 0):.2f}ms")
                print(f"      Reason: {result.get('reason', 'No reason')}")
                print(f"      Alternatives considered: {result.get('alternatives_considered', 0)}")
                print(f"      Session affinity: {result.get('session_affinity', False)}")
                
                results[strategy] = {
                    'backend_id': backend.get('id'),
                    'success': True,
                    'decision_time': result.get('decision_time_ms', 0)
                }
            else:
                print(f"   ❌ Routing failed: {response.status_code}")
                print(f"      Error: {response.text}")
                results[strategy] = {'success': False, 'error': response.text}
        except Exception as e:
            print(f"   ❌ Error testing {strategy}: {e}")
            results[strategy] = {'success': False, 'error': str(e)}
        
        print()
    
    return results

def get_traffic_distribution():
    """Get traffic distribution statistics"""
    print("\n=== Traffic Distribution Analysis ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/traffic/distribution")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Traffic distribution analysis")
            print(f"   Analysis period: {data.get('analysis_period', 'Unknown')}")
            print(f"   Total requests: {data.get('total_recent_requests', 0)}")
            
            distribution = data.get('distribution', {})
            if distribution:
                print(f"   Request distribution:")
                for backend_id, stats in distribution.items():
                    print(f"     {backend_id}: {stats.get('requests', 0)} requests ({stats.get('percentage', 0):.1f}%)")
            else:
                print("   No traffic distribution data available")
            
            return data
        else:
            print(f"❌ Failed to get traffic distribution: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting traffic distribution: {e}")
        return None

def get_strategy_recommendations():
    """Get load balancing strategy recommendations"""
    print("\n=== Strategy Recommendations ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/strategy/recommendations")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Strategy recommendation")
            print(f"   Recommended strategy: {data.get('recommendation', 'unknown')}")
            print(f"   Reason: {data.get('reason', 'No reason provided')}")
            print(f"   Confidence: {data.get('confidence', 'unknown')}")
            
            sample_size = data.get('analysis_sample_size')
            if sample_size:
                print(f"   Analysis sample size: {sample_size}")
            
            return data
        else:
            print(f"❌ Failed to get strategy recommendations: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting strategy recommendations: {e}")
        return None

def test_actual_requests_with_load_balancing():
    """Test actual API requests to see load balancing in action"""
    print("\n=== Testing Actual Requests with Load Balancing ===")
    
    try:
        print("Generating test requests to observe load balancing...")
        
        def make_test_request(request_id):
            """Make a test API request"""
            try:
                response = requests.get(f"{BASE_URL}/api/v1/status", timeout=10)
                
                # Check for load balancer headers
                lb_backend = response.headers.get('X-Load-Balancer-Backend')
                lb_strategy = response.headers.get('X-Load-Balancer-Strategy') 
                lb_decision_time = response.headers.get('X-Load-Balancer-Decision-Time')
                lb_session_affinity = response.headers.get('X-Load-Balancer-Session-Affinity')
                
                return {
                    'request_id': request_id,
                    'status_code': response.status_code,
                    'backend': lb_backend,
                    'strategy': lb_strategy,
                    'decision_time': lb_decision_time,
                    'session_affinity': lb_session_affinity == 'true',
                    'success': response.status_code == 200
                }
            except Exception as e:
                return {
                    'request_id': request_id,
                    'error': str(e),
                    'success': False
                }
        
        # Generate concurrent requests to test load balancing
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for i in range(10):  # Generate 10 test requests
                future = executor.submit(make_test_request, i)
                futures.append(future)
            
            for future in concurrent.futures.as_completed(futures, timeout=30):
                results.append(future.result())
        
        # Analyze results
        successful_requests = [r for r in results if r.get('success')]
        load_balanced_requests = [r for r in successful_requests if r.get('backend')]
        
        print(f"✅ Request analysis:")
        print(f"   Total requests: {len(results)}")
        print(f"   Successful requests: {len(successful_requests)}")
        print(f"   Load balanced requests: {len(load_balanced_requests)}")
        
        if load_balanced_requests:
            # Analyze backend distribution
            backend_counts = {}
            strategy_counts = {}
            decision_times = []
            
            for request in load_balanced_requests:
                backend = request.get('backend', 'unknown')
                strategy = request.get('strategy', 'unknown')
                decision_time = request.get('decision_time')
                
                backend_counts[backend] = backend_counts.get(backend, 0) + 1
                strategy_counts[strategy] = strategy_counts.get(strategy, 0) + 1
                
                if decision_time:
                    try:
                        decision_times.append(float(decision_time.replace('ms', '')))
                    except:
                        pass
            
            print(f"   Backend distribution:")
            for backend, count in backend_counts.items():
                percentage = (count / len(load_balanced_requests)) * 100
                print(f"     {backend}: {count} requests ({percentage:.1f}%)")
            
            print(f"   Strategy usage:")
            for strategy, count in strategy_counts.items():
                percentage = (count / len(load_balanced_requests)) * 100
                print(f"     {strategy}: {count} requests ({percentage:.1f}%)")
            
            if decision_times:
                avg_decision_time = sum(decision_times) / len(decision_times)
                max_decision_time = max(decision_times)
                print(f"   Decision time: avg={avg_decision_time:.2f}ms, max={max_decision_time:.2f}ms")
        else:
            print("   No load balancer headers found - load balancing may not be active")
        
        return results
        
    except Exception as e:
        print(f"❌ Error testing actual requests: {e}")
        return []

def get_load_balancer_statistics():
    """Get overall load balancer statistics"""
    print("\n=== Load Balancer Statistics ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/load-balancer/status")
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Load balancer statistics:")
            print(f"   Total backends: {stats.get('total_backends', 0)}")
            print(f"   Healthy backends: {stats.get('healthy_backends', 0)}")
            print(f"   Unhealthy backends: {stats.get('unhealthy_backends', 0)}")
            print(f"   Total requests: {stats.get('total_requests', 0)}")
            print(f"   Successful requests: {stats.get('successful_requests', 0)}")
            print(f"   Failed requests: {stats.get('failed_requests', 0)}")
            print(f"   Success rate: {stats.get('success_rate', 0):.2f}%")
            print(f"   Default strategy: {stats.get('default_strategy', 'unknown')}")
            print(f"   Recent requests: {stats.get('recent_requests', 0)}")
            
            return stats
        else:
            print(f"❌ Failed to get statistics: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting statistics: {e}")
        return None

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
    
    print("=== Load Balancer Integration Test ===")
    
    # Run comprehensive load balancer tests
    service_healthy = check_load_balancer_health()
    info = get_load_balancer_info()
    backends = list_backends()
    backend_statuses = get_backend_status()
    routing_results = test_routing_simulation()
    traffic_dist = get_traffic_distribution()
    recommendations = get_strategy_recommendations()
    request_results = test_actual_requests_with_load_balancing()
    final_stats = get_load_balancer_statistics()
    
    # Summary
    print("\n=== Load Balancer Test Summary ===")
    print(f"✅ Service health: {service_healthy}")
    print(f"✅ Service info available: {info is not None}")
    print(f"✅ Backends configured: {len(backends)}")
    print(f"✅ Backend status available: {len(backend_statuses)}")
    print(f"✅ Routing strategies tested: {len([r for r in routing_results.values() if r.get('success')])}/{len(routing_results)}")
    print(f"✅ Traffic distribution available: {traffic_dist is not None}")
    print(f"✅ Strategy recommendations available: {recommendations is not None}")
    print(f"✅ Actual requests tested: {len(request_results)}")
    print(f"✅ Load balanced requests: {len([r for r in request_results if r.get('backend')])}")
    print(f"✅ Final statistics available: {final_stats is not None}")
    
    # Check if load balancing is working
    load_balanced_requests = [r for r in request_results if r.get('backend')]
    if load_balanced_requests:
        print(f"\n🎉 Load balancing is ACTIVE and working!")
        print(f"   {len(load_balanced_requests)}/{len(request_results)} requests were load balanced")
        
        # Show backend distribution
        backend_counts = {}
        for request in load_balanced_requests:
            backend = request.get('backend', 'unknown')
            backend_counts[backend] = backend_counts.get(backend, 0) + 1
        
        print(f"   Backend usage: {dict(backend_counts)}")
    else:
        if len(backends) == 0:
            print(f"\n⚠️ Load balancing not active - no backends configured")
            print("   To configure backends, use the admin API endpoints or environment variables")
        else:
            print(f"\n⚠️ Load balancing configured but not routing requests")
            print("   Check load balancer middleware configuration")
    
    print("\nTo manually check load balancer endpoints:")
    print(f"  - Load balancer health: {BASE_URL}/api/v1/load-balancer/health")
    print(f"  - Backend status: {BASE_URL}/api/v1/load-balancer/backends/status")
    print(f"  - Traffic distribution: {BASE_URL}/api/v1/load-balancer/traffic/distribution")
    print(f"  - Strategy recommendations: {BASE_URL}/api/v1/load-balancer/strategy/recommendations")