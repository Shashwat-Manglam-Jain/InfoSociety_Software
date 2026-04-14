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
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
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
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser, Branch } from "@/shared/types";
import { LoanWorkspace } from "@/features/society/components/loan-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { buildManagedUsersFromCustomers } from "@/features/society/lib/society-admin-dashboard";

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
  | "transaction_workspace"
  | "locker_workspace";

const CLIENT_VIEWS = new Set<ClientView>([
  "overview",
  "profile",
  "plan_catalogue",
  "account_registry",
  "loan_workspace",
  "transaction_workspace",
  "locker_workspace"
]);

function hasAllowedModule(allowedModuleSet: Set<string>, moduleCandidates: string[]) {
  return moduleCandidates.some((moduleSlug) => allowedModuleSet.has(moduleSlug));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
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
        label: "Profile",
        href: "/dashboard/client?view=profile",
        icon: <ContactMailOutlinedIcon />,
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
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      t={t as any}
      accessibleModules={sidebarGroups}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {currentView === "profile" ? (
          <Container maxWidth="lg" disableGutters>
            <Stack spacing={3}>
              <Card sx={{ borderRadius: 5, border: "1px solid rgba(15, 23, 42, 0.06)" }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>
                      Client Profile
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: "Customer Code", value: profile.customerCode },
                        { label: "Client Name", value: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || user.fullName },
                        { label: "Branch Scope", value: branchLabel },
                        { label: "Portal Username", value: user.username }
                      ].map((item) => (
                        <Grid key={item.label} size={{ xs: 12, md: 6 }}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: 0.8 }}>
                              {item.label.toUpperCase()}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1, fontWeight: 900 }}>
                              {item.value}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                    {profile.allottedAgent ? (
                      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha("#1d4ed8", 0.12), color: "#1d4ed8" }}>
                            <SupportAgentRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: 0.8 }}>
                              RELATIONSHIP AGENT
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 900 }}>
                              {[profile.allottedAgent.firstName, profile.allottedAgent.lastName].filter(Boolean).join(" ")}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {profile.allottedAgent.phone || "Phone not available"}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Container>
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

              <Grid container spacing={2}>
                {sidebarGroups
                  .flatMap((group) => group.items ?? [])
                  .filter((item) => item.href !== "/dashboard/client")
                  .map((item) => (
                    <Grid key={item.href} size={{ xs: 12, md: 6, xl: 4 }}>
                      <Card sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.06)", height: "100%" }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={2}>
                            <Avatar sx={{ bgcolor: alpha("#1d4ed8", 0.12), color: "#1d4ed8", width: 48, height: 48 }}>
                              {item.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                {item.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Open the live {item.label.toLowerCase()} screen and work with your real banking data.
                              </Typography>
                            </Box>
                            <Button component={Link} href={item.href} variant="contained" sx={{ borderRadius: 999, alignSelf: "flex-start", fontWeight: 900 }}>
                              Open {item.label}
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Stack>
          </Container>
        )}
      </Box>
    </DashboardShell>
  );
}
