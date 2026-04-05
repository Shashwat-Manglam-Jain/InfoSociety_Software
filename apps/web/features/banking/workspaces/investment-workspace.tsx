"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Box,
  Button,
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
  createInvestment,
  listInvestments,
  renewInvestment,
  withdrawInvestment,
  type InvestmentRecord
} from "@/shared/api/investments";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type InvestmentWorkspaceProps = {
  token: string;
  canManageInvestments?: boolean;
};

type InvestmentFormState = {
  bankName: string;
  investmentType: string;
  amount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
};

type RenewalFormState = {
  startDate: string;
  maturityDate: string;
  amount: number;
  interestRate: number;
  withdrawnDate: string;
  withdrawnAmount: number;
};

function createEmptyForm(): InvestmentFormState {
  const today = new Date().toISOString().slice(0, 10);

  return {
    bankName: "",
    investmentType: "",
    amount: 0,
    interestRate: 7,
    startDate: today,
    maturityDate: today,
    maturityAmount: 0
  };
}

function createRenewalForm(row?: InvestmentRecord | null): RenewalFormState {
  return {
    startDate: row?.maturityDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    maturityDate: row?.maturityDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    amount: Number(row?.amount ?? 0),
    interestRate: Number(row?.interestRate ?? 0),
    withdrawnDate: new Date().toISOString().slice(0, 10),
    withdrawnAmount: Number(row?.maturityAmount ?? 0)
  };
}

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
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
}

export function InvestmentWorkspace({ token, canManageInvestments = true }: InvestmentWorkspaceProps) {
  const [rows, setRows] = useState<InvestmentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState<"" | "true" | "false">("true");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<InvestmentRecord | null>(null);
  const [form, setForm] = useState<InvestmentFormState>(createEmptyForm());
  const [renewalForm, setRenewalForm] = useState<RenewalFormState>(createRenewalForm());

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listInvestments(token, {
        q: search,
        activeOnly,
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
      setTotal(response.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load investment records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [activeOnly, page, rowsPerPage, search, token]);

  useEffect(() => {
    setRenewalForm(createRenewalForm(detailRow));
  }, [detailRow]);

  const metrics = useMemo(() => {
    const activeCount = rows.filter((row) => !row.withdrawnDate).length;
    const maturedAmount = rows.reduce((sum, row) => sum + Number(row.maturityAmount || 0), 0);
    const investedAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return [
      { label: "Visible Investments", value: String(total), caption: "Investment rows matching the current filters." },
      { label: "Active", value: String(activeCount), caption: "Investments that have not been withdrawn yet." },
      { label: "Principal", value: formatCurrency(investedAmount), caption: "Visible investment principal amount." },
      { label: "Maturity Value", value: formatCurrency(maturedAmount), caption: "Expected maturity value across visible investments." }
    ];
  }, [rows, total]);

  async function handleCreateInvestment() {
    if (!form.bankName.trim() || !form.investmentType.trim() || Number(form.amount) <= 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createInvestment(token, {
        bankName: form.bankName.trim(),
        investmentType: form.investmentType.trim(),
        amount: Number(form.amount),
        interestRate: Number(form.interestRate),
        startDate: form.startDate,
        maturityDate: form.maturityDate,
        maturityAmount: Number(form.maturityAmount) > 0 ? Number(form.maturityAmount) : undefined
      });
      setCreateOpen(false);
      setForm(createEmptyForm());
      setPage(0);
      await loadRows();
      toast.success("Investment created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create the investment.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRenewInvestment() {
    if (!detailRow) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await renewInvestment(token, detailRow.id, {
        startDate: renewalForm.startDate,
        maturityDate: renewalForm.maturityDate,
        amount: Number(renewalForm.amount),
        interestRate: Number(renewalForm.interestRate)
      });
      await loadRows();
      toast.success("Investment renewed.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to renew the investment.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdrawInvestment() {
    if (!detailRow) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await withdrawInvestment(token, detailRow.id, {
        withdrawnDate: renewalForm.withdrawnDate,
        maturityAmount: Number(renewalForm.withdrawnAmount)
      });
      await loadRows();
      setDetailRow(null);
      toast.success("Investment withdrawn.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to withdraw the investment.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<SavingsRoundedIcon />}
        eyebrow="Investments"
        title="Investment Desk"
        description="Manage live external investment records, renew active placements, and withdraw matured investments from one workspace."
        colorScheme="emerald"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search bank or investment type..."
              sx={{
                minWidth: { xs: "100%", sm: 240 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
            />
            <TextField
              select
              size="small"
              value={activeOnly}
              onChange={(event) => {
                setPage(0);
                setActiveOnly(event.target.value as "" | "true" | "false");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 170 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
            >
              <MenuItem value="true">Active Only</MenuItem>
              <MenuItem value="false">All Rows</MenuItem>
              <MenuItem value="">No Filter</MenuItem>
            </TextField>
            {canManageInvestments ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
              >
                New Investment
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

      {!canManageInvestments ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          This investment desk is visible in read-only mode for your login.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Bank</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>Principal</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Maturity Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "14%" }}>Maturity Value</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "10%" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={8} label="No investment rows matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading investment records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.bankName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.investmentType}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {formatCurrency(row.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {Number(row.interestRate).toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(row.maturityDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {formatCurrency(row.maturityAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.withdrawnDate ? "Withdrawn" : "Active"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setDetailRow(row)}>
                        <VisibilityRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Drawer
        anchor="right"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 500 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setCreateOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Create Investment
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField fullWidth label="Bank Name" value={form.bankName} onChange={(event) => setForm((previous) => ({ ...previous, bankName: event.target.value }))} />
            <TextField fullWidth label="Investment Type" value={form.investmentType} onChange={(event) => setForm((previous) => ({ ...previous, investmentType: event.target.value }))} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField type="number" fullWidth label="Amount" value={form.amount} onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField type="number" fullWidth label="Interest Rate" value={form.interestRate} onChange={(event) => setForm((previous) => ({ ...previous, interestRate: Number(event.target.value) }))} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField type="date" fullWidth label="Start Date" value={form.startDate} onChange={(event) => setForm((previous) => ({ ...previous, startDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField type="date" fullWidth label="Maturity Date" value={form.maturityDate} onChange={(event) => setForm((previous) => ({ ...previous, maturityDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <TextField type="number" fullWidth label="Expected Maturity Amount" value={form.maturityAmount} onChange={(event) => setForm((previous) => ({ ...previous, maturityAmount: Number(event.target.value) }))} />
            <Button
              variant="contained"
              onClick={() => void handleCreateInvestment()}
              disabled={submitting || !form.bankName.trim() || !form.investmentType.trim() || Number(form.amount) <= 0}
              sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
            >
              Create Investment
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 560 }, borderRadius: "24px 0 0 24px" } }}
      >
        {detailRow ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
              <IconButton onClick={() => setDetailRow(null)} sx={{ position: "absolute", right: 16, top: 16, color: "#fff" }}>
                <CloseRoundedIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {detailRow.bankName}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                {detailRow.investmentType}
              </Typography>
            </Box>
            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Principal" value={formatCurrency(detailRow.amount)} caption="Current investment amount." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Rate" value={`${Number(detailRow.interestRate).toFixed(2)}%`} caption="Interest rate on record." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Maturity" value={formatCurrency(detailRow.maturityAmount)} caption="Expected maturity value." />
                </Grid>
              </Grid>

              {canManageInvestments ? (
                <Stack spacing={2.5} sx={{ mt: 3 }}>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                      Renew Investment
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField type="date" fullWidth label="Start Date" value={renewalForm.startDate} onChange={(event) => setRenewalForm((previous) => ({ ...previous, startDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField type="date" fullWidth label="New Maturity Date" value={renewalForm.maturityDate} onChange={(event) => setRenewalForm((previous) => ({ ...previous, maturityDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField type="number" fullWidth label="Amount" value={renewalForm.amount} onChange={(event) => setRenewalForm((previous) => ({ ...previous, amount: Number(event.target.value) }))} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField type="number" fullWidth label="Interest Rate" value={renewalForm.interestRate} onChange={(event) => setRenewalForm((previous) => ({ ...previous, interestRate: Number(event.target.value) }))} />
                      </Grid>
                    </Grid>
                    <Button variant="contained" sx={{ mt: 2, borderRadius: 2.5, fontWeight: 900 }} onClick={() => void handleRenewInvestment()} disabled={submitting}>
                      Renew Investment
                    </Button>
                  </Paper>

                  {!detailRow.withdrawnDate ? (
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                        Withdraw Investment
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField type="date" fullWidth label="Withdrawn Date" value={renewalForm.withdrawnDate} onChange={(event) => setRenewalForm((previous) => ({ ...previous, withdrawnDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField type="number" fullWidth label="Settled Amount" value={renewalForm.withdrawnAmount} onChange={(event) => setRenewalForm((previous) => ({ ...previous, withdrawnAmount: Number(event.target.value) }))} />
                        </Grid>
                      </Grid>
                      <Button color="inherit" variant="outlined" sx={{ mt: 2, borderRadius: 2.5, fontWeight: 900 }} onClick={() => void handleWithdrawInvestment()} disabled={submitting}>
                        Withdraw Investment
                      </Button>
                    </Paper>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                      This investment was withdrawn on {formatDate(detailRow.withdrawnDate)}.
                    </Alert>
                  )}
                </Stack>
              ) : null}
            </Box>
          </Box>
        ) : null}
      </Drawer>
    </Stack>
  );
}
