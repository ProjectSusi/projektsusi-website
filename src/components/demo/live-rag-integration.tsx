import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Loader,
  RefreshCw,
  Shield,
  Globe,
  Zap
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'
import { cn } from '@/lib/utils'

interface LiveRAGIntegrationProps {
  locale: string
  variant?: 'embedded' | 'fullscreen' | 'modal'
  height?: string
  className?: string
}

const LiveRAGIntegration: React.FC<LiveRAGIntegrationProps> = ({ 
  locale, 
  variant = 'embedded',
  height = '700px',
  className 
}) => {
  const isGerman = locale === 'de'
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(variant === 'fullscreen')
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [showFallback, setShowFallback] = useState(false)
  
  const RAG_URL = 'https://rag.temora.ch/ui'
  
  // Check connection to RAG system
  useEffect(() => {
    checkRAGConnection()
  }, [])

  const checkRAGConnection = async () => {
    try {
      setConnectionStatus('checking')
      // Simple connectivity test - if this fails, the site is definitely offline
      // But if it succeeds, we still rely on iframe load events for final status
      const response = await fetch(RAG_URL, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      // Don't immediately set as connected - let iframe load event confirm
      console.log('Initial connectivity check passed')
    } catch (error) {
      console.warn('RAG system connectivity check failed:', error)
      setConnectionStatus('error')
      setTimeout(() => {
        setShowFallback(true)
      }, 5000) // Give iframe more time to load
    }
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setConnectionStatus('connected')
    setShowFallback(false)
    console.log('RAG system iframe loaded successfully')
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setConnectionStatus('error')
    setShowFallback(true)
    console.warn('RAG system iframe failed to load')
  }

  // Add timeout for iframe loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && connectionStatus === 'checking') {
        console.warn('RAG system iframe loading timeout')
        setIsLoading(false)
        setConnectionStatus('error')
        setShowFallback(true)
      }
    }, 15000) // 15 second timeout

    return () => clearTimeout(timeout)
  }, [isLoading, connectionStatus])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    window.open(RAG_URL, '_blank', 'noopener,noreferrer')
  }

  const content = {
    title: isGerman ? 'Live RAG System' : 'Live RAG System',
    subtitle: isGerman 
      ? 'Testen Sie unser produktives Swiss RAG System'
      : 'Try our production Swiss RAG system',
    loading: isGerman ? 'System wird geladen...' : 'Loading system...',
    connected: isGerman ? 'Verbunden' : 'Connected',
    error: isGerman ? 'Verbindungsfehler' : 'Connection Error',
    retry: isGerman ? 'Erneut versuchen' : 'Retry',
    openExternal: isGerman ? 'In neuem Tab öffnen' : 'Open in new tab',
    fallbackTitle: isGerman ? 'RAG System in neuem Tab öffnen' : 'Open RAG System in new tab',
    fallbackMessage: isGerman 
      ? 'Das Live-System kann aufgrund von Browser-Sicherheitseinstellungen nicht eingebettet werden. Öffnen Sie es direkt in einem neuen Tab für die beste Erfahrung.'
      : 'The live system cannot be embedded due to browser security settings. Open it directly in a new tab for the best experience.',
    features: [
      {
        icon: Shield,
        label: isGerman ? 'FADP-konform' : 'FADP-compliant'
      },
      {
        icon: Globe,
        label: isGerman ? 'Swiss Hosting' : 'Swiss Hosting'
      },
      {
        icon: Zap,
        label: isGerman ? 'Zero-Hallucination' : 'Zero-Hallucination'
      }
    ]
  }

  // Fallback content when RAG system is not available
  const FallbackContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center"
    >
      <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {content.fallbackTitle}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {content.fallbackMessage}
      </p>
      <div className="flex gap-4">
        <AnimatedButton
          variant="primary"
          onClick={() => {
            setShowFallback(false)
            setIsLoading(true)
            setConnectionStatus('checking')
            checkRAGConnection()
          }}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          {content.retry}
        </AnimatedButton>
        <AnimatedButton
          variant="outline"
          onClick={openInNewTab}
          icon={<ExternalLink className="w-4 h-4" />}
        >
          {content.openExternal}
        </AnimatedButton>
      </div>
    </motion.div>
  )

  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <LiveRAGIntegration locale={locale} variant="embedded" height="100%" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatedCard
      className={cn(
        "relative overflow-hidden",
        isFullscreen && "fixed inset-4 z-50 m-0",
        className
      )}
      hover={false}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-bold">{content.title}</h3>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'checking' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-4 h-4" />
                </motion.div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center space-x-1 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{content.connected}</span>
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center space-x-1 text-orange-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{content.error}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Feature badges */}
            <div className="hidden md:flex items-center space-x-3 mr-4">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-1 text-white/80">
                  <feature.icon className="w-4 h-4" />
                  <span className="text-xs">{feature.label}</span>
                </div>
              ))}
            </div>
            
            {/* Action buttons */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openInNewTab}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={content.openExternal}
            >
              <ExternalLink className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        <p className="text-sm text-white/80 mt-2">{content.subtitle}</p>
      </div>

      {/* Main Content */}
      <div className={cn("relative bg-gray-50", isFullscreen ? "h-[calc(100%-80px)]" : `h-[${height}]`)} style={{ height: isFullscreen ? 'calc(100% - 80px)' : height }}>
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-10 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">{content.loading}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Iframe or Fallback */}
        {!showFallback ? (
          <iframe
            ref={iframeRef}
            src={RAG_URL}
            className="w-full h-full border-0"
            title="Temora AI RAG System"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="clipboard-write; clipboard-read; cross-origin-isolated"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-top-navigation allow-top-navigation-by-user-activation"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <FallbackContent />
        )}
      </div>

      {/* Footer Info */}
      {!isFullscreen && (
        <div className="bg-gray-100 px-4 py-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-600">
              <span>🇨🇭 {isGerman ? 'Gehostet in der Schweiz' : 'Hosted in Switzerland'}</span>
              <span>🔒 {isGerman ? 'Ende-zu-Ende verschlüsselt' : 'End-to-end encrypted'}</span>
            </div>
            <a
              href={RAG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
            >
              <span>{isGerman ? 'Direkt öffnen' : 'Open directly'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </AnimatedCard>
  )
}

export default LiveRAGIntegration