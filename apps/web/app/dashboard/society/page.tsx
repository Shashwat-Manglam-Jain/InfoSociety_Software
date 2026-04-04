"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { Alert, Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MainAdministrationWorkspace, type AdminView } from "@/features/society/components/administration/MainAdministrationWorkspace";
import { AgentDetailDrawer } from "@/features/society/components/administration/drawers/AgentDetailDrawer";
import { BranchDrawer } from "@/features/society/components/administration/drawers/BranchDrawer";

import { UserAccessDrawer } from "@/features/society/components/administration/drawers/UserAccessDrawer";
import { UserProvisioningDrawer } from "@/features/society/components/administration/drawers/UserProvisioningDrawer";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { LedgerWorkspace } from "@/features/society/components/ledger-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import {
  adminCreateBranch,
  adminDeleteBranch,
  adminListBranches,
  adminUpdateBranch,
  createStaffUser,
  getAgentDetails,
  getAgentPerformance,
  listSocietyTransactions,
  listStaffUsers,
  updateSociety,
  updateUserAccess,
  updateUserStatus,
  type AdministrationAgentDetails
} from "@/shared/api/administration";
import { listCustomers, updateCustomer } from "@/shared/api/customers";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { getMe } from "@/shared/api/client";
import { clearSession, getSession } from "@/shared/auth/session";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { AuthUser, Branch, UserRole } from "@/shared/types";
import { toast } from "@/shared/ui/toast";
import {
  buildAgentRows,
  buildLockerClients,
  buildManagedUsers,
  buildTreasuryRows,
  buildUsername,
  createBranchForm,
  createEmptyBranchForm,
  createEmptyUserForm,
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
  | "membership_clients"
  | "plan_catalogue"
  | "account_registry"
  | "share_register"
  | "membership_guarantors"
  | "membership_coapplicants"
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
  "membership_clients",
  "plan_catalogue",
  "account_registry",
  "share_register",
  "membership_guarantors",
  "membership_coapplicants"
]);

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
  const requestedView = searchParams.get("view");
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
  const [editingAgent, setEditingAgent] = useState<SocietyAgentRow | null>(null);
  const [editingAgentDetails, setEditingAgentDetails] = useState<AdministrationAgentDetails | null>(null);

  const [userSearch, setUserSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentPage, setAgentPage] = useState(0);
  const [agentRowsPerPage, setAgentRowsPerPage] = useState(10);

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
  }, []);

  const customAccessibleModules = useMemo(
    () => [
      {
        heading: "Administration",
        items: [
          {
            label: "Dashboard",
            href: "/dashboard/society?view=overview",
            icon: <BusinessRoundedIcon />,
            active: currentView === "overview" || currentView === "master_company"
          },
          {
            label: "Branches",
            href: "/dashboard/society?view=master_branches",
            icon: <MapRoundedIcon />,
            active: currentView === "master_branches"
          },
          {
            label: "User Access",
            href: "/dashboard/society?view=directory",
            icon: <ManageAccountsRoundedIcon />,
            active: currentView === "directory"
          }
        ]
      },
      {
        heading: "Operations",
        items: [
          {
            label: "Field Agents",
            href: "/dashboard/society?view=promoter_agents",
            icon: <ManageAccountsRoundedIcon />,
            active: currentView === "promoter_agents"
          },
          {
            label: "Clients",
            href: "/dashboard/society?view=membership_clients",
            icon: <ManageAccountsRoundedIcon />,
            active: currentView === "membership_clients"
          },
          {
            label: "Share Register",
            href: "/dashboard/society?view=share_register",
            icon: <ReceiptLongRoundedIcon />,
            active: currentView === "share_register"
          },
          {
            label: "Guarantors",
            href: "/dashboard/society?view=membership_guarantors",
            icon: <ShieldRoundedIcon />,
            active: currentView === "membership_guarantors"
          },
          {
            label: "Co-Applicants",
            href: "/dashboard/society?view=membership_coapplicants",
            icon: <ManageAccountsRoundedIcon />,
            active: currentView === "membership_coapplicants"
          },
          {
            label: "Audit Trail",
            href: "/dashboard/society?view=treasury_audit",
            icon: <ReceiptLongRoundedIcon />,
            active: currentView === "treasury_audit"
          }
        ]
      },
      {
        heading: "Banking Services",
        items: [
          {
            label: "Accounts",
            href: "/dashboard/society?view=account_registry",
            icon: <AccountBalanceIcon />,
            active: currentView === "account_registry"
          },
          {
            label: "Plans",
            href: "/dashboard/society?view=plan_catalogue",
            icon: <MapRoundedIcon />,
            active: currentView === "plan_catalogue"
          },
          {
            label: "Ledger",
            href: "/dashboard/society?view=ledger_workspace",
            icon: <HistoryRoundedIcon />,
            active: currentView === "ledger_workspace"
          },
          {
            label: "Locker",
            href: "/dashboard/society?view=locker_workspace",
            icon: <LockRoundedIcon />,
            active: currentView === "locker_workspace"
          }
        ]
      }
    ],
    [currentView]
  );

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
    setActiveDrawer(role === "SUPER_USER" ? "staff" : role === "AGENT" ? "agent" : "client");
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
      await createStaffUser(session.accessToken, {
        fullName: userForm.fullName.trim(),
        username: userForm.username.trim().toLowerCase(),
        password: userForm.password,
        role: userForm.role,
        isActive: userForm.isActive,
        branchId: userForm.branchId || undefined,
        allowedModuleSlugs: normalizeAllowedModules(userForm.role, userForm.allowedModuleSlugs)
      });

      setActiveDrawer(null);
      setUserForm(createEmptyUserForm("SUPER_USER"));
      await hydrateDashboard(false);
      toast.success("User account created.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create the account.");
    } finally {
      setUserSaving(false);
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

  const session = getSession();

  return (
    <DashboardShell
      user={shellUser}
      accountTypeLabel="Society Dashboard"
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: surfaces.background, p: { xs: 1.5, sm: 3 } }}>
        {isLedgerView && session ? (
          <LedgerWorkspace token={session.accessToken} />
        ) : isLockerView && session ? (
          <LockerWorkspace token={session.accessToken} clients={lockerClients} branches={branches} />
        ) : [
            "membership_clients",
            "plan_catalogue",
            "account_registry",
            "share_register",
            "membership_guarantors",
            "membership_coapplicants"
          ].includes(currentView) ? (
          <SocietyOperationsWorkspace view={currentView} branches={branches} agents={agents} />
        ) : (
          <MainAdministrationWorkspace
            view={currentView as AdminView}
            societyForm={societyForm}
            setSocietyForm={setSocietyForm}
            handleUpdateSociety={() => void handleUpdateSociety()}
            handleOpenWorkspace={() => router.push("/dashboard/society?view=directory")}
            formLoading={societySaving}
            branches={branches}
            handleOpenDrawer={handleOpenDrawer}
            handleDeleteBranch={handleDeleteBranch}
            managedUsers={managedUsers}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            handleToggleUserStatus={handleToggleManagedUserStatus}
            setSelectedUserAccess={setSelectedUserAccess}
            transactions={transactions}
            transactionSearch={transactionSearch}
            setTransactionSearch={setTransactionSearch}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            agents={agents}
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
        onClose={() => setActiveDrawer(null)}
        form={userForm}
        setForm={setUserForm}
        onSave={() => void handleSaveUser()}
        loading={userSaving}
        branches={branches}
        updateStaffName={(value) => setUserForm({ ...userForm, fullName: value, username: buildUsername(value) })}
        regeneratePassword={() => setUserForm({ ...userForm, password: createTemporaryPassword() })}
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
