module.exports = {
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    localeDetection: false,
  },
  fallbackLng: {
    default: ['de'],
    en: ['en'],
    de: ['de'],
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
}