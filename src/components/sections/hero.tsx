'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Shield, Zap, CheckCircle, ArrowRight, Star, Users, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DemoWidget from '@/components/demo/demo-widget'
import LiveRAGIntegration from '@/components/demo/live-rag-integration'
import TrustIndicators from '@/components/ui/trust-indicators'
import { cn, trackEvent } from '@/lib/utils'

interface HeroProps {
  locale: string
}

const Hero: React.FC<HeroProps> = ({ locale }) => {
  const [showDemo, setShowDemo] = useState(false)
  const [useLiveSystem, setUseLiveSystem] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)
  
  const isGerman = locale === 'de'

  // Animation sequence for hero elements
  useEffect(() => {
    const phases = [0, 1, 2, 3]
    phases.forEach((phase, index) => {
      setTimeout(() => setAnimationPhase(phase), index * 200)
    })
  }, [])

  // Technology partners and integrations
  const techStack = [
    { name: 'FastAPI', logo: '⚡' },
    { name: 'Ollama', logo: '🦙' },
    { name: 'FAISS', logo: '🔍' },
    { name: 'PostgreSQL', logo: '🐘' },
    { name: 'Docker', logo: '🐳' },
    { name: 'Next.js', logo: '▲' }
  ]

  const handleDemoClick = () => {
    setShowDemo(!showDemo)
    trackEvent('hero_demo_toggled', { action: showDemo ? 'close' : 'open' })
  }

  const handleCTAClick = (type: 'demo' | 'contact') => {
    trackEvent('hero_cta_clicked', { type })
  }

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background with Swiss-inspired gradient */}
      <div className="absolute inset-0 swiss-gradient opacity-95" />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Swiss pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 2px, transparent 2px), radial-gradient(circle at 80% 20%, white 2px, transparent 2px)',
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto">
            
            {/* Main Hero Content */}
            <div className="text-center mb-16">
              {/* Badge */}
              <div className={cn(
                "inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 transition-all duration-700",
                animationPhase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">
                  {isGerman ? 'RAG System v3.2 • Open Source' : 'RAG System v3.2 • Open Source'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className={cn(
                "text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-700 delay-100",
                animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {isGerman ? (
                  <>
                    Die <span className="text-blue-200 font-semibold">Schweizer</span> KI-Lösung<br />
                    für Schweizer <span className="text-white font-bold">Unternehmen</span>
                  </>
                ) : (
                  <>
                    The <span className="text-blue-200 font-semibold">Swiss</span> AI Solution<br />
                    for Enterprise <span className="text-white font-bold">Intelligence</span>
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className={cn(
                "text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-200",
                animationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {isGerman
                  ? 'Hybrid Search • Conversation Memory • Knowledge Graph • Multilingual (DE/EN)'
                  : 'Hybrid Search • Conversation Memory • Knowledge Graph • Multilingual (DE/EN)'}
              </p>

              {/* Key Benefits */}
              <div className={cn(
                "flex flex-wrap justify-center gap-6 mb-10 transition-all duration-700 delay-300",
                animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {isGerman ? 'FAISS + BM25 Hybrid' : 'FAISS + BM25 Hybrid'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {isGerman ? 'FastAPI + Ollama' : 'FastAPI + Ollama'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {isGerman ? '~130ms Antwortzeit' : '~130ms Response Time'}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className={cn(
                "flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-700 delay-400",
                animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <Button 
                  size="xl" 
                  variant="default"
                  className="bg-white text-secondary hover:bg-white/90 shadow-xl"
                  onClick={handleDemoClick}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isGerman ? 'Live Demo starten' : 'Start Live Demo'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-secondary shadow-xl backdrop-blur-sm"
                  onClick={() => handleCTAClick('contact')}
                  asChild
                >
                  <Link href="/contact">
                    <Shield className="w-5 h-5 mr-2" />
                    {isGerman ? 'Beratung anfordern' : 'Request Consultation'}
                  </Link>
                </Button>
              </div>

              {/* Video/Demo Teaser */}
              <div className={cn(
                "max-w-2xl mx-auto transition-all duration-700 delay-500",
                animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center relative group cursor-pointer"
                         onClick={handleDemoClick}>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                        <p className="text-white font-medium">
                          {isGerman 
                            ? 'Von Upload bis zur Antwort in 30 Sekunden'
                            : 'From upload to answer in 30 seconds'}
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                          {isGerman ? 'Klicken für Live Demo' : 'Click for live demo'}
                        </p>
                      </div>
                      
                      {/* Demo preview overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm text-white mb-2">
                            ✓ {isGerman ? 'Schweizer Bank-Docs' : 'Swiss Bank Docs'}
                          </div>
                          <div className="text-sm text-white mb-2">
                            ✓ {isGerman ? 'Pharma-Forschung' : 'Pharma Research'}
                          </div>
                          <div className="text-sm text-white">
                            ✓ {isGerman ? 'Behörden-Unterlagen' : 'Government Docs'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Integrated Demo Widget */}
            {showDemo && (
              <div className="mb-16 animate-fade-in">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-secondary mb-4">
                      {isGerman ? 'Erleben Sie Temora AI Live' : 'Experience Temora AI Live'}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {isGerman 
                        ? 'Vollzugriff auf das produktive RAG-System - laden Sie Ihre eigenen Dokumente hoch'
                        : 'Full access to the production RAG system - upload your own documents'}
                    </p>
                    
                    {/* Demo Mode Toggle */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <Button
                        variant={useLiveSystem ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseLiveSystem(true)}
                        className="flex items-center space-x-2"
                      >
                        <span>🚀</span>
                        <span>{isGerman ? 'Live System' : 'Live System'}</span>
                      </Button>
                      <Button
                        variant={!useLiveSystem ? "default" : "outline"}
                        size="sm"
                        onClick={() => setUseLiveSystem(false)}
                        className="flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>{isGerman ? 'Interaktive Demo' : 'Interactive Demo'}</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Demo Content */}
                  {useLiveSystem ? (
                    <LiveRAGIntegration locale={locale} variant="embedded" height="600px" />
                  ) : (
                    <DemoWidget locale={locale} />
                  )}
                  
                  <div className="text-center mt-8">
                    <Button 
                      variant="outline" 
                      onClick={handleDemoClick}
                      className="px-8"
                    >
                      {isGerman ? 'Demo schließen' : 'Close Demo'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Stack */}
            <div className="text-center">
              <p className="text-white/80 text-lg font-medium mb-8">
                {isGerman
                  ? 'Open Source Technologie-Stack'
                  : 'Open Source Technology Stack'}
              </p>

              {/* Technical Components */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">FastAPI</div>
                  <div className="text-white/70 text-xs">{isGerman ? 'Backend' : 'Backend'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">Ollama</div>
                  <div className="text-white/70 text-xs">{isGerman ? 'LLM Runtime' : 'LLM Runtime'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">FAISS</div>
                  <div className="text-white/70 text-xs">{isGerman ? 'Vector DB' : 'Vector DB'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                  <div className="text-white font-semibold text-sm mb-1">SQLite</div>
                  <div className="text-white/70 text-xs">{isGerman ? 'Datenbank' : 'Database'}</div>
                </div>
              </div>

              {/* System Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-blue-400 mr-1" />
                    <span className="text-3xl font-bold text-white">~130ms</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {isGerman ? 'Avg. Antwortzeit' : 'Avg. Response Time'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-green-400 mr-1" />
                    <span className="text-3xl font-bold text-white">384</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {isGerman ? 'Embedding Dims' : 'Embedding Dims'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Building className="w-5 h-5 text-purple-400 mr-1" />
                    <span className="text-3xl font-bold text-white">40+</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {isGerman ? 'Services' : 'Services'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="flex flex-col items-center">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
          <p className="text-xs mt-2">
            {isGerman ? 'Scroll für mehr' : 'Scroll for more'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero