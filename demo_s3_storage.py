#!/usr/bin/env python3
"""
Demo script for S3/MinIO storage integration
Shows object storage capabilities with local MinIO setup
"""

import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from core.services.s3_storage_service import S3StorageService


async def demo_s3_storage():
    """Demonstrate S3/MinIO storage functionality"""
    print("S3/MinIO Storage Integration Demo")
    print("=" * 50)
    
    # Configure demo environment (MinIO local setup)
    print("\n1. Configuring S3/MinIO connection...")
    
    # Demo configuration - adjust for your MinIO setup
    demo_config = {
        'endpoint_url': 'http://localhost:9000',  # MinIO default
        'aws_access_key_id': 'minioadmin',        # MinIO default
        'aws_secret_access_key': 'minioadmin',    # MinIO default
        'bucket_name': 'rag-demo-bucket',
        'region_name': 'us-east-1',
        'use_ssl': False,  # For local MinIO
        'verify_ssl': False  # For local MinIO
    }
    
    try:
        storage_service = S3StorageService(**demo_config)
        print("S3/MinIO connection established successfully")
        print(f"Bucket: {storage_service.bucket_name}")
        print(f"Endpoint: {storage_service.endpoint_url}")
    except Exception as e:
        print(f"Failed to connect to S3/MinIO: {e}")
        print("\nTo run this demo:")
        print("1. Install MinIO: https://min.io/download")
        print("2. Start MinIO server: minio server /path/to/data")
        print("3. Default credentials: minioadmin/minioadmin")
        print("4. Or set environment variables:")
        print("   S3_ENDPOINT_URL=http://localhost:9000")
        print("   S3_ACCESS_KEY_ID=your-access-key")
        print("   S3_SECRET_ACCESS_KEY=your-secret-key")
        return
    
    # Demo document upload
    print("\n2. Document Upload Demo...")
    try:
        # Create test documents
        test_documents = [
            {
                'filename': 'demo-document.txt',
                'content': b'This is a demo document for RAG system testing.',
                'metadata': {'author': 'Demo User', 'category': 'Test'}
            },
            {
                'filename': 'sample-report.pdf',
                'content': b'%PDF-1.4 Sample PDF content for testing...',
                'metadata': {'department': 'Engineering', 'confidentiality': 'Public'}
            },
            {
                'filename': 'data-export.csv',
                'content': b'name,age,city\nJohn,30,NYC\nJane,25,LA',
                'metadata': {'format': 'CSV', 'records': '2'}
            }
        ]
        
        uploaded_documents = []
        
        for i, doc in enumerate(test_documents, 1):
            print(f"  Uploading: {doc['filename']}")
            
            result = storage_service.upload_document(
                tenant_id=1,
                document_id=100 + i,
                filename=doc['filename'],
                file_content=doc['content'],
                metadata=doc['metadata'],
                document_type='demo'
            )
            
            uploaded_documents.append({
                'document_id': 100 + i,
                'filename': doc['filename'],
                'object_key': result['object_key'],
                'file_size': result['file_size'],
                'file_hash': result['file_hash']
            })
            
            print(f"    Success: {result['object_key']}")
            print(f"    Size: {result['file_size']} bytes")
            print(f"    Hash: {result['file_hash'][:16]}...")
        
        print(f"Successfully uploaded {len(uploaded_documents)} documents")
        
    except Exception as e:
        print(f"Upload demo error: {e}")
        return
    
    # Demo document listing
    print("\n3. Document Listing Demo...")
    try:
        documents = storage_service.list_tenant_documents(
            tenant_id=1,
            document_type='demo'
        )
        
        print(f"Found {len(documents)} documents for tenant 1:")
        for doc in documents:
            print(f"  - {doc['filename']} ({doc['file_size']} bytes)")
            print(f"    Object Key: {doc['object_key']}")
            print(f"    Document ID: {doc['document_id']}")
            print(f"    Type: {doc['document_type']}")
            print(f"    Last Modified: {doc['last_modified']}")
            print()
        
    except Exception as e:
        print(f"Listing demo error: {e}")
    
    # Demo document download
    print("\n4. Document Download Demo...")
    try:
        if uploaded_documents:
            test_doc = uploaded_documents[0]
            print(f"Downloading: {test_doc['filename']}")
            
            content, metadata = storage_service.download_document(
                tenant_id=1,
                document_id=test_doc['document_id'],
                filename=test_doc['filename'],
                document_type='demo'
            )
            
            print(f"Downloaded {len(content)} bytes")
            print(f"Content type: {metadata['content_type']}")
            print(f"Content preview: {content[:50].decode('utf-8', errors='ignore')}...")
            
            # Verify integrity
            import hashlib
            downloaded_hash = hashlib.sha256(content).hexdigest()
            if downloaded_hash == test_doc['file_hash']:
                print("File integrity verified")
            else:
                print("WARNING: File integrity check failed!")
        
    except Exception as e:
        print(f"Download demo error: {e}")
    
    # Demo presigned URLs
    print("\n5. Presigned URL Demo...")
    try:
        if uploaded_documents:
            test_doc = uploaded_documents[0]
            print(f"Generating presigned URL for: {test_doc['filename']}")
            
            presigned_url = storage_service.generate_presigned_url(
                tenant_id=1,
                document_id=test_doc['document_id'],
                filename=test_doc['filename'],
                expires_in=3600,  # 1 hour
                document_type='demo'
            )
            
            print(f"Presigned URL (expires in 1 hour):")
            print(f"  {presigned_url[:80]}...")
            print("  This URL allows temporary access without authentication")
        
    except Exception as e:
        print(f"Presigned URL demo error: {e}")
    
    # Demo storage statistics
    print("\n6. Storage Statistics Demo...")
    try:
        # Tenant-specific stats
        tenant_stats = storage_service.get_storage_stats(tenant_id=1)
        print("Tenant 1 Statistics:")
        print(f"  Total Documents: {tenant_stats['total_documents']}")
        print(f"  Total Size: {tenant_stats['total_size_mb']} MB")
        print(f"  Document Types: {tenant_stats['document_types']}")
        
        # Global stats
        global_stats = storage_service.get_storage_stats()
        print("\nGlobal Statistics:")
        print(f"  Total Documents: {global_stats['total_documents']}")
        print(f"  Total Size: {global_stats['total_size_mb']} MB")
        print(f"  Document Types: {global_stats['document_types']}")
        
    except Exception as e:
        print(f"Statistics demo error: {e}")
    
    # Demo tenant isolation
    print("\n7. Tenant Isolation Demo...")
    try:
        print("Testing tenant isolation...")
        
        # Upload document for tenant 2
        isolation_result = storage_service.upload_document(
            tenant_id=2,
            document_id=200,
            filename='tenant2-document.txt',
            file_content=b'This document belongs to tenant 2.',
            document_type='demo'
        )
        
        print(f"Uploaded document for tenant 2: {isolation_result['object_key']}")
        
        # Try to access tenant 2's document as tenant 1 (should fail)
        try:
            storage_service.download_document(
                tenant_id=1,  # Wrong tenant
                document_id=200,
                filename='tenant2-document.txt',
                document_type='demo'
            )
            print("ERROR: Tenant isolation failed - unauthorized access succeeded!")
        except PermissionError:
            print("Tenant isolation working correctly - unauthorized access blocked")
        
        # List documents for each tenant
        tenant1_docs = storage_service.list_tenant_documents(tenant_id=1, document_type='demo')
        tenant2_docs = storage_service.list_tenant_documents(tenant_id=2, document_type='demo')
        
        print(f"Tenant 1 has {len(tenant1_docs)} demo documents")
        print(f"Tenant 2 has {len(tenant2_docs)} demo documents")
        
    except Exception as e:
        print(f"Tenant isolation demo error: {e}")
    
    # Demo cleanup
    print("\n8. Cleanup Demo...")
    try:
        print("Cleaning up demo documents...")
        
        # Get all demo documents
        all_demo_docs = storage_service.list_tenant_documents(tenant_id=1, document_type='demo')
        all_demo_docs.extend(storage_service.list_tenant_documents(tenant_id=2, document_type='demo'))
        
        deleted_count = 0
        for doc in all_demo_docs:
            try:
                # Extract tenant and document ID from object key
                key_parts = doc['object_key'].split('/')
                tenant_id = int(key_parts[0].replace('tenant_', ''))
                document_id = int(doc['document_id'])
                
                success = storage_service.delete_document(
                    tenant_id=tenant_id,
                    document_id=document_id,
                    filename=doc['filename'],
                    document_type='demo'
                )
                
                if success:
                    deleted_count += 1
                    print(f"  Deleted: {doc['filename']}")
                
            except Exception as e:
                print(f"  Failed to delete {doc['filename']}: {e}")
        
        print(f"Cleanup completed: {deleted_count} documents deleted")
        
    except Exception as e:
        print(f"Cleanup demo error: {e}")
    
    print("\nS3/MinIO Storage Demo Complete!")
    print("Features demonstrated:")
    print("  - S3/MinIO connection and bucket management")
    print("  - Document upload with metadata")
    print("  - Document download and integrity verification")
    print("  - Document listing and filtering")
    print("  - Presigned URL generation")
    print("  - Storage statistics and monitoring")
    print("  - Multi-tenant isolation")
    print("  - Secure document deletion")
    print("  - Error handling and validation")


if __name__ == "__main__":
    try:
        asyncio.run(demo_s3_storage())
    except KeyboardInterrupt:
        print("\nDemo interrupted by user")
    except Exception as e:
        print(f"\nDemo failed: {e}")
        print("Make sure MinIO is running and accessible at http://localhost:9000")