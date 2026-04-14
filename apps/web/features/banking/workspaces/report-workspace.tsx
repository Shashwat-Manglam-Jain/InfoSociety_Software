"use client";

import { useEffect, useMemo, useState } from "react";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
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
import { alpha, useTheme } from "@mui/material/styles";
import { getReportCatalog, listReportJobs, runReport, type ReportCatalog, type ReportJobRecord, type ReportStatus } from "@/shared/api/reports";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type ReportWorkspaceProps = {
  token: string;
};

const statusOptions: Array<ReportStatus | ""> = ["", "QUEUED", "RUNNING", "DONE", "FAILED"];

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("en-IN");
}

export function ReportWorkspace({ token }: ReportWorkspaceProps) {
  const theme = useTheme();
  const [catalog, setCatalog] = useState<ReportCatalog>({});
  const [rows, setRows] = useState<ReportJobRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [reportName, setReportName] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [search, setSearch] = useState("");
  const [parametersInput, setParametersInput] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  async function loadWorkspace() {
    setLoading(true);
    setError(null);

    try {
      const [catalogResponse, jobsResponse] = await Promise.all([
        getReportCatalog(token),
        listReportJobs(token, {
          category: search.trim() ? undefined : category || undefined,
          status: statusFilter,
          page: page + 1,
          limit: rowsPerPage
        })
      ]);

      setCatalog(catalogResponse);
      setRows(
        search.trim()
          ? jobsResponse.rows.filter((row) =>
              [row.reportName, row.category, row.requestedBy?.fullName ?? "", row.requestedBy?.username ?? ""]
                .some((value) => value.toLowerCase().includes(search.trim().toLowerCase()))
            )
          : jobsResponse.rows
      );
      setTotal(search.trim() ? jobsResponse.rows.length : jobsResponse.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load reports workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWorkspace();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [category, page, rowsPerPage, search, statusFilter, token]);

  const categories = useMemo(() => Object.keys(catalog), [catalog]);
  const reportOptions = useMemo(() => (category ? [...(catalog[category] ?? [])] : []), [catalog, category]);

  useEffect(() => {
    if (!category) {
      setReportName("");
      return;
    }

    if (!reportOptions.includes(reportName)) {
      setReportName(reportOptions[0] ?? "");
    }
  }, [category, reportName, reportOptions]);

  const metrics = useMemo(() => {
    const doneCount = rows.filter((row) => row.status === "DONE").length;
    const runningCount = rows.filter((row) => row.status === "RUNNING").length;

    return [
      { label: "Catalog Categories", value: String(categories.length), caption: "Report catalog groupings available for this user." },
      { label: "Visible Jobs", value: String(total), caption: "Report jobs visible in the current filter state." },
      { label: "Done", value: String(doneCount), caption: "Jobs already completed successfully." },
      { label: "Running", value: String(runningCount), caption: "Jobs that are still being processed." }
    ];
  }, [categories.length, rows, total]);

  async function handleRunReport() {
    if (!category || !reportName) {
      return;
    }

    let parameters: Record<string, unknown> | undefined;

    if (parametersInput.trim()) {
      try {
        parameters = JSON.parse(parametersInput) as Record<string, unknown>;
      } catch {
        setError("Parameters must be valid JSON when provided.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      await runReport(token, { category, reportName, parameters });
      setParametersInput("");
      await loadWorkspace();
      toast.success("Report queued and completed.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to run the report.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<AnalyticsRoundedIcon />}
        eyebrow="Reports"
        title="Reports Desk"
        description="Run live report jobs from the real catalog and review completed executions without dropping back to static module descriptions."
        colorScheme="violet"
        actions={
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setPage(0);
              setSearch(event.target.value);
            }}
            placeholder="Search jobs or users..."
            sx={{
              minWidth: { xs: "100%", sm: 260 },
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

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}` }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
          Run Report
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label="Report Name" value={reportName} onChange={(event) => setReportName(event.target.value)} disabled={!category}>
              {reportOptions.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField select fullWidth label="Job Status Filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ReportStatus | "")}>
              {statusOptions.map((entry) => (
                <MenuItem key={entry || "all"} value={entry}>
                  {entry || "All Statuses"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Parameters JSON"
          value={parametersInput}
          onChange={(event) => setParametersInput(event.target.value)}
          placeholder='{"fromDate":"2026-04-01","toDate":"2026-04-30"}'
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          onClick={() => void handleRunReport()}
          disabled={submitting || !category || !reportName}
          sx={{ mt: 2, borderRadius: 2.5, fontWeight: 900 }}
        >
          Run Report
        </Button>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 1.5, border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1080, tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "26%" }}>Report</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "14%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Requested By</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Requested</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "12%" }}>Completed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={6} label="No report jobs matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading report jobs...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.reportName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={row.status === "DONE" ? "success" : row.status === "FAILED" ? "error" : "default"} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.requestedBy?.fullName || row.requestedBy?.username || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(row.requestedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(row.completedAt)}
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
    </Stack>
  );
}
