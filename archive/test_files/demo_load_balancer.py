#!/usr/bin/env python3
"""
Demo script for Load Balancing Service
Shows intelligent load balancing and traffic distribution
"""

import asyncio
import sys
import random
import time
from pathlib import Path
from datetime import datetime, timezone

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.services.load_balancer_service import (
    LoadBalancerService, Backend, LoadBalancingStrategy, RequestContext
)


async def simulate_request_load(lb_service: LoadBalancerService, 
                               num_requests: int = 100,
                               concurrent_requests: int = 10):
    """Simulate realistic request load with varying patterns"""
    print(f"\nSimulating {num_requests} requests with {concurrent_requests} concurrent...")
    
    # Client IP pool for simulation
    client_ips = [
        "192.168.1.10", "192.168.1.11", "192.168.1.12", "192.168.1.13",
        "10.0.0.5", "10.0.0.6", "10.0.0.7", "172.16.0.100", "172.16.0.101"
    ]
    
    # User agents for simulation
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
    ]
    
    # Request paths for simulation
    request_paths = [
        "/api/v1/query", "/api/v1/documents", "/api/v1/health",
        "/api/v1/status", "/api/v1/metrics"
    ]
    
    async def simulate_single_request(request_id: int):
        """Simulate a single request"""
        try:
            # Create request context with realistic data
            context = RequestContext(
                client_ip=random.choice(client_ips),
                user_agent=random.choice(user_agents),
                session_id=f"session_{request_id % 20}",  # 20 sessions
                tenant_id=random.randint(1, 3),
                request_path=random.choice(request_paths),
                request_method=random.choice(["GET", "POST", "PUT"])
            )
            
            # Route request
            decision = await lb_service.route_request(context)
            
            if decision:
                # Simulate request processing time
                processing_time = random.uniform(50, 500)  # 50-500ms
                await asyncio.sleep(processing_time / 1000)
                
                # Simulate success/failure (95% success rate)
                success = random.random() < 0.95
                
                # Complete request
                lb_service.complete_request(
                    decision.backend.id, 
                    success, 
                    processing_time
                )
                
                return {
                    'success': True,
                    'backend_id': decision.backend.id,
                    'processing_time': processing_time,
                    'request_success': success,
                    'strategy': decision.strategy_used.value
                }
            else:
                return {'success': False, 'error': 'No backend available'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    # Run requests in batches
    results = []
    
    for batch_start in range(0, num_requests, concurrent_requests):
        batch_end = min(batch_start + concurrent_requests, num_requests)
        batch_size = batch_end - batch_start
        
        print(f"  Processing batch {batch_start//concurrent_requests + 1}: "
              f"requests {batch_start + 1}-{batch_end}")
        
        # Create batch of concurrent requests
        batch_tasks = [
            simulate_single_request(request_id)
            for request_id in range(batch_start, batch_end)
        ]
        
        # Execute batch
        batch_results = await asyncio.gather(*batch_tasks)
        results.extend(batch_results)
        
        # Brief pause between batches
        await asyncio.sleep(0.1)
    
    # Analyze results
    successful_routes = sum(1 for r in results if r['success'])
    successful_requests = sum(1 for r in results if r['success'] and r.get('request_success', False))
    
    backend_distribution = {}
    strategy_usage = {}
    
    for result in results:
        if result['success']:
            backend_id = result['backend_id']
            strategy = result['strategy']
            
            backend_distribution[backend_id] = backend_distribution.get(backend_id, 0) + 1
            strategy_usage[strategy] = strategy_usage.get(strategy, 0) + 1
    
    print(f"\nLoad simulation results:")
    print(f"  Total requests: {num_requests}")
    print(f"  Successful routes: {successful_routes} ({successful_routes/num_requests*100:.1f}%)")
    print(f"  Successful requests: {successful_requests} ({successful_requests/num_requests*100:.1f}%)")
    
    print(f"\nBackend distribution:")
    for backend_id, count in backend_distribution.items():
        percentage = (count / successful_routes * 100) if successful_routes > 0 else 0
        print(f"    {backend_id}: {count} requests ({percentage:.1f}%)")
    
    print(f"\nStrategy usage:")
    for strategy, count in strategy_usage.items():
        percentage = (count / successful_routes * 100) if successful_routes > 0 else 0
        print(f"    {strategy}: {count} requests ({percentage:.1f}%)")
    
    return results


async def demo_load_balancing():
    """Demonstrate load balancing functionality"""
    print("Load Balancing Service Demo")
    print("=" * 50)
    
    # Initialize load balancer service
    print("\n1. Initializing Load Balancer Service...")
    lb_service = LoadBalancerService(LoadBalancingStrategy.ROUND_ROBIN)
    
    await lb_service.start()
    print("Load balancer service started")
    
    try:
        # Add backend servers
        print("\n2. Adding Backend Servers...")
        
        backends = [
            Backend(
                id="api-server-1",
                host="192.168.1.100",
                port=8000,
                weight=2.0,  # Higher weight
                max_connections=150,
                health_check_url="/health",
                timeout_ms=3000,
                metadata={"region": "us-east-1", "instance_type": "c5.large"}
            ),
            Backend(
                id="api-server-2", 
                host="192.168.1.101",
                port=8000,
                weight=1.5,
                max_connections=120,
                health_check_url="/health",
                timeout_ms=3000,
                metadata={"region": "us-east-1", "instance_type": "c5.medium"}
            ),
            Backend(
                id="api-server-3",
                host="192.168.1.102", 
                port=8000,
                weight=1.0,
                max_connections=100,
                health_check_url="/health",
                timeout_ms=3000,
                metadata={"region": "us-west-2", "instance_type": "c5.medium"}
            ),
            Backend(
                id="api-server-4",
                host="192.168.1.103",
                port=8000,
                weight=3.0,  # Highest weight
                max_connections=200,
                health_check_url="/health", 
                timeout_ms=2000,
                metadata={"region": "us-west-2", "instance_type": "c5.xlarge"}
            )
        ]
        
        for backend in backends:
            lb_service.add_backend(backend)
            print(f"  Added: {backend.id} ({backend.endpoint}) - weight: {backend.weight}")
        
        print(f"Total backends configured: {len(backends)}")
        
        # Wait for initial health checks
        print("\n3. Waiting for initial health checks...")
        await asyncio.sleep(3)
        
        # Show backend status
        print("\n4. Backend Health Status...")
        backend_statuses = lb_service.list_backend_status()
        
        for status in backend_statuses:
            health_icon = {
                "healthy": "[HEALTHY]",
                "degraded": "[DEGRADED]", 
                "unhealthy": "[UNHEALTHY]",
                "unknown": "[UNKNOWN]"
            }.get(status.health.value, "[?]")
            
            print(f"  {health_icon} {status.backend.id}")
            print(f"    Health: {status.health.value}")
            print(f"    Connections: {status.current_connections}/{status.backend.max_connections}")
            print(f"    Avg Response Time: {status.avg_response_time_ms:.2f}ms")
            print(f"    Success Rate: {status.success_rate:.1f}%")
            print(f"    Weight: {status.backend.weight}")
            print()
        
        # Demo different load balancing strategies
        print("\n5. Load Balancing Strategies Demo...")
        
        strategies_to_test = [
            LoadBalancingStrategy.ROUND_ROBIN,
            LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN,
            LoadBalancingStrategy.LEAST_CONNECTIONS,
            LoadBalancingStrategy.RANDOM,
            LoadBalancingStrategy.RESPONSE_TIME,
            LoadBalancingStrategy.ADAPTIVE
        ]
        
        for strategy in strategies_to_test:
            print(f"\nTesting {strategy.value} strategy:")
            
            # Set strategy
            lb_service.set_default_strategy(strategy)
            
            # Make several routing decisions to show pattern
            decisions = []
            for i in range(10):
                context = RequestContext(
                    client_ip=f"192.168.1.{10 + i}",
                    session_id=f"test_session_{i}",
                    tenant_id=1
                )
                
                decision = await lb_service.route_request(context)
                if decision:
                    decisions.append(decision.backend.id)
                    # Simulate request completion
                    lb_service.complete_request(decision.backend.id, True, random.uniform(100, 300))
            
            # Show distribution
            backend_counts = {}
            for backend_id in decisions:
                backend_counts[backend_id] = backend_counts.get(backend_id, 0) + 1
            
            print(f"  Request distribution (10 requests):")
            for backend_id, count in backend_counts.items():
                print(f"    {backend_id}: {count} requests")
        
        # Demo session affinity
        print("\n6. Session Affinity Demo...")
        lb_service.set_default_strategy(LoadBalancingStrategy.ROUND_ROBIN)
        
        session_requests = []
        session_id = "persistent_session_123"
        
        print(f"Making 5 requests with session ID: {session_id}")
        
        for i in range(5):
            context = RequestContext(
                client_ip="192.168.1.50",
                session_id=session_id,
                tenant_id=1,
                request_path=f"/api/request_{i}"
            )
            
            decision = await lb_service.route_request(context)
            if decision:
                session_requests.append({
                    'request': i + 1,
                    'backend': decision.backend.id,
                    'session_affinity': decision.session_affinity
                })
                lb_service.complete_request(decision.backend.id, True, random.uniform(150, 250))
        
        print("Session affinity results:")
        for req in session_requests:
            affinity_note = " (session affinity)" if req['session_affinity'] else ""
            print(f"  Request {req['request']}: {req['backend']}{affinity_note}")
        
        # Demo load simulation
        print("\n7. Load Simulation Test...")
        lb_service.set_default_strategy(LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN)
        
        # Run load simulation
        await simulate_request_load(lb_service, num_requests=50, concurrent_requests=5)
        
        # Show updated backend status after load
        print("\n8. Backend Status After Load Test...")
        updated_statuses = lb_service.list_backend_status()
        
        for status in updated_statuses:
            print(f"Backend: {status.backend.id}")
            print(f"  Total requests: {status.total_requests}")
            print(f"  Success rate: {status.success_rate:.1f}%")
            print(f"  Avg response time: {status.avg_response_time_ms:.2f}ms")
            print(f"  Current connections: {status.current_connections}")
            print(f"  Utilization: {status.utilization:.1f}%")
            print()
        
        # Demo traffic distribution analysis
        print("\n9. Traffic Distribution Analysis...")
        
        distribution = lb_service.get_traffic_distribution()
        print(f"Analysis period: {distribution['analysis_period']}")
        print(f"Total requests analyzed: {distribution['total_recent_requests']}")
        
        print("Traffic distribution:")
        for backend_id, stats in distribution['distribution'].items():
            print(f"  {backend_id}: {stats['requests']} requests ({stats['percentage']:.1f}%)")
        
        # Demo strategy recommendations
        print("\n10. Strategy Recommendations...")
        
        recommendations = lb_service.get_strategy_recommendations()
        print(f"Recommended strategy: {recommendations['recommendation']}")
        print(f"Reason: {recommendations['reason']}")
        print(f"Confidence: {recommendations['confidence']}")
        if 'analysis_sample_size' in recommendations:
            print(f"Sample size: {recommendations['analysis_sample_size']}")
        
        # Demo backend management
        print("\n11. Backend Management Demo...")
        
        print("Disabling api-server-2 temporarily...")
        lb_service.disable_backend("api-server-2")
        
        # Make some requests to show traffic shifts
        print("Making requests with one backend disabled:")
        disabled_test_results = []
        for i in range(5):
            context = RequestContext(client_ip=f"192.168.1.{60 + i}", tenant_id=1)
            decision = await lb_service.route_request(context)
            if decision:
                disabled_test_results.append(decision.backend.id)
                lb_service.complete_request(decision.backend.id, True, random.uniform(100, 200))
        
        backend_counts = {}
        for backend_id in disabled_test_results:
            backend_counts[backend_id] = backend_counts.get(backend_id, 0) + 1
        
        print("Request distribution with api-server-2 disabled:")
        for backend_id, count in backend_counts.items():
            print(f"  {backend_id}: {count} requests")
        
        print("Re-enabling api-server-2...")
        lb_service.enable_backend("api-server-2")
        
        # Demo health monitoring impact
        print("\n12. Health Monitoring Demo...")
        
        # Show health check results
        print("Current health status:")
        for status in lb_service.list_backend_status():
            print(f"  {status.backend.id}: {status.health.value}")
            if status.last_health_check:
                print(f"    Last check: {status.last_health_check}")
            if status.consecutive_failures > 0:
                print(f"    Consecutive failures: {status.consecutive_failures}")
            if status.last_error:
                print(f"    Last error: {status.last_error}")
        
        # Demo IP hash consistency
        print("\n13. IP Hash Consistency Demo...")
        lb_service.set_default_strategy(LoadBalancingStrategy.IP_HASH)
        
        test_ips = ["192.168.1.200", "10.0.0.100", "172.16.0.50"]
        
        print("Testing IP hash consistency (same IP should go to same backend):")
        for test_ip in test_ips:
            backends_for_ip = []
            
            # Make multiple requests from same IP
            for i in range(3):
                context = RequestContext(client_ip=test_ip, tenant_id=1)
                decision = await lb_service.route_request(context)
                if decision:
                    backends_for_ip.append(decision.backend.id)
                    lb_service.complete_request(decision.backend.id, True, random.uniform(100, 200))
            
            unique_backends = set(backends_for_ip)
            consistent = len(unique_backends) == 1
            
            print(f"  IP {test_ip}: {backends_for_ip} -> {'Consistent' if consistent else 'Inconsistent'}")
        
        # Demo adaptive strategy learning
        print("\n14. Adaptive Strategy Demo...")
        lb_service.set_default_strategy(LoadBalancingStrategy.ADAPTIVE)
        
        print("Running adaptive strategy (learns from performance)...")
        
        # Generate some traffic for learning
        adaptive_results = []
        for i in range(20):
            context = RequestContext(
                client_ip=f"192.168.1.{150 + (i % 10)}",
                tenant_id=random.randint(1, 2)
            )
            
            decision = await lb_service.route_request(context)
            if decision:
                # Simulate varying performance
                response_time = random.uniform(80, 400)
                success = random.random() < 0.96  # 96% success rate
                
                adaptive_results.append({
                    'backend': decision.backend.id,
                    'response_time': response_time,
                    'success': success
                })
                
                lb_service.complete_request(decision.backend.id, success, response_time)
        
        # Show adaptive learning results
        backend_performance = {}
        for result in adaptive_results:
            backend_id = result['backend']
            if backend_id not in backend_performance:
                backend_performance[backend_id] = {'times': [], 'successes': 0, 'total': 0}
            
            backend_performance[backend_id]['times'].append(result['response_time'])
            backend_performance[backend_id]['total'] += 1
            if result['success']:
                backend_performance[backend_id]['successes'] += 1
        
        print("Adaptive strategy learning results:")
        for backend_id, perf in backend_performance.items():
            avg_time = sum(perf['times']) / len(perf['times'])
            success_rate = (perf['successes'] / perf['total']) * 100
            print(f"  {backend_id}: {perf['total']} requests, "
                  f"avg {avg_time:.1f}ms, {success_rate:.1f}% success")
        
        # Final statistics
        print("\n15. Final Statistics...")
        
        final_stats = lb_service.get_load_balancer_stats()
        print("Load balancer statistics:")
        print(f"  Total backends: {final_stats['total_backends']}")
        print(f"  Healthy backends: {final_stats['healthy_backends']}")
        print(f"  Total requests processed: {final_stats['total_requests']}")
        print(f"  Overall success rate: {final_stats['success_rate']:.1f}%")
        print(f"  Current default strategy: {final_stats['default_strategy']}")
        
        # Show final backend utilization
        print("\nFinal backend utilization:")
        for status in lb_service.list_backend_status():
            print(f"  {status.backend.id}:")
            print(f"    Requests: {status.total_requests}")
            print(f"    Success rate: {status.success_rate:.1f}%")
            print(f"    Avg response time: {status.avg_response_time_ms:.2f}ms")
            print(f"    Utilization: {status.utilization:.1f}%")
    
    except Exception as e:
        print(f"Demo error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Stop the service
        print("\n16. Shutting down...")
        await lb_service.stop()
        print("Load balancer service stopped")
    
    print("\nLoad Balancing Demo Complete!")
    print("Features demonstrated:")
    print("  [OK] Multiple load balancing algorithms")
    print("  [OK] Backend health monitoring and failover")
    print("  [OK] Weighted backend configuration")
    print("  [OK] Session affinity support")
    print("  [OK] Real-time traffic distribution")
    print("  [OK] Strategy performance analysis") 
    print("  [OK] Backend management (enable/disable)")
    print("  [OK] IP hash consistency")
    print("  [OK] Adaptive strategy learning")
    print("  [OK] Load simulation and testing")
    print("  [OK] Comprehensive statistics and monitoring")


if __name__ == "__main__":
    try:
        asyncio.run(demo_load_balancing())
    except KeyboardInterrupt:
        print("\nDemo interrupted by user")
    except Exception as e:
        print(f"\nDemo failed: {e}")
        import traceback
        traceback.print_exc()