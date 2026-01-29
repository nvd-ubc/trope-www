export type UseCase = {
  slug: string
  title: string
  summary: string
  hero: string
  outcomes: string[]
  workflows: string[]
  metrics: string[]
}

export type Resource = {
  slug: string
  title: string
  category: string
  summary: string
  readTime: string
  audience: string
  sections: {
    heading: string
    body: string
    bullets?: string[]
  }[]
}

export type ReleaseNote = {
  date: string
  title: string
  summary: string
  bullets: string[]
}

export const USE_CASES: UseCase[] = [
  {
    slug: 'finance-close',
    title: 'Finance close workflows',
    summary:
      'Capture month-end close steps across ERP, Excel, and approval systems so every close run is consistent, auditable, and repeatable.',
    hero:
      'Turn tribal knowledge into a living close playbook that keeps every step aligned.',
    outcomes: [
      'Shorten the close cycle without sacrificing controls.',
      'Reduce reconciliation rework with guided, validated steps.',
      'Give leaders a clear view of progress and ownership.',
    ],
    workflows: [
      'Pull trial balance from ERP → reconcile in spreadsheet → attach evidence in close tool.',
      'Post journal entries in ERP → route approvals in workflow system → update close checklist.',
      'Match intercompany activity across ERP + shared drive artifacts → flag variances.',
      'Run variance review in reporting tool → log exceptions in issue tracker.',
    ],
    metrics: [
      'Time from day 1 to first close draft.',
      'Number of rework loops per close.',
      'Exceptions flagged and resolved per run.',
    ],
  },
  {
    slug: 'operations-onboarding',
    title: 'Operations onboarding',
    summary:
      'Replace shadowing with in-app guidance for back-office teams working in legacy desktop tools and web portals.',
    hero:
      'Give new hires a reliable, guided path through critical operational workflows.',
    outcomes: [
      'Reduce ramp time for new operators and analysts.',
      'Keep critical steps consistent across shifts and locations.',
      'Retain process knowledge when experts are unavailable.',
    ],
    workflows: [
      'Create vendor in ERP → verify tax docs in document system → update procurement portal.',
      'Process order exception in desktop tool → confirm with inventory system → escalate via ticket.',
      'Provision account in admin console → assign roles in identity tool → log in CRM.',
      'Run daily ops checklist across desktop + web tools → record completion in shared tracker.',
    ],
    metrics: [
      'Time to first independent workflow run.',
      'Percent of steps completed without escalation.',
      'Number of corrections per operator per week.',
    ],
  },
  {
    slug: 'support-desk',
    title: 'Support & service desk',
    summary:
      'Deliver consistent, high-quality resolutions by guiding agents through multi-system procedures.',
    hero:
      'Standardize resolutions while keeping audit trails for every run.',
    outcomes: [
      'Increase first-contact resolution with step-by-step guides.',
      'Reduce escalations by embedding best practices.',
      'Capture run logs for QA and coaching.',
    ],
    workflows: [
      'Verify customer in CRM → update billing tool → document resolution in ticketing system.',
      'Process refund in commerce admin → confirm in payment tool → send confirmation email.',
      'Troubleshoot device in remote tool → follow KB steps → log outcome in ticket.',
      'Handle regulated workflow → capture approvals → attach run history to case.',
    ],
    metrics: [
      'First-contact resolution rate.',
      'Average handle time variance.',
      'QA score improvement per team.',
    ],
  },
  {
    slug: 'revops-hygiene',
    title: 'RevOps data hygiene',
    summary:
      'Guide revenue operations teams through CRM and billing updates to keep pipeline data accurate.',
    hero:
      'Keep every CRM update consistent, even across complex tooling.',
    outcomes: [
      'Protect pipeline integrity with standardized updates.',
      'Reduce billing and booking errors with guided steps.',
      'Make handoffs between SDR, AE, and CS reliable.',
    ],
    workflows: [
      'Advance opportunity stage in CRM → update forecast sheet → notify CS in shared channel.',
      'Build quote in CPQ → sync to billing → verify in finance system.',
      'Renewal workflow: review usage dashboard → update opportunity → send contract for e-sign.',
      'Reassign territory in CRM → sync to marketing automation → confirm routing rules.',
    ],
    metrics: [
      'Percent of opportunities updated on time.',
      'Forecast accuracy variance after rollouts.',
      'Data completeness rate by stage.',
    ],
  },
]

export const RESOURCES: Resource[] = [
  {
    slug: 'workflow-drift-playbook',
    title: 'Workflow drift response playbook',
    category: 'Guide',
    summary:
      'A practical framework for keeping workflows current as desktop apps and web interfaces change.',
    readTime: '6 min read',
    audience: 'Ops leaders',
    sections: [
      {
        heading: 'Why workflows drift',
        body:
          'UI changes, tool migrations, and undocumented shortcuts slowly erode consistency. Drift shows up as rework, escalations, and unreliable training.',
      },
      {
        heading: 'Detect changes early',
        body:
          'Tie workflow ownership to real teams, review guidance on a predictable cadence, and use run feedback to surface outdated steps.',
        bullets: [
          'Assign an owner per workflow.',
          'Add review cadences to critical flows.',
          'Track exceptions reported during runs.',
        ],
      },
      {
        heading: 'Close the loop',
        body:
          'Capture a fresh recording for changed screens, update the guide, and notify teams through shared libraries or workspace updates.',
      },
    ],
  },
  {
    slug: 'desktop-onboarding-kit',
    title: 'Desktop onboarding kit',
    category: 'Template',
    summary:
      'A structured checklist for rolling out guided workflows to desktop-heavy teams.',
    readTime: '8 min read',
    audience: 'Enablement',
    sections: [
      {
        heading: 'Pilot workflow selection',
        body:
          'Pick 3-5 workflows that are high frequency, high impact, and prone to errors. Use them to prove ROI early.',
        bullets: [
          'Revenue-impacting workflows.',
          'High-volume back-office tasks.',
          'Processes with long training time.',
        ],
      },
      {
        heading: 'Capture standards',
        body:
          'Document expected inputs, approvals, and success criteria before recording. This ensures the guide reflects the true process, not just the path taken on a good day.',
      },
      {
        heading: 'Launch communication',
        body:
          'Share the “why” along with the workflow. Make it clear that guidance replaces shadowing and gives every operator a consistent safety net.',
      },
    ],
  },
  {
    slug: 'roi-model',
    title: 'ROI model for workflow guidance',
    category: 'Calculator',
    summary:
      'A simple model for estimating the impact of guided workflows on training time and error reduction.',
    readTime: '5 min read',
    audience: 'Finance + Ops',
    sections: [
      {
        heading: 'Estimate time saved',
        body:
          'Start with weekly runs per workflow, average duration, and the percent of time you expect to save with guided steps.',
      },
      {
        heading: 'Account for quality',
        body:
          'Factor in the cost of errors, rework, and escalations. Even small reductions in mistakes often outweigh raw time savings.',
      },
      {
        heading: 'Compare to investment',
        body:
          'Use pilot results to project annual savings and prioritize the workflows to scale next.',
      },
    ],
  },
  {
    slug: 'security-overview',
    title: 'Security overview for desktop guidance',
    category: 'Brief',
    summary:
      'How Trope separates on-device capture from cloud processing and keeps permissions explicit.',
    readTime: '7 min read',
    audience: 'Security + IT',
    sections: [
      {
        heading: 'Permissioned capture',
        body:
          'Desktop capture is gated by explicit user permissions. The agent only sees what a user authorizes.',
      },
      {
        heading: 'Cloud isolation',
        body:
          'Trope Cloud stores workflow assets per workspace and scopes access through org membership and invites.',
      },
      {
        heading: 'Auditability',
        body:
          'Each run produces a log with timestamps, actors, and outcomes—supporting review and compliance workflows.',
      },
    ],
  },
]

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    date: '2026-01-24',
    title: 'Workspace run history & share links',
    summary:
      'Admins can now review workflow runs and share a guided workflow link with time-bound access.',
    bullets: [
      'Run history summary cards in workspace views.',
      'Share links include expiration metadata.',
      'Improved error messaging for shared workflows.',
    ],
  },
  {
    date: '2026-01-10',
    title: 'Desktop capture stability improvements',
    summary:
      'Reliability updates for capture sessions across Excel and multi-window desktop apps.',
    bullets: [
      'Faster session start and stop transitions.',
      'Improved handling of multi-monitor setups.',
      'Cleaner artifact uploads for large workflows.',
    ],
  },
  {
    date: '2025-12-18',
    title: 'Invite-only access flows',
    summary:
      'Closed beta onboarding now supports invite review, acceptance, and workspace selection.',
    bullets: [
      'Invite acceptance now validates org membership.',
      'Better guidance for expired or revoked invites.',
      'Updated request-access routing for prospects.',
    ],
  },
]
