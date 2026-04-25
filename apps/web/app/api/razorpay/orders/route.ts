import { NextResponse } from "next/server";
import { getServerSession } from "@/shared/auth/server-session";
import { createRazorpayOrder, getRazorpayMerchantName, getRazorpayPaymentKeyId } from "@/shared/lib/razorpay-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      amount?: unknown;
      title?: unknown;
      requestId?: unknown;
      societyCode?: unknown;
      purpose?: unknown;
      initiatedByRole?: unknown;
      paymentMethod?: unknown;
    };

    if (typeof payload.amount !== "number" || payload.amount <= 0) {
      return NextResponse.json({ message: "A valid payment amount is required." }, { status: 400 });
    }

    const requestId = typeof payload.requestId === "string" && payload.requestId.trim() ? payload.requestId.trim() : `req-${Date.now()}`;
    const societyCode = typeof payload.societyCode === "string" && payload.societyCode.trim() ? payload.societyCode.trim() : "society";
    const order = await createRazorpayOrder({
      amount: payload.amount,
      receipt: `${societyCode}-${requestId}`.slice(0, 40),
      notes: {
        requestId,
        societyCode,
        title: typeof payload.title === "string" ? payload.title.slice(0, 80) : "Society payment",
        purpose: typeof payload.purpose === "string" ? payload.purpose.slice(0, 40) : "PAYMENT",
        initiatedByRole: typeof payload.initiatedByRole === "string" ? payload.initiatedByRole.slice(0, 30) : session.role,
        paymentMethod: typeof payload.paymentMethod === "string" ? payload.paymentMethod.slice(0, 30) : "DIGITAL"
      }
    });

    return NextResponse.json({
      keyId: getRazorpayPaymentKeyId(),
      merchantName: getRazorpayMerchantName(),
      order
    });
  } catch (caught) {
    return NextResponse.json(
      { message: caught instanceof Error ? caught.message : "Unable to create the Razorpay order." },
      { status: 500 }
    );
  }
}
