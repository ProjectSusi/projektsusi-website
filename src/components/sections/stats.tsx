'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { staggerContainer, staggerItem, scrollReveal } from '@/lib/animations'
import { Shield, Zap, Users, Award, TrendingUp, Clock, Globe, Star } from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'

interface StatsProps {
  locale: string
}

const Stats: React.FC<StatsProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'

  const stats = [
    {
      icon: Shield,
      number: "100%",
      label: isGerman ? "Datenschutz-Compliance" : "Data Privacy Compliance",
      description: isGerman ? "FADP/GDPR konform" : "FADP/GDPR compliant",
      color: "text-primary-500",
      bgColor: "bg-primary-50"
    },
    {
      icon: Zap,
      number: "< 2s",
      label: isGerman ? "Antwortzeit" : "Response Time",
      description: isGerman ? "Durchschnittliche Abfragezeit" : "Average query time",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: TrendingUp,
      number: "99.9%",
      label: isGerman ? "Verfügbarkeit" : "Uptime",
      description: isGerman ? "Enterprise-Grade SLA" : "Enterprise-grade SLA",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Globe,
      number: "3",
      label: isGerman ? "Sprachen" : "Languages",
      description: isGerman ? "DE, EN, FR unterstützt" : "DE, EN, FR supported",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Users,
      number: "500K+",
      label: isGerman ? "Dokumente verarbeitet" : "Documents Processed",
      description: isGerman ? "In Schweizer Unternehmen" : "In Swiss enterprises",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Award,
      number: "ISO 27001",
      label: isGerman ? "Zertifizierung" : "Certification",
      description: isGerman ? "Schweizer Sicherheitsstandard" : "Swiss security standard",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full mb-6"
          >
            <Star className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {isGerman ? (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Schweizer Qualität
                </span>
                <br />in Zahlen
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Swiss Quality
                </span>
                <br />in Numbers
              </>
            )}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isGerman 
              ? "Unsere RAG-Technologie setzt neue Massstäbe für Präzision, Sicherheit und Leistung in der Schweizer Unternehmenslandschaft."
              : "Our RAG technology sets new standards for precision, security, and performance in the Swiss enterprise landscape."
            }
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className="h-full"
              >
                <AnimatedCard 
                  className="p-8 h-full text-center hover:shadow-xl transition-all duration-500 border-l-4 border-transparent hover:border-l-primary-500"
                  hover={true}
                  glass={true}
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-full mb-6`}
                  >
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </motion.div>

                  {/* Number */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="mb-4"
                  >
                    <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className={`text-lg font-semibold ${stat.color} mb-2`}>
                      {stat.label}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {stat.description}
                    </div>
                  </motion.div>

                  {/* Progress Bar Animation */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.2, delay: index * 0.1 }}
                    className={`h-1 ${stat.bgColor} rounded-full mx-auto`}
                    style={{ maxWidth: '80px' }}
                  />
                </AnimatedCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Swiss Quality Seal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <AnimatedCard className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-primary-50 to-blue-50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-sm flex items-center justify-center">
                <div className="w-3 h-6 bg-white"></div>
                <div className="w-6 h-3 bg-white absolute"></div>
              </div>
              <span className="font-bold text-gray-900">
                {isGerman ? "Swiss Made" : "Swiss Made"}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <span className="text-gray-600">
              {isGerman 
                ? "Entwickelt und gehostet in der Schweiz"
                : "Developed and hosted in Switzerland"
              }
            </span>
          </AnimatedCard>
        </motion.div>
      </div>
    </section>
  )
}

export default Stats