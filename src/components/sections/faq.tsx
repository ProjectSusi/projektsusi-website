'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { staggerContainer, staggerItem, fadeInScale } from '@/lib/animations'
import {
  ChevronDown,
  HelpCircle,
  Shield,
  Zap,
  Database,
  Globe,
  Lock,
  Search,
  Rocket
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'

interface FAQProps {
  locale: string
}

const FAQ: React.FC<FAQProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const faqs = [
    {
      id: 0,
      icon: Shield,
      category: isGerman ? 'Datenschutz' : 'Data Privacy',
      question: isGerman
        ? 'Wie stellt Temora AI Schweizer Datenschutz sicher?'
        : 'How does Temora AI ensure Swiss data privacy?',
      answer: isGerman
        ? 'Alle Daten werden ausschliesslich auf Schweizer Servern verarbeitet und gespeichert. Wir sind FADP und GDPR konform. Durch den Einsatz eines lokalen LLMs (Ollama) verlassen Ihre Daten nie die Schweiz und werden nicht an Cloud-Dienste gesendet.'
        : 'All data is exclusively processed and stored on Swiss servers. We are FADP and GDPR compliant. By using a local LLM (Ollama), your data never leaves Switzerland and is not sent to cloud services.',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50'
    },
    {
      id: 1,
      icon: Zap,
      category: isGerman ? 'Performance' : 'Performance',
      question: isGerman
        ? 'Wie schnell liefert das System Antworten?'
        : 'How fast does the system deliver answers?',
      answer: isGerman
        ? 'Unser System liefert Antworten in ca. 2 Sekunden (~130ms Antwortzeit für die Suche). Die RAG-Pipeline ist für schnelle Verarbeitung optimiert mit Hybrid Search (FAISS Vector + BM25 Keyword).'
        : 'Our system delivers answers in about 2 seconds (~130ms response time for search). The RAG pipeline is optimized for fast processing with hybrid search (FAISS vector + BM25 keyword).',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      icon: Database,
      category: isGerman ? 'Dokumente' : 'Documents',
      question: isGerman
        ? 'Welche Dokumentformate werden unterstützt?'
        : 'What document formats are supported?',
      answer: isGerman
        ? 'Wir unterstützen PDF, Word (DOCX), Text-Dateien (TXT), Markdown (MD) und CSV. Die Dokumente werden automatisch verarbeitet und in ~2-5 Sekunden pro Seite indexiert.'
        : 'We support PDF, Word (DOCX), text files (TXT), Markdown (MD), and CSV. Documents are automatically processed and indexed in ~2-5 seconds per page.',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      icon: Search,
      category: isGerman ? 'Quellenangaben' : 'Source Citations',
      question: isGerman
        ? 'Was bedeutet "Quellenangaben" bei Antworten?'
        : 'What does "source citations" mean for answers?',
      answer: isGerman
        ? 'Jede Antwort enthält Verweise auf die Original-Dokumente und Seiten, aus denen die Information stammt. So können Sie die Antworten jederzeit nachprüfen und den Kontext verstehen. Keine erfundenen Inhalte - nur faktenbasierte Antworten.'
        : 'Every answer includes references to the original documents and pages where the information comes from. This allows you to verify answers anytime and understand the context. No fabricated content - only fact-based answers.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      icon: Globe,
      category: isGerman ? 'Sprachen' : 'Languages',
      question: isGerman
        ? 'Welche Sprachen werden unterstützt?'
        : 'What languages are supported?',
      answer: isGerman
        ? 'Temora AI unterstützt Deutsch, Französisch, Italienisch und Englisch. Die multilingualen 384-dimensionalen Embeddings ermöglichen Suche über Sprachgrenzen hinweg.'
        : 'Temora AI supports German, French, Italian, and English. The multilingual 384-dimensional embeddings enable search across language boundaries.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 5,
      icon: Rocket,
      category: isGerman ? 'Pilotprojekt' : 'Pilot Project',
      question: isGerman
        ? 'Wie läuft ein Pilotprojekt ab?'
        : 'How does a pilot project work?',
      answer: isGerman
        ? 'Das Pilotprojekt dauert ca. 3 Monate: 1) Kurzworkshop (1-2h) zur Use-Case Definition, 2) Prototyp-Entwicklung, 3) Evaluation und Optimierung, 4) Skalierung bei Erfolg. Sie zahlen nur die Infrastrukturkosten (CHF 550/Monat Server + CHF 250 Setup) - unsere Arbeitszeit ist kostenfrei.'
        : 'The pilot project lasts about 3 months: 1) Short workshop (1-2h) for use case definition, 2) Prototype development, 3) Evaluation and optimization, 4) Scaling if successful. You only pay infrastructure costs (CHF 550/month server + CHF 250 setup) - our work time is free.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 6,
      icon: Lock,
      category: isGerman ? 'Integration' : 'Integration',
      question: isGerman
        ? 'Wie kann das System integriert werden?'
        : 'How can the system be integrated?',
      answer: isGerman
        ? 'Aktuell bieten wir eine Weblösung an. Integration in MS Teams oder Ihr Intranet ist möglich. Das Backend basiert auf FastAPI mit REST-APIs für flexible Anbindung.'
        : 'Currently we offer a web solution. Integration into MS Teams or your intranet is possible. The backend is based on FastAPI with REST APIs for flexible connection.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    }
  ]

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
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
              ? 'Alles was Sie über Temora AI wissen müssen.'
              : 'Everything you need to know about Temora AI.'}
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
          {faqs.map((faq) => {
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

                        <div className="flex-1">
                          <div className={`text-sm font-medium ${faq.color} mb-1`}>
                            {faq.category}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {faq.question}
                          </h3>
                        </div>
                      </div>

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
                        animate={{ height: 'auto', opacity: 1 }}
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
                ? 'Noch Fragen?'
                : 'Still have questions?'}
            </h3>

            <p className="text-gray-600 mb-6 max-w-md">
              {isGerman
                ? 'Sprechen Sie direkt mit unserem Entwickler-Team.'
                : 'Speak directly with our developer team.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                {isGerman ? 'Kontakt aufnehmen' : 'Get in touch'}
              </motion.a>

              <motion.a
                href="/technology/demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-primary-500 hover:text-primary-500 transition-all duration-300"
              >
                {isGerman ? 'Demo ansehen' : 'View demo'}
              </motion.a>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
