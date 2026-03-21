"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Monitor,
  Laptop,
  Key,
  Copy,
  Trash2,
  Plus,
  QrCode,
  Globe,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  Password strength helper                                          */
/* ------------------------------------------------------------------ */

const strengthSegments = [
  { min: 0, color: "bg-red-500", label: "Weak", textColor: "text-red-400" },
  { min: 4, color: "bg-amber-500", label: "Fair", textColor: "text-amber-400" },
  { min: 8, color: "bg-emerald-500", label: "Strong", textColor: "text-emerald-400" },
  { min: 12, color: "bg-cyan-400", label: "Very strong", textColor: "text-cyan-400" },
];

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 4;
  if (password.length >= 12) score += 2;
  if (/[A-Z]/.test(password)) score += 2;
  if (/[0-9]/.test(password)) score += 2;
  if (/[^A-Za-z0-9]/.test(password)) score += 4;
  return score;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const sessions = [
  {
    device: "MacBook Pro",
    icon: Laptop,
    browser: "Chrome 121",
    ip: "192.168.1.42",
    lastActive: "Active now",
    location: "San Francisco, CA",
    current: true,
  },
  {
    device: "iPhone 15 Pro",
    icon: Smartphone,
    browser: "Safari Mobile",
    ip: "10.0.0.15",
    lastActive: "2 hours ago",
    location: "San Francisco, CA",
    current: false,
  },
  {
    device: "Windows Desktop",
    icon: Monitor,
    browser: "Edge 121",
    ip: "172.16.0.8",
    lastActive: "3 days ago",
    location: "New York, NY",
    current: false,
  },
];

const loginHistory = [
  { ip: "192.168.1.42", device: "MacBook Pro - Chrome 121", timestamp: "Mar 16, 2026 at 9:42 AM", status: "success" as const },
  { ip: "10.0.0.15", device: "iPhone 15 Pro - Safari", timestamp: "Mar 16, 2026 at 7:15 AM", status: "success" as const },
  { ip: "203.0.113.50", device: "Unknown - Firefox 120", timestamp: "Mar 15, 2026 at 11:32 PM", status: "blocked" as const },
  { ip: "172.16.0.8", device: "Windows Desktop - Edge 121", timestamp: "Mar 13, 2026 at 3:18 PM", status: "success" as const },
  { ip: "192.168.1.42", device: "MacBook Pro - Chrome 121", timestamp: "Mar 13, 2026 at 8:04 AM", status: "success" as const },
  { ip: "10.0.0.15", device: "iPhone 15 Pro - Safari", timestamp: "Mar 12, 2026 at 6:50 PM", status: "success" as const },
  { ip: "198.51.100.22", device: "Unknown - Chrome 120", timestamp: "Mar 11, 2026 at 2:14 AM", status: "blocked" as const },
  { ip: "172.16.0.8", device: "Windows Desktop - Edge 121", timestamp: "Mar 10, 2026 at 10:27 AM", status: "success" as const },
  { ip: "192.168.1.42", device: "MacBook Pro - Chrome 121", timestamp: "Mar 9, 2026 at 9:01 AM", status: "success" as const },
  { ip: "10.0.0.15", device: "iPhone 15 Pro - Safari", timestamp: "Mar 8, 2026 at 4:33 PM", status: "success" as const },
];

const apiKeys = [
  { id: "ak_1", name: "Production API Key", key: "ak_live_...x8Fk", created: "Jan 10, 2026", lastUsed: "2 minutes ago" },
  { id: "ak_2", name: "Staging API Key", key: "ak_test_...m3Qr", created: "Feb 5, 2026", lastUsed: "1 day ago" },
  { id: "ak_3", name: "CI/CD Pipeline", key: "ak_live_...pW2n", created: "Mar 1, 2026", lastUsed: "6 hours ago" },
  { id: "ak_4", name: "Webhook Endpoint", key: "ak_live_...j9Tz", created: "Mar 12, 2026", lastUsed: "Never" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SecuritySettingsPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const strength = getPasswordStrength(newPassword);
  const activeSegment = strengthSegments.reduce(
    (acc, seg) => (strength >= seg.min ? seg : acc),
    strengthSegments[0]
  );
  const filledSegments =
    strength === 0 ? 0 : strength >= 12 ? 4 : strength >= 8 ? 3 : strength >= 4 ? 2 : 1;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Security</h1>

      {/* ============================================================ */}
      {/*  Password change form                                        */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Change password
          </h2>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Current password
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                className="h-10 rounded-lg border-border bg-muted/30 px-3 pr-10 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              New password
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 rounded-lg border-border bg-muted/30 px-3 pr-10 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Strength meter */}
            {newPassword && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < filledSegments ? activeSegment.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength:{" "}
                  <span className={activeSegment.textColor}>
                    {activeSegment.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Confirm new password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="h-10 rounded-lg border-border bg-muted/30 px-3 pr-10 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              className="h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]"
              onClick={() => toast.success("Password updated successfully")}
            >
              Change password
            </Button>
          </div>
        </form>
      </div>

      {/* ============================================================ */}
      {/*  Two-factor authentication                                    */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  Two-factor authentication
                </h2>
                <Badge
                  className={
                    mfaEnabled
                      ? "border-0 bg-emerald-500/15 text-emerald-400"
                      : "border-0 bg-muted text-muted-foreground"
                  }
                >
                  {mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            onClick={() => setMfaEnabled(!mfaEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              mfaEnabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                mfaEnabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {mfaEnabled && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            {/* QR Code placeholder */}
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/30">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="h-10 w-10" />
                  <span className="text-[10px]">Scan with app</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password) to set up two-factor authentication.
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="rounded-md border border-border bg-muted/30 px-3 py-1.5 font-mono text-xs text-foreground">
                      APEX-4K7M-R2QN-X8FJ-LP3W
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => { navigator.clipboard.writeText("APEX-4K7M-R2QN-X8FJ-LP3W"); toast.success("Code copied to clipboard"); }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                8 recovery codes remaining
              </p>
              <button
                type="button"
                onClick={() => toast.success("Recovery codes regenerated")}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Regenerate recovery codes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  Active sessions                                              */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Active sessions
          </h2>
          <button
            type="button"
            onClick={() => toast.success("All other sessions revoked")}
            className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            Revoke all other sessions
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">Device</TableHead>
                <TableHead className="text-xs text-muted-foreground">Location</TableHead>
                <TableHead className="text-xs text-muted-foreground">Last active</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const Icon = session.icon;
                return (
                  <TableRow
                    key={session.device}
                    className="border-border hover:bg-muted/20"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {session.device}
                            </span>
                            {session.current && (
                              <Badge className="border-0 bg-primary/15 text-primary text-[10px]">
                                This device
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {session.browser} &middot; {session.ip}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        {session.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {session.lastActive}
                    </TableCell>
                    <TableCell className="text-right">
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => toast.success("Session revoked")}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {sessions.map((session) => {
            const Icon = session.icon;
            return (
              <div
                key={session.device}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {session.device}
                  </span>
                  {session.current && (
                    <Badge className="border-0 bg-primary/15 text-primary text-[10px]">
                      This device
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.browser} &middot; {session.ip}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {session.location}
                  </div>
                  <span>{session.lastActive}</span>
                </div>
                {!session.current && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => toast.success("Session revoked")}
                    >
                      Revoke
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Login history                                                */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Login history
          </h2>
          <Badge className="border-0 bg-muted text-muted-foreground text-[10px]">
            Last 10
          </Badge>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">IP Address</TableHead>
                <TableHead className="text-xs text-muted-foreground">Device</TableHead>
                <TableHead className="text-xs text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginHistory.map((entry, i) => (
                <TableRow
                  key={`${entry.ip}-${i}`}
                  className="border-border hover:bg-muted/20"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {entry.ip}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.device}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.timestamp}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        entry.status === "success"
                          ? "border-0 bg-emerald-500/15 text-emerald-400"
                          : "border-0 bg-red-500/15 text-red-400"
                      }
                    >
                      {entry.status === "success" ? "Success" : "Blocked"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {loginHistory.map((entry, i) => (
            <div
              key={`${entry.ip}-${i}`}
              className="rounded-lg border border-border p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{entry.device}</span>
                <Badge
                  className={
                    entry.status === "success"
                      ? "border-0 bg-emerald-500/15 text-emerald-400"
                      : "border-0 bg-red-500/15 text-red-400"
                  }
                >
                  {entry.status === "success" ? "Success" : "Blocked"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{entry.ip}</span>
                <span>{entry.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  API Keys                                                     */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              API Keys
            </h2>
          </div>
          <Button className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]" onClick={() => toast.success("New API key generated")}>
            <Plus className="h-3.5 w-3.5" />
            Generate new key
          </Button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs text-muted-foreground">Key</TableHead>
                <TableHead className="text-xs text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs text-muted-foreground">Last used</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow
                  key={apiKey.id}
                  className="border-border hover:bg-muted/20"
                >
                  <TableCell className="text-sm font-medium text-foreground">
                    {apiKey.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                        {apiKey.key}
                      </code>
                      <button className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => toast.success("API key copied to clipboard")}>
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apiKey.created}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apiKey.lastUsed}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => toast.success("API key revoked")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="rounded-lg border border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {apiKey.name}
                </span>
                <Badge className="border-0 bg-primary/15 text-primary text-[10px]">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {apiKey.key}
                </code>
                <button className="text-muted-foreground transition-colors hover:text-foreground" onClick={() => toast.success("API key copied to clipboard")}>
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Created: {apiKey.created}</span>
                <span>Last used: {apiKey.lastUsed}</span>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => toast.success("API key revoked")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground/60">
          API keys grant full access to your account. Keep them secret and rotate them regularly.
        </p>
      </div>
    </div>
  );
}
