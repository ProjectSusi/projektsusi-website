'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Menu, X, ChevronDown, Globe, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavigationProps {
  locale: string
}

const Navigation: React.FC<NavigationProps> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isGerman = locale === 'de'

  const navigation = {
    solutions: {
      label: isGerman ? 'Lösungen' : 'Solutions',
      items: [
        {
          href: '/solutions/banking',
          label: isGerman ? 'Finanzwesen' : 'Banking & Finance',
          description: isGerman ? 'FINMA-konforme KI für Banken' : 'FINMA-compliant AI for banks',
          icon: '🏦'
        },
        {
          href: '/solutions/pharma',
          label: isGerman ? 'Pharma & Life Sciences' : 'Pharma & Life Sciences',
          description: isGerman ? 'Arzneimittelforschung beschleunigen' : 'Accelerate drug discovery',
          icon: '💊'
        },
        {
          href: '/solutions/manufacturing',
          label: isGerman ? 'Produktion' : 'Manufacturing',
          description: isGerman ? 'Qualitäts- und Compliance-Automatisierung' : 'Quality & compliance automation',
          icon: '🏭'
        },
        {
          href: '/solutions/government',
          label: isGerman ? 'Öffentlicher Sektor' : 'Government',
          description: isGerman ? 'Mehrsprachige Bürgerdienste' : 'Multilingual citizen services',
          icon: '🏛️'
        }
      ]
    },
    technology: {
      label: isGerman ? 'Technologie' : 'Technology',
      items: [
        {
          href: '/technology',
          label: isGerman ? 'Architektur' : 'Architecture',
          description: isGerman ? 'Swiss-engineered RAG System' : 'Swiss-engineered RAG System',
          icon: '⚙️'
        },
        {
          href: '/technology/demo',
          label: isGerman ? 'Live Demo' : 'Live Demo',
          description: isGerman ? 'Testen Sie Projekt Susi sofort' : 'Try Projekt Susi instantly',
          icon: '🎪'
        },
        {
          href: '/technology/api',
          label: isGerman ? 'API-Dokumentation' : 'API Documentation',
          description: isGerman ? 'Entwickler-Ressourcen' : 'Developer resources',
          icon: '📚'
        }
      ]
    },
    compliance: {
      label: isGerman ? 'Compliance' : 'Compliance',
      items: [
        {
          href: '/compliance/fadp',
          label: isGerman ? 'FADP Compliance' : 'FADP Compliance',
          description: isGerman ? 'Schweizer Datenschutzgesetz' : 'Swiss Data Protection Act',
          icon: '🇨🇭'
        },
        {
          href: '/compliance/finma',
          label: isGerman ? 'FINMA Banking' : 'FINMA Banking',
          description: isGerman ? 'Finanzmarktregulierung' : 'Financial market regulation',
          icon: '🏦'
        },
        {
          href: '/compliance/security',
          label: isGerman ? 'Sicherheit' : 'Security',
          description: isGerman ? 'Enterprise-Grade Sicherheit' : 'Enterprise-grade security',
          icon: '🛡️'
        }
      ]
    }
  }

  const mainNavItems = [
    { href: '/', label: isGerman ? 'Startseite' : 'Home' },
    { 
      label: navigation.solutions.label, 
      dropdown: navigation.solutions.items,
      key: 'solutions'
    },
    { 
      label: navigation.technology.label, 
      dropdown: navigation.technology.items,
      key: 'technology'
    },
    { 
      label: navigation.compliance.label, 
      dropdown: navigation.compliance.items,
      key: 'compliance'
    },
    { href: '/pricing', label: isGerman ? 'Preise' : 'Pricing' },
    { href: '/about', label: isGerman ? 'Über uns' : 'About' }
  ]

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key)
  }

  const closeDropdowns = () => {
    setActiveDropdown(null)
    setIsOpen(false)
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b" 
        : "bg-gray-900/80 backdrop-blur-sm"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center space-x-3 text-2xl font-bold transition-colors",
              scrolled ? "text-primary hover:text-primary/80" : "text-white hover:text-white/80"
            )}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="hidden sm:block">
              <span className={scrolled ? "text-primary" : "text-white"}>Projekt</span>
              <span className={scrolled ? "text-secondary" : "text-red-300"}>Susi</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {mainNavItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.dropdown ? (
                  <button
                    onClick={() => toggleDropdown(item.key!)}
                    className={cn(
                      "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary",
                      scrolled ? "text-secondary" : "text-white",
                      activeDropdown === item.key && "text-primary"
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      activeDropdown === item.key && "rotate-180"
                    )} />
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      scrolled ? "text-secondary" : "text-white",
                      router.pathname === item.href && "text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.key && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border overflow-hidden z-50">
                    <div className="p-2">
                      {item.dropdown.map((dropdownItem, dropdownIndex) => (
                        <Link
                          key={dropdownIndex}
                          href={dropdownItem.href}
                          onClick={closeDropdowns}
                          className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-2xl">{dropdownItem.icon}</span>
                          <div>
                            <div className="font-medium text-secondary group-hover:text-primary">
                              {dropdownItem.label}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {dropdownItem.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="hidden md:flex items-center">
              <Link
                href={router.asPath}
                locale="de"
                className={cn(
                  "px-2 py-1 text-sm font-medium rounded transition-colors",
                  locale === 'de' 
                    ? "bg-primary text-white" 
                    : scrolled ? "text-secondary hover:text-primary" : "text-white/80 hover:text-white"
                )}
              >
                DE
              </Link>
              <span className={cn("mx-1", scrolled ? "text-secondary" : "text-white/60")}>|</span>
              <Link
                href={router.asPath}
                locale="en"
                className={cn(
                  "px-2 py-1 text-sm font-medium rounded transition-colors",
                  locale === 'en' 
                    ? "bg-primary text-white" 
                    : scrolled ? "text-secondary hover:text-primary" : "text-white/80 hover:text-white"
                )}
              >
                EN
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "border-primary text-primary hover:bg-primary hover:text-white",
                  !scrolled && "border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary backdrop-blur-sm"
                )}
                asChild
              >
                <Link href="/demo">
                  <Globe className="w-4 h-4 mr-2" />
                  {isGerman ? 'Demo' : 'Demo'}
                </Link>
              </Button>
              <Button variant="swiss" size="sm" asChild>
                <Link href="/contact">
                  <Shield className="w-4 h-4 mr-2" />
                  {isGerman ? 'Kontakt' : 'Contact'}
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden p-2 rounded-md transition-colors",
                scrolled ? "text-secondary hover:text-primary" : "text-white hover:text-primary"
              )}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg">
            <div className="p-4 space-y-4">
              {mainNavItems.map((item, index) => (
                <div key={index}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(`mobile-${item.key}`)}
                        className="flex items-center justify-between w-full text-left text-secondary hover:text-primary font-medium"
                      >
                        {item.label}
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          activeDropdown === `mobile-${item.key}` && "rotate-180"
                        )} />
                      </button>
                      {activeDropdown === `mobile-${item.key}` && (
                        <div className="mt-2 ml-4 space-y-2">
                          {item.dropdown.map((dropdownItem, dropdownIndex) => (
                            <Link
                              key={dropdownIndex}
                              href={dropdownItem.href}
                              onClick={closeDropdowns}
                              className="block text-sm text-muted-foreground hover:text-primary"
                            >
                              {dropdownItem.icon} {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={closeDropdowns}
                      className="block text-secondary hover:text-primary font-medium"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/demo" onClick={closeDropdowns}>
                    <Globe className="w-4 h-4 mr-2" />
                    {isGerman ? 'Kostenlose Demo' : 'Free Demo'}
                  </Link>
                </Button>
                <Button variant="swiss" className="w-full justify-start" asChild>
                  <Link href="/contact" onClick={closeDropdowns}>
                    <Shield className="w-4 h-4 mr-2" />
                    {isGerman ? 'Kontakt aufnehmen' : 'Get in Touch'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeDropdowns}
        />
      )}
    </header>
  )
}

export default Navigation