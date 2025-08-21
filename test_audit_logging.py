#!/usr/bin/env python3
"""
Test audit logging integration across all endpoints
"""
import os
import requests
import json
import time
import sqlite3
from pathlib import Path
import tempfile

# API endpoint
BASE_URL = "http://localhost:8000"

def check_audit_database():
    """Check if audit database exists and has entries"""
    print("\n=== Checking Audit Database ===")
    
    audit_db_path = Path("data/audit.db")
    if not audit_db_path.exists():
        print(f"❌ Audit database not found at {audit_db_path}")
        return False
    
    try:
        conn = sqlite3.connect(str(audit_db_path))
        cursor = conn.cursor()
        
        # Check if audit table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_log'")
        if not cursor.fetchone():
            print("❌ audit_log table not found in database")
            return False
        
        # Count total audit entries
        cursor.execute("SELECT COUNT(*) FROM audit_log")
        total_entries = cursor.fetchone()[0]
        print(f"📊 Total audit log entries: {total_entries}")
        
        # Get recent entries
        cursor.execute("""
            SELECT timestamp, event_type, action_description, response_status, user_id
            FROM audit_log 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        recent_entries = cursor.fetchall()
        
        print("\n📝 Recent audit entries:")
        for entry in recent_entries:
            timestamp, event_type, description, status, user_id = entry
            print(f"   {timestamp} | {event_type} | {description} | Status: {status} | User: {user_id}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error checking audit database: {e}")
        return False

def test_audit_logging():
    """Test audit logging across different operations"""
    
    print("=== Testing Audit Logging Integration ===")
    
    # Get initial audit count
    initial_count = get_audit_count()
    print(f"\n📊 Initial audit entries: {initial_count}")
    
    # 1. Test document upload audit logging
    print("\n1. Testing document upload audit logging...")
    test_content = "This is a test document for audit logging verification."
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write(test_content)
        tmp_file_path = tmp_file.name
    
    uploaded_doc_id = None
    try:
        with open(tmp_file_path, 'rb') as f:
            files = {'file': ('audit_test_doc.txt', f, 'text/plain')}
            response = requests.post(f"{BASE_URL}/api/v1/documents", files=files)
        
        if response.status_code == 200:
            upload_result = response.json()
            uploaded_doc_id = upload_result['id']
            print(f"✅ Document uploaded for audit test. ID: {uploaded_doc_id}")
        else:
            print(f"❌ Document upload failed: {response.status_code}")
            return
    finally:
        os.unlink(tmp_file_path)
    
    # Wait a moment for audit logging to process
    time.sleep(1)
    
    # 2. Test query audit logging
    print("\n2. Testing query audit logging...")
    
    # Valid query
    query_data = {"query": "audit logging test document"}
    response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data)
    
    if response.status_code == 200:
        query_result = response.json()
        print("✅ Query executed successfully for audit test")
    else:
        print(f"❌ Query failed: {response.status_code}")
    
    # Invalid query (too short)
    query_data = {"query": "a"}
    response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data)
    print(f"📝 Short query test: {response.status_code} (expected 400 or error)")
    
    # Wait for audit processing
    time.sleep(1)
    
    # 3. Test document access audit logging
    print("\n3. Testing document access audit logging...")
    
    if uploaded_doc_id:
        # Try to get document details
        response = requests.get(f"{BASE_URL}/api/v1/documents/{uploaded_doc_id}")
        if response.status_code == 200:
            print("✅ Document access successful for audit test")
        else:
            print(f"Document access returned: {response.status_code}")
        
        # Try to download document
        response = requests.get(f"{BASE_URL}/api/v1/documents/{uploaded_doc_id}/download")
        if response.status_code == 200:
            print("✅ Document download successful for audit test")
        else:
            print(f"Document download returned: {response.status_code}")
    
    # Wait for audit processing
    time.sleep(2)
    
    # 4. Check if audit entries were created
    print("\n4. Verifying audit entries were created...")
    final_count = get_audit_count()
    new_entries = final_count - initial_count
    
    print(f"📊 Final audit entries: {final_count}")
    print(f"📊 New audit entries: {new_entries}")
    
    if new_entries > 0:
        print(f"✅ Audit logging is working! Created {new_entries} new audit entries")
        
        # Show recent audit entries related to our test
        show_recent_audit_entries(5)
    else:
        print("❌ No new audit entries detected - audit logging may not be working")
    
    # 5. Test document deletion audit logging
    print("\n5. Testing document deletion audit logging...")
    if uploaded_doc_id:
        response = requests.delete(f"{BASE_URL}/api/v1/documents/{uploaded_doc_id}")
        if response.status_code == 200:
            print("✅ Document deleted successfully for audit test")
        else:
            print(f"Document deletion returned: {response.status_code}")
        
        time.sleep(1)
        
        # Check final audit count
        deletion_count = get_audit_count()
        deletion_entries = deletion_count - final_count
        print(f"📊 Audit entries after deletion: {deletion_count} (new: {deletion_entries})")

def get_audit_count():
    """Get current number of audit entries"""
    try:
        audit_db_path = Path("data/audit.db")
        if not audit_db_path.exists():
            return 0
        
        conn = sqlite3.connect(str(audit_db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM audit_log")
        count = cursor.fetchone()[0]
        conn.close()
        return count
    except:
        return 0

def show_recent_audit_entries(limit=10):
    """Show recent audit entries"""
    try:
        audit_db_path = Path("data/audit.db")
        if not audit_db_path.exists():
            print("No audit database found")
            return
        
        conn = sqlite3.connect(str(audit_db_path))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT timestamp, event_type, action_description, response_status, 
                   user_id, resource_accessed, metadata
            FROM audit_log 
            ORDER BY timestamp DESC 
            LIMIT ?
        """, (limit,))
        
        entries = cursor.fetchall()
        
        print(f"\n📋 Last {len(entries)} audit entries:")
        for entry in entries:
            timestamp, event_type, description, status, user_id, resource, metadata = entry
            print(f"   📅 {timestamp}")
            print(f"   🔖 {event_type} | Status: {status}")
            print(f"   📝 {description}")
            if user_id:
                print(f"   👤 User: {user_id}")
            if resource:
                print(f"   📄 Resource: {resource}")
            if metadata and metadata != '{}':
                try:
                    meta = json.loads(metadata)
                    print(f"   📊 Metadata: {meta}")
                except:
                    print(f"   📊 Metadata: {metadata}")
            print("")
        
        conn.close()
        
    except Exception as e:
        print(f"Error showing audit entries: {e}")

def test_audit_data_privacy():
    """Test that sensitive data is properly handled in audit logs"""
    print("\n=== Testing Audit Data Privacy ===")
    
    # Test query with sensitive information
    sensitive_queries = [
        "What is the password for admin account?",
        "Show me personal data of employees",
        "List all confidential documents"
    ]
    
    for query in sensitive_queries:
        print(f"\n🔒 Testing sensitive query: '{query[:30]}...'")
        query_data = {"query": query}
        response = requests.post(f"{BASE_URL}/api/v1/query", json=query_data)
        
        print(f"   Response: {response.status_code}")
        
        # Check if audit log properly redacts sensitive content
        time.sleep(0.5)  # Give time for audit logging
    
    print("\n🔍 Checking if sensitive queries were redacted in audit logs...")
    
    try:
        audit_db_path = Path("data/audit.db")
        if audit_db_path.exists():
            conn = sqlite3.connect(str(audit_db_path))
            cursor = conn.cursor()
            
            # Look for recent query audit entries
            cursor.execute("""
                SELECT query_text, metadata 
                FROM audit_log 
                WHERE event_type = 'query_executed' 
                AND timestamp > datetime('now', '-5 minutes')
                ORDER BY timestamp DESC 
                LIMIT 10
            """)
            
            entries = cursor.fetchall()
            redacted_found = False
            
            for query_text, metadata in entries:
                if query_text and "[REDACTED" in query_text:
                    print(f"✅ Found properly redacted query: {query_text}")
                    redacted_found = True
                elif query_text and any(word in query_text.lower() for word in ['password', 'personal', 'confidential']):
                    print(f"⚠️ Sensitive query not redacted: {query_text}")
            
            if not redacted_found:
                print("ℹ️ No redacted queries found (may be working correctly)")
            
            conn.close()
    except Exception as e:
        print(f"Error checking audit privacy: {e}")

if __name__ == "__main__":
    # First check if the server is running
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code != 200:
            print("Error: Server is not running. Please start the server first.")
            exit(1)
    except requests.ConnectionError:
        print("Error: Cannot connect to server. Please start the server first.")
        exit(1)
    
    # Check audit database
    if not check_audit_database():
        print("Warning: Audit database issues detected")
    
    # Run audit logging tests
    test_audit_logging()
    
    # Test audit data privacy
    test_audit_data_privacy()
    
    print("\n=== Audit Logging Test Complete ===")
    print("Check the audit database manually for complete verification:")