import type { Role } from "@/lib/role-context";
import type { Persona } from "@/lib/persona-context";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";

export interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
  roles?: Role[]; // if undefined, visible to all roles
}

export interface TourDefinition {
  id: string;
  label: string;
  trigger: "first_login" | "first_visit";
  route?: string; // only trigger on this route prefix
  steps: TourStep[];
}

// ---------------------------------------------------------------------------
// Platform Orientation Tour — built dynamically from persona template
// ---------------------------------------------------------------------------

function buildPlatformTour(persona: Persona): TourDefinition {
  const template = PERSONA_TEMPLATES[persona];
  const steps: TourStep[] = template.tourSteps.map((ts) => ({
    element: ts.element,
    popover: {
      title: ts.title,
      description: ts.description,
      side: ts.side,
    },
  }));

  return {
    id: "platform",
    label: "Platform Orientation",
    trigger: "first_login",
    steps,
  };
}

// ---------------------------------------------------------------------------
// Business OS Tour (5 steps) — available to all personas with BOS
// ---------------------------------------------------------------------------

const bosTour: TourDefinition = {
  id: "bos",
  label: "Business OS",
  trigger: "first_visit",
  route: "/bos",
  steps: [
    {
      element: '[data-tour="bos-hub"]',
      popover: {
        title: "Your Business Hub",
        description: "See everything at a glance from here.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="kpis-link"]',
      popover: {
        title: "Track KPIs",
        description: "Monitor your team's key metrics weekly.",
        side: "right",
      },
      roles: ["owner", "admin", "manager", "bookkeeper"],
    },
    {
      element: '[data-tour="meetings-link"]',
      popover: {
        title: "Weekly Meetings",
        description: "Run structured sync meetings from here.",
        side: "right",
      },
      roles: ["owner", "admin", "manager"],
    },
    {
      element: '[data-tour="goals-link"]',
      popover: {
        title: "Set Goals",
        description: "Track quarterly goals and milestones.",
        side: "right",
      },
    },
    {
      element: '[data-tour="issues-link"]',
      popover: {
        title: "Resolve Issues",
        description: "Surface and resolve team issues fast.",
        side: "right",
      },
      roles: ["owner", "admin", "manager"],
    },
  ],
};

// ---------------------------------------------------------------------------
// K&B Canvas Tour (5 steps) — only for personas with showKBCanvas
// ---------------------------------------------------------------------------

const canvasTour: TourDefinition = {
  id: "canvas",
  label: "K&B Design Canvas",
  trigger: "first_visit",
  route: "/canvas",
  steps: [
    {
      element: '[data-tour="canvas-toolbar"]',
      popover: {
        title: "Design Tools",
        description: "Draw walls, place cabinets, add appliances.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="view-toggle"]',
      popover: {
        title: "Switch Views",
        description: "Toggle between floor plan and 3D perspective.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="ai-chat-input"]',
      popover: {
        title: "AI Design Assistant",
        description: "Describe what you want — AI generates it.",
        side: "top",
      },
    },
    {
      element: '[data-tour="properties-panel"]',
      popover: {
        title: "Edit Properties",
        description: "Change materials, dimensions, and finishes.",
        side: "left",
      },
    },
    {
      element: '[data-tour="bom-button"]',
      popover: {
        title: "Bill of Materials",
        description: "See your real-time bill of materials.",
        side: "left",
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Integration Setup Tour (3 steps)
// ---------------------------------------------------------------------------

const integrationTour: TourDefinition = {
  id: "integrations",
  label: "Integration Setup",
  trigger: "first_visit",
  route: "/settings/integrations",
  steps: [
    {
      element: '[data-tour="integrations-grid"]',
      popover: {
        title: "Connect Your Tools",
        description: "Link your business tools here.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="quickbooks-card"]',
      popover: {
        title: "QuickBooks",
        description: "Start here to sync your financial data.",
        side: "right",
      },
      roles: ["owner", "admin", "bookkeeper"],
    },
    {
      element: '[data-tour="calendar-card"]',
      popover: {
        title: "Calendar",
        description: "Connect your calendar for scheduling.",
        side: "right",
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Get tours filtered by persona
// ---------------------------------------------------------------------------

export function getToursForPersona(persona: Persona): TourDefinition[] {
  const template = PERSONA_TEMPLATES[persona];
  const tours: TourDefinition[] = [
    buildPlatformTour(persona),
    bosTour,
    integrationTour,
  ];

  // K&B canvas tour only for personas that have canvas access
  if (template.showKBCanvas) {
    tours.splice(2, 0, canvasTour);
  }

  return tours;
}

// ---------------------------------------------------------------------------
// Export all tours (default = contractor for backwards compat)
// ---------------------------------------------------------------------------

export const tourDefinitions: TourDefinition[] = getToursForPersona("contractor");

export function getTourById(id: string, persona?: Persona): TourDefinition | undefined {
  const tours = persona ? getToursForPersona(persona) : tourDefinitions;
  return tours.find((t) => t.id === id);
}

export function getFilteredSteps(tour: TourDefinition, role: Role): TourStep[] {
  return tour.steps.filter(
    (step) => !step.roles || step.roles.includes(role)
  );
}
