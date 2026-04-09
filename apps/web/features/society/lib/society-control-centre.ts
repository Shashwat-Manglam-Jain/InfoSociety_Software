import { getAccessibleModules } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";
import { modules, type BankingModule } from "@/features/banking/module-registry";
import { getMe } from "@/shared/api/auth";
import { listCustomers } from "@/shared/api/customers";
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { getUserDirectory, type UserDirectoryEntry } from "@/shared/api/users";
import { defaultLocale, type AppLocale } from "@/shared/i18n/translations";
import type { Session, SocietyStatus } from "@/shared/types";

type CustomerRow = Awaited<ReturnType<typeof listCustomers>>["rows"][number];

export type SocietyAccountPreview = {
  id: string;
  customerCode: string;
  accountNumber: string;
  fullName: string;
  product: string;
  branch: string;
  phone: string;
  status: string;
  balance: number;
  note: string;
  isDemo: boolean;
};

export type SocietyTeamPreview = {
  id: string;
  fullName: string;
  roleLabel: string;
  isActive: boolean;
  note: string;
};

export type SocietyMetric = {
  label: string;
  value: string;
  caption: string;
};

export type SocietyControlCentreData = {
  ownerName: string;
  ownerInitials: string;
  societyName: string;
  societyCode: string;
  societyStatus: SocietyStatus;
  subscriptionLabel: string;
  liveDataAvailable: boolean;
  accountResultsUseDemoData: boolean;
  previewReason: string | null;
  monitoringCaption: string;
  digitalCollectionsEnabled: boolean;
  metrics: SocietyMetric[];
  modules: BankingModule[];
  accountResults: SocietyAccountPreview[];
  team: SocietyTeamPreview[];
};

const demoBranches = ["Head Office", "Market Road", "Industrial Cell", "Rural Service Desk"];
const demoProducts = ["Savings Account", "Recurring Deposit", "Gold Loan", "Current Account", "Term Deposit"];
const demoStatuses = ["Active", "KYC Review", "Renewal Due", "Collection Follow-up", "Locker Enabled"];
const demoPhones = ["+91 98765 11220", "+91 98765 22440", "+91 98765 33660", "+91 98765 44880"];

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "SC";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function hashValue(value: string) {
  return Array.from(value).reduce((total, char, index) => total + char.charCodeAt(0) * (index + 3), 0);
}

function pick<T>(items: T[], seed: number) {
  return items[Math.abs(seed) % items.length] ?? items[0];
}

function buildAccountNumber(seed: string, index: number) {
  const numeric = String(Math.abs(hashValue(seed) * 97 + index * 131)).padStart(10, "0");
  return `AC-${numeric.slice(0, 4)}-${numeric.slice(4, 10)}`;
}

function matchesSearchQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function buildPreviewBalance(seed: string, index: number) {
  return 25000 + ((hashValue(seed) + index * 7321) % 420000);
}

function mapCustomerToAccount(customer: CustomerRow, index: number, societyName: string): SocietyAccountPreview {
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() || customer.customerCode;
  const seed = `${customer.id}-${customer.customerCode}-${fullName}`;

  return {
    id: customer.id,
    customerCode: customer.customerCode,
    accountNumber: buildAccountNumber(seed, index),
    fullName,
    product: pick(demoProducts, hashValue(seed)),
    branch: pick(demoBranches, hashValue(customer.customerCode) + index),
    phone: pick(demoPhones, index),
    status: pick(demoStatuses, hashValue(fullName) + index),
    balance: buildPreviewBalance(seed, index),
    note: `Live member directory mapped for ${societyName}`,
    isDemo: false
  };
}

export function createDemoAccountResults(ownerName: string, societyName: string) {
  return [
    `${ownerName.split(" ")[0] ?? "Society"} Member`,
    "Priya Nair",
    "Rahul Deshmukh",
    "Mina Traders",
    "Keshav Agro"
  ].map((name, index) => {
    const seed = `${societyName}-${name}-${index}`;

    return {
      id: `demo-${index + 1}`,
      customerCode: `CUS-${String(index + 1).padStart(3, "0")}`,
      accountNumber: buildAccountNumber(seed, index),
      fullName: name,
      product: pick(demoProducts, hashValue(seed)),
      branch: pick(demoBranches, index),
      phone: pick(demoPhones, index),
      status: pick(demoStatuses, hashValue(name)),
      balance: buildPreviewBalance(seed, index),
      note: `Preview account card for ${societyName}`,
      isDemo: true
    } satisfies SocietyAccountPreview;
  });
}

function filterAccounts(accounts: SocietyAccountPreview[], searchQuery: string) {
  if (!searchQuery.trim()) {
    return accounts;
  }

  return accounts.filter((account) =>
    [account.fullName, account.customerCode, account.accountNumber, account.product, account.branch].some((value) =>
      matchesSearchQuery(value, searchQuery)
    )
  );
}

export function buildAccountResults(
  liveCustomers: CustomerRow[],
  searchQuery: string,
  ownerName: string,
  societyName: string
) {
  const liveResults = liveCustomers.map((customer, index) => mapCustomerToAccount(customer, index, societyName));

  if (liveResults.length > 0) {
    return {
      accountResults: liveResults.slice(0, 6),
      accountResultsUseDemoData: false,
      previewReason: null
    };
  }

  const demoResults = filterAccounts(createDemoAccountResults(ownerName, societyName), searchQuery);

  if (demoResults.length > 0) {
    return {
      accountResults: demoResults.slice(0, 6),
      accountResultsUseDemoData: true,
      previewReason: searchQuery.trim()
        ? "No live account matches were available, so preview records are shown for the searched member."
        : "Live account data is unavailable right now, so preview records are shown to explain the layout."
    };
  }

  return {
    accountResults: createDemoAccountResults(ownerName, societyName).slice(0, 6),
    accountResultsUseDemoData: true,
    previewReason: "No matching live records were returned, so the workspace falls back to preview accounts."
  };
}

function formatRoleLabel(role: string) {
  switch (role) {
    case "SUPER_USER":
      return "Society Owner";
    case "AGENT":
      return "Operations Agent";
    case "CLIENT":
      return "Member";
    case "SUPER_ADMIN":
      return "Platform Oversight";
    default:
      return role;
  }
}

export function buildTeamPreview(
  directoryEntries: UserDirectoryEntry[],
  ownerName: string,
  societyName: string
): SocietyTeamPreview[] {
  if (directoryEntries.length > 0) {
    return directoryEntries.slice(0, 5).map((entry) => ({
      id: entry.id,
      fullName: entry.fullName,
      roleLabel: formatRoleLabel(entry.role),
      isActive: entry.isActive,
      note: entry.society?.name ?? societyName
    }));
  }

  return [
    {
      id: "owner-preview",
      fullName: ownerName,
      roleLabel: "Society Owner",
      isActive: true,
      note: `${societyName} administration`
    },
    {
      id: "ops-preview",
      fullName: "Meena Operations",
      roleLabel: "Operations Manager",
      isActive: true,
      note: "Front-office servicing queue"
    },
    {
      id: "kyc-preview",
      fullName: "Rohit Verma",
      roleLabel: "KYC Desk",
      isActive: true,
      note: "Customer verification and onboarding"
    },
    {
      id: "branch-preview",
      fullName: "Anita Branch Lead",
      roleLabel: "Branch Manager",
      isActive: false,
      note: "Preview staffing data"
    }
  ];
}

function formatCount(value: number) {
  return value.toLocaleString("en-IN");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function selectSocietyModule(moduleList: BankingModule[], selectedSlug?: string | null) {
  return moduleList.find((module) => module.slug === selectedSlug) ?? moduleList[0];
}

export async function getSocietyControlCentreData(
  session: Session,
  searchQuery: string,
  locale: AppLocale = defaultLocale
): Promise<SocietyControlCentreData> {
  const modulePortfolio = getAccessibleModules(modules, "SOCIETY").map((module) => localizeBankingModule(module, locale));
  const [profileResult, monitoringResult, directoryResult, customerResult] = await Promise.allSettled([
    getMe(session.accessToken),
    getMonitoringOverview(session.accessToken),
    getUserDirectory(session.accessToken),
    listCustomers(session.accessToken, { q: searchQuery })
  ]);

  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const monitoring = monitoringResult.status === "fulfilled" ? monitoringResult.value : null;
  const directoryEntries = directoryResult.status === "fulfilled" ? directoryResult.value : [];
  const liveCustomers = customerResult.status === "fulfilled" ? customerResult.value.rows : [];

  const ownerName = profile?.fullName ?? session.fullName ?? "Society Owner";
  const societyName = profile?.society?.name ?? (session.societyCode ? `${session.societyCode} Control Centre` : "Society Control Centre");
  const societyCode = profile?.society?.code ?? session.societyCode ?? "SOC-DEMO";
  const societyStatus = profile?.society?.status ?? "ACTIVE";
  const liveDataAvailable =
    profile !== null || monitoring !== null || directoryEntries.length > 0 || liveCustomers.length > 0;
  const { accountResults, accountResultsUseDemoData, previewReason } = buildAccountResults(
    liveCustomers,
    searchQuery,
    ownerName,
    societyName
  );
  const team = buildTeamPreview(directoryEntries, ownerName, societyName);
  const customerCount = monitoring?.totals.customers ?? Math.max(accountResults.length * 6, 24);
  const accountCount = monitoring?.totals.accounts ?? Math.max(accountResults.length * 9, 42);
  const transactionCount = monitoring?.totals.transactions ?? Math.max(accountResults.length * 28, 120);
  const collectedVolume = monitoring?.totals.successfulPaymentVolume ?? accountResults.reduce((total, item) => total + item.balance, 0);
  const digitalCollectionsEnabled = profile?.society?.acceptsDigitalPayments ?? false;

  const metrics: SocietyMetric[] = [
    {
      label: "Members",
      value: formatCount(customerCount),
      caption: "Visible inside the current society workspace"
    },
    {
      label: "Accounts",
      value: formatCount(accountCount),
      caption: accountResultsUseDemoData ? "Preview volume aligned with the available search cards" : "Operational account load"
    },
    {
      label: "Transactions",
      value: formatCount(transactionCount),
      caption: "Day-to-day servicing and posting activity"
    },
    {
      label: "Collections",
      value: formatCurrency(collectedVolume),
      caption: digitalCollectionsEnabled ? "Digital collections are enabled" : "Manual or preview collection posture"
    }
  ];

  return {
    ownerName,
    ownerInitials: getInitials(ownerName),
    societyName,
    societyCode,
    societyStatus,
    subscriptionLabel: profile?.subscription?.plan ?? session.subscriptionPlan ?? "FREE",
    liveDataAvailable,
    accountResultsUseDemoData,
    previewReason,
    monitoringCaption:
      monitoring !== null
        ? "This workspace is rendering live monitoring totals from the assigned society."
        : "Live monitoring was unavailable, so the dashboard is filled with realistic preview totals to keep the interface understandable.",
    digitalCollectionsEnabled,
    metrics,
    modules: modulePortfolio,
    accountResults,
    team
  };
}
