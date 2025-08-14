import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/layout'
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
import { 
  Cpu,
  Database,
  Brain,
  Shield,
  Zap,
  Code,
  GitBranch,
  Server,
  Network,
  Monitor,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Rocket,
  Settings,
  Terminal
} from 'lucide-react'

interface TechnologyDemoPageProps {
  locale: string
}

const TechnologyDemoPage: React.FC<TechnologyDemoPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const architectureComponents = [
    {
      icon: Brain,
      title: isGerman ? 'KI-Engine' : 'AI Engine',
      description: isGerman ? 'Llama 3.2 + Swiss Fine-tuning' : 'Llama 3.2 + Swiss Fine-tuning',
      specs: isGerman ? 'Zero Hallucination, <2s Response' : 'Zero Hallucination, <2s Response'
    },
    {
      icon: Database,
      title: isGerman ? 'Vector Database' : 'Vector Database',
      description: isGerman ? 'FAISS + PostgreSQL' : 'FAISS + PostgreSQL',
      specs: isGerman ? 'Millionen Dokumente, Sub-Sekunden Suche' : 'Million documents, sub-second search'
    },
    {
      icon: Shield,
      title: isGerman ? 'Security Layer' : 'Security Layer',
      description: isGerman ? 'End-to-End Verschlüsselung' : 'End-to-End Encryption',
      specs: isGerman ? 'AES-256, Swiss Hosting' : 'AES-256, Swiss Hosting'
    },
    {
      icon: Network,
      title: isGerman ? 'API Gateway' : 'API Gateway',
      description: isGerman ? 'RESTful + GraphQL' : 'RESTful + GraphQL',
      specs: isGerman ? 'Rate Limiting, Auto-Scaling' : 'Rate Limiting, Auto-Scaling'
    }
  ]

  const technicalFeatures = [
    {
      category: isGerman ? 'Performance' : 'Performance',
      items: [
        { name: isGerman ? 'Antwortzeit' : 'Response Time', value: '< 1.8s', icon: Clock },
        { name: isGerman ? 'Durchsatz' : 'Throughput', value: '10K req/min', icon: Activity },
        { name: isGerman ? 'Verfügbarkeit' : 'Uptime', value: '99.98%', icon: CheckCircle }
      ]
    },
    {
      category: isGerman ? 'Skalierung' : 'Scalability',
      items: [
        { name: isGerman ? 'Dokumente' : 'Documents', value: '10M+', icon: Database },
        { name: isGerman ? 'Gleichzeitige Nutzer' : 'Concurrent Users', value: '50K+', icon: Monitor },
        { name: isGerman ? 'Auto-Scaling' : 'Auto-Scaling', value: isGerman ? 'Aktiv' : 'Active', icon: BarChart3 }
      ]
    },
    {
      category: isGerman ? 'Sicherheit' : 'Security',
      items: [
        { name: isGerman ? 'Verschlüsselung' : 'Encryption', value: 'AES-256', icon: Shield },
        { name: isGerman ? 'Compliance' : 'Compliance', value: 'FADP/GDPR', icon: CheckCircle },
        { name: isGerman ? 'Audit Logs' : 'Audit Logs', value: isGerman ? 'Vollständig' : 'Complete', icon: GitBranch }
      ]
    }
  ]

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/api/v1/query',
      description: isGerman ? 'Hauptabfrage-Endpoint für RAG' : 'Main query endpoint for RAG',
      example: '{ "query": "What are the compliance requirements?" }'
    },
    {
      method: 'POST',
      endpoint: '/api/v1/documents',
      description: isGerman ? 'Dokument-Upload und -Verarbeitung' : 'Document upload and processing',
      example: 'multipart/form-data with file'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/documents/{id}',
      description: isGerman ? 'Dokumentmetadaten abrufen' : 'Retrieve document metadata',
      example: 'Returns document info and status'
    },
    {
      method: 'DELETE',
      endpoint: '/api/v1/documents/{id}',
      description: isGerman ? 'Dokument löschen (mit Audit)' : 'Delete document (with audit)',
      example: 'Soft delete with retention policy'
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
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
                  <Terminal className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Technologie Demo' : 'Technology Demo'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <Cpu className="w-12 h-12 text-secondary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🔧 Erleben Sie die Swiss-Engineered RAG-Architektur in Aktion. Testen Sie unsere API-Endpoints und erkunden Sie die technischen Möglichkeiten.'
                  : '🔧 Experience the Swiss-Engineered RAG architecture in action. Test our API endpoints and explore the technical capabilities.'}
              </motion.p>

              <motion.div 
                className="inline-flex items-center space-x-3 bg-red-100 text-red-800 rounded-full px-6 py-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
                  <Cpu className="w-6 h-6" />
                </motion.div>
                <span className="font-medium">
                  {isGerman ? 'Live API • Swiss Architecture • Developer Ready' : 'Live API • Swiss Architecture • Developer Ready'}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Code className="w-5 h-5 text-primary" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Interactive Demo Widget */}
        <motion.section 
          className="py-20 bg-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'Interaktive Demo' : 'Interactive Demo'}
              </h2>
              <p className="text-xl text-gray-600">
                {isGerman 
                  ? 'Testen Sie unsere RAG-API direkt in Ihrem Browser'
                  : 'Test our RAG API directly in your browser'
                }
              </p>
            </motion.div>
            <PremiumDemoWidget locale={locale} />
          </div>
        </motion.section>

        {/* Architecture Overview */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'Swiss-Engineered Architecture' : 'Swiss-Engineered Architecture'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Hochperformante, skalierbare und sichere RAG-Architektur'
                  : 'High-performance, scalable, and secure RAG architecture'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {architectureComponents.map((component, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full" hover={true}>
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <component.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {component.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {component.description}
                    </p>
                    <div className="bg-red-50 px-3 py-2 rounded-lg">
                      <span className="text-xs font-medium text-primary">
                        {component.specs}
                      </span>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Technical Specifications */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'Technische Spezifikationen' : 'Technical Specifications'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Messbare Performance-Metriken und System-Capabilities'
                  : 'Measurable performance metrics and system capabilities'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {technicalFeatures.map((category, categoryIndex) => (
                <motion.div key={categoryIndex} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      {category.category}
                    </h3>
                    <div className="space-y-6">
                      {category.items.map((item, itemIndex) => (
                        <motion.div 
                          key={itemIndex}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          whileHover={{ scale: 1.02, backgroundColor: '#f0f9ff' }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <item.icon className="w-4 h-4 text-white" />
                            </motion.div>
                            <span className="font-medium text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {item.value}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* API Documentation Preview */}
        <motion.section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold mb-4">
                {isGerman ? 'API Endpoints' : 'API Endpoints'}
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                {isGerman 
                  ? 'RESTful API mit vollständiger OpenAPI-Dokumentation'
                  : 'RESTful API with complete OpenAPI documentation'
                }
              </p>
            </motion.div>

            <motion.div 
              className="max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {apiEndpoints.map((endpoint, index) => (
                <motion.div 
                  key={index}
                  variants={staggerItem}
                  className="mb-6"
                >
                  <AnimatedCard className="p-6 bg-gray-800 border-gray-700" hover={true}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-2 lg:mb-0">
                        <span className={`px-3 py-1 text-xs font-bold rounded ${
                          endpoint.method === 'POST' ? 'bg-green-600' :
                          endpoint.method === 'GET' ? 'bg-primary' :
                          endpoint.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-lg font-mono text-secondary">
                          {endpoint.endpoint}
                        </code>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Code className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                    <p className="text-gray-300 mb-4">{endpoint.description}</p>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <code className="text-sm text-green-400">
                        {endpoint.example}
                      </code>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatedButton 
                variant="outline"
                size="lg"
                className="border-primary text-secondary hover:bg-red-500 hover:text-white"
                icon={<ArrowRight className="w-6 h-6" />}
                onClick={() => window.location.href = '/technology/api'}
              >
                {isGerman ? 'Vollständige API-Dokumentation' : 'Complete API Documentation'}
              </AnimatedButton>
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
                className="mb-8"
              >
                <SwissFlag className="w-16 h-16 mx-auto" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-6">
                {isGerman ? 'Bereit für Integration?' : 'Ready for Integration?'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Starten Sie mit unserer Developer-freundlichen API und Swiss-Quality Infrastructure.'
                  : 'Get started with our developer-friendly API and Swiss-quality infrastructure.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 border-none shadow-lg"
                  icon={<Play className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Live Demo starten' : 'Start Live Demo'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary backdrop-blur-sm"
                  icon={<Rocket className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Developer Support' : 'Developer Support'}
                </AnimatedButton>
              </div>
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

export default TechnologyDemoPage