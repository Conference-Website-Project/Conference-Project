"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  User, 
  CreditCard, 
  Plus, 
  Upload, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function ParticipantDashboardPage() {
  const { profile, loading: authLoading, isAuthenticated, isAdmin, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "papers" | "registration" | "payments">("overview");
  const router = useRouter();

  const config = defaultConferenceConfig;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/dashboard");
      } else if (profile && !profile.onboarding_completed && profile.role !== "ADMIN") {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, profile, authLoading, router]);

  if (authLoading || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Verifying authentication session..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-academic-blue">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-academic-navy">
              Welcome, {profile.full_name}
            </h1>
            <Badge variant={profile.role === "ADMIN" ? "gold" : "navy"}>
              {profile.role}
            </Badge>
            {profile.participation_type && (
              <Badge variant="gold">
                {profile.participation_type === "AUTHOR" ? "Paper Author" : "Delegate"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Participant Portal for <span className="font-semibold text-academic-navy">{config.shortName}</span> ({config.institution})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="gold" size="sm" leftIcon={<ShieldAlert className="w-4 h-4" />}>
                Admin Portal
              </Button>
            </Link>
          )}
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
              Edit Profile
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Dashboard Overview", icon: <User className="w-4 h-4" /> },
          { id: "papers", label: "My Papers", icon: <FileText className="w-4 h-4" /> },
          { id: "registration", label: "My Registration", icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: "payments", label: "Payment Status", icon: <CreditCard className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-academic-blue text-white border-b-2 border-academic-blue"
                : "text-slate-700 hover:bg-slate-100 hover:text-academic-navy"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card bordered accentBorder="gold">
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile Summary & Status</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Registered participant details</p>
                </div>
                <Link href="/dashboard/profile">
                  <span className="text-xs text-academic-blue font-semibold hover:underline flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Full Name:</span>
                    <span className="font-semibold text-slate-800 text-sm">{profile.full_name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Email Address:</span>
                    <span className="font-semibold text-slate-800 text-sm">{profile.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Institution / Affiliation:</span>
                    <span className="font-semibold text-slate-800 text-sm">{profile.institution || "Not specified"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-slate-500 block">Designation & Country:</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {profile.designation ? `${profile.designation}, ` : ""}{profile.country}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Papers Card */}
            <Card bordered accentBorder="navy">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>My Papers</CardTitle>
                <Link href="/call-for-papers">
                  <Button variant="outline" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                    Call for Papers
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No Papers Submitted Yet"
                  description="Manuscript submission is currently active. You can upload original research papers for double-blind peer review."
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Conference Info Card */}
            <Card bordered accentBorder="navy">
              <CardHeader>
                <CardTitle>Conference Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-700">
                <div className="pb-2 border-b border-slate-100">
                  <span className="text-slate-500 block">Conference Title:</span>
                  <span className="font-serif font-semibold text-academic-navy text-sm">{config.name}</span>
                </div>
                <div className="pb-2 border-b border-slate-100">
                  <span className="text-slate-500 block">Dates:</span>
                  <span className="font-mono text-academic-blue font-bold">{config.dates.formatted}</span>
                </div>
                <div className="pb-2 border-b border-slate-100">
                  <span className="text-slate-500 block">Paper Submission Deadline:</span>
                  <span className="font-bold text-amber-800">{config.importantDates[0].date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Venue:</span>
                  <span className="text-slate-700">{config.location.venue}, {config.location.city}</span>
                </div>
              </CardContent>
            </Card>

            {/* Registration Status */}
            <Card bordered accentBorder="gold">
              <CardHeader>
                <CardTitle>My Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-amber-900">
                  <span className="font-bold block">Status: Unregistered</span>
                  <span>Select your registration category to confirm delegate attendance.</span>
                </div>
                <Link href="/registration">
                  <Button variant="gold" size="sm" className="w-full justify-center">
                    View Registration Fees
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MY PAPERS */}
      {activeTab === "papers" && (
        <Card bordered accentBorder="navy">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Manuscript Submissions</CardTitle>
            <Link href="/call-for-papers">
              <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Submit Manuscript
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Papers Submitted Yet"
              description="Your submitted papers and double-blind peer review statuses will appear here."
            />
          </CardContent>
        </Card>
      )}

      {/* TAB 3: REGISTRATION */}
      {activeTab === "registration" && (
        <Card bordered accentBorder="gold">
          <CardHeader>
            <CardTitle>Delegate Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="You Have Not Registered Yet"
              description="Complete your delegate category selection to generate invoice details."
              action={
                <Link href="/registration">
                  <Button variant="gold" size="sm">
                    Select Category & Register
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === "payments" && (
        <Card bordered accentBorder="crimson">
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Payments Yet"
              description="Once registration fees are paid via Razorpay, transaction receipts will be logged here."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
