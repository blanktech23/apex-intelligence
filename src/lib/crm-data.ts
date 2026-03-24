// =============================================================
// CRM Data Layer — Kiptra AI
// Shared interfaces, mock data, and helpers for all CRM pages
// =============================================================

import {
  Users, Building2, Store, Briefcase, Factory, Wrench,
  Mail, Phone, MapPin, Presentation, Palette, FileText,
  ClipboardCheck, Calendar, StickyNote,
  Sparkles, Clock, CalendarCheck, PenLine, Compass,
  Ruler, FileSignature, Send, Handshake, HardHat, Construction, ShieldCheck,
} from "lucide-react";

// =============================================================
// TYPE DEFINITIONS
// =============================================================

export type ContactType =
  | "homeowner"
  | "contractor_gc"
  | "dealer_showroom"
  | "manufacturer_rep"
  | "manufacturer"
  | "subcontractor";

export type PipelineStage =
  | "new_lead"
  | "qualifying"
  | "consultation_scheduled"
  | "consultation_complete"
  | "design_retainer"
  | "in_design"
  | "estimating"
  | "proposal_sent"
  | "contract_signed"
  | "pre_construction"
  | "in_construction"
  | "warranty";

export type ActivityType =
  | "email"
  | "call"
  | "site_visit"
  | "design_presentation"
  | "material_selection"
  | "change_order"
  | "inspection"
  | "meeting"
  | "note";

export type DealStatus = "open" | "won" | "lost" | "on_hold";

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  initials: string;
  type: ContactType;
  status: "active" | "lead" | "inactive";
  tags: string[];
  referralSource: string;
  referredBy: string | null;
  totalRevenue: number;
  yoyGrowth: number;
  since: string;
  lastContactDate: string;
  speedToLead: number | null; // minutes
  assignedRep: string;
  jobTitle: string;
  notes: string;
}

export interface Deal {
  id: string;
  name: string;
  contactId: string;
  stage: PipelineStage;
  dealStatus: DealStatus;
  value: number;
  grossProfit: number; // percentage
  probability: number; // 0-100
  expectedCloseDate: string;
  createdDate: string;
  lastActivityDate: string;
  projectId: string | null;
  assignedTo: string;
  description: string;
  invoiceStatus: "none" | "draft" | "sent" | "partial" | "paid" | "overdue";
  arAging: number;
  contractAmount: number;
  billedToDate: number;
}

export interface Activity {
  id: string;
  contactId: string;
  dealId: string | null;
  type: ActivityType;
  direction: "inbound" | "outbound" | null;
  subject: string;
  description: string;
  date: string;
  agent: "ai" | "manual";
  agentName: string;
  duration: number | null; // minutes
}

// =============================================================
// PIPELINE STAGE CONFIG
// =============================================================

export const PIPELINE_STAGES: {
  key: PipelineStage;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof Sparkles;
}[] = [
  { key: "new_lead", label: "New Lead", shortLabel: "Lead", color: "text-sky-400", bgColor: "bg-sky-500/20", borderColor: "border-sky-500/30", icon: Sparkles },
  { key: "qualifying", label: "Qualifying", shortLabel: "Qual", color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/30", icon: Clock },
  { key: "consultation_scheduled", label: "Consultation Scheduled", shortLabel: "Sched", color: "text-indigo-400", bgColor: "bg-indigo-500/20", borderColor: "border-indigo-500/30", icon: CalendarCheck },
  { key: "consultation_complete", label: "Consultation Complete", shortLabel: "Consult", color: "text-violet-400", bgColor: "bg-violet-500/20", borderColor: "border-violet-500/30", icon: PenLine },
  { key: "design_retainer", label: "Design Retainer", shortLabel: "Retainer", color: "text-purple-400", bgColor: "bg-purple-500/20", borderColor: "border-purple-500/30", icon: Compass },
  { key: "in_design", label: "In Design", shortLabel: "Design", color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/20", borderColor: "border-fuchsia-500/30", icon: Ruler },
  { key: "estimating", label: "Estimating", shortLabel: "Est", color: "text-pink-400", bgColor: "bg-pink-500/20", borderColor: "border-pink-500/30", icon: FileSignature },
  { key: "proposal_sent", label: "Proposal Sent", shortLabel: "Proposal", color: "text-rose-400", bgColor: "bg-rose-500/20", borderColor: "border-rose-500/30", icon: Send },
  { key: "contract_signed", label: "Contract Signed", shortLabel: "Contract", color: "text-amber-400", bgColor: "bg-amber-500/20", borderColor: "border-amber-500/30", icon: Handshake },
  { key: "pre_construction", label: "Pre-Construction", shortLabel: "Pre-Con", color: "text-orange-400", bgColor: "bg-orange-500/20", borderColor: "border-orange-500/30", icon: HardHat },
  { key: "in_construction", label: "In Construction", shortLabel: "Build", color: "text-emerald-400", bgColor: "bg-emerald-500/20", borderColor: "border-emerald-500/30", icon: Construction },
  { key: "warranty", label: "Warranty", shortLabel: "Warranty", color: "text-teal-400", bgColor: "bg-teal-500/20", borderColor: "border-teal-500/30", icon: ShieldCheck },
];

// =============================================================
// CONTACT TYPE CONFIG
// =============================================================

export const CONTACT_TYPES: {
  key: ContactType;
  label: string;
  icon: typeof Users;
  color: string;
  bgColor: string;
}[] = [
  { key: "homeowner", label: "Homeowner", icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/20" },
  { key: "contractor_gc", label: "Contractor / GC", icon: Building2, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  { key: "dealer_showroom", label: "Dealer / Showroom", icon: Store, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
  { key: "manufacturer_rep", label: "Manufacturer Rep", icon: Briefcase, color: "text-purple-400", bgColor: "bg-purple-500/20" },
  { key: "manufacturer", label: "Manufacturer", icon: Factory, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },
  { key: "subcontractor", label: "Subcontractor", icon: Wrench, color: "text-rose-400", bgColor: "bg-rose-500/20" },
];

// =============================================================
// ACTIVITY TYPE CONFIG
// =============================================================

export const ACTIVITY_TYPES: {
  key: ActivityType;
  label: string;
  icon: typeof Mail;
  color: string;
}[] = [
  { key: "email", label: "Email", icon: Mail, color: "text-blue-400" },
  { key: "call", label: "Phone Call", icon: Phone, color: "text-emerald-400" },
  { key: "site_visit", label: "Site Visit", icon: MapPin, color: "text-amber-400" },
  { key: "design_presentation", label: "Design Presentation", icon: Presentation, color: "text-purple-400" },
  { key: "material_selection", label: "Material Selection", icon: Palette, color: "text-fuchsia-400" },
  { key: "change_order", label: "Change Order", icon: FileText, color: "text-rose-400" },
  { key: "inspection", label: "Inspection", icon: ClipboardCheck, color: "text-orange-400" },
  { key: "meeting", label: "Meeting", icon: Calendar, color: "text-indigo-400" },
  { key: "note", label: "Note", icon: StickyNote, color: "text-zinc-400" },
];

// =============================================================
// MOCK DATA — CONTACTS
// =============================================================

export const contacts: Contact[] = [
  {
    id: "con-001", name: "Marcus Rivera", company: "Rivera General Contracting", email: "marcus@riveragc.com", phone: "(512) 555-0147",
    address: "1842 S Congress Ave", city: "Austin", state: "TX", zip: "78704", website: "www.riveragc.com",
    initials: "MR", type: "contractor_gc", status: "active", tags: ["K&B", "High Volume", "Remodel", "VIP"],
    referralSource: "Referral", referredBy: "con-004", totalRevenue: 128500, yoyGrowth: 22.3, since: "2024-08-15",
    lastContactDate: "2026-03-22", speedToLead: 3, assignedRep: "Jordan Mitchell", jobTitle: "Owner", notes: "Top-performing GC in Austin metro. Prefers Ridgewood Shaker line.",
  },
  {
    id: "con-002", name: "Sarah Chen", company: "Summit Builders LLC", email: "sarah@summitbuilders.com", phone: "(512) 555-0293",
    address: "2200 E Riverside Dr", city: "Austin", state: "TX", zip: "78741", website: "www.summitbuilders.com",
    initials: "SC", type: "contractor_gc", status: "active", tags: ["K&B", "New Construction", "Residential"],
    referralSource: "Trade Show", referredBy: null, totalRevenue: 95200, yoyGrowth: 15.1, since: "2024-11-02",
    lastContactDate: "2026-03-21", speedToLead: 7, assignedRep: "Priya Sharma", jobTitle: "Project Manager", notes: "Focuses on new construction. 3 active projects.",
  },
  {
    id: "con-003", name: "James Thornton", company: "Thornton Design-Build", email: "james@thorntondb.com", phone: "(737) 555-0182",
    address: "504 W 24th St", city: "Austin", state: "TX", zip: "78705", website: "www.thorntondb.com",
    initials: "JT", type: "contractor_gc", status: "lead", tags: ["Design-Build", "High-End"],
    referralSource: "Website", referredBy: null, totalRevenue: 0, yoyGrowth: 0, since: "2026-03-10",
    lastContactDate: "2026-03-18", speedToLead: 12, assignedRep: "Jordan Mitchell", jobTitle: "Principal", notes: "Design-build firm. Interested in custom cabinetry for luxury remodels.",
  },
  {
    id: "con-004", name: "Olivia Martinez", company: "Lone Star Renovations", email: "olivia@lonestarreno.com", phone: "(512) 555-0361",
    address: "7601 N Lamar Blvd", city: "Austin", state: "TX", zip: "78752", website: "www.lonestarrenovations.com",
    initials: "OM", type: "contractor_gc", status: "active", tags: ["K&B", "Remodel", "Austin Metro"],
    referralSource: "Referral", referredBy: null, totalRevenue: 67800, yoyGrowth: 8.5, since: "2025-02-20",
    lastContactDate: "2026-03-19", speedToLead: 5, assignedRep: "Alex Thompson", jobTitle: "Owner", notes: "Referred Marcus Rivera. Strong kitchen remodel focus.",
  },
  {
    id: "con-005", name: "David Park", company: "Parkway Home Design", email: "david@parkwayhomedesign.com", phone: "(737) 555-0429",
    address: "4821 Lamar Blvd, Suite 200", city: "Austin", state: "TX", zip: "78751", website: "www.parkwayhomedesign.com",
    initials: "DP", type: "contractor_gc", status: "active", tags: ["K&B", "Commercial", "Residential", "VIP"],
    referralSource: "Partner", referredBy: null, totalRevenue: 214300, yoyGrowth: 18.4, since: "2024-06-15",
    lastContactDate: "2026-03-22", speedToLead: 2, assignedRep: "Casey Rodriguez", jobTitle: "Design Director", notes: "Largest account. Handles both commercial and residential K&B.",
  },
  {
    id: "con-006", name: "Angela Foster", company: "BlueLine Kitchen Studio", email: "angela@bluelinekitchen.com", phone: "(512) 555-0518",
    address: "3100 S Lamar Blvd", city: "Austin", state: "TX", zip: "78704", website: "www.bluelinekitchenstudio.com",
    initials: "AF", type: "dealer_showroom", status: "inactive", tags: ["Showroom", "K&B"],
    referralSource: "Cold Outreach", referredBy: null, totalRevenue: 32400, yoyGrowth: -5.2, since: "2025-01-10",
    lastContactDate: "2026-02-19", speedToLead: null, assignedRep: "Priya Sharma", jobTitle: "Showroom Manager", notes: "Went inactive after switching to Cyncly catalog. Re-engage Q2.",
  },
  {
    id: "con-007", name: "Robert & Linda Nguyen", company: "", email: "rnguyen@gmail.com", phone: "(512) 555-0644",
    address: "1205 Barton Creek Blvd", city: "Austin", state: "TX", zip: "78735", website: "",
    initials: "RN", type: "homeowner", status: "active", tags: ["High-End", "Kitchen", "Boomer"],
    referralSource: "Referral", referredBy: "con-001", totalRevenue: 78500, yoyGrowth: 0, since: "2026-01-15",
    lastContactDate: "2026-03-20", speedToLead: 4, assignedRep: "Jordan Mitchell", jobTitle: "", notes: "Referred by Marcus Rivera. Full kitchen remodel, $75-85K budget. Barton Creek estate.",
  },
  {
    id: "con-008", name: "Jessica Torres", company: "Austin Kitchen & Bath", email: "jessica@austinkb.com", phone: "(512) 555-0771",
    address: "8400 Burnet Rd", city: "Austin", state: "TX", zip: "78757", website: "www.austinkitchenandbath.com",
    initials: "JT", type: "dealer_showroom", status: "active", tags: ["Showroom", "K&B", "High Volume"],
    referralSource: "Trade Show", referredBy: null, totalRevenue: 156200, yoyGrowth: 25.8, since: "2024-04-01",
    lastContactDate: "2026-03-22", speedToLead: 1, assignedRep: "Jordan Mitchell", jobTitle: "Owner", notes: "Top dealer account. 3 showroom locations. Carries Ridgewood + Heritage lines.",
  },
  {
    id: "con-009", name: "Carlos Medina", company: "Medina Tile & Stone", email: "carlos@medinatile.com", phone: "(512) 555-0889",
    address: "2901 S 1st St", city: "Austin", state: "TX", zip: "78704", website: "www.medinatile.com",
    initials: "CM", type: "subcontractor", status: "active", tags: ["Tile", "Countertop Install", "Reliable"],
    referralSource: "Referral", referredBy: "con-001", totalRevenue: 24600, yoyGrowth: 12.0, since: "2025-06-01",
    lastContactDate: "2026-03-18", speedToLead: null, assignedRep: "Alex Thompson", jobTitle: "Owner", notes: "Go-to tile/stone sub. On-time 94%. Quality rating 4.8/5.",
  },
  {
    id: "con-010", name: "Brian & Amy Walker", company: "", email: "walkers@outlook.com", phone: "(737) 555-0234",
    address: "3405 Greystone Dr", city: "Austin", state: "TX", zip: "78731", website: "",
    initials: "BW", type: "homeowner", status: "lead", tags: ["Kitchen", "Millennial", "First Remodel"],
    referralSource: "Website", referredBy: null, totalRevenue: 0, yoyGrowth: 0, since: "2026-03-18",
    lastContactDate: "2026-03-18", speedToLead: 45, assignedRep: "Priya Sharma", jobTitle: "", notes: "Filled out website calculator. $40-50K kitchen budget. First-time remodelers.",
  },
  {
    id: "con-011", name: "Mike Hernandez", company: "Ridgewood Cabinetry", email: "mhernandez@ridgewoodcab.com", phone: "(336) 555-0102",
    address: "1200 Factory Row", city: "High Point", state: "NC", zip: "27260", website: "www.ridgewoodcabinetry.com",
    initials: "MH", type: "manufacturer", status: "active", tags: ["Cabinets", "Semi-Custom", "Preferred"],
    referralSource: "Partner", referredBy: null, totalRevenue: 0, yoyGrowth: 0, since: "2024-01-01",
    lastContactDate: "2026-03-15", speedToLead: null, assignedRep: "Casey Rodriguez", jobTitle: "Regional Sales Director", notes: "Primary cabinet manufacturer. 4-6 week lead time. Shaker + transitional lines.",
  },
  {
    id: "con-012", name: "Diana Reyes", company: "Heritage Woodworks", email: "diana@heritagewood.com", phone: "(540) 555-0478",
    address: "890 Mill Creek Rd", city: "Roanoke", state: "VA", zip: "24012", website: "www.heritagewoodworks.com",
    initials: "DR", type: "manufacturer_rep", status: "active", tags: ["Cabinets", "Custom", "Territory Rep"],
    referralSource: "Partner", referredBy: null, totalRevenue: 0, yoyGrowth: 0, since: "2024-06-01",
    lastContactDate: "2026-03-19", speedToLead: null, assignedRep: "", jobTitle: "Central TX Territory Rep", notes: "Heritage Woodworks rep for Austin/San Antonio. Handles custom line orders.",
  },
  {
    id: "con-013", name: "Tom Bradley", company: "Bradley Plumbing", email: "tom@bradleyplumbing.com", phone: "(512) 555-0556",
    address: "6700 Manchaca Rd", city: "Austin", state: "TX", zip: "78745", website: "www.bradleyplumbing.com",
    initials: "TB", type: "subcontractor", status: "active", tags: ["Plumbing", "K&B", "Licensed"],
    referralSource: "Referral", referredBy: "con-004", totalRevenue: 18900, yoyGrowth: 6.3, since: "2025-03-15",
    lastContactDate: "2026-03-16", speedToLead: null, assignedRep: "Alex Thompson", jobTitle: "Master Plumber", notes: "Reliable plumbing sub. Licensed master plumber. On-time 91%.",
  },
  {
    id: "con-014", name: "Rachel Kim", company: "StoneVista Surfaces", email: "rachel@stonevista.com", phone: "(512) 555-0912",
    address: "4500 E Ben White Blvd", city: "Austin", state: "TX", zip: "78741", website: "www.stonevistasurfaces.com",
    initials: "RK", type: "manufacturer", status: "active", tags: ["Countertops", "Quartz", "Granite", "Marble"],
    referralSource: "Trade Show", referredBy: null, totalRevenue: 0, yoyGrowth: 0, since: "2024-09-01",
    lastContactDate: "2026-03-20", speedToLead: null, assignedRep: "Casey Rodriguez", jobTitle: "Sales Manager", notes: "Primary countertop supplier. Calacatta, granite, marble, butcher block. 2-3 week fabrication.",
  },
  {
    id: "con-015", name: "Patricia & Mark Davis", company: "", email: "pdavis@icloud.com", phone: "(512) 555-0345",
    address: "2108 Westlake Dr", city: "Austin", state: "TX", zip: "78746", website: "",
    initials: "PD", type: "homeowner", status: "active", tags: ["Kitchen", "Bath", "High-End", "Gen X"],
    referralSource: "Referral", referredBy: "con-007", totalRevenue: 92000, yoyGrowth: 0, since: "2025-11-01",
    lastContactDate: "2026-03-21", speedToLead: 6, assignedRep: "Jordan Mitchell", jobTitle: "", notes: "Full kitchen + master bath. Referred by the Nguyens. $85-100K total budget.",
  },
];

// =============================================================
// MOCK DATA — DEALS
// =============================================================

export const deals: Deal[] = [
  // New Lead
  { id: "deal-001", name: "Walker Kitchen Remodel", contactId: "con-010", stage: "new_lead", dealStatus: "open", value: 45000, grossProfit: 0, probability: 10, expectedCloseDate: "2026-06-15", createdDate: "2026-03-18", lastActivityDate: "2026-03-18", projectId: null, assignedTo: "Priya Sharma", description: "First-time remodel, filled out website calculator", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  { id: "deal-002", name: "Lakewood Bath Refresh", contactId: "con-003", stage: "new_lead", dealStatus: "open", value: 28000, grossProfit: 0, probability: 10, expectedCloseDate: "2026-07-01", createdDate: "2026-03-20", lastActivityDate: "2026-03-20", projectId: null, assignedTo: "Jordan Mitchell", description: "Luxury master bath, design-build prospect", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  // Qualifying
  { id: "deal-003", name: "Riverside Condo Kitchen", contactId: "con-010", stage: "qualifying", dealStatus: "open", value: 38000, grossProfit: 0, probability: 20, expectedCloseDate: "2026-06-01", createdDate: "2026-03-10", lastActivityDate: "2026-03-19", projectId: null, assignedTo: "Priya Sharma", description: "Budget confirmed $35-40K, needs scope definition", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  // Consultation Scheduled
  { id: "deal-004", name: "Thornton Master Kitchen", contactId: "con-003", stage: "consultation_scheduled", dealStatus: "open", value: 72000, grossProfit: 0, probability: 25, expectedCloseDate: "2026-07-15", createdDate: "2026-03-12", lastActivityDate: "2026-03-21", projectId: null, assignedTo: "Jordan Mitchell", description: "In-home consultation booked Mar 25. High-end custom.", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  // Consultation Complete
  { id: "deal-005", name: "Barton Creek Kitchen", contactId: "con-007", stage: "consultation_complete", dealStatus: "open", value: 82000, grossProfit: 35, probability: 40, expectedCloseDate: "2026-06-30", createdDate: "2026-01-20", lastActivityDate: "2026-03-20", projectId: null, assignedTo: "Jordan Mitchell", description: "Site measured, photos taken. Semi-custom Ridgewood Shaker. Needs retainer.", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  // Design Retainer
  { id: "deal-006", name: "Davis Kitchen & Master Bath", contactId: "con-015", stage: "design_retainer", dealStatus: "open", value: 92000, grossProfit: 33, probability: 50, expectedCloseDate: "2026-06-15", createdDate: "2025-12-01", lastActivityDate: "2026-03-21", projectId: null, assignedTo: "Jordan Mitchell", description: "$3,500 retainer collected. Design phase starting.", invoiceStatus: "sent", arAging: 0, contractAmount: 3500, billedToDate: 3500 },
  // In Design
  { id: "deal-007", name: "Summit New Build Kitchen", contactId: "con-002", stage: "in_design", dealStatus: "open", value: 54000, grossProfit: 32, probability: 60, expectedCloseDate: "2026-05-30", createdDate: "2025-11-15", lastActivityDate: "2026-03-19", projectId: null, assignedTo: "Priya Sharma", description: "3D renders in progress. Rev 2 of design. Homeowner selecting countertops.", invoiceStatus: "sent", arAging: 0, contractAmount: 2500, billedToDate: 2500 },
  { id: "deal-008", name: "Parkway Commercial K&B", contactId: "con-005", stage: "in_design", dealStatus: "open", value: 145000, grossProfit: 28, probability: 65, expectedCloseDate: "2026-05-15", createdDate: "2025-10-01", lastActivityDate: "2026-03-22", projectId: null, assignedTo: "Casey Rodriguez", description: "Multi-unit commercial kitchen + bath package. Design finalization week.", invoiceStatus: "partial", arAging: 15, contractAmount: 5000, billedToDate: 3000 },
  // Estimating
  { id: "deal-009", name: "Rivera Whole-Home K&B", contactId: "con-001", stage: "estimating", dealStatus: "open", value: 118000, grossProfit: 34, probability: 70, expectedCloseDate: "2026-05-01", createdDate: "2025-09-15", lastActivityDate: "2026-03-22", projectId: null, assignedTo: "Jordan Mitchell", description: "Kitchen + 2 baths. Detailed takeoff in progress. Sub quotes due Mar 25.", invoiceStatus: "sent", arAging: 0, contractAmount: 4000, billedToDate: 4000 },
  // Proposal Sent
  { id: "deal-010", name: "Lone Star Kitchen Reno", contactId: "con-004", stage: "proposal_sent", dealStatus: "open", value: 67000, grossProfit: 31, probability: 75, expectedCloseDate: "2026-04-20", createdDate: "2025-08-20", lastActivityDate: "2026-03-18", projectId: null, assignedTo: "Alex Thompson", description: "Proposal presented Mar 15. Decision expected within 2 weeks.", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  // Contract Signed
  { id: "deal-011", name: "Nguyen Kitchen Remodel", contactId: "con-007", stage: "contract_signed", dealStatus: "won", value: 78500, grossProfit: 33, probability: 90, expectedCloseDate: "2026-04-01", createdDate: "2025-07-01", lastActivityDate: "2026-03-20", projectId: "proj-001", assignedTo: "Jordan Mitchell", description: "Contract signed Feb 28. 33% deposit received. Permits pending.", invoiceStatus: "partial", arAging: 0, contractAmount: 78500, billedToDate: 25905 },
  // Pre-Construction
  { id: "deal-012", name: "Park Condo Kitchen", contactId: "con-005", stage: "pre_construction", dealStatus: "won", value: 52000, grossProfit: 30, probability: 95, expectedCloseDate: "2026-03-30", createdDate: "2025-06-15", lastActivityDate: "2026-03-22", projectId: "proj-002", assignedTo: "Casey Rodriguez", description: "Cabinets ordered (6-wk lead). Permits approved. Demo scheduled Apr 1.", invoiceStatus: "partial", arAging: 0, contractAmount: 52000, billedToDate: 17160 },
  // In Construction
  { id: "deal-013", name: "Rivera Master Bath", contactId: "con-001", stage: "in_construction", dealStatus: "won", value: 42000, grossProfit: 35, probability: 98, expectedCloseDate: "2026-04-10", createdDate: "2025-04-01", lastActivityDate: "2026-03-22", projectId: "proj-003", assignedTo: "Jordan Mitchell", description: "Week 3 of construction. Tile install this week. On schedule.", invoiceStatus: "partial", arAging: 12, contractAmount: 42000, billedToDate: 29400 },
  { id: "deal-014", name: "Summit Guest Bath", contactId: "con-002", stage: "in_construction", dealStatus: "won", value: 28000, grossProfit: 32, probability: 98, expectedCloseDate: "2026-04-05", createdDate: "2025-05-01", lastActivityDate: "2026-03-21", projectId: "proj-004", assignedTo: "Priya Sharma", description: "Punch list phase. Final inspection scheduled Mar 28.", invoiceStatus: "partial", arAging: 0, contractAmount: 28000, billedToDate: 22400 },
  // Warranty
  { id: "deal-015", name: "Martinez Kitchen", contactId: "con-004", stage: "warranty", dealStatus: "won", value: 58000, grossProfit: 29, probability: 100, expectedCloseDate: "2026-03-01", createdDate: "2025-01-15", lastActivityDate: "2026-03-14", projectId: "proj-005", assignedTo: "Alex Thompson", description: "Completed Feb 28. 30-day follow-up done. Review request sent.", invoiceStatus: "paid", arAging: 0, contractAmount: 58000, billedToDate: 58000 },
  { id: "deal-016", name: "Park Office Kitchenette", contactId: "con-005", stage: "warranty", dealStatus: "won", value: 34000, grossProfit: 27, probability: 100, expectedCloseDate: "2026-02-15", createdDate: "2024-11-01", lastActivityDate: "2026-03-10", projectId: "proj-006", assignedTo: "Casey Rodriguez", description: "Completed Jan 30. Minor warranty claim: drawer slide replacement.", invoiceStatus: "paid", arAging: 0, contractAmount: 34000, billedToDate: 34000 },
  // Lost
  { id: "deal-017", name: "Elm Street Kitchen", contactId: "con-003", stage: "proposal_sent", dealStatus: "lost", value: 55000, grossProfit: 30, probability: 0, expectedCloseDate: "2026-02-01", createdDate: "2025-10-01", lastActivityDate: "2026-02-10", projectId: null, assignedTo: "Jordan Mitchell", description: "Lost to competitor. Price was 15% higher. Follow up in 6 months.", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
  // On Hold
  { id: "deal-018", name: "Chen Master Suite", contactId: "con-002", stage: "in_design", dealStatus: "on_hold", value: 65000, grossProfit: 31, probability: 30, expectedCloseDate: "2026-08-01", createdDate: "2025-12-15", lastActivityDate: "2026-03-05", projectId: null, assignedTo: "Priya Sharma", description: "On hold — homeowner dealing with insurance claim. Resume Q3.", invoiceStatus: "none", arAging: 0, contractAmount: 0, billedToDate: 0 },
];

// =============================================================
// MOCK DATA — ACTIVITIES
// =============================================================

export const activities: Activity[] = [
  { id: "act-001", contactId: "con-001", dealId: "deal-009", type: "meeting", direction: null, subject: "Estimate review meeting", description: "Reviewed detailed takeoff for kitchen + 2 baths. Client approved scope, waiting on sub quotes.", date: "2026-03-22T14:00:00", agent: "manual", agentName: "Jordan Mitchell", duration: 60 },
  { id: "act-002", contactId: "con-005", dealId: "deal-008", type: "design_presentation", direction: null, subject: "Design Rev 3 presentation", description: "Presented final 3D renders for commercial K&B package. Client approved layout with minor backsplash change.", date: "2026-03-22T10:00:00", agent: "manual", agentName: "Casey Rodriguez", duration: 90 },
  { id: "act-003", contactId: "con-001", dealId: "deal-013", type: "site_visit", direction: null, subject: "Construction check — tile install", description: "Verified tile layout for master bath. Medina Tile on schedule. Photos uploaded to project.", date: "2026-03-22T09:00:00", agent: "manual", agentName: "Jordan Mitchell", duration: 30 },
  { id: "act-004", contactId: "con-007", dealId: "deal-005", type: "call", direction: "outbound", subject: "Follow-up on design retainer", description: "Called to discuss retainer terms. Homeowner wants to proceed, sending agreement today.", date: "2026-03-21T15:30:00", agent: "manual", agentName: "Jordan Mitchell", duration: 15 },
  { id: "act-005", contactId: "con-015", dealId: "deal-006", type: "material_selection", direction: null, subject: "Countertop selection session", description: "Patricia selected Calacatta quartz for kitchen island and Absolute Black granite for bath vanity.", date: "2026-03-21T11:00:00", agent: "manual", agentName: "Jordan Mitchell", duration: 45 },
  { id: "act-006", contactId: "con-010", dealId: "deal-001", type: "email", direction: "outbound", subject: "Welcome email + consultation info", description: "Sent automated welcome email with consultation booking link and pre-visit questionnaire.", date: "2026-03-18T09:15:00", agent: "ai", agentName: "Discovery Concierge", duration: null },
  { id: "act-007", contactId: "con-002", dealId: "deal-007", type: "email", direction: "inbound", subject: "Re: Countertop options for new build", description: "Sarah confirmed quartz selection. Requesting pricing for upgraded edge profile.", date: "2026-03-19T16:45:00", agent: "manual", agentName: "Priya Sharma", duration: null },
  { id: "act-008", contactId: "con-004", dealId: "deal-010", type: "call", direction: "outbound", subject: "Proposal follow-up", description: "Touched base on proposal sent Mar 15. Olivia reviewing with husband. Decision by Mar 25.", date: "2026-03-18T14:00:00", agent: "manual", agentName: "Alex Thompson", duration: 10 },
  { id: "act-009", contactId: "con-012", dealId: null, type: "meeting", direction: null, subject: "Q2 line review with Heritage rep", description: "Diana presented new custom door styles launching Q2. Updated catalog pricing.", date: "2026-03-19T13:00:00", agent: "manual", agentName: "Casey Rodriguez", duration: 45 },
  { id: "act-010", contactId: "con-008", dealId: null, type: "site_visit", direction: null, subject: "Showroom display update", description: "Inspected new Ridgewood Shaker display at Austin K&B. Photos taken for marketing.", date: "2026-03-18T10:00:00", agent: "manual", agentName: "Jordan Mitchell", duration: 30 },
  { id: "act-011", contactId: "con-005", dealId: "deal-012", type: "inspection", direction: null, subject: "Rough plumbing inspection — passed", description: "City inspector approved rough plumbing for Park Condo Kitchen. Ready for drywall.", date: "2026-03-22T08:00:00", agent: "manual", agentName: "Casey Rodriguez", duration: 20 },
  { id: "act-012", contactId: "con-002", dealId: "deal-014", type: "change_order", direction: null, subject: "CO #2 — upgraded fixtures", description: "Homeowner requested upgraded faucet + showerhead. CO approved: +$1,200.", date: "2026-03-21T09:00:00", agent: "manual", agentName: "Priya Sharma", duration: null },
  { id: "act-013", contactId: "con-001", dealId: "deal-009", type: "email", direction: "outbound", subject: "Sub quote compilation", description: "Sent RFQ to 3 plumbing subs and 2 electrical subs for Rivera whole-home project.", date: "2026-03-20T11:00:00", agent: "ai", agentName: "Estimating Agent", duration: null },
  { id: "act-014", contactId: "con-009", dealId: null, type: "call", direction: "outbound", subject: "Schedule tile install — Rivera bath", description: "Confirmed Carlos for tile install starting Mar 25. 3-day job.", date: "2026-03-20T14:30:00", agent: "manual", agentName: "Jordan Mitchell", duration: 8 },
  { id: "act-015", contactId: "con-003", dealId: "deal-004", type: "email", direction: "outbound", subject: "Pre-consultation questionnaire", description: "Sent pre-visit questionnaire and project scope worksheet for Mar 25 consultation.", date: "2026-03-21T10:00:00", agent: "ai", agentName: "Discovery Concierge", duration: null },
  { id: "act-016", contactId: "con-004", dealId: "deal-015", type: "email", direction: "outbound", subject: "Review request — Martinez Kitchen", description: "Automated 30-day follow-up with Google/Houzz review links and referral program info.", date: "2026-03-14T09:00:00", agent: "ai", agentName: "Support Agent", duration: null },
  { id: "act-017", contactId: "con-011", dealId: null, type: "email", direction: "inbound", subject: "Updated price list — Q2 2026", description: "Ridgewood sent updated dealer price list effective April 1. Average 3% increase.", date: "2026-03-15T08:00:00", agent: "manual", agentName: "Casey Rodriguez", duration: null },
  { id: "act-018", contactId: "con-007", dealId: "deal-011", type: "note", direction: null, subject: "Permit status update", description: "City permit still pending. Expected approval by Mar 28. No impact on cabinet delivery timeline.", date: "2026-03-20T16:00:00", agent: "manual", agentName: "Jordan Mitchell", duration: null },
  { id: "act-019", contactId: "con-014", dealId: null, type: "meeting", direction: null, subject: "Fabrication capacity planning", description: "Rachel confirmed 2-week fabrication slots available for April. Reserved 3 slots.", date: "2026-03-17T14:00:00", agent: "manual", agentName: "Casey Rodriguez", duration: 30 },
  { id: "act-020", contactId: "con-013", dealId: null, type: "note", direction: null, subject: "Insurance renewal verified", description: "Tom's insurance renewal confirmed through Dec 2026. License current.", date: "2026-03-16T11:00:00", agent: "manual", agentName: "Alex Thompson", duration: null },
  { id: "act-021", contactId: "con-005", dealId: "deal-016", type: "note", direction: null, subject: "Warranty claim — drawer slide", description: "Reported sticky drawer slide in office kitchenette. Ridgewood shipping replacement. Install scheduled Mar 28.", date: "2026-03-10T09:00:00", agent: "manual", agentName: "Casey Rodriguez", duration: null },
  { id: "act-022", contactId: "con-008", dealId: null, type: "call", direction: "inbound", subject: "Restock request — Shaker 36\" base", description: "Jessica needs 4 additional Shaker 36\" base cabs for a rush job. Checking Ridgewood inventory.", date: "2026-03-19T11:30:00", agent: "manual", agentName: "Jordan Mitchell", duration: 12 },
  { id: "act-023", contactId: "con-001", dealId: "deal-013", type: "site_visit", direction: null, subject: "Weekly construction walkthrough", description: "Week 3 check. Cabinets installed, countertop template done. On budget.", date: "2026-03-18T08:30:00", agent: "manual", agentName: "Jordan Mitchell", duration: 25 },
  { id: "act-024", contactId: "con-010", dealId: "deal-003", type: "call", direction: "outbound", subject: "Budget qualification call", description: "Confirmed $35-40K budget for condo kitchen. Couple wants modern flat-panel style.", date: "2026-03-19T13:00:00", agent: "manual", agentName: "Priya Sharma", duration: 20 },
  { id: "act-025", contactId: "con-006", dealId: null, type: "email", direction: "outbound", subject: "Q2 re-engagement outreach", description: "Sent product update email with new Ridgewood finishes and Q2 promotions.", date: "2026-03-12T10:00:00", agent: "ai", agentName: "Support Agent", duration: null },
];

// =============================================================
// HELPER FUNCTIONS
// =============================================================

export function getContactById(id: string): Contact | undefined {
  return contacts.find((c) => c.id === id);
}

export function getDealsByContact(contactId: string): Deal[] {
  return deals.filter((d) => d.contactId === contactId);
}

export function getActivitiesByContact(contactId: string): Activity[] {
  return activities.filter((a) => a.contactId === contactId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getActivitiesByDeal(dealId: string): Activity[] {
  return activities.filter((a) => a.dealId === dealId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getDealsByStage(stage: PipelineStage): Deal[] {
  return deals.filter((d) => d.stage === stage && d.dealStatus !== "lost");
}

export function getContactsByType(type: ContactType): Contact[] {
  return contacts.filter((c) => c.type === type);
}

export function getStageConfig(stage: PipelineStage) {
  return PIPELINE_STAGES.find((s) => s.key === stage)!;
}

export function getContactTypeConfig(type: ContactType) {
  return CONTACT_TYPES.find((t) => t.key === type)!;
}

export function getActivityTypeConfig(type: ActivityType) {
  return ACTIVITY_TYPES.find((t) => t.key === type)!;
}

export function getPipelineStats() {
  const openDeals = deals.filter((d) => d.dealStatus === "open");
  const wonDeals = deals.filter((d) => d.dealStatus === "won");
  const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = openDeals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
  const wonThisMonth = wonDeals.filter((d) => d.lastActivityDate >= "2026-03-01").length;
  const wonValue = wonDeals.filter((d) => d.lastActivityDate >= "2026-03-01").reduce((sum, d) => sum + d.value, 0);
  const avgSpeedToLead = contacts.filter((c) => c.speedToLead !== null).reduce((sum, c, _, arr) => sum + (c.speedToLead! / arr.length), 0);

  return { totalPipelineValue, weightedValue, wonThisMonth, wonValue, avgSpeedToLead, openDeals: openDeals.length, totalDeals: deals.length };
}
