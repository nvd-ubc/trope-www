export const metadata = {
  title: 'Pricing - Trope',
  description: 'Simple, transparent pricing for Trope. Pay per user, scale as you grow. Starting at $20/user/month with annual billing.',
}

import PricingSection from './pricing-section'
import Features from '@/components/features-05'
import Faqs from '@/components/faqs'
import Cta from '@/components/cta'

export default function Pricing() {
  return (
    <>
      <PricingSection />
      <Features />
      <Faqs />
      <Cta />
    </>
  )
}
