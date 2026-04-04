"use client";

import { resolveAccountTypeByRole, sanitizeAllowedModuleSlugs } from "@/features/banking/account-access";
import type {
  AdministrationBranchPayload,
  AdministrationUserRecord,
  AgentPerformanceRecord,
  SocietyTransactionRecord
} from "@/shared/api/administration";
import type { CustomerListRecord } from "@/shared/api/customers";
import type { AppAccountType, Branch, UserRole } from "@/shared/types";

export type RoleMeta = {
  label: string;
  shortLabel: string;
  description: string;
  accountType: AppAccountType;
};

export type BranchFormState = {
  id?: string;
  code: string;
  name: string;
  isHead: boolean;
  isActive: boolean;
  contactEmail: string;
  contactNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  openingDate: string;
  lockerFacility: boolean;
  neftImpsService: boolean;
};



export type UserFormState = {
  fullName: string;
  role: UserRole;
  branchId: string;
  username: string;
  password: string;
  allowedModuleSlugs: string[];
  isActive: boolean;
};

export type ManagedUserRow = AdministrationUserRecord & {
  branch: Branch | null;
  roleMeta: RoleMeta;
};

export type SocietyAgentRow = {
  id: string;
  customerId: string | null;
  userId: string;
  fullName: string;
  username: string;
  customerCode: string;
  branch: Branch | null;
  isActive: boolean;
  allowedModuleSlugs: string[];
  dailyCollection: number;
  monthlyCollection: number;
};

export type TreasuryTransactionRow = {
  id: string;
  date: string;
  reference: string;
  category: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  accountNumber: string;
  customerName: string;
  branchName: string;
  branchCode: string;
  enteredBy: string;
};

export const ROLE_META: Record<UserRole, RoleMeta> = {
  SUPER_USER: {
    label: "Staff",
    shortLabel: "Staff",
    description: "Accesses internal society operations, handles daily transactions and records.",
    accountType: "SOCIETY"
  },
  AGENT: {
    label: "Field Agent",
    shortLabel: "Agent",
    description: "Handles assigned member servicing, collections, and field operations.",
    accountType: "AGENT"
  },
  CLIENT: {
    label: "Client",
    shortLabel: "Client",
    description: "Accesses member-facing portal for personal deposits and account status.",
    accountType: "CLIENT"
  },
  SUPER_ADMIN: {
    label: "Platform Admin",
    shortLabel: "Platform",
    description: "Oversees societies and platform-wide controls.",
    accountType: "PLATFORM"
  }
};

function normalizeText(value?: string | null) {
  const next = value?.trim();
  return next ? next : undefined;
}

function formatInputDate(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function buildUsername(fullName: string) {
  const username = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");

  return username || "user";
}

export function createTemporaryPassword() {
  return Math.random().toString(36).slice(-10);
}

export function createEmptyBranchForm(): BranchFormState {
  return {
    code: "",
    name: "",
    isHead: false,
    isActive: true,
    contactEmail: "",
    contactNo: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    openingDate: formatInputDate(new Date()),
    lockerFacility: false,
    neftImpsService: false
  };
}

export function createBranchForm(branch?: Branch | null): BranchFormState {
  if (!branch) {
    return createEmptyBranchForm();
  }

  return {
    id: branch.id,
    code: branch.code ?? "",
    name: branch.name ?? "",
    isHead: Boolean(branch.isHead),
    isActive: branch.isActive !== false,
    contactEmail: branch.contactEmail ?? "",
    contactNo: branch.contactNo ?? "",
    addressLine1: branch.addressLine1 ?? "",
    addressLine2: branch.addressLine2 ?? "",
    city: branch.city ?? "",
    state: branch.state ?? "",
    pincode: branch.pincode ?? "",
    openingDate: formatInputDate(branch.openingDate),
    lockerFacility: Boolean(branch.lockerFacility),
    neftImpsService: Boolean(branch.neftImpsService)
  };
}



export function createEmptyUserForm(role: UserRole = "SUPER_USER"): UserFormState {
  return {
    fullName: "",
    role,
    branchId: "",
    username: "",
    password: createTemporaryPassword(),
    allowedModuleSlugs: sanitizeAllowedModuleSlugs(resolveAccountTypeByRole(role)),
    isActive: true
  };
}

export function createUserForm(role: UserRole = "SUPER_USER") {
  return createEmptyUserForm(role);
}

export function getRoleMeta(role: UserRole) {
  return ROLE_META[role];
}

export function toAccountType(role: UserRole) {
  return resolveAccountTypeByRole(role);
}

export function normalizeAllowedModules(role: UserRole, allowedModuleSlugs?: string[]) {
  return sanitizeAllowedModuleSlugs(resolveAccountTypeByRole(role), allowedModuleSlugs);
}

export function normalizeBranchPayload(
  form: BranchFormState,
  options: { includeStatus?: boolean } = {}
): AdministrationBranchPayload {
  const payload: AdministrationBranchPayload = {
    ...(normalizeText(form.code) ? { code: normalizeText(form.code)! } : {}),
    name: form.name.trim(),
    isHead: form.isHead,
    contactEmail: normalizeText(form.contactEmail),
    contactNo: normalizeText(form.contactNo),
    addressLine1: normalizeText(form.addressLine1),
    addressLine2: normalizeText(form.addressLine2),
    city: normalizeText(form.city),
    state: normalizeText(form.state),
    pincode: normalizeText(form.pincode),
    openingDate: normalizeText(form.openingDate),
    lockerFacility: form.lockerFacility,
    neftImpsService: form.neftImpsService
  };

  if (options.includeStatus) {
    payload.isActive = form.isActive;
  }

  return payload;
}



export function buildManagedUsers(users: AdministrationUserRecord[], branches: Branch[]): ManagedUserRow[] {
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]));

  return users.map((user) => ({
    ...user,
    allowedModuleSlugs: normalizeAllowedModules(user.role, user.allowedModuleSlugs),
    branch: user.branchId ? branchMap.get(user.branchId) ?? null : null,
    roleMeta: getRoleMeta(user.role)
  }));
}

export function buildAgentRows(users: ManagedUserRow[], agentPerformance: AgentPerformanceRecord[]): SocietyAgentRow[] {
  const performanceMap = new Map(agentPerformance.map((record) => [record.id, record]));

  return users
    .filter((user) => user.role === "AGENT")
    .map((user) => {
      const performance = user.customerProfile?.id ? performanceMap.get(user.customerProfile.id) : undefined;

      return {
        id: user.id,
        customerId: user.customerProfile?.id ?? null,
        userId: user.id,
        fullName: user.fullName,
        username: user.username,
        customerCode: user.customerProfile?.customerCode ?? "Unlinked",
        branch: user.branch,
        isActive: user.isActive,
        allowedModuleSlugs: user.allowedModuleSlugs ?? [],
        dailyCollection: performance?.daily ?? 0,
        monthlyCollection: performance?.monthly ?? 0
      };
    });
}

export function buildTreasuryRows(
  transactions: SocietyTransactionRecord[],
  branches: Branch[]
): TreasuryTransactionRow[] {
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]));

  return transactions.map((transaction) => {
    const branch = transaction.account.branchId ? branchMap.get(transaction.account.branchId) ?? null : null;
    const customerName = [transaction.account.customer?.firstName, transaction.account.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      id: transaction.id,
      date: transaction.valueDate,
      reference: transaction.transactionNumber,
      category: transaction.mode,
      type: transaction.type,
      amount: Number(transaction.amount),
      accountNumber: transaction.account.accountNumber,
      customerName: customerName || transaction.account.customer?.customerCode || "-",
      branchName: branch?.name ?? transaction.account.branchCode ?? "Head Office",
      branchCode: branch?.code ?? transaction.account.branchCode ?? "-",
      enteredBy: transaction.createdBy.fullName || transaction.createdBy.username
    };
  });
}

export function buildLockerClients(customers: CustomerListRecord[]) {
  return customers.map((customer) => ({
    id: customer.id,
    fullName:
      [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() ||
      customer.customerCode,
    customerProfile: {
      id: customer.id,
      customerCode: customer.customerCode
    },
    isActive: true
  }));
}
