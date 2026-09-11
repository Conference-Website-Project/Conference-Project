"use client";

import React from "react";
import { Profile, Registration, Payment } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { CATEGORY_DETAILS } from "@/lib/payments";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Printer, CheckCircle2, Building2, ShieldCheck, Download } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  registration: Registration | null;
  profile: Profile;
}

export function ReceiptModal({
  isOpen,
  onClose,
  payment,
  registration,
  profile,
}: ReceiptModalProps) {
  if (!payment) return null;

  const config = defaultConferenceConfig;
  const categoryKey = registration?.category;
  const categoryTitle = categoryKey && CATEGORY_DETAILS[categoryKey] 
    ? CATEGORY_DETAILS[categoryKey].title 
    : "Conference Delegate Registration";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const receiptDate = new Date(payment.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registration Fee Receipt" size="lg">
      <div className="space-y-6 text-slate-800">
        {/* Printable Area */}
        <div id="conference-receipt" className="border border-slate-300 rounded-lg p-6 sm:p-8 bg-white space-y-6 shadow-xs">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="text-xs font-bold font-mono text-amber-700 tracking-wider uppercase">
                {config.shortName} • Official Fee Receipt
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-academic-navy">
                {config.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Organized by {config.institution}, {config.location.city}, {config.location.country}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Receipt No.</span>
              <span className="font-mono font-bold text-sm text-slate-900 block">
                {payment.receipt_number || `ICARET27-REC-${payment.id.slice(0, 6).toUpperCase()}`}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">{receiptDate}</span>
            </div>
          </div>

          {/* Delegate & Conference Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5 p-4 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To (Delegate)</span>
              <p className="font-bold text-slate-900 text-sm">{profile.full_name}</p>
              <p className="text-slate-600">{profile.email}</p>
              <p className="text-slate-600">{profile.institution}</p>
              <p className="text-slate-500">{profile.designation ? `${profile.designation}, ` : ""}{profile.country}</p>
            </div>

            <div className="space-y-1.5 p-4 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conference Details</span>
              <p className="font-bold text-academic-navy text-sm">{config.shortName}</p>
              <p className="text-slate-600">Event Dates: {config.dates.formatted}</p>
              <p className="text-slate-600">Venue: {config.location.venue}</p>
              {registration?.paper_id && (
                <p className="font-mono text-academic-blue font-semibold">
                  Linked Paper ID: {registration.paper_id}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Item Description</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">Conference Delegate Admission & Participation Kit</p>
                    <p className="text-[11px] text-slate-500">
                      Technical sessions, conference proceedings, banquet & networking sessions.
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-academic-navy">
                    {categoryTitle}
                  </td>
                  <td className="px-4 py-3 text-right font-serif font-bold text-slate-900 whitespace-nowrap">
                    ₹ {Number(payment.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="px-4 py-2.5 text-right font-bold text-slate-700">
                    Total Amount Paid:
                  </td>
                  <td className="px-4 py-2.5 text-right font-serif font-bold text-base text-academic-navy">
                    ₹ {Number(payment.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Transaction Metadata Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-500">
            <div>
              <span className="font-semibold text-slate-700 block">Payment Method:</span>
              <span className="font-mono">Razorpay Online Gateway</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Gateway Transaction ID:</span>
              <span className="font-mono">{payment.gateway_payment_id || payment.transaction_reference || "—"}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Payment Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESSFUL
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900">
            This is a computer-generated conference receipt issued for {config.shortName}. Valid for institutional reimbursement claims and delegate presentation records.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="gold" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
