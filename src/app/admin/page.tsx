"use client";

import React, { useState } from "react";
import Link from "next/link";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  CheckCircle2, 
  CreditCard, 
  Mic, 
  Award, 
  Megaphone, 
  Calendar, 
  ShieldAlert, 
  LogOut, 
  Building2 
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "conference" | "participants" | "papers" | "registrations" | "payments" | "speakers" | "committee" | "announcements" | "settings"
  >("dashboard");

  const config = defaultConferenceConfig;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "conference", label: "Conference Setup", icon: <Building2 className="w-4 h-4" /> },
    { id: "participants", label: "Participants", icon: <Users className="w-4 h-4" /> },
    { id: "papers", label: "Paper Submissions", icon: <FileText className="w-4 h-4" /> },
    { id: "registrations", label: "Registrations", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { id: "speakers", label: "Keynote Speakers", icon: <Mic className="w-4 h-4" /> },
    { id: "committee", label: "Committee", icon: <Award className="w-4 h-4" /> },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-academic-gold shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-amber-500 text-slate-900 rounded font-serif font-bold text-xs">
            ADMIN
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white">{config.shortName} Admin Console</h1>
            <p className="text-[11px] text-slate-400">Multi-Year Conference Platform Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="gold">Edition {config.year}</Badge>
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
              View Public Website
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" leftIcon={<LogOut className="w-3.5 h-3.5" />}>
              Exit Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Admin Sidebar + Content Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-800 text-slate-300 p-4 shrink-0 border-r border-slate-700 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 py-1 mb-2">
            Navigation Menu
          </div>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                activeTab === item.id
                  ? "bg-academic-blue text-white font-bold"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* TAB 1: DASHBOARD STATS */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-serif font-bold text-academic-navy">Executive Overview</h2>
                <p className="text-xs text-slate-600">Platform statistics for active conference {config.shortName}.</p>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card bordered accentBorder="navy">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Participants</span>
                    <CardTitle className="text-3xl font-bold font-serif text-academic-navy mt-1">0</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">Registered Accounts</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="gold">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paper Submissions</span>
                    <CardTitle className="text-3xl font-bold font-serif text-amber-800 mt-1">0</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">Manuscripts Uploaded</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="navy">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Registrations</span>
                    <CardTitle className="text-3xl font-bold font-serif text-academic-blue mt-1">0</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">Completed Profiles</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="crimson">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Successful Payments</span>
                    <CardTitle className="text-3xl font-bold font-serif text-academic-accent mt-1">₹ 0</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">Revenue Logged</span>
                  </CardContent>
                </Card>
              </div>

              {/* Conference Info Card */}
              <Card bordered accentBorder="navy">
                <CardHeader>
                  <CardTitle>Active Conference Metadata ({config.shortName})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Conference ID:</span>
                      <span className="font-mono font-bold text-slate-800">{config.id}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Host Institution:</span>
                      <span className="font-semibold text-slate-800">{config.institution}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Submission Deadline:</span>
                      <span className="font-semibold text-academic-blue">{config.importantDates[0].date}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Database Status:</span>
                      <span className="font-semibold text-emerald-600">Supabase Connected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* OTHER TABS PLACEHOLDERS */}
          {activeTab !== "dashboard" && (
            <Card bordered accentBorder="navy">
              <CardHeader>
                <CardTitle className="capitalize">{activeTab} Management</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title={`No ${activeTab} Records Logged`}
                  description={`Admin management tools for ${activeTab} will populate here when live data is registered.`}
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
