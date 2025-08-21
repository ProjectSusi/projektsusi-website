import { formatCurrency, formatNumber, isValidEmail, isValidSwissCompany } from '../lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toContain('CHF')
      expect(typeof formatCurrency(500)).toBe('string')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(500)).toBe('500')
      expect(typeof formatNumber(1000)).toBe('string')
    })
  })

  describe('isValidEmail', () => {
    it('should validate emails correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidSwissCompany', () => {
    it('should validate Swiss domains correctly', () => {
      expect(isValidSwissCompany('company.ch')).toBe(true)
      expect(isValidSwissCompany('company.swiss')).toBe(true)
      expect(isValidSwissCompany('company.com')).toBe(false)
    })
  })
})