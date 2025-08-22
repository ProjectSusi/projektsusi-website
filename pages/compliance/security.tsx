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
  Lock,
  Key,
  Eye,
  Server,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Clock,
  Users,
  Activity,
  FileCheck,
  Zap,
  Settings,
  Code,
  Network,
  Fingerprint,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'

interface SecurityPageProps {
  locale: string
}

const SecurityPage: React.FC<SecurityPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const securityLayers = [
    {
      layer: isGerman ? 'Netzwerk-Sicherheit' : 'Network Security',
      icon: Network,
      description: isGerman ? 'Multi-Layer Firewall und DDoS-Schutz' : 'Multi-layer firewall and DDoS protection',
      features: [
        isGerman ? 'WAF (Web Application Firewall)' : 'WAF (Web Application Firewall)',
        isGerman ? 'DDoS-Mitigation bis 1 Tbps' : 'DDoS mitigation up to 1 Tbps',
        isGerman ? 'Intrusion Detection System (IDS)' : 'Intrusion Detection System (IDS)',
        isGerman ? 'Zero-Trust Network Architecture' : 'Zero-trust network architecture'
      ],
      certification: 'ISO 27001'
    },
    {
      layer: isGerman ? 'Anwendungs-Sicherheit' : 'Application Security',
      icon: Code,
      description: isGerman ? 'Sichere Softwareentwicklung und OWASP-Standards' : 'Secure software development and OWASP standards',
      features: [
        isGerman ? 'Static Application Security Testing (SAST)' : 'Static Application Security Testing (SAST)',
        isGerman ? 'Dynamic Application Security Testing (DAST)' : 'Dynamic Application Security Testing (DAST)',
        isGerman ? 'Software Composition Analysis (SCA)' : 'Software Composition Analysis (SCA)',
        isGerman ? 'Penetration Testing (quartalsweise)' : 'Penetration testing (quarterly)'
      ],
      certification: 'OWASP Top 10'
    },
    {
      layer: isGerman ? 'Daten-Sicherheit' : 'Data Security',
      icon: Database,
      description: isGerman ? 'Ende-zu-Ende Verschlüsselung und Datenschutz' : 'End-to-end encryption and data protection',
      features: [
        isGerman ? 'AES-256 Verschlüsselung at-rest' : 'AES-256 encryption at-rest',
        isGerman ? 'TLS 1.3 für Datenübertragung' : 'TLS 1.3 for data transmission',
        isGerman ? 'Hardware Security Modules (HSM)' : 'Hardware Security Modules (HSM)',
        isGerman ? 'Perfect Forward Secrecy (PFS)' : 'Perfect Forward Secrecy (PFS)'
      ],
      certification: 'FIPS 140-2'
    },
    {
      layer: isGerman ? 'Identitäts- & Zugriffs-Management' : 'Identity & Access Management',
      icon: Fingerprint,
      description: isGerman ? 'Multi-Faktor-Authentifizierung und rollenbasierte Zugriffe' : 'Multi-factor authentication and role-based access',
      features: [
        isGerman ? 'Multi-Faktor-Authentifizierung (MFA)' : 'Multi-Factor Authentication (MFA)',
        isGerman ? 'Single Sign-On (SSO) mit SAML/OIDC' : 'Single Sign-On (SSO) with SAML/OIDC',
        isGerman ? 'Rollenbasierte Zugriffskontrolle (RBAC)' : 'Role-Based Access Control (RBAC)',
        isGerman ? 'Privileged Access Management (PAM)' : 'Privileged Access Management (PAM)'
      ],
      certification: 'SOC 2 Type II'
    },
    {
      layer: isGerman ? 'Infrastruktur-Sicherheit' : 'Infrastructure Security',
      icon: Server,
      description: isGerman ? 'Sichere Cloud-Infrastruktur und physische Sicherheit' : 'Secure cloud infrastructure and physical security',
      features: [
        isGerman ? 'Swiss Tier III+ Rechenzentren' : 'Swiss Tier III+ data centers',
        isGerman ? '24/7 physische Sicherheit' : '24/7 physical security',
        isGerman ? 'Biometrische Zugangskontrolle' : 'Biometric access control',
        isGerman ? 'Redundante Stromversorgung' : 'Redundant power supply'
      ],
      certification: 'Swiss Cloud'
    },
    {
      layer: isGerman ? 'Monitoring & Response' : 'Monitoring & Response',
      icon: Activity,
      description: isGerman ? '24/7 Security Operations Center (SOC)' : '24/7 Security Operations Center (SOC)',
      features: [
        isGerman ? 'Security Information Event Management (SIEM)' : 'Security Information Event Management (SIEM)',
        isGerman ? 'Incident Response Team (IRT)' : 'Incident Response Team (IRT)',
        isGerman ? 'Threat Intelligence Integration' : 'Threat intelligence integration',
        isGerman ? 'Automated Security Orchestration' : 'Automated security orchestration'
      ],
      certification: 'ISO 27035'
    }
  ]

  const threatProtection = [
    {
      threat: isGerman ? 'Cyberattacken' : 'Cyber Attacks',
      description: isGerman ? 'Schutz vor Advanced Persistent Threats (APT) und Ransomware' : 'Protection against Advanced Persistent Threats (APT) and ransomware',
      protection: [
        isGerman ? 'ML-basierte Anomalie-Erkennung' : 'ML-based anomaly detection',
        isGerman ? 'Behavioral Analytics' : 'Behavioral analytics',
        isGerman ? 'Sandbox-Analyse verdächtiger Dateien' : 'Sandbox analysis of suspicious files',
        isGerman ? 'Automated Incident Response' : 'Automated incident response'
      ],
      successRate: '99.8%'
    },
    {
      threat: isGerman ? 'Data Breaches' : 'Data Breaches',
      description: isGerman ? 'Prävention von Datendiebstahl und unbefugtem Zugriff' : 'Prevention of data theft and unauthorized access',
      protection: [
        isGerman ? 'Data Loss Prevention (DLP)' : 'Data Loss Prevention (DLP)',
        isGerman ? 'Datenklassifizierung und -markierung' : 'Data classification and labeling',
        isGerman ? 'Verschlüsselung sensibler Daten' : 'Encryption of sensitive data',
        isGerman ? 'Zugriffsprotokollierung' : 'Access logging'
      ],
      successRate: '100%'
    },
    {
      threat: isGerman ? 'Compliance-Verstöße' : 'Compliance Violations',
      description: isGerman ? 'Automatische Compliance-Überwachung und -Berichterstattung' : 'Automated compliance monitoring and reporting',
      protection: [
        isGerman ? 'Continuous Compliance Monitoring' : 'Continuous compliance monitoring',
        isGerman ? 'Automated Policy Enforcement' : 'Automated policy enforcement',
        isGerman ? 'Audit Trail Management' : 'Audit trail management',
        isGerman ? 'Regulatory Reporting' : 'Regulatory reporting'
      ],
      successRate: '100%'
    }
  ]

  const securityMetrics = [
    {
      category: isGerman ? 'Verfügbarkeit' : 'Availability',
      metrics: [
        { name: 'Uptime', value: '99.99%', icon: Clock },
        { name: 'RTO', value: '< 4h', icon: Zap },
        { name: 'RPO', value: '< 1h', icon: HardDrive }
      ]
    },
    {
      category: isGerman ? 'Performance' : 'Performance',
      metrics: [
        { name: isGerman ? 'Antwortzeit' : 'Response Time', value: '< 200ms', icon: Activity },
        { name: isGerman ? 'Durchsatz' : 'Throughput', value: '50K req/s', icon: Cpu },
        { name: isGerman ? 'Latenz' : 'Latency', value: '< 50ms', icon: Wifi }
      ]
    },
    {
      category: isGerman ? 'Sicherheit' : 'Security',
      metrics: [
        { name: isGerman ? 'Threat Detection' : 'Threat Detection', value: '99.9%', icon: Shield },
        { name: isGerman ? 'False Positives' : 'False Positives', value: '< 0.1%', icon: Eye },
        { name: isGerman ? 'Incident Response' : 'Incident Response', value: '< 15min', icon: AlertTriangle }
      ]
    }
  ]

  const auditCompliance = [
    {
      standard: 'ISO 27001:2022',
      scope: isGerman ? 'Informationssicherheits-Managementsystem' : 'Information Security Management System',
      status: 'certified',
      validUntil: '2025-12-31',
      auditor: 'SGS Switzerland'
    },
    {
      standard: 'SOC 2 Type II',
      scope: isGerman ? 'Security, Availability, Processing Integrity' : 'Security, Availability, Processing Integrity',
      status: 'certified',
      validUntil: '2025-06-30',
      auditor: 'KPMG Switzerland'
    },
    {
      standard: 'Swiss Cloud',
      scope: isGerman ? 'Cloud Service Provider Certification' : 'Cloud Service Provider Certification',
      status: 'certified',
      validUntil: '2025-12-31',
      auditor: 'Swiss Cloud Alliance'
    },
    {
      standard: 'FADP Compliance',
      scope: isGerman ? 'Schweizer Datenschutzgesetz' : 'Swiss Federal Act on Data Protection',
      status: 'verified',
      validUntil: '2025-12-31',
      auditor: 'Swiss DPA Recognized Auditor'
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
                  <Shield className="w-12 h-12 text-green-500" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Enterprise Security' : 'Enterprise Security'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <Lock className="w-12 h-12 text-primary" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🛡️ Enterprise-Grade Sicherheit mit Swiss-Quality Standards. Mehrstufiger Schutz, kontinuierliche Überwachung und vollständige Compliance.'
                  : '🛡️ Enterprise-grade security with Swiss-quality standards. Multi-layered protection, continuous monitoring, and complete compliance.'}
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
                  {isGerman ? 'ISO 27001 Zertifiziert • SOC 2 Type II • Swiss Hosted • 99.99% Uptime' : 'ISO 27001 Certified • SOC 2 Type II • Swiss Hosted • 99.99% Uptime'}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Security Layers */}
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
                {isGerman ? 'Mehrstufige Sicherheit' : 'Multi-Layered Security'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Umfassender Schutz auf allen Ebenen der IT-Infrastruktur'
                  : 'Comprehensive protection across all levels of IT infrastructure'
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
              {securityLayers.map((layer, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <div className="flex items-start space-x-6">
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-r from-green-500 to-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ duration: 0.3 }}
                      >
                        <layer.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            {layer.layer}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                            {layer.certification}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                          {layer.description}
                        </p>

                        <ul className="space-y-2">
                          {layer.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Threat Protection */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {isGerman ? 'Bedrohungsschutz' : 'Threat Protection'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Proaktiver Schutz vor modernen Cyber-Bedrohungen'
                  : 'Proactive protection against modern cyber threats'
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
              {threatProtection.map((threat, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full text-center" hover={true}>
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-primary-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {threat.threat}
                    </h3>
                    
                    <p className="text-gray-600 mb-6">
                      {threat.description}
                    </p>

                    <ul className="space-y-3 mb-6 text-left">
                      {threat.protection.map((protection, protectionIndex) => (
                        <li key={protectionIndex} className="flex items-start space-x-3">
                          <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{protection}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-secondary bg-clip-text text-transparent mb-1">
                        {threat.successRate}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {isGerman ? 'Erkennungsrate' : 'Detection Rate'}
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Security Metrics */}
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
                {isGerman ? 'Sicherheits-Metriken' : 'Security Metrics'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Messbare Sicherheits- und Performance-Kennzahlen'
                  : 'Measurable security and performance indicators'
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
              {securityMetrics.map((category, categoryIndex) => (
                <motion.div key={categoryIndex} variants={staggerItem}>
                  <AnimatedCard className="p-8 h-full" hover={true}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                      {category.category}
                    </h3>
                    
                    <div className="space-y-6">
                      {category.metrics.map((metric, metricIndex) => (
                        <motion.div 
                          key={metricIndex}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          whileHover={{ scale: 1.02, backgroundColor: '#f0f9ff' }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className="w-8 h-8 bg-gradient-to-r from-green-500 to-secondary rounded-full flex items-center justify-center"
                              whileHover={{ scale: 1.05 }}
                            >
                              <metric.icon className="w-4 h-4 text-white" />
                            </motion.div>
                            <span className="font-medium text-gray-700">{metric.name}</span>
                          </div>
                          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-secondary bg-clip-text text-transparent">
                            {metric.value}
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

        {/* Audit & Compliance */}
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
                {isGerman ? 'Audit & Compliance' : 'Audit & Compliance'}
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                {isGerman 
                  ? 'Unabhängige Zertifizierungen und kontinuierliche Compliance-Überwachung'
                  : 'Independent certifications and continuous compliance monitoring'
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
              {auditCompliance.map((audit, index) => (
                <motion.div 
                  key={index}
                  variants={staggerItem}
                  className="mb-6"
                >
                  <AnimatedCard className="p-8 bg-gray-800 border-gray-700" hover={true}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-2xl font-bold">{audit.standard}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            audit.status === 'certified' 
                              ? 'bg-green-600 text-white'
                              : 'bg-primary text-white'
                          }`}>
                            {audit.status === 'certified' 
                              ? (isGerman ? 'Zertifiziert' : 'Certified')
                              : (isGerman ? 'Verifiziert' : 'Verified')
                            }
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-3">
                          {audit.scope}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span>
                            <strong>{isGerman ? 'Auditor:' : 'Auditor:'}</strong> {audit.auditor}
                          </span>
                          <span>
                            <strong>{isGerman ? 'Gültig bis:' : 'Valid until:'}</strong> {audit.validUntil}
                          </span>
                        </div>
                      </div>

                      <motion.div 
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-green-600 to-secondary relative overflow-hidden"
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
                {isGerman ? 'Sicherheit nach Swiss Standards?' : 'Security by Swiss standards?'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Vertrauen Sie auf Enterprise-Grade Sicherheit mit Schweizer Qualitätsstandards und kontinuierlicher Compliance-Überwachung.'
                  : 'Trust in enterprise-grade security with Swiss quality standards and continuous compliance monitoring.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100 border-none shadow-lg"
                  icon={<Shield className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Sicherheits-Demo' : 'Security Demo'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-green-600 backdrop-blur-sm"
                  icon={<FileCheck className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Security Assessment' : 'Security Assessment'}
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

export default SecurityPage