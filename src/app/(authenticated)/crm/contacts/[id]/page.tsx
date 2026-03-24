"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Bot,
  User,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Clock,
  Tag,
  X,
  Plus,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
  contacts,
  getContactById,
  getDealsByContact,
  getActivitiesByContact,
  getContactTypeConfig,
  getStageConfig,
  getActivityTypeConfig,
  CONTACT_TYPES,
  PIPELINE_STAGES,
  ACTIVITY_TYPES,
  type Contact,
  type Deal,
  type Activity,
} from "@/lib/crm-data";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  lead: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
};

const dealStatusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  won: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  lost: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  on_hold: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

const projectStatusColors: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Completed: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Pending: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
};

const projectStatusIcons: Record<string, typeof CheckCircle2> = {
  Active: Loader2,
  Completed: CheckCircle2,
  Pending: AlertCircle,
};

// Mock projects data (kept from original — would eventually come from a projects data layer)
const mockProjects = [
  { name: "Downtown Loft Kitchen Remodel", status: "Active", value: 78500, progress: 62 },
  { name: "Riverside Condo Bath Renovation", status: "Active", value: 45200, progress: 35 },
  { name: "Summit Heights Cabinet Refresh", status: "Completed", value: 32100, progress: 100 },
  { name: "Harbor Mall Break Room Refit", status: "Completed", value: 28900, progress: 100 },
  { name: "Lakewood Residence Kitchen & Bath", status: "Pending", value: 29600, progress: 0 },
];

// Mock notes
const mockNotes = [
  {
    content: "Prefers email communication over calls. Best time to reach: mornings before 11am. Very detail-oriented -- always send itemized quotes.",
    date: "2026-02-20T09:00:00",
    author: "You",
  },
  {
    content: "Discussed potential expansion into commercial K&B projects. Expressed interest in a preferred vendor arrangement for Q3.",
    date: "2026-03-01T14:30:00",
    author: "You",
  },
  {
    content: "AI follow-up: Customer satisfaction survey completed. Score: 9/10. Mentioned excellent response times as key differentiator.",
    date: "2026-03-10T10:15:00",
    author: "Support Agent",
  },
];

// Mock financials
const mockInvoices = [
  { id: "INV-2026-0042", date: "2026-03-15", amount: 25905, status: "partial", paid: 15000, project: "Kitchen Remodel" },
  { id: "INV-2026-0038", date: "2026-03-01", amount: 17160, status: "paid", paid: 17160, project: "Condo Kitchen" },
  { id: "INV-2026-0029", date: "2026-02-15", amount: 29400, status: "paid", paid: 29400, project: "Master Bath" },
  { id: "INV-2026-0015", date: "2026-01-20", amount: 12000, status: "overdue", paid: 0, project: "Cabinet Refresh" },
];

const invoiceStatusColors: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  partial: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  overdue: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  sent: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  draft: "bg-muted text-muted-foreground border-border",
};

const ALL_TAGS = [
  "VIP",
  "Hot Lead",
  "Returning Client",
  "Referral",
  "Premium",
  "New Construction",
  "Renovation",
];

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const contact = getContactById(contactId);
  const contactDeals = useMemo(() => getDealsByContact(contactId), [contactId]);
  const contactActivities = useMemo(() => getActivitiesByContact(contactId), [contactId]);

  const [activeTab, setActiveTab] = useState("deals");
  const [contactTags, setContactTags] = useState<string[]>(contact?.tags ?? []);
  const [noteText, setNoteText] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
        setTagSearch("");
      }
    }
    if (showTagPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTagPicker]);

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-lg text-muted-foreground">Contact not found</p>
        <Link
          href="/crm/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>
      </div>
    );
  }

  const typeConfig = getContactTypeConfig(contact.type);
  const TypeIcon = typeConfig.icon;

  // Stats
  const activeDeals = contactDeals.filter((d) => d.dealStatus === "open").length;
  const totalDealValue = contactDeals
    .filter((d) => d.dealStatus !== "lost")
    .reduce((sum, d) => sum + d.value, 0);

  // Find referredBy contact
  const referredByContact = contact.referredBy
    ? getContactById(contact.referredBy)
    : null;

  // AI Insights (generated based on contact data)
  const insights = useMemo(() => {
    const items: { text: string; type: string }[] = [];
    if (contact.yoyGrowth > 15) {
      items.push({
        text: `${contact.name}'s revenue grew ${contact.yoyGrowth}% YoY. High-value relationship trending upward.`,
        type: "growth",
      });
    }
    if (activeDeals > 1) {
      items.push({
        text: `${activeDeals} active deals in pipeline worth $${totalDealValue.toLocaleString()}. Multiple opportunities in motion.`,
        type: "opportunity",
      });
    }
    if (contact.speedToLead !== null && contact.speedToLead <= 5) {
      items.push({
        text: `Speed-to-lead was ${contact.speedToLead} min -- excellent first response. Contributes to strong engagement.`,
        type: "engagement",
      });
    }
    if (contact.status === "inactive") {
      items.push({
        text: `Contact has been inactive. Consider a re-engagement campaign or personal outreach.`,
        type: "risk",
      });
    }
    if (contact.speedToLead !== null && contact.speedToLead > 30) {
      items.push({
        text: `Initial response took ${contact.speedToLead} min. Improving speed-to-lead could increase conversion rate.`,
        type: "risk",
      });
    }
    if (items.length === 0) {
      items.push({
        text: `Relationship is stable. Monitor for cross-sell or upsell opportunities.`,
        type: "engagement",
      });
    }
    return items;
  }, [contact, activeDeals, totalDealValue]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href="/crm/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-indigo-500/30">
            <AvatarFallback className="bg-indigo-500/20 text-lg text-indigo-700 dark:text-indigo-300">
              {contact.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">
                {contact.name}
              </h1>
              <Badge
                variant="outline"
                className={`${typeConfig.bgColor} ${typeConfig.color} border-transparent gap-1`}
              >
                <TypeIcon className="h-3 w-3" />
                {typeConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={statusColors[contact.status]}
              >
                {contact.status.charAt(0).toUpperCase() +
                  contact.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {contact.jobTitle
                ? `${contact.jobTitle}${contact.company ? ` at ${contact.company}` : ""}`
                : contact.company || "Homeowner"}
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="glass border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Revenue
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {contact.totalRevenue > 0
              ? `$${contact.totalRevenue.toLocaleString()}`
              : "--"}
          </p>
          {contact.yoyGrowth !== 0 && (
            <div className="flex items-center gap-1 mt-1">
              {contact.yoyGrowth > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              )}
              <span
                className={`text-xs ${
                  contact.yoyGrowth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {contact.yoyGrowth > 0 ? "+" : ""}
                {contact.yoyGrowth}% YoY
              </span>
            </div>
          )}
        </Card>
        <Card className="glass border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Active Deals
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {activeDeals}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {contactDeals.length} total
          </p>
        </Card>
        <Card className="glass border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Deal Value
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            ${totalDealValue.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Open + won deals
          </p>
        </Card>
        <Card className="glass border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Speed-to-Lead
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {contact.speedToLead !== null ? `${contact.speedToLead} min` : "N/A"}
          </p>
          {contact.speedToLead !== null && (
            <p
              className={`text-xs mt-1 ${
                contact.speedToLead <= 5
                  ? "text-emerald-600 dark:text-emerald-400"
                  : contact.speedToLead <= 15
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {contact.speedToLead <= 5
                ? "Excellent"
                : contact.speedToLead <= 15
                ? "Good"
                : "Needs improvement"}
            </p>
          )}
        </Card>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">
                    {contact.address}, {contact.city}, {contact.state}{" "}
                    {contact.zip}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="text-sm text-foreground">
                    {contact.website || "--"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <ArrowUpRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Referral Source
                  </p>
                  <p className="text-sm text-foreground">
                    {contact.referralSource}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referred By</p>
                  {referredByContact ? (
                    <Link
                      href={`/crm/contacts/${referredByContact.id}`}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 transition-colors"
                    >
                      {referredByContact.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-foreground">--</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass border border-border bg-foreground/5">
              <TabsTrigger
                value="deals"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:text-indigo-300"
              >
                Deals ({contactDeals.length})
              </TabsTrigger>
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:text-indigo-300"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="activities"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:text-indigo-300"
              >
                Activities ({contactActivities.length})
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:text-indigo-300"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:text-indigo-300"
              >
                Financials
              </TabsTrigger>
            </TabsList>

            {/* Deals Tab */}
            <TabsContent value="deals" className="mt-4 space-y-3">
              {contactDeals.length === 0 ? (
                <Card className="glass border-border p-8 text-center">
                  <p className="text-muted-foreground">No deals for this contact yet.</p>
                </Card>
              ) : (
                contactDeals.map((deal) => {
                  const stageConfig = getStageConfig(deal.stage);
                  const StageIcon = stageConfig.icon;
                  return (
                    <Card
                      key={deal.id}
                      className="glass border-border p-4 hover:bg-foreground/[0.03] transition-colors cursor-pointer"
                      onClick={() => router.push(`/crm/deals/${deal.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <StageIcon className={`h-4 w-4 ${stageConfig.color}`} />
                          <span className="font-medium text-foreground">
                            {deal.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`${stageConfig.bgColor} ${stageConfig.color} ${stageConfig.borderColor}`}
                          >
                            {stageConfig.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={dealStatusColors[deal.dealStatus]}
                          >
                            {deal.dealStatus === "on_hold"
                              ? "On Hold"
                              : deal.dealStatus.charAt(0).toUpperCase() +
                                deal.dealStatus.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Value</p>
                          <p className="font-medium text-foreground">
                            ${deal.value.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">GP%</p>
                          <p className="font-medium text-foreground">
                            {deal.grossProfit > 0
                              ? `${deal.grossProfit}%`
                              : "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Probability
                          </p>
                          <p className="font-medium text-foreground">
                            {deal.probability}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Expected Close
                          </p>
                          <p className="font-medium text-foreground">
                            {new Date(
                              deal.expectedCloseDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-4 space-y-3">
              {mockProjects.map((project, i) => {
                const StatusIcon = projectStatusIcons[project.status];
                return (
                  <Card
                    key={i}
                    className="glass border-border p-4 hover:bg-foreground/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          className={`h-4 w-4 ${
                            project.status === "Active"
                              ? "text-emerald-600 dark:text-emerald-400 animate-spin"
                              : project.status === "Completed"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                          style={
                            project.status === "Active"
                              ? { animationDuration: "3s" }
                              : undefined
                          }
                        />
                        <span className="font-medium text-foreground">
                          {project.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={projectStatusColors[project.status]}
                        >
                          {project.status}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">
                          ${project.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={project.progress}
                        className="h-1.5 flex-1 bg-foreground/5"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-4">
              {contactActivities.length === 0 ? (
                <Card className="glass border-border p-8 text-center">
                  <p className="text-muted-foreground">No activities recorded yet.</p>
                </Card>
              ) : (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                  {contactActivities.map((activity) => {
                    const actConfig = getActivityTypeConfig(activity.type);
                    const ActIcon = actConfig.icon;
                    return (
                      <div key={activity.id} className="relative flex gap-4 py-3">
                        <div
                          className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                            activity.agent === "ai"
                              ? "border-amber-500/30 bg-amber-500/10"
                              : "border-border bg-foreground/5"
                          }`}
                        >
                          <ActIcon
                            className={`h-4 w-4 ${
                              activity.agent === "ai"
                                ? "text-amber-600 dark:text-amber-400"
                                : actConfig.color
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {activity.subject}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${actConfig.color} bg-foreground/5 border-border`}
                            >
                              {actConfig.label}
                            </Badge>
                            {activity.agent === "ai" && (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0"
                              >
                                <Bot className="h-3 w-3 mr-1" />
                                {activity.agentName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {activity.direction && (
                              <>
                                <span>
                                  {activity.direction === "inbound"
                                    ? "Received"
                                    : "Sent"}
                                </span>
                                <span>-</span>
                              </>
                            )}
                            <span>
                              {new Date(activity.date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}{" "}
                              at{" "}
                              {new Date(activity.date).toLocaleTimeString(
                                "en-US",
                                { hour: "numeric", minute: "2-digit" }
                              )}
                            </span>
                            {activity.duration && (
                              <>
                                <span>-</span>
                                <span>{activity.duration} min</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card className="glass border-border p-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this contact..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (noteText.trim()) {
                        setNoteText("");
                        toast.success("Note added successfully");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              </Card>
              {mockNotes
                .slice()
                .reverse()
                .map((note, i) => (
                  <Card key={i} className="glass border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {note.author === "Support Agent" ? (
                          <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium text-muted-foreground">
                          {note.author}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {note.content}
                    </p>
                  </Card>
                ))}
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="mt-4 space-y-6">
              {/* AR Aging Summary */}
              <Card className="glass border-border p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  AR Aging Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Current", value: 25905, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "1-30 Days", value: 0, color: "text-blue-600 dark:text-blue-400" },
                    { label: "31-60 Days", value: 12000, color: "text-amber-600 dark:text-amber-400" },
                    { label: "61-90 Days", value: 0, color: "text-red-600 dark:text-red-400" },
                  ].map((bucket) => (
                    <div key={bucket.label}>
                      <p className="text-xs text-muted-foreground">
                        {bucket.label}
                      </p>
                      <p className={`text-lg font-bold ${bucket.color}`}>
                        ${bucket.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Invoice List */}
              <Card className="glass border-border p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Recent Invoices
                </h3>
                <div className="space-y-3">
                  {mockInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {inv.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inv.project} -{" "}
                            {new Date(inv.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            ${inv.amount.toLocaleString()}
                          </p>
                          {inv.status === "partial" && (
                            <p className="text-xs text-muted-foreground">
                              Paid: ${inv.paid.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            invoiceStatusColors[inv.status] ??
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {inv.status.charAt(0).toUpperCase() +
                            inv.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment History */}
              <Card className="glass border-border p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Payment History
                </h3>
                <div className="space-y-3">
                  {[
                    { date: "2026-03-10", amount: 15000, method: "ACH", invoice: "INV-2026-0042" },
                    { date: "2026-03-01", amount: 17160, method: "Check #4892", invoice: "INV-2026-0038" },
                    { date: "2026-02-15", amount: 29400, method: "ACH", invoice: "INV-2026-0029" },
                    { date: "2026-01-15", amount: 25905, method: "Wire", invoice: "INV-2025-0198" },
                  ].map((payment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            ${payment.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.method} - {payment.invoice}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Revenue Card */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Revenue
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {contact.totalRevenue > 0
                ? `$${contact.totalRevenue.toLocaleString()}`
                : "--"}
            </p>
            {contact.yoyGrowth !== 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {contact.yoyGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={`text-sm ${
                    contact.yoyGrowth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {contact.yoyGrowth > 0 ? "+" : ""}
                  {contact.yoyGrowth}% YoY
                </span>
              </div>
            )}
            {/* Sparkline Placeholder */}
            {contact.totalRevenue > 0 && (
              <>
                <div className="mt-4 flex items-end gap-1 h-12">
                  {[35, 42, 38, 55, 48, 62, 58, 71, 65, 78, 82, 90].map(
                    (val, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-indigo-500/30"
                        style={{ height: `${val}%` }}
                      />
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Monthly revenue (12 months)
                </p>
              </>
            )}
            <Separator className="bg-border my-4" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Client since</span>
              <span className="text-muted-foreground">
                {new Date(contact.since).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                AI Insights
              </h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    insight.type === "risk"
                      ? "bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300"
                      : insight.type === "opportunity"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300"
                      : insight.type === "growth"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {insight.text}
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </h3>
            </div>
            <div className="space-y-3">
              {contactDeals
                .filter((d) => d.dealStatus === "open")
                .slice(0, 2)
                .map((deal) => (
                  <div key={deal.id} className="flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2 mt-0.5">
                      <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {deal.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expected close:{" "}
                        {new Date(deal.expectedCloseDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              {contactDeals.filter((d) => d.dealStatus === "open").length ===
                0 && (
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
              )}
            </div>
          </Card>

          {/* Tags */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {contactTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-foreground/5 text-muted-foreground border-border hover:border-red-500/30 group cursor-pointer transition-colors"
                  onClick={() => {
                    setContactTags((prev) => prev.filter((t) => t !== tag));
                    toast.success(`Tag removed: ${tag}`);
                  }}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 dark:text-red-400" />
                </Badge>
              ))}
              <div className="relative" ref={tagPickerRef}>
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20 transition-colors"
                  onClick={() => {
                    setShowTagPicker((prev) => !prev);
                    setTagSearch("");
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Tag
                </Badge>
                {showTagPicker && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-border bg-background shadow-xl p-2">
                    <input
                      type="text"
                      autoFocus
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tags..."
                      className="w-full rounded-md border border-border bg-foreground/[0.02] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary mb-1"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {ALL_TAGS.filter(
                        (t) =>
                          !contactTags.includes(t) &&
                          t.toLowerCase().includes(tagSearch.toLowerCase())
                      ).length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">
                          No tags available
                        </p>
                      ) : (
                        ALL_TAGS.filter(
                          (t) =>
                            !contactTags.includes(t) &&
                            t.toLowerCase().includes(tagSearch.toLowerCase())
                        ).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setContactTags((prev) => [...prev, tag]);
                              toast.success(`Tag added: ${tag}`);
                              setShowTagPicker(false);
                              setTagSearch("");
                            }}
                            className="w-full text-left rounded-md px-3 py-1.5 text-xs text-foreground hover:bg-foreground/[0.05] transition-colors"
                          >
                            {tag}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
