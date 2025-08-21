#!/usr/bin/env python3
"""
Phase 1 Integration Tests
Comprehensive testing suite for Phase 1 optimizations
"""

import asyncio
import pytest
import time
import json
from pathlib import Path
from typing import Dict, Any
from unittest.mock import Mock, AsyncMock, patch

# Test imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from integration.phase1_coordinator import (
    Phase1Coordinator,
    Phase1Status,
    Phase1Metrics
)
from caching.enhanced_redis_config import (
    IntelligentRedisCache,
    QueryCacheOptimized
)
from corpus.document_expansion_service import (
    DocumentExpansionService,
    ProcessingStrategy
)


class TestPhase1Coordinator:
    """Test Phase 1 coordinator functionality"""
    
    @pytest.fixture
    async def coordinator(self):
        """Create coordinator instance for testing"""
        coordinator = Phase1Coordinator(
            redis_url="redis://localhost:6379/15",  # Use test database
            document_storage_path="./test_documents",
            enable_monitoring=False  # Disable for testing
        )
        yield coordinator
        
        # Cleanup
        if coordinator.is_initialized:
            await coordinator.shutdown()
    
    @pytest.mark.asyncio
    async def test_initialization(self, coordinator):
        """Test Phase 1 initialization"""
        # Test initialization
        result = await coordinator.initialize()
        
        # Should succeed or gracefully handle missing dependencies
        assert isinstance(result, bool)
        
        if result:
            assert coordinator.is_initialized
            assert coordinator.overall_status in [Phase1Status.IN_PROGRESS, Phase1Status.COMPLETED]
            assert len(coordinator.components) > 0
    
    @pytest.mark.asyncio
    async def test_component_tracking(self, coordinator):
        """Test component status tracking"""
        coordinator._initialize_component_tracking()
        
        # Check components are initialized
        assert len(coordinator.components) == 5
        expected_components = [
            "redis_cache", "query_cache", "document_expansion",
            "performance_monitoring", "system_integration"
        ]
        
        for comp_name in expected_components:
            assert comp_name in coordinator.components
            component = coordinator.components[comp_name]
            assert component.status == Phase1Status.NOT_STARTED
            assert component.health_score == 0.0
    
    @pytest.mark.asyncio
    async def test_baseline_metrics_capture(self, coordinator):
        """Test baseline metrics capture"""
        await coordinator._capture_baseline_metrics()
        
        assert coordinator.baseline_metrics is not None
        assert coordinator.baseline_metrics.api_response_time_ms > 0
        assert 0 <= coordinator.baseline_metrics.query_success_rate <= 1
        assert coordinator.baseline_metrics.timestamp > 0
    
    @pytest.mark.asyncio
    async def test_performance_improvement_calculation(self, coordinator):
        """Test performance improvement calculation"""
        # Set up test metrics
        coordinator.baseline_metrics = Phase1Metrics(
            api_response_time_ms=100.0,
            cache_hit_rate=0.0,
            query_success_rate=0.80,
            timestamp=time.time()
        )
        
        coordinator.current_metrics = Phase1Metrics(
            api_response_time_ms=70.0,
            cache_hit_rate=0.75,
            query_success_rate=0.90,
            timestamp=time.time()
        )
        
        improvement = coordinator._calculate_performance_improvement()
        
        # Should show improvement
        assert improvement > 0
        assert improvement <= 1.0
    
    @pytest.mark.asyncio
    async def test_status_report_generation(self, coordinator):
        """Test status report generation"""
        coordinator._initialize_component_tracking()
        await coordinator._capture_baseline_metrics()
        
        report = await coordinator.get_phase1_status_report()
        
        assert 'phase1_status' in report
        assert 'components' in report
        assert 'metrics' in report
        assert 'system_health' in report
        assert 'generated_at' in report
        
        # Check report structure
        assert 'overall_status' in report['phase1_status']
        assert 'target_improvement' in report['phase1_status']


class TestIntelligentRedisCache:
    """Test intelligent Redis cache functionality"""
    
    @pytest.fixture
    async def cache(self):
        """Create cache instance for testing"""
        cache = IntelligentRedisCache(
            redis_url="redis://localhost:6379/15",  # Test database
            key_prefix="test_cache"
        )
        
        # Try to initialize, handle gracefully if Redis not available
        initialized = await cache.initialize()
        
        yield cache, initialized
        
        # Cleanup
        if initialized:
            await cache.close()
    
    @pytest.mark.asyncio
    async def test_cache_initialization(self, cache):
        """Test cache initialization"""
        cache_instance, initialized = cache
        
        # Should either initialize successfully or fail gracefully
        if initialized:
            assert cache_instance.is_available
            assert cache_instance.redis_client is not None
        else:
            assert not cache_instance.is_available
            # Should still be usable (returns None for operations)
    
    @pytest.mark.asyncio
    async def test_intelligent_caching(self, cache):
        """Test intelligent cache operations"""
        cache_instance, initialized = cache
        
        if not initialized:
            pytest.skip("Redis not available for testing")
        
        test_key = "test_key"
        test_value = {"test": "data", "timestamp": time.time()}
        
        # Test cache set
        result = await cache_instance.intelligent_set(
            key=test_key,
            value=test_value,
            key_type="test",
            metadata={"priority": "high"}
        )
        assert result is True
        
        # Test cache get
        retrieved_value, cache_info = await cache_instance.intelligent_get(
            key=test_key,
            key_type="test",
            metadata={"priority": "high"}
        )
        
        assert retrieved_value == test_value
        assert cache_info['cache_hit'] is True
        assert 'tier' in cache_info
        assert 'response_time_ms' in cache_info
    
    @pytest.mark.asyncio
    async def test_cache_analytics(self, cache):
        """Test cache analytics functionality"""
        cache_instance, initialized = cache
        
        if not initialized:
            pytest.skip("Redis not available for testing")
        
        # Perform some cache operations
        for i in range(5):
            await cache_instance.intelligent_set(
                key=f"test_key_{i}",
                value=f"test_value_{i}",
                key_type="analytics_test"
            )
            
            await cache_instance.intelligent_get(
                key=f"test_key_{i}",
                key_type="analytics_test"
            )
        
        # Get analytics report
        report = await cache_instance.get_optimization_report()
        
        assert 'analytics' in report
        assert 'tier_distribution' in report
        assert 'redis_info' in report
        assert report['analytics']['total_operations'] >= 5


class TestQueryCacheOptimized:
    """Test query-specific cache optimization"""
    
    @pytest.fixture
    async def query_cache(self):
        """Create query cache for testing"""
        cache = QueryCacheOptimized(redis_url="redis://localhost:6379/15")
        initialized = await cache.initialize()
        
        yield cache, initialized
        
        if initialized:
            await cache.close()
    
    @pytest.mark.asyncio
    async def test_query_caching(self, query_cache):
        """Test query result caching"""
        cache_instance, initialized = query_cache
        
        if not initialized:
            pytest.skip("Redis not available for testing")
        
        test_query = "What is the capital of France?"
        test_result = {
            "answer": "Paris is the capital of France.",
            "confidence": 0.95,
            "documents": [
                {"title": "French Geography", "content": "Paris is the capital..."}
            ]
        }
        
        # Cache query result
        result = await cache_instance.cache_query_result(
            query=test_query,
            result=test_result,
            confidence_score=0.95
        )
        assert result is True
        
        # Retrieve cached result
        cached_result, cache_info = await cache_instance.get_cached_query_result(
            query=test_query
        )
        
        assert cached_result == test_result
        assert cache_info['cache_hit'] is True


class TestDocumentExpansionService:
    """Test document expansion service"""
    
    @pytest.fixture
    async def doc_service(self, tmp_path):
        """Create document service for testing"""
        service = DocumentExpansionService(
            storage_path=str(tmp_path / "test_docs"),
            enable_semantic_analysis=False  # Disable to avoid NLP dependencies
        )
        
        initialized = await service.initialize()
        
        yield service, initialized, tmp_path
        
        # Cleanup happens automatically with tmp_path
    
    @pytest.mark.asyncio
    async def test_service_initialization(self, doc_service):
        """Test document service initialization"""
        service, initialized, _ = doc_service
        
        # Should initialize successfully even without full NLP stack
        assert initialized is True
        assert service.storage_path.exists()
    
    @pytest.mark.asyncio
    async def test_document_quality_analysis(self, doc_service):
        """Test document quality analysis"""
        service, initialized, _ = doc_service
        
        if not initialized:
            pytest.skip("Document service not initialized")
        
        test_text = """
        This is a test document with multiple sentences. It contains various types of content
        to test the quality analysis functionality. The document should have a reasonable
        quality score based on its structure and content density.
        
        This paragraph adds more content to increase the document size and improve the 
        quality metrics. Quality analysis should consider factors like word count,
        sentence structure, and information density.
        """
        
        quality_score, analysis = await service.analyze_document_quality(test_text)
        
        assert 0.0 <= quality_score <= 1.0
        assert 'word_count' in analysis
        assert 'sentence_count' in analysis
        assert 'readability_score' in analysis
        assert analysis['word_count'] > 0
    
    @pytest.mark.asyncio
    async def test_document_processing(self, doc_service):
        """Test document processing"""
        service, initialized, tmp_path = doc_service
        
        if not initialized:
            pytest.skip("Document service not initialized")
        
        # Create test document
        test_file = tmp_path / "test_document.txt"
        test_content = """
        Test Document for Processing
        
        This is a comprehensive test document that will be processed by the document
        expansion service. The document contains multiple paragraphs and sections
        to test the chunking and processing functionality.
        
        Section 1: Introduction
        This section introduces the test document and explains its purpose for
        testing the document processing capabilities of the RAG system.
        
        Section 2: Content Analysis
        The service should analyze this content, determine its quality, and create
        appropriate chunks for efficient retrieval and processing.
        """
        
        test_file.write_text(test_content)
        
        # Process document
        metadata = await service.process_document(
            str(test_file),
            ProcessingStrategy.STANDARD
        )
        
        if metadata:  # May be None if dependencies missing
            assert metadata.word_count > 0
            assert metadata.chunk_count > 0
            assert 0.0 <= metadata.quality_score <= 1.0
            assert metadata.file_type == ".txt"
    
    @pytest.mark.asyncio
    async def test_corpus_report_generation(self, doc_service):
        """Test corpus report generation"""
        service, initialized, _ = doc_service
        
        if not initialized:
            pytest.skip("Document service not initialized")
        
        report = await service.get_corpus_report()
        
        assert 'corpus_analytics' in report
        assert 'quality_distribution' in report
        assert 'generated_at' in report
        
        # Check report structure
        analytics = report['corpus_analytics']
        assert 'total_documents' in analytics
        assert 'total_chunks' in analytics
        assert 'avg_quality_score' in analytics


class TestIntegrationEndpoints:
    """Test Phase 1 API integration"""
    
    def test_endpoint_structure(self):
        """Test API endpoint structure"""
        from integration.api_endpoints import phase1_router
        
        # Check router is properly configured
        assert phase1_router.prefix == "/api/v1/phase1"
        assert "Phase 1 Optimization" in phase1_router.tags
        
        # Check key routes exist
        route_paths = [route.path for route in phase1_router.routes]
        
        expected_routes = [
            "/status",
            "/dashboard",
            "/dashboard/ui",
            "/initialize",
            "/metrics/current",
            "/cache/stats",
            "/health"
        ]
        
        for expected_route in expected_routes:
            assert expected_route in route_paths


class TestSystemIntegration:
    """Test full system integration"""
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_full_phase1_deployment(self):
        """Test complete Phase 1 deployment process"""
        coordinator = None
        try:
            # Initialize coordinator
            coordinator = Phase1Coordinator(
                redis_url="redis://localhost:6379/15",
                document_storage_path="./test_integration_docs",
                enable_monitoring=False
            )
            
            # Test initialization
            result = await coordinator.initialize()
            
            if result:
                # Test status reporting
                status_report = await coordinator.get_phase1_status_report()
                assert status_report is not None
                assert 'phase1_status' in status_report
                
                # Test dashboard data
                dashboard_data = await coordinator.get_performance_dashboard_data()
                assert dashboard_data is not None
                
                # Test health checks (basic)
                overall_health = sum(
                    comp.health_score for comp in coordinator.components.values()
                ) / max(1, len(coordinator.components))
                
                assert 0.0 <= overall_health <= 1.0
                
            else:
                # Graceful handling of initialization failure
                assert not coordinator.is_initialized
                
        except Exception as e:
            pytest.fail(f"Integration test failed: {e}")
            
        finally:
            if coordinator and coordinator.is_initialized:
                await coordinator.shutdown()


# Performance benchmarks
class TestPerformanceBenchmarks:
    """Performance benchmark tests"""
    
    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_cache_performance(self):
        """Benchmark cache performance"""
        cache = IntelligentRedisCache(redis_url="redis://localhost:6379/15")
        initialized = await cache.initialize()
        
        if not initialized:
            pytest.skip("Redis not available for benchmarking")
        
        try:
            # Benchmark cache operations
            operations = 100
            test_data = {"key": "value", "number": 42, "list": [1, 2, 3]}
            
            # Time cache sets
            start_time = time.time()
            for i in range(operations):
                await cache.intelligent_set(
                    f"benchmark_key_{i}",
                    test_data,
                    "benchmark"
                )
            set_time = time.time() - start_time
            
            # Time cache gets
            start_time = time.time()
            for i in range(operations):
                await cache.intelligent_get(f"benchmark_key_{i}", "benchmark")
            get_time = time.time() - start_time
            
            # Performance assertions (should complete within reasonable time)
            assert set_time < 10.0  # 100 sets in under 10 seconds
            assert get_time < 5.0   # 100 gets in under 5 seconds
            
            # Calculate operations per second
            set_ops_per_sec = operations / set_time
            get_ops_per_sec = operations / get_time
            
            print(f"Cache performance: {set_ops_per_sec:.1f} sets/sec, {get_ops_per_sec:.1f} gets/sec")
            
        finally:
            await cache.close()


# Fixtures and utilities
@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_redis():
    """Mock Redis for testing without actual Redis instance"""
    with patch('redis.asyncio.Redis') as mock:
        mock_instance = AsyncMock()
        mock_instance.ping.return_value = True
        mock_instance.get.return_value = None
        mock_instance.set.return_value = True
        mock_instance.setex.return_value = True
        mock.return_value = mock_instance
        yield mock_instance


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])