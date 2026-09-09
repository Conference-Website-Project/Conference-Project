import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Building2, ShieldCheck, Globe, BookOpen, Award } from "lucide-react";

export default function AboutPage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Conference Governance & Overview"
        title={`About ${config.shortName}`}
        subtitle={`Learn more about ${config.name}, organized by ${config.institution}.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6 text-slate-700 text-sm leading-relaxed">
          <Card bordered accentBorder="navy">
            <CardHeader>
              <CardTitle>Conference Objective & Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                The {config.name} ({config.shortName}) is a premier annual international conference aimed at providing a high-quality global forum for researchers, academicians, scientists, and industry professionals.
              </p>
              <p>
                The central theme of this edition is <span className="font-semibold text-academic-navy">"{config.theme}"</span>. The event aims to bridge the gap between theoretical research innovations and real-world engineering deployments.
              </p>
            </CardContent>
          </Card>

          <Card bordered accentBorder="gold">
            <CardHeader>
              <CardTitle>Peer Review & Publication Ethics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                All submitted papers undergo a rigorous double-blind peer review process evaluated by at least two independent international domain experts. Accepted papers will be included in the official indexed proceedings.
              </p>
              <p>
                The conference enforces strict academic integrity guidelines against plagiarism, self-plagiarism, and duplicate submission.
              </p>
            </CardContent>
          </Card>

          <Card bordered accentBorder="crimson">
            <CardHeader>
              <CardTitle>Multi-Year Governance Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                This platform is built as an institutional digital repository and management system. Future editions ({config.year + 1}, {config.year + 2}) will preserve past proceedings archives while dynamically updating current tracks, keynotes, and registrations.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-md p-6 space-y-4 border-t-4 border-academic-gold">
            <h3 className="font-serif font-bold text-lg">Conference Quick Facts</h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Conference Code:</span>
                <span className="font-mono text-amber-400">{config.shortName}</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Edition Year:</span>
                <span className="font-semibold text-white">{config.year}</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Organizing College:</span>
                <span className="text-right text-slate-200">{config.institution}</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Dates:</span>
                <span className="text-amber-400">{config.dates.formatted}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Review Mode:</span>
                <span className="text-emerald-400 font-semibold">Double-Blind Peer Review</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
