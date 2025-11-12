export default function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Trope?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trope is a workflow automation platform that records any workflow once, then delivers living, just-in-time guides and safe one-click automations for browser and desktop applications."
        }
      },
      {
        "@type": "Question",
        "name": "How does Trope pricing work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trope uses simple per-user pricing starting at $20/user/month with annual billing. You only pay for active users and can scale as your team grows."
        }
      },
      {
        "@type": "Question",
        "name": "What platforms does Trope support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trope works on both browser-based and desktop applications across Windows, macOS, and web platforms."
        }
      },
      {
        "@type": "Question",
        "name": "How does drift detection work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trope automatically detects when workflows or processes change in your applications, alerting you when your documentation or automation needs updating to stay current."
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}
