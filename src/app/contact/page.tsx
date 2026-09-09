import React from "react";
import { defaultConferenceConfig } from "@/config/conference";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const config = defaultConferenceConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <SectionHeading
        badge="Conference Helpdesk"
        title="Contact Conference Secretariat"
        subtitle="For inquiries regarding paper submission, registration, or sponsorship."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card bordered accentBorder="navy">
            <CardHeader>
              <CardTitle>Official Secretariat Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-academic-blue shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-academic-navy block">Postal Address</span>
                  <span>{config.contact.address}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-academic-blue shrink-0" />
                <div>
                  <span className="font-bold text-academic-navy block">Official Email</span>
                  <span>{config.contact.email}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-academic-blue shrink-0" />
                <div>
                  <span className="font-bold text-academic-navy block">Helpdesk Phone</span>
                  <span>{config.contact.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card bordered accentBorder="gold">
            <CardHeader>
              <CardTitle>Send an Inquiry to Organizing Committee</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="e.g. Dr. John Doe" required />
                  <Input label="Email Address" type="email" placeholder="john@university.edu" required />
                </div>
                <Input label="Subject / Paper ID" placeholder="Inquiry topic or Paper ID (if applicable)" />
                <Textarea label="Message Details" placeholder="Type your query regarding paper submission or registration..." required />
                <Button variant="primary" size="md" rightIcon={<Send className="w-4 h-4" />}>
                  Submit Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
