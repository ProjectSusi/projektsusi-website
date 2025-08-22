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
import { 
  Shield,
  Eye,
  Key,
  Lock,
  FileCheck,
  UserCheck,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Scale,
  Clock,
  Database,
  Trash2,
  Settings,
  Users
} from 'lucide-react'

interface FADPCompliancePageProps {
  locale: string
}

const FADPCompliancePage: React.FC<FADPCompliancePageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const fadpPrinciples = [
    {
      icon: Shield,
      title: isGerman ? 'Datensicherheit' : 'Data Security',
      description: isGerman ? 'End-to-End Verschlüsselung aller Daten in Ruhe und Übertragung' : 'End-to-end encryption of all data at rest and in transit',
      implementation: isGerman ? 'AES-256 Verschlüsselung, TLS 1.3, Schweizer Rechenzentren' : 'AES-256 encryption, TLS 1.3, Swiss data centers'
    },
    {
      icon: Eye,
      title: isGerman ? 'Transparenz' : 'Transparency',
      description: isGerman ? 'Klare Information über Datenverarbeitung und -verwendung' : 'Clear information about data processing and usage',
      implementation: isGerman ? 'Vollständige Audit-Trails, transparente Datenschutzerklärung' : 'Complete audit trails, transparent privacy policy'
    },
    {
      icon: UserCheck,
      title: isGerman ? 'Betroffenenrechte' : 'Data Subject Rights',
      description: isGerman ? 'Vollständige Umsetzung aller FADP-Rechte der betroffenen Personen' : 'Full implementation of all FADP rights of data subjects',
      implementation: isGerman ? 'Auskunft, Berichtigung, Löschung, Datenportabilität' : 'Access, rectification, deletion, data portability'
    },
    {
      icon: FileCheck,
      title: isGerman ? 'Rechtmäßigkeit' : 'Lawfulness',
      description: isGerman ? 'Datenverarbeitung nur auf Grundlage rechtmäßiger Rechtsgrundlagen' : 'Data processing only based on lawful legal bases',
      implementation: isGerman ? 'Einwilligung, Vertrag, berechtigtes Interesse dokumentiert' : 'Consent, contract, legitimate interest documented'
    },
    {
      icon: Globe,
      title: isGerman ? 'Datenlokalisierung' : 'Data Localization',
      description: isGerman ? 'Alle Daten werden ausschließlich in der Schweiz verarbeitet' : 'All data is processed exclusively in Switzerland',
      implementation: isGerman ? 'Schweizer Rechenzentren, keine Drittlandübermittlung' : 'Swiss data centers, no third country transfers'
    },
    {
      icon: Clock,
      title: isGerman ? 'Aufbewahrungsfristen' : 'Retention Periods',
      description: isGerman ? 'Automatisierte Löschung nach definierten Aufbewahrungsfristen' : 'Automated deletion after defined retention periods',
      implementation: isGerman ? 'Konfigurierbare Richtlinien, automatische Löschzyklen' : 'Configurable policies, automatic deletion cycles'
    }
  ]

  const complianceFeatures = [
    {
      category: isGerman ? 'Datenschutz durch Technik' : 'Privacy by Design',
      items: [
        {
          title: isGerman ? 'Datenminimierung' : 'Data Minimization',
          description: isGerman ? 'Nur relevante Daten werden verarbeitet' : 'Only relevant data is processed',
          status: 'implemented'
        },
        {
          title: isGerman ? 'Pseudonymisierung' : 'Pseudonymization',
          description: isGerman ? 'Automatische Anonymisierung sensibler Daten' : 'Automatic anonymization of sensitive data',
          status: 'implemented'
        },
        {
          title: isGerman ? 'Zweckbindung' : 'Purpose Limitation',
          description: isGerman ? 'Datenverwendung nur für spezifische Zwecke' : 'Data use only for specific purposes',
          status: 'implemented'
        }
      ]
    },
    {
      category: isGerman ? 'Technische Maßnahmen' : 'Technical Measures',
      items: [
        {
          title: isGerman ? 'Verschlüsselung' : 'Encryption',
          description: isGerman ? 'AES-256 für Daten, TLS 1.3 für Übertragung' : 'AES-256 for data, TLS 1.3 for transmission',
          status: 'implemented'
        },
        {
          title: isGerman ? 'Zugriffskontrolle' : 'Access Control',
          description: isGerman ? 'Rollenbasierte Zugriffe mit Multi-Faktor-Authentifizierung' : 'Role-based access with multi-factor authentication',
          status: 'implemented'
        },
        {
          title: isGerman ? 'Datenintegrität' : 'Data Integrity',
          description: isGerman ? 'Schutz vor unbefugten Änderungen' : 'Protection against unauthorized changes',
          status: 'implemented'
        }
      ]
    },
    {
      category: isGerman ? 'Organisatorische Maßnahmen' : 'Organizational Measures',
      items: [
        {
          title: isGerman ? 'Datenschutz-Folgenabschätzung' : 'Data Protection Impact Assessment',
          description: isGerman ? 'Regelmäßige DSFA für alle Verarbeitungen' : 'Regular DPIA for all processing activities',
          status: 'implemented'
        },
        {
          title: isGerman ? 'Mitarbeiterschulung' : 'Employee Training',
          description: isGerman ? 'Regelmäßige Datenschutzschulungen' : 'Regular data protection training',
          status: 'implemented'
        },
        {
          title: isGerman ? 'Verzeichnis der Verarbeitungstätigkeiten' : 'Record of Processing Activities',
          description: isGerman ? 'Vollständige Dokumentation aller Datenverarbeitungen' : 'Complete documentation of all data processing',
          status: 'implemented'
        }
      ]
    }
  ]

  const userRights = [
    {
      right: isGerman ? 'Auskunftsrecht' : 'Right of Access',
      description: isGerman ? 'Erhalten Sie Informationen über Ihre gespeicherten Daten' : 'Get information about your stored data',
      implementation: isGerman ? 'Self-Service Portal + API' : 'Self-service portal + API',
      timeframe: isGerman ? '30 Tage' : '30 days'
    },
    {
      right: isGerman ? 'Berichtigungsrecht' : 'Right of Rectification',
      description: isGerman ? 'Korrigieren Sie unrichtige oder unvollständige Daten' : 'Correct incorrect or incomplete data',
      implementation: isGerman ? 'Online-Formular + Support' : 'Online form + support',
      timeframe: isGerman ? '30 Tage' : '30 days'
    },
    {
      right: isGerman ? 'Löschungsrecht' : 'Right of Erasure',
      description: isGerman ? 'Löschen Sie Ihre Daten unter bestimmten Umständen' : 'Delete your data under certain circumstances',
      implementation: isGerman ? 'Automatisierte Löschung' : 'Automated deletion',
      timeframe: isGerman ? '30 Tage' : '30 days'
    },
    {
      right: isGerman ? 'Datenportabilität' : 'Right of Data Portability',
      description: isGerman ? 'Exportieren Sie Ihre Daten in einem maschinenlesbaren Format' : 'Export your data in machine-readable format',
      implementation: isGerman ? 'JSON/XML Export' : 'JSON/XML export',
      timeframe: isGerman ? '30 Tage' : '30 days'
    },
    {
      right: isGerman ? 'Widerspruchsrecht' : 'Right to Object',
      description: isGerman ? 'Widersprechen Sie der Verarbeitung aus berechtigtem Interesse' : 'Object to processing based on legitimate interest',
      implementation: isGerman ? 'Opt-out Mechanismus' : 'Opt-out mechanism',
      timeframe: isGerman ? 'Sofort' : 'Immediate'
    }
  ]

  return (
    <Layout>
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
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
                  <Scale className="w-12 h-12 text-primary-500" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'FADP Compliance' : 'FADP Compliance'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <SwissShield className="w-12 h-12 text-primary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-secondary/80 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🇨🇭 Vollständige Einhaltung des Schweizer Datenschutzgesetzes (FADP). Ihre Daten bleiben in der Schweiz - sicher, konform und transparent.'
                  : '🇨🇭 Full compliance with Swiss Federal Act on Data Protection (FADP). Your data stays in Switzerland - secure, compliant, and transparent.'}
              </motion.p>

              <motion.div 
                className="inline-flex items-center space-x-3 bg-primary-100 text-primary-800 rounded-full px-6 py-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
                  <SwissFlag className="w-6 h-6" />
                </motion.div>
                <span className="font-medium">
                  {isGerman ? '100% FADP Konform • Swiss Data Sovereignty • Zero Third-Country Transfer' : '100% FADP Compliant • Swiss Data Sovereignty • Zero Third-Country Transfer'}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* FADP Principles */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'FADP Grundsätze' : 'FADP Principles'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Wie Temora AI alle Grundsätze des Schweizer Datenschutzgesetzes umsetzt'
                  : 'How Temora AI implements all Swiss Data Protection Act principles'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {fadpPrinciples.map((principle, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <principle.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-secondary mb-4 text-center">
                      {principle.title}
                    </h3>
                    
                    <p className="text-secondary/70 mb-4 text-center">
                      {principle.description}
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-secondary/80 mb-2">
                        {isGerman ? 'Umsetzung:' : 'Implementation:'}
                      </p>
                      <p className="text-sm text-secondary/70">
                        {principle.implementation}
                      </p>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Compliance Features */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'Compliance-Maßnahmen' : 'Compliance Measures'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Technische und organisatorische Maßnahmen für vollständige FADP-Konformität'
                  : 'Technical and organizational measures for complete FADP compliance'
                }
              </p>
            </motion.div>

            {complianceFeatures.map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-secondary mb-8 text-center">
                  {category.category}
                </h3>
                
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {category.items.map((item, itemIndex) => (
                    <motion.div key={itemIndex} variants={staggerItem}>
                      <AnimatedCard className="p-6 h-full" hover={true}>
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-bold text-secondary">
                            {item.title}
                          </h4>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </motion.div>
                        </div>
                        
                        <p className="text-secondary/70 text-sm">
                          {item.description}
                        </p>
                      </AnimatedCard>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* User Rights */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'Ihre Rechte unter FADP' : 'Your Rights under FADP'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Vollständige Kontrolle über Ihre persönlichen Daten'
                  : 'Complete control over your personal data'
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
              {userRights.map((right, index) => (
                <motion.div 
                  key={index}
                  variants={staggerItem}
                  className="mb-6"
                >
                  <AnimatedCard className="p-8" hover={true}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <h3 className="text-xl font-bold text-secondary mb-2">
                          {right.right}
                        </h3>
                        <p className="text-secondary/70 mb-3">
                          {right.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                            {right.implementation}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            ⏱️ {right.timeframe}
                          </span>
                        </div>
                      </div>
                      <motion.div 
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <AnimatedButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/contact'}
                        >
                          {isGerman ? 'Recht ausüben' : 'Exercise Right'}
                        </AnimatedButton>
                      </motion.div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Technical Implementation */}
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
                {isGerman ? 'Technische Umsetzung' : 'Technical Implementation'}
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Wie wir FADP-Konformität auf technischer Ebene gewährleisten'
                  : 'How we ensure FADP compliance at the technical level'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div variants={staggerItem}>
                <AnimatedCard className="p-8 bg-gray-800 border-gray-700 h-full" hover={true}>
                  <div className="flex items-center mb-6">
                    <Database className="w-8 h-8 text-secondary mr-3" />
                    <h3 className="text-2xl font-bold">
                      {isGerman ? 'Datenspeicherung' : 'Data Storage'}
                    </h3>
                  </div>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'Ausschließlich Schweizer Rechenzentren (ISO 27001)' : 'Exclusively Swiss data centers (ISO 27001)'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'AES-256 Verschlüsselung aller Daten at-rest' : 'AES-256 encryption of all data at-rest'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'Automatische Backups mit Verschlüsselung' : 'Automatic encrypted backups'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'Keine Cloud-Anbieter außerhalb der Schweiz' : 'No cloud providers outside Switzerland'}</span>
                    </li>
                  </ul>
                </AnimatedCard>
              </motion.div>

              <motion.div variants={staggerItem}>
                <AnimatedCard className="p-8 bg-gray-800 border-gray-700 h-full" hover={true}>
                  <div className="flex items-center mb-6">
                    <Lock className="w-8 h-8 text-primary-400 mr-3" />
                    <h3 className="text-2xl font-bold">
                      {isGerman ? 'Datenverarbeitung' : 'Data Processing'}
                    </h3>
                  </div>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'TLS 1.3 für alle Datenübertragungen' : 'TLS 1.3 for all data transmissions'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'Zero-Trust Architektur mit Multi-Faktor-Auth' : 'Zero-trust architecture with multi-factor auth'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'Rollenbasierte Zugriffskontrolle (RBAC)' : 'Role-based access control (RBAC)'}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{isGerman ? 'Vollständige Audit-Logs für alle Operationen' : 'Complete audit logs for all operations'}</span>
                    </li>
                  </ul>
                </AnimatedCard>
              </motion.div>
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
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"
              animate={{ scale: [1.05, 1, 1.05], x: [0, -30, 0] }}
              transition={{ duration: 10, repeat: Infinity, delay: 5 }}
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
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <SwissFlag className="w-16 h-16 mx-auto" />
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-6">
                {isGerman ? 'FADP-konform starten?' : 'Start FADP-compliant?'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Nutzen Sie eine RAG-Lösung, die von Grund auf für Schweizer Datenschutz entwickelt wurde.'
                  : 'Use a RAG solution built from the ground up for Swiss data protection.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 border-none shadow-lg"
                  icon={<CheckCircle className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'FADP-Demo starten' : 'Start FADP Demo'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary-600 backdrop-blur-sm"
                  icon={<Scale className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Compliance-Beratung' : 'Compliance Consultation'}
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

export default FADPCompliancePage