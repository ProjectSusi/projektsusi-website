'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Zap, CheckCircle, Globe, Brain, Lock, Gauge, Users, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BenefitsProps {
  locale: string
}

const Benefits: React.FC<BenefitsProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const mainBenefits = [
    {
      icon: Shield,
      title: isGerman ? 'Swiss Data Sovereignty' : 'Swiss Data Sovereignty',
      description: isGerman 
        ? '100% Schweizer Datenhaltung mit vollständiger Kontrolle über Ihre sensiblen Informationen'
        : '100% Swiss data residency with complete control over your sensitive information',
      features: [
        isGerman ? 'FADP & GDPR konform' : 'FADP & GDPR compliant',
        isGerman ? 'Lokale Verschlüsselung' : 'Local encryption',
        isGerman ? 'Keine Cloud-Abhängigkeit' : 'No cloud dependency',
        isGerman ? 'Audit-ready Logging' : 'Audit-ready logging'
      ],
      gradient: 'from-red-500 to-red-600',
      href: '/compliance'
    },
    {
      icon: Brain,
      title: isGerman ? 'Zero-Hallucination AI' : 'Zero-Hallucination AI',
      description: isGerman 
        ? 'Nur faktenbasierte Antworten mit vollständiger Quellenangabe - keine Erfindungen'
        : 'Only fact-based answers with complete source citations - no fabrications',
      features: [
        isGerman ? 'Quellenbasierte Antworten' : 'Source-based answers',
        isGerman ? 'Confidence Scoring' : 'Confidence scoring',
        isGerman ? 'Vollständige Nachverfolgung' : 'Complete traceability',
        isGerman ? 'Qualitätssicherung' : 'Quality assurance'
      ],
      gradient: 'from-blue-500 to-blue-600',
      href: '/technology'
    },
    {
      icon: Zap,
      title: isGerman ? '5-Minuten Setup' : '5-Minute Setup',
      description: isGerman 
        ? 'Produktionsreife Implementierung ohne komplexe Integration oder Setup'
        : 'Production-ready implementation without complex integration or setup',
      features: [
        isGerman ? 'Plug-and-Play Installation' : 'Plug-and-play installation',
        isGerman ? 'Vorkonfigurierte Templates' : 'Pre-configured templates',
        isGerman ? 'Automatische Updates' : 'Automatic updates',
        isGerman ? 'Sofortige Einsatzbereitschaft' : 'Immediate readiness'
      ],
      gradient: 'from-green-500 to-green-600',
      href: '/technology/demo'
    }
  ]

  const additionalBenefits = [
    {
      icon: Globe,
      title: isGerman ? 'Mehrsprachig Native' : 'Multilingual Native',
      description: isGerman ? 'Deutsch, Französisch, Italienisch, Rätoromanisch out-of-the-box' : 'German, French, Italian, Romansh out-of-the-box'
    },
    {
      icon: Lock,
      title: isGerman ? 'Enterprise Sicherheit' : 'Enterprise Security',
      description: isGerman ? 'Bank-Grade Verschlüsselung mit MFA und SSO Integration' : 'Bank-grade encryption with MFA and SSO integration'
    },
    {
      icon: Gauge,
      title: isGerman ? 'Sub-Sekunden Performance' : 'Sub-Second Performance',
      description: isGerman ? 'Optimiert für Schweizer Infrastruktur und Netzwerke' : 'Optimized for Swiss infrastructure and networks'
    },
    {
      icon: Users,
      title: isGerman ? 'Swiss Support Team' : 'Swiss Support Team',
      description: isGerman ? '24/7 Support von Schweizer KI-Experten in Ihrer Sprache' : '24/7 support from Swiss AI experts in your language'
    }
  ]

  const complianceFeatures = [
    { label: 'FADP', checked: true },
    { label: 'GDPR', checked: true },
    { label: 'FINMA', checked: true },
    { label: 'ISO 27001', checked: true },
    { label: 'SOC 2', checked: true },
    { label: 'Swiss Banking', checked: true }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isGerman ? 'Schweizer Qualität' : 'Swiss Quality'}
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            {isGerman 
              ? 'Warum Schweizer Unternehmen Projekt Susi wählen'
              : 'Why Swiss Enterprises Choose Projekt Susi'}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {isGerman 
              ? 'Die einzige RAG-Lösung, die speziell für Schweizer Compliance, Datenschutz und Mehrsprachigkeit entwickelt wurde.'
              : 'The only RAG solution specifically engineered for Swiss compliance, data privacy, and multilingual requirements.'}
          </p>
        </div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {mainBenefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group"
              hover
            >
              {/* Gradient overlay */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${benefit.gradient}`} />
              
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${benefit.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                
                <CardTitle className="text-xl mb-2">
                  {benefit.title}
                </CardTitle>
                
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-6">
                  {benefit.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                  asChild
                >
                  <Link href={benefit.href}>
                    {isGerman ? 'Mehr erfahren' : 'Learn more'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {additionalBenefits.map((benefit, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        {/* Compliance Showcase */}
        <Card className="bg-white border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl mb-2">
              {isGerman ? 'Vollständige Compliance Abdeckung' : 'Complete Compliance Coverage'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isGerman 
                ? 'Alle wichtigen Schweizer und internationalen Standards erfüllt'
                : 'All major Swiss and international standards met'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {complianceFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-800">{feature.label}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                {isGerman 
                  ? 'Automatische Compliance-Überwachung und Reporting für alle Standards'
                  : 'Automatic compliance monitoring and reporting for all standards'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="swiss" size="lg" asChild>
                  <Link href="/compliance">
                    <Shield className="w-5 h-5 mr-2" />
                    {isGerman ? 'Compliance Details' : 'Compliance Details'}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/compliance/audit-reports">
                    {isGerman ? 'Audit-Berichte anzeigen' : 'View Audit Reports'}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {isGerman 
                ? 'Bereit für Swiss AI Excellence?'
                : 'Ready for Swiss AI Excellence?'}
            </h3>
            <p className="text-xl mb-6 text-white/90">
              {isGerman 
                ? 'Starten Sie noch heute Ihre digitale Transformation'
                : 'Start your digital transformation today'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="default"
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/technology/demo">
                  <Zap className="w-5 h-5 mr-2" />
                  {isGerman ? 'Kostenlose Demo' : 'Free Demo'}
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary backdrop-blur-sm"
                asChild
              >
                <Link href="/contact">
                  {isGerman ? 'Beratung anfordern' : 'Request Consultation'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits