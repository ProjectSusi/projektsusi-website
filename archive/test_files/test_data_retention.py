#!/usr/bin/env python3
"""
Test Data Retention System
Comprehensive test of data lifecycle management and retention policies
"""
import os
import requests
import json
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any

# API endpoint
BASE_URL = "http://localhost:8000"

def check_retention_service_health():
    """Check if data retention service is available"""
    print("=== Checking Data Retention Service Health ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Data retention service is available")
            print(f"   Found {len(categories.get('categories', []))} data categories:")
            
            for category in categories.get('categories', []):
                print(f"   📂 {category.get('value', 'unknown')}: {category.get('description', 'No description')}")
            
            return True
        else:
            print(f"❌ Data retention service check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking retention service: {e}")
        return False

def test_retention_policies():
    """Test retention policy management"""
    print("\n=== Testing Retention Policies ===")
    
    try:
        # Get all retention policies
        print("1. Getting all retention policies...")
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/policies")
        
        if response.status_code == 200:
            policies = response.json()
            print(f"   ✅ Retrieved {len(policies)} retention policies:")
            
            for policy in policies:
                category = policy.get('category', 'unknown')
                days = policy.get('retention_days', 0)
                auto_delete = policy.get('auto_delete', False)
                archive = policy.get('archive_before_delete', False)
                
                if days == -1:
                    retention_str = "Permanent"
                else:
                    retention_str = f"{days} days"
                
                print(f"     📋 {category}: {retention_str}")
                print(f"        Auto-delete: {auto_delete}, Archive: {archive}")
            
            return True, policies
        else:
            print(f"   ❌ Failed to get retention policies: {response.status_code}")
            return False, []
            
    except Exception as e:
        print(f"❌ Error testing retention policies: {e}")
        return False, []

def test_specific_retention_policy():
    """Test getting specific retention policy"""
    print("\n=== Testing Specific Retention Policy ===")
    
    try:
        # Test document content policy
        print("1. Getting document content retention policy...")
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/policies/document_content")
        
        if response.status_code == 200:
            policy = response.json()
            print(f"   ✅ Document content policy retrieved:")
            print(f"      Retention: {policy.get('retention_days', 0)} days")
            print(f"      Auto-delete: {policy.get('auto_delete', False)}")
            print(f"      Archive before delete: {policy.get('archive_before_delete', False)}")
            print(f"      Tenant-specific: {policy.get('tenant_specific', False)}")
            
            metadata = policy.get('metadata', {})
            if metadata:
                print(f"      Metadata: {metadata}")
            
            return True
        else:
            print(f"   ❌ Failed to get specific policy: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing specific policy: {e}")
        return False

def test_expired_data_lookup():
    """Test finding expired data"""
    print("\n=== Testing Expired Data Lookup ===")
    
    try:
        # Get all expired data
        print("1. Looking for expired data...")
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/expired")
        
        if response.status_code == 200:
            expired_data = response.json()
            print(f"   ✅ Found {len(expired_data)} expired data entries:")
            
            if expired_data:
                for data in expired_data[:5]:  # Show first 5
                    entity_id = data.get('entity_id', 'unknown')
                    entity_type = data.get('entity_type', 'unknown')
                    category = data.get('category', 'unknown')
                    days_expired = abs(data.get('days_until_expiry', 0))
                    legal_hold = data.get('legal_hold', False)
                    
                    status_emoji = "⚖️" if legal_hold else "🗑️"
                    print(f"     {status_emoji} {entity_type} {entity_id}")
                    print(f"        Category: {category}")
                    print(f"        Expired: {days_expired} days ago")
                    if legal_hold:
                        print(f"        Status: Legal hold (cannot delete)")
            else:
                print("     No expired data found")
            
            return len(expired_data)
        else:
            print(f"   ❌ Failed to get expired data: {response.status_code}")
            return 0
            
    except Exception as e:
        print(f"❌ Error testing expired data lookup: {e}")
        return 0

def test_retention_report():
    """Test retention report generation"""
    print("\n=== Testing Retention Report ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/report")
        
        if response.status_code == 200:
            report = response.json()
            print(f"   ✅ Retention report generated successfully")
            print(f"      Report date: {report.get('report_date', 'unknown')}")
            print(f"      Total entities: {report.get('total_entities', 0)}")
            print(f"      Expiring soon: {report.get('expiring_soon', 0)}")
            print(f"      Expired: {report.get('expired', 0)}")
            print(f"      Legal holds: {report.get('legal_holds', 0)}")
            
            categories = report.get('categories', {})
            if categories:
                print(f"      Categories breakdown:")
                for category, count in categories.items():
                    print(f"        {category}: {count}")
            
            tenants = report.get('tenants', {})
            if tenants:
                print(f"      Tenants breakdown:")
                for tenant_id, count in tenants.items():
                    print(f"        Tenant {tenant_id}: {count}")
            
            recommendations = report.get('recommendations', [])
            if recommendations:
                print(f"      Recommendations ({len(recommendations)}):")
                for rec in recommendations:
                    print(f"        💡 {rec}")
            
            return True, report
        else:
            print(f"   ❌ Failed to generate retention report: {response.status_code}")
            print(f"      Error: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error testing retention report: {e}")
        return False, None

def test_cleanup_dry_run():
    """Test data cleanup (dry run)"""
    print("\n=== Testing Data Cleanup (Dry Run) ===")
    
    try:
        cleanup_request = {
            "dry_run": True,
            "category": None,  # All categories
            "tenant_id": None  # All tenants
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/data-retention/cleanup",
            json=cleanup_request
        )
        
        if response.status_code == 200:
            results = response.json()
            print(f"   ✅ Dry run cleanup completed:")
            print(f"      Examined: {results.get('examined', 0)}")
            print(f"      Would archive: {results.get('archived', 0)}")
            print(f"      Would delete: {results.get('deleted', 0)}")
            print(f"      Would skip: {results.get('skipped', 0)}")
            print(f"      Errors: {results.get('errors', 0)}")
            print(f"      Dry run: {results.get('dry_run', False)}")
            
            return True, results
        else:
            print(f"   ❌ Dry run cleanup failed: {response.status_code}")
            print(f"      Error: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Error testing cleanup dry run: {e}")
        return False, None

def test_legal_holds():
    """Test legal hold management"""
    print("\n=== Testing Legal Hold Management ===")
    
    try:
        # List existing legal holds
        print("1. Listing existing legal holds...")
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/legal-holds")
        
        if response.status_code == 200:
            holds = response.json()
            existing_holds = holds.get('legal_holds', [])
            print(f"   ✅ Found {len(existing_holds)} existing legal holds:")
            
            for hold in existing_holds:
                print(f"     ⚖️ {hold}")
            
            return True, existing_holds
        else:
            print(f"   ❌ Failed to list legal holds: {response.status_code}")
            return False, []
            
    except Exception as e:
        print(f"❌ Error testing legal holds: {e}")
        return False, []

def test_retention_status():
    """Test retention status for specific entity"""
    print("\n=== Testing Retention Status ===")
    
    try:
        # Test with a hypothetical document ID
        entity_id = "test_document_123"
        entity_type = "document"
        
        print(f"1. Getting retention status for {entity_type} {entity_id}...")
        response = requests.get(
            f"{BASE_URL}/api/v1/data-retention/status/{entity_id}?entity_type={entity_type}"
        )
        
        if response.status_code == 200:
            status = response.json()
            print(f"   ✅ Retention status retrieved:")
            print(f"      Entity: {status.get('entity_type', 'unknown')} {status.get('entity_id', 'unknown')}")
            print(f"      Category: {status.get('category', 'unknown')}")
            print(f"      Created: {status.get('created_at', 'unknown')}")
            
            retention_until = status.get('retention_until')
            if retention_until:
                print(f"      Retention until: {retention_until}")
            else:
                print(f"      Retention: Permanent")
            
            days_until_expiry = status.get('days_until_expiry', 0)
            is_expired = status.get('is_expired', False)
            legal_hold = status.get('legal_hold', False)
            
            if is_expired:
                print(f"      Status: 🚨 EXPIRED ({abs(days_until_expiry)} days ago)")
            elif days_until_expiry <= 30:
                print(f"      Status: ⚠️ Expiring soon ({days_until_expiry} days)")
            else:
                print(f"      Status: ✅ Active ({days_until_expiry} days remaining)")
            
            if legal_hold:
                print(f"      Legal hold: ⚖️ Yes (cannot delete)")
            
            return True
        elif response.status_code == 404:
            print(f"   ⚠️ No retention status found (expected for test entity)")
            return True
        else:
            print(f"   ❌ Failed to get retention status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing retention status: {e}")
        return False

def test_data_categories():
    """Test data categories listing"""
    print("\n=== Testing Data Categories ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/data-retention/categories")
        
        if response.status_code == 200:
            data = response.json()
            categories = data.get('categories', [])
            
            print(f"   ✅ Retrieved {len(categories)} data categories:")
            
            # Group by type for better display
            business_categories = []
            technical_categories = []
            compliance_categories = []
            
            for category in categories:
                value = category.get('value', '')
                description = category.get('description', '')
                
                if 'log' in value or 'technical' in value:
                    technical_categories.append((value, description))
                elif 'audit' in value or 'compliance' in value:
                    compliance_categories.append((value, description))
                else:
                    business_categories.append((value, description))
            
            if business_categories:
                print(f"     📊 Business Data:")
                for value, desc in business_categories:
                    print(f"       • {value}: {desc}")
            
            if technical_categories:
                print(f"     🔧 Technical Data:")
                for value, desc in technical_categories:
                    print(f"       • {value}: {desc}")
            
            if compliance_categories:
                print(f"     ⚖️ Compliance Data:")
                for value, desc in compliance_categories:
                    print(f"       • {value}: {desc}")
            
            return len(categories)
        else:
            print(f"   ❌ Failed to get data categories: {response.status_code}")
            return 0
            
    except Exception as e:
        print(f"❌ Error testing data categories: {e}")
        return 0

def test_retention_configuration():
    """Test retention configuration validation"""
    print("\n=== Testing Retention Configuration ===")
    
    try:
        # Check if retention configuration file exists
        config_file = "config/retention_policies.json"
        if os.path.exists(config_file):
            print(f"   ✅ Retention configuration file found: {config_file}")
            
            with open(config_file, 'r') as f:
                config = json.load(f)
            
            print(f"      Version: {config.get('version', 'unknown')}")
            print(f"      Legal framework: {config.get('legal_framework', 'unknown')}")
            print(f"      Last updated: {config.get('last_updated', 'unknown')}")
            
            policies = config.get('policies', {})
            print(f"      Configured policies: {len(policies)}")
            
            legal_holds = config.get('legal_holds', [])
            print(f"      Legal holds: {len(legal_holds)}")
            
            scheduling = config.get('scheduling', {})
            if scheduling:
                print(f"      Cleanup schedule: {scheduling.get('cleanup_frequency', 'unknown')} at {scheduling.get('cleanup_time', 'unknown')}")
                print(f"      Report schedule: {scheduling.get('report_frequency', 'unknown')} on {scheduling.get('report_day', 'unknown')}")
            
            return True, config
        else:
            print(f"   ⚠️ Retention configuration file not found")
            return False, None
            
    except Exception as e:
        print(f"❌ Error testing retention configuration: {e}")
        return False, None

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("❌ Server is not running properly. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Please start the server first.")
        exit(1)
    
    print("=== Data Retention System Test ===")
    
    # Run comprehensive retention tests
    service_healthy = check_retention_service_health()
    
    if not service_healthy:
        print("⚠️ Data retention service is not available. Some tests may fail.")
    
    # Test core functionality
    policies_success, policies = test_retention_policies()
    specific_policy_success = test_specific_retention_policy()
    expired_count = test_expired_data_lookup()
    report_success, report = test_retention_report()
    cleanup_success, cleanup_results = test_cleanup_dry_run()
    legal_holds_success, legal_holds = test_legal_holds()
    status_success = test_retention_status()
    categories_count = test_data_categories()
    config_success, config = test_retention_configuration()
    
    # Summary
    print("\n=== Data Retention Test Summary ===")
    print(f"✅ Service health: {service_healthy}")
    print(f"✅ Retention policies: {policies_success} ({len(policies)} policies)")
    print(f"✅ Specific policy lookup: {specific_policy_success}")
    print(f"✅ Expired data lookup: {expired_count} expired entities found")
    print(f"✅ Retention report: {report_success}")
    print(f"✅ Cleanup dry run: {cleanup_success}")
    print(f"✅ Legal holds: {legal_holds_success} ({len(legal_holds)} holds)")
    print(f"✅ Retention status: {status_success}")
    print(f"✅ Data categories: {categories_count} categories")
    print(f"✅ Configuration: {config_success}")
    
    # Overall assessment
    all_tests_passed = all([
        service_healthy,
        policies_success,
        specific_policy_success,
        report_success,
        cleanup_success,
        legal_holds_success,
        status_success,
        categories_count > 0
    ])
    
    if all_tests_passed:
        print(f"\n🎉 Data retention system is fully functional!")
        
        if report:
            total_entities = report.get('total_entities', 0)
            expired = report.get('expired', 0)
            expiring_soon = report.get('expiring_soon', 0)
            
            print(f"   📊 Current status:")
            print(f"     • Total entities under retention: {total_entities}")
            print(f"     • Expired entities: {expired}")
            print(f"     • Expiring soon: {expiring_soon}")
            
            if expired > 0:
                print(f"   ⚠️ {expired} entities need cleanup")
            
            if expiring_soon > 0:
                print(f"   📅 {expiring_soon} entities expiring within 30 days")
        
        if cleanup_results and cleanup_results.get('examined', 0) > 0:
            print(f"   🧹 Cleanup analysis:")
            print(f"     • Would archive: {cleanup_results.get('archived', 0)}")
            print(f"     • Would delete: {cleanup_results.get('deleted', 0)}")
            print(f"     • Would skip: {cleanup_results.get('skipped', 0)}")
    else:
        print(f"\n⚠️ Some data retention tests failed - check the detailed output above")
    
    print("\nData Retention Endpoints for manual testing:")
    print(f"  - Retention policies: {BASE_URL}/api/v1/data-retention/policies")
    print(f"  - Expired data: {BASE_URL}/api/v1/data-retention/expired")
    print(f"  - Retention report: {BASE_URL}/api/v1/data-retention/report")
    print(f"  - Legal holds: {BASE_URL}/api/v1/data-retention/legal-holds")
    print(f"  - Data categories: {BASE_URL}/api/v1/data-retention/categories")
    
    if config_success:
        print(f"\n📁 Configuration file: config/retention_policies.json")
        print("   Use this file to customize retention policies and scheduling")
        
    if expired_count > 0:
        print(f"\n🚨 Action Required: {expired_count} entities have expired")
        print("   Run cleanup to remove expired data:")
        print(f"   POST {BASE_URL}/api/v1/data-retention/cleanup")
        print("   (Set 'dry_run': false to actually delete data)")