'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Search, Download, CheckCircle, AlertCircle, Loader2, Play, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn, generateDemoSessionId, trackEvent } from '@/lib/utils'

interface DemoWidgetProps {
  locale: string
  className?: string
}

interface DemoFile {
  id: string
  name: string
  type: string
  description: string
  icon: string
  category: string
}

interface QueryResult {
  answer: string
  sources: {
    document: string
    page: number
    confidence: number
    excerpt: string
  }[]
  confidence: number
  processingTime: number
}

const DemoWidget: React.FC<DemoWidgetProps> = ({ locale, className }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedDemo, setSelectedDemo] = useState<DemoFile | null>(null)
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [sessionId] = useState(() => generateDemoSessionId())
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const isGerman = locale === 'de'

  // Demo files available for testing
  const demoFiles: DemoFile[] = [
    {
      id: 'swiss-bank-risk',
      name: isGerman ? 'Schweizer Bank Risikobericht' : 'Swiss Bank Risk Report',
      type: 'PDF',
      description: isGerman ? 'FINMA-konformer Risikobericht einer Schweizer Grossbank' : 'FINMA-compliant risk report from a major Swiss bank',
      icon: '🏦',
      category: 'banking'
    },
    {
      id: 'pharma-research',
      name: isGerman ? 'Pharma Forschungsdokumentation' : 'Pharmaceutical Research Documentation',
      type: 'PDF',
      description: isGerman ? 'Klinische Studiendokumentation für Arzneimittelzulassung' : 'Clinical study documentation for drug approval',
      icon: '💊',
      category: 'pharma'
    },
    {
      id: 'manufacturing-qm',
      name: isGerman ? 'Qualitätsmanagement Handbuch' : 'Quality Management Manual',
      type: 'PDF',
      description: isGerman ? 'ISO-zertifiziertes QM-System für Produktionsunternehmen' : 'ISO-certified QM system for manufacturing company',
      icon: '🏭',
      category: 'manufacturing'
    },
    {
      id: 'government-policy',
      name: isGerman ? 'Behördenrichtlinie Digitalisierung' : 'Government Digitalization Policy',
      type: 'PDF',
      description: isGerman ? 'Mehrsprachige Richtlinie für digitale Verwaltung' : 'Multilingual guidelines for digital administration',
      icon: '🏛️',
      category: 'government'
    }
  ]

  const sampleQueries = {
    'swiss-bank-risk': [
      isGerman ? 'Was sind die Hauptrisiken in diesem Bericht?' : 'What are the main risks in this report?',
      isGerman ? 'Welche regulatorischen Anforderungen werden erwähnt?' : 'Which regulatory requirements are mentioned?',
      isGerman ? 'Wie hoch ist das Kreditrisiko?' : 'What is the credit risk level?'
    ],
    'pharma-research': [
      isGerman ? 'Welche Nebenwirkungen wurden beobachtet?' : 'What side effects were observed?',
      isGerman ? 'Wie groß war die Studienpopulation?' : 'What was the study population size?',
      isGerman ? 'Was ist die primäre Wirksamkeit des Medikaments?' : 'What is the primary efficacy of the drug?'
    ],
    'manufacturing-qm': [
      isGerman ? 'Welche Qualitätsstandards werden angewendet?' : 'Which quality standards are applied?',
      isGerman ? 'Wie oft werden Audits durchgeführt?' : 'How often are audits conducted?',
      isGerman ? 'Was sind die kritischen Kontrollpunkte?' : 'What are the critical control points?'
    ],
    'government-policy': [
      isGerman ? 'Welche digitalen Services werden angeboten?' : 'Which digital services are offered?',
      isGerman ? 'In welchen Sprachen ist der Service verfügbar?' : 'In which languages is the service available?',
      isGerman ? 'Wie wird Datenschutz gewährleistet?' : 'How is data privacy ensured?'
    ]
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      setError(isGerman ? 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' : 'Unsupported file type. Please upload PDF, DOCX, or TXT files.')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError(isGerman ? 'File size too large. Please upload files smaller than 10MB.' : 'File size too large. Please upload files smaller than 10MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSelectedDemo(null)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadProgress(i)
      }

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      setUploadedFile(file)
      trackEvent('demo_file_uploaded', { fileName: file.name, fileSize: file.size })
    } catch (err) {
      setError(isGerman ? 'Upload failed. Please try again.' : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [isGerman])

  const handleDemoSelection = (demo: DemoFile) => {
    setSelectedDemo(demo)
    setUploadedFile(null)
    setResult(null)
    setError(null)
    setQuery('')
    trackEvent('demo_file_selected', { fileId: demo.id, category: demo.category })
  }

  const handleQuery = async () => {
    if (!query.trim()) return
    if (!uploadedFile && !selectedDemo) {
      setError(isGerman ? 'Please upload a file or select a demo document first.' : 'Please upload a file or select a demo document first.')
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      // Simulate API call to demo endpoint
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock response based on selected demo or uploaded file
      const mockResult: QueryResult = {
        answer: isGerman 
          ? `Basierend auf der Analyse des Dokuments "${selectedDemo?.name || uploadedFile?.name}" kann ich folgende Antwort geben: [Hier würde eine detaillierte, faktenbasierte Antwort stehen, die ausschließlich auf den Inhalten des hochgeladenen Dokuments basiert.]`
          : `Based on the analysis of the document "${selectedDemo?.name || uploadedFile?.name}", I can provide the following answer: [Here would be a detailed, fact-based answer based exclusively on the contents of the uploaded document.]`,
        sources: [
          {
            document: selectedDemo?.name || uploadedFile?.name || 'Document',
            page: Math.floor(Math.random() * 20) + 1,
            confidence: 0.94,
            excerpt: isGerman 
              ? 'Relevanter Textauszug aus dem Dokument, der die Antwort stützt...'
              : 'Relevant text excerpt from the document supporting the answer...'
          },
          {
            document: selectedDemo?.name || uploadedFile?.name || 'Document',
            page: Math.floor(Math.random() * 20) + 1,
            confidence: 0.87,
            excerpt: isGerman 
              ? 'Zusätzlicher unterstützender Textauszug...'
              : 'Additional supporting text excerpt...'
          }
        ],
        confidence: 0.94,
        processingTime: Math.random() * 1000 + 500 // 500-1500ms
      }

      setResult(mockResult)
      trackEvent('demo_query_processed', { 
        query,
        documentType: selectedDemo?.category || 'uploaded',
        confidence: mockResult.confidence 
      })
    } catch (err) {
      setError(isGerman ? 'Query processing failed. Please try again.' : 'Query processing failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getCurrentSampleQueries = () => {
    if (!selectedDemo) return []
    return sampleQueries[selectedDemo.id as keyof typeof sampleQueries] || []
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Document Upload/Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>{isGerman ? 'Dokument bereitstellen' : 'Provide Document'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="space-y-3">
                    <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isGerman ? `Upload läuft... ${uploadProgress}%` : `Uploading... ${uploadProgress}%`}
                    </p>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="font-medium text-secondary">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB • {uploadedFile.type}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isGerman ? 'Andere Datei wählen' : 'Choose Different File'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium text-secondary mb-1">
                        {isGerman ? 'Datei hochladen' : 'Upload your document'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOCX, TXT • {isGerman ? 'Max. 10MB' : 'Max. 10MB'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isGerman ? 'Datei auswählen' : 'Choose File'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Demo Files */}
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    {isGerman ? 'Oder testen Sie mit Beispieldokumenten' : 'Or try with sample documents'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {demoFiles.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleDemoSelection(demo)}
                      className={cn(
                        "p-3 rounded-lg border text-left hover:border-primary hover:bg-gray-50 transition-all",
                        selectedDemo?.id === demo.id && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg flex-shrink-0">{demo.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-secondary mb-1">
                            {demo.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {demo.description}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {demo.type}
                            </span>
                            {selectedDemo?.id === demo.id && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Query and Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-primary" />
                <span>{isGerman ? 'Frage stellen' : 'Ask a Question'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample Queries */}
              {selectedDemo && getCurrentSampleQueries().length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary">
                    {isGerman ? 'Beispielfragen:' : 'Sample questions:'}
                  </p>
                  <div className="space-y-1">
                    {getCurrentSampleQueries().map((sampleQuery, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(sampleQuery)}
                        className="block w-full text-left text-sm text-muted-foreground hover:text-primary hover:bg-platin-50 p-2 rounded transition-colors"
                      >
                        "{ sampleQuery }"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Query Input */}
              <div className="space-y-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isGerman 
                    ? 'Stellen Sie eine Frage zu Ihrem Dokument...' 
                    : 'Ask a question about your document...'}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  disabled={isProcessing}
                />
                
                <Button 
                  onClick={handleQuery}
                  disabled={!query.trim() || (!uploadedFile && !selectedDemo) || isProcessing}
                  className="w-full"
                  variant="swiss"
                  loading={isProcessing}
                >
                  {isProcessing ? (
                    isGerman ? 'Verarbeitung läuft...' : 'Processing...'
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      {isGerman ? 'Frage senden' : 'Submit Query'}
                    </>
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Results Display */}
              {result && (
                <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        {isGerman ? 'Antwort erhalten' : 'Answer Received'}
                      </span>
                    </div>
                    <div className="text-xs text-green-600">
                      {Math.round(result.processingTime)}ms • {Math.round(result.confidence * 100)}% {isGerman ? 'Genauigkeit' : 'confidence'}
                    </div>
                  </div>
                  
                  <div className="text-sm text-green-800 leading-relaxed">
                    {result.answer}
                  </div>
                  
                  {/* Sources */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-green-700">
                      {isGerman ? 'Quellen:' : 'Sources:'}
                    </p>
                    {result.sources.map((source, index) => (
                      <div key={index} className="text-xs bg-white/50 p-2 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{source.document}</span>
                          <span>{isGerman ? 'Seite' : 'Page'} {source.page} • {Math.round(source.confidence * 100)}%</span>
                        </div>
                        <div className="text-green-600 italic">
                          "{source.excerpt}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demo Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-primary" />
                <span>{isGerman ? 'Demo Features' : 'Demo Features'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{isGerman ? 'Null-Halluzination Garantie' : 'Zero-hallucination guarantee'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{isGerman ? 'Vollständige Quellenangaben' : 'Complete source citations'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{isGerman ? 'Swiss Data Sovereignty' : 'Swiss data sovereignty'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{isGerman ? 'FADP/GDPR konform' : 'FADP/GDPR compliant'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DemoWidget