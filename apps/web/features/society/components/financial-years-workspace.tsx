"use client";

import { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Drawer, IconButton,
  Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { listFinancialYears, createFinancialYear, closeFinancialYear, type FinancialYearRecord } from "@/shared/api/financial-years";
import { toast } from "@/shared/ui/toast";

type Props = { token: string };

export function FinancialYearsWorkspace({ token }: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<FinancialYearRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ label: "", startDate: "", endDate: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listFinancialYears(token);
      setRows(res.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load financial years";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token]);

  async function handleCreate() {
    if (!form.label || !form.startDate || !form.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await createFinancialYear(token, { label: form.label, startDate: form.startDate, endDate: form.endDate });
      toast.success("Financial year created");
      setDrawerOpen(false);
      setForm({ label: "", startDate: "", endDate: "" });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create financial year");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose(id: string) {
    try {
      await closeFinancialYear(token, id);
      toast.success("Financial year closed");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to close financial year");
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1 }}>Financial Years</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        Manage society accounting years - open new years and close completed ones
      </Typography>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDrawerOpen(true)}>New Financial Year</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: "center" }} color="text.secondary">No financial years found</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                  <TableCell>Label</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Closed At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
                    <TableCell>{new Date(row.startDate).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>{new Date(row.endDate).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Chip label={row.isClosed ? "Closed" : "Open"} color={row.isClosed ? "default" : "success"} size="small" />
                    </TableCell>
                    <TableCell>{row.closedAt ? new Date(row.closedAt).toLocaleDateString("en-IN") : "-"}</TableCell>
                    <TableCell align="center">
                      {!row.isClosed && (
                        <Button size="small" color="warning" startIcon={<LockRoundedIcon />} onClick={() => handleClose(row.id)}>Close Year</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">New Financial Year</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Stack spacing={2}>
            <TextField label="Label (e.g. 2025-26)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} fullWidth required />
            <TextField label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
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
