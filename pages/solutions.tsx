import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import Layout from '@/components/layout/layout'
import Solutions from '@/components/sections/solutions'
import { PAGE_SEO, STRUCTURED_DATA, getPageKeywords } from '@/lib/seo-config'

interface SolutionsPageProps {
  locale: string
}

const SolutionsPage: React.FC<SolutionsPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'
  const seo = isGerman ? PAGE_SEO.solutions.de : PAGE_SEO.solutions.en

  const pageTitle = seo.title
  const pageDescription = seo.description
  const pageKeywords = getPageKeywords('solutions', locale)

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://temora.ch/solutions" />
        <meta name="robots" content="index, follow" />

        {/* Use Cases Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": isGerman ? "KI-Chatbot Einsatzbereiche" : "AI Chatbot Use Cases",
              "description": pageDescription,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": isGerman ? "Vertrieb & Sales Support" : "Sales & Sales Support",
                  "description": isGerman ? "KI-Chatbot für schnelle Produktinformationen im Vertrieb" : "AI chatbot for quick product information in sales"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": isGerman ? "HR & Personalwesen" : "HR & Human Resources",
                  "description": isGerman ? "Automatische Antworten auf HR-Fragen aus Dokumenten" : "Automatic answers to HR questions from documents"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": isGerman ? "IT-Support & Helpdesk" : "IT Support & Helpdesk",
                  "description": isGerman ? "KI-gestützter IT-Support mit Wissensdatenbank" : "AI-powered IT support with knowledge base"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": isGerman ? "Fachstellen & Experten" : "Specialists & Experts",
                  "description": isGerman ? "Schneller Zugriff auf Fachwissen und Dokumentation" : "Quick access to expertise and documentation"
                }
              ]
            })
          }}
        />
      </Head>

      <div className="pt-20">
        <Solutions locale={locale} />
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'de', ['common'])),
      locale: locale ?? 'de',
    },
  }
}

export default SolutionsPage
