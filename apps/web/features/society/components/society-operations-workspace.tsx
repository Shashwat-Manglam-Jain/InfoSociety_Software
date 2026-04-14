"use client";

import { useEffect, useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { ClientRegistry } from "./operations/ClientRegistry";
import { MetricCard } from "./operations/MetricCard";
import { SectionHero } from "./operations/SectionHero";
import { ShareRegister } from "./operations/ShareRegister";
import { TableEmpty } from "./operations/shared/TableEmpty";
import { ShareholdingDrawer } from "./operations/drawers/ShareholdingDrawer";
import {
  createAccount,
  listAccounts,
  type AccountRecord as BankingAccountRecord
} from "@/shared/api/accounts";
import {
  createDepositScheme,
  listDepositSchemes,
  openDepositAccount,
  type DepositSchemeRecord
} from "@/shared/api/deposits";
import { listHeads, type HeadRecord } from "@/shared/api/heads";
import { listLoans, type LoanRecord, updateLoanGuarantors } from "@/shared/api/loans";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getGuarantorRegistryCopy } from "@/shared/i18n/guarantor-registry-copy";
import { getPlanCatalogueCopy } from "@/shared/i18n/plan-catalogue-copy";
import { getAccountRegistryCopy } from "@/shared/i18n/account-registry-copy";
import { getClientApprovalDeskCopy } from "@/shared/i18n/client-approval-desk-copy";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";
import { toast } from "@/shared/ui/toast";
import type { ManagedUserRow, OperationsClientRow } from "../lib/society-admin-dashboard";
import {
  createEmptyShareholding,
  type MemberRecord,
  type ShareholdingRecord
} from "../lib/society-operations-data";

type SocietyOperationsWorkspaceProps = {
  view: string;
  token: string;
  branches: Array<{ id: string; name: string; code?: string | null }>;
  managedUsers: ManagedUserRow[];
  clientMembers?: OperationsClientRow[];
  branchFilterId?: string | null;
  openCreateClientDrawer?: () => void;
  canCreatePlans?: boolean;
  canOpenAccounts?: boolean;
};

type DepositSchemeFormState = {
  code: string;
  name: string;
  recurring: boolean;
  minMonths: number;
  maxMonths: number;
  interestRate: number;
};

type DepositAccountFormState = {
  customerId: string;
  schemeId: string;
  openingBalance: number;
  openDate: string;
  isPassbookEnabled: boolean;
};

type SocietyClientProfile = {
  userId: string;
  customerId: string;
  customerCode: string;
  fullName: string;
  username: string;
  branchId: string;
  branchName: string;
  isActive: boolean;
  createdAt: string;
};

type GuarantorRow = {
  id: string;
  loanId: string;
  branchId: string;
  slotKey: "guarantor1Id" | "guarantor2Id" | "guarantor3Id";
  guarantorName: string;
  guarantorCode: string;
  borrowerName: string;
  borrowerCode: string;
  branchName: string;
  accountNumber: string;
  responsibility: string;
  status: string;
};

type GuarantorFormState = {
  loanId: string;
  guarantor1Id: string;
  guarantor2Id: string;
  guarantor3Id: string;
  remarks: string;
};

type ClientApprovalRow = {
  id: string;
  branchId: string;
  clientName: string;
  customerCode: string;
  username: string;
  branchName: string;
  approvalSource: string;
  createdAt: string;
  status: string;
};

function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptySchemeForm(): DepositSchemeFormState {
  return {
    code: "",
    name: "",
    recurring: false,
    minMonths: 12,
    maxMonths: 12,
    interestRate: 7
  };
}

function createEmptyDepositAccountForm(): DepositAccountFormState {
  return {
    customerId: "",
    schemeId: "",
    openingBalance: 0,
    openDate: today(),
    isPassbookEnabled: true
  };
}

function createEmptyGuarantorForm(loan?: LoanRecord): GuarantorFormState {
  return {
    loanId: loan?.id ?? "",
    guarantor1Id: loan?.guarantor1?.id ?? "",
    guarantor2Id: loan?.guarantor2?.id ?? "",
    guarantor3Id: loan?.guarantor3?.id ?? "",
    remarks: loan?.remarks ?? ""
  };
}

function formatPersonName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "-";
}

function getAccountTypeLabel(type: BankingAccountRecord["type"]) {
  return type
    .split("_")
    .map((entry) => entry.charAt(0) + entry.slice(1).toLowerCase())
    .join(" ");
}

function getSchemeTypeLabel(
  scheme: DepositSchemeRecord,
  labels?: { recurringDeposit: string; fixedDeposit: string }
) {
  if (scheme.recurring) {
    return labels?.recurringDeposit ?? "Recurring Deposit";
  }

  return labels?.fixedDeposit ?? "Fixed Deposit";
}

function buildClientProfiles(managedUsers: ManagedUserRow[]) {
  return managedUsers
    .filter((user) => user.role === "CLIENT" && user.customerProfile?.id)
    .map((user) => ({
      userId: user.id,
      customerId: user.customerProfile!.id,
      customerCode: user.customerProfile!.customerCode,
      fullName: user.fullName,
      username: user.username,
      branchId: user.branchId ?? "",
      branchName: user.branch?.name ?? "Head office",
      isActive: user.isActive,
      createdAt: user.createdAt ?? ""
    }));
}

function buildShareMembers(clientProfiles: SocietyClientProfile[]): MemberRecord[] {
  return clientProfiles.map((client) => ({
    id: client.customerId,
    branchId: client.branchId,
    branch: client.branchName,
    clientNo: client.customerCode,
    applicationNo: client.customerCode,
    annualIncomeRange: "",
    name: client.fullName,
    fatherName: "",
    motherName: "",
    occupation: "Client",
    memberSourceType: "Digital",
    memberSourceName: "User Access",
    mobileNo: "",
    email: "",
    dob: "",
    gender: "",
    membershipStatus: client.isActive ? "Active" : "Inactive",
    joinedOn: client.createdAt,
    membershipFeeCollected: false,
    nomineeName: "",
    nomineeRelation: "",
    nomineeAddress: "",
    nomineeAadhaarNo: "",
    nomineeVoterId: "",
    nomineePanId: "",
    nomineeMobileNo: "",
    nomineeRationNo: "",
    correspondingAddress: "",
    correspondenceLatitude: "",
    correspondenceLongitude: "",
    permanentAddress: "",
    permanentCity: "",
    permanentState: "",
    permanentPincode: "",
    bankAccounts: [],
    documents: [],
    loanAccounts: [],
    guarantorLoans: [],
    coApplicants: [],
    loginDetails: {
      username: client.username,
      role: "CLIENT",
      status: client.isActive ? "Active" : "Inactive",
      lastLogin: "-",
      passwordUpdatedAt: client.createdAt || today()
    },
    kyc: {
      pan: { number: "", verified: false, verifiedOn: "", remark: "", documentLabel: "" },
      aadhaar: { number: "", verified: false, verifiedOn: "", remark: "", documentLabel: "" },
      dl: { number: "", verified: false, verifiedOn: "", remark: "", documentLabel: "" },
      verificationLogs: []
    },
    notes: ""
  }));
}

function resolveHeadForScheme(scheme: DepositSchemeRecord | undefined, heads: HeadRecord[]) {
  if (!scheme || !heads.length) {
    return null;
  }

  const expectedTokens = scheme.recurring
    ? ["RECURRING_DEPOSIT", "RECURRING", "RD"]
    : ["FIXED_DEPOSIT", "FIXED", "FD"];

  const normalizedHeads = heads.map((head) => ({
    head,
    haystack: [head.relatedType, head.name, head.code].join(" ").toUpperCase()
  }));

  const match = normalizedHeads.find((entry) => expectedTokens.some((token) => entry.haystack.includes(token)));
  return match?.head ?? heads[0];
}

function buildGuarantorRows(loans: LoanRecord[], clientProfiles: SocietyClientProfile[]): GuarantorRow[] {
  const branchByCustomerId = new Map(
    clientProfiles.map((client) => [client.customerId, { branchId: client.branchId, branchName: client.branchName }])
  );

  return loans.flatMap((loan) => {
    const borrowerName = formatPersonName(loan.customer.firstName, loan.customer.lastName);
    const borrowerBranch = branchByCustomerId.get(loan.customer.id);
    const branchId = borrowerBranch?.branchId ?? "";
    const branchName = borrowerBranch?.branchName ?? "Head office";
    const guarantors = [
      { label: "Primary guarantor", party: loan.guarantor1, slotKey: "guarantor1Id" as const },
      { label: "Secondary guarantor", party: loan.guarantor2, slotKey: "guarantor2Id" as const },
      { label: "Third guarantor", party: loan.guarantor3, slotKey: "guarantor3Id" as const }
    ].filter((entry) => Boolean(entry.party));

    return guarantors.map((entry, index) => ({
      id: `${loan.id}-${index + 1}`,
      loanId: loan.id,
      branchId,
      slotKey: entry.slotKey,
      guarantorName: formatPersonName(entry.party?.firstName, entry.party?.lastName),
      guarantorCode: entry.party?.customerCode ?? "-",
      borrowerName,
      borrowerCode: loan.customer.customerCode,
      branchName,
      accountNumber: loan.account.accountNumber,
      responsibility: `${entry.label} for ${formatCurrency(loan.applicationAmount)}`,
      status: loan.status
    }));
  });
}

function buildClientApprovalRows(clientProfiles: SocietyClientProfile[]): ClientApprovalRow[] {
  return clientProfiles.map((client) => ({
    id: client.userId,
    branchId: client.branchId,
    clientName: client.fullName,
    customerCode: client.customerCode,
    username: client.username,
    branchName: client.branchName,
    approvalSource: "Society admin via User Access",
    createdAt: client.createdAt,
    status: client.isActive ? "Approved" : "Inactive"
  }));
}

export function SocietyOperationsWorkspace({
  view,
  token,
  branches,
  managedUsers,
  clientMembers = [],
  branchFilterId = null,
  openCreateClientDrawer,
  canCreatePlans = true,
  canOpenAccounts = true
}: SocietyOperationsWorkspaceProps) {
  const { locale } = useLanguage();
  const guarantorCopy = getGuarantorRegistryCopy(locale);
  const planCopy = getPlanCatalogueCopy(locale);
  const accountCopy = getAccountRegistryCopy(locale);
  const approvalCopy = getClientApprovalDeskCopy(locale);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;
  const localeTag = locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";

  function formatLocalizedNumber(value: number, options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(localeTag, options).format(value);
  }

  const clientProfiles = useMemo(() => buildClientProfiles(managedUsers), [managedUsers]);
  const shareMembers = useMemo(() => buildShareMembers(clientProfiles), [clientProfiles]);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(0);
  const [memberRowsPerPage, setMemberRowsPerPage] = useState(10);
  const [shareholdings, setShareholdings] = useState<ShareholdingRecord[]>([]);
  const [shareSearch, setShareSearch] = useState("");
  const [sharePage, setSharePage] = useState(0);
  const [shareRowsPerPage, setShareRowsPerPage] = useState(10);
  const [shareholdingTypeTab, setShareholdingTypeTab] = useState("shareholder");
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [shareForm, setShareForm] = useState<ShareholdingRecord>(createEmptyShareholding());

  const [schemeRows, setSchemeRows] = useState<DepositSchemeRecord[]>([]);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [schemeError, setSchemeError] = useState<string | null>(null);
  const [schemeSearch, setSchemeSearch] = useState("");
  const [schemeDrawerOpen, setSchemeDrawerOpen] = useState(false);
  const [schemeSubmitting, setSchemeSubmitting] = useState(false);
  const [schemeForm, setSchemeForm] = useState<DepositSchemeFormState>(createEmptySchemeForm());

  const [accountRows, setAccountRows] = useState<BankingAccountRecord[]>([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountPage, setAccountPage] = useState(0);
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(10);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountForm, setAccountForm] = useState<DepositAccountFormState>(createEmptyDepositAccountForm());
  const [headRows, setHeadRows] = useState<HeadRecord[]>([]);

  const [guarantorRows, setGuarantorRows] = useState<GuarantorRow[]>([]);
  const [loanRows, setLoanRows] = useState<LoanRecord[]>([]);
  const [guarantorLoading, setGuarantorLoading] = useState(false);
  const [guarantorError, setGuarantorError] = useState<string | null>(null);
  const [guarantorSearch, setGuarantorSearch] = useState("");
  const [guarantorPage, setGuarantorPage] = useState(0);
  const [guarantorRowsPerPage, setGuarantorRowsPerPage] = useState(10);
  const [guarantorDrawerOpen, setGuarantorDrawerOpen] = useState(false);
  const [guarantorSubmitting, setGuarantorSubmitting] = useState(false);
  const [guarantorForm, setGuarantorForm] = useState<GuarantorFormState>(createEmptyGuarantorForm());

  const [approvalSearch, setApprovalSearch] = useState("");
  const [approvalPage, setApprovalPage] = useState(0);
  const [approvalRowsPerPage, setApprovalRowsPerPage] = useState(10);

  const approvalRows = useMemo(() => buildClientApprovalRows(clientProfiles), [clientProfiles]);

  const selectedScheme = useMemo(
    () => schemeRows.find((scheme) => scheme.id === accountForm.schemeId) ?? null,
    [accountForm.schemeId, schemeRows]
  );
  const selectedClient = useMemo(
    () => clientProfiles.find((client) => client.customerId === accountForm.customerId) ?? null,
    [accountForm.customerId, clientProfiles]
  );
  const branchScopedCustomerIds = useMemo(() => new Set(clientProfiles.map((client) => client.customerId)), [clientProfiles]);
  const selectedGuarantorLoan = useMemo(
    () => loanRows.find((loan) => loan.id === guarantorForm.loanId) ?? null,
    [guarantorForm.loanId, loanRows]
  );

  async function loadSchemes() {
    setSchemeLoading(true);
    setSchemeError(null);

    try {
      const rows = await listDepositSchemes(token);
      setSchemeRows(rows);
    } catch (caught) {
      setSchemeError(caught instanceof Error ? caught.message : "Unable to load product plans.");
    } finally {
      setSchemeLoading(false);
    }
  }

  async function loadAccounts() {
    setAccountLoading(true);
    setAccountError(null);

    try {
      const [accountsResponse, headsResponse] = await Promise.all([
        listAccounts(token, { page: 1, limit: 100 }),
        listHeads(token)
      ]);
      setAccountRows(accountsResponse.rows);
      setHeadRows(headsResponse);
    } catch (caught) {
      setAccountError(caught instanceof Error ? caught.message : "Unable to load account registry.");
    } finally {
      setAccountLoading(false);
    }
  }

  async function loadGuarantors() {
    setGuarantorLoading(true);
    setGuarantorError(null);

    try {
      const response = await listLoans(token, { page: 1, limit: 100 });
      setLoanRows(response.rows);
      setGuarantorRows(buildGuarantorRows(response.rows, clientProfiles));
    } catch (caught) {
      setGuarantorError(caught instanceof Error ? caught.message : "Unable to load guarantor relationships.");
    } finally {
      setGuarantorLoading(false);
    }
  }

  useEffect(() => {
    if (view === "plan_catalogue") {
      void loadSchemes();
    }
  }, [token, view]);

  useEffect(() => {
    if (view === "account_registry") {
      void Promise.all([loadSchemes(), loadAccounts()]);
    }
  }, [token, view]);

  useEffect(() => {
    if (view === "membership_guarantors") {
      void loadGuarantors();
    }
  }, [clientProfiles, token, view]);

  function handleSaveShare() {
    const shareId = editingShareId ?? `share-${Math.random().toString(36).slice(2, 9)}`;
    const prepared: ShareholdingRecord = { ...shareForm, id: shareId };
    setShareholdings((previous) =>
      editingShareId ? previous.map((entry) => (entry.id === editingShareId ? prepared : entry)) : [prepared, ...previous]
    );
    setShareDrawerOpen(false);
    setEditingShareId(null);
    setShareForm(createEmptyShareholding());
  }

  function handleDeleteShareholding(id: string) {
    setShareholdings((previous) => previous.filter((entry) => entry.id !== id));
    if (editingShareId === id) {
      setEditingShareId(null);
      setShareDrawerOpen(false);
      setShareForm(createEmptyShareholding());
    }
  }

  function openGuarantorDrawer(loan?: LoanRecord) {
    setGuarantorForm(createEmptyGuarantorForm(loan));
    setGuarantorDrawerOpen(true);
  }

  async function handleSaveGuarantorAssignments() {
    if (!guarantorForm.loanId) {
      toast.error("Select a loan account first.");
      return;
    }

    const selectedIds = [guarantorForm.guarantor1Id, guarantorForm.guarantor2Id, guarantorForm.guarantor3Id].filter(Boolean);
    if (selectedIds.length === 0) {
      toast.error("Assign at least one guarantor.");
      return;
    }

    if (new Set(selectedIds).size !== selectedIds.length) {
      toast.error("Each guarantor must be unique.");
      return;
    }

    setGuarantorSubmitting(true);

    try {
      await updateLoanGuarantors(token, guarantorForm.loanId, {
        guarantor1Id: guarantorForm.guarantor1Id || null,
        guarantor2Id: guarantorForm.guarantor2Id || null,
        guarantor3Id: guarantorForm.guarantor3Id || null,
        remarks: guarantorForm.remarks.trim() || null
      });

      setGuarantorDrawerOpen(false);
      setGuarantorForm(createEmptyGuarantorForm());
      await loadGuarantors();
      toast.success("Guarantor assignments updated.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to update guarantor assignments.");
    } finally {
      setGuarantorSubmitting(false);
    }
  }

  async function handleDeleteGuarantorRow(row: GuarantorRow) {
    const loan = loanRows.find((entry) => entry.id === row.loanId);
    if (!loan) {
      toast.error("The linked loan record could not be found.");
      return;
    }

    setGuarantorSubmitting(true);

    try {
      await updateLoanGuarantors(token, row.loanId, {
        guarantor1Id: row.slotKey === "guarantor1Id" ? null : loan.guarantor1?.id ?? null,
        guarantor2Id: row.slotKey === "guarantor2Id" ? null : loan.guarantor2?.id ?? null,
        guarantor3Id: row.slotKey === "guarantor3Id" ? null : loan.guarantor3?.id ?? null,
        remarks: loan.remarks ?? null
      });

      await loadGuarantors();
      toast.success("Guarantor entry removed.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to remove the guarantor entry.");
    } finally {
      setGuarantorSubmitting(false);
    }
  }

  async function handleCreateScheme() {
    if (!schemeForm.code.trim() || !schemeForm.name.trim()) {
      return;
    }

    setSchemeSubmitting(true);
    try {
      await createDepositScheme(token, {
        code: schemeForm.code.trim().toUpperCase(),
        name: schemeForm.name.trim(),
        minMonths: schemeForm.minMonths,
        maxMonths: schemeForm.maxMonths,
        interestRate: Number(schemeForm.interestRate),
        recurring: schemeForm.recurring
      });
      setSchemeDrawerOpen(false);
      setSchemeForm(createEmptySchemeForm());
      await loadSchemes();
      toast.success("Plan created.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to create plan.");
    } finally {
      setSchemeSubmitting(false);
    }
  }

  async function handleCreateDepositAccount() {
    if (!selectedClient || !selectedScheme) {
      return;
    }

    const head = resolveHeadForScheme(selectedScheme, headRows);
    if (!head) {
      toast.error("No matching account head is configured for the selected plan.");
      return;
    }

    setAccountSubmitting(true);

    try {
      const accountType = selectedScheme.recurring ? "RECURRING_DEPOSIT" : "FIXED_DEPOSIT";
      const created = await createAccount(token, {
        customerId: selectedClient.customerId,
        type: accountType,
        openingBalance: Number(accountForm.openingBalance),
        interestRate: Number(selectedScheme.interestRate),
        branchId: selectedClient.branchId || undefined,
        branchCode: branches.find((branch) => branch.id === selectedClient.branchId)?.code ?? undefined,
        headId: head.id,
        isPassbookEnabled: accountForm.isPassbookEnabled
      });

      await openDepositAccount(token, {
        accountId: created.id,
        schemeId: selectedScheme.id,
        principalAmount: Number(accountForm.openingBalance),
        durationMonths: selectedScheme.minMonths,
        startDate: accountForm.openDate
      });

      setAccountDrawerOpen(false);
      setAccountForm(createEmptyDepositAccountForm());
      await loadAccounts();
      toast.success("Deposit account created.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to open the account.");
    } finally {
      setAccountSubmitting(false);
    }
  }

  const filteredSchemes = useMemo(() => {
    const query = schemeSearch.trim().toLowerCase();
    if (!query) {
      return schemeRows;
    }

    return schemeRows.filter((scheme) =>
      [
        scheme.code,
        scheme.name,
        getSchemeTypeLabel(scheme, {
          recurringDeposit: planCopy.drawer.recurringDeposit,
          fixedDeposit: planCopy.drawer.fixedDeposit
        })
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [planCopy.drawer.fixedDeposit, planCopy.drawer.recurringDeposit, schemeRows, schemeSearch]);

  const filteredAccounts = useMemo(() => {
    const query = accountSearch.trim().toLowerCase();
    const branchScopedAccounts = branchFilterId
      ? accountRows.filter((account) => (account.branchId ?? "") === branchFilterId)
      : accountRows;

    if (!query) {
      return branchScopedAccounts;
    }

    return branchScopedAccounts.filter((account) =>
      [
        account.accountNumber,
        account.customer?.customerCode ?? "",
        formatPersonName(account.customer?.firstName, account.customer?.lastName),
        getAccountTypeLabel(account.type)
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [accountRows, accountSearch, branchFilterId]);

  const filteredGuarantors = useMemo(() => {
    const query = guarantorSearch.trim().toLowerCase();
    const branchScopedGuarantors = branchFilterId
      ? guarantorRows.filter((row) => row.branchId === branchFilterId)
      : guarantorRows;

    if (!query) {
      return branchScopedGuarantors;
    }

    return branchScopedGuarantors.filter((row) =>
      [row.guarantorName, row.guarantorCode, row.borrowerName, row.accountNumber, row.responsibility]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [branchFilterId, guarantorRows, guarantorSearch]);

  const filteredApprovals = useMemo(() => {
    const query = approvalSearch.trim().toLowerCase();
    const branchScopedApprovals = branchFilterId
      ? approvalRows.filter((row) => row.branchId === branchFilterId)
      : approvalRows;

    if (!query) {
      return branchScopedApprovals;
    }

    return branchScopedApprovals.filter((row) =>
      [row.clientName, row.customerCode, row.username, row.approvalSource].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [approvalRows, approvalSearch, branchFilterId]);

  const visibleShareholdings = useMemo(
    () =>
      shareholdings.filter((entry) =>
        clientProfiles.some((client) => client.customerId === entry.memberId)
      ),
    [clientProfiles, shareholdings]
  );

  const branchScopedLoanRows = useMemo(
    () =>
      branchFilterId
        ? loanRows.filter((loan) => branchScopedCustomerIds.has(loan.customer.id))
        : loanRows,
    [branchFilterId, branchScopedCustomerIds, loanRows]
  );

  const planMetrics = useMemo(() => {
    const fixedDeposits = schemeRows.filter((scheme) => !scheme.recurring).length;
    const recurringDeposits = schemeRows.filter((scheme) => scheme.recurring).length;
    const averageInterest =
      schemeRows.length > 0
        ? schemeRows.reduce((sum, scheme) => sum + Number(scheme.interestRate), 0) / schemeRows.length
        : 0;

    return [
      { label: planCopy.hero.eyebrow, value: formatLocalizedNumber(schemeRows.length), caption: planCopy.metrics.activePlans.caption },
      { label: planCopy.metrics.fdPlans.label, value: formatLocalizedNumber(fixedDeposits), caption: planCopy.metrics.fdPlans.caption },
      { label: planCopy.metrics.rdPlans.label, value: formatLocalizedNumber(recurringDeposits), caption: planCopy.metrics.rdPlans.caption },
      {
        label: planCopy.metrics.avgInterest.label,
        value: `${formatLocalizedNumber(averageInterest, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
        caption: planCopy.metrics.avgInterest.caption
      }
    ];
  }, [formatLocalizedNumber, planCopy, schemeRows]);

  const accountMetrics = useMemo(() => {
    const totalBalance = filteredAccounts.reduce((sum, account) => sum + Number(account.currentBalance || 0), 0);
    const activeAccounts = filteredAccounts.filter((account) => account.status === "ACTIVE").length;
    const depositAccounts = filteredAccounts.filter((account) =>
      account.type === "FIXED_DEPOSIT" || account.type === "RECURRING_DEPOSIT"
    ).length;

    return [
      { label: accountCopy.metrics.accounts.label, value: formatLocalizedNumber(filteredAccounts.length), caption: accountCopy.metrics.accounts.caption },
      { label: accountCopy.metrics.active.label, value: formatLocalizedNumber(activeAccounts), caption: accountCopy.metrics.active.caption },
      { label: accountCopy.metrics.deposits.label, value: formatLocalizedNumber(depositAccounts), caption: accountCopy.metrics.deposits.caption },
      { label: accountCopy.metrics.balance.label, value: formatCurrency(totalBalance), caption: accountCopy.metrics.balance.caption }
    ];
  }, [accountCopy.metrics.accounts.caption, accountCopy.metrics.accounts.label, accountCopy.metrics.active.caption, accountCopy.metrics.active.label, accountCopy.metrics.balance.caption, accountCopy.metrics.balance.label, accountCopy.metrics.deposits.caption, accountCopy.metrics.deposits.label, filteredAccounts, formatCurrency]);

  const canCreateDepositAccounts = canOpenAccounts && clientProfiles.length > 0 && schemeRows.length > 0 && headRows.length > 0;

  if (view === "membership_clients") {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh", bgcolor: isDark ? "background.default" : "#f8fafc" }}>
        <ClientRegistry
          members={clientMembers}
          memberSearch={memberSearch}
          setMemberSearch={setMemberSearch}
          memberPage={memberPage}
          setMemberPage={setMemberPage}
          memberRowsPerPage={memberRowsPerPage}
          setMemberRowsPerPage={setMemberRowsPerPage}
          canCreateMembers={Boolean(openCreateClientDrawer)}
          openCreateMemberDrawer={openCreateClientDrawer ?? (() => undefined)}
          openMemberDetail={() => undefined}
          formatDate={formatDate}
          memberDetailEnabled={false}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh", bgcolor: isDark ? "background.default" : "#f8fafc" }}>
      {view === "plan_catalogue" ? (
        <Stack spacing={3}>
          <SectionHero
            icon={<ArticleRoundedIcon />}
            eyebrow={planCopy.hero.eyebrow}
            title={planCopy.hero.title}
            description={planCopy.hero.description}
            colorScheme="emerald"
            actions={
              <>
                <TextField
                  size="small"
                  value={schemeSearch}
                  onChange={(event) => setSchemeSearch(event.target.value)}
                  placeholder={planCopy.hero.searchPlaceholder}
                  sx={{
                    minWidth: { xs: "100%", sm: 260 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: surfaces.input,
                      color: "#fff",
                      border: `1px solid ${surfaces.inputBorder}`
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setSchemeDrawerOpen(true)}
                  disabled={!canCreatePlans}
                  sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 3, fontWeight: 900, "&:hover": { bgcolor: "#f8fafc" } }}
                >
                  {planCopy.hero.createPlan}
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

          {schemeError ? <Alert severity="error" sx={{ borderRadius: 3 }}>{schemeError}</Alert> : null}
          {!canCreatePlans ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {planCopy.info.viewOnly}
            </Alert>
          ) : null}

          <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
            <TableContainer>
              <Table sx={{ minWidth: 860, tableLayout: "fixed" }}>
                <TableHead sx={{ bgcolor: surfaces.tableHead }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>{planCopy.table.planCode}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "28%" }}>{planCopy.table.planName}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>{planCopy.table.type}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>{planCopy.table.tenure}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "18%" }}>{planCopy.table.interest}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!schemeLoading && filteredSchemes.length === 0 ? (
                    <TableEmpty colSpan={5} label={planCopy.table.emptyState} />
                  ) : schemeLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchemes.map((scheme) => (
                      <TableRow key={scheme.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{scheme.code}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{scheme.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getSchemeTypeLabel(scheme, {
                              recurringDeposit: planCopy.drawer.recurringDeposit,
                              fixedDeposit: planCopy.drawer.fixedDeposit
                            })}
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {scheme.minMonths === scheme.maxMonths
                              ? `${formatLocalizedNumber(scheme.minMonths)} ${planCopy.table.months}`
                              : `${formatLocalizedNumber(scheme.minMonths)} - ${formatLocalizedNumber(scheme.maxMonths)} ${planCopy.table.months}`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>
                            {formatLocalizedNumber(Number(scheme.interestRate), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      ) : null}

      {view === "account_registry" ? (
        <Stack spacing={3}>
          <SectionHero
            icon={<PaymentsRoundedIcon />}
            eyebrow={accountCopy.hero.eyebrow}
            title={accountCopy.hero.title}
            description={accountCopy.hero.description}
            colorScheme="violet"
            actions={
              <>
                <TextField
                  size="small"
                  value={accountSearch}
                  onChange={(event) => {
                    setAccountPage(0);
                    setAccountSearch(event.target.value);
                  }}
                  placeholder={accountCopy.hero.searchPlaceholder}
                  sx={{
                    minWidth: { xs: "100%", sm: 260 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: surfaces.input,
                      color: "#fff",
                      border: `1px solid ${surfaces.inputBorder}`
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setAccountDrawerOpen(true)}
                  disabled={!canCreateDepositAccounts}
                  sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 3, fontWeight: 900, "&:hover": { bgcolor: "#f8fafc" } }}
                >
                  {accountCopy.hero.openAccount}
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

          {!schemeRows.length ? (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {accountCopy.alerts.createPlanFirst}
            </Alert>
          ) : null}
          {!canOpenAccounts ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {accountCopy.alerts.readOnly}
            </Alert>
          ) : null}
          {!headRows.length ? (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {accountCopy.alerts.noHeads}
            </Alert>
          ) : null}
          {!clientProfiles.length ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              {accountCopy.alerts.noClients}
            </Alert>
          ) : null}
          {accountError ? <Alert severity="error" sx={{ borderRadius: 3 }}>{accountError}</Alert> : null}

          <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
            <TableContainer>
              <Table sx={{ minWidth: 980, tableLayout: "fixed" }}>
                <TableHead sx={{ bgcolor: surfaces.tableHead }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>{accountCopy.table.accountNo}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "24%" }}>{accountCopy.table.client}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>{accountCopy.table.type}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "16%" }}>{accountCopy.table.maturity}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "12%" }}>{accountCopy.table.status}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "12%" }}>{accountCopy.table.balance}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!accountLoading && filteredAccounts.length === 0 ? (
                    <TableEmpty colSpan={6} label={accountCopy.table.emptyState} />
                  ) : accountLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts
                      .slice(accountPage * accountRowsPerPage, accountPage * accountRowsPerPage + accountRowsPerPage)
                      .map((account) => (
                        <TableRow key={account.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{account.accountNumber}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {formatPersonName(account.customer?.firstName, account.customer?.lastName)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {account.customer?.customerCode ?? "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={getAccountTypeLabel(account.type)} sx={{ fontWeight: 800 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(account.depositAccount?.maturityDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={account.status === "ACTIVE" ? accountCopy.table.active : account.status}
                              color={account.status === "ACTIVE" ? "success" : "default"}
                              variant={account.status === "ACTIVE" ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>
                              {formatCurrency(account.currentBalance)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredAccounts.length}
              page={accountPage}
              onPageChange={(_, nextPage) => setAccountPage(nextPage)}
              rowsPerPage={accountRowsPerPage}
              onRowsPerPageChange={(event) => {
                setAccountRowsPerPage(parseInt(event.target.value, 10));
                setAccountPage(0);
              }}
              labelRowsPerPage={accountCopy.pagination.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                accountCopy.pagination.displayedRows
                  .replace("{{from}}", formatLocalizedNumber(from))
                  .replace("{{to}}", formatLocalizedNumber(to))
                  .replace("{{count}}", formatLocalizedNumber(count))
              }
              getItemAriaLabel={(buttonType) =>
                buttonType === "next" ? accountCopy.pagination.nextPage : accountCopy.pagination.previousPage
              }
            />
          </Paper>
        </Stack>
      ) : null}

      {view === "share_register" ? (
        <ShareRegister
          shareholdings={visibleShareholdings}
          shareholdingSearch={shareSearch}
          setShareholdingSearch={setShareSearch}
          shareholdingPage={sharePage}
          setShareholdingPage={setSharePage}
          shareholdingRowsPerPage={shareRowsPerPage}
          setShareholdingRowsPerPage={setShareRowsPerPage}
          shareholdingTypeTab={shareholdingTypeTab}
          setShareholdingTypeTab={setShareholdingTypeTab}
          canCreateShareholdings={shareMembers.length > 0}
          openShareholdingDrawer={(share?: ShareholdingRecord) => {
            if (share) {
              setEditingShareId(share.id);
              setShareForm(share);
            } else {
              setEditingShareId(null);
              setShareForm(createEmptyShareholding());
            }
            setShareDrawerOpen(true);
          }}
          handleDeleteShareholding={handleDeleteShareholding}
          formatCurrency={formatCurrency}
        />
      ) : null}

      {view === "membership_guarantors" ? (
        <Stack spacing={3}>
          <SectionHero
            icon={<ShieldRoundedIcon />}
            eyebrow={guarantorCopy.guarantor.eyebrow}
            title={guarantorCopy.guarantor.title}
            description={guarantorCopy.guarantor.description}
            colorScheme="sky"
            actions={
              <>
                <TextField
                  size="small"
                  value={guarantorSearch}
                  onChange={(event) => {
                    setGuarantorPage(0);
                    setGuarantorSearch(event.target.value);
                  }}
                  placeholder={guarantorCopy.common.searchPlaceholder}
                  sx={{
                    minWidth: { xs: "100%", sm: 260 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: surfaces.input,
                      color: "#fff",
                      border: `1px solid ${surfaces.inputBorder}`
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => openGuarantorDrawer()}
                  disabled={branchScopedLoanRows.length === 0}
                  sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 3, fontWeight: 900, "&:hover": { bgcolor: "#f8fafc" } }}
                >
                  {locale === "hi" ? "गारंटर असाइन करें" : locale === "mr" ? "हमीदार नेमा" : "Assign Guarantor"}
                </Button>
              </>
            }
          />

          {guarantorError ? <Alert severity="error" sx={{ borderRadius: 3 }}>{guarantorError}</Alert> : null}

          <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
            <TableContainer>
              <Table sx={{ minWidth: 1040, tableLayout: "fixed" }}>
                <TableHead sx={{ bgcolor: surfaces.tableHead }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, width: "21%" }}>Guarantor</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "19%" }}>Borrower</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>Branch</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "15%" }}>Loan Account</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "17%" }}>Responsibility</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "8%" }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, width: "6%" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!guarantorLoading && filteredGuarantors.length === 0 ? (
                    <TableEmpty colSpan={7} label="No guarantor relationships were found." />
                  ) : guarantorLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGuarantors
                      .slice(guarantorPage * guarantorRowsPerPage, guarantorPage * guarantorRowsPerPage + guarantorRowsPerPage)
                      .map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{row.guarantorName}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.guarantorCode}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.borrowerName}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.borrowerCode}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{row.branchName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.accountNumber}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{row.responsibility}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={row.status} color={row.status === "DISBURSED" ? "success" : "default"} />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <IconButton size="small" onClick={() => openGuarantorDrawer(loanRows.find((loan) => loan.id === row.loanId))}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={guarantorSubmitting}
                                onClick={() => void handleDeleteGuarantorRow(row)}
                              >
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
              count={filteredGuarantors.length}
              page={guarantorPage}
              onPageChange={(_, nextPage) => setGuarantorPage(nextPage)}
              rowsPerPage={guarantorRowsPerPage}
              onRowsPerPageChange={(event) => {
                setGuarantorRowsPerPage(parseInt(event.target.value, 10));
                setGuarantorPage(0);
              }}
            />
          </Paper>
        </Stack>
      ) : null}

      {view === "membership_coapplicants" ? (
        <Stack spacing={3}>
          <SectionHero
            icon={<VerifiedUserRoundedIcon />}
            eyebrow={approvalCopy.hero.eyebrow}
            title={approvalCopy.hero.title}
            description={approvalCopy.hero.description}
            colorScheme="violet"
            actions={
              <TextField
                size="small"
                value={approvalSearch}
                  onChange={(event) => {
                    setApprovalPage(0);
                    setApprovalSearch(event.target.value);
                  }}
                placeholder={approvalCopy.hero.searchPlaceholder}
                sx={{
                  minWidth: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: surfaces.input,
                    color: "#fff",
                    border: `1px solid ${surfaces.inputBorder}`
                  }
                }}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, fontSize: 18, color: "rgba(255,255,255,0.65)" }} />
                }}
              />
            }
          />

          <Paper elevation={0} sx={{ borderRadius: 1.5, border: `1px solid ${surfaces.border}`, overflow: "hidden", bgcolor: surfaces.paper }}>
            <TableContainer>
              <Table sx={{ minWidth: 1040, tableLayout: "fixed" }}>
                <TableHead sx={{ bgcolor: surfaces.tableHead }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, width: "24%" }}>{approvalCopy.table.client}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>{approvalCopy.table.customerCode}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "16%" }}>{approvalCopy.table.loginUsername}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "18%" }}>{approvalCopy.table.approvedBy}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>{approvalCopy.table.createdOn}</TableCell>
                    <TableCell sx={{ fontWeight: 900, width: "14%" }}>{approvalCopy.table.status}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApprovals.length === 0 ? (
                    <TableEmpty colSpan={6} label={approvalCopy.table.emptyState} />
                  ) : (
                    filteredApprovals
                      .slice(approvalPage * approvalRowsPerPage, approvalPage * approvalRowsPerPage + approvalRowsPerPage)
                      .map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{row.clientName}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.branchName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.customerCode}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">@{row.username}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{row.approvalSource}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{formatDate(row.createdAt)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={row.status === "Approved" ? approvalCopy.table.approved : row.status}
                              color={row.status === "Approved" ? "success" : "default"}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredApprovals.length}
              page={approvalPage}
              onPageChange={(_, nextPage) => setApprovalPage(nextPage)}
              rowsPerPage={approvalRowsPerPage}
              onRowsPerPageChange={(event) => {
                setApprovalRowsPerPage(parseInt(event.target.value, 10));
                setApprovalPage(0);
              }}
              labelRowsPerPage={approvalCopy.pagination.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) =>
                approvalCopy.pagination.displayedRows
                  .replace("{{from}}", formatLocalizedNumber(from))
                  .replace("{{to}}", formatLocalizedNumber(to))
                  .replace("{{count}}", formatLocalizedNumber(count))
              }
              getItemAriaLabel={(buttonType) =>
                buttonType === "next" ? approvalCopy.pagination.nextPage : approvalCopy.pagination.previousPage
              }
            />
          </Paper>
        </Stack>
      ) : null}

      <Drawer
        anchor="right"
        open={schemeDrawerOpen}
        onClose={() => setSchemeDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 480 } } }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setSchemeDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {planCopy.drawer.createDepositPlan}
            </Typography>
          </Box>
          <Stack spacing={2} sx={{ px: 3, py: 3 }}>
            <TextField
              fullWidth
              label={planCopy.drawer.planCode}
              value={schemeForm.code}
              onChange={(event) => setSchemeForm((previous) => ({ ...previous, code: event.target.value.toUpperCase() }))}
            />
            <TextField
              fullWidth
              label={planCopy.drawer.planName}
              value={schemeForm.name}
              onChange={(event) => setSchemeForm((previous) => ({ ...previous, name: event.target.value }))}
            />
            <TextField
              select
              fullWidth
              label={planCopy.drawer.planType}
              value={schemeForm.recurring ? "RD" : "FD"}
              onChange={(event) => setSchemeForm((previous) => ({ ...previous, recurring: event.target.value === "RD" }))}
            >
              <MenuItem value="FD">{planCopy.drawer.fixedDeposit}</MenuItem>
              <MenuItem value="RD">{planCopy.drawer.recurringDeposit}</MenuItem>
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label={planCopy.drawer.minMonths}
                  value={schemeForm.minMonths}
                  onChange={(event) => setSchemeForm((previous) => ({ ...previous, minMonths: Number(event.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label={planCopy.drawer.maxMonths}
                  value={schemeForm.maxMonths}
                  onChange={(event) => setSchemeForm((previous) => ({ ...previous, maxMonths: Number(event.target.value) }))}
                />
              </Grid>
            </Grid>
            <TextField
              type="number"
              fullWidth
              label={planCopy.drawer.interestRate}
              value={schemeForm.interestRate}
              onChange={(event) => setSchemeForm((previous) => ({ ...previous, interestRate: Number(event.target.value) }))}
            />
            <Button
              variant="contained"
              onClick={() => void handleCreateScheme()}
              disabled={schemeSubmitting || !schemeForm.code.trim() || !schemeForm.name.trim()}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              {planCopy.drawer.submitCreatePlan}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 520 } } }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setAccountDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {accountCopy.drawer.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {accountCopy.drawer.subtitle}
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ px: 3, py: 3 }}>
            <TextField
              select
              fullWidth
              label={accountCopy.drawer.client}
              value={accountForm.customerId}
              onChange={(event) => setAccountForm((previous) => ({ ...previous, customerId: event.target.value }))}
            >
              {clientProfiles.map((client) => (
                <MenuItem key={client.customerId} value={client.customerId}>
                  {client.fullName} ({client.customerCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label={accountCopy.drawer.plan}
              value={accountForm.schemeId}
              onChange={(event) => setAccountForm((previous) => ({ ...previous, schemeId: event.target.value }))}
            >
              {schemeRows.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  {scheme.name} ({scheme.code})
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label={accountCopy.drawer.depositAmount}
                  value={accountForm.openingBalance}
                  onChange={(event) =>
                    setAccountForm((previous) => ({ ...previous, openingBalance: Number(event.target.value) }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="date"
                  fullWidth
                  label={accountCopy.drawer.openingDate}
                  value={accountForm.openDate}
                  onChange={(event) => setAccountForm((previous) => ({ ...previous, openDate: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {accountCopy.drawer.passbookEnabled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {accountCopy.drawer.passbookDescription}
                  </Typography>
                </Box>
                <Switch
                  checked={accountForm.isPassbookEnabled}
                  onChange={(event) =>
                    setAccountForm((previous) => ({ ...previous, isPassbookEnabled: event.target.checked }))
                  }
                />
              </Stack>
            </Paper>

            {selectedClient && selectedScheme ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  {accountCopy.drawer.openingPreview}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {accountCopy.drawer.previewClient}: {selectedClient.fullName} ({selectedClient.customerCode})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {accountCopy.drawer.previewPlan}: {selectedScheme.name} ({getSchemeTypeLabel(selectedScheme, {
                    recurringDeposit: planCopy.drawer.recurringDeposit,
                    fixedDeposit: planCopy.drawer.fixedDeposit
                  })})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {accountCopy.drawer.previewBranch}: {selectedClient.branchName}
                </Typography>
              </Paper>
            ) : null}

            <Button
              variant="contained"
              onClick={() => void handleCreateDepositAccount()}
              disabled={
                accountSubmitting ||
                !accountForm.customerId ||
                !accountForm.schemeId ||
                Number(accountForm.openingBalance) <= 0
              }
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              {accountCopy.drawer.submitOpenAccount}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={guarantorDrawerOpen}
        onClose={() => setGuarantorDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", md: 520 } } }}
      >
        <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", position: "relative" }}>
            <IconButton onClick={() => setGuarantorDrawerOpen(false)} sx={{ position: "absolute", right: 16, top: 16 }}>
              <CloseRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Manage Guarantors
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, update, or remove guarantor responsibility against a selected loan account.
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ px: 3, py: 3 }}>
            <TextField
              select
              fullWidth
              label="Loan Account"
              value={guarantorForm.loanId}
              onChange={(event) => {
                const loan = branchScopedLoanRows.find((entry) => entry.id === event.target.value);
                setGuarantorForm(createEmptyGuarantorForm(loan));
              }}
            >
              {branchScopedLoanRows.map((loan) => (
                <MenuItem key={loan.id} value={loan.id}>
                  {loan.account.accountNumber} · {formatPersonName(loan.customer.firstName, loan.customer.lastName)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Primary Guarantor"
              value={guarantorForm.guarantor1Id}
              onChange={(event) => setGuarantorForm((previous) => ({ ...previous, guarantor1Id: event.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              {clientProfiles.map((client) => (
                <MenuItem key={client.customerId} value={client.customerId}>
                  {client.fullName} ({client.customerCode})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Secondary Guarantor"
              value={guarantorForm.guarantor2Id}
              onChange={(event) => setGuarantorForm((previous) => ({ ...previous, guarantor2Id: event.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              {clientProfiles.map((client) => (
                <MenuItem key={client.customerId} value={client.customerId}>
                  {client.fullName} ({client.customerCode})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Third Guarantor"
              value={guarantorForm.guarantor3Id}
              onChange={(event) => setGuarantorForm((previous) => ({ ...previous, guarantor3Id: event.target.value }))}
            >
              <MenuItem value="">None</MenuItem>
              {clientProfiles.map((client) => (
                <MenuItem key={client.customerId} value={client.customerId}>
                  {client.fullName} ({client.customerCode})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Responsibility Notes"
              value={guarantorForm.remarks}
              onChange={(event) => setGuarantorForm((previous) => ({ ...previous, remarks: event.target.value }))}
            />

            {selectedGuarantorLoan ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Loan Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Borrower: {formatPersonName(selectedGuarantorLoan.customer.firstName, selectedGuarantorLoan.customer.lastName)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account: {selectedGuarantorLoan.account.accountNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: {formatCurrency(selectedGuarantorLoan.applicationAmount)}
                </Typography>
              </Paper>
            ) : null}

            <Button
              variant="contained"
              onClick={() => void handleSaveGuarantorAssignments()}
              disabled={guarantorSubmitting || !guarantorForm.loanId}
              sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
            >
              Save Guarantors
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <ShareholdingDrawer
        open={shareDrawerOpen}
        onClose={() => setShareDrawerOpen(false)}
        shareForm={shareForm}
        setShareForm={setShareForm}
        editingShareId={editingShareId}
        members={shareMembers}
        onSave={handleSaveShare}
      />
    </Box>
  );
}
