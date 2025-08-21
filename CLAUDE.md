# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Projekt Susi Website** - A production-ready Next.js 14 marketing website for a Swiss AI RAG (Retrieval-Augmented Generation) solution. Features comprehensive CMS, performance optimizations, security hardening, mobile-first design, and enterprise-grade error handling. Bilingual (German/English) with Swiss design system.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (localhost:3000)
npm run dev

# Build for production (creates static export in /out)
npm run build

# Type checking and linting
npm run type-check
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Bundle analysis
npm run analyze

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Utility commands
npm run serve          # Serve built files locally
npm run clean          # Clean build artifacts
npm run cms:reset      # Reset CMS content
npm run validate       # Run all checks (type-check, lint, format)
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with TypeScript (static export configuration)
- **Styling**: Tailwind CSS with custom Swiss-inspired design system
- **Internationalization**: next-i18next for German/English support
- **Animations**: Framer Motion for premium interactions
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Fonts**: Inter (body), JetBrains Mono (code), Helvetica Neue (headings)

### Key Configuration Files
- `next.config.js`: Static export output with trailing slashes, unoptimized images for static deployment
- `tailwind.config.js`: Swiss color palette (red #C41E3A, gray, silver), custom animations, responsive breakpoints
- `tsconfig.json`: Path aliases (@/components, @/lib, @/styles, @/hooks), strict mode enabled
- `next-i18next.config.js`: i18n configuration for de/en locales

### Project Structure

```
website/
├── pages/                      # Next.js pages with file-based routing
│   ├── _app.tsx               # App wrapper with i18n, SEO meta tags, font loading
│   ├── index.tsx              # Homepage
│   ├── solutions/[industry].tsx # Dynamic industry pages
│   └── api/                   # API routes for contact/newsletter
├── src/
│   ├── components/
│   │   ├── demo/              # Demo widgets including live RAG integration
│   │   ├── layout/            # Navigation, footer, layout wrapper
│   │   ├── premium/           # Premium Swiss-themed components
│   │   ├── sections/          # Reusable page sections (hero, features, pricing)
│   │   ├── ui/                # Base UI components (buttons, cards, modals)
│   │   └── seo/               # SEO components
│   ├── hooks/                 # Custom React hooks (scroll animations)
│   ├── lib/                   # Utilities (cn for classnames, animations)
│   └── styles/                # Global CSS and premium styles
├── public/locales/            # Translation JSON files (de/en)
└── out/                       # Static export output directory
```

### Important Components

#### Live RAG Integration (`src/components/demo/live-rag-integration.tsx`)
- Embeds production RAG system via iframe from https://rag.sirth.ch/ui
- Handles connection states, fullscreen mode, and fallback UI
- Security: Proper sandbox attributes and referrer policy

#### Premium Components (`src/components/premium/`)
- Swiss-themed visual elements with micro-interactions
- World-class polish for enterprise presentation
- Mobile-optimized experience

#### Layout System (`src/components/layout/`)
- Responsive navigation with language switcher
- Footer with Swiss compliance badges
- Consistent page wrapper with SEO optimization

### Swiss Design System

**Color Palette**:
- Primary: Swiss Red (#C41E3A)
- Secondary: Warm Dark Gray (#1F2937)
- Accent/Alpine: Silver Gray (#F5F5F5)
- Success: Green (#059669)
- Warning: Orange (#D97706)

**Typography**:
- Helvetica Neue for headings (Swiss heritage)
- Inter for body text (modern readability)
- JetBrains Mono for code blocks

**Component Variants**:
- Buttons: swiss, alpine, primary, outline variants
- Cards: Animated with hover effects
- Sections: Fade-in animations on scroll

### Internationalization

**Supported Locales**:
- German (de) - Primary language for Swiss market
- English (en) - International audience

**Translation Files**:
- `public/locales/de/common.json` - German translations
- `public/locales/en/common.json` - English translations

**Usage in Components**:
```typescript
import { useTranslation } from 'next-i18next'

const { t } = useTranslation('common')
const title = t('hero.title')
```

### SEO & Meta Tags

The `_app.tsx` file handles comprehensive SEO setup:
- OpenGraph and Twitter meta tags
- Swiss-specific geo targeting
- Structured data for organization
- Multilingual support with hreflang
- Canonical URLs for each page

### API Routes

**Contact Form** (`pages/api/contact.ts`):
- Handles contact form submissions
- Input validation and sanitization
- Rate limiting considerations

**Newsletter** (`pages/api/newsletter.ts`):
- Newsletter signup endpoint
- Email validation
- Integration ready for email services

### Build & Deployment

**Static Export**:
- Site is built as static HTML in `/out` directory
- All pages pre-rendered at build time
- Suitable for CDN hosting (Cloudflare Pages, Vercel)

**Environment Variables** (when needed):
```env
NEXT_PUBLIC_DEMO_API_URL=https://rag.sirth.ch
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=projektsusui.ch
```

### Performance Considerations

- Images are unoptimized for static export (next.config.js)
- Fonts loaded with swap display strategy
- Components use dynamic imports where appropriate
- Framer Motion animations are performance-optimized

### Security Considerations

- iframe sandbox attributes for RAG system embed
- CORS handling for external API calls
- Input validation on all forms
- CSP headers configured for production

### Testing Approach

When testing changes:
1. Run `npm run type-check` to verify TypeScript
2. Run `npm run lint` for code quality
3. Test both German and English translations
4. Verify responsive design at all breakpoints
5. Check static export with `npm run build && npx serve out`

### Common Tasks

**Adding a New Page**:
1. Create file in `pages/` directory
2. Add translations to `public/locales/*/common.json`
3. Update navigation in `src/components/layout/navigation.tsx`
4. Add SEO metadata in page component

**Updating Translations**:
1. Edit `public/locales/de/common.json` for German
2. Edit `public/locales/en/common.json` for English
3. Keep keys consistent between both files

**Modifying Swiss Theme**:
1. Update colors in `tailwind.config.js`
2. Adjust component variants in respective files
3. Maintain Swiss design principles (clean, precise, premium)

**Integrating with Backend RAG System**:
- Current integration URL: https://rag.sirth.ch/ui
- Update `NEXT_PUBLIC_DEMO_API_URL` for API endpoints
- Modify `src/components/demo/live-rag-integration.tsx` for deeper integration