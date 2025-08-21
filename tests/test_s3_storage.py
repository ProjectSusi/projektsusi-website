"""
Test suite for S3/MinIO storage service
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone
import hashlib

from core.services.s3_storage_service import S3StorageService


class TestS3StorageService:
    """Test S3/MinIO storage service functionality"""

    @pytest.fixture
    def mock_s3_client(self):
        """Create mock S3 client"""
        client = Mock()
        client.head_bucket = Mock()
        client.create_bucket = Mock()
        client.put_object = Mock()
        client.get_object = Mock()
        client.delete_object = Mock()
        client.head_object = Mock()
        client.list_objects_v2 = Mock()
        client.generate_presigned_url = Mock(return_value="https://example.com/presigned-url")
        client.get_paginator = Mock()
        return client

    @pytest.fixture
    def storage_service(self, mock_s3_client):
        """Create storage service with mocked S3 client"""
        with patch('core.services.s3_storage_service.boto3.client', return_value=mock_s3_client):
            service = S3StorageService(
                endpoint_url="http://localhost:9000",
                aws_access_key_id="test-key",
                aws_secret_access_key="test-secret",
                bucket_name="test-bucket"
            )
            return service

    def test_generate_object_key(self, storage_service):
        """Test object key generation"""
        key = storage_service._generate_object_key(
            tenant_id=1,
            document_id=123,
            filename="test document.pdf",
            document_type="upload"
        )
        
        assert key == "tenant_1/upload/123/test document.pdf"

    def test_upload_document_success(self, storage_service, mock_s3_client):
        """Test successful document upload"""
        # Test data
        tenant_id = 1
        document_id = 123
        filename = "test.pdf"
        content = b"test content"
        metadata = {"author": "test user"}
        
        # Mock S3 responses
        mock_s3_client.put_object.return_value = {}
        mock_s3_client.generate_presigned_url.return_value = "https://example.com/presigned"
        
        # Upload document
        result = storage_service.upload_document(
            tenant_id=tenant_id,
            document_id=document_id,
            filename=filename,
            file_content=content,
            metadata=metadata
        )
        
        # Verify result
        assert result['object_key'] == "tenant_1/upload/123/test.pdf"
        assert result['bucket'] == "test-bucket"
        assert result['file_size'] == len(content)
        assert result['file_hash'] == hashlib.sha256(content).hexdigest()
        assert result['presigned_url'] == "https://example.com/presigned"
        
        # Verify S3 client calls
        mock_s3_client.put_object.assert_called_once()
        call_args = mock_s3_client.put_object.call_args
        assert call_args[1]['Bucket'] == "test-bucket"
        assert call_args[1]['Key'] == "tenant_1/upload/123/test.pdf"
        assert call_args[1]['Body'] == content
        assert call_args[1]['Metadata']['tenant-id'] == '1'
        assert call_args[1]['Metadata']['document-id'] == '123'
        assert call_args[1]['Metadata']['custom-author'] == 'test user'

    def test_download_document_success(self, storage_service, mock_s3_client):
        """Test successful document download"""
        # Test data
        tenant_id = 1
        document_id = 123
        filename = "test.pdf"
        content = b"test content"
        
        # Mock S3 response
        mock_response = {
            'Body': Mock(),
            'ContentType': 'application/pdf',
            'LastModified': datetime.now(timezone.utc),
            'Metadata': {
                'tenant-id': '1',
                'document-id': '123',
                'file-hash': hashlib.sha256(content).hexdigest()
            }
        }
        mock_response['Body'].read.return_value = content
        mock_s3_client.get_object.return_value = mock_response
        
        # Download document
        downloaded_content, metadata = storage_service.download_document(
            tenant_id=tenant_id,
            document_id=document_id,
            filename=filename
        )
        
        # Verify result
        assert downloaded_content == content
        assert metadata['content_type'] == 'application/pdf'
        assert metadata['object_key'] == "tenant_1/upload/123/test.pdf"
        
        # Verify S3 client calls
        mock_s3_client.get_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="tenant_1/upload/123/test.pdf"
        )

    def test_download_document_not_found(self, storage_service, mock_s3_client):
        """Test download with non-existent document"""
        from botocore.exceptions import ClientError
        
        # Mock S3 error
        error_response = {'Error': {'Code': 'NoSuchKey', 'Message': 'Key not found'}}
        mock_s3_client.get_object.side_effect = ClientError(error_response, 'GetObject')
        
        # Test download
        with pytest.raises(FileNotFoundError):
            storage_service.download_document(
                tenant_id=1,
                document_id=123,
                filename="nonexistent.pdf"
            )

    def test_download_document_wrong_tenant(self, storage_service, mock_s3_client):
        """Test download with wrong tenant access"""
        # Mock S3 response with different tenant
        mock_response = {
            'Body': Mock(),
            'ContentType': 'application/pdf',
            'Metadata': {
                'tenant-id': '2',  # Different tenant
                'document-id': '123'
            }
        }
        mock_response['Body'].read.return_value = b"content"
        mock_s3_client.get_object.return_value = mock_response
        
        # Test download
        with pytest.raises(PermissionError):
            storage_service.download_document(
                tenant_id=1,  # Requesting tenant 1
                document_id=123,
                filename="test.pdf"
            )

    def test_delete_document_success(self, storage_service, mock_s3_client):
        """Test successful document deletion"""
        # Mock S3 responses
        mock_s3_client.head_object.return_value = {
            'Metadata': {'tenant-id': '1', 'document-id': '123'}
        }
        mock_s3_client.delete_object.return_value = {}
        
        # Delete document
        result = storage_service.delete_document(
            tenant_id=1,
            document_id=123,
            filename="test.pdf"
        )
        
        assert result is True
        
        # Verify S3 client calls
        mock_s3_client.head_object.assert_called_once()
        mock_s3_client.delete_object.assert_called_once_with(
            Bucket="test-bucket",
            Key="tenant_1/upload/123/test.pdf"
        )

    def test_delete_document_wrong_tenant(self, storage_service, mock_s3_client):
        """Test deletion with wrong tenant access"""
        # Mock S3 response with different tenant
        mock_s3_client.head_object.return_value = {
            'Metadata': {'tenant-id': '2', 'document-id': '123'}
        }
        
        # Test deletion
        with pytest.raises(PermissionError):
            storage_service.delete_document(
                tenant_id=1,
                document_id=123,
                filename="test.pdf"
            )

    def test_list_tenant_documents(self, storage_service, mock_s3_client):
        """Test listing tenant documents"""
        # Mock S3 responses
        mock_s3_client.list_objects_v2.return_value = {
            'Contents': [
                {
                    'Key': 'tenant_1/upload/123/test1.pdf',
                    'Size': 1024,
                    'LastModified': datetime.now(timezone.utc)
                },
                {
                    'Key': 'tenant_1/upload/124/test2.pdf',
                    'Size': 2048,
                    'LastModified': datetime.now(timezone.utc)
                }
            ]
        }
        
        # Mock head_object responses for metadata
        def mock_head_object(Bucket, Key):
            return {
                'ContentType': 'application/pdf',
                'Metadata': {
                    'original-filename': Key.split('/')[-1],
                    'document-id': Key.split('/')[-2],
                    'document-type': 'upload',
                    'file-hash': 'abcd1234'
                }
            }
        
        mock_s3_client.head_object.side_effect = mock_head_object
        
        # List documents
        documents = storage_service.list_tenant_documents(tenant_id=1)
        
        assert len(documents) == 2
        assert documents[0]['filename'] == 'test1.pdf'
        assert documents[0]['document_id'] == '123'
        assert documents[1]['filename'] == 'test2.pdf'
        assert documents[1]['document_id'] == '124'

    def test_generate_presigned_url(self, storage_service, mock_s3_client):
        """Test presigned URL generation"""
        # Mock S3 responses
        mock_s3_client.head_object.return_value = {
            'Metadata': {'tenant-id': '1', 'document-id': '123'}
        }
        mock_s3_client.generate_presigned_url.return_value = "https://example.com/presigned"
        
        # Generate presigned URL
        url = storage_service.generate_presigned_url(
            tenant_id=1,
            document_id=123,
            filename="test.pdf",
            expires_in=3600
        )
        
        assert url == "https://example.com/presigned"
        
        # Verify S3 client calls
        mock_s3_client.generate_presigned_url.assert_called_once_with(
            'get_object',
            Params={'Bucket': 'test-bucket', 'Key': 'tenant_1/upload/123/test.pdf'},
            ExpiresIn=3600
        )

    def test_get_storage_stats(self, storage_service, mock_s3_client):
        """Test storage statistics retrieval"""
        # Mock paginator
        mock_paginator = Mock()
        mock_page_iterator = [
            {
                'Contents': [
                    {'Key': 'tenant_1/upload/123/file1.pdf', 'Size': 1024},
                    {'Key': 'tenant_1/processed/124/file2.txt', 'Size': 512}
                ]
            }
        ]
        mock_paginator.paginate.return_value = mock_page_iterator
        mock_s3_client.get_paginator.return_value = mock_paginator
        
        # Get stats
        stats = storage_service.get_storage_stats(tenant_id=1)
        
        assert stats['total_documents'] == 2
        assert stats['total_size_bytes'] == 1536
        assert stats['total_size_mb'] == 0.0015  # 1536 / (1024 * 1024) rounded
        assert stats['document_types'] == {'upload': 1, 'processed': 1}
        assert stats['tenant_id'] == 1

    @patch('core.services.s3_storage_service.Path')
    def test_migrate_from_local_storage_dry_run(self, mock_path, storage_service):
        """Test local storage migration in dry run mode"""
        # Mock file system
        mock_local_path = Mock()
        mock_path.return_value = mock_local_path
        mock_local_path.exists.return_value = True
        
        # Mock files
        mock_file1 = Mock()
        mock_file1.is_file.return_value = True
        mock_file1.name = "test1.pdf"
        mock_file1.stat.return_value.st_size = 1024
        mock_file1.relative_to.return_value = "uploads/test1.pdf"
        
        mock_file2 = Mock()
        mock_file2.is_file.return_value = True
        mock_file2.name = "test2.pdf"
        mock_file2.stat.return_value.st_size = 2048
        mock_file2.relative_to.return_value = "uploads/test2.pdf"
        
        mock_local_path.rglob.return_value = [mock_file1, mock_file2]
        
        # Run migration in dry run mode
        result = storage_service.migrate_from_local_storage(
            local_storage_path="/test/path",
            tenant_id=1,
            dry_run=True
        )
        
        assert result['total_files'] == 2
        assert result['migrated_files'] == 0  # Dry run
        assert result['failed_files'] == 0
        assert result['total_size'] == 3072


@pytest.mark.asyncio
class TestS3StorageRouter:
    """Test S3 storage API router functionality"""

    @pytest.fixture
    def mock_storage_service(self):
        """Create mock storage service"""
        service = Mock()
        service.upload_document.return_value = {
            'object_key': 'tenant_1/upload/123/test.pdf',
            'bucket': 'test-bucket',
            'file_size': 1024,
            'file_hash': 'abcd1234',
            'presigned_url': 'https://example.com/presigned',
            'upload_timestamp': datetime.now(timezone.utc)
        }
        service.download_document.return_value = (b'content', {'content_type': 'application/pdf'})
        service.delete_document.return_value = True
        service.list_tenant_documents.return_value = []
        service.generate_presigned_url.return_value = 'https://example.com/presigned'
        service.get_storage_stats.return_value = {
            'total_documents': 10,
            'total_size_bytes': 10240,
            'total_size_mb': 0.01,
            'document_types': {'upload': 10},
            'bucket_name': 'test-bucket',
            'tenant_id': 1
        }
        return service

    @pytest.fixture
    def mock_user(self):
        """Create mock user"""
        user = Mock()
        user.tenant_id = 1
        user.role = 'user'
        return user

    async def test_upload_document_success(self, mock_storage_service, mock_user):
        """Test successful document upload via API"""
        from core.routers.s3_storage import upload_document_to_storage
        
        # Mock file upload
        mock_file = Mock()
        mock_file.filename = "test.pdf"
        mock_file.read = Mock(return_value=b"content")
        
        # Call endpoint
        result = await upload_document_to_storage(
            file=mock_file,
            document_id=123,
            current_user=mock_user,
            storage_service=mock_storage_service
        )
        
        assert result.success is True
        assert result.object_key == 'tenant_1/upload/123/test.pdf'
        assert result.file_size == 1024

    async def test_download_document_success(self, mock_storage_service, mock_user):
        """Test successful document download via API"""
        from core.routers.s3_storage import download_document_from_storage
        
        # Call endpoint
        response = await download_document_from_storage(
            document_id=123,
            filename="test.pdf",
            current_user=mock_user,
            storage_service=mock_storage_service
        )
        
        # Verify response
        assert response.media_type == 'application/pdf'
        assert 'attachment; filename="test.pdf"' in response.headers['Content-Disposition']

    async def test_storage_health_check(self, mock_storage_service):
        """Test storage health check endpoint"""
        from core.routers.s3_storage import storage_health_check
        
        mock_storage_service.s3_client.head_bucket.return_value = {}
        mock_storage_service.bucket_name = 'test-bucket'
        mock_storage_service.endpoint_url = 'http://localhost:9000'
        
        result = await storage_health_check(storage_service=mock_storage_service)
        
        assert result['status'] == 'healthy'
        assert result['bucket'] == 'test-bucket'


if __name__ == "__main__":
    pytest.main([__file__])