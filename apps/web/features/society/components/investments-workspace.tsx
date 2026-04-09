"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
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
import { useTheme } from "@mui/material/styles";
import {
  listInvestments,
  createInvestment,
  renewInvestment,
  withdrawInvestment,
  type InvestmentRecord
} from "@/shared/api/investments";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getInvestmentsWorkspaceCopy } from "@/shared/i18n/investments-workspace-copy";
import { toast } from "@/shared/ui/toast";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";

type InvestmentsWorkspaceProps = {
  token: string;
};

type InvestmentForm = {
  bankName: string;
  investmentType: string;
  amount: string;
  interestRate: string;
  startDate: string;
  maturityDate: string;
  maturityAmount: string;
};

function createEmptyInvestmentForm(): InvestmentForm {
  return {
    bankName: "",
    investmentType: "",
    amount: "",
    interestRate: "",
    startDate: "",
    maturityDate: "",
    maturityAmount: ""
  };
}

function resolveIntlLocale(locale: "en" | "hi" | "mr") {
  return locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
}

function formatCurrency(value: number | string, locale: "en" | "hi" | "mr"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "\u20b90";
  return `\u20b9${num.toLocaleString(resolveIntlLocale(locale), { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string, locale: "en" | "hi" | "mr"): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(resolveIntlLocale(locale));
}

export function InvestmentsWorkspace({ token }: InvestmentsWorkspaceProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getInvestmentsWorkspaceCopy(locale);
  const [rows, setRows] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRecord | null>(null);
  const [actionType, setActionType] = useState<"renew" | "withdraw" | null>(null);
  const [form, setForm] = useState<InvestmentForm>(createEmptyInvestmentForm());
  const [renewForm, setRenewForm] = useState({
    startDate: "",
    maturityDate: "",
    amount: "",
    interestRate: ""
  });
  const [withdrawForm, setWithdrawForm] = useState({
    withdrawnDate: "",
    maturityAmount: ""
  });

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listInvestments(token, {
        q: search,
        activeOnly: "true",
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.loadFailed;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [search, page, rowsPerPage, token, copy.errors.loadFailed]);

  const metrics = useMemo(() => {
    const totalAmount = rows.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalMaturity = rows.reduce((sum, inv) => sum + Number(inv.maturityAmount || 0), 0);
    const activeInvestments = rows.filter((inv) => !inv.withdrawnDate).length;

    return [
      { label: copy.metrics.totalInvestments.label, value: String(rows.length), caption: copy.metrics.totalInvestments.caption },
      { label: copy.metrics.investedAmount.label, value: formatCurrency(totalAmount, locale), caption: copy.metrics.investedAmount.caption },
      { label: copy.metrics.maturityValue.label, value: formatCurrency(totalMaturity, locale), caption: copy.metrics.maturityValue.caption },
      { label: copy.metrics.active.label, value: String(activeInvestments), caption: copy.metrics.active.caption }
    ];
  }, [rows, copy, locale]);

  async function handleCreate() {
    if (!form.bankName || !form.investmentType || !form.amount || !form.startDate || !form.maturityDate) {
      toast.error(copy.errors.requiredCreateFields);
      return;
    }

    setSubmitting(true);
    try {
      await createInvestment(token, {
        bankName: form.bankName,
        investmentType: form.investmentType,
        amount: parseFloat(form.amount),
        interestRate: parseFloat(form.interestRate || "0"),
        startDate: form.startDate,
        maturityDate: form.maturityDate,
        maturityAmount: form.maturityAmount ? parseFloat(form.maturityAmount) : undefined
      });
      toast.success(copy.success.created);
      setCreateOpen(false);
      setForm(createEmptyInvestmentForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.createFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRenew() {
    if (!selectedInvestment || !renewForm.maturityDate) {
      toast.error(copy.errors.requiredActionFields);
      return;
    }

    setSubmitting(true);
    try {
      await renewInvestment(token, selectedInvestment.id, {
        startDate: renewForm.startDate || undefined,
        maturityDate: renewForm.maturityDate,
        amount: renewForm.amount ? parseFloat(renewForm.amount) : undefined,
        interestRate: renewForm.interestRate ? parseFloat(renewForm.interestRate) : undefined
      });
      toast.success(copy.success.renewed);
      setActionOpen(false);
      setActionType(null);
      setSelectedInvestment(null);
      setRenewForm({ startDate: "", maturityDate: "", amount: "", interestRate: "" });
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.renewFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdraw() {
    if (!selectedInvestment) {
      toast.error(copy.errors.selectInvestment);
      return;
    }

    setSubmitting(true);
    try {
      await withdrawInvestment(token, selectedInvestment.id, {
        withdrawnDate: withdrawForm.withdrawnDate || undefined,
        maturityAmount: withdrawForm.maturityAmount ? parseFloat(withdrawForm.maturityAmount) : undefined
      });
      toast.success(copy.success.withdrawn);
      setActionOpen(false);
      setActionType(null);
      setSelectedInvestment(null);
      setWithdrawForm({ withdrawnDate: "", maturityAmount: "" });
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.withdrawFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <SectionHero icon={<InfoRoundedIcon />} eyebrow={copy.hero.eyebrow} title={copy.hero.title} description={copy.hero.description} />

      <Box sx={{ px: 2, py: 3 }}>
        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={metric.label}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder={copy.actions.searchPlaceholder}
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}>
            {copy.actions.newInvestment}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Table>
            <TableBody>
              <TableEmpty colSpan={8} label={copy.table.emptyState} />
            </TableBody>
          </Table>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>{copy.table.bank}</TableCell>
                    <TableCell>{copy.table.type}</TableCell>
                    <TableCell align="right">{copy.table.amount}</TableCell>
                    <TableCell align="right">{copy.table.interestRate}</TableCell>
                    <TableCell>{copy.table.startDate}</TableCell>
                    <TableCell>{copy.table.maturityDate}</TableCell>
                    <TableCell>{copy.table.status}</TableCell>
                    <TableCell align="center">{copy.table.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.bankName}</TableCell>
                      <TableCell>{row.investmentType}</TableCell>
                      <TableCell align="right">{formatCurrency(row.amount, locale)}</TableCell>
                      <TableCell align="right">{Number(row.interestRate || 0).toFixed(2)}%</TableCell>
                      <TableCell>{formatDate(row.startDate, locale)}</TableCell>
                      <TableCell>{formatDate(row.maturityDate, locale)}</TableCell>
                      <TableCell>
                        <Chip label={row.withdrawnDate ? copy.table.withdrawn : copy.table.active} color={row.withdrawnDate ? "default" : "success"} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        {!row.withdrawnDate && (
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <IconButton
                              size="small"
                              title={copy.actions.renew}
                              onClick={() => {
                                setSelectedInvestment(row);
                                setActionType("renew");
                                setRenewForm({
                                  startDate: new Date().toISOString().slice(0, 10),
                                  maturityDate: "",
                                  amount: String(row.amount),
                                  interestRate: String(row.interestRate || 0)
                                });
                                setActionOpen(true);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title={copy.actions.withdraw}
                              onClick={() => {
                                setSelectedInvestment(row);
                                setActionType("withdraw");
                                setWithdrawForm({
                                  withdrawnDate: new Date().toISOString().slice(0, 10),
                                  maturityAmount: String(row.maturityAmount || row.amount)
                                });
                                setActionOpen(true);
                              }}
                            >
                              <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={rowsPerPage * (page + 1) + (rows.length < rowsPerPage ? 0 : rows.length)}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              labelRowsPerPage={copy.pagination.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                copy.pagination.displayedRows.replace("{{from}}", String(from)).replace("{{to}}", String(to)).replace("{{count}}", String(count))
              }
              getItemAriaLabel={(buttonType) => buttonType === "next" ? copy.pagination.nextPage : copy.pagination.previousPage}
            />
          </>
        )}
      </Paper>

      <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{copy.drawers.newInvestment}</Typography>
            <IconButton size="small" onClick={() => setCreateOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField label={copy.drawers.bankName} value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} fullWidth required />
            <TextField
              label={copy.drawers.investmentType}
              value={form.investmentType}
              onChange={(e) => setForm({ ...form, investmentType: e.target.value })}
              fullWidth
              required
              placeholder={copy.drawers.investmentTypePlaceholder}
            />
            <TextField label={copy.drawers.amount} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
            <TextField label={copy.drawers.interestRate} type="number" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} fullWidth inputProps={{ step: "0.01" }} />
            <TextField label={copy.drawers.startDate} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label={copy.drawers.maturityDate} type="date" value={form.maturityDate} onChange={(e) => setForm({ ...form, maturityDate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label={copy.drawers.maturityAmount} type="number" value={form.maturityAmount} onChange={(e) => setForm({ ...form, maturityAmount: e.target.value })} fullWidth inputProps={{ step: "0.01" }} />

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setCreateOpen(false)}>
                {copy.actions.cancel}
              </Button>
              <Button variant="contained" fullWidth onClick={handleCreate} disabled={submitting}>
                {submitting ? copy.actions.creating : copy.actions.create}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={actionOpen} onClose={() => setActionOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{actionType === "renew" ? copy.drawers.renewInvestment : copy.drawers.withdrawInvestment}</Typography>
            <IconButton size="small" onClick={() => setActionOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            {actionType === "renew" && (
              <>
                <TextField label={copy.drawers.newStartDate} type="date" value={renewForm.startDate} onChange={(e) => setRenewForm({ ...renewForm, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label={copy.drawers.newMaturityDate} type="date" value={renewForm.maturityDate} onChange={(e) => setRenewForm({ ...renewForm, maturityDate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
                <TextField label={copy.drawers.amountOptional} type="number" value={renewForm.amount} onChange={(e) => setRenewForm({ ...renewForm, amount: e.target.value })} fullWidth inputProps={{ step: "0.01" }} />
                <TextField label={copy.drawers.interestRateOptional} type="number" value={renewForm.interestRate} onChange={(e) => setRenewForm({ ...renewForm, interestRate: e.target.value })} fullWidth inputProps={{ step: "0.01" }} />
              </>
            )}

            {actionType === "withdraw" && (
              <>
                <TextField label={copy.drawers.withdrawnDate} type="date" value={withdrawForm.withdrawnDate} onChange={(e) => setWithdrawForm({ ...withdrawForm, withdrawnDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label={copy.drawers.maturityAmountReceived} type="number" value={withdrawForm.maturityAmount} onChange={(e) => setWithdrawForm({ ...withdrawForm, maturityAmount: e.target.value })} fullWidth inputProps={{ step: "0.01" }} />
              </>
            )}

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setActionOpen(false)}>
                {copy.actions.cancel}
              </Button>
              <Button variant="contained" fullWidth onClick={actionType === "renew" ? handleRenew : handleWithdraw} disabled={submitting}>
                {submitting ? copy.actions.processing : actionType === "renew" ? copy.actions.renew : copy.actions.withdraw}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
