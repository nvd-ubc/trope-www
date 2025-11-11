export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Trope",
    "url": "https://trope.ai",
    "logo": "https://trope.ai/images/logo.png",
    "description": "Trope records any workflow once—then delivers living, just-in-time guides and safe one-click automations for browser and desktop.",
    "email": "hello@trope.ai",
    "sameAs": [
      // Add social media profiles here when available
      // "https://twitter.com/tropeai",
      // "https://linkedin.com/company/trope"
    ],
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "3"
    },
    "description": "Workflow automation and documentation software that transforms tribal knowledge into living guides with drift detection and safe automation.",
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
    "url": "https://trope.ai",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://trope.ai/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
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
