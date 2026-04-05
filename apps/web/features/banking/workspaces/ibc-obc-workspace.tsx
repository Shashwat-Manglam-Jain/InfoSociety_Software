"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ImportExportRoundedIcon from "@mui/icons-material/ImportExportRounded";
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
import { type InstrumentStatus } from "@/shared/api/cheque-clearing";
import { listCustomers, type CustomerListRecord } from "@/shared/api/customers";
import {
  createIbcObc,
  listIbcObc,
  updateIbcObcStatus,
  type IbcObcRecord,
  type IbcObcType
} from "@/shared/api/ibc-obc";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type IbcObcWorkspaceProps = {
  token: string;
  canManageInstruments?: boolean;
};

type InstrumentFormState = {
  instrumentNumber: string;
  type: IbcObcType;
  accountId: string;
  customerId: string;
  amount: number;
};

const instrumentTypes: IbcObcType[] = ["IBC", "OBC"];
const statusOptions: Array<InstrumentStatus | ""> = ["", "ENTERED", "CLEARED", "RETURNED", "CANCELLED"];

function createEmptyForm(): InstrumentFormState {
  return {
    instrumentNumber: "",
    type: "IBC",
    accountId: "",
    customerId: "",
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

function formatCustomerName(customer?: IbcObcRecord["customer"] | CustomerListRecord | null) {
  if (!customer) {
    return "-";
  }

  return [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() || customer.customerCode;
}

export function IbcObcWorkspace({ token, canManageInstruments = true }: IbcObcWorkspaceProps) {
  const [rows, setRows] = useState<IbcObcRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<IbcObcType | "">("");
  const [status, setStatus] = useState<InstrumentStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<InstrumentFormState>(createEmptyForm());

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [instrumentResponse, accountResponse, customerResponse] = await Promise.all([
        listIbcObc(token, { q: search, type, status, page: page + 1, limit: rowsPerPage }),
        listAccounts(token, { page: 1, limit: 200 }),
        listCustomers(token, { page: 1, limit: 200 })
      ]);

      setRows(instrumentResponse.rows);
      setTotal(instrumentResponse.total);
      setAccounts(accountResponse.rows);
      setCustomers(customerResponse.rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load IBC/OBC instruments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [page, rowsPerPage, search, status, token, type]);

  const metrics = useMemo(() => {
    const entered = rows.filter((row) => row.status === "ENTERED").length;
    const cleared = rows.filter((row) => row.status === "CLEARED").length;
    const ibcCount = rows.filter((row) => row.type === "IBC").length;
    const obcCount = rows.filter((row) => row.type === "OBC").length;

    return [
      { label: "Visible Instruments", value: String(total), caption: "IBC/OBC rows matching the current filters." },
      { label: "Entered", value: String(entered), caption: "Instruments still waiting for final resolution." },
      { label: "IBC / OBC", value: `${ibcCount} / ${obcCount}`, caption: "Visible inward and outward collection mix." },
      { label: "Cleared", value: String(cleared), caption: "Instruments already marked cleared." }
    ];
  }, [rows, total]);

  async function handleCreateInstrument() {
    if ((!form.accountId && !form.customerId) || !form.instrumentNumber.trim() || Number(form.amount) <= 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createIbcObc(token, {
        instrumentNumber: form.instrumentNumber.trim().toUpperCase(),
        type: form.type,
        accountId: form.accountId || undefined,
        customerId: form.customerId || undefined,
        amount: Number(form.amount)
      });
      setDrawerOpen(false);
      setForm(createEmptyForm());
      setPage(0);
      await loadWorkspace();
      toast.success("IBC/OBC instrument created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to create the instrument.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(row: IbcObcRecord, nextStatus: InstrumentStatus) {
    setSubmitting(true);
    setError(null);

    try {
      await updateIbcObcStatus(token, row.id, nextStatus);
      await loadWorkspace();
      toast.success(`Instrument marked ${nextStatus.toLowerCase()}.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to update the instrument status.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<ImportExportRoundedIcon />}
        eyebrow="IBC / OBC"
        title="Instrument Collection Desk"
        description="Track inward and outward bill collection instruments with real entry, status, and resolution flows."
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
              placeholder="Search instrument, account, customer..."
              sx={{
                minWidth: { xs: "100%", sm: 240 },
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
              value={type}
              onChange={(event) => {
                setPage(0);
                setType(event.target.value as IbcObcType | "");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {instrumentTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={status}
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value as InstrumentStatus | "");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 160 },
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
            {canManageInstruments ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setDrawerOpen(true)}
                sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#e2e8f0" } }}
              >
                New Instrument
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

      {!canManageInstruments ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          This IBC/OBC desk is visible in read-only mode for your login.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "16%" }}>Instrument No</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "16%" }}>Account</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={7} label="No IBC/OBC instruments matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading IBC/OBC instruments...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.instrumentNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(row.entryDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.type} />
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
                      {canManageInstruments ? (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
            Create Instrument
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Instrument Number"
              value={form.instrumentNumber}
              onChange={(event) => setForm((previous) => ({ ...previous, instrumentNumber: event.target.value.toUpperCase() }))}
            />
            <TextField
              select
              fullWidth
              label="Type"
              value={form.type}
              onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as IbcObcType }))}
            >
              {instrumentTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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
              type="number"
              fullWidth
              label="Amount"
              value={form.amount}
              onChange={(event) => setForm((previous) => ({ ...previous, amount: Number(event.target.value) }))}
            />
            <Button
              variant="contained"
              onClick={() => void handleCreateInstrument()}
              disabled={submitting || (!form.accountId && !form.customerId) || !form.instrumentNumber.trim() || Number(form.amount) <= 0}
              sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900 }}
            >
              Create Instrument
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
