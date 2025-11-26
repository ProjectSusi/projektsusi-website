'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Rocket, Users, Building, Zap, Shield, ArrowRight, Calendar, Server, Settings } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  fadeInScale,
  staggerContainer,
  staggerItem
} from '@/lib/animations'
import AnimatedCard from '@/components/ui/animated-card'

interface PricingProps {
  locale: string
}

const Pricing: React.FC<PricingProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const pilotDetails = {
    serverCost: 550,
    setupCost: 250,
    duration: 3,
    total: 1900
  }

  const pilotFeatures = [
    isGerman ? 'Dedizierter GPU-Server in der Schweiz' : 'Dedicated GPU server in Switzerland',
    isGerman ? 'Vollständige RAG-Pipeline Setup' : 'Complete RAG pipeline setup',
    isGerman ? 'Ihre Dokumente & Use Cases' : 'Your documents & use cases',
    isGerman ? 'Direkter Entwickler-Support' : 'Direct developer support',
    isGerman ? 'Multilingual (DE/FR/IT/EN)' : 'Multilingual (DE/FR/IT/EN)',
    isGerman ? 'FADP/GDPR konform' : 'FADP/GDPR compliant',
    isGerman ? 'Quellenangaben bei jeder Antwort' : 'Source citations with every answer',
    isGerman ? 'MS Teams / Web Integration möglich' : 'MS Teams / Web integration possible'
  ]

  const whyPilot = [
    {
      icon: Rocket,
      title: isGerman ? 'Minimales Risiko' : 'Minimal Risk',
      description: isGerman
        ? 'Nur Infrastrukturkosten - unsere Arbeitszeit ist kostenfrei'
        : 'Only infrastructure costs - our work time is free'
    },
    {
      icon: Users,
      title: isGerman ? 'Gemeinsame Entwicklung' : 'Co-Development',
      description: isGerman
        ? 'Sie gestalten die Lösung mit, die zu Ihren Bedürfnissen passt'
        : 'You help shape a solution that fits your needs'
    },
    {
      icon: Shield,
      title: isGerman ? 'Schweizer Datenschutz' : 'Swiss Data Privacy',
      description: isGerman
        ? '100% Schweizer Server - Ihre Daten verlassen die Schweiz nie'
        : '100% Swiss servers - your data never leaves Switzerland'
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Vertrieb & Kundenservice' : 'Sales & Customer Service',
      description: isGerman
        ? 'Produktinfos, technische Details, schnelle Kundenantworten'
        : 'Product info, technical details, quick customer responses'
    },
    {
      title: isGerman ? 'HR & Interne Prozesse' : 'HR & Internal Processes',
      description: isGerman
        ? 'Ferienanträge, Spesen, Homeoffice-Regeln, Richtlinien'
        : 'Vacation requests, expenses, home office rules, policies'
    },
    {
      title: isGerman ? 'IT-Support' : 'IT Support',
      description: isGerman
        ? 'VPN-Einrichtung, Passwort-Reset, Software-Anleitungen'
        : 'VPN setup, password reset, software guides'
    },
    {
      title: isGerman ? 'Fachstellen & Compliance' : 'Specialists & Compliance',
      description: isGerman
        ? 'Prozesswissen, Richtlinien, technische Dokumentation'
        : 'Process knowledge, guidelines, technical documentation'
    }
  ]

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-green-100 text-green-700 rounded-full px-4 py-2 mb-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isGerman ? 'Beta-Partner Programm' : 'Beta Partner Program'}
            </span>
          </motion.div>

          <motion.h2
            className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {isGerman ? 'Pilotprojekt Konditionen' : 'Pilot Project Terms'}
          </motion.h2>

          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {isGerman
              ? 'Als Startup sammeln wir Erfahrungen und entwickeln die Lösung gemeinsam mit Ihnen weiter.'
              : 'As a startup, we gather experience and develop the solution together with you.'}
          </motion.p>

          <motion.p
            className="text-lg text-green-600 font-semibold max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {isGerman
              ? 'Keine Kosten für unsere Arbeitszeit - nur Infrastruktur'
              : 'No costs for our work time - only infrastructure'}
          </motion.p>
        </motion.div>

        {/* Main Pricing Card */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <AnimatedCard
            className="relative overflow-hidden border-2 border-primary-500"
            hover={true}
            gradient={true}
          >
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center py-3 text-sm font-medium">
              {isGerman ? 'Limitierte Beta-Plätze verfügbar' : 'Limited Beta Spots Available'}
            </div>

            <CardHeader className="pt-16 pb-6 text-center">
              <CardTitle className="text-3xl mb-4">
                {isGerman ? '3-Monats Pilotprojekt' : '3-Month Pilot Project'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isGerman
                  ? 'Gemeinsam Ihren Use Case mit dem höchsten Potenzial umsetzen'
                  : 'Together implement your use case with the highest potential'}
              </CardDescription>
            </CardHeader>

            <CardContent className="py-8">
              {/* Pricing Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <Server className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    CHF {pilotDetails.serverCost}.-
                  </div>
                  <div className="text-gray-600">
                    {isGerman ? 'pro Monat (Server)' : 'per month (Server)'}
                  </div>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <Settings className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    CHF {pilotDetails.setupCost}.-
                  </div>
                  <div className="text-gray-600">
                    {isGerman ? 'einmalig (Setup)' : 'one-time (Setup)'}
                  </div>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ~CHF {pilotDetails.total}.-
                  </div>
                  <div className="text-green-700 font-medium">
                    {isGerman ? 'Total (3 Monate)' : 'Total (3 months)'}
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {pilotFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg"
                    variants={staggerItem}
                  >
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-yellow-800 text-sm">
                  <strong>{isGerman ? 'Hinweis:' : 'Note:'}</strong>{' '}
                  {isGerman
                    ? 'Bei messbarem Mehrwert freuen wir uns über eine freiwillige Erfolgsvergütung - ohne Erwartung und ohne Verpflichtung.'
                    : 'If measurable value is achieved, we welcome a voluntary success fee - no expectation and no obligation.'}
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary text-white px-8"
                asChild
              >
                <Link href="/contact">
                  <Calendar className="w-5 h-5 mr-2" />
                  {isGerman ? 'Gespräch vereinbaren' : 'Schedule a Call'}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href="/technology/demo">
                  {isGerman ? 'Demo ansehen' : 'View Demo'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </AnimatedCard>
        </motion.div>

        {/* Why Pilot */}
        <motion.div
          className="mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            {isGerman ? 'Warum ein Pilotprojekt?' : 'Why a Pilot Project?'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyPilot.map((item, index) => (
              <motion.div key={index} variants={staggerItem}>
                <AnimatedCard className="p-6 h-full text-center" hover={true}>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <AnimatedCard className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary/20" hover={false}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">
                {isGerman ? 'Mögliche Einsatzbereiche' : 'Potential Use Cases'}
              </CardTitle>
              <CardDescription className="text-lg">
                {isGerman
                  ? 'Gemeinsam definieren wir den Use Case mit dem höchsten Potenzial für Ihr Unternehmen'
                  : 'Together we define the use case with the highest potential for your company'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-lg border border-gray-100"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{useCase.title}</h4>
                    <p className="text-sm text-gray-600">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* Process */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-8">
            {isGerman ? 'Wie geht es weiter?' : 'How does it work?'}
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', text: isGerman ? 'Kurzworkshop (1-2h)' : 'Short workshop (1-2h)' },
              { step: '2', text: isGerman ? 'Use Case definieren' : 'Define use case' },
              { step: '3', text: isGerman ? 'Pilot starten' : 'Start pilot' },
              { step: '4', text: isGerman ? 'Gemeinsam skalieren' : 'Scale together' }
            ].map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-2">
                    {item.step}
                  </div>
                  <span className="text-sm text-gray-600 text-center">{item.text}</span>
                </div>
                {index < 3 && (
                  <ArrowRight className="w-6 h-6 text-gray-300 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Pricing
