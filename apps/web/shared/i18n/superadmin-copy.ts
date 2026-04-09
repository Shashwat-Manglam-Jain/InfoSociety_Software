import type { AppLocale } from "./translations";

type LocaleTag = "en-IN" | "hi-IN" | "mr-IN";

type SuperadminCopy = {
  localeTag: LocaleTag;
  currency: {
    symbol: string;
    croreSuffix: string;
    lakhSuffix: string;
  };
  nav: {
    executiveSuite: string;
    platformGovernance: string;
    portfolioSnapshot: string;
    approvalsRequests: string;
    platformAnalytics: string;
    networkExplorer: string;
    reportGeneration: string;
    systemUiSettings: string;
  };
  common: {
    loadError: string;
    retry: string;
    loadingMonitoring: string;
  };
  overview: {
    portfolioTitle: string;
    activeSocieties: string;
    totalMembers: string;
    systemLiquidity: string;
    awaitingReview: string;
    stable: string;
    accounts: string;
    transactions: string;
    platformAgents: string;
    platformClients: string;
    digitalCollectionReady: string;
    active: string;
    coverage: string;
    topBalancesTitle: string;
    topBalancesSubtitle: string;
    liveRows: string;
    noBalanceData: string;
    statusDistributionTitle: string;
    statusDistributionSubtitle: string;
    noSocieties: string;
    governanceTitle: string;
    governanceWaiting: string;
    governanceClear: string;
    openApprovalQueue: string;
    reviewSocietyNetwork: string;
    roleBreakdownTitle: string;
    societyOwners: string;
    agents: string;
    clients: string;
    shareOfPlatform: string;
    statusActive: string;
    statusPending: string;
    statusSuspended: string;
  };
  analytics: {
    overline: string;
    title: string;
    intelligenceTitle: string;
    volumeTitle: string;
    volumeSubtitle: string;
    months: [string, string, string, string, string, string];
    tableHeaders: [string, string, string, string, string, string, string, string, string];
    inspect: string;
    noSocietiesFound: string;
    planPremium: string;
    planCommon: string;
    statusActive: string;
    statusPending: string;
    statusSuspended: string;
  };
};

const superadminCopy: Record<AppLocale, SuperadminCopy> = {
  en: {
    localeTag: "en-IN",
    currency: {
      symbol: "\u20B9",
      croreSuffix: "Cr",
      lakhSuffix: "L"
    },
    nav: {
      executiveSuite: "EXECUTIVE SUITE",
      platformGovernance: "PLATFORM GOVERNANCE",
      portfolioSnapshot: "Portfolio Snapshot",
      approvalsRequests: "Approvals & Requests",
      platformAnalytics: "Platform Analytics",
      networkExplorer: "Network Explorer",
      reportGeneration: "Report Generation",
      systemUiSettings: "System UI Settings"
    },
    common: {
      loadError: "Unable to load platform monitoring.",
      retry: "Retry",
      loadingMonitoring: "Loading platform monitoring..."
    },
    overview: {
      portfolioTitle: "Platform Portfolio Snapshot",
      activeSocieties: "Active Societies",
      totalMembers: "Total Members",
      systemLiquidity: "System Liquidity",
      awaitingReview: "{{count}} Awaiting Review",
      stable: "STABLE",
      accounts: "{{count}} Accounts",
      transactions: "{{count}} Transactions",
      platformAgents: "Platform Agents",
      platformClients: "Platform Clients",
      digitalCollectionReady: "Digital Collection Ready",
      active: "Active",
      coverage: "{{count}}% Coverage",
      topBalancesTitle: "Top Society Balances",
      topBalancesSubtitle: "Live liquidity by approved society",
      liveRows: "{{count}} Live Rows",
      noBalanceData: "No approved society balance data is available yet.",
      statusDistributionTitle: "Society Status Distribution",
      statusDistributionSubtitle: "Current onboarding and access state",
      noSocieties: "No societies are available yet.",
      governanceTitle: "Governance Snapshot",
      governanceWaiting:
        "{{pending}} societies are waiting for review, and {{digital}} societies already support digital collections.",
      governanceClear: "No approval backlog right now. {{digital}} societies currently support digital collections.",
      openApprovalQueue: "Open Approval Queue",
      reviewSocietyNetwork: "Review Society Network",
      roleBreakdownTitle: "Platform Role Breakdown",
      societyOwners: "Society Owners",
      agents: "Agents",
      clients: "Clients",
      shareOfPlatform: "Share of platform network",
      statusActive: "Active",
      statusPending: "Pending",
      statusSuspended: "Suspended"
    },
    analytics: {
      overline: "ANALYTICS & ENROLLMENTS",
      title: "Platform Analytics",
      intelligenceTitle: "Society Intelligence Data",
      volumeTitle: "Platform-Wide Financial Volume",
      volumeSubtitle: "Aggregated Transaction Velocity (Past 12 Months)",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      tableHeaders: ["Society", "Plan", "Status", "Members", "Accounts", "Agents", "Balance", "Transactions", "Actions"],
      inspect: "Inspect",
      noSocietiesFound: "No societies found.",
      planPremium: "PREMIUM",
      planCommon: "COMMON",
      statusActive: "Active",
      statusPending: "Pending",
      statusSuspended: "Suspended"
    }
  },
  hi: {
    localeTag: "hi-IN",
    currency: {
      symbol: "\u20B9",
      croreSuffix: "\u0915\u0930\u094b\u0921\u093c",
      lakhSuffix: "\u0932\u093e\u0916"
    },
    nav: {
      executiveSuite: "\u090f\u0915\u094d\u091c\u093f\u0915\u094d\u092f\u0942\u091f\u093f\u0935 \u0938\u0942\u091f",
      platformGovernance: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u0936\u093e\u0938\u0928",
      portfolioSnapshot: "\u092a\u094b\u0930\u094d\u091f\u092b\u094b\u0932\u093f\u092f\u094b \u0938\u094d\u0928\u0948\u092a\u0936\u0949\u091f",
      approvalsRequests: "\u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u0914\u0930 \u0905\u0928\u0941\u0930\u094b\u0927",
      platformAnalytics: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
      networkExplorer: "\u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u090f\u0915\u094d\u0938\u092a\u094d\u0932\u094b\u0930\u0930",
      reportGeneration: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0947\u0928\u0930\u0947\u0936\u0928",
      systemUiSettings: "\u0938\u093f\u0938\u094d\u091f\u092e UI \u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938"
    },
    common: {
      loadError: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0940\u0964",
      retry: "\u092b\u093f\u0930 \u0938\u0947 \u092a\u094d\u0930\u092f\u093e\u0938 \u0915\u0930\u0947\u0902",
      loadingMonitoring: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917 \u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u0940 \u0939\u0948..."
    },
    overview: {
      portfolioTitle: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u092a\u094b\u0930\u094d\u091f\u092b\u094b\u0932\u093f\u092f\u094b \u0938\u094d\u0928\u0948\u092a\u0936\u0949\u091f",
      activeSocieties: "\u0938\u0915\u094d\u0930\u093f\u092f \u0938\u094b\u0938\u093e\u0907\u091f\u093f\u092f\u093e\u0901",
      totalMembers: "\u0915\u0941\u0932 \u0938\u0926\u0938\u094d\u092f",
      systemLiquidity: "\u0938\u093f\u0938\u094d\u091f\u092e \u0924\u0930\u0932\u0924\u093e",
      awaitingReview: "{{count}} \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0940 \u092a\u094d\u0930\u0924\u0940\u0915\u094d\u0937\u093e \u092e\u0947\u0902",
      stable: "\u0938\u094d\u0925\u093f\u0930",
      accounts: "{{count}} \u0916\u093e\u0924\u0947",
      transactions: "{{count}} \u0932\u0947\u0928\u0926\u0947\u0928",
      platformAgents: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u090f\u091c\u0947\u0902\u091f",
      platformClients: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u0915\u094d\u0932\u093e\u0907\u0902\u091f",
      digitalCollectionReady: "\u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928 \u0915\u0947 \u0932\u093f\u090f \u0924\u0948\u092f\u093e\u0930",
      active: "\u0938\u0915\u094d\u0930\u093f\u092f",
      coverage: "{{count}}% \u0915\u0935\u0930\u0947\u091c",
      topBalancesTitle: "\u0936\u0940\u0930\u094d\u0937 \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u092c\u0948\u0932\u0947\u0902\u0938",
      topBalancesSubtitle: "\u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0938\u094b\u0938\u093e\u0907\u091f\u093f\u092f\u094b\u0902 \u0915\u0940 \u0932\u093e\u0907\u0935 \u0924\u0930\u0932\u0924\u093e",
      liveRows: "{{count}} \u0932\u093e\u0907\u0935 \u0930\u094b",
      noBalanceData: "\u0905\u092d\u0940 \u0915\u094b\u0908 \u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u092c\u0948\u0932\u0947\u0902\u0938 \u0921\u0947\u091f\u093e \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
      statusDistributionTitle: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0938\u094d\u0925\u093f\u0924\u093f \u0935\u093f\u0924\u0930\u0923",
      statusDistributionSubtitle: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0911\u0928\u092c\u094b\u0930\u094d\u0921\u093f\u0902\u0917 \u0914\u0930 \u090f\u0915\u094d\u0938\u0947\u0938 \u0938\u094d\u0925\u093f\u0924\u093f",
      noSocieties: "\u0905\u092d\u0940 \u0915\u094b\u0908 \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
      governanceTitle: "\u0917\u0935\u0930\u094d\u0928\u0947\u0902\u0938 \u0938\u094d\u0928\u0948\u092a\u0936\u0949\u091f",
      governanceWaiting:
        "{{pending}} \u0938\u094b\u0938\u093e\u0907\u091f\u093f\u092f\u093e\u0901 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0940 \u092a\u094d\u0930\u0924\u0940\u0915\u094d\u0937\u093e \u092e\u0947\u0902 \u0939\u0948\u0902, \u0914\u0930 {{digital}} \u0938\u094b\u0938\u093e\u0907\u091f\u093f\u092f\u093e\u0901 \u092a\u0939\u0932\u0947 \u0938\u0947 \u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928 \u0938\u092e\u0930\u094d\u0925\u093f\u0924 \u0915\u0930\u0924\u0940 \u0939\u0948\u0902\u0964",
      governanceClear:
        "\u0905\u092d\u0940 \u0915\u094b\u0908 \u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u092c\u0948\u0915\u0932\u0949\u0917 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 {{digital}} \u0938\u094b\u0938\u093e\u0907\u091f\u093f\u092f\u093e\u0901 \u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u092e\u0947\u0902 \u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928 \u0938\u092e\u0930\u094d\u0925\u093f\u0924 \u0915\u0930\u0924\u0940 \u0939\u0948\u0902\u0964",
      openApprovalQueue: "\u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u0915\u0924\u093e\u0930 \u0916\u094b\u0932\u0947\u0902",
      reviewSocietyNetwork: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0930\u0947\u0902",
      roleBreakdownTitle: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u0930\u094b\u0932 \u092c\u094d\u0930\u0947\u0915\u0921\u093e\u0909\u0928",
      societyOwners: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u092e\u093e\u0932\u093f\u0915",
      agents: "\u090f\u091c\u0947\u0902\u091f",
      clients: "\u0915\u094d\u0932\u093e\u0907\u0902\u091f",
      shareOfPlatform: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u092e\u0947\u0902 \u0939\u093f\u0938\u094d\u0938\u093e",
      statusActive: "\u0938\u0915\u094d\u0930\u093f\u092f",
      statusPending: "\u0932\u0902\u092c\u093f\u0924",
      statusSuspended: "\u0928\u093f\u0932\u0902\u092c\u093f\u0924"
    },
    analytics: {
      overline: "\u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938 \u0914\u0930 \u0928\u093e\u092e\u093e\u0902\u0915\u0928",
      title: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
      intelligenceTitle: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0907\u0902\u091f\u0947\u0932\u093f\u091c\u0947\u0902\u0938 \u0921\u0947\u091f\u093e",
      volumeTitle: "\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e-\u0935\u094d\u092f\u093e\u092a\u0940 \u0935\u093f\u0924\u094d\u0924\u0940\u092f \u0935\u0949\u0932\u094d\u092f\u0942\u092e",
      volumeSubtitle: "\u0938\u0902\u0915\u0932\u093f\u0924 \u0932\u0947\u0928\u0926\u0947\u0928 \u0917\u0924\u093f (\u092a\u093f\u091b\u0932\u0947 12 \u092e\u0939\u0940\u0928\u0947)",
      months: ["\u091c\u0928", "\u092b\u0930", "\u092e\u093e\u0930", "\u0905\u092a\u094d\u0930", "\u092e\u0908", "\u091c\u0942\u0928"],
      tableHeaders: ["\u0938\u094b\u0938\u093e\u0907\u091f\u0940", "\u092a\u094d\u0932\u093e\u0928", "\u0938\u094d\u0925\u093f\u0924\u093f", "\u0938\u0926\u0938\u094d\u092f", "\u0916\u093e\u0924\u0947", "\u090f\u091c\u0947\u0902\u091f", "\u092c\u0948\u0932\u0947\u0902\u0938", "\u0932\u0947\u0928\u0926\u0947\u0928", "\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908"],
      inspect: "\u091c\u093e\u0902\u091a\u0947\u0902",
      noSocietiesFound: "\u0915\u094b\u0908 \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964",
      planPremium: "\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e",
      planCommon: "\u0915\u0949\u092e\u0928",
      statusActive: "\u0938\u0915\u094d\u0930\u093f\u092f",
      statusPending: "\u0932\u0902\u092c\u093f\u0924",
      statusSuspended: "\u0928\u093f\u0932\u0902\u092c\u093f\u0924"
    }
  },
  mr: {
    localeTag: "mr-IN",
    currency: {
      symbol: "\u20B9",
      croreSuffix: "\u0915\u094b\u091f\u0940",
      lakhSuffix: "\u0932\u093e\u0916"
    },
    nav: {
      executiveSuite: "\u090f\u0915\u094d\u091c\u093f\u0915\u094d\u092f\u0942\u091f\u093f\u0935 \u0938\u0942\u091f",
      platformGovernance: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u0936\u093e\u0938\u0928",
      portfolioSnapshot: "\u092a\u094b\u0930\u094d\u091f\u092b\u094b\u0932\u093f\u0913 \u0938\u094d\u0928\u0945\u092a\u0936\u0949\u091f",
      approvalsRequests: "\u092e\u0902\u091c\u0941\u0930\u0940 \u0906\u0923\u093f \u0935\u093f\u0928\u0902\u0924\u094d\u092f\u093e",
      platformAnalytics: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u090f\u0928\u0945\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
      networkExplorer: "\u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u090f\u0915\u094d\u0938\u092a\u094d\u0932\u094b\u0930\u0930",
      reportGeneration: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0924\u092f\u093e\u0930\u0940",
      systemUiSettings: "\u0938\u093f\u0938\u094d\u091f\u092e UI \u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938"
    },
    common: {
      loadError: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940.",
      retry: "\u092a\u0941\u0928\u094d\u0939\u093e \u092a\u094d\u0930\u092f\u0924\u094d\u0928 \u0915\u0930\u093e",
      loadingMonitoring: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917 \u0932\u094b\u0921 \u0939\u094b\u0924 \u0906\u0939\u0947..."
    },
    overview: {
      portfolioTitle: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u092a\u094b\u0930\u094d\u091f\u092b\u094b\u0932\u093f\u0913 \u0938\u094d\u0928\u0945\u092a\u0936\u0949\u091f",
      activeSocieties: "\u0938\u0915\u094d\u0930\u093f\u092f \u0938\u094b\u0938\u093e\u092f\u091f\u094d\u092f\u093e",
      totalMembers: "\u090f\u0915\u0942\u0923 \u0938\u0926\u0938\u094d\u092f",
      systemLiquidity: "\u0938\u093f\u0938\u094d\u091f\u092e \u0932\u093f\u0915\u094d\u0935\u093f\u0921\u093f\u091f\u0940",
      awaitingReview: "{{count}} \u092a\u0930\u0940\u0915\u094d\u0937\u0923\u093e\u091a\u094d\u092f\u093e \u092a\u094d\u0930\u0924\u0940\u0915\u094d\u0937\u0947\u0924",
      stable: "\u0938\u094d\u0925\u093f\u0930",
      accounts: "{{count}} \u0916\u093e\u0924\u0940",
      transactions: "{{count}} \u0935\u094d\u092f\u0935\u0939\u093e\u0930",
      platformAgents: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u090f\u091c\u0902\u091f",
      platformClients: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u0915\u094d\u0932\u093e\u092f\u0902\u091f",
      digitalCollectionReady: "\u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928\u0938\u093e\u0920\u0940 \u0924\u092f\u093e\u0930",
      active: "\u0938\u0915\u094d\u0930\u093f\u092f",
      coverage: "{{count}}% \u0915\u0935\u094d\u0939\u0930\u0947\u091c",
      topBalancesTitle: "\u0936\u0940\u0930\u094d\u0937 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092c\u0945\u0932\u0928\u094d\u0938",
      topBalancesSubtitle: "\u092e\u0902\u091c\u0942\u0930 \u0938\u094b\u0938\u093e\u092f\u091f\u094d\u092f\u093e\u0902\u091a\u0940 \u0932\u093e\u0907\u0935 \u0932\u093f\u0915\u094d\u0935\u093f\u0921\u093f\u091f\u0940",
      liveRows: "{{count}} \u0932\u093e\u0907\u0935 \u0930\u094b\u091c",
      noBalanceData: "\u0905\u0926\u094d\u092f\u093e\u092a \u0915\u094b\u0923\u0924\u093e\u0939\u0940 \u092e\u0902\u091c\u0942\u0930 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092c\u0945\u0932\u0928\u094d\u0938 \u0921\u0947\u091f\u093e \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u093e\u0939\u0940.",
      statusDistributionTitle: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0938\u094d\u0925\u093f\u0924\u0940 \u0935\u093f\u0924\u0930\u0923",
      statusDistributionSubtitle: "\u0938\u0927\u094d\u092f\u093e\u091a\u0940 onboarding \u0906\u0923\u093f access \u0938\u094d\u0925\u093f\u0924\u0940",
      noSocieties: "\u0905\u0926\u094d\u092f\u093e\u092a \u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u093e\u0939\u0940.",
      governanceTitle: "\u0917\u0935\u094d\u0939\u0930\u094d\u0928\u0928\u094d\u0938 \u0938\u094d\u0928\u0945\u092a\u0936\u0949\u091f",
      governanceWaiting:
        "{{pending}} \u0938\u094b\u0938\u093e\u092f\u091f\u094d\u092f\u093e \u092a\u0930\u0940\u0915\u094d\u0937\u0923\u093e\u091a\u094d\u092f\u093e \u092a\u094d\u0930\u0924\u0940\u0915\u094d\u0937\u0947\u0924 \u0906\u0939\u0947\u0924, \u0906\u0923\u093f {{digital}} \u0938\u094b\u0938\u093e\u092f\u091f\u094d\u092f\u093e \u0906\u0927\u0940\u091a \u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928 \u0938\u092e\u0930\u094d\u0925\u093f\u0924 \u0915\u0930\u0924\u093e\u0924.",
      governanceClear:
        "\u0938\u0927\u094d\u092f\u093e approval backlog \u0928\u093e\u0939\u0940. {{digital}} \u0938\u094b\u0938\u093e\u092f\u091f\u094d\u092f\u093e \u0938\u0927\u094d\u092f\u093e \u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928 \u0938\u092e\u0930\u094d\u0925\u093f\u0924 \u0915\u0930\u0924\u093e\u0924.",
      openApprovalQueue: "approval queue \u0909\u0918\u0921\u093e",
      reviewSocietyNetwork: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0928\u0947\u091f\u0935\u0930\u094d\u0915 \u092a\u0939\u093e",
      roleBreakdownTitle: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u0930\u094b\u0932 \u092c\u094d\u0930\u0947\u0915\u0921\u093e\u0909\u0928",
      societyOwners: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092e\u093e\u0932\u0915",
      agents: "\u090f\u091c\u0902\u091f",
      clients: "\u0915\u094d\u0932\u093e\u092f\u0902\u091f",
      shareOfPlatform: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u0928\u0947\u091f\u0935\u0930\u094d\u0915\u092e\u0927\u0940\u0932 \u0939\u093f\u0938\u094d\u0938\u093e",
      statusActive: "\u0938\u0915\u094d\u0930\u093f\u092f",
      statusPending: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924",
      statusSuspended: "\u0928\u093f\u0932\u0902\u092c\u093f\u0924"
    },
    analytics: {
      overline: "\u090f\u0928\u0945\u0932\u093f\u091f\u093f\u0915\u094d\u0938 \u0906\u0923\u093f \u0928\u094b\u0902\u0926\u0923\u094d\u092f\u093e",
      title: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e \u090f\u0928\u0945\u0932\u093f\u091f\u093f\u0915\u094d\u0938",
      intelligenceTitle: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0907\u0902\u091f\u0947\u0932\u093f\u091c\u0928\u094d\u0938 \u0921\u0947\u091f\u093e",
      volumeTitle: "\u092a\u094d\u0932\u0945\u091f\u092b\u0949\u0930\u094d\u092e-\u0935\u094d\u092f\u093e\u092a\u0940 \u0906\u0930\u094d\u0925\u093f\u0915 \u0935\u0949\u0932\u094d\u092f\u0942\u092e",
      volumeSubtitle: "\u090f\u0915\u0924\u094d\u0930\u093f\u0924 \u0935\u094d\u092f\u0935\u0939\u093e\u0930 \u0917\u0924\u0940 (\u092e\u093e\u0917\u0940\u0932 12 \u092e\u0939\u093f\u0928\u0947)",
      months: ["\u091c\u0945\u0928", "\u092b\u0947\u092c", "\u092e\u093e\u0930\u094d\u091a", "\u090f\u092a\u094d\u0930\u093f", "\u092e\u0947", "\u091c\u0942\u0928"],
      tableHeaders: ["\u0938\u094b\u0938\u093e\u092f\u091f\u0940", "\u092a\u094d\u0932\u093e\u0928", "\u0938\u094d\u0925\u093f\u0924\u0940", "\u0938\u0926\u0938\u094d\u092f", "\u0916\u093e\u0924\u0940", "\u090f\u091c\u0902\u091f", "\u092c\u0945\u0932\u0928\u094d\u0938", "\u0935\u094d\u092f\u0935\u0939\u093e\u0930", "\u0915\u094d\u0930\u093f\u092f\u093e"],
      inspect: "\u092a\u0939\u093e",
      noSocietiesFound: "\u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0938\u093e\u092a\u0921\u0932\u0940 \u0928\u093e\u0939\u0940.",
      planPremium: "\u092a\u094d\u0930\u0940\u092e\u093f\u092f\u092e",
      planCommon: "\u0915\u0949\u092e\u0928",
      statusActive: "\u0938\u0915\u094d\u0930\u093f\u092f",
      statusPending: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924",
      statusSuspended: "\u0928\u093f\u0932\u0902\u092c\u093f\u0924"
    }
  }
};

export function getSuperadminCopy(locale: AppLocale) {
  return superadminCopy[locale] ?? superadminCopy.en;
}
