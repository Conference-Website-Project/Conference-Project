"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { defaultConferenceConfig } from "@/config/conference";
import { signUpUser, signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, ArrowRight, AlertCircle } from "lucide-react";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [designation, setDesignation] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { setProfileState, isAuthenticated, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      if (!profile.onboarding_completed && profile.role !== "ADMIN") {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, profile, authLoading, router]);

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMessage(error);
      setIsGoogleLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
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
      const { profile: userProfile, error } = await signUpUser({
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

      if (userProfile) {
        setProfileState(userProfile);
        router.push("/onboarding");
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
          <CardTitle className="text-2xl font-serif">Create Your Participant Account</CardTitle>
          <CardDescription>
            Register to present papers or attend {defaultConferenceConfig.shortName}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PRIMARY CTA: CONTINUE WITH GOOGLE */}
          <Button
            variant="gold"
            size="lg"
            onClick={handleGoogleRegister}
            isLoading={isGoogleLoading}
            className="w-full justify-center shadow-xs"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </Button>

          {/* OR DIVIDER */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
              or email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {!showEmailForm ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowEmailForm(true)}
              className="w-full justify-center"
            >
              Continue with Email & Password
            </Button>
          ) : (
            <form onSubmit={handleEmailRegister} className="space-y-4 pt-2">
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
                  placeholder="e.g. Dept. of CS, IIT New Delhi"
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
                  label="Phone Number"
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
                variant="primary"
                size="md"
                className="w-full justify-center"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account with Email
              </Button>
            </form>
          )}
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
