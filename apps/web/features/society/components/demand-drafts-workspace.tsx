"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
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
  listDemandDrafts,
  createDemandDraft,
  updateDemandDraft,
  updateDemandDraftStatus,
  type DemandDraftRecord,
  type InstrumentStatus
} from "@/shared/api/demand-drafts";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type DemandDraftsWorkspaceProps = {
  token: string;
};

type DemandDraftForm = {
  accountId: string;
  customerId: string;
  beneficiary: string;
  amount: string;
};

function createEmptyDemandDraftForm(): DemandDraftForm {
  return {
    accountId: "",
    customerId: "",
    beneficiary: "",
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

export function DemandDraftsWorkspace({ token }: DemandDraftsWorkspaceProps) {
  const theme = useTheme();
  const [rows, setRows] = useState<DemandDraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DemandDraftRecord | null>(null);
  const [form, setForm] = useState<DemandDraftForm>(createEmptyDemandDraftForm());
  const [newStatus, setNewStatus] = useState<InstrumentStatus>("ENTERED");

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listDemandDrafts(token, {
        q: search,
        status,
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Unable to load demand drafts.";
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
  }, [search, status, page, rowsPerPage, token]);

  const metrics = useMemo(() => {
    const totalAmount = rows.reduce((sum, dd) => sum + Number(dd.amount || 0), 0);
    const cleared = rows.filter((dd) => dd.status === "CLEARED").length;
    const returned = rows.filter((dd) => dd.status === "RETURNED").length;

    return [
      { label: "Total Drafts", value: String(rows.length), caption: "Demand draft records." },
      { label: "Total Amount", value: formatCurrency(totalAmount), caption: "Total draft amount." },
      { label: "Cleared", value: String(cleared), caption: "Successfully cleared drafts." },
      { label: "Returned", value: String(returned), caption: "Returned drafts." }
    ];
  }, [rows]);

  async function handleCreate() {
    if (!form.beneficiary || !form.amount) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createDemandDraft(token, {
        accountId: form.accountId || undefined,
        customerId: form.customerId || undefined,
        beneficiary: form.beneficiary,
        amount: parseFloat(form.amount)
      });
      toast.success("Demand draft created successfully");
      setCreateOpen(false);
      setForm(createEmptyDemandDraftForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to create demand draft";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!selectedDraft || !form.beneficiary || !form.amount) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      await updateDemandDraft(token, selectedDraft.id, {
        beneficiary: form.beneficiary,
        amount: parseFloat(form.amount)
      });
      toast.success("Demand draft updated successfully");
      setEditOpen(false);
      setSelectedDraft(null);
      setForm(createEmptyDemandDraftForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to update demand draft";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange() {
    if (!selectedDraft) {
      toast.error("Please select a draft");
      return;
    }

    setSubmitting(true);
    try {
      await updateDemandDraftStatus(token, selectedDraft.id, newStatus);
      toast.success(`Status changed to ${newStatus}`);
      setStatusOpen(false);
      setSelectedDraft(null);
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
      <SectionHero 
        icon={<DescriptionRoundedIcon sx={{ fontSize: 40 }} />}
        eyebrow="Instrument Management"
        title="Demand Drafts" 
        description="Manage demand draft issuance, tracking, and status updates." 
      />
      
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
            placeholder="Search by beneficiary, draft number..."
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
            New Draft
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <TableEmpty colSpan={6} label="No demand drafts found" />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Draft Number</TableCell>
                    <TableCell>Beneficiary</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Issued Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.draftNumber}</TableCell>
                      <TableCell>{row.beneficiary}</TableCell>
                      <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                      <TableCell>{formatDate(row.issuedAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={row.status === "CLEARED" ? "success" : row.status === "RETURNED" ? "error" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <IconButton
                            size="small"
                            title="Edit"
                            onClick={() => {
                              setSelectedDraft(row);
                              setForm({
                                accountId: row.accountId || "",
                                customerId: row.customerId || "",
                                beneficiary: row.beneficiary,
                                amount: String(row.amount)
                              });
                              setEditOpen(true);
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedDraft(row);
                              setNewStatus(row.status === "ENTERED" ? "CLEARED" : "RETURNED");
                              setStatusOpen(true);
                            }}
                          >
                            Change Status
                          </Button>
                        </Box>
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
            <Typography variant="h6">New Demand Draft</Typography>
            <IconButton size="small" onClick={() => setCreateOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
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
              label="Beneficiary"
              value={form.beneficiary}
              onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
              fullWidth
              required
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

      {/* Edit Drawer */}
      <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Edit Demand Draft</Typography>
            <IconButton size="small" onClick={() => setEditOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Beneficiary"
              value={form.beneficiary}
              onChange={(e) => setForm({ ...form, beneficiary: e.target.value })}
              fullWidth
              required
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
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleUpdate}
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update"}
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
              Current Status: {selectedDraft?.status}
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
