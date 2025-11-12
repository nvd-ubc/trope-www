export default function PricingSchema() {
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Trope",
    "description": "Workflow automation and documentation software that transforms tribal knowledge into living guides with drift detection and safe automation.",
    "brand": {
      "@type": "Brand",
      "name": "Trope"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "20",
        "priceCurrency": "USD",
        "billingDuration": "P1M",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "20",
          "priceCurrency": "USD",
          "unitText": "per user per month",
          "billingDuration": "P1Y"
        },
        "description": "Perfect for small teams starting with workflow automation",
        "availability": "https://schema.org/InStock",
        "url": "https://trope.ai/pricing"
      },
      {
        "@type": "Offer",
        "name": "Growth Plan",
        "price": "30",
        "priceCurrency": "USD",
        "billingDuration": "P1M",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "30",
          "priceCurrency": "USD",
          "unitText": "per user per month",
          "billingDuration": "P1Y"
        },
        "description": "Advanced features for growing teams",
        "availability": "https://schema.org/InStock",
        "url": "https://trope.ai/pricing"
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
    />
  )
}
