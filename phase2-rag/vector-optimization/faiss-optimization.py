"""
FAISS Vector Search Optimization for Phase 2 RAG System
Targeting 20% performance improvement in vector search operations
"""

import numpy as np
import faiss
import time
from typing import List, Tuple, Optional
from dataclasses import dataclass
import logging
from concurrent.futures import ThreadPoolExecutor
import asyncio

@dataclass
class OptimizationConfig:
    """Configuration for FAISS optimization parameters"""
    nlist: int = 256  # Number of clusters for IVF
    nprobe: int = 32  # Number of clusters to search
    m: int = 64       # Number of subquantizers for PQ
    nbits: int = 8    # Bits per subquantizer
    use_gpu: bool = True
    batch_size: int = 128
    prefetch_size: int = 1024

class FAISSOptimizer:
    """Advanced FAISS index optimizer for RAG system performance enhancement"""
    
    def __init__(self, config: OptimizationConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.performance_metrics = {}
        
    def create_optimized_index(self, vectors: np.ndarray, dimension: int) -> faiss.Index:
        """Create optimized FAISS index with hybrid approach"""
        n_vectors = len(vectors)
        
        if n_vectors < 10000:
            # Use flat index for small datasets
            index = faiss.IndexFlatIP(dimension)
        elif n_vectors < 100000:
            # Use IVF with product quantization
            quantizer = faiss.IndexFlatIP(dimension)
            index = faiss.IndexIVFPQ(quantizer, dimension, 
                                    self.config.nlist, self.config.m, self.config.nbits)
        else:
            # Use hierarchical clustering for large datasets
            index = self._create_hierarchical_index(dimension)
            
        # GPU acceleration if available
        if self.config.use_gpu and faiss.get_num_gpus() > 0:
            index = faiss.index_cpu_to_gpu(faiss.StandardGpuResources(), 0, index)
            
        return index
    
    def _create_hierarchical_index(self, dimension: int) -> faiss.Index:
        """Create hierarchical index for maximum performance"""
        # Level 1: Coarse quantizer
        coarse_quantizer = faiss.IndexFlatIP(dimension)
        
        # Level 2: Fine quantizer with product quantization
        index = faiss.IndexIVFPQ(coarse_quantizer, dimension,
                                self.config.nlist, self.config.m, self.config.nbits)
        
        # Add LSH preprocessing for dimension reduction
        if dimension > 512:
            lsh_index = faiss.IndexLSH(dimension, dimension // 2)
            index = faiss.IndexPreTransform(lsh_index, index)
            
        return index
    
    def optimize_search_parameters(self, index: faiss.Index, 
                                 queries: np.ndarray, ground_truth: List[List[int]]) -> dict:
        """Dynamically optimize search parameters for best performance"""
        best_params = {}
        best_performance = 0
        
        # Test different nprobe values
        nprobe_values = [16, 32, 64, 128]
        for nprobe in nprobe_values:
            if hasattr(index, 'nprobe'):
                index.nprobe = nprobe
                
            start_time = time.time()
            _, indices = index.search(queries, 10)
            search_time = time.time() - start_time
            
            # Calculate recall
            recall = self._calculate_recall(indices, ground_truth)
            performance_score = recall / search_time  # Balance accuracy and speed
            
            if performance_score > best_performance:
                best_performance = performance_score
                best_params = {'nprobe': nprobe, 'recall': recall, 'time': search_time}
                
        return best_params
    
    async def batch_search_async(self, index: faiss.Index, 
                               queries: np.ndarray, k: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """Asynchronous batch search with optimized throughput"""
        batch_size = self.config.batch_size
        num_batches = (len(queries) + batch_size - 1) // batch_size
        
        async def search_batch(batch_queries):
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, lambda: index.search(batch_queries, k))
        
        # Process batches concurrently
        tasks = []
        for i in range(num_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(queries))
            batch = queries[start_idx:end_idx]
            tasks.append(search_batch(batch))
        
        results = await asyncio.gather(*tasks)
        
        # Combine results
        all_distances = np.vstack([r[0] for r in results])
        all_indices = np.vstack([r[1] for r in results])
        
        return all_distances, all_indices
    
    def enable_memory_mapping(self, index: faiss.Index, index_file: str):
        """Enable memory mapping for large indices to reduce RAM usage"""
        # Write index to disk with optimized format
        faiss.write_index(index, index_file)
        
        # Create memory-mapped index
        mmap_index = faiss.read_index(index_file, faiss.IO_FLAG_MMAP)
        return mmap_index
    
    def implement_caching_layer(self) -> 'SearchCache':
        """Implement intelligent caching for frequent queries"""
        return SearchCache(max_size=10000, ttl_seconds=3600)
    
    def _calculate_recall(self, retrieved: np.ndarray, ground_truth: List[List[int]]) -> float:
        """Calculate recall@k for search quality assessment"""
        total_recall = 0
        for i, gt in enumerate(ground_truth):
            if i < len(retrieved):
                retrieved_set = set(retrieved[i])
                gt_set = set(gt)
                recall = len(retrieved_set.intersection(gt_set)) / len(gt_set)
                total_recall += recall
        return total_recall / len(ground_truth)

class SearchCache:
    """Intelligent caching system for vector search results"""
    
    def __init__(self, max_size: int = 10000, ttl_seconds: int = 3600):
        self.cache = {}
        self.access_times = {}
        self.max_size = max_size
        self.ttl = ttl_seconds
    
    def get(self, query_hash: str) -> Optional[Tuple[np.ndarray, np.ndarray]]:
        """Retrieve cached search results"""
        if query_hash in self.cache:
            current_time = time.time()
            if current_time - self.access_times[query_hash] < self.ttl:
                self.access_times[query_hash] = current_time
                return self.cache[query_hash]
            else:
                del self.cache[query_hash]
                del self.access_times[query_hash]
        return None
    
    def put(self, query_hash: str, results: Tuple[np.ndarray, np.ndarray]):
        """Store search results in cache"""
        if len(self.cache) >= self.max_size:
            # Evict oldest entry
            oldest_key = min(self.access_times.keys(), key=self.access_times.get)
            del self.cache[oldest_key]
            del self.access_times[oldest_key]
        
        self.cache[query_hash] = results
        self.access_times[query_hash] = time.time()

# Performance monitoring and optimization feedback
class PerformanceMonitor:
    """Monitor and optimize FAISS performance in real-time"""
    
    def __init__(self):
        self.metrics = {
            'search_times': [],
            'memory_usage': [],
            'cache_hit_rate': 0,
            'throughput': 0
        }
    
    def record_search(self, search_time: float, cache_hit: bool = False):
        """Record search performance metrics"""
        self.metrics['search_times'].append(search_time)
        if cache_hit:
            self.metrics['cache_hit_rate'] += 1
    
    def get_performance_report(self) -> dict:
        """Generate performance optimization report"""
        if not self.metrics['search_times']:
            return {}
        
        avg_time = np.mean(self.metrics['search_times'])
        p95_time = np.percentile(self.metrics['search_times'], 95)
        
        return {
            'average_search_time': avg_time,
            'p95_search_time': p95_time,
            'total_searches': len(self.metrics['search_times']),
            'cache_hit_rate': self.metrics['cache_hit_rate'] / len(self.metrics['search_times']),
            'recommendation': self._get_optimization_recommendation(avg_time)
        }
    
    def _get_optimization_recommendation(self, avg_time: float) -> str:
        """Provide optimization recommendations based on performance"""
        if avg_time > 0.1:  # 100ms
            return "Consider GPU acceleration and index optimization"
        elif avg_time > 0.05:  # 50ms
            return "Implement batch processing and caching"
        else:
            return "Performance is optimal"