"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { completeOnboardingProfile } from "@/lib/auth";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  User, 
  Building2, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  Users
} from "lucide-react";
import { ParticipationType } from "@/types/database";

export default function OnboardingPage() {
  const { profile, user, loading: authLoading, isAuthenticated, setProfileState } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [designation, setDesignation] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [participationType, setParticipationType] = useState<ParticipationType>("AUTHOR");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/onboarding");
      } else if (profile?.onboarding_completed || profile?.role === "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, profile, router]);

  useEffect(() => {
    if (profile) {
      if (profile.full_name && profile.full_name !== "Participant User") {
        setFullName(profile.full_name);
      } else if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
        setFullName(user.user_metadata.full_name || user.user_metadata.name);
      }
      if (profile.institution) setInstitution(profile.institution);
      if (profile.designation) setDesignation(profile.designation);
      if (profile.country) setCountry(profile.country);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile, user]);

  if (authLoading || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <LoadingState message="Initializing onboarding portal..." />
      </div>
    );
  }

  const stepsList = [
    { num: 1, label: "Personal" },
    { num: 2, label: "Institution" },
    { num: 3, label: "Contact" },
    { num: 4, label: "Participation" },
    { num: 5, label: "Complete" },
  ];

  const handleNextStep = () => {
    setErrorMessage("");

    if (currentStep === 1) {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name and title.");
        return;
      }
    } else if (currentStep === 2) {
      if (!institution.trim()) {
        setErrorMessage("Please enter your university or institution name.");
        return;
      }
    } else if (currentStep === 3) {
      if (!country.trim()) {
        setErrorMessage("Please select or type your country.");
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    if (!fullName.trim() || !institution.trim() || !country.trim()) {
      setErrorMessage("Please make sure all required fields are filled out.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { profile: updatedProfile, error } = await completeOnboardingProfile(profile.id, {
        fullName: fullName.trim(),
        institution: institution.trim(),
        designation: designation.trim(),
        country: country.trim(),
        phone: phone.trim(),
        participationType,
      });

      if (error) {
        setErrorMessage(error);
        setIsSubmitting(false);
        return;
      }

      if (updatedProfile) {
        setProfileState(updatedProfile);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage("Failed to complete profile onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 space-y-8">
      {/* Onboarding Header */}
      <div className="text-center space-y-2">
        <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-academic-navy tracking-tight">
          Participant Registration Onboarding
        </h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Complete your profile details to finalize registration for {defaultConferenceConfig.name}.
        </p>
      </div>

      {/* Progress Step Bar */}
      <div className="bg-white p-4 rounded-md border border-slate-200 shadow-subtle space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          <span className="text-academic-blue font-mono font-bold">STEP {currentStep} OF 5</span>
          <span className="text-slate-500">{stepsList[currentStep - 1].label} Step</span>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-academic-blue h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Step Labels Strip */}
        <div className="grid grid-cols-5 text-[11px] text-center pt-1 text-slate-500">
          {stepsList.map((step) => (
            <span
              key={step.num}
              className={`${
                currentStep === step.num
                  ? "text-academic-blue font-bold border-b-2 border-academic-blue pb-0.5"
                  : currentStep > step.num
                  ? "text-slate-800 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Wizard Card */}
      <Card bordered accentBorder="gold" className="shadow-lg">
        <CardContent className="pt-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Tell us about yourself</h3>
                <p className="text-xs text-slate-500">
                  Please verify your full name and title for conference certificates and badge printing.
                </p>
              </div>

              <Input
                label="Full Name & Title"
                placeholder="e.g. Dr. Ananya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                helperText="Pre-filled from Google account if available. You may edit this."
                required
              />

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <span className="text-slate-500 block">Account Email Address (Verified)</span>
                <span className="font-mono font-bold text-slate-800">{profile.email}</span>
              </div>
            </div>
          )}

          {/* STEP 2: PROFESSIONAL INFORMATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Your professional details</h3>
                <p className="text-xs text-slate-500">
                  Enter your academic institution or corporate organization affiliation.
                </p>
              </div>

              <Input
                label="Institution / University Name"
                placeholder="e.g. Indian Institute of Technology New Delhi"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />

              <Input
                label="Designation / Role"
                placeholder="e.g. Associate Professor / Senior Research Fellow"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                helperText="Optional field"
              />
            </div>
          )}

          {/* STEP 3: LOCATION & CONTACT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">Where can we reach you?</h3>
                <p className="text-xs text-slate-500">
                  Contact coordinates for secretariat communication and travel assistance.
                </p>
              </div>

              <Input
                label="Country / Region"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helperText="Optional field for SMS notifications"
              />
            </div>
          )}

          {/* STEP 4: PARTICIPATION TYPE */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-serif font-bold text-academic-navy">How are you participating?</h3>
                <p className="text-xs text-slate-500">
                  Select your primary mode of attendance for {defaultConferenceConfig.shortName}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div
                  onClick={() => setParticipationType("AUTHOR")}
                  className={`p-5 rounded-md border-2 cursor-pointer transition-all ${
                    participationType === "AUTHOR"
                      ? "border-academic-blue bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 text-academic-blue rounded">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    {participationType === "AUTHOR" && (
                      <CheckCircle2 className="w-5 h-5 text-academic-blue" />
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-academic-navy text-sm">Paper Author</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    I am submitting or presenting a research paper manuscript.
                  </p>
                </div>

                <div
                  onClick={() => setParticipationType("DELEGATE")}
                  className={`p-5 rounded-md border-2 cursor-pointer transition-all ${
                    participationType === "DELEGATE"
                      ? "border-academic-gold bg-amber-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded">
                      <Users className="w-5 h-5" />
                    </div>
                    {participationType === "DELEGATE" && (
                      <CheckCircle2 className="w-5 h-5 text-amber-800" />
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-academic-navy text-sm">Conference Delegate</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    I am attending the conference as a participant / listener.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLETION & SUMMARY */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif font-bold text-academic-navy">You're all set!</h3>
                <p className="text-xs text-slate-500">
                  Review your summary below before finalizing profile onboarding.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-semibold text-slate-800">{fullName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Account Email:</span>
                  <span className="font-mono text-slate-800">{profile.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-semibold text-slate-800">{institution}</span>
                </div>
                {designation && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Designation:</span>
                    <span className="text-slate-800">{designation}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Country:</span>
                  <span className="text-slate-800">{country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Participation Category:</span>
                  <Badge variant={participationType === "AUTHOR" ? "navy" : "gold"}>
                    {participationType === "AUTHOR" ? "Paper Author" : "Delegate"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back
            </Button>
          ) : (
            <span />
          )}

          {currentStep < 5 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="gold"
              size="md"
              onClick={handleCompleteOnboarding}
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
