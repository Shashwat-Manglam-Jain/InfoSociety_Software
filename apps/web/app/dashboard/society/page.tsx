"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Box, 
  CircularProgress, 
  Typography,
  Snackbar,
  Alert
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MainAdministrationWorkspace, type AdminView } from "@/features/society/components/administration/MainAdministrationWorkspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { modules } from "@/features/banking/module-registry";
import { getAccessibleModules } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";
import { getMe, updateSociety } from "@/shared/api/client";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { AuthUser } from "@/shared/types";
import { toast } from "@/shared/ui/toast";

import { BranchDrawer } from "@/features/society/components/administration/drawers/BranchDrawer";
import { DirectorDrawer } from "@/features/society/components/administration/drawers/DirectorDrawer";
import { UserProvisioningDrawer } from "@/features/society/components/administration/drawers/UserProvisioningDrawer";
import { AgentDetailDrawer } from "@/features/society/components/administration/drawers/AgentDetailDrawer";
import { ShareholdingAdminDrawer } from "@/features/society/components/administration/drawers/ShareholdingAdminDrawer";

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

export default function SocietyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") || "master_company") as any;
  const theme = useTheme();
  const { locale } = useLanguage();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  // --- SOCIETY DATA ---
  const [societyForm, setSocietyForm] = useState<SocietyFormState>(createEmptySocietyForm);
  const [branches, setBranches] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [shareholdings, setShareholdings] = useState<any[]>([]);
  const [shellUser, setShellUser] = useState<AuthUser | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- DRAWER STATES ---
  const [activeDrawer, setActiveDrawer] = useState<any>(null);
  const [branchForm, setBranchForm] = useState<any>({ name: '', code: '', openingDate: new Date().toISOString().split('T')[0], isActive: true });
  const [directorForm, setDirectorForm] = useState<any>({ designation: '', firstName: '', lastName: '', gender: 'MALE', isAuthorizedSignatory: true });
  const [userForm, setUserForm] = useState<any>({ fullName: '', role: 'SUPER_USER', branchId: '', username: '', password: '' });
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [activeShareholdingDrawer, setActiveShareholdingDrawer] = useState<any>(null);
  const [shareholdingForm, setShareholdingForm] = useState<any>({ agentName: '', totalShares: 0, nominalVal: 100, totalValue: 0 });

  // --- SUCCESS FEEDBACK ---
  const [successData, setSuccessData] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const accessibleModules = useMemo(
    () => getAccessibleModules(modules, "SOCIETY", shellUser?.allowedModuleSlugs).map((module) => localizeBankingModule(module, locale)),
    [locale, shellUser?.allowedModuleSlugs]
  );

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session || session.role !== "SUPER_USER") {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getMe(session.accessToken);
        setShellUser(profile);
        setSocietyForm(mapSocietyToForm(profile));
        setBranches([]);
        setDirectors([]);
        setManagedUsers([]);
        setAgents([]);
        setShareholdings([]);
        setError(null);
      } catch (caught) {
        const status = (caught as { status?: number })?.status;
        const message = caught instanceof Error ? caught.message : "Unable to load the society profile.";

        if (status === 401 || status === 403) {
          clearSession();
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [router]);

  // --- HANDLERS ---
  const handleOpenDrawer = (type: any, data?: any) => {
    setActiveDrawer(type);
    if (data) {
       if (type === "branch") setBranchForm(data);
       if (type === "director") setDirectorForm(data);
    }
  };

  const handleUpdateBranch = () => {
    setBranches(prev => branchForm.id ? prev.map(b => b.id === branchForm.id ? branchForm : b) : [...prev, { ...branchForm, id: Math.random().toString(36).slice(-8) }]);
    setActiveDrawer(null);
  };

  const handleUpdateSociety = async () => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setFormLoading(true);

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

      const nextUser = shellUser
        ? {
            ...shellUser,
            society: {
              ...shellUser.society,
              ...updated,
              status: shellUser.society?.status ?? "ACTIVE",
              registrationDate: updated.registrationDate
            }
          }
        : shellUser;

      setShellUser(nextUser);
      setSocietyForm(mapSocietyToForm(nextUser));
      setSuccessData({ label: "Institutional profile updated successfully." });
      toast.success("Institutional profile updated successfully.");
      setError(null);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to update the society profile.";
      setError(message);
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: surfaces.background }}>
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: surfaces.background, p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 640, width: "100%" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const isOperationsView = ["membership_clients", "plan_catalogue", "account_registry", "share_register", "guarantor_registry"].includes(currentView);

  return (
    <DashboardShell
      user={shellUser}
      accountTypeLabel="Society Workspace"
      avatarDataUrl={null}
      onLogout={() => {
        clearSession();
        router.replace("/");
      }}
      accessibleModules={accessibleModules}
    >
      <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh", bgcolor: surfaces.background }}>
        {isOperationsView ? (
          <SocietyOperationsWorkspace 
            view={currentView} 
            branches={branches} 
            agents={agents} 
          />
        ) : (
          <MainAdministrationWorkspace 
            view={currentView}
            societyForm={societyForm}
            setSocietyForm={setSocietyForm}
            handleUpdateSociety={() => void handleUpdateSociety()}
            formLoading={formLoading}
            branches={branches}
            handleOpenDrawer={handleOpenDrawer}
            handleDeleteBranch={() => {}}
            directors={directors}
            handleDeleteDirector={() => {}}
            managedUsers={managedUsers}
            userSearch=""
            setUserSearch={() => {}}
            handleToggleUserStatus={() => {}}
            setSelectedUserAccess={() => {}}
            transactions={[]}
            transactionSearch=""
            setTransactionSearch={() => {}}
            formatCurrency={(v) => `₹${v.toLocaleString()}`}
            formatDate={(v) => v}
            agents={agents}
            agentSearch=""
            setAgentSearch={() => {}}
            agentPage={0}
            setAgentPage={() => {}}
            agentRowsPerPage={10}
            setAgentRowsPerPage={() => {}}
            setEditingAgent={setEditingAgent}
            shareholdings={shareholdings}
            shareholdingSearch=""
            setShareholdingSearch={() => {}}
            shareholdingPage={0}
            setShareholdingPage={() => {}}
            shareholdingRowsPerPage={10}
            setShareholdingRowsPerPage={() => {}}
            setActiveShareholdingDrawer={setActiveShareholdingDrawer}
            setShareholdingForm={setShareholdingForm}
            setEditingShareholding={() => {}}
          />
        )}
      </Box>

      {/* --- ADMINISTRATIVE DRAWERS --- */}
      <BranchDrawer 
        open={activeDrawer === "branch"} 
        onClose={() => setActiveDrawer(null)} 
        form={branchForm} 
        setForm={setBranchForm} 
        onSave={handleUpdateBranch} 
        loading={false} 
      />

      <DirectorDrawer 
        open={activeDrawer === "director"} 
        onClose={() => setActiveDrawer(null)} 
        form={directorForm} 
        setForm={setDirectorForm} 
        onSave={() => {}} 
        loading={false} 
      />

      <UserProvisioningDrawer 
        open={["staff", "agent", "client"].includes(activeDrawer)} 
        onClose={() => setActiveDrawer(null)} 
        form={userForm} 
        setForm={setUserForm} 
        onSave={() => {}} 
        loading={false} 
        branches={branches} 
        agents={agents} 
        updateStaffName={(v) => setUserForm({...userForm, fullName: v, username: v.toLowerCase().replace(/\s/g, '.')})} 
      />

      <AgentDetailDrawer 
        open={Boolean(editingAgent)} 
        onClose={() => setEditingAgent(null)} 
        agent={editingAgent} 
        onSave={(data) => { setAgents(prev => prev.map(a => a.id === data.id ? data : a)); setEditingAgent(null); }} 
      />

      <ShareholdingAdminDrawer 
        open={Boolean(activeShareholdingDrawer)} 
        onClose={() => setActiveShareholdingDrawer(null)} 
        form={shareholdingForm} 
        setForm={setShareholdingForm} 
        onSave={() => {}} 
        agents={agents} 
        mode={activeShareholdingDrawer === "edit" ? "edit" : "create"} 
      />

      <Snackbar open={Boolean(successData)} autoHideDuration={8000} onClose={() => setSuccessData(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
         <Alert severity="success" sx={{ borderRadius: 3, border: "1px solid #10b981", bgcolor: "#fff", color: "#0f172a", minWidth: 400, boxShadow: DESIGN_SYSTEM.SHADOWS.SOFT }}>
            <Typography sx={{ fontWeight: 900 }}>{successData?.label}</Typography>
         </Alert>
      </Snackbar>
    </DashboardShell>
  );
}
