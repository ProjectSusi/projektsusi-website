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
import NewsletterSignup from '@/components/ui/newsletter-signup'
import TrustIndicators from '@/components/ui/trust-indicators'

interface HomeProps {
  locale: string
}

export default function Home({ locale }: HomeProps) {
  const isGerman = locale === 'de'
  
  const pageTitle = isGerman
    ? 'Temora AI - Open Source RAG System v3.2'
    : 'Temora AI - Open Source RAG System v3.2'

  const pageDescription = isGerman
    ? 'Production-ready RAG System mit Hybrid Search (FAISS + BM25), Conversation Memory, Knowledge Graph und Multilingual Support (DE/EN). FastAPI + Ollama + SQLite.'
    : 'Production-ready RAG system with hybrid search (FAISS + BM25), conversation memory, knowledge graph, and multilingual support (DE/EN). FastAPI + Ollama + SQLite.'

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
              "name": "Temora AI",
              "url": "https://temora.ch",
              "description": pageDescription,
              "inLanguage": locale,
              "publisher": {
                "@type": "Organization",
                "name": "Temora AI AG",
                "logo": "https://temora.ch/temora-logo.png"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://temora.ch/search?q={search_term_string}",
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
              "name": "Temora AI RAG System",
              "description": pageDescription,
              "url": "https://temora.ch",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "author": {
                "@type": "Organization",
                "name": "Temora AI AG"
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

        {/* Trust Indicators Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <TrustIndicators locale={locale} />
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

        {/* Newsletter Section */}
        <motion.section
          className="py-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <NewsletterSignup locale={locale} />
          </div>
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