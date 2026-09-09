"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultConferenceConfig } from "@/config/conference";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Lock, Mail, ArrowRight, UserCheck, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Simulate Auth validation flow
    setTimeout(() => {
      setIsLoading(false);
      if (!email || !password) {
        setErrorMessage("Please enter both email and password.");
        return;
      }

      // Check role routing simulation
      if (email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <Card bordered accentBorder="navy" className="shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-academic-blue flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
          <CardTitle className="text-2xl font-serif">Portal Login</CardTitle>
          <CardDescription>
            Access your paper submissions, author dashboard, or admin console.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
                {errorMessage}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="author@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center space-x-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-academic-blue" />
                <span>Remember session</span>
              </label>
              <a href="#forgot" className="text-academic-blue hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col space-y-3 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-600">
            Don't have an author or participant account?{" "}
            <Link href="/register" className="font-semibold text-academic-blue hover:underline">
              Create Account
            </Link>
          </p>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 w-full text-center">
            Tip: Use <span className="font-mono text-slate-700 font-semibold">admin@college.edu</span> to preview Admin Portal.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
