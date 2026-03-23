"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Heart,
  Users,
  UserCog,
  Target,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & Config                                                     */
/* ------------------------------------------------------------------ */

interface StepConfig {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const steps: StepConfig[] = [
  { number: 1, title: "Company Profile", description: "Tell us about your business", icon: Building2 },
  { number: 2, title: "Core Values", description: "Define what drives your team", icon: Heart },
  { number: 3, title: "Leadership Team", description: "Set up your leadership team", icon: Users },
  { number: 4, title: "Key Roles", description: "Map your org structure", icon: UserCog },
  { number: 5, title: "Key Numbers", description: "Track what matters", icon: Target },
  { number: 6, title: "Meeting Format", description: "Choose your cadence", icon: CalendarClock },
  { number: 7, title: "All Set!", description: "You're ready to go", icon: Check },
];

const industries = [
  "General Contractor",
  "Subcontractor",
  "Design-Build",
  "Remodeling / K&B",
  "Real Estate",
  "Professional Services",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Landscaping",
  "Property Management",
  "Architecture",
  "Interior Design",
  "Engineering",
  "Manufacturing",
  "Healthcare",
  "Technology",
  "Financial Services",
  "Other",
];

const companySizes = [
  { value: "1-5", label: "1-5 employees" },
  { value: "6-10", label: "6-10 employees" },
  { value: "11-25", label: "11-25 employees" },
  { value: "26-50", label: "26-50 employees" },
  { value: "51-100", label: "51-100 employees" },
  { value: "100-250", label: "100-250 employees" },
  { value: "250+", label: "250+ employees" },
];

const coreValueSuggestions: Record<string, string[]> = {
  "General Contractor": ["Safety First", "Quality Craftsmanship", "Integrity", "Client Satisfaction", "Teamwork"],
  "Subcontractor": ["Reliability", "Expertise", "Safety", "Accountability", "Innovation"],
  "Design-Build": ["Creative Excellence", "Collaboration", "Attention to Detail", "Sustainability", "Client Vision"],
  "Remodeling / K&B": ["Craftsmanship", "Customer Experience", "Design Excellence", "Integrity", "Innovation"],
  "Real Estate": ["Trust", "Market Expertise", "Client Success", "Transparency", "Community"],
  "Professional Services": ["Excellence", "Integrity", "Innovation", "Client First", "Continuous Learning"],
  default: ["Integrity", "Excellence", "Innovation", "Teamwork", "Customer Focus"],
};

interface KPISuggestion {
  title: string;
  unit: string;
  direction: "up" | "down";
  goalValue: string;
}

const kpiSuggestions: Record<string, KPISuggestion[]> = {
  "General Contractor": [
    { title: "Revenue", unit: "$", direction: "up", goalValue: "500000" },
    { title: "Gross Profit Margin", unit: "%", direction: "up", goalValue: "35" },
    { title: "Project On-Time Rate", unit: "%", direction: "up", goalValue: "90" },
    { title: "Safety Incidents", unit: "#", direction: "down", goalValue: "0" },
    { title: "Customer Satisfaction", unit: "/5", direction: "up", goalValue: "4.5" },
  ],
  "Remodeling / K&B": [
    { title: "Monthly Revenue", unit: "$", direction: "up", goalValue: "250000" },
    { title: "Lead Conversion Rate", unit: "%", direction: "up", goalValue: "30" },
    { title: "Average Project Value", unit: "$", direction: "up", goalValue: "45000" },
    { title: "Customer Reviews", unit: "/5", direction: "up", goalValue: "4.8" },
    { title: "Warranty Callbacks", unit: "#", direction: "down", goalValue: "2" },
  ],
  default: [
    { title: "Revenue", unit: "$", direction: "up", goalValue: "500000" },
    { title: "Profit Margin", unit: "%", direction: "up", goalValue: "20" },
    { title: "Customer Satisfaction", unit: "/5", direction: "up", goalValue: "4.5" },
    { title: "Team Utilization", unit: "%", direction: "up", goalValue: "85" },
    { title: "Issue Resolution Time", unit: "days", direction: "down", goalValue: "3" },
  ],
};

interface MeetingTemplate {
  name: string;
  duration: string;
  minutes: number;
  segments: { name: string; duration: number; color: string }[];
}

const meetingTemplates: MeetingTemplate[] = [
  {
    name: "Compact 60min",
    duration: "60 min",
    minutes: 60,
    segments: [
      { name: "Segue", duration: 5, color: "bg-indigo-500" },
      { name: "Scorecard", duration: 5, color: "bg-cyan-500" },
      { name: "Rock Review", duration: 5, color: "bg-green-500" },
      { name: "Headlines", duration: 5, color: "bg-amber-500" },
      { name: "To-Do List", duration: 5, color: "bg-purple-500" },
      { name: "IDS", duration: 30, color: "bg-red-500" },
      { name: "Conclude", duration: 5, color: "bg-gray-500" },
    ],
  },
  {
    name: "Standard 90min",
    duration: "90 min",
    minutes: 90,
    segments: [
      { name: "Segue", duration: 5, color: "bg-indigo-500" },
      { name: "Scorecard", duration: 5, color: "bg-cyan-500" },
      { name: "Rock Review", duration: 5, color: "bg-green-500" },
      { name: "Customer/Employee Headlines", duration: 5, color: "bg-amber-500" },
      { name: "To-Do List", duration: 5, color: "bg-purple-500" },
      { name: "IDS", duration: 60, color: "bg-red-500" },
      { name: "Conclude", duration: 5, color: "bg-gray-500" },
    ],
  },
  {
    name: "Extended 120min",
    duration: "120 min",
    minutes: 120,
    segments: [
      { name: "Segue", duration: 5, color: "bg-indigo-500" },
      { name: "Scorecard", duration: 10, color: "bg-cyan-500" },
      { name: "Rock Review", duration: 10, color: "bg-green-500" },
      { name: "Headlines", duration: 10, color: "bg-amber-500" },
      { name: "To-Do List", duration: 10, color: "bg-purple-500" },
      { name: "IDS", duration: 70, color: "bg-red-500" },
      { name: "Conclude", duration: 5, color: "bg-gray-500" },
    ],
  },
];

interface KeyRole {
  id: string;
  title: string;
  person: string;
  responsibilities: string;
}

interface KPIItem {
  id: string;
  title: string;
  owner: string;
  goalValue: string;
  direction: "up" | "down";
  unit: string;
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                  isCompleted
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : isActive
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                      : "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-5" /> : step.number}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-[11px] font-medium sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "mx-2 mb-6 h-0.5 w-6 rounded-full transition-colors sm:mx-3 sm:w-10",
                  isCompleted ? "bg-green-500/50" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Company Profile                                            */
/* ------------------------------------------------------------------ */

function CompanyProfileStep({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  companySize,
  setCompanySize,
  timezone,
}: {
  companyName: string;
  setCompanyName: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  companySize: string;
  setCompanySize: (v: string) => void;
  timezone: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Company Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your business so we can tailor the experience
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <Input
            placeholder="Kiptra Construction Co."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-10 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <Select value={industry} onValueChange={(v) => setIndustry(v ?? industry)}>
            <SelectTrigger className="h-10 border-border bg-muted/30">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Timezone</label>
          <Input
            value={timezone}
            readOnly
            className="h-10 rounded-lg border-border bg-muted/30 text-sm text-muted-foreground"
          />
          <p className="text-[11px] text-muted-foreground/60">Auto-detected from your browser</p>
        </div>

        <div className="space-y-3 sm:col-span-2">
          <label className="text-sm font-medium text-foreground">Company Size</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {companySizes.map((size) => (
              <button
                key={size.value}
                onClick={() => setCompanySize(size.value)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-xs font-medium transition-all",
                  companySize === size.value
                    ? "border-primary bg-primary/10 text-foreground shadow-sm"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: Core Values                                                */
/* ------------------------------------------------------------------ */

function CoreValuesStep({
  values,
  setValues,
  industry,
}: {
  values: string[];
  setValues: (v: string[]) => void;
  industry: string;
}) {
  const suggestions = coreValueSuggestions[industry] || coreValueSuggestions.default;
  const unusedSuggestions = suggestions.filter((s) => !values.includes(s));

  const addValue = () => {
    if (values.length < 7) setValues([...values, ""]);
  };

  const removeValue = (index: number) => {
    if (values.length > 3) setValues(values.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    setValues(next);
  };

  const addSuggestion = (suggestion: string) => {
    if (values.length < 7) {
      // Replace first empty value, or add new
      const emptyIndex = values.findIndex((v) => v.trim() === "");
      if (emptyIndex >= 0) {
        updateValue(emptyIndex, suggestion);
      } else {
        setValues([...values, suggestion]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Core Values</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define 3-5 values that drive your organization (max 7)
        </p>
      </div>

      <div className="space-y-3">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-400">
              {index + 1}
            </div>
            <Input
              value={value}
              onChange={(e) => updateValue(index, e.target.value)}
              placeholder={`Core value ${index + 1}`}
              className="h-10 flex-1 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
            />
            {values.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeValue(index)}
                className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {values.length < 7 && (
        <Button
          variant="outline"
          onClick={addValue}
          className="h-9 gap-2 rounded-lg border-border text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Add value
        </Button>
      )}

      {/* AI Suggestions */}
      {unusedSuggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-foreground">
              AI Suggestions for {industry || "your industry"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unusedSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addSuggestion(suggestion)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3: Leadership Team                                            */
/* ------------------------------------------------------------------ */

function LeadershipTeamStep({
  teamName,
  setTeamName,
  emails,
  setEmails,
}: {
  teamName: string;
  setTeamName: (v: string) => void;
  emails: string[];
  setEmails: (v: string[]) => void;
}) {
  const addEmail = () => setEmails([...emails, ""]);
  const removeEmail = (index: number) => setEmails(emails.filter((_, i) => i !== index));
  const updateEmail = (index: number, value: string) => {
    const next = [...emails];
    next[index] = value;
    setEmails(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Leadership Team</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up your leadership team and invite members
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Team Name</label>
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Leadership Team"
          className="h-10 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Invite Members</label>
        {emails.map((email, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => updateEmail(index, e.target.value)}
              placeholder="colleague@company.com"
              className="h-10 flex-1 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeEmail(index)}
              className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addEmail}
          className="h-9 gap-2 rounded-lg border-border text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <Plus className="size-3.5" />
          Add another
        </Button>
      </div>

      <p className="text-xs text-muted-foreground/60">
        Invitations will be sent after setup is complete.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4: Key Roles                                                  */
/* ------------------------------------------------------------------ */

function KeyRolesStep({
  roles,
  setRoles,
}: {
  roles: KeyRole[];
  setRoles: (v: KeyRole[]) => void;
}) {
  const addRole = () =>
    setRoles([
      ...roles,
      {
        id: Date.now().toString(),
        title: "",
        person: "",
        responsibilities: "",
      },
    ]);

  const removeRole = (id: string) =>
    setRoles(roles.filter((r) => r.id !== id));

  const updateRole = (id: string, field: keyof Omit<KeyRole, "id">, value: string) => {
    setRoles(
      roles.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Key Roles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the key seats in your organization
        </p>
      </div>

      {/* Visual Org Stub */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-muted/10 p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20">
            <UserCog className="h-6 w-6 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-foreground">Your Organization</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex gap-8">
          {roles.slice(0, 3).map((role) => (
            <div key={role.id} className="text-center">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-xs font-bold text-muted-foreground">
                {role.person ? role.person.charAt(0).toUpperCase() : "?"}
              </div>
              <p className="text-[11px] font-medium text-foreground">
                {role.title || "Untitled"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {role.person || "Unassigned"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Role Cards */}
      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="glass rounded-xl border-l-2 border-l-indigo-500/40 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {role.title || "New Role"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRole(role.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <Input
                  value={role.title}
                  onChange={(e) => updateRole(role.id, "title", e.target.value)}
                  placeholder="e.g., Strategic Leader"
                  className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Person</label>
                <Input
                  value={role.person}
                  onChange={(e) => updateRole(role.id, "person", e.target.value)}
                  placeholder="e.g., Joseph Wells"
                  className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Responsibilities</label>
                <textarea
                  value={role.responsibilities}
                  onChange={(e) => updateRole(role.id, "responsibilities", e.target.value)}
                  placeholder="Key responsibilities for this role..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addRole}
        className="h-9 gap-2 rounded-lg border-border text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add Role
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 5: Track Key Numbers                                          */
/* ------------------------------------------------------------------ */

function KeyNumbersStep({
  kpis,
  setKpis,
  industry,
}: {
  kpis: KPIItem[];
  setKpis: (v: KPIItem[]) => void;
  industry: string;
}) {
  const suggestions = kpiSuggestions[industry] || kpiSuggestions.default;

  const addKPI = () =>
    setKpis([
      ...kpis,
      {
        id: Date.now().toString(),
        title: "",
        owner: "",
        goalValue: "",
        direction: "up",
        unit: "#",
      },
    ]);

  const removeKPI = (id: string) =>
    setKpis(kpis.filter((k) => k.id !== id));

  const updateKPI = (id: string, field: keyof Omit<KPIItem, "id">, value: string) => {
    setKpis(
      kpis.map((k) =>
        k.id === id
          ? { ...k, [field]: field === "direction" ? value as "up" | "down" : value }
          : k
      )
    );
  };

  const loadSuggestions = () => {
    const newKpis: KPIItem[] = suggestions.map((s, i) => ({
      id: `suggested-${i}`,
      title: s.title,
      owner: "",
      goalValue: s.goalValue,
      direction: s.direction,
      unit: s.unit,
    }));
    setKpis(newKpis);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Track Key Numbers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the KPIs that matter most to your business
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSuggestions}
          className="h-8 gap-1.5 rounded-lg border-border text-xs text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Load suggestions
        </Button>
      </div>

      <div className="space-y-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="glass rounded-xl p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {kpi.title || "New KPI"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeKPI(kpi.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <label className="text-[11px] font-medium text-muted-foreground">Title</label>
                <Input
                  value={kpi.title}
                  onChange={(e) => updateKPI(kpi.id, "title", e.target.value)}
                  placeholder="KPI name"
                  className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Owner</label>
                <Input
                  value={kpi.owner}
                  onChange={(e) => updateKPI(kpi.id, "owner", e.target.value)}
                  placeholder="Person"
                  className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Goal</label>
                <Input
                  value={kpi.goalValue}
                  onChange={(e) => updateKPI(kpi.id, "goalValue", e.target.value)}
                  placeholder="Target"
                  className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Unit</label>
                  <Select
                    value={kpi.unit}
                    onValueChange={(v) => updateKPI(kpi.id, "unit", v ?? kpi.unit)}
                  >
                    <SelectTrigger className="h-9 border-border bg-muted/30 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">$</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="#">#</SelectItem>
                      <SelectItem value="/5">/5</SelectItem>
                      <SelectItem value="days">days</SelectItem>
                      <SelectItem value="hrs">hrs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground">Dir</label>
                  <button
                    onClick={() =>
                      updateKPI(kpi.id, "direction", kpi.direction === "up" ? "down" : "up")
                    }
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                      kpi.direction === "up"
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : "border-red-500/30 bg-red-500/10 text-red-400"
                    )}
                  >
                    {kpi.direction === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addKPI}
        className="h-9 gap-2 rounded-lg border-border text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add KPI
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 6: Meeting Format                                             */
/* ------------------------------------------------------------------ */

function MeetingFormatStep({
  selectedTemplate,
  setSelectedTemplate,
}: {
  selectedTemplate: string;
  setSelectedTemplate: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Meeting Format</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a meeting template for your leadership team
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {meetingTemplates.map((template) => {
          const isSelected = selectedTemplate === template.name;

          return (
            <button
              key={template.name}
              onClick={() => setSelectedTemplate(template.name)}
              className={cn(
                "glass rounded-xl p-5 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                  : "glass-hover"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-foreground">
                    {template.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <p className="mb-4 text-xs text-muted-foreground">{template.duration}</p>

              {/* Visual time breakdown */}
              <div className="mb-3 flex h-3 overflow-hidden rounded-full">
                {template.segments.map((seg) => (
                  <div
                    key={seg.name}
                    className={cn("h-full", seg.color)}
                    style={{
                      width: `${(seg.duration / template.minutes) * 100}%`,
                    }}
                    title={`${seg.name}: ${seg.duration}min`}
                  />
                ))}
              </div>

              {/* Segment labels */}
              <div className="space-y-1.5">
                {template.segments.map((seg) => (
                  <div
                    key={seg.name}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn("h-2 w-2 rounded-full", seg.color)}
                      />
                      <span className="text-muted-foreground">{seg.name}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {seg.duration}m
                    </span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 7: Success                                                    */
/* ------------------------------------------------------------------ */

function SuccessStep({
  companyName,
  industry,
  valuesCount,
  rolesCount,
  kpisCount,
  meetingTemplate,
}: {
  companyName: string;
  industry: string;
  valuesCount: number;
  rolesCount: number;
  kpisCount: number;
  meetingTemplate: string;
}) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-8 text-center">
      {/* Animated checkmark */}
      <div className="flex justify-center">
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 transition-all duration-700",
            showCheck
              ? "scale-100 opacity-100 shadow-[0_0_60px_rgba(34,197,94,0.3)]"
              : "scale-50 opacity-0"
          )}
        >
          <Check
            className={cn(
              "h-12 w-12 text-green-400 transition-all duration-500 delay-300",
              showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">You&apos;re All Set!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {companyName || "Your company"} is ready to run on the Business Operating System
        </p>
      </div>

      {/* Config summary */}
      <div className="mx-auto max-w-md">
        <div className="glass rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Configuration Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Industry</span>
              <span className="font-medium text-foreground">{industry || "Not set"}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Core Values</span>
              <span className="font-medium text-foreground">{valuesCount} defined</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Key Roles</span>
              <span className="font-medium text-foreground">{rolesCount} created</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">KPIs</span>
              <span className="font-medium text-foreground">{kpisCount} tracked</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meeting Format</span>
              <span className="font-medium text-foreground">{meetingTemplate || "Not set"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/bos">
          <Button className="h-11 gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_50px_rgba(99,102,241,0.5)]">
            Go to Business OS
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl border-border px-8 text-sm font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BosOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("General Contractor");
  const [companySize, setCompanySize] = useState("11-25");
  const [timezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "America/Chicago";
    }
  });

  // Step 2 state
  const [coreValues, setCoreValues] = useState<string[]>([
    "Integrity",
    "Quality",
    "Safety",
  ]);

  // Step 3 state
  const [teamName, setTeamName] = useState("Leadership Team");
  const [teamEmails, setTeamEmails] = useState<string[]>(["", ""]);

  // Step 4 state
  const [keyRoles, setKeyRoles] = useState<KeyRole[]>([
    {
      id: "1",
      title: "Strategic Leader",
      person: "",
      responsibilities: "Set company vision, make strategic decisions, build culture",
    },
    {
      id: "2",
      title: "Operations Leader",
      person: "",
      responsibilities: "Oversee day-to-day operations, manage teams, execute plans",
    },
  ]);

  // Step 5 state
  const [kpis, setKpis] = useState<KPIItem[]>([]);

  // Step 6 state
  const [meetingTemplate, setMeetingTemplate] = useState("Standard 90min");

  const totalSteps = steps.length;
  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);
  const isLastStep = currentStep === totalSteps;
  const isSuccessStep = currentStep === 7;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="h-1.5 flex-1" />
        <span className="text-xs font-medium text-muted-foreground">
          {currentStep}/{totalSteps}
        </span>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step content */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        {currentStep === 1 && (
          <CompanyProfileStep
            companyName={companyName}
            setCompanyName={setCompanyName}
            industry={industry}
            setIndustry={setIndustry}
            companySize={companySize}
            setCompanySize={setCompanySize}
            timezone={timezone}
          />
        )}
        {currentStep === 2 && (
          <CoreValuesStep
            values={coreValues}
            setValues={setCoreValues}
            industry={industry}
          />
        )}
        {currentStep === 3 && (
          <LeadershipTeamStep
            teamName={teamName}
            setTeamName={setTeamName}
            emails={teamEmails}
            setEmails={setTeamEmails}
          />
        )}
        {currentStep === 4 && (
          <KeyRolesStep roles={keyRoles} setRoles={setKeyRoles} />
        )}
        {currentStep === 5 && (
          <KeyNumbersStep
            kpis={kpis}
            setKpis={setKpis}
            industry={industry}
          />
        )}
        {currentStep === 6 && (
          <MeetingFormatStep
            selectedTemplate={meetingTemplate}
            setSelectedTemplate={setMeetingTemplate}
          />
        )}
        {currentStep === 7 && (
          <SuccessStep
            companyName={companyName}
            industry={industry}
            valuesCount={coreValues.filter((v) => v.trim()).length}
            rolesCount={keyRoles.length}
            kpisCount={kpis.length}
            meetingTemplate={meetingTemplate}
          />
        )}
      </div>

      {/* Navigation */}
      {!isSuccessStep && (
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            variant="outline"
            className="h-10 gap-2 rounded-lg border-border px-5 text-sm font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <span
                key={step.number}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  step.number === currentStep
                    ? "bg-primary"
                    : step.number < currentStep
                      ? "bg-green-500/60"
                      : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button
            onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
            className="h-10 gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          >
            {currentStep === totalSteps - 1 ? "Finish" : "Next"}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
