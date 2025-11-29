export const metadata = {
  title: 'Trope - Record once. Guide forever.',
  description: 'Trope records any workflow once—then delivers living, just-in-time guides for browser and desktop. Transform tribal knowledge into scalable processes.',
}

import Hero from '@/components/hero'
import Features from '@/components/features'
import Features02 from '@/components/features-02'
import Pricing from './pricing-section'
import Faqs from '@/components/faqs'
import Cta from '@/components/cta'
import SchemaMarkup from '@/components/schema-markup'
import FAQSchema from '@/components/faq-schema'

export default function Home() {
  return (
    <>
      <SchemaMarkup />
      <FAQSchema />
      <Hero />
      <div id="features">
        <Features />
        <Features02 />
      </div>
      <div id="pricing">
        <Pricing />
      </div>
      <Faqs />
      <Cta />
    </>
  )
}
