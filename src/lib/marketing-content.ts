export type UseCase = {
  slug: string
  title: string
  category: string
  summary: string
  hero: string
  outcomes: string[]
  workflows: {
    title: string
    systems: string[]
    steps: string[]
  }[]
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
    category: 'Finance',
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
      {
        title: 'Trial balance reconciliation',
        systems: ['ERP', 'Excel', 'Close tool', 'Shared drive'],
        steps: [
          'Open the ERP desktop app and sign in.',
          'Navigate to Reports > Trial Balance.',
          'Select the entity and close period in the filters.',
          'Click Export and choose CSV format.',
          'Save the file to the shared drive under Close/Month-End.',
          'Open the reconciliation workbook in Excel.',
          'Click Data > Get Data > From Text/CSV and select the export.',
          'Map columns to the TB import table and click Load.',
          'Refresh pivot tables and reconciliation checks.',
          'Open the Exceptions tab and review flagged variances.',
          'Open supporting documents from the shared drive for each variance.',
          'Enter variance explanations in the Notes column.',
          'Save the workbook with the close date in the filename.',
          'Open the close management tool in your browser.',
          'Upload the workbook as evidence to the Trial Balance task.',
          'Mark the Trial Balance task complete.',
        ],
      },
      {
        title: 'Journal entry posting with approval',
        systems: ['ERP', 'Workflow tool', 'Close checklist', 'Shared drive'],
        steps: [
          'Open the close checklist and click the Journal Entry task.',
          'Open the ERP module for Journal Entries.',
          'Click New Journal Entry.',
          'Select the subsidiary and accounting period.',
          'Enter debit and credit lines from the support workbook.',
          'Click Attach and upload supporting documents from the shared drive.',
          'Click Save as Pending Approval.',
          'Open the approval workflow tool.',
          'Locate the pending Journal Entry request.',
          'Review the JE summary and click Approve.',
          'Return to the ERP and refresh the JE status.',
          'Click Post to finalize the entry.',
          'Copy the JE number into the close checklist.',
          'Mark the Journal Entry task complete.',
        ],
      },
      {
        title: 'Intercompany matching and exceptions',
        systems: ['ERP', 'Excel', 'Ticketing tool', 'Close tool'],
        steps: [
          'Run the Intercompany report in the ERP for the close period.',
          'Export the report to CSV.',
          'Open the intercompany matching workbook in Excel.',
          'Import the CSV into the Source tab.',
          'Filter by entity pair and refresh the matching pivot.',
          'Identify out-of-balance pairs over the variance threshold.',
          'Open supporting invoices from the shared drive.',
          'Enter variance reasons in the Variance Notes column.',
          'Open the ticketing tool and click New Exception.',
          'Paste the entity pair, variance amount, and root cause.',
          'Attach the variance report export.',
          'Submit the exception ticket.',
          'Update the close tool task with the ticket ID.',
        ],
      },
      {
        title: 'Variance review and close narrative',
        systems: ['Reporting dashboard', 'Excel', 'Close narrative doc', 'Messaging'],
        steps: [
          'Open the reporting dashboard for the close period.',
          'Filter for accounts with the highest variance percentage.',
          'Click the top variance account to drill into transactions.',
          'Export the transaction list to CSV.',
          'Open the CSV in Excel and sort by amount.',
          'Identify the top three drivers and add notes in a new column.',
          'Open the close narrative document in the shared drive.',
          'Paste variance explanations into the narrative section.',
          'Save the narrative document with the close date.',
          'Open the issue tracker and log unresolved anomalies.',
          'Paste the ticket links into the narrative.',
          'Send a summary update to the controller in chat/email.',
        ],
      },
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
    category: 'Operations',
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
      {
        title: 'Vendor setup and procurement enablement',
        systems: ['ERP', 'Document system', 'Payment portal', 'Procurement portal'],
        steps: [
          'Open the ERP vendor module and click New Vendor.',
          'Enter vendor name, address, and tax ID.',
          'Open the document system and download the signed W-9.',
          'Click Attach in the ERP and upload the W-9.',
          'Open the payment portal and verify bank details.',
          'Copy bank verification status into the ERP vendor record.',
          'Select the vendor category and payment terms.',
          'Save the vendor record.',
          'Open the procurement portal.',
          'Search for the vendor and click Enable.',
          'Set required procurement fields (GL code, approver).',
          'Click Save and confirm the vendor is active.',
          'Log completion in the onboarding tracker.',
          'Notify the procurement manager in the team channel.',
        ],
      },
      {
        title: 'Order exception resolution',
        systems: ['Ops desktop app', 'Warehouse system', 'Carrier portal', 'Ticketing'],
        steps: [
          'Open the ops desktop app and search the order ID.',
          'Review the exception reason and SLA countdown.',
          'Open the customer record and confirm contact details.',
          'Open the warehouse system and check inventory status.',
          'Open the carrier portal and verify shipping scan history.',
          'Update the expected ship date in the ops app.',
          'Open the customer ticket and add the updated ETA.',
          'Tag the logistics queue if a carrier delay is confirmed.',
          'If SLA breach is likely, click Escalate in the ops app.',
          'Create a manager escalation ticket with order details.',
          'Attach screenshots of inventory and carrier status.',
          'Save the ticket and note the escalation ID in the ops app.',
        ],
      },
      {
        title: 'Account provisioning for new operators',
        systems: ['Identity provider', 'Admin console', 'Ticketing', 'CRM'],
        steps: [
          'Open the identity provider admin console.',
          'Click Users > Add user.',
          'Enter name, email, and temp password.',
          'Assign role groups and MFA policy.',
          'Open the operations admin console.',
          'Click Add user and select the operator role.',
          'Add the user to the default queue in the ticketing system.',
          'Open the CRM admin settings.',
          'Grant access to required dashboards.',
          'Send the welcome email with login instructions.',
          'Perform a test login in an incognito window.',
          'Log completion in the onboarding tracker.',
        ],
      },
      {
        title: 'Daily operations checklist',
        systems: ['Operations dashboard', 'Compliance app', 'Support tool', 'Tracker'],
        steps: [
          'Open the operations dashboard and select today\'s date.',
          'Review the shift handoff notes.',
          'Open the compliance checklist in the desktop app.',
          'Mark each required item as Complete.',
          'Open the support tool SLA queue.',
          'Sort by oldest and check for breaches.',
          'Open the alerts panel for overnight incidents.',
          'Acknowledge any critical alerts.',
          'Update the shared operations tracker with status notes.',
          'Log blockers and assign owners.',
          'Post a completion summary in the team channel.',
          'Tag the on-call manager if any blockers remain.',
        ],
      },
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
    category: 'Customer Support',
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
      {
        title: 'Account update across CRM and billing',
        systems: ['CRM', 'Admin console', 'Billing tool', 'Ticketing'],
        steps: [
          'Open the support ticket and verify the requested change.',
          'Confirm the requester identity in the ticket notes.',
          'Open the CRM and search the customer record.',
          'Confirm account status and entitlement tier.',
          'Open the admin console for the product.',
          'Navigate to the customer entitlements page.',
          'Apply the requested entitlement change.',
          'Save and refresh to confirm the change persisted.',
          'Open the billing tool and update the subscription.',
          'Confirm the billing preview totals match expectations.',
          'Return to the ticket and document the changes.',
          'Attach a screenshot of the updated entitlement.',
          'Send a confirmation email to the customer.',
        ],
      },
      {
        title: 'Refund processing with audit trail',
        systems: ['Commerce admin', 'Payment tool', 'Accounting system', 'Ticketing'],
        steps: [
          'Open the ticket and confirm refund eligibility.',
          'Review refund policy and reason code.',
          'Open the commerce admin and locate the order.',
          'Verify order status and refund policy flags.',
          'Open the payment method details and confirm original charge.',
          'Click Issue refund and select refund method.',
          'Record the refund transaction ID.',
          'Open the payment tool and confirm the refund processed.',
          'Open the accounting system and add a refund memo.',
          'Return to the ticket and attach refund confirmation.',
          'Send refund confirmation to the customer.',
          'Close the ticket with an audit note.',
        ],
      },
      {
        title: 'Device troubleshooting runbook',
        systems: ['Remote support tool', 'Knowledge base', 'Desktop app', 'Ticketing'],
        steps: [
          'Launch the remote support tool and start a session.',
          'Confirm device OS and version in the session panel.',
          'Verify user consent for remote control.',
          'Open the knowledge base article for the issue.',
          'Run diagnostics from the remote support toolbar.',
          'Capture logs or screenshots for the case.',
          'Apply the recommended fix in the desktop app.',
          'Restart the affected service or device if required.',
          'Reopen the app and confirm the issue is resolved.',
          'Verify resolution with the user on the call.',
          'Document steps and results in the ticket.',
          'Attach session logs to the ticket.',
        ],
      },
      {
        title: 'Regulated case execution',
        systems: ['Workflow system', 'Desktop apps', 'Case management'],
        steps: [
          'Open the regulated case checklist.',
          'Verify customer identity in CRM per policy.',
          'Create an approval request in the workflow system.',
          'Attach required evidence and request sign-off.',
          'Wait for approval and confirm status is Approved.',
          'Execute steps in the required desktop apps.',
          'Capture screenshots or exports at each checkpoint.',
          'Upload artifacts to the case record.',
          'Export the run history from the workflow system.',
          'Attach the run history and finalize the compliance note.',
          'Record completion timestamps in the case record.',
          'Close the case and notify stakeholders.',
        ],
      },
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
    category: 'Revenue Ops',
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
      {
        title: 'Opportunity stage hygiene',
        systems: ['CRM', 'Forecast sheet', 'BI dashboard', 'Messaging'],
        steps: [
          'Open the opportunity record in the CRM.',
          'Review the activity timeline for recent updates.',
          'Open the latest meeting notes or call summary.',
          'Click Edit and update the stage and close date.',
          'Fill required fields (next step, amount, probability).',
          'Update the next step date and owner.',
          'Open the forecast sheet and adjust the forecast amount.',
          'Open the BI dashboard to verify pipeline totals.',
          'Reconcile any variance between CRM and forecast sheet.',
          'Paste the updated forecast in the CRM notes.',
          'Notify CS and finance in the shared channel.',
          'Create a follow-up task in the CRM.',
        ],
      },
      {
        title: 'Quote-to-cash checklist',
        systems: ['CPQ', 'Approval workflow', 'Billing system', 'Finance tool'],
        steps: [
          'Open the CPQ tool and create a new quote.',
          'Select products, quantities, and term length.',
          'Apply approved discount and verify pricing summary.',
          'Generate the quote PDF preview.',
          'Click Submit for approval.',
          'Open the approval workflow and approve the quote.',
          'Capture the approval ID in the quote notes.',
          'Sync the quote to the billing system.',
          'Verify taxes and invoicing schedule in billing.',
          'Open the finance tool and confirm revenue schedule.',
          'Send the quote for e-signature.',
          'Update the CRM opportunity with the quote status.',
          'Log the quote ID and contract status.',
        ],
      },
      {
        title: 'Renewal preparation workflow',
        systems: ['Usage dashboard', 'CRM', 'CLM', 'E-sign'],
        steps: [
          'Open the usage dashboard and filter by account.',
          'Export the last 90 days of usage to CSV.',
          'Review account health score and support history.',
          'Open the renewal opportunity in the CRM.',
          'Update renewal amount and expected close date.',
          'Attach the usage CSV to the opportunity.',
          'Confirm renewal owner and stage in the CRM.',
          'Open the CLM system and generate a renewal contract.',
          'Send the contract for e-signature.',
          'Log renewal status updates in the CRM.',
          'Create a follow-up task for the account owner.',
          'Set a calendar reminder for renewal follow-up.',
        ],
      },
      {
        title: 'Territory and routing updates',
        systems: ['CRM', 'Marketing automation', 'Assignment tool', 'Documentation'],
        steps: [
          'Open the CRM territory rules.',
          'Duplicate the existing rule set for the new region.',
          'Update region filters and owner assignments.',
          'Save and publish the territory changes.',
          'Open the marketing automation tool and sync territories.',
          'Review the routing audit log for errors.',
          'Open the assignment tool and run a test lead.',
          'Confirm the lead routes to the correct owner.',
          'Export the routing test results.',
          'Notify SDR managers about the change.',
          'Update the routing documentation.',
          'Log the change request in the CRM admin notes.',
        ],
      },
    ],
    metrics: [
      'Percent of opportunities updated on time.',
      'Forecast accuracy variance after rollouts.',
      'Data completeness rate by stage.',
    ],
  },
  {
    slug: 'it-access-provisioning',
    title: 'IT access & device provisioning',
    category: 'IT',
    summary:
      'Standardize device setup, software installs, and access requests across identity, MDM, and ticketing tools.',
    hero:
      'Keep IT onboarding and access changes consistent across every desktop and system.',
    outcomes: [
      'Reduce time-to-ready for new hires and contractors.',
      'Prevent access gaps with consistent approval trails.',
      'Keep device and software rollouts predictable.',
    ],
    workflows: [
      {
        title: 'New hire laptop setup',
        systems: ['MDM', 'Identity provider', 'Ticketing', 'App catalog'],
        steps: [
          'Open the onboarding ticket and confirm role, start date, and device serial.',
          'Open the MDM console and search the device by serial number.',
          'Assign the device to the new hire and apply the standard profile.',
          'Trigger the provisioning action (Erase and Install or Enroll).',
          'Verify enrollment status shows Compliant.',
          'Apply baseline configuration profiles (Wi-Fi, VPN, security).',
          'Open the identity provider and create the user account.',
          'Set a temporary password and require reset on first login.',
          'Assign baseline groups (SSO, email, VPN).',
          'Enable MFA and verify enrollment policy.',
          'Open the app catalog and select the standard app bundle.',
          'Deploy the app bundle to the device.',
          'Monitor installation status and resolve any failed installs.',
          'Open the security console and confirm encryption + AV status.',
          'Update the asset inventory with assigned user and device name.',
          'Send the welcome email with login and setup instructions.',
          'Update the onboarding ticket with completion details.',
        ],
      },
      {
        title: 'Privileged access request',
        systems: ['Ticketing', 'PAM', 'Identity provider', 'Audit log'],
        steps: [
          'Open the access request ticket and review the justification.',
          'Confirm the requester is in the correct team and role.',
          'Verify manager approval on the ticket.',
          'Open the PAM system and click New Access Request.',
          'Select the target system and role scope.',
          'Set access duration and expiration time.',
          'Require MFA and approval workflow.',
          'Attach the ticket ID to the request notes.',
          'Submit the request for security approval.',
          'After approval, assign the role in the identity provider.',
          'Verify access is visible in the PAM audit log.',
          'Notify the requester with access window details.',
          'Update the ticket with approver, scope, and expiration.',
        ],
      },
      {
        title: 'Software rollout update',
        systems: ['App catalog', 'MDM', 'Release notes', 'Knowledge base'],
        steps: [
          'Review release notes and confirm version requirements.',
          'Open the app catalog and upload the installer package.',
          'Create a deployment profile for the new version.',
          'Assign the deployment to the pilot device group.',
          'Schedule the rollout window and start deployment.',
          'Monitor install status and review error logs.',
          'Validate app launch on two pilot devices.',
          'Approve the full rollout after pilot sign-off.',
          'Deploy the update to all targeted devices.',
          'Re-run compliance checks to confirm version adoption.',
          'Update the knowledge base with UI changes.',
          'Post the change notice in the IT channel.',
          'Close the rollout ticket with deployment metrics.',
        ],
      },
    ],
    metrics: [
      'Time from request to provisioned access.',
      'Percentage of devices fully compliant within 24 hours.',
      'Number of access escalations per month.',
    ],
  },
  {
    slug: 'compliance-audit',
    title: 'Compliance & audit readiness',
    category: 'Compliance',
    summary:
      'Collect evidence, run access reviews, and keep control documentation consistent across audits.',
    hero:
      'Make audit prep a repeatable workflow instead of a scramble.',
    outcomes: [
      'Reduce audit prep time with consistent evidence capture.',
      'Surface access exceptions early.',
      'Maintain a clear trail of control execution.',
    ],
    workflows: [
      {
        title: 'Quarterly access review',
        systems: ['Identity provider', 'HRIS', 'Spreadsheet', 'GRC tool'],
        steps: [
          'Export the current user access list from the identity provider.',
          'Export the active employee roster from HRIS.',
          'Export the contractor list from the vendor system.',
          'Open the access review spreadsheet.',
          'Import the access list into the Access tab.',
          'Import the HR and contractor lists into the Roster tab.',
          'Run the mismatch formula and filter for exceptions.',
          'Tag terminated users with active access.',
          'Send the exception list to department owners for attestation.',
          'Record approvals and removals in the Decision column.',
          'Remove access in the identity provider for revoked users.',
          'Export the finalized review summary.',
          'Upload the summary to the GRC tool as evidence.',
          'Mark the access review control complete.',
        ],
      },
      {
        title: 'Audit evidence collection',
        systems: ['GRC tool', 'Ticketing', 'Logging platform', 'Shared drive'],
        steps: [
          'Open the audit request in the GRC tool.',
          'Review required controls and due dates.',
          'Open the logging platform and set the audit date range.',
          'Export the activity logs to CSV.',
          'Open the ticketing tool and export change approvals.',
          'Capture screenshots of key admin settings.',
          'Save all evidence files in the audit folder on the shared drive.',
          'Update the evidence tracker with file names and control IDs.',
          'Upload the evidence files to the GRC request.',
          'Add notes describing how each control was executed.',
          'Submit the evidence package for auditor review.',
          'Archive a read-only copy of the evidence package.',
        ],
      },
      {
        title: 'Policy attestation cycle',
        systems: ['HRIS', 'E-sign tool', 'LMS'],
        steps: [
          'Open the policy attestation campaign in the LMS.',
          'Upload the updated policy PDF.',
          'Set the completion deadline and reminder schedule.',
          'Sync the active employee list from HRIS.',
          'Send attestation requests.',
          'Monitor completion status daily.',
          'Send reminders to non-responders.',
          'Export the completion report.',
          'Export the non-responder list for escalation.',
          'Store the report in the compliance archive.',
          'Update the GRC control with the completion rate.',
          'Notify department leads of outstanding attestations.',
        ],
      },
    ],
    metrics: [
      'Days to complete access review.',
      'Percentage of controls with complete evidence.',
      'Policy attestation completion rate.',
    ],
  },
  {
    slug: 'procurement-approvals',
    title: 'Procurement approvals',
    category: 'Procurement',
    summary:
      'Standardize purchase requests, vendor changes, and approval routing across procurement and finance tools.',
    hero:
      'Keep purchasing decisions consistent with clear approvals and evidence.',
    outcomes: [
      'Reduce back-and-forth on purchase approvals.',
      'Prevent vendor data errors with verified changes.',
      'Maintain clear approval trails for finance.',
    ],
    workflows: [
      {
        title: 'Purchase request to PO',
        systems: ['Procurement portal', 'Approvals', 'ERP', 'Shared drive'],
        steps: [
          'Open the procurement portal and click New Request.',
          'Select the vendor and enter item description.',
          'Enter quantity, unit cost, and budget code.',
          'Upload vendor quotes from the shared drive.',
          'Select the required approver chain.',
          'Submit the request for approval.',
          'Open the approvals tool and review the request details.',
          'Approve the request and add any conditions.',
          'Open the ERP purchasing module.',
          'Create the purchase order and select the vendor.',
          'Attach the approved request and quotes.',
          'Submit the PO and capture the PO number.',
          'Send the PO to the vendor via email.',
          'Update the procurement request with the PO number.',
        ],
      },
      {
        title: 'Vendor banking change',
        systems: ['Vendor master', 'Document system', 'Approvals'],
        steps: [
          'Open the vendor change request ticket.',
          'Verify the new banking document in the document system.',
          'Call back the vendor using the verified contact number.',
          'Open the vendor master record in the ERP.',
          'Update banking details and mark as Pending Approval.',
          'Attach the banking document to the vendor record.',
          'Open the approvals tool and route to finance.',
          'Wait for finance approval and record the approver.',
          'Activate the updated vendor record.',
          'Document the change in the vendor change log.',
          'Update the ticket with approval and activation details.',
          'Store the verification note in the vendor profile.',
        ],
      },
      {
        title: 'Contract renewal review',
        systems: ['Contract system', 'Spend dashboard', 'Approvals'],
        steps: [
          'Open the contract record for the renewal.',
          'Review renewal date and auto-renewal status.',
          'Open the spend dashboard and review last 12 months spend.',
          'Compare usage vs. contract terms.',
          'Update the renewal summary with findings.',
          'Collect stakeholder feedback on renewal decision.',
          'Submit the renewal for approval.',
          'Capture approval notes and required changes.',
          'Finalize the renewal status in the contract system.',
          'Notify finance and the vendor owner of the decision.',
          'Archive the renewal summary in the contract record.',
          'Attach the spend report to the contract record.',
        ],
      },
    ],
    metrics: [
      'Average approval cycle time.',
      'Number of vendor data corrections per month.',
      'Spend under approved contracts.',
    ],
  },
  {
    slug: 'customer-onboarding',
    title: 'Customer onboarding',
    category: 'Customer Success',
    summary:
      'Coordinate account provisioning, data setup, and training across CRM, onboarding tools, and product admin.',
    hero:
      'Turn onboarding into a consistent, measurable launch playbook.',
    outcomes: [
      'Reduce time to first value.',
      'Ensure every onboarding step is tracked.',
      'Keep handoffs between sales and CS consistent.',
    ],
    workflows: [
      {
        title: 'Account provisioning',
        systems: ['CRM', 'Product admin', 'Billing', 'Email'],
        steps: [
          'Open the closed-won opportunity in the CRM.',
          'Confirm the plan tier, contract start date, and billing terms.',
          'Click Create onboarding task.',
          'Open the product admin console.',
          'Create the customer workspace with the correct plan tier.',
          'Set data residency and region settings if required.',
          'Invite the primary admin via email.',
          'Open the billing system and activate the subscription.',
          'Verify the subscription status is Active.',
          'Create a kickoff task in the onboarding tracker.',
          'Create a shared onboarding channel and invite stakeholders.',
          'Update the CRM onboarding checklist.',
        ],
      },
      {
        title: 'Data import and validation',
        systems: ['File transfer portal', 'Spreadsheet', 'Product admin'],
        steps: [
          'Open the onboarding tracker and confirm data sources.',
          'Download the customer data export from the portal.',
          'Open the file in Excel and validate required columns.',
          'Normalize date formats and IDs.',
          'Remove duplicates using the dedupe tool.',
          'Save the cleaned file with versioned filename.',
          'Open the product admin importer.',
          'Upload the cleaned file and map fields.',
          'Run the validation preview and resolve errors.',
          'Submit the import and monitor status.',
          'Confirm the import completed successfully.',
          'Update the onboarding tracker with results.',
        ],
      },
      {
        title: 'Training and go-live readiness',
        systems: ['Calendar', 'LMS', 'CRM'],
        steps: [
          'Schedule the kickoff session on the calendar.',
          'Send training resources from the LMS.',
          'Assign required training modules to user roles.',
          'Track completion of required modules.',
          'Send reminders to untrained users.',
          'Document attendance and questions in the CRM.',
          'Confirm go-live date with the customer admin.',
          'Review the go-live readiness checklist.',
          'Confirm admin roles are assigned.',
          'Verify admin access and key integrations are active.',
          'Send the go-live checklist to the customer admin.',
          'Mark onboarding status as Ready for Go-Live.',
        ],
      },
    ],
    metrics: [
      'Days from close to first active user.',
      'Onboarding checklist completion rate.',
      'Training completion percentage.',
    ],
  },
  {
    slug: 'claims-processing',
    title: 'Claims processing',
    category: 'Claims',
    summary:
      'Guide claims teams through intake, verification, and payout across policy, imaging, and payment systems.',
    hero:
      'Keep claims consistent, compliant, and fully documented.',
    outcomes: [
      'Reduce claim cycle time.',
      'Improve documentation quality for audits.',
      'Lower rework from missing evidence.',
    ],
    workflows: [
      {
        title: 'Claim intake and validation',
        systems: ['Claims system', 'Policy admin', 'Document intake'],
        steps: [
          'Open the claim intake queue.',
          'Select the new claim and verify required fields.',
          'Open the policy admin system and confirm coverage.',
          'Verify claimant details against the policy record.',
          'Check policy limits and deductible amount.',
          'Check loss date against policy effective dates.',
          'Open the document intake portal.',
          'Download supporting documents and attach to claim.',
          'Tag missing documents in the claim checklist.',
          'Set claim status to In Review.',
          'Assign the claim to the appropriate adjuster.',
          'Send an acknowledgement email to the claimant.',
        ],
      },
      {
        title: 'Fraud screening workflow',
        systems: ['Fraud tool', 'Claims system', 'Notes'],
        steps: [
          'Open the claim and click Run fraud screen.',
          'Review the fraud score and flags.',
          'Open the fraud tool and inspect flagged signals.',
          'Check prior claim history for the claimant.',
          'Review any related SIU notes.',
          'If flagged, request additional documentation.',
          'Set a follow-up task for the adjuster.',
          'Document the request in claim notes.',
          'Set the claim status to Pending Review.',
          'Escalate to the SIU queue if risk is high.',
          'Record the fraud score in the claim summary.',
          'Notify the SIU supervisor if escalation is required.',
        ],
      },
      {
        title: 'Payout approval and payment',
        systems: ['Claims system', 'Approvals', 'Payment system', 'Ledger'],
        steps: [
          'Open the claim and review the settlement amount.',
          'Confirm required documents are attached.',
          'Verify claimant payment details are on file.',
          'Submit the payout for approval.',
          'Approve the payout in the approvals tool.',
          'Open the payment system and issue the payout.',
          'Confirm payment status is Successful.',
          'Update the ledger with the payout memo.',
          'Attach the payment confirmation to the claim.',
          'Mark the claim as Closed and notify the claimant.',
          'Archive the payment receipt in the claim record.',
          'Send the payment confirmation to the claimant.',
        ],
      },
    ],
    metrics: [
      'Average days to close a claim.',
      'Percentage of claims missing documentation.',
      'Fraud flag rate per month.',
    ],
  },
  {
    slug: 'logistics-fulfillment',
    title: 'Logistics & fulfillment',
    category: 'Logistics',
    summary:
      'Coordinate picking, packing, and shipping across WMS, carrier portals, and customer updates.',
    hero:
      'Make fulfillment repeatable across warehouses and carriers.',
    outcomes: [
      'Reduce fulfillment errors and delays.',
      'Improve tracking consistency for customers.',
      'Standardize exception handling across sites.',
    ],
    workflows: [
      {
        title: 'Shipment creation and dispatch',
        systems: ['WMS', 'Carrier portal', 'ERP', 'Customer portal'],
        steps: [
          'Open the pick list in the WMS.',
          'Confirm inventory availability and reserve items.',
          'Print packing slip and pick tickets.',
          'Pick items and scan each SKU.',
          'Pack the order and confirm weight/dimensions.',
          'Open the carrier portal and create a shipment.',
          'Select service level and pickup date.',
          'Schedule carrier pickup or drop-off window.',
          'Print the shipping label and apply it.',
          'Update the tracking number in the ERP.',
          'Mark the order as Shipped in the WMS.',
          'Notify the customer via the portal.',
        ],
      },
      {
        title: 'Shipment exception handling',
        systems: ['WMS', 'Carrier portal', 'Ticketing', 'Customer comms'],
        steps: [
          'Open the exception queue in the WMS.',
          'Identify the delayed shipment and check status.',
          'Open the carrier portal and view tracking events.',
          'Confirm the delay reason and impacted SLA.',
          'Create an exception ticket with root cause.',
          'Update the customer with a new ETA.',
          'Flag the shipment for follow-up review.',
          'Escalate to the carrier rep if delay exceeds threshold.',
          'Set a follow-up reminder for the new ETA.',
          'Log the exception outcome in the WMS notes.',
          'Update the SLA dashboard with the delay reason.',
          'Close the exception ticket after resolution.',
        ],
      },
      {
        title: 'Cycle count reconciliation',
        systems: ['WMS', 'Spreadsheet', 'ERP'],
        steps: [
          'Run the cycle count report in the WMS.',
          'Export the report to CSV.',
          'Open the CSV in Excel and compare to ERP stock.',
          'Identify discrepancies and document reasons.',
          'Open the ERP and record inventory adjustments.',
          'Submit adjustments for approval if required.',
          'Save the reconciliation file to the shared drive.',
          'Notify inventory control of any large variances.',
          'Schedule a recount for high-variance items.',
          'Update the cycle count log with approval IDs.',
          'Archive the reconciliation summary.',
          'Close the cycle count task in the WMS.',
        ],
      },
    ],
    metrics: [
      'Order accuracy rate.',
      'Average time from pick to ship.',
      'Exception rate per 1,000 shipments.',
    ],
  },
  {
    slug: 'healthcare-intake',
    title: 'Healthcare intake & referrals',
    category: 'Healthcare',
    summary:
      'Standardize patient intake, insurance verification, and referral workflows across EHR, clearinghouse, and scheduling tools.',
    hero:
      'Keep intake consistent and compliant while reducing handoff errors.',
    outcomes: [
      'Reduce intake cycle time and missing data.',
      'Increase referral throughput with fewer rework loops.',
      'Maintain a clear audit trail for compliance.',
    ],
    workflows: [
      {
        title: 'New patient intake with insurance verification',
        systems: ['EHR', 'Eligibility portal', 'Document intake', 'Scheduling'],
        steps: [
          'Open the intake queue in the EHR.',
          'Select the new patient record and review demographics.',
          'Open the document intake portal and download intake forms.',
          'Verify required fields and update missing details in the EHR.',
          'Scan or upload ID and insurance cards to the chart.',
          'Open the eligibility portal and run insurance verification.',
          'Capture the eligibility response and upload to the EHR.',
          'Enter insurance plan details and effective dates.',
          'Validate copay and deductible fields.',
          'Create the initial appointment in the scheduling system.',
          'Send the appointment confirmation to the patient.',
          'Mark the intake task complete in the EHR.',
        ],
      },
      {
        title: 'Referral processing and scheduling',
        systems: ['Referral inbox', 'EHR', 'Scheduling', 'Fax/portal'],
        steps: [
          'Open the referral inbox and select the new referral.',
          'Verify referral details and required documentation.',
          'Confirm referral type and priority.',
          'Open the EHR and create a referral record.',
          'Attach the referral document to the patient chart.',
          'Confirm insurance coverage for the referral type.',
          'Check if prior authorization is required.',
          'Check provider availability in the scheduling system.',
          'Schedule the referral appointment.',
          'Send confirmation to the referring provider via portal/fax.',
          'Send appointment instructions to the patient.',
          'Update referral status to Scheduled in the EHR.',
        ],
      },
      {
        title: 'Prior authorization request',
        systems: ['EHR', 'Payer portal', 'Document store'],
        steps: [
          'Open the patient chart in the EHR.',
          'Navigate to the authorization request workflow.',
          'Gather required clinical notes and export as PDF.',
          'Collect diagnosis and procedure codes.',
          'Attach the signed order form if required.',
          'Open the payer portal and start a new prior auth.',
          'Enter procedure codes and patient details.',
          'Upload clinical notes and supporting documents.',
          'Submit the authorization request.',
          'Record the auth reference number in the EHR.',
          'Set a follow-up task for authorization status.',
          'Log expected decision date in the EHR.',
        ],
      },
    ],
    metrics: [
      'Intake completion time.',
      'Percentage of referrals scheduled within SLA.',
      'Prior auth turnaround time.',
    ],
  },
  {
    slug: 'nonprofit-grant-management',
    title: 'Nonprofit grant management',
    category: 'Nonprofit',
    summary:
      'Coordinate grant applications, reporting, and fund tracking across donor CRM, finance, and document tools.',
    hero:
      'Make grant workflows consistent so impact reporting is never a scramble.',
    outcomes: [
      'Reduce time spent compiling grant reports.',
      'Keep grant data consistent across systems.',
      'Improve on-time submission rates.',
    ],
    workflows: [
      {
        title: 'Grant application submission',
        systems: ['Donor CRM', 'Document templates', 'Submission portal', 'Budget spreadsheet'],
        steps: [
          'Open the grant opportunity in the donor CRM.',
          'Review eligibility criteria and submission deadline.',
          'Open the grant template in the document system.',
          'Populate program narrative sections.',
          'Open the budget spreadsheet and update the line items.',
          'Validate totals and required matching funds.',
          'Export the final budget as PDF.',
          'Open the submission portal and start a new application.',
          'Complete required fields and organization details.',
          'Upload the narrative and budget attachments.',
          'Run the portal checklist validation.',
          'Submit the application and save the confirmation receipt.',
          'Log the submission status in the donor CRM.',
        ],
      },
      {
        title: 'Grant reporting and compliance',
        systems: ['Donor CRM', 'Finance system', 'Impact tracker', 'Document system'],
        steps: [
          'Open the grant record and reporting schedule.',
          'Export expenditure data from the finance system.',
          'Open the impact tracker and export outcome metrics.',
          'Compile the report in the document system.',
          'Attach expenditure and impact exports.',
          'Validate the report against the grant checklist.',
          'Update narrative with key outcome metrics.',
          'Review the draft with program leads.',
          'Submit the report via the donor portal.',
          'Save the submission receipt.',
          'Log submission and upload receipts to the CRM.',
          'Archive the final report in the grant record.',
        ],
      },
      {
        title: 'Restricted fund reconciliation',
        systems: ['Finance system', 'Spreadsheet', 'Grant tracker'],
        steps: [
          'Export restricted fund transactions from finance.',
          'Open the reconciliation spreadsheet and import transactions.',
          'Match expenses to grant restrictions.',
          'Flag any out-of-scope expenses for review.',
          'Confirm corrections with program leads.',
          'Compare remaining balance to budget plan.',
          'Update the grant tracker with remaining balances.',
          'Save the reconciliation file to the shared drive.',
          'Share the reconciliation summary with program leads.',
          'Obtain finance sign-off on adjustments.',
          'Update the fund status in the donor CRM.',
          'Archive the reconciliation approval notes.',
        ],
      },
    ],
    metrics: [
      'On-time grant submission rate.',
      'Reporting cycle time.',
      'Variance between restricted funds and actual spend.',
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
          'UI changes, tool migrations, and undocumented shortcuts slowly erode consistency. Drift shows up as rework, escalations, and unreliable training. The best teams treat drift as an expected maintenance cost, not a surprise failure.',
      },
      {
        heading: 'What drift looks like in practice',
        body:
          'Drift is usually not a big break. It is a series of small mismatches between how a workflow was captured and how it is performed today. Common symptoms include workarounds, skipped steps, and inconsistent outcomes across operators.',
        bullets: [
          'Operators take a different path than the documented steps.',
          'A previously stable step now requires a manual search or extra clicks.',
          'Approvals and evidence collection happen, but the order varies.',
          'Escalations increase because exceptions are handled ad hoc.',
        ],
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
        heading: 'Set a drift response SLA',
        body:
          'Define what happens when drift is detected. For high-impact workflows, decide how quickly the guide should be corrected, who can approve changes, and how you communicate updates to operators.',
        bullets: [
          'Severity levels (minor UI change vs blocking failure).',
          'Response time targets per severity.',
          'Approval process for regulated or high-risk steps.',
        ],
      },
      {
        heading: 'Build a capture and review loop',
        body:
          'Drift is easier to manage when you have a lightweight loop: capture when something changes, review quickly, and publish an updated version. Keep the loop short so fixes happen while context is fresh.',
        bullets: [
          'Re-capture only the affected portion of a workflow when possible.',
          'Have an SME review updates with a short checklist.',
          'Validate by running the workflow with a non-expert operator.',
        ],
      },
      {
        heading: 'Communicate updates without disruption',
        body:
          'Operators need to trust that the workflow is current. Announce updates with clear intent (what changed, why it changed, and what operators should do differently), and keep old links or copies from lingering.',
        bullets: [
          'Use a short change log for each updated workflow.',
          'Notify the teams that run the workflow most often.',
          'Deprecate outdated versions and remove stale bookmarks.',
        ],
      },
      {
        heading: 'Measure drift so it stays manageable',
        body:
          'A simple set of metrics makes drift visible. Track how often workflows need updates, where exceptions occur, and how long it takes to publish a fix. This helps you prioritize maintenance time and prevent repeat issues.',
        bullets: [
          'Time from drift report to updated workflow published.',
          'Exception rate per workflow and per step.',
          'Number of versions per quarter for critical workflows.',
        ],
      },
      {
        heading: 'Close the loop',
        body:
          'Capture a fresh recording for changed screens, update the guide, and notify teams through your shared workflow library. Drift becomes manageable when updates are routine and ownership is clear.',
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
        heading: 'Start with a clear pilot goal',
        body:
          'A good onboarding pilot is not "ship software". It is a short, focused effort to prove that guided workflows reduce ramp time and improve consistency. Define success criteria up front so the rollout stays practical.',
        bullets: [
          'Pick a target team and a start date.',
          'Define what "trained" means (speed, accuracy, escalation rate).',
          'Decide how you will measure adoption in the first month.',
        ],
      },
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
        heading: 'Recording best practices',
        body:
          'Strong recordings reduce downstream rework. Record in a stable environment, avoid sensitive data when possible, and aim for a clear, repeatable path. Treat workflow capture like writing internal documentation.',
        bullets: [
          'Use test accounts or masked data when available.',
          'Pause or stop capture around secrets (passwords, MFA codes, API keys).',
          'Keep window layouts consistent and remove distractions.',
        ],
      },
      {
        heading: 'Review and QA before broad rollout',
        body:
          'Before sharing a workflow widely, validate it with someone who did not record it. This is the fastest way to catch missing context, ambiguous steps, and brittle navigation.',
        bullets: [
          'Have an SME validate correctness.',
          'Have a novice validate clarity.',
          'Confirm expected evidence and approvals are included.',
        ],
      },
      {
        heading: 'Launch communication',
        body:
          'Share the "why" along with the workflow. Make it clear that guidance replaces shadowing and gives every operator a consistent safety net.',
      },
      {
        heading: 'Enablement plan for the first two weeks',
        body:
          'Treat the first two weeks as an enablement sprint: a small amount of structure goes a long way. Provide a clear starting point, office hours for questions, and a feedback channel for issues.',
        bullets: [
          'Short kickoff training (15 to 30 minutes).',
          'Office hours or a Slack channel for questions.',
          'A simple intake form for workflow issues and updates.',
        ],
      },
      {
        heading: 'Governance and ongoing maintenance',
        body:
          'Rollout is the beginning, not the end. Assign owners, set review cadences for critical workflows, and build a lightweight process for updates so workflows do not drift.',
        bullets: [
          'Assign workflow owners and backups.',
          'Set a cadence for review (monthly or quarterly).',
          'Use run feedback to prioritize updates.',
        ],
      },
      {
        heading: 'Metrics to track',
        body:
          'Use a few simple metrics to show impact and guide iteration. Focus on adoption, speed, quality, and confidence. A pilot is successful when it is repeatable and scalable.',
        bullets: [
          'Time to proficiency for new hires.',
          'Exception and escalation rate during runs.',
          'Workflow completion rate and time per run.',
        ],
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
        heading: 'Start with a baseline',
        body:
          'Pick a small set of workflows and establish today\'s baseline: how long they take, how often they run, how often they fail, and what rework costs. Even rough estimates are useful if you are consistent.',
        bullets: [
          'Weekly runs per workflow.',
          'Average time per run (and variance by operator).',
          'Exception rate and escalation rate.',
        ],
      },
      {
        heading: 'Estimate time saved',
        body:
          'Start with weekly runs per workflow, average duration, and the percent of time you expect to save with guided steps.',
      },
      {
        heading: 'Add ramp time improvement',
        body:
          'Guided workflows often have their biggest impact during onboarding. Estimate the number of new hires per quarter and how long it takes them to reach full proficiency today, then model how much of that ramp can be accelerated with consistent guidance.',
      },
      {
        heading: 'Account for quality',
        body:
          'Factor in the cost of errors, rework, and escalations. Even small reductions in mistakes often outweigh raw time savings.',
      },
      {
        heading: 'Include compliance and evidence costs when relevant',
        body:
          'In regulated or finance-heavy workflows, the cost of missing evidence or skipping an approval can be large. If this applies, include the time spent collecting evidence and the cost of audit exceptions in your model.',
      },
      {
        heading: 'Compare to investment',
        body:
          'Use pilot results to project annual savings and prioritize the workflows to scale next.',
      },
      {
        heading: 'Run a quick sensitivity check',
        body:
          'Model outcomes across a few scenarios (conservative, expected, aggressive). This helps you avoid overfitting to optimistic assumptions and shows which variables matter most.',
        bullets: [
          'Time saved per run (percentage).',
          'Reduction in exception rate.',
          'Adoption rate across the target team.',
        ],
      },
      {
        heading: 'Validate with a pilot',
        body:
          'Use a short pilot to turn assumptions into measured results. Track run time, completion rate, and exception handling with and without guidance, then update the model using real data.',
      },
    ],
  },
  {
    slug: 'security-overview',
    title: 'Security overview for desktop guidance',
    category: 'Brief',
    summary:
      'A practical overview of how Trope keeps capture permissioned, workspaces isolated, and workflow runs auditable.',
    readTime: '7 min read',
    audience: 'Security + IT',
    sections: [
      {
        heading: 'What Trope is (and why security matters)',
        body:
          'Trope helps teams capture and run guided workflows inside the desktop apps they already use. Because workflows can include sensitive screens (customer records, finance tools, internal systems), we treat security and access control as product features, not an afterthought. This brief explains Trope\'s security approach at a high level: permissioned capture on the desktop, isolated workspaces in Trope Cloud, and strong accountability through run history and logs.',
      },
      {
        heading: 'Permissioned capture',
        body:
          'Desktop capture is gated by explicit user permissions. Trope is designed so capture is user-initiated and can be stopped at any time, and the desktop agent only sees what a user has authorized through OS-level permissions. In other words: Trope does not silently run in the background - capture starts when a user starts it.',
      },
      {
        heading: 'Data minimization for sensitive workflows',
        body:
          'Trope is designed to capture what you need to make a workflow usable - not to indiscriminately collect a user\'s desktop. Teams get the best security outcomes when they pair Trope\'s explicit capture model with clear internal guidelines: record only approved workflows, use test or masked data when possible, and pause or stop capture around secrets. This keeps workflow assets focused on UI steps and reduces the chance that highly sensitive information becomes part of a shared guide.',
        bullets: [
          'Prefer test environments or test accounts for recordings when possible.',
          'Avoid recording secrets (passwords, MFA codes, API keys) whenever feasible.',
        ],
      },
      {
        heading: 'Local-first handling of workflow artifacts',
        body:
          'Workflow recordings are created on the user\'s machine first. That raw capture remains protected by your existing endpoint posture (device encryption, MDM/EDR policies, managed OS updates) before anything is uploaded. In practice, this lets teams define clear capture guidelines - what is appropriate to record, what to avoid, and which workflows should be handled by a smaller trusted group.',
      },
      {
        heading: 'Cloud isolation',
        body:
          'Trope Cloud stores workflow assets per workspace and scopes access through org membership and invites. This workspace model is designed to keep collaboration simple for teams while reducing the risk of accidental cross-team or cross-customer access. Workspace admins manage membership, and sharing can be scoped to what the situation requires.',
        bullets: [
          'Invite-based membership and admin-managed access.',
          'Optional sharing through scoped, time-bound workflow links.',
        ],
      },
      {
        heading: 'Clear boundary between capture and cloud processing',
        body:
          'Trope intentionally separates on-device capture from cloud processing. The desktop side is the privileged boundary for interacting with the operating system, while the cloud side focuses on storing workspace assets, generating guidance, and coordinating access. This split helps minimize what the cloud can see by default and makes it easier for security teams to reason about where sensitive data may exist. When automation actions are enabled, they run within an active session and under explicit user-granted capabilities on the endpoint - not as unattended background access.',
      },
      {
        heading: 'Auditability',
        body:
          'Each workflow run produces structured metadata that supports review, QA, and compliance needs. Teams can answer basic questions like who ran a workflow, when it was run, and whether it completed successfully - without relying on tribal knowledge or informal screen recordings. Over time, run history and feedback help keep high-impact workflows current.',
      },
      {
        heading: 'Retention, deletion, and offboarding',
        body:
          'Trope is built for business workflows, which means teams need predictable lifecycle controls. We retain customer data only as long as needed to provide the service and to meet operational and legal obligations. When employees change roles or leave, workspace admins can remove membership so users lose access to workspace assets. As part of a security review, we can align on retention expectations for workflow artifacts and discuss deletion and offboarding workflows.',
      },
      {
        heading: 'Encryption and data protection',
        body:
          'Trope uses industry-standard encryption to protect data in transit and at rest. This applies to workflow artifacts, generated guides, and operational logs. We also follow least-privilege principles for internal access so routine operations do not require broad visibility into customer content. If your security program requires it, we can document our encryption posture and access workflows at a level suitable for vendor review without exposing sensitive implementation details.',
      },
      {
        heading: 'Operational security and incident response',
        body:
          'Security also depends on how a service is operated day to day. Trope maintains operational logging and monitoring so we can track service health, investigate issues, and respond quickly. When something goes wrong, we follow an incident response process to contain impact, restore service, and drive remediation. For security-sensitive customers, we can align on communication expectations, security points of contact, and escalation paths during procurement. We also treat operational hygiene (reviewed access, change control, and defense-in-depth) as part of the product lifecycle, not an afterthought.',
      },
      {
        heading: 'Authentication and access governance',
        body:
          'Trope is designed for controlled access at the workspace level. Authentication establishes identity, and authorization enforces what each user can do within a workspace. On desktop, Trope relies on OS-provided secure storage to protect authentication material, and workspace admins can control invites and membership as teams change.',
      },
      {
        heading: 'AI processing and third-party providers',
        body:
          'Some Trope features rely on AI to turn captured artifacts into usable guidance. When we use third-party AI providers, we do so under agreements that restrict how customer data can be used, and we limit sharing to what is necessary to operate the service. We do not permit AI providers to use your data to train models for other customers, and for strict compliance needs we can discuss provider and region constraints.',
      },
      {
        heading: 'Canadian data residency (for those who need it)',
        body:
          'Some organizations require Canada-only data residency for storage and processing. Trope supports a Canada region approach for eligible customers, with the goal of keeping Canadian tenants pinned to Canadian endpoints and in-country processing. We define the scope clearly (storage, processing, and provider choices) so you can evaluate it against your policy. If your compliance program has specific interpretations (for example, around global CDNs or DNS), we will document the end-to-end behavior and available options so you can make an informed decision.',
        bullets: [
          'Region-pinned storage and processing for Canada-resident workspaces.',
          'Residency guardrails to prevent accidental cross-region handling.',
        ],
      },
      {
        heading: 'SOC 2 readiness and security reviews',
        body:
          'Trope is building toward SOC 2. We have completed a SOC 2 readiness assessment (January 22, 2026) based on code and documentation review, and we use it to prioritize hardening and evidence collection. A readiness assessment is not an auditor-issued SOC 2 report, but it gives security teams a concrete view of control coverage and what documentation is available today, including gaps and remediation plans. We can share the assessment under NDA and support standard security questionnaires and customer security reviews. When an auditor-issued SOC 2 report is available, we will provide it through the same process.',
      },
      {
        heading: 'What we can share during procurement',
        body:
          'Most security reviews go faster when you have concrete artifacts. Trope can provide a security review package tailored to your deployment, including a high-level data flow overview, an AI data-handling overview for applicable features, and residency posture where relevant. If you have a standard vendor questionnaire, we are happy to complete it and walk through your threat model with your security team.',
        bullets: [
          'High-level architecture and data flow overview.',
          'SOC 2 readiness assessment (January 22, 2026) under NDA.',
          'Canadian data residency posture and boundary description (if applicable).',
        ],
      },
      {
        heading: 'Practical guidance for a safe rollout',
        body:
          'Trope is most effective when security expectations are explicit from day one. Start with a small pilot workspace, define capture do\'s and don\'ts, and assign workflow ownership so guides stay current. Trope\'s permissioned capture, workspace access controls, and auditability are designed to fit into standard enterprise rollout practices - from a small enablement pilot to a broader operations deployment. When collaborating outside the core team, use scoped, time-bound sharing.',
        bullets: [
          'Start with a limited set of workflows and a trusted pilot group.',
          'Document capture guidelines (for example, avoid recording secrets or MFA codes).',
          'Assign workflow owners and a review cadence for critical processes.',
        ],
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
