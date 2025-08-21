# Contributing to ProjectSusi

Thank you for your interest in contributing to ProjectSusi! This document provides guidelines and instructions for contributing to our open-source RAG system.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ProjectSusi.git
   cd ProjectSusi
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ProjectSusi/ProjectSusi.git
   ```
4. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### 1. Keep your fork synchronized
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Install dependencies
```bash
pip install -r deployment/requirements/simple_requirements.txt
pip install -r deployment/requirements/test_requirements.txt
pip install -e .
```

### 3. Make your changes
- Write clean, maintainable code
- Follow our coding standards
- Add tests for new features
- Update documentation as needed

### 4. Run tests locally
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_simple_rag_service.py

# Run with coverage
pytest --cov=core tests/
```

### 5. Check code quality
```bash
# Format code
black core/ tests/

# Sort imports
isort core/ tests/

# Check style
flake8 core/ tests/

# Type checking
mypy core/
```

## Pull Request Process

1. **Update your branch** with the latest changes from upstream/main
2. **Push your changes** to your fork
3. **Create a Pull Request** from your fork to the upstream repository
4. **Fill out the PR template** completely
5. **Wait for review** - maintainers will review your PR
6. **Address feedback** - make requested changes in new commits
7. **Squash commits** if requested before merging

### PR Requirements
- All CI/CD checks must pass
- Code coverage should not decrease
- At least one maintainer approval required
- No merge conflicts with main branch

## Coding Standards

### Python Style Guide
- Follow [PEP 8](https://pep8.org/)
- Use type hints for function parameters and returns
- Maximum line length: 100 characters
- Use descriptive variable and function names

### Code Organization
```python
# Good example
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from core.models import Document
from core.services.base import BaseService


class DocumentService(BaseService):
    """Service for managing documents."""
    
    def get_documents(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Document]:
        """
        Retrieve documents with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of Document objects
        """
        return db.query(Document).offset(skip).limit(limit).all()
```

### Error Handling
- Always handle exceptions gracefully
- Provide meaningful error messages
- Log errors appropriately
- Never expose sensitive information in error messages

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Other changes that don't modify src or test files

### Examples
```bash
# Good
git commit -m "feat(api): add document filtering endpoint"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs: update API documentation with examples"

# Bad
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "updates"
```

## Testing

### Test Requirements
- Write tests for all new features
- Maintain or improve code coverage
- Test both success and failure cases
- Use meaningful test names

### Test Structure
```python
import pytest
from unittest.mock import Mock, patch

from core.services.document_service import DocumentService


class TestDocumentService:
    """Test cases for DocumentService."""
    
    def test_get_documents_success(self):
        """Test successful document retrieval."""
        # Arrange
        service = DocumentService()
        mock_db = Mock()
        
        # Act
        result = service.get_documents(mock_db)
        
        # Assert
        assert result is not None
        mock_db.query.assert_called_once()
    
    def test_get_documents_with_pagination(self):
        """Test document retrieval with pagination."""
        # Test implementation
        pass
```

## Documentation

### Code Documentation
- Add docstrings to all public functions and classes
- Use Google-style docstrings
- Include type information in docstrings
- Provide usage examples for complex functions

### README Updates
- Update README.md if you add new features
- Keep installation instructions current
- Add new dependencies to requirements files

### API Documentation
- Update OpenAPI/Swagger docs for API changes
- Include request/response examples
- Document error responses

## Questions?

If you have questions or need help:
1. Check existing [issues](https://github.com/ProjectSusi/ProjectSusi/issues)
2. Join our [discussions](https://github.com/ProjectSusi/ProjectSusi/discussions)
3. Reach out to maintainers

Thank you for contributing to ProjectSusi!