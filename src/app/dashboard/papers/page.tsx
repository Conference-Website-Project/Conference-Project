"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchUserPapers, getManuscriptSignedUrl } from "@/lib/papers";
import { PaperWithDetails } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit3, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  FileCheck,
  BookOpen,
  Calendar
} from "lucide-react";

export default function MyPapersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [papers, setPapers] = useState<PaperWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPapers() {
      if (user?.id) {
        setLoading(true);
        const data = await fetchUserPapers(user.id);
        setPapers(data);
        setLoading(false);
      }
    }
    if (!authLoading) {
      loadPapers();
    }
  }, [user, authLoading]);

  const handleDownloadManuscript = async (paper: PaperWithDetails) => {
    const path = paper.manuscript_path || paper.file_url;
    if (!path) return;

    setDownloadingId(paper.id);
    const { url, error } = await getManuscriptSignedUrl(path);
    setDownloadingId(null);

    if (error || !url) {
      alert(`Unable to access manuscript: ${error || "Signed URL generation failed."}`);
      return;
    }

    window.open(url, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Submitted
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            Under Review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      case "CAMERA_READY_SUBMITTED":
      case "CAMERA_READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <FileCheck className="w-3.5 h-3.5 text-amber-700" />
            Camera Ready
          </span>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <LoadingState message="Loading your submitted manuscripts..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
            <span className="text-xs text-slate-500 font-mono">My Submissions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-academic-navy">
            My Research Manuscripts
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Manage your submitted papers, check review status, and upload camera-ready manuscripts.
          </p>
        </div>

        <div>
          <Link href="/dashboard/papers/new">
            <Button variant="gold" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Submit New Paper
            </Button>
          </Link>
        </div>
      </div>

      {/* Papers List */}
      {papers.length === 0 ? (
        <Card bordered className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-serif font-bold text-academic-navy">No Submissions Found</h3>
              <p className="text-xs text-slate-500">
                You haven't submitted any research papers to {defaultConferenceConfig.shortName} yet.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/dashboard/papers/new">
                <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                  Submit Your First Paper
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {papers.map((paper) => {
              const displayPaperId = paper.paper_id || `ICARET27-${paper.id.substring(0, 4).toUpperCase()}`;
              const isEditable = paper.status === "SUBMITTED";

              return (
                <Card key={paper.id} bordered accentBorder="navy" className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-academic-blue bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            {displayPaperId}
                          </span>
                          {paper.track && (
                            <Badge variant="outline" className="text-xs">
                              {paper.track.code}: {paper.track.name}
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-lg font-serif font-bold text-academic-navy hover:text-academic-blue transition-colors">
                          <Link href={`/dashboard/papers/${paper.id}`}>
                            {paper.title}
                          </Link>
                        </h2>

                        <p className="text-xs text-slate-600 line-clamp-2">
                          {paper.abstract}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Submitted: {new Date(paper.submission_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>

                          {paper.keywords && paper.keywords.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-slate-700">Keywords:</span>{" "}
                              {paper.keywords.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                        <div>
                          {getStatusBadge(paper.status)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/papers/${paper.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                              View
                            </Button>
                          </Link>

                          {isEditable && (
                            <Link href={`/dashboard/papers/${paper.id}/edit`}>
                              <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                                Edit
                              </Button>
                            </Link>
                          )}

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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
