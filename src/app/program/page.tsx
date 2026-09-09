import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function ProgramPage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Conference Schedule"
        title="Technical Program & Sessions"
        subtitle={`Schedule overview for the 3-day conference event (${config.dates.formatted}).`}
      />

      <div className="space-y-8 max-w-4xl mx-auto">
        <Card bordered accentBorder="navy">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <Badge variant="navy">Day 01 — April 15, 2027</Badge>
              <CardTitle className="mt-2">Inauguration & Keynote Sessions</CardTitle>
            </div>
            <span className="text-xs text-slate-500 font-mono">09:00 AM - 05:00 PM</span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between">
              <span className="font-semibold text-academic-navy">09:00 AM - 10:30 AM: Registration & Inaugural Ceremony</span>
              <span className="text-slate-500">Main Auditorium</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between">
              <span className="font-semibold text-academic-navy">11:00 AM - 12:30 PM: Keynote Address I & II</span>
              <span className="text-slate-500">Auditorium Hall A</span>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded flex justify-between">
              <span className="font-semibold text-amber-900">02:00 PM - 05:00 PM: Track 1 & Track 2 Parallel Oral Presentations</span>
              <span className="text-slate-500">Seminar Halls 1 & 2</span>
            </div>
          </CardContent>
        </Card>

        <Card bordered accentBorder="gold">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <Badge variant="gold">Day 02 — April 16, 2027</Badge>
              <CardTitle className="mt-2">Technical Paper Sessions & Industry Forum</CardTitle>
            </div>
            <span className="text-xs text-slate-500 font-mono">09:30 AM - 05:30 PM</span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between">
              <span className="font-semibold text-academic-navy">09:30 AM - 11:00 AM: Keynote Address III</span>
              <span className="text-slate-500">Auditorium Hall A</span>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded flex justify-between">
              <span className="font-semibold text-amber-900">11:30 AM - 04:30 PM: Track 3 & Track 4 Presentations</span>
              <span className="text-slate-500">Seminar Halls 3 & 4</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
