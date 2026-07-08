'use client'
import Navbar from './navbar'
import Hero from './hero'
import Features from './features'
import HowItWorks from './how-it-works'
import DashboardPreview from './dashboard-preview'
import Benefits from './benefits'
import CTASection from './cta-section'
import Footer from './footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white dark:bg-[var(--page-bg)] dark:from-[var(--page-bg)] dark:via-[var(--page-bg)] dark:to-[var(--page-bg)]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Benefits />
      <CTASection />
      <Footer />
    </div>
  )
}
