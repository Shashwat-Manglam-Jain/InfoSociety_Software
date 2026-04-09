import type { AppLocale } from "./translations";

type SocietyMonitoringWorkspaceCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  metrics: {
    totalSocieties: { label: string; caption: string };
    active: { label: string; caption: string };
    pending: { label: string; caption: string };
    systems: { label: string; caption: string };
  };
  actions: {
    refresh: string;
  };
  sections: {
    societiesOverview: string;
  };
  table: {
    code: string;
    name: string;
    status: string;
    category: string;
    registrationState: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    digitalPayments: string;
    noSocieties: string;
    enabled: string;
    disabled: string;
  };
  errors: {
    loadFailed: string;
  };
  statuses: Record<string, string>;
  subscriptionStatuses: Record<string, string>;
};

const societyMonitoringWorkspaceCopy: Record<AppLocale, SocietyMonitoringWorkspaceCopy> = {
  en: {
    hero: {
      eyebrow: "Monitoring",
      title: "Society Monitoring",
      description: "Monitor all societies and their operational status."
    },
    metrics: {
      totalSocieties: { label: "Total Societies", caption: "Registered societies in system." },
      active: { label: "Active", caption: "Active societies." },
      pending: { label: "Pending", caption: "Pending approval." },
      systems: { label: "Systems", caption: "Live systems." }
    },
    actions: {
      refresh: "Refresh"
    },
    sections: {
      societiesOverview: "Societies Overview"
    },
    table: {
      code: "Code",
      name: "Name",
      status: "Status",
      category: "Category",
      registrationState: "Registration State",
      subscriptionPlan: "Subscription Plan",
      subscriptionStatus: "Subscription Status",
      digitalPayments: "Digital Payments",
      noSocieties: "No societies found",
      enabled: "Enabled",
      disabled: "Disabled"
    },
    errors: {
      loadFailed: "Unable to load monitoring data."
    },
    statuses: {
      ACTIVE: "Active",
      PENDING: "Pending",
      SUSPENDED: "Suspended",
      CLOSED: "Closed"
    },
    subscriptionStatuses: {
      ACTIVE: "Active",
      INACTIVE: "Inactive"
    }
  },
  hi: {
    hero: {
      eyebrow: "\u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917",
      title: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917",
      description: "\u0938\u092d\u0940 \u0938\u094b\u0938\u093e\u0907\u091f\u0940\u091c\u093c \u0914\u0930 \u0909\u0928\u0915\u0940 \u0911\u092a\u0930\u0947\u0936\u0928\u0932 \u0938\u094d\u0925\u093f\u0924\u093f \u092a\u0930 \u0928\u091c\u093c\u0930 \u0930\u0916\u0947\u0902\u0964"
    },
    metrics: {
      totalSocieties: { label: "\u0915\u0941\u0932 \u0938\u094b\u0938\u093e\u0907\u091f\u0940\u091c\u093c", caption: "\u0938\u093f\u0938\u094d\u091f\u092e \u092e\u0947\u0902 \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0938\u094b\u0938\u093e\u0907\u091f\u0940\u091c\u093c\u0964" },
      active: { label: "\u0938\u0915\u094d\u0930\u093f\u092f", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0938\u094b\u0938\u093e\u0907\u091f\u0940\u091c\u093c\u0964" },
      pending: { label: "\u0932\u0902\u092c\u093f\u0924", caption: "\u0938\u094d\u0935\u0940\u0915\u0943\u0924\u093f \u0932\u0902\u092c\u093f\u0924\u0964" },
      systems: { label: "\u0938\u093f\u0938\u094d\u091f\u092e", caption: "\u0932\u093e\u0907\u0935 \u0938\u093f\u0938\u094d\u091f\u092e\u0964" }
    },
    actions: {
      refresh: "\u0930\u093f\u092b\u094d\u0930\u0947\u0936"
    },
    sections: {
      societiesOverview: "\u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0913\u0935\u0930\u0935\u094d\u092f\u0942"
    },
    table: {
      code: "\u0915\u094b\u0921",
      name: "\u0928\u093e\u092e",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      category: "\u0936\u094d\u0930\u0947\u0923\u0940",
      registrationState: "\u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0930\u093e\u091c\u094d\u092f",
      subscriptionPlan: "\u0938\u092c\u094d\u0938\u094d\u0915\u094d\u0930\u093f\u092a\u094d\u0936\u0928 \u092a\u094d\u0932\u093e\u0928",
      subscriptionStatus: "\u0938\u092c\u094d\u0938\u094d\u0915\u094d\u0930\u093f\u092a\u094d\u0936\u0928 \u0938\u094d\u0925\u093f\u0924\u093f",
      digitalPayments: "\u0921\u093f\u091c\u093f\u091f\u0932 \u092d\u0941\u0917\u0924\u093e\u0928",
      noSocieties: "\u0915\u094b\u0908 \u0938\u094b\u0938\u093e\u0907\u091f\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940",
      enabled: "\u0938\u0915\u094d\u0930\u093f\u092f",
      disabled: "\u0905\u0938\u0915\u094d\u0930\u093f\u092f"
    },
    errors: {
      loadFailed: "\u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917 \u0921\u0947\u091f\u093e \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964"
    },
    statuses: {
      ACTIVE: "\u0938\u0915\u094d\u0930\u093f\u092f",
      PENDING: "\u0932\u0902\u092c\u093f\u0924",
      SUSPENDED: "\u0928\u093f\u0932\u0902\u092c\u093f\u0924",
      CLOSED: "\u092c\u0902\u0926"
    },
    subscriptionStatuses: {
      ACTIVE: "\u0938\u0915\u094d\u0930\u093f\u092f",
      INACTIVE: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f"
    }
  },
  mr: {
    hero: {
      eyebrow: "\u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917",
      title: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917",
      description: "\u0938\u0930\u094d\u0935 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0906\u0923\u093f \u0924\u094d\u092f\u093e\u0902\u091a\u0940 \u0911\u092a\u0930\u0947\u0936\u0928\u0932 \u0938\u094d\u0925\u093f\u0924\u0940 \u092a\u093e\u0939\u093e."
    },
    metrics: {
      totalSocieties: { label: "\u090f\u0915\u0942\u0923 \u0938\u094b\u0938\u093e\u092f\u091f\u0940", caption: "\u0938\u093f\u0938\u094d\u091f\u092e\u092e\u0927\u0940\u0932 \u0928\u094b\u0902\u0926\u0923\u0940\u0915\u0943\u0924 \u0938\u094b\u0938\u093e\u092f\u091f\u0940." },
      active: { label: "\u0938\u0915\u094d\u0930\u093f\u092f", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0938\u094b\u0938\u093e\u092f\u091f\u0940." },
      pending: { label: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924", caption: "\u092e\u0902\u091c\u0942\u0930\u0940 \u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924." },
      systems: { label: "\u0938\u093f\u0938\u094d\u091f\u092e", caption: "\u0932\u093e\u0907\u0935 \u0938\u093f\u0938\u094d\u091f\u092e." }
    },
    actions: {
      refresh: "\u0930\u093f\u092b\u094d\u0930\u0947\u0936"
    },
    sections: {
      societiesOverview: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0906\u0922\u093e\u0935\u093e"
    },
    table: {
      code: "\u0915\u094b\u0921",
      name: "\u0928\u093e\u0935",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      category: "\u0936\u094d\u0930\u0947\u0923\u0940",
      registrationState: "\u0928\u094b\u0902\u0926\u0923\u0940 \u0930\u093e\u091c\u094d\u092f",
      subscriptionPlan: "\u0938\u092c\u094d\u0938\u094d\u0915\u094d\u0930\u093f\u092a\u094d\u0936\u0928 \u092a\u094d\u0932\u093e\u0928",
      subscriptionStatus: "\u0938\u092c\u094d\u0938\u094d\u0915\u094d\u0930\u093f\u092a\u094d\u0936\u0928 \u0938\u094d\u0925\u093f\u0924\u0940",
      digitalPayments: "\u0921\u093f\u091c\u093f\u091f\u0932 \u092a\u0947\u092e\u0947\u0902\u091f\u094d\u0938",
      noSocieties: "\u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0938\u093e\u092a\u0921\u0932\u0940 \u0928\u093e\u0939\u0940",
      enabled: "\u0938\u0915\u094d\u0930\u093f\u092f",
      disabled: "\u0905\u0938\u0915\u094d\u0930\u093f\u092f"
    },
    errors: {
      loadFailed: "\u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917 \u0921\u0947\u091f\u093e \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u093e \u0928\u093e\u0939\u0940."
    },
    statuses: {
      ACTIVE: "\u0938\u0915\u094d\u0930\u093f\u092f",
      PENDING: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924",
      SUSPENDED: "\u0928\u093f\u0932\u0902\u092c\u093f\u0924",
      CLOSED: "\u092c\u0902\u0926"
    },
    subscriptionStatuses: {
      ACTIVE: "\u0938\u0915\u094d\u0930\u093f\u092f",
      INACTIVE: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f"
    }
  }
};

export function getSocietyMonitoringWorkspaceCopy(locale: AppLocale) {
  return societyMonitoringWorkspaceCopy[locale] ?? societyMonitoringWorkspaceCopy.en;
}
