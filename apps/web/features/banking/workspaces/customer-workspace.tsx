"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Switch,
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
import { createCustomer, listCustomers, updateCustomer, type CustomerListRecord } from "@/shared/api/customers";
import { SectionHero } from "@/features/society/components/operations/SectionHero";
import { MetricCard } from "@/features/society/components/operations/MetricCard";
import { TableEmpty } from "@/features/society/components/operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type CustomerWorkspaceProps = {
  token: string;
  canCreate?: boolean;
  canEdit?: boolean;
  title?: string;
  description?: string;
  scopeCustomerIds?: string[] | null;
};

type CustomerFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  kycVerified: boolean;
};

function createEmptyForm(): CustomerFormState {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    kycVerified: false
  };
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
}

function formatName(customer: CustomerListRecord) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() || customer.customerCode;
}

export function CustomerWorkspace({
  token,
  canCreate = true,
  canEdit = true,
  title = "Customer Desk",
  description = "Work with live customer records, onboarding data, contact details, and KYC state from one banking workspace.",
  scopeCustomerIds = null
}: CustomerWorkspaceProps) {
  const theme = useTheme();
  const [rows, setRows] = useState<CustomerListRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<CustomerListRecord | null>(null);
  const [form, setForm] = useState<CustomerFormState>(createEmptyForm());

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listCustomers(token, {
        q: search,
        page: scopeCustomerIds?.length ? 1 : page + 1,
        limit: scopeCustomerIds?.length ? 250 : rowsPerPage
      });
      const scopedRows = scopeCustomerIds?.length
        ? response.rows.filter((row) => scopeCustomerIds.includes(row.id))
        : response.rows;

      setRows(scopeCustomerIds?.length ? scopedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : scopedRows);
      setTotal(scopeCustomerIds?.length ? scopedRows.length : response.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load customer records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRows();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [page, rowsPerPage, scopeCustomerIds, search, token]);

  const metrics = useMemo(() => {
    const verifiedCount = rows.filter((row) => row.kycVerified).length;
    const withAccounts = rows.filter((row) => Number(row._count?.accounts ?? 0) > 0).length;
    const disabledCount = rows.filter((row) => row.isDisabled).length;

    return [
      { label: "Visible Customers", value: String(total), caption: "Customer rows matching the current filters." },
      { label: "KYC Verified", value: String(verifiedCount), caption: "Profiles marked verified in the current result set." },
      { label: "With Accounts", value: String(withAccounts), caption: "Customers already linked with at least one account." },
      { label: "Disabled", value: String(disabledCount), caption: "Profiles currently disabled in the visible rows." }
    ];
  }, [rows, total]);

  function openCreateDrawer() {
    setEditingRow(null);
    setForm(createEmptyForm());
    setDrawerOpen(true);
  }

  function openEditDrawer(row: CustomerListRecord) {
    setEditingRow(row);
    setForm({
      firstName: row.firstName ?? "",
      lastName: row.lastName ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      address: row.address ?? "",
      kycVerified: Boolean(row.kycVerified)
    });
    setDrawerOpen(true);
  }

  async function handleSaveCustomer() {
    if (!form.firstName.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingRow) {
        await updateCustomer(token, editingRow.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          kycVerified: form.kycVerified
        });
      } else {
        await createCustomer(token, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          kycVerified: form.kycVerified
        });
      }

      setDrawerOpen(false);
      setEditingRow(null);
      setForm(createEmptyForm());
      setPage(0);
      await loadRows();
      toast.success(editingRow ? "Customer updated." : "Customer created.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to save the customer.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <SectionHero
        icon={<GroupsRoundedIcon />}
        eyebrow="Customers"
        title={title}
        description={description}
        colorScheme="emerald"
        actions={
          <>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
              placeholder="Search customer code, name, phone..."
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.12),
                  color: "#fff"
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
              }}
            />
            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreateDrawer}
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.96),
                  color: theme.palette.primary.dark,
                  borderRadius: 1,
                  fontWeight: 900,
                  "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.88) }
                }}
              >
                New Customer
              </Button>
            ) : null}
          </>
        }
      />

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {!canCreate && !canEdit ? (
        <Alert severity="info" sx={{ borderRadius: 1 }}>
          This customer desk is visible in read-only mode for your login.
        </Alert>
      ) : null}
      {error ? <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert> : null}

      <Paper elevation={0} sx={{ borderRadius: 1, border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 1040, tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: "16%" }}>Customer Code</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "22%" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "18%" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "10%" }}>KYC</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "8%" }}>Accounts</TableCell>
                <TableCell sx={{ fontWeight: 900, width: "8%" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && rows.length === 0 ? (
                <TableEmpty colSpan={7} label="No customer records matched the current filters." />
              ) : loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading customer records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row.customerCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Joined {formatDate(row.createdAt ?? row.openingDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {formatName(row)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.email || "No email"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.phone || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {row.address || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.kycVerified ? "Verified" : "Pending"}
                        color={row.kycVerified ? "success" : "default"}
                        variant={row.kycVerified ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {row._count?.accounts ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canEdit ? (
                        <IconButton size="small" onClick={() => openEditDrawer(row)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 480 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`, position: "relative" }}>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingRow ? "Edit Customer" : "Create Customer"}
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="First Name"
              value={form.firstName}
              onChange={(event) => setForm((previous) => ({ ...previous, firstName: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={form.lastName}
              onChange={(event) => setForm((previous) => ({ ...previous, lastName: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Phone"
              value={form.phone}
              onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              value={form.email}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Address"
              value={form.address}
              onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
            />
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                bgcolor: "background.default"
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    KYC Verified
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mark this customer as verified if KYC documents have been checked.
                  </Typography>
                </Box>
                <Switch
                  checked={form.kycVerified}
                  onChange={(event) => setForm((previous) => ({ ...previous, kycVerified: event.target.checked }))}
                />
              </Stack>
            </Paper>
            <Button
              variant="contained"
              onClick={() => void handleSaveCustomer()}
              disabled={submitting || !form.firstName.trim()}
              sx={{ py: 1.5, borderRadius: 1, fontWeight: 900 }}
            >
              {editingRow ? "Save Customer" : "Create Customer"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
