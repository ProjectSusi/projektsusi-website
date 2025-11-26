import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/layout/layout'
import { 
  SwissFlag, 
  SwissShield, 
  SwissAlps, 
  DataVisualization,
  SwissClockElement
} from '@/components/premium/swiss-visuals'
import { 
  MorphingCard,
  StaggeredFadeIn,
  AnimatedCounter,
  ProgressRing
} from '@/components/premium/micro-interactions'
import { Button } from '@/components/ui/button'
import { 
  Brain,
  Database,
  Shield,
  Zap,
  Target,
  Settings,
  Lock,
  Globe,
  FileText,
  Search,
  CheckCircle,
  ArrowRight,
  Cpu,
  Cloud,
  Code,
  Layers,
  Network,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface TechnologyPageProps {
  locale: string
}

const TechnologyPage: React.FC<TechnologyPageProps> = ({ locale }) => {
  const isGerman = locale === 'de'

  const techFeatures = [
    {
      id: 'hybrid-search',
      title: isGerman ? 'Hybrid Search Engine' : 'Hybrid Search Engine',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      description: isGerman
        ? 'FAISS Vector-Suche kombiniert mit BM25 Keyword-Matching für optimale Präzision'
        : 'FAISS vector search combined with BM25 keyword matching for optimal precision',
      details: [
        isGerman ? 'FAISS Vector Similarity' : 'FAISS vector similarity',
        isGerman ? 'BM25 Keyword Scoring' : 'BM25 keyword scoring',
        isGerman ? '384-dim Embeddings' : '384-dim embeddings',
        isGerman ? 'Seitengenau Quellenangaben' : 'Page-accurate citations'
      ],
      metrics: { accuracy: 96, speed: 130, precision: 95 }
    },
    {
      id: 'swiss-architecture',
      title: isGerman ? 'Swiss Clean Architecture' : 'Swiss Clean Architecture',
      icon: Layers,
      color: 'from-primary to-secondary',
      description: isGerman 
        ? 'Modulare, skalierbare Architektur nach Schweizer Ingenieursprinzipien'
        : 'Modular, scalable architecture following Swiss engineering principles',
      details: [
        isGerman ? 'Dependency Injection Pattern' : 'Dependency injection pattern',
        isGerman ? 'Horizontale Auto-Skalierung' : 'Horizontal auto-scaling',
        isGerman ? 'Load Balancing' : 'Load balancing',
        isGerman ? 'Microservices Design' : 'Microservices design'
      ],
      metrics: { scalability: 95, performance: 98, reliability: 99 }
    },
    {
      id: 'conversation-memory',
      title: isGerman ? 'Conversation Memory' : 'Conversation Memory',
      icon: Globe,
      color: 'from-purple-500 to-pink-600',
      description: isGerman
        ? 'Session-basierte Kontextverwaltung für natürliche Follow-up-Fragen'
        : 'Session-based context management for natural follow-up questions',
      details: [
        isGerman ? 'Multilingual (DE/EN)' : 'Multilingual (DE/EN)',
        isGerman ? 'Session Management' : 'Session management',
        isGerman ? 'Kontext-Erhaltung' : 'Context retention',
        isGerman ? 'Follow-up Support' : 'Follow-up support'
      ],
      metrics: { languages: 2, retention: 98, usability: 95 }
    },
    {
      id: 'swiss-security',
      title: isGerman ? 'Swiss Security Stack' : 'Swiss Security Stack',
      icon: Shield,
      color: 'from-primary-500 to-primary-700',
      description: isGerman 
        ? 'Bank-Grade Sicherheit entwickelt für Schweizer Compliance-Anforderungen'
        : 'Bank-grade security built for Swiss compliance requirements',
      details: [
        isGerman ? 'Ende-zu-Ende Verschlüsselung' : 'End-to-end encryption',
        isGerman ? 'Zero-Trust Architecture' : 'Zero-trust architecture',
        isGerman ? 'Swiss Data Centers Only' : 'Swiss data centers only',
        isGerman ? 'FADP & GDPR konform' : 'FADP & GDPR compliant'
      ],
      metrics: { encryption: 100, compliance: 100, localLLM: 100 }
    }
  ]

  const architecture = [
    {
      layer: isGerman ? 'Präsentation' : 'Presentation',
      description: isGerman ? 'Swiss UI/UX + REST APIs' : 'Swiss UI/UX + REST APIs',
      technologies: ['Next.js', 'TypeScript', 'SwissUI'],
      icon: Eye
    },
    {
      layer: isGerman ? 'Business Logic' : 'Business Logic',
      description: isGerman ? 'RAG Engine + Clean Architecture' : 'RAG Engine + Clean Architecture',
      technologies: ['FastAPI', 'Pydantic', 'DI Container'],
      icon: Brain
    },
    {
      layer: isGerman ? 'AI & ML' : 'AI & ML',
      description: isGerman ? 'LLM Integration + Vector Search' : 'LLM Integration + Vector Search',
      technologies: ['Ollama', 'FAISS', 'Sentence Transformers'],
      icon: Cpu
    },
    {
      layer: isGerman ? 'Daten' : 'Data',
      description: isGerman ? 'SQLite + FAISS Vector Storage' : 'SQLite + FAISS vector storage',
      technologies: ['SQLite', 'FAISS', 'Embeddings (384-dim)'],
      icon: Database
    },
    {
      layer: isGerman ? 'Infrastruktur' : 'Infrastructure',
      description: isGerman ? 'Swiss Cloud + Kubernetes' : 'Swiss Cloud + Kubernetes',
      technologies: ['Swiss Hosting', 'K8s', 'Docker'],
      icon: Cloud
    }
  ]

  const ragFlow = [
    {
      step: 1,
      title: isGerman ? 'Dokument Upload' : 'Document Upload',
      description: isGerman ? 'Sichere Verschlüsselung & Validierung' : 'Secure encryption & validation',
      icon: FileText
    },
    {
      step: 2,
      title: isGerman ? 'Text Extraktion' : 'Text Extraction',
      description: isGerman ? 'Multi-Format Processing (PDF, DOCX, etc.)' : 'Multi-format processing (PDF, DOCX, etc.)',
      icon: Code
    },
    {
      step: 3,
      title: isGerman ? 'Embedding Generierung' : 'Embedding Generation',
      description: isGerman ? 'Semantic Vector Representations' : 'Semantic vector representations',
      icon: Network
    },
    {
      step: 4,
      title: isGerman ? 'Vector Storage' : 'Vector Storage',
      description: isGerman ? 'FAISS Index + Metadaten' : 'FAISS index + metadata',
      icon: Database
    },
    {
      step: 5,
      title: isGerman ? 'Query Processing' : 'Query Processing',
      description: isGerman ? 'Similarity Search + Ranking' : 'Similarity search + ranking',
      icon: Search
    },
    {
      step: 6,
      title: isGerman ? 'LLM Generation' : 'LLM Generation',
      description: isGerman ? 'Context-basierte Antwort + Sources' : 'Context-based response + sources',
      icon: Brain
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <SwissAlps />
          </div>
          <div className="absolute top-20 right-20 opacity-20">
            <SwissClockElement className="w-32 h-32" showTime />
          </div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <Brain className="w-12 h-12 text-primary" />
                <h1 className="text-5xl lg:text-7xl font-bold text-secondary">
                  {isGerman ? 'Swiss AI Technologie' : 'Swiss AI Technology'}
                </h1>
                <SwissShield className="w-12 h-12" glowing />
              </div>
              
              <p className="text-xl lg:text-2xl text-secondary/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                {isGerman 
                  ? '🔬 Zero-Hallucination RAG-Technologie entwickelt mit Schweizer Präzision für maximale Zuverlässigkeit und Compliance.'
                  : '🔬 Zero-hallucination RAG technology built with Swiss precision for maximum reliability and compliance.'}
              </p>

              <div className="flex justify-center space-x-8 mb-12">
                {[
                  { icon: Target, value: 384, label: isGerman ? 'Embedding Dims' : 'Embedding Dims', suffix: '' },
                  { icon: Shield, value: 100, label: isGerman ? 'Swiss Hosted' : 'Swiss Hosted', suffix: '%' },
                  { icon: Zap, value: 2, label: isGerman ? 'Sek. Response' : 'Sec Response', suffix: '<' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="glass-morphism rounded-xl p-4 mb-2">
                      <stat.icon className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                      <AnimatedCounter 
                        value={stat.value} 
                        suffix={stat.suffix || ''}
                        prefix={stat.suffix === '<' ? '<' : ''}
                        className="text-2xl font-bold text-secondary" 
                      />
                    </div>
                    <p className="text-sm text-secondary/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Technologies */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'Kern-Technologien' : 'Core Technologies'}
              </h2>
              <p className="text-xl text-secondary/70">
                {isGerman 
                  ? 'Vier Säulen unserer Swiss AI Innovation'
                  : 'Four pillars of our Swiss AI innovation'}
              </p>
            </div>

            <StaggeredFadeIn className="space-y-12">
              {techFeatures.map((feature, index) => (
                <div key={feature.id} className="max-w-5xl mx-auto">
                  <MorphingCard className="p-8 lg:p-12 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                      {/* Icon & Title */}
                      <div className="text-center lg:text-left">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto lg:mx-0 mb-6`}>
                          <feature.icon className="w-10 h-10 text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-secondary mb-4">{feature.title}</h3>
                        <p className="text-secondary/80 mb-6">{feature.description}</p>
                        
                        <ul className="space-y-2">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-secondary/80">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Metrics */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {Object.entries(feature.metrics).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <ProgressRing 
                                progress={value} 
                                size={100}
                                className="mb-4"
                              >
                                <span className="text-lg font-bold">{value}{typeof value === 'number' && value <= 100 ? '%' : ''}</span>
                              </ProgressRing>
                              <p className="text-secondary/70 font-medium capitalize">{key}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </MorphingCard>
                </div>
              ))}
            </StaggeredFadeIn>
          </div>
        </section>

        {/* Architecture Overview */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'Swiss Clean Architecture' : 'Swiss Clean Architecture'}
              </h2>
              <p className="text-xl text-secondary/70">
                {isGerman 
                  ? 'Fünf-Schichten Architektur für maximale Skalierbarkeit und Wartbarkeit'
                  : 'Five-layer architecture for maximum scalability and maintainability'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {architecture.map((layer, index) => (
                  <MorphingCard key={index} className="p-6 hover-lift">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                        <layer.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-secondary mb-2">{layer.layer}</h3>
                        <p className="text-secondary/80 mb-3">{layer.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {layer.technologies.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </MorphingCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RAG Process Flow */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'RAG Process Flow' : 'RAG Process Flow'}
              </h2>
              <p className="text-xl text-secondary/70">
                {isGerman 
                  ? 'Wie Ihre Dokumente zu intelligenten Antworten werden'
                  : 'How your documents become intelligent answers'}
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ragFlow.map((step, index) => (
                  <MorphingCard key={step.step} className="p-6 text-center hover-lift">
                    <div className="relative">
                      {/* Step Number */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                        {step.step}
                      </div>
                      
                      {/* Connection Line */}
                      {index < ragFlow.length - 1 && (
                        <div className="hidden lg:block absolute top-6 left-full w-6 h-0.5 bg-gradient-to-r from-primary-300 to-transparent" />
                      )}
                    </div>
                    
                    <step.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-secondary mb-3">{step.title}</h3>
                    <p className="text-secondary/80 text-sm">{step.description}</p>
                  </MorphingCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">
                {isGerman ? 'Technische Spezifikationen' : 'Technical Specifications'}
              </h2>
              <p className="text-xl text-secondary/70">
                {isGerman 
                  ? 'Enterprise-Grade Performance und Sicherheit'
                  : 'Enterprise-grade performance and security'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  category: isGerman ? 'Performance' : 'Performance',
                  specs: [
                    '< 2s Response Zeit',
                    'Schweizer Server',
                    'Lokales LLM (Ollama)',
                    '~130ms Vector Search'
                  ],
                  icon: Zap,
                  color: 'text-yellow-500'
                },
                {
                  category: isGerman ? 'Sicherheit' : 'Security',
                  specs: [
                    'AES-256 Verschlüsselung',
                    'Zero-Trust Architecture',
                    'Swiss Data Centers',
                    'FADP & GDPR konform'
                  ],
                  icon: Shield,
                  color: 'text-primary-500'
                },
                {
                  category: isGerman ? 'Skalierbarkeit' : 'Scalability',
                  specs: [
                    'Kubernetes Native',
                    'Horizontal Auto-scaling',
                    'Load Balancing',
                    'Multi-Region Support'
                  ],
                  icon: Settings,
                  color: 'text-primary'
                },
                {
                  category: isGerman ? 'Integration' : 'Integration',
                  specs: [
                    'REST + GraphQL APIs',
                    'Webhook Support',
                    'SSO Integration',
                    'Multi-DB Support'
                  ],
                  icon: Network,
                  color: 'text-green-500'
                },
                {
                  category: isGerman ? 'Compliance' : 'Compliance',
                  specs: [
                    'FADP Konform',
                    'GDPR Ready',
                    'FINMA Standards',
                    'Audit Logging'
                  ],
                  icon: CheckCircle,
                  color: 'text-purple-500'
                },
                {
                  category: isGerman ? 'Sprachen' : 'Languages',
                  specs: [
                    'Deutsch (DE)',
                    'Français (FR)',
                    'Italiano (IT)',
                    'English (EN)'
                  ],
                  icon: Globe,
                  color: 'text-orange-500'
                }
              ].map((category, index) => (
                <MorphingCard key={index} className="p-6 hover-lift">
                  <div className="flex items-center space-x-3 mb-4">
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                    <h3 className="text-xl font-bold text-secondary">{category.category}</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {category.specs.map((spec, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-secondary/80">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </MorphingCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <SwissFlag className="w-16 h-16 mx-auto mb-8" />
              
              <h2 className="text-4xl font-bold text-white mb-6">
                {isGerman ? 'Erleben Sie Swiss AI Technology' : 'Experience Swiss AI Technology'}
              </h2>
              
              <p className="text-xl text-white/90 mb-8">
                {isGerman 
                  ? 'Testen Sie unsere Zero-Hallucination RAG-Technologie kostenlos in unserem Beta-Programm.'
                  : 'Test our zero-hallucination RAG technology free in our beta program.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-platin-100 px-8 py-4 text-lg" asChild>
                  <Link href="/demo">
                    <Brain className="w-6 h-6 mr-2" />
                    {isGerman ? 'Live Tech Demo' : 'Live Tech Demo'}
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" className="border-white/80 text-white bg-black/10 hover:bg-white hover:text-primary-600 px-8 py-4 text-lg backdrop-blur-sm" asChild>
                  <Link href="/contact">
                    <Code className="w-6 h-6 mr-2" />
                    {isGerman ? 'Technical Deep Dive' : 'Technical Deep Dive'}
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-8 text-white/80">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span className="text-sm">{isGerman ? 'Quellenangaben' : 'Source Citations'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">{isGerman ? 'Bank-Grade Security' : 'Bank-Grade Security'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm">{isGerman ? '4 Sprachen' : '4 Languages'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
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

export default TechnologyPage