"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchPaperById, updatePaperStatusAdmin, getManuscriptSignedUrl } from "@/lib/papers";
import { PaperWithDetails, PaperStatus } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  BookOpen, 
  FileCheck, 
  ShieldCheck, 
  User, 
  Tag, 
  Calendar,
  AlertCircle
} from "lucide-react";

export default function AdminPaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const paperId = params.id as string;
  const [paper, setPaper] = useState<PaperWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadPaperData() {
      if (paperId) {
        setLoading(true);
        const data = await fetchPaperById(paperId);
        setPaper(data);
        setLoading(false);
      }
    }
    if (!authLoading) {
      loadPaperData();
    }
  }, [paperId, authLoading]);

  const handleDownloadPdf = async () => {
    const path = paper?.manuscript_path || paper?.file_url;
    if (!path) return;

    setDownloading(true);
    const { url, error } = await getManuscriptSignedUrl(path);
    setDownloading(false);

    if (error || !url) {
      alert(`Unable to access manuscript: ${error}`);
      return;
    }

    window.open(url, "_blank");
  };

  const handleStatusChange = async (targetStatus: PaperStatus) => {
    if (!paper) return;

    const confirmText = `Are you sure you want to change paper status to '${targetStatus}'?`;
    if (!confirm(confirmText)) return;

    setUpdatingStatus(true);
    setStatusMessage("");

    const { success, error } = await updatePaperStatusAdmin(paper.id, targetStatus);
    setUpdatingStatus(false);

    if (error || !success) {
      setStatusMessage(`Status update failed: ${error}`);
      return;
    }

    setStatusMessage(`Paper status successfully updated to '${targetStatus}'.`);
    const refreshed = await fetchPaperById(paper.id);
    if (refreshed) setPaper(refreshed);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-4 h-4 text-blue-600" /> Submitted
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <BookOpen className="w-4 h-4 text-purple-600" /> Under Review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-4 h-4 text-red-600" /> Rejected
          </span>
        );
      case "CAMERA_READY_SUBMITTED":
      case "CAMERA_READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <FileCheck className="w-4 h-4 text-amber-700" /> Camera Ready
          </span>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingState message="Loading administrative manuscript details..." />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700 max-w-md mx-auto">
          <h3 className="font-serif font-bold text-lg">Paper Not Found</h3>
          <p className="text-xs text-red-600 mt-1">
            The requested paper submission could not be located in the registry.
          </p>
        </div>
        <Link href="/admin/papers">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to All Submissions
          </Button>
        </Link>
      </div>
    );
  }

  const displayPaperId = paper.paper_id || `ICARET27-${paper.id.substring(0, 4).toUpperCase()}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href="/admin/papers" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-academic-blue font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Submissions Registry
        </Link>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded font-medium flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage("")} className="font-bold text-slate-500">×</button>
        </div>
      )}

      {/* Main Review Card */}
      <Card bordered accentBorder="gold" className="shadow-md">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-academic-blue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                  {displayPaperId}
                </span>
                <Badge variant="gold">ADMIN REVIEW</Badge>
              </div>

              <h1 className="text-xl sm:text-2xl font-serif font-bold text-academic-navy">
                {paper.title}
              </h1>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              {getStatusBadge(paper.status)}
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Submitted: {new Date(paper.submission_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Admin Status Actions Control Panel */}
          <div className="p-4 bg-slate-900 text-white rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> ADMIN STATUS CONTROL PANEL
              </span>
              <span className="text-xs text-slate-300">Current: {paper.status}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="bg-purple-950/60 border-purple-700 text-purple-200 hover:bg-purple-900"
                disabled={updatingStatus || paper.status === "UNDER_REVIEW"}
                onClick={() => handleStatusChange("UNDER_REVIEW")}
                leftIcon={<BookOpen className="w-3.5 h-3.5" />}
              >
                Mark Under Review
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={updatingStatus || paper.status === "ACCEPTED"}
                onClick={() => handleStatusChange("ACCEPTED")}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Accept Paper
              </Button>

              <Button
                variant="danger"
                size="sm"
                disabled={updatingStatus || paper.status === "REJECTED"}
                onClick={() => handleStatusChange("REJECTED")}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
              >
                Reject Paper
              </Button>

              <Button
                variant="gold"
                size="sm"
                disabled={updatingStatus || paper.status === "CAMERA_READY_SUBMITTED"}
                onClick={() => handleStatusChange("CAMERA_READY_SUBMITTED" as PaperStatus)}
                leftIcon={<FileCheck className="w-3.5 h-3.5" />}
              >
                Mark Camera Ready
              </Button>
            </div>
          </div>

          {/* Submitter & Track Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paper.submitter_profile && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block">
                  Submitting Account
                </span>
                <span className="font-semibold text-slate-800 block">{paper.submitter_profile.full_name}</span>
                <span className="text-slate-600 block">{paper.submitter_profile.email}</span>
                <span className="text-slate-500 block">{paper.submitter_profile.institution}, {paper.submitter_profile.country}</span>
              </div>
            )}

            {paper.track && (
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded text-xs space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block">
                  Assigned Track
                </span>
                <span className="font-mono font-bold text-academic-blue mr-1">{paper.track.code}</span>
                <span className="font-semibold text-slate-800 block">{paper.track.name}</span>
              </div>
            )}
          </div>

          {/* Private Manuscript Download */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-amber-800 shrink-0" />
              <div>
                <span className="font-semibold text-amber-900 block">Private Manuscript Document</span>
                <span className="text-amber-700 text-[11px]">Accessible strictly via signed short-lived admin link</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="sm"
              isLoading={downloading}
              onClick={handleDownloadPdf}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download PDF
            </Button>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Abstract
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 border border-slate-200 rounded whitespace-pre-line">
              {paper.abstract}
            </p>
          </div>

          {/* Keywords */}
          {paper.keywords && paper.keywords.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {paper.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 text-xs rounded-full"
                  >
                    <Tag className="w-3 h-3 text-slate-500" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Authors List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Co-Authors & Affiliations
            </h3>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md overflow-hidden bg-white">
              {paper.authors?.map((author, index) => (
                <div key={index} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {index + 1}. {author.author_name}
                      </span>
                      {author.is_corresponding && (
                        <Badge variant="navy" className="text-[10px]">
                          Corresponding Author
                        </Badge>
                      )}
                    </div>
                    <span className="text-slate-600 block">{author.affiliation}</span>
                    {author.designation && (
                      <span className="text-slate-500 text-[11px] block">{author.designation}</span>
                    )}
                  </div>

                  <span className="font-mono text-slate-500 text-[11px]">
                    {author.author_email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
