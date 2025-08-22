'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { staggerContainer, staggerItem, fadeInScale } from '@/lib/animations'
import { 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Shield,
  Zap,
  Database,
  Globe,
  Lock,
  CheckCircle,
  Search
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'

interface FAQProps {
  locale: string
}

const FAQ: React.FC<FAQProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'
  const [openFAQ, setOpenFAQ] = useState<number | null>(0) // First FAQ open by default

  const faqs = [
    {
      id: 0,
      icon: Shield,
      category: isGerman ? "Sicherheit" : "Security",
      question: isGerman 
        ? "Wie stellt Temora AI Schweizer Datenschutz-Compliance sicher?"
        : "How does Temora AI ensure Swiss data privacy compliance?",
      answer: isGerman 
        ? "Temora AI ist vollständig FADP/GDPR-konform und ISO 27001 zertifiziert. Alle Daten werden ausschliesslich in Schweizer Rechenzentren verarbeitet und gespeichert. Wir verwenden Ende-zu-Ende-Verschlüsselung und bieten vollständige Audit-Trails für alle Datenverarbeitungsprozesse."
        : "Temora AI is fully FADP/GDPR compliant and ISO 27001 certified. All data is exclusively processed and stored in Swiss data centers. We use end-to-end encryption and provide complete audit trails for all data processing operations.",
      color: "text-primary-500",
      bgColor: "bg-primary-50"
    },
    {
      id: 1,
      icon: Zap,
      category: isGerman ? "Performance" : "Performance",
      question: isGerman 
        ? "Wie schnell liefert das System Antworten auf komplexe Fragen?"
        : "How fast does the system deliver answers to complex questions?",
      answer: isGerman 
        ? "Unser System liefert Antworten typischerweise in unter 2 Sekunden. Durch intelligente Caching-Mechanismen, optimierte Vektor-Suche und Schweizer Hochleistungsinfrastruktur garantieren wir eine Verfügbarkeit von 99.9% mit minimaler Latenz."
        : "Our system typically delivers answers in under 2 seconds. Through intelligent caching mechanisms, optimized vector search, and Swiss high-performance infrastructure, we guarantee 99.9% uptime with minimal latency.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      icon: Database,
      category: isGerman ? "Integration" : "Integration",
      question: isGerman 
        ? "Welche Dokumentformate und Systeme werden unterstützt?"
        : "What document formats and systems are supported?",
      answer: isGerman 
        ? "Wir unterstützen PDF, Word, Excel, PowerPoint, Text-Dateien und strukturierte Daten. Integration erfolgt über REST-APIs, SDK oder direkte Anbindung an SharePoint, Confluence, SAP und andere Enterprise-Systeme. Bulk-Upload und automatische Synchronisation sind verfügbar."
        : "We support PDF, Word, Excel, PowerPoint, text files, and structured data. Integration occurs via REST APIs, SDKs, or direct connection to SharePoint, Confluence, SAP, and other enterprise systems. Bulk upload and automatic synchronization are available.",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      id: 3,
      icon: Search,
      category: isGerman ? "KI-Technologie" : "AI Technology",
      question: isGerman 
        ? "Was bedeutet 'Zero-Hallucination' und wie funktioniert es?"
        : "What does 'Zero-Hallucination' mean and how does it work?",
      answer: isGerman 
        ? "Zero-Hallucination bedeutet, dass unser System ausschliesslich auf Basis Ihrer Dokumente antwortet - keine erfundenen Inhalte. Jede Antwort ist mit Quellenangaben verknüpft und nachverfolgbar. Bei unvollständigen Informationen meldet das System dies transparent."
        : "Zero-Hallucination means our system responds exclusively based on your documents - no fabricated content. Every answer is linked to sources and traceable. When information is incomplete, the system reports this transparently.",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      icon: Globe,
      category: isGerman ? "Skalierung" : "Scaling",
      question: isGerman 
        ? "Kann das System mit unserem Unternehmenswachstum skalieren?"
        : "Can the system scale with our company growth?",
      answer: isGerman 
        ? "Ja, Temora AI ist für Enterprise-Skalierung konzipiert. Unterstützt Millionen von Dokumenten, Tausende gleichzeitige Nutzer und Multi-Tenant-Architekturen. Horizontale Skalierung erfolgt automatisch basierend auf Last und Anforderungen."
        : "Yes, Temora AI is designed for enterprise scaling. Supports millions of documents, thousands of concurrent users, and multi-tenant architectures. Horizontal scaling occurs automatically based on load and requirements.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      id: 5,
      icon: Lock,
      category: isGerman ? "Implementierung" : "Implementation",
      question: isGerman 
        ? "Wie lange dauert die Implementierung und welche Unterstützung gibt es?"
        : "How long does implementation take and what support is available?",
      answer: isGerman 
        ? "Die Basis-Implementierung dauert 2-4 Wochen. Wir bieten vollständige Onboarding-Unterstützung, Schulungen, 24/7 Support und einen dedizierten Customer Success Manager. Enterprise-Implementierungen werden individuell geplant."
        : "Basic implementation takes 2-4 weeks. We provide complete onboarding support, training, 24/7 support, and a dedicated customer success manager. Enterprise implementations are individually planned.",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ]

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500 to-primary-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full mb-6"
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {isGerman ? (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Häufig gestellte
                </span>
                <br />Fragen
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Frequently Asked
                </span>
                <br />Questions
              </>
            )}
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isGerman 
              ? "Alles was Sie über Temora AI wissen müssen - von Sicherheit bis Implementation."
              : "Everything you need to know about Temora AI - from security to implementation."
            }
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => {
            const IconComponent = faq.icon
            const isOpen = openFAQ === faq.id
            
            return (
              <motion.div
                key={faq.id}
                variants={staggerItem}
                className="group"
              >
                <AnimatedCard 
                  className={`transition-all duration-300 ${isOpen ? 'shadow-lg ring-2 ring-primary-500/20' : 'hover:shadow-md'}`}
                  hover={false}
                >
                  {/* FAQ Header */}
                  <motion.button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded-xl"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Icon */}
                        <motion.div
                          animate={{ 
                            scale: isOpen ? 1.1 : 1,
                            rotate: isOpen ? 5 : 0 
                          }}
                          transition={{ duration: 0.2 }}
                          className={`w-12 h-12 ${faq.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <IconComponent className={`w-6 h-6 ${faq.color}`} />
                        </motion.div>

                        {/* Question */}
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${faq.color} mb-1`}>
                            {faq.category}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {faq.question}
                          </h3>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 flex-shrink-0"
                      >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      </motion.div>
                    </div>
                  </motion.button>

                  {/* FAQ Answer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="ml-16"
                          >
                            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-primary-500/20 to-gray-200 mb-4"></div>
                            
                            <p className="text-gray-700 leading-relaxed text-lg">
                              {faq.answer}
                            </p>
                            
                            {/* Verified Badge */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="flex items-center space-x-2 mt-4 text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {isGerman ? "Verifiziert durch Schweizer Experten" : "Verified by Swiss experts"}
                              </span>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AnimatedCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <AnimatedCard className="inline-block p-8 bg-gradient-to-r from-primary-50 to-blue-50">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isGerman 
                ? "Noch Fragen?"
                : "Still have questions?"
              }
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md">
              {isGerman 
                ? "Unser Expertenteam steht Ihnen für eine persönliche Beratung zur Verfügung."
                : "Our expert team is available for personal consultation."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href={`/contact${locale === 'en' ? '?lang=en' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                {isGerman ? "Kontakt aufnehmen" : "Get in touch"}
              </motion.a>
              
              <motion.a
                href={`/demo${locale === 'en' ? '?lang=en' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-primary-500 hover:text-primary-500 transition-all duration-300"
              >
                {isGerman ? "Demo vereinbaren" : "Schedule demo"}
              </motion.a>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ