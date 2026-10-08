'use client'

import Header from '@/components/header'
import HeroSection from '@/components/hero-section'
import ModulesSection from '@/components/modules-section'
import {
  AdmissionsBanner,
  NoticesStrip,
  ParentQuickLinks,
  PrincipalMessage,
  SiteFooter,
  SpotlightAndEvents,
  StatsBand,
} from '@/components/home-sections'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <NoticesStrip />
      <ParentQuickLinks />
      <PrincipalMessage />
      <StatsBand />
      <ModulesSection />
      <SpotlightAndEvents />
      <AdmissionsBanner />
      <SiteFooter />
    </main>
  )
}
