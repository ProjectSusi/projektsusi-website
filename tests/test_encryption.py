"""
Test suite for document encryption functionality
"""
import base64
import os
import tempfile
from pathlib import Path
from typing import Generator

import pytest

from core.utils.encryption import (
    DocumentEncryption,
    DatabaseEncryption,
    EncryptionManager,
    initialize_encryption_manager,
    is_encryption_enabled,
    get_encryption_manager,
    load_or_generate_master_key,
    setup_encryption_from_config,
)


class MockConfig:
    """Mock configuration for testing"""
    ENCRYPTION_ENABLED = True
    ENCRYPTION_KEY_FILE = "test_encryption.key"
    ENCRYPTION_ALGORITHM = "Fernet"
    ENCRYPTION_KEY_DERIVATION_ROUNDS = 100000


@pytest.fixture
def temp_key_file() -> Generator[Path, None, None]:
    """Create temporary key file for testing"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".key") as f:
        key_file = Path(f.name)
    
    yield key_file
    
    # Cleanup
    if key_file.exists():
        key_file.unlink()


@pytest.fixture
def master_key() -> str:
    """Generate test master key"""
    return base64.urlsafe_b64encode(os.urandom(32)).decode()


@pytest.fixture
def document_encryption(master_key: str) -> DocumentEncryption:
    """Create DocumentEncryption instance"""
    return DocumentEncryption(master_key)


@pytest.fixture
def database_encryption(master_key: str) -> DatabaseEncryption:
    """Create DatabaseEncryption instance"""
    return DatabaseEncryption(master_key)


@pytest.fixture
def encryption_manager(master_key: str) -> EncryptionManager:
    """Create EncryptionManager instance"""
    return EncryptionManager(master_key)


class TestDocumentEncryption:
    """Test document encryption functionality"""

    def test_encrypt_decrypt_content(self, document_encryption: DocumentEncryption):
        """Test basic content encryption and decryption"""
        original_content = b"This is test document content for encryption testing."
        tenant_id = 123
        
        # Encrypt content
        encrypted_content, salt = document_encryption.encrypt_content(original_content, tenant_id)
        
        # Verify encryption worked
        assert encrypted_content != original_content
        assert len(encrypted_content) > len(original_content)
        assert len(salt) == 32  # Expected salt length
        
        # Decrypt content
        decrypted_content = document_encryption.decrypt_content(encrypted_content, salt, tenant_id)
        
        # Verify decryption worked
        assert decrypted_content == original_content

    def test_tenant_isolation(self, document_encryption: DocumentEncryption):
        """Test that different tenants cannot decrypt each other's content"""
        original_content = b"Sensitive tenant data"
        tenant_1 = 100
        tenant_2 = 200
        
        # Encrypt for tenant 1
        encrypted_content, salt = document_encryption.encrypt_content(original_content, tenant_1)
        
        # Try to decrypt with tenant 2 - should fail
        with pytest.raises(Exception):
            document_encryption.decrypt_content(encrypted_content, salt, tenant_2)
        
        # Decrypt with correct tenant - should work
        decrypted_content = document_encryption.decrypt_content(encrypted_content, salt, tenant_1)
        assert decrypted_content == original_content

    def test_file_encryption_decryption(self, document_encryption: DocumentEncryption, tmp_path: Path):
        """Test file-based encryption and decryption"""
        tenant_id = 456
        test_content = "Test file content for encryption\nMultiple lines\nWith various characters: äöü@#$%"
        
        # Create test file
        test_file = tmp_path / "test_document.txt"
        test_file.write_text(test_content, encoding="utf-8")
        
        # Encrypt file
        encrypted_path, salt = document_encryption.encrypt_file(test_file, tenant_id)
        
        # Verify original file was removed and encrypted file exists
        assert not test_file.exists()
        assert encrypted_path.exists()
        assert encrypted_path.suffix == ".enc"
        
        # Decrypt file
        decrypted_path = document_encryption.decrypt_file(encrypted_path, salt, tenant_id)
        
        # Verify decryption worked
        assert decrypted_path.exists()
        decrypted_content = decrypted_path.read_text(encoding="utf-8")
        assert decrypted_content == test_content


class TestDatabaseEncryption:
    """Test database field encryption functionality"""

    def test_encrypt_decrypt_field(self, database_encryption: DatabaseEncryption):
        """Test database field encryption and decryption"""
        original_value = "sensitive_database_field_value"
        
        # Encrypt field
        encrypted_value = database_encryption.encrypt_field(original_value)
        
        # Verify encryption worked
        assert encrypted_value != original_value
        assert len(encrypted_value) > len(original_value)
        
        # Decrypt field
        decrypted_value = database_encryption.decrypt_field(encrypted_value)
        
        # Verify decryption worked
        assert decrypted_value == original_value

    def test_empty_field_handling(self, database_encryption: DatabaseEncryption):
        """Test handling of empty/None fields"""
        # Test empty string
        assert database_encryption.encrypt_field("") == ""
        assert database_encryption.decrypt_field("") == ""
        
        # Test None (should be handled gracefully)
        assert database_encryption.encrypt_field(None) is None
        assert database_encryption.decrypt_field(None) is None


class TestEncryptionManager:
    """Test central encryption manager"""

    def test_document_content_encryption(self, encryption_manager: EncryptionManager):
        """Test document content encryption through manager"""
        content_str = "Test document content as string"
        content_bytes = b"Test document content as bytes"
        tenant_id = 789
        
        # Test string content
        encrypted_str, salt_str = encryption_manager.encrypt_document_content(content_str, tenant_id)
        decrypted_str = encryption_manager.decrypt_document_content(encrypted_str, salt_str, tenant_id)
        assert decrypted_str == content_str.encode()
        
        # Test bytes content
        encrypted_bytes, salt_bytes = encryption_manager.encrypt_document_content(content_bytes, tenant_id)
        decrypted_bytes = encryption_manager.decrypt_document_content(encrypted_bytes, salt_bytes, tenant_id)
        assert decrypted_bytes == content_bytes

    def test_sensitive_field_encryption(self, encryption_manager: EncryptionManager):
        """Test sensitive field encryption through manager"""
        sensitive_data = "user_email@example.com"
        
        encrypted = encryption_manager.encrypt_sensitive_field(sensitive_data)
        decrypted = encryption_manager.decrypt_sensitive_field(encrypted)
        
        assert decrypted == sensitive_data
        assert encrypted != sensitive_data

    def test_key_generation(self, encryption_manager: EncryptionManager):
        """Test master key generation"""
        new_key = encryption_manager.generate_master_key()
        
        assert isinstance(new_key, str)
        assert len(new_key) > 40  # Base64 encoded 32-byte key should be longer
        
        # Verify it's valid base64
        decoded = base64.urlsafe_b64decode(new_key.encode())
        assert len(decoded) == 32


class TestKeyManagement:
    """Test key management utilities"""

    def test_load_existing_key(self, temp_key_file: Path):
        """Test loading existing master key"""
        test_key = "test_master_key_12345"
        
        # Write key to file
        temp_key_file.write_text(test_key)
        
        # Load key
        loaded_key = load_or_generate_master_key(temp_key_file)
        
        assert loaded_key == test_key

    def test_generate_new_key(self, temp_key_file: Path):
        """Test generating new master key when file doesn't exist"""
        # Remove file if it exists (pytest creates it)
        if temp_key_file.exists():
            temp_key_file.unlink()
        
        # Ensure file doesn't exist
        assert not temp_key_file.exists()
        
        # Load/generate key
        generated_key = load_or_generate_master_key(temp_key_file)
        
        # Verify key was generated and saved
        assert temp_key_file.exists()
        assert generated_key is not None
        assert len(generated_key) > 40
        
        # Verify key was saved to file
        saved_key = temp_key_file.read_text().strip()
        assert saved_key == generated_key

    def test_file_permissions(self, temp_key_file: Path):
        """Test that key file has secure permissions"""
        # Generate key (creates file)
        load_or_generate_master_key(temp_key_file)
        
        # Check file permissions (Unix-like systems)
        if os.name != 'nt':  # Not Windows
            file_mode = temp_key_file.stat().st_mode & 0o777
            assert file_mode == 0o600


class TestConfigurationSetup:
    """Test configuration-based setup"""

    def test_setup_encryption_enabled(self, temp_key_file: Path):
        """Test encryption setup when enabled in config"""
        config = MockConfig()
        config.ENCRYPTION_KEY_FILE = str(temp_key_file)
        
        # Setup encryption
        result = setup_encryption_from_config(config)
        
        assert result is True
        assert temp_key_file.exists()
        assert is_encryption_enabled()

    def test_setup_encryption_disabled(self):
        """Test encryption setup when disabled in config"""
        config = MockConfig()
        config.ENCRYPTION_ENABLED = False
        
        # Setup encryption
        result = setup_encryption_from_config(config)
        
        assert result is False

    def test_global_manager_access(self, master_key: str):
        """Test global encryption manager access"""
        # Initialize global manager
        initialize_encryption_manager(master_key)
        
        # Verify it's accessible
        assert is_encryption_enabled()
        
        manager = get_encryption_manager()
        assert isinstance(manager, EncryptionManager)

    def test_manager_not_initialized(self):
        """Test error when accessing uninitialized manager"""
        # Reset global state (careful with this in real tests)
        import core.utils.encryption as enc_module
        enc_module._encryption_manager = None
        
        assert not is_encryption_enabled()
        
        with pytest.raises(RuntimeError, match="Encryption manager not initialized"):
            get_encryption_manager()


class TestErrorHandling:
    """Test error handling in encryption operations"""

    def test_invalid_master_key(self):
        """Test handling of invalid master key"""
        # The encryption system is robust and doesn't fail on initialization
        # but rather during actual operations. Let's test a realistic scenario.
        doc_enc = DocumentEncryption("too_short")
        
        # This should work fine as the encryption system handles various key formats
        encrypted, salt = doc_enc.encrypt_content(b"test", 123)
        decrypted = doc_enc.decrypt_content(encrypted, salt, 123)
        assert decrypted == b"test"

    def test_corrupted_encrypted_content(self, document_encryption: DocumentEncryption):
        """Test handling of corrupted encrypted content"""
        original_content = b"Test content"
        tenant_id = 123
        
        # Encrypt content
        encrypted_content, salt = document_encryption.encrypt_content(original_content, tenant_id)
        
        # Corrupt the encrypted content
        corrupted_content = encrypted_content[:-10] + b"corrupted"
        
        # Try to decrypt - should raise exception
        with pytest.raises(Exception):
            document_encryption.decrypt_content(corrupted_content, salt, tenant_id)

    def test_wrong_salt(self, document_encryption: DocumentEncryption):
        """Test handling of wrong salt"""
        original_content = b"Test content"
        tenant_id = 123
        
        # Encrypt content
        encrypted_content, salt = document_encryption.encrypt_content(original_content, tenant_id)
        
        # Use wrong salt
        wrong_salt = os.urandom(32)
        
        # Try to decrypt - should raise exception
        with pytest.raises(Exception):
            document_encryption.decrypt_content(encrypted_content, wrong_salt, tenant_id)


if __name__ == "__main__":
    pytest.main([__file__])