import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, CheckCircle, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterSignupProps {
  locale: string
  variant?: 'default' | 'minimal' | 'floating'
  className?: string
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ 
  locale, 
  variant = 'default',
  className 
}) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const isGerman = locale === 'de'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locale }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Newsletter signup failed')
      }
      
      setShowSuccess(true)
      setEmail('')
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)
      
    } catch (error) {
      console.error('Newsletter signup error:', error)
      setError(
        error instanceof Error 
          ? error.message 
          : isGerman 
            ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
            : 'An error occurred. Please try again later.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = {
    title: isGerman ? 'Bleiben Sie informiert' : 'Stay informed',
    subtitle: isGerman 
      ? 'Erhalten Sie Updates zu neuen Features, Compliance-Änderungen und Swiss AI Insights.'
      : 'Get updates on new features, compliance changes, and Swiss AI insights.',
    placeholder: isGerman ? 'Ihre E-Mail-Adresse' : 'Your email address',
    button: isGerman ? 'Anmelden' : 'Subscribe',
    submitting: isGerman ? 'Wird angemeldet...' : 'Subscribing...',
    success: isGerman ? 'Erfolgreich angemeldet!' : 'Successfully subscribed!',
    successMessage: isGerman 
      ? 'Vielen Dank! Sie erhalten nun Updates zu Projekt Susi.'
      : 'Thank you! You will now receive updates about Projekt Susi.',
    privacy: isGerman 
      ? 'Wir respektieren Ihre Privatsphäre. Jederzeit abbestellbar.'
      : 'We respect your privacy. Unsubscribe at any time.'
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("inline-flex items-center space-x-2", className)}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={content.placeholder}
              required
              disabled={isSubmitting}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <motion.div 
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </form>
        
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-green-600"
            >
              <CheckCircle className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "fixed bottom-6 right-6 max-w-sm bg-white rounded-lg shadow-xl border p-4 z-40",
          className
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{content.title}</h4>
            </div>
          </div>
          <button
            onClick={() => {/* Handle close */}}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">{content.subtitle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={content.placeholder}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          
          <motion.button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? content.submitting : content.button}
          </motion.button>
        </form>
        
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 p-2 bg-green-50 rounded-md text-center"
            >
              <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-700">{content.success}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <p className="text-xs text-gray-500 mt-2">{content.privacy}</p>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn("bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="max-w-md mx-auto text-center">
        <motion.div
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Mail className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-bold mb-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {content.title}
        </motion.h3>
        
        <motion.p 
          className="text-white/90 mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {content.subtitle}
        </motion.p>

        <AnimatePresence>
          {!showSuccess ? (
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={content.placeholder}
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    {isSubmitting ? (
                      <motion.div 
                        className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                    <span>{isSubmitting ? content.submitting : content.button}</span>
                  </div>
                </motion.button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <X className="w-4 h-4 text-red-200" />
                      <p className="text-red-100 text-sm">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h4 className="text-xl font-semibold mb-2">{content.success}</h4>
              <p className="text-white/90 text-sm">{content.successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p 
          className="text-white/70 text-sm mt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {content.privacy}
        </motion.p>
      </div>
    </motion.div>
  )
}

export default NewsletterSignup