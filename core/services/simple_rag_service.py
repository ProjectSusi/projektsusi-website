"""
Simple Professional RAG Service
Clean, maintainable RAG system with AI answers only
"""

import logging
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

from .response_cache import ResponseCache

# Import metrics collection
try:
    from ..middleware.metrics_middleware import get_query_metrics, get_llm_metrics, get_db_metrics
    METRICS_AVAILABLE = True
except ImportError:
    METRICS_AVAILABLE = False

# Import performance monitoring
try:
    from .performance_monitoring_service import get_performance_service, time_operation
    PERFORMANCE_MONITORING_AVAILABLE = True
except ImportError:
    PERFORMANCE_MONITORING_AVAILABLE = False

logger = logging.getLogger(__name__)


class RAGConfig:
    """Simple configuration with environment variables"""

    def __init__(self):
        # Core settings - simple and clear
        self.similarity_threshold = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.3"))
        self.max_results = int(os.getenv("RAG_MAX_RESULTS", "3"))
        self.require_sources = bool(
            os.getenv("RAG_REQUIRE_SOURCES", "true").lower() == "true"
        )
        self.max_query_length = int(os.getenv("RAG_MAX_QUERY_LENGTH", "500"))
        
        # Configurable document filters
        self.excluded_keywords = os.getenv(
            "RAG_EXCLUDED_KEYWORDS", 
            "zero-hallucination,guidelines for following,only use information"
        ).split(",")
        self.excluded_keywords = [k.strip().lower() for k in self.excluded_keywords if k.strip()]
        
        self.excluded_document_ids = os.getenv("RAG_EXCLUDED_DOC_IDS", "").split(",")
        self.excluded_document_ids = [int(id.strip()) for id in self.excluded_document_ids if id.strip()]

        logger.info(
            f"RAG Config: threshold={self.similarity_threshold}, max_results={self.max_results}, "
            f"require_sources={self.require_sources}, excluded_keywords={len(self.excluded_keywords)}"
        )


class SimpleRAGService:
    """Clean, professional RAG service - AI answers only"""

    def __init__(self, vector_repo, llm_client, audit_repo=None):
        self.vector_repo = vector_repo
        self.llm_client = llm_client
        self.audit_repo = audit_repo
        
        # Initialize metrics collectors
        if METRICS_AVAILABLE:
            self.query_metrics = get_query_metrics()
            self.llm_metrics = get_llm_metrics()
            self.db_metrics = get_db_metrics()
        else:
            self.query_metrics = None
            self.llm_metrics = None
            self.db_metrics = None
        
        # Initialize performance monitoring
        if PERFORMANCE_MONITORING_AVAILABLE:
            self.performance_service = get_performance_service()
        else:
            self.performance_service = None
        self.config = RAGConfig()
        self.cache = ResponseCache()  # Add response caching for performance

        logger.info("Simple RAG Service initialized with caching")

    @time_operation("rag_query_processing")
    async def answer_query(self, query: str) -> Dict[str, Any]:
        """
        Process query and return AI answer with sources

        Args:
            query: User question

        Returns:
            Dict with answer, sources, and metadata
        """
        # Initialize metrics context
        metrics_context = None
        if self.query_metrics:
            metrics_context = self.query_metrics.record_query_start("default")
        
        try:
            # 1. Validate input
            if self.query_metrics:
                self.query_metrics.record_component_start(metrics_context, "validation")
            
            if not self._is_valid_query(query):
                if self.query_metrics:
                    self.query_metrics.record_component_end(metrics_context, "validation")
                    self.query_metrics.record_query_end(metrics_context, "invalid_query")
                
                # Log invalid query attempt
                if self.audit_repo:
                    try:
                        from ..repositories.audit_repository import AuditEntry, AuditEventType, DataClassification
                        audit_entry = AuditEntry(
                            event_type=AuditEventType.QUERY_EXECUTED,
                            action_description="Invalid query rejected",
                            query_text=query[:100] + "..." if len(query) > 100 else query,
                            response_status=400,
                            data_classification=DataClassification.INTERNAL,
                            metadata={"validation_error": "Query too short or invalid", "query_length": len(query)}
                        )
                        import asyncio
                        try:
                            loop = asyncio.get_event_loop()
                            loop.create_task(self.audit_repo.log_event(audit_entry))
                        except:
                            pass
                    except:
                        pass
                return self._error_response("Invalid query")
            
            if self.query_metrics:
                self.query_metrics.record_component_end(metrics_context, "validation")
                self.query_metrics.record_component_start(metrics_context, "document_search")

            # 2. Search for relevant documents
            search_results = await self._search_documents(query)
            
            if self.query_metrics:
                self.query_metrics.record_component_end(metrics_context, "document_search")

            if not search_results:
                if self.query_metrics:
                    self.query_metrics.record_query_end(metrics_context, "no_results")
                return self._no_results_response()

            # 3. Generate AI answer
            if self.query_metrics:
                self.query_metrics.record_component_start(metrics_context, "llm_generation")
            
            ai_response = await self._generate_answer(query, search_results)
            
            if self.query_metrics:
                self.query_metrics.record_component_end(metrics_context, "llm_generation")

            # 4. Format response
            response = {
                "answer": ai_response["text"],
                "sources": ai_response["sources"],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "query": query,
                "confidence": ai_response["confidence"],
            }

            # 5. Audit log
            if self.audit_repo:
                self._audit_successful_query(query, response)

            # Record successful query completion
            if self.query_metrics:
                self.query_metrics.record_query_end(metrics_context, "success")
                # Record relevance score if available
                if "confidence" in ai_response and ai_response["confidence"] is not None:
                    self.query_metrics.record_query_relevance(ai_response["confidence"])
            
            # Record performance monitoring data
            if self.performance_service:
                total_duration = time.time() - time.time()  # This will be handled by decorator
                self.performance_service.record_performance("query_success_rate", 1.0)
                self.performance_service.record_performance("query_confidence_score", ai_response.get("confidence", 0.0))
                self.performance_service.record_performance("query_sources_found", len(ai_response.get("sources", [])))

            return response

        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            
            # Record failed query
            if self.query_metrics:
                self.query_metrics.record_query_end(metrics_context, "error")
            
            # Record performance monitoring for errors
            if self.performance_service:
                self.performance_service.record_performance("query_success_rate", 0.0)
                self.performance_service.record_performance("query_error_rate", 1.0)
            
            # Log query failure
            if self.audit_repo:
                try:
                    from ..repositories.audit_repository import AuditEntry, AuditEventType, DataClassification
                    audit_entry = AuditEntry(
                        event_type=AuditEventType.QUERY_EXECUTED,
                        action_description=f"Query processing failed: {str(e)}",
                        query_text=query[:100] + "..." if len(query) > 100 else query,  # Truncate long queries
                        response_status=500,
                        data_classification=DataClassification.INTERNAL,
                        metadata={"error": str(e), "query_length": len(query)}
                    )
                    # Schedule async logging
                    import asyncio
                    try:
                        loop = asyncio.get_event_loop()
                        loop.create_task(self.audit_repo.log_event(audit_entry))
                    except:
                        pass  # Don't fail if audit logging fails
                except:
                    pass  # Don't fail if audit logging fails
            return self._error_response(f"Processing failed: {str(e)}")

    def _is_valid_query(self, query: str) -> bool:
        """Simple query validation"""
        if not query or len(query.strip()) < 3:
            return False
        if len(query) > self.config.max_query_length:
            return False
        return True

    async def _search_documents(self, query: str) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        try:
            # Record vector search timing
            vector_search_start = time.time()
            
            # Get search results
            search_results = await self.vector_repo.search_similar_text(
                query=query,
                limit=self.config.max_results,
                threshold=0.01,  # Very low threshold, we'll filter later
            )
            
            # Record vector search metrics
            if METRICS_AVAILABLE:
                try:
                    from ..middleware.metrics_middleware import get_metrics_service
                    metrics_service = get_metrics_service()
                    if metrics_service and metrics_service.enabled:
                        vector_search_duration = time.time() - vector_search_start
                        status = "success" if search_results.items else "no_results"
                        metrics_service.record_vector_search(status, vector_search_duration)
                except Exception:
                    pass  # Don't fail if metrics recording fails

            if not search_results.items:
                return []

            # Filter by threshold and format
            relevant_results = []
            for item in search_results.items:
                similarity = item.metadata.get("similarity_score", 0.0)

                # Apply configurable document filters
                content_lower = item.text_content.lower()
                
                # Check excluded keywords
                skip_document = False
                for keyword in self.config.excluded_keywords:
                    if keyword in content_lower:
                        logger.info(
                            f"Skipping document {item.document_id} (contains excluded keyword: '{keyword}')"
                        )
                        skip_document = True
                        break
                
                # Check excluded document IDs
                if item.document_id in self.config.excluded_document_ids:
                    logger.info(
                        f"Skipping document {item.document_id} (in excluded document ID list)"
                    )
                    skip_document = True
                
                if skip_document:
                    continue

                if similarity >= self.config.similarity_threshold:
                    relevant_results.append(
                        {
                            "text": item.text_content,
                            "document_id": item.document_id,
                            "similarity": similarity,
                            "chunk_id": item.id,
                        }
                    )

            logger.info(
                f"Found {len(relevant_results)} relevant documents (threshold: {self.config.similarity_threshold})"
            )
            return relevant_results

        except Exception as e:
            logger.error(f"Document search failed: {e}")
            return []

    async def _generate_answer(
        self, query: str, search_results: List[Dict]
    ) -> Dict[str, Any]:
        """Generate AI answer from search results"""
        try:
            if not search_results:
                return {
                    "text": "Keine relevanten Informationen gefunden.",
                    "sources": [],
                    "confidence": 0.0,
                }

            # Prepare context
            context_parts = []
            sources = []

            for i, result in enumerate(search_results, 1):
                context_parts.append(f"[Quelle {i}]: {result['text']}")
                sources.append(
                    {
                        "id": i,
                        "document_id": result["document_id"],
                        "similarity": result["similarity"],
                        "download_url": f"/api/v1/documents/{result['document_id']}/download",
                    }
                )

            context = "\n\n".join(context_parts)

            # Smart context truncation - preserve sentence boundaries
            max_context_length = int(os.getenv("RAG_MAX_CONTEXT_LENGTH", "3000"))
            if len(context) > max_context_length:
                # Find last sentence boundary before limit
                truncate_at = max_context_length
                for punct in [". ", "! ", "? ", "\n\n"]:
                    last_punct = context.rfind(punct, 0, max_context_length)
                    if last_punct > max_context_length * 0.8:  # Within 80% of limit
                        truncate_at = last_punct + len(punct) - 1
                        break
                
                context = context[:truncate_at] + "\n\n[...weitere Inhalte verfügbar...]"

            # TEMPORARILY DISABLE CACHE to debug
            # cached_response = self.cache.get(query, context)
            # if cached_response:
            #     return cached_response

            # Re-enable cache for better performance
            cached_response = self.cache.get(query, context)
            if cached_response:
                # Return cached response
                return cached_response

            # Generate response from actual search results
            llm_start = time.time()
            
            response = self.llm_client.generate_answer(
                query=query,
                context=context,
                max_tokens=512,  # Allow more detailed answers
                temperature=0.3,  # Slightly higher for more natural responses
                max_retries=2,  # Allow retry for reliability
            )
            
            # Record LLM metrics
            if self.llm_metrics:
                llm_duration = time.time() - llm_start
                llm_status = "success" if response else "failure"
                # Estimate token counts (rough approximation)
                input_tokens = len(context.split()) + len(query.split())
                output_tokens = len(response.split()) if response else 0
                
                self.llm_metrics.record_request(
                    model="ollama",  # Default model name
                    status=llm_status,
                    duration=llm_duration,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens
                )

            answer_text = response if response else "Keine Antwort generiert."

            # Add source footer with configurable emoji support
            if sources and self.config.require_sources:
                use_emoji = os.getenv("RAG_USE_EMOJI", "false").lower() == "true"
                
                if use_emoji:
                    source_header = "\n\n📚 Quellen:\n"
                else:
                    source_header = "\n\nQuellen:\n"
                
                source_lines = [
                    f"[Quelle {s['id']}] Dokument {s['document_id']} - {s['download_url']}"
                    for s in sources
                ]
                
                answer_text += source_header + "\n".join(source_lines)

            result = {
                "text": answer_text,
                "sources": sources,
                "confidence": max(r["similarity"] for r in search_results),
            }

            # Cache the result for future queries
            self.cache.set(query, context, result)

            return result

        except Exception as e:
            logger.error(f"AI answer generation failed: {e}")
            return {
                "text": "Fehler bei der Antwortgenerierung.",
                "sources": [],
                "confidence": 0.0,
            }

    def _no_results_response(self) -> Dict[str, Any]:
        """Response when no relevant documents found"""
        return {
            "answer": "Dazu finde ich keine Informationen in den verfügbaren Dokumenten.",
            "sources": [],
            "timestamp": datetime.utcnow().isoformat(),
            "confidence": 0.0,
            "query": "",
        }

    def _error_response(self, message: str) -> Dict[str, Any]:
        """Response for errors"""
        return {"error": message, "timestamp": datetime.utcnow().isoformat()}

    def _audit_successful_query(self, query: str, response: Dict[str, Any]):
        """Comprehensive audit logging for queries"""
        try:
            if self.audit_repo:
                from ..repositories.audit_repository import AuditEntry, AuditEventType, DataClassification
                
                # Determine if query contains sensitive information
                sensitive_keywords = ['password', 'personal', 'private', 'confidential']
                contains_sensitive = any(keyword in query.lower() for keyword in sensitive_keywords)
                
                audit_entry = AuditEntry(
                    event_type=AuditEventType.QUERY_EXECUTED,
                    action_description=f"Query executed successfully",
                    query_text=query if not contains_sensitive else "[REDACTED - sensitive content]",
                    response_status=200,
                    data_classification=DataClassification.PERSONAL_DATA if contains_sensitive else DataClassification.INTERNAL,
                    processing_time_ms=0,  # Would need timing measurement
                    metadata={
                        "query_length": len(query),
                        "sources_found": len(response.get('sources', [])),
                        "confidence": response.get('confidence', 0.0),
                        "sources_ids": [s.get('id') for s in response.get('sources', []) if s.get('id')],
                        "answer_length": len(response.get('answer', '')),
                        "timestamp": response.get('timestamp')
                    }
                )
                
                # Async audit logging (non-blocking)
                import asyncio
                if hasattr(self.audit_repo, 'log_event'):
                    # Schedule the audit logging without blocking
                    try:
                        loop = asyncio.get_event_loop()
                        loop.create_task(self.audit_repo.log_event(audit_entry))
                    except RuntimeError:
                        # If no event loop, just log for now
                        logger.info(
                            f"Query audit: query_length={len(query)}, sources={len(response.get('sources', []))}, confidence={response.get('confidence', 0.0)}"
                        )
                else:
                    logger.info(
                        f"Query audit: query_length={len(query)}, sources={len(response.get('sources', []))}, confidence={response.get('confidence', 0.0)}"
                    )
        except Exception as e:
            logger.warning(f"Audit logging failed: {e}")

    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "service": "Simple RAG Service",
            "mode": "AI answers only",
            "config": {
                "similarity_threshold": self.config.similarity_threshold,
                "max_results": self.config.max_results,
                "require_sources": self.config.require_sources,
                "max_query_length": self.config.max_query_length,
            },
            "healthy": True,
        }
