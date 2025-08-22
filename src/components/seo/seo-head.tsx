import Head from 'next/head'
import { useRouter } from 'next/router'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  noindex?: boolean
  canonical?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

const SEOHead: React.FC<SEOProps> = ({
  title = 'Temora AI - Swiss AI RAG Solution',
  description = 'The leading Swiss RAG solution with complete data sovereignty, FADP/GDPR compliance, and zero-hallucination AI. Specifically engineered for Swiss banking, pharma, and manufacturing.',
  keywords = 'RAG System, Switzerland, AI, Artificial Intelligence, FADP, GDPR, Compliance, Data Privacy, Swiss AI, Banking, Pharma, Manufacturing',
  ogImage = 'https://ai.sirth.ch/og-image.jpg',
  ogType = 'website',
  noindex = false,
  canonical,
  author = 'Temora AI AG',
  publishedTime,
  modifiedTime
}) => {
  const router = useRouter()
  const { locale = 'de' } = router
  
  const currentUrl = `https://ai.sirth.ch${router.asPath}`
  const canonicalUrl = canonical || currentUrl

  const isGerman = locale === 'de'
  
  // Localized defaults
  const localizedTitle = title === 'Temora AI - Swiss AI RAG Solution' && isGerman 
    ? 'Temora AI - Die Schweizer KI-Lösung für Unternehmen' 
    : title
    
  const localizedDescription = description === 'The leading Swiss RAG solution with complete data sovereignty, FADP/GDPR compliance, and zero-hallucination AI. Specifically engineered for Swiss banking, pharma, and manufacturing.' && isGerman
    ? 'Die führende Schweizer RAG-Lösung mit vollständiger Datensouveränität, FADP/GDPR Compliance und Zero-Hallucination AI. Speziell entwickelt für Schweizer Finanzwesen, Pharma und Produktion.'
    : description

  const localizedKeywords = keywords === 'RAG System, Switzerland, AI, Artificial Intelligence, FADP, GDPR, Compliance, Data Privacy, Swiss AI, Banking, Pharma, Manufacturing' && isGerman
    ? 'RAG System, Schweiz, KI, Künstliche Intelligenz, FADP, GDPR, Compliance, Datenschutz, Swiss AI, Finanzwesen, Pharma, Banking'
    : keywords

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{localizedTitle}</title>
      <meta name="description" content={localizedDescription} />
      <meta name="keywords" content={localizedKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language and Locale */}
      <meta httpEquiv="Content-Language" content={locale} />
      <meta property="og:locale" content={locale === 'de' ? 'de_CH' : 'en_US'} />
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={localizedTitle} />
      <meta property="og:description" content={localizedDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Temora AI" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={localizedTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={localizedTitle} />
      <meta name="twitter:description" content={localizedDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={localizedTitle} />
      <meta name="twitter:site" content="@TemoreAI" />
      <meta name="twitter:creator" content="@TemoreAI" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#C41E3A" />
      <meta name="msapplication-TileColor" content="#C41E3A" />
      <meta name="application-name" content="Temora AI" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Article specific meta tags */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Schema.org structured data for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Temora AI AG",
            "url": "https://ai.sirth.ch",
            "logo": "https://ai.sirth.ch/logo.png",
            "description": localizedDescription,
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CH",
              "addressLocality": "Switzerland"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "hello@temora.ai"
            },
            "sameAs": [
              "https://twitter.com/TemoreAI",
              "https://linkedin.com/company/temoraai"
            ]
          })
        }}
      />
      
      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Preconnect for Critical Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    </Head>
  )
}

export default SEOHead