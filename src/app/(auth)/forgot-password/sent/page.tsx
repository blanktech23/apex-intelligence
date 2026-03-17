"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordSentPage() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = useCallback(() => {
    setCountdown(60);
    setCanResend(false);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background bg-mesh px-4">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Mesh overlay orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="glass glow-primary relative z-10 w-full max-w-md rounded-2xl p-8 text-center">
        {/* Mail icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-foreground">j***@example.com</span>
        </p>

        {/* Resend button */}
        <div className="mt-8">
          <Button
            onClick={handleResend}
            disabled={!canResend}
            className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)] disabled:opacity-50"
          >
            {canResend
              ? "Resend email"
              : `Resend email (${countdown}s)`}
          </Button>
        </div>

        {/* Back to login */}
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
