"use client";

import { useEffect, useMemo, useState } from "react";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Chip,
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
import { getMonitoringOverview } from "@/shared/api/monitoring";
import type { MonitoringOverview } from "@/shared/types";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";

type MonitoringWorkspaceProps = {
  token: string;
};

function formatCurrency(value: number | string | null | undefined) {
  const numericValue = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function MonitoringWorkspace({ token }: MonitoringWorkspaceProps) {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await getMonitoringOverview(token);
        setOverview(response);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load monitoring overview.");
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, [token]);

  const societies = useMemo(() => {
    const rows = overview?.societies ?? [];
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      [row.code, row.name, row.billingEmail ?? "", row.category ?? ""].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [overview?.societies, search]);

  const metrics = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      { label: "Scope", value: overview.scope === "platform" ? "Platform" : "Assigned Society", caption: "Monitoring context resolved from the current login." },
      { label: "Customers", value: String(overview.totals.customers), caption: "Customer count within this monitoring scope." },
      { label: "Accounts", value: String(overview.totals.accounts), caption: "Account count visible to this monitoring view." },
      { label: "Portfolio", value: formatCurrency(overview.totals.totalBalance), caption: "Total balance across the monitoring scope." }
    ];
  }, [overview]);

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<InsightsRoundedIcon />}
        eyebrow="Monitoring"
        title="Monitoring Desk"
        description="See live society performance, user distribution, balances, and operational totals from the real monitoring API."
        colorScheme="blue"
        actions={
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setPage(0);
              setSearch(event.target.value);
            }}
            placeholder="Search society or category..."
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
        }
      />

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {error ? <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "20%" }}>Society</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Users</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Customers</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Accounts</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Transactions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, width: "20%" }}>Portfolio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && societies.length === 0 ? (
                <TableEmpty colSpan={7} label="No monitoring rows matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading monitoring overview...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                societies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "ACTIVE" ? "success" : row.status === "PENDING" ? "warning" : "default"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.activeUsers}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.customers}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.accounts}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.transactions}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {formatCurrency(row.totalBalance)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={societies.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Stack>
  );
}
