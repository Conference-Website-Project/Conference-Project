"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchAllProfiles } from "@/lib/auth";
import { Profile } from "@/types/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  Filter 
} from "lucide-react";

export default function AdminParticipantsPage() {
  const { profile, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/admin/participants");
      } else if (!isAdmin) {
        router.push("/dashboard?error=unauthorized_admin");
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchAllProfiles();
      setParticipants(data);
      setLoading(false);
    }
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Loading participant registry..." />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Filtered list
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.institution && p.institution.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || p.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-academic-gold shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/admin" className="text-slate-400 hover:text-white p-1 rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-1.5 bg-amber-500 text-slate-900 rounded font-serif font-bold text-xs">
            ADMIN
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white">Registered Participants Registry</h1>
            <p className="text-[11px] text-slate-400">User Management & Role Audit</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="gold">Total Accounts: {participants.length}</Badge>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
              Admin Console
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 space-y-6">
        {/* Search & Filter Bar */}
        <Card bordered accentBorder="navy" className="shadow-subtle">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-96 relative">
                <Input
                  placeholder="Search by name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Role:
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-academic-blue shadow-subtle"
                >
                  <option value="ALL">All Roles ({participants.length})</option>
                  <option value="PARTICIPANT">Participants</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card bordered accentBorder="navy" className="shadow-subtle overflow-hidden">
          <CardHeader className="flex justify-between items-center bg-slate-50/50">
            <CardTitle className="text-base font-serif">
              Registered Accounts ({filteredParticipants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredParticipants.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Participants Found"
                  description="No registered user profile matches your current search or role filter criteria."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="academic-table">
                  <thead>
                    <tr>
                      <th>Participant Name</th>
                      <th>Email Address</th>
                      <th>Institution / Affiliation</th>
                      <th>Designation</th>
                      <th>Country</th>
                      <th>Joined Date</th>
                      <th>System Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="font-semibold text-academic-navy font-serif">
                          {p.full_name}
                        </td>
                        <td className="font-mono text-xs text-slate-700">{p.email}</td>
                        <td className="text-slate-600">{p.institution || "—"}</td>
                        <td className="text-slate-600">{p.designation || "—"}</td>
                        <td className="text-slate-600">{p.country || "India"}</td>
                        <td className="text-xs text-slate-500 font-mono">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge variant={p.role === "ADMIN" ? "gold" : "navy"}>
                            {p.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
