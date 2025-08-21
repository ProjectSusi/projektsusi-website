#!/usr/bin/env python3
"""
Document Corpus Expansion Service
Intelligent document processing and corpus optimization for better query success rates
"""

import asyncio
import json
import logging
import hashlib
import time
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, Counter
import re

# Document processing imports
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.document_loaders import TextLoader, PDFMinerLoader, UnstructuredWordDocumentLoader
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

# NLP and similarity imports
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.stem import WordNetLemmatizer
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

# Embedding imports
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    EMBEDDING_AVAILABLE = True
except ImportError:
    EMBEDDING_AVAILABLE = False

logger = logging.getLogger(__name__)


class DocumentQuality(Enum):
    """Document quality levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class ProcessingStrategy(Enum):
    """Document processing strategies"""
    STANDARD = "standard"
    AGGRESSIVE_SPLIT = "aggressive_split"
    SEMANTIC_CHUNKS = "semantic_chunks"
    HIERARCHICAL = "hierarchical"


@dataclass
class DocumentMetadata:
    """Enhanced document metadata"""
    id: str
    title: str
    file_path: str
    file_size: int
    file_type: str
    processing_strategy: ProcessingStrategy
    quality_score: float
    readability_score: float
    word_count: int
    sentence_count: int
    paragraph_count: int
    unique_terms: int
    language: str = "en"
    topics: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    processing_time: float = 0.0
    chunk_count: int = 0
    created_at: float = field(default_factory=time.time)


@dataclass
class ChunkMetadata:
    """Metadata for document chunks"""
    chunk_id: str
    document_id: str
    chunk_index: int
    text: str
    word_count: int
    sentence_count: int
    quality_score: float
    semantic_density: float
    overlap_info: Dict[str, Any] = field(default_factory=dict)
    embeddings: Optional[np.ndarray] = None


@dataclass
class CorpusAnalytics:
    """Corpus-wide analytics"""
    total_documents: int = 0
    total_chunks: int = 0
    total_words: int = 0
    avg_quality_score: float = 0.0
    coverage_gaps: List[str] = field(default_factory=list)
    topic_distribution: Dict[str, int] = field(default_factory=dict)
    language_distribution: Dict[str, int] = field(default_factory=dict)
    processing_efficiency: float = 0.0


class DocumentExpansionService:
    """Intelligent document corpus expansion and optimization service"""
    
    def __init__(
        self,
        storage_path: str = "./documents",
        embedding_model: str = "all-MiniLM-L6-v2",
        chunk_size: int = 512,
        chunk_overlap: int = 64,
        quality_threshold: float = 0.6,
        enable_semantic_analysis: bool = True
    ):
        self.storage_path = Path(storage_path)
        self.embedding_model_name = embedding_model
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.quality_threshold = quality_threshold
        self.enable_semantic_analysis = enable_semantic_analysis
        
        # Initialize components
        self.embedding_model: Optional[SentenceTransformer] = None
        self.text_splitter: Optional[RecursiveCharacterTextSplitter] = None
        self.lemmatizer: Optional[WordNetLemmatizer] = None
        self.stop_words: Set[str] = set()
        
        # Document registry
        self.document_registry: Dict[str, DocumentMetadata] = {}
        self.chunk_registry: Dict[str, ChunkMetadata] = {}
        self.corpus_analytics = CorpusAnalytics()
        
        # Processing queue and optimization
        self.processing_queue: asyncio.Queue = asyncio.Queue()
        self.optimization_suggestions: List[Dict[str, Any]] = []
        
        # Supported file types
        self.supported_extensions = {
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword',
            '.md': 'text/markdown',
            '.json': 'application/json'
        }
    
    async def initialize(self) -> bool:
        """Initialize the document expansion service"""
        try:
            # Create storage directory
            self.storage_path.mkdir(parents=True, exist_ok=True)
            
            # Initialize NLP components
            if NLTK_AVAILABLE:
                await self._initialize_nltk()
            
            # Initialize embedding model
            if EMBEDDING_AVAILABLE:
                await self._initialize_embeddings()
            
            # Initialize text splitter
            if LANGCHAIN_AVAILABLE:
                self.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.chunk_size,
                    chunk_overlap=self.chunk_overlap,
                    length_function=len,
                    separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""]
                )
            
            # Start background processing
            asyncio.create_task(self._background_processor())
            asyncio.create_task(self._corpus_optimizer())
            
            logger.info("Document expansion service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize document expansion service: {e}")
            return False
    
    async def _initialize_nltk(self):
        """Initialize NLTK components"""
        try:
            # Download required NLTK data
            required_data = ['punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger']
            for data_name in required_data:
                try:
                    nltk.data.find(f'tokenizers/{data_name}' if 'punkt' in data_name else f'corpora/{data_name}')
                except LookupError:
                    nltk.download(data_name, quiet=True)
            
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
            
        except Exception as e:
            logger.warning(f"NLTK initialization failed: {e}")
    
    async def _initialize_embeddings(self):
        """Initialize embedding model"""
        try:
            # Load embedding model in a separate thread to avoid blocking
            loop = asyncio.get_event_loop()
            self.embedding_model = await loop.run_in_executor(
                None, 
                SentenceTransformer, 
                self.embedding_model_name
            )
            logger.info(f"Embedding model loaded: {self.embedding_model_name}")
            
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
    
    async def analyze_document_quality(self, text: str) -> Tuple[float, Dict[str, Any]]:
        """Analyze document quality using multiple metrics"""
        analysis = {
            'word_count': 0,
            'sentence_count': 0,
            'paragraph_count': 0,
            'avg_sentence_length': 0.0,
            'readability_score': 0.0,
            'information_density': 0.0,
            'language_quality': 0.0
        }
        
        try:
            # Basic text statistics
            words = text.split()
            analysis['word_count'] = len(words)
            analysis['paragraph_count'] = len(text.split('\n\n'))
            
            if NLTK_AVAILABLE:
                sentences = sent_tokenize(text)
                analysis['sentence_count'] = len(sentences)
                
                if sentences:
                    analysis['avg_sentence_length'] = analysis['word_count'] / len(sentences)
                
                # Calculate readability (simplified Flesch score)
                if analysis['sentence_count'] > 0 and analysis['word_count'] > 0:
                    avg_sentence_length = analysis['avg_sentence_length']
                    syllable_count = self._estimate_syllables(text)
                    avg_syllables_per_word = syllable_count / analysis['word_count']
                    
                    # Simplified Flesch Reading Ease
                    analysis['readability_score'] = max(0, min(100, 
                        206.835 - 1.015 * avg_sentence_length - 84.6 * avg_syllables_per_word
                    ))
            
            # Information density (unique words / total words)
            unique_words = len(set(word.lower() for word in words if word.isalpha()))
            analysis['information_density'] = unique_words / max(1, analysis['word_count'])
            
            # Language quality (ratio of alphabetic characters)
            alpha_chars = sum(1 for char in text if char.isalpha())
            total_chars = len(text.replace(' ', ''))
            analysis['language_quality'] = alpha_chars / max(1, total_chars)
            
            # Calculate overall quality score
            quality_score = self._calculate_quality_score(analysis)
            
            return quality_score, analysis
            
        except Exception as e:
            logger.error(f"Document quality analysis failed: {e}")
            return 0.5, analysis
    
    def _estimate_syllables(self, text: str) -> int:
        """Estimate syllable count in text"""
        syllable_count = 0
        words = re.findall(r'\b\w+\b', text.lower())
        
        for word in words:
            # Count vowel groups
            vowels = 'aeiouy'
            prev_was_vowel = False
            for char in word:
                is_vowel = char in vowels
                if is_vowel and not prev_was_vowel:
                    syllable_count += 1
                prev_was_vowel = is_vowel
            
            # Adjust for silent 'e'
            if word.endswith('e'):
                syllable_count -= 1
            
            # Every word has at least one syllable
            if syllable_count == 0:
                syllable_count = 1
        
        return syllable_count
    
    def _calculate_quality_score(self, analysis: Dict[str, Any]) -> float:
        """Calculate overall document quality score (0-1)"""
        score = 0.0
        
        # Word count factor (optimal range: 100-2000 words)
        word_count = analysis['word_count']
        if word_count < 50:
            word_factor = word_count / 50
        elif word_count > 2000:
            word_factor = max(0.7, 2000 / word_count)
        else:
            word_factor = 1.0
        
        # Readability factor (optimal range: 30-70)
        readability = analysis['readability_score']
        if 30 <= readability <= 70:
            readability_factor = 1.0
        else:
            readability_factor = max(0.3, 1 - abs(readability - 50) / 100)
        
        # Information density factor (optimal: 0.3-0.7)
        density = analysis['information_density']
        if 0.3 <= density <= 0.7:
            density_factor = 1.0
        else:
            density_factor = max(0.5, 1 - abs(density - 0.5) / 0.5)
        
        # Language quality factor
        lang_quality = analysis['language_quality']
        
        # Weighted combination
        score = (
            word_factor * 0.25 +
            readability_factor * 0.25 +
            density_factor * 0.25 +
            lang_quality * 0.25
        )
        
        return min(1.0, max(0.0, score))
    
    async def process_document(
        self,
        file_path: str,
        processing_strategy: ProcessingStrategy = ProcessingStrategy.STANDARD
    ) -> Optional[DocumentMetadata]:
        """Process a single document with intelligent chunking"""
        start_time = time.time()
        
        try:
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                raise FileNotFoundError(f"Document not found: {file_path}")
            
            # Generate document ID
            doc_id = hashlib.sha256(str(file_path_obj.absolute()).encode()).hexdigest()[:12]
            
            # Load document content
            content = await self._load_document_content(file_path_obj)
            if not content:
                logger.warning(f"Empty document: {file_path}")
                return None
            
            # Analyze document quality
            quality_score, quality_analysis = await self.analyze_document_quality(content)
            
            if quality_score < self.quality_threshold:
                logger.warning(f"Document quality below threshold ({quality_score:.2f}): {file_path}")
                # Still process but mark for review
            
            # Extract topics and keywords
            topics, keywords = await self._extract_topics_and_keywords(content)
            
            # Create document metadata
            metadata = DocumentMetadata(
                id=doc_id,
                title=file_path_obj.stem,
                file_path=str(file_path_obj.absolute()),
                file_size=file_path_obj.stat().st_size,
                file_type=file_path_obj.suffix,
                processing_strategy=processing_strategy,
                quality_score=quality_score,
                readability_score=quality_analysis['readability_score'],
                word_count=quality_analysis['word_count'],
                sentence_count=quality_analysis['sentence_count'],
                paragraph_count=quality_analysis['paragraph_count'],
                unique_terms=len(set(content.lower().split())),
                topics=topics,
                keywords=keywords,
                processing_time=time.time() - start_time
            )
            
            # Create chunks based on strategy
            chunks = await self._create_intelligent_chunks(content, metadata, processing_strategy)
            
            # Generate embeddings for chunks
            if self.embedding_model:
                await self._generate_chunk_embeddings(chunks)
            
            # Update registries
            metadata.chunk_count = len(chunks)
            self.document_registry[doc_id] = metadata
            
            for chunk in chunks:
                self.chunk_registry[chunk.chunk_id] = chunk
            
            # Update corpus analytics
            await self._update_corpus_analytics(metadata)
            
            logger.info(f"Processed document {file_path}: {len(chunks)} chunks, quality: {quality_score:.2f}")
            return metadata
            
        except Exception as e:
            logger.error(f"Document processing failed for {file_path}: {e}")
            return None
    
    async def _load_document_content(self, file_path: Path) -> Optional[str]:
        """Load content from various document formats"""
        try:
            extension = file_path.suffix.lower()
            
            if extension == '.txt' or extension == '.md':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            
            elif extension == '.pdf' and LANGCHAIN_AVAILABLE:
                loader = PDFMinerLoader(str(file_path))
                documents = loader.load()
                return '\n\n'.join(doc.page_content for doc in documents)
            
            elif extension in ['.doc', '.docx'] and LANGCHAIN_AVAILABLE:
                loader = UnstructuredWordDocumentLoader(str(file_path))
                documents = loader.load()
                return '\n\n'.join(doc.page_content for doc in documents)
            
            elif extension == '.json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Extract text from JSON (assuming it has text fields)
                    if isinstance(data, dict):
                        text_fields = ['text', 'content', 'body', 'description', 'summary']
                        texts = []
                        for field in text_fields:
                            if field in data and isinstance(data[field], str):
                                texts.append(data[field])
                        return '\n\n'.join(texts)
                    elif isinstance(data, list):
                        texts = []
                        for item in data:
                            if isinstance(item, dict):
                                for field in ['text', 'content', 'body']:
                                    if field in item and isinstance(item[field], str):
                                        texts.append(item[field])
                        return '\n\n'.join(texts)
            
            logger.warning(f"Unsupported file type: {extension}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to load document {file_path}: {e}")
            return None
    
    async def _extract_topics_and_keywords(self, text: str) -> Tuple[List[str], List[str]]:
        """Extract topics and keywords from text"""
        topics = []
        keywords = []
        
        if not NLTK_AVAILABLE:
            return topics, keywords
        
        try:
            # Simple keyword extraction using word frequency
            words = word_tokenize(text.lower())
            words = [word for word in words if word.isalpha() and word not in self.stop_words]
            
            if self.lemmatizer:
                words = [self.lemmatizer.lemmatize(word) for word in words]
            
            # Get most common words as keywords
            word_freq = Counter(words)
            keywords = [word for word, freq in word_freq.most_common(10) if freq > 1]
            
            # Simple topic extraction based on noun phrases
            # This is a simplified approach - could be enhanced with more sophisticated NLP
            sentences = sent_tokenize(text)
            for sentence in sentences[:10]:  # Check first 10 sentences
                words = word_tokenize(sentence.lower())
                pos_tags = nltk.pos_tag(words)
                
                # Extract noun phrases
                noun_phrase = []
                for word, pos in pos_tags:
                    if pos in ['NN', 'NNS', 'NNP', 'NNPS']:
                        noun_phrase.append(word)
                    else:
                        if len(noun_phrase) > 1:
                            topics.append(' '.join(noun_phrase))
                        noun_phrase = []
                
                if len(noun_phrase) > 1:
                    topics.append(' '.join(noun_phrase))
            
            # Deduplicate and limit topics
            topics = list(set(topics))[:5]
            
        except Exception as e:
            logger.warning(f"Topic/keyword extraction failed: {e}")
        
        return topics, keywords
    
    async def _create_intelligent_chunks(
        self,
        content: str,
        metadata: DocumentMetadata,
        strategy: ProcessingStrategy
    ) -> List[ChunkMetadata]:
        """Create intelligent chunks based on processing strategy"""
        chunks = []
        
        try:
            if strategy == ProcessingStrategy.STANDARD and self.text_splitter:
                # Standard chunking with RecursiveCharacterTextSplitter
                text_chunks = self.text_splitter.split_text(content)
                
                for i, chunk_text in enumerate(text_chunks):
                    chunk_id = f"{metadata.id}_chunk_{i:04d}"
                    quality_score, _ = await self.analyze_document_quality(chunk_text)
                    
                    chunk = ChunkMetadata(
                        chunk_id=chunk_id,
                        document_id=metadata.id,
                        chunk_index=i,
                        text=chunk_text,
                        word_count=len(chunk_text.split()),
                        sentence_count=len(sent_tokenize(chunk_text)) if NLTK_AVAILABLE else 1,
                        quality_score=quality_score,
                        semantic_density=self._calculate_semantic_density(chunk_text)
                    )
                    chunks.append(chunk)
            
            elif strategy == ProcessingStrategy.SEMANTIC_CHUNKS:
                # Semantic chunking based on sentence similarity
                chunks = await self._create_semantic_chunks(content, metadata)
            
            elif strategy == ProcessingStrategy.AGGRESSIVE_SPLIT:
                # Aggressive splitting for dense documents
                chunks = await self._create_aggressive_chunks(content, metadata)
            
            else:
                # Fallback to simple splitting
                chunk_size = self.chunk_size
                overlap = self.chunk_overlap
                
                for i in range(0, len(content), chunk_size - overlap):
                    chunk_text = content[i:i + chunk_size]
                    if len(chunk_text.strip()) < 50:  # Skip very short chunks
                        continue
                    
                    chunk_id = f"{metadata.id}_chunk_{i//chunk_size:04d}"
                    quality_score, _ = await self.analyze_document_quality(chunk_text)
                    
                    chunk = ChunkMetadata(
                        chunk_id=chunk_id,
                        document_id=metadata.id,
                        chunk_index=i//chunk_size,
                        text=chunk_text,
                        word_count=len(chunk_text.split()),
                        sentence_count=len(sent_tokenize(chunk_text)) if NLTK_AVAILABLE else 1,
                        quality_score=quality_score,
                        semantic_density=self._calculate_semantic_density(chunk_text)
                    )
                    chunks.append(chunk)
            
        except Exception as e:
            logger.error(f"Chunk creation failed: {e}")
        
        return chunks
    
    def _calculate_semantic_density(self, text: str) -> float:
        """Calculate semantic density of text"""
        try:
            words = text.split()
            if len(words) < 10:
                return 0.5
            
            # Simple semantic density based on unique word ratio and average word length
            unique_words = len(set(word.lower() for word in words if word.isalpha()))
            avg_word_length = sum(len(word) for word in words if word.isalpha()) / max(1, len([w for w in words if w.isalpha()]))
            
            density = (unique_words / len(words)) * (avg_word_length / 10.0)
            return min(1.0, max(0.0, density))
            
        except Exception:
            return 0.5
    
    async def _create_semantic_chunks(self, content: str, metadata: DocumentMetadata) -> List[ChunkMetadata]:
        """Create chunks based on semantic similarity"""
        chunks = []
        
        try:
            if not NLTK_AVAILABLE:
                return chunks
            
            sentences = sent_tokenize(content)
            if len(sentences) < 3:
                return chunks
            
            # Group sentences by semantic similarity (simplified approach)
            current_chunk = []
            current_word_count = 0
            
            for i, sentence in enumerate(sentences):
                sentence_words = len(sentence.split())
                
                # Start new chunk if current is too large or if semantic break detected
                if (current_word_count + sentence_words > self.chunk_size and current_chunk):
                    chunk_text = ' '.join(current_chunk)
                    if len(chunk_text.strip()) >= 50:
                        chunk_id = f"{metadata.id}_semantic_{len(chunks):04d}"
                        quality_score, _ = await self.analyze_document_quality(chunk_text)
                        
                        chunk = ChunkMetadata(
                            chunk_id=chunk_id,
                            document_id=metadata.id,
                            chunk_index=len(chunks),
                            text=chunk_text,
                            word_count=current_word_count,
                            sentence_count=len(current_chunk),
                            quality_score=quality_score,
                            semantic_density=self._calculate_semantic_density(chunk_text)
                        )
                        chunks.append(chunk)
                    
                    current_chunk = []
                    current_word_count = 0
                
                current_chunk.append(sentence)
                current_word_count += sentence_words
            
            # Add final chunk
            if current_chunk:
                chunk_text = ' '.join(current_chunk)
                if len(chunk_text.strip()) >= 50:
                    chunk_id = f"{metadata.id}_semantic_{len(chunks):04d}"
                    quality_score, _ = await self.analyze_document_quality(chunk_text)
                    
                    chunk = ChunkMetadata(
                        chunk_id=chunk_id,
                        document_id=metadata.id,
                        chunk_index=len(chunks),
                        text=chunk_text,
                        word_count=current_word_count,
                        sentence_count=len(current_chunk),
                        quality_score=quality_score,
                        semantic_density=self._calculate_semantic_density(chunk_text)
                    )
                    chunks.append(chunk)
            
        except Exception as e:
            logger.error(f"Semantic chunking failed: {e}")
        
        return chunks
    
    async def _create_aggressive_chunks(self, content: str, metadata: DocumentMetadata) -> List[ChunkMetadata]:
        """Create smaller, overlapping chunks for dense documents"""
        chunks = []
        
        try:
            # Use smaller chunk size for aggressive splitting
            small_chunk_size = self.chunk_size // 2
            large_overlap = self.chunk_overlap * 2
            
            for i in range(0, len(content), small_chunk_size - large_overlap):
                chunk_text = content[i:i + small_chunk_size]
                if len(chunk_text.strip()) < 30:
                    continue
                
                chunk_id = f"{metadata.id}_aggressive_{i//small_chunk_size:04d}"
                quality_score, _ = await self.analyze_document_quality(chunk_text)
                
                chunk = ChunkMetadata(
                    chunk_id=chunk_id,
                    document_id=metadata.id,
                    chunk_index=i//small_chunk_size,
                    text=chunk_text,
                    word_count=len(chunk_text.split()),
                    sentence_count=len(sent_tokenize(chunk_text)) if NLTK_AVAILABLE else 1,
                    quality_score=quality_score,
                    semantic_density=self._calculate_semantic_density(chunk_text)
                )
                chunks.append(chunk)
                
        except Exception as e:
            logger.error(f"Aggressive chunking failed: {e}")
        
        return chunks
    
    async def _generate_chunk_embeddings(self, chunks: List[ChunkMetadata]):
        """Generate embeddings for chunks"""
        if not self.embedding_model or not chunks:
            return
        
        try:
            # Extract texts for batch embedding
            texts = [chunk.text for chunk in chunks]
            
            # Generate embeddings in batches to avoid memory issues
            batch_size = 32
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                batch_chunks = chunks[i:i + batch_size]
                
                # Generate embeddings
                loop = asyncio.get_event_loop()
                embeddings = await loop.run_in_executor(
                    None,
                    self.embedding_model.encode,
                    batch_texts
                )
                
                # Assign embeddings to chunks
                for chunk, embedding in zip(batch_chunks, embeddings):
                    chunk.embeddings = embedding
            
            logger.info(f"Generated embeddings for {len(chunks)} chunks")
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
    
    async def _update_corpus_analytics(self, metadata: DocumentMetadata):
        """Update corpus-wide analytics"""
        try:
            self.corpus_analytics.total_documents += 1
            self.corpus_analytics.total_chunks += metadata.chunk_count
            self.corpus_analytics.total_words += metadata.word_count
            
            # Update averages
            total_docs = self.corpus_analytics.total_documents
            self.corpus_analytics.avg_quality_score = (
                (self.corpus_analytics.avg_quality_score * (total_docs - 1) + metadata.quality_score) / total_docs
            )
            
            # Update topic distribution
            for topic in metadata.topics:
                self.corpus_analytics.topic_distribution[topic] = \
                    self.corpus_analytics.topic_distribution.get(topic, 0) + 1
            
            # Update language distribution
            self.corpus_analytics.language_distribution[metadata.language] = \
                self.corpus_analytics.language_distribution.get(metadata.language, 0) + 1
            
        except Exception as e:
            logger.error(f"Analytics update failed: {e}")
    
    async def _background_processor(self):
        """Background document processing queue"""
        while True:
            try:
                # Process queued documents
                if not self.processing_queue.empty():
                    file_path, strategy = await self.processing_queue.get()
                    await self.process_document(file_path, strategy)
                    self.processing_queue.task_done()
                else:
                    await asyncio.sleep(10)  # Wait for new documents
                    
            except Exception as e:
                logger.error(f"Background processor error: {e}")
                await asyncio.sleep(30)
    
    async def _corpus_optimizer(self):
        """Background corpus optimization"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                # Analyze corpus and generate optimization suggestions
                await self._analyze_corpus_gaps()
                await self._suggest_optimizations()
                
            except Exception as e:
                logger.error(f"Corpus optimizer error: {e}")
    
    async def _analyze_corpus_gaps(self):
        """Analyze corpus for coverage gaps"""
        try:
            # Analyze topic coverage
            topic_counts = self.corpus_analytics.topic_distribution
            
            # Identify underrepresented topics
            if topic_counts:
                avg_count = sum(topic_counts.values()) / len(topic_counts)
                self.corpus_analytics.coverage_gaps = [
                    topic for topic, count in topic_counts.items()
                    if count < avg_count * 0.5
                ]
            
        except Exception as e:
            logger.error(f"Corpus gap analysis failed: {e}")
    
    async def _suggest_optimizations(self):
        """Generate corpus optimization suggestions"""
        try:
            suggestions = []
            
            # Quality-based suggestions
            low_quality_docs = [
                doc for doc in self.document_registry.values()
                if doc.quality_score < self.quality_threshold
            ]
            
            if low_quality_docs:
                suggestions.append({
                    'type': 'quality_improvement',
                    'priority': 'high',
                    'description': f'Review {len(low_quality_docs)} low-quality documents',
                    'documents': [doc.id for doc in low_quality_docs[:5]]
                })
            
            # Coverage gap suggestions
            if self.corpus_analytics.coverage_gaps:
                suggestions.append({
                    'type': 'coverage_expansion',
                    'priority': 'medium',
                    'description': f'Add content for underrepresented topics',
                    'topics': self.corpus_analytics.coverage_gaps[:5]
                })
            
            # Processing strategy suggestions
            dense_docs = [
                doc for doc in self.document_registry.values()
                if doc.word_count > 2000 and doc.processing_strategy == ProcessingStrategy.STANDARD
            ]
            
            if dense_docs:
                suggestions.append({
                    'type': 'processing_optimization',
                    'priority': 'low',
                    'description': f'Consider aggressive splitting for {len(dense_docs)} dense documents',
                    'documents': [doc.id for doc in dense_docs[:3]]
                })
            
            self.optimization_suggestions = suggestions
            logger.info(f"Generated {len(suggestions)} optimization suggestions")
            
        except Exception as e:
            logger.error(f"Optimization suggestion generation failed: {e}")
    
    async def batch_process_documents(
        self,
        file_paths: List[str],
        processing_strategy: ProcessingStrategy = ProcessingStrategy.STANDARD
    ) -> List[DocumentMetadata]:
        """Process multiple documents efficiently"""
        results = []
        
        try:
            # Process documents in parallel (limited concurrency)
            semaphore = asyncio.Semaphore(4)  # Process 4 documents simultaneously
            
            async def process_with_semaphore(file_path):
                async with semaphore:
                    return await self.process_document(file_path, processing_strategy)
            
            tasks = [process_with_semaphore(fp) for fp in file_paths]
            processed_docs = await asyncio.gather(*tasks, return_exceptions=True)
            
            for doc in processed_docs:
                if isinstance(doc, DocumentMetadata):
                    results.append(doc)
                elif isinstance(doc, Exception):
                    logger.error(f"Document processing failed: {doc}")
            
            logger.info(f"Batch processed {len(results)}/{len(file_paths)} documents successfully")
            
        except Exception as e:
            logger.error(f"Batch processing failed: {e}")
        
        return results
    
    async def get_corpus_report(self) -> Dict[str, Any]:
        """Get comprehensive corpus analysis report"""
        try:
            # Calculate processing efficiency
            total_processing_time = sum(doc.processing_time for doc in self.document_registry.values())
            avg_processing_time = total_processing_time / max(1, len(self.document_registry))
            
            # Quality distribution
            quality_distribution = {
                'excellent': 0,
                'good': 0,
                'fair': 0,
                'poor': 0
            }
            
            for doc in self.document_registry.values():
                if doc.quality_score >= 0.8:
                    quality_distribution['excellent'] += 1
                elif doc.quality_score >= 0.7:
                    quality_distribution['good'] += 1
                elif doc.quality_score >= 0.5:
                    quality_distribution['fair'] += 1
                else:
                    quality_distribution['poor'] += 1
            
            return {
                'corpus_analytics': {
                    'total_documents': self.corpus_analytics.total_documents,
                    'total_chunks': self.corpus_analytics.total_chunks,
                    'total_words': self.corpus_analytics.total_words,
                    'avg_quality_score': self.corpus_analytics.avg_quality_score,
                    'avg_processing_time': avg_processing_time
                },
                'quality_distribution': quality_distribution,
                'topic_distribution': dict(list(self.corpus_analytics.topic_distribution.items())[:10]),
                'language_distribution': self.corpus_analytics.language_distribution,
                'coverage_gaps': self.corpus_analytics.coverage_gaps,
                'optimization_suggestions': self.optimization_suggestions,
                'processing_queue_size': self.processing_queue.qsize(),
                'chunk_quality_stats': {
                    'high_quality_chunks': len([c for c in self.chunk_registry.values() if c.quality_score >= 0.7]),
                    'avg_semantic_density': sum(c.semantic_density for c in self.chunk_registry.values()) / max(1, len(self.chunk_registry))
                },
                'generated_at': time.time()
            }
            
        except Exception as e:
            logger.error(f"Failed to generate corpus report: {e}")
            return {'error': str(e)}
    
    async def optimize_document_reprocessing(self) -> Dict[str, int]:
        """Optimize existing documents with better strategies"""
        optimization_results = {
            'reprocessed': 0,
            'improved': 0,
            'failed': 0
        }
        
        try:
            # Identify documents that could benefit from reprocessing
            candidates = []
            
            for doc in self.document_registry.values():
                should_reprocess = False
                new_strategy = doc.processing_strategy
                
                # Dense documents should use aggressive splitting
                if (doc.word_count > 2000 and 
                    doc.processing_strategy == ProcessingStrategy.STANDARD):
                    should_reprocess = True
                    new_strategy = ProcessingStrategy.AGGRESSIVE_SPLIT
                
                # Low quality documents should use semantic chunking
                elif (doc.quality_score < 0.6 and 
                      doc.processing_strategy != ProcessingStrategy.SEMANTIC_CHUNKS):
                    should_reprocess = True
                    new_strategy = ProcessingStrategy.SEMANTIC_CHUNKS
                
                if should_reprocess:
                    candidates.append((doc.file_path, new_strategy, doc.quality_score))
            
            # Reprocess candidates
            for file_path, strategy, old_quality in candidates[:10]:  # Limit to 10 at a time
                try:
                    new_metadata = await self.process_document(file_path, strategy)
                    optimization_results['reprocessed'] += 1
                    
                    if new_metadata and new_metadata.quality_score > old_quality:
                        optimization_results['improved'] += 1
                        
                except Exception as e:
                    logger.error(f"Reprocessing failed for {file_path}: {e}")
                    optimization_results['failed'] += 1
            
            logger.info(f"Document optimization completed: {optimization_results}")
            
        except Exception as e:
            logger.error(f"Document optimization failed: {e}")
        
        return optimization_results


# Global service instance
_document_expansion_service: Optional[DocumentExpansionService] = None


async def initialize_document_expansion_service(**kwargs) -> Optional[DocumentExpansionService]:
    """Initialize global document expansion service"""
    global _document_expansion_service
    
    try:
        _document_expansion_service = DocumentExpansionService(**kwargs)
        success = await _document_expansion_service.initialize()
        
        if success:
            logger.info("Document expansion service initialized successfully")
            return _document_expansion_service
        else:
            _document_expansion_service = None
            logger.error("Document expansion service initialization failed")
            return None
            
    except Exception as e:
        logger.error(f"Failed to initialize document expansion service: {e}")
        return None


def get_document_expansion_service() -> Optional[DocumentExpansionService]:
    """Get global document expansion service"""
    return _document_expansion_service