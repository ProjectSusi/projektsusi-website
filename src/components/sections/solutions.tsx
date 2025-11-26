'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Headphones, Users, FileText, ArrowRight, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface SolutionsProps {
  locale: string
}

const Solutions: React.FC<SolutionsProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  // Use cases from the PPTX presentation
  const useCases = [
    {
      id: 'sales',
      icon: Building2,
      title: isGerman ? 'Vertriebsmitarbeitende' : 'Sales Staff',
      situation: isGerman
        ? 'Im Gespräch mit dem Kunden braucht es schnell korrekte Informationen zu Produkten, technischen Details oder Vergleichen.'
        : 'During customer conversations, you need quick and accurate information about products, technical details, or comparisons.',
      benefits: [
        isGerman ? 'Schnelle, verlässliche Auskünfte' : 'Fast, reliable information',
        isGerman ? 'Unterlagen mit Quellenlink verfügbar' : 'Documents with source links available',
        isGerman ? 'Professionelle Beratung' : 'Professional consulting',
        isGerman ? 'Besonders hilfreich für neue Mitarbeitende' : 'Especially helpful for new employees'
      ],
      example: isGerman
        ? '"Unterschied zwischen Produkt A und B?"'
        : '"Difference between Product A and B?"',
      gradient: 'from-primary to-secondary'
    },
    {
      id: 'specialists',
      icon: FileText,
      title: isGerman ? 'Fachstellen' : 'Specialist Departments',
      situation: isGerman
        ? 'Für bestimmte Aufgaben werden Prozesswissen, technische Informationen oder interne Vorgaben benötigt.'
        : 'For certain tasks, process knowledge, technical information, or internal guidelines are needed.',
      benefits: [
        isGerman ? 'Mitarbeitende lösen Themen eigenständig' : 'Employees solve issues independently',
        isGerman ? 'Fachstellen werden entlastet' : 'Specialist departments are relieved',
        isGerman ? 'Wissen ist zentral verfügbar' : 'Knowledge is centrally available',
        isGerman ? 'Weniger Abhängigkeit von Einzelpersonen' : 'Less dependency on individuals'
      ],
      example: isGerman
        ? '"Wie funktioniert Prozess Y?"'
        : '"How does Process Y work?"',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'it',
      icon: Headphones,
      title: isGerman ? 'IT-Unterstützung' : 'IT Support',
      situation: isGerman
        ? 'Bei alltäglichen IT-Herausforderungen wie VPN, Passwort-Resets oder Softwareanleitungen entstehen häufig Supportanfragen.'
        : 'Everyday IT challenges like VPN, password resets, or software guides often create support requests.',
      benefits: [
        isGerman ? 'Weniger Supporttickets' : 'Fewer support tickets',
        isGerman ? 'Schnelle Selbsthilfe' : 'Quick self-help',
        isGerman ? 'IT-Abteilung wird entlastet' : 'IT department is relieved',
        isGerman ? 'Klare Schritt-für-Schritt-Anleitungen' : 'Clear step-by-step instructions'
      ],
      example: isGerman
        ? '"Wie richte ich VPN ein?"'
        : '"How do I set up VPN?"',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'hr',
      icon: Users,
      title: isGerman ? 'HR-Fragen' : 'HR Questions',
      situation: isGerman
        ? 'Im Alltag tauchen Fragen zu Ferienanträgen, Spesen oder Homeoffice-Regeln auf - Informationen, die oft schwer zu finden sind.'
        : 'Daily questions about vacation requests, expenses, or home office rules arise - information that is often hard to find.',
      benefits: [
        isGerman ? 'Mitarbeitende finden Infos sofort' : 'Employees find info immediately',
        isGerman ? 'HR wird spürbar entlastet' : 'HR is noticeably relieved',
        isGerman ? 'Prozesse laufen einheitlicher' : 'Processes run more uniformly',
        isGerman ? 'Antworten aus internen Richtlinien' : 'Answers from internal guidelines'
      ],
      example: isGerman
        ? '"Wie melde ich Ferien an?"'
        : '"How do I request vacation?"',
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  const additionalUseCases = [
    isGerman ? 'Compliance Weisungen und Richtlinien' : 'Compliance directives and guidelines',
    isGerman ? 'Prozesse und Aufgaben dokumentieren' : 'Document processes and tasks',
    isGerman ? 'Unterstützung zur Erfassung von E-Mails' : 'Support for email management'
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isGerman ? 'Einsatzmöglichkeiten' : 'Use Cases'}
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            {isGerman
              ? 'Wo Temora AI hilft'
              : 'Where Temora AI Helps'}
          </h2>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {isGerman
              ? 'Interner KI-Chatbot für schnelle Antworten auf Produkt- & Prozesswissen - direkt aus Ihren Dokumenten.'
              : 'Internal AI chatbot for quick answers on product & process knowledge - directly from your documents.'}
          </p>
        </div>

        {/* Use Cases Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {useCases.map((useCase) => (
            <motion.div key={useCase.id} variants={staggerItem}>
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-500 group border-2 hover:border-primary/20 h-full">
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${useCase.gradient}`} />

                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${useCase.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <useCase.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {useCase.title}
                      </CardTitle>
                    </div>
                  </div>

                  <CardDescription className="text-base text-muted-foreground">
                    <strong>{isGerman ? 'Situation:' : 'Situation:'}</strong> {useCase.situation}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Benefits */}
                  <div>
                    <h4 className="font-semibold text-secondary mb-3">
                      {isGerman ? 'Mehrwert:' : 'Benefits:'}
                    </h4>
                    <ul className="space-y-2">
                      {useCase.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Example */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      {isGerman ? 'Beispiel-Frage:' : 'Example question:'}{' '}
                    </span>
                    <span className="text-sm font-medium text-primary italic">
                      {useCase.example}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Use Cases */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-50 border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">
                {isGerman ? 'Weitere Möglichkeiten' : 'Additional Possibilities'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-3">
                {additionalUseCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full border"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Problem Statement from PPTX */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                {isGerman ? 'Das aktuelle Problem' : 'The Current Problem'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/90 text-lg mb-6 max-w-3xl mx-auto">
                {isGerman
                  ? 'Informationen sind verteilt und oft unstrukturiert. Die Suche ist häufig aufwändig und zeitintensiv.'
                  : 'Information is distributed and often unstructured. Searching is frequently time-consuming.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-3xl font-bold mb-1">19%</div>
                  <div className="text-white/80 text-sm">
                    {isGerman
                      ? 'der Arbeitszeit mit Suchen verbracht'
                      : 'of work time spent searching'}
                  </div>
                  <div className="text-white/60 text-xs mt-1">McKinsey Report</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <div className="text-3xl font-bold mb-1">5-30%</div>
                  <div className="text-white/80 text-sm">
                    {isGerman
                      ? 'Arbeitszeit für Auskünfte & Support'
                      : 'Work time for inquiries & support'}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {isGerman ? 'Je nach Abteilung' : 'Depending on department'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8 border-2 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl mb-2">
                {isGerman ? 'Interessiert an einem Pilotprojekt?' : 'Interested in a Pilot Project?'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isGerman
                  ? 'Gemeinsam definieren wir den Use Case mit dem höchsten Potenzial für Ihr Unternehmen'
                  : 'Together we define the use case with the highest potential for your company'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="swiss" asChild>
                  <Link href="/contact">
                    {isGerman ? 'Gespräch vereinbaren' : 'Schedule a Call'}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">
                    {isGerman ? 'Pilot-Konditionen' : 'Pilot Terms'}
                    <ArrowRight className="w-4 h-4 ml-2" />
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
