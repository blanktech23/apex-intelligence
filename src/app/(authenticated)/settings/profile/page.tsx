"use client";

import { useState } from "react";
import { Camera, Upload, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("Joseph Wells");
  const [email, setEmail] = useState("joseph@kiptra.io");
  const [phone, setPhone] = useState("+1 555-0123");
  const [modified, setModified] = useState(false);

  // Avatar dialog state
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarUpdated, setAvatarUpdated] = useState(false);

  // Microsoft connect dialog state
  const [showMicrosoftDialog, setShowMicrosoftDialog] = useState(false);
  const [msStep, setMsStep] = useState<1 | 2 | 3>(1);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);

  const handleChange = (
    setter: (v: string) => void,
    value: string
  ) => {
    setter(value);
    setModified(true);
  };

  const handleAvatarUpload = () => {
    toast.success("Avatar updated successfully");
    setAvatarUpdated(true);
    setShowAvatarDialog(false);
  };

  const handleMicrosoftConnect = () => {
    setMsStep(2);
    setTimeout(() => {
      setMsStep(3);
    }, 1500);
  };

  const handleMicrosoftDone = () => {
    setMicrosoftConnected(true);
    setShowMicrosoftDialog(false);
    toast.success("Microsoft 365 connected");
    setMsStep(1);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Profile</h1>

      {/* Profile form card */}
      <div className="glass rounded-xl p-6">
        <form
          className="space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Avatar section */}
          <div className="flex items-center gap-5">
            <div className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary ${avatarUpdated ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
              JW
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-white/10">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Profile photo
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-border text-xs"
                onClick={() => setShowAvatarDialog(true)}
              >
                Change avatar
              </Button>
            </div>
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-foreground"
            >
              Full name
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => handleChange(setFullName, e.target.value)}
              className="h-10 rounded-lg border-border bg-muted/30 px-3 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleChange(setEmail, e.target.value)}
              className="h-10 rounded-lg border-border bg-muted/30 px-3 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-foreground"
            >
              Phone number
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => handleChange(setPhone, e.target.value)}
              className="h-10 rounded-lg border-border bg-muted/30 px-3 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
            />
          </div>

          {/* Connected accounts */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-medium text-foreground">
              Connected accounts
            </h3>
            <div className="space-y-2">
              {/* Google - connected */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm text-foreground">Google</span>
                </div>
                <Badge className="border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Connected
                </Badge>
              </div>

              {/* Microsoft - connect flow */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M0 0h11v11H0z" />
                    <path fill="#81bc06" d="M12 0h11v11H12z" />
                    <path fill="#05a6f0" d="M0 12h11v11H0z" />
                    <path fill="#ffba08" d="M12 12h11v11H12z" />
                  </svg>
                  <span className="text-sm text-foreground">Microsoft</span>
                </div>
                {microsoftConnected ? (
                  <Badge className="border-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Connected
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-xs"
                    onClick={() => { setMsStep(1); setShowMicrosoftDialog(true); }}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={!modified}
              className="h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)] disabled:opacity-40"
              onClick={() => { setModified(false); toast.success("Profile changes saved successfully"); }}
            >
              Save changes
            </Button>
          </div>
        </form>
      </div>

      {/* ============================================================ */}
      {/*  Avatar Upload Dialog                                         */}
      {/* ============================================================ */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
            <DialogDescription>
              Choose a new profile photo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current avatar preview */}
            <div className="flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary">
                JW
              </div>
            </div>

            {/* Drop zone */}
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-8 transition-colors hover:border-primary/40 hover:bg-muted/30 cursor-pointer"
              onClick={handleAvatarUpload}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, or GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  Microsoft Connect Dialog                                     */}
      {/* ============================================================ */}
      <Dialog open={showMicrosoftDialog} onOpenChange={(open) => { if (!open && msStep !== 2) { setShowMicrosoftDialog(false); setMsStep(1); } }}>
        <DialogContent className="sm:max-w-sm">
          {msStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>Connect Microsoft 365</DialogTitle>
                <DialogDescription>
                  Link your Microsoft 365 account to sync calendars, emails, and files.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <svg className="h-12 w-12" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#81bc06" d="M12 0h11v11H12z" />
                  <path fill="#05a6f0" d="M0 12h11v11H0z" />
                  <path fill="#ffba08" d="M12 12h11v11H12z" />
                </svg>
                <Button
                  className="w-full gap-2 bg-[#0078d4] text-white hover:bg-[#106ebe]"
                  onClick={handleMicrosoftConnect}
                >
                  <svg className="h-4 w-4" viewBox="0 0 23 23">
                    <path fill="#fff" d="M0 0h11v11H0z" opacity="0.8" />
                    <path fill="#fff" d="M12 0h11v11H12z" opacity="0.6" />
                    <path fill="#fff" d="M0 12h11v11H0z" opacity="0.6" />
                    <path fill="#fff" d="M12 12h11v11H12z" opacity="0.4" />
                  </svg>
                  Sign in with Microsoft
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMicrosoftDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}

          {msStep === 2 && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Connecting to Microsoft 365...
              </p>
            </div>
          )}

          {msStep === 3 && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Connected!
                </DialogTitle>
                <DialogDescription>
                  Your Microsoft 365 account has been successfully linked.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-sm text-foreground font-medium">joseph@kiptra.io</p>
                <p className="text-xs text-muted-foreground mt-1">Microsoft 365 Business</p>
              </div>
              <DialogFooter>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleMicrosoftDone}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
