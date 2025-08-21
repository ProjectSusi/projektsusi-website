# Projekt Susi Website Documentation

## 📋 Overview

This is the official marketing website for Projekt Susi, a Swiss AI RAG (Retrieval-Augmented Generation) solution. The website is built with Next.js 14, TypeScript, and Tailwind CSS, featuring a bilingual (German/English) interface optimized for Swiss enterprises.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/projektsusui/website.git
cd website

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:3000
```

### Build for Production

```bash
# Build static export
npm run build

# The output will be in the /out directory
# Serve locally to test
npx serve out
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom Swiss design system
- **Internationalization**: next-i18next (German/English)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Content Management**: File-based CMS with JSON storage
- **Deployment**: Static export compatible with CDNs

### Project Structure

```
website/
├── pages/                      # Next.js pages (file-based routing)
│   ├── _app.tsx               # App configuration, i18n, SEO
│   ├── index.tsx              # Homepage
│   ├── api/                   # API endpoints
│   │   ├── cms/               # CMS API for content management
│   │   ├── contact.ts         # Contact form handler
│   │   ├── newsletter.ts      # Newsletter signup
│   │   └── sitemap.xml.ts     # Dynamic sitemap generator
│   ├── admin/                 # CMS admin interface
│   └── [locale]/              # Localized pages
├── src/
│   ├── components/
│   │   ├── demo/              # Demo and RAG integration components
│   │   ├── layout/            # Navigation, footer, layout
│   │   ├── premium/           # Premium Swiss-themed components
│   │   ├── providers/         # React providers (animation, error boundary)
│   │   ├── sections/          # Reusable page sections
│   │   ├── seo/               # SEO components
│   │   └── ui/                # Base UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   │   ├── cms/               # Content management system
│   │   └── utils.ts           # Utility functions
│   └── styles/                # Global CSS and Tailwind
├── public/
│   ├── locales/               # Translation files (de/en)
│   └── static assets          # Images, icons, etc.
├── content/                   # CMS content storage (created dynamically)
├── docs/                      # Documentation
└── configuration files        # Next.js, Tailwind, TypeScript configs
```

### Key Features

#### 🌐 Bilingual Support

The website supports German (primary) and English using next-i18next:

- Automatic language detection
- SEO-optimized language switching
- Separate translation files for each locale
- Localized URLs and content

#### 🎨 Swiss Design System

Custom design system with Swiss-inspired elements:

- **Colors**: Swiss Red (#C41E3A), silver/gray palette
- **Typography**: Helvetica Neue (headings), Inter (body), JetBrains Mono (code)
- **Components**: Premium animations, micro-interactions
- **Responsive**: Mobile-first design with Swiss precision

#### 📱 Mobile-Optimized RAG Integration

Intelligent demo system that adapts to device capabilities:

- Desktop: Full iframe integration with the RAG system
- Mobile: Optimized interface with external app launch
- Fallback: Graceful degradation for connectivity issues

#### 🔧 Content Management System

Simple file-based CMS for easy content updates:

- JSON-based content storage
- Admin interface at `/admin/cms`
- Content versioning and backup
- Support for multiple content types (hero, features, pricing, blog)

## 📝 Content Management

### Accessing the CMS

1. Navigate to `/admin/cms`
2. Enter the admin password (development: "admin")
3. Manage content through the web interface

### Content Types

- **Hero**: Homepage hero sections
- **Feature**: Product features and benefits
- **Pricing**: Pricing plans and packages
- **Testimonial**: Customer testimonials
- **FAQ**: Frequently asked questions
- **Blog**: Blog posts and articles
- **Solution**: Industry-specific solutions
- **Global**: Site-wide settings

### Content Structure

Each content item includes:

```typescript
{
  id: string                    // Unique identifier
  slug: string                  // URL slug
  type: ContentType            // Content type
  locale: 'de' | 'en'         // Language
  title: string                // Display title
  description?: string         // Optional description
  content: Record<string, any> // Flexible content object
  metadata?: CMSMetadata       // SEO and meta information
  status: 'draft' | 'published' | 'archived'
  version: number              // Version tracking
  timestamps...                // Created, updated, published dates
}
```

## 🎯 SEO & Performance

### SEO Features

- **Meta Tags**: Comprehensive meta tags for all pages
- **Open Graph**: Social media sharing optimization
- **Structured Data**: Schema.org markup for organization
- **Sitemap**: Dynamic sitemap generation at `/api/sitemap.xml`
- **Multilingual**: Proper hreflang implementation
- **Swiss Targeting**: Geo-specific meta tags

### Performance Optimizations

- **Bundle Splitting**: Optimized chunk splitting for vendor libraries
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: WebP/AVIF support (when not static export)
- **Font Optimization**: Optimized Google Fonts loading
- **Caching**: Proper cache headers for static assets
- **Compression**: Gzip compression enabled

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- XSS Protection

## 🚀 Deployment

### Static Export (Current)

The website is configured for static export, suitable for CDN hosting:

```bash
npm run build
# Outputs to /out directory
```

Hosting options:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables

```env
# Required for CMS (development)
CMS_API_KEY=your_cms_api_key

# Optional
NEXT_PUBLIC_SITE_URL=https://projektsusui.ch
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=projektsusui.ch
NEXT_PUBLIC_DEMO_RAG_URL=https://rag.sirth.ch
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Homepage loads correctly in both languages
- [ ] Navigation works on mobile and desktop
- [ ] Contact form submits successfully
- [ ] Demo integration works on both desktop and mobile
- [ ] All pages are SEO optimized
- [ ] Performance metrics are within targets
- [ ] Accessibility standards are met

## 🔧 Development

### Adding New Pages

1. Create page component in `pages/` directory
2. Add translations to `public/locales/*/common.json`
3. Update navigation in `src/components/layout/navigation.tsx`
4. Add to sitemap in `pages/api/sitemap.xml.ts`

### Modifying Design System

1. Update colors in `tailwind.config.js`
2. Modify component variants in respective files
3. Test across all components
4. Update documentation

### Content Updates

#### Via CMS (Recommended)
1. Go to `/admin/cms`
2. Edit content through web interface
3. Changes are saved to `content/cms-content.json`

#### Manual Updates
1. Edit translation files in `public/locales/`
2. Restart development server
3. Changes appear immediately

## 📊 Analytics & Monitoring

### Implemented Analytics

- **Plausible Analytics**: Privacy-friendly analytics
- **Web Vitals**: Core performance metrics
- **Error Tracking**: Console error logging (development)

### Adding More Analytics

1. Update `pages/_app.tsx` with tracking code
2. Add scripts to SEO head component
3. Configure in environment variables

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### CMS Issues
```bash
# Reset CMS content
rm -rf content/
# CMS will regenerate with default content
```

#### Translation Issues
- Check translation keys exist in both `de` and `en` files
- Verify translation syntax is correct JSON
- Restart development server after changes

#### Mobile Demo Issues
- Ensure iframe sandbox attributes are correct
- Check CSP headers allow the demo domain
- Test fallback interface on actual mobile devices

### Performance Issues

1. **Bundle Size**: Use `ANALYZE=true npm run build` to analyze
2. **Images**: Optimize images before adding to public folder
3. **Fonts**: Limit font variations and weights
4. **JavaScript**: Review dynamic imports and code splitting

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Make changes following TypeScript/ESLint rules
3. Test responsive design at all breakpoints
4. Update translations if adding new content
5. Submit pull request with clear description

### Code Standards

- **TypeScript**: Strict mode enabled, proper typing required
- **ESLint**: Follow Next.js recommended rules
- **Prettier**: Code formatting (configure in IDE)
- **Commits**: Clear, descriptive commit messages

### Review Checklist

- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] Responsive design works on mobile/desktop
- [ ] Translations updated for new content
- [ ] Performance impact is minimal
- [ ] Accessibility guidelines followed

## 📞 Support

### Getting Help

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub issues
- **Development**: Contact the development team

### Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run type-check      # TypeScript checking
npm run lint            # Code linting

# Analysis
ANALYZE=true npm run build    # Bundle analysis
npm run build && npx serve out    # Test production build

# CMS
# Access at http://localhost:3000/admin/cms
```

---

**Last Updated**: January 2025
**Version**: 2.0
**Maintainer**: Projekt Susi Development Team