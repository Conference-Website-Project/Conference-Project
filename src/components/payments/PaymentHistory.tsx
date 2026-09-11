"use client";

import React from "react";
import { Payment, RegistrationCategory } from "@/types/database";
import { CATEGORY_DETAILS } from "@/lib/payments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Receipt, CheckCircle, Clock, XCircle, RefreshCcw } from "lucide-react";

interface PaymentHistoryProps {
  payments: Payment[];
  category?: RegistrationCategory;
  onViewReceipt: (payment: Payment) => void;
}

export function PaymentHistory({ payments, category, onViewReceipt }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No Payment Records Found"
        description="Once you complete conference registration fee payment via Razorpay, transaction receipts and status will be logged here."
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESSFUL":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            <CheckCircle className="w-3 h-3" /> SUCCESSFUL
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            <XCircle className="w-3 h-3" /> FAILED
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            <RefreshCcw className="w-3 h-3" /> REFUNDED
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card bordered accentBorder="navy" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
        <div>
          <CardTitle>Transaction Receipts & Payment Log</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Official payment gateway transaction history for ICARET 2027</p>
        </div>
        <Badge variant="navy">{payments.length} Transaction{payments.length > 1 ? "s" : ""}</Badge>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category / Purpose</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {payments.map((p) => {
              const formattedDate = new Date(p.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">{formattedDate}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-academic-navy">
                      {category && CATEGORY_DETAILS[category] ? CATEGORY_DETAILS[category].title : "Registration Fee"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-serif font-bold text-slate-900 whitespace-nowrap">
                    ₹ {Number(p.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {p.gateway_payment_id || p.transaction_reference || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {p.razorpay_order_id ? `${p.razorpay_order_id.slice(0, 14)}...` : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {p.status === "SUCCESSFUL" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewReceipt(p)}
                        className="h-7 text-[11px] px-2.5"
                        leftIcon={<Receipt className="w-3 h-3" />}
                      >
                        Receipt
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
