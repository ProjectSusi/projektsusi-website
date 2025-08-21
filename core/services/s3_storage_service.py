"""
S3/MinIO Object Storage Service
Handles document storage using S3-compatible object storage
"""

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, BinaryIO, Tuple
from pathlib import Path
import mimetypes
import hashlib
import json

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    from botocore.config import Config
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

logger = logging.getLogger(__name__)


class S3StorageService:
    """S3/MinIO compatible object storage service"""
    
    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        aws_access_key_id: Optional[str] = None,
        aws_secret_access_key: Optional[str] = None,
        bucket_name: str = "rag-documents",
        region_name: str = "us-east-1",
        signature_version: str = "s3v4",
        use_ssl: bool = True,
        verify_ssl: bool = True
    ):
        if not BOTO3_AVAILABLE:
            raise ImportError("boto3 is required for S3 storage. Install with: pip install boto3")
        
        self.endpoint_url = endpoint_url
        self.bucket_name = bucket_name
        self.region_name = region_name
        
        # Configure S3 client
        config = Config(
            signature_version=signature_version,
            retries={'max_attempts': 3, 'mode': 'adaptive'}
        )
        
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=region_name,
            config=config,
            verify=verify_ssl
        )
        
        logger.info(f"S3 storage service initialized for bucket: {bucket_name}")
        
        # Ensure bucket exists
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"Bucket {self.bucket_name} exists")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                try:
                    if self.region_name == 'us-east-1':
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    else:
                        self.s3_client.create_bucket(
                            Bucket=self.bucket_name,
                            CreateBucketConfiguration={'LocationConstraint': self.region_name}
                        )
                    logger.info(f"Created bucket: {self.bucket_name}")
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket {self.bucket_name}: {create_error}")
                    raise
            else:
                logger.error(f"Error checking bucket {self.bucket_name}: {e}")
                raise
    
    def _generate_object_key(
        self, 
        tenant_id: int, 
        document_id: int, 
        filename: str, 
        document_type: str = "upload"
    ) -> str:
        """Generate S3 object key with tenant isolation"""
        # Sanitize filename
        safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
        
        # Create hierarchical key structure
        key = f"tenant_{tenant_id}/{document_type}/{document_id}/{safe_filename}"
        return key
    
    def upload_document(
        self,
        tenant_id: int,
        document_id: int,
        filename: str,
        file_content: bytes,
        metadata: Optional[Dict[str, Any]] = None,
        document_type: str = "upload"
    ) -> Dict[str, Any]:
        """Upload document to S3/MinIO storage"""
        try:
            object_key = self._generate_object_key(tenant_id, document_id, filename, document_type)
            
            # Calculate file hash for integrity
            file_hash = hashlib.sha256(file_content).hexdigest()
            
            # Detect content type
            content_type, _ = mimetypes.guess_type(filename)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Prepare metadata
            s3_metadata = {
                'tenant-id': str(tenant_id),
                'document-id': str(document_id),
                'original-filename': filename,
                'document-type': document_type,
                'upload-timestamp': datetime.now(timezone.utc).isoformat(),
                'file-hash': file_hash,
                'file-size': str(len(file_content))
            }
            
            # Add custom metadata
            if metadata:
                for key, value in metadata.items():
                    # S3 metadata keys must be lowercase and contain only letters, numbers, and hyphens
                    safe_key = key.lower().replace('_', '-').replace(' ', '-')
                    s3_metadata[f'custom-{safe_key}'] = str(value)
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_content,
                ContentType=content_type,
                Metadata=s3_metadata,
                ServerSideEncryption='AES256'  # Server-side encryption
            )
            
            # Generate presigned URL for temporary access (24 hours)
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=86400  # 24 hours
            )
            
            logger.info(f"Uploaded document {filename} to S3 key: {object_key}")
            
            return {
                'object_key': object_key,
                'bucket': self.bucket_name,
                'content_type': content_type,
                'file_size': len(file_content),
                'file_hash': file_hash,
                'presigned_url': presigned_url,
                'metadata': s3_metadata,
                'upload_timestamp': datetime.now(timezone.utc)
            }
            
        except Exception as e:
            logger.error(f"Failed to upload document {filename}: {e}")
            raise
    
    def download_document(
        self, 
        tenant_id: int, 
        document_id: int, 
        filename: str,
        document_type: str = "upload"
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Download document from S3/MinIO storage"""
        try:
            object_key = self._generate_object_key(tenant_id, document_id, filename, document_type)
            
            # Get object
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=object_key)
            
            # Read content
            content = response['Body'].read()
            
            # Extract metadata
            metadata = response.get('Metadata', {})
            
            # Verify tenant access
            stored_tenant_id = metadata.get('tenant-id')
            if stored_tenant_id and int(stored_tenant_id) != tenant_id:
                raise PermissionError(f"Access denied: document belongs to tenant {stored_tenant_id}")
            
            # Verify file integrity if hash available
            stored_hash = metadata.get('file-hash')
            if stored_hash:
                current_hash = hashlib.sha256(content).hexdigest()
                if current_hash != stored_hash:
                    logger.warning(f"File integrity check failed for {object_key}")
            
            logger.info(f"Downloaded document from S3 key: {object_key}")
            
            return content, {
                'object_key': object_key,
                'content_type': response.get('ContentType', 'application/octet-stream'),
                'file_size': len(content),
                'last_modified': response.get('LastModified'),
                'metadata': metadata
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                raise FileNotFoundError(f"Document not found: {filename}")
            else:
                logger.error(f"Failed to download document {filename}: {e}")
                raise
        except Exception as e:
            logger.error(f"Failed to download document {filename}: {e}")
            raise
    
    def delete_document(
        self, 
        tenant_id: int, 
        document_id: int, 
        filename: str,
        document_type: str = "upload"
    ) -> bool:
        """Delete document from S3/MinIO storage"""
        try:
            object_key = self._generate_object_key(tenant_id, document_id, filename, document_type)
            
            # Verify document exists and belongs to tenant
            try:
                response = self.s3_client.head_object(Bucket=self.bucket_name, Key=object_key)
                metadata = response.get('Metadata', {})
                stored_tenant_id = metadata.get('tenant-id')
                if stored_tenant_id and int(stored_tenant_id) != tenant_id:
                    raise PermissionError(f"Access denied: document belongs to tenant {stored_tenant_id}")
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    logger.warning(f"Document not found for deletion: {object_key}")
                    return False
                raise
            
            # Delete object
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_key)
            
            logger.info(f"Deleted document from S3 key: {object_key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {filename}: {e}")
            raise
    
    def list_tenant_documents(
        self, 
        tenant_id: int,
        document_type: Optional[str] = None,
        max_keys: int = 1000
    ) -> List[Dict[str, Any]]:
        """List all documents for a tenant"""
        try:
            prefix = f"tenant_{tenant_id}/"
            if document_type:
                prefix += f"{document_type}/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            documents = []
            for obj in response.get('Contents', []):
                # Get object metadata
                try:
                    head_response = self.s3_client.head_object(
                        Bucket=self.bucket_name, 
                        Key=obj['Key']
                    )
                    metadata = head_response.get('Metadata', {})
                    
                    documents.append({
                        'object_key': obj['Key'],
                        'filename': metadata.get('original-filename', obj['Key'].split('/')[-1]),
                        'document_id': metadata.get('document-id'),
                        'document_type': metadata.get('document-type', 'unknown'),
                        'file_size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'content_type': head_response.get('ContentType'),
                        'file_hash': metadata.get('file-hash'),
                        'upload_timestamp': metadata.get('upload-timestamp')
                    })
                except ClientError as e:
                    logger.warning(f"Failed to get metadata for {obj['Key']}: {e}")
                    continue
            
            logger.info(f"Listed {len(documents)} documents for tenant {tenant_id}")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to list documents for tenant {tenant_id}: {e}")
            raise
    
    def generate_presigned_url(
        self,
        tenant_id: int,
        document_id: int,
        filename: str,
        expires_in: int = 3600,
        document_type: str = "upload"
    ) -> str:
        """Generate presigned URL for temporary document access"""
        try:
            object_key = self._generate_object_key(tenant_id, document_id, filename, document_type)
            
            # Verify document exists and belongs to tenant
            try:
                response = self.s3_client.head_object(Bucket=self.bucket_name, Key=object_key)
                metadata = response.get('Metadata', {})
                stored_tenant_id = metadata.get('tenant-id')
                if stored_tenant_id and int(stored_tenant_id) != tenant_id:
                    raise PermissionError(f"Access denied: document belongs to tenant {stored_tenant_id}")
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    raise FileNotFoundError(f"Document not found: {filename}")
                raise
            
            # Generate presigned URL
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_key},
                ExpiresIn=expires_in
            )
            
            logger.info(f"Generated presigned URL for {object_key} (expires in {expires_in}s)")
            return presigned_url
            
        except Exception as e:
            logger.error(f"Failed to generate presigned URL for {filename}: {e}")
            raise
    
    def get_storage_stats(self, tenant_id: Optional[int] = None) -> Dict[str, Any]:
        """Get storage statistics"""
        try:
            prefix = f"tenant_{tenant_id}/" if tenant_id else ""
            
            # List all objects with prefix
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
            
            total_objects = 0
            total_size = 0
            document_types = {}
            
            for page in page_iterator:
                for obj in page.get('Contents', []):
                    total_objects += 1
                    total_size += obj['Size']
                    
                    # Extract document type from key
                    key_parts = obj['Key'].split('/')
                    if len(key_parts) >= 3:
                        doc_type = key_parts[1]  # tenant_X/TYPE/doc_id/filename
                        document_types[doc_type] = document_types.get(doc_type, 0) + 1
            
            stats = {
                'total_documents': total_objects,
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'document_types': document_types,
                'bucket_name': self.bucket_name,
                'tenant_id': tenant_id
            }
            
            if tenant_id:
                logger.info(f"Storage stats for tenant {tenant_id}: {total_objects} documents, {stats['total_size_mb']} MB")
            else:
                logger.info(f"Global storage stats: {total_objects} documents, {stats['total_size_mb']} MB")
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get storage stats: {e}")
            raise
    
    def migrate_from_local_storage(
        self,
        local_storage_path: str,
        tenant_id: int,
        dry_run: bool = True
    ) -> Dict[str, Any]:
        """Migrate documents from local file storage to S3/MinIO"""
        try:
            local_path = Path(local_storage_path)
            if not local_path.exists():
                raise FileNotFoundError(f"Local storage path not found: {local_storage_path}")
            
            migration_stats = {
                'total_files': 0,
                'migrated_files': 0,
                'failed_files': 0,
                'total_size': 0,
                'errors': []
            }
            
            # Process all files in local storage
            for file_path in local_path.rglob('*'):
                if file_path.is_file():
                    migration_stats['total_files'] += 1
                    migration_stats['total_size'] += file_path.stat().st_size
                    
                    if not dry_run:
                        try:
                            # Read file content
                            with open(file_path, 'rb') as f:
                                content = f.read()
                            
                            # Generate document ID from path or use filename hash
                            document_id = abs(hash(str(file_path.relative_to(local_path)))) % 1000000
                            
                            # Upload to S3
                            result = self.upload_document(
                                tenant_id=tenant_id,
                                document_id=document_id,
                                filename=file_path.name,
                                file_content=content,
                                metadata={
                                    'migrated_from': str(file_path),
                                    'migration_timestamp': datetime.now(timezone.utc).isoformat()
                                },
                                document_type='migrated'
                            )
                            
                            migration_stats['migrated_files'] += 1
                            logger.info(f"Migrated: {file_path} -> {result['object_key']}")
                            
                        except Exception as e:
                            migration_stats['failed_files'] += 1
                            error_msg = f"Failed to migrate {file_path}: {e}"
                            migration_stats['errors'].append(error_msg)
                            logger.error(error_msg)
            
            action = "Would migrate" if dry_run else "Migrated"
            logger.info(f"{action} {migration_stats['migrated_files']}/{migration_stats['total_files']} files")
            
            return migration_stats
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise


def get_s3_storage_service() -> S3StorageService:
    """Factory function to create S3 storage service from environment variables"""
    
    # S3/MinIO configuration from environment
    endpoint_url = os.getenv('S3_ENDPOINT_URL')  # For MinIO: http://localhost:9000
    aws_access_key_id = os.getenv('S3_ACCESS_KEY_ID') or os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = os.getenv('S3_SECRET_ACCESS_KEY') or os.getenv('AWS_SECRET_ACCESS_KEY')
    bucket_name = os.getenv('S3_BUCKET_NAME', 'rag-documents')
    region_name = os.getenv('S3_REGION_NAME', 'us-east-1')
    use_ssl = os.getenv('S3_USE_SSL', 'true').lower() == 'true'
    verify_ssl = os.getenv('S3_VERIFY_SSL', 'true').lower() == 'true'
    
    if not aws_access_key_id or not aws_secret_access_key:
        raise ValueError("S3 credentials not found. Set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables")
    
    return S3StorageService(
        endpoint_url=endpoint_url,
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        bucket_name=bucket_name,
        region_name=region_name,
        use_ssl=use_ssl,
        verify_ssl=verify_ssl
    )