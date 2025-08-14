'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Cookie, Shield, Settings, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CookieBannerProps {
  locale: string
}

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: number
}

const CookieBanner: React.FC<CookieBannerProps> = ({ locale }) => {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always true for essential cookies
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: Date.now()
  })

  const isGerman = locale === 'de'

  // Check for existing consent on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('projektsusi-cookie-consent')
    if (!savedConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    } else {
      try {
        const parsed = JSON.parse(savedConsent)
        setConsent(parsed)
        // Check if consent is older than 12 months (Swiss requirement)
        const twelveMonthsAgo = Date.now() - (12 * 30 * 24 * 60 * 60 * 1000)
        if (parsed.timestamp < twelveMonthsAgo) {
          setShowBanner(true)
        }
      } catch (error) {
        setShowBanner(true)
      }
    }
  }, [])

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() }
    localStorage.setItem('projektsusi-cookie-consent', JSON.stringify(consentWithTimestamp))
    setConsent(consentWithTimestamp)
    setShowBanner(false)
    setShowDetails(false)
    
    // Apply consent settings
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: newConsent.analytics ? 'granted' : 'denied',
        ad_storage: newConsent.marketing ? 'granted' : 'denied',
        functionality_storage: newConsent.preferences ? 'granted' : 'denied'
      })
    }
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now()
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now()
    })
  }

  const saveCustomSettings = () => {
    saveConsent(consent)
  }

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookieConsent,
      name: isGerman ? 'Notwendige Cookies' : 'Necessary Cookies',
      description: isGerman 
        ? 'Diese Cookies sind für das ordnungsgemäße Funktionieren der Website erforderlich und können nicht deaktiviert werden.'
        : 'These cookies are essential for the proper functioning of the website and cannot be disabled.',
      required: true,
      examples: isGerman ? 'Session-Management, Sicherheit' : 'Session management, security'
    },
    {
      key: 'analytics' as keyof CookieConsent,
      name: isGerman ? 'Analyse-Cookies' : 'Analytics Cookies',
      description: isGerman 
        ? 'Helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln und melden.'
        : 'Help us understand how visitors interact with the website by collecting and reporting information anonymously.',
      required: false,
      examples: isGerman ? 'Google Analytics, Hotjar' : 'Google Analytics, Hotjar'
    },
    {
      key: 'marketing' as keyof CookieConsent,
      name: isGerman ? 'Marketing-Cookies' : 'Marketing Cookies',
      description: isGerman 
        ? 'Werden verwendet, um Besuchern auf Webseiten zu folgen und relevante Anzeigen zu zeigen.'
        : 'Used to track visitors across websites and display relevant advertisements.',
      required: false,
      examples: isGerman ? 'Google Ads, LinkedIn Ads' : 'Google Ads, LinkedIn Ads'
    },
    {
      key: 'preferences' as keyof CookieConsent,
      name: isGerman ? 'Präferenz-Cookies' : 'Preference Cookies',
      description: isGerman 
        ? 'Ermöglichen es der Website, sich an Ihre Einstellungen zu erinnern (wie Sprache oder Region).'
        : 'Enable the website to remember your preferences (such as language or region).',
      required: false,
      examples: isGerman ? 'Sprache, Theme-Einstellungen' : 'Language, theme settings'
    }
  ]

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !showDetails && setShowBanner(false)}
        />

        {/* Banner */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                {!showDetails ? (
                  // Simple Banner View
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                      >
                        <Cookie className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                          {isGerman ? 'Cookie-Einstellungen' : 'Cookie Settings'}
                          <Shield className="w-4 h-4 text-primary" />
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {isGerman 
                            ? '🇨🇭 Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere Website zu analysieren. Ihre Daten werden gemäss dem Schweizer Datenschutzgesetz (FADP) behandelt und verlassen niemals die Schweiz.'
                            : '🇨🇭 We use cookies to enhance your experience and analyze our website. Your data is handled according to Swiss Data Protection Act (FADP) and never leaves Switzerland.'}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                          <Shield className="w-3 h-3" />
                          <span>{isGerman ? 'Swiss Data Sovereignty garantiert' : 'Swiss Data Sovereignty guaranteed'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button 
                        onClick={acceptAll} 
                        className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 flex-1 shadow-lg"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {isGerman ? 'Alle akzeptieren' : 'Accept All'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={acceptNecessary}
                        className="border-2 border-gray-300 hover:border-primary flex-1"
                      >
                        {isGerman ? 'Nur notwendige' : 'Necessary Only'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowDetails(true)}
                        className="text-primary hover:text-primary/80 hover:bg-primary/10 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        {isGerman ? 'Anpassen' : 'customize'}
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        <button className="hover:text-primary flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {isGerman ? 'Datenschutz' : 'Privacy Policy'}
                        </button>
                        <button className="hover:text-primary flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {isGerman ? 'Cookie-Richtlinie' : 'Cookie Policy'}
                        </button>
                        <span className="text-gray-400">|</span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          FADP-konform
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Detailed Settings View
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {isGerman ? 'Cookie-Einstellungen anpassen' : 'Customize Cookie Settings'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {isGerman ? 'Wählen Sie, welche Cookies Sie zulassen möchten' : 'Choose which cookies you want to allow'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {cookieTypes.map((type) => (
                        <div key={type.key} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{type.name}</h4>
                                {type.required && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                    {isGerman ? 'Erforderlich' : 'Required'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                              <p className="text-xs text-gray-500">
                                {isGerman ? 'Beispiele: ' : 'Examples: '}{type.examples}
                              </p>
                            </div>
                            <div className="ml-4">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={consent[type.key] as boolean}
                                  disabled={type.required}
                                  onChange={(e) => setConsent(prev => ({
                                    ...prev,
                                    [type.key]: e.target.checked
                                  }))}
                                  className="sr-only"
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${
                                  (consent[type.key] as boolean) ? 'bg-primary' : 'bg-gray-300'
                                } ${type.required ? 'opacity-50' : ''}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform ${
                                    (consent[type.key] as boolean) ? 'translate-x-6' : 'translate-x-1'
                                  } mt-1`} />
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                      <Button 
                        onClick={saveCustomSettings}
                        className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {isGerman ? 'Einstellungen speichern' : 'Save Settings'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDetails(false)}
                        className="border-2 border-gray-300 hover:border-primary"
                      >
                        {isGerman ? 'Zurück' : 'Back'}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <p className="mb-1">
                        <strong>{isGerman ? 'Schweizer Datenschutz:' : 'Swiss Data Protection:'}</strong>
                      </p>
                      <p>
                        {isGerman 
                          ? 'Ihre Einwilligung gilt für 12 Monate. Alle Daten werden in Schweizer Rechenzentren verarbeitet und unterliegen dem FADP.'
                          : 'Your consent is valid for 12 months. All data is processed in Swiss data centers and subject to FADP.'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

export default CookieBanner