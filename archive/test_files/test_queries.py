#!/usr/bin/env python3
"""
Test queries to verify RAG system functionality with uploaded documents
"""
import requests
import json

def test_query(query, base_url="http://localhost:8000"):
    """Test a single query"""
    print(f"\n🔍 Query: {query}")
    print("-" * 50)
    
    try:
        response = requests.post(
            f"{base_url}/api/v1/query",
            json={"query": query},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Answer:")
            print(result.get('answer', 'No answer provided'))
            
            if 'confidence' in result:
                print(f"\n📊 Confidence: {(result['confidence'] * 100):.1f}%")
            
            if 'sources' in result and result['sources']:
                print(f"\n📚 Sources ({len(result['sources'])}):")
                for i, source in enumerate(result['sources'][:3], 1):
                    print(f"   {i}. Document {source.get('document_id', 'unknown')} (similarity: {(source.get('similarity', 0) * 100):.1f}%)")
            
            print("\n" + "="*60)
            return True
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def main():
    """Test various queries in German and English"""
    
    print("🤖 Testing RAG System with Qwen2.5")
    print("=" * 60)
    
    # Test queries about quality management (German)
    german_queries = [
        "Was ist ein Qualitätsmanagementsystem?",
        "Wie führt man ein Audit durch?",
        "Welche Schritte umfasst das CAPA-System?",
        "Wie verwendet man ProQuality Manager?",
    ]
    
    # Test queries about company policy (English)
    english_queries = [
        "What is the remote work policy?",
        "What are the working hours for remote employees?",
        "How should I handle confidential information when working remotely?",
        "What equipment does the company provide for remote work?"
    ]
    
    # Test general questions
    general_queries = [
        "How do I access training materials?",
        "What is the compliance checklist?",
        "Wie kann ich das System nutzen?"
    ]
    
    all_queries = german_queries + english_queries + general_queries
    
    successful = 0
    total = len(all_queries)
    
    for query in all_queries:
        if test_query(query):
            successful += 1
    
    print(f"\n🎯 Test Results: {successful}/{total} queries successful")
    
    if successful == total:
        print("✅ All tests passed! RAG system is working correctly.")
    elif successful > total * 0.7:
        print("⚠️ Most tests passed, but some queries had issues.")
    else:
        print("❌ Many tests failed. Check the system configuration.")

if __name__ == "__main__":
    main()