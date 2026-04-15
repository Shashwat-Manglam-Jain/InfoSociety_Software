"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { createPaymentRequest, getPaymentsOverview, listPaymentRequests, listPaymentTransactions, payPaymentRequest } from "@/shared/api/payments";
import type { PaymentRequestItem, PaymentTransactionItem, PaymentMethod, PaymentPurpose, PaymentsOverview, UserRole } from "@/shared/types";
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
};

type PaymentRequestFormState = {
  customerId: string;
  title: string;
  description: string;
  purpose: PaymentPurpose;
  amount: number;
  dueDate: string;
};

const paymentPurposeOptions: Array<{ value: PaymentPurpose; label: string }> = [
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "SERVICE_CHARGE", label: "Service Charge" },
  { value: "LOAN_REPAYMENT", label: "Loan Repayment" },
  { value: "DEPOSIT_INSTALLMENT", label: "Deposit Installment" }
];

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

export function PaymentWorkspace({
  token,
  role,
  customers = [],
  canCreateRequests = false
}: PaymentWorkspaceProps) {
  const [overview, setOverview] = useState<PaymentsOverview | null>(null);
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState<PaymentRequestFormState>(createEmptyRequestForm());
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | "">("");
  const [paymentRemark, setPaymentRemark] = useState("");

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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load payment collections.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace();
  }, [token]);

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
      [
        request.title,
        request.customer.fullName,
        request.customer.customerCode,
        request.purpose,
        request.status
      ]
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

  async function handlePayRequest() {
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

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<PaymentRoundedIcon />}
        eyebrow="Payments"
        title="Collections & Payment Desk"
        description="Track payment requests, collect digital or cash payments, and review recent collection activity across the current login scope."
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
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Accepted Methods
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {overview.acceptsDigitalPayments
                  ? "Digital collections are enabled for this society. Cash collection is available for field collection workflows."
                  : "Digital collections are disabled right now. Cash collection is still available to agents and staff."}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {(overview.acceptedMethods ?? []).map((method) => (
                <Chip key={method} label={getMethodLabel(method)} sx={{ fontWeight: 800 }} />
              ))}
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {role === "CLIENT" && (overview?.acceptedMethods ?? []).includes("CASH") ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Cash collection can be recorded only by an agent or staff user on your behalf.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

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
                    <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>Action</TableCell>
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
                              Pay
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
                    <TableCell align="right" sx={{ fontWeight: 900, width: "18%" }}>Amount</TableCell>
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
                          <Chip size="small" label={transaction.status} color={transaction.status === "SUCCESS" ? "success" : "default"} />
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
              Record Payment
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
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Remarks"
              value={paymentRemark}
              onChange={(event) => setPaymentRemark(event.target.value)}
              helperText={selectedMethod === "CASH" ? "Use this to note that the agent collected cash during a home or field visit." : undefined}
            />
            <Button
              variant="contained"
              onClick={() => void handlePayRequest()}
              disabled={submitting || !selectedRequest || !selectedMethod}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              {selectedMethod === "CASH" ? "Record Cash Collection" : "Record Payment"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
