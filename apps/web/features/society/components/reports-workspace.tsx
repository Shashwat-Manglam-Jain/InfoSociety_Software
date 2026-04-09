"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
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
  getReportCatalog,
  runReport,
  listReportJobs,
  type ReportCatalog,
  type ReportJobRecord
} from "@/shared/api/reports";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getReportsWorkspaceCopy } from "@/shared/i18n/reports-workspace-copy";
import { toast } from "@/shared/ui/toast";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";

type ReportsWorkspaceProps = {
  token: string;
};

function resolveIntlLocale(locale: "en" | "hi" | "mr") {
  return locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
}

function formatDateTime(dateStr: string, locale: "en" | "hi" | "mr") {
  return new Date(dateStr).toLocaleDateString(resolveIntlLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ReportsWorkspace({ token }: ReportsWorkspaceProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getReportsWorkspaceCopy(locale);
  const [rows, setRows] = useState<ReportJobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [runOpen, setRunOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [catalog, setCatalog] = useState<ReportCatalog>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<string>("");

  async function loadCatalog() {
    try {
      const data = await getReportCatalog(token);
      setCatalog(data);
      const firstCategory = Object.keys(data)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        setSelectedReport(data[firstCategory]?.[0] || "");
      }
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.loadCatalogFailed;
      toast.error(msg);
    }
  }

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listReportJobs(token, {
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.loadJobsFailed;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
  }, [token, copy.errors.loadCatalogFailed]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [page, rowsPerPage, token, copy.errors.loadJobsFailed]);

  const metrics = useMemo(() => {
    const total = rows.length;
    const done = rows.filter((r) => r.status === "DONE").length;
    const running = rows.filter((r) => r.status === "RUNNING").length;
    const failed = rows.filter((r) => r.status === "FAILED").length;

    return [
      { label: copy.metrics.reportJobs.label, value: String(total), caption: copy.metrics.reportJobs.caption },
      { label: copy.metrics.completed.label, value: String(done), caption: copy.metrics.completed.caption },
      { label: copy.metrics.running.label, value: String(running), caption: copy.metrics.running.caption },
      { label: copy.metrics.failed.label, value: String(failed), caption: copy.metrics.failed.caption }
    ];
  }, [rows, copy]);

  async function handleRunReport() {
    if (!selectedCategory || !selectedReport) {
      toast.error(copy.errors.selectReport);
      return;
    }

    setSubmitting(true);
    try {
      await runReport(token, {
        category: selectedCategory,
        reportName: selectedReport
      });
      toast.success(copy.success.started);
      setRunOpen(false);
      setSelectedReport("");
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.runFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const reportOptions = useMemo(() => {
    return selectedCategory ? catalog[selectedCategory] || [] : [];
  }, [selectedCategory, catalog]);

  function localizeStatus(status: string) {
    if (status === "DONE") return copy.statuses.done;
    if (status === "RUNNING") return copy.statuses.running;
    if (status === "FAILED") return copy.statuses.failed;
    return status;
  }

  return (
    <Box>
      <SectionHero icon={<RefreshRoundedIcon />} eyebrow={copy.hero.eyebrow} title={copy.hero.title} description={copy.hero.description} />

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
          <Box sx={{ flex: 1, minWidth: 250 }} />
          <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={() => void loadRows()} disabled={loading}>
            {copy.actions.refresh}
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setRunOpen(true)}>
            {copy.actions.runReport}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Table>
            <TableBody>
              <TableEmpty colSpan={6} label={copy.table.emptyState} />
            </TableBody>
          </Table>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>{copy.table.category}</TableCell>
                    <TableCell>{copy.table.reportName}</TableCell>
                    <TableCell>{copy.table.status}</TableCell>
                    <TableCell>{copy.table.requestedAt}</TableCell>
                    <TableCell>{copy.table.completedAt}</TableCell>
                    <TableCell>{copy.table.requestedBy}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.reportName}</TableCell>
                      <TableCell>
                        <Chip
                          label={localizeStatus(row.status)}
                          color={
                            row.status === "DONE"
                              ? "success"
                              : row.status === "RUNNING"
                                ? "info"
                                : row.status === "FAILED"
                                  ? "error"
                                  : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(row.requestedAt, locale)}</TableCell>
                      <TableCell>{row.completedAt ? formatDateTime(row.completedAt, locale) : "-"}</TableCell>
                      <TableCell>{row.requestedBy?.fullName || "-"}</TableCell>
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
              labelRowsPerPage={copy.pagination.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                copy.pagination.displayedRows.replace("{{from}}", String(from)).replace("{{to}}", String(to)).replace("{{count}}", String(count))
              }
              getItemAriaLabel={(buttonType) => buttonType === "next" ? copy.pagination.nextPage : copy.pagination.previousPage}
            />
          </>
        )}
      </Paper>

      <Drawer anchor="right" open={runOpen} onClose={() => setRunOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{copy.drawer.title}</Typography>
            <IconButton size="small" onClick={() => setRunOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField
              select
              label={copy.drawer.category}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                const reports = catalog[e.target.value];
                setSelectedReport(reports?.[0] || "");
              }}
              fullWidth
              required
            >
              {Object.keys(catalog).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={copy.drawer.report}
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              fullWidth
              required
              disabled={!selectedCategory}
            >
              {reportOptions.map((report) => (
                <MenuItem key={report} value={report}>
                  {report}
                </MenuItem>
              ))}
            </TextField>

            <Alert severity="info">{copy.drawer.asyncInfo}</Alert>

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setRunOpen(false)}>
                {copy.actions.cancel}
              </Button>
              <Button variant="contained" fullWidth onClick={handleRunReport} disabled={submitting || !selectedReport}>
                {submitting ? copy.actions.starting : copy.actions.start}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
