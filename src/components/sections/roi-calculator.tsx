'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calculator,
  TrendingUp,
  Clock,
  Users,
  FileText,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Zap,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ROICalculatorProps {
  locale: string
}

interface CalculatorInputs {
  employees: number
  hoursSearchingPerDay: number
  avgHourlyRate: number
  documentsCount: number
}

/**
 * Realistic ROI Calculator based on industry benchmarks:
 * - McKinsey: Knowledge workers spend 1.8 hours/day searching for information
 * - RAG systems typically reduce search time by 50-70%
 * - Swiss professional hourly rates: CHF 80-150 (including overhead)
 * - Document retrieval accuracy improves from ~65% to ~90% with RAG
 */
const ROICalculator: React.FC<ROICalculatorProps> = ({ locale }) => {
  const isGerman = locale === 'de'
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Default values based on typical Swiss SME
  const [inputs, setInputs] = useState<CalculatorInputs>({
    employees: 25,
    hoursSearchingPerDay: 1.5, // Conservative estimate (industry avg is 1.8)
    avgHourlyRate: 95, // Swiss average including overhead
    documentsCount: 5000
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Realistic calculation based on documented productivity gains
  const calculations = useMemo(() => {
    const {
      employees,
      hoursSearchingPerDay,
      avgHourlyRate,
      documentsCount
    } = inputs

    // Time savings calculation
    // RAG systems typically reduce search time by 60% (conservative estimate)
    const timeReductionPercent = 0.60
    const hoursSearchingPerWeek = hoursSearchingPerDay * 5
    const hoursSearchingPerMonth = hoursSearchingPerWeek * 4.33

    // Hours saved per employee per month
    const hoursSavedPerEmployee = hoursSearchingPerMonth * timeReductionPercent

    // Total hours saved across all employees
    const totalHoursSavedPerMonth = hoursSavedPerEmployee * employees

    // Monetary savings
    const monthlySavings = totalHoursSavedPerMonth * avgHourlyRate
    const yearlySavings = monthlySavings * 12

    // Subscription cost estimation (based on document count and users)
    // Realistic pricing tiers
    let monthlySubscriptionCost: number
    if (employees <= 10 && documentsCount <= 5000) {
      monthlySubscriptionCost = 299 // Starter
    } else if (employees <= 50 && documentsCount <= 25000) {
      monthlySubscriptionCost = 599 // Professional
    } else {
      monthlySubscriptionCost = 999 // Enterprise
    }

    const yearlySubscriptionCost = monthlySubscriptionCost * 12

    // Net savings
    const netMonthlySavings = monthlySavings - monthlySubscriptionCost
    const netYearlySavings = yearlySavings - yearlySubscriptionCost

    // ROI calculation
    const roi = yearlySubscriptionCost > 0
      ? ((netYearlySavings) / yearlySubscriptionCost) * 100
      : 0

    // Payback period in months
    const paybackMonths = monthlySavings > 0
      ? monthlySubscriptionCost / (monthlySavings / 1)
      : 0

    // Additional productivity metrics
    const queriesPerDay = Math.round(employees * 8) // ~8 queries per employee per day
    const timePerQueryCurrent = 12 // minutes currently
    const timePerQueryWithRAG = 2 // minutes with RAG
    const timeSavedPerQuery = timePerQueryCurrent - timePerQueryWithRAG

    return {
      hoursSavedPerMonth: Math.round(totalHoursSavedPerMonth),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      monthlySubscriptionCost,
      netMonthlySavings: Math.round(netMonthlySavings),
      netYearlySavings: Math.round(netYearlySavings),
      roi: Math.round(roi),
      paybackMonths: paybackMonths < 1 ? 1 : Math.round(paybackMonths * 10) / 10,
      queriesPerDay,
      timeSavedPerQuery,
      timeReductionPercent: Math.round(timeReductionPercent * 100)
    }
  }, [inputs])

  const content = {
    de: {
      title: 'ROI Rechner',
      subtitle: 'Berechnen Sie Ihre Einsparungen',
      description: 'Sehen Sie, wie viel Zeit und Geld Ihr Unternehmen mit intelligenter Dokumentensuche sparen kann.',
      employees: 'Anzahl Mitarbeiter',
      searchHours: 'Suchzeit pro Tag (Stunden)',
      hourlyRate: 'Stundensatz (CHF)',
      documents: 'Anzahl Dokumente',
      results: {
        hoursSaved: 'Stunden gespart/Monat',
        monthlySavings: 'Monatliche Ersparnis',
        yearlySavings: 'Jährliche Ersparnis',
        roi: 'Return on Investment',
        payback: 'Amortisation',
        months: 'Monate',
        netSavings: 'Netto-Ersparnis/Jahr',
        subscriptionCost: 'Geschätzte Kosten/Monat'
      },
      cta: 'Kostenlose Demo anfordern',
      methodology: 'Basierend auf Industriestudien: Wissensarbeiter verbringen durchschnittlich 1.8 Stunden/Tag mit Informationssuche. RAG-Systeme reduzieren diese Zeit um 50-70%.',
      comparison: {
        title: 'Vorher vs. Nachher',
        before: 'Ohne Temora',
        after: 'Mit Temora',
        searchTime: 'Suchzeit pro Anfrage',
        minutes: 'Min.',
        accuracy: 'Treffergenauigkeit'
      }
    },
    en: {
      title: 'ROI Calculator',
      subtitle: 'Calculate Your Savings',
      description: 'See how much time and money your company can save with intelligent document search.',
      employees: 'Number of Employees',
      searchHours: 'Search Time per Day (Hours)',
      hourlyRate: 'Hourly Rate (CHF)',
      documents: 'Number of Documents',
      results: {
        hoursSaved: 'Hours Saved/Month',
        monthlySavings: 'Monthly Savings',
        yearlySavings: 'Yearly Savings',
        roi: 'Return on Investment',
        payback: 'Payback Period',
        months: 'months',
        netSavings: 'Net Savings/Year',
        subscriptionCost: 'Estimated Cost/Month'
      },
      cta: 'Request Free Demo',
      methodology: 'Based on industry studies: Knowledge workers spend an average of 1.8 hours/day searching for information. RAG systems reduce this time by 50-70%.',
      comparison: {
        title: 'Before vs. After',
        before: 'Without Temora',
        after: 'With Temora',
        searchTime: 'Search time per query',
        minutes: 'min.',
        accuracy: 'Search accuracy'
      }
    }
  }

  const t = isGerman ? content.de : content.en

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calculator className="w-4 h-4" />
            {t.title}
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t.subtitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Calculator Inputs */}
          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              {isGerman ? 'Ihre Unternehmensdaten' : 'Your Company Data'}
            </h3>

            <div className="space-y-8">
              {/* Employees Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {t.employees}
                  </label>
                  <span className="text-lg font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                    {inputs.employees}
                  </span>
                </div>
                <Slider
                  value={[inputs.employees]}
                  onValueChange={(value) => setInputs({ ...inputs, employees: value[0] })}
                  min={5}
                  max={500}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5</span>
                  <span>500</span>
                </div>
              </div>

              {/* Search Hours Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {t.searchHours}
                  </label>
                  <span className="text-lg font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                    {inputs.hoursSearchingPerDay}h
                  </span>
                </div>
                <Slider
                  value={[inputs.hoursSearchingPerDay * 10]}
                  onValueChange={(value) => setInputs({ ...inputs, hoursSearchingPerDay: value[0] / 10 })}
                  min={5}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5h</span>
                  <span>4h</span>
                </div>
              </div>

              {/* Hourly Rate Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    {t.hourlyRate}
                  </label>
                  <span className="text-lg font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                    CHF {inputs.avgHourlyRate}
                  </span>
                </div>
                <Slider
                  value={[inputs.avgHourlyRate]}
                  onValueChange={(value) => setInputs({ ...inputs, avgHourlyRate: value[0] })}
                  min={20}
                  max={300}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>CHF 20</span>
                  <span>CHF 300</span>
                </div>
              </div>

              {/* Documents Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    {t.documents}
                  </label>
                  <span className="text-lg font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                    {inputs.documentsCount.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[inputs.documentsCount]}
                  onValueChange={(value) => setInputs({ ...inputs, documentsCount: value[0] })}
                  min={500}
                  max={100000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>500</span>
                  <span>100,000</span>
                </div>
              </div>
            </div>

            {/* Comparison Box */}
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
              <h4 className="font-semibold text-gray-900 mb-4">{t.comparison.title}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">{t.comparison.before}</div>
                  <div className="text-2xl font-bold text-gray-400">12 {t.comparison.minutes}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.comparison.searchTime}</div>
                </div>
                <div className="text-center p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
                  <div className="text-sm text-primary-600 mb-2">{t.comparison.after}</div>
                  <div className="text-2xl font-bold text-primary-600">2 {t.comparison.minutes}</div>
                  <div className="text-xs text-primary-500 mt-1">{t.comparison.searchTime}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Main Results Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-xl font-semibold">
                  {isGerman ? 'Ihre Einsparungen' : 'Your Savings'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Hours Saved */}
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    {t.results.hoursSaved}
                  </div>
                  <div className="text-3xl font-bold">
                    {calculations.hoursSavedPerMonth}h
                  </div>
                </div>

                {/* Monthly Savings */}
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <BarChart3 className="w-4 h-4" />
                    {t.results.monthlySavings}
                  </div>
                  <div className="text-3xl font-bold">
                    CHF {calculations.monthlySavings.toLocaleString()}
                  </div>
                </div>

                {/* Yearly Savings - Full Width */}
                <div className="col-span-2 bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                    <Sparkles className="w-4 h-4" />
                    {t.results.yearlySavings}
                  </div>
                  <div className="text-5xl font-bold text-white">
                    CHF {calculations.yearlySavings.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* ROI and Payback */}
              <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-300">
                    {calculations.roi}%
                  </div>
                  <div className="text-sm text-white/70">{t.results.roi}</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    {calculations.paybackMonths}
                  </div>
                  <div className="text-sm text-white/70">
                    {t.results.payback} ({t.results.months})
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {isGerman ? 'Kostenübersicht' : 'Cost Overview'}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.results.subscriptionCost}</span>
                  <span className="font-semibold text-gray-900">
                    CHF {calculations.monthlySubscriptionCost}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t.results.monthlySavings}</span>
                  <span className="font-semibold text-green-600">
                    +CHF {calculations.monthlySavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-900">{t.results.netSavings}</span>
                  <span className="text-xl font-bold text-green-600">
                    CHF {calculations.netYearlySavings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/contact">
                <Zap className="w-5 h-5 mr-2" />
                {t.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            {/* Methodology Note */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {t.methodology}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ROICalculator
