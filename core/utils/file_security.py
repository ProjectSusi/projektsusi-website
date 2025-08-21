"""
File Security Utilities
Provides secure file handling and path validation
"""

import os
import re
import hashlib
from pathlib import Path
from typing import Optional, Set, Tuple
import logging
import mimetypes

logger = logging.getLogger(__name__)


class FileSecurityError(Exception):
    """Exception for file security violations"""
    pass


class SecureFileHandler:
    """Secure file handler with path traversal protection"""
    
    # Allowed file extensions by category
    ALLOWED_EXTENSIONS = {
        'documents': {'.pdf', '.docx', '.doc', '.txt', '.rtf', '.odt'},
        'images': {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'},
        'data': {'.csv', '.xlsx', '.xls', '.json', '.xml'},
        'archives': {'.zip', '.tar', '.gz', '.7z'},
    }
    
    # Blocked filename patterns
    BLOCKED_PATTERNS = [
        r'^\.',           # Hidden files
        r'.*\.\.',        # Path traversal
        r'.*[\\/]',       # Path separators
        r'.*[<>:"|?*]',   # Windows reserved chars
        r'^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)',  # Windows reserved names
        r'.*\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app|deb|rpm)$',  # Executables
    ]
    
    # Maximum file sizes by type (in bytes)
    MAX_FILE_SIZES = {
        'documents': 50 * 1024 * 1024,    # 50MB
        'images': 10 * 1024 * 1024,       # 10MB
        'data': 100 * 1024 * 1024,        # 100MB
        'archives': 200 * 1024 * 1024,    # 200MB
        'default': 25 * 1024 * 1024,      # 25MB
    }
    
    def __init__(self, base_upload_dir: str, allowed_categories: Optional[Set[str]] = None):
        """
        Initialize secure file handler
        
        Args:
            base_upload_dir: Base directory for file uploads
            allowed_categories: Set of allowed file categories
        """
        self.base_upload_dir = Path(base_upload_dir).resolve()
        self.base_upload_dir.mkdir(parents=True, exist_ok=True)
        
        self.allowed_categories = allowed_categories or {'documents', 'images', 'data'}
        
        # Create allowed extensions set
        self.allowed_extensions = set()
        for category in self.allowed_categories:
            self.allowed_extensions.update(self.ALLOWED_EXTENSIONS.get(category, set()))
        
        logger.info(f"Secure file handler initialized: {self.base_upload_dir}")
        logger.info(f"Allowed extensions: {self.allowed_extensions}")
    
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename to prevent security issues
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
            
        Raises:
            FileSecurityError: If filename cannot be sanitized safely
        """
        if not filename or not filename.strip():
            raise FileSecurityError("Empty filename provided")
        
        # Get original extension
        original_path = Path(filename)
        extension = original_path.suffix.lower()
        
        # Check blocked patterns
        for pattern in self.BLOCKED_PATTERNS:
            if re.match(pattern, filename, re.IGNORECASE):
                raise FileSecurityError(f"Filename matches blocked pattern: {pattern}")
        
        # Extract base name
        base_name = original_path.stem
        
        # Remove/replace dangerous characters
        safe_chars = re.sub(r'[^a-zA-Z0-9._-]', '_', base_name)
        
        # Remove multiple underscores
        safe_chars = re.sub(r'_+', '_', safe_chars)
        
        # Remove leading/trailing underscores and dots
        safe_chars = safe_chars.strip('._')
        
        # Ensure not empty
        if not safe_chars:
            safe_chars = 'unnamed_file'
        
        # Limit length
        if len(safe_chars) > 100:
            safe_chars = safe_chars[:100]
        
        # Reconstruct filename
        sanitized = f"{safe_chars}{extension}"
        
        # Final validation
        self.validate_filename(sanitized)
        
        return sanitized
    
    def validate_filename(self, filename: str) -> bool:
        """
        Validate filename for security
        
        Args:
            filename: Filename to validate
            
        Returns:
            True if valid
            
        Raises:
            FileSecurityError: If filename is invalid
        """
        if not filename:
            raise FileSecurityError("Empty filename")
        
        # Length check
        if len(filename) > 255:
            raise FileSecurityError("Filename too long")
        
        # Extension check
        extension = Path(filename).suffix.lower()
        if extension not in self.allowed_extensions:
            raise FileSecurityError(f"File extension {extension} not allowed")
        
        # Pattern checks
        for pattern in self.BLOCKED_PATTERNS:
            if re.match(pattern, filename, re.IGNORECASE):
                raise FileSecurityError(f"Filename matches blocked pattern")
        
        return True
    
    def validate_file_content(self, file_path: Path, expected_type: str) -> bool:
        """
        Validate file content matches expected type
        
        Args:
            file_path: Path to file
            expected_type: Expected MIME type
            
        Returns:
            True if content is valid
        """
        try:
            # In development mode, be more permissive
            env_mode = os.getenv('RAG_ENV', 'production').lower()
            if env_mode == 'development':
                logger.info(f"Development mode: relaxed content validation for {file_path.name}")
                # Just check if file has a reasonable extension
                extension = file_path.suffix.lower()
                if extension in {'.pdf', '.docx', '.doc', '.txt', '.csv', '.json', '.md'}:
                    return True
                # If not a common extension, still try MIME type check but be permissive
                detected_type, _ = mimetypes.guess_type(str(file_path))
                if not detected_type:
                    logger.info(f"Development mode: allowing file with unknown MIME type")
                    return True
                return True
            
            # Production mode - strict validation
            # Check MIME type
            detected_type, _ = mimetypes.guess_type(str(file_path))
            
            if not detected_type:
                logger.warning(f"Could not detect MIME type for {file_path}")
                return False
            
            # Check file signature (magic bytes)
            return self._check_file_signature(file_path, detected_type)
            
        except Exception as e:
            logger.error(f"File content validation failed: {e}")
            return False
    
    def _check_file_signature(self, file_path: Path, mime_type: str) -> bool:
        """Check file signature against expected type"""
        try:
            with open(file_path, 'rb') as f:
                header = f.read(16)
            
            # Common file signatures
            signatures = {
                'application/pdf': [b'%PDF'],
                'image/jpeg': [b'\xff\xd8\xff'],
                'image/png': [b'\x89PNG'],
                'application/zip': [b'PK\x03\x04', b'PK\x05\x06', b'PK\x07\x08'],
                'text/plain': [],  # Skip signature check for text files
            }
            
            expected_signatures = signatures.get(mime_type, [])
            
            # Skip check if no signatures defined
            if not expected_signatures:
                return True
            
            # Check if header matches any expected signature
            for signature in expected_signatures:
                if header.startswith(signature):
                    return True
            
            logger.warning(f"File signature mismatch for {file_path}: expected {mime_type}")
            return False
            
        except Exception as e:
            logger.error(f"Signature check failed: {e}")
            return False
    
    def get_secure_path(self, filename: str, subdirectory: Optional[str] = None) -> Path:
        """
        Get secure file path within base directory
        
        Args:
            filename: Sanitized filename
            subdirectory: Optional subdirectory
            
        Returns:
            Secure file path
            
        Raises:
            FileSecurityError: If path would escape base directory
        """
        # Sanitize filename
        safe_filename = self.sanitize_filename(filename)
        
        # Build path
        if subdirectory:
            # Sanitize subdirectory
            safe_subdir = re.sub(r'[^a-zA-Z0-9_-]', '_', subdirectory)
            target_path = self.base_upload_dir / safe_subdir / safe_filename
        else:
            target_path = self.base_upload_dir / safe_filename
        
        # Resolve path and check it's within base directory
        resolved_path = target_path.resolve()
        
        try:
            resolved_path.relative_to(self.base_upload_dir.resolve())
        except ValueError:
            raise FileSecurityError("Path traversal attempt detected")
        
        # Create parent directory if needed
        resolved_path.parent.mkdir(parents=True, exist_ok=True)
        
        return resolved_path
    
    def generate_unique_filename(self, filename: str) -> str:
        """
        Generate unique filename to avoid conflicts
        
        Args:
            filename: Original filename
            
        Returns:
            Unique filename
        """
        safe_filename = self.sanitize_filename(filename)
        path_obj = Path(safe_filename)
        
        base_name = path_obj.stem
        extension = path_obj.suffix
        
        # Add timestamp and hash for uniqueness
        import time
        timestamp = int(time.time())
        
        # Create hash of original filename
        name_hash = hashlib.md5(filename.encode()).hexdigest()[:8]
        
        unique_filename = f"{base_name}_{timestamp}_{name_hash}{extension}"
        
        return unique_filename
    
    def validate_file_size(self, file_size: int, file_type: str) -> bool:
        """
        Validate file size against limits
        
        Args:
            file_size: File size in bytes
            file_type: File type category
            
        Returns:
            True if size is acceptable
            
        Raises:
            FileSecurityError: If file is too large
        """
        max_size = self.MAX_FILE_SIZES.get(file_type, self.MAX_FILE_SIZES['default'])
        
        if file_size > max_size:
            raise FileSecurityError(
                f"File too large: {file_size} bytes (max: {max_size} bytes)"
            )
        
        return True
    
    def scan_for_malware(self, file_path: Path) -> bool:
        """
        Basic malware scanning (placeholder for integration with AV)
        
        Args:
            file_path: Path to file
            
        Returns:
            True if file appears safe
        """
        try:
            # Check if we're in development mode - if so, be more permissive
            env_mode = os.getenv('RAG_ENV', 'production').lower()
            if env_mode == 'development':
                logger.info(f"Development mode: skipping strict malware scan for {file_path.name}")
                # Only basic size check in development
                file_size = file_path.stat().st_size
                if file_size > 500 * 1024 * 1024:  # 500MB
                    logger.warning(f"File too large: {file_path} ({file_size} bytes)")
                    return False
                return True
            
            # Production mode - full security scanning
            file_size = file_path.stat().st_size
            
            # Check for suspiciously large files
            if file_size > 500 * 1024 * 1024:  # 500MB
                logger.warning(f"Suspiciously large file: {file_path} ({file_size} bytes)")
                return False
            
            # Check for embedded executables in documents (basic)
            if file_path.suffix.lower() in {'.pdf', '.docx', '.xlsx'}:
                with open(file_path, 'rb') as f:
                    content = f.read(min(file_size, 1024 * 1024))  # First 1MB
                
                # Look for executable signatures - but be smarter about PDFs
                dangerous_patterns = []
                
                # For PDFs, only check for very obvious executable patterns
                if file_path.suffix.lower() == '.pdf':
                    dangerous_patterns = [
                        b'\x7fELF',  # Linux executable  
                        b'\xca\xfe\xba\xbe',  # Java class file
                    ]
                else:
                    # For other documents, check all patterns
                    dangerous_patterns = [
                        b'MZ',  # DOS/Windows executable
                        b'\x7fELF',  # Linux executable
                        b'\xca\xfe\xba\xbe',  # Java class file
                    ]
                
                for pattern in dangerous_patterns:
                    if pattern in content:
                        logger.warning(f"Suspicious content found in {file_path}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Malware scan failed for {file_path}: {e}")
            # In case of scan error, be permissive in development
            env_mode = os.getenv('RAG_ENV', 'production').lower()
            if env_mode == 'development':
                logger.info("Development mode: allowing file despite scan error")
                return True
            return False
    
    def secure_file_upload(
        self, 
        file_content: bytes, 
        filename: str, 
        subdirectory: Optional[str] = None
    ) -> Tuple[Path, str]:
        """
        Securely handle file upload
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            subdirectory: Optional subdirectory
            
        Returns:
            Tuple of (secure_path, sanitized_filename)
            
        Raises:
            FileSecurityError: If upload fails security checks
        """
        # Generate unique filename
        unique_filename = self.generate_unique_filename(filename)
        
        # Get secure path
        secure_path = self.get_secure_path(unique_filename, subdirectory)
        
        # Validate file size
        file_type = self._get_file_category(unique_filename)
        self.validate_file_size(len(file_content), file_type)
        
        # Write file
        try:
            with open(secure_path, 'wb') as f:
                f.write(file_content)
            
            # Validate content after writing
            if not self.validate_file_content(secure_path, 'auto'):
                secure_path.unlink()  # Delete if invalid
                raise FileSecurityError("File content validation failed")
            
            # Basic malware scan
            if not self.scan_for_malware(secure_path):
                secure_path.unlink()  # Delete if suspicious
                raise FileSecurityError("File failed security scan")
            
            logger.info(f"Secure file upload completed: {secure_path}")
            return secure_path, unique_filename
            
        except Exception as e:
            # Clean up on failure
            if secure_path.exists():
                secure_path.unlink()
            raise FileSecurityError(f"File upload failed: {e}")
    
    def _get_file_category(self, filename: str) -> str:
        """Get file category based on extension"""
        extension = Path(filename).suffix.lower()
        
        for category, extensions in self.ALLOWED_EXTENSIONS.items():
            if extension in extensions:
                return category
        
        return 'default'


# Global secure file handler
_secure_handlers = {}

def get_secure_file_handler(
    base_dir: str, 
    allowed_categories: Optional[Set[str]] = None
) -> SecureFileHandler:
    """Get or create secure file handler for base directory"""
    if base_dir not in _secure_handlers:
        _secure_handlers[base_dir] = SecureFileHandler(base_dir, allowed_categories)
    return _secure_handlers[base_dir]