import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, CheckCircle, Globe, Building, Zap, Target, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustIndicatorsProps {
  locale: string
  variant?: 'default' | 'minimal' | 'footer' | 'hero'
  className?: string
}

const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  locale,
  variant = 'default',
  className
}) => {
  const isGerman = locale === 'de'

  const badges = [
    {
      id: 'swiss-made',
      icon: Shield,
      title: 'Swiss Made',
      subtitle: isGerman ? 'Entwickelt in CH' : 'Built in CH',
      description: isGerman ? 'Entwickelt und gehostet in der Schweiz' : 'Developed and hosted in Switzerland',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      status: 'achieved'
    },
    {
      id: 'fadp-ready',
      icon: Lock,
      title: 'FADP',
      subtitle: isGerman ? 'Konform' : 'Compliant',
      description: isGerman ? 'Schweizer Datenschutzgesetz konform' : 'Swiss Data Protection Act compliant',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'achieved'
    },
    {
      id: 'gdpr-ready',
      icon: CheckCircle,
      title: 'GDPR',
      subtitle: isGerman ? 'Konform' : 'Compliant',
      description: isGerman ? 'EU-Datenschutz konform' : 'EU data protection compliant',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'achieved'
    },
    {
      id: 'local-hosting',
      icon: Building,
      title: isGerman ? 'Swiss Hosting' : 'Swiss Hosting',
      subtitle: isGerman ? 'Lokal' : 'Local',
      description: isGerman ? 'Daten bleiben in der Schweiz' : 'Data stays in Switzerland',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      status: 'achieved'
    },
    {
      id: 'local-llm',
      icon: Globe,
      title: 'Local LLM',
      subtitle: 'Ollama',
      description: isGerman ? 'Keine Cloud-KI-Dienste' : 'No cloud AI services',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      status: 'achieved'
    },
    {
      id: 'source-citation',
      icon: Target,
      title: isGerman ? 'Quellenangaben' : 'Source Citations',
      subtitle: isGerman ? 'Transparent' : 'Transparent',
      description: isGerman ? 'Jede Antwort mit Quellenverweis' : 'Every answer with source reference',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      status: 'achieved'
    }
  ]

  const features = [
    {
      name: isGerman ? 'Swiss Entwicklung' : 'Swiss Development',
      logo: '🇨🇭',
      achieved: true
    },
    {
      name: isGerman ? 'Lokales LLM' : 'Local LLM',
      logo: '🦙',
      achieved: true
    },
    {
      name: isGerman ? 'FADP Konform' : 'FADP Compliant',
      logo: '📋',
      achieved: true
    },
    {
      name: isGerman ? 'Beta Phase' : 'Beta Phase',
      logo: '🚀',
      achieved: true
    }
  ]

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center space-x-6", className)}>
        {badges.slice(0, 4).map((badge, index) => (
          <motion.div
            key={badge.id}
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", badge.bgColor)}>
              <badge.icon className={cn("w-4 h-4", badge.color)} />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">{badge.title}</div>
              <div className="text-gray-600">{badge.subtitle}</div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        {features.map((feat, index) => (
          <motion.div
            key={feat.name}
            className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-2xl">{feat.logo}</span>
            <div>
              <div className="text-sm font-medium text-white">{feat.name}</div>
              {feat.achieved && (
                <div className="flex items-center space-x-1 text-xs text-green-300">
                  <CheckCircle className="w-3 h-3" />
                  <span>{isGerman ? 'Aktiv' : 'Active'}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className={cn("flex flex-wrap justify-center gap-4", className)}>
        {badges.slice(0, 3).map((badge, index) => (
          <motion.div
            key={badge.id}
            className={cn(
              "flex items-center space-x-3 px-4 py-2 rounded-full border",
              badge.bgColor,
              badge.borderColor
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <badge.icon className={cn("w-5 h-5", badge.color)} />
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{badge.title}</span>
              <span className="text-gray-600 ml-1">{badge.subtitle}</span>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn("py-16", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isGerman ? 'Vertrauen & Sicherheit' : 'Trust & Security'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isGerman
              ? 'Schweizer Entwicklung mit lokaler Datenverarbeitung - Ihre Daten verlassen die Schweiz nicht.'
              : 'Swiss development with local data processing - your data never leaves Switzerland.'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={cn(
                "p-6 rounded-xl border-2 text-center group cursor-pointer transition-all duration-300",
                badge.bgColor,
                badge.borderColor,
                "hover:shadow-lg hover:scale-105"
              )}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  badge.color.replace('text-', 'bg-').replace('600', '100')
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <badge.icon className={cn("w-8 h-8", badge.color)} />
              </motion.div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {badge.title} {badge.subtitle}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {badge.description}
              </p>

              <motion.div
                className="flex items-center justify-center space-x-1 text-green-600"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isGerman ? 'Aktiv' : 'Active'}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Honest Status */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            {
              value: '~130ms',
              label: isGerman ? 'Antwortzeit' : 'Response Time',
              icon: Zap
            },
            {
              value: '384-dim',
              label: isGerman ? 'Embeddings' : 'Embeddings',
              icon: Globe
            },
            {
              value: isGerman ? 'Beta' : 'Beta',
              label: isGerman ? 'Aktueller Status' : 'Current Status',
              icon: Rocket
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gray-50 rounded-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TrustIndicators
