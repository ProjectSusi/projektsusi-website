#!/usr/bin/env python3
"""
Test encryption integration in document upload/download
"""
import os
import requests
import json
import time
from pathlib import Path
import tempfile

# API endpoint
BASE_URL = "http://localhost:8000"

def test_encryption_integration():
    """Test document encryption at rest"""
    
    print("=== Testing Document Encryption at Rest ===")
    
    # 1. Create a test document
    test_content = "This is a test document for encryption testing. It contains sensitive information that should be encrypted at rest."
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write(test_content)
        tmp_file_path = tmp_file.name
    
    try:
        # 2. Upload the document
        print("\n1. Uploading test document...")
        with open(tmp_file_path, 'rb') as f:
            files = {'file': ('test_encryption.txt', f, 'text/plain')}
            response = requests.post(f"{BASE_URL}/api/v1/documents", files=files)
        
        if response.status_code != 200:
            print(f"Upload failed: {response.status_code}")
            print(response.json())
            return
        
        upload_result = response.json()
        document_id = upload_result['id']
        print(f"Document uploaded successfully. ID: {document_id}")
        
        # 3. Wait for processing
        print("\n2. Waiting for document processing...")
        time.sleep(2)
        
        # 4. Get document details
        print("\n3. Getting document details...")
        response = requests.get(f"{BASE_URL}/api/v1/documents/{document_id}")
        if response.status_code == 200:
            doc_details = response.json()
            print(f"Document status: {doc_details['document']['status']}")
        
        # 5. Check the actual file on disk to verify encryption
        print("\n4. Checking encryption on disk...")
        
        # Find the uploaded file path from the response or check storage directory
        storage_path = Path("data/storage/uploads")
        if storage_path.exists():
            # List recent files in storage
            files = sorted(storage_path.glob("*test_encryption*"), key=lambda p: p.stat().st_mtime, reverse=True)
            if files:
                stored_file = files[0]
                print(f"Found stored file: {stored_file}")
                
                # Read first few bytes to check if encrypted
                with open(stored_file, 'rb') as f:
                    file_header = f.read(100)
                
                # Encrypted files should not contain readable text
                try:
                    decoded = file_header.decode('utf-8')
                    if "test document" in decoded.lower():
                        print("❌ WARNING: File appears to be stored in plaintext!")
                    else:
                        print("✅ File content appears to be encrypted (not plaintext)")
                except UnicodeDecodeError:
                    print("✅ File content is binary/encrypted (cannot decode as UTF-8)")
        
        # 6. Test document download (should decrypt automatically)
        print("\n5. Testing document download (with automatic decryption)...")
        response = requests.get(f"{BASE_URL}/api/v1/documents/{document_id}/download")
        
        if response.status_code == 200:
            downloaded_content = response.content.decode('utf-8')
            if test_content in downloaded_content:
                print("✅ Document downloaded and decrypted successfully")
                print(f"Content preview: {downloaded_content[:50]}...")
            else:
                print("❌ Downloaded content doesn't match original")
        else:
            print(f"❌ Download failed: {response.status_code}")
        
        # 7. Test query to ensure encrypted documents can still be searched
        print("\n6. Testing query on encrypted document...")
        query_data = {
            "query": "sensitive information encryption",
            "k": 5
        }
        response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data)
        
        if response.status_code == 200:
            query_result = response.json()
            if query_result.get('sources'):
                print("✅ Encrypted document can be queried successfully")
                print(f"Found {len(query_result['sources'])} source(s)")
            else:
                print("⚠️ No sources found (document might still be processing)")
        
        print("\n=== Encryption Test Complete ===")
        
    finally:
        # Cleanup
        os.unlink(tmp_file_path)

def check_encryption_status():
    """Check if encryption is enabled in the system"""
    print("\n=== Checking Encryption Status ===")
    
    response = requests.get(f"{BASE_URL}/api/v1/status")
    if response.status_code == 200:
        status = response.json()
        
        # Look for encryption information in configuration
        if 'configuration' in status:
            config = status['configuration']
            encryption_enabled = config.get('encryption_enabled', False)
            print(f"Encryption enabled: {encryption_enabled}")
            
            if encryption_enabled:
                print("✅ Encryption is ENABLED")
            else:
                print("❌ Encryption is DISABLED")
        else:
            print("⚠️ Could not determine encryption status from API")
    else:
        print(f"Failed to get status: {response.status_code}")

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
    
    # Check encryption status
    check_encryption_status()
    
    # Run encryption test
    test_encryption_integration()