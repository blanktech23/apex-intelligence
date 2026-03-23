import type { Persona, IndustryVertical } from "./persona-context";

// ---------------------------------------------------------------------------
// Template type
// ---------------------------------------------------------------------------

export interface PersonaTemplate {
  id: string;
  persona: Persona;
  industry: IndustryVertical;
  label: string;
  description: string;
  icon: string; // lucide icon name

  sidebarItems: string[];
  bosItems: string[];
  showKBCanvas: boolean;
  kbCanvasMode: "full" | "view_only" | "hidden";

  dashboardLayout: "contractor" | "dealer" | "rep" | "manufacturer";

  agentConfig: {
    name: string;
    description: string;
    icon: string;
    status: "active" | "paused" | "disabled";
  }[];

  checklistItems: {
    id: string;
    label: string;
    description: string;
    href: string;
    completed: boolean;
  }[];

  tourSteps: {
    element: string;
    title: string;
    description: string;
    side: "top" | "bottom" | "left" | "right";
  }[];
}

// ---------------------------------------------------------------------------
// Contractor (current experience — default)
// ---------------------------------------------------------------------------

const contractor: PersonaTemplate = {
  id: "contractor-kb",
  persona: "contractor",
  industry: "kitchen_bath",
  label: "Kitchen & Bath Contractor",
  description:
    "Design and install kitchens and baths for homeowners. Full access to design canvas, estimating, and project management.",
  icon: "Hammer",

  sidebarItems: [
    "Dashboard",
    "Agents",
    "Customers",
    "Projects",
    "Escalations",
    "Approvals",
    "Reports",
    "Business OS",
    "Settings",
  ],
  bosItems: [
    "BOS Hub",
    "KPI Dashboard",
    "Meetings",
    "Goals & Milestones",
    "Issues",
    "Action Items",
    "Org Chart",
    "People",
    "Vision Plan",
    "Reviews",
    "Announcements",
    "Processes",
    "Knowledge Portal",
    "Assessments",
    "Fit Check",
    "Analytics",
  ],
  showKBCanvas: true,
  kbCanvasMode: "full",

  dashboardLayout: "contractor",

  agentConfig: [
    {
      name: "Discovery Concierge",
      description: "Qualifies homeowner leads and books consultations",
      icon: "Search",
      status: "active",
    },
    {
      name: "Design Spec Assistant",
      description: "Generates K&B design specs and material lists",
      icon: "PenTool",
      status: "active",
    },
    {
      name: "Estimate Engine",
      description: "Creates project estimates for homeowners",
      icon: "Calculator",
      status: "active",
    },
    {
      name: "Project Orchestrator",
      description: "Manages installation scheduling and milestones",
      icon: "CalendarClock",
      status: "active",
    },
    {
      name: "Operations Controller",
      description: "Handles AP/AR, lien waivers, and financials",
      icon: "Receipt",
      status: "active",
    },
    {
      name: "Executive Navigator",
      description: "CEO briefing with project and revenue summaries",
      icon: "BarChart3",
      status: "active",
    },
    {
      name: "Support Agent",
      description: "Platform help and troubleshooting",
      icon: "LifeBuoy",
      status: "active",
    },
  ],

  checklistItems: [
    {
      id: "c-profile",
      label: "Complete company profile",
      description: "Add your business name, logo, and contact info",
      href: "/settings",
      completed: true,
    },
    {
      id: "c-integrations",
      label: "Connect QuickBooks",
      description: "Sync invoices and payments automatically",
      href: "/settings/integrations",
      completed: false,
    },
    {
      id: "c-customer",
      label: "Add your first customer",
      description: "Import or create a homeowner lead",
      href: "/customers",
      completed: false,
    },
    {
      id: "c-project",
      label: "Create a project",
      description: "Start a kitchen or bath remodel project",
      href: "/projects",
      completed: false,
    },
    {
      id: "c-agent",
      label: "Run your first agent",
      description: "Let an agent handle a lead qualification or estimate",
      href: "/agents",
      completed: false,
    },
  ],

  tourSteps: [
    {
      element: "[data-tour='sidebar']",
      title: "Your Navigation",
      description:
        "Access projects, customers, agents, and reports from the sidebar.",
      side: "right",
    },
    {
      element: "[data-tour='agents']",
      title: "AI Agents",
      description:
        "Seven agents work for you — from lead qualification to financial management.",
      side: "right",
    },
    {
      element: "[data-tour='dashboard']",
      title: "Dashboard",
      description:
        "See your active projects, upcoming installations, and agent activity at a glance.",
      side: "bottom",
    },
    {
      element: "[data-tour='canvas']",
      title: "Design Canvas",
      description:
        "Create kitchen and bath designs with AI-assisted specs and material selection.",
      side: "bottom",
    },
  ],
};

// ---------------------------------------------------------------------------
// Dealer
// ---------------------------------------------------------------------------

const dealer: PersonaTemplate = {
  id: "dealer-kb",
  persona: "dealer",
  industry: "kitchen_bath",
  label: "Kitchen & Bath Dealer",
  description:
    "Sell cabinets, countertops, and appliances to contractors. Manage catalogs, orders, and rep relationships.",
  icon: "Store",

  sidebarItems: [
    "Dashboard",
    "Agents",
    "Orders",
    "Contractors",
    "Catalog",
    "Reps",
    "Reports",
    "Business OS",
    "Settings",
  ],
  bosItems: [
    "BOS Hub",
    "KPI Dashboard",
    "Meetings",
    "Goals & Milestones",
    "Issues",
    "Action Items",
    "Org Chart",
    "People",
    "Vision Plan",
    "Reviews",
    "Announcements",
    "Processes",
    "Knowledge Portal",
    "Assessments",
    "Fit Check",
    "Analytics",
  ],
  showKBCanvas: true,
  kbCanvasMode: "view_only",

  dashboardLayout: "dealer",

  agentConfig: [
    {
      name: "Discovery Concierge",
      description: "Qualifies contractor leads and trade applications",
      icon: "Search",
      status: "active",
    },
    {
      name: "Design Spec Assistant",
      description: "Product specs and submittal packages for contractor orders",
      icon: "PenTool",
      status: "active",
    },
    {
      name: "Estimate Engine",
      description: "Generates contractor quotes from catalog pricing",
      icon: "Calculator",
      status: "active",
    },
    {
      name: "Project Orchestrator",
      description: "Tracks order fulfillment and delivery scheduling",
      icon: "CalendarClock",
      status: "active",
    },
    {
      name: "Operations Controller",
      description: "Manages AP/AR and inventory",
      icon: "Receipt",
      status: "active",
    },
    {
      name: "Executive Navigator",
      description: "CEO briefing with sales and inventory summaries",
      icon: "BarChart3",
      status: "active",
    },
    {
      name: "Support Agent",
      description: "Platform help and troubleshooting",
      icon: "LifeBuoy",
      status: "active",
    },
    {
      name: "Catalog Pricing Agent",
      description:
        "Manages manufacturer catalog pricing, dealer markups, and contractor quotes",
      icon: "Tags",
      status: "active",
    },
    {
      name: "Order Routing Agent",
      description:
        "Routes contractor orders to manufacturers and tracks multi-supplier fulfillment",
      icon: "Route",
      status: "active",
    },
  ],

  checklistItems: [
    {
      id: "d-profile",
      label: "Complete company profile",
      description: "Add your showroom name, logo, and locations",
      href: "/settings",
      completed: false,
    },
    {
      id: "d-catalog",
      label: "Connect a manufacturer catalog",
      description: "Import product catalogs from your manufacturers",
      href: "/catalog",
      completed: false,
    },
    {
      id: "d-pricing",
      label: "Set pricing rules",
      description: "Configure markups and contractor pricing tiers",
      href: "/catalog",
      completed: false,
    },
    {
      id: "d-contractor",
      label: "Invite a contractor",
      description: "Add a contractor to your trade network",
      href: "/contractors",
      completed: false,
    },
    {
      id: "d-agent",
      label: "Run your first agent",
      description: "Let an agent handle a contractor quote or order routing",
      href: "/agents",
      completed: false,
    },
  ],

  tourSteps: [
    {
      element: "[data-tour='sidebar']",
      title: "Dealer Navigation",
      description:
        "Manage orders, contractors, catalogs, and reps from the sidebar.",
      side: "right",
    },
    {
      element: "[data-tour='agents']",
      title: "AI Agents",
      description:
        "Nine agents including Catalog Pricing and Order Routing handle your operations.",
      side: "right",
    },
    {
      element: "[data-tour='dashboard']",
      title: "Dealer Dashboard",
      description:
        "See pending orders, contractor activity, and catalog updates at a glance.",
      side: "bottom",
    },
    {
      element: "[data-tour='orders']",
      title: "Orders",
      description:
        "Track contractor orders from quote through fulfillment and delivery.",
      side: "right",
    },
    {
      element: "[data-tour='catalog']",
      title: "Catalog Management",
      description:
        "Browse manufacturer catalogs, set pricing tiers, and generate contractor quotes.",
      side: "right",
    },
  ],
};

// ---------------------------------------------------------------------------
// Sales Rep
// ---------------------------------------------------------------------------

const rep: PersonaTemplate = {
  id: "rep-kb",
  persona: "rep",
  industry: "kitchen_bath",
  label: "Kitchen & Bath Sales Rep",
  description:
    "Represent manufacturers and sell to dealers and contractors. Track territory, orders, and commissions.",
  icon: "Briefcase",

  sidebarItems: [
    "Dashboard",
    "Agents",
    "Customers",
    "Territory",
    "Orders",
    "Commissions",
    "Catalog",
    "Business OS",
    "Settings",
  ],
  bosItems: [
    "BOS Hub",
    "KPI Dashboard",
    "Scorecard",
    "Quarterly Rocks",
  ],
  showKBCanvas: false,
  kbCanvasMode: "hidden",

  dashboardLayout: "rep",

  agentConfig: [
    {
      name: "Discovery Concierge",
      description: "Tracks contractor opportunities in your territory",
      icon: "Search",
      status: "active",
    },
    {
      name: "Design Spec Assistant",
      description: "Generates product spec sheets for contractors",
      icon: "PenTool",
      status: "active",
    },
    {
      name: "Operations Controller",
      description: "Commission reconciliation and payment tracking",
      icon: "Receipt",
      status: "active",
    },
    {
      name: "Executive Navigator",
      description: "Performance summary across territory and commissions",
      icon: "BarChart3",
      status: "active",
    },
    {
      name: "Support Agent",
      description: "Platform help and troubleshooting",
      icon: "LifeBuoy",
      status: "active",
    },
    {
      name: "Territory Intelligence",
      description:
        "Analyzes contractor activity, identifies upsell opportunities, tracks competitor placements",
      icon: "Map",
      status: "active",
    },
    {
      name: "Commission Optimizer",
      description:
        "Tracks facilitated orders, calculates commissions, and generates reports",
      icon: "DollarSign",
      status: "active",
    },
  ],

  checklistItems: [
    {
      id: "r-profile",
      label: "Complete your profile",
      description: "Add your name, contact info, and manufacturer associations",
      href: "/settings",
      completed: false,
    },
    {
      id: "r-territory",
      label: "Connect your territory",
      description: "Define your coverage area and dealer assignments",
      href: "/territory",
      completed: false,
    },
    {
      id: "r-order",
      label: "Track your first order",
      description: "Facilitate a contractor or dealer order to earn commission",
      href: "/orders",
      completed: false,
    },
    {
      id: "r-agent",
      label: "Run your first agent",
      description:
        "Let Territory Intelligence find opportunities in your region",
      href: "/agents",
      completed: false,
    },
  ],

  tourSteps: [
    {
      element: "[data-tour='sidebar']",
      title: "Rep Navigation",
      description:
        "Access territory, orders, commissions, and catalog from the sidebar.",
      side: "right",
    },
    {
      element: "[data-tour='agents']",
      title: "AI Agents",
      description:
        "Seven agents including Territory Intelligence and Commission Optimizer work for you.",
      side: "right",
    },
    {
      element: "[data-tour='dashboard']",
      title: "Rep Dashboard",
      description:
        "See your territory activity, pending commissions, and contractor opportunities.",
      side: "bottom",
    },
    {
      element: "[data-tour='territory']",
      title: "Territory",
      description:
        "View your coverage area, assigned dealers, and contractor activity.",
      side: "right",
    },
    {
      element: "[data-tour='commissions']",
      title: "Commissions",
      description:
        "Track earned, pending, and paid commissions across all manufacturers.",
      side: "right",
    },
  ],
};

// ---------------------------------------------------------------------------
// Manufacturer
// ---------------------------------------------------------------------------

const manufacturer: PersonaTemplate = {
  id: "manufacturer-kb",
  persona: "manufacturer",
  industry: "kitchen_bath",
  label: "Kitchen & Bath Manufacturer",
  description:
    "Make kitchen and bath products and sell through dealers. Manage catalogs, production, and dealer network.",
  icon: "Factory",

  sidebarItems: [
    "Dashboard",
    "Agents",
    "Production",
    "Dealers",
    "Catalog",
    "Distribution",
    "Reports",
    "Business OS",
    "Settings",
  ],
  bosItems: [
    "BOS Hub",
    "KPI Dashboard",
    "Meetings",
    "Goals & Milestones",
    "Issues",
    "Action Items",
    "Org Chart",
    "People",
    "Vision Plan",
    "Reviews",
    "Announcements",
    "Processes",
    "Knowledge Portal",
    "Assessments",
    "Fit Check",
    "Analytics",
  ],
  showKBCanvas: false,
  kbCanvasMode: "hidden",

  dashboardLayout: "manufacturer",

  agentConfig: [
    {
      name: "Discovery Concierge",
      description: "Qualifies dealer applications and partnership inquiries",
      icon: "Search",
      status: "active",
    },
    {
      name: "Design Spec Assistant",
      description: "Manages catalog data, specs, and product documentation",
      icon: "PenTool",
      status: "active",
    },
    {
      name: "Estimate Engine",
      description: "Generates dealer pricing and wholesale quotes",
      icon: "Calculator",
      status: "active",
    },
    {
      name: "Project Orchestrator",
      description: "Manages production scheduling and order fulfillment",
      icon: "CalendarClock",
      status: "active",
    },
    {
      name: "Operations Controller",
      description: "Handles AP/AR and production cost tracking",
      icon: "Receipt",
      status: "active",
    },
    {
      name: "Executive Navigator",
      description: "CEO briefing with production and sales analytics",
      icon: "BarChart3",
      status: "active",
    },
    {
      name: "Catalog Publisher",
      description:
        "Manages product catalog publishing, SKU data, and dealer distribution",
      icon: "BookOpen",
      status: "active",
    },
    {
      name: "Production Scheduler",
      description:
        "Monitors production orders, tracks lead times, and flags delays",
      icon: "Clock",
      status: "active",
    },
    {
      name: "Quality Analytics",
      description:
        "Tracks quality metrics, defect rates, and dealer feedback",
      icon: "ShieldCheck",
      status: "active",
    },
  ],

  checklistItems: [
    {
      id: "m-profile",
      label: "Complete company profile",
      description: "Add your brand name, logo, and manufacturing details",
      href: "/settings",
      completed: false,
    },
    {
      id: "m-catalog",
      label: "Publish your catalog",
      description: "Upload SKUs, pricing tiers, and product specs",
      href: "/catalog",
      completed: false,
    },
    {
      id: "m-erp",
      label: "Connect your ERP",
      description: "Integrate NetSuite, Acumatica, or your production system",
      href: "/settings/integrations",
      completed: false,
    },
    {
      id: "m-dealer",
      label: "Invite a dealer",
      description: "Add a dealer to your distribution network",
      href: "/dealers",
      completed: false,
    },
    {
      id: "m-agent",
      label: "Run your first agent",
      description:
        "Let the Catalog Publisher or Production Scheduler handle a task",
      href: "/agents",
      completed: false,
    },
  ],

  tourSteps: [
    {
      element: "[data-tour='sidebar']",
      title: "Manufacturer Navigation",
      description:
        "Access production, dealers, catalog, and distribution from the sidebar.",
      side: "right",
    },
    {
      element: "[data-tour='agents']",
      title: "AI Agents",
      description:
        "Nine agents including Catalog Publisher, Production Scheduler, and Quality Analytics.",
      side: "right",
    },
    {
      element: "[data-tour='dashboard']",
      title: "Manufacturer Dashboard",
      description:
        "See production status, dealer orders, and catalog distribution at a glance.",
      side: "bottom",
    },
    {
      element: "[data-tour='production']",
      title: "Production",
      description:
        "Track production orders, lead times, and fulfillment status.",
      side: "right",
    },
    {
      element: "[data-tour='catalog']",
      title: "Catalog Management",
      description:
        "Publish and distribute your product catalog to dealers across your network.",
      side: "right",
    },
  ],
};

// ---------------------------------------------------------------------------
// Template registry
// ---------------------------------------------------------------------------

export const PERSONA_TEMPLATES: Record<Persona, PersonaTemplate> = {
  contractor,
  dealer,
  rep,
  manufacturer,
};
