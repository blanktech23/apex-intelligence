'use client';

import { useState, useCallback } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Workflow,
  Clock,
  User,
  ChevronRight,
  ChevronDown,
  Copy,
  Archive,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  ImageIcon,
  Paperclip,
  MessageSquare,
  History,
  Timer,
  Wrench,
  Hash,
  Filter,
  MoreHorizontal,
  Eye,
  Briefcase,
  DollarSign,
  Users,
  HardHat,
  ClipboardCheck,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProcessStatus = 'Published' | 'Draft' | 'Under Review' | 'Archived';
type ProcessCategory =
  | 'Operations'
  | 'Sales'
  | 'Finance'
  | 'HR'
  | 'Project Management';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  responsibleRole: string;
  estimatedTime: string;
  tools: string[];
  completed: boolean;
}

interface ProcessComment {
  id: string;
  author: string;
  initials: string;
  text: string;
  date: string;
}

interface VersionEntry {
  version: string;
  date: string;
  author: string;
  changes: string;
}

interface Process {
  id: string;
  title: string;
  owner: { name: string; initials: string };
  department: ProcessCategory;
  status: ProcessStatus;
  lastUpdated: string;
  version: string;
  steps: ProcessStep[];
  description: string;
  attachments: string[];
  comments: ProcessComment[];
  versionHistory: VersionEntry[];
}

// ---------------------------------------------------------------------------
// Toast State
// ---------------------------------------------------------------------------

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}

let toastIdCounter = 0;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig: Record<ProcessStatus, { color: string }> = {
  Published: { color: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
  Draft: { color: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30' },
  'Under Review': { color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  Archived: { color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
};

const categoryConfig: Record<ProcessCategory, { icon: typeof Workflow; color: string }> = {
  Operations: { icon: HardHat, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  Sales: { icon: Briefcase, color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  Finance: { icon: DollarSign, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  HR: { icon: Users, color: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30' },
  'Project Management': { icon: ClipboardCheck, color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
};

const allCategories: (ProcessCategory | 'All Processes')[] = [
  'All Processes',
  'Operations',
  'Sales',
  'Finance',
  'HR',
  'Project Management',
];

const allStatuses: (ProcessStatus | 'All Statuses')[] = [
  'All Statuses',
  'Published',
  'Draft',
  'Under Review',
  'Archived',
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialProcesses: Process[] = [
  {
    id: 'proc-001',
    title: 'Project Estimating Process',
    owner: { name: 'Ryan Nakamura', initials: 'RN' },
    department: 'Operations',
    status: 'Published',
    lastUpdated: 'Mar 18, 2026',
    version: '3.2',
    description:
      'End-to-end estimating methodology from initial client inquiry through final bid submission. Covers site visits, takeoffs, subcontractor pricing, markups, and proposal delivery.',
    steps: [
      { id: 's1', title: 'Receive Bid Invitation', description: 'Review incoming bid invitation or RFP. Log in CRM with project details, scope summary, and deadline. Assess go/no-go based on capacity and fit.', responsibleRole: 'Estimator', estimatedTime: '30 min', tools: ['CRM', 'Email'], completed: false },
      { id: 's2', title: 'Conduct Site Visit', description: 'Visit the project site to assess conditions, take photos, note access constraints, and identify potential risks. Document existing conditions.', responsibleRole: 'Estimator', estimatedTime: '2 hrs', tools: ['Camera', 'Measuring Tools', 'Site Visit Form'], completed: false },
      { id: 's3', title: 'Perform Quantity Takeoff', description: 'Review plans and specifications. Measure and calculate material quantities for all trades. Use digital takeoff software for accuracy.', responsibleRole: 'Estimator', estimatedTime: '4-8 hrs', tools: ['Planswift', 'Bluebeam', 'Excel'], completed: false },
      { id: 's4', title: 'Request Subcontractor Pricing', description: 'Send bid packages to qualified subcontractors. Include scope of work, plans, specs, and bid due date. Follow up to ensure adequate coverage.', responsibleRole: 'Estimator', estimatedTime: '1 hr', tools: ['Email', 'Sub List Database'], completed: false },
      { id: 's5', title: 'Build Cost Model', description: 'Assemble all costs: materials, labor, equipment, subcontractors. Apply markups for overhead, profit, and contingency per company standards.', responsibleRole: 'Lead Estimator', estimatedTime: '3-5 hrs', tools: ['Estimating Software', 'Excel'], completed: false },
      { id: 's6', title: 'Management Review & Approval', description: 'Present estimate to leadership for review. Discuss risk factors, assumptions, and pricing strategy. Obtain approval to submit.', responsibleRole: 'Operations Manager', estimatedTime: '1 hr', tools: ['Presentation Deck'], completed: false },
      { id: 's7', title: 'Submit Proposal', description: 'Package final proposal with cover letter, scope inclusions/exclusions, schedule, and pricing. Submit before deadline and confirm receipt.', responsibleRole: 'Estimator', estimatedTime: '1 hr', tools: ['Proposal Template', 'Email'], completed: false },
    ],
    attachments: ['Estimating Standards Guide.pdf', 'Markup Table 2026.xlsx', 'Proposal Template.docx'],
    comments: [
      { id: 'c1', author: 'Mike Torres', initials: 'MT', text: 'Updated markup tables for Q1 2026 rates.', date: 'Mar 15, 2026' },
      { id: 'c2', author: 'Sarah Chen', initials: 'SC', text: 'Added go/no-go criteria to step 1.', date: 'Mar 10, 2026' },
    ],
    versionHistory: [
      { version: '3.2', date: 'Mar 18, 2026', author: 'Ryan Nakamura', changes: 'Updated sub pricing step with new vendor list requirements' },
      { version: '3.1', date: 'Feb 5, 2026', author: 'Ryan Nakamura', changes: 'Added go/no-go assessment criteria' },
      { version: '3.0', date: 'Jan 10, 2026', author: 'Mike Torres', changes: 'Major revision: added digital takeoff workflow' },
    ],
  },
  {
    id: 'proc-002',
    title: 'Client Onboarding Process',
    owner: { name: 'Sarah Chen', initials: 'SC' },
    department: 'Sales',
    status: 'Published',
    lastUpdated: 'Mar 15, 2026',
    version: '2.1',
    description:
      'Standard process for onboarding new clients from signed contract through project kickoff. Ensures consistent experience and information gathering.',
    steps: [
      { id: 's1', title: 'Contract Execution', description: 'Finalize and countersign the contract. Distribute copies to client and internal stakeholders. Set up project in accounting system.', responsibleRole: 'Account Executive', estimatedTime: '1 hr', tools: ['DocuSign', 'Accounting Software'], completed: false },
      { id: 's2', title: 'Welcome Package Delivery', description: 'Send branded welcome kit with company overview, team contacts, communication expectations, and project portal login credentials.', responsibleRole: 'Client Success Manager', estimatedTime: '30 min', tools: ['Welcome Kit Template', 'Email'], completed: false },
      { id: 's3', title: 'Kickoff Meeting Scheduling', description: 'Coordinate schedules and send calendar invites for the project kickoff meeting. Include agenda and prep materials.', responsibleRole: 'Project Manager', estimatedTime: '30 min', tools: ['Calendar', 'Agenda Template'], completed: false },
      { id: 's4', title: 'Internal Team Briefing', description: 'Brief the project team on client background, contract terms, scope, budget, and any special requirements or sensitivities.', responsibleRole: 'Project Manager', estimatedTime: '1 hr', tools: ['Project Brief Template'], completed: false },
      { id: 's5', title: 'Kickoff Meeting Execution', description: 'Conduct kickoff meeting covering introductions, scope review, schedule, communication plan, decision-making process, and next steps.', responsibleRole: 'Project Manager', estimatedTime: '1.5 hrs', tools: ['Presentation', 'Meeting Room/Zoom'], completed: false },
      { id: 's6', title: 'Post-Kickoff Follow-up', description: 'Send meeting minutes, confirm action items, and establish recurring check-in schedule. Set up shared project folder.', responsibleRole: 'Project Coordinator', estimatedTime: '1 hr', tools: ['Email', 'Project Management Tool'], completed: false },
    ],
    attachments: ['Welcome Kit Template.pdf', 'Kickoff Agenda Template.docx'],
    comments: [
      { id: 'c1', author: 'Kim Lee', initials: 'KL', text: 'Great process. Suggest adding a client satisfaction survey at 30 days.', date: 'Mar 12, 2026' },
    ],
    versionHistory: [
      { version: '2.1', date: 'Mar 15, 2026', author: 'Sarah Chen', changes: 'Added post-kickoff follow-up step' },
      { version: '2.0', date: 'Jan 20, 2026', author: 'Sarah Chen', changes: 'Complete rewrite with new welcome kit' },
    ],
  },
  {
    id: 'proc-003',
    title: 'Change Order Management',
    owner: { name: 'David Kim', initials: 'DK' },
    department: 'Operations',
    status: 'Under Review',
    lastUpdated: 'Mar 12, 2026',
    version: '1.4',
    description:
      'Procedures for managing change orders from identification through approval. Covers documentation, pricing, client communication, and contract amendments.',
    steps: [
      { id: 's1', title: 'Identify Change Condition', description: 'Recognize work outside original contract scope. Document the condition with photos, descriptions, and reference to contract language.', responsibleRole: 'Project Manager', estimatedTime: '30 min', tools: ['Camera', 'Contract Documents'], completed: false },
      { id: 's2', title: 'Prepare Change Order Estimate', description: 'Price the additional/modified work including materials, labor, equipment, and markups per company standards.', responsibleRole: 'Estimator', estimatedTime: '2-4 hrs', tools: ['Estimating Software', 'Cost Database'], completed: false },
      { id: 's3', title: 'Internal Approval', description: 'Submit change order package to operations leadership for review and margin approval before sending to client.', responsibleRole: 'Operations Manager', estimatedTime: '1 hr', tools: ['Approval Form', 'Email'], completed: false },
      { id: 's4', title: 'Client Presentation', description: 'Present the change order to the client with clear justification, pricing breakdown, and schedule impact analysis.', responsibleRole: 'Project Manager', estimatedTime: '1 hr', tools: ['CO Template', 'Meeting'], completed: false },
      { id: 's5', title: 'Obtain Written Approval', description: 'Secure signed change order authorization before proceeding with any additional work. No verbal approvals.', responsibleRole: 'Project Manager', estimatedTime: '30 min', tools: ['DocuSign', 'CO Form'], completed: false },
      { id: 's6', title: 'Update Project Records', description: 'Update contract value, budget, schedule, and project management system to reflect approved change. Notify accounting.', responsibleRole: 'Project Coordinator', estimatedTime: '30 min', tools: ['PM Software', 'Accounting System'], completed: false },
    ],
    attachments: ['Change Order Form.pdf', 'CO Pricing Template.xlsx'],
    comments: [
      { id: 'c1', author: 'Lisa Park', initials: 'LP', text: 'Should we add a step for dispute resolution?', date: 'Mar 10, 2026' },
      { id: 'c2', author: 'David Kim', initials: 'DK', text: 'Good idea, will add in v1.5.', date: 'Mar 11, 2026' },
    ],
    versionHistory: [
      { version: '1.4', date: 'Mar 12, 2026', author: 'David Kim', changes: 'Added schedule impact requirement to client presentation step' },
      { version: '1.3', date: 'Feb 1, 2026', author: 'David Kim', changes: 'Clarified no-verbal-approval policy' },
    ],
  },
  {
    id: 'proc-004',
    title: 'Invoice & Payment Collection',
    owner: { name: 'Lisa Park', initials: 'LP' },
    department: 'Finance',
    status: 'Published',
    lastUpdated: 'Mar 10, 2026',
    version: '2.0',
    description:
      'Standardized invoicing and accounts receivable process. Covers progress billing, lien waivers, payment follow-up, and escalation procedures.',
    steps: [
      { id: 's1', title: 'Prepare Draw Request', description: 'Calculate completed work percentages per schedule of values. Compile backup documentation including daily logs and progress photos.', responsibleRole: 'Project Manager', estimatedTime: '2 hrs', tools: ['Schedule of Values', 'Daily Logs'], completed: false },
      { id: 's2', title: 'Generate Invoice', description: 'Create AIA-format invoice with current and cumulative billing. Include required lien waivers and certified payrolls if applicable.', responsibleRole: 'Accounting Clerk', estimatedTime: '1 hr', tools: ['Accounting Software', 'AIA Forms'], completed: false },
      { id: 's3', title: 'PM Review & Approval', description: 'Project manager reviews invoice for accuracy against field progress. Verify quantities and percentage complete claims.', responsibleRole: 'Project Manager', estimatedTime: '30 min', tools: ['Invoice Package'], completed: false },
      { id: 's4', title: 'Submit to Client', description: 'Send invoice package with all supporting documentation per contract requirements. Note submission date for payment term tracking.', responsibleRole: 'Accounting Clerk', estimatedTime: '15 min', tools: ['Email', 'Client Portal'], completed: false },
      { id: 's5', title: 'Payment Follow-up', description: 'Track payment against contract terms. Send reminder at 30 days. Escalate to PM at 45 days. Escalate to leadership at 60 days.', responsibleRole: 'Accounting Manager', estimatedTime: '15 min/cycle', tools: ['AR Aging Report', 'Email'], completed: false },
    ],
    attachments: ['AIA Invoice Template.pdf', 'Lien Waiver Templates.pdf', 'AR Escalation Policy.pdf'],
    comments: [],
    versionHistory: [
      { version: '2.0', date: 'Mar 10, 2026', author: 'Lisa Park', changes: 'Added escalation timeline and lien waiver requirements' },
      { version: '1.0', date: 'Nov 15, 2025', author: 'Lisa Park', changes: 'Initial publication' },
    ],
  },
  {
    id: 'proc-005',
    title: 'New Employee Onboarding',
    owner: { name: 'Jennifer Adams', initials: 'JA' },
    department: 'HR',
    status: 'Published',
    lastUpdated: 'Mar 16, 2026',
    version: '4.0',
    description:
      'Comprehensive employee onboarding from offer acceptance through 90-day review. Covers paperwork, equipment, training, team integration, and milestone check-ins.',
    steps: [
      { id: 's1', title: 'Pre-Start Paperwork', description: 'Send employment agreement, tax forms (W-4, I-9), direct deposit enrollment, benefits enrollment packet, and company handbook acknowledgment.', responsibleRole: 'HR Coordinator', estimatedTime: '1 hr', tools: ['HRIS', 'DocuSign', 'Benefits Portal'], completed: false },
      { id: 's2', title: 'Equipment & Access Setup', description: 'Order laptop/phone, set up email account, provision software licenses, create building access badge, and assign desk/workspace.', responsibleRole: 'IT Administrator', estimatedTime: '2 hrs', tools: ['IT Ticketing System', 'Asset Management'], completed: false },
      { id: 's3', title: 'Day One Welcome', description: 'Office tour, team introductions, review company culture and values, set up workstation, lunch with team. Provide 30/60/90-day plan.', responsibleRole: 'Direct Manager', estimatedTime: '4 hrs', tools: ['Onboarding Checklist', 'Welcome Kit'], completed: false },
      { id: 's4', title: 'Safety Orientation', description: 'Complete OSHA-required safety training, PPE issuance, emergency procedures review, and safety acknowledgment forms for field staff.', responsibleRole: 'Safety Manager', estimatedTime: '3 hrs', tools: ['Safety Training Materials', 'PPE Inventory'], completed: false },
      { id: 's5', title: 'Role-Specific Training', description: 'Software training, process walkthroughs, shadowing assignments, and skill assessments relevant to the new hire\'s position.', responsibleRole: 'Direct Manager', estimatedTime: '1-2 weeks', tools: ['Training Materials', 'Knowledge Base'], completed: false },
      { id: 's6', title: '30-Day Check-in', description: 'Manager and HR meet with new hire to assess integration, answer questions, address concerns, and adjust training plan if needed.', responsibleRole: 'Direct Manager + HR', estimatedTime: '30 min', tools: ['Check-in Template'], completed: false },
      { id: 's7', title: '90-Day Review', description: 'Formal performance review at 90 days covering role fit, competency development, cultural alignment, and confirmation of employment.', responsibleRole: 'Direct Manager + HR', estimatedTime: '1 hr', tools: ['Review Template', 'HRIS'], completed: false },
    ],
    attachments: ['Onboarding Checklist.pdf', 'Company Handbook 2026.pdf', '30-60-90 Plan Template.docx', 'Safety Orientation Slides.pptx'],
    comments: [
      { id: 'c1', author: 'Mike Torres', initials: 'MT', text: 'Safety orientation is now 3 hours per new OSHA requirements.', date: 'Mar 14, 2026' },
    ],
    versionHistory: [
      { version: '4.0', date: 'Mar 16, 2026', author: 'Jennifer Adams', changes: 'Updated for 2026 OSHA requirements and new benefits provider' },
      { version: '3.0', date: 'Jan 5, 2026', author: 'Jennifer Adams', changes: 'Added 30/60/90-day milestone structure' },
    ],
  },
  {
    id: 'proc-006',
    title: 'Quality Inspection Checklist',
    owner: { name: 'Mike Torres', initials: 'MT' },
    department: 'Operations',
    status: 'Published',
    lastUpdated: 'Mar 8, 2026',
    version: '2.3',
    description:
      'Standardized quality control inspection process for all project phases. Ensures work meets specifications, code requirements, and company quality standards.',
    steps: [
      { id: 's1', title: 'Pre-Inspection Planning', description: 'Review applicable specs, drawings, and code requirements. Prepare inspection checklist specific to the work being inspected.', responsibleRole: 'Quality Manager', estimatedTime: '30 min', tools: ['Specs', 'Code Books', 'Checklist Template'], completed: false },
      { id: 's2', title: 'Field Inspection', description: 'Conduct visual and dimensional inspections. Check workmanship, material compliance, and code adherence. Document with photos.', responsibleRole: 'Quality Inspector', estimatedTime: '1-3 hrs', tools: ['Inspection Tools', 'Camera', 'Tablet'], completed: false },
      { id: 's3', title: 'Document Findings', description: 'Record all observations, deficiencies, and non-conformances in inspection report. Rate severity: minor, major, critical.', responsibleRole: 'Quality Inspector', estimatedTime: '30 min', tools: ['Inspection Report Form', 'Photo Log'], completed: false },
      { id: 's4', title: 'Issue Corrective Actions', description: 'For any deficiencies, issue corrective action requests (CARs) with clear descriptions, deadlines, and responsible parties.', responsibleRole: 'Quality Manager', estimatedTime: '30 min', tools: ['CAR Form', 'Email'], completed: false },
      { id: 's5', title: 'Re-Inspection & Close-out', description: 'Verify corrective actions are completed satisfactorily. Sign off on inspection report and archive for project records.', responsibleRole: 'Quality Inspector', estimatedTime: '1 hr', tools: ['CAR Tracking Log'], completed: false },
    ],
    attachments: ['Inspection Checklist Master.pdf', 'CAR Form Template.pdf', 'Photo Log Template.xlsx'],
    comments: [],
    versionHistory: [
      { version: '2.3', date: 'Mar 8, 2026', author: 'Mike Torres', changes: 'Added severity rating system for deficiencies' },
    ],
  },
  {
    id: 'proc-007',
    title: 'Subcontractor Vetting Process',
    owner: { name: 'Dan Parker', initials: 'DP' },
    department: 'Operations',
    status: 'Draft',
    lastUpdated: 'Mar 5, 2026',
    version: '0.8',
    description:
      'Qualification and approval process for new subcontractors. Verifies insurance, licensing, safety record, financial stability, and past performance.',
    steps: [
      { id: 's1', title: 'Initial Application', description: 'Subcontractor completes prequalification application with company info, trade specialties, capacity, and references.', responsibleRole: 'Procurement Manager', estimatedTime: '15 min', tools: ['Prequal Application Form'], completed: false },
      { id: 's2', title: 'Insurance Verification', description: 'Verify current COI meets minimum requirements: GL ($2M), Auto ($1M), Workers Comp, Umbrella ($5M). Must name us as additional insured.', responsibleRole: 'Risk Manager', estimatedTime: '30 min', tools: ['Insurance Checklist', 'COI Review'], completed: false },
      { id: 's3', title: 'License & Bonding Check', description: 'Verify active state contractor license, check for disciplinary actions, and confirm bonding capacity for anticipated work volume.', responsibleRole: 'Procurement Manager', estimatedTime: '30 min', tools: ['State License Board', 'Bonding Agent Contact'], completed: false },
      { id: 's4', title: 'Safety Record Review', description: 'Review EMR (must be < 1.0), OSHA logs, safety program documentation, and incident history for past 3 years.', responsibleRole: 'Safety Manager', estimatedTime: '1 hr', tools: ['EMR Request Form', 'OSHA Log Template'], completed: false },
      { id: 's5', title: 'Reference Check', description: 'Contact 3+ references (GCs and owners). Evaluate quality, reliability, communication, and contract compliance history.', responsibleRole: 'Procurement Manager', estimatedTime: '1 hr', tools: ['Reference Check Form', 'Phone'], completed: false },
      { id: 's6', title: 'Approval Decision', description: 'Compile vetting results and present to operations leadership. Approve, conditionally approve, or reject with documented reasoning.', responsibleRole: 'Operations Director', estimatedTime: '30 min', tools: ['Vetting Summary Report'], completed: false },
    ],
    attachments: ['Prequal Application.pdf', 'Insurance Requirements Summary.pdf'],
    comments: [
      { id: 'c1', author: 'Ryan Nakamura', initials: 'RN', text: 'Should we add a financial health check step? D&B report or similar.', date: 'Mar 3, 2026' },
      { id: 'c2', author: 'Dan Parker', initials: 'DP', text: 'Agreed. Adding in next revision for subs over $500K annual spend.', date: 'Mar 4, 2026' },
    ],
    versionHistory: [
      { version: '0.8', date: 'Mar 5, 2026', author: 'Dan Parker', changes: 'Draft: Added insurance minimum requirements detail' },
      { version: '0.5', date: 'Feb 15, 2026', author: 'Dan Parker', changes: 'Initial draft with core vetting steps' },
    ],
  },
  {
    id: 'proc-008',
    title: 'Design Submittal Review',
    owner: { name: 'Kim Lee', initials: 'KL' },
    department: 'Project Management',
    status: 'Under Review',
    lastUpdated: 'Mar 14, 2026',
    version: '1.2',
    description:
      'Process for reviewing and tracking design submittals from subcontractors. Ensures materials and equipment meet project specifications before procurement.',
    steps: [
      { id: 's1', title: 'Receive Submittal Package', description: 'Log incoming submittal in tracking system. Verify completeness: product data, shop drawings, samples, certifications as required by spec section.', responsibleRole: 'Project Coordinator', estimatedTime: '30 min', tools: ['Submittal Log', 'Spec Book'], completed: false },
      { id: 's2', title: 'Initial Compliance Review', description: 'Compare submittal against specification requirements. Check product compatibility, performance ratings, and code compliance.', responsibleRole: 'Project Engineer', estimatedTime: '1-2 hrs', tools: ['Specs', 'Product Data', 'Code References'], completed: false },
      { id: 's3', title: 'Architect/Engineer Review', description: 'Forward to design team for formal review. Track review time against contractual obligations (typically 10-14 business days).', responsibleRole: 'Project Coordinator', estimatedTime: '15 min', tools: ['Email', 'Submittal Log'], completed: false },
      { id: 's4', title: 'Process Return Action', description: 'Record A/E disposition: Approved, Approved as Noted, Revise & Resubmit, or Rejected. Distribute to relevant parties.', responsibleRole: 'Project Coordinator', estimatedTime: '15 min', tools: ['Submittal Log', 'Email'], completed: false },
      { id: 's5', title: 'Handle Resubmittals', description: 'For Revise & Resubmit items, notify sub with specific comments. Track resubmittal and repeat review cycle.', responsibleRole: 'Project Coordinator', estimatedTime: '30 min', tools: ['Submittal Log', 'Email'], completed: false },
      { id: 's6', title: 'Release for Procurement', description: 'Once approved, authorize procurement/fabrication. Update lead time tracking and integrate into project schedule.', responsibleRole: 'Project Manager', estimatedTime: '15 min', tools: ['Schedule', 'Procurement Log'], completed: false },
    ],
    attachments: ['Submittal Log Template.xlsx', 'Submittal Transmittal Form.pdf'],
    comments: [
      { id: 'c1', author: 'Sarah Chen', initials: 'SC', text: 'Can we add lead time tracking integration with the schedule module?', date: 'Mar 13, 2026' },
    ],
    versionHistory: [
      { version: '1.2', date: 'Mar 14, 2026', author: 'Kim Lee', changes: 'Added resubmittal handling step' },
      { version: '1.0', date: 'Feb 10, 2026', author: 'Kim Lee', changes: 'Initial publication' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<ProcessCategory | 'All Processes'>('All Processes');
  const [activeStatus, setActiveStatus] = useState<ProcessStatus | 'All Statuses'>('All Statuses');
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newProcessForm, setNewProcessForm] = useState({
    title: '',
    description: '',
    department: 'Operations' as ProcessCategory,
    ownerName: '',
  });

  // Toast helper
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Filter logic
  const filtered = processes.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Processes' || p.department === activeCategory;
    const matchesStatus = activeStatus === 'All Statuses' || p.status === activeStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = processes.filter((p) => p.status === 'Published').length;
  const draftCount = processes.filter((p) => p.status === 'Draft').length;
  const reviewCount = processes.filter((p) => p.status === 'Under Review').length;
  const totalSteps = processes.reduce((sum, p) => sum + p.steps.length, 0);

  // Handlers
  const handleToggleExpand = (id: string) => {
    setExpandedProcessId((prev) => (prev === id ? null : id));
    setEditingProcessId(null);
    setEditForm(null);
  };

  const handleStartEdit = (proc: Process) => {
    setEditingProcessId(proc.id);
    setEditForm({ title: proc.title, description: proc.description });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm) return;
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: editForm.title, description: editForm.description, lastUpdated: 'Just now' }
          : p
      )
    );
    setEditingProcessId(null);
    setEditForm(null);
    addToast('Process updated successfully');
  };

  const handleCancelEdit = () => {
    setEditingProcessId(null);
    setEditForm(null);
  };

  const handleDuplicate = (proc: Process) => {
    const newId = `proc-${Date.now()}`;
    const duplicate: Process = {
      ...proc,
      id: newId,
      title: `${proc.title} (Copy)`,
      status: 'Draft',
      version: '0.1',
      lastUpdated: 'Just now',
      steps: proc.steps.map((s) => ({ ...s, completed: false })),
      comments: [],
      versionHistory: [
        { version: '0.1', date: 'Just now', author: proc.owner.name, changes: `Duplicated from "${proc.title}"` },
      ],
    };
    setProcesses((prev) => [duplicate, ...prev]);
    addToast(`"${proc.title}" duplicated as draft`);
  };

  const handleArchive = (id: string) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'Archived' as ProcessStatus, lastUpdated: 'Just now' } : p
      )
    );
    setShowArchiveConfirm(null);
    addToast('Process archived', 'warning');
  };

  const handleToggleStep = (processId: string, stepId: string) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === processId
          ? {
              ...p,
              steps: p.steps.map((s) =>
                s.id === stepId ? { ...s, completed: !s.completed } : s
              ),
            }
          : p
      )
    );
  };

  const handleCreateProcess = () => {
    if (!newProcessForm.title.trim()) {
      addToast('Process title is required', 'warning');
      return;
    }
    const initials = newProcessForm.ownerName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'NA';

    const newProcess: Process = {
      id: `proc-${Date.now()}`,
      title: newProcessForm.title,
      owner: { name: newProcessForm.ownerName || 'Unassigned', initials },
      department: newProcessForm.department,
      status: 'Draft',
      lastUpdated: 'Just now',
      version: '0.1',
      description: newProcessForm.description || 'No description yet.',
      steps: [],
      attachments: [],
      comments: [],
      versionHistory: [
        { version: '0.1', date: 'Just now', author: newProcessForm.ownerName || 'System', changes: 'Process created' },
      ],
    };
    setProcesses((prev) => [newProcess, ...prev]);
    setShowCreateModal(false);
    setNewProcessForm({ title: '', description: '', department: 'Operations', ownerName: '' });
    addToast('New process created as draft');
  };

  // Render expanded detail
  const renderProcessDetail = (proc: Process) => {
    const isEditing = editingProcessId === proc.id;
    const completedSteps = proc.steps.filter((s) => s.completed).length;

    return (
      <div className="mt-4 space-y-6 border-t border-border pt-6">
        {/* Description */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h4>
          {isEditing ? (
            <textarea
              value={editForm?.description || ''}
              onChange={(e) => setEditForm((prev) => prev ? { ...prev, description: e.target.value } : prev)}
              className="w-full rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none"
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">{proc.description}</p>
          )}
        </div>

        {/* Steps */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Steps ({completedSteps}/{proc.steps.length} completed)
            </h4>
            {proc.steps.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-muted/30">
                  <div
                    className="h-1.5 rounded-full bg-green-400 transition-all"
                    style={{ width: `${proc.steps.length > 0 ? (completedSteps / proc.steps.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {proc.steps.length > 0 ? Math.round((completedSteps / proc.steps.length) * 100) : 0}%
                </span>
              </div>
            )}
          </div>

          {proc.steps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Workflow className="mx-auto h-6 w-6 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No steps defined yet. Edit this process to add steps.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proc.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`rounded-lg border transition-all ${
                    step.completed
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-border bg-muted/10'
                  } p-4`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleStep(proc.id, step.id)}
                      className="mt-0.5 shrink-0 transition-colors"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-foreground" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Step header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                          {idx + 1}
                        </span>
                        <h5 className={`text-sm font-semibold ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {step.title}
                        </h5>
                      </div>

                      {/* Step description */}
                      <p className="mb-3 text-xs text-muted-foreground leading-relaxed pl-7">{step.description}</p>

                      {/* Step meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-7 text-[11px] text-muted-foreground/70">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {step.responsibleRole}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {step.estimatedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {step.tools.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom sections: Attachments, Version History, Comments */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Attachments */}
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" />
              Attachments ({proc.attachments.length})
            </h4>
            {proc.attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">No attachments</p>
            ) : (
              <div className="space-y-1.5">
                {proc.attachments.map((att) => (
                  <div
                    key={att}
                    className="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="truncate">{att}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Diagram placeholder */}
            <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-border p-4">
              <div className="text-center">
                <ImageIcon className="mx-auto h-5 w-5 text-muted-foreground/30" />
                <p className="mt-1 text-[10px] text-muted-foreground/50">Diagrams/Images area</p>
              </div>
            </div>
          </div>

          {/* Version History */}
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Version History
            </h4>
            <div className="relative space-y-3 pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              {proc.versionHistory.map((v) => (
                <div key={v.version} className="relative">
                  <div className="absolute -left-4 top-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                  <div className="pl-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">v{v.version}</span>
                      <span className="text-muted-foreground/60">{v.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{v.changes}</p>
                    <p className="text-[10px] text-muted-foreground/50">by {v.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments ({proc.comments.length})
            </h4>
            {proc.comments.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {proc.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-muted/20 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
                        {comment.initials}
                      </div>
                      <span className="text-xs font-medium text-foreground">{comment.author}</span>
                      <span className="text-[10px] text-muted-foreground/50">{comment.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-in slide-in-from-right fade-in rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition-all ${
              toast.type === 'success'
                ? 'border-green-500/30 bg-green-500/15 text-green-600 dark:text-green-400'
                : toast.type === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  : 'border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Processes & Documentation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Documented procedures, SOPs, and step-by-step workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`rounded-md p-1.5 transition-all ${
                view === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-md p-1.5 transition-all ${
                view === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            New Process
          </Button>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search processes, owners, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass h-11 border-border bg-muted/30 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value as ProcessStatus | 'All Statuses')}
            className="h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground focus:border-indigo-500/50 focus:outline-none"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{processes.length}</span>
            <span className="text-xs text-muted-foreground">Total Processes</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{publishedCount}</span>
            <span className="text-xs text-muted-foreground">Published</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{draftCount}</span>
            <span className="text-xs text-muted-foreground">Drafts</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{reviewCount}</span>
            <span className="text-xs text-muted-foreground">Under Review</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-foreground">{totalSteps}</span>
            <span className="text-xs text-muted-foreground">Total Steps</span>
          </div>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Categories sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="glass rounded-xl p-2">
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === 'All Processes'
                  ? processes.length
                  : processes.filter((p) => p.department === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    isActive
                      ? 'bg-primary/10 text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`ml-2 text-xs ${
                      isActive ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Process cards */}
        <div className="flex-1">
          {view === 'grid' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((proc) => {
                const catConfig = categoryConfig[proc.department];
                const CatIcon = catConfig.icon;
                const isExpanded = expandedProcessId === proc.id;
                const completedSteps = proc.steps.filter((s) => s.completed).length;

                return (
                  <div
                    key={proc.id}
                    className={`glass rounded-xl p-5 transition-all duration-300 ${
                      isExpanded ? 'sm:col-span-2' : 'glass-hover cursor-pointer'
                    }`}
                  >
                    {/* Top row: badges */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${catConfig.color}`}>
                          {proc.department}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${statusConfig[proc.status].color}`}>
                          {proc.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {proc.status !== 'Archived' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(proc); setExpandedProcessId(proc.id); }}
                              className="rounded p-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicate(proc); }}
                              className="rounded p-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowArchiveConfirm(proc.id); }}
                              className="rounded p-1 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Archive"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div
                      className="cursor-pointer"
                      onClick={() => handleToggleExpand(proc.id)}
                    >
                      {editingProcessId === proc.id && editForm ? (
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                          onClick={(e) => e.stopPropagation()}
                          className="mb-2 w-full rounded border border-border bg-muted/30 px-2 py-1 text-sm font-semibold text-foreground focus:border-indigo-500/50 focus:outline-none"
                        />
                      ) : (
                        <h3 className="mb-2 text-sm font-semibold text-foreground line-clamp-2">
                          {proc.title}
                        </h3>
                      )}
                    </div>

                    {/* Description preview */}
                    {!isExpanded && (
                      <p
                        className="mb-4 text-xs text-muted-foreground line-clamp-2 cursor-pointer"
                        onClick={() => handleToggleExpand(proc.id)}
                      >
                        {proc.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary">
                          {proc.owner.initials}
                        </div>
                        {proc.owner.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {proc.lastUpdated}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        v{proc.version}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {proc.steps.length} steps
                      </span>
                    </div>

                    {/* Step progress mini-bar */}
                    {proc.steps.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Completion</span>
                          <span className="text-[10px] text-muted-foreground">
                            {completedSteps}/{proc.steps.length}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted/30">
                          <div
                            className={`h-1 rounded-full transition-all ${
                              completedSteps === proc.steps.length && proc.steps.length > 0
                                ? 'bg-green-400'
                                : 'bg-primary'
                            }`}
                            style={{ width: `${proc.steps.length > 0 ? (completedSteps / proc.steps.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Edit action buttons */}
                    {editingProcessId === proc.id && (
                      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                        <Button
                          size="sm"
                          className="h-7 gap-1 rounded-md bg-green-600 px-3 text-xs font-medium text-primary-foreground hover:bg-green-700"
                          onClick={() => handleSaveEdit(proc.id)}
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 rounded-md px-3 text-xs"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Expand indicator */}
                    <button
                      onClick={() => handleToggleExpand(proc.id)}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1 text-xs text-muted-foreground/50 hover:bg-muted/20 hover:text-foreground transition-all"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          View Details
                        </>
                      )}
                    </button>

                    {/* Expanded detail panel */}
                    {isExpanded && renderProcessDetail(proc)}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'list' && (
            <div className="space-y-2">
              {filtered.map((proc) => {
                const catConfig = categoryConfig[proc.department];
                const isExpanded = expandedProcessId === proc.id;
                const completedSteps = proc.steps.filter((s) => s.completed).length;

                return (
                  <div key={proc.id} className="glass rounded-xl transition-all duration-300">
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer glass-hover"
                      onClick={() => handleToggleExpand(proc.id)}
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Workflow className="h-5 w-5 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {proc.title}
                          </h3>
                          <Badge variant="outline" className={`text-[10px] shrink-0 ${statusConfig[proc.status].color}`}>
                            {proc.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                          <Badge variant="outline" className={`text-[9px] ${catConfig.color}`}>
                            {proc.department}
                          </Badge>
                          <span>{proc.owner.name}</span>
                          <span>v{proc.version}</span>
                          <span>{proc.steps.length} steps</span>
                          <span>{proc.lastUpdated}</span>
                        </div>
                      </div>

                      {/* Step completion */}
                      {proc.steps.length > 0 && (
                        <div className="shrink-0 text-right">
                          <span
                            className={`text-xs font-medium ${
                              completedSteps === proc.steps.length && proc.steps.length > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {completedSteps}/{proc.steps.length}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {proc.status !== 'Archived' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(proc); setExpandedProcessId(proc.id); }}
                              className="rounded p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDuplicate(proc); }}
                              className="rounded p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowArchiveConfirm(proc.id); }}
                              className="rounded p-1.5 text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Archive"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/40 rotate-180" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        {editingProcessId === proc.id && editForm && (
                          <div className="mb-4 flex items-center gap-2">
                            <input
                              value={editForm.title}
                              onChange={(e) => setEditForm((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                              className="flex-1 rounded border border-border bg-muted/30 px-2 py-1 text-sm font-semibold text-foreground focus:border-indigo-500/50 focus:outline-none"
                            />
                            <Button
                              size="sm"
                              className="h-7 gap-1 rounded-md bg-green-600 px-3 text-xs font-medium text-primary-foreground hover:bg-green-700"
                              onClick={() => handleSaveEdit(proc.id)}
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 rounded-md px-3 text-xs"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        )}
                        {renderProcessDetail(proc)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="glass rounded-xl px-5 py-12 text-center">
              <Workflow className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No processes match your filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Process Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">New Process</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Process Title *</label>
                <Input
                  placeholder="e.g., Material Procurement Process"
                  value={newProcessForm.title}
                  onChange={(e) => setNewProcessForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-9 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  placeholder="Describe this process..."
                  value={newProcessForm.description}
                  onChange={(e) => setNewProcessForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-muted/30 p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Department</label>
                <select
                  value={newProcessForm.department}
                  onChange={(e) => setNewProcessForm((prev) => ({ ...prev, department: e.target.value as ProcessCategory }))}
                  className="h-9 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground focus:border-indigo-500/50 focus:outline-none"
                >
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Project Management">Project Management</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Process Owner</label>
                <Input
                  placeholder="e.g., John Smith"
                  value={newProcessForm.ownerName}
                  onChange={(e) => setNewProcessForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                  className="h-9 border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"
                onClick={handleCreateProcess}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Process
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowArchiveConfirm(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Archive Process</h2>
                <p className="text-xs text-muted-foreground">This will move the process to archived status.</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Are you sure you want to archive &ldquo;{processes.find((p) => p.id === showArchiveConfirm)?.title}&rdquo;? The process will be hidden from active views but can be restored later.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setShowArchiveConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-semibold text-primary-foreground hover:bg-red-700"
                onClick={() => handleArchive(showArchiveConfirm)}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
