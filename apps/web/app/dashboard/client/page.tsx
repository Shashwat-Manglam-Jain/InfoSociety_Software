"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TransactionWorkspace } from "@/features/banking/workspaces/transaction-workspace";
import { getMe } from "@/shared/api/client";
import { listCustomers, getCustomerMe } from "@/shared/api/customers";
import { listBranches } from "@/shared/api/branches";
import { clearSession, getSession } from "@/shared/auth/session";
import { formatCurrency } from "@/shared/lib/format";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser, Branch } from "@/shared/types";
import { LoanWorkspace } from "@/features/society/components/loan-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import { PaymentWorkspace } from "@/features/society/components/payment-workspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { buildManagedUsersFromCustomers } from "@/features/society/lib/society-admin-dashboard";
import { ProfileEditWorkspace } from "@/features/shared/components/profile-edit-workspace";

type ClientProfile = {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string | null;
  accounts: Array<{
    id: string;
    accountNumber: string;
    type: string;
    currentBalance: number;
    interestRate?: number | null;
    openingDate?: string;
  }>;
  dashboardStats: {
    totalInvested: number;
    interestEarned: number;
    totalWithdrawn: number;
    netBalance: number;
  };
  allottedAgent: {
    id: string;
    customerCode: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
  } | null;
};

type ClientView =
  | "overview"
  | "profile"
  | "plan_catalogue"
  | "account_registry"
  | "loan_workspace"
  | "payments_workspace"
  | "transaction_workspace"
  | "locker_workspace";

const CLIENT_VIEWS = new Set<ClientView>([
  "overview",
  "profile",
  "plan_catalogue",
  "account_registry",
  "loan_workspace",
  "payments_workspace",
  "transaction_workspace",
  "locker_workspace"
]);

function hasAllowedModule(allowedModuleSet: Set<string>, moduleCandidates: string[]) {
  return moduleCandidates.some((moduleSlug) => allowedModuleSet.has(moduleSlug));
}

function buildLockerClients(profile: ClientProfile, branchId?: string | null) {
  return [
    {
      id: profile.id,
      fullName: [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.customerCode,
      branchId: branchId ?? null,
      customerProfile: {
        id: profile.id,
        customerCode: profile.customerCode
      },
      isActive: true
    }
  ];
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const requestedView = searchParams.get("view");
  const currentView: ClientView =
    requestedView && CLIENT_VIEWS.has(requestedView as ClientView) ? (requestedView as ClientView) : "overview";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sessionBranchId, setSessionBranchId] = useState<string | null>(null);
  const [sessionBranchName, setSessionBranchName] = useState<string | null>(null);
  const [customerRows, setCustomerRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session || session.role !== "CLIENT") {
        router.replace("/login");
        return;
      }

      setSessionBranchId(session.selectedBranchId ?? null);
      setSessionBranchName(session.selectedBranchName ?? null);

      try {
        const [userMe, customerMe, branchRows, customerResponse] = await Promise.all([
          getMe(session.accessToken),
          getCustomerMe(session.accessToken),
          listBranches(session.accessToken),
          listCustomers(session.accessToken, { page: 1, limit: 50 })
        ]);

        setUser(userMe);
        setProfile(customerMe);
        setBranches(branchRows);
        setCustomerRows(customerResponse.rows);
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load your dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router]);

  const branchLabel = sessionBranchName ?? "Main Head Quarter";
  const accountTypeLabel = `Client Portal · ${branchLabel}`;
  const allowedModuleSet = useMemo(() => new Set(user?.allowedModuleSlugs ?? []), [user?.allowedModuleSlugs]);
  const managedUsers = useMemo(
    () => buildManagedUsersFromCustomers(customerRows, branches, sessionBranchId),
    [branches, customerRows, sessionBranchId]
  );
  const lockerClients = useMemo(
    () => (profile ? buildLockerClients(profile, sessionBranchId) : []),
    [profile, sessionBranchId]
  );

  const sidebarGroups = useMemo(() => {
    const baseItems = [
      {
        label: "Overview",
        href: "/dashboard/client",
        icon: <ContactMailOutlinedIcon />,
        active: currentView === "overview"
      },
      {
        label: "My Profile",
        href: "/dashboard/client?view=profile",
        icon: <PersonRoundedIcon />,
        active: currentView === "profile"
      }
    ];

    const bankingItems = [
      {
        label: "Plans",
        href: "/dashboard/client?view=plan_catalogue",
        icon: <SavingsRoundedIcon />,
        active: currentView === "plan_catalogue",
        moduleCandidates: ["deposits"]
      },
      {
        label: "Accounts",
        href: "/dashboard/client?view=account_registry",
        icon: <AccountBalanceRoundedIcon />,
        active: currentView === "account_registry",
        moduleCandidates: ["accounts"]
      },
      {
        label: "Loans",
        href: "/dashboard/client?view=loan_workspace",
        icon: <GavelRoundedIcon />,
        active: currentView === "loan_workspace",
        moduleCandidates: ["loans"]
      },
      {
        label: "Payments",
        href: "/dashboard/client?view=payments_workspace",
        icon: <ReceiptLongRoundedIcon />,
        active: currentView === "payments_workspace",
        moduleCandidates: ["payments"]
      },
      {
        label: "Transactions",
        href: "/dashboard/client?view=transaction_workspace",
        icon: <ReceiptLongRoundedIcon />,
        active: currentView === "transaction_workspace",
        moduleCandidates: ["transactions"]
      },
      {
        label: "Locker",
        href: "/dashboard/client?view=locker_workspace",
        icon: <LockRoundedIcon />,
        active: currentView === "locker_workspace",
        moduleCandidates: ["locker"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    return [
      { items: baseItems },
      ...(bankingItems.length ? [{ heading: "Banking Services", items: bankingItems }] : [])
    ];
  }, [allowedModuleSet, currentView]);

  if (loading) {
    return <Skeleton variant="rectangular" height="100vh" />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user || !profile) {
    return <Alert severity="warning">Your client workspace is not available right now.</Alert>;
  }

  const stats = profile.dashboardStats;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={accountTypeLabel}
      avatarDataUrl={user.avatarUrl}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      t={t as any}
      accessibleModules={sidebarGroups}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {currentView === "profile" ? (
          <ProfileEditWorkspace user={user} />
        ) : currentView === "plan_catalogue" ? (
          <SocietyOperationsWorkspace
            view="plan_catalogue"
            token={getSession()?.accessToken ?? ""}
            branches={branches}
            managedUsers={managedUsers}
            canCreatePlans={false}
            canOpenAccounts={false}
          />
        ) : currentView === "account_registry" ? (
          <SocietyOperationsWorkspace
            view="account_registry"
            token={getSession()?.accessToken ?? ""}
            branches={branches}
            managedUsers={managedUsers}
            canCreatePlans={false}
            canOpenAccounts={false}
          />
        ) : currentView === "loan_workspace" ? (
          <LoanWorkspace
            token={getSession()?.accessToken ?? ""}
            managedUsers={managedUsers}
            canApplyLoan
            canManageLoanActions={false}
          />
        ) : currentView === "payments_workspace" ? (
          <PaymentWorkspace
            token={getSession()?.accessToken ?? ""}
            role={user.role}
            viewerName={user.fullName}
            viewerPhone={user.customerProfile?.phone ?? null}
          />
        ) : currentView === "transaction_workspace" ? (
          <TransactionWorkspace token={getSession()?.accessToken ?? ""} canCreateTransactions={false} canManageTransactions={false} />
        ) : currentView === "locker_workspace" ? (
          <LockerWorkspace
            token={getSession()?.accessToken ?? ""}
            clients={lockerClients}
            branches={branches}
            canManageLockers={false}
            canRecordVisits
          />
        ) : (
          <Container maxWidth="xl" disableGutters>
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 5,
                  border: "1px solid rgba(15, 23, 42, 0.06)",
                  background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
                  color: "#fff"
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
                          <Chip label="CLIENT ACCESS" size="small" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 900 }} />
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 800, letterSpacing: 1.2 }}>
                            {user.society?.name?.toUpperCase()} · {profile.customerCode}
                          </Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>
                          Welcome, {user.fullName.split(" ")[0]}
                        </Typography>
                        <Typography sx={{ mt: 1.2, maxWidth: 720, color: "rgba(255,255,255,0.82)" }}>
                          This dashboard now opens real account, plan, loan, transaction, and locker screens directly instead of the old module wrapper.
                        </Typography>
                      </Box>

                      <Card sx={{ minWidth: 250, borderRadius: 4, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <CardContent>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)", fontWeight: 900 }}>
                            ACTIVE BRANCH
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 900 }}>
                            {branchLabel}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.8, color: "rgba(255,255,255,0.74)" }}>
                            Self-service access ready
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>

                    {profile.allottedAgent ? (
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: 3.5, bgcolor: "rgba(255,255,255,0.08)" }}>
                        <Avatar sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff" }}>
                          <SupportAgentRoundedIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)", fontWeight: 900 }}>
                            RELATIONSHIP AGENT
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>
                            {[profile.allottedAgent.firstName, profile.allottedAgent.lastName].filter(Boolean).join(" ")}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.74)" }}>
                            {profile.allottedAgent.phone || "Phone not available"}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>

              <Grid container spacing={2.5}>
                {[
                  { label: "Total Invested", value: formatCurrency(stats.totalInvested) },
                  { label: "Interest Earned", value: formatCurrency(stats.interestEarned) },
                  { label: "Withdrawn", value: formatCurrency(stats.totalWithdrawn) },
                  { label: "Current Balance", value: formatCurrency(stats.netBalance) }
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <Card sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.06)" }}>
                      <CardContent>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: 0.8 }}>
                          {item.label.toUpperCase()}
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 1, fontWeight: 900, color: "#0f172a" }}>
                          {item.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Visual Breakdown & Detailed Accounts */}
              <Grid container spacing={3}>
                {/* Account Type Distribution (Pie) */}
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Portfolio Distribution</Typography>
                    <Box sx={{ flex: 1, minHeight: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={profile.accounts.reduce((acc, a) => {
                              const found = acc.find(x => x.name === a.type);
                              if (found) found.value += Number(a.currentBalance);
                              else acc.push({ name: a.type, value: Number(a.currentBalance) });
                              return acc;
                            }, [] as { name: string; value: number }[])}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {profile.accounts.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={["#4f46e5", "#10b981", "#f59e0b", "#ef4444"][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => formatCurrency(Number(value))}
                            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                       {profile.accounts.reduce((acc, a) => {
                          if (!acc.find(x => x.name === a.type)) acc.push({ name: a.type, value: 0 });
                          return acc;
                       }, [] as { name: string; value: number }[]).map((item, idx) => (
                         <Stack key={item.name} direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center">
                               <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"][idx % 4] }} />
                               <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {Math.round((profile.accounts.filter(a => a.type === item.name).reduce((sum, a) => sum + Number(a.currentBalance), 0) / stats.netBalance) * 100)}%
                            </Typography>
                         </Stack>
                       ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Account Details Table */}
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      height: "100%"
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>My Holdings</Typography>
                    <Box sx={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <th style={{ textAlign: "left", padding: "12px 0", color: "#64748b", fontSize: 13, fontWeight: 700 }}>ACCOUNT TYPE</th>
                            <th style={{ textAlign: "left", padding: "12px 0", color: "#64748b", fontSize: 13, fontWeight: 700 }}>INTEREST</th>
                            <th style={{ textAlign: "right", padding: "12px 0", color: "#64748b", fontSize: 13, fontWeight: 700 }}>BALANCE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profile.accounts.map((acc) => (
                            <tr key={acc.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                              <td style={{ padding: "16px 0" }}>
                                <Typography sx={{ fontWeight: 800, color: "#1e293b" }}>{acc.type}</Typography>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>{acc.accountNumber}</Typography>
                              </td>
                              <td style={{ padding: "16px 0" }}>
                                <Chip
                                  label={`${acc.interestRate ?? 0}% p.a.`}
                                  size="small"
                                  sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontWeight: 800, fontSize: 11 }}
                                />
                              </td>
                              <td style={{ padding: "16px 0", textAlign: "right" }}>
                                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>{formatCurrency(acc.currentBalance)}</Typography>
                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                  Opened {acc.openingDate ? new Date(acc.openingDate).toLocaleDateString() : "-"}
                                </Typography>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Container>
        )}
      </Box>
    </DashboardShell>
  );
}
