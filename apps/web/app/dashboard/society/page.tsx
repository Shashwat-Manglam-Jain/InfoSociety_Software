"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { Alert, Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ModuleWorkspace } from "@/features/banking/operations/module-workspace";
import { modules as bankingModules } from "@/features/banking/module-registry";
import { MainAdministrationWorkspace, type AdminView } from "@/features/society/components/administration/MainAdministrationWorkspace";
import { AgentDetailDrawer } from "@/features/society/components/administration/drawers/AgentDetailDrawer";
import { BranchDrawer } from "@/features/society/components/administration/drawers/BranchDrawer";

import { UserAccessDrawer } from "@/features/society/components/administration/drawers/UserAccessDrawer";
import { UserProvisioningDrawer } from "@/features/society/components/administration/drawers/UserProvisioningDrawer";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { LedgerWorkspace } from "@/features/society/components/ledger-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import { LoanWorkspace } from "@/features/society/components/loan-workspace";
import { ChequeWorkspace } from "@/features/society/components/cheque-workspace";
import { InvestmentsWorkspace } from "@/features/society/components/investments-workspace";
import { DemandDraftsWorkspace } from "@/features/society/components/demand-drafts-workspace";
import { IbcObcWorkspace } from "@/features/society/components/ibc-obc-workspace";
import { ReportsWorkspace } from "@/features/society/components/reports-workspace";
import { UserDirectoryWorkspace } from "@/features/society/components/user-directory-workspace";
import { SocietyMonitoringWorkspace } from "@/features/society/components/society-monitoring-workspace";
import {
  adminCreateBranch,
  adminDeleteBranch,
  adminListBranches,
  adminUpdateBranch,
  createStaffUser,
  deleteStaffUser,
  getAgentDetails,
  getAgentPerformance,
  listSocietyTransactions,
  listStaffUsers,
  updateStaffUser,
  updateSociety,
  updateUserAccess,
  updateUserStatus,
  type AdministrationAgentDetails
} from "@/shared/api/administration";
import { listCustomers, updateCustomer } from "@/shared/api/customers";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { getMe } from "@/shared/api/client";
import { clearSession, getDefaultDashboardPath, getSession } from "@/shared/auth/session";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { AuthUser, Branch, UserRole } from "@/shared/types";
import { toast } from "@/shared/ui/toast";
import {
  buildAgentRows,
  buildLockerClients,
  buildManagedUsers,
  buildOperationsClientRows,
  buildTreasuryRows,
  buildUsername,
  createBranchForm,
  createEmptyBranchForm,
  createEmptyUserForm,
  createUserFormFromManagedUser,
  createTemporaryPassword,
  normalizeAllowedModules,
  normalizeBranchPayload,
  type BranchFormState,
  type ManagedUserRow,
  type SocietyAgentRow,
  type TreasuryTransactionRow,
  type UserFormState
} from "@/features/society/lib/society-admin-dashboard";

type SocietyFormState = {
  name: string;
  about: string;
  softwareUrl: string;
  billingEmail: string;
  billingAddress: string;
  cin: string;
  panNo: string;
  gstNo: string;
  registrationDate: string;
  category: string;
  class: string;
  authorizedCapital: number | "";
  paidUpCapital: number | "";
  shareNominalValue: number | "";
  registrationState: string;
  logoUrl: string;
  faviconUrl: string;
};

type DrawerView = "branch" | "staff" | "agent" | "client" | null;
type SocietyView =
  | "ledger_workspace"
  | "locker_workspace"
  | "loan_workspace"
  | "cheque_workspace"
  | "membership_clients"
  | "plan_catalogue"
  | "account_registry"
  | "share_register"
  | "membership_guarantors"
  | "membership_coapplicants"
  | "investments_workspace"
  | "demand_drafts_workspace"
  | "ibc_obc_workspace"
  | "reports_workspace"
  | "user_directory_workspace"
  | "monitoring_workspace"
  | AdminView;

type DashboardSnapshot = {
  user: AuthUser;
  branches: Branch[];
  managedUsers: ManagedUserRow[];
  agents: SocietyAgentRow[];
  transactions: TreasuryTransactionRow[];
  lockerClients: ReturnType<typeof buildLockerClients>;
};

const SOCIETY_VIEWS = new Set<SocietyView>([
  "overview",
  "master_company",
  "master_branches",
  "directory",
  "treasury_audit",
  "promoter_agents",
  "ledger_workspace",
  "locker_workspace",
  "loan_workspace",
  "cheque_workspace",
  "membership_clients",
  "plan_catalogue",
  "account_registry",
  "share_register",
  "membership_guarantors",
  "membership_coapplicants",
  "investments_workspace",
  "demand_drafts_workspace",
  "ibc_obc_workspace",
  "reports_workspace",
  "user_directory_workspace",
  "monitoring_workspace"
]);

const ALL_BRANCHES_FILTER = "__ALL_BRANCHES__";
const SOCIETY_CUSTOM_MODULE_HREF_BY_SLUG: Record<string, string> = {
  administration: "/dashboard/society?view=overview",
  customers: "/dashboard/society?view=membership_clients",
  accounts: "/dashboard/society?view=account_registry",
  deposits: "/dashboard/society?view=plan_catalogue",
  loans: "/dashboard/society?view=loan_workspace",
  transactions: "/dashboard/society?view=ledger_workspace",
  "cheque-clearing": "/dashboard/society?view=cheque_workspace",
  locker: "/dashboard/society?view=locker_workspace",
  cashbook: "/dashboard/society?view=ledger_workspace",
  investments: "/dashboard/society?view=investments_workspace",
  "demand-drafts": "/dashboard/society?view=demand_drafts_workspace",
  "ibc-obc": "/dashboard/society?view=ibc_obc_workspace",
  reports: "/dashboard/society?view=reports_workspace",
  users: "/dashboard/society?view=user_directory_workspace",
  monitoring: "/dashboard/society?view=monitoring_workspace"
};

const SOCIETY_VIEW_ACCESS: Record<SocietyView, string[]> = {
  overview: ["administration"],
  master_company: ["administration"],
  master_branches: ["administration"],
  directory: ["administration"],
  treasury_audit: ["administration", "transactions", "cashbook"],
  promoter_agents: ["administration"],
  ledger_workspace: ["transactions", "cashbook"],
  locker_workspace: ["locker"],
  loan_workspace: ["loans"],
  cheque_workspace: ["cheque-clearing"],
  membership_clients: ["customers"],
  plan_catalogue: ["deposits"],
  account_registry: ["accounts"],
  share_register: ["customers"],
  membership_guarantors: ["loans"],
  membership_coapplicants: ["customers"],
  investments_workspace: ["investments"],
  demand_drafts_workspace: ["demand-drafts"],
  ibc_obc_workspace: ["ibc-obc"],
  reports_workspace: ["reports"],
  user_directory_workspace: ["users"],
  monitoring_workspace: ["monitoring"]
};

function hasAllowedModule(allowedModuleSlugs: Set<string>, moduleCandidates: string[]) {
  return moduleCandidates.some((moduleSlug) => allowedModuleSlugs.has(moduleSlug));
}

function canAccessSocietyView(view: SocietyView, allowedModuleSlugs: Set<string>) {
  const rules = SOCIETY_VIEW_ACCESS[view] ?? [];
  if (rules.length === 0) {
    return true;
  }

  if (allowedModuleSlugs.size === 0) {
    return view === "overview";
  }

  return hasAllowedModule(allowedModuleSlugs, rules);
}

function getSocietyModuleHref(slug: string) {
  return SOCIETY_CUSTOM_MODULE_HREF_BY_SLUG[slug] ?? `/dashboard/society?module=${slug}`;
}

function getSocietyModuleIcon(slug: string) {
  switch (slug) {
    case "users":
      return <ManageAccountsRoundedIcon />;
    case "loans":
      return <GavelRoundedIcon />;
    case "cheque-clearing":
    case "demand-drafts":
    case "ibc-obc":
    case "reports":
      return <ReceiptLongRoundedIcon />;
    case "locker":
      return <LockRoundedIcon />;
    case "monitoring":
      return <BusinessRoundedIcon />;
    default:
      return <AccountBalanceIcon />;
  }
}

function createEmptySocietyForm(): SocietyFormState {
  return {
    name: "",
    about: "",
    softwareUrl: "",
    billingEmail: "",
    billingAddress: "",
    cin: "",
    panNo: "",
    gstNo: "",
    registrationDate: "",
    category: "",
    class: "",
    authorizedCapital: "",
    paidUpCapital: "",
    shareNominalValue: "",
    registrationState: "",
    logoUrl: "",
    faviconUrl: ""
  };
}

function formatDateForInput(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function mapSocietyToForm(user: AuthUser | null): SocietyFormState {
  const society = user?.society;

  if (!society) {
    return createEmptySocietyForm();
  }

  return {
    name: society.name ?? "",
    about: society.about ?? "",
    softwareUrl: society.softwareUrl ?? "",
    billingEmail: society.billingEmail ?? "",
    billingAddress: society.billingAddress ?? "",
    cin: society.cin ?? "",
    panNo: society.panNo ?? "",
    gstNo: society.gstNo ?? "",
    registrationDate: formatDateForInput(society.registrationDate),
    category: society.category ?? "",
    class: society.class ?? "",
    authorizedCapital: society.authorizedCapital ?? "",
    paidUpCapital: society.paidUpCapital ?? "",
    shareNominalValue: society.shareNominalValue ?? "",
    registrationState: society.registrationState ?? "",
    logoUrl: society.logoUrl ?? "",
    faviconUrl: society.faviconUrl ?? ""
  };
}

async function loadDashboardSnapshot(token: string): Promise<DashboardSnapshot> {
  const results = await Promise.allSettled([
    getMe(token),
    adminListBranches(token),
    listStaffUsers(token),
    getAgentPerformance(token),
    listSocietyTransactions(token),
    listCustomers(token)
  ]);

  if (results[0].status !== "fulfilled") {
    throw results[0].reason;
  }

  const profile = results[0].value as AuthUser;
  const branches = (results[1].status === "fulfilled" ? results[1].value : []) as Branch[];
  const users = (results[2].status === "fulfilled" ? results[2].value : []) as any[];
  const performance = (results[3].status === "fulfilled" ? results[3].value : []) as any[];
  const transactionsRaw = (results[4].status === "fulfilled" ? results[4].value : []) as any[];
  const customersRaw = (results[5].status === "fulfilled" ? results[5].value : { rows: [] as any[] }) as { rows: any[] };

  const managedUsers = buildManagedUsers(users, branches);
  const agents = buildAgentRows(managedUsers, performance);
  const transactions = buildTreasuryRows(transactionsRaw, branches);
  const lockerClients = buildLockerClients(customersRaw.rows || []);

  return {
    user: profile,
    branches,
    managedUsers,
    agents,
    transactions,
    lockerClients
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
}

export default function SocietyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = getSession();
  const requestedView = searchParams.get("view");
  const requestedModuleSlug = searchParams.get("module");
  const currentView: SocietyView = requestedView && SOCIETY_VIEWS.has(requestedView as SocietyView)
    ? (requestedView as SocietyView)
    : "overview";
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const [societyForm, setSocietyForm] = useState<SocietyFormState>(createEmptySocietyForm);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUserRow[]>([]);
  const [agents, setAgents] = useState<SocietyAgentRow[]>([]);
  const [transactions, setTransactions] = useState<TreasuryTransactionRow[]>([]);
  const [lockerClients, setLockerClients] = useState<ReturnType<typeof buildLockerClients>>([]);
  const [shellUser, setShellUser] = useState<AuthUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [societySaving, setSocietySaving] = useState(false);
  const [branchSaving, setBranchSaving] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);

  const [activeDrawer, setActiveDrawer] = useState<DrawerView>(null);
  const [branchForm, setBranchForm] = useState<BranchFormState>(createEmptyBranchForm);
  const [userForm, setUserForm] = useState<UserFormState>(createEmptyUserForm("SUPER_USER"));
  const [selectedUserAccess, setSelectedUserAccess] = useState<ManagedUserRow | null>(null);
  const [editingManagedUser, setEditingManagedUser] = useState<ManagedUserRow | null>(null);
  const [editingAgent, setEditingAgent] = useState<SocietyAgentRow | null>(null);
  const [editingAgentDetails, setEditingAgentDetails] = useState<AdministrationAgentDetails | null>(null);

  const [userSearch, setUserSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentPage, setAgentPage] = useState(0);
  const [agentRowsPerPage, setAgentRowsPerPage] = useState(10);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>(
    session?.selectedBranchId ?? ALL_BRANCHES_FILTER
  );

  async function hydrateDashboard(showLoader = false) {
    const session = getSession();
    if (!session || session.role !== "SUPER_USER") {
      router.replace("/login");
      return false;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      const snapshot = await loadDashboardSnapshot(session.accessToken);
      setShellUser(snapshot.user);
      setSocietyForm(mapSocietyToForm(snapshot.user));
      setBranches(snapshot.branches);
      setManagedUsers(snapshot.managedUsers);
      setAgents(snapshot.agents);
      setTransactions(snapshot.transactions);
      setLockerClients(snapshot.lockerClients);
      setError(null);
      return true;
    } catch (caught) {
      const status = (caught as { status?: number })?.status;
      const message = caught instanceof Error ? caught.message : "Unable to load the society dashboard.";

      if (status === 401 || status === 403) {
        clearSession();
        router.replace("/login");
        return false;
      }

      setError(message);
      return false;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void hydrateDashboard(true);
  }, [router]);

  useEffect(() => {
    if (branches.length === 0) {
      if (selectedBranchFilter !== ALL_BRANCHES_FILTER) {
        setSelectedBranchFilter(ALL_BRANCHES_FILTER);
      }
      return;
    }

    if (selectedBranchFilter !== ALL_BRANCHES_FILTER && branches.some((branch) => branch.id === selectedBranchFilter)) {
      return;
    }

    if (session?.selectedBranchId && branches.some((branch) => branch.id === session.selectedBranchId)) {
      setSelectedBranchFilter(session.selectedBranchId);
      return;
    }

    setSelectedBranchFilter(ALL_BRANCHES_FILTER);
  }, [branches, selectedBranchFilter, session?.selectedBranchId]);

  const allowedModuleSlugs = shellUser?.allowedModuleSlugs ?? [];
  const allowedModuleSet = useMemo(() => new Set(allowedModuleSlugs), [allowedModuleSlugs]);
  const defaultSocietyPath = useMemo(
    () => getDefaultDashboardPath("SOCIETY", false, allowedModuleSlugs),
    [allowedModuleSlugs]
  );

  const societyModuleWorkspaceItems = useMemo(
    () =>
      bankingModules
        .filter((module) => (allowedModuleSet.size === 0 ? module.slug === "administration" : allowedModuleSet.has(module.slug)))
        .map((module) => ({
          ...module,
          href: getSocietyModuleHref(module.slug),
          active: requestedModuleSlug === module.slug
        })),
    [allowedModuleSet, requestedModuleSlug]
  );

  const selectedSocietyModule = useMemo(
    () => societyModuleWorkspaceItems.find((module) => module.slug === requestedModuleSlug) ?? null,
    [requestedModuleSlug, societyModuleWorkspaceItems]
  );

  const customAccessibleModules = useMemo(() => {
    const administrationItems = [
      {
        label: "Dashboard",
        href: "/dashboard/society?view=overview",
        icon: <BusinessRoundedIcon />,
        active: !requestedModuleSlug && currentView === "overview",
        moduleCandidates: ["administration"]
      },
      {
        label: "Society Profile",
        href: "/dashboard/society?view=master_company",
        icon: <BusinessRoundedIcon />,
        active: !requestedModuleSlug && currentView === "master_company",
        moduleCandidates: ["administration"]
      },
      {
        label: "Branches",
        href: "/dashboard/society?view=master_branches",
        icon: <MapRoundedIcon />,
        active: !requestedModuleSlug && currentView === "master_branches",
        moduleCandidates: ["administration"]
      },
      {
        label: "User Access",
        href: "/dashboard/society?view=directory",
        icon: <ManageAccountsRoundedIcon />,
        active: !requestedModuleSlug && currentView === "directory",
        moduleCandidates: ["administration"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    const operationItems = [
      {
        label: "Field Agents",
        href: "/dashboard/society?view=promoter_agents",
        icon: <ManageAccountsRoundedIcon />,
        active: !requestedModuleSlug && currentView === "promoter_agents",
        moduleCandidates: ["administration"]
      },
      {
        label: "Clients",
        href: "/dashboard/society?view=membership_clients",
        icon: <ManageAccountsRoundedIcon />,
        active: !requestedModuleSlug && currentView === "membership_clients",
        moduleCandidates: ["customers"]
      },
      {
        label: "Share Register",
        href: "/dashboard/society?view=share_register",
        icon: <ReceiptLongRoundedIcon />,
        active: !requestedModuleSlug && currentView === "share_register",
        moduleCandidates: ["customers"]
      },
      {
        label: "Guarantors",
        href: "/dashboard/society?view=membership_guarantors",
        icon: <ShieldRoundedIcon />,
        active: !requestedModuleSlug && currentView === "membership_guarantors",
        moduleCandidates: ["loans"]
      },
      {
        label: "Co-Applicants",
        href: "/dashboard/society?view=membership_coapplicants",
        icon: <ManageAccountsRoundedIcon />,
        active: !requestedModuleSlug && currentView === "membership_coapplicants",
        moduleCandidates: ["customers"]
      },
      {
        label: "Audit Trail",
        href: "/dashboard/society?view=treasury_audit",
        icon: <ReceiptLongRoundedIcon />,
        active: !requestedModuleSlug && currentView === "treasury_audit",
        moduleCandidates: ["administration", "transactions", "cashbook"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    const bankingItems = [
      {
        label: "Accounts",
        href: "/dashboard/society?view=account_registry",
        icon: <AccountBalanceIcon />,
        active: !requestedModuleSlug && currentView === "account_registry",
        moduleCandidates: ["accounts"]
      },
      {
        label: "Plans",
        href: "/dashboard/society?view=plan_catalogue",
        icon: <MapRoundedIcon />,
        active: !requestedModuleSlug && currentView === "plan_catalogue",
        moduleCandidates: ["deposits"]
      },
      {
        label: "Ledger",
        href: "/dashboard/society?view=ledger_workspace",
        icon: <HistoryRoundedIcon />,
        active: !requestedModuleSlug && currentView === "ledger_workspace",
        moduleCandidates: ["transactions", "cashbook"]
      },
      {
        label: "Loans",
        href: "/dashboard/society?view=loan_workspace",
        icon: <GavelRoundedIcon />,
        active: !requestedModuleSlug && currentView === "loan_workspace",
        moduleCandidates: ["loans"]
      },
      {
        label: "Cheque",
        href: "/dashboard/society?view=cheque_workspace",
        icon: <ReceiptLongRoundedIcon />,
        active: !requestedModuleSlug && currentView === "cheque_workspace",
        moduleCandidates: ["cheque-clearing"]
      },
      {
        label: "Locker",
        href: "/dashboard/society?view=locker_workspace",
        icon: <LockRoundedIcon />,
        active: !requestedModuleSlug && currentView === "locker_workspace",
        moduleCandidates: ["locker"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    const additionalModuleItems = societyModuleWorkspaceItems
      .filter((module) => !Object.prototype.hasOwnProperty.call(SOCIETY_CUSTOM_MODULE_HREF_BY_SLUG, module.slug))
      .map((module) => ({
        label: module.name,
        href: module.href,
        icon: getSocietyModuleIcon(module.slug),
        active: requestedModuleSlug === module.slug
      }));

    // New Additional Services section for dedicated workspaces
    const additionalServicesItems = [
      {
        label: "Investments",
        href: "/dashboard/society?view=investments_workspace",
        icon: getSocietyModuleIcon("investments"),
        active: !requestedModuleSlug && currentView === "investments_workspace",
        moduleCandidates: ["investments"]
      },
      {
        label: "Demand Drafts",
        href: "/dashboard/society?view=demand_drafts_workspace",
        icon: getSocietyModuleIcon("demand-drafts"),
        active: !requestedModuleSlug && currentView === "demand_drafts_workspace",
        moduleCandidates: ["demand-drafts"]
      },
      {
        label: "IBC/OBC",
        href: "/dashboard/society?view=ibc_obc_workspace",
        icon: getSocietyModuleIcon("ibc-obc"),
        active: !requestedModuleSlug && currentView === "ibc_obc_workspace",
        moduleCandidates: ["ibc-obc"]
      },
      {
        label: "Reports",
        href: "/dashboard/society?view=reports_workspace",
        icon: getSocietyModuleIcon("reports"),
        active: !requestedModuleSlug && currentView === "reports_workspace",
        moduleCandidates: ["reports"]
      },
      {
        label: "User Directory",
        href: "/dashboard/society?view=user_directory_workspace",
        icon: getSocietyModuleIcon("users"),
        active: !requestedModuleSlug && currentView === "user_directory_workspace",
        moduleCandidates: ["users"]
      },
      {
        label: "Monitoring",
        href: "/dashboard/society?view=monitoring_workspace",
        icon: getSocietyModuleIcon("monitoring"),
        active: !requestedModuleSlug && currentView === "monitoring_workspace",
        moduleCandidates: ["monitoring"]
      }
    ].filter((item) => hasAllowedModule(allowedModuleSet, item.moduleCandidates));

    return [
      ...(administrationItems.length > 0 ? [{ heading: "Administration", items: administrationItems }] : []),
      ...(operationItems.length > 0 ? [{ heading: "Operations", items: operationItems }] : []),
      ...(bankingItems.length > 0 ? [{ heading: "Banking Services", items: bankingItems }] : []),
      ...(additionalServicesItems.length > 0 ? [{ heading: "Additional Services", items: additionalServicesItems }] : []),
      ...(additionalModuleItems.length > 0 ? [{ heading: "Other Modules", items: additionalModuleItems }] : [])
    ];
  }, [allowedModuleSet, currentView, requestedModuleSlug, societyModuleWorkspaceItems]);

  useEffect(() => {
    if (loading || !shellUser) {
      return;
    }

    if (requestedModuleSlug) {
      if (!selectedSocietyModule) {
        router.replace(defaultSocietyPath);
      }
      return;
    }

    if (!canAccessSocietyView(currentView, allowedModuleSet)) {
      router.replace(defaultSocietyPath);
    }
  }, [
    allowedModuleSet,
    currentView,
    defaultSocietyPath,
    loading,
    requestedModuleSlug,
    router,
    selectedSocietyModule,
    shellUser
  ]);

  async function handleUpdateSociety() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setSocietySaving(true);

    try {
      const updated = await updateSociety(session.accessToken, {
        name: societyForm.name,
        about: societyForm.about,
        softwareUrl: societyForm.softwareUrl,
        billingEmail: societyForm.billingEmail,
        billingAddress: societyForm.billingAddress,
        cin: societyForm.cin,
        panNo: societyForm.panNo,
        gstNo: societyForm.gstNo,
        registrationDate: societyForm.registrationDate || null,
        category: societyForm.category,
        class: societyForm.class,
        authorizedCapital: societyForm.authorizedCapital === "" ? null : societyForm.authorizedCapital,
        paidUpCapital: societyForm.paidUpCapital === "" ? null : societyForm.paidUpCapital,
        shareNominalValue: societyForm.shareNominalValue === "" ? null : societyForm.shareNominalValue,
        registrationState: societyForm.registrationState,
        logoUrl: societyForm.logoUrl,
        faviconUrl: societyForm.faviconUrl
      });

      const nextUser = shellUser && shellUser.society
        ? {
          ...shellUser,
          society: {
            ...shellUser.society,
            ...updated,
            status: shellUser.society?.status ?? "ACTIVE",
            registrationDate: updated.registrationDate ?? shellUser.society.registrationDate
          }
        }
        : shellUser;

      setShellUser(nextUser);
      setSocietyForm(mapSocietyToForm(nextUser));
      toast.success("Society profile saved.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the society profile.");
    } finally {
      setSocietySaving(false);
    }
  }

  function openUserDrawer(role: UserRole) {
    setUserForm(createEmptyUserForm(role));
    setEditingManagedUser(null);
    setActiveDrawer(role === "SUPER_USER" ? "staff" : role === "AGENT" ? "agent" : "client");
  }

  function closeUserDrawer() {
    setActiveDrawer(null);
    setEditingManagedUser(null);
    setUserForm(createEmptyUserForm("SUPER_USER"));
  }

  function handleOpenDrawer(type: Exclude<DrawerView, null>, data?: Branch) {
    if (type === "branch") {
      setBranchForm(createBranchForm(data as Branch));
    }

    if (type === "staff") {
      openUserDrawer("SUPER_USER");
      return;
    }

    if (type === "agent") {
      openUserDrawer("AGENT");
      return;
    }

    if (type === "client") {
      openUserDrawer("CLIENT");
      return;
    }

    setActiveDrawer(type);
  }

  async function handleSaveBranch() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setBranchSaving(true);

    try {
      const payload = normalizeBranchPayload(branchForm, { includeStatus: Boolean(branchForm.id) });
      const saved = branchForm.id
        ? await adminUpdateBranch(session.accessToken, branchForm.id, payload)
        : await adminCreateBranch(session.accessToken, payload);

      setBranches((previous) =>
        branchForm.id ? previous.map((branch) => (branch.id === saved.id ? saved : branch)) : [saved, ...previous]
      );
      setActiveDrawer(null);
      setBranchForm(createEmptyBranchForm());
      toast.success(branchForm.id ? "Branch updated." : "Branch created.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the branch.");
    } finally {
      setBranchSaving(false);
    }
  }

  async function handleDeleteBranch(branchId: string) {
    if (!window.confirm("Delete this branch?")) {
      return;
    }

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      await adminDeleteBranch(session.accessToken, branchId);
      setBranches((previous) => previous.filter((branch) => branch.id !== branchId));
      toast.success("Branch deleted.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to delete the branch.");
    }
  }



  async function handleSaveUser() {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setUserSaving(true);

    try {
      const payload = {
        fullName: userForm.fullName.trim(),
        username: userForm.username,
        isActive: userForm.isActive,
        branchId: userForm.branchId || undefined,
        allowedModuleSlugs: normalizeAllowedModules(userForm.role, userForm.allowedModuleSlugs),
        phone: userForm.phone.trim() || undefined,
        email: userForm.email.trim() || undefined,
        address: userForm.address.trim() || undefined
      };

      if (editingManagedUser) {
        await updateStaffUser(session.accessToken, editingManagedUser.id, {
          ...payload,
          password: userForm.password.trim() || undefined
        });
      } else {
        await createStaffUser(session.accessToken, {
          ...payload,
          password: userForm.password,
          role: userForm.role
        });
      }

      closeUserDrawer();
      await hydrateDashboard(false);
      toast.success(editingManagedUser ? "User account updated." : "User account created.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the account.");
    } finally {
      setUserSaving(false);
    }
  }

  function handleEditManagedUser(user: ManagedUserRow) {
    setEditingManagedUser(user);
    setUserForm(createUserFormFromManagedUser(user));
    setActiveDrawer(user.role === "SUPER_USER" ? "staff" : user.role === "AGENT" ? "agent" : "client");
  }

  async function handleDeleteManagedUser(user: ManagedUserRow) {
    if (!window.confirm(`Remove ${user.fullName}'s account?`)) {
      return;
    }

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      await deleteStaffUser(session.accessToken, user.id);
      if (selectedUserAccess?.id === user.id) {
        setSelectedUserAccess(null);
      }
      if (editingManagedUser?.id === user.id) {
        closeUserDrawer();
      }
      await hydrateDashboard(false);
      toast.success("User account removed.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to remove the account.");
    }
  }

  async function handleToggleManagedUserStatus(id: string, current: boolean) {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    try {
      await updateUserStatus(session.accessToken, id, !current);
      setManagedUsers((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, isActive: !current } : entry))
      );
      setAgents((previous) =>
        previous.map((agent) => (agent.userId === id ? { ...agent, isActive: !current } : agent))
      );
      setEditingAgentDetails((previous) =>
        previous && previous.user?.id === id
          ? {
            ...previous,
            user: {
              ...previous.user,
              isActive: !current
            }
          }
          : previous
      );
      setSelectedUserAccess((previous) => (previous?.id === id ? { ...previous, isActive: !current } : previous));
      toast.success(!current ? "User activated." : "User deactivated.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update the user status.");
    }
  }

  async function handleSaveUserAccess(allowedModuleSlugs: string[]) {
    if (!selectedUserAccess) {
      return;
    }

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setAccessSaving(true);

    try {
      const normalizedAllowedModuleSlugs = normalizeAllowedModules(selectedUserAccess.role, allowedModuleSlugs);
      await updateUserAccess(session.accessToken, selectedUserAccess.id, normalizedAllowedModuleSlugs);

      setManagedUsers((previous) =>
        previous.map((user) =>
          user.id === selectedUserAccess.id ? { ...user, allowedModuleSlugs: normalizedAllowedModuleSlugs } : user
        )
      );
      setAgents((previous) =>
        previous.map((agent) =>
          agent.userId === selectedUserAccess.id ? { ...agent, allowedModuleSlugs: normalizedAllowedModuleSlugs } : agent
        )
      );
      setSelectedUserAccess((previous) =>
        previous ? { ...previous, allowedModuleSlugs: normalizedAllowedModuleSlugs } : previous
      );
      toast.success("Access updated.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update module access.");
    } finally {
      setAccessSaving(false);
    }
  }

  async function handleOpenAgentDetails(agent: SocietyAgentRow) {
    if (!agent.customerId) {
      toast.error("This agent is not linked to a customer profile yet.");
      return;
    }

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setEditingAgent(agent);
    setEditingAgentDetails(null);
    setAgentLoading(true);

    try {
      const details = await getAgentDetails(session.accessToken, agent.customerId);
      setEditingAgentDetails(details);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to load agent details.");
      setEditingAgent(null);
    } finally {
      setAgentLoading(false);
    }
  }

  async function handleSaveAgentDetails(payload: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    isActive: boolean;
  }) {
    if (!editingAgent?.customerId || !editingAgentDetails?.user?.id) {
      return;
    }

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setAgentLoading(true);

    try {
      await updateCustomer(session.accessToken, editingAgent.customerId, {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim() || undefined,
        phone: payload.phone.trim() || undefined,
        email: payload.email.trim() || undefined
      });

      if (editingAgentDetails.user.isActive !== payload.isActive) {
        await updateUserStatus(session.accessToken, editingAgentDetails.user.id, payload.isActive);
      }

      await hydrateDashboard(false);
      setEditingAgent(null);
      setEditingAgentDetails(null);
      toast.success("Agent updated.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save the agent.");
    } finally {
      setAgentLoading(false);
    }
  }

  function handleCloseAgentDrawer() {
    setEditingAgent(null);
    setEditingAgentDetails(null);
    setAgentLoading(false);
  }

  const isLedgerView = currentView === "ledger_workspace";
  const isLockerView = currentView === "locker_workspace";
  const isLoanView = currentView === "loan_workspace";
  const isChequeView = currentView === "cheque_workspace";
  const isInvestmentsView = currentView === "investments_workspace";
  const isDemandDraftsView = currentView === "demand_drafts_workspace";
  const isIbcObcView = currentView === "ibc_obc_workspace";
  const isReportsView = currentView === "reports_workspace";
  const isUserDirectoryView = currentView === "user_directory_workspace";
  const isMonitoringView = currentView === "monitoring_workspace";
  const branchFilterActive = selectedBranchFilter !== ALL_BRANCHES_FILTER;
  const visibleBranches = useMemo(
    () => (branchFilterActive ? branches.filter((branch) => branch.id === selectedBranchFilter) : branches),
    [branchFilterActive, branches, selectedBranchFilter]
  );
  const filteredManagedUsers = useMemo(
    () =>
      branchFilterActive
        ? managedUsers.filter((user) => (user.branchId ?? "") === selectedBranchFilter)
        : managedUsers,
    [branchFilterActive, managedUsers, selectedBranchFilter]
  );
  const filteredAgents = useMemo(
    () =>
      branchFilterActive
        ? agents.filter((agent) => (agent.branch?.id ?? "") === selectedBranchFilter)
        : agents,
    [agents, branchFilterActive, selectedBranchFilter]
  );
  const filteredTransactions = useMemo(
    () =>
      branchFilterActive
        ? transactions.filter((transaction) => (transaction.branchId ?? "") === selectedBranchFilter)
        : transactions,
    [branchFilterActive, selectedBranchFilter, transactions]
  );
  const visibleCustomerIds = useMemo(
    () =>
      new Set(
        filteredManagedUsers
          .filter((user) => user.role === "CLIENT" && user.customerProfile?.id)
          .map((user) => user.customerProfile!.id)
      ),
    [filteredManagedUsers]
  );
  const filteredLockerClients = useMemo(
    () =>
      branchFilterActive
        ? lockerClients.filter((client) => visibleCustomerIds.has(client.customerProfile.id))
        : lockerClients,
    [branchFilterActive, lockerClients, visibleCustomerIds]
  );
  const clientRegistryMembers = useMemo(
    () => buildOperationsClientRows(filteredManagedUsers),
    [filteredManagedUsers]
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: surfaces.background }}>
        <CircularProgress thickness={4.5} size={56} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: surfaces.background, p: 3 }}>
        <Alert severity="error" sx={{ width: "100%", maxWidth: 640 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <DashboardShell
      user={shellUser}
      accountTypeLabel={`Society Dashboard${branchFilterActive ? ` · ${branches.find((branch) => branch.id === selectedBranchFilter)?.name ?? "Branch"}` : ""}`}
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: surfaces.background, p: { xs: 1.5, sm: 3 } }}>
        {branches.length > 0 ? (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 4,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              bgcolor: surfaces.paper,
              p: { xs: 2, sm: 2.5 }
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900 }}>
                  Branch Scope
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter the visible society dashboard records by branch, or keep the full society view.
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                value={selectedBranchFilter}
                onChange={(event) => setSelectedBranchFilter(event.target.value)}
                sx={{ minWidth: { xs: "100%", md: 280 } }}
              >
                <MenuItem value={ALL_BRANCHES_FILTER}>All branches</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Paper>
        ) : null}

        {requestedModuleSlug && selectedSocietyModule && session ? (
          <ModuleWorkspace
            slug={selectedSocietyModule.slug}
            name={selectedSocietyModule.name}
            summary={selectedSocietyModule.summary}
            dashboardHref={defaultSocietyPath}
            accessibleModules={societyModuleWorkspaceItems}
            viewerName={`${shellUser?.fullName ?? "Society User"}${branchFilterActive ? ` · ${branches.find((branch) => branch.id === selectedBranchFilter)?.name ?? ""}` : ""}`}
          />
        ) : isLedgerView && session ? (
          <LedgerWorkspace token={session.accessToken} />
        ) : isLockerView && session ? (
          <LockerWorkspace token={session.accessToken} clients={filteredLockerClients} branches={visibleBranches} />
        ) : isLoanView && session ? (
          <LoanWorkspace token={session.accessToken} managedUsers={filteredManagedUsers} />
        ) : isChequeView && session ? (
          <ChequeWorkspace token={session.accessToken} />
        ) : isInvestmentsView && session ? (
          <InvestmentsWorkspace token={session.accessToken} />
        ) : isDemandDraftsView && session ? (
          <DemandDraftsWorkspace token={session.accessToken} />
        ) : isIbcObcView && session ? (
          <IbcObcWorkspace token={session.accessToken} />
        ) : isReportsView && session ? (
          <ReportsWorkspace token={session.accessToken} />
        ) : isUserDirectoryView && session ? (
          <UserDirectoryWorkspace token={session.accessToken} />
        ) : isMonitoringView && session ? (
          <SocietyMonitoringWorkspace token={session.accessToken} />
        ) : [
          "membership_clients",
          "plan_catalogue",
          "account_registry",
          "share_register",
          "membership_guarantors",
          "membership_coapplicants"
        ].includes(currentView) ? (
          <SocietyOperationsWorkspace
            view={currentView}
            token={session?.accessToken ?? ""}
            branches={branches}
            managedUsers={filteredManagedUsers}
            clientMembers={clientRegistryMembers}
            branchFilterId={branchFilterActive ? selectedBranchFilter : null}
            openCreateClientDrawer={() => handleOpenDrawer("client")}
          />
        ) : (
          <MainAdministrationWorkspace
            view={currentView as AdminView}
            societyForm={societyForm}
            setSocietyForm={setSocietyForm}
            handleUpdateSociety={() => void handleUpdateSociety()}
            handleOpenWorkspace={() => router.push("/dashboard/society?view=directory")}
            formLoading={societySaving}
            branches={visibleBranches}
            handleOpenDrawer={handleOpenDrawer}
            handleDeleteBranch={handleDeleteBranch}
            managedUsers={filteredManagedUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            handleToggleUserStatus={handleToggleManagedUserStatus}
            setSelectedUserAccess={setSelectedUserAccess}
            handleEditUser={handleEditManagedUser}
            handleDeleteUser={handleDeleteManagedUser}
            transactions={filteredTransactions}
            transactionSearch={transactionSearch}
            setTransactionSearch={setTransactionSearch}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            agents={filteredAgents}
            agentSearch={agentSearch}
            setAgentSearch={setAgentSearch}
            agentPage={agentPage}
            setAgentPage={setAgentPage}
            agentRowsPerPage={agentRowsPerPage}
            setAgentRowsPerPage={setAgentRowsPerPage}
            setEditingAgent={handleOpenAgentDetails}
          />
        )}
      </Box>

      <BranchDrawer
        open={activeDrawer === "branch"}
        onClose={() => setActiveDrawer(null)}
        form={branchForm}
        setForm={setBranchForm}
        onSave={() => void handleSaveBranch()}
        loading={branchSaving}
      />



      <UserProvisioningDrawer
        open={Boolean(activeDrawer && ["staff", "agent", "client"].includes(activeDrawer))}
        onClose={closeUserDrawer}
        form={userForm}
        setForm={setUserForm}
        onSave={() => void handleSaveUser()}
        loading={userSaving}
        branches={branches}
        updateStaffName={(value) =>
          setUserForm((previous) => {
            const previousGeneratedUsername = buildUsername(previous.fullName);
            const shouldKeepUsernameInSync = !previous.username.trim() || previous.username === previousGeneratedUsername;

            return {
              ...previous,
              fullName: value,
              username: shouldKeepUsernameInSync ? buildUsername(value) : previous.username
            };
          })
        }
        regeneratePassword={() => setUserForm({ ...userForm, password: createTemporaryPassword() })}
        mode={editingManagedUser ? "edit" : "create"}
      />

      <UserAccessDrawer
        open={Boolean(selectedUserAccess)}
        onClose={() => setSelectedUserAccess(null)}
        user={selectedUserAccess}
        loading={accessSaving}
        onSave={(allowedModuleSlugs) => void handleSaveUserAccess(allowedModuleSlugs)}
      />

      <AgentDetailDrawer
        open={Boolean(editingAgent)}
        onClose={handleCloseAgentDrawer}
        loading={agentLoading}
        agent={editingAgentDetails}
        branchName={editingAgent?.branch?.name}
        onSave={(payload) => void handleSaveAgentDetails(payload)}
      />
    </DashboardShell>
  );
}
