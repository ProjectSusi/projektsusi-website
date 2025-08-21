"""
Test suite for Horizontal Scaling Service
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch, AsyncMock

from core.services.scaling_service import (
    HorizontalScalingService, ComponentType, ScalingAction, MetricThreshold,
    SystemMetrics, ScalingEvent, ComponentStatus, MetricsCollector, 
    ScalingDecisionEngine, ComponentScaler
)


class TestMetricsCollector:
    """Test metrics collection functionality"""

    @pytest.fixture
    def metrics_collector(self):
        """Create metrics collector for testing"""
        return MetricsCollector()

    def test_register_metric(self, metrics_collector):
        """Test registering custom metrics"""
        def test_metric():
            return 42.0
        
        metrics_collector.register_metric("test_metric", test_metric)
        
        assert "test_metric" in metrics_collector.custom_metrics
        assert metrics_collector.custom_metrics["test_metric"]() == 42.0

    @patch('core.services.scaling_service.psutil')
    async def test_collect_system_metrics(self, mock_psutil, metrics_collector):
        """Test system metrics collection"""
        # Mock psutil calls
        mock_psutil.cpu_percent.return_value = 75.5
        mock_psutil.virtual_memory.return_value = Mock(percent=60.2)
        mock_psutil.disk_usage.return_value = Mock(used=50*1024**3, total=100*1024**3)
        mock_psutil.net_io_counters.return_value = Mock(bytes_sent=1024**3, bytes_recv=2*1024**3)
        mock_psutil.net_connections.return_value = [Mock()] * 25
        
        # Register custom metric
        metrics_collector.register_metric("queue_length", lambda: 5.0)
        
        metrics = await metrics_collector.collect_system_metrics()
        
        assert isinstance(metrics, SystemMetrics)
        assert metrics.cpu_percent == 75.5
        assert metrics.memory_percent == 60.2
        assert metrics.disk_percent == 50.0
        assert metrics.active_connections == 25
        assert metrics.custom_metrics["queue_length"] == 5.0

    @patch('core.services.scaling_service.psutil')
    async def test_collect_metrics_failure_fallback(self, mock_psutil, metrics_collector):
        """Test fallback when metrics collection fails"""
        # Make psutil raise an exception
        mock_psutil.cpu_percent.side_effect = Exception("Test error")
        
        metrics = await metrics_collector.collect_system_metrics()
        
        # Should return fallback metrics
        assert isinstance(metrics, SystemMetrics)
        assert metrics.cpu_percent == 0.0
        assert metrics.memory_percent == 0.0


class TestScalingDecisionEngine:
    """Test scaling decision logic"""

    @pytest.fixture
    def decision_engine(self):
        """Create decision engine for testing"""
        return ScalingDecisionEngine()

    @pytest.fixture
    def sample_threshold(self):
        """Create sample threshold for testing"""
        return MetricThreshold(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=80.0,
            scale_down_threshold=20.0,
            min_instances=2,
            max_instances=10,
            cooldown_seconds=300
        )

    @pytest.fixture
    def sample_metrics(self):
        """Create sample metrics for testing"""
        return SystemMetrics(
            timestamp=datetime.now(timezone.utc),
            cpu_percent=85.0,
            memory_percent=60.0,
            disk_percent=40.0,
            network_io_mbps=10.0,
            active_connections=50,
            queue_length=15,
            response_time_ms=200,
            error_rate_percent=2.0,
            custom_metrics={"custom_metric": 42.0}
        )

    def test_add_threshold(self, decision_engine, sample_threshold):
        """Test adding scaling threshold"""
        decision_engine.add_threshold(sample_threshold)
        
        assert ComponentType.API_WORKERS in decision_engine.thresholds
        assert len(decision_engine.thresholds[ComponentType.API_WORKERS]) == 1
        assert ComponentType.API_WORKERS in decision_engine.component_status
        
        status = decision_engine.component_status[ComponentType.API_WORKERS]
        assert status.min_instances == 2
        assert status.max_instances == 10
        assert status.current_instances == 2  # Should start at min

    def test_evaluate_scaling_scale_up(self, decision_engine, sample_threshold, sample_metrics):
        """Test scaling up decision"""
        decision_engine.add_threshold(sample_threshold)
        
        # CPU is 85%, above threshold of 80%
        decisions = decision_engine.evaluate_scaling(sample_metrics)
        
        assert ComponentType.API_WORKERS in decisions
        assert decisions[ComponentType.API_WORKERS] == ScalingAction.SCALE_UP

    def test_evaluate_scaling_scale_down(self, decision_engine, sample_threshold):
        """Test scaling down decision"""
        decision_engine.add_threshold(sample_threshold)
        
        # Set current instances above minimum
        status = decision_engine.component_status[ComponentType.API_WORKERS]
        status.current_instances = 5
        
        # Create low CPU metrics
        low_cpu_metrics = SystemMetrics(
            timestamp=datetime.now(timezone.utc),
            cpu_percent=15.0,  # Below threshold of 20%
            memory_percent=30.0,
            disk_percent=20.0,
            network_io_mbps=1.0,
            active_connections=5,
            queue_length=0,
            response_time_ms=50,
            error_rate_percent=0.1,
            custom_metrics={}
        )
        
        decisions = decision_engine.evaluate_scaling(low_cpu_metrics)
        
        assert decisions[ComponentType.API_WORKERS] == ScalingAction.SCALE_DOWN

    def test_evaluate_scaling_no_action(self, decision_engine, sample_threshold):
        """Test no scaling action needed"""
        decision_engine.add_threshold(sample_threshold)
        
        # Create moderate CPU metrics (between thresholds)
        moderate_metrics = SystemMetrics(
            timestamp=datetime.now(timezone.utc),
            cpu_percent=50.0,  # Between 20% and 80%
            memory_percent=50.0,
            disk_percent=30.0,
            network_io_mbps=5.0,
            active_connections=25,
            queue_length=5,
            response_time_ms=100,
            error_rate_percent=1.0,
            custom_metrics={}
        )
        
        decisions = decision_engine.evaluate_scaling(moderate_metrics)
        
        assert decisions[ComponentType.API_WORKERS] == ScalingAction.NO_ACTION

    def test_evaluate_scaling_cooldown_prevention(self, decision_engine, sample_threshold, sample_metrics):
        """Test cooldown prevents scaling"""
        decision_engine.add_threshold(sample_threshold)
        
        # Simulate recent scaling
        status = decision_engine.component_status[ComponentType.API_WORKERS]
        status.last_scaled = datetime.now(timezone.utc) - timedelta(seconds=60)  # 1 minute ago
        
        decisions = decision_engine.evaluate_scaling(sample_metrics)
        
        # Should be no action due to cooldown (300 seconds)
        assert decisions[ComponentType.API_WORKERS] == ScalingAction.NO_ACTION

    def test_evaluate_scaling_max_instances_limit(self, decision_engine, sample_threshold, sample_metrics):
        """Test scaling up respects max instances limit"""
        decision_engine.add_threshold(sample_threshold)
        
        # Set current instances to maximum
        status = decision_engine.component_status[ComponentType.API_WORKERS]
        status.current_instances = status.max_instances
        
        decisions = decision_engine.evaluate_scaling(sample_metrics)
        
        # Should be no action despite high CPU because at max instances
        assert decisions[ComponentType.API_WORKERS] == ScalingAction.NO_ACTION

    def test_record_scaling_event(self, decision_engine, sample_threshold):
        """Test recording scaling events"""
        decision_engine.add_threshold(sample_threshold)
        
        event = ScalingEvent(
            timestamp=datetime.now(timezone.utc),
            component=ComponentType.API_WORKERS,
            action=ScalingAction.SCALE_UP,
            old_instances=2,
            new_instances=3,
            trigger_metric="cpu_percent",
            trigger_value=85.0,
            reason="High CPU usage"
        )
        
        decision_engine.record_scaling_event(event)
        
        assert len(decision_engine.scaling_history) == 1
        assert decision_engine.scaling_history[0] == event
        
        # Check component status updated
        status = decision_engine.component_status[ComponentType.API_WORKERS]
        assert status.current_instances == 3
        assert status.last_action == ScalingAction.SCALE_UP

    def test_get_scaling_history_filtering(self, decision_engine):
        """Test scaling history filtering"""
        # Add some events
        old_event = ScalingEvent(
            timestamp=datetime.now(timezone.utc) - timedelta(hours=25),
            component=ComponentType.API_WORKERS,
            action=ScalingAction.SCALE_UP,
            old_instances=2,
            new_instances=3,
            trigger_metric="cpu_percent",
            trigger_value=85.0,
            reason="Test old event"
        )
        
        recent_event = ScalingEvent(
            timestamp=datetime.now(timezone.utc) - timedelta(hours=1),
            component=ComponentType.BACKGROUND_JOBS,
            action=ScalingAction.SCALE_DOWN,
            old_instances=3,
            new_instances=2,
            trigger_metric="queue_length",
            trigger_value=2.0,
            reason="Test recent event"
        )
        
        decision_engine.scaling_history = [old_event, recent_event]
        
        # Test time filtering (24 hours)
        recent_history = decision_engine.get_scaling_history(hours=24)
        assert len(recent_history) == 1
        assert recent_history[0] == recent_event
        
        # Test component filtering
        api_history = decision_engine.get_scaling_history(
            component=ComponentType.API_WORKERS, 
            hours=48
        )
        assert len(api_history) == 1
        assert api_history[0] == old_event


class TestComponentScaler:
    """Test component scaling operations"""

    @pytest.fixture
    def component_scaler(self):
        """Create component scaler for testing"""
        return ComponentScaler()

    async def test_register_scaler(self, component_scaler):
        """Test registering component scalers"""
        async def mock_scaler(component, target_instances, action):
            return True
        
        component_scaler.register_scaler(ComponentType.API_WORKERS, mock_scaler)
        
        assert ComponentType.API_WORKERS in component_scaler.scalers

    async def test_scale_component_up(self, component_scaler):
        """Test scaling component up"""
        async def mock_scaler(component, target_instances, action):
            assert component == ComponentType.API_WORKERS
            assert target_instances == 4  # 3 + 1
            assert action == ScalingAction.SCALE_UP
            return True
        
        component_scaler.register_scaler(ComponentType.API_WORKERS, mock_scaler)
        
        success = await component_scaler.scale_component(
            ComponentType.API_WORKERS, 3, ScalingAction.SCALE_UP
        )
        
        assert success is True

    async def test_scale_component_down(self, component_scaler):
        """Test scaling component down"""
        async def mock_scaler(component, target_instances, action):
            assert component == ComponentType.API_WORKERS
            assert target_instances == 2  # 3 - 1
            assert action == ScalingAction.SCALE_DOWN
            return True
        
        component_scaler.register_scaler(ComponentType.API_WORKERS, mock_scaler)
        
        success = await component_scaler.scale_component(
            ComponentType.API_WORKERS, 3, ScalingAction.SCALE_DOWN
        )
        
        assert success is True

    async def test_scale_component_no_scaler(self, component_scaler):
        """Test scaling with no registered scaler"""
        success = await component_scaler.scale_component(
            ComponentType.API_WORKERS, 3, ScalingAction.SCALE_UP
        )
        
        assert success is False

    async def test_scale_component_scaler_failure(self, component_scaler):
        """Test handling of scaler function failure"""
        async def failing_scaler(component, target_instances, action):
            raise Exception("Scaler failed")
        
        component_scaler.register_scaler(ComponentType.API_WORKERS, failing_scaler)
        
        success = await component_scaler.scale_component(
            ComponentType.API_WORKERS, 3, ScalingAction.SCALE_UP
        )
        
        assert success is False


class TestHorizontalScalingService:
    """Test horizontal scaling service functionality"""

    @pytest.fixture
    async def scaling_service(self):
        """Create scaling service for testing"""
        service = HorizontalScalingService(
            check_interval_seconds=1,  # Fast for testing
            enable_auto_scaling=True
        )
        
        # Mock metrics collector to avoid psutil dependencies
        service.metrics_collector = Mock()
        service.metrics_collector.collect_system_metrics = AsyncMock()
        
        yield service
        
        # Cleanup
        if service.running:
            await service.stop()

    def test_configure_component_scaling(self, scaling_service):
        """Test configuring component scaling"""
        scaling_service.configure_component_scaling(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=80.0,
            scale_down_threshold=20.0,
            min_instances=2,
            max_instances=8
        )
        
        assert ComponentType.API_WORKERS in scaling_service.decision_engine.thresholds
        assert ComponentType.API_WORKERS in scaling_service.decision_engine.component_status
        
        thresholds = scaling_service.decision_engine.thresholds[ComponentType.API_WORKERS]
        assert len(thresholds) == 1
        assert thresholds[0].scale_up_threshold == 80.0

    def test_register_metric_collector(self, scaling_service):
        """Test registering custom metric collectors"""
        def test_metric():
            return 100.0
        
        scaling_service.register_metric_collector("test_metric", test_metric)
        
        assert "test_metric" in scaling_service.metrics_collector.custom_metrics

    def test_register_component_scaler(self, scaling_service):
        """Test registering component scalers"""
        async def test_scaler(component, target_instances, action):
            return True
        
        scaling_service.register_component_scaler(ComponentType.API_WORKERS, test_scaler)
        
        assert ComponentType.API_WORKERS in scaling_service.component_scaler.scalers

    async def test_start_stop_service(self, scaling_service):
        """Test starting and stopping the service"""
        assert not scaling_service.running
        
        await scaling_service.start()
        assert scaling_service.running
        assert scaling_service.scaling_task is not None
        
        await scaling_service.stop()
        assert not scaling_service.running
        assert scaling_service.scaling_task is None

    def test_get_system_status(self, scaling_service):
        """Test getting system status"""
        # Configure a component
        scaling_service.configure_component_scaling(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=80.0,
            scale_down_threshold=20.0
        )
        
        status = scaling_service.get_system_status()
        
        assert isinstance(status, dict)
        assert "scaling_enabled" in status
        assert "running" in status
        assert "components" in status
        assert "latest_metrics" in status
        
        assert ComponentType.API_WORKERS.value in status["components"]

    def test_get_scaling_recommendations(self, scaling_service):
        """Test getting scaling recommendations"""
        # Add some mock metrics
        mock_metrics = SystemMetrics(
            timestamp=datetime.now(timezone.utc),
            cpu_percent=90.0,  # High CPU
            memory_percent=95.0,  # High memory
            disk_percent=30.0,
            network_io_mbps=5.0,
            active_connections=20,
            queue_length=15,  # High queue
            response_time_ms=1500,  # High response time
            error_rate_percent=1.0,
            custom_metrics={}
        )
        
        scaling_service.metrics_history = [mock_metrics] * 10
        
        recommendations = scaling_service.get_scaling_recommendations()
        
        assert isinstance(recommendations, dict)
        assert "recommendations" in recommendations
        assert "averages" in recommendations
        
        # Should have recommendations for high resource usage
        recommendations_text = " ".join(recommendations["recommendations"])
        assert "CPU" in recommendations_text or "cpu" in recommendations_text.lower()

    async def test_manual_scale_success(self, scaling_service):
        """Test successful manual scaling"""
        # Configure component
        scaling_service.configure_component_scaling(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=80.0,
            scale_down_threshold=20.0,
            min_instances=2,
            max_instances=5
        )
        
        # Register mock scaler
        async def mock_scaler(component, target_instances, action):
            return True
        
        scaling_service.register_component_scaler(ComponentType.API_WORKERS, mock_scaler)
        
        # Mock metrics collector
        scaling_service.metrics_collector.collect_system_metrics.return_value = SystemMetrics(
            timestamp=datetime.now(timezone.utc),
            cpu_percent=50.0,
            memory_percent=50.0,
            disk_percent=30.0,
            network_io_mbps=5.0,
            active_connections=20,
            queue_length=5,
            response_time_ms=200,
            error_rate_percent=1.0,
            custom_metrics={}
        )
        
        # Test manual scale up
        success = await scaling_service.manual_scale(
            ComponentType.API_WORKERS, 
            ScalingAction.SCALE_UP,
            "Manual test"
        )
        
        assert success is True
        
        # Check that scaling event was recorded
        history = scaling_service.decision_engine.get_scaling_history()
        assert len(history) == 1
        assert history[0].action == ScalingAction.SCALE_UP

    async def test_manual_scale_at_limits(self, scaling_service):
        """Test manual scaling at instance limits"""
        # Configure component
        scaling_service.configure_component_scaling(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=80.0,
            scale_down_threshold=20.0,
            min_instances=1,
            max_instances=3
        )
        
        # Set to maximum instances
        status = scaling_service.decision_engine.component_status[ComponentType.API_WORKERS]
        status.current_instances = 3
        
        # Try to scale up (should fail)
        success = await scaling_service.manual_scale(
            ComponentType.API_WORKERS,
            ScalingAction.SCALE_UP
        )
        
        assert success is False

    async def test_manual_scale_unconfigured_component(self, scaling_service):
        """Test manual scaling of unconfigured component"""
        success = await scaling_service.manual_scale(
            ComponentType.API_WORKERS,
            ScalingAction.SCALE_UP
        )
        
        assert success is False


@pytest.mark.asyncio
class TestScalingAPI:
    """Test scaling API endpoints"""

    @pytest.fixture
    def mock_scaling_service(self):
        """Create mock scaling service"""
        service = Mock()
        
        # Mock methods
        service.get_system_status.return_value = {
            "scaling_enabled": True,
            "running": True,
            "check_interval_seconds": 60,
            "components": {},
            "latest_metrics": None,
            "metrics_history_size": 0
        }
        
        service.get_scaling_recommendations.return_value = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analysis_period_minutes": 10,
            "metrics_analyzed": 5,
            "averages": {"cpu_percent": 75.0, "memory_percent": 60.0},
            "recommendations": ["System appears to be running optimally"]
        }
        
        service.configure_component_scaling = Mock()
        service.manual_scale = AsyncMock(return_value=True)
        service.decision_engine = Mock()
        service.decision_engine.get_scaling_history.return_value = []
        service.metrics_history = []
        
        return service

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock()
        user.username = "testuser"
        user.tenant_id = 1
        user.role = 'user'
        return user

    @pytest.fixture
    def mock_admin_user(self):
        """Create mock admin user"""
        user = Mock()
        user.username = "admin"
        user.tenant_id = 1
        user.role = 'admin'
        return user

    async def test_get_scaling_status(self, mock_scaling_service, mock_user):
        """Test getting scaling status via API"""
        from core.routers.scaling import get_scaling_status
        
        result = await get_scaling_status(mock_user, mock_scaling_service)
        
        assert result.scaling_enabled is True
        assert result.running is True
        assert result.check_interval_seconds == 60

    async def test_get_scaling_recommendations(self, mock_scaling_service, mock_user):
        """Test getting scaling recommendations via API"""
        from core.routers.scaling import get_scaling_recommendations
        
        result = await get_scaling_recommendations(mock_user, mock_scaling_service)
        
        assert result.analysis_period_minutes == 10
        assert result.metrics_analyzed == 5
        assert len(result.recommendations) == 1

    async def test_configure_component_scaling(self, mock_scaling_service, mock_admin_user):
        """Test configuring component scaling via API"""
        from core.routers.scaling import configure_component_scaling, ComponentScalingConfig
        
        config = ComponentScalingConfig(
            component=ComponentType.API_WORKERS,
            metric_name="cpu_percent",
            scale_up_threshold=80.0,
            scale_down_threshold=20.0,
            min_instances=2,
            max_instances=8
        )
        
        result = await configure_component_scaling(config, mock_admin_user, mock_scaling_service)
        
        assert result["component"] == "api_workers"
        assert result["metric"] == "cpu_percent"
        
        # Verify service method was called
        mock_scaling_service.configure_component_scaling.assert_called_once()

    async def test_manual_scaling(self, mock_scaling_service, mock_admin_user):
        """Test manual scaling via API"""
        from core.routers.scaling import manual_scaling, ManualScalingRequest
        
        request = ManualScalingRequest(
            component=ComponentType.API_WORKERS,
            action=ScalingAction.SCALE_UP,
            reason="Test scaling"
        )
        
        result = await manual_scaling(request, mock_admin_user, mock_scaling_service)
        
        assert result["action"] == "scale_up"
        assert result["component"] == "api_workers"
        assert result["triggered_by"] == "admin"

    async def test_get_scaling_history(self, mock_scaling_service, mock_user):
        """Test getting scaling history via API"""
        from core.routers.scaling import get_scaling_history
        
        result = await get_scaling_history(
            component=None,
            hours=24,
            limit=100,
            current_user=mock_user,
            scaling_service=mock_scaling_service
        )
        
        assert "events" in result
        assert "total_events" in result
        assert result["hours_requested"] == 24


if __name__ == "__main__":
    pytest.main([__file__, "-v"])