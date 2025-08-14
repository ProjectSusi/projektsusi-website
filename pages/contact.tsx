import { GetStaticProps } from 'next'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/layout/layout'
import { 
  SwissFlag, 
  SwissShield,
  SwissAlps
} from '@/components/premium/swiss-visuals'
import { 
  MorphingCard,
  RippleButton
} from '@/components/premium/micro-interactions'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Coffee,
  Users,
  Rocket,
  Shield,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle,
  Heart,
  Building
} from 'lucide-react'
import Link from 'next/link'

interface ContactPageProps {
  locale: string
}

const ContactPage: React.FC<ContactPageProps> = ({ locale }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: '',
    message: '',
    interest: 'beta'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isGerman = locale === 'de'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@projektsusui.ch',
      description: isGerman ? '24h Response Time' : '24h Response Time',
      action: 'mailto:hello@projektsusui.ch',
      color: 'text-primary'
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: '+41 44 XXX XX XX',
      description: isGerman ? 'Mo-Fr 9:00-17:00 CET' : 'Mon-Fri 9:00-17:00 CET',
      action: 'tel:+41',
      color: 'text-green-500'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Zürich, Schweiz',
      description: isGerman ? 'Termine nach Vereinbarung' : 'Appointments by arrangement',
      action: '#',
      color: 'text-red-500'
    },
    {
      icon: Calendar,
      title: 'Meeting',
      value: isGerman ? 'Online Termin buchen' : 'Book Online Meeting',
      description: isGerman ? '30min kostenlose Beratung' : '30min free consultation',
      action: '#',
      color: 'text-purple-500'
    }
  ]

  const teamMembers = [
    {
      role: isGerman ? 'Co-Founder & CTO' : 'Co-Founder & CTO',
      name: 'Swiss Tech Expert',
      description: isGerman ? 'ETH Zürich AI Researcher, ex-UBS' : 'ETH Zurich AI researcher, ex-UBS',
      specialties: ['AI Architecture', 'Swiss Compliance', 'RAG Systems'],
      icon: Rocket
    },
    {
      role: isGerman ? 'Co-Founder & CEO' : 'Co-Founder & CEO',
      name: 'Swiss Business Expert',
      description: isGerman ? 'McKinsey Consultant, Swiss Banking' : 'McKinsey consultant, Swiss banking',
      specialties: ['Strategy', 'Enterprise Sales', 'Swiss Market'],
      icon: Building
    },
    {
      role: isGerman ? 'Head of Compliance' : 'Head of Compliance',
      name: 'Swiss Legal Expert',
      description: isGerman ? 'Ex-FINMA, Datenschutz-Spezialist' : 'Ex-FINMA, data protection specialist',
      specialties: ['FADP', 'FINMA', 'Privacy Law'],
      icon: Shield
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Wie lange dauert die Beta-Anmeldung?' : 'How long does beta signup take?',
      answer: isGerman 
        ? 'Nach Ihrer Anfrage kontaktieren wir Sie innerhalb von 24h für ein 30-minütiges Kennenlerngespräch.'
        : 'After your inquiry, we contact you within 24h for a 30-minute getting-to-know call.'
    },
    {
      question: isGerman ? 'Welche Branchen fokussiert ihr?' : 'Which industries do you focus on?',
      answer: isGerman 
        ? 'Banking, Pharma, Manufacturing und Government - alle mit spezifischen Swiss Compliance Anforderungen.'
        : 'Banking, pharma, manufacturing and government - all with specific Swiss compliance requirements.'
    },
    {
      question: isGerman ? 'Ist die Beta wirklich kostenlos?' : 'Is the beta really free?',
      answer: isGerman 
        ? 'Ja, 3 Monate kostenloser Vollzugang für ausgewählte Partner. Danach günstige Early-Adopter Preise.'
        : 'Yes, 3 months free full access for selected partners. Then discounted early-adopter prices.'
    },
    {
      question: isGerman ? 'Wo werden die Daten gehostet?' : 'Where is data hosted?',
      answer: isGerman 
        ? '100% in Schweizer Rechenzentren. Ihre Daten verlassen niemals die Schweiz.'
        : '100% in Swiss data centers. Your data never leaves Switzerland.'
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccess(false)}
            >
              <motion.div
                className="bg-white rounded-lg p-8 text-center max-w-md mx-4 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {isGerman ? 'Nachricht erhalten!' : 'Message Received!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isGerman ? 'Wir melden uns innerhalb von 24 Stunden bei Ihnen.' : 'We will get back to you within 24 hours.'}
                </p>
                <AnimatedButton
                  variant="gradient"
                  onClick={() => setShowSuccess(false)}
                >
                  {isGerman ? 'Schließen' : 'Close'}
                </AnimatedButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <Coffee className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Kontakt & Beta' : 'Contact & Beta'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.05, rotate: -10 }}>
                  <Users className="w-12 h-12 text-red-500" />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '☕ Bereit für Swiss AI Innovation? Sprechen wir bei einem Kaffee über Ihr Beta-Projekt und wie wir Ihr Unternehmen voranbringen können.'
                  : '☕ Ready for Swiss AI innovation? Let\'s talk over coffee about your beta project and how we can advance your business.'}
              </motion.p>

              <motion.div 
                className="inline-flex items-center space-x-3 glass-morphism rounded-full px-6 py-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
                  <SwissShield className="w-6 h-6" />
                </motion.div>
                <span className="text-gray-700 font-medium">
                  {isGerman ? 'Swiss Startup • Beta Partners gesucht • Kostenlose Beratung' : 'Swiss Startup • Beta Partners Wanted • Free Consultation'}
                </span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-5 h-5 text-red-500" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Methods */}
        <motion.section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Sprechen wir!' : 'Let\'s Talk!'}
              </motion.h2>
              <motion.p 
                className="text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman ? 'Mehrere Wege, um mit unserem Team in Kontakt zu treten' : 'Multiple ways to get in touch with our team'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {contactMethods.map((method, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-6 text-center h-full cursor-pointer" hover={true}>
                    <Link href={method.action}>
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ duration: 0.3 }}
                      >
                        <method.icon className={`w-12 h-12 ${method.color} mx-auto mb-4`} />
                      </motion.div>
                      <motion.h3 
                        className="font-bold text-gray-900 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        {method.title}
                      </motion.h3>
                      <motion.p 
                        className="text-gray-900 font-medium mb-1"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        {method.value}
                      </motion.p>
                      <motion.p 
                        className="text-gray-600 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        {method.description}
                      </motion.p>
                    </Link>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Form & Team */}
        <motion.section className="py-20 bg-gradient-to-br from-gray-50 to-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {/* Contact Form */}
              <motion.div variants={slideInLeft}>
                <AnimatedCard className="p-8" hover={true} gradient={true}>
                  <motion.div 
                    className="flex items-center space-x-3 mb-8"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </motion.div>
                    <motion.h2 
                      className="text-3xl font-bold text-gray-900"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      {isGerman ? 'Beta Partner werden' : 'Become Beta Partner'}
                    </motion.h2>
                  </motion.div>

                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.5 }}
                    >
                      <motion.div variants={staggerItem}>
                        <motion.label 
                          className="block text-gray-700 font-medium mb-2"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {isGerman ? 'Name *' : 'Name *'}
                        </motion.label>
                        <motion.input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary"
                          placeholder={isGerman ? 'Ihr Name' : 'Your name'}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                      </motion.div>
                      
                      <motion.div variants={staggerItem}>
                        <motion.label 
                          className="block text-gray-700 font-medium mb-2"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {isGerman ? 'Unternehmen *' : 'Company *'}
                        </motion.label>
                        <motion.input
                          type="text"
                          name="company"
                          required
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 hover:border-primary"
                          placeholder={isGerman ? 'Firmenname' : 'Company name'}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                      </motion.div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="name@company.ch"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          {isGerman ? 'Telefon' : 'Phone'}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+41 XX XXX XX XX"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          {isGerman ? 'Branche' : 'Industry'}
                        </label>
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">{isGerman ? 'Wählen Sie...' : 'Select...'}</option>
                          <option value="banking">{isGerman ? 'Banking & Fintech' : 'Banking & Fintech'}</option>
                          <option value="pharma">{isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences'}</option>
                          <option value="manufacturing">{isGerman ? 'Manufacturing' : 'Manufacturing'}</option>
                          <option value="government">{isGerman ? 'Government' : 'Government'}</option>
                          <option value="other">{isGerman ? 'Andere' : 'Other'}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          {isGerman ? 'Interesse' : 'Interest'}
                        </label>
                        <select
                          name="interest"
                          value={formData.interest}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="beta">{isGerman ? 'Beta Partner' : 'Beta Partner'}</option>
                          <option value="pilot">{isGerman ? 'Pilot Projekt' : 'Pilot Project'}</option>
                          <option value="consultation">{isGerman ? 'Beratung' : 'Consultation'}</option>
                          <option value="demo">{isGerman ? 'Live Demo' : 'Live Demo'}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        {isGerman ? 'Nachricht' : 'Message'}
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={isGerman 
                          ? 'Erzählen Sie uns von Ihrem Projekt und wie wir helfen können...'
                          : 'Tell us about your project and how we can help...'}
                      />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <AnimatedButton
                        type="submit"
                        disabled={isSubmitting}
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        icon={isSubmitting ? (
                          <motion.div 
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <Send className="w-6 h-6" />
                        )}
                        onClick={undefined}
                      >
                        {isSubmitting ? (
                          isGerman ? 'Wird gesendet...' : 'Sending...'
                        ) : (
                          isGerman ? 'Beta Anfrage senden' : 'Send Beta Request'
                        )}
                      </AnimatedButton>
                    </motion.div>
                  </motion.form>
                </AnimatedCard>
              </motion.div>

              {/* Team & FAQ */}
              <motion.div className="space-y-8" variants={slideInRight}>
                {/* Team */}
                <AnimatedCard className="p-8" hover={true}>
                  <motion.div 
                    className="flex items-center space-x-3 mb-6"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                      <Users className="w-8 h-8 text-red-500" />
                    </motion.div>
                    <motion.h2 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      {isGerman ? 'Unser Team' : 'Our Team'}
                    </motion.h2>
                  </motion.div>

                  <motion.div 
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {teamMembers.map((member, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-start space-x-4"
                        variants={staggerItem}
                        whileHover={{ x: 5, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                          whileHover={{ scale: 1.05, rotate: 3 }}
                          transition={{ duration: 0.3 }}
                        >
                          <member.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <p className="text-sm text-primary font-medium">{member.role}</p>
                          <h3 className="font-bold text-gray-900">{member.name}</h3>
                          <p className="text-gray-700 text-sm mb-2">{member.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {member.specialties.map((specialty, idx) => (
                              <motion.span 
                                key={idx} 
                                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                {specialty}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatedCard>

                {/* FAQ */}
                <AnimatedCard className="p-8" hover={true}>
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {isGerman ? 'Häufige Fragen' : 'Frequently Asked Questions'}
                  </motion.h3>

                  <motion.div 
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    {faqs.map((faq, index) => (
                      <motion.div 
                        key={index} 
                        className="border-b border-gray-200 pb-4"
                        variants={staggerItem}
                        whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.h4 
                          className="font-semibold text-gray-900 mb-2"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          {faq.question}
                        </motion.h4>
                        <motion.p 
                          className="text-gray-700 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 + 0.1 }}
                        >
                          {faq.answer}
                        </motion.p>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatedCard>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Background */}
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
              >
                <SwissFlag className="w-16 h-16 mx-auto mb-8" />
              </motion.div>
              
              <motion.h2 
                className="text-4xl font-bold text-white mb-6"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Starten wir zusammen!' : 'Let\'s Start Together!'}
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/90 mb-8"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Werden Sie Teil der Schweizer AI-Revolution und gestalten Sie die Zukunft mit.'
                  : 'Become part of the Swiss AI revolution and help shape the future.'}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-100 border-none shadow-lg"
                  icon={<Rocket className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Live Demo' : 'Live Demo'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary backdrop-blur-sm"
                  icon={<Heart className="w-6 h-6" />}
                  onClick={() => window.location.href = '/about'}
                >
                  {isGerman ? 'Über uns' : 'About Us'}
                </AnimatedButton>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/80"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
              >
                {[
                  { icon: CheckCircle, text: isGerman ? '100% Swiss' : '100% Swiss' },
                  { icon: Clock, text: isGerman ? '24h Response' : '24h Response' },
                  { icon: Heart, text: isGerman ? 'Startup Spirit' : 'Startup Spirit' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
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

export default ContactPage