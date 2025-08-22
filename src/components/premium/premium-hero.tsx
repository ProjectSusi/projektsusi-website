'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Play, Shield, Zap, CheckCircle, ArrowRight, Star, Users, Building, Sparkles, Crown, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PremiumDemoWidget from '@/components/premium/premium-demo-widget'
import { cn, trackEvent } from '@/lib/utils'

interface PremiumHeroProps {
  locale: string
}

const PremiumHero: React.FC<PremiumHeroProps> = ({ locale }) => {
  const [showDemo, setShowDemo] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  
  const isGerman = locale === 'de'

  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        })
      }
    }

    const heroElement = heroRef.current
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove)
      return () => heroElement.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const handleDemoClick = () => {
    setShowDemo(!showDemo)
    trackEvent('premium_demo_toggled', { action: showDemo ? 'close' : 'open' })
  }

  const handleCTAClick = (type: 'demo' | 'contact') => {
    trackEvent('premium_cta_clicked', { type })
  }

  const particles = Array.from({ length: 12 }, (_, i) => i)
  const betaPartners = [
    { name: 'Early Adopter', icon: '🚀', glow: 'rgba(255, 0, 0, 0.3)' },
    { name: 'Beta Tester', icon: '🔬', glow: 'rgba(0, 102, 204, 0.3)' },
    { name: 'Innovation Lab', icon: '💡', glow: 'rgba(255, 119, 0, 0.3)' },
    { name: 'Tech Partner', icon: '⚡', glow: 'rgba(0, 153, 204, 0.3)' },
    { name: 'Pilot Program', icon: '🎯', glow: 'rgba(255, 0, 0, 0.3)' },
    { name: 'Alpha User', icon: '✨', glow: 'rgba(0, 102, 204, 0.3)' }
  ]

  return (
    <section 
      ref={heroRef}
      className="premium-hero min-h-screen flex items-center relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div key={particle} className="particle" />
        ))}
      </div>

      {/* Swiss Pattern Overlay */}
      <div className="swiss-pattern opacity-30" />

      {/* Mountain Silhouette */}
      <div className="mountain-silhouette" />

      {/* Main Content */}
      <div className="relative w-full z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero Content */}
            <div className="text-center mb-16">
              {/* Premium Badge with Animation */}
              <div className={cn(
                "inline-flex items-center space-x-3 glass-morphism rounded-full px-6 py-3 mb-8 transition-all duration-1000 hover-glow",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <div className="swiss-flag animate-pulse" />
                <Crown className="w-5 h-5 text-yellow-400 animate-bounce" />
                <span className="text-white font-semibold text-sm tracking-wide">
                  {isGerman ? 'Swiss Startup Innovation • Ready for Beta Partners' : 'Swiss Startup Innovation • Ready for Beta Partners'}
                </span>
                <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
              </div>

              {/* Premium Main Headline */}
              <h1 className={cn(
                "text-5xl sm:text-6xl lg:text-8xl font-bold mb-8 leading-tight premium-heading transition-all duration-1200 delay-200",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              )}>
                {isGerman ? (
                  <>
                    <span className="premium-title block">
                      Die <span className="luxury-gradient-text">Schweizer</span> KI-Revolution
                    </span>
                    <span className="shimmer-text block mt-4">
                      für Enterprise <span className="text-yellow-400">Excellence</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="premium-title block">
                      The <span className="luxury-gradient-text">Swiss</span> AI Revolution
                    </span>
                    <span className="shimmer-text block mt-4">
                      for Enterprise <span className="text-yellow-400">Excellence</span>
                    </span>
                  </>
                )}
              </h1>

              {/* Premium Subheadline */}
              <div className={cn(
                "text-xl lg:text-3xl text-white/95 mb-10 max-w-5xl mx-auto leading-relaxed transition-all duration-1000 delay-400",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <div className="glass-morphism rounded-2xl p-8 backdrop-blur-3xl">
                  <p className="font-light tracking-wide">
                    {isGerman 
                      ? '🚀 Vollständige Datensouveränität + Zero-Hallucination AI + Swiss Precision Engineering'
                      : '🚀 Complete Data Sovereignty + Zero-Hallucination AI + Swiss Precision Engineering'}
                  </p>
                </div>
              </div>

              {/* Premium Benefits Grid */}
              <div className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto transition-all duration-1000 delay-600",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                {[
                  {
                    icon: Shield,
                    title: isGerman ? 'Swiss Fortress Security' : 'Swiss Fortress Security',
                    subtitle: isGerman ? 'Bank-Grade Verschlüsselung' : 'Bank-grade encryption',
                    glow: 'rgba(255, 0, 0, 0.3)'
                  },
                  {
                    icon: Award,
                    title: isGerman ? 'Zero-Hallucination Guarantee' : 'Zero-Hallucination Guarantee',
                    subtitle: isGerman ? '100% Fakten, 0% Erfindungen' : '100% facts, 0% fiction',
                    glow: 'rgba(0, 255, 0, 0.3)'
                  },
                  {
                    icon: Zap,
                    title: isGerman ? 'Lightning Implementation' : 'Lightning Implementation',
                    subtitle: isGerman ? 'Live in 5 Minuten' : 'Live in 5 minutes',
                    glow: 'rgba(255, 119, 0, 0.3)'
                  }
                ].map((benefit, index) => (
                  <div key={index} className="luxury-card rounded-2xl p-6 hover-lift micro-bounce group">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${benefit.glow}, rgba(255, 255, 255, 0.1))`,
                        boxShadow: `0 0 30px ${benefit.glow}`
                      }}
                    >
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.subtitle}</p>
                  </div>
                ))}
              </div>

              {/* Premium CTA Buttons */}
              <div className={cn(
                "flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transition-all duration-1000 delay-800",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <Button 
                  size="xl" 
                  className="btn-premium text-lg px-12 py-4 hover-glow micro-bounce"
                  onClick={handleDemoClick}
                >
                  <Play className="w-6 h-6 mr-3" />
                  {isGerman ? 'Exklusive Live Demo' : 'Exclusive Live Demo'}
                  <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
                </Button>
                
                <Button 
                  size="xl" 
                  className="glass-morphism border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 text-lg px-12 py-4 hover-lift micro-bounce"
                  onClick={() => handleCTAClick('contact')}
                  asChild
                >
                  <Link href="/contact">
                    <Crown className="w-6 h-6 mr-3" />
                    {isGerman ? 'VIP Beratung' : 'VIP Consultation'}
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Premium Video/Demo Preview */}
              <div className={cn(
                "max-w-4xl mx-auto transition-all duration-1000 delay-1000",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                <Card className="luxury-card overflow-hidden border-2 border-white/20 hover-lift">
                  <CardContent className="p-0">
                    <div 
                      className="aspect-video bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center relative group cursor-pointer overflow-hidden"
                      onClick={handleDemoClick}
                    >
                      {/* Dynamic Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-blue-500/20 animate-pulse" />
                      
                      {/* Premium Play Button */}
                      <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 mx-auto shadow-2xl">
                          <Play className="w-12 h-12 text-white ml-2" />
                          <div className="absolute inset-0 rounded-full animate-ping bg-white/20"></div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {isGerman 
                            ? '🚀 Von Upload zur Antwort in 30 Sekunden'
                            : '🚀 From upload to answer in 30 seconds'}
                        </h3>
                        
                        <p className="text-white/80 mb-4">
                          {isGerman ? 'Erleben Sie Swiss AI Excellence live' : 'Experience Swiss AI Excellence live'}
                        </p>

                        <div className="flex justify-center space-x-8 text-sm">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-white">🏦 {isGerman ? 'Banking Docs' : 'Banking Docs'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-white">💊 {isGerman ? 'Pharma Research' : 'Pharma Research'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-white">🏛️ {isGerman ? 'Gov Documents' : 'Gov Documents'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Sparkles className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                          <p className="text-xl font-semibold">
                            {isGerman ? 'Demo starten' : 'Start Demo'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Premium Demo Widget */}
            {showDemo && (
              <div className={cn(
                "mb-16 transition-all duration-700",
                "animate-fade-in"
              )}>
                <Card className="luxury-card border-2 border-white/20 p-8 backdrop-blur-3xl">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                      <h2 className="text-4xl font-bold luxury-gradient-text">
                        {isGerman ? 'Premium Swiss AI Experience' : 'Premium Swiss AI Experience'}
                      </h2>
                      <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                    <p className="text-xl text-gray-600">
                      {isGerman 
                        ? 'Testen Sie die fortschrittlichste RAG-Technologie der Schweiz'
                        : 'Test Switzerland\'s most advanced RAG technology'}
                    </p>
                  </div>
                  
                  <PremiumDemoWidget locale={locale} />
                  
                  <div className="text-center mt-8">
                    <Button 
                      variant="outline" 
                      onClick={handleDemoClick}
                      className="px-8 py-3 hover-lift glass-morphism border-white/30"
                    >
                      {isGerman ? '✕ Demo schließen' : '✕ Close Demo'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Premium Social Proof */}
            <div className={cn(
              "text-center transition-all duration-1000 delay-1200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}>
              <div className="glass-morphism rounded-3xl p-8 backdrop-blur-3xl">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                  <h3 className="text-2xl font-bold text-white">
                    {isGerman 
                      ? 'Bereit für Beta Partner & Early Adopters'
                      : 'Ready for Beta Partners & Early Adopters'}
                  </h3>
                  <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
                
                {/* Animated Beta Partner Types */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                  {betaPartners.map((partner, index) => (
                    <div 
                      key={partner.name}
                      className={cn(
                        "luxury-card p-6 hover-lift hover-glow micro-bounce group transition-all duration-300",
                        `animate-delay-${index * 100}`
                      )}
                      style={{ '--hover-glow': partner.glow } as any}
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                        {partner.icon}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                        {partner.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Startup Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                  {[
                    { icon: Star, value: '2025', label: isGerman ? 'Swiss Innovation' : 'Swiss Innovation', color: 'text-yellow-400' },
                    { icon: Users, value: 'Beta', label: isGerman ? 'Program Ready' : 'Program Ready', color: 'text-blue-400' },
                    { icon: Building, value: '100%', label: isGerman ? 'Swiss Hosted' : 'Swiss Hosted', color: 'text-green-400' },
                    { icon: Shield, value: 'Open', label: isGerman ? 'For Partners' : 'For Partners', color: 'text-primary-400' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center group">
                      <div className="flex items-center justify-center mb-2">
                        <stat.icon className={`w-6 h-6 ${stat.color} mr-2 group-hover:animate-pulse`} />
                        <span className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="flex flex-col items-center hover-lift cursor-pointer">
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center mb-2">
            <div className="w-1 h-4 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full mt-2 animate-pulse" />
          </div>
          <p className="text-xs font-medium tracking-wider uppercase">
            {isGerman ? 'Entdecken Sie mehr' : 'Discover More'}
          </p>
          <ArrowRight className="w-4 h-4 mt-1 rotate-90 animate-bounce" />
        </div>
      </div>
    </section>
  )
}

export default PremiumHero