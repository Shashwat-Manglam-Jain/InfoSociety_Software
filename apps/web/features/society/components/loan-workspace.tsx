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
import { useLanguage } from "@/shared/i18n/language-provider";
import { getLoanWorkspaceCopy } from "@/shared/i18n/loan-workspace-copy";

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

function resolveIntlLocale(locale: "en" | "hi" | "mr") {
  return locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
}

function formatCurrency(value: number | string | null | undefined, locale: "en" | "hi" | "mr") {
  const numericValue = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDate(value: string | null | undefined, locale: "en" | "hi" | "mr") {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(resolveIntlLocale(locale));
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
  const { locale } = useLanguage();
  const copy = getLoanWorkspaceCopy(locale);
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
      setError(caught instanceof Error ? caught.message : copy.errors.loadFailed);
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
      { label: copy.metrics.loanCases.label, value: String(rows.length), caption: copy.metrics.loanCases.caption },
      {
        label: copy.metrics.appliedAmount.label,
        value: formatCurrency(totalApplied, locale),
        caption: copy.metrics.appliedAmount.caption
      },
      { label: copy.metrics.activeLoans.label, value: String(activeLoans), caption: copy.metrics.activeLoans.caption },
      { label: copy.metrics.overdue.label, value: `${overdueLoans}/${disbursedLoans}`, caption: copy.metrics.overdue.caption }
    ];
  }, [rows, copy, locale]);

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
      toast.success(copy.success.created);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.errors.createFailed;
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
          ? copy.success.sanctioned
          : action === "disburse"
            ? copy.success.disbursed
            : action === "recover"
              ? copy.success.recovered
              : copy.success.overdueUpdated
      );
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : copy.errors.updateFailed;
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
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        description={
          canManageLoanActions
            ? copy.hero.manageDescription
            : copy.hero.reviewDescription
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
              placeholder={copy.actions.searchPlaceholder}
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
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option || "all"} value={option}>
                  {option ? copy.statuses[option] : copy.actions.allStatuses}
                </MenuItem>
              ))}
            </TextField>
            {canApplyLoan ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateOpen(true)}
                disabled={!clientProfiles.length}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 1, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
              >
                {copy.actions.applyLoan}
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
          {copy.alerts.noClients}
        </Alert>
      ) : !canManageLoanActions ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          {copy.alerts.restrictedActions}
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1100, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "20%" }}>{copy.table.borrower}</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>{copy.table.account}</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "22%" }}>{copy.table.guarantors}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>{copy.table.applied}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>{copy.table.overdue}</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>{copy.table.status}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "6%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={7} label={copy.table.emptyState} />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {copy.table.loading}
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
                          {formatDate(loan.createdAt, locale)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {guarantorNames || copy.table.noGuarantorAssigned}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                          {formatCurrency(loan.applicationAmount, locale)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                          {formatCurrency(loan.overdueAmount, locale)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={copy.statuses[loan.status]} color={loan.status === "DISBURSED" ? "success" : "default"} />
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
          labelRowsPerPage={copy.pagination.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            copy.pagination.displayedRows.replace("{{from}}", String(from)).replace("{{to}}", String(to)).replace("{{count}}", String(count))
          }
          getItemAriaLabel={(buttonType) => buttonType === "next" ? copy.pagination.nextPage : copy.pagination.previousPage}
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
              {copy.actions.applyNewLoan}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label={copy.drawer.borrower}
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
                    label={copy.drawer.applicationAmount}
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
                    label={copy.drawer.interestRate}
                    value={form.interestRate}
                    onChange={(event) => setForm((previous) => ({ ...previous, interestRate: Number(event.target.value) }))}
                  />
                </Grid>
              </Grid>

              <TextField
                type="date"
                fullWidth
                label={copy.drawer.expiryDate}
                value={form.expiryDate}
                onChange={(event) => setForm((previous) => ({ ...previous, expiryDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                fullWidth
                label={copy.drawer.primaryGuarantor}
                value={form.guarantor1Id}
                onChange={(event) => setForm((previous) => ({ ...previous, guarantor1Id: event.target.value }))}
              >
                <MenuItem value="">{copy.drawer.notAssigned}</MenuItem>
                {guarantorOptions.map((client) => (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={copy.drawer.secondaryGuarantor}
                value={form.guarantor2Id}
                onChange={(event) => setForm((previous) => ({ ...previous, guarantor2Id: event.target.value }))}
              >
                <MenuItem value="">{copy.drawer.notAssigned}</MenuItem>
                {guarantorOptions.map((client) => (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={copy.drawer.thirdGuarantor}
                value={form.guarantor3Id}
                onChange={(event) => setForm((previous) => ({ ...previous, guarantor3Id: event.target.value }))}
              >
                <MenuItem value="">{copy.drawer.notAssigned}</MenuItem>
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
                label={copy.drawer.remarks}
                value={form.remarks}
                onChange={(event) => setForm((previous) => ({ ...previous, remarks: event.target.value }))}
              />

              {selectedBorrower ? (
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                    {copy.drawer.borrowerPreview}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBorrower.fullName} ({selectedBorrower.customerCode})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {copy.drawer.branch.replace("{{branch}}", selectedBorrower.branchName)}
                  </Typography>
                </Paper>
              ) : null}

              <Button
                variant="contained"
                onClick={() => void handleApplyLoan()}
                disabled={!form.customerId || Number(form.applicationAmount) <= 0 || submitting}
                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
              >
                {copy.actions.createLoanApplication}
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
                <Chip label={copy.statuses[detailLoan.status]} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip label={copy.drawer.appliedChip.replace("{{amount}}", formatCurrency(detailLoan.applicationAmount, locale))} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip label={copy.drawer.overdueChip.replace("{{amount}}", formatCurrency(detailLoan.overdueAmount, locale))} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
              </Stack>
            </Box>

            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label={copy.detailMetrics.applied.label} value={formatCurrency(detailLoan.applicationAmount, locale)} caption={copy.detailMetrics.applied.caption} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label={copy.detailMetrics.sanctioned.label} value={formatCurrency(detailLoan.sanctionedAmount, locale)} caption={copy.detailMetrics.sanctioned.caption} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label={copy.detailMetrics.disbursed.label} value={formatCurrency(detailLoan.disbursedAmount, locale)} caption={copy.detailMetrics.disbursed.caption} />
                </Grid>
              </Grid>

              <Stack spacing={2.5} sx={{ mt: 3 }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                    {copy.drawer.guarantorResponsibility}
                  </Typography>
                  <Stack spacing={1}>
                    {[detailLoan.guarantor1, detailLoan.guarantor2, detailLoan.guarantor3].filter(Boolean).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {copy.drawer.noGuarantorsAssigned}
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
                        {copy.drawer.sanctionLoan}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            type="number"
                            fullWidth
                            label={copy.drawer.sanctionedAmount}
                            value={sanctionedAmount}
                            onChange={(event) => setSanctionedAmount(Number(event.target.value))}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            type="date"
                            fullWidth
                            label={copy.drawer.sanctionDate}
                            value={sanctionDate}
                            onChange={(event) => setSanctionDate(event.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            type="date"
                            fullWidth
                            label={copy.drawer.expiryDate}
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
                        {copy.actions.saveSanction}
                      </Button>
                    </Paper>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                            {copy.drawer.disburse}
                          </Typography>
                          <TextField
                            type="number"
                            fullWidth
                            label={copy.actions.disburseAmount}
                            value={disburseAmount}
                            onChange={(event) => setDisburseAmount(Number(event.target.value))}
                          />
                          <Button
                            variant="contained"
                            sx={{ mt: 2, borderRadius: 2.5, fontWeight: 800 }}
                            disabled={submitting || disburseAmount <= 0}
                            onClick={() => void handleLoanAction("disburse")}
                          >
                            {copy.actions.disburseAmount}
                          </Button>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                            {copy.drawer.recovery}
                          </Typography>
                          <TextField
                            type="number"
                            fullWidth
                            label={copy.drawer.recoverAmount}
                            value={recoverAmountValue}
                            onChange={(event) => setRecoverAmountValue(Number(event.target.value))}
                          />
                          <Button
                            variant="contained"
                            sx={{ mt: 2, borderRadius: 2.5, fontWeight: 800 }}
                            disabled={submitting || recoverAmountValue <= 0}
                            onClick={() => void handleLoanAction("recover")}
                          >
                            {copy.actions.recordRecovery}
                          </Button>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                        {copy.drawer.overdueControl}
                      </Typography>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                        <TextField
                          type="number"
                          fullWidth
                          label={copy.drawer.overdueAmount}
                          value={overdueAmount}
                          onChange={(event) => setOverdueAmount(Number(event.target.value))}
                        />
                        <Button
                          variant="outlined"
                          sx={{ minWidth: { md: 180 }, borderRadius: 2.5, fontWeight: 800 }}
                          disabled={submitting || overdueAmount < 0}
                          onClick={() => void handleLoanAction("overdue")}
                        >
                          {copy.actions.updateOverdue}
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
