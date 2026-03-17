"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-mesh flex min-h-screen items-center justify-center px-4">
      <Card className="glass w-full max-w-lg border-border text-center">
        <CardContent className="flex flex-col items-center gap-6 pb-10 pt-10">
          <h1 className="text-gradient text-8xl font-extrabold tracking-tighter">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
              Check the URL or navigate back to the dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link href="/dashboard">
              <Button className="glow-primary bg-primary font-semibold hover:bg-primary/90">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-border"
              onClick={() => history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
