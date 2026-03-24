"use client";

import Link from "next/link";
import { AlertTriangle, Home, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ServerErrorPage() {
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

      <div className="glass relative z-10 w-full max-w-lg rounded-2xl p-8 text-center">
        {/* Error icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 ring-4 ring-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Heading */}
        <h1 className="text-gradient text-5xl font-extrabold tracking-tighter">
          500
        </h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;re working on fixing this. Please try again in a few moments.
        </p>

        {/* Error reference */}
        <div className="mx-auto mt-5 inline-flex items-center rounded-lg border border-border bg-muted/20 px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            Error reference: ERR-2026-XXXX
          </span>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)] sm:w-auto sm:px-6">
              <Home className="mr-2 h-4 w-4" />
              Go back home
            </Button>
          </Link>
          <Link href="#">
            <Button
              variant="outline"
              className="h-11 w-full rounded-lg border-border text-sm font-medium sm:w-auto sm:px-6"
            >
              <Headphones className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
