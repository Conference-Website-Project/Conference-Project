import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { User, Award, BookOpen } from "lucide-react";

export default function SpeakersPage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Keynote & Invited Scholars"
        title="Keynote Speakers"
        subtitle={`International experts addressing the theme "${config.theme}".`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {config.speakers.map((speaker) => (
          <Card key={speaker.id} bordered accentBorder="gold">
            <CardHeader className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-400 font-serif font-bold text-2xl flex items-center justify-center border-2 border-academic-gold">
                {speaker.name.split(" ").slice(-1)[0][0]}
              </div>
              <div>
                <CardTitle>{speaker.name}</CardTitle>
                <p className="text-xs text-academic-blue font-semibold mt-1">{speaker.title}</p>
                <p className="text-xs text-slate-500">{speaker.affiliation}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 border-t border-slate-100 pt-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Address Topic</span>
                <p className="text-xs font-semibold text-academic-navy italic mt-0.5">"{speaker.topic}"</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{speaker.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
