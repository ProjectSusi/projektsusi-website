'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import DemoWidget from '@/components/demo/demo-widget'
import LiveRAGIntegration from '@/components/demo/live-rag-integration'
import { Button } from '@/components/ui/button'
import { Play, Rocket } from 'lucide-react'

interface PremiumDemoWidgetProps {
  locale: string
  className?: string
}

const PremiumDemoWidget: React.FC<PremiumDemoWidgetProps> = ({ locale, className }) => {
  const [showLiveSystem, setShowLiveSystem] = useState(true)
  const isGerman = locale === 'de'

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Toggle Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <Button
          variant={showLiveSystem ? "default" : "outline"}
          onClick={() => setShowLiveSystem(true)}
          className="flex items-center space-x-2"
        >
          <Rocket className="w-4 h-4" />
          <span>{isGerman ? 'Live System' : 'Live System'}</span>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">LIVE</span>
        </Button>
        <Button
          variant={!showLiveSystem ? "default" : "outline"}
          onClick={() => setShowLiveSystem(false)}
          className="flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isGerman ? 'Interaktive Demo' : 'Interactive Demo'}</span>
        </Button>
      </div>

      {/* Content Display */}
      {showLiveSystem ? (
        <LiveRAGIntegration locale={locale} variant="embedded" height="700px" />
      ) : (
        <DemoWidget locale={locale} className={className} />
      )}
    </div>
  )
}

export default PremiumDemoWidget