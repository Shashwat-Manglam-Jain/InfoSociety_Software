import type { SocietyOverviewRecord } from "@/shared/api/administration";
import type { LoanRecord } from "@/shared/api/loans";
import type { Branch } from "@/shared/types";

export const EMPTY_SOCIETY_OVERVIEW: SocietyOverviewRecord = {
  totalBranches: 0,
  totalStaff: 0,
  totalMembers: 0,
  totalCapital: 0,
  bankBalance: 0,
  cashBalance: 0,
  totalDistributed: 0,
  totalInterest: 0,
  collectionApproved: {
    daily: 0,
    weekly: 0,
    monthly: 0
  },
  collectionPending: {
    daily: 0,
    weekly: 0,
    monthly: 0
  },
  distributedApproved: {
    daily: 0,
    weekly: 0,
    monthly: 0
  },
  distributedPending: {
    daily: 0,
    weekly: 0,
    monthly: 0
  },
  totalCollected: 0
};

export type BranchCollectionRow = {
  id: string;
  name: string;
  code: string;
  todayCollection: number;
  weeklyCollection: number;
  monthlyCollection: number;
};

export type LoanApplicationSummaryRow = {
  id: string;
  accountNumber: string;
  applicantName: string;
  customerCode: string;
  branchId: string | null;
  branchName: string;
  branchCode: string;
  status: LoanRecord["status"];
  applicationAmount: number;
  sanctionedAmount: number;
  disbursedAmount: number;
  createdAt: string;
};

function toNumber(value: number | string | null | undefined) {
  const numericValue = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatApplicantName(firstName?: string | null, lastName?: string | null, customerCode?: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || customerCode || "Unknown member";
}

export function getMonthlyNetEarnings(overview: SocietyOverviewRecord) {
  return toNumber(overview.collectionApproved.monthly) - toNumber(overview.distributedApproved.monthly);
}

export function countOpenLoanApplications(loans: LoanRecord[]) {
  return loans.filter((loan) => loan.status === "APPLIED" || loan.status === "SANCTIONED").length;
}

export function buildBranchCollectionRows(
  branches: Branch[],
  branchOverviews: Record<string, SocietyOverviewRecord>
): BranchCollectionRow[] {
  return [...branches]
    .sort((left, right) => Number(right.isHead) - Number(left.isHead) || left.name.localeCompare(right.name))
    .map((branch) => {
      const overview = branchOverviews[branch.id] ?? EMPTY_SOCIETY_OVERVIEW;

      return {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        todayCollection: toNumber(overview.collectionApproved.daily),
        weeklyCollection: toNumber(overview.collectionApproved.weekly),
        monthlyCollection: toNumber(overview.collectionApproved.monthly)
      };
    });
}

export function buildLoanApplicationSummaryRows(loans: LoanRecord[]): LoanApplicationSummaryRow[] {
  return [...loans]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((loan) => ({
      id: loan.id,
      accountNumber: loan.account.accountNumber,
      applicantName: formatApplicantName(loan.customer.firstName, loan.customer.lastName, loan.customer.customerCode),
      customerCode: loan.customer.customerCode,
      branchId: loan.account.branchId ?? loan.account.branch?.id ?? null,
      branchName: loan.account.branch?.name ?? "Unassigned branch",
      branchCode: loan.account.branch?.code ?? "",
      status: loan.status,
      applicationAmount: toNumber(loan.applicationAmount),
      sanctionedAmount: toNumber(loan.sanctionedAmount),
      disbursedAmount: toNumber(loan.disbursedAmount),
      createdAt: loan.createdAt
    }));
}
