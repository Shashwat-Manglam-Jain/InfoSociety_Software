"use client";

import { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Drawer, IconButton, MenuItem,
  Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  listShares, createShare, surrenderShare, forfeitShare,
  type ShareRecord, type CreateSharePayload
} from "@/shared/api/share-capital";
import { toast } from "@/shared/ui/toast";

type Props = { token: string };

const STATUS_COLORS: Record<string, "success" | "warning" | "error"> = {
  ACTIVE: "success", SURRENDERED: "warning", FORFEITED: "error"
};

export function ShareCapitalWorkspace({ token }: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<ShareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customerId: "", certificateNo: "", sharesHeld: "", faceValue: "", paidUpValue: "", purchaseDate: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listShares(token, { status: statusFilter || undefined, page: page + 1, limit: rowsPerPage });
      setRows(res.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load shares";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [statusFilter, page, rowsPerPage, token]);

  async function handleCreate() {
    if (!form.customerId || !form.sharesHeld || !form.faceValue || !form.paidUpValue) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateSharePayload = {
        customerId: form.customerId,
        certificateNo: form.certificateNo,
        sharesHeld: parseInt(form.sharesHeld),
        faceValue: parseFloat(form.faceValue),
        paidUpValue: parseFloat(form.paidUpValue),
        purchaseDate: form.purchaseDate || new Date().toISOString().slice(0, 10)
      };
      await createShare(token, payload);
      toast.success("Share entry created");
      setDrawerOpen(false);
      setForm({ customerId: "", certificateNo: "", sharesHeld: "", faceValue: "", paidUpValue: "", purchaseDate: "" });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create share entry");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(id: string, action: "surrender" | "forfeit") {
    try {
      if (action === "surrender") await surrenderShare(token, id);
      else await forfeitShare(token, id);
      toast.success(`Share ${action}ed successfully`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to ${action} share`);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1 }}>Share Capital Register</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        Track member share capital - purchases, surrenders, and forfeitures
      </Typography>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Select size="small" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SURRENDERED">Surrendered</MenuItem>
            <MenuItem value="FORFEITED">Forfeited</MenuItem>
          </Select>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDrawerOpen(true)}>New Share Entry</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: "center" }} color="text.secondary">No share entries found</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Certificate #</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Face Value</TableCell>
                    <TableCell align="right">Paid-Up</TableCell>
                    <TableCell>Purchase Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.certificateNo || "-"}</TableCell>
                      <TableCell>{row.customer ? `${row.customer.firstName ?? ""} ${row.customer.lastName ?? ""}`.trim() : row.customerId.slice(0, 8)}</TableCell>
                      <TableCell align="right">{row.sharesHeld}</TableCell>
                      <TableCell align="right">{Number(row.faceValue).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</TableCell>
                      <TableCell align="right">{Number(row.paidUpValue).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</TableCell>
                      <TableCell>{new Date(row.purchaseDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell><Chip label={row.status} color={STATUS_COLORS[row.status] ?? "default"} size="small" /></TableCell>
                      <TableCell align="center">
                        {row.status === "ACTIVE" && (
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <Button size="small" color="warning" onClick={() => handleAction(row.id, "surrender")}>Surrender</Button>
                            <Button size="small" color="error" onClick={() => handleAction(row.id, "forfeit")}>Forfeit</Button>
                          </Box>
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
            <Typography variant="h6">New Share Entry</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Stack spacing={2}>
            <TextField label="Customer ID" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} fullWidth required />
            <TextField label="Certificate Number" value={form.certificateNo} onChange={(e) => setForm({ ...form, certificateNo: e.target.value })} fullWidth />
            <TextField label="Shares Held" type="number" value={form.sharesHeld} onChange={(e) => setForm({ ...form, sharesHeld: e.target.value })} fullWidth required />
            <TextField label="Face Value" type="number" value={form.faceValue} onChange={(e) => setForm({ ...form, faceValue: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
            <TextField label="Paid-Up Value" type="number" value={form.paidUpValue} onChange={(e) => setForm({ ...form, paidUpValue: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
            <TextField label="Purchase Date" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="contained" fullWidth onClick={handleCreate} disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
