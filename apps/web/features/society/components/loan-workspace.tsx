"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
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
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  applyLoan,
  disburseLoan,
  listLoans,
  recoverLoan,
  sanctionLoan,
  updateLoanOverdue,
  type LoanRecord,
  type LoanStatus
} from "@/shared/api/loans";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import type { ManagedUserRow } from "../lib/society-admin-dashboard";
import { toast } from "@/shared/ui/toast";

type LoanWorkspaceProps = {
  token: string;
  managedUsers: ManagedUserRow[];
  canApplyLoan?: boolean;
  canManageLoanActions?: boolean;
};

type LoanApplicationForm = {
  customerId: string;
  applicationAmount: number;
  interestRate: number;
  expiryDate: string;
  guarantor1Id: string;
  guarantor2Id: string;
  guarantor3Id: string;
  remarks: string;
};

const statusOptions: Array<LoanStatus | ""> = ["", "APPLIED", "SANCTIONED", "DISBURSED", "OVERDUE", "CLOSED"];

function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN");
}

function formatPersonName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "-";
}

function createEmptyLoanApplicationForm(): LoanApplicationForm {
  return {
    customerId: "",
    applicationAmount: 0,
    interestRate: 10,
    expiryDate: "",
    guarantor1Id: "",
    guarantor2Id: "",
    guarantor3Id: "",
    remarks: ""
  };
}

export function LoanWorkspace({
  token,
  managedUsers,
  canApplyLoan = true,
  canManageLoanActions = true
}: LoanWorkspaceProps) {
  const clientProfiles = useMemo(
    () =>
      managedUsers
        .filter((user) => user.role === "CLIENT" && user.customerProfile?.id)
        .map((user) => ({
          userId: user.id,
          customerId: user.customerProfile!.id,
          customerCode: user.customerProfile!.customerCode,
          fullName: user.fullName,
          branchName: user.branch?.name ?? "Head office",
          isActive: user.isActive
        })),
    [managedUsers]
  );

  const [rows, setRows] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LoanStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailLoan, setDetailLoan] = useState<LoanRecord | null>(null);
  const [form, setForm] = useState<LoanApplicationForm>(createEmptyLoanApplicationForm());
  const [sanctionedAmount, setSanctionedAmount] = useState(0);
  const [sanctionDate, setSanctionDate] = useState("");
  const [detailExpiryDate, setDetailExpiryDate] = useState("");
  const [disburseAmount, setDisburseAmount] = useState(0);
  const [recoverAmountValue, setRecoverAmountValue] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listLoans(token, { q: search, status, page: 1, limit: 100 });
      setRows(response.rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load loan records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [search, status, token]);

  useEffect(() => {
    if (!detailLoan) {
      return;
    }

    setSanctionedAmount(Number(detailLoan.sanctionedAmount ?? detailLoan.applicationAmount ?? 0));
    setSanctionDate(detailLoan.sanctionDate?.slice(0, 10) ?? "");
    setDetailExpiryDate(detailLoan.expiryDate?.slice(0, 10) ?? "");
    setDisburseAmount(0);
    setRecoverAmountValue(0);
    setOverdueAmount(Number(detailLoan.overdueAmount ?? 0));
  }, [detailLoan]);

  const metrics = useMemo(() => {
    const totalApplied = rows.reduce((sum, loan) => sum + Number(loan.applicationAmount || 0), 0);
    const activeLoans = rows.filter((loan) => loan.status !== "CLOSED").length;
    const overdueLoans = rows.filter((loan) => loan.status === "OVERDUE").length;
    const disbursedLoans = rows.filter((loan) => loan.status === "DISBURSED").length;

    return [
      { label: "Loan Cases", value: String(rows.length), caption: "Loan applications visible in this registry." },
      { label: "Applied Amount", value: formatCurrency(totalApplied), caption: "Total application amount across visible loans." },
      { label: "Active Loans", value: String(activeLoans), caption: "Loan cases still in progress or collectible." },
      { label: "Overdue", value: `${overdueLoans}/${disbursedLoans}`, caption: "Loans flagged overdue against disbursed cases." }
    ];
  }, [rows]);

  const selectedBorrower = useMemo(
    () => clientProfiles.find((client) => client.customerId === form.customerId) ?? null,
    [clientProfiles, form.customerId]
  );
  const guarantorOptions = useMemo(
    () => clientProfiles.filter((client) => client.customerId !== form.customerId && client.isActive),
    [clientProfiles, form.customerId]
  );

  async function handleApplyLoan() {
    if (!form.customerId || Number(form.applicationAmount) <= 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await applyLoan(token, {
        customerId: form.customerId,
        applicationAmount: Number(form.applicationAmount),
        interestRate: Number(form.interestRate),
        expiryDate: form.expiryDate || undefined,
        guarantor1Id: form.guarantor1Id || undefined,
        guarantor2Id: form.guarantor2Id || undefined,
        guarantor3Id: form.guarantor3Id || undefined,
        remarks: form.remarks.trim() || undefined
      });
      setCreateOpen(false);
      setForm(createEmptyLoanApplicationForm());
      await loadRows();
      toast.success("Loan application created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create loan application.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLoanAction(action: "sanction" | "disburse" | "recover" | "overdue") {
    if (!detailLoan) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated =
        action === "sanction"
          ? await sanctionLoan(token, detailLoan.id, {
              sanctionedAmount: Number(sanctionedAmount),
              sanctionDate: sanctionDate || undefined,
              expiryDate: detailExpiryDate || undefined
            })
          : action === "disburse"
            ? await disburseLoan(token, detailLoan.id, Number(disburseAmount))
            : action === "recover"
              ? await recoverLoan(token, detailLoan.id, Number(recoverAmountValue))
              : await updateLoanOverdue(token, detailLoan.id, Number(overdueAmount));

      setDetailLoan(updated);
      await loadRows();
      toast.success(
        action === "sanction"
          ? "Loan sanctioned."
          : action === "disburse"
            ? "Loan amount disbursed."
            : action === "recover"
              ? "Recovery recorded."
              : "Overdue updated."
      );
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to update the loan.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<GavelRoundedIcon />}
        eyebrow="Loans"
        title="Loan Desk"
        description={
          canManageLoanActions
            ? "Create loan applications, assign guarantors, and manage sanction, disbursement, recovery, and overdue tracking from the society dashboard."
            : "Review live loan records, track repayment progress, and submit new loan requests within your allowed customer scope."
        }
        colorScheme="sky"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search borrower, guarantor, or account..."
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
              }}
            />
            <TextField
              select
              size="small"
              value={status}
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value as LoanStatus | "");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option || "all"} value={option}>
                  {option || "All Statuses"}
                </MenuItem>
              ))}
            </TextField>
            {canApplyLoan ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateOpen(true)}
                disabled={!clientProfiles.length}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
              >
                Apply Loan
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

      {!clientProfiles.length ? (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          No active client accounts are available for loan processing yet.
        </Alert>
      ) : !canManageLoanActions ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Administrative loan actions are hidden for this login. You can still review live loan data and open your own loan requests if your access allows it.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1100, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "20%" }}>Borrower</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "22%" }}>Guarantors</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>Applied</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>Overdue</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "6%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={7} label="No loan records matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading loan registry...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((loan) => {
                  const guarantorNames = [loan.guarantor1, loan.guarantor2, loan.guarantor3]
                    .filter(Boolean)
                    .map((party) => formatPersonName(party?.firstName, party?.lastName))
                    .join(", ");

                  return (
                    <TableRow key={loan.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {formatPersonName(loan.customer.firstName, loan.customer.lastName)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {loan.customer.customerCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {loan.account.accountNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(loan.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {guarantorNames || "No guarantor assigned"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                          {formatCurrency(loan.applicationAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                          {formatCurrency(loan.overdueAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={loan.status} color={loan.status === "DISBURSED" ? "success" : "default"} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setDetailLoan(loan)}>
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {canApplyLoan ? (
        <Drawer
          anchor="right"
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          PaperProps={{ sx: { width: { xs: "100%", md: 540 }, borderRadius: "24px 0 0 24px" } }}
        >
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setCreateOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Apply New Loan
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Borrower"
                value={form.customerId}
                onChange={(event) => setForm((previous) => ({ ...previous, customerId: event.target.value }))}
              >
                {clientProfiles.filter((client) => client.isActive).map((client) => (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode})
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Application Amount"
                    value={form.applicationAmount}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, applicationAmount: Number(event.target.value) }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Interest Rate"
                    value={form.interestRate}
                    onChange={(event) => setForm((previous) => ({ ...previous, interestRate: Number(event.target.value) }))}
                  />
                </Grid>
              </Grid>

              <TextField
                type="date"
                fullWidth
                label="Expiry Date"
                value={form.expiryDate}
                onChange={(event) => setForm((previous) => ({ ...previous, expiryDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                fullWidth
                label="Primary Guarantor"
                value={form.guarantor1Id}
                onChange={(event) => setForm((previous) => ({ ...previous, guarantor1Id: event.target.value }))}
              >
                <MenuItem value="">Not assigned</MenuItem>
                {guarantorOptions.map((client) => (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Secondary Guarantor"
                value={form.guarantor2Id}
                onChange={(event) => setForm((previous) => ({ ...previous, guarantor2Id: event.target.value }))}
              >
                <MenuItem value="">Not assigned</MenuItem>
                {guarantorOptions.map((client) => (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Third Guarantor"
                value={form.guarantor3Id}
                onChange={(event) => setForm((previous) => ({ ...previous, guarantor3Id: event.target.value }))}
              >
                <MenuItem value="">Not assigned</MenuItem>
                {guarantorOptions.map((client) => (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Remarks"
                value={form.remarks}
                onChange={(event) => setForm((previous) => ({ ...previous, remarks: event.target.value }))}
              />

              {selectedBorrower ? (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    Borrower Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBorrower.fullName} ({selectedBorrower.customerCode})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Branch: {selectedBorrower.branchName}
                  </Typography>
                </Paper>
              ) : null}

              <Button
                variant="contained"
                onClick={() => void handleApplyLoan()}
                disabled={!form.customerId || Number(form.applicationAmount) <= 0 || submitting}
                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
              >
                Create Loan Application
              </Button>
            </Stack>
          </Box>
        </Drawer>
      ) : null}

      <Drawer
        anchor="right"
        open={Boolean(detailLoan)}
        onClose={() => setDetailLoan(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 760 }, borderRadius: "24px 0 0 24px" } }}
      >
        {detailLoan ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
              <IconButton onClick={() => setDetailLoan(null)} sx={{ position: "absolute", right: 16, top: 16, color: "#fff" }}>
                <CloseRoundedIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {detailLoan.account.accountNumber}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                {formatPersonName(detailLoan.customer.firstName, detailLoan.customer.lastName)} ({detailLoan.customer.customerCode})
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} useFlexGap flexWrap="wrap">
                <Chip label={detailLoan.status} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip label={`Applied ${formatCurrency(detailLoan.applicationAmount)}`} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip label={`Overdue ${formatCurrency(detailLoan.overdueAmount)}`} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
              </Stack>
            </Box>

            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Applied" value={formatCurrency(detailLoan.applicationAmount)} caption="Borrower application amount." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Sanctioned" value={formatCurrency(detailLoan.sanctionedAmount)} caption="Latest sanctioned amount." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Disbursed" value={formatCurrency(detailLoan.disbursedAmount)} caption="Amount already disbursed." />
                </Grid>
              </Grid>

              <Stack spacing={2.5} sx={{ mt: 3 }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                    Guarantor Responsibility
                  </Typography>
                  <Stack spacing={1}>
                    {[detailLoan.guarantor1, detailLoan.guarantor2, detailLoan.guarantor3].filter(Boolean).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No guarantors assigned to this loan.
                      </Typography>
                    ) : (
                      [detailLoan.guarantor1, detailLoan.guarantor2, detailLoan.guarantor3]
                        .filter(Boolean)
                        .map((party, index) => (
                          <Typography key={party?.id ?? index} variant="body2" color="text.secondary">
                            {index + 1}. {formatPersonName(party?.firstName, party?.lastName)} ({party?.customerCode})
                          </Typography>
                        ))
                    )}
                  </Stack>
                </Paper>

                {canManageLoanActions ? (
                  <>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                        Sanction Loan
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            type="number"
                            fullWidth
                            label="Sanctioned Amount"
                            value={sanctionedAmount}
                            onChange={(event) => setSanctionedAmount(Number(event.target.value))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            type="date"
                            fullWidth
                            label="Sanction Date"
                            value={sanctionDate}
                            onChange={(event) => setSanctionDate(event.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            type="date"
                            fullWidth
                            label="Expiry Date"
                            value={detailExpiryDate}
                            onChange={(event) => setDetailExpiryDate(event.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, borderRadius: 2.5, fontWeight: 800 }}
                        disabled={submitting || sanctionedAmount <= 0}
                        onClick={() => void handleLoanAction("sanction")}
                      >
                        Save Sanction
                      </Button>
                    </Paper>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                            Disburse
                          </Typography>
                          <TextField
                            type="number"
                            fullWidth
                            label="Disburse Amount"
                            value={disburseAmount}
                            onChange={(event) => setDisburseAmount(Number(event.target.value))}
                          />
                          <Button
                            variant="contained"
                            sx={{ mt: 2, borderRadius: 2.5, fontWeight: 800 }}
                            disabled={submitting || disburseAmount <= 0}
                            onClick={() => void handleLoanAction("disburse")}
                          >
                            Disburse Amount
                          </Button>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                            Recovery
                          </Typography>
                          <TextField
                            type="number"
                            fullWidth
                            label="Recover Amount"
                            value={recoverAmountValue}
                            onChange={(event) => setRecoverAmountValue(Number(event.target.value))}
                          />
                          <Button
                            variant="contained"
                            sx={{ mt: 2, borderRadius: 2.5, fontWeight: 800 }}
                            disabled={submitting || recoverAmountValue <= 0}
                            onClick={() => void handleLoanAction("recover")}
                          >
                            Record Recovery
                          </Button>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                        Overdue Control
                      </Typography>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                        <TextField
                          type="number"
                          fullWidth
                          label="Overdue Amount"
                          value={overdueAmount}
                          onChange={(event) => setOverdueAmount(Number(event.target.value))}
                        />
                        <Button
                          variant="outlined"
                          sx={{ minWidth: { md: 180 }, borderRadius: 2.5, fontWeight: 800 }}
                          disabled={submitting || overdueAmount < 0}
                          onClick={() => void handleLoanAction("overdue")}
                        >
                          Update Overdue
                        </Button>
                      </Stack>
                    </Paper>
                  </>
                ) : null}
              </Stack>
            </Box>
          </Box>
        ) : null}
      </Drawer>
    </Stack>
  );
}
