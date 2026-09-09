import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MapPin, Building2, Navigation, Hotel } from "lucide-react";

export default function VenuePage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Location & Accommodations"
        title="Venue & Travel Information"
        subtitle={`Hosting ${config.shortName} at ${config.location.venue}, ${config.location.city}.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card bordered accentBorder="navy">
            <CardHeader>
              <CardTitle>Conference Venue & Facilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                The event will take place at the <span className="font-semibold text-academic-navy">{config.location.venue}</span> located within the main campus of {config.institution}.
              </p>
              <p>
                The campus features air-conditioned auditoriums, high-speed Wi-Fi, poster presentation bays, and cafeteria facilities.
              </p>
            </CardContent>
          </Card>

          <Card bordered accentBorder="gold">
            <CardHeader>
              <CardTitle>Recommended Hotel Accommodations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-700">
              <p>Special conference tariffs are negotiated with nearby partner hotels:</p>
              <ul className="space-y-2">
                <li className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-academic-navy block">University Grand Hotel</span>
                    <span className="text-slate-500 text-[11px]">1.5 km from campus venue</span>
                  </div>
                  <span className="text-amber-800 font-mono font-bold">Special Tariff Available</span>
                </li>
                <li className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-academic-navy block">City Residency Suites</span>
                    <span className="text-slate-500 text-[11px]">3.0 km from campus venue</span>
                  </div>
                  <span className="text-amber-800 font-mono font-bold">Special Tariff Available</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-md p-6 space-y-4 border-t-4 border-academic-gold">
            <h3 className="font-serif font-bold text-lg">Address & Coordinates</h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.contact.address}</span>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Nearest Airport: Delhi International Airport (DEL) — ~25 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
