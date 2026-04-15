import type { AppLocale } from "./translations";

type TeamOperationsCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    addStaffUser: string;
  };
  metrics: {
    staff: { label: string; caption: string };
    active: { label: string; caption: string };
    admins: { label: string; caption: string };
    branches: { label: string; caption: string };
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
    editAccount: string;
    manageAccess: string;
  };
};

const teamOperationsCopy: Record<AppLocale, TeamOperationsCopy> = {
  en: {
    hero: {
      eyebrow: "Society Staff",
      title: "Society staff",
      description: "Manage staff accounts here. Agents and client logins are handled from their own sections.",
      searchPlaceholder: "Search staff",
      addStaffUser: "Add staff user"
    },
    metrics: {
      staff: { label: "Staff", caption: "All staff logins linked to this society." },
      active: { label: "Active", caption: "Staff accounts currently enabled." },
      admins: { label: "Admins", caption: "Primary administrator accounts." },
      branches: { label: "Branches", caption: "Branches covered by staff assignments." }
    },
    table: {
      user: "Staff member",
      accountType: "Access level",
      branch: "Branch",
      modules: "Modules",
      status: "Status",
      actions: "Actions"
    },
    emptyState: "No matching staff accounts found.",
    fallback: {
      defaultAvatar: "S",
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
      editAccount: "Edit account",
      manageAccess: "Manage access"
    }
  },
  hi: {
    hero: {
      eyebrow: "सोसायटी स्टाफ",
      title: "सोसायटी स्टाफ",
      description: "यहाँ स्टाफ खाते प्रबंधित करें। एजेंट और क्लाइंट लॉगिन उनके अलग सेक्शन से संभाले जाते हैं।",
      searchPlaceholder: "स्टाफ खोजें",
      addStaffUser: "स्टाफ उपयोगकर्ता जोड़ें"
    },
    metrics: {
      staff: { label: "स्टाफ", caption: "इस सोसायटी से जुड़े सभी स्टाफ लॉगिन।" },
      active: { label: "सक्रिय", caption: "अभी सक्षम स्टाफ खाते।" },
      admins: { label: "एडमिन", caption: "मुख्य प्रशासक खाते।" },
      branches: { label: "शाखाएँ", caption: "स्टाफ असाइनमेंट से कवर शाखाएँ।" }
    },
    table: {
      user: "स्टाफ सदस्य",
      accountType: "एक्सेस स्तर",
      branch: "शाखा",
      modules: "मॉड्यूल",
      status: "स्थिति",
      actions: "कार्रवाई"
    },
    emptyState: "कोई मेल खाते स्टाफ खाते नहीं मिले।",
    fallback: {
      defaultAvatar: "स्",
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
      editAccount: "खाता संपादित करें",
      manageAccess: "एक्सेस प्रबंधित करें"
    }
  },
  mr: {
    hero: {
      eyebrow: "सोसायटी स्टाफ",
      title: "सोसायटी स्टाफ",
      description: "येथे स्टाफ खाती व्यवस्थापित करा. एजंट आणि क्लायंट लॉगिन त्यांच्या वेगळ्या विभागांतून हाताळले जातात.",
      searchPlaceholder: "स्टाफ शोधा",
      addStaffUser: "स्टाफ वापरकर्ता जोडा"
    },
    metrics: {
      staff: { label: "स्टाफ", caption: "या सोसायटीशी जोडलेली सर्व स्टाफ लॉगिन्स." },
      active: { label: "सक्रिय", caption: "सध्या सक्षम स्टाफ खाती." },
      admins: { label: "अॅडमिन", caption: "मुख्य प्रशासक खाती." },
      branches: { label: "शाखा", caption: "स्टाफ नेमणुकीने कव्हर झालेल्या शाखा." }
    },
    table: {
      user: "स्टाफ सदस्य",
      accountType: "अॅक्सेस स्तर",
      branch: "शाखा",
      modules: "मॉड्यूल्स",
      status: "स्थिती",
      actions: "क्रिया"
    },
    emptyState: "जुळणारी स्टाफ खाती सापडली नाहीत.",
    fallback: {
      defaultAvatar: "स्",
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
      editAccount: "खाते संपादित करा",
      manageAccess: "अॅक्सेस व्यवस्थापित करा"
    }
  }
};

export function getTeamOperationsCopy(locale: AppLocale) {
  return teamOperationsCopy[locale] ?? teamOperationsCopy.en;
}
