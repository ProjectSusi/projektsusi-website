'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { staggerContainer, staggerItem, fadeInScale } from '@/lib/animations'
import {
  Rocket,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Gift,
  Calendar,
  Zap
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TestimonialsProps {
  locale: string
}

const Testimonials: React.FC<TestimonialsProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'

  const betaBenefits = [
    {
      icon: Gift,
      title: isGerman ? 'Kostenloser Zugang' : 'Free Access',
      description: isGerman
        ? 'Beta-Partner erhalten kostenlosen Zugang während der Entwicklungsphase'
        : 'Beta partners get free access during the development phase'
    },
    {
      icon: Users,
      title: isGerman ? 'Direkter Einfluss' : 'Direct Influence',
      description: isGerman
        ? 'Gestalten Sie die Roadmap mit Ihrem Feedback aktiv mit'
        : 'Actively shape the roadmap with your feedback'
    },
    {
      icon: Zap,
      title: isGerman ? 'Prioritäts-Support' : 'Priority Support',
      description: isGerman
        ? 'Direkter Draht zu unseren Entwicklern'
        : 'Direct line to our developers'
    },
    {
      icon: Star,
      title: isGerman ? 'Founding Partner Status' : 'Founding Partner Status',
      description: isGerman
        ? 'Exklusive Konditionen als früher Unterstützer'
        : 'Exclusive terms as an early supporter'
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full mb-6"
          >
            <Rocket className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {isGerman ? (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Werden Sie Beta-Partner
                </span>
                <br />und gestalten Sie mit
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Become a Beta Partner
                </span>
                <br />and Help Shape the Future
              </>
            )}
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isGerman
              ? 'Wir sind ein junges Schweizer Startup und suchen visionäre Unternehmen, die mit uns die Zukunft der KI-gestützten Dokumentenanalyse gestalten möchten.'
              : "We're a young Swiss startup looking for visionary companies who want to shape the future of AI-powered document analysis with us."
            }
          </p>
        </motion.div>

        {/* Beta Benefits Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {betaBenefits.map((benefit, index) => (
            <motion.div key={index} variants={staggerItem}>
              <AnimatedCard className="p-6 h-full text-center" hover={true} glass={true}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-14 h-14 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"
                >
                  <benefit.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <AnimatedCard className="p-8 lg:p-12 bg-gradient-to-r from-primary to-secondary text-white" hover={false}>
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-6 text-white/80" />

              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                {isGerman
                  ? 'Limitierte Beta-Plätze verfügbar'
                  : 'Limited Beta Spots Available'
                }
              </h3>

              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                {isGerman
                  ? 'Als Startup konzentrieren wir uns auf wenige Partner, um echten Mehrwert zu liefern. Bewerben Sie sich jetzt für einen der exklusiven Beta-Plätze.'
                  : "As a startup, we're focusing on a few partners to deliver real value. Apply now for one of the exclusive beta spots."
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 border-white"
                  asChild
                >
                  <Link href="/contact">
                    <Calendar className="w-5 h-5 mr-2" />
                    {isGerman ? 'Gespräch vereinbaren' : 'Schedule a Call'}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/50 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/technology/demo">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {isGerman ? 'Demo ansehen' : 'View Demo'}
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Honest Status Indicators */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mt-12"
        >
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center justify-center space-x-8 flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2 text-gray-600">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {isGerman ? 'Beta Phase' : 'Beta Phase'}
              </span>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">
                {isGerman ? 'Suchen Partner' : 'Seeking Partners'}
              </span>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">
                {isGerman ? 'Swiss Made' : 'Swiss Made'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
