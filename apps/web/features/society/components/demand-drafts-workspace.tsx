"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
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
  listDemandDrafts,
  createDemandDraft,
  updateDemandDraft,
  updateDemandDraftStatus,
  type DemandDraftRecord
} from "@/shared/api/demand-drafts";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getDemandDraftsWorkspaceCopy } from "@/shared/i18n/demand-drafts-workspace-copy";
import { toast } from "@/shared/ui/toast";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";

type DemandDraftsWorkspaceProps = {
  token: string;
};

type InstrumentStatus = "ENTERED" | "CLEARED" | "RETURNED" | "CANCELLED";

type DemandDraftForm = {
  accountId: string;
  customerId: string;
  beneficiary: string;
  amount: string;
};

function createEmptyDemandDraftForm(): DemandDraftForm {
  return {
    accountId: "",
    customerId: "",
    beneficiary: "",
    amount: ""
  };
}

function resolveIntlLocale(locale: "en" | "hi" | "mr") {
  return locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";
}

function formatCurrency(value: number | string, locale: "en" | "hi" | "mr"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "\u20b90";
  return `\u20b9${num.toLocaleString(resolveIntlLocale(locale), { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string, locale: "en" | "hi" | "mr"): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString(resolveIntlLocale(locale));
}

const STATUSES: InstrumentStatus[] = ["ENTERED", "CLEARED", "RETURNED", "CANCELLED"];

export function DemandDraftsWorkspace({ token }: DemandDraftsWorkspaceProps) {
  const theme = useTheme();
  const { locale } = useLanguage();
  const copy = getDemandDraftsWorkspaceCopy(locale);
  const [rows, setRows] = useState<DemandDraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InstrumentStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DemandDraftRecord | null>(null);
  const [form, setForm] = useState<DemandDraftForm>(createEmptyDemandDraftForm());
  const [newStatus, setNewStatus] = useState<InstrumentStatus>("ENTERED");

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listDemandDrafts(token, {
        q: search,
        status,
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.loadFailed;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [search, status, page, rowsPerPage, token, copy.errors.loadFailed]);

  const metrics = useMemo(() => {
    const totalAmount = rows.reduce((sum, dd) => sum + Number(dd.amount || 0), 0);
    const cleared = rows.filter((dd) => dd.status === "CLEARED").length;
    const returned = rows.filter((dd) => dd.status === "RETURNED").length;

    return [
      { label: copy.metrics.totalDrafts.label, value: String(rows.length), caption: copy.metrics.totalDrafts.caption },
      { label: copy.metrics.totalAmount.label, value: formatCurrency(totalAmount, locale), caption: copy.metrics.totalAmount.caption },
      { label: copy.metrics.cleared.label, value: String(cleared), caption: copy.metrics.cleared.caption },
      { label: copy.metrics.returned.label, value: String(returned), caption: copy.metrics.returned.caption }
    ];
  }, [rows, copy, locale]);

  async function handleCreate() {
    if (!form.beneficiary || !form.amount) {
      toast.error(copy.errors.requiredFields);
      return;
    }

    setSubmitting(true);
    try {
      await createDemandDraft(token, {
        accountId: form.accountId || undefined,
        customerId: form.customerId || undefined,
        beneficiary: form.beneficiary,
        amount: parseFloat(form.amount)
      });
      toast.success(copy.success.created);
      setCreateOpen(false);
      setForm(createEmptyDemandDraftForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.createFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!selectedDraft || !form.beneficiary || !form.amount) {
      toast.error(copy.errors.requiredFields);
      return;
    }

    setSubmitting(true);
    try {
      await updateDemandDraft(token, selectedDraft.id, {
        beneficiary: form.beneficiary,
        amount: parseFloat(form.amount)
      });
      toast.success(copy.success.updated);
      setEditOpen(false);
      setSelectedDraft(null);
      setForm(createEmptyDemandDraftForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.updateFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange() {
    if (!selectedDraft) {
      toast.error(copy.errors.selectDraft);
      return;
    }

    setSubmitting(true);
    try {
      await updateDemandDraftStatus(token, selectedDraft.id, newStatus);
      toast.success(copy.success.statusChanged.replace("{{status}}", copy.statuses[newStatus]));
      setStatusOpen(false);
      setSelectedDraft(null);
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : copy.errors.statusUpdateFailed;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <SectionHero icon={<SearchRoundedIcon />} eyebrow={copy.hero.eyebrow} title={copy.hero.title} description={copy.hero.description} />

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
          <TextField
            placeholder={copy.actions.searchPlaceholder}
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          <TextField
            select
            label={copy.actions.status}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as InstrumentStatus | "");
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">{copy.actions.allStatuses}</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {copy.statuses[s]}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}>
            {copy.actions.newDraft}
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
                    <TableCell>{copy.table.draftNumber}</TableCell>
                    <TableCell>{copy.table.beneficiary}</TableCell>
                    <TableCell align="right">{copy.table.amount}</TableCell>
                    <TableCell>{copy.table.issuedDate}</TableCell>
                    <TableCell>{copy.table.status}</TableCell>
                    <TableCell align="center">{copy.table.actions}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.draftNumber}</TableCell>
                      <TableCell>{row.beneficiary}</TableCell>
                      <TableCell align="right">{formatCurrency(row.amount, locale)}</TableCell>
                      <TableCell>{formatDate(row.issuedAt, locale)}</TableCell>
                      <TableCell>
                        <Chip label={copy.statuses[row.status]} color={row.status === "CLEARED" ? "success" : row.status === "RETURNED" ? "error" : "default"} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                          <IconButton
                            size="small"
                            title={copy.actions.edit}
                            onClick={() => {
                              setSelectedDraft(row);
                              setForm({
                                accountId: row.accountId || "",
                                customerId: row.customerId || "",
                                beneficiary: row.beneficiary,
                                amount: String(row.amount)
                              });
                              setEditOpen(true);
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedDraft(row);
                              setNewStatus(row.status === "ENTERED" ? "CLEARED" : "RETURNED");
                              setStatusOpen(true);
                            }}
                          >
                            {copy.actions.changeStatus}
                          </Button>
                        </Box>
                      </TableCell>
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

      <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{copy.drawers.newDemandDraft}</Typography>
            <IconButton size="small" onClick={() => setCreateOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField label={copy.drawers.accountIdOptional} value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} fullWidth />
            <TextField label={copy.drawers.customerIdOptional} value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} fullWidth />
            <TextField label={copy.drawers.beneficiary} value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} fullWidth required />
            <TextField label={copy.drawers.amount} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setCreateOpen(false)}>
                {copy.actions.cancel}
              </Button>
              <Button variant="contained" fullWidth onClick={handleCreate} disabled={submitting}>
                {submitting ? copy.actions.creating : copy.actions.create}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{copy.drawers.editDemandDraft}</Typography>
            <IconButton size="small" onClick={() => setEditOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField label={copy.drawers.beneficiary} value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} fullWidth required />
            <TextField label={copy.drawers.amount} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} fullWidth required inputProps={{ step: "0.01" }} />

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setEditOpen(false)}>
                {copy.actions.cancel}
              </Button>
              <Button variant="contained" fullWidth onClick={handleUpdate} disabled={submitting}>
                {submitting ? copy.actions.updating : copy.actions.update}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={statusOpen} onClose={() => setStatusOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">{copy.drawers.changeStatus}</Typography>
            <IconButton size="small" onClick={() => setStatusOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              {copy.drawers.currentStatus.replace("{{status}}", selectedDraft ? copy.statuses[selectedDraft.status] : "-")}
            </Typography>
            <TextField select label={copy.drawers.newStatus} value={newStatus} onChange={(e) => setNewStatus(e.target.value as InstrumentStatus)} fullWidth>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {copy.statuses[s]}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button variant="outlined" fullWidth onClick={() => setStatusOpen(false)}>
                {copy.actions.cancel}
              </Button>
              <Button variant="contained" fullWidth onClick={handleStatusChange} disabled={submitting}>
                {submitting ? copy.actions.updating : copy.actions.update}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
