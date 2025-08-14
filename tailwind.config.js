/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#C41E3A', // True Swiss Red
          foreground: '#FFFFFF',
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F8D0D6',
          300: '#F2A8B4',
          400: '#EA7A8D',
          500: '#DD4B65',
          600: '#C41E3A',
          700: '#A61E2E',
          800: '#8B1F29',
          900: '#751F27',
        },
        secondary: {
          DEFAULT: '#1F2937', // Warm Dark Gray
          foreground: '#F9FAFB',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        accent: {
          DEFAULT: '#F5F5F5', // Pure Silver-Gray
          foreground: '#1F2937',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        alpine: {
          DEFAULT: '#F5F5F5', // Pure Silver-Gray (matches accent)
          foreground: '#1F2937',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: '#059669',
        warning: '#D97706',
        destructive: {
          DEFAULT: '#FF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Helvetica Neue', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0px)' },
        },
        'slide-in-left': {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0px)' },
        },
        'slide-in-right': {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-in-left': 'slide-in-left 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
      },
    },
  },
  plugins: [],
}