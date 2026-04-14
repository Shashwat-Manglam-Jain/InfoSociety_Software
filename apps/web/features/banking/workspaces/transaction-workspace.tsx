"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
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
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha, useTheme } from "@mui/material/styles";
import { listAccounts, type AccountRecord } from "@/shared/api/accounts";
import {
  cancelTransaction,
  createTransaction,
  listTransactions,
  passTransaction,
  updateTransaction,
  type TransactionMode,
  type TransactionRecord,
  type TransactionType
} from "@/shared/api/transactions";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type TransactionWorkspaceProps = {
  token: string;
  canCreateTransactions?: boolean;
  canManageTransactions?: boolean;
  title?: string;
  description?: string;
};

type TransactionFormState = {
  accountId: string;
  amount: number;
  type: TransactionType;
  mode: TransactionMode;
  remark: string;
  valueDate: string;
};

const transactionTypes: TransactionType[] = ["CREDIT", "DEBIT"];
const transactionModes: TransactionMode[] = ["CASH", "CHEQUE", "TRANSFER", "ADJUSTMENT"];

function createEmptyForm(): TransactionFormState {
  return {
    accountId: "",
    amount: 0,
    type: "CREDIT",
    mode: "CASH",
    remark: "",
    valueDate: new Date().toISOString().slice(0, 10)
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

function StatusChip({ row }: { row: TransactionRecord }) {
  return (
    <Chip
      size="small"
      label={row.isPassed ? "Passed" : "Pending"}
      color={row.isPassed ? "success" : "default"}
      variant={row.isPassed ? "filled" : "outlined"}
    />
  );
}

export function TransactionWorkspace({
  token,
  canCreateTransactions = true,
  canManageTransactions = true,
  title = "Transaction Desk",
  description = "Capture live credit and debit entries, pass pending transactions, update transaction metadata, and reverse cancelled activity."
}: TransactionWorkspaceProps) {
  const theme = useTheme();
  const [rows, setRows] = useState<TransactionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "">("");
  const [accountFilter, setAccountFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TransactionRecord | null>(null);
  const [form, setForm] = useState<TransactionFormState>(createEmptyForm());

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [transactionResponse, accountResponse] = await Promise.all([
        listTransactions(token, {
          q: search,
          accountId: accountFilter || undefined,
          isPassed: statusFilter,
          type: typeFilter,
          page: page + 1,
          limit: rowsPerPage
        }),
        listAccounts(token, { page: 1, limit: 200 })
      ]);

      setRows(transactionResponse.rows);
      setTotal(transactionResponse.total);
      setAccounts(accountResponse.rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load transaction records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [accountFilter, page, rowsPerPage, search, statusFilter, token, typeFilter]);

  const metrics = useMemo(() => {
    const debitTotal = rows
      .filter((row) => row.type === "DEBIT")
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const creditTotal = rows
      .filter((row) => row.type === "CREDIT")
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const passedCount = rows.filter((row) => row.isPassed).length;

    return [
      { label: "Visible Entries", value: String(total), caption: "Transaction rows matching the current filters." },
      { label: "Passed", value: String(passedCount), caption: "Entries already posted to balances and ledger." },
      { label: "Credits", value: formatCurrency(creditTotal), caption: "Visible credit value in the current result set." },
      { label: "Debits", value: formatCurrency(debitTotal), caption: "Visible debit value in the current result set." }
    ];
  }, [rows, total]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === form.accountId) ?? null,
    [accounts, form.accountId]
  );

  function openCreateDrawer() {
    setEditingRow(null);
    setForm(createEmptyForm());
    setDrawerOpen(true);
  }

  function openEditDrawer(row: TransactionRecord) {
    setEditingRow(row);
    setForm({
      accountId: row.accountId,
      amount: Number(row.amount),
      type: row.type,
      mode: row.mode,
      remark: row.remark ?? "",
      valueDate: row.valueDate.slice(0, 10)
    });
    setDrawerOpen(true);
  }

  async function handleSaveTransaction() {
    if (!form.accountId || Number(form.amount) <= 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingRow) {
        await updateTransaction(token, editingRow.id, {
          accountId: form.accountId,
          amount: Number(form.amount),
          type: form.type,
          mode: form.mode,
          remark: form.remark.trim() || undefined,
          valueDate: form.valueDate
        });
      } else {
        await createTransaction(token, {
          accountId: form.accountId,
          amount: Number(form.amount),
          type: form.type,
          mode: form.mode,
          remark: form.remark.trim() || undefined,
          valueDate: form.valueDate
        });
      }

      setDrawerOpen(false);
      setEditingRow(null);
      setForm(createEmptyForm());
      setPage(0);
      await loadWorkspace();
      toast.success(editingRow ? "Transaction updated." : "Transaction created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to save the transaction.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePassTransaction(row: TransactionRecord) {
    setSubmitting(true);
    setError(null);

    try {
      await passTransaction(token, row.id);
      await loadWorkspace();
      toast.success("Transaction passed.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to pass the transaction.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelTransaction(row: TransactionRecord) {
    const reason = window.prompt("Enter cancellation reason (optional):") ?? undefined;

    setSubmitting(true);
    setError(null);

    try {
      await cancelTransaction(token, row.id, reason);
      await loadWorkspace();
      toast.success("Transaction cancelled.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to cancel the transaction.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<ReceiptLongRoundedIcon />}
        eyebrow="Transactions"
        title={title}
        description={description}
        colorScheme="blue"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search reference, account, remark..."
              sx={{
                minWidth: { xs: "100%", sm: 240 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.12),
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
              value={statusFilter}
              onChange={(event) => {
                setPage(0);
                setStatusFilter(event.target.value as "" | "true" | "false");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.12),
                  color: "#fff"
                }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="true">Passed</MenuItem>
              <MenuItem value="false">Pending</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              value={typeFilter}
              onChange={(event) => {
                setPage(0);
                setTypeFilter(event.target.value as TransactionType | "");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.12),
                  color: "#fff"
                }
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {transactionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            {canCreateTransactions ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreateDrawer}
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.96),
                  color: theme.palette.primary.dark,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.88) }
                }}
              >
                New Entry
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

      {!canCreateTransactions && !canManageTransactions ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          This transaction desk is available in view mode for your login.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1100, tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "16%" }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Mode</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>Remark</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "10%" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={9} label="No transaction records matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading transaction records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.transactionNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.account.accountNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {accounts.find((account) => account.id === row.accountId)?.customer?.customerCode ?? "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(row.valueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.type} color={row.type === "CREDIT" ? "success" : "warning"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.mode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {formatCurrency(row.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip row={row} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {row.remark || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canManageTransactions ? (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => openEditDrawer(row)}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          {!row.isPassed ? (
                            <IconButton size="small" color="success" onClick={() => void handlePassTransaction(row)}>
                              <CheckCircleRoundedIcon fontSize="small" />
                            </IconButton>
                          ) : null}
                          <Button size="small" color="inherit" onClick={() => void handleCancelTransaction(row)}>
                            Cancel
                          </Button>
                        </Stack>
                      ) : null}
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
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 480 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`, position: "relative" }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingRow ? "Edit Transaction" : "Create Transaction"}
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Account"
              value={form.accountId}
              onChange={(event) => setForm((previous) => ({ ...previous, accountId: event.target.value }))}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountNumber} · {account.customer?.customerCode ?? account.type}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Amount"
                  value={form.amount}
                  onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="date"
                  fullWidth
                  label="Value Date"
                  value={form.valueDate}
                  onChange={(event) => setForm((previous) => ({ ...previous, valueDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={form.type}
                  onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as TransactionType }))}
                >
                  {transactionTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Mode"
                  value={form.mode}
                  onChange={(event) => setForm((previous) => ({ ...previous, mode: event.target.value as TransactionMode }))}
                >
                  {transactionModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      {mode}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Remark"
              value={form.remark}
              onChange={(event) => setForm((previous) => ({ ...previous, remark: event.target.value }))}
            />

            {selectedAccount ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "background.default", border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                  Posting Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account: {selectedAccount.accountNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: {selectedAccount.customer?.customerCode ?? "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Balance: {formatCurrency(selectedAccount.currentBalance)}
                </Typography>
              </Paper>
            ) : null}

            <Button
              variant="contained"
              onClick={() => void handleSaveTransaction()}
              disabled={!form.accountId || Number(form.amount) <= 0 || submitting}
              sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
            >
              {editingRow ? "Save Transaction" : "Create Transaction"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
