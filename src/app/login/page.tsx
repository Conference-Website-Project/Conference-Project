"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultConferenceConfig } from "@/config/conference";
import { signInUser } from "@/lib/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setProfileState, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    const redirectReason = searchParams.get("reason");
    if (redirectReason === "registered") {
      setSuccessMessage("Account created successfully! Please sign in with your credentials.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      setIsLoading(false);
      return;
    }

    try {
      const { profile, error } = await signInUser(email.trim(), password);

      if (error) {
        setErrorMessage(error);
        setIsLoading(false);
        return;
      }

      if (profile) {
        setProfileState(profile);
        if (profile.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMessage("Unable to sign in. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card bordered accentBorder="navy" className="shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-academic-blue flex items-center justify-center mx-auto mb-2">
          <Lock className="w-6 h-6" />
        </div>
        <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
        <CardTitle className="text-2xl font-serif">Sign In to Account</CardTitle>
        <CardDescription>
          Access your author dashboard, paper submissions, or admin portal.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="author@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <div className="flex justify-between items-center text-xs">
            <span />
            <Link href="/forgot-password" className="text-academic-blue hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col space-y-3 text-center border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-academic-blue hover:underline">
            Register as Participant
          </Link>
        </p>
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 w-full text-center space-y-1">
          <p className="font-semibold text-slate-700">Testing Credentials:</p>
          <p>Admin: <span className="font-mono font-bold text-slate-800">admin@college.edu</span></p>
          <p>Participant: <span className="font-mono font-bold text-slate-800">author@university.edu</span></p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <Suspense fallback={<LoadingState message="Loading login portal..." />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
