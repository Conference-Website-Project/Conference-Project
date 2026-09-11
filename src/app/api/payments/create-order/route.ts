import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateRegistrationFee } from "@/lib/payments";
import { RegistrationCategory } from "@/types/database";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user session via Supabase server client
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to register." },
        { status: 401 }
      );
    }

    // 2. Parse and validate input payload
    const body = await request.json();
    const { category, paper_id, dietary_requirements } = body;

    const validCategories: RegistrationCategory[] = ["STUDENT", "FACULTY", "INDUSTRY", "ATTENDEE_ONLY"];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid registration category selected." },
        { status: 400 }
      );
    }

    // 3. SERVER-SIDE fee calculation — NEVER trust client amount
    const feeInfo = calculateRegistrationFee(category);
    const amountInPaise = Math.round(feeInfo.amount * 100);

    const conferenceId = process.env.NEXT_PUBLIC_CONFERENCE_ID || "conf-2027-001";

    // 4. Validate optional paper linkage
    if (paper_id) {
      const { data: paper } = await supabase
        .from("papers")
        .select("id, author_user_id, submitted_by")
        .eq("id", paper_id)
        .maybeSingle();

      if (paper && paper.author_user_id !== user.id && paper.submitted_by !== user.id) {
        return NextResponse.json(
          { error: "Selected paper does not belong to your account." },
          { status: 403 }
        );
      }
    }

    // 5. Check if user is already paid for this conference
    const { data: existingReg } = await supabase
      .from("registrations")
      .select("id, is_paid")
      .eq("conference_id", conferenceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingReg?.is_paid) {
      return NextResponse.json(
        { error: "You have already completed and paid registration for this conference." },
        { status: 409 }
      );
    }

    // 6. Initialize Razorpay credentials
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keySecret.includes("your_razorpay")) {
      return NextResponse.json(
        {
          error: "Payment gateway credentials are not yet configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local.",
          needsConfig: true,
        },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 7. Upsert registration record in database
    const adminSupabase = createAdminClient() || supabase;

    let registrationId = existingReg?.id;
    if (registrationId) {
      // Update existing unpaid registration category & amount
      const { error: updateError } = await adminSupabase
        .from("registrations")
        .update({
          category,
          amount_due: feeInfo.amount,
          paper_id: paper_id || null,
          dietary_requirements: dietary_requirements || null,
        })
        .eq("id", registrationId);

      if (updateError) {
        console.error("Error updating registration:", updateError.message);
      }
    } else {
      const { data: newReg, error: insertError } = await adminSupabase
        .from("registrations")
        .insert({
          conference_id: conferenceId,
          user_id: user.id,
          category,
          amount_due: feeInfo.amount,
          currency: "INR",
          is_paid: false,
          paper_id: paper_id || null,
          dietary_requirements: dietary_requirements || null,
        })
        .select("id")
        .single();

      if (insertError || !newReg) {
        return NextResponse.json(
          { error: insertError?.message || "Failed to initiate registration record." },
          { status: 500 }
        );
      }
      registrationId = newReg.id;
    }

    // 8. Create Razorpay order
    const receiptCode = `rcpt_${registrationId.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptCode,
      notes: {
        registration_id: registrationId,
        user_id: user.id,
        category,
        conference_id: conferenceId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // 9. Log PENDING payment record
    const { error: payInsertError } = await adminSupabase.from("payments").insert({
      registration_id: registrationId,
      user_id: user.id,
      amount: feeInfo.amount,
      currency: "INR",
      status: "PENDING",
      razorpay_order_id: razorpayOrder.id,
      payment_method: "RAZORPAY",
    });

    if (payInsertError) {
      console.warn("Could not insert pending payment log:", payInsertError.message);
    }

    // 10. Return checkout parameters (DO NOT return private secrets)
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: feeInfo.amount,
      currency: "INR",
      keyId,
      registrationId,
      category: feeInfo.category,
      categoryTitle: feeInfo.title,
    });
  } catch (error: any) {
    console.error("Payment order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error creating payment order." },
      { status: 500 }
    );
  }
}
