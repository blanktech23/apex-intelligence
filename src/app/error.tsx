"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-mesh flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. You can try again or return to the
            dashboard.
          </p>
        </div>

        <Card className="glass w-full border-border">
          <CardContent className="py-4">
            <p className="break-all font-mono text-sm text-red-400/80">
              {error.message || "An unknown error occurred"}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="glow-primary bg-primary font-semibold hover:bg-primary/90"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="border-border">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
