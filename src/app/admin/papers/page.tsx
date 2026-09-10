"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchAllPapersAdmin, getManuscriptSignedUrl } from "@/lib/papers";
import { PaperWithDetails, PaperStatus } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  BookOpen, 
  FileCheck,
  ShieldCheck,
  User
} from "lucide-react";

export default function AdminPapersPage() {
  const { profile, loading: authLoading } = useAuth();
  const [papers, setPapers] = useState<PaperWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminPapers() {
      setLoading(true);
      const data = await fetchAllPapersAdmin();
      setPapers(data);
      setLoading(false);
    }
    if (!authLoading) {
      loadAdminPapers();
    }
  }, [authLoading]);

  const handleDownloadManuscript = async (paper: PaperWithDetails) => {
    const path = paper.manuscript_path || paper.file_url;
    if (!path) return;

    setDownloadingId(paper.id);
    const { url, error } = await getManuscriptSignedUrl(path);
    setDownloadingId(null);

    if (error || !url) {
      alert(`Unable to generate signed URL for admin: ${error}`);
      return;
    }

    window.open(url, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> Submitted
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <BookOpen className="w-3 h-3 text-purple-600" /> Under Review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Rejected
          </span>
        );
      case "CAMERA_READY_SUBMITTED":
      case "CAMERA_READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <FileCheck className="w-3 h-3 text-amber-700" /> Camera Ready
          </span>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  // Filter papers based on search query and status filter
  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.paper_id && p.paper_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.submitter_profile?.full_name && p.submitter_profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.track?.name && p.track.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingState message="Loading administrative paper submissions registry..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">ADMIN DASHBOARD</Badge>
            <span className="text-xs text-slate-500 font-mono">{defaultConferenceConfig.shortName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-academic-navy">
            Conference Submissions Registry
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Review submitted manuscripts, manage peer-review status, and download private PDF files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="navy" className="px-3 py-1.5 text-xs font-mono">
            Total Submissions: {papers.length}
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card bordered className="p-4 bg-slate-50 border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Title, Paper ID, Author Name, or Track..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-academic-blue bg-white outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              className="w-full md:w-48 p-2 text-xs border border-slate-300 rounded bg-white font-medium outline-none focus:ring-2 focus:ring-academic-blue"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="CAMERA_READY">Camera Ready</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table of Submissions */}
      {filteredPapers.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-serif font-bold text-academic-navy">No Submissions Found</h3>
            <p className="text-xs text-slate-500">
              No paper submissions match your current search or status filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-serif font-semibold">
                <tr>
                  <th className="py-3 px-4">Paper ID</th>
                  <th className="py-3 px-4">Title & Submitter</th>
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPapers.map((paper) => {
                  const displayPaperId = paper.paper_id || `ICARET27-${paper.id.substring(0, 4).toUpperCase()}`;

                  return (
                    <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-academic-blue">
                        {displayPaperId}
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <Link href={`/admin/papers/${paper.id}`} className="font-serif font-bold text-academic-navy hover:text-academic-blue block line-clamp-1">
                          {paper.title}
                        </Link>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          {paper.submitter_profile?.full_name || "Participant"} ({paper.submitter_profile?.institution || "Institution N/A"})
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {paper.track ? (
                          <span className="inline-block bg-slate-100 text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-200">
                            {paper.track.code}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(paper.submission_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(paper.status)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/papers/${paper.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                              Review
                            </Button>
                          </Link>

                          <Button
                            variant="secondary"
                            size="sm"
                            isLoading={downloadingId === paper.id}
                            onClick={() => handleDownloadManuscript(paper)}
                            leftIcon={<Download className="w-3.5 h-3.5" />}
                          >
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
