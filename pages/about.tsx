import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { motion } from 'framer-motion'
import Layout from '@/components/layout/layout'
import { PAGE_SEO, STRUCTURED_DATA, getPageKeywords } from '@/lib/seo-config'
import { 
  SwissFlag, 
  SwissShield, 
  SwissAlps, 
  DataVisualization,
  SwissClockElement
} from '@/components/premium/swiss-visuals'
import { 
  fadeInScale, 
  staggerContainer, 
  staggerItem, 
  slideInLeft, 
  slideInRight,
  scrollReveal
} from '@/lib/animations'
import AnimatedCard from '@/components/ui/animated-card'
import AnimatedButton from '@/components/ui/animated-button'
import { 
  Lightbulb,
  Target,
  Users,
  Zap,
  Heart,
  Flag,
  MapPin,
  Calendar,
  Award,
  Coffee,
  Code,
  Rocket,
  Shield,
  Crown
} from 'lucide-react'
import Link from 'next/link'

interface AboutPageProps {
  locale: string
}

const AboutPage: React.FC<AboutPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'
  const seo = isGerman ? PAGE_SEO.about.de : PAGE_SEO.about.en
  const pageKeywords = getPageKeywords('about', locale)

  const timeline = [
    {
      year: '2024',
      title: isGerman ? 'Die Vision entsteht' : 'Vision Born',
      description: isGerman 
        ? 'Schweizer Unternehmen brauchen KI-Lösungen, die ihre Werte teilen: Präzision, Datenschutz und Zuverlässigkeit.'
        : 'Swiss companies need AI solutions that share their values: precision, privacy, and reliability.',
      icon: Lightbulb
    },
    {
      year: '2024',
      title: isGerman ? 'Erste Prototypen' : 'First Prototypes',
      description: isGerman 
        ? 'Entwicklung der ersten Zero-Hallucination RAG-Technologie speziell für Schweizer Compliance.'
        : 'Development of first zero-hallucination RAG technology specifically for Swiss compliance.',
      icon: Code
    },
    {
      year: '2025',
      title: isGerman ? 'Beta Programm' : 'Beta Program',
      description: isGerman 
        ? 'Öffnung für ausgewählte Beta-Partner und frühe Adopters in der Schweiz.'
        : 'Opening for selected beta partners and early adopters in Switzerland.',
      icon: Rocket
    },
    {
      year: '2025',
      title: isGerman ? 'Swiss Launch' : 'Swiss Launch',
      description: isGerman 
        ? 'Vollständiger Launch für den Schweizer Markt mit allen Enterprise-Features.'
        : 'Full launch for Swiss market with all enterprise features.',
      icon: Flag
    }
  ]

  const team = [
    {
      name: 'Marek Safarik',
      role: isGerman ? 'Co-Founder & Business' : 'Co-Founder & Business',
      description: isGerman
        ? 'Betriebsökonom FH, Banking & Finance. Fachspezialist mit Erfahrung im Finanzsektor. Bachelorarbeit zu KI-Chatbots im Vertrieb.'
        : 'Business Economist FH, Banking & Finance. Specialist with experience in the financial sector. Bachelor thesis on AI chatbots in sales.',
      icon: Crown
    },
    {
      name: 'Thomas Henzler',
      role: isGerman ? 'Co-Founder & Tech Lead' : 'Co-Founder & Tech Lead',
      description: isGerman
        ? 'Dipl. Wirtschaftsinformatik (i.A.), Fullstack Developer für QM-Software & KI. Diplomarbeit zu KI-gestützten RAG-Systemen.'
        : 'Diploma in Business Informatics (in progress), Fullstack Developer for QM software & AI. Thesis on AI-powered RAG systems.',
      icon: Code
    },
    {
      name: 'Emre Sen',
      role: isGerman ? 'Co-Founder & AI Engineer' : 'Co-Founder & AI Engineer',
      description: isGerman
        ? 'BSc AI & Machine Learning (HSLU). IT-Erfahrung in der Versicherungsbranche. Fokus: KI-Chatbots & Cyber Security.'
        : 'BSc AI & Machine Learning (HSLU). IT experience in insurance. Focus: AI chatbots & cyber security.',
      icon: Shield
    }
  ]

  const values = [
    {
      title: isGerman ? 'Swiss Präzision' : 'Swiss Precision',
      description: isGerman 
        ? 'Jede Zeile Code wird mit der gleichen Sorgfalt geschrieben wie eine Schweizer Uhr hergestellt.'
        : 'Every line of code is written with the same care as a Swiss watch is made.',
      icon: SwissClockElement,
      color: 'text-primary-500'
    },
    {
      title: isGerman ? 'Datensouveränität' : 'Data Sovereignty',
      description: isGerman 
        ? 'Ihre Daten bleiben in der Schweiz. Immer. Ohne Ausnahme.'
        : 'Your data stays in Switzerland. Always. Without exception.',
      icon: Shield,
      color: 'text-primary'
    },
    {
      title: isGerman ? 'Zero Hallucination' : 'Zero Hallucination',
      description: isGerman 
        ? 'Nur Fakten, keine Erfindungen. Unsere AI antwortet nur basierend auf Ihren Dokumenten.'
        : 'Only facts, no fiction. Our AI responds only based on your documents.',
      icon: Target,
      color: 'text-green-500'
    },
    {
      title: isGerman ? 'Partnership' : 'Partnership',
      description: isGerman 
        ? 'Wir sind Ihr Technologiepartner, nicht nur ein Anbieter.'
        : 'We are your technology partner, not just a vendor.',
      icon: Heart,
      color: 'text-yellow-500'
    }
  ]

  return (
    <Layout>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://temora.ch/about" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://temora.ch/about" />

        {/* About Page Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "mainEntity": {
                "@type": "Organization",
                "name": "Temora AI GmbH",
                "description": seo.description,
                "foundingDate": "2024",
                "founders": [
                  {
                    "@type": "Person",
                    "name": "Marek Safarik",
                    "jobTitle": isGerman ? "Co-Founder & Business" : "Co-Founder & Business"
                  },
                  {
                    "@type": "Person",
                    "name": "Thomas Henzler",
                    "jobTitle": isGerman ? "Co-Founder & Tech Lead" : "Co-Founder & Tech Lead"
                  },
                  {
                    "@type": "Person",
                    "name": "Emre Sen",
                    "jobTitle": isGerman ? "Co-Founder & AI Engineer" : "Co-Founder & AI Engineer"
                  }
                ],
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Zürich",
                  "addressCountry": "CH"
                },
                "areaServed": "Switzerland"
              }
            })
          }}
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
        {/* Hero Section */}
        <motion.section 
          className="relative py-20 lg:py-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Swiss Background */}
          <div className="absolute inset-0 opacity-10">
            <SwissAlps />
          </div>
          <motion.div 
            className="absolute top-20 right-20 opacity-20"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <SwissFlag className="w-32 h-32" />
          </motion.div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={fadeInScale}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex items-center justify-center space-x-4 mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}>
                  <SwissFlag className="w-12 h-12" />
                </motion.div>
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isGerman ? 'Über Temora AI' : 'About Temora AI'}
                </motion.h1>
                <motion.div whileHover={{ scale: 1.1, rotate: -10 }}>
                  <SwissShield className="w-12 h-12" glowing />
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {isGerman 
                  ? '🚀 Ein Schweizer Startup, das die Art verändert, wie Unternehmen mit ihren Daten interagieren - durch präzise, sichere und vertrauenswürdige KI-Technologie.'
                  : '🚀 A Swiss startup changing how businesses interact with their data - through precise, secure, and trustworthy AI technology.'}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <AnimatedButton 
                  variant="gradient" 
                  size="lg"
                  icon={<Users className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Team kennenlernen' : 'Meet the Team'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline" 
                  size="lg"
                  icon={<Rocket className="w-6 h-6" />}
                  onClick={() => window.location.href = '/demo'}
                >
                  {isGerman ? 'Technologie erleben' : 'Experience Tech'}
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-8"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Unsere Mission' : 'Our Mission'}
              </motion.h2>
              
              <AnimatedCard className="p-12 text-center bg-gradient-to-br from-primary-50 to-gray-50" hover={true} gradient={true}>
                <motion.div 
                  className="mb-8"
                  whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  <Target className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                </motion.div>
                
                <motion.blockquote 
                  className="text-2xl font-light text-gray-700 italic leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {isGerman 
                    ? '"Schweizer Unternehmen sollen KI-Technologie nutzen können, ohne Kompromisse bei Datenschutz, Compliance oder Qualität einzugehen. Wir bauen die Brücke zwischen Innovation und Schweizer Werten."'
                    : '"Swiss companies should be able to use AI technology without compromising on privacy, compliance, or quality. We build the bridge between innovation and Swiss values."'}
                </motion.blockquote>
                
                <motion.div 
                  className="mt-8 flex items-center justify-center space-x-4"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.6 }}>
                    <SwissFlag className="w-8 h-8" />
                  </motion.div>
                  <span className="text-gray-600 font-medium">
                    {isGerman ? 'Das Temora AI Team' : 'The Temora AI Team'}
                  </span>
                </motion.div>
              </AnimatedCard>
            </motion.div>
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section className="py-20 bg-gray-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Unsere Journey' : 'Our Journey'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Von der Vision zur Schweizer AI-Revolution'
                  : 'From vision to Swiss AI revolution'}
              </motion.p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="space-y-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                {timeline.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start space-x-6"
                    variants={staggerItem}
                  >
                    <motion.div 
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 15 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="w-8 h-8" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <AnimatedCard className="p-6" hover={true}>
                        <div className="flex items-center space-x-4 mb-4">
                          <motion.span 
                            className="text-2xl font-bold text-primary-500"
                            whileHover={{ scale: 1.05 }}
                          >
                            {item.year}
                          </motion.span>
                          <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                        </div>
                        <p className="text-gray-700">{item.description}</p>
                      </AnimatedCard>
                    </div>
                    
                    {/* Connecting Line */}
                    {index < timeline.length - 1 && (
                      <motion.div 
                        className="absolute left-8 mt-20 w-0.5 h-8 bg-gradient-to-b from-primary to-secondary"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Swiss Engineering Excellence' : 'Swiss Engineering Excellence'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Unser Team verbindet tiefe KI-Expertise mit Schweizer Qualitätsstandards'
                  : 'Our team combines deep AI expertise with Swiss quality standards'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {team.map((member, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 text-center h-full" hover={true} gradient={true}>
                    <motion.div 
                      className="mb-6"
                      whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      <member.icon className="w-16 h-16 text-primary mx-auto" />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl font-bold text-gray-900 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {member.name}
                    </motion.h3>
                    <motion.p 
                      className="text-primary-500 font-semibold mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {member.role}
                    </motion.p>
                    <motion.p 
                      className="text-gray-700"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      {member.description}
                    </motion.p>
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section className="py-20 bg-gradient-to-br from-primary-50 to-gray-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <motion.div 
              className="absolute top-10 left-10 w-32 h-32 bg-primary-400 rounded-full blur-xl"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-32 h-32 bg-primary-400 rounded-full blur-xl"
              animate={{ scale: [1.05, 1, 1.05], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, delay: 3 }}
            />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center mb-16"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-gray-900 mb-4"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Unsere Werte' : 'Our Values'}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Was uns antreibt und wie wir arbeiten'
                  : 'What drives us and how we work'}
              </motion.p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {values.map((value, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <AnimatedCard className="p-8 text-center h-full hover:shadow-xl" hover={true} glass={true}>
                    <motion.div 
                      className="mb-6"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ duration: 0.4 }}
                    >
                      {value.title === (isGerman ? 'Swiss Präzision' : 'Swiss Precision') ? (
                        <SwissClockElement className="mx-auto" showTime />
                      ) : (
                        <value.icon className={`w-16 h-16 mx-auto ${value.color}`} />
                      )}
                    </motion.div>
                    
                    <motion.h3 
                      className="text-xl font-bold text-gray-900 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {value.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-700"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {value.description}
                    </motion.p>
                    
                    {/* Progress indicator */}
                    <motion.div
                      className={`mt-4 h-1 bg-gradient-to-r ${value.color.includes('red') ? 'from-primary-400 to-primary-600' : value.color.includes('blue') ? 'from-primary-400 to-primary-600' : value.color.includes('green') ? 'from-green-400 to-green-600' : 'from-yellow-400 to-yellow-600'} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </AnimatedCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Swiss Location */}
        <motion.section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div 
                className="flex items-center justify-center space-x-4 mb-8"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }}>
                  <MapPin className="w-8 h-8 text-primary-500" />
                </motion.div>
                <motion.h2 
                  className="text-4xl font-bold text-gray-900"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {isGerman ? 'Proudly Swiss' : 'Proudly Swiss'}
                </motion.h2>
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.6 }}>
                  <SwissFlag className="w-8 h-8" />
                </motion.div>
              </motion.div>
              
              <AnimatedCard className="p-12 bg-gradient-to-br from-gray-50 to-primary-50" hover={true} gradient={true}>
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <SwissAlps className="w-full h-32 opacity-60" />
                </motion.div>
                
                <motion.p 
                  className="text-xl text-gray-700 leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {isGerman 
                    ? '🏔️ Entwickelt in Zürich, gehostet in Schweizer Rechenzentren, compliance mit allen lokalen Gesetzen. Unsere Schweizer Wurzeln sind nicht nur Herkunft - sie sind unser Versprechen für Qualität, Datenschutz und Zuverlässigkeit.'
                    : '🏔️ Developed in Zurich, hosted in Swiss data centers, compliant with all local laws. Our Swiss roots are not just origin - they are our promise for quality, privacy, and reliability.'}
                </motion.p>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                >
                  {[
                    { icon: Shield, text: "FADP Compliant", color: "text-primary" },
                    { icon: Award, text: "Swiss Quality", color: "text-primary-500" },
                    { icon: Heart, text: "Local Support", color: "text-green-500" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="text-center"
                      variants={staggerItem}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                      </motion.div>
                      <p className="font-semibold text-gray-900">{item.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatedCard>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <motion.div 
              className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"
              animate={{ scale: [1, 1.05, 1], x: [0, 20, 0], y: [0, 15, 0] }}
              transition={{ duration: 12, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"
              animate={{ scale: [1.05, 1, 1.05], x: [0, -20, 0], y: [0, -15, 0] }}
              transition={{ duration: 12, repeat: Infinity, delay: 6 }}
            />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div 
              className="max-w-3xl mx-auto"
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 
                className="text-4xl font-bold text-white mb-6"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {isGerman ? 'Bereit für Swiss AI Innovation?' : 'Ready for Swiss AI Innovation?'}
              </motion.h2>
              
              <motion.p 
                className="text-xl text-white/90 mb-8"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {isGerman 
                  ? 'Werden Sie Teil unserer Beta-Community und helfen Sie uns, die Zukunft der Schweizer KI zu gestalten.'
                  : 'Join our beta community and help us shape the future of Swiss AI.'}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AnimatedButton 
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 border-none shadow-lg"
                  icon={<Coffee className="w-6 h-6" />}
                  onClick={() => window.location.href = '/contact'}
                >
                  {isGerman ? 'Coffee & Chat' : 'Coffee & Chat'}
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="outline"
                  size="lg"
                  className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary-600 backdrop-blur-sm"
                  icon={<Rocket className="w-6 h-6" />}
                  onClick={() => window.location.href = '/beta'}
                >
                  {isGerman ? 'Beta beitreten' : 'Join Beta'}
                </AnimatedButton>
              </motion.div>
              
              {/* Swiss Quality Badge */}
              <motion.div
                className="flex items-center justify-center space-x-2 mt-8 text-white/80"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.6 }}>
                  <SwissFlag className="w-6 h-6" />
                </motion.div>
                <span className="font-medium">
                  {isGerman 
                    ? "Swiss Made AI Excellence"
                    : "Swiss Made AI Excellence"
                  }
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
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

export default AboutPage