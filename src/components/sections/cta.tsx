'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { fadeInScale, staggerContainer, staggerItem } from '@/lib/animations'
import {
  ArrowRight,
  Calendar,
  MessageSquare,
  Play,
  Shield,
  Zap,
  Rocket,
  CheckCircle,
  Sparkles,
  Mail
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'

interface CTAProps {
  locale: string
}

const CTA: React.FC<CTAProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'

  const benefits = [
    {
      icon: Shield,
      text: isGerman ? '100% Schweizer Hosting' : '100% Swiss Hosting',
      color: 'text-primary-500'
    },
    {
      icon: Zap,
      text: isGerman ? '~2s Antwortzeit' : '~2s Response Time',
      color: 'text-blue-500'
    },
    {
      icon: Rocket,
      text: isGerman ? 'Beta Phase' : 'Beta Phase',
      color: 'text-green-500'
    }
  ]

  const ctaOptions = [
    {
      icon: Calendar,
      title: isGerman ? 'Gespräch vereinbaren' : 'Schedule a Call',
      description: isGerman
        ? 'Kurzworkshop (1-2h) zur Definition Ihres Use Cases'
        : 'Short workshop (1-2h) to define your use case',
      action: isGerman ? 'Termin buchen' : 'Book Meeting',
      href: '/contact',
      primary: true,
      badge: isGerman ? 'Empfohlen' : 'Recommended'
    },
    {
      icon: Play,
      title: isGerman ? 'Live Demo ansehen' : 'View Live Demo',
      description: isGerman
        ? 'Vollzugriff auf das RAG-System - eigene Dokumente hochladen'
        : 'Full access to RAG system - upload your own documents',
      action: isGerman ? 'Demo starten' : 'Start Demo',
      href: '/technology/demo',
      primary: false
    },
    {
      icon: MessageSquare,
      title: isGerman ? 'Fragen stellen' : 'Ask Questions',
      description: isGerman
        ? 'Direkter Kontakt zu unserem Entwickler-Team'
        : 'Direct contact with our developer team',
      action: isGerman ? 'Kontakt' : 'Contact',
      href: '/contact',
      primary: false
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-primary-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-primary-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-primary-500 rounded-full mb-8"
          >
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </motion.div>

          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            {isGerman ? (
              <>
                Werden Sie
                <br />
                <span className="bg-gradient-to-r from-green-400 to-primary-400 bg-clip-text text-transparent">
                  Beta-Partner
                </span>
              </>
            ) : (
              <>
                Become a
                <br />
                <span className="bg-gradient-to-r from-green-400 to-primary-400 bg-clip-text text-transparent">
                  Beta Partner
                </span>
              </>
            )}
          </h2>

          <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto mb-8 leading-relaxed">
            {isGerman
              ? 'Wir sind ein junges Schweizer Startup und suchen Unternehmen, die mit uns die Zukunft der KI-gestützten Dokumentenanalyse gestalten möchten.'
              : "We're a young Swiss startup looking for companies who want to shape the future of AI-powered document analysis with us."}
          </p>

          {/* Honest Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12"
          >
            <div className="flex items-center space-x-2 text-white/90">
              <Rocket className="w-5 h-5 text-green-400" />
              <span className="text-lg">
                {isGerman ? 'Beta Phase' : 'Beta Phase'}
              </span>
            </div>

            <div className="w-px h-8 bg-white/30 hidden sm:block"></div>

            <div className="flex items-center space-x-2 text-white/90">
              <Shield className="w-5 h-5 text-primary-400" />
              <span className="text-lg">
                {isGerman ? 'Swiss Made' : 'Swiss Made'}
              </span>
            </div>

            <div className="w-px h-8 bg-white/30 hidden sm:block"></div>

            <div className="flex items-center space-x-2 text-white/90">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-lg">
                {isGerman ? 'Suchen Partner' : 'Seeking Partners'}
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
                      ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-green-400 shadow-2xl'
                      : 'bg-white/95 backdrop-blur-sm'
                  }`}
                  hover={true}
                >
                  {/* Primary Badge */}
                  {option.primary && option.badge && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12 shadow-lg"
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
                        ? 'bg-gradient-to-r from-green-400 to-primary-500 text-white'
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
              ? 'Haben Sie Fragen? Sprechen Sie direkt mit unserem Team.'
              : 'Have questions? Speak directly with our team.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <motion.a
              href="mailto:hello@temora.ai"
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>hello@temora.ai</span>
            </motion.a>
          </div>

          {/* Swiss Quality Seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center space-x-2 mt-8 text-white/70"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-sm flex items-center justify-center">
              <div className="w-2 h-6 bg-white"></div>
              <div className="w-6 h-2 bg-white absolute"></div>
            </div>
            <span className="font-medium">
              {isGerman
                ? 'Entwickelt und gehostet in der Schweiz'
                : 'Developed and hosted in Switzerland'}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
