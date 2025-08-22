'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Building, 
  ChevronRight, 
  Calculator, 
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn, trackEvent } from '@/lib/utils'
import { SwissFlag, SwissShield, SwissAlps } from './swiss-visuals'

interface PremiumPricingProps {
  locale: string
}

interface ROICalculatorData {
  documents: number
  queries: number
  users: number
  hoursPerWeek: number
  hourlyRate: number
  accuracyImprovement: number
}

const PremiumPricing: React.FC<PremiumPricingProps> = ({ locale }) => {
  const [showROI, setShowROI] = useState(false)
  const [roiData, setROIData] = useState<ROICalculatorData>({
    documents: 10000,
    queries: 1000,
    users: 50,
    hoursPerWeek: 20,
    hourlyRate: 120,
    accuracyImprovement: 85
  })
  const [selectedPlan, setSelectedPlan] = useState<string>('enterprise')
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  const isGerman = locale === 'de'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const calculateROI = () => {
    const timeReduction = (roiData.accuracyImprovement / 100) * roiData.hoursPerWeek
    const weeklySavings = timeReduction * roiData.hourlyRate * roiData.users
    const monthlySavings = weeklySavings * 4.33
    const yearlySavings = monthlySavings * 12

    const planCost = selectedPlan === 'enterprise' ? 4999 : 
                    selectedPlan === 'professional' ? 1999 : 899
    const yearlyInvestment = planCost * 12

    return {
      weeklySavings,
      monthlySavings,
      yearlySavings,
      yearlyInvestment,
      roi: ((yearlySavings - yearlyInvestment) / yearlyInvestment) * 100,
      paybackMonths: yearlyInvestment / monthlySavings
    }
  }

  const roi = calculateROI()

  const pricingPlans = [
    {
      id: 'starter',
      name: isGerman ? 'Beta Access' : 'Beta Access',
      price: 'FREE',
      originalPrice: '499',
      discount: '100%',
      period: isGerman ? '/3 Monate' : '/3 months',
      description: isGerman 
        ? 'Kostenloser Beta-Zugang für frühe Adopters' 
        : 'Free beta access for early adopters',
      popular: true,
      cta: isGerman ? 'Beta beitreten' : 'Join Beta',
      features: [
        isGerman ? 'Bis zu 1.000 Dokumente' : 'Up to 1,000 documents',
        isGerman ? 'Bis zu 500 Anfragen/Tag' : 'Up to 500 queries/day', 
        isGerman ? '5 Benutzer inklusiv' : '5 users included',
        isGerman ? 'Standard Swiss Hosting' : 'Standard Swiss hosting',
        isGerman ? 'E-Mail Support' : 'Email support',
        isGerman ? 'FADP/GDPR konform' : 'FADP/GDPR compliant',
        isGerman ? 'API Zugang' : 'API access'
      ],
      color: 'from-gray-500 to-gray-700',
      icon: Shield,
      badge: null
    },
    {
      id: 'professional',
      name: isGerman ? 'Pilot Program' : 'Pilot Program',
      price: '299',
      originalPrice: '999',
      discount: '70%',
      period: isGerman ? '/Monat' : '/month',
      description: isGerman 
        ? 'Erweiterte Funktionen für Pilotprojekte' 
        : 'Advanced features for pilot projects',
      popular: false,
      cta: isGerman ? 'Pilot starten' : 'Start Pilot',
      features: [
        isGerman ? 'Bis zu 50.000 Dokumente' : 'Up to 50,000 documents',
        isGerman ? 'Unbegrenzte Anfragen' : 'Unlimited queries',
        isGerman ? '25 Benutzer inklusiv' : '25 users included',
        isGerman ? 'Premium Swiss Hosting' : 'Premium Swiss hosting',
        isGerman ? '24/7 Priority Support' : '24/7 priority support',
        isGerman ? 'FINMA Ready' : 'FINMA ready',
        isGerman ? 'Advanced Analytics' : 'Advanced analytics',
        isGerman ? 'Custom Integrationen' : 'Custom integrations',
        isGerman ? 'SSO Integration' : 'SSO integration'
      ],
      color: 'from-blue-500 to-blue-700',
      icon: Users,
      badge: isGerman ? 'Beliebt' : 'Popular'
    },
    {
      id: 'enterprise',
      name: isGerman ? 'Early Partner' : 'Early Partner',
      price: '999',
      originalPrice: '4999',
      discount: '80%',
      period: isGerman ? '/Monat' : '/month',
      description: isGerman 
        ? 'Exklusiver Zugang für strategische Partner' 
        : 'Exclusive access for strategic partners',
      popular: false,
      cta: isGerman ? 'Partner werden' : 'Become Partner',
      features: [
        isGerman ? 'Unbegrenzte Dokumente' : 'Unlimited documents',
        isGerman ? 'Unbegrenzte Anfragen' : 'Unlimited queries',
        isGerman ? 'Unbegrenzte Benutzer' : 'Unlimited users',
        isGerman ? 'Dedicated Swiss Cloud' : 'Dedicated Swiss cloud',
        isGerman ? 'White-Glove Onboarding' : 'White-glove onboarding',
        isGerman ? 'Bank-Grade Security' : 'Bank-grade security',
        isGerman ? 'Custom AI Training' : 'Custom AI training',
        isGerman ? 'Multi-Tenant Architecture' : 'Multi-tenant architecture',
        isGerman ? '99.99% SLA Garantie' : '99.99% SLA guarantee',
        isGerman ? 'Dedicated Success Manager' : 'Dedicated success manager'
      ],
      color: 'from-primary-500 to-primary-700',
      icon: Crown,
      badge: isGerman ? 'Premium' : 'Premium'
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    trackEvent('pricing_plan_selected', { plan: planId })
  }

  const handleROIToggle = () => {
    setShowROI(!showROI)
    trackEvent('roi_calculator_toggled', { show: !showROI })
  }

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1B365D 0%, #0066CC 50%, #FF0000 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 20s ease infinite'
      }}
    >
      {/* Swiss Alps Background */}
      <div className="absolute inset-0 opacity-10">
        <SwissAlps />
      </div>

      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="swiss-pattern opacity-20" />
        <div className="absolute top-20 left-10">
          <LuxuryGradientOrb size={400} colors={['#FF0000', '#0066CC', '#1B365D']} />
        </div>
        <div className="absolute bottom-20 right-10">
          <LuxuryGradientOrb size={300} colors={['#0066CC', '#FF0000', '#FFD700']} />
        </div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={cn(
            "flex items-center justify-center space-x-3 mb-6 transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <SwissFlag className="w-8 h-8" />
            <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
            <h2 className="text-5xl lg:text-7xl font-bold luxury-gradient-text">
              {isGerman ? 'Swiss Pricing Excellence' : 'Swiss Pricing Excellence'}
            </h2>
            <Sparkles className="w-8 h-8 text-blue-300 animate-pulse" />
            <SwissShield className="w-8 h-8" glowing />
          </div>
          
          <p className={cn(
            "text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {isGerman 
              ? 'Transparent, fair und Swiss-Made. Keine versteckten Kosten, nur erstklassige AI-Technologie.'
              : 'Transparent, fair, and Swiss-made. No hidden costs, just world-class AI technology.'}
          </p>

          {/* Premium Stats */}
          <div className={cn(
            "flex justify-center space-x-8 mb-12 transition-all duration-1000 delay-400",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {[
              { icon: Star, value: '4.9', label: isGerman ? 'Bewertung' : 'Rating' },
              { icon: Users, value: '500+', label: isGerman ? 'Kunden' : 'Customers' },
              { icon: Award, value: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index} className="text-center glass-morphism px-6 py-4 rounded-xl hover-lift">
                <stat.icon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className={cn(
          "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-600",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                "relative luxury-card rounded-3xl p-8 transition-all duration-500 hover-lift cursor-pointer group",
                plan.popular && "ring-4 ring-yellow-400/30 transform scale-105",
                selectedPlan === plan.id && "ring-2 ring-white/50",
                hoveredPlan === plan.id && "transform scale-102"
              )}
              onClick={() => handlePlanSelect(plan.id)}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2 animate-pulse">
                    <Star className="w-4 h-4 mr-2" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Discount Badge */}
              <div className="absolute -top-3 -right-3 bg-primary-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm animate-bounce">
                -{plan.discount}
              </div>

              <CardHeader className="pb-6">
                {/* Plan Icon */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
                  `bg-gradient-to-br ${plan.color}`
                )}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>

                <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </CardTitle>
                
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      CHF {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-gray-400 line-through text-lg mr-3">
                      CHF {plan.originalPrice}
                    </span>
                    <Badge variant="destructive" className="animate-pulse">
                      {isGerman ? 'Sparen Sie' : 'Save'} CHF {parseInt(plan.originalPrice) - parseInt(plan.price)}
                    </Badge>
                  </div>
                </div>

                <Button 
                  className={cn(
                    "w-full py-3 text-lg font-semibold transition-all duration-300 hover-glow micro-bounce",
                    plan.popular 
                      ? "btn-premium"
                      : "glass-morphism border-2 border-white/30 text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    trackEvent('pricing_cta_clicked', { plan: plan.id })
                  }}
                  asChild
                >
                  <Link href="/contact">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* ROI Calculator */}
        <div className={cn(
          "mb-16 transition-all duration-1000 delay-800",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <Card className="luxury-card border-2 border-white/20 p-8 backdrop-blur-3xl">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={handleROIToggle}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {isGerman ? 'ROI Rechner - Berechnen Sie Ihre Ersparnisse' : 'ROI Calculator - Calculate Your Savings'}
                  </h3>
                  <p className="text-gray-600">
                    {isGerman 
                      ? 'Sehen Sie, wie viel Zeit und Geld Sie mit Swiss AI sparen können'
                      : 'See how much time and money you can save with Swiss AI'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  {roi.roi > 0 ? '+' : ''}{Math.round(roi.roi)}% ROI
                </Badge>
                {showROI ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              </div>
            </div>

            {showROI && (
              <div className="mt-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calculator Inputs */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isGerman ? 'Anzahl Dokumente' : 'Number of Documents'}
                      </label>
                      <Slider
                        value={[roiData.documents]}
                        onValueChange={(value) => setROIData({...roiData, documents: value[0]})}
                        max={100000}
                        min={1000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>1K</span>
                        <span className="font-semibold">{roiData.documents.toLocaleString()}</span>
                        <span>100K</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isGerman ? 'Monatliche Anfragen' : 'Monthly Queries'}
                      </label>
                      <Slider
                        value={[roiData.queries]}
                        onValueChange={(value) => setROIData({...roiData, queries: value[0]})}
                        max={10000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>100</span>
                        <span className="font-semibold">{roiData.queries.toLocaleString()}</span>
                        <span>10K</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isGerman ? 'Anzahl Benutzer' : 'Number of Users'}
                      </label>
                      <Slider
                        value={[roiData.users]}
                        onValueChange={(value) => setROIData({...roiData, users: value[0]})}
                        max={500}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>5</span>
                        <span className="font-semibold">{roiData.users}</span>
                        <span>500</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isGerman ? 'Forschungsstunden/Woche gespart' : 'Research Hours/Week Saved'}
                      </label>
                      <Slider
                        value={[roiData.hoursPerWeek]}
                        onValueChange={(value) => setROIData({...roiData, hoursPerWeek: value[0]})}
                        max={40}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>1h</span>
                        <span className="font-semibold">{roiData.hoursPerWeek}h</span>
                        <span>40h</span>
                      </div>
                    </div>
                  </div>

                  {/* ROI Results */}
                  <div className="glass-morphism-dark rounded-2xl p-6">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                      {isGerman ? 'Ihre Ersparnisse' : 'Your Savings'}
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/80">{isGerman ? 'Wöchentlich' : 'Weekly'}</span>
                        <span className="text-2xl font-bold text-green-400">
                          CHF {Math.round(roi.weeklySavings).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/80">{isGerman ? 'Monatlich' : 'Monthly'}</span>
                        <span className="text-3xl font-bold text-green-400">
                          CHF {Math.round(roi.monthlySavings).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/80">{isGerman ? 'Jährlich' : 'Yearly'}</span>
                        <span className="text-4xl font-bold text-green-400">
                          CHF {Math.round(roi.yearlySavings).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 mt-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-white">{Math.round(roi.roi)}%</div>
                            <div className="text-sm text-white/70">ROI</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white">{Math.round(roi.paybackMonths)}</div>
                            <div className="text-sm text-white/70">
                              {isGerman ? 'Monate bis Break-even' : 'Months to Break-even'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Enterprise Features Showcase */}
        <div className={cn(
          "text-center mb-16 transition-all duration-1000 delay-1000",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
            <Shield className="w-8 h-8 mr-3 text-primary-400" />
            {isGerman ? 'Swiss Enterprise Features' : 'Swiss Enterprise Features'}
            <Crown className="w-8 h-8 ml-3 text-yellow-400 animate-pulse" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: isGerman ? 'Bank-Grade Security' : 'Bank-Grade Security',
                description: isGerman ? 'FINMA-konform, ISO 27001' : 'FINMA compliant, ISO 27001'
              },
              {
                icon: Zap,
                title: isGerman ? 'Lightning Fast' : 'Lightning Fast',
                description: isGerman ? '< 2s Antwortzeit' : '< 2s response time'
              },
              {
                icon: Clock,
                title: isGerman ? '24/7 Support' : '24/7 Support',
                description: isGerman ? 'Swiss Premium Support' : 'Swiss premium support'
              },
              {
                icon: Building,
                title: isGerman ? 'Swiss Hosting' : 'Swiss Hosting',
                description: isGerman ? '100% in der Schweiz' : '100% in Switzerland'
              }
            ].map((feature, index) => (
              <div key={index} className="glass-morphism rounded-xl p-6 hover-lift micro-bounce">
                <feature.icon className="w-8 h-8 text-white mx-auto mb-4" />
                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className={cn(
          "text-center transition-all duration-1000 delay-1200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="glass-morphism rounded-3xl p-12 max-w-4xl mx-auto">
            <SwissFlag className="w-12 h-12 mx-auto mb-6" />
            <h3 className="text-4xl font-bold text-white mb-4">
              {isGerman 
                ? 'Bereit für Swiss AI Excellence?' 
                : 'Ready for Swiss AI Excellence?'}
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {isGerman 
                ? 'Starten Sie noch heute und erleben Sie, was Swiss Engineering für Ihr Unternehmen tun kann.'
                : 'Start today and experience what Swiss engineering can do for your business.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="xl" 
                className="btn-premium text-lg px-12 py-4 hover-glow micro-bounce"
                asChild
              >
                <Link href="/contact">
                  <Crown className="w-6 h-6 mr-3" />
                  {isGerman ? 'Kostenlose Beratung' : 'Free Consultation'}
                  <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
                </Link>
              </Button>
              
              <Button 
                size="xl" 
                className="glass-morphism border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 text-lg px-12 py-4 hover-lift micro-bounce"
                asChild
              >
                <Link href="/demo">
                  <Zap className="w-6 h-6 mr-3" />
                  {isGerman ? 'Live Demo' : 'Live Demo'}
                  <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <p className="text-white/70 text-sm mt-6">
              {isGerman 
                ? '🚀 30-Tage Geld-zurück-Garantie • Swiss Made • FADP/GDPR Konform'
                : '🚀 30-day money-back guarantee • Swiss Made • FADP/GDPR Compliant'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Export utility function for ROI calculation
export const calculateBusinessROI = (params: ROICalculatorData) => {
  const timeReduction = (params.accuracyImprovement / 100) * params.hoursPerWeek
  const weeklySavings = timeReduction * params.hourlyRate * params.users
  const monthlySavings = weeklySavings * 4.33
  const yearlySavings = monthlySavings * 12
  
  return {
    weeklySavings,
    monthlySavings,
    yearlySavings,
    timeReduction
  }
}

// Luxury Gradient Orb component used in pricing
const LuxuryGradientOrb: React.FC<{ 
  size?: number
  colors?: string[]
  className?: string
  animated?: boolean
}> = ({ 
  size = 300, 
  colors = ['#FF0000', '#0066CC', '#FFD700'], 
  className,
  animated = true 
}) => {
  return (
    <div 
      className={cn("relative rounded-full blur-3xl opacity-30", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 0deg, ${colors.join(', ')})`,
        animation: animated ? 'gradient-shift 8s ease infinite, float 6s ease-in-out infinite' : 'none'
      }}
    />
  )
}

export default PremiumPricing