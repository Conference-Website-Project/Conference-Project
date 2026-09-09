"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultConferenceConfig } from "@/config/conference";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [role, setRole] = useState("PARTICIPANT");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 md:py-16">
      <Card bordered accentBorder="gold" className="shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <Badge variant="gold">{defaultConferenceConfig.shortName}</Badge>
          <CardTitle className="text-2xl font-serif">Create Account</CardTitle>
          <CardDescription>
            Register as an Author, Participant Delegate, or Reviewer.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
                {errorMessage}
              </div>
            )}

            <Input
              label="Full Name & Title"
              placeholder="e.g. Dr. John H. Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="author@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Institution / University Affiliation"
              placeholder="e.g. Dept. of CS, Indian Institute of Technology"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              required
            />

            <Select
              label="Primary Conference Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "PARTICIPANT", label: "Paper Author / Participant Delegate" },
                { value: "REVIEWER", label: "Technical Reviewer" },
                { value: "ADMIN", label: "Conference Administrator" },
              ]}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="md"
              className="w-full justify-center"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-academic-blue hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
