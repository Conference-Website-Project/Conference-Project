"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchAllProfiles } from "@/lib/auth";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
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
  LogOut, 
  Building2,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function AdminDashboardPage() {
  const { profile, isAdmin, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "conference" | "participants" | "papers" | "registrations" | "payments" | "speakers" | "committee" | "announcements" | "settings"
  >("dashboard");

  const router = useRouter();
  const config = defaultConferenceConfig;

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        router.push("/dashboard?error=unauthorized_admin");
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    async function loadStats() {
      const data = await fetchAllProfiles();
      setTotalUsers(data.length);
    }
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Checking administrator privileges..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-bold">Access Denied</h3>
          <p className="text-xs mt-1">Administrator privileges required to access the Admin Console.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">Return to Participant Dashboard</Button>
        </Link>
      </div>
    );
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "participants", label: "Participants", icon: <Users className="w-4 h-4" />, count: totalUsers },
    { id: "conference", label: "Conference Setup", icon: <Building2 className="w-4 h-4" /> },
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
            <p className="text-[11px] text-slate-400">Authenticated Administrator: {profile?.full_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="gold">Edition {config.year}</Badge>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
              My Participant View
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="text-slate-400 hover:text-white"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Admin Sidebar + Content Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-800 text-slate-300 p-4 shrink-0 border-r border-slate-700 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 py-1 mb-2">
            Admin Governance Menu
          </div>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "participants") {
                  router.push("/admin/participants");
                } else if (item.id === "papers") {
                  router.push("/admin/papers");
                } else {
                  setActiveTab(item.id as any);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                activeTab === item.id
                  ? "bg-academic-blue text-white font-bold"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="bg-slate-900 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-serif font-bold text-academic-navy">Executive Overview</h2>
                <p className="text-xs text-slate-600">Platform governance statistics for {config.shortName}.</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card bordered accentBorder="gold" className="hover:border-slate-300 transition-all cursor-pointer" onClick={() => router.push("/admin/participants")}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
                      <CardTitle className="text-3xl font-bold font-serif text-amber-800 mt-1">{totalUsers}</CardTitle>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-600" />
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">View User Registry →</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="navy" className="hover:border-slate-300 transition-all cursor-pointer" onClick={() => router.push("/admin/papers")}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paper Submissions</span>
                      <CardTitle className="text-3xl font-bold font-serif text-academic-navy mt-1">Review</CardTitle>
                    </div>
                    <ArrowRight className="w-5 h-5 text-academic-blue" />
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">View All Submissions →</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="navy">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrations</span>
                    <CardTitle className="text-3xl font-bold font-serif text-academic-blue mt-1">0</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">Confirmed Attendees</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="crimson">
                  <CardHeader className="pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                    <CardTitle className="text-3xl font-bold font-serif text-academic-accent mt-1">₹ 0</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">Razorpay Transaction Logs</span>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card bordered accentBorder="navy">
                  <CardHeader>
                    <CardTitle>User Management Quick Action</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-700">
                    <p>Inspect registered authors, check participant institutions, and review assigned system roles.</p>
                    <Link href="/admin/participants">
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Open Registered Participants Table
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="gold">
                  <CardHeader>
                    <CardTitle>Security & Role Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-slate-700">
                    <p className="font-semibold text-academic-navy">Row Level Security (RLS) Active</p>
                    <p>Participants can only access their own submissions and profiles. Admin role elevation is strictly guarded on the database side.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

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
