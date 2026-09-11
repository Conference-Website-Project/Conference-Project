import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret.includes("your_razorpay")) {
      return NextResponse.json(
        { error: "Webhook secret is not configured on this server." },
        { status: 503 }
      );
    }

    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // Read raw body as text for HMAC verification
    const rawBody = await request.text();

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );

    if (!isSignatureValid) {
      console.warn("SECURITY ALERT: Invalid Razorpay webhook signature received.");
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    // Parse event payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      // Acknowledgement for events not associated with an order
      return NextResponse.json({ status: "ignored_no_order_id" });
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json({ error: "Supabase service client unavailable" }, { status: 500 });
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      // 1. Locate payment record
      const { data: paymentRecord } = await adminSupabase
        .from("payments")
        .select("id, registration_id, status, receipt_number")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (paymentRecord) {
        // Idempotency: If already SUCCESSFUL, don't re-process
        if (paymentRecord.status !== "SUCCESSFUL") {
          const receiptNumber = paymentRecord.receipt_number || `ICARET27-REC-${Math.floor(1000 + Math.random() * 9000)}`;

          await adminSupabase
            .from("payments")
            .update({
              status: "SUCCESSFUL",
              gateway_payment_id: paymentId,
              transaction_reference: paymentId,
              receipt_number: receiptNumber,
            })
            .eq("id", paymentRecord.id);

          await adminSupabase
            .from("registrations")
            .update({ is_paid: true })
            .eq("id", paymentRecord.registration_id);
        }
      }
    } else if (eventType === "payment.failed") {
      const { data: paymentRecord } = await adminSupabase
        .from("payments")
        .select("id, status")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (paymentRecord && paymentRecord.status === "PENDING") {
        await adminSupabase
          .from("payments")
          .update({
            status: "FAILED",
            gateway_payment_id: paymentId,
          })
          .eq("id", paymentRecord.id);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
