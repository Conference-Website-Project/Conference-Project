"use client";

import React, { useState, useEffect } from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { DatabaseCommitteeMember } from "@/types/database";
import { fetchCommitteeMembers } from "@/lib/cms";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";

export default function CommitteePage() {
  const [committee, setCommittee] = useState<DatabaseCommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const config = defaultConferenceConfig;

  useEffect(() => {
    async function loadData() {
      const data = await fetchCommitteeMembers();
      setCommittee(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Loading Committee Members..." />
      </div>
    );
  }

  const patronsAndChairs = committee.filter((m) => m.category === "patron" || m.category === "chair");
  const organizingMembers = committee.filter((m) => m.category === "organizing");
  const technicalMembers = committee.filter((m) => m.category === "technical");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Governance & Organization"
        title="Organizing & Technical Committees"
        subtitle={`Academic leadership and advisory committee members governing ${config.shortName}.`}
      />

      <div className="space-y-8 max-w-4xl mx-auto">
        {patronsAndChairs.length > 0 && (
          <Card bordered accentBorder="navy">
            <CardHeader>
              <CardTitle>Patrons & General Chairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {patronsAndChairs.map((member) => (
                  <div key={member.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-sm">
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
        )}

        {organizingMembers.length > 0 && (
          <Card bordered accentBorder="gold">
            <CardHeader>
              <CardTitle>Organizing Committee & Secretaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {organizingMembers.map((member) => (
                  <div key={member.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-sm">
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
        )}

        {technicalMembers.length > 0 && (
          <Card bordered accentBorder="crimson">
            <CardHeader>
              <CardTitle>Technical Program Committee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {technicalMembers.map((member) => (
                  <div key={member.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-sm">
                    <div>
                      <span className="font-serif font-bold text-academic-navy">{member.name}</span>
                      <p className="text-xs text-slate-500">{member.affiliation}</p>
                    </div>
                    <Badge variant="crimson">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
