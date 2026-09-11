"use client";

import React, { useState, useEffect } from "react";
import { Profile, Registration, RegistrationCategory, PaperWithDetails } from "@/types/database";
import { defaultConferenceConfig } from "@/config/conference";
import { calculateRegistrationFee, CATEGORY_DETAILS } from "@/lib/payments";
import { fetchUserPapers } from "@/lib/papers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { 
  CheckCircle2, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Lock, 
  Receipt,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface RegistrationCheckoutProps {
  profile: Profile;
  initialRegistration: Registration | null;
  onPaymentCompleted: () => void;
  onOpenReceipt?: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RegistrationCheckout({
  profile,
  initialRegistration,
  onPaymentCompleted,
  onOpenReceipt,
}: RegistrationCheckoutProps) {
  const [selectedCategory, setSelectedCategory] = useState<RegistrationCategory>(
    initialRegistration?.category || (profile.participation_type === "AUTHOR" ? "STUDENT" : "ATTENDEE_ONLY")
  );
  const [selectedPaperId, setSelectedPaperId] = useState<string>(initialRegistration?.paper_id || "");
  const [dietary, setDietary] = useState<string>(initialRegistration?.dietary_requirements || "Standard");
  const [userPapers, setUserPapers] = useState<PaperWithDetails[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const config = defaultConferenceConfig;
  const currentFee = calculateRegistrationFee(selectedCategory);

  useEffect(() => {
    async function loadPapers() {
      if (profile.id) {
        const papers = await fetchUserPapers(profile.id);
        setUserPapers(papers);
        setSelectedPaperId((prev) => prev || (papers.length > 0 ? papers[0].id : ""));
      }
    }
    loadPapers();
  }, [profile.id]);

  // If already paid, show confirmed status card
  if (initialRegistration?.is_paid) {
    const feeInfo = calculateRegistrationFee(initialRegistration.category);
    return (
      <Card bordered accentBorder="gold" className="shadow-md">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-emerald-900">Registration Confirmed</CardTitle>
                <Badge variant="gold">PAID</Badge>
              </div>
              <p className="text-xs text-emerald-700">Official delegate admission for {config.shortName}</p>
            </div>
          </div>
          {onOpenReceipt && (
            <Button variant="outline" size="sm" onClick={onOpenReceipt} leftIcon={<Receipt className="w-3.5 h-3.5" />}>
              View Receipt
            </Button>
          )}
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Registered Category:</span>
              <span className="font-bold text-academic-navy text-sm block mt-0.5">{feeInfo.title}</span>
              <span className="text-[11px] text-slate-500 font-mono">({initialRegistration.category})</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Amount Paid:</span>
              <span className="font-bold font-serif text-academic-navy text-base block mt-0.5">
                ₹ {initialRegistration.amount_due.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Payment Verified</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Registration Date:</span>
              <span className="font-bold text-slate-800 text-xs block mt-0.5">
                {new Date(initialRegistration.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="text-[11px] text-slate-500">ICARET 2027 Portal</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded text-xs text-academic-navy space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-academic-blue">
              <ShieldCheck className="w-4 h-4" /> Delegate Package Access Unlocked
            </span>
            <p className="text-slate-600">
              Your registration includes access to all technical sessions, conference kit, tea/lunch banquet on April 15–17, 2027, and peer-reviewed conference proceedings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle Checkout initiation
  const handleProceedToPayment = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Preload Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMessage("Unable to load Razorpay payment SDK. Please check your internet connection and retry.");
        setIsLoading(false);
        return;
      }

      // 2. Call server order creation endpoint
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          paper_id: selectedPaperId || null,
          dietary_requirements: dietary,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        if (orderData.needsConfig) {
          setErrorMessage("Payment gateway keys are not configured in .env.local on this server.");
        } else {
          setErrorMessage(orderData.error || "Failed to create payment order.");
        }
        setIsLoading(false);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const razorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // amount in paise
        currency: orderData.currency || "INR",
        name: "ICARET 2027",
        description: `Conference Registration - ${orderData.categoryTitle}`,
        image: defaultConferenceConfig.socialLinks ? undefined : undefined,
        order_id: orderData.orderId,
        prefill: {
          name: profile.full_name,
          email: profile.email,
          contact: profile.phone || "",
        },
        notes: {
          category: selectedCategory,
          conference_id: defaultConferenceConfig.id,
        },
        theme: {
          color: "#0f172a", // academic navy
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
        handler: async function (response: any) {
          // 4. Send cryptographic verification payload to server
          try {
            setIsLoading(true);
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setSuccessMessage("Payment confirmed! Registration completed successfully.");
              onPaymentCompleted();
            } else {
              setErrorMessage(verifyData.error || "Payment signature verification failed.");
            }
          } catch (err: any) {
            setErrorMessage("Network error during payment verification. Please contact the conference desk.");
          } finally {
            setIsLoading(false);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(razorpayOptions);
      razorpayInstance.on("payment.failed", function (response: any) {
        setErrorMessage(`Payment failed: ${response.error.description || response.error.reason}`);
        setIsLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const categories: RegistrationCategory[] = ["STUDENT", "FACULTY", "INDUSTRY", "ATTENDEE_ONLY"];

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Selection Grid */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-serif font-bold text-academic-navy">1. Select Delegate Category</h3>
          <p className="text-xs text-slate-500">
            Registration fee is calculated based on academic status and conference participation mode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((catKey) => {
            const fee = calculateRegistrationFee(catKey);
            const isSelected = selectedCategory === catKey;

            return (
              <div
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`p-4 rounded-md border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-academic-blue bg-blue-50/40 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={catKey === "FACULTY" ? "gold" : "navy"}>
                      {catKey === "STUDENT" ? "Scholar" : catKey}
                    </Badge>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-academic-blue shrink-0" />}
                  </div>

                  <h4 className="font-serif font-bold text-academic-navy text-sm">{fee.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{fee.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <div className="text-xl font-bold font-serif text-academic-navy">{fee.formattedAmount}</div>
                  <span className="text-[10px] text-slate-400 block">(International: {fee.foreignAmount})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Details & Paper Linkage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <Card bordered accentBorder="navy">
            <CardHeader>
              <CardTitle className="text-sm">2. Delegate Information & Paper Linkage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {userPapers.length > 0 && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Link Accepted / Submitted Paper (Optional for authors)
                  </label>
                  <select
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-academic-blue"
                  >
                    <option value="">-- No Paper Linked (Attendee Only) --</option>
                    {userPapers.map((paper) => (
                      <option key={paper.id} value={paper.id}>
                        [{paper.paper_id || "ID"}] {paper.title.slice(0, 60)}... ({paper.status})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Paper ID will be printed on your official conference registration receipt.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dietary Preferences for Banquet</label>
                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-academic-blue"
                >
                  <option value="Vegetarian">Vegetarian (North/South Indian)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Jain Meal">Jain Meal</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <span className="text-slate-500 block">Registration Delegate:</span>
                <span className="font-bold text-slate-800">{profile.full_name}</span>
                <span className="text-slate-600 block">{profile.institution} • {profile.country}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Order Summary */}
        <div className="md:col-span-5 space-y-4">
          <Card bordered accentBorder="gold" className="shadow-subtle">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm">3. Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs pt-4">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Category:</span>
                <span className="font-semibold text-slate-900">{currentFee.title}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">Conference:</span>
                <span className="font-semibold text-academic-navy">{config.shortName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-600">GST / Taxes:</span>
                <span className="font-semibold text-emerald-700">Included in Registration</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-800 text-sm">Total Payable:</span>
                <span className="text-2xl font-bold font-serif text-academic-navy">{currentFee.formattedAmount}</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  size="md"
                  onClick={handleProceedToPayment}
                  isLoading={isLoading}
                  className="w-full justify-center shadow-sm"
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Proceed to Pay via Razorpay
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted • Powered by Razorpay</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
