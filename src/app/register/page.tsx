"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultConferenceConfig } from "@/config/conference";
import { signUpUser } from "@/lib/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [designation, setDesignation] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { setProfileState, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !institution.trim()) {
      setErrorMessage("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      setIsLoading(false);
      return;
    }

    try {
      const { profile, error } = await signUpUser({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        institution: institution.trim(),
        designation: designation.trim(),
        country: country.trim(),
        phone: phone.trim(),
      });

      if (error) {
        if (error.includes("already registered") || error.includes("User already exists")) {
          setErrorMessage("This email is already registered. Try signing in instead.");
        } else {
          setErrorMessage(error);
        }
        setIsLoading(false);
        return;
      }

      if (profile) {
        setProfileState(profile);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage("Registration failed. Please check your information and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 md:py-16">
      <Card bordered accentBorder="gold" className="shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <Badge variant="gold">{defaultConferenceConfig.shortName}</Badge>
          <CardTitle className="text-2xl font-serif">Participant Account Registration</CardTitle>
          <CardDescription>
            Register as an Author or Delegate for {defaultConferenceConfig.shortName}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name & Title"
                placeholder="e.g. Dr. Ananya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="author@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institution / University"
                placeholder="e.g. Dept. of CS, Indian Institute"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                label="Designation / Role"
                placeholder="e.g. Associate Professor"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Country"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                label="Phone Number (Optional)"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Minimum 6 characters"
                disabled={isLoading}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
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
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-academic-blue hover:underline">
              Sign In to Account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
