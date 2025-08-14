import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Award, Lock, CheckCircle, Globe, Building, Star, Zap } from 'lucide-react'
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
      subtitle: isGerman ? 'Schweizer Qualität' : 'Swiss Quality',
      description: isGerman ? 'Entwickelt in der Schweiz' : 'Developed in Switzerland',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'fadp-compliant',
      icon: Lock,
      title: 'FADP',
      subtitle: isGerman ? 'Compliant' : 'Compliant',
      description: isGerman ? 'Schweizer Datenschutzgesetz' : 'Swiss Data Protection Act',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'gdpr-compliant',
      icon: CheckCircle,
      title: 'GDPR',
      subtitle: isGerman ? 'Konform' : 'Compliant',
      description: isGerman ? 'EU-Datenschutz-Grundverordnung' : 'EU General Data Protection Regulation',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'finma-ready',
      icon: Building,
      title: 'FINMA',
      subtitle: isGerman ? 'Ready' : 'Ready',
      description: isGerman ? 'Finanzmarktaufsicht konform' : 'Financial market supervision compliant',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'iso-certified',
      icon: Award,
      title: 'ISO 27001',
      subtitle: isGerman ? 'Zertifiziert' : 'Certified',
      description: isGerman ? 'Informationssicherheit' : 'Information Security',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'zero-hallucination',
      icon: Zap,
      title: isGerman ? 'Zero-Hallucination' : 'Zero-Hallucination',
      subtitle: 'AI',
      description: isGerman ? 'Nur verifizierte Antworten' : 'Only verified answers',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ]

  const certifications = [
    {
      name: 'Swiss Made Software',
      logo: '🇨🇭',
      verified: true
    },
    {
      name: 'SOC 2 Type II',
      logo: '🛡️',
      verified: true
    },
    {
      name: 'FADP Compliant',
      logo: '📋',
      verified: true
    },
    {
      name: 'Enterprise Grade',
      logo: '⭐',
      verified: true
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
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.name}
            className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-2xl">{cert.logo}</span>
            <div>
              <div className="text-sm font-medium text-white">{cert.name}</div>
              {cert.verified && (
                <div className="flex items-center space-x-1 text-xs text-green-300">
                  <CheckCircle className="w-3 h-3" />
                  <span>{isGerman ? 'Verifiziert' : 'Verified'}</span>
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
              ? 'Unsere Zertifizierungen und Compliance-Standards garantieren höchste Sicherheit und Datenschutz.'
              : 'Our certifications and compliance standards guarantee the highest security and data protection.'
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
                  {isGerman ? 'Verifiziert' : 'Verified'}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Security Stats */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            {
              value: '99.9%',
              label: isGerman ? 'Uptime Garantie' : 'Uptime Guarantee',
              icon: Zap
            },
            {
              value: '256-bit',
              label: isGerman ? 'Verschlüsselung' : 'Encryption',
              icon: Lock
            },
            {
              value: '24/7',
              label: isGerman ? 'Sicherheitsüberwachung' : 'Security Monitoring',
              icon: Shield
            },
            {
              value: 'SOC 2',
              label: isGerman ? 'Typ II Zertifiziert' : 'Type II Certified',
              icon: Award
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