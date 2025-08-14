import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Search, 
  FileText, 
  Brain, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Download,
  Bot,
  Book,
  Server,
  Activity
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'

interface RAGInterfaceProps {
  locale: string
  apiBase?: string
}

interface Document {
  id: string
  filename: string
  status: 'processing' | 'ready' | 'error'
  size?: number
  pages?: number
}

interface SearchResult {
  answer: string
  confidence: number
  sources: {
    id: string
    document_id: string
    similarity: number
    download_url?: string
  }[]
  processing_time?: number
}

interface SystemStatus {
  status: 'online' | 'offline'
  documentCount: number
  llmStatus: 'ready' | 'unavailable'
}

const RAGInterface: React.FC<RAGInterfaceProps> = ({ 
  locale, 
  apiBase = window?.location?.origin || 'http://localhost:8000' 
}) => {
  const isGerman = locale === 'de'
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [documents, setDocuments] = useState<Document[]>([])
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'offline',
    documentCount: 0,
    llmStatus: 'unavailable'
  })
  const [uploadProgress, setUploadProgress] = useState<string[]>([])

  // Load system status
  React.useEffect(() => {
    loadSystemStatus()
    loadDocumentCount()
  }, [])

  const loadSystemStatus = async () => {
    try {
      const response = await fetch(`${apiBase}/health`)
      const status = response.ok ? 'online' : 'offline'
      setSystemStatus(prev => ({ ...prev, status }))
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, status: 'offline' }))
    }
  }

  const loadDocumentCount = async () => {
    try {
      const response = await fetch(`${apiBase}/api/v1/documents`)
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(prev => ({ 
          ...prev, 
          documentCount: data.total || 0,
          llmStatus: 'ready'
        }))
      }
    } catch (error) {
      console.log('Error loading document count:', error)
    }
  }

  // File upload handling
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    uploadFiles(Array.from(files))
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    const progressMessages: string[] = []
    setUploadProgress(progressMessages)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      progressMessages.push(`Uploading ${file.name}...`)
      setUploadProgress([...progressMessages])

      try {
        const response = await fetch(`${apiBase}/api/v1/documents`, {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          progressMessages[progressMessages.length - 1] = `✅ ${file.name} uploaded successfully`
          setDocuments(prev => [...prev, {
            id: result.document_id,
            filename: file.name,
            status: 'processing',
            size: file.size,
            pages: result.pages
          }])
          loadDocumentCount() // Refresh count
        } else {
          const error = await response.json()
          progressMessages[progressMessages.length - 1] = `❌ Error uploading ${file.name}: ${error.detail}`
        }
      } catch (error) {
        progressMessages[progressMessages.length - 1] = `❌ Network error uploading ${file.name}`
      }
      
      setUploadProgress([...progressMessages])
    }

    setIsUploading(false)
    // Clear progress after 5 seconds
    setTimeout(() => setUploadProgress([]), 5000)
  }

  // Search handling
  const performSearch = async () => {
    if (isSearching || !query.trim()) return

    setIsSearching(true)
    setSearchResults(null)

    try {
      const response = await fetch(`${apiBase}/api/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query.trim() })
      })

      if (response.ok) {
        const result = await response.json()
        setSearchResults(result)
      } else {
        const error = await response.json()
        setSearchResults({
          answer: `Error: ${error.detail}`,
          confidence: 0,
          sources: []
        })
      }
    } catch (error) {
      setSearchResults({
        answer: isGerman ? 'Netzwerkfehler bei der Suche' : 'Network error during search',
        confidence: 0,
        sources: []
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* System Status */}
      <AnimatedCard className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Server className="w-6 h-6 mr-3 text-green-600" />
            {isGerman ? 'System Status' : 'System Status'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {systemStatus.status === 'online' ? '🟢' : '🔴'}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {systemStatus.status === 'online' ? 
                (isGerman ? 'Online' : 'Online') : 
                (isGerman ? 'Offline' : 'Offline')
              }
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {systemStatus.documentCount}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {isGerman ? 'Dokumente' : 'Documents'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-1">
              {systemStatus.llmStatus === 'ready' ? '✅' : '❌'}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {systemStatus.llmStatus === 'ready' ? 
                (isGerman ? 'KI Bereit' : 'AI Ready') : 
                (isGerman ? 'KI Nicht verfügbar' : 'AI Unavailable')
              }
            </div>
          </div>
        </div>
      </AnimatedCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Document Upload */}
        <AnimatedCard className="p-6">
          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 mr-3 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {isGerman ? 'Dokumente Hochladen' : 'Upload Documents'}
            </h3>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              {isGerman ? 'Dateien hier ablegen oder klicken' : 'Drop files here or click to browse'}
            </h4>
            <p className="text-gray-500 text-sm">
              {isGerman ? 'Unterstützt PDF, DOCX, TXT, MD, CSV' : 'Supports PDF, DOCX, TXT, MD, CSV files'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.csv"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {uploadProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadProgress.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium p-2 rounded bg-gray-50"
                >
                  {message}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatedCard>

        {/* Search Interface */}
        <AnimatedCard className="p-6">
          <div className="flex items-center mb-6">
            <Search className="w-6 h-6 mr-3 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {isGerman ? 'Dokumente Durchsuchen' : 'Search Documents'}
            </h3>
          </div>

          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <Bot className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {isGerman 
                  ? '🤖 Nur KI-Antworten - Professionelle Zero-Hallucination-Antworten mit Quellennachweisen'
                  : '🤖 AI Answers Only - Professional zero-hallucination responses with source citations'
                }
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isGerman ? 'Ihre Frage eingeben' : 'Enter your question'}
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                placeholder={isGerman 
                  ? 'Was möchten Sie über Ihre Dokumente wissen?'
                  : 'What would you like to know about your documents?'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <AnimatedButton
              onClick={performSearch}
              disabled={isSearching || !query.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              icon={isSearching ? <Activity className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            >
              {isSearching 
                ? (isGerman ? 'Suche läuft...' : 'Searching...') 
                : (isGerman ? 'Suchen' : 'Search')
              }
            </AnimatedButton>
          </div>
        </AnimatedCard>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {(searchResults || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <AnimatedCard className="p-6">
              <div className="flex items-center mb-6">
                <FileText className="w-6 h-6 mr-3 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  {isGerman ? 'Suchergebnisse' : 'Search Results'}
                </h3>
              </div>

              {isSearching ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">
                    {isGerman ? 'Durchsuche Dokumente...' : 'Searching documents...'}
                  </p>
                </div>
              ) : searchResults ? (
                <div className="space-y-6">
                  {/* AI Answer */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 text-blue-500 mr-2" />
                        <span className="font-semibold text-gray-900">
                          {isGerman ? 'KI-Antwort' : 'AI Answer'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {isGerman ? 'Vertrauen:' : 'Confidence:'} {((searchResults.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {searchResults.answer}
                    </div>
                    {searchResults.processing_time && (
                      <div className="text-xs text-gray-500 mt-2">
                        {isGerman ? 'Antwortzeit:' : 'Response time:'} {searchResults.processing_time.toFixed(2)}s
                      </div>
                    )}
                  </div>

                  {/* Sources */}
                  {searchResults.sources && searchResults.sources.length > 0 && (
                    <div>
                      <div className="flex items-center mb-3">
                        <Book className="w-5 h-5 text-green-500 mr-2" />
                        <span className="font-semibold text-gray-900">
                          {isGerman ? 'Quellen' : 'Sources'} ({searchResults.sources.length})
                        </span>
                      </div>
                      <div className="space-y-3">
                        {searchResults.sources.map((source, index) => (
                          <div key={source.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  {isGerman ? 'Quelle' : 'Source'} {index + 1}: {isGerman ? 'Dokument' : 'Document'} {source.document_id}
                                </span>
                                <div className="text-sm text-gray-500">
                                  {isGerman ? 'Ähnlichkeit:' : 'Similarity:'} {((source.similarity || 0) * 100).toFixed(1)}%
                                </div>
                              </div>
                              {source.download_url && (
                                <a
                                  href={source.download_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  {isGerman ? 'Herunterladen' : 'Download'}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  {isGerman 
                    ? 'Noch keine Suche durchgeführt. Laden Sie Dokumente hoch und versuchen Sie es!'
                    : 'No search performed yet. Upload documents and try searching!'
                  }
                </p>
              )}
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RAGInterface