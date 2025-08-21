#!/usr/bin/env python3
"""
Test multi-tenancy integration with tenant isolation
"""
import os
import requests
import json
import time
from pathlib import Path
import tempfile

# API endpoint
BASE_URL = "http://localhost:8000"

def simulate_tenant_request(tenant_header, path="/api/v1/query", method="POST", data=None):
    """Make a request with tenant header to simulate multi-tenant access"""
    headers = {}
    if tenant_header:
        headers["X-Tenant-ID"] = tenant_header
    
    if method == "POST":
        headers["Content-Type"] = "application/json"
        response = requests.post(f"{BASE_URL}{path}", headers=headers, json=data)
    else:
        response = requests.get(f"{BASE_URL}{path}", headers=headers)
    
    return response

def test_multitenancy_isolation():
    """Test multi-tenant document isolation"""
    
    print("=== Testing Multi-Tenancy Document Isolation ===")
    
    # Test data for different tenants
    tenant_documents = {
        "tenant1": "This document belongs to tenant 1. It contains confidential information about Company A.",
        "tenant2": "This document belongs to tenant 2. It contains sensitive data about Company B.",
        "tenant3": "This document belongs to tenant 3. It contains proprietary information about Company C."
    }
    
    uploaded_docs = {}
    
    # 1. Upload documents for different tenants
    print("\n1. Uploading documents for different tenants...")
    for tenant_id, content in tenant_documents.items():
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Upload document with tenant header
            headers = {"X-Tenant-ID": tenant_id}
            with open(tmp_file_path, 'rb') as f:
                files = {'file': (f'{tenant_id}_document.txt', f, 'text/plain')}
                response = requests.post(f"{BASE_URL}/api/v1/documents", files=files, headers=headers)
            
            if response.status_code == 200:
                upload_result = response.json()
                uploaded_docs[tenant_id] = upload_result['id']
                print(f"✅ Uploaded document for {tenant_id}, ID: {upload_result['id']}")
            else:
                print(f"❌ Failed to upload for {tenant_id}: {response.status_code}")
                print(response.json())
                return
        finally:
            os.unlink(tmp_file_path)
    
    # Wait for processing
    print("\n2. Waiting for document processing...")
    time.sleep(3)
    
    # 3. Test tenant isolation in queries
    print("\n3. Testing tenant isolation in queries...")
    
    test_cases = [
        {
            "tenant": "tenant1",
            "query": "Company A confidential",
            "should_find": True,
            "should_not_find": ["Company B", "Company C"]
        },
        {
            "tenant": "tenant2", 
            "query": "Company B sensitive",
            "should_find": True,
            "should_not_find": ["Company A", "Company C"]
        },
        {
            "tenant": "tenant3",
            "query": "Company C proprietary",
            "should_find": True,
            "should_not_find": ["Company A", "Company B"]
        }
    ]
    
    for test_case in test_cases:
        tenant = test_case["tenant"]
        query = test_case["query"]
        
        print(f"\n   Testing {tenant} query: '{query}'")
        
        # Query with tenant header
        query_data = {"query": query, "k": 5}
        response = simulate_tenant_request(tenant, "/api/v1/query", "POST", query_data)
        
        if response.status_code == 200:
            result = response.json()
            answer = result.get('answer', '')
            sources = result.get('sources', [])
            
            print(f"   Answer preview: {answer[:100]}...")
            print(f"   Sources found: {len(sources)}")
            
            # Check if answer contains expected information
            if test_case["should_find"] and any(term in answer.lower() for term in [tenant.replace('tenant', 'company'), 'confidential', 'sensitive', 'proprietary']):
                print(f"   ✅ Found expected information for {tenant}")
            else:
                print(f"   ⚠️ May not have found expected information for {tenant}")
            
            # Check that answer doesn't contain information from other tenants
            leak_detected = False
            for should_not_find in test_case["should_not_find"]:
                if should_not_find.lower() in answer.lower():
                    print(f"   ❌ SECURITY ISSUE: Found {should_not_find} in {tenant} results!")
                    leak_detected = True
            
            if not leak_detected:
                print(f"   ✅ No cross-tenant information leakage detected")
                
        else:
            print(f"   ❌ Query failed for {tenant}: {response.status_code}")
    
    # 4. Test document access isolation
    print("\n4. Testing document access isolation...")
    
    for accessing_tenant, doc_id in uploaded_docs.items():
        for target_tenant, target_doc_id in uploaded_docs.items():
            # Try to access each document from each tenant
            headers = {"X-Tenant-ID": accessing_tenant}
            response = requests.get(f"{BASE_URL}/api/v1/documents/{target_doc_id}", headers=headers)
            
            if accessing_tenant == target_tenant:
                # Should be able to access own documents
                if response.status_code == 200:
                    print(f"   ✅ {accessing_tenant} can access own document")
                else:
                    print(f"   ❌ {accessing_tenant} cannot access own document (Status: {response.status_code})")
            else:
                # Should NOT be able to access other tenants' documents
                if response.status_code in [403, 404]:
                    print(f"   ✅ {accessing_tenant} correctly blocked from {target_tenant} document")
                elif response.status_code == 200:
                    print(f"   ❌ SECURITY ISSUE: {accessing_tenant} can access {target_tenant} document!")
                else:
                    print(f"   ⚠️ Unexpected response {response.status_code} when {accessing_tenant} tried to access {target_tenant} document")
    
    # 5. Test document download isolation
    print("\n5. Testing document download isolation...")
    
    for accessing_tenant, doc_id in uploaded_docs.items():
        for target_tenant, target_doc_id in uploaded_docs.items():
            # Try to download each document from each tenant
            headers = {"X-Tenant-ID": accessing_tenant}
            response = requests.get(f"{BASE_URL}/api/v1/documents/{target_doc_id}/download", headers=headers)
            
            if accessing_tenant == target_tenant:
                # Should be able to download own documents
                if response.status_code == 200:
                    print(f"   ✅ {accessing_tenant} can download own document")
                    # Verify content
                    content = response.content.decode('utf-8')
                    if accessing_tenant.replace('tenant', 'Company') in content:
                        print(f"   ✅ Downloaded content is correct for {accessing_tenant}")
                else:
                    print(f"   ❌ {accessing_tenant} cannot download own document (Status: {response.status_code})")
            else:
                # Should NOT be able to download other tenants' documents
                if response.status_code in [403, 404]:
                    print(f"   ✅ {accessing_tenant} correctly blocked from downloading {target_tenant} document")
                elif response.status_code == 200:
                    print(f"   ❌ SECURITY ISSUE: {accessing_tenant} can download {target_tenant} document!")
                else:
                    print(f"   ⚠️ Unexpected response {response.status_code} when {accessing_tenant} tried to download {target_tenant} document")
    
    print("\n=== Multi-Tenancy Test Complete ===")

def check_tenant_middleware():
    """Check if tenant middleware is working"""
    print("\n=== Checking Tenant Middleware ===")
    
    # Test different tenant resolution strategies
    strategies = [
        {"method": "header", "headers": {"X-Tenant-ID": "test-tenant"}, "expected": "test-tenant"},
        {"method": "subdomain", "url": "http://acme.localhost:8000/api/v1/status", "expected": "acme"},
        {"method": "default", "headers": {}, "expected": "1"}  # Default tenant
    ]
    
    for strategy in strategies:
        print(f"\nTesting {strategy['method']} tenant resolution...")
        
        if strategy['method'] == 'subdomain':
            # Note: This would require DNS configuration in real testing
            print("⚠️ Subdomain testing requires DNS configuration (skipping)")
        else:
            headers = strategy.get('headers', {})
            response = requests.get(f"{BASE_URL}/api/v1/status", headers=headers)
            
            if response.status_code == 200:
                print(f"✅ Tenant middleware is working for {strategy['method']}")
            else:
                print(f"❌ Tenant middleware test failed for {strategy['method']}")

if __name__ == "__main__":
    # First check if the server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("Error: Server is not running. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("Error: Cannot connect to server. Please start the server first.")
        exit(1)
    
    # Check tenant middleware
    check_tenant_middleware()
    
    # Run multi-tenancy tests
    test_multitenancy_isolation()