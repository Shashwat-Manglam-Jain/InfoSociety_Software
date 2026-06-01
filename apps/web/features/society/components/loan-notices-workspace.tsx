"use client";

import { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Drawer, IconButton, MenuItem,
  Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  listLoanNotices, createLoanNotice, deliverLoanNotice,
  type LoanNoticeRecord, type CreateLoanNoticePayload
} from "@/shared/api/loan-notices";
import { toast } from "@/shared/ui/toast";

type Props = { token: string };

const NOTICE_TYPES = ["DEMAND_NOTICE", "REMINDER", "LEGAL_NOTICE", "NPA_NOTICE", "RECOVERY_NOTICE"] as const;
const NOTICE_COLORS: Record<string, "info" | "warning" | "error"> = {
  REMINDER: "info", DEMAND_NOTICE: "warning", LEGAL_NOTICE: "error", NPA_NOTICE: "error", RECOVERY_NOTICE: "error"
};

export function LoanNoticesWorkspace({ token }: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<LoanNoticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ loanId: "", customerId: "", noticeType: "DEMAND_NOTICE" as string, dueDate: "", content: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listLoanNotices(token, { noticeType: typeFilter || undefined, page: page + 1, limit: rowsPerPage });
      setRows(res.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load loan notices";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [typeFilter, page, rowsPerPage, token]);

  async function handleCreate() {
    if (!form.loanId || !form.customerId || !form.noticeType) {
      toast.error("Loan ID, Customer ID, and notice type are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateLoanNoticePayload = {
        loanId: form.loanId,
        customerId: form.customerId,
        noticeType: form.noticeType as LoanNoticeRecord["noticeType"],
        issuedDate: new Date().toISOString().slice(0, 10),
        dueDate: form.dueDate,
        remarks: form.content || undefined
      };
      await createLoanNotice(token, payload);
      toast.success("Loan notice issued");
      setDrawerOpen(false);
      setForm({ loanId: "", customerId: "", noticeType: "DEMAND_NOTICE", dueDate: "", content: "" });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create loan notice");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeliver(id: string) {
    try {
      await deliverLoanNotice(token, id);
      toast.success("Notice marked as delivered");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark as delivered");
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1 }}>Loan Notices</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        Issue and track demand, reminder, legal, NPA, and recovery notices for loan accounts
      </Typography>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Select size="small" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }} displayEmpty sx={{ minWidth: 180 }}>
            <MenuItem value="">All Types</MenuItem>
            {NOTICE_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, " ")}</MenuItem>)}
          </Select>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDrawerOpen(true)}>Issue Notice</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: "center" }} color="text.secondary">No loan notices found</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Customer</TableCell>
                    <TableCell>Notice Type</TableCell>
                    <TableCell>Issued</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Delivered</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.customerName ?? row.customerCode ?? row.customerId.slice(0, 8)}</TableCell>
                      <TableCell><Chip label={row.noticeType.replace(/_/g, " ")} color={NOTICE_COLORS[row.noticeType] ?? "default"} size="small" /></TableCell>
                      <TableCell>{new Date(row.issuedDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{row.dueDate ? new Date(row.dueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                      <TableCell>
                        {row.deliveredAt ? (
                          <Chip label={new Date(row.deliveredAt).toLocaleDateString("en-IN")} color="success" size="small" icon={<CheckCircleRoundedIcon />} />
                        ) : (
                          <Chip label="Pending" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {!row.deliveredAt && (
                          <Button size="small" color="success" startIcon={<CheckCircleRoundedIcon />} onClick={() => handleDeliver(row.id)}>
                            Mark Delivered
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={-1} rowsPerPage={rowsPerPage} page={page}
              onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} />
          </>
        )}
      </Paper>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Issue Loan Notice</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Stack spacing={2}>
            <TextField label="Loan Account ID" value={form.loanId} onChange={(e) => setForm({ ...form, loanId: e.target.value })} fullWidth required />
            <TextField label="Customer ID" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} fullWidth required />
            <TextField label="Notice Type" select value={form.noticeType} onChange={(e) => setForm({ ...form, noticeType: e.target.value })} fullWidth required>
              {NOTICE_TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, " ")}</MenuItem>)}
            </TextField>
            <TextField label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Notice Content" multiline rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} fullWidth />
            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="contained" fullWidth onClick={handleCreate} disabled={submitting}>{submitting ? "Issuing..." : "Issue Notice"}</Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
