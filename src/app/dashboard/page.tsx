"use client";

import React, { useState } from "react";
import Link from "next/link";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  FileText, 
  User, 
  CreditCard, 
  Plus, 
  Upload, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";

export default function ParticipantDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "papers" | "registration" | "payments" | "profile">("overview");
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-academic-blue">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-academic-navy">Author & Delegate Portal</h1>
            <Badge variant="navy">Participant</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Managing active submissions & delegate status for <span className="font-semibold text-academic-navy">{config.shortName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/call-for-papers">
            <Button variant="gold" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Submit New Paper
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" leftIcon={<LogOut className="w-3.5 h-3.5" />}>
              Sign Out
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Overview", icon: <User className="w-4 h-4" /> },
          { id: "papers", label: "My Papers (0)", icon: <FileText className="w-4 h-4" /> },
          { id: "registration", label: "My Registration", icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: "payments", label: "Payment History", icon: <CreditCard className="w-4 h-4" /> },
          { id: "profile", label: "Profile Settings", icon: <ShieldCheck className="w-4 h-4" /> },
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

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: OVERVIEW / WELCOME */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card bordered accentBorder="gold">
              <CardHeader>
                <CardTitle>Welcome to {config.shortName} Portal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <p>
                  You are logged into the conference management platform for <span className="font-bold text-academic-navy">{config.name}</span>.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <h4 className="font-semibold text-slate-800 text-sm">Author Submission Checklist:</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Submission Deadline: <strong className="text-academic-blue">{config.importantDates[0].date}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Double-Blind PDF format required (Max 6 pages)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card bordered accentBorder="navy">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>My Submissions Status</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("papers")}>View All</Button>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No Papers Submitted Yet"
                  description="You have not uploaded any paper manuscripts for double-blind peer review."
                  action={
                    <Link href="/call-for-papers">
                      <Button variant="primary" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                        Submit Paper Manuscript
                      </Button>
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card bordered accentBorder="navy">
              <CardHeader>
                <CardTitle>Delegate Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Account Type:</span>
                  <Badge variant="navy">Author / Delegate</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Registration Paid:</span>
                  <Badge variant="crimson">Unpaid</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500">Conference City:</span>
                  <span className="font-semibold text-slate-800">{config.location.city}</span>
                </div>
                <div className="pt-2">
                  <Link href="/registration">
                    <Button variant="gold" size="sm" className="w-full justify-center">
                      Complete Registration Payment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MY PAPERS */}
      {activeTab === "papers" && (
        <Card bordered accentBorder="navy">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Submitted Manuscripts</CardTitle>
            <Link href="/call-for-papers">
              <Button variant="gold" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Submit Manuscript
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Active Paper Submissions"
              description="Click 'Submit Manuscript' to enter your research title, abstract, track choice, and PDF file."
            />
          </CardContent>
        </Card>
      )}

      {/* TAB 3: REGISTRATION */}
      {activeTab === "registration" && (
        <Card bordered accentBorder="gold">
          <CardHeader>
            <CardTitle>Delegate Registration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Active Registration Selected"
              description="Choose your delegate registration category (Student, Faculty, or Industry) to generate invoice details."
              action={
                <Link href="/registration">
                  <Button variant="gold" size="sm">
                    Select Registration Category
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
            <CardTitle>Payment History & Transaction Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Transaction Logs Found"
              description="Payment receipts and Razorpay transaction IDs will be logged here upon completing delegate registration."
            />
          </CardContent>
        </Card>
      )}

      {/* TAB 5: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <Card bordered accentBorder="navy">
          <CardHeader>
            <CardTitle>Author Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="max-w-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">Full Name:</span>
                <span className="font-semibold text-slate-800 text-sm">Demo Participant Delegate</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">Email Address:</span>
                <span className="font-semibold text-slate-800 text-sm">author@university.edu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
