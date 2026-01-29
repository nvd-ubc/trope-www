import { CONTACT_EMAIL } from '@/lib/constants'

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Trope",
    "url": "https://trope.ai",
    "logo": "https://trope.ai/logo/trope_logomark_dark.svg",
    "description": "Trope captures desktop workflows and delivers guided runs so B2B teams can onboard faster and scale operations.",
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
    "operatingSystem": "Windows, macOS",
    "description": "Desktop workflow guidance software that captures workflows once and delivers guided runs inside the tools teams already use.",
    "featureList": [
      "Desktop workflow capture",
      "Guided workflow runs",
      "Workspace sharing",
      "Run history and audit logs",
      "Desktop and web coverage"
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
