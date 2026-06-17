'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/auth-context'
import { setupApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Building2, MapPin, Clock, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

export default function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { checkOnboardingStatus, refreshTenant } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    totalDesks: '',
    maxCapacity: '',
    hasMeetingRoom: 'true',
    address: '',
    openingTime: '07:00',
    closingTime: '22:00',
  })

  const steps = [
    {
      icon: Building2,
      title: t('onboarding.step1Title'),
      description: t('onboarding.step1Description'),
    },
    {
      icon: MapPin,
      title: t('onboarding.step2Title'),
      description: t('onboarding.step2Description'),
    },
    {
      icon: Clock,
      title: t('onboarding.step3Title'),
      description: t('onboarding.step3Description'),
    },
  ]

  const validateStep = () => {
    setError('')
    if (currentStep === 0) {
      if (!formData.totalDesks || parseInt(formData.totalDesks) < 1) {
        setError(t('errors.generic'))
        return false
      }
      if (!formData.maxCapacity || parseInt(formData.maxCapacity) < 1) {
        setError(t('errors.generic'))
        return false
      }
    }
    if (currentStep === 1) {
      if (!formData.address.trim()) {
        setError(t('errors.generic'))
        return false
      }
    }
    if (currentStep === 2) {
      if (!formData.openingTime || !formData.closingTime) {
        setError(t('errors.generic'))
        return false
      }
    }
    return true
  }

  const handleNext = async () => {
    if (!validateStep()) return
    setLoading(true)
    setError('')

    try {
      if (currentStep === 0) {
        await setupApi.saveWorkspaceInfo({
          totalDesks: parseInt(formData.totalDesks),
          maxCapacity: parseInt(formData.maxCapacity),
          hasMeetingRoom: formData.hasMeetingRoom === 'true',
        })
      } else if (currentStep === 1) {
        await setupApi.saveAddress({ address: formData.address })
      } else if (currentStep === 2) {
        await setupApi.saveWorkingHours({
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
        })
        await setupApi.complete()
        setCompleted(true)
        await checkOnboardingStatus()
        await refreshTenant()
        setTimeout(() => {
          router.push('/')
        }, 2000)
        return
      }

      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string }
      setError(error.response?.data?.message || error.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    setError('')
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{t('onboarding.setupComplete')}</h1>
          <p className="text-[var(--text-secondary)] mb-8">{t('onboarding.setupCompleteMessage')}</p>
          <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
            <div className="w-5 h-5 border-2 border-[#1565C0] border-t-transparent rounded-full animate-spin" />
            <span>{t('onboarding.redirecting')}</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[var(--text-primary)]"
          >
            {t('onboarding.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--text-secondary)] mt-2"
          >
            {t('onboarding.subtitle')}
          </motion.p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-[#2E7D32] text-white'
                        : index === currentStep
                        ? 'bg-[#1565C0] text-white shadow-lg shadow-[#1565C0]/30'
                        : 'bg-[var(--card-border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index === currentStep ? 'text-[#1565C0]' : 'text-[var(--text-secondary)]'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 transition-colors duration-300 ${
                    index < currentStep ? 'bg-[#2E7D32]' : 'bg-[var(--card-border)]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1565C0]/10">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  return index === currentStep ? (
                    <StepIcon key={index} className="w-5 h-5 text-[#1565C0]" />
                  ) : null
                })}
              </div>
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-sm text-[var(--text-secondary)]">{steps[currentStep].description}</p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {t('onboarding.totalDesks')}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder={t('onboarding.totalDesksPlaceholder')}
                        value={formData.totalDesks}
                        onChange={(e) => setFormData({ ...formData, totalDesks: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {t('onboarding.maxCapacity')}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder={t('onboarding.maxCapacityPlaceholder')}
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {t('onboarding.hasMeetingRoom')}
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, hasMeetingRoom: 'true' })}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.hasMeetingRoom === 'true'
                              ? 'border-[#1565C0] bg-[#1565C0]/10 text-[#1565C0]'
                              : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                          }`}
                        >
                          {t('onboarding.yes')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, hasMeetingRoom: 'false' })}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                            formData.hasMeetingRoom === 'false'
                              ? 'border-[#1565C0] bg-[#1565C0]/10 text-[#1565C0]'
                              : 'border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                          }`}
                        >
                          {t('onboarding.no')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {t('onboarding.address')}
                      </label>
                      <textarea
                        className="flex w-full min-h-[120px] rounded border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent"
                        placeholder={t('onboarding.addressPlaceholder')}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{t('onboarding.addressHelp')}</p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {t('onboarding.openingTime')}
                      </label>
                      <Input
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {t('onboarding.closingTime')}
                      </label>
                      <Input
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[#C62828] mt-4 bg-[#FFEBEE] dark:bg-[#3A1B1B] p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--card-border)]">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('onboarding.previous')}
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">
                  {t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}
                </span>
                <Button onClick={handleNext} disabled={loading} className="gap-2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : currentStep === steps.length - 1 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {loading
                    ? t('common.saving')
                    : currentStep === steps.length - 1
                    ? t('onboarding.complete')
                    : t('onboarding.next')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
