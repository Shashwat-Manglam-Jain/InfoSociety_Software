import { NextResponse } from "next/server";
import { getServerSession } from "@/shared/auth/server-session";
import { verifyRazorpayPaymentSignature } from "@/shared/lib/razorpay-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    orderId?: unknown;
    razorpayOrderId?: unknown;
    razorpayPaymentId?: unknown;
    razorpaySignature?: unknown;
  };

  if (
    typeof payload.orderId !== "string" ||
    typeof payload.razorpayOrderId !== "string" ||
    typeof payload.razorpayPaymentId !== "string" ||
    typeof payload.razorpaySignature !== "string"
  ) {
    return NextResponse.json({ message: "Incomplete Razorpay verification payload." }, { status: 400 });
  }

  if (payload.orderId !== payload.razorpayOrderId) {
    return NextResponse.json({ message: "Order mismatch detected during Razorpay verification." }, { status: 400 });
  }

  const verified = verifyRazorpayPaymentSignature({
    orderId: payload.orderId,
    razorpayPaymentId: payload.razorpayPaymentId,
    razorpaySignature: payload.razorpaySignature
  });

  if (!verified) {
    return NextResponse.json({ message: "Razorpay signature verification failed." }, { status: 400 });
  }

  return NextResponse.json({
    verified: true,
    orderId: payload.orderId,
    paymentId: payload.razorpayPaymentId
  });
}
