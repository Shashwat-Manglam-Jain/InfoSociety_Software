"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Box, 
  CircularProgress, 
  Container, 
  Stack, 
  Typography,
  Snackbar,
  Alert
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MainAdministrationWorkspace, type AdminView } from "@/features/society/components/administration/MainAdministrationWorkspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { clearSession, getSession } from "@/shared/auth/session";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import type { AuthUser } from "@/shared/types";

import { BranchDrawer } from "@/features/society/components/administration/drawers/BranchDrawer";
import { DirectorDrawer } from "@/features/society/components/administration/drawers/DirectorDrawer";
import { UserProvisioningDrawer } from "@/features/society/components/administration/drawers/UserProvisioningDrawer";
import { AgentDetailDrawer } from "@/features/society/components/administration/drawers/AgentDetailDrawer";
import { ShareholdingAdminDrawer } from "@/features/society/components/administration/drawers/ShareholdingAdminDrawer";

export default function SocietyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") || "master_company") as any;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  // --- SOCIETY DATA ---
  const [society, setSociety] = useState<any>(null);
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

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "SUPER_USER") {
      router.replace("/login");
      return;
    }

    setShellUser({
      id: session.username,
      username: session.username,
      fullName: session.fullName,
      role: "SUPER_USER",
      allowedModuleSlugs: session.allowedModuleSlugs ?? [],
      requiresPasswordChange: session.requiresPasswordChange,
      society: session.societyCode
        ? {
            id: session.societyCode,
            code: session.societyCode,
            name: session.societyCode,
            status: "ACTIVE"
          }
        : null
    });

    // Mock initial data fetch
    setTimeout(() => {
      setBranches([
        { id: "b1", name: "Metro Hub Branch", code: "MH01", city: "Mumbai", state: "Maharashtra", isActive: true },
        { id: "b2", name: "Coastal Hub", code: "CH02", city: "Panaji", state: "Goa", isActive: true }
      ]);
      setAgents([
        { id: "a1", firstName: "Rahul", lastName: "Sharma", code: "AG001", phone: "9876543210", email: "rahul@society.com", branch: { name: "Metro Hub Branch" } }
      ]);
      setLoading(false);
    }, 1000);
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

  if (loading) return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: surfaces.background }}>
      <CircularProgress thickness={5} size={60} />
    </Box>
  );

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
      accessibleModules={[]}
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
            societyForm={{}}
            setSocietyForm={() => {}}
            handleUpdateSociety={() => {}}
            formLoading={false}
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
