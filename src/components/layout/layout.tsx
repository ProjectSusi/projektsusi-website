'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from './navigation'
import Footer from './footer'
import PageTransition from '@/components/ui/page-transition'
import ScrollProgress from '@/components/ui/scroll-progress'
import SmoothScroll from '@/components/ui/smooth-scroll'
import ScrollToTop from '@/components/ui/scroll-to-top'
import CookieBanner from '@/components/ui/cookie-banner'
import SEOHead from '@/components/seo/seo-head'
import { Inter, JetBrains_Mono } from 'next/font/google'

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

interface LayoutProps {
  children: React.ReactNode
  seo?: {
    title?: string
    description?: string
    keywords?: string
    ogImage?: string
    ogType?: 'website' | 'article' | 'product'
    noindex?: boolean
    canonical?: string
  }
}

const Layout: React.FC<LayoutProps> = ({ children, seo }) => {
  const router = useRouter()
  const { locale = 'de' } = router

  return (
    <SmoothScroll>
      <div className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col bg-white`}>
        <SEOHead {...seo} />
        <ScrollProgress />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Navigation locale={locale} />
        </motion.div>
        
        <PageTransition>
          <main className="flex-1 pt-16 lg:pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {children}
            </motion.div>
          </main>
        </PageTransition>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Footer locale={locale} />
        </motion.div>
        
        <ScrollToTop />
        <CookieBanner locale={locale} />
      </div>
    </SmoothScroll>
  )
}

export default Layout