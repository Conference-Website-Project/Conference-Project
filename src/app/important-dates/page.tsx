import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

export default function ImportantDatesPage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Schedule & Deadlines"
        title="Important Deadlines & Schedule"
        subtitle="Key dates for paper submission, notification, registration, and conference sessions."
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Strict Deadline Policy:</span> All submissions must be uploaded to the submission system by 23:59 IST (GMT +5:30) on the specified date. Late submissions will not be accepted.
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-subtle">
          <table className="academic-table">
            <thead>
              <tr>
                <th>Event / Milestone</th>
                <th>Deadline Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {config.importantDates.map((item, idx) => (
                <tr key={idx} className={item.highlight ? "bg-amber-50/40 font-semibold" : ""}>
                  <td className="font-serif text-academic-navy">{item.title}</td>
                  <td className="font-mono text-academic-blue">{item.date}</td>
                  <td>
                    {item.highlight ? (
                      <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded text-xs">
                        Active Priority
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs">
                        Scheduled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
