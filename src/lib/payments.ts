import { defaultConferenceConfig } from "@/config/conference";
import { RegistrationCategory, PaymentStatus, Registration, Payment } from "@/types/database";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export interface CategoryFeeInfo {
  category: RegistrationCategory;
  title: string;
  amount: number; // in INR
  currency: string;
  formattedAmount: string;
  foreignAmount: string;
  description: string;
}

export const CATEGORY_DETAILS: Record<RegistrationCategory, { title: string; configIndex: number; description: string }> = {
  STUDENT: {
    title: "Full-time Student / Scholar",
    configIndex: 0,
    description: "For registered PhD, Masters, or Undergraduate students with valid student ID.",
  },
  FACULTY: {
    title: "Academic Delegate / Faculty",
    configIndex: 1,
    description: "For professors, lecturers, and academic researchers presenting or attending.",
  },
  INDUSTRY: {
    title: "Industry Delegate",
    configIndex: 2,
    description: "For corporate researchers, engineers, and industry professionals.",
  },
  ATTENDEE_ONLY: {
    title: "Attendee Only (Non-Author)",
    configIndex: 3,
    description: "General participant access to all keynote and technical sessions without paper presentation.",
  },
};

/**
 * Parses numeric integer from string formatted like "₹ 4,500"
 */
function parseNumericAmount(amountStr: string): number {
  const digits = amountStr.replace(/[^0-9]/g, "");
  return parseInt(digits, 10) || 0;
}

/**
 * Calculates the official registration fee SERVER-SIDE based on registration category.
 * This guarantees the frontend cannot manipulate the price.
 */
export function calculateRegistrationFee(category: RegistrationCategory): CategoryFeeInfo {
  const detail = CATEGORY_DETAILS[category];
  if (!detail) {
    throw new Error(`Invalid registration category: ${category}`);
  }

  const feeConfig = defaultConferenceConfig.fees[detail.configIndex];
  const amount = parseNumericAmount(feeConfig.indianAmount);

  return {
    category,
    title: detail.title,
    amount,
    currency: "INR",
    formattedAmount: `₹ ${amount.toLocaleString("en-IN")}`,
    foreignAmount: feeConfig.foreignAmount,
    description: detail.description,
  };
}

/**
 * Formats a clean human-readable receipt number
 */
export function formatReceiptNumber(seqNumber: number | string): string {
  const padded = seqNumber.toString().padStart(4, "0");
  return `ICARET27-REC-${padded}`;
}

/**
 * Fetches user registration and associated payments
 */
export async function fetchUserRegistrationData(userId: string): Promise<{
  registration: Registration | null;
  payments: Payment[];
  error: string | null;
}> {
  try {
    const supabase = createBrowserClient();

    const { data: regData, error: regError } = await supabase
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (regError) {
      console.warn("Error querying registrations:", regError.message);
    }

    const { data: paymentsData, error: payError } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (payError) {
      console.warn("Error querying payments:", payError.message);
    }

    return {
      registration: (regData as Registration) || null,
      payments: (paymentsData as Payment[]) || [],
      error: null,
    };
  } catch (err: any) {
    return {
      registration: null,
      payments: [],
      error: err.message || "Failed to load registration data",
    };
  }
}
