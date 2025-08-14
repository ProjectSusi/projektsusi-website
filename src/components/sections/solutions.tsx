'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, Pill, Factory, Building, ArrowRight, TrendingUp, Clock, Shield, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SolutionsProps {
  locale: string
}

const Solutions: React.FC<SolutionsProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const solutions = [
    {
      id: 'banking',
      icon: Building2,
      title: isGerman ? 'Finanzwesen' : 'Banking & Finance',
      description: isGerman 
        ? 'FINMA-konforme KI für Risikoanalyse, Compliance und Kundenservice'
        : 'FINMA-compliant AI for risk analysis, compliance, and customer service',
      marketSize: 'CHF 180M',
      features: [
        isGerman ? 'Automatisierte Risikoberichte' : 'Automated risk reports',
        isGerman ? 'Compliance Monitoring' : 'Compliance monitoring', 
        isGerman ? 'KYC/AML Unterstützung' : 'KYC/AML support',
        isGerman ? 'Regulatory Updates' : 'Regulatory updates'
      ],
      benefits: {
        timeReduction: '60%',
        costSavings: 'CHF 400K',
        complianceImprovement: '99.5%'
      },
      useCases: [
        isGerman ? 'Risk Management Analyse' : 'Risk management analysis',
        isGerman ? 'Investitionsforschung' : 'Investment research',
        isGerman ? 'Regulatorische Berichterstattung' : 'Regulatory reporting'
      ],
      gradient: 'from-primary to-secondary',
      href: '/solutions/banking'
    },
    {
      id: 'pharma',
      icon: Pill,
      title: isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences',
      description: isGerman 
        ? 'Beschleunigen Sie Arzneimittelforschung und klinische Studien'
        : 'Accelerate drug discovery and clinical research',
      marketSize: 'CHF 95M',
      features: [
        isGerman ? 'Klinische Studienanalyse' : 'Clinical trial analysis',
        isGerman ? 'Regulatory Submissions' : 'Regulatory submissions',
        isGerman ? 'Literature Mining' : 'Literature mining',
        isGerman ? 'Adverse Event Monitoring' : 'Adverse event monitoring'
      ],
      benefits: {
        timeReduction: '45%',
        costSavings: 'CHF 2.1M',
        complianceImprovement: '98.8%'
      },
      useCases: [
        isGerman ? 'Drug Discovery Literatur' : 'Drug discovery literature',
        isGerman ? 'Klinische Protokoll-Analyse' : 'Clinical protocol analysis',
        isGerman ? 'Regulatorische Zulassung' : 'Regulatory approval'
      ],
      gradient: 'from-green-500 to-green-600',
      href: '/solutions/pharma'
    },
    {
      id: 'manufacturing',
      icon: Factory,
      title: isGerman ? 'Produktion' : 'Manufacturing',
      description: isGerman 
        ? 'Qualitätsmanagement und Compliance-Automatisierung'
        : 'Quality management and compliance automation',
      marketSize: 'CHF 75M',
      features: [
        isGerman ? 'Qualitätsdokumentation' : 'Quality documentation',
        isGerman ? 'Audit-Vorbereitung' : 'Audit preparation',
        isGerman ? 'SOP Management' : 'SOP management',
        isGerman ? 'Incident Analysis' : 'Incident analysis'
      ],
      benefits: {
        timeReduction: '55%',
        costSavings: 'CHF 850K',
        complianceImprovement: '99.2%'
      },
      useCases: [
        isGerman ? 'ISO-Zertifizierung' : 'ISO certification',
        isGerman ? 'Qualitätskontrolle' : 'Quality control',
        isGerman ? 'Lieferanten-Audits' : 'Supplier audits'
      ],
      gradient: 'from-orange-500 to-orange-600',
      href: '/solutions/manufacturing'
    },
    {
      id: 'government',
      icon: Building,
      title: isGerman ? 'Öffentlicher Sektor' : 'Government',
      description: isGerman 
        ? 'Mehrsprachige Bürgerdienste und Policy-Management'
        : 'Multilingual citizen services and policy management',
      marketSize: 'CHF 65M',
      features: [
        isGerman ? 'Bürgerdienste 24/7' : '24/7 citizen services',
        isGerman ? 'Mehrsprachige Unterstützung' : 'Multilingual support',
        isGerman ? 'Policy-Dokumentation' : 'Policy documentation',
        isGerman ? 'Compliance Tracking' : 'Compliance tracking'
      ],
      benefits: {
        timeReduction: '70%',
        costSavings: 'CHF 1.2M',
        complianceImprovement: '99.9%'
      },
      useCases: [
        isGerman ? 'Bürgeranfragen bearbeiten' : 'Process citizen inquiries',
        isGerman ? 'Gesetzesnavigation' : 'Legal navigation',
        isGerman ? 'Verwaltungseffizienz' : 'Administrative efficiency'
      ],
      gradient: 'from-red-500 to-red-600',
      href: '/solutions/government'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isGerman ? 'Branchenlösungen' : 'Industry Solutions'}
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            {isGerman 
              ? 'Massgeschneidert für Schweizer Branchen'
              : 'Tailored for Swiss Industries'}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {isGerman 
              ? 'Spezialisierte RAG-Lösungen mit branchenspezifischen Compliance-Anforderungen und Workflows.'
              : 'Specialized RAG solutions with industry-specific compliance requirements and workflows.'}
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <Card 
              key={solution.id}
              className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 hover:border-primary/20"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${solution.gradient}`} />
              
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${solution.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <solution.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {isGerman ? 'Marktgröße' : 'Market Size'}
                    </div>
                    <div className="font-bold text-primary">{solution.marketSize}</div>
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-3">
                  {solution.title}
                </CardTitle>
                
                <CardDescription className="text-base text-muted-foreground">
                  {solution.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Features */}
                <div>
                  <h4 className="font-semibold text-secondary mb-3">
                    {isGerman ? 'Hauptfunktionen:' : 'Key Features:'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="font-bold text-blue-600">{solution.benefits.timeReduction}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isGerman ? 'Zeitersparnis' : 'Time Saved'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="font-bold text-green-600">{solution.benefits.costSavings}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isGerman ? 'Einsparung/Jahr' : 'Savings/Year'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="w-4 h-4 text-red-500 mr-1" />
                      <span className="font-bold text-red-600">{solution.benefits.complianceImprovement}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isGerman ? 'Compliance' : 'Compliance'}
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-semibold text-secondary mb-3">
                    {isGerman ? 'Anwendungsfälle:' : 'Use Cases:'}
                  </h4>
                  <ul className="space-y-1">
                    {solution.useCases.map((useCase, caseIndex) => (
                      <li key={caseIndex} className="text-sm text-muted-foreground flex items-center">
                        <ArrowRight className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-all"
                    variant="outline"
                    asChild
                  >
                    <Link href={solution.href}>
                      {isGerman ? 'Mehr erfahren' : 'Learn More'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Industry Stats */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">
              {isGerman ? 'Schweizer Marktführerschaft' : 'Swiss Market Leadership'}
            </h3>
            <p className="text-white/90">
              {isGerman 
                ? 'Vertrauen Sie der #1 RAG-Lösung für Schweizer Unternehmen'
                : 'Trust the #1 RAG solution for Swiss enterprises'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">CHF 415M</div>
              <div className="text-white/80 text-sm">
                {isGerman ? 'Gesamtmarkt Schweiz' : 'Total Swiss Market'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-white/80 text-sm">
                {isGerman ? 'Enterprise Kunden' : 'Enterprise Customers'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-white/80 text-sm">
                {isGerman ? 'Kundenzufriedenheit' : 'Customer Satisfaction'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-white/80 text-sm">
                {isGerman ? 'Swiss Support' : 'Swiss Support'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8 border-2 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl mb-2">
                {isGerman ? 'Ihre Branche nicht dabei?' : 'Don\'t see your industry?'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isGerman 
                  ? 'Wir entwickeln massgeschneiderte Lösungen für jede Branche'
                  : 'We develop custom solutions for every industry'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="swiss" asChild>
                  <Link href="/contact">
                    {isGerman ? 'Beratung anfordern' : 'Request Consultation'}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/solutions">
                    {isGerman ? 'Alle Lösungen ansehen' : 'View All Solutions'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default Solutions