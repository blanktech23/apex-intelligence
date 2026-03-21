"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  UserMinus,
  ShieldCheck,
  Clock,
  Send,
  Crown,
  X,
  Check,
  UserX,
  UserCheck,
  ArrowRightLeft,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRole } from "@/lib/role-context";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MemberStatus = "active" | "deactivated";

type TeamMember = {
  name: string;
  email: string;
  initials: string;
  role: string;
  status: MemberStatus;
  lastActive: string;
};

type Invitation = {
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
};

/* ------------------------------------------------------------------ */
/*  Role configuration                                                 */
/* ------------------------------------------------------------------ */

const allRoles = ["Owner", "Admin", "Manager", "Designer", "Bookkeeper", "Viewer"];

const roleStyles: Record<string, { bg: string; text: string }> = {
  Owner: { bg: "bg-purple-500/15", text: "text-purple-400" },
  Admin: { bg: "bg-blue-500/15", text: "text-blue-400" },
  Manager: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  Designer: { bg: "bg-cyan-500/15", text: "text-cyan-400" },
  Bookkeeper: { bg: "bg-amber-500/15", text: "text-amber-400" },
  Viewer: { bg: "bg-muted", text: "text-muted-foreground" },
};

/* ------------------------------------------------------------------ */
/*  Plan seat limits                                                    */
/* ------------------------------------------------------------------ */

const PLAN = "Professional" as const;
const SEAT_LIMIT = 15; // Professional plan

/* ------------------------------------------------------------------ */
/*  Initial mock data                                                  */
/* ------------------------------------------------------------------ */

const initialMembers: TeamMember[] = [
  {
    name: "Joseph Wells",
    email: "joseph@apexintelligence.ai",
    initials: "JW",
    role: "Owner",
    status: "active",
    lastActive: "Active now",
  },
  {
    name: "Sarah Chen",
    email: "sarah@apexintelligence.ai",
    initials: "SC",
    role: "Admin",
    status: "active",
    lastActive: "5 min ago",
  },
  {
    name: "Mike Torres",
    email: "mike@apexintelligence.ai",
    initials: "MT",
    role: "Manager",
    status: "active",
    lastActive: "1 hour ago",
  },
  {
    name: "Lisa Park",
    email: "lisa@apexintelligence.ai",
    initials: "LP",
    role: "Designer",
    status: "active",
    lastActive: "3 hours ago",
  },
  {
    name: "David Kim",
    email: "david@apexintelligence.ai",
    initials: "DK",
    role: "Bookkeeper",
    status: "active",
    lastActive: "Yesterday",
  },
  {
    name: "Emily Rodriguez",
    email: "emily@apexintelligence.ai",
    initials: "ER",
    role: "Manager",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    name: "Alex Nguyen",
    email: "alex@apexintelligence.ai",
    initials: "AN",
    role: "Designer",
    status: "active",
    lastActive: "30 min ago",
  },
  {
    name: "Rachel Foster",
    email: "rachel@apexintelligence.ai",
    initials: "RF",
    role: "Viewer",
    status: "active",
    lastActive: "1 day ago",
  },
];

const initialInvitations: Invitation[] = [
  {
    email: "james@contractor.com",
    role: "Viewer",
    invitedBy: "Joseph Wells",
    invitedAt: "2 days ago",
  },
  {
    email: "natalie@designstudio.co",
    role: "Designer",
    invitedBy: "Sarah Chen",
    invitedAt: "5 hours ago",
  },
  {
    email: "marcus@accounting.io",
    role: "Bookkeeper",
    invitedBy: "Joseph Wells",
    invitedAt: "1 day ago",
  },
];

/* ------------------------------------------------------------------ */
/*  Access-restricted roles                                            */
/* ------------------------------------------------------------------ */

const restrictedRoles = new Set(["designer", "bookkeeper", "viewer"]);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TeamSettingsPage() {
  const { role, config } = useRole();

  // ---- Access restriction for non-team-management roles ----
  if (restrictedRoles.has(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Access Restricted</h1>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          You don&apos;t have permission to manage team settings. Contact your
          account owner or admin for access.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="mt-2">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Manager = view-only
  const isViewOnly = role === "manager";
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canInvite = isOwner || isAdmin;
  const canRemove = isOwner;
  const canDeactivate = isOwner || isAdmin;

  return (
    <TeamSettingsContent
      isViewOnly={isViewOnly}
      isOwner={isOwner}
      isAdmin={isAdmin}
      canInvite={canInvite}
      canRemove={canRemove}
      canDeactivate={canDeactivate}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Inner content (needs hooks, so separate component)                 */
/* ------------------------------------------------------------------ */

function TeamSettingsContent({
  isViewOnly,
  isOwner,
  isAdmin,
  canInvite,
  canRemove,
  canDeactivate,
}: {
  isViewOnly: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canInvite: boolean;
  canRemove: boolean;
  canDeactivate: boolean;
}) {
  // Core data
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");

  // Change Role dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState("");
  const [roleSuccess, setRoleSuccess] = useState(false);

  // Remove Member dialog
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  // Send Message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<TeamMember | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // Deactivate dialog
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<TeamMember | null>(null);

  // Reactivate dialog
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [reactivateTarget, setReactivateTarget] = useState<TeamMember | null>(null);

  // Transfer Ownership dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferConfirmText, setTransferConfirmText] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Resend tracking
  const [resentEmails, setResentEmails] = useState<Set<string>>(new Set());

  // Invite success flash
  const [inviteSuccess, setInviteSuccess] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Computed values                                                   */
  /* ---------------------------------------------------------------- */

  const activeCount = members.filter((m) => m.status === "active").length;
  const seatPercent = Math.round((activeCount / SEAT_LIMIT) * 100);

  const adminMembers = members.filter(
    (m) => m.role === "Admin" && m.status === "active"
  );

  /* ---------------------------------------------------------------- */
  /*  Filtered members                                                 */
  /* ---------------------------------------------------------------- */

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  /* ---------------------------------------------------------------- */
  /*  Handlers                                                         */
  /* ---------------------------------------------------------------- */

  function openChangeRole(member: TeamMember) {
    setRoleTarget(member);
    setNewRole(member.role);
    setRoleSuccess(false);
    setRoleDialogOpen(true);
  }

  function confirmChangeRole() {
    if (!roleTarget || !newRole) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.email === roleTarget.email ? { ...m, role: newRole } : m
      )
    );
    setRoleSuccess(true);
    setTimeout(() => {
      setRoleDialogOpen(false);
      setRoleSuccess(false);
    }, 1200);
  }

  function openRemoveMember(member: TeamMember) {
    setRemoveTarget(member);
    setRemoveDialogOpen(true);
  }

  function confirmRemoveMember() {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.email !== removeTarget.email));
    setRemoveDialogOpen(false);
  }

  function openSendMessage(member: TeamMember) {
    setMessageTarget(member);
    setMessageText("");
    setMessageSent(false);
    setMessageDialogOpen(true);
  }

  function confirmSendMessage() {
    setMessageSent(true);
    setTimeout(() => {
      setMessageDialogOpen(false);
      setMessageSent(false);
    }, 1200);
  }

  function openDeactivate(member: TeamMember) {
    setDeactivateTarget(member);
    setDeactivateDialogOpen(true);
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.email === deactivateTarget.email
          ? { ...m, status: "deactivated" as MemberStatus }
          : m
      )
    );
    setDeactivateDialogOpen(false);
  }

  function openReactivate(member: TeamMember) {
    setReactivateTarget(member);
    setReactivateDialogOpen(true);
  }

  function confirmReactivate() {
    if (!reactivateTarget) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.email === reactivateTarget.email
          ? { ...m, status: "active" as MemberStatus }
          : m
      )
    );
    setReactivateDialogOpen(false);
  }

  function openTransferOwnership() {
    setTransferTarget("");
    setTransferConfirmText("");
    setTransferSuccess(false);
    setTransferDialogOpen(true);
  }

  function confirmTransferOwnership() {
    if (!transferTarget || transferConfirmText !== "TRANSFER") return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.role === "Owner") return { ...m, role: "Admin" };
        if (m.email === transferTarget) return { ...m, role: "Owner" };
        return m;
      })
    );
    setTransferSuccess(true);
    setTimeout(() => {
      setTransferDialogOpen(false);
      setTransferSuccess(false);
    }, 1500);
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newInvitation: Invitation = {
      email: inviteEmail.trim(),
      role: inviteRole,
      invitedBy: "Joseph Wells",
      invitedAt: "Just now",
    };
    setInvitations((prev) => [...prev, newInvitation]);
    setInviteEmail("");
    setInviteRole("Viewer");
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 2000);
  }

  function handleResend(email: string) {
    setResentEmails((prev) => new Set(prev).add(email));
    setTimeout(() => {
      setResentEmails((prev) => {
        const next = new Set(prev);
        next.delete(email);
        return next;
      });
    }, 2000);
  }

  function handleCancelInvitation(email: string) {
    setInvitations((prev) => prev.filter((i) => i.email !== email));
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Team</h1>
          <Badge className="border-0 bg-muted text-muted-foreground">
            {activeCount} of {SEAT_LIMIT} seats used
          </Badge>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Seat count progress bar                                      */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {PLAN} plan &mdash; {activeCount} of {SEAT_LIMIT} seats used
          </span>
          <span className="text-sm font-medium text-foreground">
            {seatPercent}%
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              seatPercent >= 90
                ? "bg-red-500"
                : seatPercent >= 70
                  ? "bg-amber-500"
                  : "bg-primary"
            }`}
            style={{ width: `${Math.min(seatPercent, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {SEAT_LIMIT - activeCount} seat{SEAT_LIMIT - activeCount !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* ============================================================ */}
      {/*  Invite member section                                        */}
      {/* ============================================================ */}
      {canInvite && (
        <div className="glass rounded-xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Invite a new member
            </h2>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={handleInvite}
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-10 rounded-lg border-border bg-muted/30 px-3 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>

            <div className="w-full space-y-1.5 sm:w-44">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v ?? "Viewer")}>
                <SelectTrigger className="h-10 border-border bg-muted/30">
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
              type="submit"
              className="h-10 gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]"
            >
              <Send className="h-4 w-4" />
              Send invite
            </Button>
          </form>

          {inviteSuccess && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
              <Check className="h-4 w-4" />
              Invitation sent successfully!
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/*  Pending invitations                                          */}
      {/* ============================================================ */}
      {invitations.length > 0 && (
        <div className="glass rounded-xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-foreground">
              Pending invitations
            </h2>
            <Badge className="border-0 bg-amber-500/15 text-amber-400 text-[10px]">
              {invitations.length}
            </Badge>
          </div>

          <div className="space-y-2">
            {invitations.map((invite) => {
              const style = roleStyles[invite.role] ?? roleStyles.Viewer;
              const isResent = resentEmails.has(invite.email);
              return (
                <div
                  key={invite.email}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      ?
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {invite.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invited by {invite.invitedBy} &middot; {invite.invitedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge className={`border-0 ${style.bg} ${style.text}`}>
                      {invite.role}
                    </Badge>
                    {!isViewOnly && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleResend(invite.email)}
                          disabled={isResent}
                        >
                          {isResent ? (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Resent!</span>
                            </>
                          ) : (
                            <>
                              <Mail className="mr-1 h-3.5 w-3.5" />
                              Resend
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleCancelInvitation(invite.email)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Team members table                                           */}
      {/* ============================================================ */}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v ?? "all")}
        >
          <SelectTrigger className="h-9 w-40 border-border bg-muted/30">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="Owner">Owner</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Designer">Designer</SelectItem>
            <SelectItem value="Bookkeeper">Bookkeeper</SelectItem>
            <SelectItem value="Viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table - Desktop */}
      <div className="glass overflow-hidden rounded-xl hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground">
                Member
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Last active
              </TableHead>
              <TableHead className="w-10 text-right text-xs text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member) => {
              const style = roleStyles[member.role] ?? roleStyles.Viewer;
              const isDeactivated = member.status === "deactivated";
              const isMemberOwner = member.role === "Owner";

              return (
                <TableRow
                  key={member.email}
                  className={`border-border hover:bg-muted/20 ${isDeactivated ? "opacity-60" : ""}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isDeactivated
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {member.initials}
                        </div>
                        {member.status === "active" && member.lastActive === "Active now" && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0e1a] bg-emerald-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {member.name}
                        </span>
                        {member.role === "Owner" && (
                          <Crown className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${style.bg} ${style.text}`}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isDeactivated ? (
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                        <span className="text-sm text-gray-500">Deactivated</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-sm text-emerald-400">Active</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.lastActive}
                  </TableCell>
                  <TableCell className="text-right">
                    {isViewOnly ? (
                      <span className="text-xs text-muted-foreground/40">
                        &mdash;
                      </span>
                    ) : isDeactivated ? (
                      /* Deactivated member: show Reactivate */
                      canDeactivate ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                          onClick={() => openReactivate(member)}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Reactivate
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">
                          &mdash;
                        </span>
                      )
                    ) : isMemberOwner && isOwner ? (
                      /* Owner's own row: Transfer Ownership */
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                        onClick={openTransferOwnership}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Transfer Ownership
                      </Button>
                    ) : isMemberOwner ? (
                      /* Owner row seen by non-owner */
                      <span className="text-xs text-muted-foreground/40">
                        &mdash;
                      </span>
                    ) : (
                      /* Normal member dropdown */
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openChangeRole(member)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Change role
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openSendMessage(member)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send message
                          </DropdownMenuItem>
                          {canDeactivate && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-amber-400 focus:text-amber-400"
                                onClick={() => openDeactivate(member)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            </>
                          )}
                          {canRemove && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => openRemoveMember(member)}
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove member
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Team Cards - Mobile */}
      <div className="space-y-3 md:hidden">
        {filtered.map((member) => {
          const style = roleStyles[member.role] ?? roleStyles.Viewer;
          const isDeactivated = member.status === "deactivated";
          const isMemberOwner = member.role === "Owner";

          return (
            <div
              key={member.email}
              className={`glass rounded-xl border border-border p-4 ${isDeactivated ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isDeactivated
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      {member.initials}
                    </div>
                    {member.status === "active" && member.lastActive === "Active now" && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0e1a] bg-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {member.name}
                      </span>
                      {member.role === "Owner" && (
                        <Crown className="h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                    <Badge className={`border-0 ${style.bg} ${style.text} text-[10px] mt-0.5`}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
                {/* Actions */}
                {isViewOnly ? null : isDeactivated ? (
                  canDeactivate ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                      onClick={() => openReactivate(member)}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Reactivate
                    </Button>
                  ) : null
                ) : isMemberOwner && isOwner ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                    onClick={openTransferOwnership}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Transfer
                  </Button>
                ) : isMemberOwner ? null : (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openChangeRole(member)}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Change role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openSendMessage(member)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send message
                      </DropdownMenuItem>
                      {canDeactivate && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-amber-400 focus:text-amber-400"
                            onClick={() => openDeactivate(member)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </>
                      )}
                      {canRemove && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openRemoveMember(member)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove member
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-muted-foreground">{member.email}</p>
                <div className="flex items-center justify-between">
                  {isDeactivated ? (
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                      <span className="text-gray-500">Deactivated</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Active</span>
                    </div>
                  )}
                  <span className="text-muted-foreground">{member.lastActive}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/*  Change Role Dialog                                           */}
      {/* ============================================================ */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Update the role for{" "}
              <span className="font-medium text-foreground">
                {roleTarget?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {roleTarget?.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {roleTarget?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Current role:{" "}
                  <span className="font-medium">{roleTarget?.role}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                New role
              </label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v ?? "")}>
                <SelectTrigger className="h-10 border-border bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {roleSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Role updated successfully!
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              onClick={confirmChangeRole}
              disabled={roleSuccess || newRole === roleTarget?.role}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  Remove Member Dialog                                         */}
      {/* ============================================================ */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                {removeTarget?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {removeTarget?.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {removeTarget?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {removeTarget?.email}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              This will immediately revoke their access. This action cannot be
              undone.
            </p>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={confirmRemoveMember}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  Send Message Dialog                                          */}
      {/* ============================================================ */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Send message to {messageTarget?.name}
            </DialogTitle>
            <DialogDescription>
              This message will be sent to{" "}
              <span className="font-medium text-foreground">
                {messageTarget?.email}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>

            {messageSent && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Message sent!
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              onClick={confirmSendMessage}
              disabled={!messageText.trim() || messageSent}
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  Deactivate Member Dialog                                     */}
      {/* ============================================================ */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate member</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <span className="font-medium text-foreground">
                {deactivateTarget?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {deactivateTarget?.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {deactivateTarget?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deactivateTarget?.email}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-200/80">
                Deactivating {deactivateTarget?.name} will revoke their access.
                They can be reactivated later.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={confirmDeactivate}
            >
              <UserX className="mr-2 h-3.5 w-3.5" />
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  Reactivate Member Dialog                                     */}
      {/* ============================================================ */}
      <Dialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reactivate member</DialogTitle>
            <DialogDescription>
              Restore access for{" "}
              <span className="font-medium text-foreground">
                {reactivateTarget?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {reactivateTarget?.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {reactivateTarget?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reactivateTarget?.email}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              This will restore their access with their previous role and permissions.
              They will count toward your seat limit.
            </p>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={confirmReactivate}
            >
              <UserCheck className="mr-2 h-3.5 w-3.5" />
              Reactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  Transfer Ownership Dialog                                    */}
      {/* ============================================================ */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer ownership</DialogTitle>
            <DialogDescription>
              Transfer account ownership to another admin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs text-red-200/80">
                You will be demoted to Admin. This cannot be undone.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Transfer ownership to...
              </label>
              <Select value={transferTarget} onValueChange={(v) => setTransferTarget(v ?? "")}>
                <SelectTrigger className="h-10 border-border bg-muted/30">
                  <SelectValue placeholder="Select an admin" />
                </SelectTrigger>
                <SelectContent>
                  {adminMembers.map((m) => (
                    <SelectItem key={m.email} value={m.email}>
                      {m.name} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Type <span className="font-mono text-destructive">TRANSFER</span> to confirm
              </label>
              <Input
                placeholder="TRANSFER"
                value={transferConfirmText}
                onChange={(e) => setTransferConfirmText(e.target.value)}
                className="h-10 rounded-lg border-border bg-muted/30 px-3 text-sm font-mono focus-visible:border-primary focus-visible:ring-primary/30"
              />
            </div>

            {transferSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Check className="h-4 w-4" />
                Ownership transferred successfully!
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={confirmTransferOwnership}
              disabled={
                transferSuccess ||
                !transferTarget ||
                transferConfirmText !== "TRANSFER"
              }
            >
              <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
