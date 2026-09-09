import React from "react";
import Link from "next/link";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Calendar, 
  MapPin, 
  FileText, 
  UserCheck, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  Users, 
  ShieldCheck, 
  Globe 
} from "lucide-react";

export default function HomePage() {
  const config = defaultConferenceConfig;

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-academic-navy text-white relative overflow-hidden border-b-4 border-academic-gold">
        {/* Subtle geometric grid background pattern */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-800/90 border border-slate-700 text-amber-400 text-xs font-semibold tracking-wider uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>{config.institution}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white tracking-tight leading-tight">
              {config.name}
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-sans leading-relaxed border-l-2 border-academic-gold pl-4 italic">
              "{config.theme}"
            </p>

            {/* Quick Metadata Pill Strip */}
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-slate-200">
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3.5 py-2 rounded border border-slate-700">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-medium">{config.dates.formatted}</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3.5 py-2 rounded border border-slate-700">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="font-medium">{config.location.venue}, {config.location.city}</span>
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/registration">
                <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Register Now
                </Button>
              </Link>
              <Link href="/call-for-papers">
                <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-slate-600">
                  Submit Paper
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" size="lg" className="text-slate-300 hover:text-white hover:bg-slate-800/60">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONFERENCE INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <SectionHeading
              badge="About The Conference"
              title="A Premier Platform for Global Research Exchange"
              subtitle={`Hosted by ${config.institution}, ${config.shortName} brings together leading academic scientists, researchers, scholars, and industry leaders.`}
            />
            <p className="text-slate-700 text-sm leading-relaxed">
              The {config.name} provides an interdisciplinary forum for researchers, practitioners, and educators to present and discuss the most recent innovations, trends, concerns, practical challenges encountered, and solutions adopted in the fields of engineering, artificial intelligence, and sustainable technologies.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed">
              All accepted and presented papers will undergo rigorous double-blind peer review by international committee experts and will be recommended for inclusion in indexed digital proceedings.
            </p>
            <div className="pt-2">
              <Link href="/about">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Read Full Scope & Governance
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-md border border-slate-200 shadow-subtle space-y-4 border-t-4 border-t-academic-blue">
            <h3 className="font-serif font-bold text-lg text-academic-navy">Key Metrics & Expectations</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Double-Blind Peer Reviewed Submissions</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Keynote Sessions from International Experts</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Best Paper & Scholar Research Awards</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Hybrid Presentation Modes Available</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. IMPORTANT DATES TIMELINE */}
      <section className="bg-slate-100/70 py-12 md:py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Timeline"
            title="Important Conference Dates"
            subtitle="Please strictly adhere to the submission deadlines to ensure inclusion in proceedings."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {config.importantDates.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white p-5 rounded-md border transition-all ${
                  item.highlight
                    ? "border-academic-gold shadow-md bg-amber-50/30"
                    : "border-slate-200 shadow-subtle"
                }`}
              >
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Step 0{idx + 1}
                </div>
                <div className="text-sm font-bold text-academic-navy font-serif leading-snug mb-2">
                  {item.title}
                </div>
                <div className="text-xs font-semibold text-academic-blue bg-blue-50 border border-blue-100 inline-block px-2 py-1 rounded">
                  {item.date}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/important-dates">
              <Button variant="outline" size="sm">
                View Full Timeline Schedule
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CONFERENCE TRACKS / TOPICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Tracks & Topics"
          title="Call for Papers — Research Tracks"
          subtitle="Authors are invited to submit original, unpublished research papers across four primary tracks."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.tracks.map((track) => (
            <Card key={track.id} hoverable accentBorder="navy">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <Badge variant="navy">{track.code}</Badge>
                  <CardTitle className="mt-2">{track.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {track.description}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/call-for-papers#${track.code}`}>
                  <span className="text-xs font-semibold text-academic-blue hover:underline inline-flex items-center gap-1">
                    <span>View Track Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. KEYNOTE SPEAKERS */}
      <section className="bg-slate-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-12">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-slate-800 border border-slate-700 rounded-sm">
              Keynote Speakers
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Distinguished Keynote Addressers
            </h2>
            <div className="h-1 w-12 bg-academic-gold mt-3 mb-4 rounded-full" />
            <p className="text-slate-300 text-sm max-w-2xl">
              Hear from leading researchers and visionary academic leaders shaping the future of engineering and computational systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.speakers.map((spk) => (
              <div key={spk.id} className="bg-slate-800/80 border border-slate-700 rounded-md p-6 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-amber-400 font-serif font-bold text-lg">
                    {spk.name.replace(/^(Prof\.|Dr\.)\s*/, '').charAt(0)}
                  </div>
                  <h3 className="font-serif font-bold text-white text-lg">{spk.name}</h3>
                  <p className="text-xs text-amber-400 font-medium">{spk.title}</p>
                  <p className="text-xs text-slate-400">{spk.affiliation}</p>
                </div>
                <div className="pt-3 border-t border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Session Topic</span>
                  <p className="text-xs font-medium text-slate-200 italic">"{spk.topic}"</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/speakers">
              <Button variant="outline" size="sm" className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700">
                View Speaker Profiles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. WHY ATTEND / HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Highlights"
          title="Why Participate in {config.shortName}?"
          subtitle="An enriching academic environment designed to foster collaboration, publication, and recognition."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card bordered accentBorder="gold">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800">
                <BookOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Indexed Publication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                All peer-reviewed and registered papers will be published in official conference digital proceedings with DOI identifiers.
              </p>
            </CardContent>
          </Card>

          <Card bordered accentBorder="navy">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-academic-blue">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Global Networking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with session chairs, keynote scientists, research scholars, and academic delegates from across international institutions.
              </p>
            </CardContent>
          </Card>

          <Card bordered accentBorder="crimson">
            <CardHeader className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-academic-accent">
                <Award className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Research Awards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prestigious "Best Paper Award" and "Young Scholar Award" will be presented during the valedictory ceremony.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. ORGANIZING INSTITUTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-md p-8 md:p-12 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="navy">Host Institution</Badge>
            <h3 className="font-serif font-bold text-2xl text-academic-navy">{config.institution}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Established as a leading center of academic excellence and research innovation, the institution regularly hosts international symposia, research workshops, and global conferences.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link href="/committee">
              <Button variant="outline" size="md">
                Organizing Committee
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="primary" size="md">
                Contact Secretariat
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. VENUE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Host City & Location"
          title="Conference Venue"
          subtitle={`${config.location.venue}, ${config.location.city}, ${config.location.state}, ${config.location.country}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 rounded-md p-6 shadow-subtle">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-academic-navy">Main Conference Venue</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The conference will be held at the state-of-the-art auditorium complex equipped with modern audio-visual technology, break-out seminar halls, and high-speed Wi-Fi network infrastructure.
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-academic-blue" />
                <span>{config.contact.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-academic-blue" />
                <span>Nearest International Airport: Delhi International Airport (DEL)</span>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/venue">
                <Button variant="outline" size="sm">
                  View Travel & Hotel Accommodation Info
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-slate-100 rounded border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
            <Building2 className="w-12 h-12 text-slate-400 mb-3" />
            <h4 className="font-serif font-semibold text-slate-800 text-sm">Venue Map & Directions Placeholder</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Interactive map widget and campus directions will be integrated here.
            </p>
          </div>
        </div>
      </section>

      {/* 9. REGISTRATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-academic-navy text-white rounded-md p-8 md:p-12 text-center space-y-6 border-b-4 border-academic-gold shadow-lg">
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
            Ready to Submit Your Research or Register as Delegate?
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Early bird registration discounts are active. Submit your research papers early to facilitate timely peer review.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="gold" size="lg">
                Create Account & Register
              </Button>
            </Link>
            <Link href="/call-for-papers">
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-slate-600 hover:bg-white/20">
                Author Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
