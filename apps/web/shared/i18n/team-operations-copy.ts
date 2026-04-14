import type { AppLocale } from "./translations";

type TeamOperationsCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    addStaffUser: string;
  };
  filters: {
    allAccounts: string;
    staff: string;
    client: string;
    agent: string;
  };
  metrics: {
    accounts: { label: string; caption: string };
    staff: { label: string; caption: string };
    agents: { label: string; caption: string };
    clients: { label: string; caption: string };
  };
  table: {
    user: string;
    accountType: string;
    branch: string;
    modules: string;
    status: string;
    actions: string;
  };
  emptyState: string;
  fallback: {
    defaultAvatar: string;
    headOffice: string;
    noBranchCode: string;
    controlledFromAccessSettings: string;
  };
  modulesCount: string;
  status: {
    active: string;
    inactive: string;
  };
  actions: {
    edit: string;
    editAccount: string;
    manageAccess: string;
    removeAccount: string;
  };
};

const teamOperationsCopy: Record<AppLocale, TeamOperationsCopy> = {
  en: {
    hero: {
      eyebrow: "Directory",
      title: "Team operations",
      description: "Manage staff, agents, and client-linked accounts that can access this society dashboard.",
      searchPlaceholder: "Search users",
      addStaffUser: "Add staff user"
    },
    filters: {
      allAccounts: "All Accounts",
      staff: "Staff",
      client: "Client",
      agent: "Agent"
    },
    metrics: {
      accounts: { label: "Accounts", caption: "All login-enabled society accounts." },
      staff: { label: "Staff", caption: "Internal operational accounts." },
      agents: { label: "Agents", caption: "Field agents and collections staff." },
      clients: { label: "Clients", caption: "Client member portal accounts." }
    },
    table: {
      user: "User",
      accountType: "Account type",
      branch: "Branch",
      modules: "Modules",
      status: "Status",
      actions: "Actions"
    },
    emptyState: "No matching users found.",
    fallback: {
      defaultAvatar: "U",
      headOffice: "Head office",
      noBranchCode: "No branch code",
      controlledFromAccessSettings: "Controlled from access settings"
    },
    modulesCount: "{{count}} modules",
    status: {
      active: "Active",
      inactive: "Inactive"
    },
    actions: {
      edit: "Edit",
      editAccount: "Edit account",
      manageAccess: "Manage access",
      removeAccount: "Remove account"
    }
  },
  hi: {
    hero: {
      eyebrow: "डायरेक्टरी",
      title: "टीम संचालन",
      description: "स्टाफ, एजेंट और क्लाइंट से जुड़े खातों का प्रबंधन करें जो इस सोसायटी डैशबोर्ड तक पहुँच सकते हैं।",
      searchPlaceholder: "उपयोगकर्ता खोजें",
      addStaffUser: "स्टाफ उपयोगकर्ता जोड़ें"
    },
    filters: {
      allAccounts: "सभी खाते",
      staff: "स्टाफ",
      client: "क्लाइंट",
      agent: "एजेंट"
    },
    metrics: {
      accounts: { label: "खाते", caption: "सोसायटी के सभी लॉगिन-सक्षम खाते।" },
      staff: { label: "स्टाफ", caption: "आंतरिक संचालन खाते।" },
      agents: { label: "एजेंट", caption: "फील्ड एजेंट और कलेक्शन स्टाफ।" },
      clients: { label: "क्लाइंट", caption: "क्लाइंट सदस्य पोर्टल खाते।" }
    },
    table: {
      user: "उपयोगकर्ता",
      accountType: "खाते का प्रकार",
      branch: "शाखा",
      modules: "मॉड्यूल",
      status: "स्थिति",
      actions: "कार्रवाई"
    },
    emptyState: "कोई मेल खाते उपयोगकर्ता नहीं मिले।",
    fallback: {
      defaultAvatar: "उ",
      headOffice: "मुख्य कार्यालय",
      noBranchCode: "कोई शाखा कोड नहीं",
      controlledFromAccessSettings: "एक्सेस सेटिंग्स से नियंत्रित"
    },
    modulesCount: "{{count}} मॉड्यूल",
    status: {
      active: "सक्रिय",
      inactive: "निष्क्रिय"
    },
    actions: {
      edit: "संपादित करें",
      editAccount: "खाता संपादित करें",
      manageAccess: "एक्सेस प्रबंधित करें",
      removeAccount: "खाता हटाएँ"
    }
  },
  mr: {
    hero: {
      eyebrow: "डायरेक्टरी",
      title: "टीम ऑपरेशन्स",
      description: "या सोसायटी डॅशबोर्डला प्रवेश असलेले स्टाफ, एजंट आणि क्लायंट-संबंधित खाते व्यवस्थापित करा.",
      searchPlaceholder: "वापरकर्ते शोधा",
      addStaffUser: "स्टाफ वापरकर्ता जोडा"
    },
    filters: {
      allAccounts: "सर्व खाती",
      staff: "स्टाफ",
      client: "क्लायंट",
      agent: "एजंट"
    },
    metrics: {
      accounts: { label: "खाती", caption: "सोसायटीतील सर्व लॉगिन-सक्षम खाती." },
      staff: { label: "स्टाफ", caption: "आतील कार्यरत खाती." },
      agents: { label: "एजंट", caption: "फिल्ड एजंट आणि वसुली कर्मचारी." },
      clients: { label: "क्लायंट", caption: "क्लायंट सदस्य पोर्टल खाती." }
    },
    table: {
      user: "वापरकर्ता",
      accountType: "खाते प्रकार",
      branch: "शाखा",
      modules: "मॉड्यूल्स",
      status: "स्थिती",
      actions: "क्रिया"
    },
    emptyState: "जुळणारे वापरकर्ते सापडले नाहीत.",
    fallback: {
      defaultAvatar: "व",
      headOffice: "मुख्य कार्यालय",
      noBranchCode: "शाखा कोड नाही",
      controlledFromAccessSettings: "अॅक्सेस सेटिंग्जमधून नियंत्रित"
    },
    modulesCount: "{{count}} मॉड्यूल्स",
    status: {
      active: "सक्रिय",
      inactive: "निष्क्रिय"
    },
    actions: {
      edit: "संपादित करा",
      editAccount: "खाते संपादित करा",
      manageAccess: "अॅक्सेस व्यवस्थापित करा",
      removeAccount: "खाते काढा"
    }
  }
};

export function getTeamOperationsCopy(locale: AppLocale) {
  return teamOperationsCopy[locale] ?? teamOperationsCopy.en;
}
