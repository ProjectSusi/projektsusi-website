import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import Layout from '@/components/layout/layout'
import Solutions from '@/components/sections/solutions'

interface SolutionsPageProps {
  locale: string
}

const SolutionsPage: React.FC<SolutionsPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const pageTitle = isGerman
    ? 'Einsatzbereiche - Temora AI'
    : 'Use Cases - Temora AI'

  const pageDescription = isGerman
    ? 'Interner KI-Chatbot für schnelle Antworten auf Produkt- & Prozesswissen. Vertrieb, HR, IT-Support, Fachstellen - direkt aus Ihren Dokumenten.'
    : 'Internal AI chatbot for quick answers on product & process knowledge. Sales, HR, IT support, specialists - directly from your documents.'

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
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
