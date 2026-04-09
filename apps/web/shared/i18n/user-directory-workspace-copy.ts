import type { AppLocale } from "./translations";

type UserDirectoryWorkspaceCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  metrics: {
    totalUsers: { label: string; caption: string };
    active: { label: string; caption: string };
    inactive: { label: string; caption: string };
    roles: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    refresh: string;
  };
  table: {
    username: string;
    fullName: string;
    role: string;
    status: string;
    branch: string;
    created: string;
    modules: string;
    emptySearch: string;
    emptyDefault: string;
    active: string;
    inactive: string;
    none: string;
    modulesCount: string;
  };
  errors: {
    loadFailed: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  roles: Record<string, string>;
};

const userDirectoryWorkspaceCopy: Record<AppLocale, UserDirectoryWorkspaceCopy> = {
  en: {
    hero: {
      eyebrow: "Directory",
      title: "User Directory",
      description: "View all users and their roles with detailed information."
    },
    metrics: {
      totalUsers: { label: "Total Users", caption: "All users in the system." },
      active: { label: "Active", caption: "Active user accounts." },
      inactive: { label: "Inactive", caption: "Inactive accounts." },
      roles: { label: "Roles", caption: "Number of different roles." }
    },
    actions: {
      searchPlaceholder: "Search by username, name, or role...",
      refresh: "Refresh"
    },
    table: {
      username: "Username",
      fullName: "Full Name",
      role: "Role",
      status: "Status",
      branch: "Branch",
      created: "Created",
      modules: "Modules",
      emptySearch: "No users found matching your search.",
      emptyDefault: "No users found.",
      active: "Active",
      inactive: "Inactive",
      none: "None",
      modulesCount: "{{count}} modules"
    },
    errors: {
      loadFailed: "Unable to load user directory."
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    roles: {
      SUPER_USER: "Super User",
      AGENT: "Agent",
      CLIENT: "Client",
      STAFF: "Staff"
    }
  },
  hi: {
    hero: {
      eyebrow: "\u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940",
      title: "\u092f\u0942\u091c\u0930 \u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940",
      description: "\u0938\u092d\u0940 \u092f\u0942\u091c\u0930 \u0914\u0930 \u0909\u0928\u0915\u0940 \u092d\u0942\u092e\u093f\u0915\u093e\u0913\u0902 \u0915\u094b \u0935\u093f\u0938\u094d\u0924\u0943\u0924 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0915\u0947 \u0938\u093e\u0925 \u0926\u0947\u0916\u0947\u0902\u0964"
    },
    metrics: {
      totalUsers: { label: "\u0915\u0941\u0932 \u092f\u0942\u091c\u0930", caption: "\u0938\u093f\u0938\u094d\u091f\u092e \u0915\u0947 \u0938\u092d\u0940 \u092f\u0942\u091c\u0930\u0964" },
      active: { label: "\u0938\u0915\u094d\u0930\u093f\u092f", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u092f\u0942\u091c\u0930 \u0916\u093e\u0924\u0947\u0964" },
      inactive: { label: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f", caption: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f \u0916\u093e\u0924\u0947\u0964" },
      roles: { label: "\u092d\u0942\u092e\u093f\u0915\u093e\u090f\u0902", caption: "\u0935\u093f\u092d\u093f\u0928\u094d\u0928 \u092d\u0942\u092e\u093f\u0915\u093e\u0913\u0902 \u0915\u0940 \u0938\u0902\u0916\u094d\u092f\u093e\u0964" }
    },
    actions: {
      searchPlaceholder: "\u092f\u0942\u091c\u0930\u0928\u0947\u092e, \u0928\u093e\u092e \u092f\u093e \u092d\u0942\u092e\u093f\u0915\u093e \u0938\u0947 \u0916\u094b\u091c\u0947\u0902...",
      refresh: "\u0930\u093f\u092b\u094d\u0930\u0947\u0936"
    },
    table: {
      username: "\u092f\u0942\u091c\u0930\u0928\u0947\u092e",
      fullName: "\u092a\u0942\u0930\u093e \u0928\u093e\u092e",
      role: "\u092d\u0942\u092e\u093f\u0915\u093e",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      branch: "\u0936\u093e\u0916\u093e",
      created: "\u092c\u0928\u093e\u092f\u093e \u0917\u092f\u093e",
      modules: "\u092e\u0949\u0921\u094d\u092f\u0942\u0932",
      emptySearch: "\u0906\u092a\u0915\u0940 \u0916\u094b\u091c \u0938\u0947 \u092e\u093f\u0932\u0924\u093e \u0915\u094b\u0908 \u092f\u0942\u091c\u0930 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964",
      emptyDefault: "\u0915\u094b\u0908 \u092f\u0942\u091c\u0930 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964",
      active: "\u0938\u0915\u094d\u0930\u093f\u092f",
      inactive: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f",
      none: "\u0915\u094b\u0908 \u0928\u0939\u0940\u0902",
      modulesCount: "{{count}} \u092e\u0949\u0921\u094d\u092f\u0942\u0932"
    },
    errors: {
      loadFailed: "\u092f\u0942\u091c\u0930 \u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0940\u0964"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u0943\u0937\u094d\u0920 \u092a\u0902\u0915\u094d\u0924\u093f\u092f\u093e\u0901:",
      displayedRows: "{{count}} \u092e\u0947\u0902 \u0938\u0947 {{from}}-{{to}}",
      nextPage: "\u0905\u0917\u0932\u093e \u092a\u0943\u0937\u094d\u0920",
      previousPage: "\u092a\u093f\u091b\u0932\u093e \u092a\u0943\u0937\u094d\u0920"
    },
    roles: {
      SUPER_USER: "\u0938\u0941\u092a\u0930 \u092f\u0942\u091c\u0930",
      AGENT: "\u090f\u091c\u0947\u0902\u091f",
      CLIENT: "\u0915\u094d\u0932\u093e\u0907\u0902\u091f",
      STAFF: "\u0938\u094d\u091f\u093e\u092b"
    }
  },
  mr: {
    hero: {
      eyebrow: "\u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940",
      title: "\u092f\u0942\u091c\u0930 \u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940",
      description: "\u0938\u0930\u094d\u0935 \u092f\u0942\u091c\u0930 \u0906\u0923\u093f \u0924\u094d\u092f\u093e\u0902\u091a\u094d\u092f\u093e \u092d\u0942\u092e\u093f\u0915\u093e \u0938\u0935\u093f\u0938\u094d\u0924\u0930 \u092e\u093e\u0939\u093f\u0924\u0940\u0938\u0939 \u092a\u093e\u0939\u093e."
    },
    metrics: {
      totalUsers: { label: "\u090f\u0915\u0942\u0923 \u092f\u0942\u091c\u0930", caption: "\u0938\u093f\u0938\u094d\u091f\u092e\u092e\u0927\u0940\u0932 \u0938\u0930\u094d\u0935 \u092f\u0942\u091c\u0930." },
      active: { label: "\u0938\u0915\u094d\u0930\u093f\u092f", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u092f\u0942\u091c\u0930 \u0916\u093e\u0924\u0940." },
      inactive: { label: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f", caption: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f \u0916\u093e\u0924\u0940." },
      roles: { label: "\u092d\u0942\u092e\u093f\u0915\u093e", caption: "\u0935\u0947\u0917\u0935\u0947\u0917\u0933\u094d\u092f\u093e \u092d\u0942\u092e\u093f\u0915\u093e\u0902\u091a\u0940 \u0938\u0902\u0916\u094d\u092f\u093e." }
    },
    actions: {
      searchPlaceholder: "\u092f\u0942\u091c\u0930\u0928\u0947\u092e, \u0928\u093e\u0935 \u0915\u093f\u0902\u0935\u093e \u092d\u0942\u092e\u093f\u0915\u0947\u0928\u0947 \u0936\u094b\u0927\u093e...",
      refresh: "\u0930\u093f\u092b\u094d\u0930\u0947\u0936"
    },
    table: {
      username: "\u092f\u0942\u091c\u0930\u0928\u0947\u092e",
      fullName: "\u092a\u0942\u0930\u094d\u0923 \u0928\u093e\u0935",
      role: "\u092d\u0942\u092e\u093f\u0915\u093e",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      branch: "\u0936\u093e\u0916\u093e",
      created: "\u0924\u092f\u093e\u0930 \u0926\u093f\u0928\u093e\u0902\u0915",
      modules: "\u092e\u0949\u0921\u094d\u092f\u0942\u0932",
      emptySearch: "\u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0936\u094b\u0927\u093e\u0938\u093e\u0920\u0940 \u091c\u0941\u0933\u0923\u093e\u0930\u093e \u0915\u094b\u0923\u0924\u093e\u0939\u0940 \u092f\u0942\u091c\u0930 \u0938\u093e\u092a\u0921\u0932\u093e \u0928\u093e\u0939\u0940.",
      emptyDefault: "\u0915\u094b\u0923\u0924\u093e\u0939\u0940 \u092f\u0942\u091c\u0930 \u0938\u093e\u092a\u0921\u0932\u093e \u0928\u093e\u0939\u0940.",
      active: "\u0938\u0915\u094d\u0930\u093f\u092f",
      inactive: "\u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f",
      none: "\u0915\u093e\u0939\u0940\u091a \u0928\u093e\u0939\u0940",
      modulesCount: "{{count}} \u092e\u0949\u0921\u094d\u092f\u0942\u0932"
    },
    errors: {
      loadFailed: "\u092f\u0942\u091c\u0930 \u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940."
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    },
    roles: {
      SUPER_USER: "\u0938\u0941\u092a\u0930 \u092f\u0942\u091c\u0930",
      AGENT: "\u090f\u091c\u0902\u091f",
      CLIENT: "\u0915\u094d\u0932\u093e\u092f\u0902\u091f",
      STAFF: "\u0938\u094d\u091f\u093e\u092b"
    }
  }
};

export function getUserDirectoryWorkspaceCopy(locale: AppLocale) {
  return userDirectoryWorkspaceCopy[locale] ?? userDirectoryWorkspaceCopy.en;
}
