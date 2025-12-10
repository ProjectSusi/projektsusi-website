import React, { useState } from 'react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/layout'
import { PAGE_SEO, STRUCTURED_DATA, getPageKeywords } from '@/lib/seo-config'
import { 
  SwissFlag, 
  SwissShield,
  SwissAlps
} from '@/components/premium/swiss-visuals'
import { 
  fadeInScale, 
  staggerContainer, 
  staggerItem,
  scrollReveal
} from '@/lib/animations'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'
import PremiumDemoWidget from '@/components/premium/premium-demo-widget'
import LiveRAGIntegration from '@/components/demo/live-rag-integration'
import { 
  Rocket,
  Brain,
  Shield,
  Zap,
  FileText,
  MessageSquare,
  Users,
  Award,
  Play,
  ArrowRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface DemoPageProps {
  locale: string
}

const DemoPage: React.FC<DemoPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'
  const seo = isGerman ? PAGE_SEO.demo.de : PAGE_SEO.demo.en
  const pageKeywords = getPageKeywords('demo', locale)
  const [showLiveSystem, setShowLiveSystem] = useState(true)

  const demoFeatures = [
    {
      icon: Brain,
      title: isGerman ? 'KI-gestützte Antworten' : 'AI-Powered Answers',
      description: isGerman ? 'Erhalten Sie präzise Antworten aus Ihren Dokumenten' : 'Get precise answers from your documents'
    },
    {
      icon: Shield,
      title: isGerman ? 'Zero Hallucination' : 'Zero Hallucination',
      description: isGerman ? 'Nur faktenbasierte Antworten, keine Erfindungen' : 'Only fact-based answers, no fabrications'
    },
    {
      icon: Zap,
      title: isGerman ? 'Sofortige Ergebnisse' : 'Instant Results',
      description: isGerman ? 'Antworten in unter 2 Sekunden' : 'Answers in under 2 seconds'
    },
    {
      icon: FileText,
      title: isGerman ? 'Multi-Format Support' : 'Multi-Format Support',
      description: isGerman ? 'PDF, DOCX, TXT und mehr' : 'PDF, DOCX, TXT and more'
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Dokumentenanalyse' : 'Document Analysis',
      description: isGerman ? 'Analysieren Sie Verträge, Berichte und Richtlinien' : 'Analyze contracts, reports, and policies',
      icon: '📄'
    },
    {
      title: isGerman ? 'Compliance Prüfung' : 'Compliance Review',
      description: isGerman ? 'Automatische FADP/GDPR Compliance-Prüfung' : 'Automatic FADP/GDPR compliance review',
      icon: '✅'
    },
    {
      title: isGerman ? 'Forschung & Entwicklung' : 'Research & Development',
      description: isGerman ? 'Beschleunigen Sie Ihre F&E-Prozesse' : 'Accelerate your R&D processes',
      icon: '🔬'
    },
    {
      title: isGerman ? 'Kundenservice' : 'Customer Service',
      description: isGerman ? 'Intelligente Antworten für Kundenfragen' : 'Intelligent answers for customer queries',
      icon: '💬'
    }
  ]

  return (
    <Layout>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://temora.ch/demo" />
        <meta name="robots" content="index, follow" />

        {/* Demo Page Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": seo.title,
              "description": seo.description,
              "mainEntity": {
                "@type": "SoftwareApplication",
                "name": isGerman ? "Temora AI KI-Chatbot Demo" : "Temora AI Chatbot Demo",
                "applicationCategory": "BusinessApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "CHF",
                  "availability": "https://schema.org/InStock"
                },
                "operatingSystem": "Web"
              }
            })
          }}
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
        {/* Hero Section */}
        <motion.section
          className="relative py-20 lg:py-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 opacity-10">
            <SwissAlps />
          </div>
          <motion.div 
            className="absolute top-20 right-20 opacity-20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <SwissFlag className="w-32 h-32" />
          </motion.div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInScale}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex items-center justify-center space-x-4 mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.05, rotate: 10 }}>
                  <Play className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Live Demo' : 'Live Demo'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <Rocket className="w-12 h-12 text-primary-500" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🚀 Erleben Sie das produktive RAG-System sofort! Laden Sie Ihre eigenen Dokumente hoch und testen Sie Swiss AI ohne Limitierungen.'
                  : '🚀 Experience the production RAG system instantly! Upload your own documents and test Swiss AI without limitations.'}
              </motion.p>

              <motion.div 
                className="inline-flex items-center space-x-3 bg-green-100 text-green-800 rounded-full px-6 py-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
                  <SwissShield className="w-6 h-6" />
                </motion.div>
                <span className="font-medium">
                  {isGerman ? 'Kostenlose Demo • Swiss Security • Sofortiger Zugang' : 'Free Demo • Swiss Security • Instant Access'}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Award className="w-5 h-5 text-green-600" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Demo Widget Section with Toggle */}
        <motion.section 
          className="py-20 bg-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Toggle Switch */}
            <div className="flex items-center justify-center mb-8">
              <motion.div 
                className="bg-gray-100 rounded-full p-1 flex items-center space-x-2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.button
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center space-x-2 ${
                    showLiveSystem 
                      ? 'bg-white text-primary shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setShowLiveSystem(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{isGerman ? 'Live System' : 'Live System'}</span>
                  <motion.span 
                    className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    LIVE
                  </motion.span>
                </motion.button>
                <motion.button
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center space-x-2 ${
                    !showLiveSystem 
                      ? 'bg-white text-primary shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setShowLiveSystem(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-4 h-4" />
                  <span>{isGerman ? 'Interaktive Demo' : 'Interactive Demo'}</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Description Text */}
            <motion.div 
              className="text-center mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-gray-600">
                {showLiveSystem ? (
                  <>
                    {isGerman 
                      ? '🚀 Das produktive RAG-System - laden Sie Ihre eigenen Dokumente hoch und erleben Sie Swiss AI in Echtzeit! Vollständige Funktionalität ohne Einschränkungen.'
                      : '🚀 The production RAG system - upload your own documents and experience Swiss AI in real-time! Full functionality without limitations.'}
                  </>
                ) : (
                  <>
                    {isGerman 
                      ? '🎮 Interaktive Demo mit vorbereiteten Beispielen - testen Sie die Funktionalität ohne eigene Dokumente hochzuladen.'
                      : '🎮 Interactive demo with prepared examples - test the functionality without uploading your own documents.'}
                  </>
                )}
              </p>
            </motion.div>

            {/* Content Display */}
            <AnimatePresence mode="wait">
              {showLiveSystem ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <LiveRAGIntegration locale={locale} variant="embedded" height="800px" />
                </motion.div>
              ) : (
                <motion.div
                  key="demo"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.5 }}
                >
                  <PremiumDemoWidget locale={locale} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional Info Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <AnimatedCard className="p-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">
                  {isGerman ? 'Swiss Security' : 'Swiss Security'}
                </h4>
                <p className="text-sm text-gray-600">
                  {isGerman 
                    ? 'Ihre Daten bleiben in der Schweiz'
                    : 'Your data stays in Switzerland'}
                </p>
              </AnimatedCard>
              
              <AnimatedCard className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">
                  {isGerman ? 'Zero Hallucination' : 'Zero Hallucination'}
                </h4>
                <p className="text-sm text-gray-600">
                  {isGerman 
                    ? 'Nur verifizierte Antworten'
                    : 'Only verified answers'}
                </p>
              </AnimatedCard>
              
              <AnimatedCard className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">
                  {isGerman ? 'Multi-Language' : 'Multi-Language'}
                </h4>
                <p className="text-sm text-gray-600">
                  {isGerman 
                    ? 'DE, FR, IT, EN unterstützt'
                    : 'DE, FR, IT, EN supported'}
                </p>
              </AnimatedCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Demo Features */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Demo Features' : 'Demo Features'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Erleben Sie die Macht von Swiss AI Technology'
                  : 'Experience the power of Swiss AI technology'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {demoFeatures.map((feature, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full" hover={true}>
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h3 
                      className="text-lg font-bold text-gray-900 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                    >
                      {feature.description}
                    </motion.p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Use Cases */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Anwendungsfälle' : 'Use Cases'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Entdecken Sie, wie Temora AI Ihr Unternehmen transformieren kann'
                  : 'Discover how Temora AI can transform your business'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {useCases.map((useCase, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8" hover={true}>
                    <motion.div 
                      className="text-6xl mb-4"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {useCase.icon}
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-bold text-gray-900 mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {useCase.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                    >
                      {useCase.description}
                    </motion.p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 opacity-20">
            <motion.div 
              className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"
              animate={{ scale: [1, 1.05, 1], x: [0, 30, 0] }}
              transition={{ duration: 15, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"
              animate={{ scale: [1.05, 1, 1.05], x: [0, -30, 0] }}
              transition={{ duration: 15, repeat: Infinity, delay: 7.5 }}
            />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div 
              className="max-w-3xl mx-auto"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 15 }}
                transition={{ duration: 0.6 }}
              >
                <SwissFlag className="w-16 h-16 mx-auto mb-8" />
              </motion.div>
              
              <motion.h2 
                className="text-4xl font-bold text-white mb-6"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Bereit loszulegen?' : 'Ready to get started?'}
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/90 mb-8"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Kontaktieren Sie uns für eine persönliche Demo oder werden Sie Beta-Partner.'
                  : 'Contact us for a personalized demo or become a beta partner.'}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 border-none shadow-lg"
                  icon={<MessageSquare className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Kontakt aufnehmen' : 'Contact Us'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary-600 backdrop-blur-sm"
                  icon={<Users className="w-6 h-6" />}
                  onClick={() => window.location.href = '/about'}
                >
                  {isGerman ? 'Über uns erfahren' : 'Learn About Us'}
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'de', ['common'])),
      locale: locale ?? 'de',
    },
  }
}

export default DemoPage