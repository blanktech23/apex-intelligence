"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 20;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  if (score <= 25) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 50) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 75) return { score, label: "Good", color: "bg-blue-500" };
  return { score: Math.min(score, 100), label: "Strong", color: "bg-emerald-500" };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit =
    password.length >= 8 && passwordsMatch && strength.score >= 50;

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1000);
    }
  }

  return (
    <div className="bg-mesh flex min-h-screen items-center justify-center px-4">
      <Card className="glass w-full max-w-md border-border">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-gradient text-2xl font-bold tracking-tight">
            Kiptra AI
          </h1>
          {!submitted && (
            <p className="text-sm text-muted-foreground">
              Create a new password for your account
            </p>
          )}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Password updated
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your password has been reset successfully. You can now sign in
                  with your new password.
                </p>
              </div>
              <Link href="/login" className="w-full">
                <Button className="glow-primary mt-2 w-full bg-primary font-semibold hover:bg-primary/90">
                  Continue to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-border bg-muted/50 pl-10 pr-10 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Strength
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          strength.score <= 25
                            ? "text-red-600 dark:text-red-400"
                            : strength.score <= 50
                              ? "text-amber-600 dark:text-amber-400"
                              : strength.score <= 75
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <Progress
                      value={strength.score}
                      className="h-1.5 [&_[data-slot=progress-track]]:bg-muted [&_[data-slot=progress-indicator]]:transition-all"
                    >
                      <style>{`[data-slot="progress-indicator"] { background: ${
                        strength.score <= 25 ? "#ef4444" : strength.score <= 50 ? "#f59e0b" : strength.score <= 75 ? "#3b82f6" : "#22c55e"
                      } !important; }`}</style>
                    </Progress>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-border bg-muted/50 pl-10 pr-10 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Passwords match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="glow-primary w-full bg-primary font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
