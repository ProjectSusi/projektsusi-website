import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/layout'
import { 
  SwissFlag, 
  SwissShield
} from '@/components/premium/swiss-visuals'
import { 
  fadeInScale, 
  staggerContainer, 
  staggerItem, 
  slideInLeft, 
  slideInRight,
  scrollReveal
} from '@/lib/animations'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'
import ProgressRing from '@/components/ui/progress-ring'
import { 
  Shield,
  Lock,
  Eye,
  FileText,
  CheckCircle,
  Award,
  Building,
  Users,
  Globe,
  Database,
  Clock,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface CompliancePageProps {
  locale: string
}

const CompliancePage: React.FC<CompliancePageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const regulations = [
    {
      id: 'fadp',
      name: 'FADP',
      fullName: isGerman ? 'Schweizer Datenschutzgesetz' : 'Swiss Federal Act on Data Protection',
      status: 'ready',
      progress: 100,
      description: isGerman 
        ? 'Vollständige Compliance mit dem neuen Schweizer Datenschutzgesetz'
        : 'Full compliance with new Swiss Federal Data Protection Act',
      requirements: [
        isGerman ? 'Datenminimierung nach Privacy by Design' : 'Data minimization by privacy by design',
        isGerman ? 'Einwilligung und Widerrufsrechte' : 'Consent and withdrawal rights',
        isGerman ? 'Datenschutz-Folgenabschätzung' : 'Data protection impact assessment',
        isGerman ? 'Meldepflicht bei Datenverletzungen' : 'Breach notification requirements'
      ]
    },
    {
      id: 'gdpr',
      name: 'GDPR',
      fullName: isGerman ? 'EU-Datenschutz-Grundverordnung' : 'General Data Protection Regulation',
      status: 'ready',
      progress: 100,
      description: isGerman 
        ? 'EU-GDPR konform für internationale Zusammenarbeit'
        : 'EU-GDPR compliant for international collaboration',
      requirements: [
        isGerman ? 'Recht auf Vergessenwerden' : 'Right to be forgotten',
        isGerman ? 'Datenübertragbarkeit' : 'Data portability',
        isGerman ? 'Privacy by Design & Default' : 'Privacy by design & default',
        isGerman ? 'DPO-unterstützte Prozesse' : 'DPO-supported processes'
      ]
    },
    {
      id: 'finma',
      name: 'FINMA',
      fullName: isGerman ? 'Schweizer Finanzmarktaufsicht' : 'Swiss Financial Market Supervisory Authority',
      status: 'ready',
      progress: 95,
      description: isGerman 
        ? 'Bereit für Finanzsektor-spezifische Anforderungen'
        : 'Ready for financial sector-specific requirements',
      requirements: [
        isGerman ? 'Outsourcing-Richtlinien Compliance' : 'Outsourcing guidelines compliance',
        isGerman ? 'Risikomanagement Standards' : 'Risk management standards',
        isGerman ? 'Operationelle Resilience' : 'Operational resilience',
        isGerman ? 'Cloud Computing Guidelines' : 'Cloud computing guidelines'
      ]
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      fullName: isGerman ? 'Informationssicherheitsmanagement' : 'Information Security Management',
      status: 'in-progress',
      progress: 85,
      description: isGerman 
        ? 'Zertifizierung in Vorbereitung für 2025'
        : 'Certification in preparation for 2025',
      requirements: [
        isGerman ? 'Informationssicherheitsrichtlinie' : 'Information security policy',
        isGerman ? 'Risikobewertung und -behandlung' : 'Risk assessment and treatment',
        isGerman ? 'Incident Response Prozesse' : 'Incident response processes',
        isGerman ? 'Kontinuierliche Verbesserung' : 'Continuous improvement'
      ]
    }
  ]

  const securityFeatures = [
    {
      title: isGerman ? 'Ende-zu-Ende Verschlüsselung' : 'End-to-End Encryption',
      description: isGerman ? 'AES-256 Verschlüsselung für alle Daten in Ruhe und Übertragung' : 'AES-256 encryption for all data at rest and in transit',
      icon: Lock,
      color: 'text-red-500'
    },
    {
      title: isGerman ? 'Swiss Data Centers' : 'Swiss Data Centers',
      description: isGerman ? 'Alle Daten bleiben ausschließlich in Schweizer Rechenzentren' : 'All data remains exclusively in Swiss data centers',
      icon: Building,
      color: 'text-primary'
    },
    {
      title: isGerman ? 'Zero-Trust Architektur' : 'Zero-Trust Architecture',
      description: isGerman ? 'Keine impliziten Vertrauensstellungen, kontinuierliche Verifikation' : 'No implicit trust, continuous verification',
      icon: Shield,
      color: 'text-green-500'
    },
    {
      title: isGerman ? 'Audit Logging' : 'Audit Logging',
      description: isGerman ? 'Umfassende Protokollierung aller Systemaktivitäten' : 'Comprehensive logging of all system activities',
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      title: isGerman ? 'Zugriffskontrolle' : 'Access Controls',
      description: isGerman ? 'Rollenbasierte Zugriffskontrolle mit Multi-Faktor-Authentifizierung' : 'Role-based access control with multi-factor authentication',
      icon: Users,
      color: 'text-orange-500'
    },
    {
      title: isGerman ? 'Transparenz' : 'Transparency',
      description: isGerman ? 'Vollständige Nachvollziehbarkeit aller AI-Entscheidungen' : 'Complete traceability of all AI decisions',
      icon: Eye,
      color: 'text-teal-500'
    }
  ]

  const dataHandling = [
    {
      stage: isGerman ? 'Sammlung' : 'Collection',
      description: isGerman ? 'Minimale Datensammlung nach Zweckbindung' : 'Minimal data collection by purpose limitation',
      icon: Database
    },
    {
      stage: isGerman ? 'Verarbeitung' : 'Processing',
      description: isGerman ? 'Verschlüsselte Verarbeitung mit Pseudonymisierung' : 'Encrypted processing with pseudonymization',
      icon: Lock
    },
    {
      stage: isGerman ? 'Speicherung' : 'Storage',
      description: isGerman ? 'Swiss-hosted mit Backup und Recovery' : 'Swiss-hosted with backup and recovery',
      icon: Shield
    },
    {
      stage: isGerman ? 'Löschung' : 'Deletion',
      description: isGerman ? 'Automatische Löschung nach Aufbewahrungsfristen' : 'Automatic deletion after retention periods',
      icon: Clock
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
          <motion.div 
            className="absolute top-20 right-20 opacity-20"
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <SwissShield className="w-32 h-32" glowing />
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
                <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                  <Shield className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Compliance & Sicherheit' : 'Compliance & Security'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -5 }}>
                  <SwissFlag className="w-12 h-12" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🛡️ Swiss-First Compliance und Bank-Grade Sicherheit von Grund auf entwickelt - für höchste Vertrauenswürdigkeit und regulatorische Sicherheit.'
                  : '🛡️ Swiss-first compliance and bank-grade security built from the ground up - for maximum trust and regulatory certainty.'}
              </motion.p>

              <motion.div 
                className="flex justify-center space-x-8 mb-12"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: CheckCircle, label: 'FADP Ready', color: 'text-green-500' },
                  { icon: Award, label: 'ISO 27001 Prep', color: 'text-primary' },
                  { icon: Building, label: '100% Swiss Hosted', color: 'text-red-500' }
                ].map((item, index) => (
                  <motion.div key={index} className="text-center" variants={staggerItem}>
                    <AnimatedCard className="p-4 mb-2" hover={true} glass={true}>
                      <motion.div whileHover={{ scale: 1.05, rotate: 3 }}>
                        <item.icon className={`w-8 h-8 ${item.color} mx-auto`} />
                      </motion.div>
                    </AnimatedCard>
                    <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Regulations Compliance */}
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
                {isGerman ? 'Regulatorische Compliance' : 'Regulatory Compliance'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Bereit für alle wichtigen Schweizer und europäischen Vorschriften'
                  : 'Ready for all major Swiss and European regulations'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {regulations.map((regulation, index) => (
                <motion.div key={regulation.id} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true} gradient={true}>
                    <div className="flex items-start space-x-6 mb-6">
                      {/* Progress Ring */}
                      <motion.div 
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <ProgressRing
                          progress={regulation.progress}
                          size={80}
                          strokeWidth={6}
                          color={regulation.status === 'ready' ? '#10B981' : '#F59E0B'}
                          className="mb-2"
                        />
                      </motion.div>
                      
                      <div className="flex-1">
                        <motion.div 
                          className="flex items-center space-x-3 mb-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <h3 className="text-2xl font-bold text-gray-900">{regulation.name}</h3>
                          <motion.span 
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              regulation.status === 'ready' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {regulation.status === 'ready' 
                              ? (isGerman ? 'Bereit' : 'Ready')
                              : (isGerman ? 'Vorbereitung' : 'In Prep')
                            }
                          </motion.span>
                        </motion.div>
                        <motion.p 
                          className="text-sm text-gray-600 mb-4"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          {regulation.fullName}
                        </motion.p>
                        <motion.p 
                          className="text-gray-700 mb-6"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                        >
                          {regulation.description}
                        </motion.p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        {isGerman ? 'Abgedeckte Anforderungen:' : 'Covered Requirements:'}
                      </h4>
                      <motion.ul 
                        className="space-y-2"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                      >
                        {regulation.requirements.map((req, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start space-x-3"
                            variants={staggerItem}
                            whileHover={{ x: 5, scale: 1.01 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            </motion.div>
                            <span className="text-gray-700 text-sm">{req}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Security Features */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-red-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M30 30m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
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
                {isGerman ? 'Sicherheitsfeatures' : 'Security Features'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Bank-Grade Sicherheit für maximalen Datenschutz'
                  : 'Bank-grade security for maximum data protection'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {securityFeatures.map((feature, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full" hover={true} glass={true}>
                    <motion.div 
                      className="mb-6"
                      whileHover={{ scale: 1.05, rotate: [0, 3, -3, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className={`w-12 h-12 ${feature.color} mx-auto`} />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl font-bold text-gray-900 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-700"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {feature.description}
                    </motion.p>
                    
                    {/* Security level indicator */}
                    <motion.div
                      className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      <motion.div
                        className={`h-full bg-gradient-to-r ${feature.color.includes('red') ? 'from-red-400 to-red-600' : feature.color.includes('blue') ? 'from-red-400 to-red-600' : feature.color.includes('green') ? 'from-green-400 to-green-600' : feature.color.includes('purple') ? 'from-purple-400 to-purple-600' : feature.color.includes('orange') ? 'from-orange-400 to-orange-600' : 'from-teal-400 to-teal-600'} rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </motion.div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Data Handling Process */}
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
                {isGerman ? 'Datenverarbeitung' : 'Data Processing'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Transparenter Umgang mit Ihren Daten in allen Phasen'
                  : 'Transparent handling of your data in all phases'}
              </motion.p>
            </motion.div>

            <div className="max-w-5xl mx-auto">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {dataHandling.map((stage, index) => (
                  <motion.div key={index} variants={staggerItem}>
                    <AnimatedCard className="p-6 text-center h-full" hover={true}>
                      <div className="relative mb-6">
                        <motion.div 
                          className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto shadow-lg"
                          whileHover={{ scale: 1.05, rotate: 15 }}
                          transition={{ duration: 0.6 }}
                        >
                          <stage.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        {/* Animated connection line */}
                        {index < dataHandling.length - 1 && (
                          <motion.div 
                            className="hidden lg:block absolute top-8 left-full w-6 h-0.5 bg-gradient-to-r from-red-300 to-gray-300"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                            style={{ transformOrigin: 'left' }}
                          />
                        )}
                        
                        {/* Step number */}
                        <motion.div
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        >
                          {index + 1}
                        </motion.div>
                      </div>
                      
                      <motion.h3 
                        className="text-lg font-bold text-gray-900 mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {stage.stage}
                      </motion.h3>
                      <motion.p 
                        className="text-gray-700 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        {stage.description}
                      </motion.p>
                    </AnimatedCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Swiss Advantage */}
        <motion.section className="py-20 bg-gradient-to-br from-red-50 to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
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
                className="text-4xl font-bold text-gray-900 mb-6"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Der Swiss Advantage' : 'The Swiss Advantage'}
              </motion.h2>
              
              <AnimatedCard className="p-12 bg-white" hover={true} gradient={true}>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                >
                  {[
                    { 
                      icon: Globe, 
                      title: isGerman ? 'Neutrale Schweiz' : 'Neutral Switzerland',
                      description: isGerman ? 'Keine Überwachungsgesetze, stabile Demokratie' : 'No surveillance laws, stable democracy',
                      color: 'text-primary'
                    },
                    { 
                      icon: Award, 
                      title: isGerman ? 'Premium Standards' : 'Premium Standards',
                      description: isGerman ? 'Schweizer Qualität und Präzision' : 'Swiss quality and precision',
                      color: 'text-red-500'
                    },
                    { 
                      icon: Shield, 
                      title: isGerman ? 'Datenschutz First' : 'Privacy First',
                      description: isGerman ? 'Weltweite Führung im Datenschutz' : 'Global leadership in data protection',
                      color: 'text-green-500'
                    }
                  ].map((advantage, index) => (
                    <motion.div key={index} className="text-center" variants={staggerItem}>
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <advantage.icon className={`w-12 h-12 ${advantage.color} mx-auto mb-4`} />
                      </motion.div>
                      <motion.h3 
                        className="font-bold text-gray-900 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {advantage.title}
                      </motion.h3>
                      <motion.p 
                        className="text-gray-700 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        {advantage.description}
                      </motion.p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.p 
                  className="text-xl text-gray-700 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {isGerman 
                    ? '🏔️ Als Schweizer Startup verstehen wir die einzigartigen Anforderungen des Schweizer Marktes. Unsere AI-Lösung ist von Grund auf für höchste Compliance und Datenschutzstandards entwickelt - ohne Kompromisse bei der Innovation.'
                    : '🏔️ As a Swiss startup, we understand the unique requirements of the Swiss market. Our AI solution is built from the ground up for the highest compliance and privacy standards - without compromising on innovation.'}
                </motion.p>
              </AnimatedCard>
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
          {/* Animated Background */}
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
              <motion.h2 
                className="text-4xl font-bold text-white mb-6"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Bereit für Compliance-sichere AI?' : 'Ready for Compliance-Safe AI?'}
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/90 mb-8"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Sprechen Sie mit unseren Compliance-Experten über Ihre spezifischen Anforderungen.'
                  : 'Speak with our compliance experts about your specific requirements.'}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-100 border-none shadow-lg"
                  icon={<Shield className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Compliance Beratung' : 'Compliance Consultation'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-red-600 backdrop-blur-sm"
                  icon={<Eye className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Sicherheits Demo' : 'Security Demo'}
                </AnimatedButton>
              </motion.div>
              
              {/* Compliance badges */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/80"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
              >
                {[
                  { text: 'FADP Ready' },
                  { text: 'GDPR Compliant' },
                  { text: 'ISO 27001 Prep' }
                ].map((badge, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{badge.text}</span>
                  </motion.div>
                ))}
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

export default CompliancePage