"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchPaperById, getManuscriptSignedUrl } from "@/lib/papers";
import { PaperWithDetails } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Edit3, 
  Calendar, 
  BookOpen, 
  Users, 
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldAlert
} from "lucide-react";

export default function PaperDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const paperId = params.id as string;
  const [paper, setPaper] = useState<PaperWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadPaper() {
      if (paperId) {
        setLoading(true);
        const data = await fetchPaperById(paperId);
        if (!data) {
          setErrorMsg("Paper submission not found.");
        } else {
          setPaper(data);
        }
        setLoading(false);
      }
    }
    if (!authLoading) {
      loadPaper();
    }
  }, [paperId, authLoading]);

  const handleDownloadPdf = async () => {
    const path = paper?.manuscript_path || paper?.file_url;
    if (!path) return;

    setDownloading(true);
    const { url, error } = await getManuscriptSignedUrl(path);
    setDownloading(false);

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-4 h-4 text-blue-600" />
            Submitted
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <BookOpen className="w-4 h-4 text-purple-600" />
            Under Review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-4 h-4 text-red-600" />
            Rejected
          </span>
        );
      case "CAMERA_READY_SUBMITTED":
      case "CAMERA_READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
            <FileCheck className="w-4 h-4 text-amber-700" />
            Camera Ready
          </span>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingState message="Fetching manuscript submission details..." />
      </div>
    );
  }

  if (errorMsg || !paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700 max-w-md mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-serif font-bold text-lg">Paper Not Found</h3>
          <p className="text-xs text-red-600 mt-1">
            The paper submission ID was invalid or you do not have permission to view it.
          </p>
        </div>
        <Link href="/dashboard/papers">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to My Papers
          </Button>
        </Link>
      </div>
    );
  }

  const displayPaperId = paper.paper_id || `ICARET27-${paper.id.substring(0, 4).toUpperCase()}`;
  const isEditable = paper.status === "SUBMITTED";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <div>
        <Link href="/dashboard/papers" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-academic-blue font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Papers
        </Link>
      </div>

      {/* Main Header Card */}
      <Card bordered accentBorder="navy" className="shadow-md">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-academic-blue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                  {displayPaperId}
                </span>
                <Badge variant="navy">{defaultConferenceConfig.shortName}</Badge>
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
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Action Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
              <FileText className="w-4 h-4 text-academic-blue" />
              <span>Manuscript PDF Document</span>
            </div>

            <div className="flex items-center gap-2">
              {isEditable && (
                <Link href={`/dashboard/papers/${paper.id}/edit`}>
                  <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                    Edit Details
                  </Button>
                </Link>
              )}

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
          </div>

          {/* Track Info */}
          {paper.track && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Conference Track
              </span>
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded text-xs">
                <span className="font-mono font-bold text-academic-blue mr-2">{paper.track.code}</span>
                <span className="font-semibold text-slate-800">{paper.track.name}</span>
                {paper.track.description && (
                  <p className="text-slate-600 mt-1 text-[11px]">{paper.track.description}</p>
                )}
              </div>
            </div>
          )}

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
                Index Keywords
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
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-academic-navy" />
              Author Contributions & Affiliations
            </h3>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md overflow-hidden bg-white">
              {paper.authors?.map((author, index) => (
                <div key={index} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white hover:bg-slate-50">
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
                  </div>

                  <span className="font-mono text-slate-500 text-[11px] self-start sm:self-center">
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
