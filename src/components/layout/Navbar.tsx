"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultConferenceConfig } from "@/config/conference";
import { Menu, X, User, LayoutDashboard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/call-for-papers", label: "Call for Papers" },
    { href: "/important-dates", label: "Important Dates" },
    { href: "/speakers", label: "Speakers" },
    { href: "/committee", label: "Committee" },
    { href: "/program", label: "Program" },
    { href: "/registration", label: "Registration" },
    { href: "/venue", label: "Venue" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-subtle">
      {/* Top Banner Notice */}
      <div className="bg-academic-navy text-slate-200 px-4 py-1.5 text-xs font-sans border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-academic-gold text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
              Upcoming
            </span>
            <span className="text-slate-300 font-medium">
              {defaultConferenceConfig.shortName} • {defaultConferenceConfig.dates.formatted} • {defaultConferenceConfig.location.city}, {defaultConferenceConfig.location.country}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-slate-400">
            <span>Official Academic Platform</span>
            <span>|</span>
            <a href={`mailto:${defaultConferenceConfig.contact.email}`} className="hover:text-white transition-colors">
              {defaultConferenceConfig.contact.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Institution & Conference Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-md bg-academic-blue text-white flex items-center justify-center font-serif font-bold text-lg border border-blue-900 shadow-xs group-hover:bg-academic-navy transition-colors">
              IC
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-academic-navy tracking-tight leading-snug group-hover:text-academic-blue transition-colors">
                {defaultConferenceConfig.shortName}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {defaultConferenceConfig.institution}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-xs font-medium tracking-wide transition-colors rounded ${
                  isActive(link.href)
                    ? "text-academic-blue bg-blue-50 font-semibold border-b-2 border-academic-blue"
                    : "text-slate-700 hover:text-academic-blue hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="outline" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
                Login
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-academic-blue"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-academic-blue text-white font-semibold"
                  : "text-slate-800 hover:bg-slate-200"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-slate-200 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" className="w-full justify-center">
                Register Now
              </Button>
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full justify-center">
                Admin Console
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
