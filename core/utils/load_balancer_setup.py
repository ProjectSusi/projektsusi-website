"""
Load Balancer Setup Utilities
Configure default backends and load balancing strategies
"""
import logging
import os
from typing import List, Dict, Any

from ..services.load_balancer_service import (
    LoadBalancerService,
    Backend,
    LoadBalancingStrategy,
    get_load_balancer_service
)

logger = logging.getLogger(__name__)


async def setup_default_backends(lb_service: LoadBalancerService) -> bool:
    """Set up default backends for load balancing"""
    try:
        # Check if backends already exist
        existing_backends = lb_service.list_backends()
        if existing_backends:
            logger.info(f"Load balancer already has {len(existing_backends)} backends configured")
            return True
            
        # Configure default backends based on environment
        backends_config = _get_backends_configuration()
        
        if not backends_config:
            logger.info("No backend configuration found, setting up localhost backend")
            backends_config = _get_localhost_backend_config()
        
        # Add configured backends
        for backend_config in backends_config:
            backend = Backend(**backend_config)
            lb_service.add_backend(backend)
            logger.info(f"Added backend: {backend.id} ({backend.endpoint})")
        
        logger.info(f"Successfully configured {len(backends_config)} backends")
        return True
        
    except Exception as e:
        logger.error(f"Failed to setup default backends: {e}")
        return False


def _get_backends_configuration() -> List[Dict[str, Any]]:
    """Get backend configuration from environment variables"""
    backends = []
    
    # Check for multiple backend configuration
    backend_count = int(os.getenv('LOAD_BALANCER_BACKEND_COUNT', '0'))
    
    if backend_count > 0:
        for i in range(backend_count):
            backend_config = _parse_backend_config(i)
            if backend_config:
                backends.append(backend_config)
    
    # Check for single backend configuration
    single_backend = _parse_single_backend_config()
    if single_backend:
        backends.append(single_backend)
    
    return backends


def _parse_backend_config(index: int) -> Dict[str, Any]:
    """Parse backend configuration for a specific index"""
    prefix = f'LOAD_BALANCER_BACKEND_{index}_'
    
    host = os.getenv(f'{prefix}HOST')
    port = os.getenv(f'{prefix}PORT')
    
    if not host or not port:
        return None
    
    try:
        config = {
            'id': os.getenv(f'{prefix}ID', f'backend_{index}'),
            'host': host,
            'port': int(port),
            'weight': float(os.getenv(f'{prefix}WEIGHT', '1.0')),
            'max_connections': int(os.getenv(f'{prefix}MAX_CONNECTIONS', '100')),
            'health_check_url': os.getenv(f'{prefix}HEALTH_CHECK_URL', '/health'),
            'timeout_ms': int(os.getenv(f'{prefix}TIMEOUT_MS', '5000')),
            'metadata': {}
        }
        
        # Parse metadata if present
        metadata_str = os.getenv(f'{prefix}METADATA')
        if metadata_str:
            import json
            config['metadata'] = json.loads(metadata_str)
        
        return config
        
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid backend configuration for index {index}: {e}")
        return None


def _parse_single_backend_config() -> Dict[str, Any]:
    """Parse single backend configuration"""
    host = os.getenv('LOAD_BALANCER_BACKEND_HOST')
    port = os.getenv('LOAD_BALANCER_BACKEND_PORT')
    
    if not host or not port:
        return None
    
    try:
        return {
            'id': os.getenv('LOAD_BALANCER_BACKEND_ID', 'primary'),
            'host': host,
            'port': int(port),
            'weight': float(os.getenv('LOAD_BALANCER_BACKEND_WEIGHT', '1.0')),
            'max_connections': int(os.getenv('LOAD_BALANCER_BACKEND_MAX_CONNECTIONS', '100')),
            'health_check_url': os.getenv('LOAD_BALANCER_BACKEND_HEALTH_CHECK_URL', '/health'),
            'timeout_ms': int(os.getenv('LOAD_BALANCER_BACKEND_TIMEOUT_MS', '5000')),
            'metadata': {}
        }
        
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid single backend configuration: {e}")
        return None


def _get_localhost_backend_config() -> List[Dict[str, Any]]:
    """Get default localhost backend configuration"""
    return [
        {
            'id': 'localhost',
            'host': '127.0.0.1',
            'port': 8000,
            'weight': 1.0,
            'max_connections': 100,
            'health_check_url': '/health',
            'timeout_ms': 5000,
            'metadata': {
                'description': 'Default localhost backend',
                'environment': 'development'
            }
        }
    ]


async def configure_load_balancer_strategy() -> bool:
    """Configure default load balancing strategy"""
    try:
        lb_service = get_load_balancer_service()
        
        # Get strategy from environment
        strategy_name = os.getenv('LOAD_BALANCER_STRATEGY', 'round_robin').lower()
        
        # Map strategy name to enum
        strategy_mapping = {
            'round_robin': LoadBalancingStrategy.ROUND_ROBIN,
            'weighted_round_robin': LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN,
            'least_connections': LoadBalancingStrategy.LEAST_CONNECTIONS,
            'weighted_least_connections': LoadBalancingStrategy.WEIGHTED_LEAST_CONNECTIONS,
            'random': LoadBalancingStrategy.RANDOM,
            'weighted_random': LoadBalancingStrategy.WEIGHTED_RANDOM,
            'ip_hash': LoadBalancingStrategy.IP_HASH,
            'consistent_hash': LoadBalancingStrategy.CONSISTENT_HASH,
            'response_time': LoadBalancingStrategy.RESPONSE_TIME,
            'health_based': LoadBalancingStrategy.HEALTH_BASED,
            'adaptive': LoadBalancingStrategy.ADAPTIVE
        }
        
        strategy = strategy_mapping.get(strategy_name, LoadBalancingStrategy.ROUND_ROBIN)
        
        lb_service.set_default_strategy(strategy)
        logger.info(f"Load balancer strategy set to: {strategy.value}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to configure load balancer strategy: {e}")
        return False


async def add_example_backends() -> bool:
    """Add example backends for testing (development only)"""
    try:
        lb_service = get_load_balancer_service()
        
        # Only add if no backends exist
        if lb_service.list_backends():
            logger.info("Backends already exist, skipping example backend setup")
            return True
        
        # Add multiple example backends for testing
        example_backends = [
            {
                'id': 'api_server_1',
                'host': '127.0.0.1',
                'port': 8000,
                'weight': 2.0,
                'metadata': {'role': 'primary', 'zone': 'local'}
            },
            {
                'id': 'api_server_2',
                'host': '127.0.0.1',
                'port': 8001,
                'weight': 1.0,
                'metadata': {'role': 'secondary', 'zone': 'local'}
            },
            {
                'id': 'api_server_3',
                'host': '127.0.0.1',
                'port': 8002,
                'weight': 1.5,
                'metadata': {'role': 'backup', 'zone': 'local'}
            }
        ]
        
        for backend_config in example_backends:
            backend = Backend(**backend_config)
            lb_service.add_backend(backend)
            logger.info(f"Added example backend: {backend.id} ({backend.endpoint})")
        
        # Set adaptive strategy for testing
        lb_service.set_default_strategy(LoadBalancingStrategy.ADAPTIVE)
        
        logger.info("Example backends configured for testing")
        return True
        
    except Exception as e:
        logger.error(f"Failed to add example backends: {e}")
        return False


async def get_load_balancer_configuration_info() -> Dict[str, Any]:
    """Get current load balancer configuration information"""
    try:
        lb_service = get_load_balancer_service()
        
        backends = lb_service.list_backends()
        backend_statuses = lb_service.list_backend_status()
        stats = lb_service.get_load_balancer_stats()
        
        return {
            'total_backends': len(backends),
            'backend_list': [
                {
                    'id': b.id,
                    'endpoint': b.endpoint,
                    'weight': b.weight,
                    'max_connections': b.max_connections
                }
                for b in backends
            ],
            'healthy_backends': stats['healthy_backends'],
            'unhealthy_backends': stats['unhealthy_backends'],
            'default_strategy': stats['default_strategy'],
            'total_requests': stats['total_requests'],
            'success_rate': stats['success_rate'],
            'configuration_status': 'active' if backends else 'not_configured'
        }
        
    except Exception as e:
        logger.error(f"Failed to get configuration info: {e}")
        return {
            'configuration_status': 'error',
            'error': str(e)
        }


def get_load_balancer_environment_config() -> Dict[str, str]:
    """Get example environment configuration for load balancer"""
    return {
        'LOAD_BALANCER_ENABLED': 'true',
        'LOAD_BALANCER_STRATEGY': 'adaptive',
        'LOAD_BALANCER_BACKEND_COUNT': '2',
        'LOAD_BALANCER_BACKEND_0_ID': 'primary',
        'LOAD_BALANCER_BACKEND_0_HOST': '127.0.0.1',
        'LOAD_BALANCER_BACKEND_0_PORT': '8000',
        'LOAD_BALANCER_BACKEND_0_WEIGHT': '2.0',
        'LOAD_BALANCER_BACKEND_1_ID': 'secondary',
        'LOAD_BALANCER_BACKEND_1_HOST': '127.0.0.1',
        'LOAD_BALANCER_BACKEND_1_PORT': '8001',
        'LOAD_BALANCER_BACKEND_1_WEIGHT': '1.0'
    }