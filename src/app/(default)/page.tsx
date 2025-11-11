export const metadata = {
  title: 'Trope - Record Once. Guide & Automate Forever.',
  description: 'Trope records any workflow once—then delivers living, just-in-time guides and safe one-click automations for browser and desktop.',
}

import Hero from '@/components/hero'
import Features from '@/components/features'
import Features02 from '@/components/features-02'
import Features03 from '@/components/features-03'
import TestimonialsCarousel from '@/components/testimonials-carousel'
import Features04 from '@/components/features-04'
import Pricing from './pricing-section'
import Testimonials from '@/components/testimonials'
import Cta from '@/components/cta'
import SchemaMarkup from '@/components/schema-markup'

export default function Home() {
  return (
    <>
      <SchemaMarkup />
      <Hero />
      <div id="features">
        <Features />
        <Features02 />
        <Features03 />
        <Features04 />
      </div>
      <div id="use-cases">
        <TestimonialsCarousel />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <Testimonials />
      <Cta />
    </>
  )
}
