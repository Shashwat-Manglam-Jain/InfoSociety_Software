import type { AppLocale } from "./translations";

type ReportStatus = "DONE" | "RUNNING" | "FAILED" | string;

type ReportsWorkspaceCopy = {
  hero: { eyebrow: string; title: string; description: string };
  metrics: {
    reportJobs: { label: string; caption: string };
    completed: { label: string; caption: string };
    running: { label: string; caption: string };
    failed: { label: string; caption: string };
  };
  actions: {
    refresh: string;
    runReport: string;
    cancel: string;
    start: string;
    starting: string;
  };
  table: {
    category: string;
    reportName: string;
    status: string;
    requestedAt: string;
    completedAt: string;
    requestedBy: string;
    emptyState: string;
  };
  errors: {
    loadCatalogFailed: string;
    loadJobsFailed: string;
    selectReport: string;
    runFailed: string;
  };
  success: {
    started: string;
  };
  drawer: {
    title: string;
    category: string;
    report: string;
    asyncInfo: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  statuses: {
    done: string;
    running: string;
    failed: string;
  };
};

const reportsWorkspaceCopy: Record<AppLocale, ReportsWorkspaceCopy> = {
  en: {
    hero: { eyebrow: "Reporting", title: "Reports & Enquiries", description: "Generate and manage society reports and data exports." },
    metrics: {
      reportJobs: { label: "Report Jobs", caption: "Total report generation jobs." },
      completed: { label: "Completed", caption: "Successfully generated reports." },
      running: { label: "Running", caption: "Reports in progress." },
      failed: { label: "Failed", caption: "Failed generation jobs." }
    },
    actions: {
      refresh: "Refresh",
      runReport: "Run Report",
      cancel: "Cancel",
      start: "Run Report",
      starting: "Starting..."
    },
    table: {
      category: "Category",
      reportName: "Report Name",
      status: "Status",
      requestedAt: "Requested At",
      completedAt: "Completed At",
      requestedBy: "Requested By",
      emptyState: "No report jobs found. Click 'Run Report' to generate one."
    },
    errors: {
      loadCatalogFailed: "Unable to load report catalog.",
      loadJobsFailed: "Unable to load report jobs.",
      selectReport: "Please select a report",
      runFailed: "Failed to run report"
    },
    success: {
      started: "Report generation started"
    },
    drawer: {
      title: "Run Report",
      category: "Category",
      report: "Report",
      asyncInfo: "The report will be generated asynchronously. You'll receive a notification when it's complete."
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    statuses: {
      done: "Done",
      running: "Running",
      failed: "Failed"
    }
  },
  hi: {
    hero: { eyebrow: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f\u093f\u0902\u0917", title: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0914\u0930 \u090f\u0928\u094d\u0915\u094d\u0935\u093e\u092f\u0930\u0940", description: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0914\u0930 \u0921\u0947\u091f\u093e \u090f\u0915\u094d\u0938\u092a\u094b\u0930\u094d\u091f \u091c\u0928\u0930\u0947\u091f \u0914\u0930 \u092a\u094d\u0930\u092c\u0902\u0927\u093f\u0924 \u0915\u0930\u0947\u0902\u0964" },
    metrics: {
      reportJobs: { label: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0949\u092c", caption: "\u0915\u0941\u0932 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0928\u0930\u0947\u0936\u0928 \u091c\u0949\u092c\u094d\u0938\u0964" },
      completed: { label: "\u092a\u0942\u0930\u094d\u0923", caption: "\u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u091c\u0928\u0930\u0947\u091f \u0939\u0941\u0908 \u0930\u093f\u092a\u094b\u0930\u094d\u091f\u094d\u0938\u0964" },
      running: { label: "\u091a\u0932 \u0930\u0939\u0940", caption: "\u092a\u094d\u0930\u0917\u0924\u093f \u092e\u0947\u0902 \u0930\u093f\u092a\u094b\u0930\u094d\u091f\u094d\u0938\u0964" },
      failed: { label: "\u0935\u093f\u092b\u0932", caption: "\u0935\u093f\u092b\u0932 \u091c\u0928\u0930\u0947\u0936\u0928 \u091c\u0949\u092c\u094d\u0938\u0964" }
    },
    actions: {
      refresh: "\u0930\u093f\u092b\u094d\u0930\u0947\u0936",
      runReport: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u0932\u093e\u090f\u0902",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902",
      start: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u0932\u093e\u090f\u0902",
      starting: "\u0936\u0941\u0930\u0942 \u0939\u094b \u0930\u0939\u093e \u0939\u0948..."
    },
    table: {
      category: "\u0936\u094d\u0930\u0947\u0923\u0940",
      reportName: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0928\u093e\u092e",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      requestedAt: "\u0905\u0928\u0941\u0930\u094b\u0927 \u0938\u092e\u092f",
      completedAt: "\u092a\u0942\u0930\u094d\u0923 \u0938\u092e\u092f",
      requestedBy: "\u0905\u0928\u0941\u0930\u094b\u0927\u0915\u0930\u094d\u0924\u093e",
      emptyState: "\u0915\u094b\u0908 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0949\u092c \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964 \u090f\u0915 \u091c\u0928\u0930\u0947\u091f \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f '\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u0932\u093e\u090f\u0902' \u092a\u0930 \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u0947\u0902\u0964"
    },
    errors: {
      loadCatalogFailed: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0915\u0948\u091f\u0932\u0949\u0917 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
      loadJobsFailed: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0949\u092c \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0947\u0964",
      selectReport: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u0941\u0928\u0947\u0902",
      runFailed: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u0932\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932"
    },
    success: {
      started: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0928\u0930\u0947\u0936\u0928 \u0936\u0941\u0930\u0942 \u0939\u094b \u0917\u092f\u093e"
    },
    drawer: {
      title: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u0932\u093e\u090f\u0902",
      category: "\u0936\u094d\u0930\u0947\u0923\u0940",
      report: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f",
      asyncInfo: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0905\u0938\u093f\u0902\u0915\u094d\u0930\u094b\u0928\u0938 \u0924\u0930\u0940\u0915\u0947 \u0938\u0947 \u091c\u0928\u0930\u0947\u091f \u0939\u094b\u0917\u0940\u0964 \u092a\u0942\u0930\u094d\u0923 \u0939\u094b\u0928\u0947 \u092a\u0930 \u0906\u092a\u0915\u094b \u0938\u0942\u091a\u0928\u093e \u092e\u093f\u0932\u0947\u0917\u0940\u0964"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u0943\u0937\u094d\u0920 \u092a\u0902\u0915\u094d\u0924\u093f\u092f\u093e\u0901:",
      displayedRows: "{{count}} \u092e\u0947\u0902 \u0938\u0947 {{from}}-{{to}}",
      nextPage: "\u0905\u0917\u0932\u093e \u092a\u0943\u0937\u094d\u0920",
      previousPage: "\u092a\u093f\u091b\u0932\u093e \u092a\u0943\u0937\u094d\u0920"
    },
    statuses: {
      done: "\u092a\u0942\u0930\u094d\u0923",
      running: "\u091a\u0932 \u0930\u0939\u0940",
      failed: "\u0935\u093f\u092b\u0932"
    }
  },
  mr: {
    hero: { eyebrow: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f\u093f\u0902\u0917", title: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f\u094d\u0938 \u0906\u0923\u093f \u091a\u094c\u0915\u0936\u0940", description: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f\u094d\u0938 \u0906\u0923\u093f \u0921\u0947\u091f\u093e \u090f\u0915\u094d\u0938\u092a\u094b\u0930\u094d\u091f \u0924\u092f\u093e\u0930 \u0915\u0930\u093e \u0906\u0923\u093f \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093f\u0924 \u0915\u0930\u093e." },
    metrics: {
      reportJobs: { label: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0949\u092c\u094d\u0938", caption: "\u090f\u0915\u0942\u0923 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0928\u0930\u0947\u0936\u0928 \u091c\u0949\u092c\u094d\u0938." },
      completed: { label: "\u092a\u0942\u0930\u094d\u0923", caption: "\u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0924\u092f\u093e\u0930 \u091d\u093e\u0932\u0947\u0932\u094d\u092f\u093e \u0930\u093f\u092a\u094b\u0930\u094d\u091f\u094d\u0938." },
      running: { label: "\u091a\u093e\u0932\u0942", caption: "\u092a\u094d\u0930\u0917\u0924\u0940\u0924 \u0905\u0938\u0932\u0947\u0932\u094d\u092f\u093e \u0930\u093f\u092a\u094b\u0930\u094d\u091f\u094d\u0938." },
      failed: { label: "\u0905\u092f\u0936\u0938\u094d\u0935\u0940", caption: "\u0905\u092f\u0936\u0938\u094d\u0935\u0940 \u091c\u0928\u0930\u0947\u0936\u0928 \u091c\u0949\u092c\u094d\u0938." }
    },
    actions: {
      refresh: "\u0930\u093f\u092b\u094d\u0930\u0947\u0936",
      runReport: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u093e\u0932\u0935\u093e",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u093e",
      start: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u093e\u0932\u0935\u093e",
      starting: "\u0938\u0941\u0930\u0942 \u0939\u094b\u0924 \u0906\u0939\u0947..."
    },
    table: {
      category: "\u0936\u094d\u0930\u0947\u0923\u0940",
      reportName: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0928\u093e\u0935",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      requestedAt: "\u0935\u093f\u0928\u0902\u0924\u0940 \u0935\u0947\u0933",
      completedAt: "\u092a\u0942\u0930\u094d\u0923 \u0935\u0947\u0933",
      requestedBy: "\u0935\u093f\u0928\u0902\u0924\u0940 \u0915\u0930\u0923\u093e\u0930\u093e",
      emptyState: "\u0915\u094b\u0923\u0924\u0947\u0939\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0949\u092c \u0938\u093e\u092a\u0921\u0932\u0947 \u0928\u093e\u0939\u0940\u0924. \u090f\u0915 \u0924\u092f\u093e\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u0938\u093e\u0920\u0940 '\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u093e\u0932\u0935\u093e' \u0915\u094d\u0932\u093f\u0915 \u0915\u0930\u093e."
    },
    errors: {
      loadCatalogFailed: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0915\u0945\u091f\u0932\u0949\u0917 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u093e \u0928\u093e\u0939\u0940.",
      loadJobsFailed: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0949\u092c\u094d\u0938 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940\u0924.",
      selectReport: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0928\u093f\u0935\u0921\u093e",
      runFailed: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u093e\u0932\u0935\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940"
    },
    success: {
      started: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091c\u0928\u0930\u0947\u0936\u0928 \u0938\u0941\u0930\u0942 \u091d\u093e\u0932\u0947"
    },
    drawer: {
      title: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u091a\u093e\u0932\u0935\u093e",
      category: "\u0936\u094d\u0930\u0947\u0923\u0940",
      report: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f",
      asyncInfo: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f \u0905\u0938\u093f\u0902\u0915\u094d\u0930\u094b\u0928\u0938 \u092a\u0926\u094d\u0927\u0924\u0940\u0928\u0947 \u0924\u092f\u093e\u0930 \u0939\u094b\u0908\u0932. \u0924\u0940 \u092a\u0942\u0930\u094d\u0923 \u091d\u093e\u0932\u094d\u092f\u093e\u0935\u0930 \u0924\u0941\u092e\u094d\u0939\u093e\u0932\u093e \u0938\u0942\u091a\u0928\u093e \u092e\u093f\u0933\u0947\u0932."
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    },
    statuses: {
      done: "\u092a\u0942\u0930\u094d\u0923",
      running: "\u091a\u093e\u0932\u0942",
      failed: "\u0905\u092f\u0936\u0938\u094d\u0935\u0940"
    }
  }
};

export function getReportsWorkspaceCopy(locale: AppLocale) {
  return reportsWorkspaceCopy[locale] ?? reportsWorkspaceCopy.en;
}
