"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
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
  listInvestments,
  createInvestment,
  renewInvestment,
  withdrawInvestment,
  type InvestmentRecord
} from "@/shared/api/investments";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { toast } from "@/shared/ui/toast";

type InvestmentsWorkspaceProps = {
  token: string;
};

type InvestmentForm = {
  bankName: string;
  investmentType: string;
  amount: string;
  interestRate: string;
  startDate: string;
  maturityDate: string;
  maturityAmount: string;
};

function createEmptyInvestmentForm(): InvestmentForm {
  return {
    bankName: "",
    investmentType: "",
    amount: "",
    interestRate: "",
    startDate: "",
    maturityDate: "",
    maturityAmount: ""
  };
}

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN");
}

export function InvestmentsWorkspace({ token }: InvestmentsWorkspaceProps) {
  const theme = useTheme();
  const [rows, setRows] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRecord | null>(null);
  const [actionType, setActionType] = useState<"renew" | "withdraw" | null>(null);
  const [form, setForm] = useState<InvestmentForm>(createEmptyInvestmentForm());
  const [renewForm, setRenewForm] = useState({
    startDate: "",
    maturityDate: "",
    amount: "",
    interestRate: ""
  });
  const [withdrawForm, setWithdrawForm] = useState({
    withdrawnDate: "",
    maturityAmount: ""
  });

  async function loadRows() {
    setLoading(true);
    setError(null);

    try {
      const response = await listInvestments(token, {
        q: search,
        activeOnly: "true",
        page: page + 1,
        limit: rowsPerPage
      });
      setRows(response.rows);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Unable to load investments.";
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
  }, [search, page, rowsPerPage, token]);

  const metrics = useMemo(() => {
    const totalAmount = rows.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalMaturity = rows.reduce((sum, inv) => sum + Number(inv.maturityAmount || 0), 0);
    const activeInvestments = rows.filter((inv) => !inv.withdrawnDate).length;

    return [
      { label: "Total Investments", value: String(rows.length), caption: "Active investment records." },
      { label: "Invested Amount", value: formatCurrency(totalAmount), caption: "Total invested capital." },
      { label: "Maturity Value", value: formatCurrency(totalMaturity), caption: "Expected maturity returns." },
      { label: "Active", value: String(activeInvestments), caption: "Non-withdrawn investments." }
    ];
  }, [rows]);

  async function handleCreate() {
    if (!form.bankName || !form.investmentType || !form.amount || !form.startDate || !form.maturityDate) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createInvestment(token, {
        bankName: form.bankName,
        investmentType: form.investmentType,
        amount: parseFloat(form.amount),
        interestRate: parseFloat(form.interestRate || "0"),
        startDate: form.startDate,
        maturityDate: form.maturityDate,
        maturityAmount: form.maturityAmount ? parseFloat(form.maturityAmount) : undefined
      });
      toast.success("Investment created successfully");
      setCreateOpen(false);
      setForm(createEmptyInvestmentForm());
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to create investment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRenew() {
    if (!selectedInvestment || !renewForm.maturityDate) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      await renewInvestment(token, selectedInvestment.id, {
        startDate: renewForm.startDate || undefined,
        maturityDate: renewForm.maturityDate,
        amount: renewForm.amount ? parseFloat(renewForm.amount) : undefined,
        interestRate: renewForm.interestRate ? parseFloat(renewForm.interestRate) : undefined
      });
      toast.success("Investment renewed successfully");
      setActionOpen(false);
      setActionType(null);
      setSelectedInvestment(null);
      setRenewForm({ startDate: "", maturityDate: "", amount: "", interestRate: "" });
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to renew investment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdraw() {
    if (!selectedInvestment) {
      toast.error("Please select an investment");
      return;
    }

    setSubmitting(true);
    try {
      await withdrawInvestment(token, selectedInvestment.id, {
        withdrawnDate: withdrawForm.withdrawnDate || undefined,
        maturityAmount: withdrawForm.maturityAmount ? parseFloat(withdrawForm.maturityAmount) : undefined
      });
      toast.success("Investment withdrawn successfully");
      setActionOpen(false);
      setActionType(null);
      setSelectedInvestment(null);
      setWithdrawForm({ withdrawnDate: "", maturityAmount: "" });
      void loadRows();
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : "Failed to withdraw investment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <SectionHero title="Investments" description="Manage bank investments, renewals, and withdrawals." />
      
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
          <TextField
            placeholder="Search by bank name..."
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
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateOpen(true)}
          >
            New Investment
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <TableEmpty message="No investments found" />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
                    <TableCell>Bank</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Interest Rate</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Maturity Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.bankName}</TableCell>
                      <TableCell>{row.investmentType}</TableCell>
                      <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                      <TableCell align="right">{Number(row.interestRate || 0).toFixed(2)}%</TableCell>
                      <TableCell>{formatDate(row.startDate)}</TableCell>
                      <TableCell>{formatDate(row.maturityDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.withdrawnDate ? "Withdrawn" : "Active"}
                          color={row.withdrawnDate ? "default" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {!row.withdrawnDate && (
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <IconButton
                              size="small"
                              title="Renew"
                              onClick={() => {
                                setSelectedInvestment(row);
                                setActionType("renew");
                                setRenewForm({
                                  startDate: new Date().toISOString().slice(0, 10),
                                  maturityDate: "",
                                  amount: String(row.amount),
                                  interestRate: String(row.interestRate || 0)
                                });
                                setActionOpen(true);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Withdraw"
                              onClick={() => {
                                setSelectedInvestment(row);
                                setActionType("withdraw");
                                setWithdrawForm({
                                  withdrawnDate: new Date().toISOString().slice(0, 10),
                                  maturityAmount: String(row.maturityAmount || row.amount)
                                });
                                setActionOpen(true);
                              }}
                            >
                              <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={rowsPerPage * (page + 1) + (rows.length < rowsPerPage ? 0 : rows.length)}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
          </>
        )}
      </Paper>

      {/* Create Investment Drawer */}
      <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">New Investment</Typography>
            <IconButton size="small" onClick={() => setCreateOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Bank Name"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Investment Type"
              value={form.investmentType}
              onChange={(e) => setForm({ ...form, investmentType: e.target.value })}
              fullWidth
              required
              placeholder="e.g., FD, Bonds, etc."
            />
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
              required
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Interest Rate (%)"
              type="number"
              value={form.interestRate}
              onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
              fullWidth
              inputProps={{ step: "0.01" }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Maturity Date"
              type="date"
              value={form.maturityDate}
              onChange={(e) => setForm({ ...form, maturityDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Maturity Amount"
              type="number"
              value={form.maturityAmount}
              onChange={(e) => setForm({ ...form, maturityAmount: e.target.value })}
              fullWidth
              inputProps={{ step: "0.01" }}
            />

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>

      {/* Action Drawer (Renew/Withdraw) */}
      <Drawer anchor="right" open={actionOpen} onClose={() => setActionOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              {actionType === "renew" ? "Renew Investment" : "Withdraw Investment"}
            </Typography>
            <IconButton size="small" onClick={() => setActionOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            {actionType === "renew" && (
              <>
                <TextField
                  label="New Start Date"
                  type="date"
                  value={renewForm.startDate}
                  onChange={(e) => setRenewForm({ ...renewForm, startDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="New Maturity Date"
                  type="date"
                  value={renewForm.maturityDate}
                  onChange={(e) => setRenewForm({ ...renewForm, maturityDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Amount (optional)"
                  type="number"
                  value={renewForm.amount}
                  onChange={(e) => setRenewForm({ ...renewForm, amount: e.target.value })}
                  fullWidth
                  inputProps={{ step: "0.01" }}
                />
                <TextField
                  label="Interest Rate (optional)"
                  type="number"
                  value={renewForm.interestRate}
                  onChange={(e) => setRenewForm({ ...renewForm, interestRate: e.target.value })}
                  fullWidth
                  inputProps={{ step: "0.01" }}
                />
              </>
            )}

            {actionType === "withdraw" && (
              <>
                <TextField
                  label="Withdrawn Date"
                  type="date"
                  value={withdrawForm.withdrawnDate}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, withdrawnDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Maturity Amount Received"
                  type="number"
                  value={withdrawForm.maturityAmount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, maturityAmount: e.target.value })}
                  fullWidth
                  inputProps={{ step: "0.01" }}
                />
              </>
            )}

            <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setActionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={actionType === "renew" ? handleRenew : handleWithdraw}
                disabled={submitting}
              >
                {submitting ? "Processing..." : actionType === "renew" ? "Renew" : "Withdraw"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
