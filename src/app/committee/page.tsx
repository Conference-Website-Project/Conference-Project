import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Award, Shield } from "lucide-react";

export default function CommitteePage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Governance & Organization"
        title="Organizing & Technical Committees"
        subtitle={`Academic leadership and advisory committee members governing ${config.shortName}.`}
      />

      <div className="space-y-8 max-w-4xl mx-auto">
        <Card bordered accentBorder="navy">
          <CardHeader>
            <CardTitle>Patrons & General Chairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {config.committee
                .filter((m) => m.category === "patron" || m.category === "chair")
                .map((member, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-sm">
                    <div>
                      <span className="font-serif font-bold text-academic-navy">{member.name}</span>
                      <p className="text-xs text-slate-500">{member.affiliation}</p>
                    </div>
                    <Badge variant="navy">{member.role}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card bordered accentBorder="gold">
          <CardHeader>
            <CardTitle>Organizing Secretaries & Chairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {config.committee
                .filter((m) => m.category === "organizing")
                .map((member, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-sm">
                    <div>
                      <span className="font-serif font-bold text-academic-navy">{member.name}</span>
                      <p className="text-xs text-slate-500">{member.affiliation}</p>
                    </div>
                    <Badge variant="gold">{member.role}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
