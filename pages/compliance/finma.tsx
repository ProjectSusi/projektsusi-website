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
  Building2,
  Shield,
  FileCheck,
  AlertTriangle,
  Eye,
  Clock,
  Database,
  Lock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  Globe,
  Key,
  Settings,
  TrendingUp,
  Scale,
  Briefcase
} from 'lucide-react'

interface FINMACompliancePageProps {
  locale: string
}

const FINMACompliancePage: React.FC<FINMACompliancePageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const finmaRequirements = [
    {
      icon: Shield,
      title: isGerman ? 'Auslagerungsverordnung (AVO)' : 'Outsourcing Ordinance (AVO)',
      description: isGerman ? 'Vollständige Compliance mit FINMA AVO für IT-Auslagerungen' : 'Full compliance with FINMA AVO for IT outsourcing',
      requirements: [
        isGerman ? 'Risikobewertung und -management' : 'Risk assessment and management',
        isGerman ? 'Vertragsmanagement und SLAs' : 'Contract management and SLAs',
        isGerman ? 'Kontinuierliche Überwachung' : 'Continuous monitoring',
        isGerman ? 'Exit-Strategien und Notfallpläne' : 'Exit strategies and contingency plans'
      ]
    },
    {
      icon: Database,
      title: isGerman ? 'Operationelle Risiken' : 'Operational Risks',
      description: isGerman ? 'Management operationeller Risiken nach FINMA-Standards' : 'Management of operational risks according to FINMA standards',
      requirements: [
        isGerman ? 'Identifikation und Bewertung von IT-Risiken' : 'IT risk identification and assessment',
        isGerman ? 'Business Continuity Management' : 'Business continuity management',
        isGerman ? 'Incident Management Prozesse' : 'Incident management processes',
        isGerman ? 'Regelmäßige Risiko-Reviews' : 'Regular risk reviews'
      ]
    },
    {
      icon: Eye,
      title: isGerman ? 'Governance & Kontrolle' : 'Governance & Control',
      description: isGerman ? 'Robuste Governance-Strukturen für Finanzinstitute' : 'Robust governance structures for financial institutions',
      requirements: [
        isGerman ? 'Board-Level Oversight' : 'Board-level oversight',
        isGerman ? 'Drei-Linien-Verteidigungsmodell' : 'Three lines of defense model',
        isGerman ? 'Interne Revision und Audit' : 'Internal audit and review',
        isGerman ? 'Compliance-Monitoring' : 'Compliance monitoring'
      ]
    },
    {
      icon: FileCheck,
      title: isGerman ? 'Regulatorisches Reporting' : 'Regulatory Reporting',
      description: isGerman ? 'Automatisierte und präzise Berichterstattung an FINMA' : 'Automated and accurate reporting to FINMA',
      requirements: [
        isGerman ? 'Timely Reporting Requirements' : 'Timely reporting requirements',
        isGerman ? 'Datenqualität und -integrität' : 'Data quality and integrity',
        isGerman ? 'Audit Trails für alle Berichte' : 'Audit trails for all reports',
        isGerman ? 'Automatisierte Validierung' : 'Automated validation'
      ]
    }
  ]

  const riskCategories = [
    {
      category: isGerman ? 'Kreditrisiko' : 'Credit Risk',
      description: isGerman ? 'KI-gestützte Kreditrisikoanalyse mit vollständiger Nachverfolgbarkeit' : 'AI-powered credit risk analysis with full traceability',
      features: [
        isGerman ? 'Automatisierte PD/LGD Berechnung' : 'Automated PD/LGD calculation',
        isGerman ? 'Stress-Testing und Szenario-Analyse' : 'Stress testing and scenario analysis',
        isGerman ? 'Portfolio-Diversifikationsanalyse' : 'Portfolio diversification analysis',
        isGerman ? 'Echzeit-Risikoüberwachung' : 'Real-time risk monitoring'
      ],
      metrics: {
        accuracy: '99.2%',
        speed: isGerman ? '10x schneller' : '10x faster',
        coverage: isGerman ? '100% Portfolio' : '100% portfolio'
      }
    },
    {
      category: isGerman ? 'Marktrisiko' : 'Market Risk',
      description: isGerman ? 'Umfassende Marktrisikobewertung mit FINMA-konformen Metriken' : 'Comprehensive market risk assessment with FINMA-compliant metrics',
      features: [
        isGerman ? 'Value-at-Risk (VaR) Berechnung' : 'Value-at-Risk (VaR) calculation',
        isGerman ? 'Expected Shortfall (ES) Modellierung' : 'Expected Shortfall (ES) modeling',
        isGerman ? 'Backtesting und Validierung' : 'Backtesting and validation',
        isGerman ? 'Intraday Risk Monitoring' : 'Intraday risk monitoring'
      ],
      metrics: {
        models: '15+',
        frequency: isGerman ? 'Intraday' : 'Intraday',
        compliance: '100%'
      }
    },
    {
      category: isGerman ? 'Operationelles Risiko' : 'Operational Risk',
      description: isGerman ? 'Proaktive Identifikation und Minderung operationeller Risiken' : 'Proactive identification and mitigation of operational risks',
      features: [
        isGerman ? 'Automatisierte Schadenserkennung' : 'Automated loss detection',
        isGerman ? 'Key Risk Indicator (KRI) Monitoring' : 'Key Risk Indicator (KRI) monitoring',
        isGerman ? 'Risiko- und Kontroll-Assessment' : 'Risk and control assessment',
        isGerman ? 'Business Impact Analyse' : 'Business impact analysis'
      ],
      metrics: {
        detection: isGerman ? '95% automatisch' : '95% automated',
        response: '< 4h',
        coverage: isGerman ? 'Alle Bereiche' : 'All areas'
      }
    }
  ]

  const complianceFramework = [
    {
      phase: isGerman ? 'Assessment' : 'Assessment',
      description: isGerman ? 'Umfassende FINMA-Compliance-Bewertung' : 'Comprehensive FINMA compliance assessment',
      deliverables: [
        isGerman ? 'Gap-Analyse aktueller Systeme' : 'Gap analysis of current systems',
        isGerman ? 'Risikobewertungsmatrix' : 'Risk assessment matrix',
        isGerman ? 'Compliance-Roadmap' : 'Compliance roadmap',
        isGerman ? 'Regulatorische Mapping' : 'Regulatory mapping'
      ],
      duration: isGerman ? '2-4 Wochen' : '2-4 weeks'
    },
    {
      phase: isGerman ? 'Implementation' : 'Implementation',
      description: isGerman ? 'Sichere und konforme Systemeinführung' : 'Secure and compliant system deployment',
      deliverables: [
        isGerman ? 'FINMA-konforme Architektur' : 'FINMA-compliant architecture',
        isGerman ? 'Automatisierte Compliance-Controls' : 'Automated compliance controls',
        isGerman ? 'Reporting-Dashboard' : 'Reporting dashboard',
        isGerman ? 'Schulung und Dokumentation' : 'Training and documentation'
      ],
      duration: isGerman ? '4-8 Wochen' : '4-8 weeks'
    },
    {
      phase: isGerman ? 'Monitoring' : 'Monitoring',
      description: isGerman ? 'Kontinuierliche Überwachung und Optimierung' : 'Continuous monitoring and optimization',
      deliverables: [
        isGerman ? '24/7 Compliance-Monitoring' : '24/7 compliance monitoring',
        isGerman ? 'Automatisierte Alerts' : 'Automated alerts',
        isGerman ? 'Regelmäßige Audits' : 'Regular audits',
        isGerman ? 'Performance-Optimierung' : 'Performance optimization'
      ],
      duration: isGerman ? 'Fortlaufend' : 'Ongoing'
    }
  ]

  const certifications = [
    {
      name: 'ISO 27001',
      description: isGerman ? 'Informationssicherheits-Managementsystem' : 'Information Security Management System',
      status: 'certified',
      validUntil: '2025-12-31'
    },
    {
      name: 'SOC 2 Type II',
      description: isGerman ? 'Service Organization Control Report' : 'Service Organization Control Report',
      status: 'certified',
      validUntil: '2025-06-30'
    },
    {
      name: 'Swiss Cloud',
      description: isGerman ? 'Schweizer Cloud-Standards' : 'Swiss cloud standards',
      status: 'certified',
      validUntil: '2025-12-31'
    },
    {
      name: 'FINMA Recognized',
      description: isGerman ? 'Von FINMA anerkannter Service Provider' : 'FINMA recognized service provider',
      status: 'pending',
      validUntil: '2024-Q2'
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
                  <Building2 className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'FINMA Compliance' : 'FINMA Compliance'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <Scale className="w-12 h-12 text-secondary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-secondary/80 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🏦 FINMA-konforme KI-Lösungen für Schweizer Finanzinstitute. Vollständige Compliance mit Auslagerungsverordnung und Risikomanagement-Standards.'
                  : '🏦 FINMA-compliant AI solutions for Swiss financial institutions. Full compliance with outsourcing ordinance and risk management standards.'}
              </motion.p>

              <motion.div 
                className="inline-flex items-center space-x-3 bg-primary-100 text-primary-800 rounded-full px-6 py-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
                  <Building2 className="w-6 h-6" />
                </motion.div>
                <span className="font-medium">
                  {isGerman ? 'FINMA AVO Konform • Swiss Banking Standards • Regulatory Ready' : 'FINMA AVO Compliant • Swiss Banking Standards • Regulatory Ready'}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-primary" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* FINMA Requirements */}
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
                {isGerman ? 'FINMA Anforderungen' : 'FINMA Requirements'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Vollständige Abdeckung aller regulatorischen Anforderungen für Finanzinstitute'
                  : 'Complete coverage of all regulatory requirements for financial institutions'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {finmaRequirements.map((requirement, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mb-6 shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <requirement.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-secondary mb-4">
                      {requirement.title}
                    </h3>
                    
                    <p className="text-secondary/70 mb-6">
                      {requirement.description}
                    </p>

                    <div className="space-y-3">
                      {requirement.requirements.map((req, reqIndex) => (
                        <div key={reqIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-secondary/80">{req}</span>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Risk Management */}
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
                {isGerman ? 'Risikomanagement' : 'Risk Management'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'KI-gestützte Risikoanalyse für alle FINMA-relevanten Risikokategorien'
                  : 'AI-powered risk analysis for all FINMA-relevant risk categories'
                }
              </p>
            </motion.div>

            {riskCategories.map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <AnimatedCard className="p-8" hover={true}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-2xl font-bold text-secondary mb-4">
                        {category.category}
                      </h3>
                      
                      <p className="text-secondary/70 mb-6">
                        {category.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-secondary/80">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-bold text-secondary mb-4">
                        {isGerman ? 'Performance-Metriken' : 'Performance Metrics'}
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(category.metrics).map(([key, value], metricIndex) => (
                          <div key={metricIndex} className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              {value}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              {key}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Compliance Framework */}
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
                {isGerman ? 'Compliance-Framework' : 'Compliance Framework'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Strukturierter Ansatz für FINMA-Compliance-Implementierung'
                  : 'Structured approach to FINMA compliance implementation'
                }
              </p>
            </motion.div>

            <motion.div 
              className="max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {complianceFramework.map((phase, index) => (
                <motion.div 
                  key={index}
                  variants={staggerItem}
                  className="mb-8"
                >
                  <AnimatedCard className="p-8" hover={true}>
                    <div className="flex items-start space-x-8">
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-white font-bold text-xl">{index + 1}</span>
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-secondary mb-2">
                              {phase.phase}
                            </h3>
                            <p className="text-secondary/70 mb-4">
                              {phase.description}
                            </p>
                          </div>
                          <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                            ⏱️ {phase.duration}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {phase.deliverables.map((deliverable, delIndex) => (
                            <div key={delIndex} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-secondary/80">{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Certifications */}
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
                {isGerman ? 'Zertifizierungen & Standards' : 'Certifications & Standards'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Anerkannte Zertifizierungen und Compliance-Standards'
                  : 'Recognized certifications and compliance standards'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {certifications.map((cert, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full" hover={true}>
                    <motion.div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
                        cert.status === 'certified' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {cert.status === 'certified' ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <Clock className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                    
                    <h3 className="text-lg font-bold text-secondary mb-2">
                      {cert.name}
                    </h3>
                    
                    <p className="text-secondary/70 text-sm mb-4">
                      {cert.description}
                    </p>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cert.status === 'certified' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {cert.status === 'certified' 
                        ? (isGerman ? 'Zertifiziert bis' : 'Certified until')
                        : (isGerman ? 'In Bearbeitung' : 'In progress')
                      } {cert.validUntil}
                    </div>
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
                {isGerman ? 'FINMA-konforme Lösung?' : 'FINMA-compliant solution?'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Starten Sie mit einer KI-Lösung, die alle FINMA-Anforderungen erfüllt und für Schweizer Banken optimiert ist.'
                  : 'Get started with an AI solution that meets all FINMA requirements and is optimized for Swiss banks.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 border-none shadow-lg"
                  icon={<Building2 className="w-6 h-6" />}
                  onClick={() => window.location.href = '/solutions/banking'}
                >
                  {isGerman ? 'Banking-Lösung ansehen' : 'View Banking Solution'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary backdrop-blur-sm"
                  icon={<Briefcase className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'FINMA-Beratung' : 'FINMA Consultation'}
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

export default FINMACompliancePage