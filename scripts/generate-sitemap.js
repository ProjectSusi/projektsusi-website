// Generate sitemap at build time for static export
const fs = require('fs')
const path = require('path')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://projektsusui.ch'

// Static pages to include in sitemap
const staticPages = [
  { loc: '/', priority: 1.0, changefreq: 'daily' },
  { loc: '/about', priority: 0.8, changefreq: 'monthly' },
  { loc: '/pricing', priority: 0.9, changefreq: 'weekly' },
  { loc: '/solutions', priority: 0.8, changefreq: 'weekly' },
  { loc: '/solutions/banking', priority: 0.7, changefreq: 'monthly' },
  { loc: '/solutions/pharma', priority: 0.7, changefreq: 'monthly' },
  { loc: '/solutions/manufacturing', priority: 0.7, changefreq: 'monthly' },
  { loc: '/solutions/government', priority: 0.7, changefreq: 'monthly' },
  { loc: '/technology', priority: 0.7, changefreq: 'monthly' },
  { loc: '/technology/api', priority: 0.6, changefreq: 'monthly' },
  { loc: '/technology/demo', priority: 0.7, changefreq: 'weekly' },
  { loc: '/demo', priority: 0.9, changefreq: 'daily' },
  { loc: '/contact', priority: 0.6, changefreq: 'monthly' },
  { loc: '/compliance', priority: 0.7, changefreq: 'monthly' },
  { loc: '/compliance/fadp', priority: 0.6, changefreq: 'monthly' },
  { loc: '/compliance/finma', priority: 0.6, changefreq: 'monthly' },
  { loc: '/compliance/security', priority: 0.6, changefreq: 'monthly' }
]

function generateSitemap() {
  const lastmod = new Date().toISOString()
  
  const urls = staticPages.map(page => {
    return `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  }).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  // Write to public directory
  const publicDir = path.join(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
  console.log('✅ Sitemap generated successfully')
}

function generateRobotsTxt() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`

  fs.writeFileSync(path.join(process.cwd(), 'public', 'robots.txt'), robots)
  console.log('✅ robots.txt generated successfully')
}

// Run if called directly
if (require.main === module) {
  generateSitemap()
  generateRobotsTxt()
}

module.exports = { generateSitemap, generateRobotsTxt }