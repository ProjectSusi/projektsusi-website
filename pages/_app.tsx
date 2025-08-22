import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import '@/styles/globals.css'
import '@/styles/premium.css'
import Layout from '@/components/layout/layout'
import AnimationProvider from '@/components/providers/animation-provider'
import { generateMetaTags } from '@/lib/utils'

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

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { locale = 'de' } = router

  // Generate meta tags for the current page
  const metaTags = generateMetaTags({
    title: pageProps.title || 'Temora AI - Swiss AI RAG Solution',
    description: pageProps.description || 'The leading Swiss solution for intelligent document analysis with complete data sovereignty and compliance.',
    path: router.asPath,
    locale,
  })

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Basic Meta Tags */}
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <link rel="canonical" href={metaTags.canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metaTags['og:title']} />
        <meta property="og:description" content={metaTags['og:description']} />
        <meta property="og:url" content={metaTags['og:url']} />
        <meta property="og:type" content={metaTags['og:type']} />
        <meta property="og:locale" content={metaTags['og:locale']} />
        <meta property="og:site_name" content="Temora AI" />
        <meta property="og:image" content="https://temora.ai/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content={metaTags['twitter:card']} />
        <meta name="twitter:title" content={metaTags['twitter:title']} />
        <meta name="twitter:description" content={metaTags['twitter:description']} />
        <meta name="twitter:image" content="https://temora.ai/og-image.jpg" />
        <meta name="twitter:site" content="@TemoreAI" />
        <meta name="twitter:creator" content="@TemoreAI" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="language" content={locale === 'de' ? 'German' : 'English'} />
        <meta name="author" content="Temora AI AG" />
        <meta name="publisher" content="Temora AI AG" />
        <meta name="copyright" content="© 2024 Temora AI AG" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <meta name="coverage" content="Worldwide" />
        
        {/* Swiss-specific meta tags */}
        <meta name="geo.region" content="CH" />
        <meta name="geo.country" content="Switzerland" />
        <meta name="geo.placename" content="Zurich" />
        <meta name="DC.language" content={locale === 'de' ? 'de-CH' : 'en-CH'} />
        
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FF0000" />
        <meta name="msapplication-TileColor" content="#FF0000" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Temora AI AG",
              "url": "https://projektsusui.ch",
              "logo": "https://projektsusui.ch/logo.png",
              "description": locale === 'de' 
                ? "Die führende Schweizer Lösung für intelligente Dokumentenanalyse mit vollständiger Datensouveränität und Compliance."
                : "The leading Swiss solution for intelligent document analysis with complete data sovereignty and compliance.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Bahnhofstrasse 45",
                "addressLocality": "Zurich",
                "postalCode": "8001",
                "addressCountry": "CH"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+41-44-123-45-67",
                "contactType": "customer service",
                "availableLanguage": ["German", "English", "French", "Italian"]
              },
              "sameAs": [
                "https://linkedin.com/company/temoraai",
                "https://twitter.com/TemoreAI",
                "https://github.com/temoraai"
              ]
            })
          }}
        />
      </Head>

      <AnimationProvider>
        <div className={`${inter.variable} ${jetbrainsMono.variable}`}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </AnimationProvider>

      {/* Analytics Scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
          `
        }}
      />
    </>
  )
}

export default appWithTranslation(MyApp)