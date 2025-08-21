#!/usr/bin/env python3
"""
Production RAG System Startup Script
Starts the core RAG system with optimized settings
"""

import sys
import os

# Add src to path if it exists
if os.path.exists("src"):
    sys.path.insert(0, "src")

# Try to import from different locations
try:
    from core.main_app import main
except ImportError:
    try:
        from src.main_app import main
    except ImportError:
        print("Error: Could not find core RAG application module")
        print("Please ensure the application is properly installed")
        sys.exit(1)

if __name__ == "__main__":
    main()