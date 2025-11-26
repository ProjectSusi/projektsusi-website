import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'

import Pricing from '@/components/sections/pricing'

interface PricingPageProps {
  locale: string
}

export default function PricingPage({ locale }: PricingPageProps) {
  const isGerman = locale === 'de'
  
  const pageTitle = isGerman 
    ? 'Preise - Temora AI Swiss AI RAG Lösung'
    : 'Pricing - Temora AI Swiss AI RAG Solution'
  
  const pageDescription = isGerman
    ? 'Transparente Preise für Temora AI RAG System. Von CHF 15,000 für Starter bis Enterprise-Lösungen. Inklusive Swiss Data Sovereignty, FADP/GDPR Compliance und ROI-Garantie.'
    : 'Transparent pricing for Temora AI RAG System. From CHF 15,000 for Starter to Enterprise solutions. Including Swiss data sovereignty, FADP/GDPR compliance, and ROI guarantee.'

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        <meta name="keywords" content={
          isGerman 
            ? 'RAG System Preise, Swiss AI Kosten, Enterprise RAG Pricing, FADP Compliance Kosten, Schweiz KI Preise'
            : 'RAG System pricing, Swiss AI costs, Enterprise RAG pricing, FADP compliance costs, Switzerland AI prices'
        } />

        {/* Structured data for pricing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Temora AI RAG System",
              "description": pageDescription,
              "brand": {
                "@type": "Organization",
                "name": "Temora AI AG"
              },
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Starter Plan",
                  "price": "15000",
                  "priceCurrency": "CHF",
                  "priceValidUntil": "2025-12-31",
                  "availability": "https://schema.org/InStock",
                  "url": "https://temora.ch/pricing#starter"
                },
                {
                  "@type": "Offer", 
                  "name": "Professional Plan",
                  "price": "45000",
                  "priceCurrency": "CHF",
                  "priceValidUntil": "2025-12-31", 
                  "availability": "https://schema.org/InStock",
                  "url": "https://temora.ch/pricing#professional"
                },
                {
                  "@type": "Offer",
                  "name": "Enterprise Plan", 
                  "price": "120000",
                  "priceCurrency": "CHF",
                  "priceValidUntil": "2025-12-31",
                  "availability": "https://schema.org/InStock",
                  "url": "https://temora.ch/pricing#enterprise"
                }
              ]
            })
          }}
        />
      </Head>

      <div className="pt-8">
        <Pricing locale={locale} />
      </div>
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