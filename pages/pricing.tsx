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
    ? 'Beta-Partner Programm für Temora AI. Pilotprojekt ab CHF 550/Monat. Schweizer Hosting, FADP/GDPR konform, keine Kosten für Arbeitszeit.'
    : 'Beta partner program for Temora AI. Pilot project from CHF 550/month. Swiss hosting, FADP/GDPR compliant, no costs for work time.'

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
                "name": "Temora AI"
              },
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Pilot Project",
                  "price": "550",
                  "priceCurrency": "CHF",
                  "priceValidUntil": "2025-12-31",
                  "availability": "https://schema.org/LimitedAvailability",
                  "url": "https://temora.ch/pricing"
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