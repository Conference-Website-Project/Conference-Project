"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateUserProfile } from "@/lib/auth";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  User, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Globe 
} from "lucide-react";

export default function ProfilePage() {
  const { profile, user, loading: authLoading, isAuthenticated, setProfileState } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [designation, setDesignation] = useState("");
  const [country, setCountry] = useState("India");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard/profile");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setInstitution(profile.institution || "");
      setDesignation(profile.designation || "");
      setCountry(profile.country || "India");
    }
  }, [profile]);

  if (authLoading || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState message="Loading profile information..." />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    if (!fullName.trim() || !institution.trim()) {
      setFeedback({ type: "error", text: "Full Name and Institution cannot be empty." });
      setIsSaving(false);
      return;
    }

    try {
      const { profile: updatedProfile, error } = await updateUserProfile(profile.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        designation: designation.trim(),
        country: country.trim(),
      });

      if (error) {
        setFeedback({ type: "error", text: error });
      } else if (updatedProfile) {
        setProfileState(updatedProfile);
        setFeedback({ type: "success", text: "Profile information updated successfully!" });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-academic-blue inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-academic-navy">My Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal details, academic affiliation, and conference contact info.
          </p>
        </div>

        <Badge variant={profile.role === "ADMIN" ? "gold" : "navy"}>
          Role: {profile.role}
        </Badge>
      </div>

      {/* Main Profile Form Card */}
      <Card bordered accentBorder="navy" className="shadow-subtle">
        <CardHeader>
          <CardTitle>Personal & Institutional Details</CardTitle>
          <CardDescription>
            Updates will be reflected on your official conference registration receipts and paper metadata.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {feedback && (
              <div
                className={`p-3.5 border text-xs rounded font-medium flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Read-Only Account Row */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                  Account Email (Read-Only)
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">{profile.email}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Associated with Supabase Authentication</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
                  System User ID
                </span>
                <span className="font-mono text-slate-700 text-xs truncate block">{profile.id}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name & Academic Title"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                required
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="University / Institution Affiliation"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Dept. of Computer Science, National Institute"
                disabled={isSaving}
                required
              />
              <Input
                label="Designation / Position"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor / Senior Research Fellow"
                disabled={isSaving}
              />
            </div>

            <Input
              label="Country / Region"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India"
              disabled={isSaving}
              required
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
