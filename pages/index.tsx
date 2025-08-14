import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer } from '@/lib/animations'

import Hero from '@/components/sections/hero'
import Benefits from '@/components/sections/benefits'
import Solutions from '@/components/sections/solutions'
import Features from '@/components/sections/features'
import Stats from '@/components/sections/stats'
import Testimonials from '@/components/sections/testimonials'
import CTA from '@/components/sections/cta'
import FAQ from '@/components/sections/faq'

interface HomeProps {
  locale: string
}

export default function Home({ locale }: HomeProps) {
  const isGerman = locale === 'de'
  
  const pageTitle = isGerman 
    ? 'Projekt Susi - Die Schweizer KI-Lösung für Unternehmen'
    : 'Projekt Susi - Swiss AI Solution for Enterprise Intelligence'
  
  const pageDescription = isGerman
    ? 'Die führende Schweizer RAG-Lösung mit vollständiger Datensouveränität, FADP/GDPR Compliance und Zero-Hallucination AI. Speziell entwickelt für Schweizer Finanzwesen, Pharma und Produktion.'
    : 'The leading Swiss RAG solution with complete data sovereignty, FADP/GDPR compliance, and zero-hallucination AI. Specifically engineered for Swiss banking, pharma, and manufacturing.'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Additional homepage-specific meta tags */}
        <meta name="keywords" content={
          isGerman 
            ? 'RAG System, Schweiz, KI, Künstliche Intelligenz, FADP, GDPR, Compliance, Datenschutz, Swiss AI, Finanzwesen, Pharma, Banking'
            : 'RAG System, Switzerland, AI, Artificial Intelligence, FADP, GDPR, Compliance, Data Privacy, Swiss AI, Banking, Pharma, Manufacturing'
        } />
        
        {/* Structured data for homepage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Projekt Susi",
              "url": "https://projektsusi.ch",
              "description": pageDescription,
              "inLanguage": locale,
              "publisher": {
                "@type": "Organization",
                "name": "Projekt Susi AG",
                "logo": "https://projektsusi.ch/logo.png"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://projektsusi.ch/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Product structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Projekt Susi RAG System",
              "description": pageDescription,
              "url": "https://projektsusi.ch",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "priceCurrency": "CHF",
                "price": "0",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "12",
                "bestRating": "5",
                "worstRating": "1"
              },
              "author": {
                "@type": "Organization",
                "name": "Projekt Susi AG"
              },
              "datePublished": "2024-01-01",
              "dateModified": "2024-12-01",
              "inLanguage": [locale],
              "isAccessibleForFree": true,
              "applicationSubCategory": "AI/ML Software"
            })
          }}
        />
      </Head>

      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {/* Hero Section with parallax */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Hero locale={locale} />
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Stats locale={locale} />
        </motion.section>

        {/* Benefits Section with stagger */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Benefits locale={locale} />
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <Features locale={locale} />
        </motion.section>

        {/* Solutions Section with slide */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Solutions locale={locale} />
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <Testimonials locale={locale} />
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <FAQ locale={locale} />
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CTA locale={locale} />
        </motion.section>
      </motion.div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale = 'de' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      locale,
    },
  }
}