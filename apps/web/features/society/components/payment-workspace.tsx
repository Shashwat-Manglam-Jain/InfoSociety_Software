"use client";

import { useEffect, useMemo, useState } from "react";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  createRazorpayBankPayoutRequest,
  createRazorpayCheckoutOrder,
  verifyRazorpayCheckoutOrder
} from "@/shared/api/razorpay";
import {
  createPaymentRequest,
  getPaymentsOverview,
  listPaymentRequests,
  listPaymentTransactions,
  payPaymentRequest
} from "@/shared/api/payments";
import {
  formatCheckoutPrefillContact,
  isRazorpayDigitalMethod,
  mapPaymentMethodToRazorpay,
  RAZORPAY_CHECKOUT_SCRIPT_URL,
  type RazorpayPayoutMode
} from "@/shared/lib/razorpay";
import type {
  PaymentMethod,
  PaymentPurpose,
  PaymentRequestItem,
  PaymentTransactionItem,
  PaymentsOverview,
  UserRole
} from "@/shared/types";
import { toast } from "@/shared/ui/toast";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";

type PaymentWorkspaceCustomer = {
  id: string;
  fullName: string;
  customerCode: string;
};

type PaymentWorkspaceProps = {
  token: string;
  role: UserRole;
  customers?: PaymentWorkspaceCustomer[];
  canCreateRequests?: boolean;
  viewerName?: string;
  viewerEmail?: string | null;
  viewerPhone?: string | null;
  allowBankSettlement?: boolean;
};

type PaymentRequestFormState = {
  customerId: string;
  title: string;
  description: string;
  purpose: PaymentPurpose;
  amount: number;
  dueDate: string;
};

type BankSettlementFormState = {
  beneficiaryName: string;
  beneficiaryEmail: string;
  beneficiaryPhone: string;
  accountNumber: string;
  ifsc: string;
  amount: number;
  mode: RazorpayPayoutMode;
  purpose: string;
  narration: string;
  referenceId: string;
};

type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutFailure = {
  error?: {
    description?: string;
    reason?: string;
    metadata?: {
      payment_id?: string;
      order_id?: string;
    };
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  method?: "card" | "netbanking" | "upi";
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
  handler: (response: RazorpayCheckoutSuccess) => void | Promise<void>;
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayCheckoutFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

const paymentPurposeOptions: Array<{ value: PaymentPurpose; label: string }> = [
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "SERVICE_CHARGE", label: "Service Charge" },
  { value: "LOAN_REPAYMENT", label: "Loan Repayment" },
  { value: "DEPOSIT_INSTALLMENT", label: "Deposit Installment" }
];

const settlementPurposeOptions = ["payout", "vendor bill", "utility bill", "refund"];

let razorpayScriptLoader: Promise<boolean> | null = null;

function createEmptyRequestForm(): PaymentRequestFormState {
  return {
    customerId: "",
    title: "",
    description: "",
    purpose: "SERVICE_CHARGE",
    amount: 0,
    dueDate: ""
  };
}

function createEmptySettlementForm(
  societyName?: string | null,
  viewerEmail?: string | null,
  viewerPhone?: string | null
): BankSettlementFormState {
  return {
    beneficiaryName: societyName ?? "",
    beneficiaryEmail: viewerEmail ?? "",
    beneficiaryPhone: viewerPhone ?? "",
    accountNumber: "",
    ifsc: "",
    amount: 0,
    mode: "IMPS",
    purpose: "payout",
    narration: "Society bank settlement",
    referenceId: `settlement-${Date.now()}`
  };
}

function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-IN");
}

function getMethodLabel(method: PaymentMethod) {
  switch (method) {
    case "CASH":
      return "Cash Collection";
    case "DEBIT_CARD":
      return "Debit Card";
    case "CREDIT_CARD":
      return "Credit Card";
    case "NET_BANKING":
      return "Net Banking";
    case "UPI":
    default:
      return "UPI";
  }
}

function getPurposeLabel(purpose: PaymentPurpose) {
  return paymentPurposeOptions.find((option) => option.value === purpose)?.label ?? purpose;
}

function getRoleCopy(role: UserRole) {
  switch (role) {
    case "CLIENT":
      return {
        title: "My Payments & Requests",
        description: "Review open dues, pay securely with Razorpay, and track payment confirmations from your society."
      };
    case "AGENT":
      return {
        title: "Collections & Assisted Payments",
        description:
          "Create requests for members, record field cash collections, or launch Razorpay checkout for assisted UPI, card, and net-banking payments."
      };
    default:
      return {
        title: "Collections, Checkout & Bank Settlement",
        description:
          "Manage member payment requests, assist Razorpay collections for staff desks, and move society funds to bank accounts from one workspace."
      };
  }
}

function buildRazorpayRemark(remark: string, paymentId: string, orderId: string) {
  return [remark.trim(), `Razorpay payment ${paymentId}`, `order ${orderId}`].filter(Boolean).join(" | ");
}

async function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.Razorpay) {
    return true;
  }

  if (!razorpayScriptLoader) {
    razorpayScriptLoader = new Promise((resolve) => {
      const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SCRIPT_URL}"]`) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true), { once: true });
        existingScript.addEventListener("error", () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptLoader;
}

export function PaymentWorkspace({
  token,
  role,
  customers = [],
  canCreateRequests = false,
  viewerName,
  viewerEmail,
  viewerPhone,
  allowBankSettlement = false
}: PaymentWorkspaceProps) {
  const roleCopy = useMemo(() => getRoleCopy(role), [role]);
  const [overview, setOverview] = useState<PaymentsOverview | null>(null);
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [settlementDrawerOpen, setSettlementDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState<PaymentRequestFormState>(createEmptyRequestForm());
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [paymentRemark, setPaymentRemark] = useState("");
  const [bankSettlementForm, setBankSettlementForm] = useState<BankSettlementFormState>(
    createEmptySettlementForm(undefined, viewerEmail, viewerPhone)
  );
  const [lastPayout, setLastPayout] = useState<{
    id: string;
    status: string;
    amount: number;
    mode: RazorpayPayoutMode;
    referenceId?: string | null;
  } | null>(null);

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [overviewResponse, requestRows, transactionRows] = await Promise.all([
        getPaymentsOverview(token),
        listPaymentRequests(token),
        listPaymentTransactions(token)
      ]);

      setOverview(overviewResponse);
      setRequests(requestRows);
      setTransactions(transactionRows);
      setBankSettlementForm((previous) =>
        previous.referenceId && previous.referenceId !== ""
          ? previous
          : createEmptySettlementForm(overviewResponse.society?.name, viewerEmail, viewerPhone)
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load payment collections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace();
  }, [token]);

  useEffect(() => {
    setBankSettlementForm(createEmptySettlementForm(overview?.society?.name, viewerEmail, viewerPhone));
  }, [overview?.society?.name, viewerEmail, viewerPhone]);

  const availableMethods = useMemo(() => {
    const methods = overview?.acceptedMethods ?? [];

    if (role === "CLIENT") {
      return methods.filter((method) => method !== "CASH");
    }

    return methods;
  }, [overview?.acceptedMethods, role]);

  useEffect(() => {
    if (!selectedMethod && availableMethods.length > 0) {
      setSelectedMethod(availableMethods[0]);
    }
  }, [availableMethods, selectedMethod]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return requests;
    }

    return requests.filter((request) =>
      [request.title, request.customer.fullName, request.customer.customerCode, request.purpose, request.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [requests, search]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      [
        transaction.customer?.fullName ?? "",
        transaction.customer?.customerCode ?? "",
        transaction.gatewayReference,
        transaction.method,
        transaction.purpose,
        transaction.status,
        transaction.remark ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [transactions, search]);

  const metrics = useMemo(() => {
    return [
      {
        label: "Pending Requests",
        value: String(overview?.totals.pendingRequests ?? 0),
        caption: "Requests waiting for collection or payment."
      },
      {
        label: "Completed Payments",
        value: String(overview?.totals.completedPayments ?? 0),
        caption: "Successful collections recorded in the current scope."
      },
      {
        label: "Pending Amount",
        value: formatCurrency(overview?.totals.totalPendingAmount ?? 0),
        caption: "Open receivables still pending."
      },
      {
        label: "Collected Amount",
        value: formatCurrency(overview?.totals.totalCollectedAmount ?? 0),
        caption: "Collections already received."
      }
    ];
  }, [overview]);

  const nextOpenRequest = useMemo(() => filteredRequests.find((request) => request.status === "OPEN") ?? null, [filteredRequests]);

  const canSettleToBank = allowBankSettlement && role !== "CLIENT";

  async function handleCreateRequest() {
    if (!requestForm.customerId || !requestForm.title.trim() || requestForm.amount <= 0) {
      return;
    }

    setSubmitting(true);

    try {
      await createPaymentRequest(token, {
        customerId: requestForm.customerId,
        title: requestForm.title.trim(),
        description: requestForm.description.trim() || undefined,
        purpose: requestForm.purpose,
        amount: Number(requestForm.amount),
        dueDate: requestForm.dueDate || undefined
      });

      setRequestDrawerOpen(false);
      setRequestForm(createEmptyRequestForm());
      await loadWorkspace();
      toast.success("Payment request created.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the payment request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecordCashCollection() {
    if (!selectedRequest || !selectedMethod) {
      return;
    }

    setSubmitting(true);

    try {
      await payPaymentRequest(token, selectedRequest.id, selectedMethod, paymentRemark.trim() || undefined);
      setPaymentDrawerOpen(false);
      setSelectedRequest(null);
      setPaymentRemark("");
      await loadWorkspace();
      toast.success(selectedMethod === "CASH" ? "Cash collection recorded." : "Payment recorded successfully.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to record the payment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRazorpayCheckout() {
    if (!selectedRequest || !selectedMethod || !isRazorpayDigitalMethod(selectedMethod)) {
      return;
    }

    setSubmitting(true);

    try {
      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout right now. Please try again.");
      }

      const orderIntent = await createRazorpayCheckoutOrder({
        amount: selectedRequest.amount,
        title: selectedRequest.title,
        description: selectedRequest.description ?? undefined,
        requestId: selectedRequest.id,
        societyCode: selectedRequest.society.code,
        purpose: selectedRequest.purpose,
        initiatedByRole: role,
        paymentMethod: selectedMethod,
        customer: {
          name: selectedRequest.customer.fullName || viewerName,
          email: viewerEmail ?? undefined,
          contact: viewerPhone ?? undefined
        }
      });

      const checkoutMethod = mapPaymentMethodToRazorpay(selectedMethod) ?? undefined;
      const razorpay = new window.Razorpay({
        key: orderIntent.keyId,
        amount: orderIntent.order.amount,
        currency: orderIntent.order.currency,
        name: orderIntent.merchantName,
        description: selectedRequest.title,
        order_id: orderIntent.order.id,
        method: checkoutMethod,
        prefill: {
          name: selectedRequest.customer.fullName || viewerName,
          email: viewerEmail || undefined,
          contact: formatCheckoutPrefillContact(viewerPhone)
        },
        notes: {
          requestId: selectedRequest.id,
          societyCode: selectedRequest.society.code,
          purpose: selectedRequest.purpose
        },
        theme: {
          color: "#1d4ed8"
        },
        modal: {
          confirm_close: true,
          ondismiss: () => setSubmitting(false)
        },
        handler: async (response) => {
          try {
            const verification = await verifyRazorpayCheckoutOrder({
              orderId: orderIntent.order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            await payPaymentRequest(
              token,
              selectedRequest.id,
              selectedMethod,
              buildRazorpayRemark(paymentRemark, verification.paymentId, verification.orderId)
            );

            setPaymentDrawerOpen(false);
            setSelectedRequest(null);
            setPaymentRemark("");
            await loadWorkspace();
            toast.success("Razorpay payment confirmed and recorded.");
          } catch (caught) {
            setPaymentDrawerOpen(false);
            setSelectedRequest(null);
            const message =
              caught instanceof Error
                ? caught.message
                : "Razorpay confirmed the payment, but the society ledger update did not finish.";

            setError(
              `Razorpay payment ${response.razorpay_payment_id} succeeded, but the payment desk could not finish reconciliation. ${message}`
            );
            toast.error(message);
          } finally {
            setSubmitting(false);
          }
        }
      });

      razorpay.on("payment.failed", (response) => {
        setSubmitting(false);
        const failureMessage =
          response.error?.description ||
          response.error?.reason ||
          "Razorpay could not complete the payment. Please try again.";
        toast.error(failureMessage);
      });

      razorpay.open();
    } catch (caught) {
      setSubmitting(false);
      toast.error(caught instanceof Error ? caught.message : "Unable to start Razorpay checkout.");
    }
  }

  async function handlePayRequest() {
    if (!selectedRequest || !selectedMethod) {
      return;
    }

    if (isRazorpayDigitalMethod(selectedMethod)) {
      await handleRazorpayCheckout();
      return;
    }

    await handleRecordCashCollection();
  }

  async function handleCreateBankSettlement() {
    if (
      !bankSettlementForm.beneficiaryName.trim() ||
      !bankSettlementForm.accountNumber.trim() ||
      !bankSettlementForm.ifsc.trim() ||
      bankSettlementForm.amount <= 0
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await createRazorpayBankPayoutRequest({
        beneficiaryName: bankSettlementForm.beneficiaryName.trim(),
        beneficiaryEmail: bankSettlementForm.beneficiaryEmail.trim() || undefined,
        beneficiaryPhone: bankSettlementForm.beneficiaryPhone.trim() || undefined,
        accountNumber: bankSettlementForm.accountNumber.trim(),
        ifsc: bankSettlementForm.ifsc.trim().toUpperCase(),
        amount: bankSettlementForm.amount,
        mode: bankSettlementForm.mode,
        purpose: bankSettlementForm.purpose,
        narration: bankSettlementForm.narration.trim() || undefined,
        referenceId: bankSettlementForm.referenceId.trim() || undefined
      });

      setLastPayout({
        id: response.payout.id,
        status: response.payout.status,
        amount: response.payout.amount / 100,
        mode: response.payout.mode,
        referenceId: response.payout.referenceId
      });
      setSettlementDrawerOpen(false);
      setBankSettlementForm(createEmptySettlementForm(overview?.society?.name, viewerEmail, viewerPhone));
      toast.success(`Bank settlement ${response.payout.id} created with status ${response.payout.status}.`);
    } catch (caught) {
      toast.error(
        caught instanceof Error
          ? caught.message
          : "Unable to create the bank payout. Check your RazorpayX configuration and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<PaymentRoundedIcon />}
        eyebrow="Payments"
        title={roleCopy.title}
        description={roleCopy.description}
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by request, customer, method, or reference"
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
              }}
            />
            {canSettleToBank ? (
              <Button
                variant="outlined"
                startIcon={<AccountBalanceRoundedIcon />}
                onClick={() => setSettlementDrawerOpen(true)}
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.45)",
                  borderRadius: 1,
                  fontWeight: 900,
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.08)"
                  }
                }}
              >
                Settle To Bank
              </Button>
            ) : null}
            {canCreateRequests ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setRequestDrawerOpen(true)}
                disabled={customers.length === 0}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 1, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
              >
                Create Request
              </Button>
            ) : null}
          </>
        }
      />

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {overview ? (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Accepted Methods
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {overview.acceptsDigitalPayments
                  ? "Digital collections are enabled for this society. Razorpay checkout is available for UPI, cards, and net banking wherever those methods are allowed."
                  : "Digital collections are disabled right now. Cash collection is still available to agents and staff."}
              </Typography>
              {overview.society?.upiId ? (
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Collection UPI ID: <strong>{overview.society.upiId}</strong>
                </Typography>
              ) : null}
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {(overview.acceptedMethods ?? []).map((method) => (
                <Chip key={method} label={getMethodLabel(method)} sx={{ fontWeight: 800 }} />
              ))}
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {role === "CLIENT" && nextOpenRequest ? (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Next Due Payment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nextOpenRequest.title} for {formatCurrency(nextOpenRequest.amount)} is ready for secure checkout.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PaymentRoundedIcon />}
              onClick={() => {
                setSelectedRequest(nextOpenRequest);
                setSelectedMethod(availableMethods[0] ?? "");
                setPaymentRemark("");
                setPaymentDrawerOpen(true);
              }}
              disabled={availableMethods.length === 0}
              sx={{ borderRadius: 2.5, fontWeight: 800 }}
            >
              Pay Now
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {canSettleToBank ? (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                Society To Bank Settlement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Initiate a RazorpayX payout to a beneficiary bank account for bank deposit, vendor bill, or utility settlement workflows.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<SendRoundedIcon />}
              onClick={() => setSettlementDrawerOpen(true)}
              sx={{ borderRadius: 2.5, fontWeight: 800 }}
            >
              Initiate Settlement
            </Button>
          </Stack>
          {lastPayout ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
                <Chip label={`Last payout ${lastPayout.id}`} color="primary" sx={{ fontWeight: 800 }} />
                <Chip label={`Status ${lastPayout.status}`} sx={{ fontWeight: 800 }} />
                <Chip label={`${formatCurrency(lastPayout.amount)} via ${lastPayout.mode}`} sx={{ fontWeight: 800 }} />
                {lastPayout.referenceId ? <Chip label={`Ref ${lastPayout.referenceId}`} sx={{ fontWeight: 800 }} /> : null}
              </Stack>
            </>
          ) : null}
        </Paper>
      ) : null}

      {role === "CLIENT" && (overview?.acceptedMethods ?? []).includes("CASH") ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Cash collection can be recorded only by an agent or staff user on your behalf.
        </Alert>
      ) : null}
      {canSettleToBank ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          RazorpayX payouts require server IP allowlisting and a configured `RAZORPAYX_ACCOUNT_NUMBER` on the deployment.
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 7 }}>
          <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
            <TableContainer>
              <Table sx={{ minWidth: 780, tableLayout: "fixed" }}>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, width: "26%" }}>Request</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "20%" }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>Purpose</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Loading payment requests...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableEmpty colSpan={6} label="No payment requests match the current view." />
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {request.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due {formatDate(request.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {request.customer.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.customer.customerCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getPurposeLabel(request.purpose)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {formatCurrency(request.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={request.status} color={request.status === "PAID" ? "success" : "default"} />
                        </TableCell>
                        <TableCell align="right">
                          {request.status === "OPEN" && availableMethods.length > 0 ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedRequest(request);
                                setSelectedMethod(availableMethods[0] ?? "");
                                setPaymentRemark("");
                                setPaymentDrawerOpen(true);
                              }}
                            >
                              {role === "CLIENT" ? "Pay" : "Collect"}
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, xl: 5 }}>
          <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
            <TableContainer>
              <Table sx={{ minWidth: 520, tableLayout: "fixed" }}>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, width: "24%" }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "18%" }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "22%" }}>Customer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Loading recent transactions...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableEmpty colSpan={5} label="No payment transactions are available yet." />
                  ) : (
                    filteredTransactions.slice(0, 8).map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {transaction.gatewayReference}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(transaction.processedAt ?? transaction.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getMethodLabel(transaction.method)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={transaction.status}
                            color={transaction.status === "SUCCESS" ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {transaction.customer?.fullName ?? "-"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.remark ?? getPurposeLabel(transaction.purpose)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={requestDrawerOpen}
        onClose={() => setRequestDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 520 } } }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setRequestDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Create Payment Request
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ px: 3, py: 3 }}>
            <TextField
              select
              fullWidth
              label="Customer"
              value={requestForm.customerId}
              onChange={(event) => setRequestForm((previous) => ({ ...previous, customerId: event.target.value }))}
            >
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.fullName} ({customer.customerCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Request Title"
              value={requestForm.title}
              onChange={(event) => setRequestForm((previous) => ({ ...previous, title: event.target.value }))}
            />
            <TextField
              select
              fullWidth
              label="Purpose"
              value={requestForm.purpose}
              onChange={(event) => setRequestForm((previous) => ({ ...previous, purpose: event.target.value as PaymentPurpose }))}
            >
              {paymentPurposeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Amount"
                  value={requestForm.amount}
                  onChange={(event) => setRequestForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="date"
                  fullWidth
                  label="Due Date"
                  value={requestForm.dueDate}
                  onChange={(event) => setRequestForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={requestForm.description}
              onChange={(event) => setRequestForm((previous) => ({ ...previous, description: event.target.value }))}
            />
            <Button
              variant="contained"
              onClick={() => void handleCreateRequest()}
              disabled={submitting || !requestForm.customerId || !requestForm.title.trim() || requestForm.amount <= 0}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              Create Request
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 500 } } }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setPaymentDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {role === "CLIENT" ? "Pay Request" : "Collect Payment"}
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ px: 3, py: 3 }}>
            {selectedRequest ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {selectedRequest.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedRequest.customer.fullName} ({selectedRequest.customer.customerCode})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: {formatCurrency(selectedRequest.amount)}
                </Typography>
              </Paper>
            ) : null}

            <TextField
              select
              fullWidth
              label="Payment Method"
              value={selectedMethod}
              onChange={(event) => setSelectedMethod(event.target.value as PaymentMethod)}
              disabled={availableMethods.length === 0}
            >
              {availableMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {getMethodLabel(method)}
                </MenuItem>
              ))}
            </TextField>
            {availableMethods.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No self-service payment method is available for this request. Ask your agent or society staff to record a cash collection.
              </Alert>
            ) : null}
            {selectedMethod && isRazorpayDigitalMethod(selectedMethod) ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                This payment will open Razorpay checkout. After successful gateway verification, the request will be marked paid in the society ledger.
              </Alert>
            ) : null}
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Remarks"
              value={paymentRemark}
              onChange={(event) => setPaymentRemark(event.target.value)}
              helperText={
                selectedMethod === "CASH"
                  ? "Use this to note that the agent collected cash during a home or field visit."
                  : "Optional note that will be stored along with the payment record."
              }
            />
            <Button
              variant="contained"
              onClick={() => void handlePayRequest()}
              disabled={submitting || !selectedRequest || !selectedMethod}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              {selectedMethod === "CASH"
                ? "Record Cash Collection"
                : selectedMethod && isRazorpayDigitalMethod(selectedMethod)
                  ? "Continue To Razorpay"
                  : "Record Payment"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={settlementDrawerOpen}
        onClose={() => setSettlementDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 560 } } }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setSettlementDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Society To Bank Settlement
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ px: 3, py: 3 }}>
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              This creates a RazorpayX contact, bank fund account, and payout request in one flow.
            </Alert>
            <TextField
              fullWidth
              label="Beneficiary Name"
              value={bankSettlementForm.beneficiaryName}
              onChange={(event) =>
                setBankSettlementForm((previous) => ({ ...previous, beneficiaryName: event.target.value }))
              }
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Beneficiary Email"
                  value={bankSettlementForm.beneficiaryEmail}
                  onChange={(event) =>
                    setBankSettlementForm((previous) => ({ ...previous, beneficiaryEmail: event.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Beneficiary Phone"
                  value={bankSettlementForm.beneficiaryPhone}
                  onChange={(event) =>
                    setBankSettlementForm((previous) => ({ ...previous, beneficiaryPhone: event.target.value }))
                  }
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Bank Account Number"
                  value={bankSettlementForm.accountNumber}
                  onChange={(event) =>
                    setBankSettlementForm((previous) => ({ ...previous, accountNumber: event.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="IFSC"
                  value={bankSettlementForm.ifsc}
                  onChange={(event) => setBankSettlementForm((previous) => ({ ...previous, ifsc: event.target.value.toUpperCase() }))}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Amount"
                  value={bankSettlementForm.amount}
                  onChange={(event) => setBankSettlementForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Payout Mode"
                  value={bankSettlementForm.mode}
                  onChange={(event) =>
                    setBankSettlementForm((previous) => ({ ...previous, mode: event.target.value as RazorpayPayoutMode }))
                  }
                >
                  {(["IMPS", "NEFT", "RTGS"] as RazorpayPayoutMode[]).map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <TextField
              select
              fullWidth
              label="Purpose"
              value={bankSettlementForm.purpose}
              onChange={(event) => setBankSettlementForm((previous) => ({ ...previous, purpose: event.target.value }))}
            >
              {settlementPurposeOptions.map((purpose) => (
                <MenuItem key={purpose} value={purpose}>
                  {purpose}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Narration"
              value={bankSettlementForm.narration}
              onChange={(event) => setBankSettlementForm((previous) => ({ ...previous, narration: event.target.value }))}
              helperText="Razorpay limits narration length. Keep it short and bank-friendly."
            />
            <TextField
              fullWidth
              label="Reference ID"
              value={bankSettlementForm.referenceId}
              onChange={(event) => setBankSettlementForm((previous) => ({ ...previous, referenceId: event.target.value }))}
            />
            <Button
              variant="contained"
              onClick={() => void handleCreateBankSettlement()}
              disabled={
                submitting ||
                !bankSettlementForm.beneficiaryName.trim() ||
                !bankSettlementForm.accountNumber.trim() ||
                !bankSettlementForm.ifsc.trim() ||
                bankSettlementForm.amount <= 0
              }
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              Create Bank Settlement
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
