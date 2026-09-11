import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Extract payload
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    // 3. Obtain server private secret
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment gateway secret is not configured on server." },
        { status: 500 }
      );
    }

    // 4. Cryptographic HMAC SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

    if (!isSignatureValid) {
      console.warn(`SECURITY ALERT: Invalid Razorpay signature attempt for user ${user.id}, order ${razorpay_order_id}`);
      return NextResponse.json(
        { error: "Payment verification failed: invalid signature. Transaction was not confirmed." },
        { status: 400 }
      );
    }

    // 5. Query pending payment record
    const adminSupabase = createAdminClient() || supabase;

    const { data: paymentRecord, error: findError } = await adminSupabase
      .from("payments")
      .select("id, registration_id, user_id, amount, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (findError || !paymentRecord) {
      return NextResponse.json(
        { error: "Corresponding order record not found in system." },
        { status: 404 }
      );
    }

    // Ensure the order belongs to the authenticated user
    if (paymentRecord.user_id !== user.id) {
      console.warn(`SECURITY ALERT: User ${user.id} tried to verify order ${razorpay_order_id} belonging to ${paymentRecord.user_id}`);
      return NextResponse.json(
        { error: "Access denied: order does not belong to the current authenticated account." },
        { status: 403 }
      );
    }

    // Generate formatted receipt number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `ICARET27-REC-${randomSuffix}`;

    // 6. Atomically update payment to SUCCESSFUL and registration is_paid = true
    const { error: payUpdateError } = await adminSupabase
      .from("payments")
      .update({
        status: "SUCCESSFUL",
        gateway_payment_id: razorpay_payment_id,
        transaction_reference: razorpay_payment_id,
        razorpay_signature,
        receipt_number: receiptNumber,
      })
      .eq("id", paymentRecord.id);

    if (payUpdateError) {
      console.error("Error updating payment status:", payUpdateError.message);
    }

    const { error: regUpdateError } = await adminSupabase
      .from("registrations")
      .update({
        is_paid: true,
      })
      .eq("id", paymentRecord.registration_id);

    if (regUpdateError) {
      console.error("Error updating registration is_paid:", regUpdateError.message);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully. Registration confirmed.",
      receiptNumber,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: paymentRecord.amount,
    });
  } catch (error: any) {
    console.error("Payment verification route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during payment verification." },
      { status: 500 }
    );
  }
}
