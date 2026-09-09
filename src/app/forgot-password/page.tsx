"use client";

import React, { useState } from "react";
import Link from "next/link";
import { defaultConferenceConfig } from "@/config/conference";
import { resetPasswordForEmail } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KeyRound, ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    if (!email.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your registered email address." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await resetPasswordForEmail(email.trim());
      if (res.success) {
        setStatusMessage({ type: "success", text: res.message });
      } else {
        setStatusMessage({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to send reset link. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <Card bordered accentBorder="navy" className="shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-academic-blue flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
          <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
          <CardDescription>
            Enter your registered email address to receive password reset instructions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {statusMessage && (
              <div
                className={`p-3 border text-xs rounded font-medium flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <Input
              label="Registered Email Address"
              type="email"
              placeholder="author@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={isLoading}
              rightIcon={<Mail className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <Link href="/login" className="text-xs font-semibold text-slate-700 hover:text-academic-blue flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
