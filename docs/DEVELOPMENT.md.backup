# Development Guide

## 🛠️ Development Environment Setup

### Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **Git**: Version control system
3. **Code Editor**: VS Code recommended with extensions:
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint

### First-Time Setup

```bash
# Clone and setup
git clone https://github.com/projektsusui/website.git
cd website

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Development Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Build for production
npm run start           # Start production server (after build)

# Quality Assurance
npm run lint            # ESLint code checking
npm run type-check      # TypeScript type checking
npm run format          # Prettier code formatting (if configured)

# Analysis
ANALYZE=true npm run build    # Bundle size analysis
npm run build:analyze   # Alternative bundle analysis

# Content Management
# Visit http://localhost:3000/admin/cms for content management
```

## 🏗️ Project Architecture

### File Organization

```
src/
├── components/
│   ├── demo/              # RAG system integration
│   │   ├── demo-widget.tsx
│   │   ├── live-rag-integration.tsx
│   │   ├── mobile-rag-interface.tsx
│   │   └── rag-interface.tsx
│   ├── layout/            # Site layout components
│   │   ├── footer.tsx
│   │   ├── layout.tsx
│   │   └── navigation.tsx
│   ├── premium/           # Premium Swiss components
│   │   ├── micro-interactions.tsx
│   │   ├── swiss-visuals.tsx
│   │   └── world-class-polish.tsx
│   ├── providers/         # React context providers
│   │   ├── animation-provider.tsx
│   │   └── error-boundary.tsx
│   ├── sections/          # Page sections
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── pricing.tsx
│   │   └── testimonials.tsx
│   ├── seo/              # SEO components
│   │   └── seo-head.tsx
│   └── ui/               # Base UI components
│       ├── animated-button.tsx
│       ├── animated-card.tsx
│       ├── badge.tsx
│       └── loading-spinner.tsx
├── hooks/                # Custom React hooks
│   └── use-scroll-animations.ts
├── lib/                  # Utility functions
│   ├── cms/              # Content Management System
│   │   ├── content-store.ts
│   │   └── content-types.ts
│   ├── animations.ts
│   └── utils.ts
└── styles/               # Global styles
    ├── globals.css
    └── premium.css
```

### Component Patterns

#### 1. Page Components

```typescript
// pages/example.tsx
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Layout from '@/components/layout/layout'
import SEOHead from '@/components/seo/seo-head'

export default function ExamplePage() {
  return (
    <>
      <SEOHead 
        title="Example Page"
        description="Page description"
      />
      <Layout>
        {/* Page content */}
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}
```

#### 2. Reusable Components

```typescript
// src/components/ui/example-component.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ExampleComponentProps {
  title: string
  description?: string
  variant?: 'primary' | 'secondary'
  className?: string
  children?: React.ReactNode
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  description,
  variant = 'primary',
  className,
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-lg",
        variant === 'primary' ? 'bg-primary text-white' : 'bg-secondary text-gray-900',
        className
      )}
    >
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="mt-2">{description}</p>}
      {children}
    </motion.div>
  )
}

export default ExampleComponent
```

### State Management

The website uses React's built-in state management:

1. **Local State**: `useState` for component-specific state
2. **Context**: React Context for app-wide state (animations, theme)
3. **Server State**: CMS content fetched via API routes

### Styling Approach

#### Tailwind CSS Classes

```typescript
// Use Tailwind utility classes
<div className="bg-primary text-white p-6 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold mb-4">Swiss Design</h2>
  <p className="text-primary-100">Content description</p>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>

// Swiss color palette usage
<button className="bg-primary hover:bg-primary-700 text-white">
  Swiss Red Button
</button>
```

#### Custom CSS (when needed)

```css
/* src/styles/globals.css */
.swiss-gradient {
  background: linear-gradient(135deg, #C41E3A 0%, #A61E2E 100%);
}

.swiss-shadow {
  box-shadow: 0 10px 25px rgba(196, 30, 58, 0.1);
}
```

## 🌐 Internationalization

### Adding Translations

1. **Add to German file** (`public/locales/de/common.json`):
```json
{
  "nav": {
    "home": "Startseite",
    "about": "Über uns",
    "contact": "Kontakt"
  },
  "hero": {
    "title": "Schweizer KI-Lösung",
    "subtitle": "Intelligente Dokumentenanalyse"
  }
}
```

2. **Add to English file** (`public/locales/en/common.json`):
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "hero": {
    "title": "Swiss AI Solution", 
    "subtitle": "Intelligent Document Analysis"
  }
}
```

3. **Use in components**:
```typescript
import { useTranslation } from 'next-i18next'

export default function Component() {
  const { t } = useTranslation('common')
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
    </div>
  )
}
```

### Translation Best Practices

- Keep keys descriptive and nested logically
- Use interpolation for dynamic content:
  ```json
  "welcome": "Welcome {{name}} to Projekt Susi"
  ```
- Handle plurals correctly:
  ```json
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
  ```

## 🎨 Design System

### Swiss Color Palette

```typescript
// tailwind.config.js colors
primary: {
  DEFAULT: '#C41E3A',    // Swiss Red
  50: '#FDF2F4',
  100: '#FCE7EA',
  // ... full scale
  900: '#751F27',
}

secondary: {
  DEFAULT: '#1F2937',    // Warm Dark Gray
  // ... full scale
}

accent: {
  DEFAULT: '#F5F5F5',    // Pure Silver-Gray
  // ... full scale
}
```

### Typography Scale

```css
/* Font families */
font-sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif']
font-heading: ['Helvetica Neue', 'Inter', 'Arial', 'sans-serif']
font-mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']

/* Usage */
.text-heading { @apply font-heading font-bold; }
.text-body { @apply font-sans; }
.text-code { @apply font-mono text-sm; }
```

### Component Variants

```typescript
// Button variants
const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary-700',
  secondary: 'bg-secondary text-white hover:bg-secondary-700',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  swiss: 'bg-gradient-to-r from-primary to-primary-700 text-white',
  alpine: 'bg-accent text-secondary border border-gray-200'
}
```

### Animation Guidelines

```typescript
// Framer Motion presets
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

// Usage
<motion.div {...fadeIn}>
  Content
</motion.div>
```

## 📊 Content Management

### CMS Architecture

The CMS uses a file-based approach with JSON storage:

```typescript
// Content structure
interface CMSContent {
  id: string              // Unique identifier
  slug: string           // URL slug
  type: ContentType      // Content type (hero, feature, etc.)
  locale: 'de' | 'en'   // Language
  title: string          // Display title
  content: any           // Flexible content object
  status: 'draft' | 'published' | 'archived'
  version: number        // Version tracking
  // timestamps...
}
```

### Adding New Content Types

1. **Define type in content-types.ts**:
```typescript
export interface NewContentType {
  title: string
  description: string
  customField: string
}

export type ContentType = 
  | 'existing-types'
  | 'new-content-type'  // Add here
```

2. **Add to CMS admin interface**:
```typescript
// In pages/admin/cms.tsx
<option value="new-content-type">New Content Type</option>
```

3. **Use in components**:
```typescript
const content = await getContentBySlug('example-slug', 'en')
if (content?.type === 'new-content-type') {
  // Handle new content type
}
```

### Content Backup & Versioning

```bash
# Content is automatically backed up in content/backups/
# Each edit creates a timestamped backup file

# Manual backup
cp content/cms-content.json content/backup-$(date +%Y%m%d).json
```

## 🚀 Performance Optimization

### Bundle Analysis

```bash
# Generate bundle analysis
ANALYZE=true npm run build

# View reports
open analyze/client.html
open analyze/server.html
```

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})

// Route-based splitting is automatic with Next.js
```

### Image Optimization

```typescript
// For static export, optimize manually
// Use tools like imagemin, sharp, or online services

// Responsive images
<picture>
  <source media="(min-width: 768px)" srcSet="image-large.webp" />
  <source media="(min-width: 480px)" srcSet="image-medium.webp" />
  <img src="image-small.webp" alt="Description" loading="lazy" />
</picture>
```

### Caching Strategy

```typescript
// API routes with caching
res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')

// Static assets (handled by Next.js config)
// Cache-Control: public, max-age=31536000, immutable
```

## 🧪 Testing Strategy

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Create jest.config.js
```

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Example Tests

```typescript
// __tests__/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react'
import AnimatedButton from '@/components/ui/animated-button'

describe('AnimatedButton', () => {
  it('renders button with text', () => {
    render(<AnimatedButton>Click me</AnimatedButton>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies variant classes', () => {
    render(<AnimatedButton variant="primary">Button</AnimatedButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })
})
```

### E2E Testing

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Create e2e tests
mkdir e2e
```

```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  await expect(page).toHaveTitle(/Projekt Susi/)
  await expect(page.locator('h1')).toContainText('Swiss AI')
})

test('language switching works', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  await page.click('[data-testid=language-switcher]')
  await page.click('[data-testid=language-de]')
  
  await expect(page.locator('h1')).toContainText('Schweizer')
})
```

## 🔧 Debugging

### Development Tools

```typescript
// Next.js debugging
DEBUG=* npm run dev

// React Developer Tools (browser extension)
// Check component props and state

// Network debugging
// Use browser DevTools Network tab

// Performance debugging
// Use Lighthouse and browser Performance tab
```

### Common Issues

#### 1. Translation Keys Missing
```bash
# Check console for missing translation warnings
# Add missing keys to both de and en translation files
```

#### 2. Hydration Errors
```typescript
// Ensure server and client render the same content
// Use dynamic imports with ssr: false for client-only components

const ClientOnlyComponent = dynamic(
  () => import('@/components/client-only'),
  { ssr: false }
)
```

#### 3. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Check TypeScript errors
npm run type-check

# Check for unused imports
npm run lint
```

### Error Monitoring

```typescript
// Error boundary usage
import ErrorBoundary from '@/components/providers/error-boundary'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
```

## 🚀 Deployment

### Build Optimization

```bash
# Production build with analysis
ANALYZE=true npm run build

# Check bundle sizes and optimize imports
# Remove unused dependencies
npm run build
```

### Environment Configuration

```bash
# .env.local (development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CMS_API_KEY=dev-key

# .env.production (production)
NEXT_PUBLIC_SITE_URL=https://projektsusui.ch
CMS_API_KEY=secure-production-key
```

### CDN Deployment

```bash
# Build static export
npm run build

# Deploy /out directory to:
# - Vercel
# - Netlify  
# - Cloudflare Pages
# - AWS S3 + CloudFront
```

---

**Happy coding! 🚀**