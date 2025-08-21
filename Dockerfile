# Multi-stage Dockerfile for ProjektSusui RAG System

# Stage 1: Builder
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy requirements first for better caching
COPY simple_requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1000 raguser && \
    useradd -r -u 1000 -g raguser -m -s /bin/bash raguser && \
    mkdir -p /app/data /app/logs /app/uploads && \
    chown -R raguser:raguser /app

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder --chown=raguser:raguser /root/.local /home/raguser/.local

# Copy application code
COPY --chown=raguser:raguser . .

# Ensure scripts are executable
RUN chmod +x scripts/*.sh 2>/dev/null || true

# Set Python path
ENV PATH=/home/raguser/.local/bin:$PATH \
    PYTHONPATH=/app:$PYTHONPATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Switch to non-root user
USER raguser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command - can be overridden
CMD ["python", "run_core.py"]