"use client";

import { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import {
  Alert, Box, Button, Chip, CircularProgress, Drawer, IconButton, MenuItem,
  Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  listInterestSlabs, createInterestSlab, deleteInterestSlab,
  type InterestSlabRecord, type CreateInterestSlabPayload
} from "@/shared/api/interest-slabs";
import { toast } from "@/shared/ui/toast";

type Props = { token: string };

const CATEGORIES = ["SAVINGS", "CURRENT", "FIXED_DEPOSIT", "RECURRING_DEPOSIT", "LOAN"];

export function InterestSlabsWorkspace({ token }: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<InterestSlabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "", minAmount: "", maxAmount: "", minDays: "", maxDays: "", ratePercent: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listInterestSlabs(token, { category: categoryFilter || undefined });
      setRows(res.rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load interest slabs";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [categoryFilter, token]);

  async function handleCreate() {
    if (!form.category || !form.minAmount || !form.ratePercent) {
      toast.error("Category, minimum amount, and rate are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateInterestSlabPayload = {
        category: form.category,
        minAmount: parseFloat(form.minAmount),
        maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : 0,
        minDays: form.minDays ? parseInt(form.minDays) : 0,
        maxDays: form.maxDays ? parseInt(form.maxDays) : 0,
        ratePercent: parseFloat(form.ratePercent)
      };
      await createInterestSlab(token, payload);
      toast.success("Interest slab created");
      setDrawerOpen(false);
      setForm({ category: "", minAmount: "", maxAmount: "", minDays: "", maxDays: "", ratePercent: "" });
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create interest slab");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteInterestSlab(token, id);
      toast.success("Interest slab deactivated");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to deactivate slab");
    }
  }

  const fmt = (v: number | string) => Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1 }}>Interest Rate Slabs</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
        Configure interest rates by account category, amount range, and tenure
      </Typography>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mx: 2, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Select size="small" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} displayEmpty sx={{ minWidth: 180 }}>
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c.replace(/_/g, " ")}</MenuItem>)}
          </Select>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDrawerOpen(true)}>Add Slab</Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Typography sx={{ p: 4, textAlign: "center" }} color="text.secondary">No interest slabs configured</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Min Amount</TableCell>
                  <TableCell align="right">Max Amount</TableCell>
                  <TableCell align="right">Min Days</TableCell>
                  <TableCell align="right">Max Days</TableCell>
                  <TableCell align="right">Rate %</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell><Chip label={row.category.replace(/_/g, " ")} size="small" variant="outlined" /></TableCell>
                    <TableCell align="right">{fmt(row.minAmount)}</TableCell>
                    <TableCell align="right">{row.maxAmount ? fmt(row.maxAmount) : "No limit"}</TableCell>
                    <TableCell align="right">{row.minDays}</TableCell>
                    <TableCell align="right">{row.maxDays || "No limit"}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>{Number(row.ratePercent).toFixed(2)}%</TableCell>
                    <TableCell><Chip label={row.isActive ? "Active" : "Inactive"} color={row.isActive ? "success" : "default"} size="small" /></TableCell>
                    <TableCell align="center">
                      {row.isActive && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)} title="Deactivate">
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
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
            <Typography variant="h6">Add Interest Slab</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}><CloseRoundedIcon /></IconButton>
          </Box>
          <Stack spacing={2}>
            <TextField label="Category" select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth required>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c.replace(/_/g, " ")}</MenuItem>)}
            </TextField>
            <TextField label="Min Amount" type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
            <TextField label="Max Amount" type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} fullWidth helperText="Leave empty for no upper limit" inputProps={{ step: "0.01" }} />
            <TextField label="Min Days (tenure)" type="number" value={form.minDays} onChange={(e) => setForm({ ...form, minDays: e.target.value })} fullWidth />
            <TextField label="Max Days (tenure)" type="number" value={form.maxDays} onChange={(e) => setForm({ ...form, maxDays: e.target.value })} fullWidth helperText="Leave empty for no upper limit" />
            <TextField label="Interest Rate (%)" type="number" value={form.ratePercent} onChange={(e) => setForm({ ...form, ratePercent: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />
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
