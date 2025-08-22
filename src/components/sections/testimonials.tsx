'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { staggerContainer, staggerItem, fadeInScale } from '@/lib/animations'
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'

interface TestimonialsProps {
  locale: string
}

const Testimonials: React.FC<TestimonialsProps> = ({ locale }) => {
  const { t } = useTranslation('common')
  const isGerman = locale === 'de'
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials = [
    {
      id: 1,
      name: "Dr. Anna Müller",
      role: isGerman ? "CTO, Swiss FinTech AG" : "CTO, Swiss FinTech AG",
      company: "Swiss FinTech",
      industry: isGerman ? "Finanzwesen" : "Financial Services",
      quote: isGerman 
        ? "Temora AI hat unsere Dokumentenanalyse revolutioniert. Die Zero-Hallucination-Garantie gibt uns die Sicherheit, die wir im Finanzbereich benötigen."
        : "Temora AI revolutionized our document analysis. The zero-hallucination guarantee gives us the security we need in financial services.",
      rating: 5,
      metrics: {
        efficiency: isGerman ? "85% effizienter" : "85% more efficient",
        accuracy: isGerman ? "99.9% Genauigkeit" : "99.9% accuracy",
        savings: isGerman ? "CHF 2.4M gespart" : "CHF 2.4M saved"
      },
      avatar: "👩‍💼",
      verified: true
    },
    {
      id: 2,
      name: "Prof. Dr. Marc Weber",
      role: isGerman ? "Head of Digital Innovation, Pharma Helvetica" : "Head of Digital Innovation, Pharma Helvetica",
      company: "Pharma Helvetica",
      industry: isGerman ? "Pharmazie" : "Pharmaceutical",
      quote: isGerman 
        ? "Die FADP-Compliance und Schweizer Datensouveränität waren entscheidend für uns. Temora AI erfüllt alle unsere Compliance-Anforderungen perfekt."
        : "FADP compliance and Swiss data sovereignty were crucial for us. Temora AI perfectly meets all our compliance requirements.",
      rating: 5,
      metrics: {
        compliance: "100% FADP",
        processing: isGerman ? "3x schneller" : "3x faster",
        integration: isGerman ? "2 Wochen Setup" : "2 weeks setup"
      },
      avatar: "👨‍🔬",
      verified: true
    },
    {
      id: 3,
      name: "Lisa Zimmermann",
      role: isGerman ? "Digital Transformation Lead, Swiss Manufacturing Group" : "Digital Transformation Lead, Swiss Manufacturing Group",
      company: "Swiss Manufacturing",
      industry: isGerman ? "Produktion" : "Manufacturing",
      quote: isGerman 
        ? "Die semantische Suche durch unsere technischen Handbücher spart uns Stunden pro Tag. Die Präzision ist beeindruckend."
        : "Semantic search through our technical manuals saves us hours per day. The precision is impressive.",
      rating: 5,
      metrics: {
        time: isGerman ? "6h täglich gespart" : "6h daily saved",
        accuracy: isGerman ? "96% Präzision" : "96% precision",
        adoption: isGerman ? "98% Nutzerakzeptanz" : "98% user adoption"
      },
      avatar: "👩‍🏭",
      verified: true
    },
    {
      id: 4,
      name: "Thomas Huber",
      role: isGerman ? "CISO, Geneva Banking Solutions" : "CISO, Geneva Banking Solutions",
      company: "Geneva Banking",
      industry: isGerman ? "Banking" : "Banking",
      quote: isGerman 
        ? "Schweizer Sicherheitsstandards und lokale Datenverarbeitung - genau das, was wir für unsere Compliance brauchten."
        : "Swiss security standards and local data processing - exactly what we needed for our compliance.",
      rating: 5,
      metrics: {
        security: "ISO 27001",
        uptime: "99.98%",
        response: "< 1.2s"
      },
      avatar: "👨‍💼",
      verified: true
    }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const current = testimonials[currentTestimonial]

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
            <Award className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {isGerman ? (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Schweizer Unternehmen
                </span>
                <br />vertrauen uns
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Swiss Enterprises
                </span>
                <br />Trust Us
              </>
            )}
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isGerman 
              ? "Führende Schweizer Unternehmen setzen bereits auf Temora AI für ihre unternehmenskritischen RAG-Anforderungen."
              : "Leading Swiss enterprises already rely on Temora AI for their mission-critical RAG requirements."
            }
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="max-w-5xl mx-auto mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedCard className="p-8 lg:p-12 relative overflow-hidden" hover={true} glass={true}>
                {/* Quote Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute top-6 left-6 opacity-10"
                >
                  <Quote className="w-24 h-24 text-gray-400" />
                </motion.div>

                {/* Stars */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex justify-center mb-6"
                >
                  {[...Array(current.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    >
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Quote Text */}
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-8 leading-relaxed relative z-10"
                >
                  "{current.quote}"
                </motion.blockquote>

                {/* Author Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-col md:flex-row items-center justify-between"
                >
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-2xl"
                    >
                      {current.avatar}
                    </motion.div>
                    
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-gray-900">{current.name}</h4>
                        {current.verified && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.6 }}
                          >
                            <Shield className="w-5 h-5 text-blue-500" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-gray-600 font-medium">{current.role}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Building2 className="w-4 h-4" />
                        <span>{current.industry}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(current.metrics).map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                        className="bg-white/80 px-4 py-2 rounded-lg border border-gray-200"
                      >
                        <div className="text-lg font-bold text-green-600">{value}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{key}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatedCard>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              icon={<ChevronLeft className="w-5 h-5" />}
              aria-label="Previous testimonial"
            >
              <span className="sr-only">Previous</span>
            </AnimatedButton>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTestimonial(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary-500 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              icon={<ChevronRight className="w-5 h-5" />}
              aria-label="Next testimonial"
            >
              <span className="sr-only">Next</span>
            </AnimatedButton>
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center"
        >
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center justify-center space-x-8 flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2 text-gray-600">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-semibold">
                {isGerman ? "50+ Unternehmen" : "50+ Companies"}
              </span>
            </div>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">4.9/5</span>
              <span className="text-sm">
                {isGerman ? "Bewertung" : "Rating"}
              </span>
            </div>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">ISO 27001</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials