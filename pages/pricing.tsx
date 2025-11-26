import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { PAGE_SEO, getPageKeywords } from '@/lib/seo-config'

import Pricing from '@/components/sections/pricing'

interface PricingPageProps {
  locale: string
}

export default function PricingPage({ locale }: PricingPageProps) {
  const isGerman = locale === 'de'
  const seo = isGerman ? PAGE_SEO.pricing.de : PAGE_SEO.pricing.en
  const pageKeywords = getPageKeywords('pricing', locale)

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://temora.ch/pricing" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://temora.ch/pricing" />

        {/* Structured data for pricing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": isGerman ? "Temora AI KI-Chatbot für Dokumente" : "Temora AI Document Chatbot",
              "description": seo.description,
              "brand": {
                "@type": "Organization",
                "name": "Temora AI GmbH"
              },
              "offers": {
                "@type": "Offer",
                "name": isGerman ? "Pilot-Projekt" : "Pilot Project",
                "price": "550",
                "priceCurrency": "CHF",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock",
                "url": "https://temora.ch/pricing",
                "seller": {
                  "@type": "Organization",
                  "name": "Temora AI GmbH"
                },
                "itemCondition": "https://schema.org/NewCondition",
                "description": isGerman
                  ? "3-Monats Pilotprojekt: CHF 550/Monat + CHF 250 Setup"
                  : "3-month pilot project: CHF 550/month + CHF 250 setup"
              }
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