"use client";

import { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Collapse, Drawer, IconButton,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  listDividends, declareDividend, approveDividend, processDividendPayouts,
  cancelDividend, listDividendPayouts,
  type DividendDeclarationRecord, type DividendPayoutRecord
} from "@/shared/api/dividends";
import { listFinancialYears, type FinancialYearRecord } from "@/shared/api/financial-years";
import { toast } from "@/shared/ui/toast";

type Props = { token: string };

const STATUS_COLORS: Record<string, "info" | "success" | "warning" | "error" | "default"> = {
  DECLARED: "info", APPROVED: "warning", PAID: "success", CANCELLED: "error"
};

export function DividendsWorkspace({ token }: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<DividendDeclarationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ financialYearId: "", ratePercent: "" });
  const [fys, setFys] = useState<FinancialYearRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<DividendPayoutRecord[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listDividends(token);
      setRows(res.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load dividends";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loadFys() {
    try {
      const res = await listFinancialYears(token);
      setFys(res.rows);
    } catch { /* ignore */ }
  }

  useEffect(() => { void load(); void loadFys(); }, [token]);

  async function handleDeclare() {
    if (!form.financialYearId || !form.ratePercent) {
      toast.error("Please select a financial year and enter rate");
      return;
    }
    setSubmitting(true);
    try {
      await declareDividend(token, { financialYearId: form.financialYearId, ratePercent: parseFloat(form.ratePercent) });
      toast.success("Dividend declared");
      setDrawerOpen(false);
      setForm({ financialYearId: "", ratePercent: "" });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to declare dividend");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(id: string, action: "approve" | "process" | "cancel") {
    try {
      if (action === "approve") await approveDividend(token, id);
      else if (action === "process") await processDividendPayouts(token, id);
      else await cancelDividend(token, id);
      toast.success(`Dividend ${action}d successfully`);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to ${action} dividend`);
    }
  }

  async function togglePayouts(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setPayoutsLoading(true);
    try {
      const data = await listDividendPayouts(token, id);
      setPayouts(data);
    } catch {
      setPayouts([]);
    } finally {
      setPayoutsLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1 }}>Dividend Declarations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        Declare, approve, and process annual dividends on member share capital
      </Typography>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDrawerOpen(true)}>Declare Dividend</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: "center" }} color="text.secondary">No dividend declarations found</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                  <TableCell />
                  <TableCell>Financial Year</TableCell>
                  <TableCell align="right">Rate %</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Declared At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <>
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <IconButton size="small" onClick={() => togglePayouts(row.id)}>
                          <ExpandMoreRoundedIcon sx={{ transform: expandedId === row.id ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.financialYearLabel ?? row.financialYearId.slice(0, 8)}</TableCell>
                      <TableCell align="right">{Number(row.ratePercent).toFixed(2)}%</TableCell>
                      <TableCell align="right">{row.totalAmount ? Number(row.totalAmount).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) : "-"}</TableCell>
                      <TableCell>{row.declaredAt ? new Date(row.declaredAt).toLocaleDateString("en-IN") : "-"}</TableCell>
                      <TableCell><Chip label={row.status} color={STATUS_COLORS[row.status] ?? "default"} size="small" /></TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                          {row.status === "DECLARED" && <Button size="small" color="primary" onClick={() => handleAction(row.id, "approve")}>Approve</Button>}
                          {row.status === "APPROVED" && <Button size="small" color="success" onClick={() => handleAction(row.id, "process")}>Process Payouts</Button>}
                          {(row.status === "DECLARED" || row.status === "APPROVED") && <Button size="small" color="error" onClick={() => handleAction(row.id, "cancel")}>Cancel</Button>}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow key={`${row.id}-payouts`}>
                      <TableCell colSpan={7} sx={{ py: 0, borderBottom: expandedId === row.id ? undefined : "none" }}>
                        <Collapse in={expandedId === row.id} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, pl: 4 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Member Payouts</Typography>
                            {payoutsLoading ? <CircularProgress size={20} /> : payouts.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">No payouts generated yet</Typography>
                            ) : (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Member</TableCell>
                                    <TableCell align="right">Shares</TableCell>
                                    <TableCell align="right">Payout Amount</TableCell>
                                    <TableCell>Paid At</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {payouts.map((p) => (
                                    <TableRow key={p.id}>
                                      <TableCell>{p.customerName ?? p.customerCode ?? p.customerId.slice(0, 8)}</TableCell>
                                      <TableCell align="right">{p.sharesHeld}</TableCell>
                                      <TableCell align="right">{Number(p.payoutAmount).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}</TableCell>
                                      <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "Pending"}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Declare Dividend</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Stack spacing={2}>
            <TextField label="Financial Year" select value={form.financialYearId} onChange={(e) => setForm({ ...form, financialYearId: e.target.value })} fullWidth required>
              {fys.filter((fy) => fy.isClosed).map((fy) => (
                <option key={fy.id} value={fy.id}>{fy.label}</option>
              ))}
            </TextField>
            <TextField label="Dividend Rate (%)" type="number" value={form.ratePercent} onChange={(e) => setForm({ ...form, ratePercent: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button variant="contained" fullWidth onClick={handleDeclare} disabled={submitting}>{submitting ? "Declaring..." : "Declare"}</Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
