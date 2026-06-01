"use client";

import { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Drawer, IconButton, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  listStandingInstructions, createStandingInstruction, deactivateStandingInstruction,
  type StandingInstructionRecord, type CreateStandingInstructionPayload
} from "@/shared/api/standing-instructions";
import { toast } from "@/shared/ui/toast";

type Props = { token: string };

const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;

export function StandingInstructionsWorkspace({ token }: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<StandingInstructionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ sourceAccountId: "", targetAccountId: "", amount: "", frequency: "MONTHLY" as string, nextExecutionDate: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listStandingInstructions(token, { page: page + 1, limit: rowsPerPage });
      setRows(res.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load standing instructions";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [page, rowsPerPage, token]);

  async function handleCreate() {
    if (!form.sourceAccountId || !form.targetAccountId || !form.amount || !form.nextExecutionDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateStandingInstructionPayload = {
        sourceAccountId: form.sourceAccountId,
        targetAccountId: form.targetAccountId,
        amount: parseFloat(form.amount),
        frequency: form.frequency as StandingInstructionRecord["frequency"],
        nextExecutionDate: form.nextExecutionDate
      };
      await createStandingInstruction(token, payload);
      toast.success("Standing instruction created");
      setDrawerOpen(false);
      setForm({ sourceAccountId: "", targetAccountId: "", amount: "", frequency: "MONTHLY", nextExecutionDate: "" });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create standing instruction");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivateStandingInstruction(token, id);
      toast.success("Standing instruction deactivated");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to deactivate");
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1 }}>Standing Instructions</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        Manage recurring auto-debit instructions - RD installments, loan EMIs, and pigmy collections
      </Typography>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDrawerOpen(true)}>New Instruction</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: "center" }} color="text.secondary">No standing instructions found</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Source Account</TableCell>
                    <TableCell>Target Account</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Next Execution</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontFamily: "monospace" }}>{row.sourceAccountNumber ?? row.sourceAccountId.slice(0, 8)}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace" }}>{row.targetAccountNumber ?? row.targetAccountId.slice(0, 8)}</TableCell>
                      <TableCell align="right">{Number(row.amount).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</TableCell>
                      <TableCell><Chip label={row.frequency} size="small" variant="outlined" /></TableCell>
                      <TableCell>{new Date(row.nextExecutionDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell><Chip label={row.status} color={row.status === "ACTIVE" ? "success" : "default"} size="small" /></TableCell>
                      <TableCell align="center">
                        {row.status === "ACTIVE" && (
                          <IconButton size="small" color="warning" onClick={() => handleDeactivate(row.id)} title="Deactivate">
                            <PauseRoundedIcon fontSize="small" />
                          </IconButton>
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
            <Typography variant="h6">New Standing Instruction</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Stack spacing={2}>
            <TextField label="Source Account ID" value={form.sourceAccountId} onChange={(e) => setForm({ ...form, sourceAccountId: e.target.value })} fullWidth required helperText="Account to debit from" />
            <TextField label="Target Account ID" value={form.targetAccountId} onChange={(e) => setForm({ ...form, targetAccountId: e.target.value })} fullWidth required helperText="Account to credit to" />
            <TextField label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
            <TextField label="Frequency" select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} fullWidth required>
              {FREQUENCIES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
            </TextField>
            <TextField label="Next Execution Date" type="date" value={form.nextExecutionDate} onChange={(e) => setForm({ ...form, nextExecutionDate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
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
