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
          'Run the compliance checklist in the desktop app.',
          'Verify the highest priority SLA queue in the support tool.',
          'Check the alerts panel for overnight incidents.',
          'Update the shared operations tracker with status notes.',
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
          'Open the CRM and search the customer record.',
          'Confirm account status and entitlement tier.',
          'Open the admin console for the product.',
          'Apply the requested entitlement change.',
          'Open the billing tool and update the subscription.',
          'Confirm the billing preview totals match expectations.',
          'Return to the ticket and document the changes.',
          'Send a confirmation email to the customer.',
        ],
      },
      {
        title: 'Refund processing with audit trail',
        systems: ['Commerce admin', 'Payment tool', 'Accounting system', 'Ticketing'],
        steps: [
          'Open the ticket and confirm refund eligibility.',
          'Open the commerce admin and locate the order.',
          'Verify order status and refund policy flags.',
          'Click Issue refund and select refund method.',
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
          'Open the knowledge base article for the issue.',
          'Run diagnostics from the remote support toolbar.',
          'Apply the recommended fix in the desktop app.',
          'Restart the affected service or device if required.',
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
          'Click Edit and update the stage and close date.',
          'Fill required fields (next step, amount, probability).',
          'Open the forecast sheet and adjust the forecast amount.',
          'Open the BI dashboard to verify pipeline totals.',
          'Paste the updated forecast in the CRM notes.',
          'Notify CS and finance in the shared channel.',
        ],
      },
      {
        title: 'Quote-to-cash checklist',
        systems: ['CPQ', 'Approval workflow', 'Billing system', 'Finance tool'],
        steps: [
          'Open the CPQ tool and create a new quote.',
          'Select products, quantities, and term length.',
          'Apply approved discount and verify pricing summary.',
          'Click Submit for approval.',
          'Open the approval workflow and approve the quote.',
          'Sync the quote to the billing system.',
          'Verify taxes and invoicing schedule in billing.',
          'Open the finance tool and confirm revenue schedule.',
          'Send the quote for e-signature.',
          'Update the CRM opportunity with the quote status.',
        ],
      },
      {
        title: 'Renewal preparation workflow',
        systems: ['Usage dashboard', 'CRM', 'CLM', 'E-sign'],
        steps: [
          'Open the usage dashboard and filter by account.',
          'Export the last 90 days of usage to CSV.',
          'Open the renewal opportunity in the CRM.',
          'Update renewal amount and expected close date.',
          'Attach the usage CSV to the opportunity.',
          'Open the CLM system and generate a renewal contract.',
          'Send the contract for e-signature.',
          'Log renewal status updates in the CRM.',
          'Create a follow-up task for the account owner.',
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
          'Notify SDR managers about the change.',
          'Update the routing documentation.',
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
          'Open the onboarding ticket and confirm start date.',
          'Open the MDM console and locate the assigned device.',
          'Apply the standard image profile.',
          'Assign the device to the new hire in MDM.',
          'Open the identity provider and create the user account.',
          'Assign baseline groups and MFA policy.',
          'Open the app catalog and select required applications.',
          'Deploy the app bundle to the device.',
          'Verify device health and encryption status in MDM.',
          'Send the welcome email with login instructions.',
          'Update the onboarding ticket with completion notes.',
        ],
      },
      {
        title: 'Privileged access request',
        systems: ['Ticketing', 'PAM', 'Identity provider', 'Audit log'],
        steps: [
          'Open the access request ticket and review the justification.',
          'Verify the requester role in the identity provider.',
          'Open the PAM system and create a new access request.',
          'Select the target system and access scope.',
          'Set the expiration date and approval requirement.',
          'Submit for approval and wait for approver sign-off.',
          'Apply the role assignment in the identity provider.',
          'Confirm access in the PAM audit log.',
          'Update the ticket with approval and access details.',
        ],
      },
      {
        title: 'Software rollout update',
        systems: ['App catalog', 'MDM', 'Release notes', 'Knowledge base'],
        steps: [
          'Open the release notes for the new version.',
          'Deploy the update to a pilot group in MDM.',
          'Monitor installation status and error logs.',
          'Confirm the app launches successfully on pilot devices.',
          'Roll out the update to the full device group.',
          'Update the knowledge base with new UI changes.',
          'Notify teams of the update in the IT channel.',
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
          'Open the access review spreadsheet.',
          'Import both exports into the review tabs.',
          'Run the mismatch check and filter exceptions.',
          'Validate exceptions with department owners.',
          'Document decisions in the review spreadsheet.',
          'Open the GRC tool and upload the completed review.',
          'Mark the control evidence task complete.',
        ],
      },
      {
        title: 'Audit evidence collection',
        systems: ['GRC tool', 'Ticketing', 'Logging platform', 'Shared drive'],
        steps: [
          'Open the audit request in the GRC tool.',
          'Review the list of required controls.',
          'Open the logging platform and export activity logs.',
          'Download supporting tickets from the ticketing tool.',
          'Save evidence files in the audit folder on the shared drive.',
          'Upload evidence files to the GRC request.',
          'Add notes describing the control execution.',
          'Submit the evidence package for auditor review.',
        ],
      },
      {
        title: 'Policy attestation cycle',
        systems: ['HRIS', 'E-sign tool', 'LMS'],
        steps: [
          'Open the policy attestation campaign in the LMS.',
          'Upload the updated policy PDF.',
          'Sync the active employee list from HRIS.',
          'Send attestation requests.',
          'Track completion status and reminders.',
          'Export the completion report.',
          'Store the report in the compliance archive.',
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
          'Enter vendor, item description, and budget code.',
          'Upload vendor quotes from the shared drive.',
          'Submit the request for approval.',
          'Open the approvals tool and review the request.',
          'Approve the request and note any conditions.',
          'Open the ERP and create a purchase order.',
          'Attach the approved request and quotes.',
          'Send the PO to the vendor and log confirmation.',
          'Update the procurement request with the PO number.',
        ],
      },
      {
        title: 'Vendor banking change',
        systems: ['Vendor master', 'Document system', 'Approvals'],
        steps: [
          'Open the vendor change request ticket.',
          'Verify the new banking document in the document system.',
          'Open the vendor master record in the ERP.',
          'Update banking details and mark as pending approval.',
          'Open the approvals tool and route to finance.',
          'After approval, confirm the vendor record is active.',
          'Document the change in the vendor change log.',
        ],
      },
      {
        title: 'Contract renewal review',
        systems: ['Contract system', 'Spend dashboard', 'Approvals'],
        steps: [
          'Open the contract record for the renewal.',
          'Review usage and spend in the spend dashboard.',
          'Update the renewal summary with findings.',
          'Submit the renewal for approval.',
          'Capture approval notes and required changes.',
          'Finalize the renewal status in the contract system.',
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
          'Click Create onboarding task.',
          'Open the product admin console.',
          'Create the customer workspace with plan tier.',
          'Invite the primary admin via email.',
          'Open the billing system and activate the subscription.',
          'Confirm the subscription status is Active.',
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
          'Fix formatting errors and save the cleaned file.',
          'Upload the cleaned file to the product admin importer.',
          'Run the validation preview and resolve errors.',
          'Submit the import and confirm completion status.',
          'Update the onboarding tracker with results.',
        ],
      },
      {
        title: 'Training and go-live readiness',
        systems: ['Calendar', 'LMS', 'CRM'],
        steps: [
          'Schedule the kickoff session on the calendar.',
          'Send training resources from the LMS.',
          'Track completion of required modules.',
          'Document attendance and questions in the CRM.',
          'Confirm go-live date with the customer admin.',
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
          'Validate claimant details against the policy record.',
          'Open the document intake portal.',
          'Download supporting documents and attach to claim.',
          'Set claim status to In Review.',
        ],
      },
      {
        title: 'Fraud screening workflow',
        systems: ['Fraud tool', 'Claims system', 'Notes'],
        steps: [
          'Open the claim and click Run fraud screen.',
          'Review the fraud score and flags.',
          'If flagged, request additional documentation.',
          'Document the request in claim notes.',
          'Set the claim status to Pending Review.',
        ],
      },
      {
        title: 'Payout approval and payment',
        systems: ['Claims system', 'Approvals', 'Payment system', 'Ledger'],
        steps: [
          'Open the claim and review the settlement amount.',
          'Submit the payout for approval.',
          'Approve the payout in the approvals tool.',
          'Open the payment system and issue the payout.',
          'Update the ledger with the payout memo.',
          'Mark the claim as Closed and notify the claimant.',
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
          'Pack the order and scan items.',
          'Open the carrier portal and create a shipment.',
          'Print the shipping label and apply it.',
          'Update the shipment tracking number in the ERP.',
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
          'Create an exception ticket with root cause.',
          'Update the customer with a new ETA.',
          'Flag the shipment for follow-up review.',
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
          'Update inventory adjustments in the ERP.',
          'Save the reconciliation file to the shared drive.',
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
          'Open the eligibility portal and run insurance verification.',
          'Capture the eligibility response and upload to the EHR.',
          'Enter insurance plan details and effective dates.',
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
          'Open the EHR and create a referral record.',
          'Attach the referral document to the patient chart.',
          'Confirm insurance coverage for the referral type.',
          'Open the scheduling system and locate available slots.',
          'Schedule the referral appointment.',
          'Send confirmation to the referring provider via portal/fax.',
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
          'Open the payer portal and start a new prior auth.',
          'Enter procedure codes and patient details.',
          'Upload clinical notes and supporting documents.',
          'Submit the authorization request.',
          'Record the auth reference number in the EHR.',
          'Set a follow-up task for authorization status.',
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
          'Export the final budget as PDF.',
          'Open the submission portal and start a new application.',
          'Upload the narrative and budget attachments.',
          'Complete required fields and validate the checklist.',
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
          'Review the report against the grant checklist.',
          'Submit the report via the donor portal.',
          'Log submission and upload receipts to the CRM.',
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
          'Update the grant tracker with remaining balances.',
          'Share the reconciliation summary with program leads.',
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
