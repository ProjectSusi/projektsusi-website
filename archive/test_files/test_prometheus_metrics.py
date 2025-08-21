#!/usr/bin/env python3
"""
Test Prometheus Metrics Integration
Verifies that metrics are properly collected and exported
"""
import os
import requests
import json
import time
import tempfile
from pathlib import Path

# API endpoint
BASE_URL = "http://localhost:8000"

def check_metrics_availability():
    """Check if metrics endpoints are accessible"""
    print("=== Checking Metrics Availability ===")
    
    # Check metrics health
    try:
        response = requests.get(f"{BASE_URL}/metrics/health")
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Metrics health: {health.get('status', 'unknown')}")
            print(f"   Metrics enabled: {health.get('metrics_enabled', False)}")
            print(f"   Uptime: {health.get('uptime_seconds', 0):.1f}s")
            return health.get('metrics_enabled', False)
        else:
            print(f"❌ Metrics health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking metrics health: {e}")
        return False

def check_prometheus_endpoint():
    """Check if Prometheus metrics endpoint is working"""
    print("\n=== Checking Prometheus Metrics Endpoint ===")
    
    try:
        response = requests.get(f"{BASE_URL}/metrics")
        if response.status_code == 200:
            metrics_data = response.text
            
            # Count metrics
            metric_lines = [line for line in metrics_data.split('\n') 
                          if line.strip() and not line.startswith('#')]
            
            print(f"✅ Prometheus metrics endpoint accessible")
            print(f"   Content-Type: {response.headers.get('Content-Type', 'unknown')}")
            print(f"   Total metric lines: {len(metric_lines)}")
            
            # Look for RAG-specific metrics
            rag_metrics = []
            for line in metric_lines[:50]:  # Check first 50 metrics
                if any(keyword in line for keyword in ['query_', 'document_', 'llm_', 'vector_']):
                    rag_metrics.append(line.strip())
            
            if rag_metrics:
                print(f"   RAG-specific metrics found: {len(rag_metrics)}")
                print("   Sample metrics:")
                for metric in rag_metrics[:5]:  # Show first 5
                    print(f"     {metric}")
            else:
                print("   ⚠️ No RAG-specific metrics found yet (may appear after usage)")
            
            return True
        else:
            print(f"❌ Prometheus endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accessing Prometheus endpoint: {e}")
        return False

def test_metrics_collection():
    """Test that metrics are collected during operations"""
    print("\n=== Testing Metrics Collection ===")
    
    # 1. Upload a document to generate metrics
    print("1. Testing document upload metrics...")
    test_content = "This is a test document for metrics collection verification."
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write(test_content)
        tmp_file_path = tmp_file.name
    
    uploaded_doc_id = None
    try:
        with open(tmp_file_path, 'rb') as f:
            files = {'file': ('metrics_test_doc.txt', f, 'text/plain')}
            response = requests.post(f"{BASE_URL}/api/v1/documents", files=files)
        
        if response.status_code == 200:
            upload_result = response.json()
            uploaded_doc_id = upload_result['id']
            print(f"   ✅ Document uploaded. ID: {uploaded_doc_id}")
        else:
            print(f"   ❌ Document upload failed: {response.status_code}")
    finally:
        os.unlink(tmp_file_path)
    
    # Wait for metrics to be recorded
    time.sleep(1)
    
    # 2. Execute a query to generate metrics
    print("2. Testing query metrics...")
    query_data = {"query": "test document metrics collection"}
    response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data)
    
    if response.status_code == 200:
        print("   ✅ Query executed successfully")
    else:
        print(f"   ❌ Query failed: {response.status_code}")
    
    # Wait for metrics to be recorded
    time.sleep(1)
    
    # 3. Check if new metrics appeared
    print("3. Verifying metrics were recorded...")
    try:
        response = requests.get(f"{BASE_URL}/metrics")
        if response.status_code == 200:
            metrics_data = response.text
            
            # Look for evidence of our operations
            metrics_found = []
            for line in metrics_data.split('\n'):
                if line.strip() and not line.startswith('#'):
                    if any(keyword in line for keyword in ['http_requests_total', 'documents_', 'queries_']):
                        metrics_found.append(line.strip())
            
            if metrics_found:
                print(f"   ✅ Found {len(metrics_found)} operational metrics")
                print("   Sample operational metrics:")
                for metric in metrics_found[:5]:
                    print(f"     {metric}")
            else:
                print("   ⚠️ No operational metrics found")
        else:
            print(f"   ❌ Failed to retrieve metrics: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error checking metrics: {e}")
    
    # 4. Clean up - delete test document
    if uploaded_doc_id:
        try:
            response = requests.delete(f"{BASE_URL}/api/v1/documents/{uploaded_doc_id}")
            if response.status_code == 200:
                print("   ✅ Test document cleaned up")
        except Exception:
            pass  # Clean up failure is not critical

def test_metrics_configuration():
    """Test metrics configuration endpoint"""
    print("\n=== Testing Metrics Configuration ===")
    
    try:
        response = requests.get(f"{BASE_URL}/metrics/config")
        if response.status_code == 200:
            config = response.json()
            print(f"✅ Metrics configuration accessible")
            print(f"   Metrics enabled: {config.get('metrics_enabled', False)}")
            print(f"   Prometheus available: {config.get('prometheus_available', False)}")
            
            endpoints = config.get('endpoints', {})
            print(f"   Available endpoints: {len(endpoints)}")
            for name, path in endpoints.items():
                print(f"     {name}: {path}")
            
            if 'registry_info' in config:
                reg_info = config['registry_info']
                print(f"   Registry collectors: {reg_info.get('collectors_count', 0)}")
            
        else:
            print(f"❌ Metrics config failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking metrics config: {e}")

def test_system_metrics():
    """Test system resource metrics"""
    print("\n=== Testing System Metrics ===")
    
    try:
        # Trigger system metrics update
        response = requests.post(f"{BASE_URL}/metrics/update-system")
        if response.status_code == 200:
            print("✅ System metrics update successful")
        else:
            print(f"⚠️ System metrics update returned: {response.status_code}")
        
        # Check if system metrics are available
        response = requests.get(f"{BASE_URL}/metrics")
        if response.status_code == 200:
            metrics_data = response.text
            
            system_metrics = []
            for line in metrics_data.split('\n'):
                if line.strip() and not line.startswith('#'):
                    if any(keyword in line for keyword in ['system_cpu', 'system_memory', 'application_uptime']):
                        system_metrics.append(line.strip())
            
            if system_metrics:
                print(f"✅ Found {len(system_metrics)} system metrics")
                print("   Sample system metrics:")
                for metric in system_metrics[:3]:
                    print(f"     {metric}")
            else:
                print("⚠️ No system metrics found")
        
    except Exception as e:
        print(f"❌ Error testing system metrics: {e}")

def get_metrics_sample():
    """Get a sample of current metrics for debugging"""
    print("\n=== Metrics Sample ===")
    
    try:
        response = requests.get(f"{BASE_URL}/metrics/sample")
        if response.status_code == 200:
            sample = response.json()
            print(f"✅ Metrics sample retrieved")
            print(f"   Uptime: {sample.get('uptime_seconds', 0):.1f}s")
            print(f"   Total metric lines: {sample.get('total_metrics_lines', 0)}")
            
            preview = sample.get('metrics_preview', [])
            if preview:
                print("   Sample metrics preview:")
                for line in preview[:10]:  # Show first 10 lines
                    print(f"     {line}")
        else:
            print(f"❌ Metrics sample failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting metrics sample: {e}")

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("❌ Server is not running properly. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Please start the server first.")
        exit(1)
    
    print("=== Prometheus Metrics Integration Test ===")
    
    # Run all tests
    metrics_enabled = check_metrics_availability()
    
    if metrics_enabled:
        prometheus_working = check_prometheus_endpoint()
        
        if prometheus_working:
            test_metrics_collection()
            test_system_metrics()
            test_metrics_configuration()
            get_metrics_sample()
        else:
            print("⚠️ Prometheus endpoint not working, skipping detailed tests")
    else:
        print("⚠️ Metrics not enabled, limited testing possible")
    
    print("\n=== Prometheus Metrics Test Complete ===")
    print("To manually check metrics:")
    print(f"  - Prometheus endpoint: {BASE_URL}/metrics")
    print(f"  - Metrics health: {BASE_URL}/metrics/health")
    print(f"  - Metrics config: {BASE_URL}/metrics/config")