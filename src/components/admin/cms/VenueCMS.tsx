"use client";

import React, { useState, useEffect } from "react";
import { Conference } from "@/types/database";
import { fetchConferenceDetails, updateConferenceDetails, DEFAULT_CONFERENCE_ID } from "@/lib/cms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { MapPin, Save, CheckCircle2, AlertCircle } from "lucide-react";

export function VenueCMS() {
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadVenueDetails();
  }, []);

  async function loadVenueDetails() {
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
      venue: conference.venue,
      city: conference.city,
      state: conference.state,
      country: conference.country,
      institution: conference.institution,
    });

    if (error) {
      setAlert({ type: "error", message: `Save Error: ${error}` });
    } else {
      setAlert({ type: "success", message: "Venue & Location details updated successfully in database!" });
      if (data) setConference(data);
    }

    setSubmitting(false);
  };

  if (loading || !conference) {
    return <LoadingState message="Loading Venue & Location CMS settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* CMS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="navy">CMS MODULE</Badge>
            <span className="text-xs text-slate-500 font-mono">venue_location</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-academic-navy mt-1">
            Venue & Location Management
          </h2>
          <p className="text-xs text-slate-600">
            Manage physical auditorium venue, host campus address, city, state, and geographic location information.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleSubmit}
          isLoading={submitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Venue Info
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

      <Card bordered accentBorder="gold">
        <CardHeader>
          <CardTitle>Physical Venue & Campus Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Conference Venue Complex / Auditorium *"
                required
                placeholder="e.g. Main Auditorium & Conference Complex"
                value={conference.venue}
                onChange={(e) => setConference({ ...conference, venue: e.target.value })}
              />
              <Input
                label="Host Institution / Campus Name *"
                required
                placeholder="e.g. College of Engineering & Technology"
                value={conference.institution}
                onChange={(e) => setConference({ ...conference, institution: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City *"
                required
                placeholder="e.g. New Delhi"
                value={conference.city}
                onChange={(e) => setConference({ ...conference, city: e.target.value })}
              />
              <Input
                label="State / Region *"
                required
                placeholder="e.g. Delhi"
                value={conference.state}
                onChange={(e) => setConference({ ...conference, state: e.target.value })}
              />
              <Input
                label="Country *"
                required
                placeholder="e.g. India"
                value={conference.country}
                onChange={(e) => setConference({ ...conference, country: e.target.value })}
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
              <span className="font-bold text-academic-navy">Public Display Preview:</span>
              <p className="text-slate-600 font-mono">
                {conference.venue}, {conference.institution}, {conference.city}, {conference.state}, {conference.country}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="primary" size="sm" type="submit" isLoading={submitting} leftIcon={<Save className="w-4 h-4" />}>
                Update Venue Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
