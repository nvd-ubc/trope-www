export const metadata = {
  title: 'Integrations',
  description: 'Connect Trope with your favorite tools and platforms to build powerful automated workflows.',
}

import IntegrationsSection from './integrations-section'
import IntegrationsList from './integrations-list'

export default function Integrations() {
  return (
    <>
      <IntegrationsSection />
      <IntegrationsList />
    </>
  )
}
