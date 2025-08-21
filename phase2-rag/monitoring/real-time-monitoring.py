"""
Real-time Performance Monitoring for Phase 2 RAG System
Advanced monitoring with automated alerting, rollback triggers, and performance tracking
"""

import asyncio
import time
import json
import logging
import threading
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque, defaultdict
import statistics
import redis
import psutil
import requests
from prometheus_client import Gauge, Counter, Histogram, start_http_server
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import websockets
import aiohttp

@dataclass
class MonitoringConfig:
    """Configuration for monitoring system"""
    api_endpoint: str = "https://rag.sirth.ch/api"
    check_interval: float = 5.0  # seconds
    alert_threshold_response_time: float = 0.100  # 100ms
    alert_threshold_error_rate: float = 0.05  # 5%
    alert_threshold_cpu: float = 80.0  # 80%
    alert_threshold_memory: float = 85.0  # 85%
    rollback_threshold_response_time: float = 0.150  # 150ms
    rollback_threshold_error_rate: float = 0.15  # 15%
    rollback_consecutive_failures: int = 5
    history_window: int = 300  # 5 minutes in seconds
    redis_host: str = "localhost"
    redis_port: int = 6379
    prometheus_port: int = 9090
    webhook_urls: List[str] = field(default_factory=list)
    email_config: Optional[Dict[str, str]] = None

@dataclass
class PerformanceMetric:
    """Individual performance measurement"""
    timestamp: float
    response_time: float
    status_code: int
    error_message: Optional[str] = None
    endpoint: str = "/"
    method: str = "GET"
    user_agent: str = "monitor"

class MetricStorage:
    """Thread-safe storage for performance metrics"""
    
    def __init__(self, max_size: int = 10000):
        self.metrics = deque(maxlen=max_size)
        self.lock = threading.Lock()
        self.redis_client = None
    
    def connect_redis(self, host: str, port: int):
        """Connect to Redis for persistent storage"""
        try:
            self.redis_client = redis.Redis(host=host, port=port, decode_responses=True)
            self.redis_client.ping()
            logging.info("Connected to Redis for metric storage")
        except Exception as e:
            logging.warning(f"Could not connect to Redis: {e}")
            self.redis_client = None
    
    def add_metric(self, metric: PerformanceMetric):
        """Add performance metric to storage"""
        with self.lock:
            self.metrics.append(metric)
        
        # Store in Redis if available
        if self.redis_client:
            try:
                metric_data = {
                    'timestamp': metric.timestamp,
                    'response_time': metric.response_time,
                    'status_code': metric.status_code,
                    'endpoint': metric.endpoint,
                    'error': metric.error_message or ""
                }
                
                # Store with expiration
                key = f"perf_metric:{int(metric.timestamp * 1000)}"
                self.redis_client.setex(key, 3600, json.dumps(metric_data))  # 1 hour TTL
                
            except Exception as e:
                logging.error(f"Failed to store metric in Redis: {e}")
    
    def get_recent_metrics(self, window_seconds: int = 300) -> List[PerformanceMetric]:
        """Get metrics from recent time window"""
        cutoff_time = time.time() - window_seconds
        
        with self.lock:
            return [m for m in self.metrics if m.timestamp >= cutoff_time]
    
    def get_statistics(self, window_seconds: int = 300) -> Dict[str, Any]:
        """Calculate performance statistics for time window"""
        recent_metrics = self.get_recent_metrics(window_seconds)
        
        if not recent_metrics:
            return {}
        
        response_times = [m.response_time for m in recent_metrics]
        success_count = sum(1 for m in recent_metrics if 200 <= m.status_code < 300)
        error_count = len(recent_metrics) - success_count
        
        return {
            'total_requests': len(recent_metrics),
            'success_count': success_count,
            'error_count': error_count,
            'error_rate': error_count / len(recent_metrics),
            'avg_response_time': statistics.mean(response_times),
            'median_response_time': statistics.median(response_times),
            'p95_response_time': statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times),
            'min_response_time': min(response_times),
            'max_response_time': max(response_times)
        }

class PrometheusMetrics:
    """Prometheus metrics for monitoring integration"""
    
    def __init__(self):
        # Response time histogram
        self.response_time_histogram = Histogram(
            'rag_response_time_seconds',
            'RAG API response time in seconds',
            ['endpoint', 'method', 'status']
        )
        
        # Request counter
        self.request_counter = Counter(
            'rag_requests_total',
            'Total number of RAG API requests',
            ['endpoint', 'method', 'status']
        )
        
        # Error rate gauge
        self.error_rate_gauge = Gauge(
            'rag_error_rate',
            'Current error rate as a percentage'
        )
        
        # System metrics
        self.cpu_usage_gauge = Gauge(
            'system_cpu_usage_percent',
            'Current CPU usage percentage'
        )
        
        self.memory_usage_gauge = Gauge(
            'system_memory_usage_percent',
            'Current memory usage percentage'
        )
        
        # Cache metrics
        self.cache_hit_rate_gauge = Gauge(
            'rag_cache_hit_rate',
            'Cache hit rate percentage'
        )
        
        # Active connections
        self.active_connections_gauge = Gauge(
            'rag_active_connections',
            'Number of active connections'
        )
    
    def record_request(self, metric: PerformanceMetric):
        """Record a request metric"""
        status_class = f"{metric.status_code // 100}xx"
        
        self.response_time_histogram.labels(
            endpoint=metric.endpoint,
            method=metric.method,
            status=status_class
        ).observe(metric.response_time)
        
        self.request_counter.labels(
            endpoint=metric.endpoint,
            method=metric.method,
            status=status_class
        ).inc()
    
    def update_error_rate(self, error_rate: float):
        """Update error rate gauge"""
        self.error_rate_gauge.set(error_rate * 100)
    
    def update_system_metrics(self, cpu_percent: float, memory_percent: float):
        """Update system resource metrics"""
        self.cpu_usage_gauge.set(cpu_percent)
        self.memory_usage_gauge.set(memory_percent)

class AlertManager:
    """Manage alerts and notifications"""
    
    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.alert_history = deque(maxlen=1000)
        self.alert_cooldown = defaultdict(float)  # Prevent alert spam
        self.cooldown_period = 300  # 5 minutes
    
    def should_send_alert(self, alert_type: str) -> bool:
        """Check if alert should be sent based on cooldown"""
        last_sent = self.alert_cooldown.get(alert_type, 0)
        return time.time() - last_sent > self.cooldown_period
    
    def send_alert(self, alert_type: str, message: str, severity: str = "WARNING"):
        """Send alert through configured channels"""
        if not self.should_send_alert(alert_type):
            return
        
        alert_data = {
            'timestamp': datetime.now().isoformat(),
            'type': alert_type,
            'severity': severity,
            'message': message
        }
        
        self.alert_history.append(alert_data)
        self.alert_cooldown[alert_type] = time.time()
        
        logging.warning(f"ALERT [{severity}] {alert_type}: {message}")
        
        # Send to webhook URLs
        self._send_webhook_alerts(alert_data)
        
        # Send email if configured
        if self.config.email_config:
            self._send_email_alert(alert_data)
    
    def _send_webhook_alerts(self, alert_data: Dict[str, Any]):
        """Send alerts to webhook URLs"""
        for webhook_url in self.config.webhook_urls:
            try:
                requests.post(
                    webhook_url,
                    json=alert_data,
                    timeout=5.0,
                    headers={'Content-Type': 'application/json'}
                )
            except Exception as e:
                logging.error(f"Failed to send webhook alert to {webhook_url}: {e}")
    
    def _send_email_alert(self, alert_data: Dict[str, Any]):
        """Send email alert"""
        try:
            email_config = self.config.email_config
            
            msg = MimeMultipart()
            msg['From'] = email_config['from']
            msg['To'] = email_config['to']
            msg['Subject'] = f"RAG System Alert: {alert_data['type']}"
            
            body = f"""
            RAG System Alert
            
            Type: {alert_data['type']}
            Severity: {alert_data['severity']}
            Time: {alert_data['timestamp']}
            
            Message: {alert_data['message']}
            
            Please check the monitoring dashboard for more details.
            """
            
            msg.attach(MimeText(body, 'plain'))
            
            server = smtplib.SMTP(email_config['smtp_host'], email_config.get('smtp_port', 587))
            server.starttls()
            server.login(email_config['username'], email_config['password'])
            server.send_message(msg)
            server.quit()
            
        except Exception as e:
            logging.error(f"Failed to send email alert: {e}")

class PerformanceMonitor:
    """Main performance monitoring system"""
    
    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.storage = MetricStorage()
        self.prometheus = PrometheusMetrics()
        self.alert_manager = AlertManager(config)
        self.monitoring_active = False
        self.rollback_callback: Optional[Callable] = None
        self.consecutive_failures = 0
        
        # WebSocket connections for real-time updates
        self.websocket_clients = set()
        
        # Setup storage
        self.storage.connect_redis(config.redis_host, config.redis_port)
    
    def set_rollback_callback(self, callback: Callable):
        """Set callback function for automated rollback"""
        self.rollback_callback = callback
    
    async def start_monitoring(self):
        """Start the monitoring system"""
        self.monitoring_active = True
        
        # Start Prometheus metrics server
        start_http_server(self.config.prometheus_port)
        logging.info(f"Prometheus metrics server started on port {self.config.prometheus_port}")
        
        # Start monitoring tasks
        tasks = [
            asyncio.create_task(self._monitor_api_health()),
            asyncio.create_task(self._monitor_system_resources()),
            asyncio.create_task(self._check_alert_conditions()),
            asyncio.create_task(self._websocket_server())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except Exception as e:
            logging.error(f"Monitoring error: {e}")
        finally:
            self.monitoring_active = False
    
    def stop_monitoring(self):
        """Stop monitoring system"""
        self.monitoring_active = False
    
    async def _monitor_api_health(self):
        """Monitor API endpoint health"""
        async with aiohttp.ClientSession() as session:
            while self.monitoring_active:
                try:
                    start_time = time.time()
                    
                    # Health check request
                    async with session.get(
                        f"{self.config.api_endpoint}/health",
                        timeout=aiohttp.ClientTimeout(total=10.0)
                    ) as response:
                        response_time = time.time() - start_time
                        
                        metric = PerformanceMetric(
                            timestamp=start_time,
                            response_time=response_time,
                            status_code=response.status,
                            endpoint="/health",
                            method="GET"
                        )
                        
                        self.storage.add_metric(metric)
                        self.prometheus.record_request(metric)
                        
                        # Broadcast to WebSocket clients
                        await self._broadcast_metric(metric)
                
                except Exception as e:
                    error_metric = PerformanceMetric(
                        timestamp=time.time(),
                        response_time=10.0,  # Timeout value
                        status_code=500,
                        error_message=str(e),
                        endpoint="/health",
                        method="GET"
                    )
                    
                    self.storage.add_metric(error_metric)
                    self.prometheus.record_request(error_metric)
                    
                    logging.error(f"API health check failed: {e}")
                
                await asyncio.sleep(self.config.check_interval)
    
    async def _monitor_system_resources(self):
        """Monitor system resource usage"""
        while self.monitoring_active:
            try:
                # CPU usage
                cpu_percent = psutil.cpu_percent(interval=1)
                
                # Memory usage
                memory = psutil.virtual_memory()
                memory_percent = memory.percent
                
                # Update Prometheus metrics
                self.prometheus.update_system_metrics(cpu_percent, memory_percent)
                
                # Broadcast system metrics
                system_data = {
                    'type': 'system_metrics',
                    'timestamp': time.time(),
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory_percent,
                    'memory_used_gb': memory.used / 1024 / 1024 / 1024,
                    'memory_total_gb': memory.total / 1024 / 1024 / 1024
                }
                
                await self._broadcast_data(system_data)
                
            except Exception as e:
                logging.error(f"System monitoring error: {e}")
            
            await asyncio.sleep(self.config.check_interval)
    
    async def _check_alert_conditions(self):
        """Check for alert conditions and trigger notifications"""
        while self.monitoring_active:
            try:
                stats = self.storage.get_statistics(window_seconds=60)  # 1-minute window
                
                if not stats:
                    await asyncio.sleep(self.config.check_interval)
                    continue
                
                # Check response time threshold
                avg_response_time = stats.get('avg_response_time', 0)
                if avg_response_time > self.config.alert_threshold_response_time:
                    self.alert_manager.send_alert(
                        'high_response_time',
                        f"Average response time {avg_response_time * 1000:.1f}ms exceeds threshold {self.config.alert_threshold_response_time * 1000:.1f}ms"
                    )
                
                # Check error rate threshold
                error_rate = stats.get('error_rate', 0)
                self.prometheus.update_error_rate(error_rate)
                
                if error_rate > self.config.alert_threshold_error_rate:
                    self.alert_manager.send_alert(
                        'high_error_rate',
                        f"Error rate {error_rate * 100:.1f}% exceeds threshold {self.config.alert_threshold_error_rate * 100:.1f}%",
                        severity="CRITICAL"
                    )
                
                # Check rollback conditions
                await self._check_rollback_conditions(stats)
                
                # Broadcast alert status
                alert_data = {
                    'type': 'alert_status',
                    'timestamp': time.time(),
                    'stats': stats,
                    'thresholds': {
                        'response_time': self.config.alert_threshold_response_time,
                        'error_rate': self.config.alert_threshold_error_rate
                    }
                }
                
                await self._broadcast_data(alert_data)
                
            except Exception as e:
                logging.error(f"Alert checking error: {e}")
            
            await asyncio.sleep(self.config.check_interval)
    
    async def _check_rollback_conditions(self, stats: Dict[str, Any]):
        """Check if automatic rollback should be triggered"""
        if not self.rollback_callback:
            return
        
        # Check rollback thresholds
        avg_response_time = stats.get('avg_response_time', 0)
        error_rate = stats.get('error_rate', 0)
        
        rollback_needed = (
            avg_response_time > self.config.rollback_threshold_response_time or
            error_rate > self.config.rollback_threshold_error_rate
        )
        
        if rollback_needed:
            self.consecutive_failures += 1
            
            if self.consecutive_failures >= self.config.rollback_consecutive_failures:
                self.alert_manager.send_alert(
                    'automated_rollback',
                    f"Triggering automated rollback due to {self.consecutive_failures} consecutive failures. "
                    f"Response time: {avg_response_time * 1000:.1f}ms, Error rate: {error_rate * 100:.1f}%",
                    severity="CRITICAL"
                )
                
                try:
                    await self.rollback_callback()
                    self.consecutive_failures = 0  # Reset after successful rollback
                except Exception as e:
                    logging.error(f"Rollback callback failed: {e}")
        else:
            self.consecutive_failures = 0  # Reset on success
    
    async def _websocket_server(self):
        """WebSocket server for real-time monitoring updates"""
        async def handle_client(websocket, path):
            self.websocket_clients.add(websocket)
            try:
                await websocket.wait_closed()
            finally:
                self.websocket_clients.discard(websocket)
        
        try:
            start_server = websockets.serve(handle_client, "localhost", 8765)
            await start_server
            logging.info("WebSocket server started on ws://localhost:8765")
        except Exception as e:
            logging.error(f"WebSocket server error: {e}")
    
    async def _broadcast_metric(self, metric: PerformanceMetric):
        """Broadcast performance metric to WebSocket clients"""
        if not self.websocket_clients:
            return
        
        data = {
            'type': 'performance_metric',
            'timestamp': metric.timestamp,
            'response_time': metric.response_time,
            'status_code': metric.status_code,
            'endpoint': metric.endpoint,
            'error': metric.error_message
        }
        
        await self._broadcast_data(data)
    
    async def _broadcast_data(self, data: Dict[str, Any]):
        """Broadcast data to all WebSocket clients"""
        if not self.websocket_clients:
            return
        
        message = json.dumps(data)
        disconnected_clients = set()
        
        for client in self.websocket_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logging.error(f"Error broadcasting to client: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        for client in disconnected_clients:
            self.websocket_clients.discard(client)
    
    def get_monitoring_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive monitoring data for dashboard"""
        stats_1min = self.storage.get_statistics(60)
        stats_5min = self.storage.get_statistics(300)
        stats_15min = self.storage.get_statistics(900)
        
        return {
            'timestamp': time.time(),
            'stats': {
                '1min': stats_1min,
                '5min': stats_5min,
                '15min': stats_15min
            },
            'system': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_usage': psutil.disk_usage('/').percent
            },
            'alerts': list(self.alert_manager.alert_history)[-10:],  # Last 10 alerts
            'thresholds': {
                'response_time_alert': self.config.alert_threshold_response_time * 1000,
                'response_time_rollback': self.config.rollback_threshold_response_time * 1000,
                'error_rate_alert': self.config.alert_threshold_error_rate * 100,
                'error_rate_rollback': self.config.rollback_threshold_error_rate * 100
            },
            'consecutive_failures': self.consecutive_failures
        }

# Example usage and rollback implementation
async def example_rollback_handler():
    """Example rollback handler function"""
    logging.info("Executing automated rollback...")
    
    # Example rollback steps:
    # 1. Switch to previous version
    # 2. Clear problematic cache
    # 3. Restart services
    # 4. Notify operations team
    
    try:
        # Simulate rollback actions
        await asyncio.sleep(2)  # Simulate rollback time
        logging.info("Rollback completed successfully")
        return True
    except Exception as e:
        logging.error(f"Rollback failed: {e}")
        return False

async def main():
    """Main monitoring execution"""
    config = MonitoringConfig(
        api_endpoint="https://rag.sirth.ch/api",
        check_interval=5.0,
        webhook_urls=[
            "https://hooks.slack.com/your-webhook-url",
            # Add more webhook URLs as needed
        ],
        email_config={
            'from': 'monitoring@yourcompany.com',
            'to': 'ops-team@yourcompany.com',
            'smtp_host': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': 'your-email@gmail.com',
            'password': 'your-app-password'
        }
    )
    
    monitor = PerformanceMonitor(config)
    monitor.set_rollback_callback(example_rollback_handler)
    
    try:
        await monitor.start_monitoring()
    except KeyboardInterrupt:
        logging.info("Stopping monitoring...")
        monitor.stop_monitoring()

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    asyncio.run(main())