"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
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
  getReportCatalog,
  runReport,
  listReportJobs,
  getReportJob,
  type ReportCatalog,
  type ReportJobRecord,
  type ReportStatus
} from "@/shared/api/reports";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type ReportsWorkspaceProps = {
  token: string;
};

export function ReportsWorkspace({ token }: ReportsWorkspaceProps) {
  const theme = useTheme();
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
      const msg = caught instanceof Error ? caught.message : "Unable to load report catalog.";
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
      const msg = caught instanceof Error ? caught.message : "Unable to load report jobs.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCatalog();
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [page, rowsPerPage, token]);

  const metrics = useMemo(() => {
    const total = rows.length;
    const done = rows.filter((r) => r.status === "DONE").length;
    const running = rows.filter((r) => r.status === "RUNNING").length;
    const failed = rows.filter((r) => r.status === "FAILED").length;

    return [
      { label: "Report Jobs", value: String(total), caption: "Total report generation jobs." },
      { label: "Completed", value: String(done), caption: "Successfully generated reports." },
      { label: "Running", value: String(running), caption: "Reports in progress." },
      { label: "Failed", value: String(failed), caption: "Failed generation jobs." }
    ];
  }, [rows]);

  async function handleRunReport() {
    if (!selectedCategory || !selectedReport) {
      toast.error("Please select a report");
      return;
    }

    setSubmitting(true);
    try {
      await runReport(token, {
        category: selectedCategory,
        reportName: selectedReport
      });
      toast.success("Report generation started");
      setRunOpen(false);
      setSelectedReport("");
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to run report";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const reportOptions = useMemo(() => {
    return selectedCategory ? catalog[selectedCategory] || [] : [];
  }, [selectedCategory, catalog]);

  return (
    <Box>
      <SectionHero title="Reports & Enquiries" description="Generate and manage society reports and data exports." />
      
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
          <Box sx={{ flex: 1, minWidth: 250 }} />
          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => void loadRows()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setRunOpen(true)}
          >
            Run Report
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <TableEmpty message="No report jobs found. Click 'Run Report' to generate one." />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Category</TableCell>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested At</TableCell>
                    <TableCell>Completed At</TableCell>
                    <TableCell>Requested By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.reportName}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
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
                      <TableCell>
                        {new Date(row.requestedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </TableCell>
                      <TableCell>
                        {row.completedAt
                          ? new Date(row.completedAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "-"}
                      </TableCell>
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
            />
          </>
        )}
      </Paper>

      {/* Run Report Drawer */}
      <Drawer anchor="right" open={runOpen} onClose={() => setRunOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Run Report</Typography>
            <IconButton size="small" onClick={() => setRunOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField
              select
              label="Category"
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
              label="Report"
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

            <Alert severity="info">
              The report will be generated asynchronously. You'll receive a notification when it's complete.
            </Alert>

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setRunOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleRunReport}
                disabled={submitting || !selectedReport}
              >
                {submitting ? "Starting..." : "Run Report"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
