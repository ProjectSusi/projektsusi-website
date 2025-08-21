#!/usr/bin/env python3
"""
Direct document upload script bypassing authentication issues
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'core'))

import asyncio
from core.di.services import get_document_service, initialize_services

async def upload_document(filename, content, uploader_id="system"):
    """Upload document directly using the service"""
    try:
        # Initialize services first
        await initialize_services()
        
        # Get document service directly
        doc_service = get_document_service()
        
        # Process upload
        result = await doc_service.process_upload(
            filename=filename,
            content=content,
            content_type="text/plain",
            uploader_id=uploader_id
        )
        
        return result
        
    except Exception as e:
        print(f"Error uploading {filename}: {e}")
        return None

async def main():
    """Upload all documents in upload_ready folder"""
    upload_folder = "upload_ready"
    
    documents = [
        "benutzerhandbuch.txt",
        "company_policy.txt", 
        "qm_schulungsmaterial.txt"
    ]
    
    for doc_name in documents:
        file_path = os.path.join(upload_folder, doc_name)
        
        if os.path.exists(file_path):
            print(f"Uploading {doc_name}...")
            
            with open(file_path, 'rb') as f:
                content = f.read()
            
            result = await upload_document(doc_name, content)
            
            if result:
                print(f"✅ Successfully uploaded {doc_name} (ID: {result.id})")
            else:
                print(f"❌ Failed to upload {doc_name}")
        else:
            print(f"⚠️ File not found: {file_path}")

if __name__ == "__main__":
    asyncio.run(main())