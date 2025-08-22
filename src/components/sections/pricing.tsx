'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Star, Users, Building, Crown, Zap, Shield, ArrowRight, Calculator, TrendingUp, Clock, DollarSign, BarChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { cn, formatCurrency, calculateROI } from '@/lib/utils'

interface PricingProps {
  locale: string
}

const Pricing: React.FC<PricingProps> = ({ locale }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual')
  const [showROICalculator, setShowROICalculator] = useState(false)
  const [employees, setEmployees] = useState(100)
  const [documentsPerMonth, setDocumentsPerMonth] = useState(1000)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [animatedSavings, setAnimatedSavings] = useState(0)
  
  const isGerman = locale === 'de'

  const plans = [
    {
      id: 'starter',
      name: isGerman ? 'Starter' : 'Starter',
      description: isGerman ? 'Perfekt für kleinere Teams und Pilotprojekte' : 'Perfect for smaller teams and pilot projects',
      icon: Zap,
      price: {
        annual: 15000,
        monthly: 1500
      },
      popular: false,
      features: {
        users: isGerman ? '10 Benutzer' : '10 users',
        documents: isGerman ? '1,000 Dokumente' : '1,000 documents',
        support: isGerman ? 'E-Mail Support' : 'Email support',
        sla: isGerman ? 'Standard SLAs' : 'Standard SLAs',
        included: [
          isGerman ? 'Swiss Data Sovereignty' : 'Swiss data sovereignty',
          isGerman ? 'FADP/GDPR Compliance' : 'FADP/GDPR compliance',
          isGerman ? 'Zero-Hallucination AI' : 'Zero-hallucination AI',
          isGerman ? 'Mehrsprachiger Support' : 'Multilingual support',
          isGerman ? 'Basis-Integrationen' : 'Basic integrations',
          isGerman ? 'Standard-Sicherheit' : 'Standard security'
        ],
        notIncluded: [
          isGerman ? 'White-Label Lösung' : 'White-label solution',
          isGerman ? 'Custom Integrationen' : 'Custom integrations',
          isGerman ? 'Dedicated Account Manager' : 'Dedicated account manager'
        ]
      },
      gradient: 'from-primary to-secondary'
    },
    {
      id: 'professional',
      name: isGerman ? 'Professional' : 'Professional',
      description: isGerman ? 'Ideal für mittlere Unternehmen mit erweiterten Anforderungen' : 'Ideal for mid-size companies with advanced requirements',
      icon: Building,
      price: {
        annual: 45000,
        monthly: 4500
      },
      popular: true,
      features: {
        users: isGerman ? '100 Benutzer' : '100 users',
        documents: isGerman ? '10,000 Dokumente' : '10,000 documents', 
        support: isGerman ? 'Telefon + E-Mail Support' : 'Phone + email support',
        sla: isGerman ? 'Priority SLAs' : 'Priority SLAs',
        included: [
          isGerman ? 'Alle Starter-Features' : 'All starter features',
          isGerman ? 'Priority Support' : 'Priority support',
          isGerman ? 'Erweiterte Integrationen' : 'Advanced integrations',
          isGerman ? 'Custom Workflows' : 'Custom workflows',
          isGerman ? 'Erweiterte Sicherheit' : 'Enhanced security',
          isGerman ? 'Backup & Recovery' : 'Backup & recovery',
          isGerman ? 'Performance Monitoring' : 'Performance monitoring',
          isGerman ? 'API Zugang' : 'API access'
        ],
        notIncluded: [
          isGerman ? 'White-Label Lösung' : 'White-label solution',
          isGerman ? 'Dedicated Account Manager' : 'Dedicated account manager'
        ]
      },
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'enterprise',
      name: isGerman ? 'Enterprise' : 'Enterprise',
      description: isGerman ? 'Vollumfängliche Lösung für Grossunternehmen' : 'Comprehensive solution for large enterprises',
      icon: Crown,
      price: {
        annual: 120000,
        monthly: 12000
      },
      popular: false,
      features: {
        users: isGerman ? 'Unbegrenzt' : 'Unlimited',
        documents: isGerman ? 'Unbegrenzt' : 'Unlimited',
        support: isGerman ? 'Dedicated Account Manager' : 'Dedicated account manager',
        sla: isGerman ? 'Enterprise SLAs (99.9%)' : 'Enterprise SLAs (99.9%)',
        included: [
          isGerman ? 'Alle Professional-Features' : 'All professional features',
          isGerman ? 'White-Label Lösung' : 'White-label solution',
          isGerman ? 'Custom Integrationen' : 'Custom integrations',
          isGerman ? 'Dedicated Account Manager' : 'Dedicated account manager',
          isGerman ? 'On-Premises Deployment' : 'On-premises deployment',
          isGerman ? 'Custom Training' : 'Custom training',
          isGerman ? '24/7 Priority Support' : '24/7 priority support',
          isGerman ? 'Custom SLAs' : 'Custom SLAs'
        ],
        notIncluded: []
      },
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'custom',
      name: isGerman ? 'Custom' : 'Custom',
      description: isGerman ? 'Massgeschneiderte Lösung für spezielle Anforderungen' : 'Tailored solution for special requirements',
      icon: Users,
      price: {
        annual: null,
        monthly: null
      },
      popular: false,
      features: {
        users: isGerman ? 'Nach Vereinbarung' : 'As agreed',
        documents: isGerman ? 'Nach Vereinbarung' : 'As agreed',
        support: isGerman ? 'Dedicated Team' : 'Dedicated team',
        sla: isGerman ? 'Custom SLAs' : 'Custom SLAs',
        included: [
          isGerman ? 'Alle Enterprise-Features' : 'All enterprise features',
          isGerman ? 'Volume Discounts' : 'Volume discounts',
          isGerman ? 'Custom Features' : 'Custom features',
          isGerman ? 'Multi-Year Contracts' : 'Multi-year contracts',
          isGerman ? 'Training & Consulting' : 'Training & consulting',
          isGerman ? 'Priority Development' : 'Priority development'
        ],
        notIncluded: []
      },
      gradient: 'from-primary-500 to-primary-600'
    }
  ]

  const allIncludedFeatures = [
    isGerman ? 'Swiss Data Sovereignty' : 'Swiss data sovereignty',
    isGerman ? 'FADP/GDPR Compliance' : 'FADP/GDPR compliance', 
    isGerman ? 'Zero-Hallucination AI' : 'Zero-hallucination AI',
    isGerman ? 'Enterprise Security' : 'Enterprise security',
    isGerman ? '99.9% Uptime SLA' : '99.9% uptime SLA',
    isGerman ? 'Swiss-based Support' : 'Swiss-based support',
    isGerman ? 'Regular Updates' : 'Regular updates',
    isGerman ? 'Mehrsprachig (DE/FR/IT/EN)' : 'Multilingual (DE/FR/IT/EN)'
  ]

  const competitorComparison = [
    {
      competitor: 'Microsoft Copilot',
      price: 180000,
      issues: isGerman ? 'Compliance Probleme' : 'Compliance issues'
    },
    {
      competitor: 'Google Vertex AI',
      price: 250000,
      issues: isGerman ? 'Komplexe Implementierung' : 'Complex implementation'
    },
    {
      competitor: 'Amazon Bedrock',
      price: 200000,
      issues: isGerman ? 'Datensouveränität Risiken' : 'Data sovereignty risks'
    }
  ]

  const roiResults = calculateROI(employees, documentsPerMonth)

  // Animate savings counter
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSavings(roiResults.annualSavings)
    }, 500)
    return () => clearTimeout(timer)
  }, [roiResults.annualSavings])

  return (
    <motion.section 
      className="py-20 bg-gradient-to-br from-gray-50 to-primary-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          variants={fadeInScale}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="inline-flex items-center space-x-2 bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
              <Calculator className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">
              {isGerman ? 'Transparente Preise' : 'Transparent Pricing'}
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {isGerman ? 'Preise & Pakete' : 'Pricing & Plans'}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {isGerman 
              ? 'Faire, transparente Preise ohne versteckte Kosten. Alle Pakete beinhalten Swiss Data Sovereignty und Compliance.'
              : 'Fair, transparent pricing with no hidden costs. All plans include Swiss data sovereignty and compliance.'}
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            className="flex items-center justify-center space-x-4 mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500'
            )}>
              {isGerman ? 'Monatlich' : 'Monthly'}
            </span>
            <motion.button
              onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
              className="relative w-14 h-7 bg-gray-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{
                backgroundColor: billingCycle === 'annual' ? '#DC2626' : '#D1D5DB'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="absolute w-5 h-5 bg-white rounded-full top-1 shadow-lg"
                animate={{
                  x: billingCycle === 'annual' ? 28 : 4
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </motion.button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingCycle === 'annual' ? 'text-blue-600' : 'text-gray-500'
            )}>
              {isGerman ? 'Jährlich' : 'Annual'}
              <AnimatePresence>
                {billingCycle === 'annual' && (
                  <motion.span 
                    className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isGerman ? '2 Monate gratis' : '2 months free'}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={staggerItem}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard 
                className={cn(
                  "relative overflow-hidden cursor-pointer",
                  plan.popular && "ring-2 ring-primary-500",
                  selectedPlan === plan.id && "ring-2 ring-blue-500 bg-blue-50"
                )}
                hover={true}
                gradient={plan.popular}
                onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              >
                {/* Popular badge */}
                <AnimatePresence>
                  {plan.popular && (
                    <motion.div 
                      className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center py-2 text-sm font-medium z-10"
                      initial={{ y: -40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⭐ {isGerman ? 'Beliebtestes Paket' : 'Most Popular'}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Gradient accent */}
                <motion.div 
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.gradient}`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                />
                
                <CardHeader className={cn("pb-4", plan.popular && "pt-12")}>
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-lg flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <plan.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {plan.name}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-sm text-gray-600 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                  >
                    {plan.description}
                  </motion.p>

                  {/* Price */}
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                  >
                    {plan.price.annual ? (
                      <div>
                        <div className="flex items-baseline">
                          <motion.span 
                            className="text-3xl font-bold text-gray-900"
                            key={`${plan.id}-${billingCycle}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {formatCurrency(plan.price[billingCycle]!)}
                          </motion.span>
                          <span className="text-gray-600 ml-2">
                            /{isGerman ? (billingCycle === 'annual' ? 'Jahr' : 'Monat') : (billingCycle === 'annual' ? 'year' : 'month')}
                          </span>
                        </div>
                        <AnimatePresence>
                          {billingCycle === 'monthly' && (
                            <motion.div 
                              className="text-sm text-gray-500 mt-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {formatCurrency(plan.price.annual)} {isGerman ? 'jährlich (günstiger)' : 'annually (cheaper)'}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div 
                        className="text-2xl font-bold text-gray-900"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isGerman ? 'Auf Anfrage' : 'Custom Quote'}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Key specs */}
                  <motion.div 
                    className="space-y-2 text-sm"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    <motion.div 
                      className="flex items-center space-x-2"
                      variants={staggerItem}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <Users className="w-4 h-4 text-blue-500" />
                      </motion.div>
                      <span>{plan.features.users}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-2"
                      variants={staggerItem}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <Shield className="w-4 h-4 text-blue-500" />
                      </motion.div>
                      <span>{plan.features.documents}</span>
                    </motion.div>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="py-4">
                  <motion.div 
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {plan.features.included.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex} 
                        className="flex items-center space-x-2 text-sm"
                        variants={staggerItem}
                        whileHover={{ x: 5, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div whileHover={{ scale: 1.2, rotate: 360 }}>
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        </motion.div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                    
                    {plan.features.notIncluded.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex} 
                        className="flex items-center space-x-2 text-sm opacity-50"
                        variants={staggerItem}
                        whileHover={{ x: 5 }}
                      >
                        <motion.div whileHover={{ scale: 1.2 }}>
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </motion.div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <motion.div
                    className="w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatedButton
                      variant={plan.popular ? "gradient" : "secondary"}
                      size="lg"
                      className="w-full"
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                      onClick={() => window.location.href = plan.id === 'custom' ? '/contact' : `/contact?plan=${plan.id}`}
                    >
                      {plan.id === 'custom' 
                        ? (isGerman ? 'Kontakt' : 'Contact')
                        : (isGerman ? 'Bestellen' : 'Get Started')
                      }
                    </AnimatedButton>
                  </motion.div>
                </CardFooter>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>

        {/* All plans include */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <AnimatedCard className="mb-16 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" hover={true}>
            <CardHeader className="text-center">
              <motion.h3 
                className="text-2xl font-bold text-green-800 mb-2"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {isGerman ? 'Alle Pakete enthalten' : 'All Plans Include'}
              </motion.h3>
              <motion.p 
                className="text-green-600"
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {isGerman ? 'Keine versteckten Kosten - alles inklusive' : 'No hidden costs - everything included'}
              </motion.p>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {allIncludedFeatures.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm border border-green-100"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span className="font-medium text-green-800">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* Enhanced ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <AnimatedCard className="mb-16 bg-gradient-to-br from-primary-50 to-gray-50 border-2 border-primary-200" hover={true}>
            <CardHeader className="text-center">
              <motion.div
                className="flex items-center justify-center space-x-3 mb-4"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Calculator className="w-6 h-6 text-white" />
                </motion.div>
                <motion.h3 
                  className="text-3xl font-bold text-gray-900"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {isGerman ? 'Interaktiver ROI Rechner' : 'Interactive ROI Calculator'}
                </motion.h3>
              </motion.div>
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman ? 'Berechnen Sie Ihre Einsparungen und ROI mit Temora AI in Echtzeit' : 'Calculate your savings and ROI with Temora AI in real-time'}
              </motion.p>
            </CardHeader>
            <CardContent>
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Input Controls */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                >
                  <motion.div variants={staggerItem}>
                    <motion.label 
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3"
                      whileHover={{ x: 5 }}
                    >
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>{isGerman ? 'Anzahl Mitarbeiter' : 'Number of Employees'}</span>
                    </motion.label>
                    <motion.input
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={employees}
                      onChange={(e) => setEmployees(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10</span>
                      <motion.span 
                        className="font-bold text-blue-600 text-lg"
                        key={employees}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {employees}
                      </motion.span>
                      <span>2000</span>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={staggerItem}>
                    <motion.label 
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3"
                      whileHover={{ x: 5 }}
                    >
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span>{isGerman ? 'Dokumente pro Monat' : 'Documents per Month'}</span>
                    </motion.label>
                    <motion.input
                      type="range"
                      min="100"
                      max="50000"
                      step="100"
                      value={documentsPerMonth}
                      onChange={(e) => setDocumentsPerMonth(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>100</span>
                      <motion.span 
                        className="font-bold text-purple-600 text-lg"
                        key={documentsPerMonth}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {documentsPerMonth.toLocaleString()}
                      </motion.span>
                      <span>50K</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Results Grid */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                >
                  <motion.div 
                    className="text-center"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </motion.div>
                    <motion.div 
                      className="text-3xl font-bold text-green-600 mb-1"
                      key={roiResults.annualSavings}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {formatCurrency(roiResults.annualSavings)}
                    </motion.div>
                    <div className="text-sm text-green-800 font-medium">
                      {isGerman ? 'Jährliche Einsparung' : 'Annual Savings'}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <motion.div 
                      className="text-3xl font-bold text-blue-600 mb-1"
                      key={roiResults.timesSaved}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {roiResults.timesSaved.toLocaleString()} h
                    </motion.div>
                    <div className="text-sm text-blue-800 font-medium">
                      {isGerman ? 'Zeit gespart/Jahr' : 'Time Saved/Year'}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </motion.div>
                    <motion.div 
                      className="text-3xl font-bold text-purple-600 mb-1"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      3.2x
                    </motion.div>
                    <div className="text-sm text-purple-800 font-medium">
                      {isGerman ? 'ROI im 1. Jahr' : 'ROI in 1st Year'}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart className="w-6 h-6 text-orange-600" />
                    </motion.div>
                    <motion.div 
                      className="text-3xl font-bold text-orange-600 mb-1"
                      key={Math.round(roiResults.annualSavings / 12)}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {formatCurrency(Math.round(roiResults.annualSavings / 12))}
                    </motion.div>
                    <div className="text-sm text-orange-800 font-medium">
                      {isGerman ? 'Monatliche Ersparnis' : 'Monthly Savings'}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Action Button */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <AnimatedButton
                    variant="gradient"
                    size="lg"
                    className="px-8 py-4 text-lg"
                    icon={<Calculator className="w-6 h-6" />}
                    onClick={() => window.location.href = '/contact'}
                  >
                    {isGerman ? 'Detaillierte ROI-Analyse anfordern' : 'Request Detailed ROI Analysis'}
                  </AnimatedButton>
                </motion.div>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* Competitor Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <AnimatedCard className="mb-16" hover={true}>
            <CardHeader className="text-center">
              <motion.h3 
                className="text-3xl font-bold text-gray-900 mb-2"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {isGerman ? 'Kostenvergleich' : 'Cost Comparison'}
              </motion.h3>
              <motion.p 
                className="text-gray-600"
                initial={{ y: 10, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {isGerman ? 'Temora AI vs. internationale Konkurrenz' : 'Temora AI vs. international competitors'}
              </motion.p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <motion.table 
                  className="w-full"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <thead>
                    <motion.tr 
                      className="border-b-2 border-gray-200"
                      initial={{ y: -20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <th className="text-left py-4 font-bold text-gray-900">
                        {isGerman ? 'Anbieter' : 'Provider'}
                      </th>
                      <th className="text-right py-4 font-bold text-gray-900">
                        {isGerman ? 'Preis/Jahr' : 'Price/Year'}
                      </th>
                      <th className="text-left py-4 font-bold text-gray-900">
                        {isGerman ? 'Hauptproblem' : 'Main Issue'}
                      </th>
                    </motion.tr>
                  </thead>
                  <tbody>
                    {competitorComparison.map((comp, index) => (
                      <motion.tr 
                        key={index} 
                        className="border-b border-gray-100 hover:bg-gray-50"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ backgroundColor: 'rgba(239, 246, 255, 0.5)', x: 5 }}
                      >
                        <td className="py-4 font-medium">{comp.competitor}</td>
                        <td className="py-4 text-right font-bold text-primary-600">
                          {formatCurrency(comp.price)}
                        </td>
                        <td className="py-4 text-primary-600">{comp.issues}</td>
                      </motion.tr>
                    ))}
                    <motion.tr 
                      className="border-b-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                      initial={{ y: 20, opacity: 0, scale: 0.95 }}
                      whileInView={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <td className="py-4 font-bold text-green-800 text-lg">
                        <motion.span
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Temora AI Professional
                        </motion.span>
                      </td>
                      <td className="py-4 text-right font-bold text-green-600 text-xl">
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        >
                          {formatCurrency(45000)}
                        </motion.span>
                      </td>
                      <td className="py-4 text-green-600 font-semibold">
                        <motion.span
                          className="flex items-center space-x-2"
                          whileHover={{ x: 5 }}
                        >
                          <motion.span
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ✅
                          </motion.span>
                          <span>{isGerman ? 'Alle Probleme gelöst' : 'All issues solved'}</span>
                        </motion.span>
                      </td>
                    </motion.tr>
                  </tbody>
                </motion.table>
              </div>
            </CardContent>
          </AnimatedCard>
        </motion.div>

        {/* ROI Guarantee */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <AnimatedCard className="bg-gradient-to-r from-primary to-secondary text-white relative overflow-hidden" hover={true}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 3 }}
              />
            </div>
            
            <CardHeader className="text-center relative z-10">
              <motion.h3 
                className="text-4xl font-bold mb-2"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  transition: { duration: 3, repeat: Infinity }
                }}
              >
                {isGerman ? 'ROI Garantie' : 'ROI Guarantee'}
              </motion.h3>
              <motion.p 
                className="text-white/90 text-xl"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {isGerman 
                  ? 'Mindestens 3:1 ROI im ersten Jahr oder Geld zurück'
                  : 'Minimum 3:1 ROI in the first year or money back'}
              </motion.p>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <motion.div 
                className="flex items-center justify-center space-x-8 mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="text-5xl font-bold mb-1"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    CHF 200K - 2M
                  </motion.div>
                  <div className="text-white/80 text-lg">
                    {isGerman ? 'Typische Kundeneinsparungen' : 'Typical customer savings'}
                  </div>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatedButton
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg border-none shadow-lg"
                  icon={<ArrowRight className="w-6 h-6" />}
                  iconPosition="right"
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Kostenlose ROI-Analyse' : 'Free ROI Analysis'}
                </AnimatedButton>
              </motion.div>
            </CardContent>
          </AnimatedCard>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Pricing