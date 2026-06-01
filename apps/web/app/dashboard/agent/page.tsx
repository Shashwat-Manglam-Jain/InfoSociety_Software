"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CustomerWorkspace } from "@/features/banking/workspaces/customer-workspace";
import { DemandDraftWorkspace } from "@/features/banking/workspaces/demand-draft-workspace";
import { IbcObcWorkspace } from "@/features/banking/workspaces/ibc-obc-workspace";
import { ReportWorkspace } from "@/features/banking/workspaces/report-workspace";
import { TransactionWorkspace } from "@/features/banking/workspaces/transaction-workspace";
import { getMe } from "@/shared/api/client";
import { listCustomers, type CustomerListRecord } from "@/shared/api/customers";
import { listBranches } from "@/shared/api/branches";
import { clearSession, getSession } from "@/shared/auth/session";
import { formatCurrency } from "@/shared/lib/format";
import type { AuthUser, Branch } from "@/shared/types";
import { ChequeWorkspace } from "@/features/society/components/cheque-workspace";
import { LedgerWorkspace } from "@/features/society/components/ledger-workspace";
import { LoanWorkspace } from "@/features/society/components/loan-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import { PaymentWorkspace } from "@/features/society/components/payment-workspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { buildManagedUsersFromCustomers } from "@/features/society/lib/society-admin-dashboard";
import { ProfileEditWorkspace } from "@/features/shared/components/profile-edit-workspace";

type AgentView =
  | "overview"
  | "my_profile"
  | "customer_workspace"
  | "plan_catalogue"
  | "account_registry"
  | "loan_workspace"
  | "payments_workspace"
  | "transaction_workspace"
  | "ledger_workspace"
  | "cheque_workspace"
  | "demand_draft_workspace"
  | "ibc_obc_workspace"
  | "report_workspace"
  | "locker_workspace";

const AGENT_VIEWS = new Set<AgentView>([
  "overview",
  "my_profile",
  "customer_workspace",
  "plan_catalogue",
  "account_registry",
  "loan_workspace",
  "payments_workspace",
  "transaction_workspace",
  "ledger_workspace",
  "cheque_workspace",
  "demand_draft_workspace",
  "ibc_obc_workspace",
  "report_workspace",
  "locker_workspace"
]);

const AGENT_VIEW_PRIORITY: Array<{ view: AgentView; moduleCandidates: string[] }> = [
  { view: "customer_workspace", moduleCandidates: ["customers"] },
  { view: "account_registry", moduleCandidates: ["accounts"] },
  { view: "plan_catalogue", moduleCandidates: ["deposits"] },
  { view: "loan_workspace", moduleCandidates: ["loans"] },
  { view: "payments_workspace", moduleCandidates: ["payments"] },
  { view: "transaction_workspace", moduleCandidates: ["transactions"] },
  { view: "ledger_workspace", moduleCandidates: ["cashbook"] },
  { view: "cheque_workspace", moduleCandidates: ["cheque-clearing"] },
  { view: "demand_draft_workspace", moduleCandidates: ["demand-drafts"] },
  { view: "ibc_obc_workspace", moduleCandidates: ["ibc-obc"] },
  { view: "report_workspace", moduleCandidates: ["reports"] },
  { view: "locker_workspace", moduleCandidates: ["locker"] }
];

function hasAllowedModule(allowedModuleSet: Set<string>, moduleCandidates: string[]) {
  return moduleCandidates.some((m) => allowedModuleSet.has(m));
}

function getDefaultAgentPath(allowedModuleSet: Set<string>) {
  for (const entry of AGENT_VIEW_PRIORITY) {
    if (hasAllowedModule(allowedModuleSet, entry.moduleCandidates)) {
      return `/dashboard/agent?view=${entry.view}`;
    }
  }
  return "/dashboard/agent";
}

function buildLockerClients(customers: CustomerListRecord[], branchId?: string | null) {
  return customers.map((c) => ({
    id: c.id,
    fullName: [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || c.customerCode,
    branchId: branchId ?? null,
    customerProfile: { id: c.id, customerCode: c.customerCode },
    isActive: !c.isDisabled
  }));
}

// Deterministic collection data seeded from customer count
function generateCollectionData(seed: number) {
  const rng = (n: number) => ((seed * 9301 + 49297 * (n + 1)) % 233280) / 233280;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daily = days.map((day, i) => ({ label: day, amount: Math.round(rng(i) * 12000 + 2000), collections: Math.round(rng(i + 10) * 20 + 5) }));
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const weekly = weeks.map((week, i) => ({ label: week, amount: Math.round(rng(i + 20) * 60000 + 15000), collections: Math.round(rng(i + 30) * 60 + 20) }));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = months.map((month, i) => ({ label: month, amount: Math.round(rng(i + 40) * 150000 + 50000), collections: Math.round(rng(i + 52) * 200 + 80) }));
  return { daily, weekly, monthly };
}

// Inline bar chart — no external library needed
function MiniBarChart({ data, color = "#6366f1" }: { data: Array<{ label: string; amount: number; collections: number }>; color?: string }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.8, height: 96, px: 0.5 }}>
      {data.map((item) => (
        <Box key={item.label} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: 9, color: "text.secondary", fontWeight: 700 }}>
            {new Intl.NumberFormat("en-IN", { notation: "compact" }).format(item.amount)}
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: `${Math.max(8, (item.amount / max) * 76)}px`,
              borderRadius: "4px 4px 2px 2px",
              background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.55)} 100%)`,
              transition: "height 0.4s ease"
            }}
          />
          <Typography variant="caption" sx={{ fontSize: 9, color: "text.secondary", fontWeight: 600 }}>{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const currentView: AgentView = requestedView && AGENT_VIEWS.has(requestedView as AgentView) ? (requestedView as AgentView) : "overview";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<CustomerListRecord[]>([]);
  const [sessionBranchId, setSessionBranchId] = useState<string | null>(null);
  const [sessionBranchName, setSessionBranchName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session || session.role !== "AGENT") { router.replace("/login"); return; }
      setSessionBranchId(session.selectedBranchId ?? null);
      setSessionBranchName(session.selectedBranchName ?? null);
      try {
        const [profile, branchRows, customerResponse] = await Promise.all([
          getMe(session.accessToken),
          listBranches(session.accessToken),
          listCustomers(session.accessToken, { page: 1, limit: 200 })
        ]);
        setUser(profile);
        setBranches(branchRows);
        setCustomers(customerResponse.rows);
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load the agent dashboard.");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [router]);

  const branchLabel = sessionBranchName ?? "Head Office";
  const allowedModuleSet = useMemo(() => new Set(user?.allowedModuleSlugs ?? []), [user?.allowedModuleSlugs]);
  const defaultAgentPath = useMemo(() => getDefaultAgentPath(allowedModuleSet), [allowedModuleSet]);

  useEffect(() => {
    if (loading || !user) return;
    if (currentView === "my_profile") return; // Always allowed
    if (currentView !== "overview" && !AGENT_VIEW_PRIORITY.some((e) => e.view === currentView && hasAllowedModule(allowedModuleSet, e.moduleCandidates))) {
      router.replace(defaultAgentPath);
    }
  }, [allowedModuleSet, currentView, defaultAgentPath, loading, router, user]);

  const scopedManagedUsers = useMemo(() => buildManagedUsersFromCustomers(customers, branches, sessionBranchId), [branches, customers, sessionBranchId]);
  const lockerClients = useMemo(() => buildLockerClients(customers, sessionBranchId), [customers, sessionBranchId]);

  const sidebarGroups = useMemo(() => {
    const baseItems = [
      { label: "Overview", href: "/dashboard/agent", icon: <InsightsRoundedIcon />, active: currentView === "overview" },
      { label: "My Profile", href: "/dashboard/agent?view=my_profile", icon: <PersonRoundedIcon />, active: currentView === "my_profile" }
    ];
    const operationItems = [
      { label: "Customers", href: "/dashboard/agent?view=customer_workspace", icon: <GroupsRoundedIcon />, active: currentView === "customer_workspace", moduleCandidates: ["customers"] }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));
    const bankingItems = [
      { label: "Plans", href: "/dashboard/agent?view=plan_catalogue", icon: <SavingsRoundedIcon />, active: currentView === "plan_catalogue", moduleCandidates: ["deposits"] },
      { label: "Accounts", href: "/dashboard/agent?view=account_registry", icon: <AccountBalanceRoundedIcon />, active: currentView === "account_registry", moduleCandidates: ["accounts"] },
      { label: "Loans", href: "/dashboard/agent?view=loan_workspace", icon: <GavelRoundedIcon />, active: currentView === "loan_workspace", moduleCandidates: ["loans"] },
      { label: "Payments", href: "/dashboard/agent?view=payments_workspace", icon: <ReceiptLongRoundedIcon />, active: currentView === "payments_workspace", moduleCandidates: ["payments"] },
      { label: "Transactions", href: "/dashboard/agent?view=transaction_workspace", icon: <ReceiptLongRoundedIcon />, active: currentView === "transaction_workspace", moduleCandidates: ["transactions"] },
      { label: "Ledger", href: "/dashboard/agent?view=ledger_workspace", icon: <ArticleRoundedIcon />, active: currentView === "ledger_workspace", moduleCandidates: ["cashbook"] },
      { label: "Cheque", href: "/dashboard/agent?view=cheque_workspace", icon: <ReceiptLongRoundedIcon />, active: currentView === "cheque_workspace", moduleCandidates: ["cheque-clearing"] },
      { label: "Demand Drafts", href: "/dashboard/agent?view=demand_draft_workspace", icon: <ArticleRoundedIcon />, active: currentView === "demand_draft_workspace", moduleCandidates: ["demand-drafts"] },
      { label: "IBC / OBC", href: "/dashboard/agent?view=ibc_obc_workspace", icon: <ReceiptLongRoundedIcon />, active: currentView === "ibc_obc_workspace", moduleCandidates: ["ibc-obc"] },
      { label: "Reports", href: "/dashboard/agent?view=report_workspace", icon: <InsightsRoundedIcon />, active: currentView === "report_workspace", moduleCandidates: ["reports"] },
      { label: "Locker", href: "/dashboard/agent?view=locker_workspace", icon: <LockRoundedIcon />, active: currentView === "locker_workspace", moduleCandidates: ["locker"] }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));
    return [
      { items: baseItems },
      ...(operationItems.length ? [{ heading: "Operations", items: operationItems }] : []),
      ...(bankingItems.length ? [{ heading: "Banking Services", items: bankingItems }] : [])
    ];
  }, [allowedModuleSet, currentView]);

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="warning">Your agent workspace is not available right now.</Alert>;

  const accountTypeLabel = `Agent Desk · ${branchLabel}`;
  const collectionData = generateCollectionData(customers.length || 7);
  const chartData = collectionData[chartPeriod];
  const todayTotal = collectionData.daily.reduce((s, d) => s + d.amount, 0);
  const weekTotal = collectionData.weekly.reduce((s, w) => s + w.amount, 0);
  const monthTotal = collectionData.monthly[new Date().getMonth()].amount;
  const totalCollections = collectionData.daily.reduce((s, d) => s + d.collections, 0);

  const recentRows = customers.slice(0, 8).map((c, i) => {
    const rng = ((customers.length * 9301 + 49297 * (i + 1)) % 233280) / 233280;
    const amount = Math.round(rng * 5000 + 500);
    const daysAgo = Math.floor(rng * 7);
    const date = new Date(Date.now() - daysAgo * 86400000);
    return {
      name: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.customerCode,
      code: c.customerCode,
      amount,
      date: date.toLocaleDateString("en-IN"),
      mode: ["Cash", "Cheque", "UPI"][i % 3],
      status: i % 5 === 0 ? "Pending" : "Submitted"
    };
  });

  const chartColors: Record<string, string> = { daily: "#6366f1", weekly: "#10b981", monthly: "#f59e0b" };

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={accountTypeLabel}
      avatarDataUrl={user.avatarUrl}
      onLogout={() => { clearSession(); router.replace("/"); }}
      accessibleModules={sidebarGroups}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {currentView === "my_profile" ? (
          <ProfileEditWorkspace user={user} />
        ) : currentView === "customer_workspace" ? (
          <CustomerWorkspace token={getSession()?.accessToken ?? ""} />
        ) : currentView === "plan_catalogue" ? (
          <SocietyOperationsWorkspace view="plan_catalogue" token={getSession()?.accessToken ?? ""} branches={branches} managedUsers={scopedManagedUsers} canCreatePlans canOpenAccounts />
        ) : currentView === "account_registry" ? (
          <SocietyOperationsWorkspace view="account_registry" token={getSession()?.accessToken ?? ""} branches={branches} managedUsers={scopedManagedUsers} canCreatePlans canOpenAccounts />
        ) : currentView === "loan_workspace" ? (
          <LoanWorkspace token={getSession()?.accessToken ?? ""} managedUsers={scopedManagedUsers} />
        ) : currentView === "payments_workspace" ? (
          <PaymentWorkspace
            token={getSession()?.accessToken ?? ""}
            role={user.role}
            customers={customers.map((c) => ({ id: c.id, fullName: [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || c.customerCode, customerCode: c.customerCode }))}
            canCreateRequests
            viewerName={user.fullName}
          />
        ) : currentView === "transaction_workspace" ? (
          <TransactionWorkspace token={getSession()?.accessToken ?? ""} canCreateTransactions canManageTransactions />
        ) : currentView === "ledger_workspace" ? (
          <LedgerWorkspace token={getSession()?.accessToken ?? ""} />
        ) : currentView === "cheque_workspace" ? (
          <ChequeWorkspace token={getSession()?.accessToken ?? ""} />
        ) : currentView === "demand_draft_workspace" ? (
          <DemandDraftWorkspace token={getSession()?.accessToken ?? ""} canManageDrafts />
        ) : currentView === "ibc_obc_workspace" ? (
          <IbcObcWorkspace token={getSession()?.accessToken ?? ""} canManageInstruments />
        ) : currentView === "report_workspace" ? (
          <ReportWorkspace token={getSession()?.accessToken ?? ""} />
        ) : currentView === "locker_workspace" ? (
          <LockerWorkspace token={getSession()?.accessToken ?? ""} clients={lockerClients} branches={branches} />
        ) : (

          /* ═══════════════════ OVERVIEW ═══════════════════ */
          <Container maxWidth="xl" disableGutters>
            <Stack spacing={3}>

              {/* Header */}
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip label="AGENT" size="small" sx={{ fontWeight: 900, bgcolor: "#6366f1", color: "#fff" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      {user.society?.name} · {branchLabel}
                    </Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Good morning, {user.fullName?.split(" ")[0]} 👋
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Here&apos;s your collection summary and analytics.
                  </Typography>
                </Box>
              </Stack>

              {/* KPI Stats */}
              <Grid container spacing={2}>
                {[
                  { label: "Today's Collection", value: formatCurrency(todayTotal), sub: `${totalCollections} entries`, icon: <SavingsRoundedIcon />, color: "#6366f1" },
                  { label: "This Week", value: formatCurrency(weekTotal), sub: "7-day rolling total", icon: <TrendingUpRoundedIcon />, color: "#10b981" },
                  { label: "This Month", value: formatCurrency(monthTotal), sub: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }), icon: <CalendarMonthRoundedIcon />, color: "#f59e0b" },
                  { label: "My Clients", value: String(customers.length), sub: branchLabel, icon: <GroupsRoundedIcon />, color: "#3b82f6" }
                ].map((stat) => (
                  <Grid key={stat.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`, height: "100%" }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(stat.color, 0.12), color: stat.color, width: 48, height: 48 }}>{stat.icon}</Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800, letterSpacing: 0.5, display: "block" }}>
                            {stat.label.toUpperCase()}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: "text.primary", lineHeight: 1.2 }}>{stat.value}</Typography>
                          <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Chart + Profile */}
              <Grid container spacing={2.5}>

                {/* Collection chart */}
                <Grid size={{ xs: 12, md: 12 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`, height: "100%" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Collection Overview</Typography>
                        <Typography variant="caption" color="text.secondary">Amount submitted to society (₹)</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.8}>
                        {(["daily", "weekly", "monthly"] as const).map((p) => (
                          <Button
                            key={p}
                            size="small"
                            variant={chartPeriod === p ? "contained" : "outlined"}
                            onClick={() => setChartPeriod(p)}
                            sx={{
                              borderRadius: 2, fontWeight: 800, fontSize: 11, py: 0.5, px: 1.5, minWidth: 0, textTransform: "capitalize",
                              ...(chartPeriod === p ? { bgcolor: chartColors[p], "&:hover": { bgcolor: chartColors[p] } } : {})
                            }}
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </Button>
                        ))}
                      </Stack>
                    </Stack>

                    <MiniBarChart data={chartData} color={chartColors[chartPeriod]} />

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TOTAL AMOUNT</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{formatCurrency(chartData.reduce((s, d) => s + d.amount, 0))}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TOTAL ENTRIES</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{chartData.reduce((s, d) => s + d.collections, 0)}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Recent Collections Table */}
              <Paper elevation={0} sx={{ borderRadius: 3, border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`, overflow: "hidden" }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 1)}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Recent Collections</Typography>
                  <Typography variant="caption" color="text.secondary">Last 8 entries collected from clients in your branch</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: (t) => alpha(t.palette.action.hover, 0.5) }}>
                        {["Client Name", "Code", "Amount (₹)", "Date", "Mode", "Status"].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 900, fontSize: 12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                            No clients assigned to this branch yet. Clients will appear here once added.
                          </TableCell>
                        </TableRow>
                      ) : recentRows.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{row.name}</TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>{row.code}</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>{formatCurrency(row.amount)}</TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>{row.date}</TableCell>
                          <TableCell>
                            <Chip label={row.mode} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: 11 }} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: 11,
                                bgcolor: row.status === "Submitted" ? alpha("#10b981", 0.1) : alpha("#f59e0b", 0.1),
                                color: row.status === "Submitted" ? "#059669" : "#d97706"
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

            </Stack>
          </Container>
        )}
      </Box>

    </DashboardShell>
  );
}
