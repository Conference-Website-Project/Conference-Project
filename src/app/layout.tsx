import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { defaultConferenceConfig } from "@/config/conference";

export const metadata: Metadata = {
  title: `${defaultConferenceConfig.shortName} - ${defaultConferenceConfig.name}`,
  description: `${defaultConferenceConfig.name}. ${defaultConferenceConfig.theme}. Organised by ${defaultConferenceConfig.institution}.`,
  keywords: ["academic conference", "research papers", "call for papers", "peer review", defaultConferenceConfig.shortName],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
