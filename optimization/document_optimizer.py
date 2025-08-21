
# Document Processing Optimization
# Enhanced document chunking and processing

import re
from typing import List, Dict, Any

class DocumentOptimizer:
    def __init__(self):
        self.processed_count = 0
        self.optimization_stats = {
            'chunks_created': 0,
            'processing_time': 0,
            'quality_score': 0
        }
    
    def optimize_chunk_size(self, text: str, target_size: int = 1000) -> List[str]:
        '''Intelligent chunking with sentence boundary preservation'''
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > target_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        self.optimization_stats['chunks_created'] += len(chunks)
        return chunks
    
    def calculate_quality_score(self, chunks: List[str]) -> float:
        '''Calculate content quality score'''
        if not chunks:
            return 0.0
        
        total_score = 0
        for chunk in chunks:
            # Simple quality metrics
            word_count = len(chunk.split())
            sentence_count = len(re.findall(r'[.!?]', chunk))
            
            # Prefer moderate length chunks with good sentence structure
            length_score = min(word_count / 100, 1.0) if word_count > 0 else 0
            structure_score = min(sentence_count / 3, 1.0) if sentence_count > 0 else 0
            
            chunk_score = (length_score + structure_score) / 2
            total_score += chunk_score
        
        return total_score / len(chunks)
    
    def get_stats(self) -> Dict[str, Any]:
        return {
            'processed_documents': self.processed_count,
            'total_chunks': self.optimization_stats['chunks_created'],
            'average_quality': self.optimization_stats['quality_score']
        }

# Global optimizer instance
document_optimizer = DocumentOptimizer()
