import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExternalLink, 
  Smartphone, 
  Monitor,
  Shield,
  Globe,
  Zap,
  Upload,
  MessageSquare,
  Play,
  ArrowRight
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'
import { cn } from '@/lib/utils'

interface MobileRAGInterfaceProps {
  locale: string
  ragUrl: string
  className?: string
}

const MobileRAGInterface: React.FC<MobileRAGInterfaceProps> = ({
  locale,
  ragUrl,
  className
}) => {
  const isGerman = locale === 'de'
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')
  const [showDemo, setShowDemo] = useState(false)

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768 || 
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setDeviceType(isMobile ? 'mobile' : 'desktop')
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  const content = {
    title: isGerman ? 'RAG System Demo' : 'RAG System Demo',
    subtitle: isGerman 
      ? 'Probieren Sie unser intelligentes Dokumentensystem aus'
      : 'Try our intelligent document system',
    openApp: isGerman ? 'App öffnen' : 'Open App',
    quickDemo: isGerman ? 'Schnell-Demo' : 'Quick Demo',
    fullExperience: isGerman ? 'Vollständige Erfahrung' : 'Full Experience',
    mobileOptimized: isGerman ? 'Für Mobilgeräte optimiert' : 'Mobile Optimized',
    features: [
      {
        icon: Shield,
        label: isGerman ? 'FADP-konform' : 'FADP-compliant',
        description: isGerman ? 'Schweizer Datenschutz' : 'Swiss data protection'
      },
      {
        icon: Globe,
        label: isGerman ? 'Swiss Hosting' : 'Swiss Hosting',
        description: isGerman ? 'Lokale Server' : 'Local servers'
      },
      {
        icon: Zap,
        label: isGerman ? 'Zero-Hallucination' : 'Zero-Hallucination',
        description: isGerman ? 'Verlässliche Antworten' : 'Reliable answers'
      }
    ],
    demoSteps: [
      {
        icon: Upload,
        title: isGerman ? 'Dokumente hochladen' : 'Upload Documents',
        description: isGerman 
          ? 'PDF, Word, Excel Dateien unterstützt'
          : 'PDF, Word, Excel files supported'
      },
      {
        icon: MessageSquare,
        title: isGerman ? 'Fragen stellen' : 'Ask Questions',
        description: isGerman 
          ? 'Natürliche Sprache in Deutsch oder Englisch'
          : 'Natural language in German or English'
      },
      {
        icon: Zap,
        title: isGerman ? 'Antworten erhalten' : 'Get Answers',
        description: isGerman 
          ? 'Präzise Antworten mit Quellenangaben'
          : 'Precise answers with source citations'
      }
    ]
  }

  const openRAGSystem = () => {
    window.open(ragUrl, '_blank', 'noopener,noreferrer')
  }

  const InteractiveDemo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {content.quickDemo}
        </h3>
        <p className="text-gray-600">
          {isGerman 
            ? 'Sehen Sie, wie unser RAG-System funktioniert'
            : 'See how our RAG system works'
          }
        </p>
      </div>

      <div className="space-y-4">
        {content.demoSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col space-y-3">
        <AnimatedButton
          variant="primary"
          onClick={openRAGSystem}
          icon={<ExternalLink className="w-4 h-4" />}
          className="w-full"
        >
          {content.fullExperience}
        </AnimatedButton>
        
        <AnimatedButton
          variant="outline"
          onClick={() => setShowDemo(false)}
          className="w-full"
        >
          {isGerman ? 'Schließen' : 'Close'}
        </AnimatedButton>
      </div>
    </motion.div>
  )

  const MobileInterface = () => (
    <div className="space-y-6">
      {/* Mobile-optimized header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Smartphone className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium text-primary">
            {content.mobileOptimized}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {content.title}
        </h2>
        <p className="text-gray-600">
          {content.subtitle}
        </p>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-1 gap-3">
        {content.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{feature.label}</div>
              <div className="text-sm text-gray-600">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <AnimatedButton
          variant="primary"
          size="lg"
          onClick={openRAGSystem}
          icon={<ExternalLink className="w-5 h-5" />}
          className="w-full"
        >
          {content.openApp}
        </AnimatedButton>
        
        <AnimatedButton
          variant="outline"
          size="lg"
          onClick={() => setShowDemo(true)}
          icon={<Play className="w-5 h-5" />}
          className="w-full"
        >
          {content.quickDemo}
        </AnimatedButton>
      </div>

      {/* Additional info */}
      <div className="text-center text-sm text-gray-500">
        <p>
          {isGerman 
            ? 'Optimiert für Touch-Bedienung und mobile Browser'
            : 'Optimized for touch interaction and mobile browsers'
          }
        </p>
      </div>
    </div>
  )

  const DesktopInterface = () => (
    <div className="grid grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isGerman ? 'Desktop-Erfahrung' : 'Desktop Experience'}
            </span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <feature.icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <div className="font-medium text-gray-900">{feature.label}</div>
                <div className="text-sm text-gray-600">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <AnimatedButton
            variant="primary"
            size="lg"
            onClick={openRAGSystem}
            icon={<ExternalLink className="w-5 h-5" />}
          >
            {content.openApp}
          </AnimatedButton>
          
          <AnimatedButton
            variant="outline"
            size="lg"
            onClick={() => setShowDemo(true)}
            icon={<Play className="w-5 h-5" />}
          >
            {content.quickDemo}
          </AnimatedButton>
        </div>
      </div>

      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-16 h-16 text-primary/60 mx-auto mb-4" />
            <p className="text-gray-600">
              {isGerman 
                ? 'RAG System Vorschau'
                : 'RAG System Preview'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatedCard className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <AnimatePresence mode="wait">
          {showDemo ? (
            <InteractiveDemo key="demo" />
          ) : deviceType === 'mobile' ? (
            <MobileInterface key="mobile" />
          ) : (
            <DesktopInterface key="desktop" />
          )}
        </AnimatePresence>
      </div>
    </AnimatedCard>
  )
}

export default MobileRAGInterface