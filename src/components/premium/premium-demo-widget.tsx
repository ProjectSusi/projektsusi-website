'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import RAGInterface from '@/components/demo/rag-interface'

interface PremiumDemoWidgetProps {
  locale: string
  className?: string
}

const PremiumDemoWidget: React.FC<PremiumDemoWidgetProps> = ({ locale, className }) => {
  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <RAGInterface 
        locale={locale}
        apiBase={typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000'}
      />
    </div>
  )
}

export default PremiumDemoWidget