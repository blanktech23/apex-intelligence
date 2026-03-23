"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState("Joseph Wells");
  const [email, setEmail] = useState("joseph@kiptra.io");
  const [phone, setPhone] = useState("+1 555-0123");
  const [modified, setModified] = useState(false);

  const handleChange = (
    setter: (v: string) => void,
    value: string
  ) => {
    setter(value);
    setModified(true);
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
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
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
                onClick={() => toast.success("Avatar updated successfully")}
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
                <Badge className="border-0 bg-emerald-500/15 text-emerald-400">
                  Connected
                </Badge>
              </div>

              {/* Microsoft - not connected */}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-xs"
                  onClick={() => toast.info("Connecting to Microsoft...")}
                >
                  Connect
                </Button>
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
    </div>
  );
}
