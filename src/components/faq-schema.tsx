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
          "text": "Trope is a desktop workflow guidance platform that captures workflows once and delivers guided runs inside the tools your team already uses."
        }
      },
      {
        "@type": "Question",
        "name": "Is Trope available publicly?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trope is currently in closed beta for B2B teams. Request access or use an invite link to join a workspace."
        }
      },
      {
        "@type": "Question",
        "name": "What platforms does Trope support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trope supports desktop apps on macOS and Windows, plus browser-based tools used by operations teams."
        }
      },
      {
        "@type": "Question",
        "name": "How does workflow guidance work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Teams record a workflow once, Trope generates a guided playbook, and each run is tracked so teams can review outcomes and improve the process."
        }
      },
      {
        "@type": "Question",
        "name": "How is access managed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Access is scoped to workspaces and invites, with admin roles controlling who can view or run workflows."
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
