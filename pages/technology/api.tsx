import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/layout'
import { 
  SwissFlag, 
  SwissShield,
  SwissAlps
} from '@/components/premium/swiss-visuals'
import { 
  fadeInScale, 
  staggerContainer, 
  staggerItem,
  scrollReveal
} from '@/lib/animations'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'
import { 
  Code,
  Book,
  Key,
  Zap,
  Shield,
  Globe,
  Download,
  ExternalLink,
  Copy,
  CheckCircle,
  ArrowRight,
  Terminal,
  Server,
  Database,
  Lock,
  Activity,
  Clock,
  FileText,
  Settings,
  AlertCircle
} from 'lucide-react'
import { useState } from 'react'

interface APIDocumentationPageProps {
  locale: string
}

const APIDocumentationPage: React.FC<APIDocumentationPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const quickStart = [
    {
      step: '1',
      title: isGerman ? 'API Key erhalten' : 'Get API Key',
      description: isGerman ? 'Registrieren Sie sich für einen kostenlosen API-Schlüssel' : 'Sign up for a free API key',
      code: 'curl -X POST https://api.projekt-susi.ch/auth/register'
    },
    {
      step: '2',
      title: isGerman ? 'Authentifizierung' : 'Authentication',
      description: isGerman ? 'Fügen Sie Ihren API-Key zu den Headers hinzu' : 'Add your API key to the headers',
      code: 'Authorization: Bearer your-api-key-here'
    },
    {
      step: '3',
      title: isGerman ? 'Erste Anfrage' : 'First Request',
      description: isGerman ? 'Senden Sie Ihre erste Query an die RAG API' : 'Send your first query to the RAG API',
      code: `curl -X POST https://api.projekt-susi.ch/api/v1/query \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Hello Susi!"}'`
    }
  ]

  const apiEndpoints = [
    {
      category: isGerman ? 'Kernfunktionen' : 'Core Functions',
      endpoints: [
        {
          method: 'POST',
          endpoint: '/api/v1/query',
          title: isGerman ? 'RAG Query' : 'RAG Query',
          description: isGerman ? 'Hauptendpoint für dokumentenbasierte Anfragen' : 'Main endpoint for document-based queries',
          parameters: [
            { name: 'query', type: 'string', required: true, description: isGerman ? 'Die Frage oder Suchanfrage' : 'The question or search query' },
            { name: 'max_results', type: 'number', required: false, description: isGerman ? 'Maximale Anzahl Ergebnisse (Standard: 5)' : 'Maximum number of results (default: 5)' },
            { name: 'similarity_threshold', type: 'number', required: false, description: isGerman ? 'Ähnlichkeitsschwelle (Standard: 0.3)' : 'Similarity threshold (default: 0.3)' }
          ],
          example: {
            request: `{
  "query": "What are the FADP compliance requirements?",
  "max_results": 3,
  "similarity_threshold": 0.5
}`,
            response: `{
  "answer": "FADP compliance requires...",
  "sources": [
    {
      "document_id": "doc_123",
      "filename": "fadp_guidelines.pdf",
      "relevance_score": 0.92,
      "excerpt": "According to Article 25..."
    }
  ],
  "confidence": 0.95,
  "processing_time": 1.2
}`
          }
        },
        {
          method: 'POST',
          endpoint: '/api/v1/documents',
          title: isGerman ? 'Dokument Upload' : 'Document Upload',
          description: isGerman ? 'Upload und Verarbeitung von Dokumenten' : 'Upload and processing of documents',
          parameters: [
            { name: 'file', type: 'file', required: true, description: isGerman ? 'Das hochzuladende Dokument (PDF, DOCX, TXT)' : 'The document to upload (PDF, DOCX, TXT)' },
            { name: 'metadata', type: 'object', required: false, description: isGerman ? 'Zusätzliche Metadaten für das Dokument' : 'Additional metadata for the document' }
          ],
          example: {
            request: `multipart/form-data:
file: document.pdf
metadata: {
  "category": "compliance",
  "department": "legal",
  "confidentiality": "internal"
}`,
            response: `{
  "document_id": "doc_456",
  "filename": "document.pdf",
  "status": "processing",
  "estimated_completion": "2024-01-15T10:30:00Z",
  "pages": 25,
  "size_bytes": 2048576
}`
          }
        }
      ]
    },
    {
      category: isGerman ? 'Dokumentenverwaltung' : 'Document Management',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/v1/documents',
          title: isGerman ? 'Dokumente auflisten' : 'List Documents',
          description: isGerman ? 'Alle verfügbaren Dokumente auflisten' : 'List all available documents',
          parameters: [
            { name: 'page', type: 'number', required: false, description: isGerman ? 'Seitenzahl für Pagination' : 'Page number for pagination' },
            { name: 'limit', type: 'number', required: false, description: isGerman ? 'Anzahl Dokumente pro Seite' : 'Number of documents per page' },
            { name: 'category', type: 'string', required: false, description: isGerman ? 'Nach Kategorie filtern' : 'Filter by category' }
          ],
          example: {
            request: `GET /api/v1/documents?page=1&limit=20&category=compliance`,
            response: `{
  "documents": [
    {
      "document_id": "doc_123",
      "filename": "fadp_guidelines.pdf",
      "upload_date": "2024-01-10T14:30:00Z",
      "status": "processed",
      "category": "compliance",
      "pages": 45
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}`
          }
        },
        {
          method: 'DELETE',
          endpoint: '/api/v1/documents/{id}',
          title: isGerman ? 'Dokument löschen' : 'Delete Document',
          description: isGerman ? 'Dokument aus dem System entfernen (mit Audit-Trail)' : 'Remove document from system (with audit trail)',
          parameters: [
            { name: 'id', type: 'string', required: true, description: isGerman ? 'Die Dokument-ID' : 'The document ID' },
            { name: 'reason', type: 'string', required: false, description: isGerman ? 'Grund für die Löschung (für Audit)' : 'Reason for deletion (for audit)' }
          ],
          example: {
            request: `DELETE /api/v1/documents/doc_123
{
  "reason": "Document expired according to retention policy"
}`,
            response: `{
  "success": true,
  "document_id": "doc_123",
  "deleted_at": "2024-01-15T16:45:00Z",
  "audit_id": "audit_789"
}`
          }
        }
      ]
    },
    {
      category: isGerman ? 'System & Monitoring' : 'System & Monitoring',
      endpoints: [
        {
          method: 'GET',
          endpoint: '/api/v1/health',
          title: isGerman ? 'System Status' : 'System Health',
          description: isGerman ? 'Systemstatus und Verfügbarkeit prüfen' : 'Check system status and availability',
          parameters: [],
          example: {
            request: `GET /api/v1/health`,
            response: `{
  "status": "healthy",
  "version": "1.2.0",
  "uptime": 3600,
  "components": {
    "database": "healthy",
    "vector_store": "healthy",
    "llm_service": "healthy"
  },
  "metrics": {
    "avg_response_time": 1.2,
    "requests_per_minute": 450,
    "success_rate": 0.998
  }
}`
          }
        }
      ]
    }
  ]

  const sdks = [
    {
      language: 'Python',
      icon: '🐍',
      install: 'pip install projekt-susi-sdk',
      example: `from projekt_susi import ProjektSusiClient

client = ProjektSusiClient(api_key="your-api-key")
result = client.query("What are the compliance requirements?")
print(result.answer)`
    },
    {
      language: 'JavaScript',
      icon: '📜',
      install: 'npm install @projekt-susi/sdk',
      example: `import { ProjektSusiClient } from '@projekt-susi/sdk';

const client = new ProjektSusiClient('your-api-key');
const result = await client.query('What are the compliance requirements?');
console.log(result.answer);`
    },
    {
      language: 'cURL',
      icon: '🌐',
      install: isGerman ? 'Bereits installiert auf den meisten Systemen' : 'Pre-installed on most systems',
      example: `curl -X POST https://api.projekt-susi.ch/api/v1/query \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What are the compliance requirements?"}'`
    }
  ]

  const rateLimits = [
    {
      tier: 'Free',
      requests: '1,000/month',
      rate: '10/minute',
      features: [
        isGerman ? 'Basis RAG Queries' : 'Basic RAG queries',
        isGerman ? 'Bis 100 MB Dokumente' : 'Up to 100MB documents',
        isGerman ? 'Community Support' : 'Community support'
      ]
    },
    {
      tier: 'Professional',
      requests: '50,000/month',
      rate: '100/minute',
      features: [
        isGerman ? 'Erweiterte RAG Features' : 'Advanced RAG features',
        isGerman ? 'Bis 10 GB Dokumente' : 'Up to 10GB documents',
        isGerman ? 'Priority Support' : 'Priority support',
        isGerman ? 'Webhooks' : 'Webhooks'
      ]
    },
    {
      tier: 'Enterprise',
      requests: isGerman ? 'Unbegrenzt' : 'Unlimited',
      rate: isGerman ? 'Nach Vereinbarung' : 'Custom',
      features: [
        isGerman ? 'Vollständige API-Zugang' : 'Full API access',
        isGerman ? 'Unbegrenzte Dokumente' : 'Unlimited documents',
        isGerman ? 'Dedicated Support' : 'Dedicated support',
        isGerman ? 'SLA Garantien' : 'SLA guarantees',
        isGerman ? 'On-Premises Option' : 'On-premises option'
      ]
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        {/* Hero Section */}
        <motion.section 
          className="relative py-20 lg:py-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 opacity-10">
            <SwissAlps />
          </div>
          <motion.div 
            className="absolute top-20 right-20 opacity-20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <SwissFlag className="w-32 h-32" />
          </motion.div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInScale}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex items-center justify-center space-x-4 mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.05, rotate: 10 }}>
                  <Book className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'API Dokumentation' : 'API Documentation'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <Code className="w-12 h-12 text-secondary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '📚 Vollständige Entwickler-Dokumentation für die Projekt Susi RAG API. RESTful, sicher und Swiss-engineered.'
                  : '📚 Complete developer documentation for the Projekt Susi RAG API. RESTful, secure, and Swiss-engineered.'}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <AnimatedButton 
                  variant="primary"
                  size="lg"
                  icon={<Key className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'API Key anfordern' : 'Get API Key'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  icon={<Download className="w-6 h-6" />}
                  onClick={() => window.open('https://api.projekt-susi.ch/docs', '_blank')}
                >
                  {isGerman ? 'OpenAPI Specs' : 'OpenAPI Specs'}
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Start Guide */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'Schnellstart' : 'Quick Start'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'In wenigen Minuten mit der Projekt Susi API starten'
                  : 'Get started with Projekt Susi API in minutes'
                }
              </p>
            </motion.div>

            <motion.div 
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {quickStart.map((step, index) => (
                <motion.div 
                  key={index}
                  variants={staggerItem}
                  className="mb-8"
                >
                  <AnimatedCard className="p-8" hover={true}>
                    <div className="flex items-start space-x-6">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-white font-bold text-lg">{step.step}</span>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {step.description}
                        </p>
                        <div className="bg-gray-900 rounded-lg p-4 relative">
                          <code className="text-green-400 text-sm">
                            {step.code}
                          </code>
                          <motion.button
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                            onClick={() => copyToClipboard(step.code, `step-${index}`)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {copiedEndpoint === `step-${index}` ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* API Endpoints */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'API Endpoints' : 'API Endpoints'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Vollständige Referenz aller verfügbaren Endpoints'
                  : 'Complete reference of all available endpoints'
                }
              </p>
            </motion.div>

            {apiEndpoints.map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  {category.category}
                </h3>
                
                {category.endpoints.map((endpoint, endpointIndex) => (
                  <motion.div 
                    key={endpointIndex}
                    className="mb-12"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: endpointIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <AnimatedCard className="p-8" hover={true}>
                      <div className="mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                          <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                            <span className={`px-3 py-1 text-xs font-bold rounded ${
                              endpoint.method === 'POST' ? 'bg-green-600 text-white' :
                              endpoint.method === 'GET' ? 'bg-primary text-white' :
                              endpoint.method === 'DELETE' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-lg font-mono text-primary font-bold">
                              {endpoint.endpoint}
                            </code>
                          </div>
                          <motion.button
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={() => copyToClipboard(endpoint.endpoint, endpoint.endpoint)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {copiedEndpoint === endpoint.endpoint ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </motion.button>
                        </div>
                        
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {endpoint.title}
                        </h4>
                        
                        <p className="text-gray-600 mb-6">
                          {endpoint.description}
                        </p>

                        {endpoint.parameters.length > 0 && (
                          <div className="mb-6">
                            <h5 className="font-bold text-gray-900 mb-3">
                              {isGerman ? 'Parameter' : 'Parameters'}
                            </h5>
                            <div className="space-y-3">
                              {endpoint.parameters.map((param, paramIndex) => (
                                <div key={paramIndex} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex items-center space-x-3 mb-1">
                                    <code className="font-mono text-primary font-medium">
                                      {param.name}
                                    </code>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      param.type === 'string' ? 'bg-green-100 text-green-800' :
                                      param.type === 'number' ? 'bg-red-100 text-red-800' :
                                      param.type === 'file' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {param.type}
                                    </span>
                                    {param.required && (
                                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                        {isGerman ? 'Erforderlich' : 'Required'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {param.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-bold text-gray-900 mb-3">
                            {isGerman ? 'Anfrage' : 'Request'}
                          </h5>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-green-400 text-sm overflow-x-auto">
                              {endpoint.example.request}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-gray-900 mb-3">
                            {isGerman ? 'Antwort' : 'Response'}
                          </h5>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-secondary text-sm overflow-x-auto">
                              {endpoint.example.response}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </AnimatedCard>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SDKs Section */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'SDKs & Libraries' : 'SDKs & Libraries'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Nutzen Sie unsere offiziellen SDKs für eine einfache Integration'
                  : 'Use our official SDKs for easy integration'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {sdks.map((sdk, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">{sdk.icon}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {sdk.language}
                      </h3>
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm">
                        {sdk.install}
                      </code>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        {sdk.example}
                      </pre>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Rate Limits */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'API Limits & Pricing' : 'API Limits & Pricing'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Transparente Preise für jeden Bedarf'
                  : 'Transparent pricing for every need'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {rateLimits.map((tier, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard 
                    className={`p-8 h-full text-center ${
                      tier.tier === 'Professional' ? 'ring-2 ring-primary' : ''
                    }`} 
                    hover={true}
                  >
                    {tier.tier === 'Professional' && (
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                        {isGerman ? 'Beliebt' : 'Popular'}
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {tier.tier}
                    </h3>
                    
                    <div className="mb-6">
                      <div className="text-lg text-gray-600 mb-1">
                        {tier.requests}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tier.rate}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-left">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <AnimatedButton 
                      variant={tier.tier === 'Professional' ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full"
                      onClick={() => window.location.href = '/contact'}
                    >
                      {isGerman ? 'Starten' : 'Get Started'}
                    </AnimatedButton>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 opacity-20">
            <motion.div 
              className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"
              animate={{ scale: [1, 1.05, 1], x: [0, 30, 0] }}
              transition={{ duration: 15, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"
              animate={{ scale: [1.05, 1, 1.05], x: [0, -30, 0] }}
              transition={{ duration: 15, repeat: Infinity, delay: 7.5 }}
            />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div 
              className="max-w-3xl mx-auto"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 15 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <SwissFlag className="w-16 h-16 mx-auto" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-6">
                {isGerman ? 'Bereit zu entwickeln?' : 'Ready to develop?'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Starten Sie noch heute mit der Swiss-Quality RAG API.'
                  : 'Start building with Swiss-quality RAG API today.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 border-none shadow-lg"
                  icon={<Key className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'API Key erhalten' : 'Get API Key'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary backdrop-blur-sm"
                  icon={<ExternalLink className="w-6 h-6" />}
                  onClick={() => window.open('https://api.projekt-susi.ch/docs', '_blank')}
                >
                  {isGerman ? 'OpenAPI Explorer' : 'OpenAPI Explorer'}
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'de', ['common'])),
      locale: locale ?? 'de',
    },
  }
}

export default APIDocumentationPage