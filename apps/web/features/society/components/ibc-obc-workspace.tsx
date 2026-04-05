"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { useTheme } from "@mui/material/styles";
import {
  listIbcObc,
  createIbcObc,
  updateIbcObcStatus,
  type IbcObcRecord,
  type IbcObcType,
  type InstrumentStatus
} from "@/shared/api/ibc-obc";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type IbcObcWorkspaceProps = {
  token: string;
};

type IbcObcForm = {
  instrumentNumber: string;
  type: IbcObcType;
  accountId: string;
  customerId: string;
  amount: string;
};

function createEmptyIbcObcForm(): IbcObcForm {
  return {
    instrumentNumber: "",
    type: "IBC",
    accountId: "",
    customerId: "",
    amount: ""
  };
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
}

const STATUSES: InstrumentStatus[] = ["ENTERED", "CLEARED", "RETURNED", "CANCELLED"];
const TYPES: IbcObcType[] = ["IBC", "OBC"];

export function IbcObcWorkspace({ token }: IbcObcWorkspaceProps) {
  const theme = useTheme();
  const [rows, setRows] = useState<IbcObcRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<IbcObcType | "">("");
  const [status, setStatus] = useState<InstrumentStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<IbcObcRecord | null>(null);
  const [form, setForm] = useState<IbcObcForm>(createEmptyIbcObcForm());
  const [newStatus, setNewStatus] = useState<InstrumentStatus>("ENTERED");

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listIbcObc(token, {
        q: search,
        type: type as IbcObcType | "",
        status,
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Unable to load IBC/OBC instruments.";
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
  }, [search, type, status, page, rowsPerPage, token]);

  const metrics = useMemo(() => {
    const totalAmount = rows.reduce((sum, ibc) => sum + Number(ibc.amount || 0), 0);
    const ibcCount = rows.filter((ibc) => ibc.type === "IBC").length;
    const obcCount = rows.filter((ibc) => ibc.type === "OBC").length;
    const cleared = rows.filter((ibc) => ibc.status === "CLEARED").length;

    return [
      { label: "Total Instruments", value: String(rows.length), caption: "Total IBC/OBC records." },
      { label: "Total Amount", value: formatCurrency(totalAmount), caption: "Total instrument amount." },
      { label: "IBC", value: String(ibcCount), caption: "Inward Bill Collection." },
      { label: "OBC", value: String(obcCount), caption: "Outward Bill Collection." }
    ];
  }, [rows]);

  async function handleCreate() {
    if (!form.instrumentNumber || !form.amount) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createIbcObc(token, {
        instrumentNumber: form.instrumentNumber,
        type: form.type,
        accountId: form.accountId || undefined,
        customerId: form.customerId || undefined,
        amount: parseFloat(form.amount)
      });
      toast.success("Instrument created successfully");
      setCreateOpen(false);
      setForm(createEmptyIbcObcForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to create instrument";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange() {
    if (!selectedInstrument) {
      toast.error("Please select an instrument");
      return;
    }

    setSubmitting(true);
    try {
      await updateIbcObcStatus(token, selectedInstrument.id, newStatus);
      toast.success(`Status changed to ${newStatus}`);
      setStatusOpen(false);
      setSelectedInstrument(null);
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to update status";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <SectionHero title="IBC/OBC Instruments" description="Manage inward and outward bill collection." />
      
      <Box sx={{ px: 2, py: 3 }}>
        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.label}>
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
            placeholder="Search by instrument number..."
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
          <TextField
            select
            label="Type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as IbcObcType | "");
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Types</MenuItem>
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as InstrumentStatus | "");
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
          >
            New Instrument
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <TableEmpty message="No IBC/OBC instruments found" />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Instrument Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Entry Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.instrumentNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.type}
                          color={row.type === "IBC" ? "primary" : "secondary"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                      <TableCell>{formatDate(row.entryDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={row.status === "CLEARED" ? "success" : row.status === "RETURNED" ? "error" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedInstrument(row);
                            setNewStatus(row.status === "ENTERED" ? "CLEARED" : "RETURNED");
                            setStatusOpen(true);
                          }}
                        >
                          Change Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
          </>
        )}
      </Paper>

      {/* Create Drawer */}
      <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">New Instrument</Typography>
            <IconButton size="small" onClick={() => setCreateOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Instrument Number"
              value={form.instrumentNumber}
              onChange={(e) => setForm({ ...form, instrumentNumber: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as IbcObcType })}
              fullWidth
              required
            >
              {TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Account ID (optional)"
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Customer ID (optional)"
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
              required
              inputProps={{ step: "0.01" }}
            />

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      {/* Status Change Drawer */}
      <Drawer anchor="right" open={statusOpen} onClose={() => setStatusOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Change Status</Typography>
            <IconButton size="small" onClick={() => setStatusOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Current Status: {selectedInstrument?.status}
            </Typography>
            <TextField
              select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as InstrumentStatus)}
              fullWidth
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setStatusOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleStatusChange}
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
