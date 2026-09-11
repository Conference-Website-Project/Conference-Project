"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchAllProfiles } from "@/lib/auth";
import { defaultConferenceConfig } from "@/config/conference";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
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
  ShieldAlert,
  Clock,
  XCircle,
  Receipt
} from "lucide-react";

export default function AdminDashboardPage() {
  const { profile, isAdmin, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

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
      setLoadingStats(true);
      const supabase = createBrowserClient();

      // 1. Fetch profiles
      const userList = await fetchAllProfiles();
      setTotalUsers(userList.length);

      // 2. Fetch registrations
      const { data: regData } = await supabase
        .from("registrations")
        .select(`
          *,
          profile:profiles!registrations_user_id_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (regData) {
        setRegistrations(regData);
      } else {
        // Fallback without join in case relationship name varies
        const { data: fallbackReg } = await supabase
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false });
        setRegistrations(fallbackReg || []);
      }

      // 3. Fetch payments
      const { data: payData } = await supabase
        .from("payments")
        .select(`
          *,
          profile:profiles!payments_user_id_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (payData) {
        setPayments(payData);
      } else {
        const { data: fallbackPay } = await supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false });
        setPayments(fallbackPay || []);
      }

      setLoadingStats(false);
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

  // Calculate payment totals
  const successfulPayments = payments.filter((p) => p.status === "SUCCESSFUL");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const failedPayments = payments.filter((p) => p.status === "FAILED");
  const totalRevenue = successfulPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const confirmedRegistrations = registrations.filter((r) => r.is_paid);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "participants", label: "Participants", icon: <Users className="w-4 h-4" />, count: totalUsers },
    { id: "registrations", label: "Registrations", icon: <CheckCircle2 className="w-4 h-4" />, count: registrations.length },
    { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" />, count: payments.length },
    { id: "papers", label: "Paper Submissions", icon: <FileText className="w-4 h-4" /> },
    { id: "conference", label: "Conference Setup", icon: <Building2 className="w-4 h-4" /> },
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
          {/* TAB: DASHBOARD OVERVIEW */}
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

                <Card bordered accentBorder="navy" className="hover:border-slate-300 transition-all cursor-pointer" onClick={() => setActiveTab("registrations")}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrations</span>
                      <CardTitle className="text-3xl font-bold font-serif text-academic-blue mt-1">
                        {confirmedRegistrations.length} <span className="text-xs font-normal text-slate-400">/ {registrations.length}</span>
                      </CardTitle>
                    </div>
                    <ArrowRight className="w-5 h-5 text-academic-blue" />
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">{confirmedRegistrations.length} Confirmed Paid →</span>
                  </CardContent>
                </Card>

                <Card bordered accentBorder="crimson" className="hover:border-slate-300 transition-all cursor-pointer" onClick={() => setActiveTab("payments")}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                      <CardTitle className="text-3xl font-bold font-serif text-academic-accent mt-1">
                        ₹ {totalRevenue.toLocaleString("en-IN")}
                      </CardTitle>
                    </div>
                    <ArrowRight className="w-5 h-5 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs text-slate-500">From {successfulPayments.length} Paid Delegates →</span>
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
              </div>

              {/* Payment Summary Quick Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-md shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Successful Payments</span>
                    <span className="text-xl font-bold font-serif text-emerald-700">{successfulPayments.length}</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-md shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Pending Invoices</span>
                    <span className="text-xl font-bold font-serif text-amber-700">{pendingPayments.length}</span>
                  </div>
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-md shadow-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Failed / Cancelled</span>
                    <span className="text-xl font-bold font-serif text-red-700">{failedPayments.length}</span>
                  </div>
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
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
                    <CardTitle>Security & Payment Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-slate-700">
                    <p className="font-semibold text-academic-navy">Server-Enforced Payment Gateway Active</p>
                    <p>All Razorpay transactions are cryptographically verified with HMAC-SHA256 signatures before status promotion. Direct frontend updates to payment statuses are prevented by PostgreSQL Row Level Security.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: REGISTRATIONS */}
          {activeTab === "registrations" && (
            <Card bordered accentBorder="navy" className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
                <div>
                  <CardTitle>Conference Delegate Registrations</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">List of all attendee and author registration records</p>
                </div>
                <Badge variant="navy">{registrations.length} Total</Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {registrations.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      title="No Registrations Logged Yet"
                      description="Participant registrations will populate here once users select categories and initiate checkout."
                    />
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Delegate / User ID</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Paper Linked</th>
                        <th className="px-4 py-3">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            {new Date(reg.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">
                              {reg.profile?.full_name || reg.user_id.slice(0, 8)}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {reg.profile?.email || reg.user_id}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-academic-navy">
                            <Badge variant={reg.category === "FACULTY" ? "gold" : "navy"}>
                              {reg.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-serif font-bold text-slate-900">
                            ₹ {Number(reg.amount_due).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {reg.paper_id ? `${reg.paper_id.slice(0, 8)}...` : "None"}
                          </td>
                          <td className="px-4 py-3">
                            {reg.is_paid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> PAID
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                <Clock className="w-3 h-3" /> UNPAID
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === "payments" && (
            <Card bordered accentBorder="crimson" className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
                <div>
                  <CardTitle>Razorpay Payment Transaction Logs</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">All online payment attempts, signatures, and receipts</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gold">Revenue: ₹ {totalRevenue.toLocaleString("en-IN")}</Badge>
                  <Badge variant="navy">{payments.length} Records</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {payments.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      title="No Payment Records Logged"
                      description="Online transaction attempts and receipts will appear here automatically."
                    />
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Delegate</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Payment ID</th>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Receipt No</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            {new Date(pay.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">
                              {pay.profile?.full_name || pay.user_id.slice(0, 8)}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {pay.profile?.email || pay.user_id}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-serif font-bold text-slate-900">
                            ₹ {Number(pay.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                            {pay.gateway_payment_id || pay.transaction_reference || "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {pay.razorpay_order_id ? `${pay.razorpay_order_id.slice(0, 14)}...` : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-amber-800 font-bold whitespace-nowrap">
                            {pay.receipt_number || "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {pay.status === "SUCCESSFUL" && (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> SUCCESSFUL
                              </span>
                            )}
                            {pay.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                <Clock className="w-3 h-3" /> PENDING
                              </span>
                            )}
                            {pay.status === "FAILED" && (
                              <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                <XCircle className="w-3 h-3" /> FAILED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB: OTHER FALLBACKS */}
          {activeTab !== "dashboard" && activeTab !== "registrations" && activeTab !== "payments" && (
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
