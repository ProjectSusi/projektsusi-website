"""
Comprehensive Load Testing Suite for Phase 2 RAG System
Advanced performance testing with concurrent users, stress testing, and performance validation
"""

import asyncio
import aiohttp
import time
import json
import statistics
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import random
import logging
from contextlib import asynccontextmanager
import argparse
import sys
import os
from datetime import datetime, timedelta
import psutil
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

@dataclass
class LoadTestConfig:
    """Configuration for load testing parameters"""
    base_url: str = "https://rag.sirth.ch"
    concurrent_users: int = 50
    requests_per_user: int = 20
    ramp_up_time: int = 60  # seconds
    test_duration: int = 300  # seconds
    request_timeout: float = 30.0
    think_time_min: float = 1.0  # seconds between requests
    think_time_max: float = 5.0
    target_response_time: float = 0.080  # 80ms target
    target_success_rate: float = 0.99  # 99% success rate
    enable_monitoring: bool = True
    output_dir: str = "load_test_results"

@dataclass
class TestResult:
    """Individual test result data"""
    timestamp: float
    response_time: float
    status_code: int
    success: bool
    error_message: Optional[str] = None
    request_type: str = "search"
    user_id: int = 0
    payload_size: int = 0
    response_size: int = 0

class PerformanceMetrics:
    """Collect and analyze performance metrics"""
    
    def __init__(self):
        self.results: List[TestResult] = []
        self.system_metrics: List[Dict] = []
        self.lock = threading.Lock()
        self.start_time = time.time()
    
    def add_result(self, result: TestResult):
        """Add test result thread-safely"""
        with self.lock:
            self.results.append(result)
    
    def add_system_metrics(self, metrics: Dict):
        """Add system metrics"""
        with self.lock:
            self.system_metrics.append(metrics)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Calculate comprehensive performance statistics"""
        if not self.results:
            return {}
        
        response_times = [r.response_time for r in self.results]
        successful_results = [r for r in self.results if r.success]
        failed_results = [r for r in self.results if not r.success]
        
        total_requests = len(self.results)
        successful_requests = len(successful_results)
        failed_requests = len(failed_results)
        
        success_rate = successful_requests / total_requests if total_requests > 0 else 0
        
        # Response time statistics
        avg_response_time = statistics.mean(response_times) if response_times else 0
        median_response_time = statistics.median(response_times) if response_times else 0
        min_response_time = min(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        
        # Percentiles
        p50 = np.percentile(response_times, 50) if response_times else 0
        p90 = np.percentile(response_times, 90) if response_times else 0
        p95 = np.percentile(response_times, 95) if response_times else 0
        p99 = np.percentile(response_times, 99) if response_times else 0
        
        # Throughput calculation
        test_duration = max([r.timestamp for r in self.results]) - min([r.timestamp for r in self.results])
        throughput = total_requests / test_duration if test_duration > 0 else 0
        
        # Error analysis
        error_types = {}
        for result in failed_results:
            error_key = f"{result.status_code}_{result.error_message}"
            error_types[error_key] = error_types.get(error_key, 0) + 1
        
        return {
            'summary': {
                'total_requests': total_requests,
                'successful_requests': successful_requests,
                'failed_requests': failed_requests,
                'success_rate': success_rate,
                'test_duration': test_duration,
                'throughput_rps': throughput
            },
            'response_times': {
                'average': avg_response_time,
                'median': median_response_time,
                'min': min_response_time,
                'max': max_response_time,
                'p50': p50,
                'p90': p90,
                'p95': p95,
                'p99': p99,
                'standard_deviation': statistics.stdev(response_times) if len(response_times) > 1 else 0
            },
            'errors': error_types,
            'performance_targets': {
                'response_time_target_met': p95 <= 80.0,  # 95th percentile under 80ms
                'success_rate_target_met': success_rate >= 0.99,
                'throughput_sufficient': throughput >= 10.0  # Minimum 10 RPS
            }
        }

class SystemMonitor:
    """Monitor system resources during load testing"""
    
    def __init__(self, metrics: PerformanceMetrics, interval: float = 5.0):
        self.metrics = metrics
        self.interval = interval
        self.monitoring = False
        self.monitor_thread = None
    
    def start_monitoring(self):
        """Start system monitoring in background thread"""
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop)
        self.monitor_thread.start()
    
    def stop_monitoring(self):
        """Stop system monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join()
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.monitoring:
            try:
                # CPU and Memory
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                
                # Disk I/O
                disk_io = psutil.disk_io_counters()
                
                # Network I/O
                network_io = psutil.net_io_counters()
                
                metrics_data = {
                    'timestamp': time.time(),
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_used_mb': memory.used / 1024 / 1024,
                    'memory_available_mb': memory.available / 1024 / 1024,
                    'disk_read_mb': disk_io.read_bytes / 1024 / 1024 if disk_io else 0,
                    'disk_write_mb': disk_io.write_bytes / 1024 / 1024 if disk_io else 0,
                    'network_sent_mb': network_io.bytes_sent / 1024 / 1024 if network_io else 0,
                    'network_recv_mb': network_io.bytes_recv / 1024 / 1024 if network_io else 0
                }
                
                self.metrics.add_system_metrics(metrics_data)
                
                time.sleep(self.interval)
                
            except Exception as e:
                logging.error(f"Error in system monitoring: {e}")

class RAGLoadTester:
    """Main load testing orchestrator"""
    
    def __init__(self, config: LoadTestConfig):
        self.config = config
        self.metrics = PerformanceMetrics()
        self.system_monitor = SystemMonitor(self.metrics)
        self.session_pool = []
        self.test_data = self._generate_test_data()
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def _generate_test_data(self) -> List[str]:
        """Generate realistic test queries"""
        queries = [
            "What is machine learning?",
            "How does artificial intelligence work?",
            "Explain natural language processing",
            "What are the benefits of cloud computing?",
            "How to optimize database performance?",
            "What is DevOps methodology?",
            "Explain microservices architecture",
            "How does blockchain technology work?",
            "What is quantum computing?",
            "Explain cybersecurity best practices",
            "How to implement CI/CD pipelines?",
            "What are REST API design principles?",
            "Explain containerization with Docker",
            "How does Kubernetes orchestration work?",
            "What is edge computing?",
            # Add more varied queries
            "Deep learning neural networks explained",
            "Best practices for software testing",
            "How to scale web applications",
            "Database indexing optimization strategies",
            "Modern authentication methods",
        ]
        
        # Generate variations and longer queries
        extended_queries = queries.copy()
        for query in queries:
            # Add more specific variations
            extended_queries.extend([
                f"Can you provide detailed information about {query.lower()}?",
                f"What are the key concepts in {query.lower()}?",
                f"Give me examples of {query.lower()}",
                f"How can I learn more about {query.lower()}?"
            ])
        
        return extended_queries
    
    async def create_session_pool(self):
        """Create pool of HTTP sessions for concurrent testing"""
        connector_limit = min(self.config.concurrent_users * 2, 200)
        
        connector = aiohttp.TCPConnector(
            limit=connector_limit,
            limit_per_host=50,
            ttl_dns_cache=300,
            use_dns_cache=True,
            keepalive_timeout=30
        )
        
        timeout = aiohttp.ClientTimeout(
            total=self.config.request_timeout,
            connect=10.0
        )
        
        session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'User-Agent': 'RAG-LoadTest/1.0'}
        )
        
        return session
    
    async def make_search_request(self, session: aiohttp.ClientSession, 
                                query: str, user_id: int) -> TestResult:
        """Make a single search request and record metrics"""
        start_time = time.time()
        request_timestamp = start_time
        
        try:
            payload = {
                'query': query,
                'max_results': 10,
                'include_metadata': True
            }
            
            payload_size = len(json.dumps(payload).encode('utf-8'))
            
            async with session.post(
                f"{self.config.base_url}/api/search",
                json=payload
            ) as response:
                response_data = await response.text()
                response_size = len(response_data.encode('utf-8'))
                response_time = time.time() - start_time
                
                success = 200 <= response.status < 300
                
                return TestResult(
                    timestamp=request_timestamp,
                    response_time=response_time,
                    status_code=response.status,
                    success=success,
                    error_message=None if success else f"HTTP {response.status}",
                    request_type="search",
                    user_id=user_id,
                    payload_size=payload_size,
                    response_size=response_size
                )
                
        except asyncio.TimeoutError:
            return TestResult(
                timestamp=request_timestamp,
                response_time=time.time() - start_time,
                status_code=408,
                success=False,
                error_message="Request timeout",
                request_type="search",
                user_id=user_id
            )
        except Exception as e:
            return TestResult(
                timestamp=request_timestamp,
                response_time=time.time() - start_time,
                status_code=500,
                success=False,
                error_message=str(e),
                request_type="search",
                user_id=user_id
            )
    
    async def simulate_user(self, session: aiohttp.ClientSession, user_id: int):
        """Simulate single user behavior with realistic patterns"""
        self.logger.info(f"Starting user {user_id}")
        
        for request_num in range(self.config.requests_per_user):
            # Select random query
            query = random.choice(self.test_data)
            
            # Make request
            result = await self.make_search_request(session, query, user_id)
            self.metrics.add_result(result)
            
            # Log progress periodically
            if request_num % 5 == 0:
                self.logger.info(f"User {user_id}: completed {request_num + 1}/{self.config.requests_per_user} requests")
            
            # Think time between requests (except for last request)
            if request_num < self.config.requests_per_user - 1:
                think_time = random.uniform(
                    self.config.think_time_min,
                    self.config.think_time_max
                )
                await asyncio.sleep(think_time)
        
        self.logger.info(f"User {user_id} completed all requests")
    
    async def run_load_test(self):
        """Execute the complete load test scenario"""
        self.logger.info(f"Starting load test with {self.config.concurrent_users} users")
        self.logger.info(f"Target response time: {self.config.target_response_time * 1000}ms")
        self.logger.info(f"Test duration: {self.config.test_duration}s")
        
        # Start system monitoring
        if self.config.enable_monitoring:
            self.system_monitor.start_monitoring()
        
        # Create session pool
        session = await self.create_session_pool()
        
        try:
            # Create user simulation tasks with ramp-up
            tasks = []
            ramp_up_delay = self.config.ramp_up_time / self.config.concurrent_users
            
            for user_id in range(self.config.concurrent_users):
                # Stagger user starts for realistic ramp-up
                if user_id > 0:
                    await asyncio.sleep(ramp_up_delay)
                
                task = asyncio.create_task(
                    self.simulate_user(session, user_id)
                )
                tasks.append(task)
            
            # Wait for all users to complete or timeout
            try:
                await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=self.config.test_duration
                )
            except asyncio.TimeoutError:
                self.logger.warning(f"Test timed out after {self.config.test_duration}s")
                # Cancel remaining tasks
                for task in tasks:
                    task.cancel()
        
        finally:
            await session.close()
            if self.config.enable_monitoring:
                self.system_monitor.stop_monitoring()
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report"""
        stats = self.metrics.get_statistics()
        
        # Add test configuration to report
        stats['test_config'] = {
            'concurrent_users': self.config.concurrent_users,
            'requests_per_user': self.config.requests_per_user,
            'target_response_time_ms': self.config.target_response_time * 1000,
            'target_success_rate': self.config.target_success_rate,
            'base_url': self.config.base_url
        }
        
        # Performance assessment
        response_times = stats.get('response_times', {})
        summary = stats.get('summary', {})
        targets = stats.get('performance_targets', {})
        
        assessment = {
            'overall_grade': 'PASS' if all(targets.values()) else 'FAIL',
            'response_time_grade': 'PASS' if targets.get('response_time_target_met', False) else 'FAIL',
            'reliability_grade': 'PASS' if targets.get('success_rate_target_met', False) else 'FAIL',
            'throughput_grade': 'PASS' if targets.get('throughput_sufficient', False) else 'FAIL'
        }
        
        stats['assessment'] = assessment
        
        return stats
    
    def save_results(self, report: Dict[str, Any]):
        """Save test results to files"""
        os.makedirs(self.config.output_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save JSON report
        report_file = os.path.join(
            self.config.output_dir, 
            f'load_test_report_{timestamp}.json'
        )
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        # Save detailed results CSV
        if self.metrics.results:
            df = pd.DataFrame([
                {
                    'timestamp': r.timestamp,
                    'response_time': r.response_time,
                    'status_code': r.status_code,
                    'success': r.success,
                    'error_message': r.error_message,
                    'user_id': r.user_id,
                    'payload_size': r.payload_size,
                    'response_size': r.response_size
                }
                for r in self.metrics.results
            ])
            
            csv_file = os.path.join(
                self.config.output_dir,
                f'load_test_results_{timestamp}.csv'
            )
            df.to_csv(csv_file, index=False)
        
        self.logger.info(f"Results saved to {self.config.output_dir}")
        return report_file
    
    def create_performance_charts(self, report: Dict[str, Any]):
        """Generate performance visualization charts"""
        if not self.metrics.results:
            return
        
        os.makedirs(self.config.output_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Response time over time chart
        plt.figure(figsize=(12, 8))
        
        timestamps = [r.timestamp - self.metrics.start_time for r in self.metrics.results]
        response_times = [r.response_time * 1000 for r in self.metrics.results]  # Convert to ms
        
        plt.subplot(2, 2, 1)
        plt.scatter(timestamps, response_times, alpha=0.6, s=2)
        plt.axhline(y=self.config.target_response_time * 1000, color='r', linestyle='--', label='Target')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Response Time (ms)')
        plt.title('Response Time Over Time')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Response time distribution
        plt.subplot(2, 2, 2)
        plt.hist(response_times, bins=50, alpha=0.7, edgecolor='black')
        plt.axvline(x=self.config.target_response_time * 1000, color='r', linestyle='--', label='Target')
        plt.xlabel('Response Time (ms)')
        plt.ylabel('Frequency')
        plt.title('Response Time Distribution')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Success rate over time
        if len(timestamps) > 10:
            window_size = max(10, len(timestamps) // 20)
            success_rates = []
            time_windows = []
            
            for i in range(0, len(self.metrics.results) - window_size + 1, window_size // 2):
                window_results = self.metrics.results[i:i + window_size]
                success_rate = sum(1 for r in window_results if r.success) / len(window_results)
                success_rates.append(success_rate * 100)
                time_windows.append(timestamps[i + window_size // 2])
            
            plt.subplot(2, 2, 3)
            plt.plot(time_windows, success_rates, marker='o')
            plt.axhline(y=self.config.target_success_rate * 100, color='r', linestyle='--', label='Target')
            plt.xlabel('Time (seconds)')
            plt.ylabel('Success Rate (%)')
            plt.title('Success Rate Over Time')
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.ylim(0, 105)
        
        # System metrics if available
        if self.metrics.system_metrics:
            system_timestamps = [(m['timestamp'] - self.metrics.start_time) for m in self.metrics.system_metrics]
            cpu_usage = [m['cpu_percent'] for m in self.metrics.system_metrics]
            
            plt.subplot(2, 2, 4)
            plt.plot(system_timestamps, cpu_usage, marker='o', markersize=2)
            plt.xlabel('Time (seconds)')
            plt.ylabel('CPU Usage (%)')
            plt.title('System CPU Usage')
            plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        chart_file = os.path.join(
            self.config.output_dir,
            f'load_test_charts_{timestamp}.png'
        )
        plt.savefig(chart_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        self.logger.info(f"Performance charts saved to {chart_file}")

async def main():
    """Main load testing execution"""
    parser = argparse.ArgumentParser(description='RAG System Load Testing')
    parser.add_argument('--url', default='https://rag.sirth.ch', help='Base URL for testing')
    parser.add_argument('--users', type=int, default=50, help='Number of concurrent users')
    parser.add_argument('--requests', type=int, default=20, help='Requests per user')
    parser.add_argument('--duration', type=int, default=300, help='Test duration in seconds')
    parser.add_argument('--target-time', type=float, default=0.080, help='Target response time in seconds')
    parser.add_argument('--output-dir', default='load_test_results', help='Output directory')
    
    args = parser.parse_args()
    
    config = LoadTestConfig(
        base_url=args.url,
        concurrent_users=args.users,
        requests_per_user=args.requests,
        test_duration=args.duration,
        target_response_time=args.target_time,
        output_dir=args.output_dir
    )
    
    tester = RAGLoadTester(config)
    
    print(f"🚀 Starting load test against {config.base_url}")
    print(f"📊 Configuration: {config.concurrent_users} users, {config.requests_per_user} requests each")
    print(f"🎯 Target: {config.target_response_time * 1000}ms response time, {config.target_success_rate * 100}% success rate")
    
    start_time = time.time()
    
    try:
        await tester.run_load_test()
        
        # Generate and save report
        report = tester.generate_report()
        report_file = tester.save_results(report)
        tester.create_performance_charts(report)
        
        # Print summary
        summary = report.get('summary', {})
        response_times = report.get('response_times', {})
        assessment = report.get('assessment', {})
        
        total_time = time.time() - start_time
        
        print(f"\n📋 LOAD TEST RESULTS")
        print(f"=" * 50)
        print(f"Overall Grade: {assessment.get('overall_grade', 'UNKNOWN')}")
        print(f"Total Requests: {summary.get('total_requests', 0)}")
        print(f"Success Rate: {summary.get('success_rate', 0) * 100:.1f}%")
        print(f"Average Response Time: {response_times.get('average', 0) * 1000:.1f}ms")
        print(f"95th Percentile: {response_times.get('p95', 0) * 1000:.1f}ms")
        print(f"Throughput: {summary.get('throughput_rps', 0):.1f} RPS")
        print(f"Test Duration: {total_time:.1f}s")
        print(f"Report saved: {report_file}")
        
        # Exit with appropriate code
        sys.exit(0 if assessment.get('overall_grade') == 'PASS' else 1)
        
    except Exception as e:
        print(f"❌ Load test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())