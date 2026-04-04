"use client";

import { useEffect, useMemo, useState } from "react";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { listCashbookEntries, recomputeGeneralLedger, type CashbookEntryRecord } from "@/shared/api/cashbook";

type LedgerWorkspaceProps = {
  token: string;
};

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

function StatusChip({ isPosted }: { isPosted: boolean }) {
  return (
    <Chip
      size="small"
      label={isPosted ? "Posted" : "Pending"}
      sx={{
        fontWeight: 800,
        borderRadius: 1.5,
        bgcolor: isPosted ? alpha("#10b981", 0.12) : alpha("#f59e0b", 0.12),
        color: isPosted ? "#047857" : "#b45309"
      }}
    />
  );
}

export function LedgerWorkspace({ token }: LedgerWorkspaceProps) {
  const [rows, setRows] = useState<CashbookEntryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [postedFilter, setPostedFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ledgerSummary, setLedgerSummary] = useState<Record<string, { headName: string; debit: number; credit: number }>>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  async function loadLedgerEntries() {
    setLoading(true);
    setError(null);

    try {
      const response = await listCashbookEntries(token, {
        q: debouncedSearch,
        date: dateFilter || undefined,
        isPosted: postedFilter,
        page: page + 1,
        limit: rowsPerPage
      });

      setRows(response.rows);
      setTotal(response.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load ledger records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLedgerEntries();
  }, [token, debouncedSearch, dateFilter, postedFilter, page, rowsPerPage]);

  async function handleRefreshLedgerSummary() {
    setRefreshing(true);
    setError(null);

    try {
      const response = await recomputeGeneralLedger(token, dateFilter || undefined);
      setLedgerSummary(response.heads);
      await loadLedgerEntries();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to refresh ledger summary.");
    } finally {
      setRefreshing(false);
    }
  }

  const metrics = useMemo(() => {
    const totalDebits = rows.filter((entry) => entry.type === "DEBIT").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const totalCredits = rows.filter((entry) => entry.type === "CREDIT").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const postedCount = rows.filter((entry) => entry.isPosted).length;

    return [
      {
        label: "Visible Entries",
        value: String(total),
        caption: "Ledger rows matching the current filters."
      },
      {
        label: "Posted Entries",
        value: String(postedCount),
        caption: "Entries already posted to the daily ledger."
      },
      {
        label: "Debit Total",
        value: formatCurrency(totalDebits),
        caption: "Debit total in the current result set."
      },
      {
        label: "Credit Total",
        value: formatCurrency(totalCredits),
        caption: "Credit total in the current result set."
      }
    ];
  }, [rows, total]);

  const headSummaryRows = Object.entries(ledgerSummary);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.2, md: 3 },
          borderRadius: 4,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 46%, rgba(16,185,129,0.92) 100%)",
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
              <AccountBalanceRoundedIcon />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", letterSpacing: "0.08em" }}>
                Ledger
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}>
                Ledger Register
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.75)", maxWidth: 820 }}>
                View cashbook and ledger records in one searchable register. Use the refresh action to rebuild the head-wise summary for the selected date.
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search head code, head name, remark..."
              sx={{
                minWidth: { xs: "100%", sm: 280 },
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
            <Button
              variant="contained"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => void handleRefreshLedgerSummary()}
              disabled={refreshing}
              sx={{
                bgcolor: "#fff",
                color: "#0f172a",
                borderRadius: 2.5,
                fontWeight: 900,
                "&:hover": { bgcolor: "#e2e8f0" }
              }}
            >
              Refresh Ledger
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          type="date"
          fullWidth
          label="Entry Date"
          value={dateFilter}
          onChange={(event) => {
            setPage(0);
            setDateFilter(event.target.value);
          }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          fullWidth
          label="Posting Status"
          value={postedFilter}
          onChange={(event) => {
            setPage(0);
            setPostedFilter(event.target.value as "" | "true" | "false");
          }}
        >
          <MenuItem value="">All Entries</MenuItem>
          <MenuItem value="true">Posted</MenuItem>
          <MenuItem value="false">Pending</MenuItem>
        </TextField>
      </Stack>

      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {[
                  { label: "Head Code", width: "12%", align: "left" },
                  { label: "Head Name", width: "20%", align: "left" },
                  { label: "Type", width: "10%", align: "left" },
                  { label: "Mode", width: "10%", align: "left" },
                  { label: "Amount", width: "12%", align: "right" },
                  { label: "Entry Date", width: "12%", align: "left" },
                  { label: "Status", width: "9%", align: "center" },
                  { label: "Remark", width: "15%", align: "left" }
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
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No ledger records matched the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((entry) => (
                  <TableRow 
                    key={entry.id} 
                    hover
                    sx={{ 
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: "rgba(16, 185, 129, 0.02)" }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{entry.headCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>{entry.headName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{entry.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>{entry.mode}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900, color: "text.primary" }}>{formatCurrency(entry.amount)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>{formatDate(entry.entryDate)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip isPosted={entry.isPosted} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>{entry.remark || "-"}</Typography>
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

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <Box sx={{ p: 2.4, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Head Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Debit and credit totals grouped by ledger head.
          </Typography>
        </Box>
        <TableContainer>
          <Table sx={{ tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {[
                  { label: "Head Code", width: "25%", align: "left" },
                  { label: "Head Name", width: "35%", align: "left" },
                  { label: "Debit", width: "20%", align: "right" },
                  { label: "Credit", width: "20%", align: "right" }
                ].map((col, idx) => (
                  <TableCell key={idx} align={col.align as any} sx={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", width: col.width, py: 2.5, borderBottom: `1px solid rgba(15, 23, 42, 0.08)` }}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!headSummaryRows.length ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Refresh ledger to build the head summary.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                headSummaryRows.map(([headCode, entry]) => (
                  <TableRow 
                    key={headCode}
                    hover
                    sx={{ 
                      transition: "background-color 0.2s ease",
                      "&:hover": { bgcolor: "rgba(16, 185, 129, 0.02)" }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>{headCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>{entry.headName}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900, color: "text.primary" }}>{formatCurrency(entry.debit)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900, color: "text.primary" }}>{formatCurrency(entry.credit)}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
