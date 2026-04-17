import type { BillingPlansResponse, Society } from "../types";

const CACHE_TTL_MS = 60_000;
const SOCIETIES_CACHE_KEY = "infopath_public_societies";
const BILLING_CACHE_KEY = "infopath_public_billing_plans";
const PLATFORM_STATS_CACHE_KEY = "infopath_platform_stats";

type CacheEnvelope<T> = {
  cachedAt: number;
  value: T;
};

function readCache<T>(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;

    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    key,
    JSON.stringify({
      cachedAt: Date.now(),
      value
    } satisfies CacheEnvelope<T>)
  );
}

export function getCachedPublicSocieties() {
  return readCache<Society[]>(SOCIETIES_CACHE_KEY);
}

export function setCachedPublicSocieties(societies: Society[]) {
  writeCache(SOCIETIES_CACHE_KEY, societies);
}

export function getCachedBillingPlans() {
  return readCache<BillingPlansResponse["plans"]>(BILLING_CACHE_KEY);
}

export function setCachedBillingPlans(plans: BillingPlansResponse["plans"]) {
  writeCache(BILLING_CACHE_KEY, plans);
}

export function getCachedPlatformStats() {
  return readCache<{
    clients: number;
    agents: number;
    societies: number;
    societyAdmins: number;
    platformAdmins: number;
    totalAccounts: number;
    totalDeposits: number;
    totalLoans: number;
    totalTransactions: number;
  }>(PLATFORM_STATS_CACHE_KEY);
}

export function setCachedPlatformStats(stats: {
  clients: number;
  agents: number;
  societies: number;
  societyAdmins: number;
  platformAdmins: number;
  totalAccounts: number;
  totalDeposits: number;
  totalLoans: number;
  totalTransactions: number;
}) {
  writeCache(PLATFORM_STATS_CACHE_KEY, stats);
}
