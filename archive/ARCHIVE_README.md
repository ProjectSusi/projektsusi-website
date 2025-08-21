# Archive Directory

This directory contains files that have been moved from the main project to keep it organized and clean. These files are not deleted as they may contain useful information or be needed for reference.

## Directory Structure

### test_files/
Contains test scripts, demo files, and temporary files used during development:

**Test Scripts:**
- `test_*.py` - Integration test files for various components
- `test_*.txt` - Test document files
- `*_test.txt` - Test data files

**Demo Files:**  
- `demo_*.py` - Demo scripts for features like background jobs, MFA, scaling
- `simple_*.py` - Simplified API and upload scripts
- `upload_documents.py` - Document upload utility
- `start_rag.py` - Old startup script
- `run_core.py` - Alternative startup script

**Test Documents:**
- `harry_potter_test.pdf` - PDF test file
- `final_test.txt` - Test document
- `success_test.txt` - Test document  
- `ultimate_test.txt` - Test document
- `database_schema_test.txt` - Database schema test
- `schema_test.txt` - Schema validation test

### backup_files/
Contains backup configuration files:
- `config_backup_*` - Configuration backups
- `.env.backup*` - Environment file backups

### demo_files/
Reserved for demo and example files.

### old_configs/
Reserved for deprecated configuration files.

## Files Still Active in Main Project

The following files remain in the main directory as they are actively used:

**Core Application:**
- `docker-compose.yml` - Production deployment
- `requirements.txt` - Python dependencies  
- `Dockerfile` - Container configuration
- `pyproject.toml` - Python project configuration
- `pytest.ini` - Test configuration (for organized tests)

**Documentation (New):**
- `SYSTEM_DOCUMENTATION.md` - Complete system documentation
- `ARCHITECTURE_DEEP_DIVE.md` - Detailed architecture documentation
- `POSTGRESQL_MIGRATION_GUIDE.md` - PostgreSQL migration guide
- `API_COMPLETE_DOCUMENTATION.md` - Complete API reference

**Documentation (Existing):**
- `README.md` - Main project readme
- `CLAUDE.md` - Claude Code integration notes
- `DOCKER_DEPLOYMENT_CYCLE.md` - Docker deployment guide
- `PRODUCTION_DEPLOYMENT.md` - Production deployment guide
- `SECURITY_AUDIT.md` - Security audit report
- `TESTING_GUIDE.md` - Testing guidelines
- `PROJECT_ROADMAP.md` - Project roadmap
- `PERFORMANCE_OPTIMIZATION.md` - Performance optimization guide

**Configuration:**
- `Makefile` - Build automation
- `api_test.http` - HTTP API testing file

**Legal/Compliance:**
- `LICENSE` - Project license
- `CODEOWNERS` - Code ownership
- `CONTRIBUTING.md` - Contribution guidelines

## Recovery Instructions

If any archived file is needed again:

1. **For Development**: Copy the file back to the main directory
2. **For Production**: Ensure the file is properly integrated and tested
3. **For Testing**: Files can be used directly from the archive directory

## Cleanup Rationale

Files were archived to:
- **Improve Navigation**: Reduce clutter in the main project directory  
- **Maintain Focus**: Keep only production-relevant files visible
- **Preserve History**: Maintain test files for reference without deletion
- **Organization**: Separate development artifacts from production code

## Active Test Structure

Proper tests are maintained in:
- `tests/` directory - Organized pytest test suite
- `tests/integration/` - Integration tests
- `tests/performance/` - Performance tests
- `pytest.ini` - Test configuration

The archived test files were ad-hoc development tests that are no longer needed for regular testing workflows.