import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Search, ArrowRight, FileText, Zap, Globe, Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  title: string
  description: string
  url: string
  category: string
  icon: React.ReactNode
}

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  locale: string
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose, locale }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  
  const isGerman = locale === 'de'

  // Sample search data - in a real app, this would come from an API
  const searchData: SearchResult[] = [
    // Solutions
    {
      title: isGerman ? 'Finanzwesen & Banking' : 'Banking & Finance',
      description: isGerman ? 'FINMA-konforme KI für Banken und Finanzdienstleister' : 'FINMA-compliant AI for banks and financial services',
      url: '/solutions/banking',
      category: isGerman ? 'Lösungen' : 'Solutions',
      icon: <Shield className="w-4 h-4" />
    },
    {
      title: isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences',
      description: isGerman ? 'Arzneimittelforschung mit Schweizer Präzision beschleunigen' : 'Accelerate drug discovery with Swiss precision',
      url: '/solutions/pharma',
      category: isGerman ? 'Lösungen' : 'Solutions',
      icon: <FileText className="w-4 h-4" />
    },
    {
      title: isGerman ? 'Produktion & Manufacturing' : 'Manufacturing & Production',
      description: isGerman ? 'Qualitätskontrolle und Compliance-Automatisierung' : 'Quality control and compliance automation',
      url: '/solutions/manufacturing',
      category: isGerman ? 'Lösungen' : 'Solutions',
      icon: <Zap className="w-4 h-4" />
    },
    {
      title: isGerman ? 'Öffentlicher Sektor' : 'Government & Public Sector',
      description: isGerman ? 'Mehrsprachige Bürgerdienste mit Schweizer Datenschutz' : 'Multilingual citizen services with Swiss data protection',
      url: '/solutions/government',
      category: isGerman ? 'Lösungen' : 'Solutions',
      icon: <Globe className="w-4 h-4" />
    },
    
    // Technology
    {
      title: isGerman ? 'API-Dokumentation' : 'API Documentation',
      description: isGerman ? 'Vollständige Entwickler-Dokumentation für die RAG API' : 'Complete developer documentation for the RAG API',
      url: '/technology/api',
      category: isGerman ? 'Technologie' : 'Technology',
      icon: <FileText className="w-4 h-4" />
    },
    {
      title: isGerman ? 'Live Demo' : 'Live Demo',
      description: isGerman ? 'Testen Sie Projekt Susi sofort in Ihrem Browser' : 'Try Projekt Susi instantly in your browser',
      url: '/technology/demo',
      category: isGerman ? 'Technologie' : 'Technology',
      icon: <Zap className="w-4 h-4" />
    },
    
    // Compliance
    {
      title: isGerman ? 'FADP Compliance' : 'FADP Compliance',
      description: isGerman ? 'Schweizer Datenschutzgesetz und GDPR-konforme KI' : 'Swiss Data Protection Act and GDPR-compliant AI',
      url: '/compliance/fadp',
      category: 'Compliance',
      icon: <Shield className="w-4 h-4" />
    },
    {
      title: isGerman ? 'FINMA Banking' : 'FINMA Banking',
      description: isGerman ? 'Finanzmarktregulierung und Banken-Compliance' : 'Financial market regulation and banking compliance',
      url: '/compliance/finma',
      category: 'Compliance',
      icon: <Shield className="w-4 h-4" />
    },
    
    // Main pages
    {
      title: isGerman ? 'Preise' : 'Pricing',
      description: isGerman ? 'Transparente Preise für jede Unternehmensgröße' : 'Transparent pricing for every business size',
      url: '/pricing',
      category: isGerman ? 'Allgemein' : 'General',
      icon: <FileText className="w-4 h-4" />
    },
    {
      title: isGerman ? 'Über uns' : 'About Us',
      description: isGerman ? 'Erfahren Sie mehr über das Projekt Susi Team' : 'Learn more about the Projekt Susi team',
      url: '/about',
      category: isGerman ? 'Allgemein' : 'General',
      icon: <Globe className="w-4 h-4" />
    },
    {
      title: isGerman ? 'Kontakt' : 'Contact',
      description: isGerman ? 'Nehmen Sie Kontakt mit unserem Team auf' : 'Get in touch with our team',
      url: '/contact',
      category: isGerman ? 'Allgemein' : 'General',
      icon: <Globe className="w-4 h-4" />
    }
  ]

  // Search function
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const filteredResults = searchData.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(filteredResults.slice(0, 8)) // Limit to 8 results
    setSelectedIndex(0)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            router.push(results[selectedIndex].url)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, router, onClose])

  // Perform search when query changes
  useEffect(() => {
    performSearch(query)
  }, [query])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center p-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            placeholder={isGerman ? 'Suchen...' : 'Search...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-lg placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-muted-foreground mb-2">
                {isGerman ? 'Keine Ergebnisse gefunden' : 'No results found'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isGerman 
                  ? 'Versuchen Sie andere Suchbegriffe' 
                  : 'Try different search terms'
                }
              </div>
            </div>
          )}

          {!query && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <div className="text-muted-foreground mb-2">
                {isGerman ? 'Beginnen Sie mit der Eingabe zum Suchen' : 'Start typing to search'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isGerman 
                  ? 'Suchen Sie nach Lösungen, Technologie, Compliance oder allgemeinen Informationen' 
                  : 'Search for solutions, technology, compliance, or general information'
                }
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => {
                    router.push(result.url)
                    onClose()
                  }}
                  className={cn(
                    "w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors",
                    index === selectedIndex
                      ? "bg-primary/5 ring-1 ring-primary/20"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                          {result.category}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {result.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <kbd className="px-2 py-1 bg-white rounded border">↑↓</kbd>
              <span>{isGerman ? 'navigieren' : 'navigate'}</span>
              <kbd className="px-2 py-1 bg-white rounded border">⏎</kbd>
              <span>{isGerman ? 'auswählen' : 'select'}</span>
              <kbd className="px-2 py-1 bg-white rounded border">esc</kbd>
              <span>{isGerman ? 'schließen' : 'close'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SearchDialog