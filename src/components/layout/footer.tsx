'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Shield, Globe, Github, Linkedin, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NewsletterSignup from '@/components/ui/newsletter-signup'
import TrustIndicators from '@/components/ui/trust-indicators'

interface FooterProps {
  locale: string
}

const Footer: React.FC<FooterProps> = ({ locale }) => {
  const isGerman = locale === 'de'
  
  const footerSections = {
    solutions: {
      title: isGerman ? 'Lösungen' : 'Solutions',
      links: [
        { href: '/solutions/banking', label: isGerman ? 'Finanzwesen' : 'Banking & Finance' },
        { href: '/solutions/pharma', label: isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences' },
        { href: '/solutions/manufacturing', label: isGerman ? 'Produktion' : 'Manufacturing' },
        { href: '/solutions/government', label: isGerman ? 'Öffentlicher Sektor' : 'Government' }
      ]
    },
    technology: {
      title: isGerman ? 'Technologie' : 'Technology',
      links: [
        { href: '/technology', label: isGerman ? 'Architektur' : 'Architecture' },
        { href: '/technology/demo', label: isGerman ? 'Live Demo' : 'Live Demo' },
        { href: '/technology/api', label: isGerman ? 'API-Dokumentation' : 'API Documentation' },
        { href: '/technology/integrations', label: isGerman ? 'Integrationen' : 'Integrations' }
      ]
    },
    compliance: {
      title: isGerman ? 'Compliance' : 'Compliance',
      links: [
        { href: '/compliance/fadp', label: 'FADP Compliance' },
        { href: '/compliance/finma', label: 'FINMA Banking' },
        { href: '/compliance/security', label: isGerman ? 'Sicherheit' : 'Security' },
        { href: '/compliance/audits', label: isGerman ? 'Audit-Berichte' : 'Audit Reports' }
      ]
    },
    company: {
      title: isGerman ? 'Unternehmen' : 'Company',
      links: [
        { href: '/about', label: isGerman ? 'Über uns' : 'About Us' },
        { href: '/careers', label: isGerman ? 'Karriere' : 'Careers' },
        { href: '/news', label: isGerman ? 'Neuigkeiten' : 'News' },
        { href: '/contact', label: isGerman ? 'Kontakt' : 'Contact' }
      ]
    },
    support: {
      title: isGerman ? 'Support' : 'Support',
      links: [
        { href: '/support', label: isGerman ? 'Hilfe & Support' : 'Help & Support' },
        { href: '/docs', label: isGerman ? 'Dokumentation' : 'Documentation' },
        { href: '/status', label: isGerman ? 'System-Status' : 'System Status' },
        { href: '/training', label: isGerman ? 'Schulungen' : 'Training' }
      ]
    },
    legal: {
      title: isGerman ? 'Rechtliches' : 'Legal',
      links: [
        { href: '/privacy', label: isGerman ? 'Datenschutz' : 'Privacy Policy' },
        { href: '/terms', label: isGerman ? 'AGB' : 'Terms of Service' },
        { href: '/dpa', label: 'Data Processing Agreement' },
        { href: '/impressum', label: 'Impressum' }
      ]
    }
  }

  const contactInfo = {
    address: isGerman
      ? 'Temora AI GmbH\nTeichstrasse 5a\n4106 Therwil\nSchweiz'
      : 'Temora AI GmbH\nTeichstrasse 5a\n4106 Therwil\nSwitzerland',
    phone: '+41 XX XXX XX XX',
    email: 'info@temora.ch',
    support: 'support@temora.ch'
  }

  return (
    <footer className="bg-secondary text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <NewsletterSignup 
            locale={locale} 
            className="bg-transparent text-white"
          />
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                <img src="/temora-logo.png" alt="Temora AI" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  <span className="text-white">Temora</span>
                  <span className="text-primary"> AI</span>
                </div>
                <div className="text-xs text-white/60">Swiss AI Excellence</div>
              </div>
            </Link>
            
            <p className="text-white/80 mb-6 text-sm leading-relaxed">
              {isGerman 
                ? 'Die führende Schweizer Lösung für intelligente Dokumentenanalyse mit vollständiger Datensouveränität und Compliance.'
                : 'The leading Swiss solution for intelligent document analysis with complete data sovereignty and compliance.'}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://linkedin.com/company/temoraai" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/temoraai"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/temoraai"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Solutions & Technology */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h4 className="font-semibold mb-4 text-primary">{footerSections.solutions.title}</h4>
              <ul className="space-y-2">
                {footerSections.solutions.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-white/80 hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-primary">{footerSections.technology.title}</h4>
              <ul className="space-y-2">
                {footerSections.technology.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href} 
                      className="text-white/80 hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">
              {isGerman ? 'Kontakt' : 'Contact'}
            </h4>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <div className="text-white/80 whitespace-pre-line">
                  {contactInfo.address}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="text-white/80 hover:text-primary transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-white/80 hover:text-primary transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>

              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {isGerman ? 'Swiss Hosting' : 'Swiss Hosting'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-xs text-white/60">
                    {isGerman ? 'FADP & GDPR konform' : 'FADP & GDPR compliant'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/20">
          <div>
            <h4 className="font-semibold mb-4 text-primary">{footerSections.compliance.title}</h4>
            <ul className="space-y-2">
              {footerSections.compliance.links.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-white/80 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">{footerSections.support.title}</h4>
            <ul className="space-y-2">
              {footerSections.support.links.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-white/80 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">{footerSections.legal.title}</h4>
            <ul className="space-y-2">
              {footerSections.legal.links.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-white/80 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="py-8 border-t border-white/20">
          <TrustIndicators locale={locale} variant="footer" />
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60 pt-8 border-t border-white/20">
          <div className="mb-4 md:mb-0">
            <p>
              © 2024 Temora AI GmbH. {isGerman ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
            </p>
            <p className="mt-1">
              {isGerman 
                ? 'Stolz entwickelt in der Schweiz 🇨🇭 für Schweizer Unternehmen'
                : 'Proudly engineered in Switzerland 🇨🇭 for Swiss businesses'}
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-xs">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {isGerman ? 'Datenschutz' : 'Privacy'}
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              {isGerman ? 'AGB' : 'Terms'}
            </Link>
            <Link href="/impressum" className="hover:text-primary transition-colors">
              Impressum
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{isGerman ? 'System Online' : 'System Online'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer