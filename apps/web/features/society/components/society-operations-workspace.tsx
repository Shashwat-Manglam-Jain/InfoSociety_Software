"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Box, 
  CircularProgress, 
  Stack, 
  Typography 
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import { ClientRegistry } from "./operations/ClientRegistry";
import { PlanCatalogue } from "./operations/PlanCatalogue";
import { AccountRegistry } from "./operations/AccountRegistry";
import { ShareRegister } from "./operations/ShareRegister";
import { GuarantorRegistry } from "./operations/GuarantorRegistry";

import { MemberDrawer } from "./operations/drawers/MemberDrawer";
import { MemberDetailDrawer } from "./operations/drawers/MemberDetailDrawer";
import { AccountDrawer } from "./operations/drawers/AccountDrawer";
import { PlanDrawer } from "./operations/drawers/PlanDrawer";
import { ShareholdingDrawer } from "./operations/drawers/ShareholdingDrawer";

import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import {
  createEmptyAccount,
  createEmptyMember,
  createEmptyPlan,
  createEmptyShareholding,
  getNextAccountNumber,
  getNextApplicationNumber,
  getNextClientNumber,
  getNextPlanCode,
  normalizeAgents,
  normalizeBranches,
  planCategoryOptions,
  type AccountRecord,
  type AgentOption,
  type BranchOption,
  type MemberRecord,
  type PlanCategory,
  type PlanRecord,
  type ShareholdingRecord
} from "../lib/society-operations-data";

type SocietyOperationsWorkspaceProps = {
  view: string;
  branches: any[];
  agents: any[];
};

export function SocietyOperationsWorkspace({
  view,
  branches,
  agents
}: SocietyOperationsWorkspaceProps) {
  // --- DESIGN SYSTEM & THEME ---
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  // --- DATA NORMALIZATION ---
  const branchOptions = useMemo<BranchOption[]>(() => normalizeBranches(branches), [branches]);
  const agentOptions = useMemo<AgentOption[]>(() => normalizeAgents(agents), [agents]);

  // --- CORE STATE ---
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [shareholdings, setShareholdings] = useState<ShareholdingRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);

  // --- UI STATE (PAGINATION/SEARCH) ---
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(0);
  const [memberRowsPerPage, setMemberRowsPerPage] = useState(10);

  const [shareSearch, setShareSearch] = useState("");
  const [sharePage, setSharePage] = useState(0);
  const [shareRowsPerPage, setShareRowsPerPage] = useState(10);

  const [planSearch, setPlanSearch] = useState("");
  const [planPage, setPlanPage] = useState(0);
  const [planRowsPerPage, setPlanRowsPerPage] = useState(10);
  const [planTab, setPlanTab] = useState<PlanCategory>("fd");

  const [accountSearch, setAccountSearch] = useState("");
  const [accountPage, setAccountPage] = useState(0);
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(10);

  const [guarantorSearch, setGuarantorSearch] = useState("");
  const [guarantorPage, setGuarantorPage] = useState(0);
  const [guarantorRowsPerPage, setGuarantorRowsPerPage] = useState(10);

  const [coapplicantSearch, setCoapplicantSearch] = useState("");
  const [coapplicantPage, setCoapplicantPage] = useState(0);
  const [coapplicantRowsPerPage, setCoapplicantRowsPerPage] = useState(10);

  const [shareholdingTypeTab, setShareholdingTypeTab] = useState("shareholder");

  // --- DRAWER STATE ---
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberRecord>(createEmptyMember(branchOptions, agentOptions));

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<AccountRecord>(createEmptyAccount(members, plans, branchOptions));

  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<PlanRecord>(createEmptyPlan("fd"));

  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [shareForm, setShareForm] = useState<ShareholdingRecord>(createEmptyShareholding());

  // --- HELPERS ---
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function formatDate(value: string) {
    if (!value) return "-";
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
  }

  // --- HANDLERS ---
  const openNewMember = () => {
    setEditingMemberId(null);
    setMemberForm({
      ...createEmptyMember(branchOptions, agentOptions),
      clientNo: getNextClientNumber(members),
      applicationNo: getNextApplicationNumber(members)
    });
    setMemberDrawerOpen(true);
  };

  const handleSaveMember = () => {
    const memberId = editingMemberId ?? `member-${Math.random().toString(36).slice(2, 9)}`;
    const prepared: MemberRecord = { ...memberForm, id: memberId };
    setMembers((prev) => 
      editingMemberId ? prev.map(m => m.id === editingMemberId ? prepared : m) : [prepared, ...prev]
    );
    setMemberDrawerOpen(false);
  };

  const openNewAccount = () => {
    setEditingAccountId(null);
    setAccountForm(createEmptyAccount(members, plans, branchOptions));
    setAccountDrawerOpen(true);
  };

  const handleSaveAccount = () => {
    const accId = editingAccountId ?? `acc-${Math.random().toString(36).slice(2, 9)}`;
    const prepared: AccountRecord = { ...accountForm, id: accId };
    setAccounts((prev) =>
      editingAccountId ? prev.map(a => a.id === editingAccountId ? prepared : a) : [prepared, ...prev]
    );
    setAccountDrawerOpen(false);
  };

  const openNewPlan = () => {
    setEditingPlanId(null);
    setPlanForm(createEmptyPlan("fd"));
    setPlanDrawerOpen(true);
  };

  const handleSavePlan = () => {
    const pId = editingPlanId ?? `plan-${Math.random().toString(36).slice(2, 9)}`;
    const prepared: PlanRecord = { ...planForm, id: pId };
    setPlans((prev) =>
      editingPlanId ? prev.map(p => p.id === editingPlanId ? prepared : p) : [prepared, ...prev]
    );
    setPlanDrawerOpen(false);
  };

  const openNewShare = () => {
    setEditingShareId(null);
    setShareForm(createEmptyShareholding());
    setShareDrawerOpen(true);
  };

  const handleSaveShare = () => {
    const sId = editingShareId ?? `share-${Math.random().toString(36).slice(2, 9)}`;
    const prepared: ShareholdingRecord = { ...shareForm, id: sId };
    setShareholdings((prev) =>
      editingShareId ? prev.map(s => s.id === editingShareId ? prepared : s) : [prepared, ...prev]
    );
    setShareDrawerOpen(false);
  };

  // --- RENDER ORCHESTRATION ---
  const activeMember = members.find(m => m.id === selectedMemberId) ?? null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh", bgcolor: isDark ? "background.default" : "#f8fafc" }}>
      {view === "membership_clients" && (
        <ClientRegistry 
          members={members} 
          memberSearch={memberSearch} 
          setMemberSearch={setMemberSearch} 
          memberPage={memberPage} 
          setMemberPage={setMemberPage} 
          memberRowsPerPage={memberRowsPerPage} 
          setMemberRowsPerPage={setMemberRowsPerPage} 
          canCreateMembers={branchOptions.length > 0} 
          openCreateMemberDrawer={openNewMember} 
          openMemberDetail={(id) => setSelectedMemberId(id)} 
          formatDate={formatDate} 
        />
      )}

      {view === "plan_catalogue" && (
        <PlanCatalogue 
          plans={plans} 
          planSearch={planSearch} 
          setPlanSearch={setPlanSearch} 
          planTab={planTab}
          setPlanTab={setPlanTab}
          planCategoryOptions={planCategoryOptions}
          openCreatePlanDrawer={openNewPlan} 
          openPlanDrawer={(p: PlanRecord) => { setEditingPlanId(p.id); setPlanForm(p); setPlanDrawerOpen(true); }}
          formatCurrency={formatCurrency}
        />
      )}

      {view === "account_registry" && (
        <AccountRegistry 
          accounts={accounts} 
          accountSearch={accountSearch} 
          setAccountSearch={setAccountSearch} 
          accountPage={accountPage} 
          setAccountPage={setAccountPage} 
          accountRowsPerPage={accountRowsPerPage} 
          setAccountRowsPerPage={setAccountRowsPerPage} 
          canCreateAccounts={members.length > 0 && plans.length > 0} 
          openAccountDrawer={openNewAccount} 
          openAccountDetail={(id: string) => {}} 
          formatCurrency={formatCurrency} 
          formatDate={formatDate} 
          members={members}
          plans={plans}
        />
      )}

      {view === "share_register" && (
        <ShareRegister 
          shareholdings={shareholdings} 
          shareholdingSearch={shareSearch} 
          setShareholdingSearch={setShareSearch} 
          shareholdingPage={sharePage} 
          setShareholdingPage={setSharePage} 
          shareholdingRowsPerPage={shareRowsPerPage} 
          setShareholdingRowsPerPage={setShareRowsPerPage} 
          shareholdingTypeTab={shareholdingTypeTab}
          setShareholdingTypeTab={setShareholdingTypeTab}
          canCreateShareholdings={members.length > 0}
          openShareholdingDrawer={(s?: ShareholdingRecord) => { 
            if (s) {
              setEditingShareId(s.id); 
              setShareForm(s); 
              setShareDrawerOpen(true); 
            } else {
              openNewShare();
            }
          }}
          handleDeleteShareholding={(id: string) => {}}
          formatCurrency={formatCurrency} 
        />
      )}

      {(view === "guarantor_registry" || view === "membership_guarantors") && (
        <GuarantorRegistry 
          type="guarantor"
          rows={[]} 
          search={guarantorSearch}
          setSearch={setGuarantorSearch}
          page={guarantorPage}
          setPage={setGuarantorPage}
          rowsPerPage={guarantorRowsPerPage}
          setRowsPerPage={setGuarantorRowsPerPage}
        />
      )}

      {view === "membership_coapplicants" && (
        <GuarantorRegistry 
          type="coapplicant"
          rows={[]} 
          search={coapplicantSearch}
          setSearch={setCoapplicantSearch}
          page={coapplicantPage}
          setPage={setCoapplicantPage}
          rowsPerPage={coapplicantRowsPerPage}
          setRowsPerPage={setCoapplicantRowsPerPage}
        />
      )}

      {/* --- DRAWERS --- */}
      <MemberDrawer 
        open={memberDrawerOpen} 
        onClose={() => setMemberDrawerOpen(false)} 
        memberForm={memberForm} 
        setMemberForm={setMemberForm} 
        editingMemberId={editingMemberId} 
        branchOptions={branchOptions} 
        agentOptions={agentOptions} 
        onSave={handleSaveMember} 
      />

      <MemberDetailDrawer 
        open={Boolean(selectedMemberId)} 
        onClose={() => setSelectedMemberId(null)} 
        member={activeMember} 
        accounts={accounts} 
        shareholdings={shareholdings} 
        formatCurrency={formatCurrency} 
        formatDate={formatDate} 
        onEditMember={(m) => { setEditingMemberId(m.id); setMemberForm(m); setMemberDrawerOpen(true); }}
        onAddShareholding={openNewShare}
        onEditShareholding={(s) => { setEditingShareId(s.id); setShareForm(s); setShareDrawerOpen(true); }}
        onAddDocument={() => {}} 
        onEditDocument={() => {}} 
      />

      <AccountDrawer 
        open={accountDrawerOpen} 
        onClose={() => setAccountDrawerOpen(false)} 
        accountForm={accountForm} 
        setAccountForm={setAccountForm} 
        editingAccountId={editingAccountId} 
        members={members} 
        plans={plans} 
        onSave={handleSaveAccount} 
        allAccounts={accounts} 
      />

      <PlanDrawer 
        open={planDrawerOpen} 
        onClose={() => setPlanDrawerOpen(false)} 
        planForm={planForm} 
        setPlanForm={setPlanForm} 
        editingPlanId={editingPlanId} 
        onSave={handleSavePlan} 
        allPlans={plans} 
      />

      <ShareholdingDrawer 
        open={shareDrawerOpen} 
        onClose={() => setShareDrawerOpen(false)} 
        shareForm={shareForm} 
        setShareForm={setShareForm} 
        editingShareId={editingShareId} 
        members={members} 
        onSave={handleSaveShare} 
      />
    </Box>
  );
}
