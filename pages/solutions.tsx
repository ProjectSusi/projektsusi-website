import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/layout'
import { 
  SwissFlag, 
  SwissShield, 
  SwissAlps, 
  DataVisualization,
  FloatingParticles
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
import { 
  Building2,
  Pill,
  Factory,
  Landmark,
  FileText,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Target,
  Award,
  Clock,
  Globe,
  Database,
  Lock
} from 'lucide-react'
import Link from 'next/link'

interface SolutionsPageProps {
  locale: string
}

const SolutionsPage: React.FC<SolutionsPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const industries = [
    {
      id: 'banking',
      title: isGerman ? 'Banking & Fintech' : 'Banking & Fintech',
      icon: Building2,
      color: 'from-primary to-secondary',
      description: isGerman 
        ? 'FINMA-konforme KI-Lösungen für das Schweizer Finanzwesen'
        : 'FINMA-compliant AI solutions for Swiss financial sector',
      challenges: [
        isGerman ? 'Regulatorische Compliance (FINMA, MiFID II)' : 'Regulatory compliance (FINMA, MiFID II)',
        isGerman ? 'Kundenservice & Research' : 'Customer service & research',
        isGerman ? 'Risk Assessment & Reporting' : 'Risk assessment & reporting',
        isGerman ? 'Due Diligence Automation' : 'Due diligence automation'
      ],
      solutions: [
        isGerman ? 'Automated Compliance Reporting' : 'Automated compliance reporting',
        isGerman ? 'Intelligent Document Analysis' : 'Intelligent document analysis',
        isGerman ? 'Risk Pattern Recognition' : 'Risk pattern recognition',
        isGerman ? 'Multi-language Client Support' : 'Multi-language client support'
      ],
      stats: {
        compliance: '100%',
        efficiency: '+85%',
        accuracy: '99.9%'
      },
      demoFiles: ['UBS Risk Assessment.pdf', 'Credit Suisse Compliance Report.docx'],
      useCases: [
        {
          title: isGerman ? 'Compliance Automation' : 'Compliance Automation',
          description: isGerman ? 'Automatische FINMA-Berichterstattung' : 'Automated FINMA reporting'
        },
        {
          title: isGerman ? 'Client Research' : 'Client Research', 
          description: isGerman ? 'Intelligente Kundenanalyse' : 'Intelligent client analysis'
        }
      ]
    },
    {
      id: 'pharma',
      title: isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences',
      icon: Pill,
      color: 'from-green-500 to-emerald-600',
      description: isGerman 
        ? 'Swissmedic-konforme AI für pharmazeutische Forschung und Entwicklung'
        : 'Swissmedic-compliant AI for pharmaceutical research and development',
      challenges: [
        isGerman ? 'Clinical Trial Documentation' : 'Clinical trial documentation',
        isGerman ? 'Regulatory Submission Prep' : 'Regulatory submission prep',
        isGerman ? 'Drug Safety Monitoring' : 'Drug safety monitoring',
        isGerman ? 'Research Literature Review' : 'Research literature review'
      ],
      solutions: [
        isGerman ? 'Automated Safety Reports' : 'Automated safety reports',
        isGerman ? 'Clinical Data Analysis' : 'Clinical data analysis',
        isGerman ? 'Regulatory Document Prep' : 'Regulatory document prep',
        isGerman ? 'Patent & Literature Search' : 'Patent & literature search'
      ],
      stats: {
        compliance: '100%',
        timeReduction: '+70%',
        accuracy: '99.8%'
      },
      demoFiles: ['Roche Clinical Trial.pdf', 'Novartis Safety Report.docx'],
      useCases: [
        {
          title: isGerman ? 'Clinical Trials' : 'Clinical Trials',
          description: isGerman ? 'Automatisierte Dokumentenanalyse' : 'Automated document analysis'
        },
        {
          title: isGerman ? 'Drug Safety' : 'Drug Safety',
          description: isGerman ? 'Kontinuierliche Sicherheitsüberwachung' : 'Continuous safety monitoring'
        }
      ]
    },
    {
      id: 'manufacturing',
      title: isGerman ? 'Manufacturing & Engineering' : 'Manufacturing & Engineering',
      icon: Factory,
      color: 'from-orange-500 to-primary-600',
      description: isGerman 
        ? 'Industrie 4.0 KI-Lösungen für Schweizer Präzisionsfertigung'
        : 'Industry 4.0 AI solutions for Swiss precision manufacturing',
      challenges: [
        isGerman ? 'Quality Control Documentation' : 'Quality control documentation',
        isGerman ? 'Technical Manual Management' : 'Technical manual management',
        isGerman ? 'Supply Chain Optimization' : 'Supply chain optimization',
        isGerman ? 'Maintenance & Safety Protocols' : 'Maintenance & safety protocols'
      ],
      solutions: [
        isGerman ? 'Automated QC Reporting' : 'Automated QC reporting',
        isGerman ? 'Technical Knowledge Base' : 'Technical knowledge base',
        isGerman ? 'Process Optimization' : 'Process optimization',
        isGerman ? 'Predictive Maintenance' : 'Predictive maintenance'
      ],
      stats: {
        efficiency: '+65%',
        errorReduction: '-90%',
        costSaving: '35%'
      },
      demoFiles: ['ABB Technical Manual.pdf', 'Schindler Quality Report.docx'],
      useCases: [
        {
          title: isGerman ? 'Quality Control' : 'Quality Control',
          description: isGerman ? 'Intelligente Qualitätssicherung' : 'Intelligent quality assurance'
        },
        {
          title: isGerman ? 'Process Docs' : 'Process Docs',
          description: isGerman ? 'Automatisierte Prozessdokumentation' : 'Automated process documentation'
        }
      ]
    },
    {
      id: 'government',
      title: isGerman ? 'Government & Public Sector' : 'Government & Public Sector',
      icon: Landmark,
      color: 'from-primary to-secondary',
      description: isGerman 
        ? 'FADP-konforme KI für Schweizer Behörden und öffentlichen Sektor'
        : 'FADP-compliant AI for Swiss authorities and public sector',
      challenges: [
        isGerman ? 'Citizen Service Automation' : 'Citizen service automation',
        isGerman ? 'Policy Document Analysis' : 'Policy document analysis',
        isGerman ? 'Multi-language Support' : 'Multi-language support',
        isGerman ? 'Privacy & Transparency' : 'Privacy & transparency'
      ],
      solutions: [
        isGerman ? 'Automated Citizen Support' : 'Automated citizen support',
        isGerman ? 'Policy Research Assistant' : 'Policy research assistant',
        isGerman ? 'Multi-lingual Document Processing' : 'Multi-lingual document processing',
        isGerman ? 'Transparent AI Decisions' : 'Transparent AI decisions'
      ],
      stats: {
        efficiency: '+75%',
        satisfaction: '+60%',
        languages: '4+'
      },
      demoFiles: ['Swiss Federal Council Policy.pdf', 'Canton Zurich Guidelines.docx'],
      useCases: [
        {
          title: isGerman ? 'Citizen Services' : 'Citizen Services',
          description: isGerman ? '24/7 mehrsprachiger Support' : '24/7 multilingual support'
        },
        {
          title: isGerman ? 'Policy Research' : 'Policy Research',
          description: isGerman ? 'Intelligente Dokumentenanalyse' : 'Intelligent document analysis'
        }
      ]
    }
  ]

  const universalFeatures = [
    {
      icon: Shield,
      title: isGerman ? 'Swiss Data Sovereignty' : 'Swiss Data Sovereignty',
      description: isGerman ? '100% in Schweizer Rechenzentren' : '100% in Swiss data centers'
    },
    {
      icon: Zap,
      title: isGerman ? 'Zero Hallucination' : 'Zero Hallucination',
      description: isGerman ? 'Nur Fakten, keine Erfindungen' : 'Only facts, no fiction'
    },
    {
      icon: Globe,
      title: isGerman ? 'Multi-language' : 'Multi-language',
      description: isGerman ? 'DE, FR, IT, EN Support' : 'DE, FR, IT, EN Support'
    },
    {
      icon: Lock,
      title: isGerman ? 'Bank-Grade Security' : 'Bank-Grade Security',
      description: isGerman ? 'Ende-zu-Ende Verschlüsselung' : 'End-to-end encryption'
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
            <FloatingParticles />
          </div>
          
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
                  <SwissFlag className="w-12 h-12" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Swiss AI Lösungen' : 'Swiss AI Solutions'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -5 }}>
                  <SwissShield className="w-12 h-12" glowing />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-secondary/80 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🏔️ Branchenspezifische RAG-Lösungen für Schweizer Unternehmen - entwickelt für lokale Compliance, Mehrsprachigkeit und höchste Sicherheitsstandards.'
                  : '🏔️ Industry-specific RAG solutions for Swiss businesses - built for local compliance, multilingual support, and highest security standards.'}
              </motion.p>

              <motion.div 
                className="flex justify-center space-x-8 mb-12"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: Building2, count: 4, label: isGerman ? 'Branchen' : 'Industries' },
                  { icon: Shield, count: 100, label: '% Compliant', suffix: '%' },
                  { icon: Globe, count: 4, label: isGerman ? 'Sprachen' : 'Languages', suffix: '+' }
                ].map((stat, index) => (
                  <motion.div key={index} className="text-center" variants={staggerItem}>
                    <AnimatedCard className="p-4 mb-2" hover={true} glass={true}>
                      <motion.div whileHover={{ scale: 1.05, rotate: 3 }}>
                        <stat.icon className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                      </motion.div>
                      <motion.div 
                        className="text-2xl font-bold text-secondary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      >
                        {stat.count}{stat.suffix || ''}
                      </motion.div>
                    </AnimatedCard>
                    <p className="text-sm text-secondary/70">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Universal Features */}
        <motion.section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-secondary mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Swiss Standard Features' : 'Swiss Standard Features'}
              </motion.h2>
              <motion.p 
                className="text-secondary/70"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman ? 'In allen Branchen-Lösungen enthalten' : 'Included in all industry solutions'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {universalFeatures.map((feature, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full" hover={true}>
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    </motion.div>
                    <motion.h3 
                      className="font-bold text-secondary mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-secondary/70"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {feature.description}
                    </motion.p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Industry Solutions */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
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
                className="text-4xl font-bold text-secondary mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Branchenspezifische Lösungen' : 'Industry-Specific Solutions'}
              </motion.h2>
              <motion.p 
                className="text-xl text-secondary/70"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Maßgeschneidert für Schweizer Branchen und deren einzigartige Anforderungen'
                  : 'Tailored for Swiss industries and their unique requirements'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="space-y-16"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {industries.map((industry, index) => (
                <motion.div 
                  key={industry.id} 
                  className="max-w-6xl mx-auto"
                  variants={staggerItem}
                >
                  <AnimatedCard className="p-8 lg:p-12 overflow-hidden" hover={true} gradient={true}>
                    {/* Industry Header */}
                    <motion.div 
                      className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 mb-12"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div 
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ duration: 0.3 }}
                      >
                        <industry.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <motion.h3 
                          className="text-3xl font-bold text-secondary mb-4"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        >
                          {industry.title}
                        </motion.h3>
                        <motion.p 
                          className="text-xl text-secondary/80 mb-6"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          {industry.description}
                        </motion.p>
                        
                        {/* Stats */}
                        <motion.div 
                          className="flex flex-wrap gap-6"
                          variants={staggerContainer}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, amount: 0.5 }}
                        >
                          {Object.entries(industry.stats).map(([key, value], statIndex) => (
                            <motion.div 
                              key={key} 
                              className="text-center"
                              variants={staggerItem}
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div 
                                className="text-2xl font-bold text-primary-500"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 + statIndex * 0.1 }}
                              >
                                {value}
                              </motion.div>
                              <div className="text-sm text-secondary/70 capitalize">{key}</div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Content Grid */}
                    <motion.div 
                      className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {/* Challenges & Solutions */}
                      <motion.div 
                        className="space-y-8"
                        variants={slideInLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                      >
                        <div>
                          <motion.h4 
                            className="text-xl font-bold text-secondary mb-4 flex items-center"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                              <Target className="w-6 h-6 text-primary-500 mr-2" />
                            </motion.div>
                            {isGerman ? 'Herausforderungen' : 'Challenges'}
                          </motion.h4>
                          <motion.ul 
                            className="space-y-3"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                          >
                            {industry.challenges.map((challenge, idx) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-start space-x-3"
                                variants={staggerItem}
                                whileHover={{ x: 5 }}
                              >
                                <motion.div 
                                  className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"
                                  whileHover={{ scale: 1.1 }}
                                />
                                <span className="text-secondary/80">{challenge}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        </div>

                        <div>
                          <motion.h4 
                            className="text-xl font-bold text-secondary mb-4 flex items-center"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                            </motion.div>
                            {isGerman ? 'Unsere Lösungen' : 'Our Solutions'}
                          </motion.h4>
                          <motion.ul 
                            className="space-y-3"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                          >
                            {industry.solutions.map((solution, idx) => (
                              <motion.li 
                                key={idx} 
                                className="flex items-start space-x-3"
                                variants={staggerItem}
                                whileHover={{ x: 5, scale: 1.02 }}
                              >
                                <motion.div whileHover={{ scale: 1.05 }}>
                                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                </motion.div>
                                <span className="text-secondary/80">{solution}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        </div>
                      </motion.div>

                      {/* Use Cases & Demo */}
                      <motion.div 
                        className="space-y-8"
                        variants={slideInRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                      >
                        <div>
                          <motion.h4 
                            className="text-xl font-bold text-secondary mb-4 flex items-center"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                              <Zap className="w-6 h-6 text-primary mr-2" />
                            </motion.div>
                            {isGerman ? 'Anwendungsfälle' : 'Use Cases'}
                          </motion.h4>
                          <motion.div 
                            className="space-y-4"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                          >
                            {industry.useCases.map((useCase, idx) => (
                              <motion.div 
                                key={idx} 
                                className="bg-gradient-to-r from-primary-50 to-gray-50 p-4 rounded-lg border border-primary-100"
                                variants={staggerItem}
                                whileHover={{ scale: 1.02, y: -2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <h5 className="font-semibold text-secondary mb-2">{useCase.title}</h5>
                                <p className="text-secondary/80 text-sm">{useCase.description}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>

                        <div>
                          <motion.h4 
                            className="text-xl font-bold text-secondary mb-4 flex items-center"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                              <FileText className="w-6 h-6 text-purple-500 mr-2" />
                            </motion.div>
                            {isGerman ? 'Demo Dateien' : 'Demo Files'}
                          </motion.h4>
                          <motion.div 
                            className="space-y-2"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                          >
                            {industry.demoFiles.map((file, idx) => (
                              <motion.div 
                                key={idx} 
                                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                                variants={staggerItem}
                                whileHover={{ scale: 1.02, x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.div whileHover={{ scale: 1.05 }}>
                                  <FileText className="w-5 h-5 text-gray-500" />
                                </motion.div>
                                <span className="text-secondary/80 text-sm">{file}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>

                        {/* CTA */}
                        <motion.div 
                          className="pt-4"
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          <AnimatedButton
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            icon={<ArrowRight className="w-5 h-5" />}
                            iconPosition="right"
                            onClick={() => window.location.href = `/demo?industry=${industry.id}`}
                          >
                            {isGerman ? `${industry.title} Demo` : `${industry.title} Demo`}
                          </AnimatedButton>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Beta Program CTA */}
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
                {isGerman ? 'Bereit für branchenspezifische AI?' : 'Ready for Industry-Specific AI?'}
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/90 mb-8"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Werden Sie Beta-Partner und testen Sie unsere Lösung kostenlos für Ihre Branche.'
                  : 'Become a beta partner and test our solution free for your industry.'}
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
                  className="bg-white text-primary-600 hover:bg-platin-100 border-none shadow-lg"
                  icon={<Users className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Beta Partner werden' : 'Become Beta Partner'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary-600 backdrop-blur-sm"
                  icon={<Target className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Live Demo' : 'Live Demo'}
                </AnimatedButton>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/80"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
              >
                {[
                  { icon: Shield, text: isGerman ? '100% Swiss Hosting' : '100% Swiss Hosting' },
                  { icon: Clock, text: isGerman ? '5 Min Setup' : '5 Min Setup' },
                  { icon: Award, text: isGerman ? 'Swiss Quality' : 'Swiss Quality' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm">{item.text}</span>
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

export default SolutionsPage