"use client";

import React, { useState, useEffect } from "react";
import { Conference } from "@/types/database";
import { fetchConferenceDetails, updateConferenceDetails, DEFAULT_CONFERENCE_ID } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Building2, Save, CheckCircle2, AlertCircle } from "lucide-react";

export function ConferenceDetailsCMS() {
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadDetails();
  }, []);

  async function loadDetails() {
    setLoading(true);
    const data = await fetchConferenceDetails(DEFAULT_CONFERENCE_ID);
    setConference(data);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conference) return;

    setSubmitting(true);
    setAlert(null);

    const { data, error } = await updateConferenceDetails(DEFAULT_CONFERENCE_ID, {
      name: conference.name,
      short_name: conference.short_name,
      year: Number(conference.year),
      theme: conference.theme,
      description: conference.description,
      start_date: conference.start_date,
      end_date: conference.end_date,
      institution: conference.institution,
      contact_email: conference.contact_email,
      contact_phone: conference.contact_phone,
    });

    if (error) {
      setAlert({ type: "error", message: `Save Error: ${error}` });
    } else {
      setAlert({ type: "success", message: "Conference details saved successfully to database!" });
      if (data) setConference(data);
    }

    setSubmitting(false);
  };

  if (loading || !conference) {
    return <LoadingState message="Loading Conference Setup details..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">conference_details</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            General Conference Details Management
          </h2>
          <p className="text-xs text-slate-600">
            Configure primary titles, themes, dates, institution name, and contact details.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleSubmit}
          isLoading={submitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save All Changes
        </Button>
      </div>

      {alert && (
        <div
          className={`p-4 rounded text-xs flex items-center gap-3 ${
            alert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Main Form */}
      <Card bordered accentBorder="navy">
        <CardHeader>
          <CardTitle>Core Conference Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Conference Name *"
                  required
                  value={conference.name}
                  onChange={(e) => setConference({ ...conference, name: e.target.value })}
                />
              </div>
              <Input
                label="Short Abbreviation *"
                required
                value={conference.short_name}
                onChange={(e) => setConference({ ...conference, short_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Edition Year *"
                type="number"
                required
                value={conference.year}
                onChange={(e) => setConference({ ...conference, year: Number(e.target.value) })}
              />
              <Input
                label="Start Date *"
                type="date"
                required
                value={conference.start_date}
                onChange={(e) => setConference({ ...conference, start_date: e.target.value })}
              />
              <Input
                label="End Date *"
                type="date"
                required
                value={conference.end_date}
                onChange={(e) => setConference({ ...conference, end_date: e.target.value })}
              />
            </div>

            <Input
              label="Conference Main Theme *"
              required
              value={conference.theme}
              onChange={(e) => setConference({ ...conference, theme: e.target.value })}
            />

            <Textarea
              label="Conference Overview & Description"
              rows={3}
              value={conference.description || ""}
              onChange={(e) => setConference({ ...conference, description: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Host Institution *"
                required
                value={conference.institution}
                onChange={(e) => setConference({ ...conference, institution: e.target.value })}
              />
              <Input
                label="Contact Secretariat Email *"
                type="email"
                required
                value={conference.contact_email}
                onChange={(e) => setConference({ ...conference, contact_email: e.target.value })}
              />
              <Input
                label="Contact Secretariat Phone"
                value={conference.contact_phone || ""}
                onChange={(e) => setConference({ ...conference, contact_phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="primary" size="sm" type="submit" isLoading={submitting} leftIcon={<Save className="w-4 h-4" />}>
                Save Conference Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
