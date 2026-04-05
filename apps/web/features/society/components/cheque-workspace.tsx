"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
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
import { listAccounts, type AccountRecord } from "@/shared/api/accounts";
import {
  createChequeEntry,
  listChequeClearing,
  updateChequeEntry,
  updateChequeStatus,
  type ChequeClearingRecord,
  type InstrumentStatus
} from "@/shared/api/cheque-clearing";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type ChequeWorkspaceProps = {
  token: string;
};

type ChequeFormState = {
  accountId: string;
  chequeNumber: string;
  bankName: string;
  branchName: string;
  amount: number;
};

const statusOptions: Array<InstrumentStatus | ""> = ["", "ENTERED", "CLEARED", "RETURNED", "CANCELLED"];

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

function createEmptyChequeForm(): ChequeFormState {
  return {
    accountId: "",
    chequeNumber: "",
    bankName: "",
    branchName: "",
    amount: 0
  };
}

export function ChequeWorkspace({ token }: ChequeWorkspaceProps) {
  const [rows, setRows] = useState<ChequeClearingRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<ChequeClearingRecord | null>(null);
  const [form, setForm] = useState<ChequeFormState>(createEmptyChequeForm());

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [chequeResponse, accountResponse] = await Promise.all([
        listChequeClearing(token, { q: search, status, page: 1, limit: 100 }),
        listAccounts(token, { page: 1, limit: 100 })
      ]);
      setRows(chequeResponse.rows);
      setAccounts(accountResponse.rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load cheque clearing workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [search, status, token]);

  const metrics = useMemo(() => {
    const entered = rows.filter((row) => row.status === "ENTERED").length;
    const cleared = rows.filter((row) => row.status === "CLEARED").length;
    const returned = rows.filter((row) => row.status === "RETURNED").length;
    const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return [
      { label: "Entries", value: String(rows.length), caption: "Cheque entries visible in this queue." },
      { label: "Pending", value: String(entered), caption: "Entered cheques waiting for final action." },
      { label: "Cleared", value: String(cleared), caption: "Cheques already cleared." },
      { label: "Amount", value: formatCurrency(totalAmount), caption: "Total amount across the filtered queue." },
      { label: "Returned", value: String(returned), caption: "Cheques sent back or failed to clear." }
    ];
  }, [rows]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === form.accountId) ?? null,
    [accounts, form.accountId]
  );

  function openCreateDrawer() {
    setEditingRow(null);
    setForm(createEmptyChequeForm());
    setDrawerOpen(true);
  }

  function openEditDrawer(row: ChequeClearingRecord) {
    setEditingRow(row);
    setForm({
      accountId: row.accountId ?? "",
      chequeNumber: row.chequeNumber,
      bankName: row.bankName,
      branchName: row.branchName,
      amount: Number(row.amount)
    });
    setDrawerOpen(true);
  }

  async function handleSaveEntry() {
    if (!form.accountId || !form.chequeNumber.trim() || !form.bankName.trim() || !form.branchName.trim() || form.amount <= 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingRow) {
        await updateChequeEntry(token, editingRow.id, {
          bankName: form.bankName.trim(),
          branchName: form.branchName.trim(),
          amount: Number(form.amount)
        });
      } else {
        await createChequeEntry(token, {
          accountId: form.accountId,
          chequeNumber: form.chequeNumber.trim(),
          bankName: form.bankName.trim(),
          branchName: form.branchName.trim(),
          amount: Number(form.amount)
        });
      }

      setDrawerOpen(false);
      setEditingRow(null);
      setForm(createEmptyChequeForm());
      await loadWorkspace();
      toast.success(editingRow ? "Cheque entry updated." : "Cheque entry created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to save cheque entry.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(row: ChequeClearingRecord, nextStatus: InstrumentStatus) {
    setSubmitting(true);
    setError(null);

    try {
      await updateChequeStatus(token, row.id, nextStatus);
      await loadWorkspace();
      if (editingRow?.id === row.id) {
        setEditingRow({ ...row, status: nextStatus });
      }
      toast.success(`Cheque marked ${nextStatus.toLowerCase()}.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to update cheque status.";
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
        eyebrow="Cheque"
        title="Cheque Clearing Desk"
        description="Capture cheque entries, correct data before clearing, and update clearing outcomes directly from the society dashboard."
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
              placeholder="Search cheque, bank, account..."
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
                setStatus(event.target.value as InstrumentStatus | "");
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
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreateDrawer}
              disabled={!accounts.length}
              sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
            >
              Add Cheque
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 2.4 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {!accounts.length ? (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          No accounts are available for cheque entry yet.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "16%" }}>Cheque No</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "20%" }}>Bank</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Branch</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>Entry Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "6%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={8} label="No cheque entries matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading cheque queue...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{row.chequeNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.account?.accountNumber ?? "-"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{row.bankName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{row.branchName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{formatCurrency(row.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "CLEARED" ? "success" : "default"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(row.entryDate)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditDrawer(row)}>
                        <EditRoundedIcon fontSize="small" />
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 540 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingRow ? "Update Cheque Entry" : "Add Cheque Entry"}
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
              disabled={Boolean(editingRow)}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountNumber} - {formatPersonName(account.customer?.firstName, account.customer?.lastName)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Cheque Number"
              value={form.chequeNumber}
              onChange={(event) => setForm((previous) => ({ ...previous, chequeNumber: event.target.value }))}
              disabled={Boolean(editingRow)}
            />
            <TextField
              fullWidth
              label="Bank Name"
              value={form.bankName}
              onChange={(event) => setForm((previous) => ({ ...previous, bankName: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Branch Name"
              value={form.branchName}
              onChange={(event) => setForm((previous) => ({ ...previous, branchName: event.target.value }))}
            />
            <TextField
              type="number"
              fullWidth
              label="Amount"
              value={form.amount}
              onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
            />

            {selectedAccount ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                  Account Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAccount.accountNumber} - {formatPersonName(selectedAccount.customer?.firstName, selectedAccount.customer?.lastName)}
                </Typography>
              </Paper>
            ) : null}

            <Button
              variant="contained"
              onClick={() => void handleSaveEntry()}
              disabled={
                submitting ||
                !form.accountId ||
                !form.chequeNumber.trim() ||
                !form.bankName.trim() ||
                !form.branchName.trim() ||
                form.amount <= 0
              }
              sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
            >
              {editingRow ? "Save Changes" : "Create Entry"}
            </Button>

            {editingRow ? (
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                  Status Actions
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {(["CLEARED", "RETURNED", "CANCELLED"] as InstrumentStatus[]).map((nextStatus) => (
                    <Button
                      key={nextStatus}
                      size="small"
                      variant={editingRow.status === nextStatus ? "contained" : "outlined"}
                      disabled={submitting}
                      onClick={() => void handleStatusUpdate(editingRow, nextStatus)}
                      sx={{ borderRadius: 2 }}
                    >
                      {nextStatus}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
