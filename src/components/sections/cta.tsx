'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { fadeInScale, staggerContainer, staggerItem } from '@/lib/animations'
import { 
  ArrowRight, 
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Play,
  Star,
  Shield,
  Zap,
  Award,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'

interface CTAProps {
  locale: string
}

const CTA: React.FC<CTAProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'
  const [animatedNumber, setAnimatedNumber] = useState(0)

  // Animated counter for enterprises
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedNumber(prev => {
        if (prev < 50) return prev + 1
        clearInterval(timer)
        return 50
      })
    }, 40)

    return () => clearInterval(timer)
  }, [])

  const benefits = [
    {
      icon: Shield,
      text: isGerman ? "100% Schweizer Datenschutz" : "100% Swiss Data Privacy",
      color: "text-red-500"
    },
    {
      icon: Zap,
      text: isGerman ? "< 2s Antwortzeit" : "< 2s Response Time",
      color: "text-blue-500"
    },
    {
      icon: Award,
      text: isGerman ? "ISO 27001 Zertifiziert" : "ISO 27001 Certified",
      color: "text-green-500"
    }
  ]

  const ctaOptions = [
    {
      icon: Calendar,
      title: isGerman ? "Demo vereinbaren" : "Schedule Demo",
      description: isGerman 
        ? "Persönliche 30-min Demo mit unserem Experten-Team"
        : "Personal 30-min demo with our expert team",
      action: isGerman ? "Demo buchen" : "Book Demo",
      href: "/demo",
      primary: true,
      badge: isGerman ? "Empfohlen" : "Recommended"
    },
    {
      icon: MessageSquare,
      title: isGerman ? "Unverbindlich beraten lassen" : "Get Free Consultation",
      description: isGerman 
        ? "Kostenlose Beratung zu Ihren spezifischen Anforderungen"
        : "Free consultation about your specific requirements",
      action: isGerman ? "Beratung anfragen" : "Request Consultation",
      href: "/contact",
      primary: false
    },
    {
      icon: Play,
      title: isGerman ? "Sofort testen" : "Try Instantly",
      description: isGerman 
        ? "Interaktive Demo ohne Anmeldung direkt im Browser"
        : "Interactive demo without registration directly in browser",
      action: isGerman ? "Demo starten" : "Start Demo",
      href: "/try-now",
      primary: false
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-red-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Swiss Alps Silhouette */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-10">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path 
            d="M0,200 L0,180 L100,120 L200,160 L300,80 L400,140 L500,60 L600,120 L700,40 L800,100 L900,20 L1000,80 L1100,160 L1200,140 L1200,200 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main CTA Header */}
        <motion.div
          variants={fadeInScale}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full mb-8"
          >
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            {isGerman ? (
              <>
                Bereit für die
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                  KI-Revolution?
                </span>
              </>
            ) : (
              <>
                Ready for the
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                  AI Revolution?
                </span>
              </>
            )}
          </h2>

          <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto mb-8 leading-relaxed">
            {isGerman 
              ? "Schließen Sie sich den führenden Schweizer Unternehmen an, die bereits mit Projekt Susi ihre Dokumentenverarbeitung revolutioniert haben."
              : "Join leading Swiss enterprises who have already revolutionized their document processing with Projekt Susi."
            }
          </p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12"
          >
            <div className="flex items-center space-x-2 text-white/90">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-lg font-semibold">4.9/5</span>
              <span className="text-white/70">
                {isGerman ? "Kundenbewertung" : "Customer Rating"}
              </span>
            </div>
            
            <div className="w-px h-8 bg-white/30 hidden sm:block"></div>
            
            <div className="flex items-center space-x-2 text-white/90">
              <motion.span 
                className="text-2xl font-bold text-yellow-400"
                key={animatedNumber}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {animatedNumber}+
              </motion.span>
              <span className="text-lg">
                {isGerman ? "Schweizer Unternehmen" : "Swiss Enterprises"}
              </span>
            </div>
            
            <div className="w-px h-8 bg-white/30 hidden sm:block"></div>
            
            <div className="flex items-center space-x-2 text-white/90">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-lg">
                {isGerman ? "Swiss Made" : "Swiss Made"}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Options Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {ctaOptions.map((option, index) => {
            const IconComponent = option.icon
            
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="h-full"
              >
                <AnimatedCard 
                  className={`p-8 h-full text-center relative overflow-hidden ${
                    option.primary 
                      ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 shadow-2xl' 
                      : 'bg-white/95 backdrop-blur-sm'
                  }`}
                  hover={true}
                >
                  {/* Primary Badge */}
                  {option.primary && option.badge && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12 shadow-lg"
                    >
                      {option.badge}
                    </motion.div>
                  )}

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 ${
                      option.primary 
                        ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-8 h-8" />
                  </motion.div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-4 ${
                    option.primary ? 'text-gray-900' : 'text-gray-800'
                  }`}>
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Action Button */}
                  <AnimatedButton
                    variant={option.primary ? 'gradient' : 'outline'}
                    size="lg"
                    className="w-full"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                    onClick={() => window.location.href = option.href}
                  >
                    {option.action}
                  </AnimatedButton>

                  {/* Gradient Overlay for Primary */}
                  {option.primary && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-red-500/5 pointer-events-none"
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                </AnimatedCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Benefits Strip */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <motion.div
            variants={staggerItem}
            className="inline-flex flex-wrap items-center justify-center gap-8 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6"
          >
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              
              return (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <IconComponent className={`w-6 h-6 ${benefit.color}`} />
                  <span className="text-white font-semibold whitespace-nowrap">
                    {benefit.text}
                  </span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-white/80 mb-6">
            {isGerman 
              ? "Haben Sie Fragen? Sprechen Sie direkt mit unseren Schweizer KI-Experten."
              : "Have questions? Speak directly with our Swiss AI experts."
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <motion.a
              href="tel:+41123456789"
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>+41 (0)12 345 67 89</span>
            </motion.a>
            
            <motion.a
              href="mailto:hello@projektsusi.ch"
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>hello@projektsusi.ch</span>
            </motion.a>
          </div>

          {/* Swiss Quality Seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center space-x-2 mt-8 text-white/70"
          >
            <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-6 bg-white"></div>
              <div className="w-6 h-2 bg-white absolute"></div>
            </div>
            <span className="font-medium">
              {isGerman 
                ? "Entwickelt und gehostet in der Schweiz"
                : "Developed and hosted in Switzerland"
              }
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA