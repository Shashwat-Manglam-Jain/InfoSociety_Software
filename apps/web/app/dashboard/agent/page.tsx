"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
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
  Skeleton,
  Stack,
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
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser, Branch } from "@/shared/types";
import { ChequeWorkspace } from "@/features/society/components/cheque-workspace";
import { LedgerWorkspace } from "@/features/society/components/ledger-workspace";
import { LoanWorkspace } from "@/features/society/components/loan-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { buildManagedUsersFromCustomers } from "@/features/society/lib/society-admin-dashboard";

type AgentView =
  | "overview"
  | "customer_workspace"
  | "plan_catalogue"
  | "account_registry"
  | "loan_workspace"
  | "transaction_workspace"
  | "ledger_workspace"
  | "cheque_workspace"
  | "demand_draft_workspace"
  | "ibc_obc_workspace"
  | "report_workspace"
  | "locker_workspace";

const AGENT_VIEWS = new Set<AgentView>([
  "overview",
  "customer_workspace",
  "plan_catalogue",
  "account_registry",
  "loan_workspace",
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
  { view: "transaction_workspace", moduleCandidates: ["transactions"] },
  { view: "ledger_workspace", moduleCandidates: ["cashbook"] },
  { view: "cheque_workspace", moduleCandidates: ["cheque-clearing"] },
  { view: "demand_draft_workspace", moduleCandidates: ["demand-drafts"] },
  { view: "ibc_obc_workspace", moduleCandidates: ["ibc-obc"] },
  { view: "report_workspace", moduleCandidates: ["reports"] },
  { view: "locker_workspace", moduleCandidates: ["locker"] }
];

function hasAllowedModule(allowedModuleSet: Set<string>, moduleCandidates: string[]) {
  return moduleCandidates.some((moduleSlug) => allowedModuleSet.has(moduleSlug));
}

function getDefaultAgentPath(allowedModuleSet: Set<string>) {
  for (const entry of AGENT_VIEW_PRIORITY) {
    if (hasAllowedModule(allowedModuleSet, entry.moduleCandidates)) {
      return `/dashboard/agent?view=${entry.view}`;
    }
  }

  return "/dashboard/agent";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function buildLockerClients(customers: CustomerListRecord[], branchId?: string | null) {
  return customers.map((customer) => ({
    id: customer.id,
    fullName: [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() || customer.customerCode,
    branchId: branchId ?? null,
    customerProfile: {
      id: customer.id,
      customerCode: customer.customerCode
    },
    isActive: !customer.isDisabled
  }));
}

function AgentDashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const requestedView = searchParams.get("view");
  const currentView: AgentView =
    requestedView && AGENT_VIEWS.has(requestedView as AgentView) ? (requestedView as AgentView) : "overview";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<CustomerListRecord[]>([]);
  const [sessionBranchId, setSessionBranchId] = useState<string | null>(null);
  const [sessionBranchName, setSessionBranchName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session || session.role !== "AGENT") {
        router.replace("/login");
        return;
      }

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

  const branchLabel = sessionBranchName ?? "Main Head Quarter";
  const allowedModuleSet = useMemo(() => new Set(user?.allowedModuleSlugs ?? []), [user?.allowedModuleSlugs]);
  const defaultAgentPath = useMemo(() => getDefaultAgentPath(allowedModuleSet), [allowedModuleSet]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (currentView !== "overview" && !AGENT_VIEW_PRIORITY.some((entry) => entry.view === currentView && hasAllowedModule(allowedModuleSet, entry.moduleCandidates))) {
      router.replace(defaultAgentPath);
    }
  }, [allowedModuleSet, currentView, defaultAgentPath, loading, router, user]);

  const scopedManagedUsers = useMemo(
    () => buildManagedUsersFromCustomers(customers, branches, sessionBranchId),
    [branches, customers, sessionBranchId]
  );
  const lockerClients = useMemo(
    () => buildLockerClients(customers, sessionBranchId),
    [customers, sessionBranchId]
  );

  const sidebarGroups = useMemo(() => {
    const baseItems = [
      {
        label: "Overview",
        href: "/dashboard/agent",
        icon: <InsightsRoundedIcon />,
        active: currentView === "overview"
      }
    ];

    const operationItems = [
      {
        label: "Customers",
        href: "/dashboard/agent?view=customer_workspace",
        icon: <GroupsRoundedIcon />,
        active: currentView === "customer_workspace",
        moduleCandidates: ["customers"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    const bankingItems = [
      {
        label: "Plans",
        href: "/dashboard/agent?view=plan_catalogue",
        icon: <SavingsRoundedIcon />,
        active: currentView === "plan_catalogue",
        moduleCandidates: ["deposits"]
      },
      {
        label: "Accounts",
        href: "/dashboard/agent?view=account_registry",
        icon: <AccountBalanceRoundedIcon />,
        active: currentView === "account_registry",
        moduleCandidates: ["accounts"]
      },
      {
        label: "Loans",
        href: "/dashboard/agent?view=loan_workspace",
        icon: <GavelRoundedIcon />,
        active: currentView === "loan_workspace",
        moduleCandidates: ["loans"]
      },
      {
        label: "Transactions",
        href: "/dashboard/agent?view=transaction_workspace",
        icon: <ReceiptLongRoundedIcon />,
        active: currentView === "transaction_workspace",
        moduleCandidates: ["transactions"]
      },
      {
        label: "Ledger",
        href: "/dashboard/agent?view=ledger_workspace",
        icon: <ArticleRoundedIcon />,
        active: currentView === "ledger_workspace",
        moduleCandidates: ["cashbook"]
      },
      {
        label: "Cheque",
        href: "/dashboard/agent?view=cheque_workspace",
        icon: <ReceiptLongRoundedIcon />,
        active: currentView === "cheque_workspace",
        moduleCandidates: ["cheque-clearing"]
      },
      {
        label: "Demand Drafts",
        href: "/dashboard/agent?view=demand_draft_workspace",
        icon: <ArticleRoundedIcon />,
        active: currentView === "demand_draft_workspace",
        moduleCandidates: ["demand-drafts"]
      },
      {
        label: "IBC / OBC",
        href: "/dashboard/agent?view=ibc_obc_workspace",
        icon: <ReceiptLongRoundedIcon />,
        active: currentView === "ibc_obc_workspace",
        moduleCandidates: ["ibc-obc"]
      },
      {
        label: "Reports",
        href: "/dashboard/agent?view=report_workspace",
        icon: <InsightsRoundedIcon />,
        active: currentView === "report_workspace",
        moduleCandidates: ["reports"]
      },
      {
        label: "Locker",
        href: "/dashboard/agent?view=locker_workspace",
        icon: <LockRoundedIcon />,
        active: currentView === "locker_workspace",
        moduleCandidates: ["locker"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    return [
      { items: baseItems },
      ...(operationItems.length ? [{ heading: "Operations", items: operationItems }] : []),
      ...(bankingItems.length ? [{ heading: "Banking Services", items: bankingItems }] : [])
    ];
  }, [allowedModuleSet, currentView]);

  if (loading) {
    return <Skeleton variant="rectangular" height="100vh" />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) {
    return <Alert severity="warning">Your agent workspace is not available right now.</Alert>;
  }

  const accountTypeLabel = `Agent Desk · ${branchLabel}`;
  const serviceCount = sidebarGroups.flatMap((group) => group.items ?? []).length - 1;

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
        {currentView === "customer_workspace" ? (
          <CustomerWorkspace token={getSession()?.accessToken ?? ""} />
        ) : currentView === "plan_catalogue" ? (
          <SocietyOperationsWorkspace
            view="plan_catalogue"
            token={getSession()?.accessToken ?? ""}
            branches={branches}
            managedUsers={scopedManagedUsers}
            canCreatePlans
            canOpenAccounts
          />
        ) : currentView === "account_registry" ? (
          <SocietyOperationsWorkspace
            view="account_registry"
            token={getSession()?.accessToken ?? ""}
            branches={branches}
            managedUsers={scopedManagedUsers}
            canCreatePlans
            canOpenAccounts
          />
        ) : currentView === "loan_workspace" ? (
          <LoanWorkspace token={getSession()?.accessToken ?? ""} managedUsers={scopedManagedUsers} />
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
          <Container maxWidth="xl" disableGutters>
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 5,
                  border: "1px solid rgba(15, 23, 42, 0.06)",
                  background: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
                  color: "#fff"
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                      <Box>
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
                          <Chip label="AGENT ACCESS" size="small" sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 900 }} />
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)", fontWeight: 800, letterSpacing: 1.2 }}>
                            {user.society?.name?.toUpperCase()} · {user.customerProfile?.customerCode ?? user.username}
                          </Typography>
                        </Stack>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>
                          Agent Workstation
                        </Typography>
                        <Typography sx={{ mt: 1.2, maxWidth: 720, color: "rgba(255,255,255,0.82)" }}>
                          This workspace now opens real banking desks directly. Pick a service from the sidebar or jump in from the live cards below.
                        </Typography>
                      </Box>

                      <Card sx={{ minWidth: 250, borderRadius: 4, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <CardContent>
                          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)", fontWeight: 900 }}>
                            SESSION BRANCH
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 0.8, fontWeight: 900 }}>
                            {branchLabel}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.8, color: "rgba(255,255,255,0.74)" }}>
                            Live services: {serviceCount}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Grid container spacing={2.5}>
                {[
                  { label: "Customers", value: String(customers.length), icon: <GroupsRoundedIcon /> },
                  { label: "Branch Scope", value: branchLabel, icon: <BadgeRoundedIcon /> },
                  { label: "Agent Code", value: user.customerProfile?.customerCode ?? user.username, icon: <BadgeRoundedIcon /> },
                  { label: "Status", value: user.isActive === false ? "Inactive" : "Active", icon: <FactCheckRoundedIcon /> }
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <Card sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.06)", height: "100%" }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha("#10b981", 0.12), color: "#059669" }}>{item.icon}</Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: 0.8 }}>
                              {item.label.toUpperCase()}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 0.6, fontWeight: 900, color: "#0f172a" }}>
                              {item.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={2}>
                {sidebarGroups
                  .flatMap((group) => group.items ?? [])
                  .filter((item) => item.href !== "/dashboard/agent")
                  .map((item) => (
                    <Grid key={item.href} size={{ xs: 12, md: 6, xl: 4 }}>
                      <Card sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.06)", height: "100%" }}>
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={2}>
                            <Avatar sx={{ bgcolor: alpha("#10b981", 0.12), color: "#059669", width: 48, height: 48 }}>
                              {item.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                {item.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Open the live {item.label.toLowerCase()} desk and work with real society data.
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

              <Alert severity="success" sx={{ borderRadius: 4 }}>
                The old module wrapper has been removed from the agent dashboard. Every sidebar item now opens a real working component.
              </Alert>
            </Stack>
          </Container>
        )}
      </Box>
    </DashboardShell>
  );
}

export default function AgentDashboardPage() {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height="100vh" />}>
      <AgentDashboardPageContent />
    </Suspense>
  );
}
