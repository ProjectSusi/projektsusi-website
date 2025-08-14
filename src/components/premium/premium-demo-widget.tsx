'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import DemoWidget from '@/components/demo/demo-widget'

interface PremiumDemoWidgetProps {
  locale: string
  className?: string
}

const PremiumDemoWidget: React.FC<PremiumDemoWidgetProps> = ({ locale, className }) => {
  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <DemoWidget locale={locale} className={className} />
    </div>
  )
}

export default PremiumDemoWidget