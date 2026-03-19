"use client";

import { useState } from "react";
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
  PhoneCall,
  MessageSquare,
  TrendingUp,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const customer = {
  id: "cust-005",
  name: "David Park",
  company: "Parkway Electrical Services",
  status: "Active",
  email: "david@parkwayelectric.com",
  phone: "(737) 555-0429",
  address: "4821 Lamar Blvd, Suite 200, Austin, TX 78751",
  website: "www.parkwayelectric.com",
  initials: "DP",
  totalRevenue: 214300,
  yoyGrowth: 18.4,
  since: "2024-06-15",
};

const projects = [
  {
    name: "Downtown Office Electrical Overhaul",
    status: "Active",
    value: 78500,
    progress: 62,
  },
  {
    name: "Riverside Condo Wiring Phase 2",
    status: "Active",
    value: 45200,
    progress: 35,
  },
  {
    name: "Summit Heights Panel Upgrade",
    status: "Completed",
    value: 32100,
    progress: 100,
  },
  {
    name: "Harbor Mall Emergency Lighting",
    status: "Completed",
    value: 28900,
    progress: 100,
  },
  {
    name: "Lakewood Residence Smart Home",
    status: "Pending",
    value: 29600,
    progress: 0,
  },
];

const communications = [
  {
    type: "email",
    direction: "inbound",
    subject: "Re: Electrical Overhaul Timeline Update",
    preview: "Thanks for the update. The revised schedule works for us...",
    date: "2026-03-14T10:32:00",
    agent: "ai",
    agentName: "Sales Agent",
  },
  {
    type: "call",
    direction: "outbound",
    subject: "Follow-up on Panel Upgrade Completion",
    preview: "Discussed final inspection scheduling and punch list items.",
    date: "2026-03-13T14:15:00",
    agent: "manual",
    agentName: "You",
  },
  {
    type: "email",
    direction: "outbound",
    subject: "Proposal: Lakewood Smart Home Package",
    preview: "Hi David, attached is our proposal for the Lakewood residence...",
    date: "2026-03-12T09:45:00",
    agent: "ai",
    agentName: "Proposal Agent",
  },
  {
    type: "email",
    direction: "inbound",
    subject: "Question about Riverside Phase 2 budget",
    preview: "Can we review the budget line items for the conduit work?",
    date: "2026-03-10T16:20:00",
    agent: "manual",
    agentName: "David Park",
  },
  {
    type: "call",
    direction: "outbound",
    subject: "Weekly Check-in Call",
    preview: "Routine weekly check-in. All projects on track, no blockers.",
    date: "2026-03-08T11:00:00",
    agent: "manual",
    agentName: "You",
  },
  {
    type: "email",
    direction: "outbound",
    subject: "March Invoice Summary",
    preview: "Hi David, please find attached the March billing summary...",
    date: "2026-03-07T08:30:00",
    agent: "ai",
    agentName: "Billing Agent",
  },
  {
    type: "email",
    direction: "inbound",
    subject: "Re: Smart Home Consultation",
    preview: "Looks great. Let's schedule the site walk for next Tuesday.",
    date: "2026-03-05T13:12:00",
    agent: "manual",
    agentName: "David Park",
  },
  {
    type: "call",
    direction: "outbound",
    subject: "Emergency Lighting Sign-off",
    preview: "Confirmed Harbor Mall project complete. Client signed off.",
    date: "2026-03-03T15:45:00",
    agent: "manual",
    agentName: "You",
  },
];

const notes = [
  {
    content:
      "David prefers email communication over calls. Best time to reach: mornings before 11am. Very detail-oriented -- always send itemized quotes.",
    date: "2026-02-20T09:00:00",
    author: "You",
  },
  {
    content:
      "Discussed potential expansion into commercial solar installations. David expressed interest in a joint venture proposal for Q3.",
    date: "2026-03-01T14:30:00",
    author: "You",
  },
  {
    content:
      "AI follow-up: Customer satisfaction survey completed. Score: 9/10. Mentioned excellent response times as key differentiator.",
    date: "2026-03-10T10:15:00",
    author: "Support Agent",
  },
];

const insights = [
  {
    text: "David's project frequency increased 40% YoY. High probability of becoming a top-5 account by Q4.",
    type: "growth",
  },
  {
    text: "Response time to proposals averages 1.2 days -- significantly faster than the 4-day average. Indicates strong engagement.",
    type: "engagement",
  },
  {
    text: "Pending Lakewood project has potential for $15K upsell on smart security integration based on similar client patterns.",
    type: "opportunity",
  },
  {
    text: "No contract renewal discussion initiated yet. Current MSA expires in 45 days -- recommend scheduling review.",
    type: "risk",
  },
];

const tags = ["VIP", "Commercial", "Repeat", "Electrical", "Austin Metro"];

const projectStatusColors: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const projectStatusIcons: Record<string, typeof CheckCircle2> = {
  Active: Loader2,
  Completed: CheckCircle2,
  Pending: AlertCircle,
};

export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState("projects");
  const [customerTags, setCustomerTags] = useState(tags);
  const [noteText, setNoteText] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-indigo-500/30">
            <AvatarFallback className="bg-indigo-500/20 text-lg text-indigo-300">
              {customer.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {customer.name}
              </h1>
              <Badge
                variant="outline"
                className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              >
                {customer.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{customer.company}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

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
                  <Mail className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Phone className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">{customer.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="text-sm text-foreground">{customer.website}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs: Projects / Communications / Notes */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass border border-border bg-foreground/5">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="communications"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Communications
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-4 space-y-3">
              {projects.map((project, i) => {
                const StatusIcon = projectStatusIcons[project.status];
                return (
                  <Card
                    key={i}
                    className="glass border-border p-4 hover:bg-foreground/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          className={`h-4 w-4 ${
                            project.status === "Active"
                              ? "text-emerald-400 animate-spin"
                              : project.status === "Completed"
                              ? "text-blue-400"
                              : "text-amber-400"
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

            {/* Communications Tab */}
            <TabsContent value="communications" className="mt-4">
              <div className="relative space-y-0">
                {/* Timeline line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                {communications.map((comm, i) => (
                  <div key={i} className="relative flex gap-4 py-3">
                    <div
                      className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                        comm.agent === "ai"
                          ? "border-amber-500/30 bg-amber-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      {comm.type === "email" ? (
                        <Mail
                          className={`h-4 w-4 ${
                            comm.agent === "ai"
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ) : (
                        <PhoneCall
                          className={`h-4 w-4 ${
                            comm.agent === "ai"
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comm.subject}
                        </span>
                        {comm.agent === "ai" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0"
                          >
                            <Bot className="h-3 w-3 mr-1" />
                            {comm.agentName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {comm.preview}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {comm.direction === "inbound"
                            ? "Received"
                            : "Sent"}
                        </span>
                        <span>-</span>
                        <span>
                          {new Date(comm.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(comm.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card className="glass border-border p-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this customer..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={() => { if (noteText.trim()) { setNoteText(""); toast.success("Note added successfully"); } }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              </Card>
              {notes
                .slice()
                .reverse()
                .map((note, i) => (
                  <Card key={i} className="glass border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {note.author === "Support Agent" ? (
                          <Bot className="h-4 w-4 text-amber-400" />
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
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                  </Card>
                ))}
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
              ${customer.totalRevenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">
                +{customer.yoyGrowth}% YoY
              </span>
            </div>
            {/* Sparkline Placeholder */}
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
            <Separator className="bg-border my-4" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Client since</span>
              <span className="text-muted-foreground">
                {new Date(customer.since).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-400" />
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
                      ? "bg-red-500/10 border border-red-500/20 text-red-300"
                      : insight.type === "opportunity"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                      : insight.type === "growth"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                      : "bg-blue-500/10 border border-blue-500/20 text-blue-300"
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
              <Clock className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2 mt-0.5">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Site Walk - Lakewood Residence
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tuesday, Mar 19 at 10:00 AM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2 mt-0.5">
                  <FileText className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Contract Renewal Review
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due by Apr 30, 2026
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {customerTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-foreground/5 text-muted-foreground border-border hover:border-red-500/30 group cursor-pointer transition-colors"
                  onClick={() =>
                    setCustomerTags((prev) => prev.filter((t) => t !== tag))
                  }
                >
                  {tag}
                  <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                </Badge>
              ))}
              <Badge
                variant="outline"
                className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 cursor-pointer hover:bg-indigo-500/20 transition-colors"
                onClick={() => toast.info("Add tag dialog coming soon")}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
