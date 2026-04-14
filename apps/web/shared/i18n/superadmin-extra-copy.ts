import type { AppLocale } from "./translations";

type SuperadminExtraCopy = {
  approvals: {
    overline: string;
    title: string;
    description: string;
    loadError: string;
    actionFailed: string;
    approveToast: string;
    rejectToast: string;
    provisionedToast: string;
    pendingTab: string;
    rejectedTab: string;
    noRequestsTitle: string;
    noPending: string;
    noRejected: string;
    societyId: string;
    proposedMembers: string;
    initialAccounts: string;
    approve: string;
    reject: string;
    reevaluate: string;
  };
  reports: {
    overline: string;
    title: string;
    description: string;
    generatorTitle: string;
    generatorDescription: string;
    reportType: string;
    fromDate: string;
    toDate: string;
    generating: string;
    generate: string;
    jobsTitle: string;
    jobsDescription: string;
    download: string;
    running: string;
    headers: [string, string, string, string];
    options: {
      allSocieties: string;
      pendingAudits: string;
      financialAudit: string;
      systemAgents: string;
      customMatrix: string;
    };
    customFiltersTitle: string;
    targetSocietyId: string;
    targetSocietyPlaceholder: string;
    agentName: string;
    agentPlaceholder: string;
    clientName: string;
    clientPlaceholder: string;
    targetAccountType: string;
    allAccounts: string;
    loans: string;
    savings: string;
    fixedDeposits: string;
    booleanToggles: string;
    includeInactiveUsers: string;
    includeClosedLoans: string;
    embedKycMetadata: string;
    pdfHighResolution: string;
  };
  settings: {
    title: string;
    description: string;
    websiteContent: string;
    platformMasterName: string;
    heroHeadline: string;
    heroSubtext: string;
    supportEmail: string;
    deploying: string;
    publish: string;
    syncTitle: string;
    syncDescription: string;
    warning: string;
    successToast: string;
  };
  security: {
    accountTypeLabel: string;
    title: string;
    description: string;
  };
};

const superadminExtraCopy: Record<AppLocale, SuperadminExtraCopy> = {
  en: {
    approvals: {
      overline: "ENROLLMENT QUEUE",
      title: "Application Approvals",
      description: "Review new society applications, verify background checks, and activate valid platform access requests.",
      loadError: "Load error",
      actionFailed: "Action failed.",
      approveToast: "Society approved successfully.",
      rejectToast: "Society application rejected.",
      provisionedToast: "Society approved. Recovery admin @{{username}} was created with temporary password {{password}}.",
      pendingTab: "Pending Approval ({{count}})",
      rejectedTab: "Rejected / Suspended ({{count}})",
      noRequestsTitle: "No requests found",
      noPending: "You're all caught up! No pending applications.",
      noRejected: "No rejected applications in the system.",
      societyId: "ID",
      proposedMembers: "PROPOSED MEMBERS",
      initialAccounts: "INITIAL ACCOUNTS",
      approve: "Approve",
      reject: "Reject",
      reevaluate: "Re-evaluate"
    },
    reports: {
      overline: "COMMAND CENTER",
      title: "Report Generation",
      description: "Generate and export global system reports, governance audits, and portfolio statements.",
      generatorTitle: "Generate Audit Report",
      generatorDescription: "Configure platform metrics to compile an executive summary. Data is consolidated across all verified societies.",
      reportType: "Report Type",
      fromDate: "From Date",
      toDate: "To Date",
      generating: "Compiling Data...",
      generate: "Generate Audit",
      jobsTitle: "Recent Generation Jobs",
      jobsDescription: "Generated artifacts are securely vaulted for up to 30 days.",
      download: "Download",
      running: "RUNNING",
      headers: ["REPORT", "CATEGORY", "DATE", "ACTIONS"],
      options: {
        allSocieties: "Active Societies Overview",
        pendingAudits: "Pending Approvals & Suspend Logs",
        financialAudit: "Global Financial Portfolio (Liquidity)",
        systemAgents: "Network Agent & User Distribution",
        customMatrix: "Custom Data Matrix (Granular)"
      },
      customFiltersTitle: "Custom Advanced Filters",
      targetSocietyId: "Target Society ID (Optional)",
      targetSocietyPlaceholder: "e.g. SOC-001 or Type 'ALL'",
      agentName: "Agent Name / ID",
      agentPlaceholder: "Filter users strictly under a specific agent",
      clientName: "Specific Client Name / ID",
      clientPlaceholder: "Generate isolated report for this user only",
      targetAccountType: "Target Account Type",
      allAccounts: "All Accounts (Mixed)",
      loans: "Loans (Issuance & Recovery Only)",
      savings: "Savings (Liquid Baseline)",
      fixedDeposits: "Fixed Deposits (Locked Assets)",
      booleanToggles: "Boolean Toggles",
      includeInactiveUsers: "Include Inactive Users",
      includeClosedLoans: "Include Closed Loans",
      embedKycMetadata: "Embed KYC Metadata",
      pdfHighResolution: "PDF High-Resolution"
    },
    settings: {
      title: "System Configuration",
      description: "Modify global frontend attributes, brand identifiers, and public-facing text schemas.",
      websiteContent: "Public Website Content",
      platformMasterName: "Platform Master Name",
      heroHeadline: "Landing Hero Headline",
      heroSubtext: "Landing Hero Subtext",
      supportEmail: "Public Support Email",
      deploying: "Deploying...",
      publish: "Publish Settings",
      syncTitle: "Real-time Syncing",
      syncDescription: "Changes published here are instantly cached to global CDN endpoints. Society owners and new users will immediately see the updated UI configurations.",
      warning: "Modifying the Platform Master Name might affect globally issued invoices and terms agreements.",
      successToast: "Platform UI configuration updated successfully!"
    },
    security: {
      accountTypeLabel: "Platform Superadmin",
      title: "Security Center Central Hub",
      description: "Under development. This will host Global Firewall rules and advanced MFA controls."
    }
  },
  hi: {
    approvals: {
      overline: "\u0928\u093e\u092e\u093e\u0902\u0915\u0928 \u0915\u0924\u093e\u0930",
      title: "\u0906\u0935\u0947\u0926\u0928 \u0905\u0928\u0941\u092e\u094b\u0926\u0928",
      description: "\u0928\u0908 \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0906\u0935\u0947\u0926\u0928\u094b\u0902 \u0915\u0940 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0930\u0947\u0902, \u092a\u0943\u0937\u094d\u0920\u092d\u0942\u092e\u093f \u091c\u093e\u0902\u091a \u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u0930\u0947\u0902, \u0914\u0930 \u0935\u0948\u0927 \u090f\u0915\u094d\u0938\u0947\u0938 \u0905\u0928\u0941\u0930\u094b\u0927\u094b\u0902 \u0915\u094b \u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930\u0947\u0902\u0964",
      loadError: "\u0932\u094b\u0921 \u0924\u094d\u0930\u0941\u091f\u093f",
      actionFailed: "\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908 \u0935\u093f\u092b\u0932 \u0930\u0939\u0940\u0964",
      approveToast: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0939\u0941\u0908\u0964",
      rejectToast: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0906\u0935\u0947\u0926\u0928 \u0905\u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0915\u093f\u092f\u093e \u0917\u092f\u093e\u0964",
      provisionedToast: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0939\u0941\u0908\u0964 recovery admin @{{username}} \u0905\u0938\u094d\u0925\u093e\u092f\u0940 password {{password}} \u0915\u0947 \u0938\u093e\u0925 \u092c\u0928\u093e\u092f\u093e \u0917\u092f\u093e\u0964",
      pendingTab: "\u0932\u0902\u092c\u093f\u0924 \u0905\u0928\u0941\u092e\u094b\u0926\u0928 ({{count}})",
      rejectedTab: "\u0905\u0938\u094d\u0935\u0940\u0915\u0943\u0924 / \u0928\u093f\u0932\u0902\u092c\u093f\u0924 ({{count}})",
      noRequestsTitle: "\u0915\u094b\u0908 \u0905\u0928\u0941\u0930\u094b\u0927 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e",
      noPending: "\u0906\u092a \u092a\u0942\u0930\u0940 \u0924\u0930\u0939 \u0938\u0947 \u0905\u092a-\u091f\u0942-\u0921\u0947\u091f \u0939\u0948\u0902! \u0915\u094b\u0908 \u0932\u0902\u092c\u093f\u0924 \u0906\u0935\u0947\u0926\u0928 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
      noRejected: "\u0938\u093f\u0938\u094d\u091f\u092e \u092e\u0947\u0902 \u0915\u094b\u0908 \u0905\u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0906\u0935\u0947\u0926\u0928 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
      societyId: "ID",
      proposedMembers: "\u092a\u094d\u0930\u0938\u094d\u0924\u093e\u0935\u093f\u0924 \u0938\u0926\u0938\u094d\u092f",
      initialAccounts: "\u092a\u094d\u0930\u093e\u0930\u0902\u092d\u093f\u0915 \u0916\u093e\u0924\u0947",
      approve: "\u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0915\u0930\u0947\u0902",
      reject: "\u0905\u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0915\u0930\u0947\u0902",
      reevaluate: "\u092a\u0941\u0928\u0903 \u0938\u092e\u0940\u0915\u094d\u0937\u093e"
    },
    reports: {
      overline: "\u0915\u092e\u093e\u0902\u0921 \u0938\u0947\u0902\u091f\u0930",
      title: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0947\u0928\u0930\u0947\u0936\u0928",
      description: "\u0917\u094d\u0932\u094b\u092c\u0932 \u0938\u093f\u0938\u094d\u091f\u092e \u0930\u093f\u092a\u094b\u0930\u094d\u091f, governance audit \u0914\u0930 portfolio statement \u0924\u0948\u092f\u093e\u0930 \u0914\u0930 export \u0915\u0930\u0947\u0902\u0964",
      generatorTitle: "\u0911\u0921\u093f\u091f \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u0947\u0902",
      generatorDescription: "\u090f\u0915 executive summary \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f platform metrics configure \u0915\u0930\u0947\u0902\u0964 data \u0938\u092d\u0940 verified societies \u0938\u0947 consolidate \u0915\u093f\u092f\u093e \u091c\u093e\u0924\u093e \u0939\u0948\u0964",
      reportType: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u092a\u094d\u0930\u0915\u093e\u0930",
      fromDate: "\u0936\u0941\u0930\u0941 \u0924\u093e\u0930\u0940\u0916",
      toDate: "\u0905\u0902\u0924\u093f\u092e \u0924\u093e\u0930\u0940\u0916",
      generating: "\u0921\u0947\u091f\u093e \u0938\u0902\u0915\u0932\u093f\u0924 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...",
      generate: "\u0911\u0921\u093f\u091f \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u0947\u0902",
      jobsTitle: "\u0939\u093e\u0932 \u0915\u0947 generation jobs",
      jobsDescription: "\u0924\u0948\u092f\u093e\u0930 artifacts \u0915\u094b 30 \u0926\u093f\u0928 \u0924\u0915 secure vault \u092e\u0947\u0902 \u0930\u0916\u093e \u091c\u093e\u0924\u093e \u0939\u0948\u0964",
      download: "\u0921\u093e\u0909\u0928\u0932\u094b\u0921",
      running: "\u091a\u093e\u0932\u0942",
      headers: ["\u0930\u093f\u092a\u094b\u0930\u094d\u091f", "\u0936\u094d\u0930\u0947\u0923\u0940", "\u0924\u093e\u0930\u0940\u0916", "\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908"],
      options: {
        allSocieties: "\u0938\u0915\u094d\u0930\u093f\u092f \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0913\u0935\u0930\u0935\u094d\u092f\u0942",
        pendingAudits: "\u0932\u0902\u092c\u093f\u0924 \u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u0914\u0930 suspend logs",
        financialAudit: "\u0917\u094d\u0932\u094b\u092c\u0932 financial portfolio (liquidity)",
        systemAgents: "\u0928\u0947\u091f\u0935\u0930\u094d\u0915 agent \u0914\u0930 user distribution",
        customMatrix: "\u0915\u0938\u094d\u091f\u092e data matrix (granular)"
      },
      customFiltersTitle: "\u0915\u0938\u094d\u091f\u092e advanced filters",
      targetSocietyId: "Target Society ID (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      targetSocietyPlaceholder: "\u0909\u0926\u093e. SOC-001 \u092f\u093e 'ALL' \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902",
      agentName: "Agent Name / ID",
      agentPlaceholder: "\u0915\u0947\u0935\u0932 \u0915\u093f\u0938\u0940 \u0935\u093f\u0936\u093f\u0937\u094d\u091f agent \u0915\u0947 \u0905\u0927\u0940\u0928 users \u0915\u094b filter \u0915\u0930\u0947\u0902",
      clientName: "Specific Client Name / ID",
      clientPlaceholder: "\u0915\u0947\u0935\u0932 \u0907\u0938 user \u0915\u0947 \u0932\u093f\u090f isolated report \u0924\u0948\u092f\u093e\u0930 \u0915\u0930\u0947\u0902",
      targetAccountType: "Target Account Type",
      allAccounts: "All Accounts (Mixed)",
      loans: "Loans (Issuance & Recovery Only)",
      savings: "Savings (Liquid Baseline)",
      fixedDeposits: "Fixed Deposits (Locked Assets)",
      booleanToggles: "Boolean Toggles",
      includeInactiveUsers: "Inactive Users \u0936\u093e\u092e\u093f\u0932 \u0915\u0930\u0947\u0902",
      includeClosedLoans: "Closed Loans \u0936\u093e\u092e\u093f\u0932 \u0915\u0930\u0947\u0902",
      embedKycMetadata: "KYC Metadata \u090f\u092e\u094d\u092c\u0947\u0921 \u0915\u0930\u0947\u0902",
      pdfHighResolution: "PDF High-Resolution"
    },
    settings: {
      title: "\u0938\u093f\u0938\u094d\u091f\u092e \u0915\u0902\u092b\u093f\u0917\u0930\u0947\u0936\u0928",
      description: "\u0917\u094d\u0932\u094b\u092c\u0932 frontend attributes, brand identifiers \u0914\u0930 public-facing text schema \u092e\u0947\u0902 \u092a\u0930\u093f\u0935\u0930\u094d\u0924\u0928 \u0915\u0930\u0947\u0902\u0964",
      websiteContent: "Public Website Content",
      platformMasterName: "Platform Master Name",
      heroHeadline: "Landing Hero Headline",
      heroSubtext: "Landing Hero Subtext",
      supportEmail: "Public Support Email",
      deploying: "\u0924\u0948\u0928\u093e\u0924 \u0915\u093f\u092f\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948...",
      publish: "Settings Publish \u0915\u0930\u0947\u0902",
      syncTitle: "Real-time Syncing",
      syncDescription: "\u092f\u0939\u093e\u0901 publish \u0915\u093f\u090f \u0917\u090f changes \u0924\u0941\u0930\u0902\u0924 global CDN endpoints \u092a\u0930 cache \u0939\u094b \u091c\u093e\u0924\u0947 \u0939\u0948\u0902\u0964 society owners \u0914\u0930 \u0928\u090f users \u0924\u0941\u0930\u0902\u0924 updated UI \u0926\u0947\u0916\u0947\u0902\u0917\u0947\u0964",
      warning: "Platform Master Name \u092e\u0947\u0902 \u092a\u0930\u093f\u0935\u0930\u094d\u0924\u0928 globally issued invoice \u0914\u0930 terms agreement \u0915\u094b \u092a\u094d\u0930\u092d\u093e\u0935\u093f\u0924 \u0915\u0930 \u0938\u0915\u0924\u093e \u0939\u0948\u0964",
      successToast: "Platform UI configuration \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 update \u0939\u094b \u0917\u0908!"
    },
    security: {
      accountTypeLabel: "Platform Superadmin",
      title: "Security Center Central Hub",
      description: "\u0935\u093f\u0915\u093e\u0938 \u092e\u0947\u0902 \u0939\u0948\u0964 \u092f\u0939 \u0917\u094d\u0932\u094b\u092c\u0932 firewall rules \u0914\u0930 advanced MFA controls \u0915\u094b host \u0915\u0930\u0947\u0917\u093e\u0964"
    }
  },
  mr: {
    approvals: {
      overline: "\u0928\u094b\u0902\u0926\u0923\u0940 \u0915\u0924\u093e\u0930",
      title: "\u0905\u0930\u094d\u091c \u092e\u0902\u091c\u0941\u0930\u0940",
      description: "\u0928\u0935\u0940\u0928 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0905\u0930\u094d\u091c \u0924\u092a\u093e\u0938\u093e, background check verify \u0915\u0930\u093e \u0906\u0923\u093f \u0935\u0948\u0927 platform access request \u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930\u093e.",
      loadError: "\u0932\u094b\u0921 \u0924\u094d\u0930\u0941\u091f\u0940",
      actionFailed: "\u0915\u093e\u0930\u0935\u093e\u0908 \u0905\u092f\u0936\u0938\u094d\u0935\u0940.",
      approveToast: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u092e\u0902\u091c\u0942\u0930 \u091d\u093e\u0932\u0940.",
      rejectToast: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0905\u0930\u094d\u091c \u0928\u093e\u0915\u093e\u0930\u0932\u093e \u0917\u0947\u0932\u093e.",
      provisionedToast: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092e\u0902\u091c\u0942\u0930 \u091d\u093e\u0932\u0940. recovery admin @{{username}} temporary password {{password}} \u0938\u0939 \u0924\u092f\u093e\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u0924 \u0906\u0932\u093e.",
      pendingTab: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924 \u092e\u0902\u091c\u0941\u0930\u0940 ({{count}})",
      rejectedTab: "\u0928\u093e\u0915\u093e\u0930\u0932\u0947\u0932\u0947 / \u0928\u093f\u0932\u0902\u092c\u093f\u0924 ({{count}})",
      noRequestsTitle: "\u0915\u094b\u0923\u0924\u0947\u0939\u0940 \u0935\u093f\u0928\u0902\u0924\u0940 \u0928\u093e\u0939\u0940",
      noPending: "\u0924\u0941\u092e\u094d\u0939\u0940 \u092a\u0942\u0930\u094d\u0923\u092a\u0923\u0947 update \u0906\u0939\u093e\u0924! \u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924 \u0905\u0930\u094d\u091c \u0928\u093e\u0939\u0940.",
      noRejected: "\u0938\u093f\u0938\u094d\u091f\u092e\u092e\u0927\u094d\u092f\u0947 \u0928\u093e\u0915\u093e\u0930\u0932\u0947\u0932\u0947 \u0905\u0930\u094d\u091c \u0928\u093e\u0939\u0940\u0924.",
      societyId: "ID",
      proposedMembers: "\u092a\u094d\u0930\u0938\u094d\u0924\u093e\u0935\u093f\u0924 \u0938\u0926\u0938\u094d\u092f",
      initialAccounts: "\u0938\u0941\u0930\u0941\u0935\u093e\u0924\u0940\u091a\u0940 \u0916\u093e\u0924\u0940",
      approve: "\u092e\u0902\u091c\u0942\u0930 \u0915\u0930\u093e",
      reject: "\u0928\u093e\u0915\u093e\u0930\u093e",
      reevaluate: "\u092a\u0941\u0928\u094d\u0939\u093e \u092e\u0942\u0932\u094d\u092f\u093e\u0902\u0915\u0928"
    },
    reports: {
      overline: "\u0915\u092e\u093e\u0902\u0921 \u0938\u0947\u0902\u091f\u0930",
      title: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0924\u092f\u093e\u0930\u0940",
      description: "\u0917\u094d\u0932\u094b\u092c\u0932 system report, governance audit \u0906\u0923\u093f portfolio statement \u0924\u092f\u093e\u0930 \u0915\u0930\u093e \u0906\u0923\u093f export \u0915\u0930\u093e.",
      generatorTitle: "\u0911\u0921\u093f\u091f \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      generatorDescription: "Executive summary \u0924\u092f\u093e\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u0938\u093e\u0920\u0940 platform metrics configure \u0915\u0930\u093e. data \u0938\u0930\u094d\u0935 verified societies \u092e\u0927\u0942\u0928 consolidate \u0939\u094b\u0924\u094b.",
      reportType: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u092a\u094d\u0930\u0915\u093e\u0930",
      fromDate: "\u092a\u093e\u0938\u0942\u0928 \u0924\u093e\u0930\u0940\u0916",
      toDate: "\u092a\u0930\u094d\u092f\u0902\u0924 \u0924\u093e\u0930\u0940\u0916",
      generating: "\u0921\u0947\u091f\u093e compile \u0939\u094b\u0924 \u0906\u0939\u0947...",
      generate: "\u0911\u0921\u093f\u091f \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      jobsTitle: "\u0905\u0932\u0940\u0915\u0921\u0940\u0932 generation jobs",
      jobsDescription: "\u0924\u092f\u093e\u0930 artifacts 30 \u0926\u093f\u0935\u0938 secure vault \u092e\u0927\u094d\u092f\u0947 \u091c\u0924\u0928 \u0915\u0947\u0932\u0947 \u091c\u093e\u0924\u093e\u0924.",
      download: "\u0921\u093e\u0909\u0928\u0932\u094b\u0921",
      running: "\u091a\u093e\u0932\u0942",
      headers: ["\u0930\u093f\u092a\u094b\u0930\u094d\u091f", "\u0935\u0930\u094d\u0917", "\u0924\u093e\u0930\u0940\u0916", "\u0915\u094d\u0930\u093f\u092f\u093e"],
      options: {
        allSocieties: "\u0938\u0915\u094d\u0930\u093f\u092f \u0938\u094b\u0938\u093e\u092f\u091f\u0940 overview",
        pendingAudits: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924 \u092e\u0902\u091c\u0941\u0930\u0940 \u0906\u0923\u093f suspend logs",
        financialAudit: "\u0917\u094d\u0932\u094b\u092c\u0932 financial portfolio (liquidity)",
        systemAgents: "\u0928\u0947\u091f\u0935\u0930\u094d\u0915 agent \u0906\u0923\u093f user distribution",
        customMatrix: "\u0915\u0938\u094d\u091f\u092e data matrix (granular)"
      },
      customFiltersTitle: "\u0915\u0938\u094d\u091f\u092e advanced filters",
      targetSocietyId: "Target Society ID (\u092a\u0930\u094d\u092f\u093e\u092f\u0940)",
      targetSocietyPlaceholder: "\u0909\u0926\u093e. SOC-001 \u0915\u093f\u0902\u0935\u093e 'ALL' \u091f\u093e\u0907\u092a \u0915\u0930\u093e",
      agentName: "Agent Name / ID",
      agentPlaceholder: "\u0935\u093f\u0936\u093f\u0937\u094d\u091f agent \u0905\u0902\u0924\u0930\u094d\u0917\u0924 users \u0935\u0930 filter \u0932\u093e\u0935\u093e",
      clientName: "Specific Client Name / ID",
      clientPlaceholder: "\u092f\u093e user \u0938\u093e\u0920\u0940\u091a isolated report \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      targetAccountType: "Target Account Type",
      allAccounts: "All Accounts (Mixed)",
      loans: "Loans (Issuance & Recovery Only)",
      savings: "Savings (Liquid Baseline)",
      fixedDeposits: "Fixed Deposits (Locked Assets)",
      booleanToggles: "Boolean Toggles",
      includeInactiveUsers: "Inactive Users \u0938\u092e\u093e\u0935\u093f\u0937\u094d\u091f \u0915\u0930\u093e",
      includeClosedLoans: "Closed Loans \u0938\u092e\u093e\u0935\u093f\u0937\u094d\u091f \u0915\u0930\u093e",
      embedKycMetadata: "KYC Metadata embed \u0915\u0930\u093e",
      pdfHighResolution: "PDF High-Resolution"
    },
    settings: {
      title: "\u0938\u093f\u0938\u094d\u091f\u092e \u0915\u0902\u092b\u093f\u0917\u0930\u0947\u0936\u0928",
      description: "\u0917\u094d\u0932\u094b\u092c\u0932 frontend attributes, brand identifiers \u0906\u0923\u093f public-facing text schema \u092c\u0926\u0932\u093e.",
      websiteContent: "Public Website Content",
      platformMasterName: "Platform Master Name",
      heroHeadline: "Landing Hero Headline",
      heroSubtext: "Landing Hero Subtext",
      supportEmail: "Public Support Email",
      deploying: "\u0924\u0948\u0928\u093e\u0924 \u0939\u094b\u0924 \u0906\u0939\u0947...",
      publish: "Settings Publish \u0915\u0930\u093e",
      syncTitle: "Real-time Syncing",
      syncDescription: "\u092f\u0947\u0925\u0947 publish \u0915\u0947\u0932\u0947\u0932\u0947 badal \u0924\u093e\u0924\u094d\u0915\u093e\u0933 global CDN endpoint \u0935\u0930 cache \u0939\u094b\u0924\u093e\u0924. society owner \u0906\u0923\u093f \u0928\u0935\u0940\u0928 user \u0924\u0941\u0930\u0902\u0924 updated UI \u092a\u093e\u0939\u0924\u093e\u0924.",
      warning: "Platform Master Name \u092c\u0926\u0932\u0932\u094d\u092f\u093e\u0928\u0947 globally issued invoice \u0906\u0923\u093f terms agreement \u0935\u0930 \u092a\u094d\u0930\u092d\u093e\u0935 \u092a\u0921\u0942 \u0936\u0915\u0924\u094b.",
      successToast: "Platform UI configuration \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e update \u091d\u093e\u0932\u0947!"
    },
    security: {
      accountTypeLabel: "Platform Superadmin",
      title: "Security Center Central Hub",
      description: "\u0935\u093f\u0915\u093e\u0938\u093e\u0927\u0940\u0928. \u092f\u0947\u0925\u0947 Global Firewall rules \u0906\u0923\u093f advanced MFA controls \u0905\u0938\u0924\u0940\u0932."
    }
  }
};

export function getSuperadminExtraCopy(locale: AppLocale) {
  return superadminExtraCopy[locale] ?? superadminExtraCopy.en;
}
