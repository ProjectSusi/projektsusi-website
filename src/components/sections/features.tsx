'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { staggerContainer, staggerItem, fadeInScale } from '@/lib/animations'
import { 
  Brain, 
  Shield, 
  Zap, 
  Database, 
  Globe, 
  Lock,
  Search,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'

interface FeaturesProps {
  locale: string
}

const Features: React.FC<FeaturesProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'

  const primaryFeatures = [
    {
      icon: Search,
      title: isGerman ? "Hybrid Search" : "Hybrid Search",
      description: isGerman
        ? "FAISS Vector-Suche kombiniert mit BM25 Keyword-Suche für optimale Präzision und Relevanz."
        : "FAISS vector search combined with BM25 keyword search for optimal precision and relevance.",
      benefits: isGerman
        ? ["Vector Similarity (FAISS)", "BM25 Keyword Matching", "384-dim Embeddings"]
        : ["Vector similarity (FAISS)", "BM25 keyword matching", "384-dim embeddings"],
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: isGerman ? "Conversation Memory" : "Conversation Memory",
      description: isGerman
        ? "Session-basierte Kontextverwaltung ermöglicht natürliche Follow-up-Fragen über mehrere Interaktionen."
        : "Session-based context management enables natural follow-up questions across multiple interactions.",
      benefits: isGerman
        ? ["Session Management", "Kontext-Erhaltung", "Follow-up Support"]
        : ["Session management", "Context retention", "Follow-up support"],
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50"
    },
    {
      icon: Brain,
      title: isGerman ? "Knowledge Graph" : "Knowledge Graph",
      description: isGerman
        ? "Real-time Wissensvernetzung mit evolutionärem Graph für intelligente Dokumentenbeziehungen."
        : "Real-time knowledge networking with evolutionary graph for intelligent document relationships.",
      benefits: isGerman
        ? ["Real-time Evolution", "Wissensvernetzung", "Graph-basierte Suche"]
        : ["Real-time evolution", "Knowledge networking", "Graph-based search"],
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50"
    }
  ]

  const secondaryFeatures = [
    {
      icon: Sparkles,
      title: isGerman ? "Query Expansion" : "Query Expansion",
      description: isGerman ? "Automatische Anfrageerweiterung für bessere Ergebnisse" : "Automatic query expansion for better results",
      color: "text-green-600"
    },
    {
      icon: Globe,
      title: isGerman ? "Multilingual Support" : "Multilingual Support",
      description: isGerman ? "Deutsch & Englisch mit 384-dim Embeddings" : "German & English with 384-dim embeddings",
      color: "text-purple-600"
    },
    {
      icon: CheckCircle,
      title: isGerman ? "Page Citations" : "Page Citations",
      description: isGerman ? "Seitengenau Quellenangaben in jeder Antwort" : "Page-accurate source citations in every answer",
      color: "text-primary-600"
    },
    {
      icon: Zap,
      title: isGerman ? "Fast Performance" : "Fast Performance",
      description: isGerman ? "~130ms durchschnittliche Antwortzeit" : "~130ms average response time",
      color: "text-indigo-600"
    },
    {
      icon: FileText,
      title: isGerman ? "Document Processing" : "Document Processing",
      description: isGerman ? "PDF, DOCX, TXT, MD, CSV unterstützt" : "PDF, DOCX, TXT, MD, CSV supported",
      color: "text-orange-600"
    },
    {
      icon: Database,
      title: isGerman ? "Production Ready" : "Production Ready",
      description: isGerman ? "v3.2.0 mit 40+ Services & FastAPI" : "v3.2.0 with 40+ services & FastAPI",
      color: "text-yellow-600"
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-primary-500 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
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
            <Star className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {isGerman ? (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Revolutionäre Features
                </span>
                <br />für Schweizer Unternehmen
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Revolutionary Features
                </span>
                <br />for Swiss Enterprise
              </>
            )}
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isGerman 
              ? "Entdecken Sie die nächste Generation der RAG-Technologie, entwickelt speziell für die Anforderungen Schweizer Unternehmen."
              : "Discover the next generation of RAG technology, developed specifically for Swiss enterprise requirements."
            }
          </p>
        </motion.div>

        {/* Primary Features */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
        >
          {primaryFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="h-full"
              >
                <AnimatedCard 
                  className="p-8 h-full hover:shadow-2xl transition-all duration-500"
                  hover={true}
                  gradient={true}
                >
                  {/* Feature Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-xl mb-6`}
                  >
                    <IconComponent className="w-8 h-8 text-gray-700" />
                  </motion.div>

                  {/* Feature Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>

                  {/* Feature Description */}
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <motion.div
                        key={benefitIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: benefitIndex * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Gradient Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    className={`h-1 bg-gradient-to-r ${feature.color} rounded-full`}
                  />
                </AnimatedCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Secondary Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {secondaryFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="h-full"
              >
                <AnimatedCard 
                  className="p-6 h-full text-center hover:shadow-lg transition-all duration-300"
                  hover={true}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4"
                  >
                    <IconComponent className={`w-6 h-6 ${feature.color}`} />
                  </motion.div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>

                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </AnimatedCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <AnimatedCard className="inline-block p-8 bg-gradient-to-r from-primary-50 to-blue-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isGerman 
                ? "Bereit für die Zukunft der Unternehmens-KI?"
                : "Ready for the Future of Enterprise AI?"
              }
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md">
              {isGerman 
                ? "Erleben Sie selbst, wie Temora AI Ihr Unternehmen transformiert."
                : "Experience how Temora AI transforms your enterprise."
              }
            </p>

            <AnimatedButton 
              variant="gradient" 
              size="lg"
              className="inline-flex items-center space-x-2"
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              {isGerman ? "Demo anfordern" : "Request Demo"}
            </AnimatedButton>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  )
}

export default Features