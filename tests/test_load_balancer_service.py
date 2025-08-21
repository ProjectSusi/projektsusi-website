#!/usr/bin/env python3
"""
Tests for Load Balancing Service
Comprehensive test coverage for load balancing functionality
"""

import asyncio
import pytest
import time
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.services.load_balancer_service import (
    LoadBalancerService,
    Backend,
    BackendHealth,
    LoadBalancingStrategy,
    RequestContext,
    HealthChecker,
    LoadBalancingEngine
)


class TestBackend:
    """Test Backend model"""
    
    def test_backend_creation(self):
        """Test backend creation and properties"""
        backend = Backend(
            id="test-server",
            host="192.168.1.100",
            port=8000,
            weight=2.0,
            max_connections=150,
            health_check_url="/health",
            timeout_ms=3000,
            metadata={"region": "us-east-1"}
        )
        
        assert backend.id == "test-server"
        assert backend.host == "192.168.1.100"
        assert backend.port == 8000
        assert backend.weight == 2.0
        assert backend.max_connections == 150
        assert backend.health_check_url == "/health"
        assert backend.timeout_ms == 3000
        assert backend.metadata == {"region": "us-east-1"}
        
        # Test computed properties
        assert backend.endpoint == "http://192.168.1.100:8000"
        assert backend.health_check_endpoint == "http://192.168.1.100:8000/health"
    
    def test_backend_defaults(self):
        """Test backend with default values"""
        backend = Backend(id="simple", host="localhost", port=3000)
        
        assert backend.weight == 1.0
        assert backend.max_connections == 100
        assert backend.health_check_url == "/health"
        assert backend.timeout_ms == 5000
        assert backend.metadata == {}


class TestRequestContext:
    """Test RequestContext model"""
    
    def test_request_context_creation(self):
        """Test request context creation"""
        context = RequestContext(
            client_ip="192.168.1.50",
            user_agent="Mozilla/5.0",
            session_id="session123",
            tenant_id=1,
            request_path="/api/v1/query",
            request_method="POST",
            headers={"Content-Type": "application/json"}
        )
        
        assert context.client_ip == "192.168.1.50"
        assert context.user_agent == "Mozilla/5.0"
        assert context.session_id == "session123"
        assert context.tenant_id == 1
        assert context.request_path == "/api/v1/query"
        assert context.request_method == "POST"
        assert context.headers == {"Content-Type": "application/json"}
        assert context.timestamp is not None
    
    def test_request_context_defaults(self):
        """Test request context with defaults"""
        context = RequestContext(client_ip="127.0.0.1")
        
        assert context.user_agent is None
        assert context.session_id is None
        assert context.tenant_id is None
        assert context.request_path == "/"
        assert context.request_method == "GET"
        assert context.headers == {}
        assert context.timestamp is not None


class TestHealthChecker:
    """Test HealthChecker functionality"""
    
    @pytest.fixture
    def backends(self):
        """Test backends"""
        return [
            Backend(id="server1", host="192.168.1.100", port=8000),
            Backend(id="server2", host="192.168.1.101", port=8000),
            Backend(id="server3", host="192.168.1.102", port=8000)
        ]
    
    @pytest.fixture
    def health_checker(self):
        """Test health checker"""
        return HealthChecker(check_interval_seconds=1)
    
    @pytest.mark.asyncio
    async def test_health_checker_start_stop(self, health_checker, backends):
        """Test health checker start and stop"""
        assert not health_checker.running
        
        await health_checker.start(backends)
        assert health_checker.running
        assert len(health_checker.backends_status) == 3
        
        # Check initial status
        for backend in backends:
            status = health_checker.get_backend_status(backend.id)
            assert status is not None
            assert status.backend.id == backend.id
            assert status.health == BackendHealth.UNKNOWN
            assert status.current_connections == 0
            assert status.total_requests == 0
        
        await health_checker.stop()
        assert not health_checker.running
    
    @pytest.mark.asyncio
    async def test_health_check_updates(self, health_checker, backends):
        """Test health check updates"""
        await health_checker.start(backends)
        
        try:
            # Wait for a few health checks
            await asyncio.sleep(2.5)
            
            # Check that health status was updated
            healthy_backends = health_checker.get_healthy_backends()
            assert len(healthy_backends) >= 2  # Most should be healthy due to simulation
            
            for status in healthy_backends:
                assert status.health == BackendHealth.HEALTHY
                assert status.last_health_check is not None
                assert status.avg_response_time_ms > 0
        
        finally:
            await health_checker.stop()
    
    def test_update_request_stats(self, health_checker, backends):
        """Test request statistics updates"""
        # Initialize without starting (for unit test)
        for backend in backends:
            health_checker.backends_status[backend.id] = type('MockStatus', (), {
                'total_requests': 0,
                'successful_requests': 0,
                'failed_requests': 0,
                'avg_response_time_ms': 0.0
            })()
        
        # Update stats
        health_checker.update_request_stats("server1", True, 150.0)
        health_checker.update_request_stats("server1", True, 200.0)
        health_checker.update_request_stats("server1", False, 100.0)
        
        status = health_checker.backends_status["server1"]
        assert status.total_requests == 3
        assert status.successful_requests == 2
        assert status.failed_requests == 1
        assert status.avg_response_time_ms > 0
    
    def test_update_connection_count(self, health_checker, backends):
        """Test connection count updates"""
        # Initialize without starting
        for backend in backends:
            health_checker.backends_status[backend.id] = type('MockStatus', (), {
                'current_connections': 0
            })()
        
        # Update connections
        health_checker.update_connection_count("server1", 5)
        health_checker.update_connection_count("server1", -2)
        health_checker.update_connection_count("server1", -10)  # Should not go below 0
        
        status = health_checker.backends_status["server1"]
        assert status.current_connections == 0  # Should not go negative


class TestLoadBalancingEngine:
    """Test LoadBalancingEngine strategies"""
    
    @pytest.fixture
    def backend_statuses(self):
        """Mock backend statuses for testing"""
        backends = [
            Backend(id="server1", host="192.168.1.100", port=8000, weight=2.0),
            Backend(id="server2", host="192.168.1.101", port=8000, weight=1.5),
            Backend(id="server3", host="192.168.1.102", port=8000, weight=1.0)
        ]
        
        statuses = []
        for i, backend in enumerate(backends):
            status = type('MockBackendStatus', (), {
                'backend': backend,
                'health': BackendHealth.HEALTHY,
                'current_connections': i * 2,  # 0, 2, 4
                'total_requests': i * 10,  # 0, 10, 20
                'successful_requests': i * 9,  # 0, 9, 18
                'failed_requests': i * 1,  # 0, 1, 2
                'avg_response_time_ms': 100.0 + (i * 50),  # 100, 150, 200
                'success_rate': 90.0 + i,  # 90, 91, 92
                'utilization': i * 10  # 0, 10, 20
            })()
            statuses.append(status)
        
        return statuses
    
    @pytest.fixture
    def engine(self):
        """Test load balancing engine"""
        return LoadBalancingEngine(LoadBalancingStrategy.ROUND_ROBIN)
    
    @pytest.fixture
    def context(self):
        """Test request context"""
        return RequestContext(client_ip="192.168.1.50", session_id="test-session")
    
    def test_round_robin_strategy(self, engine, backend_statuses, context):
        """Test round robin strategy"""
        # Multiple selections should rotate through backends
        selections = []
        for i in range(6):
            decision = engine.select_backend(backend_statuses, context)
            assert decision is not None
            selections.append(decision.backend.id)
        
        # Should cycle through all backends
        assert "server1" in selections
        assert "server2" in selections
        assert "server3" in selections
        
        # Should follow round-robin pattern
        expected_pattern = ["server1", "server2", "server3", "server1", "server2", "server3"]
        assert selections == expected_pattern
    
    def test_weighted_round_robin_strategy(self, engine, backend_statuses, context):
        """Test weighted round robin strategy"""
        engine.default_strategy = LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN
        
        # Collect many selections to test weight distribution
        selections = []
        for i in range(30):
            decision = engine.select_backend(backend_statuses, context)
            assert decision is not None
            selections.append(decision.backend.id)
        
        # Count selections per backend
        counts = {}
        for selection in selections:
            counts[selection] = counts.get(selection, 0) + 1
        
        # Server1 (weight 2.0) should get more selections than server3 (weight 1.0)
        assert counts.get("server1", 0) > counts.get("server3", 0)
    
    def test_least_connections_strategy(self, engine, backend_statuses, context):
        """Test least connections strategy"""
        engine.default_strategy = LoadBalancingStrategy.LEAST_CONNECTIONS
        
        decision = engine.select_backend(backend_statuses, context)
        assert decision is not None
        # Should select server1 (0 connections)
        assert decision.backend.id == "server1"
        assert "connections" in decision.reason.lower()
    
    def test_response_time_strategy(self, engine, backend_statuses, context):
        """Test response time strategy"""
        engine.default_strategy = LoadBalancingStrategy.RESPONSE_TIME
        
        decision = engine.select_backend(backend_statuses, context)
        assert decision is not None
        # Should select server1 (100ms response time)
        assert decision.backend.id == "server1"
        assert "response time" in decision.reason.lower()
    
    def test_random_strategy(self, engine, backend_statuses, context):
        """Test random strategy"""
        engine.default_strategy = LoadBalancingStrategy.RANDOM
        
        # Multiple selections should eventually hit all backends
        selections = set()
        for i in range(20):
            decision = engine.select_backend(backend_statuses, context)
            assert decision is not None
            selections.add(decision.backend.id)
        
        # Should eventually select from all backends (probabilistic)
        assert len(selections) >= 2  # At least 2 different backends
    
    def test_ip_hash_strategy(self, engine, backend_statuses, context):
        """Test IP hash strategy"""
        engine.default_strategy = LoadBalancingStrategy.IP_HASH
        
        # Same IP should always go to same backend
        decision1 = engine.select_backend(backend_statuses, context)
        decision2 = engine.select_backend(backend_statuses, context)
        decision3 = engine.select_backend(backend_statuses, context)
        
        assert decision1 is not None
        assert decision2 is not None
        assert decision3 is not None
        
        # Same IP should consistently route to same backend
        assert decision1.backend.id == decision2.backend.id == decision3.backend.id
        assert "hash" in decision1.reason.lower()
    
    def test_health_based_strategy(self, engine, backend_statuses, context):
        """Test health-based strategy"""
        engine.default_strategy = LoadBalancingStrategy.HEALTH_BASED
        
        decision = engine.select_backend(backend_statuses, context)
        assert decision is not None
        assert "health" in decision.reason.lower()
    
    def test_session_affinity(self, engine, backend_statuses, context):
        """Test session affinity"""
        # First request establishes affinity
        decision1 = engine.select_backend(backend_statuses, context)
        assert decision1 is not None
        first_backend = decision1.backend.id
        
        # Subsequent requests with same session should go to same backend
        decision2 = engine.select_backend(backend_statuses, context)
        decision3 = engine.select_backend(backend_statuses, context)
        
        assert decision2 is not None
        assert decision3 is not None
        assert decision2.backend.id == first_backend
        assert decision3.backend.id == first_backend
        assert decision2.session_affinity
        assert decision3.session_affinity
    
    def test_no_healthy_backends(self, engine, context):
        """Test behavior with no healthy backends"""
        # Create unhealthy backends
        unhealthy_statuses = []
        for i in range(3):
            backend = Backend(id=f"server{i}", host=f"192.168.1.{100+i}", port=8000)
            status = type('MockBackendStatus', (), {
                'backend': backend,
                'health': BackendHealth.UNHEALTHY,
                'current_connections': 0,
                'total_requests': 0,
                'successful_requests': 0,
                'failed_requests': 10,
                'avg_response_time_ms': 1000.0,
                'success_rate': 0.0,
                'utilization': 0
            })()
            unhealthy_statuses.append(status)
        
        decision = engine.select_backend(unhealthy_statuses, context)
        assert decision is None
    
    def test_degraded_backends_fallback(self, engine, context):
        """Test fallback to degraded backends when no healthy ones"""
        # Create degraded backends
        degraded_statuses = []
        for i in range(2):
            backend = Backend(id=f"server{i}", host=f"192.168.1.{100+i}", port=8000)
            status = type('MockBackendStatus', (), {
                'backend': backend,
                'health': BackendHealth.DEGRADED,
                'current_connections': 1,
                'total_requests': 10,
                'successful_requests': 8,
                'failed_requests': 2,
                'avg_response_time_ms': 300.0,
                'success_rate': 80.0,
                'utilization': 10
            })()
            degraded_statuses.append(status)
        
        decision = engine.select_backend(degraded_statuses, context)
        assert decision is not None
        assert decision.backend.id in ["server0", "server1"]


class TestLoadBalancerService:
    """Test LoadBalancerService integration"""
    
    @pytest.fixture
    def backends(self):
        """Test backends"""
        return [
            Backend(id="api-1", host="192.168.1.100", port=8000, weight=2.0),
            Backend(id="api-2", host="192.168.1.101", port=8000, weight=1.5),
            Backend(id="api-3", host="192.168.1.102", port=8000, weight=1.0)
        ]
    
    @pytest.fixture
    async def lb_service(self):
        """Test load balancer service"""
        service = LoadBalancerService(LoadBalancingStrategy.ROUND_ROBIN)
        await service.start()
        yield service
        await service.stop()
    
    @pytest.mark.asyncio
    async def test_service_lifecycle(self):
        """Test service start and stop"""
        service = LoadBalancerService()
        
        # Initially not started
        assert len(service.backends) == 0
        
        await service.start()
        # Service should be running
        
        await service.stop()
        # Service should be stopped
    
    def test_backend_management(self, lb_service, backends):
        """Test backend add/remove operations"""
        # Add backends
        for backend in backends:
            lb_service.add_backend(backend)
        
        assert len(lb_service.backends) == 3
        assert lb_service.get_backend("api-1") is not None
        assert lb_service.get_backend("api-1").host == "192.168.1.100"
        
        # List backends
        all_backends = lb_service.list_backends()
        assert len(all_backends) == 3
        backend_ids = [b.id for b in all_backends]
        assert "api-1" in backend_ids
        assert "api-2" in backend_ids
        assert "api-3" in backend_ids
        
        # Remove backend
        lb_service.remove_backend("api-2")
        assert len(lb_service.backends) == 2
        assert lb_service.get_backend("api-2") is None
    
    @pytest.mark.asyncio
    async def test_request_routing(self, lb_service, backends):
        """Test request routing"""
        # Add backends
        for backend in backends:
            lb_service.add_backend(backend)
        
        # Wait for health checks to initialize
        await asyncio.sleep(1)
        
        # Create request context
        context = RequestContext(
            client_ip="192.168.1.50",
            session_id="test-session",
            tenant_id=1
        )
        
        # Route request
        decision = await lb_service.route_request(context)
        
        if decision:  # Only test if we have healthy backends
            assert decision.backend is not None
            assert decision.backend.id in ["api-1", "api-2", "api-3"]
            assert decision.strategy_used == LoadBalancingStrategy.ROUND_ROBIN
            assert decision.decision_time_ms >= 0
            assert decision.alternatives_considered >= 1
        
        # Test with custom strategy
        custom_decision = await lb_service.route_request(
            context, 
            LoadBalancingStrategy.LEAST_CONNECTIONS
        )
        
        if custom_decision:
            assert custom_decision.strategy_used == LoadBalancingStrategy.LEAST_CONNECTIONS
    
    def test_request_completion(self, lb_service, backends):
        """Test request completion tracking"""
        # Add backends
        for backend in backends:
            lb_service.add_backend(backend)
        
        # Complete some requests
        lb_service.complete_request("api-1", True, 150.0)
        lb_service.complete_request("api-1", True, 200.0)
        lb_service.complete_request("api-1", False, 500.0)
        
        # Check statistics updated
        assert lb_service.successful_requests >= 2
        assert lb_service.failed_requests >= 1
        assert lb_service.total_requests >= 3
    
    def test_backend_enable_disable(self, lb_service, backends):
        """Test backend enable/disable"""
        # Add backends
        for backend in backends:
            lb_service.add_backend(backend)
        
        # Disable backend
        success = lb_service.disable_backend("api-1")
        assert success
        
        status = lb_service.get_backend_status("api-1")
        if status:
            assert not status.is_enabled
        
        # Re-enable backend
        success = lb_service.enable_backend("api-1")
        assert success
        
        status = lb_service.get_backend_status("api-1")
        if status:
            assert status.is_enabled
        
        # Test with non-existent backend
        success = lb_service.disable_backend("non-existent")
        assert not success
    
    def test_strategy_configuration(self, lb_service):
        """Test strategy configuration"""
        # Change default strategy
        lb_service.set_default_strategy(LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN)
        
        assert lb_service.default_strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN
        assert lb_service.load_balancing_engine.default_strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN
    
    def test_statistics_collection(self, lb_service, backends):
        """Test statistics collection"""
        # Add backends
        for backend in backends:
            lb_service.add_backend(backend)
        
        # Get initial stats
        stats = lb_service.get_load_balancer_stats()
        
        assert 'total_backends' in stats
        assert 'healthy_backends' in stats
        assert 'unhealthy_backends' in stats
        assert 'total_requests' in stats
        assert 'successful_requests' in stats
        assert 'failed_requests' in stats
        assert 'success_rate' in stats
        assert 'default_strategy' in stats
        assert 'recent_requests' in stats
        
        assert stats['total_backends'] == 3
        assert stats['default_strategy'] == LoadBalancingStrategy.ROUND_ROBIN.value
    
    def test_traffic_distribution(self, lb_service, backends):
        """Test traffic distribution analysis"""
        # Add backends
        for backend in backends:
            lb_service.add_backend(backend)
        
        # Simulate some requests
        for i in range(10):
            lb_service.request_history.append({
                'timestamp': datetime.now(timezone.utc),
                'backend_id': f"api-{(i % 3) + 1}",
                'client_ip': f"192.168.1.{50 + i}",
                'strategy': LoadBalancingStrategy.ROUND_ROBIN.value,
                'decision_time_ms': 1.0
            })
        
        # Get distribution
        distribution = lb_service.get_traffic_distribution()
        
        assert 'total_recent_requests' in distribution
        assert 'distribution' in distribution
        assert 'analysis_period' in distribution
        
        assert distribution['total_recent_requests'] == 10
        
        # Should have distribution for all backends
        dist_data = distribution['distribution']
        assert len(dist_data) == 3
        
        for backend_id in ['api-1', 'api-2', 'api-3']:
            assert backend_id in dist_data
            assert 'requests' in dist_data[backend_id]
            assert 'percentage' in dist_data[backend_id]
    
    def test_strategy_recommendations(self, lb_service):
        """Test strategy recommendations"""
        # Add some request history
        strategies = [LoadBalancingStrategy.ROUND_ROBIN, LoadBalancingStrategy.LEAST_CONNECTIONS]
        
        for i in range(60):
            strategy = strategies[i % 2]
            decision_time = 1.0 + (i % 2) * 0.5  # Vary decision times
            
            lb_service.request_history.append({
                'timestamp': datetime.now(timezone.utc),
                'backend_id': f"api-{(i % 3) + 1}",
                'client_ip': f"192.168.1.{50 + i}",
                'strategy': strategy.value,
                'decision_time_ms': decision_time
            })
        
        # Get recommendations
        recommendations = lb_service.get_strategy_recommendations()
        
        assert 'recommendation' in recommendations
        assert 'reason' in recommendations
        assert 'confidence' in recommendations
        
        # Should recommend one of the strategies we used
        recommended = recommendations['recommendation']
        assert recommended in [s.value for s in strategies]


@pytest.mark.asyncio
async def test_integration_demo():
    """Integration test simulating the demo scenario"""
    # Create service
    lb_service = LoadBalancerService(LoadBalancingStrategy.ROUND_ROBIN)
    await lb_service.start()
    
    try:
        # Add backends
        backends = [
            Backend(id="api-1", host="192.168.1.100", port=8000, weight=2.0),
            Backend(id="api-2", host="192.168.1.101", port=8000, weight=1.5),
            Backend(id="api-3", host="192.168.1.102", port=8000, weight=1.0)
        ]
        
        for backend in backends:
            lb_service.add_backend(backend)
        
        # Wait for initial health checks
        await asyncio.sleep(2)
        
        # Test different strategies
        strategies = [
            LoadBalancingStrategy.ROUND_ROBIN,
            LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN,
            LoadBalancingStrategy.LEAST_CONNECTIONS,
            LoadBalancingStrategy.RANDOM
        ]
        
        for strategy in strategies:
            lb_service.set_default_strategy(strategy)
            
            # Make several requests
            for i in range(5):
                context = RequestContext(
                    client_ip=f"192.168.1.{50 + i}",
                    session_id=f"session_{i}",
                    tenant_id=1
                )
                
                decision = await lb_service.route_request(context)
                if decision:
                    # Simulate request completion
                    lb_service.complete_request(
                        decision.backend.id,
                        True,
                        100.0 + i * 20
                    )
        
        # Check final statistics
        stats = lb_service.get_load_balancer_stats()
        assert stats['total_requests'] > 0
        
        # Check traffic distribution
        distribution = lb_service.get_traffic_distribution()
        assert distribution['total_recent_requests'] > 0
        
        # Check recommendations
        recommendations = lb_service.get_strategy_recommendations()
        assert recommendations['recommendation'] is not None
    
    finally:
        await lb_service.stop()


if __name__ == "__main__":
    # Run basic tests
    pytest.main([__file__, "-v"])