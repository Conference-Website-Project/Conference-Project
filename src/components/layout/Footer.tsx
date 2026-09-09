import React from "react";
import Link from "next/link";
import { defaultConferenceConfig } from "@/config/conference";
import { Mail, Phone, MapPin, ExternalLink, ShieldAlert } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-academic-navy text-slate-300 font-sans border-t-4 border-academic-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Institution & Conference Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-white text-academic-navy flex items-center justify-center font-serif font-bold text-lg border border-slate-300">
                IC
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-lg tracking-tight">
                  {defaultConferenceConfig.shortName}
                </h3>
                <p className="text-xs text-amber-400 font-medium">{defaultConferenceConfig.dates.formatted}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {defaultConferenceConfig.name}. Organised by {defaultConferenceConfig.institution}. Designed for long-term multi-year academic conference governance.
            </p>
            <div className="text-xs text-slate-400">
              <span className="inline-block px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
                Platform Edition: 2027.v1
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Conference
                </Link>
              </li>
              <li>
                <Link href="/call-for-papers" className="hover:text-amber-400 transition-colors">
                  Call for Papers & Guidelines
                </Link>
              </li>
              <li>
                <Link href="/important-dates" className="hover:text-amber-400 transition-colors">
                  Important Deadlines
                </Link>
              </li>
              <li>
                <Link href="/speakers" className="hover:text-amber-400 transition-colors">
                  Keynote Speakers
                </Link>
              </li>
              <li>
                <Link href="/committee" className="hover:text-amber-400 transition-colors">
                  Organizing Committee
                </Link>
              </li>
              <li>
                <Link href="/program" className="hover:text-amber-400 transition-colors">
                  Conference Program Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Registration & Authors */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              For Authors & Attendees
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/registration" className="hover:text-amber-400 transition-colors">
                  Registration Fees & Categories
                </Link>
              </li>
              <li>
                <Link href="/venue" className="hover:text-amber-400 transition-colors">
                  Venue & Accommodations
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Author Submission Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-400 transition-colors">
                  Create Participant Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
                  My Submissions Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-400">
                  <span>Admin Portal</span>
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Secretariat */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              Conference Secretariat
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{defaultConferenceConfig.contact.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${defaultConferenceConfig.contact.email}`} className="hover:underline">
                  {defaultConferenceConfig.contact.email}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{defaultConferenceConfig.contact.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {defaultConferenceConfig.institution}. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/contact" className="hover:text-slate-200 transition-colors">
              Contact Secretariat
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Multi-Year Academic Conference Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
