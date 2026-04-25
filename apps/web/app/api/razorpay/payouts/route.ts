import { NextResponse } from "next/server";
import { getServerSession } from "@/shared/auth/server-session";
import { createRazorpayBankFundAccount, createRazorpayBankPayout, createRazorpayContact } from "@/shared/lib/razorpay-server";
import type { RazorpayPayoutMode } from "@/shared/lib/razorpay";

export const runtime = "nodejs";

const SUPPORTED_MODES = new Set<RazorpayPayoutMode>(["IMPS", "NEFT", "RTGS"]);

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  if (session.accountType !== "SOCIETY") {
    return NextResponse.json({ message: "Only society staff can initiate bank settlements." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as {
      beneficiaryName?: unknown;
      beneficiaryEmail?: unknown;
      beneficiaryPhone?: unknown;
      accountNumber?: unknown;
      ifsc?: unknown;
      amount?: unknown;
      mode?: unknown;
      purpose?: unknown;
      narration?: unknown;
      referenceId?: unknown;
    };

    if (
      typeof payload.beneficiaryName !== "string" ||
      typeof payload.accountNumber !== "string" ||
      typeof payload.ifsc !== "string" ||
      typeof payload.amount !== "number" ||
      typeof payload.mode !== "string" ||
      typeof payload.purpose !== "string"
    ) {
      return NextResponse.json({ message: "Please complete the beneficiary and amount details." }, { status: 400 });
    }

    const mode = payload.mode.toUpperCase() as RazorpayPayoutMode;
    if (!SUPPORTED_MODES.has(mode)) {
      return NextResponse.json({ message: "Unsupported payout mode selected." }, { status: 400 });
    }

    const referenceId =
      typeof payload.referenceId === "string" && payload.referenceId.trim()
        ? payload.referenceId.trim()
        : `settlement-${Date.now()}`;

    const contact = await createRazorpayContact({
      name: payload.beneficiaryName.trim(),
      email: typeof payload.beneficiaryEmail === "string" ? payload.beneficiaryEmail.trim() : undefined,
      contact: typeof payload.beneficiaryPhone === "string" ? payload.beneficiaryPhone.trim() : undefined,
      referenceId,
      notes: {
        initiatedBy: session.username,
        societyCode: session.societyCode ?? "society"
      }
    });

    const fundAccount = await createRazorpayBankFundAccount({
      contactId: contact.id,
      beneficiaryName: payload.beneficiaryName.trim(),
      accountNumber: payload.accountNumber.replace(/\s+/g, ""),
      ifsc: payload.ifsc.trim().toUpperCase()
    });

    const payout = await createRazorpayBankPayout({
      fundAccountId: fundAccount.id,
      amount: payload.amount,
      mode,
      purpose: payload.purpose.trim(),
      referenceId,
      narration: typeof payload.narration === "string" ? payload.narration.trim() : undefined,
      notes: {
        contactId: contact.id,
        fundAccountId: fundAccount.id,
        initiatedBy: session.fullName
      }
    });

    return NextResponse.json({
      payout: {
        id: payout.id,
        status: payout.status,
        amount: payout.amount,
        currency: payout.currency,
        mode: payout.mode,
        purpose: payout.purpose,
        fundAccountId: payout.fund_account_id,
        contactId: contact.id,
        referenceId: payout.reference_id ?? referenceId,
        utr: payout.utr ?? null,
        narration: payout.narration ?? null
      }
    });
  } catch (caught) {
    return NextResponse.json(
      { message: caught instanceof Error ? caught.message : "Unable to create the bank payout." },
      { status: 500 }
    );
  }
}
