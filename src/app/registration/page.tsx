import React from "react";
import Link from "next/link";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, ShieldCheck, ArrowRight } from "lucide-react";

export default function RegistrationPage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Registration Portal"
        title="Conference Registration Fees & Policy"
        subtitle="Select your delegate category and proceed to complete author/participant registration."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.fees.map((fee, idx) => (
          <Card key={idx} bordered accentBorder={idx === 1 ? "gold" : "navy"} hoverable>
            <CardHeader>
              <Badge variant={idx === 1 ? "gold" : "navy"}>{idx === 1 ? "Recommended" : "Delegate"}</Badge>
              <CardTitle className="mt-2 text-base">{fee.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-2xl font-bold font-serif text-academic-navy">{fee.indianAmount}</span>
                <span className="text-xs text-slate-500 block">(Indian Delegates)</span>
              </div>
              <div>
                <span className="text-xl font-semibold font-serif text-slate-700">{fee.foreignAmount}</span>
                <span className="text-xs text-slate-500 block">(International Delegates)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Access to all technical sessions</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Conference kit & proceedings PDF</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lunch & banquet dinner included</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link href="/register">
                  <Button variant={idx === 1 ? "gold" : "primary"} size="sm" className="w-full justify-center">
                    Register Category
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
