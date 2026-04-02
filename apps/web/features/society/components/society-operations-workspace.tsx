"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import {
  buildLoginUsername,
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
  type MemberDocument,
  type MemberRecord,
  type PlanCategory,
  type PlanRecord,
  type ShareholdingRecord,
  type ShareholdingType
} from "../lib/society-operations-data";

type SocietyOperationsWorkspaceProps = {
  view: string;
  branches: any[];
  agents: any[];
};

type MemberDetailTab =
  | "member"
  | "nominee"
  | "address"
  | "shareholding"
  | "bankaccount"
  | "document"
  | "account"
  | "loan"
  | "login"
  | "guarantor"
  | "kyc";

type KycTab = "pan" | "aadhaar" | "dl" | "verificationlog";

type AccountDetailTab =
  | "interestPayout"
  | "transactions"
  | "statement"
  | "viewPlan"
  | "nominee"
  | "foreclose"
  | "upgradePlan"
  | "upgradeType"
  | "interestAdjust"
  | "tds"
  | "fdBond"
  | "document"
  | "depositLog";

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

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN");
}

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN");
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isBlank(value: string) {
  return !value.trim();
}

function toSearchValue(values: Array<string | number | boolean | undefined | null>) {
  return values
    .map((value) => (value === undefined || value === null ? "" : String(value).toLowerCase()))
    .join(" ");
}

function matchesQuery(query: string, values: Array<string | number | boolean | undefined | null>) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return toSearchValue(values).includes(normalized);
}

function isGeneratedAccountNumber(value: string) {
  return /^(DP|LN)\d+$/i.test(value.trim());
}

function SectionHero({
  icon,
  eyebrow,
  title,
  description,
  actions
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.2, md: 3 },
        borderRadius: 4,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 46%, rgba(59,130,246,0.92) 100%)",
        color: "#fff"
      }}
    >
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} justifyContent="space-between" alignItems={{ lg: "center" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)"
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", letterSpacing: "0.08em" }}>
              {eyebrow}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}>
              {title}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", maxWidth: 820 }}>{description}</Typography>
          </Box>
        </Stack>
        {actions ? <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>{actions}</Stack> : null}
      </Stack>
    </Paper>
  );
}

function MetricCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.3,
        borderRadius: 3,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        height: "100%"
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 900, letterSpacing: "-0.03em" }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.4, color: "text.secondary" }}>
        {caption}
      </Typography>
    </Paper>
  );
}

function StatusChip({ label, tone = "default" }: { label: string; tone?: "success" | "warning" | "error" | "info" | "default" }) {
  const colors = {
    success: { bg: alpha("#10b981", 0.12), color: "#059669" },
    warning: { bg: alpha("#f59e0b", 0.12), color: "#b45309" },
    error: { bg: alpha("#ef4444", 0.12), color: "#dc2626" },
    info: { bg: alpha("#3b82f6", 0.12), color: "#2563eb" },
    default: { bg: "#eef2ff", color: "#475569" }
  }[tone];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 800,
        bgcolor: colors.bg,
        color: colors.color,
        borderRadius: 1.5
      }}
    />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: "0.08em" }}>
      {children}
    </Typography>
  );
}

function TableEmpty({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) {
    return null;
  }

  return <Box sx={{ pt: 2.5 }}>{children}</Box>;
}

export function SocietyOperationsWorkspace({
  view,
  branches,
  agents
}: SocietyOperationsWorkspaceProps) {
  const branchOptions = useMemo<BranchOption[]>(() => normalizeBranches(branches), [branches]);
  const agentOptions = useMemo<AgentOption[]>(() => normalizeAgents(agents), [agents]);

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [shareholdings, setShareholdings] = useState<ShareholdingRecord[]>([]);
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(0);
  const [memberRowsPerPage, setMemberRowsPerPage] = useState(10);
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberRecord>(() => createEmptyMember(branchOptions, agentOptions));
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberDetailTab, setMemberDetailTab] = useState<MemberDetailTab>("member");
  const [kycTab, setKycTab] = useState<KycTab>("pan");
  const [documentDraft, setDocumentDraft] = useState<MemberDocument>({
    id: "",
    type: "Photo",
    name: "",
    documentNumber: "",
    fileLabel: "",
    updatedAt: new Date().toISOString().split("T")[0],
    status: "Pending"
  });
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  const [shareholdingSearch, setShareholdingSearch] = useState("");
  const [shareholdingPage, setShareholdingPage] = useState(0);
  const [shareholdingRowsPerPage, setShareholdingRowsPerPage] = useState(10);
  const [shareholdingTypeTab, setShareholdingTypeTab] = useState<ShareholdingType>("shareholder");
  const [shareholdingDrawerOpen, setShareholdingDrawerOpen] = useState(false);
  const [editingShareholdingId, setEditingShareholdingId] = useState<string | null>(null);
  const [shareholdingForm, setShareholdingForm] = useState<ShareholdingRecord>(() => createEmptyShareholding());

  const [guarantorSearch, setGuarantorSearch] = useState("");
  const [guarantorPage, setGuarantorPage] = useState(0);
  const [guarantorRowsPerPage, setGuarantorRowsPerPage] = useState(10);

  const [coApplicantSearch, setCoApplicantSearch] = useState("");
  const [coApplicantPage, setCoApplicantPage] = useState(0);
  const [coApplicantRowsPerPage, setCoApplicantRowsPerPage] = useState(10);

  const [planSearch, setPlanSearch] = useState("");
  const [planPage, setPlanPage] = useState(0);
  const [planRowsPerPage, setPlanRowsPerPage] = useState(10);
  const [planTab, setPlanTab] = useState<PlanCategory>("fd");
  const [planDrawerOpen, setPlanDrawerOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<PlanRecord>(() => createEmptyPlan("fd"));

  const [accountSearch, setAccountSearch] = useState("");
  const [accountPage, setAccountPage] = useState(0);
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(10);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<AccountRecord>(() => createEmptyAccount([], [], branchOptions));
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [accountDetailTab, setAccountDetailTab] = useState<AccountDetailTab>("interestPayout");
  const [accountNomineeDraft, setAccountNomineeDraft] = useState({ nominee: "", nomineeRelation: "" });
  const [accountPlanUpgradeDraft, setAccountPlanUpgradeDraft] = useState("");
  const [accountTypeDraft, setAccountTypeDraft] = useState("");
  const [interestAdjustmentAmount, setInterestAdjustmentAmount] = useState(0);
  const [interestAdjustmentNote, setInterestAdjustmentNote] = useState("");

  useEffect(() => {
    setMemberPage(0);
  }, [memberSearch]);

  useEffect(() => {
    setShareholdingPage(0);
  }, [shareholdingSearch, shareholdingTypeTab]);

  useEffect(() => {
    setGuarantorPage(0);
  }, [guarantorSearch]);

  useEffect(() => {
    setCoApplicantPage(0);
  }, [coApplicantSearch]);

  useEffect(() => {
    setPlanPage(0);
  }, [planSearch, planTab]);

  useEffect(() => {
    setAccountPage(0);
  }, [accountSearch]);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId]
  );

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    setAccountNomineeDraft({
      nominee: selectedAccount.nominee,
      nomineeRelation: selectedAccount.nomineeRelation
    });
    setAccountPlanUpgradeDraft(selectedAccount.planName);
    setAccountTypeDraft(selectedAccount.accountType);
  }, [selectedAccount]);

  const clientRows = useMemo(
    () =>
      members.filter((member) =>
        matchesQuery(memberSearch, [
          member.branch,
          member.clientNo,
          member.applicationNo,
          member.annualIncomeRange,
          member.name,
          member.fatherName,
          member.motherName,
          member.occupation,
          member.nomineeName,
          member.nomineeRelation,
          member.nomineeAddress,
          member.correspondingAddress,
          member.permanentAddress,
          member.permanentCity,
          member.permanentState
        ])
      ),
    [members, memberSearch]
  );

  const shareholdingRows = useMemo(
    () =>
      shareholdings.filter(
        (entry) =>
          entry.shareholderType === shareholdingTypeTab &&
          matchesQuery(shareholdingSearch, [
            entry.memberName,
            entry.agent,
            entry.shareRange,
            entry.totalShareHold,
            entry.totalShareVal
          ])
      ),
    [shareholdingSearch, shareholdingTypeTab, shareholdings]
  );

  const guarantorRows = useMemo(
    () =>
      members
        .flatMap((member) =>
          member.guarantorLoans.map((loan) => ({
            memberName: member.name,
            branch: member.branch,
            ...loan
          }))
        )
        .filter((row) =>
          matchesQuery(guarantorSearch, [
            row.memberName,
            row.branch,
            row.purpose,
            row.accountNo,
            row.accountType,
            row.planName,
            row.status
          ])
        ),
    [guarantorSearch, members]
  );

  const coApplicantRows = useMemo(
    () =>
      members
        .flatMap((member) =>
          member.coApplicants.map((coApplicant) => ({
            memberName: member.name,
            branch: member.branch,
            ...coApplicant
          }))
        )
        .filter((row) =>
          matchesQuery(coApplicantSearch, [
            row.memberName,
            row.branch,
            row.name,
            row.relation,
            row.phone,
            row.linkedAccountNo,
            row.status
          ])
        ),
    [coApplicantSearch, members]
  );

  const planRows = useMemo(
    () =>
      plans.filter(
        (plan) =>
          plan.category === planTab &&
          matchesQuery(planSearch, [
            plan.planCode,
            plan.planName,
            plan.minAmount,
            plan.tenure,
            plan.lockInPeriod,
            plan.interestLockInPeriod,
            plan.annualInterestRate,
            plan.seniorCitizen
          ])
      ),
    [plans, planSearch, planTab]
  );

  const accountRows = useMemo(
    () =>
      accounts.filter((account) =>
        matchesQuery(accountSearch, [
          account.accountNo,
          account.memberName,
          account.branch,
          account.agent,
          account.planName,
          account.accountType,
          account.status,
          account.nominee
        ])
      ),
    [accountSearch, accounts]
  );

  const selectedMemberShareholdings = useMemo(
    () => shareholdings.filter((entry) => entry.memberId === selectedMember?.id),
    [selectedMember, shareholdings]
  );

  const selectedMemberAccounts = useMemo(
    () => accounts.filter((account) => account.memberId === selectedMember?.id),
    [accounts, selectedMember]
  );

  const selectedAccountPlan = useMemo(
    () => plans.find((plan) => plan.planName === selectedAccount?.planName) ?? null,
    [plans, selectedAccount]
  );

  const hasBranchSetup = branchOptions.length > 0;
  const hasAgentSetup = agentOptions.length > 0;
  const canCreateMembers = hasBranchSetup;
  const canCreateShareholdings = members.length > 0;
  const canCreateAccounts = members.length > 0 && plans.length > 0;
  const shouldUseAgentDirectory = memberForm.memberSourceType === "Agent" && agentOptions.length > 0;

  const memberFormInvalid =
    !memberForm.branchId || isBlank(memberForm.name) || isBlank(memberForm.memberSourceName);

  const shareholdingFormInvalid =
    !shareholdingForm.memberId ||
    isBlank(shareholdingForm.shareRange) ||
    Number(shareholdingForm.totalShareHold) <= 0 ||
    Number(shareholdingForm.nominalVal) <= 0;

  const planFormInvalid =
    isBlank(planForm.planCode) ||
    isBlank(planForm.planName) ||
    !Number.isFinite(Number(planForm.minAmount)) ||
    Number(planForm.minAmount) < 0;

  const accountFormInvalid =
    !accountForm.memberId ||
    !accountForm.branchId ||
    isBlank(accountForm.planName) ||
    Number(accountForm.amount) <= 0 ||
    !accountForm.openDate;

  function syncMemberBranch(branchId: string) {
    const branch = branchOptions.find((entry) => entry.id === branchId) ?? branchOptions[0];

    setMemberForm((prev) => ({
      ...prev,
      branchId: branch?.id ?? branchId,
      branch: branch?.name ?? prev.branch,
      permanentCity: branch?.city ?? "",
      permanentState: branch?.state ?? "",
      bankAccounts: prev.bankAccounts.length
        ? prev.bankAccounts.map((account, index) =>
            index === 0 ? { ...account, branch: branch?.name ?? account.branch } : account
          )
        : [
            {
              id: "bank-new-1",
              bankName: "",
              branch: branch?.name ?? "",
              accountType: "Savings",
              accountNumber: "",
              ifsc: "",
              status: "Primary"
            }
          ]
    }));
  }

  function openCreateMemberDrawer() {
    if (!canCreateMembers) {
      return;
    }

    setEditingMemberId(null);
    setMemberForm({
      ...createEmptyMember(branchOptions, agentOptions),
      clientNo: getNextClientNumber(members),
      applicationNo: getNextApplicationNumber(members)
    });
    setMemberDrawerOpen(true);
  }

  function openEditMemberDrawer(member: MemberRecord) {
    setEditingMemberId(member.id);
    setMemberForm(structuredClone(member));
    setMemberDrawerOpen(true);
  }

  function openMemberDetail(memberId: string) {
    setSelectedMemberId(memberId);
    setMemberDetailTab("member");
    setKycTab("pan");
    setEditingDocumentId(null);
    setDocumentDraft({
      id: "",
      type: "Photo",
      name: "",
      documentNumber: "",
      fileLabel: "",
      updatedAt: new Date().toISOString().split("T")[0],
      status: "Pending"
    });
  }

  function handleSaveMember() {
    if (memberFormInvalid) {
      return;
    }

    const branch = branchOptions.find((entry) => entry.id === memberForm.branchId) ?? branchOptions[0];
    const memberId = editingMemberId ?? makeId("member");
    const normalizedName = memberForm.name.trim();
    const preparedMember: MemberRecord = {
      ...memberForm,
      id: memberId,
      name: normalizedName,
      branch: branch?.name ?? memberForm.branch,
      clientNo: memberForm.clientNo || getNextClientNumber(members),
      applicationNo: memberForm.applicationNo || getNextApplicationNumber(members),
      memberSourceName: memberForm.memberSourceName.trim(),
      loginDetails: {
        ...memberForm.loginDetails,
        username: buildLoginUsername(normalizedName) || memberForm.loginDetails.username
      },
      bankAccounts: memberForm.bankAccounts.length
        ? memberForm.bankAccounts
        : createEmptyMember(branchOptions, agentOptions).bankAccounts
    };

    setMembers((prev) =>
      editingMemberId ? prev.map((entry) => (entry.id === editingMemberId ? preparedMember : entry)) : [preparedMember, ...prev]
    );

    setShareholdings((prev) =>
      prev.map((entry) =>
        entry.memberId === memberId
          ? { ...entry, memberName: preparedMember.name, agent: preparedMember.memberSourceName }
          : entry
      )
    );

    setAccounts((prev) =>
      prev.map((entry) =>
        entry.memberId === memberId
          ? {
              ...entry,
              memberName: preparedMember.name,
              branchId: preparedMember.branchId,
              branch: preparedMember.branch,
              agent: preparedMember.memberSourceName,
              nominee: preparedMember.nomineeName,
              nomineeRelation: preparedMember.nomineeRelation
            }
          : entry
      )
    );

    setMemberDrawerOpen(false);
  }

  function toggleMembershipFee(memberId: string) {
    setMembers((prev) =>
      prev.map((entry) =>
        entry.id === memberId
          ? { ...entry, membershipFeeCollected: !entry.membershipFeeCollected }
          : entry
      )
    );
  }

  function handleSaveMemberDocument() {
    if (!selectedMember) {
      return;
    }

    const documentToSave = {
      ...documentDraft,
      id: editingDocumentId ?? makeId("doc"),
      updatedAt: documentDraft.updatedAt || new Date().toISOString().split("T")[0]
    };

    setMembers((prev) =>
      prev.map((member) => {
        if (member.id !== selectedMember.id) {
          return member;
        }

        const nextDocuments = editingDocumentId
          ? member.documents.map((entry) => (entry.id === editingDocumentId ? documentToSave : entry))
          : [documentToSave, ...member.documents];

        return {
          ...member,
          documents: nextDocuments
        };
      })
    );

    setEditingDocumentId(null);
    setDocumentDraft({
      id: "",
      type: "Photo",
      name: "",
      documentNumber: "",
      fileLabel: "",
      updatedAt: new Date().toISOString().split("T")[0],
      status: "Pending"
    });
  }

  function openShareholdingDrawer(record?: ShareholdingRecord) {
    if (!record && !canCreateShareholdings) {
      return;
    }

    if (record) {
      setEditingShareholdingId(record.id);
      setShareholdingForm(structuredClone(record));
    } else {
      setEditingShareholdingId(null);
      setShareholdingForm(
        createEmptyShareholding(selectedMember?.id ?? "", selectedMember?.name ?? "", selectedMember?.memberSourceName ?? "")
      );
    }
    setShareholdingDrawerOpen(true);
  }

  function handleSaveShareholding() {
    if (shareholdingFormInvalid) {
      return;
    }

    const member = members.find((entry) => entry.id === shareholdingForm.memberId) ?? selectedMember;

    const recordToSave: ShareholdingRecord = {
      ...shareholdingForm,
      id: editingShareholdingId ?? makeId("share"),
      memberName: member?.name ?? shareholdingForm.memberName,
      agent: member?.memberSourceName ?? shareholdingForm.agent,
      totalShareVal: Number(shareholdingForm.totalShareHold) * Number(shareholdingForm.nominalVal)
    };

    setShareholdings((prev) =>
      editingShareholdingId
        ? prev.map((entry) => (entry.id === editingShareholdingId ? recordToSave : entry))
        : [recordToSave, ...prev]
    );

    setShareholdingDrawerOpen(false);
  }

  function handleDeleteShareholding(id: string) {
    if (!window.confirm("Delete this share holding record?")) {
      return;
    }

    setShareholdings((prev) => prev.filter((entry) => entry.id !== id));
  }

  function openPlanDrawer(record?: PlanRecord) {
    if (record) {
      setEditingPlanId(record.id);
      setPlanForm(structuredClone(record));
    } else {
      setEditingPlanId(null);
      setPlanForm({
        ...createEmptyPlan(planTab),
        planCode: getNextPlanCode(plans, planTab)
      });
    }
    setPlanDrawerOpen(true);
  }

  function syncPlanCategory(category: PlanCategory) {
    const nextTemplate = createEmptyPlan(category);
    setPlanForm((prev) => {
      const previousTemplate = createEmptyPlan(prev.category);
      return {
        ...prev,
        category,
        planCode: editingPlanId ? prev.planCode : getNextPlanCode(plans, category),
        planName: !prev.planName.trim() || prev.planName === previousTemplate.planName ? nextTemplate.planName : prev.planName
      };
    });
  }

  function handleSavePlan() {
    if (planFormInvalid) {
      return;
    }

    const previousPlan = editingPlanId ? plans.find((entry) => entry.id === editingPlanId) : null;
    const recordToSave = {
      ...planForm,
      planCode: editingPlanId ? planForm.planCode : getNextPlanCode(plans, planForm.category),
      id: editingPlanId ?? makeId("plan")
    };

    setPlans((prev) =>
      editingPlanId ? prev.map((entry) => (entry.id === editingPlanId ? recordToSave : entry)) : [recordToSave, ...prev]
    );

    if (previousPlan) {
      setAccounts((prev) =>
        prev.map((entry) =>
          entry.planName === previousPlan.planName
            ? {
                ...entry,
                planName: recordToSave.planName,
                planCategory: recordToSave.category,
                accountType: recordToSave.category.includes("loan") ? "Loan Account" : "Deposit Account"
              }
            : entry
        )
      );
    }

    setPlanTab(recordToSave.category);
    setPlanDrawerOpen(false);
  }

  function handleDeletePlan(id: string) {
    if (!window.confirm("Delete this plan?")) {
      return;
    }

    setPlans((prev) => prev.filter((entry) => entry.id !== id));
  }

  function syncAccountMember(memberId: string) {
    const member = members.find((entry) => entry.id === memberId);

    if (!member) {
      return;
    }

    setAccountForm((prev) => ({
      ...prev,
      memberId: member.id,
      memberName: member.name,
      branchId: member.branchId,
      branch: member.branch,
      agent: member.memberSourceName,
      nominee: member.nomineeName,
      nomineeRelation: member.nomineeRelation
    }));
  }

  function syncAccountPlan(planName: string) {
    const plan = plans.find((entry) => entry.planName === planName);

    if (!plan) {
      return;
    }

    setAccountForm((prev) => ({
      ...prev,
      planName,
      planCategory: plan.category,
      amount: prev.amount > 0 ? prev.amount : plan.minAmount,
      accountNo:
        editingAccountId || (prev.accountNo && !isGeneratedAccountNumber(prev.accountNo))
          ? prev.accountNo
          : getNextAccountNumber(accounts, plan.category),
      accountType: plan.category.includes("loan") ? "Loan Account" : "Deposit Account"
    }));
  }

  function openAccountDrawer(record?: AccountRecord) {
    if (!record && !canCreateAccounts) {
      return;
    }

    if (record) {
      setEditingAccountId(record.id);
      setAccountForm(structuredClone(record));
    } else {
      setEditingAccountId(null);
      const nextDraft = createEmptyAccount(members, plans, branchOptions);
      setAccountForm({
        ...nextDraft,
        accountNo: getNextAccountNumber(accounts, nextDraft.planCategory)
      });
    }
    setAccountDrawerOpen(true);
  }

  function handleSaveAccount() {
    if (accountFormInvalid) {
      return;
    }

    const member = members.find((entry) => entry.id === accountForm.memberId);
    const branch = branchOptions.find((entry) => entry.id === accountForm.branchId) ?? branchOptions[0];
    const plan = plans.find((entry) => entry.planName === accountForm.planName);
    const accountNo =
      accountForm.accountNo ||
      getNextAccountNumber(accounts, plan?.category ?? accountForm.planCategory);

    const recordToSave: AccountRecord = {
      ...accountForm,
      id: editingAccountId ?? makeId("account"),
      memberName: member?.name ?? accountForm.memberName,
      branchId: branch?.id ?? accountForm.branchId,
      branch: branch?.name ?? accountForm.branch,
      agent: member?.memberSourceName ?? accountForm.agent,
      nominee: accountForm.nominee || member?.nomineeName || "",
      nomineeRelation: accountForm.nomineeRelation || member?.nomineeRelation || "",
      accountNo,
      planCategory: plan?.category ?? accountForm.planCategory,
      accountType: plan?.category.includes("loan") ? "Loan Account" : accountForm.accountType
    };

    setAccounts((prev) =>
      editingAccountId ? prev.map((entry) => (entry.id === editingAccountId ? recordToSave : entry)) : [recordToSave, ...prev]
    );

    setAccountDrawerOpen(false);
  }

  function openAccountDetail(accountId: string) {
    setSelectedAccountId(accountId);
    setAccountDetailTab("interestPayout");
  }

  function handleSaveAccountNominee() {
    if (!selectedAccount) {
      return;
    }

    setAccounts((prev) =>
      prev.map((entry) =>
        entry.id === selectedAccount.id
          ? {
              ...entry,
              nominee: accountNomineeDraft.nominee,
              nomineeRelation: accountNomineeDraft.nomineeRelation
            }
          : entry
      )
    );
  }

  function handleUpgradePlan() {
    if (!selectedAccount) {
      return;
    }

    const nextPlan = plans.find((entry) => entry.planName === accountPlanUpgradeDraft);

    if (!nextPlan) {
      return;
    }

    setAccounts((prev) =>
      prev.map((entry) =>
        entry.id === selectedAccount.id
          ? {
              ...entry,
              planName: nextPlan.planName,
              planCategory: nextPlan.category,
              accountType: nextPlan.category.includes("loan") ? "Loan Account" : "Deposit Account",
              depositLogs: [
                {
                  id: makeId("dlog"),
                  date: new Date().toISOString().split("T")[0],
                  event: "Plan upgraded",
                  actor: "Dashboard User",
                  remark: `Plan upgraded to ${nextPlan.planName}.`
                },
                ...entry.depositLogs
              ]
            }
          : entry
      )
    );
  }

  function handleUpgradeAccountType() {
    if (!selectedAccount) {
      return;
    }

    setAccounts((prev) =>
      prev.map((entry) =>
        entry.id === selectedAccount.id
          ? {
              ...entry,
              accountType: accountTypeDraft
            }
          : entry
      )
    );
  }

  function handleForecloseAccount() {
    if (!selectedAccount) {
      return;
    }

    setAccounts((prev) =>
      prev.map((entry) =>
        entry.id === selectedAccount.id
          ? {
              ...entry,
              status: "Foreclosed",
              accountOnHold: true,
              depositLogs: [
                {
                  id: makeId("dlog"),
                  date: new Date().toISOString().split("T")[0],
                  event: "Account foreclosed",
                  actor: "Dashboard User",
                  remark: "Foreclosure action initiated from account detail drawer."
                },
                ...entry.depositLogs
              ]
            }
          : entry
      )
    );
  }

  function handlePostInterestAdjustment() {
    if (!selectedAccount || !interestAdjustmentAmount) {
      return;
    }

    setAccounts((prev) =>
      prev.map((entry) =>
        entry.id === selectedAccount.id
          ? {
              ...entry,
              closingBalance: entry.closingBalance + interestAdjustmentAmount,
              interestPayouts: [
                {
                  id: makeId("interest"),
                  date: new Date().toISOString().split("T")[0],
                  mode: "Manual Adjustment",
                  amount: interestAdjustmentAmount,
                  note: interestAdjustmentNote || "Interest adjustment posted from dashboard."
                },
                ...entry.interestPayouts
              ],
              depositLogs: [
                {
                  id: makeId("dlog"),
                  date: new Date().toISOString().split("T")[0],
                  event: "Interest adjusted",
                  actor: "Dashboard User",
                  remark: interestAdjustmentNote || "Manual interest adjustment posted."
                },
                ...entry.depositLogs
              ]
            }
          : entry
      )
    );

    setInterestAdjustmentAmount(0);
    setInterestAdjustmentNote("");
  }

  const clientMetrics = [
    {
      label: "Total Clients",
      value: String(members.length),
      caption: "Members visible in the society member registry."
    },
    {
      label: "Fees Collected",
      value: String(members.filter((member) => member.membershipFeeCollected).length),
      caption: "Members whose membership fee is already collected."
    },
    {
      label: "Pending KYC",
      value: String(
        members.filter((member) => !member.kyc.aadhaar.verified || !member.kyc.dl.verified).length
      ),
      caption: "Profiles that still need KYC completion."
    },
    {
      label: "Linked Accounts",
      value: String(accounts.length),
      caption: "Accounts already mapped to these members."
    }
  ];

  const shareholdingMetrics = [
    {
      label: "Share Holders",
      value: String(shareholdings.filter((entry) => entry.shareholderType === "shareholder").length),
      caption: "Allotted member share lots."
    },
    {
      label: "Share Transferees",
      value: String(shareholdings.filter((entry) => entry.shareholderType === "shareTransferee").length),
      caption: "Transferred share movement rows."
    },
    {
      label: "Total Units",
      value: String(shareholdings.reduce((sum, entry) => sum + entry.totalShareHold, 0)),
      caption: "Aggregate share units across the registry."
    },
    {
      label: "Total Value",
      value: formatCurrency(shareholdings.reduce((sum, entry) => sum + entry.totalShareVal, 0)),
      caption: "Nominal value represented by all share rows."
    }
  ];

  const planMetrics = [
    {
      label: "Active Plans",
      value: String(plans.length),
      caption: "Configured deposit and loan plan templates."
    },
    {
      label: "Current Category",
      value: String(planRows.length),
      caption: "Visible plan rows in the selected category."
    },
    {
      label: "Highest Rate",
      value: `${Math.max(0, ...plans.map((plan) => plan.annualInterestRate)).toFixed(2)}%`,
      caption: "Top annual interest rate across configured plans."
    },
    {
      label: "Senior Citizen Enabled",
      value: String(plans.filter((plan) => plan.seniorCitizen === "Yes").length),
      caption: "Plans that carry senior citizen eligibility."
    }
  ];

  const accountMetrics = [
    {
      label: "All Accounts",
      value: String(accounts.length),
      caption: "Deposit and loan accounts visible in this workspace."
    },
    {
      label: "On Hold",
      value: String(accounts.filter((account) => account.accountOnHold).length),
      caption: "Accounts currently kept on hold."
    },
    {
      label: "Auto Renew",
      value: String(accounts.filter((account) => account.autoRenew).length),
      caption: "Accounts configured for automatic renewal."
    },
    {
      label: "Portfolio Balance",
      value: formatCurrency(accounts.reduce((sum, account) => sum + account.closingBalance, 0)),
      caption: "Closing balance total from all visible accounts."
    }
  ];

  function renderClientView() {
    return (
      <Stack spacing={3}>
        <SectionHero
          icon={<GroupsRoundedIcon />}
          eyebrow="Member"
          title="Client Registry"
          description="Search, create, edit, and drill into each member with nominee, address, share holding, bank account, document, account, loan, login, guarantor, and KYC sections."
          actions={
            <>
              <TextField
                size="small"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search client, nominee, branch, application..."
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff"
                  }
                }}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreateMemberDrawer}
                disabled={!canCreateMembers}
                sx={{
                  bgcolor: "#fff",
                  color: "#0f172a",
                  borderRadius: 2.5,
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#e2e8f0" }
                }}
              >
                Create Client
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          {clientMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>

        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Client creation includes branch, agent or employee or advisor reference, member information, KYC details, bank account details, correspondence address, address GPS location, and nominee information.
        </Alert>

        {!hasBranchSetup ? (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            Create at least one branch before adding clients.
          </Alert>
        ) : null}

        {!hasAgentSetup ? (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            No agent or staff profiles are available yet. Source assignment can still be entered manually while creating clients.
          </Alert>
        ) : null}

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
          <TableContainer>
            <Table sx={{ minWidth: 1880 }}>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  {[
                    "Branch",
                    "Client No",
                    "Application No",
                    "Annual Income Range",
                    "Name",
                    "Father Name",
                    "Mother Name",
                    "Occupation",
                    "Nominee Name",
                    "Nominee Relation",
                    "Nominee Address",
                    "Nominee Aadhaar No",
                    "Nominee Voter ID",
                    "Nominee PAN ID",
                    "Nominee Mobile No",
                    "Nominee Ration No",
                    "Corresponding Address",
                    "Correspondence Longitude",
                    "Permanent Address",
                    "Permanent City",
                    "Permanent State",
                    "Action"
                  ].map((label) => (
                    <TableCell key={label} sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!clientRows.length ? (
                  <TableEmpty colSpan={22} label="No client records matched the current search." />
                ) : (
                  clientRows
                    .slice(memberPage * memberRowsPerPage, memberPage * memberRowsPerPage + memberRowsPerPage)
                    .map((member) => (
                      <TableRow
                        key={member.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => openMemberDetail(member.id)}
                      >
                        <TableCell>{member.branch}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{member.clientNo}</TableCell>
                        <TableCell>{member.applicationNo}</TableCell>
                        <TableCell>{member.annualIncomeRange}</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{member.name}</TableCell>
                        <TableCell>{member.fatherName}</TableCell>
                        <TableCell>{member.motherName}</TableCell>
                        <TableCell>{member.occupation}</TableCell>
                        <TableCell>{member.nomineeName}</TableCell>
                        <TableCell>{member.nomineeRelation}</TableCell>
                        <TableCell>{member.nomineeAddress}</TableCell>
                        <TableCell>{member.nomineeAadhaarNo}</TableCell>
                        <TableCell>{member.nomineeVoterId}</TableCell>
                        <TableCell>{member.nomineePanId}</TableCell>
                        <TableCell>{member.nomineeMobileNo}</TableCell>
                        <TableCell>{member.nomineeRationNo}</TableCell>
                        <TableCell>{member.correspondingAddress}</TableCell>
                        <TableCell>{member.correspondenceLongitude}</TableCell>
                        <TableCell>{member.permanentAddress}</TableCell>
                        <TableCell>{member.permanentCity}</TableCell>
                        <TableCell>{member.permanentState}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <StatusChip
                              label={member.membershipFeeCollected ? "Collected" : "Not Collected"}
                              tone={member.membershipFeeCollected ? "success" : "warning"}
                            />
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditMemberDrawer(member);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <Button
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleMembershipFee(member.id);
                              }}
                              sx={{ minWidth: "auto", px: 1.2, fontWeight: 800 }}
                            >
                              Toggle Fee
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={clientRows.length}
            page={memberPage}
            onPageChange={(_, page) => setMemberPage(page)}
            rowsPerPage={memberRowsPerPage}
            onRowsPerPageChange={(event) => setMemberRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Stack>
    );
  }

  function renderShareholdingView() {
    return (
      <Stack spacing={3}>
        <SectionHero
          icon={<SavingsRoundedIcon />}
          eyebrow="Member"
          title="Share Register"
          description="Manage share holder and share transferee records with allotment, transfer, value, and date tracking."
          actions={
            <>
              <TextField
                size="small"
                value={shareholdingSearch}
                onChange={(event) => setShareholdingSearch(event.target.value)}
                placeholder="Search member, agent, share range..."
                sx={{
                  minWidth: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff"
                  }
                }}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => openShareholdingDrawer()}
                disabled={!canCreateShareholdings}
                sx={{
                  bgcolor: "#fff",
                  color: "#0f172a",
                  borderRadius: 2.5,
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#e2e8f0" }
                }}
              >
                Add Share Holding
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          {shareholdingMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
          {!canCreateShareholdings ? (
            <Alert severity="info" sx={{ m: 2, borderRadius: 3 }}>
              Add at least one client before creating share holder or share transferee rows.
            </Alert>
          ) : null}
          <Tabs
            value={shareholdingTypeTab}
            onChange={(_, value) => setShareholdingTypeTab(value)}
            sx={{ px: 2, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}
          >
            <Tab label="Share Holder" value="shareholder" />
            <Tab label="Share Transferee" value="shareTransferee" />
          </Tabs>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Share Range</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Total Share Hold
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Nominal Val
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Total Share Val
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Allotted Date</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Transfer Date</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!shareholdingRows.length ? (
                  <TableEmpty colSpan={9} label="No share holding records matched the current view." />
                ) : (
                  shareholdingRows
                    .slice(
                      shareholdingPage * shareholdingRowsPerPage,
                      shareholdingPage * shareholdingRowsPerPage + shareholdingRowsPerPage
                    )
                    .map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{entry.memberName}</TableCell>
                        <TableCell>{entry.agent}</TableCell>
                        <TableCell>{entry.shareRange}</TableCell>
                        <TableCell align="right">{entry.totalShareHold}</TableCell>
                        <TableCell align="right">{formatCurrency(entry.nominalVal)}</TableCell>
                        <TableCell align="right">{formatCurrency(entry.totalShareVal)}</TableCell>
                        <TableCell>{formatDate(entry.allottedDate)}</TableCell>
                        <TableCell>{formatDate(entry.transferDate)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={() => openShareholdingDrawer(entry)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteShareholding(entry.id)}>
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={shareholdingRows.length}
            page={shareholdingPage}
            onPageChange={(_, page) => setShareholdingPage(page)}
            rowsPerPage={shareholdingRowsPerPage}
            onRowsPerPageChange={(event) => setShareholdingRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Stack>
    );
  }

  function renderGuarantorView() {
    return (
      <Stack spacing={3}>
        <SectionHero
          icon={<ShieldRoundedIcon />}
          eyebrow="Member"
          title="Guarantors"
          description="Review guarantor-linked loan rows including purpose, amount, account number, dates, rate of interest, plan, status, and closing balance."
          actions={
            <TextField
              size="small"
              value={guarantorSearch}
              onChange={(event) => setGuarantorSearch(event.target.value)}
              placeholder="Search member, plan, loan account..."
              sx={{
                minWidth: { xs: "100%", sm: 280 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
              }}
            />
          }
        />

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Loan On What Given</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    How Much
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Account Type</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Account Open Date</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Closing Date</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Rate Of Interest</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Plan Name</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Closing Balance
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!guarantorRows.length ? (
                  <TableEmpty colSpan={11} label="No guarantor rows matched the current search." />
                ) : (
                  guarantorRows
                    .slice(guarantorPage * guarantorRowsPerPage, guarantorPage * guarantorRowsPerPage + guarantorRowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{row.memberName}</TableCell>
                        <TableCell>{row.purpose}</TableCell>
                        <TableCell align="right">{formatCurrency(row.sanctionedAmount)}</TableCell>
                        <TableCell>{row.accountNo}</TableCell>
                        <TableCell>{row.accountType}</TableCell>
                        <TableCell>{formatDate(row.accountOpenDate)}</TableCell>
                        <TableCell>{formatDate(row.closingDate)}</TableCell>
                        <TableCell>{row.rateOfInterest}%</TableCell>
                        <TableCell>{row.planName}</TableCell>
                        <TableCell>
                          <StatusChip label={row.status} tone={row.status === "Live" ? "success" : "warning"} />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(row.closingBalance)}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={guarantorRows.length}
            page={guarantorPage}
            onPageChange={(_, page) => setGuarantorPage(page)}
            rowsPerPage={guarantorRowsPerPage}
            onRowsPerPageChange={(event) => setGuarantorRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Stack>
    );
  }

  function renderCoApplicantView() {
    return (
      <Stack spacing={3}>
        <SectionHero
          icon={<GroupAddRoundedIcon />}
          eyebrow="Member"
          title="Co-Applicants"
          description="Track linked co-applicant information in a searchable and paginated table."
          actions={
            <TextField
              size="small"
              value={coApplicantSearch}
              onChange={(event) => setCoApplicantSearch(event.target.value)}
              placeholder="Search co-applicant, member, relation..."
              sx={{
                minWidth: { xs: "100%", sm: 280 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff"
                }
              }}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
              }}
            />
          }
        />

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Co-Applicant</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Relation</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Linked Account</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!coApplicantRows.length ? (
                  <TableEmpty colSpan={7} label="No co-applicant rows matched the current search." />
                ) : (
                  coApplicantRows
                    .slice(
                      coApplicantPage * coApplicantRowsPerPage,
                      coApplicantPage * coApplicantRowsPerPage + coApplicantRowsPerPage
                    )
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{row.memberName}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.relation}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{row.linkedAccountNo}</TableCell>
                        <TableCell>
                          <StatusChip label={row.status} tone={row.status === "Verified" ? "success" : "warning"} />
                        </TableCell>
                        <TableCell>{row.address}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={coApplicantRows.length}
            page={coApplicantPage}
            onPageChange={(_, page) => setCoApplicantPage(page)}
            rowsPerPage={coApplicantRowsPerPage}
            onRowsPerPageChange={(event) => setCoApplicantRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Stack>
    );
  }

  function renderPlanView() {
    return (
      <Stack spacing={3}>
        <SectionHero
          icon={<VerifiedUserRoundedIcon />}
          eyebrow="Plan"
          title="Plans"
          description="Manage FD, DD, RD, MIS, gold loan, vehicle loan, group loan, personal loan, and property loan plans with search, pagination, edit, and delete."
          actions={
            <>
              <TextField
                size="small"
                value={planSearch}
                onChange={(event) => setPlanSearch(event.target.value)}
                placeholder="Search plan code, plan name..."
                sx={{
                  minWidth: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff"
                  }
                }}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => openPlanDrawer()}
                sx={{
                  bgcolor: "#fff",
                  color: "#0f172a",
                  borderRadius: 2.5,
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#e2e8f0" }
                }}
              >
                Create Plan
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          {planMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
          <Tabs
            value={planTab}
            onChange={(_, value) => {
              setPlanTab(value);
              setPlanForm({
                ...createEmptyPlan(value),
                planCode: getNextPlanCode(plans, value)
              });
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}
          >
            {planCategoryOptions.map((option) => (
              <Tab key={option.value} label={option.label} value={option.value} />
            ))}
          </Tabs>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Plan Code</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Plan Name</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Min Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Tenure</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Lock In Period</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Interest Lockin Period</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Annual Interest Rate</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Senior Citizen</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!planRows.length ? (
                  <TableEmpty colSpan={9} label="No plans matched the selected category and search." />
                ) : (
                  planRows
                    .slice(planPage * planRowsPerPage, planPage * planRowsPerPage + planRowsPerPage)
                    .map((plan) => (
                      <TableRow key={plan.id} hover>
                        <TableCell sx={{ fontWeight: 800 }}>{plan.planCode}</TableCell>
                        <TableCell>{plan.planName}</TableCell>
                        <TableCell align="right">{formatCurrency(plan.minAmount)}</TableCell>
                        <TableCell>{plan.tenure}</TableCell>
                        <TableCell>{plan.lockInPeriod}</TableCell>
                        <TableCell>{plan.interestLockInPeriod}</TableCell>
                        <TableCell>{plan.annualInterestRate}%</TableCell>
                        <TableCell>{plan.seniorCitizen}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={() => openPlanDrawer(plan)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeletePlan(plan.id)}>
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={planRows.length}
            page={planPage}
            onPageChange={(_, page) => setPlanPage(page)}
            rowsPerPage={planRowsPerPage}
            onRowsPerPageChange={(event) => setPlanRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Stack>
    );
  }

  function renderAccountView() {
    return (
      <Stack spacing={3}>
        <SectionHero
          icon={<PaymentsRoundedIcon />}
          eyebrow="Account"
          title="Account Registry"
          description="View all accounts, create new ones, and open detailed account actions including interest payout, transactions, statement, plan, nominee updates, foreclose, upgrades, TDS, FD bond, document, and deposit log."
          actions={
            <>
              <TextField
                size="small"
                value={accountSearch}
                onChange={(event) => setAccountSearch(event.target.value)}
                placeholder="Search member, account, plan..."
                sx={{
                  minWidth: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff"
                  }
                }}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.72)" }} />
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => openAccountDrawer()}
                disabled={!canCreateAccounts}
                sx={{
                  bgcolor: "#fff",
                  color: "#0f172a",
                  borderRadius: 2.5,
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#e2e8f0" }
                }}
              >
                Create Account
              </Button>
            </>
          }
        />

        <Grid container spacing={2}>
          {accountMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>

        {!members.length ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Create a client before opening accounts.
          </Alert>
        ) : null}

        {members.length > 0 && !plans.length ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Create at least one plan before opening accounts.
          </Alert>
        ) : null}

        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Branch</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Plan Name</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Open Date</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Closing Balance
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!accountRows.length ? (
                  <TableEmpty colSpan={10} label="No accounts matched the current search." />
                ) : (
                  accountRows
                    .slice(accountPage * accountRowsPerPage, accountPage * accountRowsPerPage + accountRowsPerPage)
                    .map((account) => (
                      <TableRow
                        key={account.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => openAccountDetail(account.id)}
                      >
                        <TableCell sx={{ fontWeight: 800 }}>{account.accountNo}</TableCell>
                        <TableCell>{account.memberName}</TableCell>
                        <TableCell>{account.branch}</TableCell>
                        <TableCell>{account.agent}</TableCell>
                        <TableCell>{account.planName}</TableCell>
                        <TableCell align="right">{formatCurrency(account.amount)}</TableCell>
                        <TableCell>{formatDate(account.openDate)}</TableCell>
                        <TableCell>
                          <StatusChip
                            label={account.status}
                            tone={
                              account.status === "Active"
                                ? "success"
                                : account.status === "On Hold"
                                  ? "warning"
                                  : "info"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(account.closingBalance)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                openAccountDetail(account.id);
                              }}
                            >
                              <VisibilityRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                openAccountDrawer(account);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={accountRows.length}
            page={accountPage}
            onPageChange={(_, page) => setAccountPage(page)}
            rowsPerPage={accountRowsPerPage}
            onRowsPerPageChange={(event) => setAccountRowsPerPage(parseInt(event.target.value, 10))}
          />
        </Paper>
      </Stack>
    );
  }

  function renderView() {
    switch (view) {
      case "membership_clients":
        return renderClientView();
      case "membership_shareholding":
        return renderShareholdingView();
      case "membership_guarantors":
        return renderGuarantorView();
      case "membership_coapplicants":
        return renderCoApplicantView();
      case "plan_catalogue":
        return renderPlanView();
      case "account_registry":
        return renderAccountView();
      default:
        return null;
    }
  }

  return (
    <>
      {renderView()}

      <Drawer
        anchor="right"
        open={memberDrawerOpen}
        onClose={() => setMemberDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 760 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, bgcolor: alpha("#8b5cf6", 0.06), borderBottom: "1px solid rgba(139, 92, 246, 0.12)", position: "relative" }}>
            <IconButton onClick={() => setMemberDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {editingMemberId ? "Edit Client" : "Create Client"}
            </Typography>
            <Typography color="text.secondary">
              Use existing branch and agent records where possible. Member IDs, application IDs, and KYC status stay organized automatically.
            </Typography>
          </Box>

          <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
            <Stack spacing={3}>
              <Box>
                <FieldLabel>BRANCH AND SOURCE</FieldLabel>
                <Grid container spacing={2} sx={{ mt: 0.2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Branch"
                      value={memberForm.branchId}
                      onChange={(event) => syncMemberBranch(event.target.value)}
                    >
                      {branchOptions.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      label="Agent / Employee / Advisor"
                      value={memberForm.memberSourceType}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          memberSourceType: event.target.value,
                          memberSourceName:
                            event.target.value === "Agent" && agentOptions.length
                              ? agentOptions[0]?.name ?? prev.memberSourceName
                              : prev.memberSourceType === "Agent"
                                ? ""
                                : prev.memberSourceName
                        }))
                      }
                    >
                      {["Agent", "Employee", "Advisor"].map((source) => (
                        <MenuItem key={source} value={source}>
                          {source}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    {shouldUseAgentDirectory ? (
                      <TextField
                        select
                        fullWidth
                        label="Assigned Agent"
                        value={memberForm.memberSourceName}
                        onChange={(event) =>
                          setMemberForm((prev) => ({
                            ...prev,
                            memberSourceName: event.target.value
                          }))
                        }
                      >
                        {agentOptions.map((agent) => (
                          <MenuItem key={agent.id} value={agent.name}>
                            {agent.name} ({agent.code})
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        fullWidth
                        label={`${memberForm.memberSourceType} Name`}
                        value={memberForm.memberSourceName}
                        onChange={(event) =>
                          setMemberForm((prev) => ({
                            ...prev,
                            memberSourceName: event.target.value
                          }))
                        }
                      />
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <FieldLabel>MEMBER INFORMATION</FieldLabel>
                <Grid container spacing={2} sx={{ mt: 0.2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Client Name"
                      value={memberForm.name}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          name: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Client Number"
                      value={memberForm.clientNo}
                      InputProps={{ readOnly: true }}
                      helperText="Generated automatically"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Application Number"
                      value={memberForm.applicationNo}
                      InputProps={{ readOnly: true }}
                      helperText="Generated automatically"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Father Name"
                      value={memberForm.fatherName}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          fatherName: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Mother Name"
                      value={memberForm.motherName}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          motherName: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Occupation"
                      value={memberForm.occupation}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          occupation: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="DOB"
                      value={memberForm.dob}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          dob: event.target.value
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      select
                      fullWidth
                      label="Gender"
                      value={memberForm.gender}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          gender: event.target.value
                        }))
                      }
                    >
                      {["Male", "Female", "Other"].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Mobile No"
                      value={memberForm.mobileNo}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          mobileNo: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={memberForm.email}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          email: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Annual Income Range"
                      value={memberForm.annualIncomeRange}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          annualIncomeRange: event.target.value
                        }))
                      }
                    >
                      {["0-3 Lakh", "3-6 Lakh", "6-10 Lakh", "10-15 Lakh", "15+ Lakh"].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={memberForm.membershipStatus}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          membershipStatus: event.target.value
                        }))
                      }
                    >
                      {["Active", "Pending Verification", "Suspended"].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Membership Fee"
                      value={memberForm.membershipFeeCollected ? "Collected" : "Not Collected"}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          membershipFeeCollected: event.target.value === "Collected"
                        }))
                      }
                    >
                      <MenuItem value="Collected">Collected</MenuItem>
                      <MenuItem value="Not Collected">Not Collected</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <FieldLabel>KYC DETAILS</FieldLabel>
                <Grid container spacing={2} sx={{ mt: 0.2 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="PAN Number"
                      value={memberForm.kyc.pan.number}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            pan: { ...prev.kyc.pan, number: event.target.value }
                          }
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="PAN Verified"
                      value={memberForm.kyc.pan.verified ? "Yes" : "No"}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            pan: {
                              ...prev.kyc.pan,
                              verified: event.target.value === "Yes",
                              verifiedOn: event.target.value === "Yes" ? prev.kyc.pan.verifiedOn || new Date().toISOString().split("T")[0] : ""
                            }
                          }
                        }))
                      }
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      type="date"
                      fullWidth
                      label="PAN Verified On"
                      value={memberForm.kyc.pan.verifiedOn}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            pan: { ...prev.kyc.pan, verifiedOn: event.target.value }
                          }
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Aadhaar Number"
                      value={memberForm.kyc.aadhaar.number}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            aadhaar: { ...prev.kyc.aadhaar, number: event.target.value }
                          }
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Aadhaar Verified"
                      value={memberForm.kyc.aadhaar.verified ? "Yes" : "No"}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            aadhaar: {
                              ...prev.kyc.aadhaar,
                              verified: event.target.value === "Yes",
                              verifiedOn: event.target.value === "Yes" ? prev.kyc.aadhaar.verifiedOn || new Date().toISOString().split("T")[0] : ""
                            }
                          }
                        }))
                      }
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Aadhaar Verified On"
                      value={memberForm.kyc.aadhaar.verifiedOn}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            aadhaar: { ...prev.kyc.aadhaar, verifiedOn: event.target.value }
                          }
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Driving Licence Number"
                      value={memberForm.kyc.dl.number}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            dl: { ...prev.kyc.dl, number: event.target.value }
                          }
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Driving Licence Verified"
                      value={memberForm.kyc.dl.verified ? "Yes" : "No"}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            dl: {
                              ...prev.kyc.dl,
                              verified: event.target.value === "Yes",
                              verifiedOn: event.target.value === "Yes" ? prev.kyc.dl.verifiedOn || new Date().toISOString().split("T")[0] : ""
                            }
                          }
                        }))
                      }
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      type="date"
                      fullWidth
                      label="Driving Licence Verified On"
                      value={memberForm.kyc.dl.verifiedOn}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          kyc: {
                            ...prev.kyc,
                            dl: { ...prev.kyc.dl, verifiedOn: event.target.value }
                          }
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <FieldLabel>BANK ACCOUNT DETAILS</FieldLabel>
                <Grid container spacing={2} sx={{ mt: 0.2 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={memberForm.bankAccounts[0]?.bankName ?? ""}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          bankAccounts: prev.bankAccounts.map((account, index) =>
                            index === 0 ? { ...account, bankName: event.target.value } : account
                          )
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={memberForm.bankAccounts[0]?.accountNumber ?? ""}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          bankAccounts: prev.bankAccounts.map((account, index) =>
                            index === 0 ? { ...account, accountNumber: event.target.value } : account
                          )
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="IFSC"
                      value={memberForm.bankAccounts[0]?.ifsc ?? ""}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          bankAccounts: prev.bankAccounts.map((account, index) =>
                            index === 0 ? { ...account, ifsc: event.target.value } : account
                          )
                        }))
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <FieldLabel>CORRESPONDENCE ADDRESS AND GPS LOCATION</FieldLabel>
                <Grid container spacing={2} sx={{ mt: 0.2 }}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Correspondence Address"
                      value={memberForm.correspondingAddress}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          correspondingAddress: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      value={memberForm.correspondenceLatitude}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          correspondenceLatitude: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      value={memberForm.correspondenceLongitude}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          correspondenceLongitude: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Permanent Pincode"
                      value={memberForm.permanentPincode}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          permanentPincode: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Permanent Address"
                      value={memberForm.permanentAddress}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          permanentAddress: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Permanent City"
                      value={memberForm.permanentCity}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          permanentCity: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Permanent State"
                      value={memberForm.permanentState}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          permanentState: event.target.value
                        }))
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <FieldLabel>NOMINEE INFORMATION</FieldLabel>
                <Grid container spacing={2} sx={{ mt: 0.2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Nominee Name"
                      value={memberForm.nomineeName}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeName: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Nominee Relation"
                      value={memberForm.nomineeRelation}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeRelation: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Nominee Address"
                      value={memberForm.nomineeAddress}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeAddress: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Nominee Aadhaar No"
                      value={memberForm.nomineeAadhaarNo}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeAadhaarNo: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Nominee Voter ID"
                      value={memberForm.nomineeVoterId}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeVoterId: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Nominee PAN ID"
                      value={memberForm.nomineePanId}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineePanId: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Nominee Mobile No"
                      value={memberForm.nomineeMobileNo}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeMobileNo: event.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Nominee Ration No"
                      value={memberForm.nomineeRationNo}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          nomineeRationNo: event.target.value
                        }))
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleSaveMember}
                disabled={memberFormInvalid}
                sx={{ py: 1.8, borderRadius: 3, fontWeight: 900, bgcolor: "#8b5cf6" }}
              >
                {editingMemberId ? "Update Client" : "Create Client"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={Boolean(selectedMember)}
        onClose={() => setSelectedMemberId(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 820 }, borderRadius: "24px 0 0 24px" } }}
      >
        {selectedMember ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
              <IconButton onClick={() => setSelectedMemberId(null)} sx={{ position: "absolute", right: 16, top: 16, color: "#fff" }}>
                <CloseRoundedIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {selectedMember.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }} useFlexGap>
                <Chip label={selectedMember.clientNo} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip label={selectedMember.applicationNo} sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <Chip
                  label={selectedMember.membershipFeeCollected ? "Fee Collected" : "Fee Pending"}
                  sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}
                />
              </Stack>
            </Box>

            <Tabs
              value={memberDetailTab}
              onChange={(_, value) => setMemberDetailTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}
            >
              <Tab value="member" label="Member" />
              <Tab value="nominee" label="Nominee" />
              <Tab value="address" label="Address" />
              <Tab value="shareholding" label="Share Register" />
              <Tab value="bankaccount" label="Bank Details" />
              <Tab value="document" label="Documents" />
              <Tab value="account" label="Accounts" />
              <Tab value="loan" label="Loans" />
              <Tab value="login" label="Login" />
              <Tab value="guarantor" label="Guarantor" />
              <Tab value="kyc" label="KYC" />
            </Tabs>

            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <TabPanel active={memberDetailTab === "member"}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Branch" value={selectedMember.branch} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Annual Income Range" value={selectedMember.annualIncomeRange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Occupation" value={selectedMember.occupation} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Joined On" value={formatDate(selectedMember.joinedOn)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Agent / Employee / Advisor" value={`${selectedMember.memberSourceType}: ${selectedMember.memberSourceName}`} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Status" value={selectedMember.membershipStatus} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Father Name" value={selectedMember.fatherName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Mother Name" value={selectedMember.motherName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Mobile" value={selectedMember.mobileNo} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Email" value={selectedMember.email} />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel active={memberDetailTab === "nominee"}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Nominee Name" value={selectedMember.nomineeName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Relation" value={selectedMember.nomineeRelation} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <InfoPair label="Address" value={selectedMember.nomineeAddress} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <InfoPair label="Aadhaar No" value={selectedMember.nomineeAadhaarNo} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <InfoPair label="Voter ID" value={selectedMember.nomineeVoterId} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <InfoPair label="PAN ID" value={selectedMember.nomineePanId} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <InfoPair label="Mobile No" value={selectedMember.nomineeMobileNo} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <InfoPair label="Ration No" value={selectedMember.nomineeRationNo} />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel active={memberDetailTab === "address"}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <InfoPair label="Correspondence Address" value={selectedMember.correspondingAddress} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="GPS Latitude" value={selectedMember.correspondenceLatitude} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="GPS Longitude" value={selectedMember.correspondenceLongitude} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <InfoPair label="Permanent Address" value={selectedMember.permanentAddress} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoPair label="City" value={selectedMember.permanentCity} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoPair label="State" value={selectedMember.permanentState} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <InfoPair label="Pincode" value={selectedMember.permanentPincode} />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel active={memberDetailTab === "shareholding"}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Share Holding
                    </Typography>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openShareholdingDrawer()} sx={{ borderRadius: 2 }}>
                      Add Share Holding
                    </Button>
                  </Stack>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#f8fafc" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Share Range</TableCell>
                          <TableCell sx={{ fontWeight: 900 }} align="right">
                            Total Share Hold
                          </TableCell>
                          <TableCell sx={{ fontWeight: 900 }} align="right">
                            Nominal Val
                          </TableCell>
                          <TableCell sx={{ fontWeight: 900 }} align="right">
                            Total Share Val
                          </TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Allotted Date</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Transfer Date</TableCell>
                          <TableCell sx={{ fontWeight: 900 }} align="right">
                            Edit
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!selectedMemberShareholdings.length ? (
                          <TableEmpty colSpan={8} label="No share holding rows are linked to this member yet." />
                        ) : (
                          selectedMemberShareholdings.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{entry.shareholderType === "shareholder" ? "Share Holder" : "Share Transferee"}</TableCell>
                              <TableCell>{entry.shareRange}</TableCell>
                              <TableCell align="right">{entry.totalShareHold}</TableCell>
                              <TableCell align="right">{formatCurrency(entry.nominalVal)}</TableCell>
                              <TableCell align="right">{formatCurrency(entry.totalShareVal)}</TableCell>
                              <TableCell>{formatDate(entry.allottedDate)}</TableCell>
                              <TableCell>{formatDate(entry.transferDate)}</TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => openShareholdingDrawer(entry)}>
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </TabPanel>

              <TabPanel active={memberDetailTab === "bankaccount"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Bank Name</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Branch</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account Type</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account Number</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>IFSC</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedMember.bankAccounts.length ? (
                        <TableEmpty colSpan={6} label="No bank account details captured yet." />
                      ) : (
                        selectedMember.bankAccounts.map((bankAccount) => (
                          <TableRow key={bankAccount.id}>
                            <TableCell sx={{ fontWeight: 800 }}>{bankAccount.bankName}</TableCell>
                            <TableCell>{bankAccount.branch}</TableCell>
                            <TableCell>{bankAccount.accountType}</TableCell>
                            <TableCell>{bankAccount.accountNumber}</TableCell>
                            <TableCell>{bankAccount.ifsc}</TableCell>
                            <TableCell>{bankAccount.status}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={memberDetailTab === "document"}>
                <Stack spacing={2}>
                  <Paper elevation={0} sx={{ p: 2.4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                      Add Photo Or Other Document
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          select
                          fullWidth
                          label="Type"
                          value={documentDraft.type}
                          onChange={(event) =>
                            setDocumentDraft((prev) => ({
                              ...prev,
                              type: event.target.value as MemberDocument["type"]
                            }))
                          }
                        >
                          <MenuItem value="Photo">Photo</MenuItem>
                          <MenuItem value="Document">Other Document</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Document Name"
                          value={documentDraft.name}
                          onChange={(event) =>
                            setDocumentDraft((prev) => ({
                              ...prev,
                              name: event.target.value
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          label="Document No"
                          value={documentDraft.documentNumber}
                          onChange={(event) =>
                            setDocumentDraft((prev) => ({
                              ...prev,
                              documentNumber: event.target.value
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          fullWidth
                          label="File Label"
                          value={documentDraft.fileLabel}
                          onChange={(event) =>
                            setDocumentDraft((prev) => ({
                              ...prev,
                              fileLabel: event.target.value
                            }))
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                          select
                          fullWidth
                          label="Status"
                          value={documentDraft.status}
                          onChange={(event) =>
                            setDocumentDraft((prev) => ({
                              ...prev,
                              status: event.target.value as MemberDocument["status"]
                            }))
                          }
                        >
                          {["Pending", "Verified", "Needs Review"].map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="contained" onClick={handleSaveMemberDocument} sx={{ borderRadius: 2 }}>
                        {editingDocumentId ? "Update Document" : "Add Document"}
                      </Button>
                      {editingDocumentId ? (
                        <Button
                          variant="text"
                          onClick={() => {
                            setEditingDocumentId(null);
                            setDocumentDraft({
                              id: "",
                              type: "Photo",
                              name: "",
                              documentNumber: "",
                              fileLabel: "",
                              updatedAt: new Date().toISOString().split("T")[0],
                              status: "Pending"
                            });
                          }}
                        >
                          Cancel Edit
                        </Button>
                      ) : null}
                    </Stack>
                  </Paper>

                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#f8fafc" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Document No</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>File Label</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Updated At</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 900 }} align="right">
                            Edit
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!selectedMember.documents.length ? (
                          <TableEmpty colSpan={7} label="No documents have been added yet." />
                        ) : (
                          selectedMember.documents.map((document) => (
                            <TableRow key={document.id}>
                              <TableCell>{document.type}</TableCell>
                              <TableCell sx={{ fontWeight: 800 }}>{document.name}</TableCell>
                              <TableCell>{document.documentNumber}</TableCell>
                              <TableCell>{document.fileLabel}</TableCell>
                              <TableCell>{formatDate(document.updatedAt)}</TableCell>
                              <TableCell>{document.status}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingDocumentId(document.id);
                                    setDocumentDraft(structuredClone(document));
                                  }}
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </TabPanel>

              <TabPanel active={memberDetailTab === "account"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account Type</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Plan Name</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Open Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedMemberAccounts.length ? (
                        <TableEmpty colSpan={6} label="This member has no account rows yet." />
                      ) : (
                        selectedMemberAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell sx={{ fontWeight: 800 }}>{account.accountNo}</TableCell>
                            <TableCell>{account.accountType}</TableCell>
                            <TableCell>{account.planName}</TableCell>
                            <TableCell align="right">{formatCurrency(account.amount)}</TableCell>
                            <TableCell>{formatDate(account.openDate)}</TableCell>
                            <TableCell>{account.status}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={memberDetailTab === "loan"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Loan On What Given</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          How Much
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account Type</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Open Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Closing Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Rate Of Interest</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Plan Name</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Closing Balance
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedMember.loanAccounts.length ? (
                        <TableEmpty colSpan={10} label="No loan account details captured for this member." />
                      ) : (
                        selectedMember.loanAccounts.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell sx={{ fontWeight: 800 }}>{loan.purpose}</TableCell>
                            <TableCell align="right">{formatCurrency(loan.sanctionedAmount)}</TableCell>
                            <TableCell>{loan.accountNo}</TableCell>
                            <TableCell>{loan.accountType}</TableCell>
                            <TableCell>{formatDate(loan.accountOpenDate)}</TableCell>
                            <TableCell>{formatDate(loan.closingDate)}</TableCell>
                            <TableCell>{loan.rateOfInterest}%</TableCell>
                            <TableCell>{loan.planName}</TableCell>
                            <TableCell>{loan.status}</TableCell>
                            <TableCell align="right">{formatCurrency(loan.closingBalance)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={memberDetailTab === "login"}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Username" value={selectedMember.loginDetails.username} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Role" value={selectedMember.loginDetails.role} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Status" value={selectedMember.loginDetails.status} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Password Updated At" value={selectedMember.loginDetails.passwordUpdatedAt} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <InfoPair label="Last Login" value={selectedMember.loginDetails.lastLogin} />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel active={memberDetailTab === "guarantor"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Loan On What Given</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          How Much
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account Type</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Account Open Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Closing Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Rate Of Interest</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Plan Name</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Closing Balance
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedMember.guarantorLoans.length ? (
                        <TableEmpty colSpan={10} label="No guarantor rows are linked to this member." />
                      ) : (
                        selectedMember.guarantorLoans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell sx={{ fontWeight: 800 }}>{loan.purpose}</TableCell>
                            <TableCell align="right">{formatCurrency(loan.sanctionedAmount)}</TableCell>
                            <TableCell>{loan.accountNo}</TableCell>
                            <TableCell>{loan.accountType}</TableCell>
                            <TableCell>{formatDate(loan.accountOpenDate)}</TableCell>
                            <TableCell>{formatDate(loan.closingDate)}</TableCell>
                            <TableCell>{loan.rateOfInterest}%</TableCell>
                            <TableCell>{loan.planName}</TableCell>
                            <TableCell>{loan.status}</TableCell>
                            <TableCell align="right">{formatCurrency(loan.closingBalance)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={memberDetailTab === "kyc"}>
                <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
                  <Tabs
                    value={kycTab}
                    onChange={(_, value) => setKycTab(value)}
                    sx={{ px: 2, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}
                  >
                    <Tab label="PAN" value="pan" />
                    <Tab label="Aadhaar" value="aadhaar" />
                    <Tab label="DL" value="dl" />
                    <Tab label="Verification Log" value="verificationlog" />
                  </Tabs>

                  <Box sx={{ p: 2.5 }}>
                    <TabPanel active={kycTab === "pan"}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="PAN Number" value={selectedMember.kyc.pan.number} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Verified" value={selectedMember.kyc.pan.verified ? "Yes" : "No"} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Verified On" value={selectedMember.kyc.pan.verifiedOn} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <InfoPair label="Remark" value={selectedMember.kyc.pan.remark} />
                        </Grid>
                      </Grid>
                    </TabPanel>

                    <TabPanel active={kycTab === "aadhaar"}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Aadhaar Number" value={selectedMember.kyc.aadhaar.number} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Verified" value={selectedMember.kyc.aadhaar.verified ? "Yes" : "No"} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Verified On" value={selectedMember.kyc.aadhaar.verifiedOn} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <InfoPair label="Remark" value={selectedMember.kyc.aadhaar.remark} />
                        </Grid>
                      </Grid>
                    </TabPanel>

                    <TabPanel active={kycTab === "dl"}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="DL Number" value={selectedMember.kyc.dl.number} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Verified" value={selectedMember.kyc.dl.verified ? "Yes" : "No"} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <InfoPair label="Verified On" value={selectedMember.kyc.dl.verifiedOn} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <InfoPair label="Remark" value={selectedMember.kyc.dl.remark} />
                        </Grid>
                      </Grid>
                    </TabPanel>

                    <TabPanel active={kycTab === "verificationlog"}>
                      <TableContainer>
                        <Table>
                          <TableHead sx={{ bgcolor: "#f8fafc" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 900 }}>Action</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>Performed By</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>Performed At</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>Remark</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {!selectedMember.kyc.verificationLogs.length ? (
                              <TableEmpty colSpan={4} label="No verification logs available." />
                            ) : (
                              selectedMember.kyc.verificationLogs.map((log) => (
                                <TableRow key={log.id}>
                                  <TableCell sx={{ fontWeight: 800 }}>{log.action}</TableCell>
                                  <TableCell>{log.performedBy}</TableCell>
                                  <TableCell>{formatDateTime(log.performedAt)}</TableCell>
                                  <TableCell>{log.remark}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  </Box>
                </Paper>
              </TabPanel>
            </Box>
          </Box>
        ) : null}
      </Drawer>

      <Drawer
        anchor="right"
        open={shareholdingDrawerOpen}
        onClose={() => setShareholdingDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 560 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setShareholdingDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingShareholdingId ? "Edit Share Holding" : "Add Share Holding"}
          </Typography>
        </Box>
        <Box sx={{ p: 3, overflowY: "auto" }}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Member"
              value={shareholdingForm.memberId}
              onChange={(event) => {
                const member = members.find((entry) => entry.id === event.target.value);
                setShareholdingForm((prev) => ({
                  ...prev,
                  memberId: event.target.value,
                  memberName: member?.name ?? prev.memberName,
                  agent: member?.memberSourceName ?? prev.agent
                }));
              }}
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Type"
              value={shareholdingForm.shareholderType}
              onChange={(event) =>
                setShareholdingForm((prev) => ({
                  ...prev,
                  shareholderType: event.target.value as ShareholdingType
                }))
              }
            >
              <MenuItem value="shareholder">Share Holder</MenuItem>
              <MenuItem value="shareTransferee">Share Transferee</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Agent"
              value={shareholdingForm.agent}
              onChange={(event) =>
                setShareholdingForm((prev) => ({
                  ...prev,
                  agent: event.target.value
                }))
              }
            />
            <TextField
              fullWidth
              label="Share Range"
              value={shareholdingForm.shareRange}
              onChange={(event) =>
                setShareholdingForm((prev) => ({
                  ...prev,
                  shareRange: event.target.value
                }))
              }
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Total Share Hold"
                  value={shareholdingForm.totalShareHold}
                  onChange={(event) =>
                    setShareholdingForm((prev) => ({
                      ...prev,
                      totalShareHold: Number(event.target.value),
                      totalShareVal: Number(event.target.value) * Number(prev.nominalVal)
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Nominal Val"
                  value={shareholdingForm.nominalVal}
                  onChange={(event) =>
                    setShareholdingForm((prev) => ({
                      ...prev,
                      nominalVal: Number(event.target.value),
                      totalShareVal: Number(prev.totalShareHold) * Number(event.target.value)
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField fullWidth label="Total Share Val" value={shareholdingForm.totalShareVal} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Allotted Date"
                  value={shareholdingForm.allottedDate}
                  onChange={(event) =>
                    setShareholdingForm((prev) => ({
                      ...prev,
                      allottedDate: event.target.value
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Transfer Date"
                  value={shareholdingForm.transferDate}
                  onChange={(event) =>
                    setShareholdingForm((prev) => ({
                      ...prev,
                      transferDate: event.target.value
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={handleSaveShareholding}
              disabled={shareholdingFormInvalid}
              sx={{ py: 1.7, borderRadius: 2.5, fontWeight: 900 }}
            >
              {editingShareholdingId ? "Update Share Holding" : "Save Share Holding"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={planDrawerOpen}
        onClose={() => setPlanDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 520 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setPlanDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingPlanId ? "Edit Plan" : "Create Plan"}
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Plan Category"
              value={planForm.category}
              onChange={(event) => syncPlanCategory(event.target.value as PlanCategory)}
            >
              {planCategoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Plan Code"
              value={planForm.planCode}
              InputProps={{ readOnly: true }}
              helperText="Generated automatically"
            />
            <TextField
              fullWidth
              label="Plan Name"
              value={planForm.planName}
              onChange={(event) => setPlanForm((prev) => ({ ...prev, planName: event.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Min Amount"
                  value={planForm.minAmount}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, minAmount: Number(event.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Tenure"
                  value={planForm.tenure}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, tenure: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Lock In Period"
                  value={planForm.lockInPeriod}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, lockInPeriod: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Interest Lockin Period"
                  value={planForm.interestLockInPeriod}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, interestLockInPeriod: event.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Annual Interest Rate"
                  value={planForm.annualInterestRate}
                  onChange={(event) =>
                    setPlanForm((prev) => ({ ...prev, annualInterestRate: Number(event.target.value) }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Senior Citizen"
                  value={planForm.seniorCitizen}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, seniorCitizen: event.target.value }))}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={handleSavePlan}
              disabled={planFormInvalid}
              sx={{ py: 1.7, borderRadius: 2.5, fontWeight: 900 }}
            >
              {editingPlanId ? "Update Plan" : "Save Plan"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 760 }, borderRadius: "24px 0 0 24px" } }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
          <IconButton onClick={() => setAccountDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {editingAccountId ? "Edit Account" : "Create Account"}
          </Typography>
        </Box>
        <Box sx={{ p: 3, overflowY: "auto" }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Member"
                value={accountForm.memberId}
                onChange={(event) => syncAccountMember(event.target.value)}
              >
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Branch"
                value={accountForm.branchId}
                InputProps={{ readOnly: true }}
                helperText="Filled from the selected member"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Agent"
                value={accountForm.agent}
                InputProps={{ readOnly: true }}
                helperText="Filled from the selected member"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Plan Name"
                value={accountForm.planName}
                onChange={(event) => syncAccountPlan(event.target.value)}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.planName}>
                    {plan.planName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Minor"
                value={accountForm.minor ? "Yes" : "No"}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, minor: event.target.value === "Yes" }))}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                type="number"
                fullWidth
                label="Amount"
                value={accountForm.amount}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, amount: Number(event.target.value) }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                type="date"
                fullWidth
                label="Open Date"
                value={accountForm.openDate}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, openDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Account Number"
                value={accountForm.accountNo}
                InputProps={{ readOnly: true }}
                helperText="Generated automatically"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Auto Renew"
                value={accountForm.autoRenew ? "Yes" : "No"}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, autoRenew: event.target.value === "Yes" }))}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Joint Account"
                value={accountForm.jointAccount ? "Yes" : "No"}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, jointAccount: event.target.value === "Yes" }))}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Account On Hold"
                value={accountForm.accountOnHold ? "Yes" : "No"}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    accountOnHold: event.target.value === "Yes"
                  }))
                }
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Senior Citizen"
                value={accountForm.seniorCitizen ? "Yes" : "No"}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    seniorCitizen: event.target.value === "Yes"
                  }))
                }
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="date"
                fullWidth
                label="Amount Transaction Date"
                value={accountForm.amountTransactionDate}
                onChange={(event) =>
                  setAccountForm((prev) => ({ ...prev, amountTransactionDate: event.target.value }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nominee"
                value={accountForm.nominee}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, nominee: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nominee Relation"
                value={accountForm.nomineeRelation}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, nomineeRelation: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Payment Note"
                value={accountForm.paymentNote}
                onChange={(event) => setAccountForm((prev) => ({ ...prev, paymentNote: event.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handleSaveAccount}
                disabled={accountFormInvalid}
                sx={{ py: 1.7, borderRadius: 2.5, fontWeight: 900 }}
              >
                {editingAccountId ? "Update Account" : "Save Account"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccountId(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 860 }, borderRadius: "24px 0 0 24px" } }}
      >
        {selectedAccount ? (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 3, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
              <IconButton onClick={() => setSelectedAccountId(null)} sx={{ position: "absolute", right: 16, top: 16, color: "#fff" }}>
                <CloseRoundedIcon />
              </IconButton>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {selectedAccount.accountNo}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.76)" }}>
                {selectedAccount.memberName} · {selectedAccount.planName} · {selectedAccount.accountType}
              </Typography>
            </Box>

            <Tabs
              value={accountDetailTab}
              onChange={(_, value) => setAccountDetailTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}
            >
              <Tab value="interestPayout" label="Interest Payout" />
              <Tab value="transactions" label="View Transaction" />
              <Tab value="statement" label="Statement" />
              <Tab value="viewPlan" label="View Plan" />
              <Tab value="nominee" label="Add Update Nominee" />
              <Tab value="foreclose" label="Foreclose" />
              <Tab value="upgradePlan" label="Upgrade Account Plan" />
              <Tab value="upgradeType" label="Upgrade Account Type" />
              <Tab value="interestAdjust" label="Credit/Debit Interest" />
              <Tab value="tds" label="Deduct Revert TDS" />
              <Tab value="fdBond" label="FD Bond" />
              <Tab value="document" label="Document" />
              <Tab value="depositLog" label="Deposit Log" />
            </Tabs>

            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
              <TabPanel active={accountDetailTab === "interestPayout"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Note</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedAccount.interestPayouts.length ? (
                        <TableEmpty colSpan={4} label="No interest payout rows available." />
                      ) : (
                        selectedAccount.interestPayouts.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell>{entry.mode}</TableCell>
                            <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                            <TableCell>{entry.note}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={accountDetailTab === "transactions"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Narration</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedAccount.transactions.length ? (
                        <TableEmpty colSpan={5} label="No transactions available." />
                      ) : (
                        selectedAccount.transactions.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell>{entry.type}</TableCell>
                            <TableCell>{entry.mode}</TableCell>
                            <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                            <TableCell>{entry.narration}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={accountDetailTab === "statement"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Debit
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Credit
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900 }} align="right">
                          Balance
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedAccount.statement.length ? (
                        <TableEmpty colSpan={5} label="No statement rows available." />
                      ) : (
                        selectedAccount.statement.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                            <TableCell align="right">{formatCurrency(entry.debit)}</TableCell>
                            <TableCell align="right">{formatCurrency(entry.credit)}</TableCell>
                            <TableCell align="right">{formatCurrency(entry.balance)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={accountDetailTab === "viewPlan"}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Plan Name" value={selectedAccount.planName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Plan Code" value={selectedAccountPlan?.planCode ?? "-"} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Min Amount" value={formatCurrency(selectedAccountPlan?.minAmount ?? 0)} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Tenure" value={selectedAccountPlan?.tenure ?? "-"} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair label="Lock In Period" value={selectedAccountPlan?.lockInPeriod ?? "-"} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoPair
                      label="Annual Interest Rate"
                      value={selectedAccountPlan ? `${selectedAccountPlan.annualInterestRate}%` : "-"}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel active={accountDetailTab === "nominee"}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Nominee"
                      value={accountNomineeDraft.nominee}
                      onChange={(event) =>
                        setAccountNomineeDraft((prev) => ({ ...prev, nominee: event.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Nominee Relation"
                      value={accountNomineeDraft.nomineeRelation}
                      onChange={(event) =>
                        setAccountNomineeDraft((prev) => ({ ...prev, nomineeRelation: event.target.value }))
                      }
                    />
                    <Button variant="contained" onClick={handleSaveAccountNominee} sx={{ alignSelf: "flex-start", borderRadius: 2 }}>
                      Save Nominee
                    </Button>
                  </Stack>
                </Paper>
              </TabPanel>

              <TabPanel active={accountDetailTab === "foreclose"}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                    Foreclose Account
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Mark this account as foreclosed and push an event to the deposit log.
                  </Typography>
                  <Button variant="contained" color="error" onClick={handleForecloseAccount} sx={{ borderRadius: 2 }}>
                    Foreclose Now
                  </Button>
                </Paper>
              </TabPanel>

              <TabPanel active={accountDetailTab === "upgradePlan"}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Stack spacing={2}>
                    <TextField
                      select
                      fullWidth
                      label="Upgrade Account Plan"
                      value={accountPlanUpgradeDraft}
                      onChange={(event) => setAccountPlanUpgradeDraft(event.target.value)}
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.planName}>
                          {plan.planName}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button variant="contained" onClick={handleUpgradePlan} sx={{ alignSelf: "flex-start", borderRadius: 2 }}>
                      Save Plan Upgrade
                    </Button>
                  </Stack>
                </Paper>
              </TabPanel>

              <TabPanel active={accountDetailTab === "upgradeType"}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Upgrade Account Type"
                      value={accountTypeDraft}
                      onChange={(event) => setAccountTypeDraft(event.target.value)}
                    />
                    <Button variant="contained" onClick={handleUpgradeAccountType} sx={{ alignSelf: "flex-start", borderRadius: 2 }}>
                      Save Account Type
                    </Button>
                  </Stack>
                </Paper>
              </TabPanel>

              <TabPanel active={accountDetailTab === "interestAdjust"}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <Stack spacing={2}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Credit / Debit Interest Amount"
                      value={interestAdjustmentAmount}
                      onChange={(event) => setInterestAdjustmentAmount(Number(event.target.value))}
                    />
                    <TextField
                      fullWidth
                      label="Adjustment Note"
                      value={interestAdjustmentNote}
                      onChange={(event) => setInterestAdjustmentNote(event.target.value)}
                    />
                    <Button variant="contained" onClick={handlePostInterestAdjustment} sx={{ alignSelf: "flex-start", borderRadius: 2 }}>
                      Post Interest Adjustment
                    </Button>
                  </Stack>
                </Paper>
              </TabPanel>

              <TabPanel active={accountDetailTab === "tds"}>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Deduct or revert TDS can now be handled from this account view. The current scaffold keeps the action point visible while the accounting workflow remains tied to the account ledger.
                </Alert>
              </TabPanel>

              <TabPanel active={accountDetailTab === "fdBond"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>File Label</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAccount.documents.filter((document) => document.name.toLowerCase().includes("bond")).length ? (
                        selectedAccount.documents
                          .filter((document) => document.name.toLowerCase().includes("bond"))
                          .map((document) => (
                            <TableRow key={document.id}>
                              <TableCell sx={{ fontWeight: 800 }}>{document.name}</TableCell>
                              <TableCell>{document.fileLabel}</TableCell>
                              <TableCell>{document.status}</TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableEmpty colSpan={3} label="No FD bond files available." />
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={accountDetailTab === "document"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Number</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>File Label</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedAccount.documents.length ? (
                        <TableEmpty colSpan={4} label="No documents attached to this account." />
                      ) : (
                        selectedAccount.documents.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell sx={{ fontWeight: 800 }}>{document.name}</TableCell>
                            <TableCell>{document.documentNumber}</TableCell>
                            <TableCell>{document.fileLabel}</TableCell>
                            <TableCell>{document.status}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel active={accountDetailTab === "depositLog"}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Event</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Actor</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!selectedAccount.depositLogs.length ? (
                        <TableEmpty colSpan={4} label="No deposit log entries available." />
                      ) : (
                        selectedAccount.depositLogs.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>{entry.event}</TableCell>
                            <TableCell>{entry.actor}</TableCell>
                            <TableCell>{entry.remark}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Box>
          </Box>
        ) : null}
      </Drawer>
    </>
  );
}
