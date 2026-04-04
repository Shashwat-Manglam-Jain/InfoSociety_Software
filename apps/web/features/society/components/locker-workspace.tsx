"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
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
import { alpha } from "@mui/material/styles";
import {
  closeLocker,
  createLocker,
  listLockers,
  listLockerVisits,
  type LockerRecord,
  type LockerSize,
  type LockerStatus,
  type LockerVisitRecord,
  visitLocker
} from "@/shared/api/locker";

type LockerWorkspaceClient = {
  id: string;
  fullName: string;
  branchId?: string | null;
  customerProfile?: {
    id: string;
    customerCode: string;
  } | null;
  isActive?: boolean;
};

type LockerWorkspaceBranch = {
  id: string;
  name: string;
  code?: string;
};

type LockerWorkspaceProps = {
  token: string;
  clients: LockerWorkspaceClient[];
  branches: LockerWorkspaceBranch[];
};

type LockerFormState = {
  customerId: string;
  lockerNumber: string;
  size: LockerSize;
  annualCharge: number;
};

const lockerSizeOptions: LockerSize[] = ["SMALL", "MEDIUM", "LARGE"];
const lockerStatusOptions: Array<LockerStatus | ""> = ["", "ACTIVE", "EXPIRED", "CLOSED"];

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
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN");
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN");
}

function formatClientName(locker: LockerRecord) {
  return `${locker.customer.firstName ?? ""} ${locker.customer.lastName ?? ""}`.trim() || locker.customer.customerCode;
}

function StatusChip({ status }: { status: LockerStatus }) {
  const toneByStatus = {
    ACTIVE: { bg: alpha("#10b981", 0.12), color: "#047857" },
    EXPIRED: { bg: alpha("#f59e0b", 0.14), color: "#b45309" },
    CLOSED: { bg: alpha("#64748b", 0.14), color: "#334155" }
  }[status];

  return (
    <Chip
      size="small"
      label={status}
      sx={{
        fontWeight: 800,
        bgcolor: toneByStatus.bg,
        color: toneByStatus.color,
        borderRadius: 1.5
      }}
    />
  );
}

function MetricCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.3,
        borderRadius: 3,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        height: "100%"
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 900, letterSpacing: "-0.03em" }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.4, color: "text.secondary" }}>
        {caption}
      </Typography>
    </Paper>
  );
}

function SectionHero({
  actions
}: {
  actions?: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.2, md: 3 },
        borderRadius: 4,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 46%, rgba(14,116,144,0.94) 100%)",
        color: "#fff"
      }}
    >
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between" alignItems={{ lg: "center" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)"
            }}
          >
            <LockRoundedIcon />
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", letterSpacing: "0.08em" }}>
              Locker
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}>
              Locker Registry
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", maxWidth: 820 }}>
              Manage locker allocation, visits, annual charges, active status, and customer-linked access from one place.
            </Typography>
          </Box>
        </Stack>
        {actions ? <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>{actions}</Stack> : null}
      </Stack>
    </Paper>
  );
}

export function LockerWorkspace({ token, clients, branches }: LockerWorkspaceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<LockerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LockerStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailLocker, setDetailLocker] = useState<LockerRecord | null>(null);
  const [visitRows, setVisitRows] = useState<LockerVisitRecord[]>([]);
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitRemark, setVisitRemark] = useState("");
  const [closeReason, setCloseReason] = useState("");
  const [form, setForm] = useState<LockerFormState>({
    customerId: "",
    lockerNumber: "",
    size: "MEDIUM",
    annualCharge: 0
  });

  const activeClients = useMemo(
    () =>
      clients.filter((entry) => entry.customerProfile?.id && entry.isActive !== false).map((entry) => ({
        ...entry,
        customerId: entry.customerProfile?.id ?? "",
        customerCode: entry.customerProfile?.customerCode ?? ""
      })),
    [clients]
  );

  const branchMap = useMemo(() => new Map(branches.map((branch) => [branch.id, branch])), [branches]);

  const metrics = useMemo(() => {
    const activeCount = rows.filter((entry) => entry.status === "ACTIVE").length;
    const closedCount = rows.filter((entry) => entry.status === "CLOSED").length;
    const expiredCount = rows.filter((entry) => entry.status === "EXPIRED").length;
    const annualChargeTotal = rows.reduce((sum, entry) => sum + Number(entry.annualCharge || 0), 0);

    return [
      {
        label: "Visible Lockers",
        value: String(total),
        caption: "Rows currently matching the locker filters."
      },
      {
        label: "Active Lockers",
        value: String(activeCount),
        caption: "Allocated lockers available for visit logging."
      },
      {
        label: "Closed Lockers",
        value: String(closedCount + expiredCount),
        caption: "Lockers already closed or expired."
      },
      {
        label: "Annual Charges",
        value: formatCurrency(annualChargeTotal),
        caption: "Annual charge total across the visible rows."
      }
    ];
  }, [rows, total]);

  const selectedClient = useMemo(
    () => activeClients.find((entry) => entry.customerId === form.customerId) ?? null,
    [activeClients, form.customerId]
  );

  const detailBranch = detailLocker
    ? activeClients.find((entry) => entry.customerId === detailLocker.customerId)?.branchId ?? null
    : null;

  async function loadLockerPage() {
    setLoading(true);
    setError(null);

    try {
      const response = await listLockers(token, {
        q: search,
        status,
        page: page + 1,
        limit: rowsPerPage
      });

      setRows(response.rows);
      setTotal(response.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load locker records.");
    } finally {
      setLoading(false);
    }
  }

  async function loadLockerVisits(locker: LockerRecord) {
    setVisitLoading(true);

    try {
      const nextVisits = await listLockerVisits(token, locker.id);
      setVisitRows(nextVisits);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load locker visits.");
    } finally {
      setVisitLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLockerPage();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [page, rowsPerPage, search, status, token]);

  async function openLockerDetail(locker: LockerRecord) {
    setDetailLocker(locker);
    setVisitRemark("");
    setCloseReason("");
    await loadLockerVisits(locker);
  }

  async function handleCreateLocker() {
    if (!form.customerId || !form.lockerNumber.trim() || form.annualCharge < 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createLocker(token, {
        customerId: form.customerId,
        lockerNumber: form.lockerNumber.trim().toUpperCase(),
        size: form.size,
        annualCharge: Number(form.annualCharge)
      });

      setCreateOpen(false);
      setForm({
        customerId: "",
        lockerNumber: "",
        size: "MEDIUM",
        annualCharge: 0
      });
      setPage(0);
      await loadLockerPage();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create locker.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVisitLocker() {
    if (!detailLocker) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await visitLocker(token, detailLocker.id, visitRemark.trim() || undefined);
      setVisitRemark("");
      await Promise.all([loadLockerPage(), loadLockerVisits(detailLocker)]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to record locker visit.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseLocker() {
    if (!detailLocker) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await closeLocker(token, detailLocker.id, closeReason.trim() || undefined);
      setDetailLocker(updated);
      setCloseReason("");
      await loadLockerPage();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to close locker.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search locker, client, or customer code..."
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
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
                setStatus(event.target.value as LockerStatus | "");
              }}
              sx={{
                minWidth: { xs: "100%", sm: 180 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
            >
              {lockerStatusOptions.map((option) => (
                <MenuItem key={option || "all"} value={option}>
                  {option || "All Statuses"}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setCreateOpen(true)}
              disabled={!activeClients.length}
              sx={{
                bgcolor: "#fff",
                color: "#0f172a",
                borderRadius: 2.5,
                fontWeight: 900,
                "&:hover": { bgcolor: "#e2e8f0" }
              }}
            >
              Allocate Locker
            </Button>
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

      {!activeClients.length ? (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          No active client profiles are available for locker allocation yet.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Use visit remarks to record what was accessed, deposited, or removed from the locker during each visit.
        </Alert>
      )}

      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {[
                  { label: "Locker No", width: "12%", align: "left" },
                  { label: "Customer", width: "16%", align: "left" },
                  { label: "Customer Code", width: "14%", align: "left" },
                  { label: "Branch", width: "12%", align: "left" },
                  { label: "Size", width: "8%", align: "left" },
                  { label: "Opened", width: "10%", align: "left" },
                  { label: "Annual Charge", width: "11%", align: "right" },
                  { label: "Visits", width: "6%", align: "right" },
                  { label: "Status", width: "6%", align: "center" },
                  { label: "", width: "5%", align: "right" }
                ].map((col, idx) => (
                  <TableCell key={idx} align={col.align as any} sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: col.width, py: 2.5, borderBottom: `1px solid rgba(15, 23, 42, 0.08)` }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No locker rows matched the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((locker) => {
                  const client = activeClients.find((entry) => entry.customerId === locker.customerId);
                  const branch = client?.branchId ? branchMap.get(client.branchId) : null;

                  return (
                    <TableRow 
                      key={locker.id} 
                      hover
                      sx={{ 
                        transition: "background-color 0.2s ease",
                        "&:hover": { bgcolor: "rgba(16, 185, 129, 0.02)" }
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "rgba(15, 23, 42, 0.04)",
                              color: "text.secondary",
                            }}
                          >
                            <LockRoundedIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{locker.lockerNumber}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{formatClientName(locker)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>{locker.customer.customerCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>{branch?.name ?? "-"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{locker.size}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>{formatDate(locker.openingDate)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900, color: "text.primary" }}>{formatCurrency(locker.annualCharge)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>{locker._count?.visits ?? 0}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <StatusChip status={locker.status} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => void openLockerDetail(locker)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "rgba(16, 185, 129, 0.08)" } }}>
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
        PaperProps={{ sx: { width: { xs: "100%", md: 520 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setCreateOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Allocate Locker
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Client"
              value={form.customerId}
              onChange={(event) => setForm((prev) => ({ ...prev, customerId: event.target.value }))}
            >
              {activeClients.map((client) => {
                const branch = client.branchId ? branchMap.get(client.branchId) : null;
                return (
                  <MenuItem key={client.customerId} value={client.customerId}>
                    {client.fullName} ({client.customerCode}){branch ? ` - ${branch.name}` : ""}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              fullWidth
              label="Locker Number"
              value={form.lockerNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, lockerNumber: event.target.value.toUpperCase() }))}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Size"
                  value={form.size}
                  onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value as LockerSize }))}
                >
                  {lockerSizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Annual Charge"
                  value={form.annualCharge}
                  onChange={(event) => setForm((prev) => ({ ...prev, annualCharge: Number(event.target.value) }))}
                />
              </Grid>
            </Grid>

            {selectedClient ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                  Allocation Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Client: {selectedClient.fullName} ({selectedClient.customerCode})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Branch: {selectedClient.branchId ? branchMap.get(selectedClient.branchId)?.name ?? "-" : "-"}
                </Typography>
              </Paper>
            ) : null}

            <Button
              variant="contained"
              onClick={() => void handleCreateLocker()}
              disabled={!form.customerId || !form.lockerNumber.trim() || submitting}
              sx={{ py: 1.7, borderRadius: 2.5, fontWeight: 900 }}
            >
              Allocate Locker
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={Boolean(detailLocker)}
        onClose={() => setDetailLocker(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 760 }, borderRadius: "24px 0 0 24px" } }}
      >
        {detailLocker ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
              <IconButton onClick={() => setDetailLocker(null)} sx={{ position: "absolute", right: 16, top: 16, color: "#fff" }}>
                <CloseRoundedIcon />
              </IconButton>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MeetingRoomRoundedIcon />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {detailLocker.lockerNumber}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.75)" }}>
                    {formatClientName(detailLocker)} ({detailLocker.customer.customerCode})
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }} useFlexGap>
                <Chip label={detailLocker.size} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip label={detailLocker.status} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip
                  label={detailBranch ? branchMap.get(detailBranch)?.name ?? "-" : "No Branch"}
                  sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}
                />
              </Stack>
            </Box>

            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Annual Charge" value={formatCurrency(detailLocker.annualCharge)} caption="Configured yearly locker fee." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Opened On" value={formatDate(detailLocker.openingDate)} caption="Locker allocation date." />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Closed On" value={formatDate(detailLocker.closingDate)} caption="Closing date when applicable." />
                </Grid>
              </Grid>

              <Stack spacing={2.5} sx={{ mt: 3 }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                    Visit Log
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Capture what was deposited, collected, or inspected in the locker during each visit.
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                      fullWidth
                      label="Visit Remark"
                      value={visitRemark}
                      onChange={(event) => setVisitRemark(event.target.value)}
                      placeholder="Example: gold packet verified, document envelope collected"
                    />
                    <Button
                      variant="contained"
                      onClick={() => void handleVisitLocker()}
                      disabled={detailLocker.status !== "ACTIVE" || submitting}
                      sx={{ minWidth: { md: 170 }, borderRadius: 2.5, fontWeight: 900 }}
                    >
                      Record Visit
                    </Button>
                  </Stack>
                </Paper>

                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Visited At</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!visitLoading && visitRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No visit history has been recorded yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        visitRows.map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell sx={{ fontWeight: 800 }}>{formatDateTime(visit.visitedAt)}</TableCell>
                            <TableCell>{visit.remarks || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {detailLocker.status !== "CLOSED" ? (
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
                      Close Locker
                    </Typography>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                      <TextField
                        fullWidth
                        label="Closing Reason"
                        value={closeReason}
                        onChange={(event) => setCloseReason(event.target.value)}
                        placeholder="Optional closure reason"
                      />
                      <Button
                        color="inherit"
                        variant="outlined"
                        onClick={() => void handleCloseLocker()}
                        disabled={submitting}
                        sx={{ minWidth: { md: 150 }, borderRadius: 2.5, fontWeight: 900 }}
                      >
                        Close Locker
                      </Button>
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>
            </Box>
          </Box>
        ) : null}
      </Drawer>
    </Stack>
  );
}
