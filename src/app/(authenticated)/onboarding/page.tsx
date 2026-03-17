"use client";

import { useState } from "react";
import {
  Building2,
  Plug,
  Bot,
  Users,
  Rocket,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Mail,
  Calculator,
  BarChart3,
  Wrench,
  Calendar,
  Palette,
  Headset,
  PlugZap,
  HardDrive,
  Sparkles,
  X,
  Plus,
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

/* ------------------------------------------------------------------ */
/*  Types & config                                                     */
/* ------------------------------------------------------------------ */

interface StepConfig {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: StepConfig[] = [
  { number: 1, title: "Company Profile", description: "Tell us about your business", icon: Building2 },
  { number: 2, title: "Connect Integrations", description: "Link your existing tools", icon: Plug },
  { number: 3, title: "Configure AI Agents", description: "Choose your AI workforce", icon: Bot },
  { number: 4, title: "Invite Team", description: "Add your team members", icon: Users },
  { number: 5, title: "Review & Launch", description: "Confirm and go live", icon: Rocket },
];

interface Integration {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  connected: boolean;
}

const integrations: Integration[] = [
  { name: "QuickBooks", description: "Accounting & invoicing", icon: PlugZap, iconBg: "bg-emerald-500/15", connected: false },
  { name: "Google Calendar", description: "Scheduling & availability", icon: Calendar, iconBg: "bg-blue-500/15", connected: false },
  { name: "Gmail", description: "Email communication", icon: Mail, iconBg: "bg-red-500/15", connected: false },
  { name: "JobTread", description: "Project management", icon: HardDrive, iconBg: "bg-orange-500/15", connected: false },
];

interface Agent {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

const defaultAgents: Agent[] = [
  { name: "Discovery Concierge", description: "Qualifies and routes inbound leads automatically", icon: Mail, enabled: true },
  { name: "Estimate Engine", description: "Generates cost estimates from project specs", icon: Calculator, enabled: true },
  { name: "Executive Navigator", description: "Surfaces KPIs and strategic insights for leadership", icon: BarChart3, enabled: true },
  { name: "Operations Controller", description: "Monitors project timelines and resource allocation", icon: Wrench, enabled: true },
  { name: "Project Orchestrator", description: "Manages crew scheduling and availability", icon: Calendar, enabled: false },
  { name: "Design Spec Assistant", description: "Extracts specs and submittals from design documents", icon: Palette, enabled: false },
  { name: "Support Agent", description: "Handles customer inquiries and ticket triage", icon: Headset, enabled: true },
];

interface TeamInvite {
  email: string;
  role: string;
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
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "border-green-500 bg-green-500/20 text-green-400"
                    : isActive
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                      : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-5" /> : step.number}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div
                className={`mx-3 mb-6 h-0.5 w-12 rounded-full transition-colors sm:w-20 ${
                  isCompleted ? "bg-green-500/50" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Content Components                                            */
/* ------------------------------------------------------------------ */

function CompanyProfileStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Company Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Help us configure Apex Intelligence for your business
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-foreground">Company Name</label>
          <Input
            placeholder="Apex Construction Co."
            className="h-10 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <Select defaultValue="construction">
            <SelectTrigger className="h-10 border-border bg-muted/30">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="remodeling">Remodeling</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="roofing">Roofing</SelectItem>
              <SelectItem value="general_contractor">General Contractor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Team Size</label>
          <Select defaultValue="11-25">
            <SelectTrigger className="h-10 border-border bg-muted/30">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-5">1-5 employees</SelectItem>
              <SelectItem value="6-10">6-10 employees</SelectItem>
              <SelectItem value="11-25">11-25 employees</SelectItem>
              <SelectItem value="26-50">26-50 employees</SelectItem>
              <SelectItem value="51-100">51-100 employees</SelectItem>
              <SelectItem value="100+">100+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logo upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Company Logo</label>
        <div className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-border hover:bg-muted/40">
          <div className="text-center">
            <Upload className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drop your logo here or{" "}
              <span className="font-medium text-primary">browse</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              PNG, JPG up to 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsStep({
  connectionState,
  onToggle,
}: {
  connectionState: Record<string, boolean>;
  onToggle: (name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Connect Integrations
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your tools so agents can work across your business systems
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = connectionState[integration.name] ?? false;

          return (
            <div
              key={integration.name}
              className={`glass rounded-xl border-l-2 p-5 transition-all duration-200 ${
                isConnected
                  ? "border-l-green-500/60 bg-muted/30"
                  : "border-l-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${integration.iconBg}`}
                  >
                    <Icon className="size-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {integration.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {isConnected ? (
                  <Button
                    onClick={() => onToggle(integration.name)}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-md border-green-500/20 bg-green-500/10 text-xs font-medium text-green-400 hover:bg-green-500/20"
                  >
                    <Check className="size-3.5" />
                    Connected
                  </Button>
                ) : (
                  <Button
                    onClick={() => onToggle(integration.name)}
                    size="sm"
                    className="h-8 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground/60">
        You can always connect more integrations later from Settings.
      </p>
    </div>
  );
}

function AgentsStep({
  agentState,
  onToggle,
}: {
  agentState: Record<string, boolean>;
  onToggle: (name: string) => void;
}) {
  const enabledCount = Object.values(agentState).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Configure AI Agents
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which agents to activate.{" "}
          <span className="text-foreground/60">{enabledCount} of 7 enabled</span>
        </p>
      </div>

      <div className="space-y-3">
        {defaultAgents.map((agent) => {
          const Icon = agent.icon;
          const isEnabled = agentState[agent.name] ?? agent.enabled;

          return (
            <div
              key={agent.name}
              className={`glass flex items-center justify-between rounded-xl border-l-2 p-4 transition-all duration-200 ${
                isEnabled ? "border-l-indigo-500/60 bg-muted/30" : "border-l-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2">
                  <Icon className={`size-5 ${isEnabled ? "text-indigo-400" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => onToggle(agent.name)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
                  isEnabled ? "bg-indigo-600" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InviteTeamStep({
  invites,
  onUpdate,
  onAdd,
  onRemove,
}: {
  invites: TeamInvite[];
  onUpdate: (index: number, field: "email" | "role", value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Invite Team</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add team members who will work with your AI agents
        </p>
      </div>

      <div className="space-y-3">
        {invites.map((invite, index) => (
          <div
            key={index}
            className="glass flex items-end gap-3 rounded-xl p-4"
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Email address
              </label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={invite.email}
                onChange={(e) => onUpdate(index, "email", e.target.value)}
                className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>
            <div className="w-36 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Role
              </label>
              <Select
                value={invite.role}
                onValueChange={(v) => onUpdate(index, "role", v ?? invite.role)}
              >
                <SelectTrigger className="h-9 border-border bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Bookkeeper">Bookkeeper</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={onAdd}
        className="h-9 gap-2 rounded-lg border-border text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add another
      </Button>

      <p className="text-xs text-muted-foreground/60">
        Invitations will be sent after you complete the setup.
      </p>
    </div>
  );
}

function ReviewStep({
  agentState,
  connectionState,
  invites,
}: {
  agentState: Record<string, boolean>;
  connectionState: Record<string, boolean>;
  invites: TeamInvite[];
}) {
  const enabledAgents = defaultAgents.filter((a) => agentState[a.name] ?? a.enabled);
  const connectedIntegrations = integrations.filter(
    (i) => connectionState[i.name]
  );
  const validInvites = invites.filter((i) => i.email.trim().length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Review & Launch</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm your setup before going live
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 p-1.5">
              <Bot className="size-4 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Agents</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {enabledAgents.length}
          </p>
          <p className="text-xs text-muted-foreground">agents enabled</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-500/10 p-1.5">
              <Plug className="size-4 text-green-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Integrations</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {connectedIntegrations.length}
          </p>
          <p className="text-xs text-muted-foreground">tools connected</p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/10 p-1.5">
              <Users className="size-4 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Team</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {validInvites.length}
          </p>
          <p className="text-xs text-muted-foreground">invites pending</p>
        </div>
      </div>

      {/* Enabled agents list */}
      <div className="glass rounded-xl p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Active Agents</h3>
        <div className="flex flex-wrap gap-2">
          {enabledAgents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5"
              >
                <Icon className="size-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-foreground">{agent.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Launch button */}
      <div className="flex justify-center pt-4">
        <Button className="h-12 gap-3 rounded-xl bg-primary px-10 text-base font-bold text-primary-foreground shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]">
          <Sparkles className="size-5" />
          Launch Apex Intelligence
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [connectionState, setConnectionState] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.name, i.connected]))
  );
  const [agentState, setAgentState] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultAgents.map((a) => [a.name, a.enabled]))
  );
  const [invites, setInvites] = useState<TeamInvite[]>([
    { email: "", role: "Manager" },
    { email: "", role: "Designer" },
    { email: "", role: "Viewer" },
  ]);

  const handleToggleIntegration = (name: string) => {
    setConnectionState((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleToggleAgent = (name: string) => {
    setAgentState((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleUpdateInvite = (index: number, field: "email" | "role", value: string) => {
    setInvites((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddInvite = () => {
    setInvites((prev) => [...prev, { email: "", role: "Viewer" }]);
  };

  const handleRemoveInvite = (index: number) => {
    setInvites((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step content */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        {currentStep === 1 && <CompanyProfileStep />}
        {currentStep === 2 && (
          <IntegrationsStep
            connectionState={connectionState}
            onToggle={handleToggleIntegration}
          />
        )}
        {currentStep === 3 && (
          <AgentsStep agentState={agentState} onToggle={handleToggleAgent} />
        )}
        {currentStep === 4 && (
          <InviteTeamStep
            invites={invites}
            onUpdate={handleUpdateInvite}
            onAdd={handleAddInvite}
            onRemove={handleRemoveInvite}
          />
        )}
        {currentStep === 5 && (
          <ReviewStep
            agentState={agentState}
            connectionState={connectionState}
            invites={invites}
          />
        )}
      </div>

      {/* Navigation */}
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
              className={`size-1.5 rounded-full transition-colors ${
                step.number === currentStep
                  ? "bg-primary"
                  : step.number < currentStep
                    ? "bg-green-500/60"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {currentStep < 5 ? (
          <Button
            onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
            className="h-10 gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <div className="w-[88px]" />
        )}
      </div>
    </div>
  );
}
