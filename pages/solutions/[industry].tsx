import { GetStaticProps, GetStaticPaths } from 'next'
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
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  FileCheck,
  Clock,
  Globe,
  Lock,
  Brain,
  Lightbulb,
  BarChart3,
  Settings
} from 'lucide-react'

interface IndustrySolutionPageProps {
  locale: string
  industry: string
}

type Industry = 'banking' | 'pharma' | 'manufacturing' | 'government'

const IndustrySolutionPage: React.FC<IndustrySolutionPageProps> = ({ locale, industry }) => {
  const isGerman = locale === 'de'

  const industryData: Record<Industry, any> = {
    banking: {
      icon: '🏦',
      title: isGerman ? 'Finanzwesen & Banking' : 'Banking & Finance',
      subtitle: isGerman ? 'FINMA-konforme KI für das Schweizer Finanzwesen' : 'FINMA-compliant AI for Swiss Finance',
      description: isGerman 
        ? 'Temora AI erfüllt die strengsten Schweizer Finanzregulierungen und bietet sichere, präzise Dokumentenanalyse für Banken, Versicherungen und Fintech-Unternehmen.'
        : 'Temora AI meets the strictest Swiss financial regulations and provides secure, precise document analysis for banks, insurance companies, and fintech firms.',
      hero: {
        gradient: 'from-primary to-secondary',
        background: 'from-primary-50 to-gray-50'
      },
      features: [
        {
          icon: Shield,
          title: isGerman ? 'FINMA Compliance' : 'FINMA Compliance',
          description: isGerman ? 'Vollständige Einhaltung der FINMA-Richtlinien' : 'Full compliance with FINMA guidelines'
        },
        {
          icon: Lock,
          title: isGerman ? 'Daten-Souveränität' : 'Data Sovereignty',
          description: isGerman ? 'Schweizer Datenverarbeitung und -speicherung' : 'Swiss data processing and storage'
        },
        {
          icon: Brain,
          title: isGerman ? 'Risikobewertung' : 'Risk Assessment',
          description: isGerman ? 'KI-gestützte Kreditrisiko- und Compliance-Analyse' : 'AI-powered credit risk and compliance analysis'
        },
        {
          icon: FileCheck,
          title: isGerman ? 'Regulatorische Berichte' : 'Regulatory Reports',
          description: isGerman ? 'Automatisierte Berichterstattung für Aufsichtsbehörden' : 'Automated reporting for regulatory authorities'
        }
      ],
      useCases: [
        {
          title: isGerman ? 'Kreditprüfung' : 'Credit Assessment',
          description: isGerman ? 'Automatisierte Analyse von Kreditanträgen und Finanzunterlagen' : 'Automated analysis of loan applications and financial documents',
          metrics: { accuracy: '98.5%', time: isGerman ? '75% schneller' : '75% faster' }
        },
        {
          title: isGerman ? 'Compliance-Monitoring' : 'Compliance Monitoring',
          description: isGerman ? 'Kontinuierliche Überwachung regulatorischer Anforderungen' : 'Continuous monitoring of regulatory requirements',
          metrics: { coverage: '100%', alerts: isGerman ? 'Echtzeit' : 'Real-time' }
        },
        {
          title: isGerman ? 'Vertragsanalyse' : 'Contract Analysis',
          description: isGerman ? 'Intelligente Analyse von Finanzverträgen und -vereinbarungen' : 'Intelligent analysis of financial contracts and agreements',
          metrics: { efficiency: '90%', accuracy: '99.2%' }
        }
      ],
      benefits: [
        isGerman ? 'FINMA-konforme Datenverarbeitung' : 'FINMA-compliant data processing',
        isGerman ? 'Reduzierte Compliance-Kosten um 60%' : 'Reduced compliance costs by 60%',
        isGerman ? 'Automatisierte Risikoerkennung' : 'Automated risk detection',
        isGerman ? 'Schweizer Datenschutz-Standards' : 'Swiss data protection standards'
      ]
    },
    pharma: {
      icon: '💊',
      title: isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences',
      subtitle: isGerman ? 'Beschleunigte Arzneimittelforschung mit Schweizer Präzision' : 'Accelerated drug discovery with Swiss precision',
      description: isGerman 
        ? 'Nutzen Sie Temora AI für die Analyse klinischer Studien, Forschungsdaten und regulatorischer Dokumente - sicher und FADP-konform.'
        : 'Use Temora AI to analyze clinical trials, research data, and regulatory documents - securely and FADP-compliant.',
      hero: {
        gradient: 'from-green-600 to-teal-700',
        background: 'from-green-50 to-teal-50'
      },
      features: [
        {
          icon: Brain,
          title: isGerman ? 'Klinische Datenanalyse' : 'Clinical Data Analysis',
          description: isGerman ? 'Intelligente Auswertung klinischer Studiendaten' : 'Intelligent evaluation of clinical trial data'
        },
        {
          icon: FileCheck,
          title: isGerman ? 'Regulatorische Compliance' : 'Regulatory Compliance',
          description: isGerman ? 'Swissmedic und EMA-konforme Dokumentation' : 'Swissmedic and EMA-compliant documentation'
        },
        {
          icon: Lightbulb,
          title: isGerman ? 'Forschungsbeschleunigung' : 'Research Acceleration',
          description: isGerman ? 'Schnellere Identifikation relevanter Forschungserkenntnisse' : 'Faster identification of relevant research insights'
        },
        {
          icon: Shield,
          title: isGerman ? 'Patientendatenschutz' : 'Patient Data Protection',
          description: isGerman ? 'Höchste Sicherheitsstandards für sensible Daten' : 'Highest security standards for sensitive data'
        }
      ],
      useCases: [
        {
          title: isGerman ? 'Literaturrecherche' : 'Literature Research',
          description: isGerman ? 'Semantische Suche durch medizinische Fachliteratur' : 'Semantic search through medical literature',
          metrics: { speed: isGerman ? '10x schneller' : '10x faster', coverage: '95%' }
        },
        {
          title: isGerman ? 'Klinische Studienanalyse' : 'Clinical Trial Analysis',
          description: isGerman ? 'Auswertung von Studienergebnissen und Nebenwirkungen' : 'Analysis of study results and side effects',
          metrics: { accuracy: '97.8%', time: isGerman ? '80% Zeitersparnis' : '80% time savings' }
        },
        {
          title: isGerman ? 'Regulatory Submissions' : 'Regulatory Submissions',
          description: isGerman ? 'Automatisierte Vorbereitung von Zulassungsanträgen' : 'Automated preparation of approval applications',
          metrics: { compliance: '100%', efficiency: '70%' }
        }
      ],
      benefits: [
        isGerman ? 'Beschleunigte Medikamentenentwicklung' : 'Accelerated drug development',
        isGerman ? 'Reduzierte F&E-Kosten um 40%' : 'Reduced R&D costs by 40%',
        isGerman ? 'Verbesserte Patientensicherheit' : 'Improved patient safety',
        isGerman ? 'Swissmedic-konforme Prozesse' : 'Swissmedic-compliant processes'
      ]
    },
    manufacturing: {
      icon: '🏭',
      title: isGerman ? 'Produktion & Manufacturing' : 'Manufacturing & Production',
      subtitle: isGerman ? 'Intelligente Qualitätskontrolle und Compliance-Automatisierung' : 'Intelligent quality control and compliance automation',
      description: isGerman 
        ? 'Optimieren Sie Ihre Produktionsprozesse mit KI-gestützter Dokumentenanalyse für Qualitätssicherung, Compliance und Effizienzsteigerung.'
        : 'Optimize your production processes with AI-powered document analysis for quality assurance, compliance, and efficiency improvements.',
      hero: {
        gradient: 'from-primary-500 to-primary-700',
        background: 'from-orange-50 to-primary-50'
      },
      features: [
        {
          icon: Settings,
          title: isGerman ? 'Prozessoptimierung' : 'Process Optimization',
          description: isGerman ? 'KI-gestützte Analyse von Produktionsdaten' : 'AI-powered analysis of production data'
        },
        {
          icon: CheckCircle,
          title: isGerman ? 'Qualitätssicherung' : 'Quality Assurance',
          description: isGerman ? 'Automatisierte Qualitätskontrolle und -dokumentation' : 'Automated quality control and documentation'
        },
        {
          icon: FileCheck,
          title: isGerman ? 'ISO-Compliance' : 'ISO Compliance',
          description: isGerman ? 'Einhaltung von ISO 9001, 14001 und anderen Standards' : 'Compliance with ISO 9001, 14001, and other standards'
        },
        {
          icon: TrendingUp,
          title: isGerman ? 'Effizienzsteigerung' : 'Efficiency Improvement',
          description: isGerman ? 'Identifikation von Verbesserungspotenzialen' : 'Identification of improvement opportunities'
        }
      ],
      useCases: [
        {
          title: isGerman ? 'Technische Handbücher' : 'Technical Manuals',
          description: isGerman ? 'Schneller Zugriff auf technische Dokumentation und Spezifikationen' : 'Quick access to technical documentation and specifications',
          metrics: { speed: isGerman ? '5x schneller' : '5x faster', accuracy: '96%' }
        },
        {
          title: isGerman ? 'Qualitätsberichte' : 'Quality Reports',
          description: isGerman ? 'Automatisierte Erstellung und Analyse von Qualitätsberichten' : 'Automated creation and analysis of quality reports',
          metrics: { efficiency: '85%', compliance: '100%' }
        },
        {
          title: isGerman ? 'Wartungsplanung' : 'Maintenance Planning',
          description: isGerman ? 'Predictive Maintenance basierend auf historischen Daten' : 'Predictive maintenance based on historical data',
          metrics: { downtime: isGerman ? '-30%' : '-30%', cost: isGerman ? '-25%' : '-25%' }
        }
      ],
      benefits: [
        isGerman ? 'Reduzierte Ausfallzeiten um 30%' : 'Reduced downtime by 30%',
        isGerman ? 'Verbesserte Produktqualität' : 'Improved product quality',
        isGerman ? 'Automatisierte Compliance-Berichte' : 'Automated compliance reports',
        isGerman ? 'Optimierte Wartungszyklen' : 'Optimized maintenance cycles'
      ]
    },
    government: {
      icon: '🏛️',
      title: isGerman ? 'Öffentlicher Sektor & Verwaltung' : 'Government & Public Sector',
      subtitle: isGerman ? 'Mehrsprachige Bürgerdienste mit Schweizer Datenschutz' : 'Multilingual citizen services with Swiss data protection',
      description: isGerman 
        ? 'Verbessern Sie Bürgerdienste mit KI-gestützter Dokumentenverarbeitung - vollständig FADP-konform und in deutscher, französischer und italienischer Sprache.'
        : 'Improve citizen services with AI-powered document processing - fully FADP-compliant and in German, French, and Italian languages.',
      hero: {
        gradient: 'from-primary to-secondary',
        background: 'from-primary-50 to-gray-50'
      },
      features: [
        {
          icon: Globe,
          title: isGerman ? 'Mehrsprachigkeit' : 'Multilingual Support',
          description: isGerman ? 'Unterstützung für Deutsch, Französisch, Italienisch und Englisch' : 'Support for German, French, Italian, and English'
        },
        {
          icon: Shield,
          title: isGerman ? 'FADP-Compliance' : 'FADP Compliance',
          description: isGerman ? 'Vollständige Einhaltung des Schweizer Datenschutzgesetzes' : 'Full compliance with Swiss Data Protection Act'
        },
        {
          icon: Users,
          title: isGerman ? 'Bürgerdienste' : 'Citizen Services',
          description: isGerman ? 'Verbesserte Servicequalität und schnellere Bearbeitung' : 'Improved service quality and faster processing'
        },
        {
          icon: FileCheck,
          title: isGerman ? 'Dokumentenmanagement' : 'Document Management',
          description: isGerman ? 'Effiziente Verwaltung öffentlicher Dokumente' : 'Efficient management of public documents'
        }
      ],
      useCases: [
        {
          title: isGerman ? 'Bürgeranfragen' : 'Citizen Inquiries',
          description: isGerman ? 'Automatisierte Bearbeitung häufiger Bürgeranfragen' : 'Automated processing of common citizen inquiries',
          metrics: { response: isGerman ? '80% schneller' : '80% faster', satisfaction: '94%' }
        },
        {
          title: isGerman ? 'Gesetzesrecherche' : 'Legal Research',
          description: isGerman ? 'Schnelle Suche durch Gesetze und Verordnungen' : 'Quick search through laws and regulations',
          metrics: { accuracy: '98%', time: isGerman ? '90% Zeitersparnis' : '90% time savings' }
        },
        {
          title: isGerman ? 'Compliance-Prüfung' : 'Compliance Review',
          description: isGerman ? 'Automatisierte Überprüfung von Anträgen und Dokumenten' : 'Automated review of applications and documents',
          metrics: { efficiency: '75%', accuracy: '97.5%' }
        }
      ],
      benefits: [
        isGerman ? 'Verbesserte Bürgererfahrung' : 'Improved citizen experience',
        isGerman ? 'Reduzierte Bearbeitungszeiten um 60%' : 'Reduced processing times by 60%',
        isGerman ? 'Mehrsprachige Unterstützung' : 'Multilingual support',
        isGerman ? 'Vollständige Transparenz und Datenschutz' : 'Complete transparency and data protection'
      ]
    }
  }

  const data = industryData[industry as Industry]

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-platin-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary mb-4">404</h1>
            <p className="text-xl text-secondary/70">
              {isGerman ? 'Branchenlösung nicht gefunden' : 'Industry solution not found'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

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
                <motion.div 
                  className="text-8xl"
                  whileHover={{ scale: 1.05, rotate: 10 }}
                >
                  {data.icon}
                </motion.div>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold mb-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className={`bg-gradient-to-r ${data.hero.gradient} bg-clip-text text-transparent`}>
                  {data.title}
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-secondary/80 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {data.subtitle}
              </motion.p>

              <motion.p 
                className="text-lg text-secondary/70 max-w-3xl mx-auto mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {data.description}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <AnimatedButton 
                  variant="primary"
                  size="lg"
                  icon={<Zap className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Kostenlose Demo starten' : 'Start Free Demo'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-platin-300 text-secondary hover:bg-platin-100"
                  icon={<Briefcase className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Beratungstermin buchen' : 'Schedule Consultation'}
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section className={`py-20 bg-gradient-to-br ${data.hero.background}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'Spezielle Funktionen' : 'Specialized Features'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Maßgeschneiderte KI-Lösungen für Ihre Branche'
                  : 'Tailored AI solutions for your industry'
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
              {data.features.map((feature: any, index: number) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full" hover={true}>
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${data.hero.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-secondary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-secondary/70 text-sm">
                      {feature.description}
                    </p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Use Cases Section */}
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
                {isGerman ? 'Anwendungsfälle' : 'Use Cases'}
              </h2>
              <p className="text-xl text-secondary/70 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Reale Anwendungen mit messbaren Ergebnissen'
                  : 'Real-world applications with measurable results'
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
              {data.useCases.map((useCase: any, index: number) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-r ${data.hero.gradient} rounded-lg flex items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-secondary mb-4">
                      {useCase.title}
                    </h3>
                    <p className="text-secondary/70 mb-6">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(useCase.metrics).map(([key, value]: [string, any], metricIndex: number) => (
                        <div key={metricIndex} className="bg-platin-50 px-3 py-2 rounded-lg">
                          <div className={`text-lg font-bold bg-gradient-to-r ${data.hero.gradient} bg-clip-text text-transparent`}>
                            {value}
                          </div>
                          <div className="text-xs text-secondary/60 uppercase tracking-wide">
                            {key}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section className={`py-20 bg-gradient-to-br ${data.hero.background}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-secondary mb-8">
                {isGerman ? 'Ihre Vorteile' : 'Your Benefits'}
              </h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {data.benefits.map((benefit: string, index: number) => (
                  <motion.div 
                    key={index}
                    variants={staggerItem}
                    className="flex items-center space-x-4 p-4 bg-white/80 rounded-lg"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-8 h-8 bg-gradient-to-r ${data.hero.gradient} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-secondary/90 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className={`py-20 bg-gradient-to-r ${data.hero.gradient} relative overflow-hidden`}
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
                {isGerman ? 'Bereit für den nächsten Schritt?' : 'Ready for the next step?'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Lassen Sie uns gemeinsam Ihre branchenspezifischen Herausforderungen lösen.'
                  : 'Let us work together to solve your industry-specific challenges.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-secondary hover:bg-platin-100 border-none shadow-lg"
                  icon={<ArrowRight className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Jetzt Demo starten' : 'Start Demo Now'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-secondary backdrop-blur-sm"
                  icon={<Users className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Experten kontaktieren' : 'Contact Experts'}
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const industries = ['banking', 'pharma', 'manufacturing', 'government']
  
  const paths = industries.map(industry => ({
    params: { industry }
  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const industry = params?.industry as string

  return {
    props: {
      locale: 'de',
      industry
    },
  }
}

export default IndustrySolutionPage