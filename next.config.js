/** @type {import('next').NextConfig} */

// Security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://plausible.io https://rag.sirth.ch https://temora.ch",
      "frame-src 'self' https://rag.sirth.ch",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
]

const nextConfig = {
  output: 'export',
  trailingSlash: true,

  // Security headers (applied during dev, configure Cloudflare for production)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/admin/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ],
      },
    ]
  },

  // Image optimization (disabled for static export)
  images: {
    unoptimized: true,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable compression
  compress: true,

  // Disable powered by header
  poweredByHeader: false,

  // Generate etags
  generateEtags: true,

  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer (only if package is installed)
    if (process.env.ANALYZE === 'true') {
      try {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: isServer
              ? '../analyze/server.html'
              : './analyze/client.html',
          })
        )
      } catch (e) {
        console.warn('webpack-bundle-analyzer not installed, skipping bundle analysis')
      }
    }

    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            framer: {
              test: /[\/]node_modules[\/]framer-motion[\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 20,
            },
            lucide: {
              test: /[\/]node_modules[\/]lucide-react[\/]/,
              name: 'lucide-react',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      }
    }

    return config
  },
}

module.exports = nextConfig
