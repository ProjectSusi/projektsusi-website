"""
Automated Deployment System for Phase 2 RAG Enhancements
Orchestrates gradual rollout with A/B testing, dependency management, and automated rollback
"""

import asyncio
import time
import json
import logging
import subprocess
import shutil
import os
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import aiohttp
import threading
from contextlib import asynccontextmanager
import docker
import kubernetes
from kubernetes import client, config
import yaml

@dataclass
class DeploymentConfig:
    """Configuration for automated deployment"""
    environment: str = "production"
    deployment_strategy: str = "blue_green"  # blue_green, canary, rolling
    rollout_percentage: int = 10  # Start with 10% traffic
    rollout_increments: List[int] = field(default_factory=lambda: [10, 25, 50, 75, 100])
    rollout_interval: int = 300  # 5 minutes between increments
    success_threshold: float = 0.99  # 99% success rate required
    response_time_threshold: float = 0.080  # 80ms target
    monitoring_window: int = 300  # 5 minutes monitoring window
    rollback_on_failure: bool = True
    pre_deployment_checks: List[str] = field(default_factory=lambda: [
        "database_connectivity",
        "redis_connectivity", 
        "vector_index_health",
        "cache_layer_ready"
    ])
    post_deployment_validations: List[str] = field(default_factory=lambda: [
        "api_health_check",
        "search_functionality",
        "performance_regression_test",
        "cache_integration_test"
    ])

@dataclass 
class DeploymentArtifact:
    """Deployment artifact information"""
    version: str
    build_hash: str
    docker_image: str
    config_version: str
    timestamp: datetime
    components: List[str] = field(default_factory=list)
    
class DeploymentHealth:
    """Track deployment health metrics"""
    
    def __init__(self):
        self.metrics = {
            'response_times': [],
            'error_rates': [],
            'success_counts': [],
            'system_metrics': []
        }
        self.start_time = time.time()
        self.lock = threading.Lock()
    
    def record_metric(self, metric_type: str, value: float):
        """Record a health metric"""
        with self.lock:
            if metric_type in self.metrics:
                self.metrics[metric_type].append({
                    'timestamp': time.time(),
                    'value': value
                })
    
    def get_health_score(self, window_seconds: int = 300) -> float:
        """Calculate overall health score (0-1)"""
        cutoff_time = time.time() - window_seconds
        
        # Response time score (0-1, lower is better)
        response_times = [
            m['value'] for m in self.metrics['response_times'] 
            if m['timestamp'] >= cutoff_time
        ]
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            response_score = max(0, 1 - (avg_response_time / 0.200))  # 200ms as bad threshold
        else:
            response_score = 1.0
        
        # Error rate score (0-1, lower is better)
        error_rates = [
            m['value'] for m in self.metrics['error_rates']
            if m['timestamp'] >= cutoff_time
        ]
        
        if error_rates:
            avg_error_rate = sum(error_rates) / len(error_rates)
            error_score = max(0, 1 - avg_error_rate)
        else:
            error_score = 1.0
        
        # Combined score
        return (response_score * 0.6 + error_score * 0.4)

class ABTestingController:
    """A/B testing traffic management"""
    
    def __init__(self, config: DeploymentConfig):
        self.config = config
        self.current_percentage = 0
        self.target_percentage = 0
        self.deployment_active = False
        self.traffic_routing = {}
        
    def start_ab_test(self, version_a: str, version_b: str):
        """Start A/B testing between two versions"""
        self.deployment_active = True
        self.traffic_routing = {
            'version_a': {'version': version_a, 'percentage': 100 - self.current_percentage},
            'version_b': {'version': version_b, 'percentage': self.current_percentage}
        }
        
        logging.info(f"Started A/B test: {version_a} ({100-self.current_percentage}%) vs {version_b} ({self.current_percentage}%)")
    
    def update_traffic_split(self, new_percentage: int):
        """Update traffic split percentage"""
        if not self.deployment_active:
            return False
        
        old_percentage = self.current_percentage
        self.current_percentage = new_percentage
        
        self.traffic_routing['version_a']['percentage'] = 100 - new_percentage
        self.traffic_routing['version_b']['percentage'] = new_percentage
        
        logging.info(f"Updated traffic split: Version B now receiving {new_percentage}% (was {old_percentage}%)")
        
        return True
    
    async def apply_traffic_routing(self):
        """Apply traffic routing configuration"""
        # This would integrate with load balancer/ingress controller
        # Implementation depends on infrastructure (nginx, istio, etc.)
        
        try:
            # Example: Update Kubernetes ingress weights
            await self._update_kubernetes_ingress()
            
            # Example: Update nginx upstream weights
            await self._update_nginx_config()
            
            return True
        except Exception as e:
            logging.error(f"Failed to apply traffic routing: {e}")
            return False
    
    async def _update_kubernetes_ingress(self):
        """Update Kubernetes ingress for traffic splitting"""
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        
        v1 = client.NetworkingV1Api()
        
        # Get current ingress
        ingress_name = "rag-system-ingress"
        namespace = "default"
        
        ingress = v1.read_namespaced_ingress(ingress_name, namespace)
        
        # Update annotations for traffic splitting
        if not ingress.metadata.annotations:
            ingress.metadata.annotations = {}
        
        # Example for NGINX ingress controller
        ingress.metadata.annotations.update({
            'nginx.ingress.kubernetes.io/canary': 'true',
            'nginx.ingress.kubernetes.io/canary-weight': str(self.current_percentage)
        })
        
        v1.patch_namespaced_ingress(ingress_name, namespace, ingress)
        
    async def _update_nginx_config(self):
        """Update nginx configuration for upstream weighting"""
        # This is a placeholder for nginx configuration updates
        # In practice, this would modify upstream server weights
        pass
    
    def complete_ab_test(self, winning_version: str):
        """Complete A/B test by routing all traffic to winner"""
        self.deployment_active = False
        self.current_percentage = 100 if winning_version == self.traffic_routing['version_b']['version'] else 0
        
        logging.info(f"A/B test completed. All traffic routed to {winning_version}")

class DeploymentOrchestrator:
    """Main deployment orchestration system"""
    
    def __init__(self, config: DeploymentConfig):
        self.config = config
        self.health_tracker = DeploymentHealth()
        self.ab_controller = ABTestingController(config)
        self.docker_client = docker.from_env()
        self.current_deployment = None
        self.deployment_history = []
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    async def deploy_phase2_enhancements(self, artifact: DeploymentArtifact) -> bool:
        """Deploy Phase 2 enhancements with full orchestration"""
        self.logger.info(f"Starting Phase 2 deployment: {artifact.version}")
        
        try:
            # Pre-deployment validation
            if not await self._run_pre_deployment_checks():
                raise Exception("Pre-deployment checks failed")
            
            # Build and prepare new version
            if not await self._prepare_deployment_artifacts(artifact):
                raise Exception("Artifact preparation failed")
            
            # Execute deployment strategy
            if self.config.deployment_strategy == "blue_green":
                success = await self._execute_blue_green_deployment(artifact)
            elif self.config.deployment_strategy == "canary":
                success = await self._execute_canary_deployment(artifact)
            else:
                success = await self._execute_rolling_deployment(artifact)
            
            if success:
                # Post-deployment validation
                if await self._run_post_deployment_validations(artifact):
                    self.logger.info(f"Phase 2 deployment completed successfully: {artifact.version}")
                    self._record_successful_deployment(artifact)
                    return True
                else:
                    self.logger.error("Post-deployment validation failed")
                    if self.config.rollback_on_failure:
                        await self._execute_rollback()
                    return False
            else:
                self.logger.error("Deployment execution failed")
                return False
                
        except Exception as e:
            self.logger.error(f"Deployment failed: {e}")
            if self.config.rollback_on_failure:
                await self._execute_rollback()
            return False
    
    async def _run_pre_deployment_checks(self) -> bool:
        """Run pre-deployment health checks"""
        self.logger.info("Running pre-deployment checks...")
        
        checks_passed = []
        
        for check in self.config.pre_deployment_checks:
            try:
                result = await self._execute_health_check(check)
                checks_passed.append(result)
                
                if result:
                    self.logger.info(f"✓ {check} - PASSED")
                else:
                    self.logger.error(f"✗ {check} - FAILED")
                    
            except Exception as e:
                self.logger.error(f"✗ {check} - ERROR: {e}")
                checks_passed.append(False)
        
        all_passed = all(checks_passed)
        self.logger.info(f"Pre-deployment checks: {sum(checks_passed)}/{len(checks_passed)} passed")
        
        return all_passed
    
    async def _execute_health_check(self, check_name: str) -> bool:
        """Execute individual health check"""
        if check_name == "database_connectivity":
            return await self._check_database_connectivity()
        elif check_name == "redis_connectivity":
            return await self._check_redis_connectivity()
        elif check_name == "vector_index_health":
            return await self._check_vector_index_health()
        elif check_name == "cache_layer_ready":
            return await self._check_cache_layer_health()
        else:
            self.logger.warning(f"Unknown health check: {check_name}")
            return False
    
    async def _check_database_connectivity(self) -> bool:
        """Check database connectivity"""
        try:
            # Placeholder for actual database check
            await asyncio.sleep(0.1)  # Simulate check
            return True
        except Exception as e:
            self.logger.error(f"Database connectivity check failed: {e}")
            return False
    
    async def _check_redis_connectivity(self) -> bool:
        """Check Redis connectivity"""
        try:
            # Placeholder for actual Redis check
            await asyncio.sleep(0.1)  # Simulate check
            return True
        except Exception as e:
            self.logger.error(f"Redis connectivity check failed: {e}")
            return False
    
    async def _check_vector_index_health(self) -> bool:
        """Check vector index health"""
        try:
            # Placeholder for vector index health check
            await asyncio.sleep(0.1)  # Simulate check
            return True
        except Exception as e:
            self.logger.error(f"Vector index health check failed: {e}")
            return False
    
    async def _check_cache_layer_health(self) -> bool:
        """Check cache layer health"""
        try:
            # Placeholder for cache layer check
            await asyncio.sleep(0.1)  # Simulate check
            return True
        except Exception as e:
            self.logger.error(f"Cache layer health check failed: {e}")
            return False
    
    async def _prepare_deployment_artifacts(self, artifact: DeploymentArtifact) -> bool:
        """Prepare deployment artifacts"""
        self.logger.info(f"Preparing deployment artifacts for {artifact.version}")
        
        try:
            # Build Docker image
            self.logger.info("Building Docker image...")
            image, build_logs = self.docker_client.images.build(
                path=".",
                tag=artifact.docker_image,
                buildargs={
                    'VERSION': artifact.version,
                    'BUILD_HASH': artifact.build_hash
                }
            )
            
            # Push to registry
            self.logger.info("Pushing image to registry...")
            for line in self.docker_client.images.push(
                artifact.docker_image, 
                stream=True, 
                decode=True
            ):
                if 'error' in line:
                    raise Exception(line['error'])
            
            # Prepare Kubernetes manifests
            await self._prepare_kubernetes_manifests(artifact)
            
            self.logger.info("Artifact preparation completed")
            return True
            
        except Exception as e:
            self.logger.error(f"Artifact preparation failed: {e}")
            return False
    
    async def _prepare_kubernetes_manifests(self, artifact: DeploymentArtifact):
        """Prepare Kubernetes deployment manifests"""
        manifest_template = {
            'apiVersion': 'apps/v1',
            'kind': 'Deployment',
            'metadata': {
                'name': f'rag-system-{artifact.version}',
                'labels': {
                    'app': 'rag-system',
                    'version': artifact.version,
                    'deployment-type': 'phase2-enhancement'
                }
            },
            'spec': {
                'replicas': 3,
                'selector': {
                    'matchLabels': {
                        'app': 'rag-system',
                        'version': artifact.version
                    }
                },
                'template': {
                    'metadata': {
                        'labels': {
                            'app': 'rag-system',
                            'version': artifact.version
                        }
                    },
                    'spec': {
                        'containers': [{
                            'name': 'rag-system',
                            'image': artifact.docker_image,
                            'ports': [{'containerPort': 8000}],
                            'env': [
                                {'name': 'VERSION', 'value': artifact.version},
                                {'name': 'BUILD_HASH', 'value': artifact.build_hash},
                                {'name': 'ENVIRONMENT', 'value': self.config.environment}
                            ],
                            'resources': {
                                'requests': {
                                    'memory': '512Mi',
                                    'cpu': '250m'
                                },
                                'limits': {
                                    'memory': '1Gi',
                                    'cpu': '500m'
                                }
                            },
                            'readinessProbe': {
                                'httpGet': {
                                    'path': '/health',
                                    'port': 8000
                                },
                                'initialDelaySeconds': 10,
                                'periodSeconds': 5
                            },
                            'livenessProbe': {
                                'httpGet': {
                                    'path': '/health',
                                    'port': 8000
                                },
                                'initialDelaySeconds': 30,
                                'periodSeconds': 10
                            }
                        }]
                    }
                }
            }
        }
        
        # Save manifest to file
        manifest_path = f"/tmp/rag-deployment-{artifact.version}.yaml"
        with open(manifest_path, 'w') as f:
            yaml.dump(manifest_template, f)
            
        artifact.components.append(manifest_path)
    
    async def _execute_blue_green_deployment(self, artifact: DeploymentArtifact) -> bool:
        """Execute blue-green deployment strategy"""
        self.logger.info("Executing blue-green deployment")
        
        try:
            # Deploy to green environment
            await self._deploy_green_environment(artifact)
            
            # Health check green environment
            if not await self._validate_green_environment(artifact):
                raise Exception("Green environment validation failed")
            
            # Start A/B testing with gradual traffic shift
            current_version = self._get_current_version()
            self.ab_controller.start_ab_test(current_version, artifact.version)
            
            # Gradual rollout
            for percentage in self.config.rollout_increments:
                self.logger.info(f"Rolling out to {percentage}% traffic")
                
                self.ab_controller.update_traffic_split(percentage)
                await self.ab_controller.apply_traffic_routing()
                
                # Monitor performance during rollout
                await asyncio.sleep(self.config.rollout_interval)
                
                health_score = self.health_tracker.get_health_score(self.config.monitoring_window)
                
                if health_score < 0.8:  # 80% health threshold
                    self.logger.error(f"Health score dropped to {health_score:.2f}, rolling back")
                    return False
                
                self.logger.info(f"Health score: {health_score:.2f} - continuing rollout")
            
            # Complete deployment
            self.ab_controller.complete_ab_test(artifact.version)
            await self._switch_to_green(artifact)
            
            self.logger.info("Blue-green deployment completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Blue-green deployment failed: {e}")
            return False
    
    async def _execute_canary_deployment(self, artifact: DeploymentArtifact) -> bool:
        """Execute canary deployment strategy"""
        self.logger.info("Executing canary deployment")
        # Implementation for canary deployment
        # Similar to blue-green but with smaller initial percentage
        return await self._execute_blue_green_deployment(artifact)
    
    async def _execute_rolling_deployment(self, artifact: DeploymentArtifact) -> bool:
        """Execute rolling deployment strategy"""  
        self.logger.info("Executing rolling deployment")
        
        try:
            # Update deployment with rolling strategy
            config.load_incluster_config() if os.path.exists('/var/run/secrets/kubernetes.io/serviceaccount') else config.load_kube_config()
            
            apps_v1 = client.AppsV1Api()
            
            # Get current deployment
            deployment_name = "rag-system"
            namespace = "default"
            
            deployment = apps_v1.read_namespaced_deployment(deployment_name, namespace)
            
            # Update image
            deployment.spec.template.spec.containers[0].image = artifact.docker_image
            
            # Update deployment
            apps_v1.patch_namespaced_deployment(deployment_name, namespace, deployment)
            
            # Wait for rollout to complete
            await self._wait_for_rollout_completion(deployment_name, namespace)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Rolling deployment failed: {e}")
            return False
    
    async def _wait_for_rollout_completion(self, deployment_name: str, namespace: str):
        """Wait for Kubernetes rollout to complete"""
        apps_v1 = client.AppsV1Api()
        
        while True:
            deployment = apps_v1.read_namespaced_deployment(deployment_name, namespace)
            
            # Check if rollout is complete
            if (deployment.status.ready_replicas == deployment.spec.replicas and
                deployment.status.updated_replicas == deployment.spec.replicas):
                break
            
            self.logger.info("Waiting for rollout to complete...")
            await asyncio.sleep(10)
    
    async def _deploy_green_environment(self, artifact: DeploymentArtifact):
        """Deploy to green environment"""
        # Deploy new version alongside current version
        pass
    
    async def _validate_green_environment(self, artifact: DeploymentArtifact) -> bool:
        """Validate green environment health"""
        # Run health checks against green environment
        return True
    
    async def _switch_to_green(self, artifact: DeploymentArtifact):
        """Switch traffic from blue to green"""
        # Update load balancer configuration
        pass
    
    def _get_current_version(self) -> str:
        """Get currently deployed version"""
        return "phase1-baseline"  # Placeholder
    
    async def _run_post_deployment_validations(self, artifact: DeploymentArtifact) -> bool:
        """Run post-deployment validation tests"""
        self.logger.info("Running post-deployment validations...")
        
        validation_results = []
        
        for validation in self.config.post_deployment_validations:
            try:
                result = await self._execute_validation(validation)
                validation_results.append(result)
                
                if result:
                    self.logger.info(f"✓ {validation} - PASSED")
                else:
                    self.logger.error(f"✗ {validation} - FAILED")
                    
            except Exception as e:
                self.logger.error(f"✗ {validation} - ERROR: {e}")
                validation_results.append(False)
        
        all_passed = all(validation_results)
        self.logger.info(f"Post-deployment validations: {sum(validation_results)}/{len(validation_results)} passed")
        
        return all_passed
    
    async def _execute_validation(self, validation_name: str) -> bool:
        """Execute individual post-deployment validation"""
        if validation_name == "api_health_check":
            return await self._validate_api_health()
        elif validation_name == "search_functionality":
            return await self._validate_search_functionality()
        elif validation_name == "performance_regression_test":
            return await self._validate_performance_regression()
        elif validation_name == "cache_integration_test":
            return await self._validate_cache_integration()
        else:
            self.logger.warning(f"Unknown validation: {validation_name}")
            return False
    
    async def _validate_api_health(self) -> bool:
        """Validate API health endpoints"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.config.environment}/api/health") as response:
                    return response.status == 200
        except Exception as e:
            self.logger.error(f"API health validation failed: {e}")
            return False
    
    async def _validate_search_functionality(self) -> bool:
        """Validate search functionality"""
        try:
            test_query = "test search functionality"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.config.environment}/api/search",
                    json={"query": test_query, "max_results": 5}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return "results" in data and len(data["results"]) > 0
                    return False
        except Exception as e:
            self.logger.error(f"Search functionality validation failed: {e}")
            return False
    
    async def _validate_performance_regression(self) -> bool:
        """Validate no performance regression"""
        try:
            # Run quick performance test
            response_times = []
            
            async with aiohttp.ClientSession() as session:
                for _ in range(10):
                    start_time = time.time()
                    
                    async with session.post(
                        f"{self.config.environment}/api/search",
                        json={"query": "performance test", "max_results": 10}
                    ) as response:
                        response_time = time.time() - start_time
                        response_times.append(response_time)
                        
                        if response.status != 200:
                            return False
            
            avg_response_time = sum(response_times) / len(response_times)
            return avg_response_time <= self.config.response_time_threshold
            
        except Exception as e:
            self.logger.error(f"Performance regression validation failed: {e}")
            return False
    
    async def _validate_cache_integration(self) -> bool:
        """Validate cache integration"""
        try:
            # Test cache functionality
            await asyncio.sleep(0.1)  # Placeholder
            return True
        except Exception as e:
            self.logger.error(f"Cache integration validation failed: {e}")
            return False
    
    async def _execute_rollback(self):
        """Execute automatic rollback"""
        self.logger.info("Executing automatic rollback...")
        
        try:
            # Stop current deployment
            self.ab_controller.deployment_active = False
            
            # Revert traffic to previous version
            await self.ab_controller.apply_traffic_routing()
            
            # Rollback Kubernetes deployment
            await self._rollback_kubernetes_deployment()
            
            self.logger.info("Rollback completed successfully")
            
        except Exception as e:
            self.logger.error(f"Rollback failed: {e}")
    
    async def _rollback_kubernetes_deployment(self):
        """Rollback Kubernetes deployment"""
        try:
            config.load_incluster_config() if os.path.exists('/var/run/secrets/kubernetes.io/serviceaccount') else config.load_kube_config()
            
            apps_v1 = client.AppsV1Api()
            
            # Rollback deployment
            deployment_name = "rag-system"
            namespace = "default"
            
            # Use kubectl rollout undo
            subprocess.run([
                "kubectl", "rollout", "undo", 
                f"deployment/{deployment_name}",
                f"--namespace={namespace}"
            ], check=True)
            
            # Wait for rollback completion
            await self._wait_for_rollout_completion(deployment_name, namespace)
            
        except Exception as e:
            self.logger.error(f"Kubernetes rollback failed: {e}")
    
    def _record_successful_deployment(self, artifact: DeploymentArtifact):
        """Record successful deployment in history"""
        deployment_record = {
            'version': artifact.version,
            'build_hash': artifact.build_hash,
            'timestamp': datetime.now().isoformat(),
            'strategy': self.config.deployment_strategy,
            'success': True
        }
        
        self.deployment_history.append(deployment_record)
        self.current_deployment = artifact
        
        # Save to persistent storage
        history_file = f"/var/log/deployments/history.json"
        os.makedirs(os.path.dirname(history_file), exist_ok=True)
        
        with open(history_file, 'w') as f:
            json.dump(self.deployment_history, f, indent=2)

# Example usage
async def main():
    """Example deployment execution"""
    config = DeploymentConfig(
        environment="https://rag.sirth.ch",
        deployment_strategy="blue_green",
        rollout_increments=[10, 25, 50, 100],
        rollout_interval=180,  # 3 minutes
        success_threshold=0.99,
        response_time_threshold=0.080
    )
    
    orchestrator = DeploymentOrchestrator(config)
    
    # Create deployment artifact
    artifact = DeploymentArtifact(
        version="phase2-v1.0.0",
        build_hash="abc123def456",
        docker_image="rag-system:phase2-v1.0.0",
        config_version="2.0.0",
        timestamp=datetime.now(),
        components=["vector-optimization", "concurrency-enhancement", "ui-optimization"]
    )
    
    # Execute deployment
    success = await orchestrator.deploy_phase2_enhancements(artifact)
    
    if success:
        print("✅ Phase 2 deployment completed successfully!")
    else:
        print("❌ Phase 2 deployment failed!")

if __name__ == "__main__":
    asyncio.run(main())