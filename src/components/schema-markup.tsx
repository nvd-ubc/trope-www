import { CONTACT_EMAIL } from '@/lib/constants'

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Trope",
    "url": "https://trope.ai",
    "logo": "https://trope.ai/images/logo.svg",
    "description": "Trope records any workflow once—then delivers living, just-in-time guides for browser and desktop. Transform tribal knowledge into scalable processes.",
    "email": CONTACT_EMAIL,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Trope",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Windows, macOS, Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "20",
      "highPrice": "30",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "20",
        "priceCurrency": "USD",
        "unitText": "user per month"
      }
    },
    "description": "Workflow documentation software that transforms tribal knowledge into living guides with drift detection. Record once, guide forever.",
    "featureList": [
      "Workflow Recording",
      "Living Documentation",
      "In-App Guidance",
      "Drift Detection",
      "One-Click Automation",
      "Audit Trails",
      "Desktop & Browser Support"
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Trope",
    "url": "https://trope.ai"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
