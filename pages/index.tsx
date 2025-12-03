import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer } from '@/lib/animations'
import { PAGE_SEO, STRUCTURED_DATA, getPageKeywords } from '@/lib/seo-config'

import Hero from '@/components/sections/hero'
import ROICalculator from '@/components/sections/roi-calculator'
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
  const seo = isGerman ? PAGE_SEO.home.de : PAGE_SEO.home.en

  const pageTitle = seo.title
  const pageDescription = seo.description
  const pageKeywords = getPageKeywords('home', locale)

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* SEO-optimized keywords for Swiss AI Document Chatbot market */}
        <meta name="keywords" content={pageKeywords} />
        
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA.organization(locale))
          }}
        />

        {/* Software Application Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA.softwareApplication(locale))
          }}
        />

        {/* WebSite Structured Data with Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Temora AI",
              "alternateName": isGerman ? "KI Chatbot für Dokumente" : "AI Document Chatbot",
              "url": "https://temora.ch",
              "description": pageDescription,
              "inLanguage": locale === 'de' ? 'de-CH' : 'en',
              "publisher": {
                "@type": "Organization",
                "name": "Temora AI GmbH"
              }
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

        {/* ROI Calculator - Main Feature */}
        <motion.section
          id="roi-calculator"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <ROICalculator locale={locale} />
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