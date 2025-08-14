# ProjektSusui Website

World-class sales website for ProjektSusui - Swiss AI RAG Solution

## 🚀 Features

- **Modern Next.js 14** with App Router and TypeScript
- **Responsive Design** with Tailwind CSS and custom Swiss-inspired design system
- **Bilingual Support** (German/English) with next-i18next
- **Interactive Demo Widget** with real-time document processing simulation
- **SEO Optimized** with structured data, meta tags, and performance optimization
- **Swiss-focused** design and content tailored for Swiss enterprises
- **Enterprise-grade** components and pricing calculator

## 🛠 Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Internationalization**: next-i18next
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Fonts**: Inter + JetBrains Mono
- **Deployment**: Vercel (recommended)

## 🏗 Project Structure

```
website/
├── pages/                  # Next.js pages
│   ├── _app.tsx           # App wrapper with i18n
│   ├── index.tsx          # Homepage
│   ├── pricing.tsx        # Pricing page
│   └── [locale]/          # Localized routes
├── src/
│   ├── components/        # React components
│   │   ├── demo/         # Demo widget components
│   │   ├── layout/       # Navigation and footer
│   │   ├── sections/     # Page sections
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utilities and helpers
│   └── styles/           # Global CSS and Tailwind
├── public/
│   ├── locales/          # Translation files
│   │   ├── de/           # German translations
│   │   └── en/           # English translations
│   └── images/           # Static assets
└── config files          # Next.js, Tailwind, TypeScript configs
```

## 🎨 Design System

### Colors
- **Primary**: Swiss Red (#FF0000)
- **Secondary**: Deep Navy (#1B365D) 
- **Accent**: Silver (#C0C0C0)
- **Alpine**: Alpine Blue (#0066CC)

### Typography
- **Headings**: Helvetica Neue (Swiss heritage)
- **Body**: Inter (modern readability)
- **Code**: JetBrains Mono

### Components
- Custom button variants (swiss, alpine)
- Swiss-inspired card components
- Responsive navigation with dropdowns
- Interactive demo widget
- ROI calculator
- Pricing cards with comparison

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:3000

## 🌐 Internationalization

The site supports German (primary) and English:

- **German**: `/de` (default)
- **English**: `/en`

Translations are stored in `public/locales/[locale]/common.json`

## 🎪 Demo Integration

The interactive demo widget simulates the ProjektSusui RAG system:

- **File upload** with progress tracking
- **Sample documents** for different industries
- **Query processing** with simulated results
- **Swiss compliance** features showcase

To integrate with real backend:
1. Update `DEMO_API_URL` in demo widget
2. Implement actual file upload endpoint
3. Connect to ProjektSusui API for real processing

## 📊 SEO & Performance

- **Structured data** for organization and products
- **OpenGraph** and Twitter meta tags
- **Multilingual SEO** with hreflang
- **Performance optimized** images and fonts
- **Core Web Vitals** optimized
- **Swiss-specific** geo targeting

## 🛡 Security

- **CSP headers** configured
- **CSRF protection** middleware
- **Input validation** on all forms
- **Rate limiting** for demo endpoints
- **Swiss privacy** compliance ready

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interactions
- **Progressive enhancement**

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_DEMO_API_URL=https://your-api.ch/demo
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=projektsusui.ch
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### Deployment

**Vercel (Recommended)**:
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

**Other Platforms**:
```bash
npm run build
npm run start
```

## 🎯 Target Audience

- **Primary**: Swiss enterprises (Banking, Pharma, Manufacturing, Government)
- **Secondary**: European companies requiring Swiss data sovereignty
- **Languages**: German (primary), English (international)

## 💼 Business Focus

- **Swiss Data Sovereignty** messaging
- **Compliance-first** approach (FADP, GDPR, FINMA)
- **ROI-focused** pricing and value proposition  
- **Enterprise sales** funnel optimization

## 🔄 Updates & Maintenance

- **Content updates**: Modify translation files
- **Design changes**: Update Tailwind classes
- **New pages**: Add to pages/ directory
- **Components**: Extend src/components/

## 📈 Analytics

- **Plausible Analytics** for privacy-friendly tracking
- **Conversion tracking** on CTAs and demo interactions
- **Heatmaps** via Hotjar (optional)
- **Performance monitoring** via Web Vitals

## 🤝 Contributing

1. Create feature branch
2. Make changes with TypeScript
3. Test responsive design
4. Update translations if needed
5. Submit pull request

## 📞 Support

For website-related issues:
- **Development**: Check GitHub issues
- **Content**: Update translation files  
- **Design**: Modify Tailwind components
- **SEO**: Update meta tags and structured data

---

Built with ❤️ in Switzerland for Swiss enterprises.