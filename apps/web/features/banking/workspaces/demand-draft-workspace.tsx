"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
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
  createDemandDraft,
  listDemandDrafts,
  updateDemandDraft,
  updateDemandDraftStatus,
  type DemandDraftRecord
} from "@/shared/api/demand-drafts";
import { type InstrumentStatus } from "@/shared/api/cheque-clearing";
import { listCustomers, type CustomerListRecord } from "@/shared/api/customers";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type DemandDraftWorkspaceProps = {
  token: string;
  canManageDrafts?: boolean;
};

type DraftFormState = {
  accountId: string;
  customerId: string;
  beneficiary: string;
  amount: number;
};

const statusOptions: Array<InstrumentStatus | ""> = ["", "ENTERED", "CLEARED", "RETURNED", "CANCELLED"];

function createEmptyForm(): DraftFormState {
  return {
    accountId: "",
    customerId: "",
    beneficiary: "",
    amount: 0
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

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
}

function formatCustomerName(customer?: DemandDraftRecord["customer"] | CustomerListRecord | null) {
  if (!customer) {
    return "-";
  }

  return [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() || customer.customerCode;
}

export function DemandDraftWorkspace({ token, canManageDrafts = true }: DemandDraftWorkspaceProps) {
  const [rows, setRows] = useState<DemandDraftRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DemandDraftRecord | null>(null);
  const [form, setForm] = useState<DraftFormState>(createEmptyForm());

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [draftResponse, accountResponse, customerResponse] = await Promise.all([
        listDemandDrafts(token, { q: search, status, page: page + 1, limit: rowsPerPage }),
        listAccounts(token, { page: 1, limit: 200 }),
        listCustomers(token, { page: 1, limit: 200 })
      ]);

      setRows(draftResponse.rows);
      setTotal(draftResponse.total);
      setAccounts(accountResponse.rows);
      setCustomers(customerResponse.rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load demand drafts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [page, rowsPerPage, search, status, token]);

  const metrics = useMemo(() => {
    const entered = rows.filter((row) => row.status === "ENTERED").length;
    const cleared = rows.filter((row) => row.status === "CLEARED").length;
    const amount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return [
      { label: "Visible Drafts", value: String(total), caption: "Demand draft rows matching the current filters." },
      { label: "Entered", value: String(entered), caption: "Drafts still waiting for final status action." },
      { label: "Cleared", value: String(cleared), caption: "Drafts already marked cleared." },
      { label: "Amount", value: formatCurrency(amount), caption: "Total amount across visible demand drafts." }
    ];
  }, [rows, total]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === form.accountId) ?? null,
    [accounts, form.accountId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === form.customerId) ?? null,
    [customers, form.customerId]
  );

  function openCreateDrawer() {
    setEditingRow(null);
    setForm(createEmptyForm());
    setDrawerOpen(true);
  }

  function openEditDrawer(row: DemandDraftRecord) {
    setEditingRow(row);
    setForm({
      accountId: row.accountId ?? "",
      customerId: row.customerId ?? "",
      beneficiary: row.beneficiary,
      amount: Number(row.amount)
    });
    setDrawerOpen(true);
  }

  async function handleSaveDraft() {
    if ((!form.accountId && !form.customerId) || !form.beneficiary.trim() || Number(form.amount) <= 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingRow) {
        await updateDemandDraft(token, editingRow.id, {
          beneficiary: form.beneficiary.trim(),
          amount: Number(form.amount)
        });
      } else {
        await createDemandDraft(token, {
          accountId: form.accountId || undefined,
          customerId: form.customerId || undefined,
          beneficiary: form.beneficiary.trim(),
          amount: Number(form.amount)
        });
      }

      setDrawerOpen(false);
      setEditingRow(null);
      setForm(createEmptyForm());
      setPage(0);
      await loadWorkspace();
      toast.success(editingRow ? "Demand draft updated." : "Demand draft created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to save the demand draft.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(row: DemandDraftRecord, nextStatus: InstrumentStatus) {
    setSubmitting(true);
    setError(null);

    try {
      await updateDemandDraftStatus(token, row.id, nextStatus);
      await loadWorkspace();
      toast.success(`Demand draft marked ${nextStatus.toLowerCase()}.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to update the draft status.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<ArticleRoundedIcon />}
        eyebrow="Demand Drafts"
        title="Demand Draft Desk"
        description="Issue, revise, and close out live demand drafts instead of falling back to documentation placeholders."
        colorScheme="amber"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search draft, beneficiary, account..."
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
            {canManageDrafts ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreateDrawer}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
              >
                New Draft
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

      {!canManageDrafts ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          This demand draft desk is visible in read-only mode for your login.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "15%" }}>Draft No</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Beneficiary</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "16%" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Account</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "11%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={7} label="No demand drafts matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading demand drafts...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.draftNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(row.issuedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.beneficiary}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatCustomerName(row.customer)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.account?.accountNumber ?? "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {formatCurrency(row.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "CLEARED" ? "success" : "default"} />
                    </TableCell>
                    <TableCell align="right">
                      {canManageDrafts ? (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {row.status === "ENTERED" ? (
                            <IconButton size="small" onClick={() => openEditDrawer(row)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          ) : null}
                          {row.status !== "CLEARED" ? (
                            <Button size="small" color="success" onClick={() => void handleStatusUpdate(row, "CLEARED")}>
                              Clear
                            </Button>
                          ) : null}
                          {row.status !== "RETURNED" ? (
                            <Button size="small" color="warning" onClick={() => void handleStatusUpdate(row, "RETURNED")}>
                              Return
                            </Button>
                          ) : null}
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
        PaperProps={{ sx: { width: { xs: "100%", md: 500 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingRow ? "Edit Demand Draft" : "Issue Demand Draft"}
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
              <MenuItem value="">Not linked to an account</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountNumber}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Customer"
              value={form.customerId}
              onChange={(event) => setForm((previous) => ({ ...previous, customerId: event.target.value }))}
            >
              <MenuItem value="">Pick from account only</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {formatCustomerName(customer)} ({customer.customerCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Beneficiary"
              value={form.beneficiary}
              onChange={(event) => setForm((previous) => ({ ...previous, beneficiary: event.target.value }))}
            />
            <TextField
              type="number"
              fullWidth
              label="Amount"
              value={form.amount}
              onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
            />

            {(selectedAccount || selectedCustomer) ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                  Draft Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account: {selectedAccount?.accountNumber ?? "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: {selectedCustomer ? `${formatCustomerName(selectedCustomer)} (${selectedCustomer.customerCode})` : "-"}
                </Typography>
              </Paper>
            ) : null}

            <Button
              variant="contained"
              onClick={() => void handleSaveDraft()}
              disabled={submitting || (!form.accountId && !form.customerId) || !form.beneficiary.trim() || Number(form.amount) <= 0}
              sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
            >
              {editingRow ? "Save Draft" : "Create Draft"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
