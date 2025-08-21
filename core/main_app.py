#!/usr/bin/env python3
"""
FastAPI Application Runner
Starts the RAG system server with uvicorn
"""

import uvicorn
import os
import sys

def main():
    """Start the FastAPI application with uvicorn"""
    # Set default host and port
    host = os.getenv("RAG_HOST", "0.0.0.0")
    port = int(os.getenv("RAG_PORT", "8000"))
    
    # Configuration
    config = {
        "app": "core.main:app",
        "host": host,
        "port": port,
        "reload": os.getenv("RAG_DEBUG", "false").lower() == "true",
        "access_log": True,
        "log_level": os.getenv("RAG_LOG_LEVEL", "info"),
    }
    
    print(f"Starting RAG System server on http://{host}:{port}")
    print(f"API Documentation: http://{host}:{port}/docs")
    print(f"Web Interface: http://{host}:{port}/ui")
    print(f"Health Check: http://{host}:{port}/api/v1/health")
    print("-" * 50)
    
    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        print("\nShutting down RAG System...")
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()