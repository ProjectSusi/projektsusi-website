'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Shield, Zap, CheckCircle, ArrowRight, Star, Users, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DemoWidget from '@/components/demo/demo-widget'
import TrustIndicators from '@/components/ui/trust-indicators'
import { cn, trackEvent } from '@/lib/utils'

interface HeroProps {
  locale: string
}

const Hero: React.FC<HeroProps> = ({ locale }) => {
  const [showDemo, setShowDemo] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)
  
  const isGerman = locale === 'de'

  // Animation sequence for hero elements
  useEffect(() => {
    const phases = [0, 1, 2, 3]
    phases.forEach((phase, index) => {
      setTimeout(() => setAnimationPhase(phase), index * 200)
    })
  }, [])

  // Trusted companies logos (mock data)
  const trustedCompanies = [
    { name: 'UBS', logo: '🏦' },
    { name: 'Credit Suisse', logo: '🏛️' },
    { name: 'Roche', logo: '💊' },
    { name: 'Novartis', logo: '🧬' },
    { name: 'Swiss Re', logo: '🛡️' },
    { name: 'Zurich Insurance', logo: '☂️' }
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
                  🇨🇭 {isGerman ? 'Swiss-engineered • Trusted by 500+ enterprises' : 'Swiss-engineered • Trusted by 500+ enterprises'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className={cn(
                "text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-700 delay-100",
                animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {isGerman ? (
                  <>
                    Die <span className="text-primary-foreground bg-primary/20 px-2 rounded">Schweizer</span> KI-Lösung<br />
                    für Schweizer <span className="text-gradient">Unternehmen</span>
                  </>
                ) : (
                  <>
                    The <span className="text-primary-foreground bg-primary/20 px-2 rounded">Swiss</span> AI Solution<br />
                    for Enterprise <span className="text-gradient">Intelligence</span>
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className={cn(
                "text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-200",
                animationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                {isGerman 
                  ? 'Vollständige Datenkontrolle + Regulatorische Compliance + Mehrsprachiger Support'
                  : 'Complete Data Sovereignty + Regulatory Excellence + Zero Hallucination AI'}
              </p>

              {/* Key Benefits */}
              <div className={cn(
                "flex flex-wrap justify-center gap-6 mb-10 transition-all duration-700 delay-300",
                animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {isGerman ? 'Swiss Data Sovereignty' : 'Swiss Data Sovereignty'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {isGerman ? 'Null-Halluzination Garantie' : 'Zero Hallucination Guarantee'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {isGerman ? '5-Minuten Setup' : '5-Minute Setup'}
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
                      {isGerman ? 'Testen Sie Projekt Susi Live' : 'Try Projekt Susi Live'}
                    </h2>
                    <p className="text-muted-foreground">
                      {isGerman 
                        ? 'Laden Sie Ihre eigenen Dokumente hoch oder testen Sie mit Beispieldateien'
                        : 'Upload your own documents or try with sample files'}
                    </p>
                  </div>
                  <DemoWidget locale={locale} />
                  
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

            {/* Social Proof */}
            <div className="text-center">
              <p className="text-white/80 text-lg font-medium mb-8">
                {isGerman 
                  ? 'Vertraut von führenden Schweizer Unternehmen'
                  : 'Trusted by leading Swiss enterprises'}
              </p>
              
              {/* Company Logos */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                {trustedCompanies.map((company, index) => (
                  <div 
                    key={company.name}
                    className={cn(
                      "flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-white/20 transition-all",
                      `animate-delay-${index * 100}`
                    )}
                  >
                    <span className="text-2xl">{company.logo}</span>
                    <span className="text-white font-medium text-sm">{company.name}</span>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="my-12">
                <TrustIndicators locale={locale} variant="hero" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-3xl font-bold text-white">4.9</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {isGerman ? 'Kundenbewertung' : 'Customer Rating'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-green-400 mr-1" />
                    <span className="text-3xl font-bold text-white">500+</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {isGerman ? 'Aktive Kunden' : 'Active Customers'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Building className="w-5 h-5 text-blue-400 mr-1" />
                    <span className="text-3xl font-bold text-white">99.9%</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    {isGerman ? 'Uptime SLA' : 'Uptime SLA'}
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