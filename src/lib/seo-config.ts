/**
 * SEO Configuration for Temora AI Website
 * Target Market: Swiss businesses searching for AI document chatbots
 * Primary Keywords: KI Chatbot für Dokumente, RAG System, Dokumenten-KI, Wissensmanagement
 */

export const SEO_CONFIG = {
  siteName: 'Temora AI',
  siteUrl: 'https://temora.ch',
  defaultLocale: 'de',

  // Primary Keywords (German Market Focus)
  keywords: {
    de: {
      primary: [
        'KI Chatbot für Dokumente',
        'Dokumenten-KI Schweiz',
        'RAG System Schweiz',
        'Wissensmanagement KI',
        'KI Dokumentenanalyse',
        'Interner KI Chatbot'
      ],
      secondary: [
        'Dokumenten-Chatbot',
        'Unternehmens-KI Schweiz',
        'KI für interne Dokumente',
        'Schweizer KI Lösung',
        'Datenschutzkonforme KI',
        'FADP konforme KI',
        'Schweizer Hosting KI',
        'Enterprise RAG System'
      ],
      longTail: [
        'KI Chatbot für interne Dokumente Schweiz',
        'RAG System für Unternehmen Schweiz',
        'Wissensmanagement Software mit KI',
        'KI Assistent für Dokumentensuche',
        'Interner Chatbot für Mitarbeiter',
        'Dokumenten-KI für KMU Schweiz',
        'KI gestützte Wissenssuche',
        'Chatbot für Produktwissen',
        'KI für HR Dokumente',
        'IT Support Chatbot mit KI'
      ]
    },
    en: {
      primary: [
        'AI document chatbot Switzerland',
        'Document AI Switzerland',
        'RAG system Switzerland',
        'Knowledge management AI',
        'AI document analysis',
        'Internal AI chatbot'
      ],
      secondary: [
        'Document chatbot',
        'Enterprise AI Switzerland',
        'AI for internal documents',
        'Swiss AI solution',
        'Privacy-compliant AI',
        'FADP compliant AI',
        'Swiss hosted AI',
        'Enterprise RAG system'
      ],
      longTail: [
        'AI chatbot for internal documents Switzerland',
        'RAG system for enterprises Switzerland',
        'Knowledge management software with AI',
        'AI assistant for document search',
        'Internal chatbot for employees',
        'Document AI for SMB Switzerland',
        'AI-powered knowledge search',
        'Chatbot for product knowledge',
        'AI for HR documents',
        'IT support chatbot with AI'
      ]
    }
  }
}

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    de: {
      title: 'KI Chatbot für Dokumente | Schweizer RAG System | Temora AI',
      description: 'Interner KI-Chatbot für schnelle Antworten aus Ihren Dokumenten. Schweizer Hosting, FADP-konform, Zero-Hallucination Technologie. Für Vertrieb, HR, IT-Support.',
      keywords: 'KI Chatbot für Dokumente, Dokumenten-KI Schweiz, RAG System, Wissensmanagement KI, interner Chatbot, Schweizer KI, FADP konform, Zero Hallucination',
      h1: 'KI-Chatbot für Ihre Unternehmensdokumente'
    },
    en: {
      title: 'AI Document Chatbot | Swiss RAG System | Temora AI',
      description: 'Internal AI chatbot for instant answers from your documents. Swiss hosting, FADP-compliant, zero-hallucination technology. For sales, HR, IT support.',
      keywords: 'AI document chatbot, Document AI Switzerland, RAG system, knowledge management AI, internal chatbot, Swiss AI, FADP compliant, zero hallucination',
      h1: 'AI Chatbot for Your Business Documents'
    }
  },

  solutions: {
    de: {
      title: 'Einsatzbereiche | KI Chatbot für Vertrieb, HR & IT Support | Temora AI',
      description: 'KI-Chatbot Einsatzbereiche: Vertriebssupport, HR-Fragen, IT-Helpdesk, Fachstellen. Schnelle Antworten auf Produkt- & Prozesswissen direkt aus Ihren Dokumenten.',
      keywords: 'KI Chatbot Einsatzbereiche, Vertrieb KI, HR Chatbot, IT Support KI, Wissensmanagement, interner Chatbot, Dokumenten-KI Anwendung',
      h1: 'KI-Chatbot Einsatzbereiche'
    },
    en: {
      title: 'Use Cases | AI Chatbot for Sales, HR & IT Support | Temora AI',
      description: 'AI chatbot use cases: Sales support, HR questions, IT helpdesk, specialists. Quick answers on product & process knowledge directly from your documents.',
      keywords: 'AI chatbot use cases, sales AI, HR chatbot, IT support AI, knowledge management, internal chatbot, document AI applications',
      h1: 'AI Chatbot Use Cases'
    }
  },

  technology: {
    de: {
      title: 'RAG Technologie | Dokumenten-KI Architektur | Temora AI',
      description: 'Swiss-engineered RAG-System: FAISS + BM25 Hybrid-Suche, Ollama LLM, ~2 Sekunden Antwortzeit. Lokales Hosting in der Schweiz, Zero-Hallucination Garantie.',
      keywords: 'RAG System, Dokumenten-KI Technologie, FAISS, BM25, Ollama, Hybrid Search, Schweizer Hosting, KI Architektur, Zero Hallucination',
      h1: 'RAG Technologie für Dokumenten-KI'
    },
    en: {
      title: 'RAG Technology | Document AI Architecture | Temora AI',
      description: 'Swiss-engineered RAG system: FAISS + BM25 hybrid search, Ollama LLM, ~2 seconds response time. Local Swiss hosting, zero-hallucination guarantee.',
      keywords: 'RAG system, document AI technology, FAISS, BM25, Ollama, hybrid search, Swiss hosting, AI architecture, zero hallucination',
      h1: 'RAG Technology for Document AI'
    }
  },

  pricing: {
    de: {
      title: 'Preise & Pilot-Projekt | KI Chatbot ab CHF 550/Monat | Temora AI',
      description: '3-Monats Pilotprojekt: CHF 550/Monat Serverkosten + CHF 250 Setup. Keine Kosten für Arbeitszeit. Schweizer Hosting, FADP-konform.',
      keywords: 'KI Chatbot Preise, RAG System Kosten, Pilotprojekt KI, Schweizer KI Preise, Dokumenten-KI Kosten, CHF 550',
      h1: 'Pilot-Projekt & Preise'
    },
    en: {
      title: 'Pricing & Pilot Project | AI Chatbot from CHF 550/month | Temora AI',
      description: '3-month pilot project: CHF 550/month server costs + CHF 250 setup. No costs for work time. Swiss hosting, FADP-compliant.',
      keywords: 'AI chatbot pricing, RAG system costs, pilot project AI, Swiss AI prices, document AI costs, CHF 550',
      h1: 'Pilot Project & Pricing'
    }
  },

  about: {
    de: {
      title: 'Über uns | Schweizer KI-Startup für Dokumenten-Chatbots | Temora AI',
      description: 'Schweizer Startup aus Zürich. Team: Marek Safarik (Business), Thomas Henzler (Tech), Emre Sen (AI/ML). KI-Chatbot für Unternehmensdokumente.',
      keywords: 'Temora AI Team, Schweizer KI Startup, Zürich AI, Dokumenten-KI Entwickler, RAG System Schweiz, Marek Safarik, Thomas Henzler, Emre Sen',
      h1: 'Das Temora AI Team'
    },
    en: {
      title: 'About Us | Swiss AI Startup for Document Chatbots | Temora AI',
      description: 'Swiss startup from Zurich. Team: Marek Safarik (Business), Thomas Henzler (Tech), Emre Sen (AI/ML). AI chatbot for business documents.',
      keywords: 'Temora AI team, Swiss AI startup, Zurich AI, document AI developers, RAG system Switzerland, Marek Safarik, Thomas Henzler, Emre Sen',
      h1: 'The Temora AI Team'
    }
  },

  contact: {
    de: {
      title: 'Kontakt | Beratung für KI Dokumenten-Chatbot | Temora AI',
      description: 'Kostenlose Beratung für Ihr KI-Chatbot Projekt. Sprechen Sie mit unseren Experten über Wissensmanagement und Dokumenten-KI für Ihr Unternehmen.',
      keywords: 'KI Chatbot Beratung, Dokumenten-KI Kontakt, Temora AI Anfrage, RAG System Demo, Wissensmanagement Beratung',
      h1: 'Kontakt & Beratung'
    },
    en: {
      title: 'Contact | Consultation for AI Document Chatbot | Temora AI',
      description: 'Free consultation for your AI chatbot project. Talk to our experts about knowledge management and document AI for your business.',
      keywords: 'AI chatbot consultation, document AI contact, Temora AI inquiry, RAG system demo, knowledge management consultation',
      h1: 'Contact & Consultation'
    }
  },

  demo: {
    de: {
      title: 'Live Demo | KI Chatbot für Dokumente testen | Temora AI',
      description: 'Testen Sie unseren KI-Chatbot live! Laden Sie Dokumente hoch und erhalten Sie sofort Antworten. Schweizer RAG-System, Zero-Hallucination, ~2s Antwortzeit.',
      keywords: 'KI Chatbot Demo, Dokumenten-KI testen, RAG System Demo, Live Demo KI, Wissensmanagement Demo, Schweizer KI testen',
      h1: 'KI-Chatbot Live Demo'
    },
    en: {
      title: 'Live Demo | Test AI Document Chatbot | Temora AI',
      description: 'Try our AI chatbot live! Upload documents and get instant answers. Swiss RAG system, zero-hallucination, ~2s response time.',
      keywords: 'AI chatbot demo, document AI test, RAG system demo, live AI demo, knowledge management demo, Swiss AI test',
      h1: 'AI Chatbot Live Demo'
    }
  }
}

// Structured Data Templates
export const STRUCTURED_DATA = {
  organization: (locale: string) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Temora AI GmbH",
    "alternateName": "Temora AI",
    "url": "https://temora.ch",
    "logo": "https://temora.ch/temora-logo.png",
    "description": locale === 'de'
      ? "Schweizer KI-Chatbot für Dokumentenanalyse. RAG-System mit Zero-Hallucination Technologie, FADP-konform, 100% Swiss Hosting."
      : "Swiss AI chatbot for document analysis. RAG system with zero-hallucination technology, FADP-compliant, 100% Swiss hosting.",
    "foundingDate": "2024",
    "founders": [
      { "@type": "Person", "name": "Marek Safarik" },
      { "@type": "Person", "name": "Thomas Henzler" },
      { "@type": "Person", "name": "Emre Sen" }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Teichstrasse 5a",
      "addressLocality": "Therwil",
      "postalCode": "4106",
      "addressCountry": "CH"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+41-44-123-45-67",
      "email": "info@temora.ch",
      "contactType": "sales",
      "availableLanguage": ["German", "English", "French", "Italian"]
    },
    "sameAs": [
      "https://linkedin.com/company/temoraai",
      "https://twitter.com/temoraai",
      "https://github.com/temoraai"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Switzerland"
    }
  }),

  softwareApplication: (locale: string) => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Temora AI Document Chatbot",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": locale === 'de' ? "KI-Dokumentenanalyse" : "AI Document Analysis",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "550",
      "priceCurrency": "CHF",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock"
    },
    "description": locale === 'de'
      ? "KI-Chatbot für interne Dokumente mit RAG-Technologie. Schnelle Antworten aus Ihren Unternehmensdokumenten."
      : "AI chatbot for internal documents with RAG technology. Quick answers from your business documents.",
    "featureList": locale === 'de' ? [
      "Zero-Hallucination Technologie",
      "~2 Sekunden Antwortzeit",
      "FADP & GDPR konform",
      "100% Schweizer Hosting",
      "Multi-Format Support (PDF, DOCX, TXT)",
      "Mehrsprachig (DE, EN, FR, IT)"
    ] : [
      "Zero-hallucination technology",
      "~2 seconds response time",
      "FADP & GDPR compliant",
      "100% Swiss hosting",
      "Multi-format support (PDF, DOCX, TXT)",
      "Multilingual (DE, EN, FR, IT)"
    ],
    "author": {
      "@type": "Organization",
      "name": "Temora AI GmbH"
    }
  }),

  faqPage: (faqs: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }),

  localBusiness: (locale: string) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Temora AI GmbH",
    "@id": "https://temora.ch",
    "url": "https://temora.ch",
    "telephone": "+41-44-123-45-67",
    "email": "info@temora.ch",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Teichstrasse 5a",
      "addressLocality": "Therwil",
      "postalCode": "4106",
      "addressCountry": "CH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.5003,
      "longitude": 7.5536
    },
    "priceRange": "CHF 550-1000/Monat",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "description": locale === 'de'
      ? "Schweizer Anbieter für KI-Dokumenten-Chatbots mit RAG-Technologie"
      : "Swiss provider of AI document chatbots with RAG technology"
  })
}

// Helper function to generate meta tags
export function generatePageSEO(page: keyof typeof PAGE_SEO, locale: string) {
  const seo = PAGE_SEO[page]
  return locale === 'de' ? seo.de : seo.en
}

// Helper to get combined keywords for a page
export function getPageKeywords(page: keyof typeof PAGE_SEO, locale: string): string {
  const pageConfig = PAGE_SEO[page]
  const langConfig = locale === 'de' ? pageConfig.de : pageConfig.en
  const globalKeywords = locale === 'de'
    ? SEO_CONFIG.keywords.de.primary.slice(0, 3)
    : SEO_CONFIG.keywords.en.primary.slice(0, 3)

  return `${langConfig.keywords}, ${globalKeywords.join(', ')}`
}
