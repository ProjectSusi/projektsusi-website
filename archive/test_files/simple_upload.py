#!/usr/bin/env python3
"""
Simple document upload using requests
"""
import requests
import os

def upload_file(file_path, base_url="http://localhost:8000"):
    """Upload a file to the RAG system"""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False
    
    filename = os.path.basename(file_path)
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (filename, f, 'text/plain')}
            
            # Try without any authentication headers
            response = requests.post(f"{base_url}/api/v1/documents", files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Successfully uploaded {filename} (ID: {result.get('id', 'unknown')})")
                return True
            else:
                print(f"❌ Upload failed for {filename}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error uploading {filename}: {e}")
        return False

def main():
    """Upload all documents"""
    documents = [
        "upload_ready/benutzerhandbuch.txt",
        "upload_ready/company_policy.txt", 
        "upload_ready/qm_schulungsmaterial.txt"
    ]
    
    success_count = 0
    
    for doc_path in documents:
        if upload_file(doc_path):
            success_count += 1
    
    print(f"\nUpload complete: {success_count}/{len(documents)} successful")

if __name__ == "__main__":
    main()