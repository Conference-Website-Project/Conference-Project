"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConferenceTrack } from "@/types/database";
import { fetchConferenceTracks } from "@/lib/cms";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { CheckCircle2, ArrowRight, Download } from "lucide-react";

export default function CallForPapersPage() {
  const [tracks, setTracks] = useState<ConferenceTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchConferenceTracks();
      setTracks(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Loading Call For Papers tracks..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Submissions & Guidelines"
        title="Call for Papers (CFP)"
        subtitle="Original research manuscripts are invited for submission across technical tracks."
      />

      {/* Submission CTA Banner */}
      <div className="bg-academic-navy text-white rounded-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-academic-gold">
        <div className="space-y-2">
          <Badge variant="gold">Submissions Open</Badge>
          <h3 className="font-serif font-bold text-xl text-white">Paper Submission Portal is Active</h3>
          <p className="text-xs text-slate-300">
            Submit your full manuscript in PDF format through the online author submission dashboard.
          </p>
        </div>
        <Link href="/register">
          <Button variant="gold" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Submit Paper Now
          </Button>
        </Link>
      </div>

      {/* Research Tracks */}
      <div className="space-y-6">
        <h3 className="font-serif font-bold text-xl text-academic-navy">Conference Research Tracks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <Card key={track.id} id={track.code} bordered accentBorder="navy">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{track.name}</CardTitle>
                <Badge variant="navy">{track.code}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">{track.description}</p>
                <div className="text-xs font-semibold text-slate-700">Sub-Topics Include:</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue" />
                    <span>Domain Foundations</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue" />
                    <span>Applied Architectures</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue" />
                    <span>Experimental Validation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-academic-blue" />
                    <span>Industry Case Studies</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submission Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card bordered accentBorder="gold">
            <CardHeader>
              <CardTitle>Manuscript Format & Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                1. <span className="font-semibold">Format:</span> Papers must be formatted according to standard double-column conference template (maximum 6 pages including figures and references).
              </p>
              <p>
                2. <span className="font-semibold">Blind Review:</span> To facilitate double-blind review, manuscripts must NOT contain author names, affiliations, or self-identifying citations in the initial submission version.
              </p>
              <p>
                3. <span className="font-semibold">Originality:</span> Manuscripts submitted must represent original work that has not been published or under review elsewhere.
              </p>
              <p>
                4. <span className="font-semibold">File Format:</span> Submissions are accepted in PDF format only through the online portal.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-100 p-6 rounded border border-slate-200 space-y-4">
            <h4 className="font-serif font-bold text-sm text-academic-navy">Download Paper Templates</h4>
            <p className="text-xs text-slate-600">
              Download standard conference manuscript formatting templates for Word and LaTeX.
            </p>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-between text-xs" leftIcon={<Download className="w-3.5 h-3.5" />}>
                <span>MS Word Template (.docx)</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs" leftIcon={<Download className="w-3.5 h-3.5" />}>
                <span>LaTeX Package Template (.zip)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
