import type { AppLocale } from "./translations";

type FieldOperativesCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    addAgent: string;
  };
  metrics: {
    agents: { label: string; caption: string };
    active: { label: string; caption: string };
    today: { label: string; caption: string };
    month: { label: string; caption: string };
  };
  table: {
    agentDetails: string;
    identity: string;
    assignment: string;
    daily: string;
    monthly: string;
    status: string;
  };
  emptyState: string;
  values: {
    activeModules: string;
    mainSociety: string;
    branchId: string;
    online: string;
    locked: string;
    manageProfile: string;
    defaultAvatar: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
  };
};

const fieldOperativesCopy: Record<AppLocale, FieldOperativesCopy> = {
  en: {
    hero: {
      eyebrow: "Field Team",
      title: "Field operatives",
      description: "Track agent assignments, collection performance, and account status across the society.",
      searchPlaceholder: "Search agents",
      addAgent: "Add agent"
    },
    metrics: {
      agents: { label: "Agents", caption: "Field accounts linked to this society." },
      active: { label: "Active", caption: "Agents currently able to sign in." },
      today: { label: "Today", caption: "Collection entered today." },
      month: { label: "This Month", caption: "Collection entered this month." }
    },
    table: {
      agentDetails: "Agent Details",
      identity: "Identity",
      assignment: "Assignment",
      daily: "Daily",
      monthly: "Monthly",
      status: "Status"
    },
    emptyState: "No matching field operatives found in the registry.",
    values: {
      activeModules: "{{count}} Active Modules",
      mainSociety: "Main Society",
      branchId: "ID: {{code}}",
      online: "Online",
      locked: "Locked",
      manageProfile: "Manage Profile",
      defaultAvatar: "A"
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}"
    }
  },
  hi: {
    hero: {
      eyebrow: "फील्ड टीम",
      title: "फील्ड ऑपरेटिव्स",
      description: "सोसायटी में एजेंट असाइनमेंट, कलेक्शन प्रदर्शन और अकाउंट स्थिति को एक ही जगह से ट्रैक करें।",
      searchPlaceholder: "एजेंट खोजें",
      addAgent: "एजेंट जोड़ें"
    },
    metrics: {
      agents: { label: "एजेंट", caption: "इस सोसायटी से जुड़े फील्ड अकाउंट।" },
      active: { label: "सक्रिय", caption: "वे एजेंट जो अभी साइन इन कर सकते हैं।" },
      today: { label: "आज", caption: "आज दर्ज की गई वसूली।" },
      month: { label: "इस माह", caption: "इस महीने दर्ज की गई वसूली।" }
    },
    table: {
      agentDetails: "एजेंट विवरण",
      identity: "पहचान",
      assignment: "असाइनमेंट",
      daily: "दैनिक",
      monthly: "मासिक",
      status: "स्थिति"
    },
    emptyState: "रजिस्ट्र्री में मेल खाते फील्ड ऑपरेटिव्स नहीं मिले।",
    values: {
      activeModules: "{{count}} सक्रिय मॉड्यूल",
      mainSociety: "मुख्य सोसायटी",
      branchId: "आईडी: {{code}}",
      online: "ऑनलाइन",
      locked: "लॉक्ड",
      manageProfile: "प्रोफ़ाइल प्रबंधित करें",
      defaultAvatar: "ए"
    },
    pagination: {
      rowsPerPage: "प्रति पेज पंक्तियाँ:",
      displayedRows: "{{from}}-{{to}} / {{count}}"
    }
  },
  mr: {
    hero: {
      eyebrow: "फील्ड टीम",
      title: "फील्ड ऑपरेटिव्हज",
      description: "सोसायटीतील एजंट असाइनमेंट, वसुलीची कामगिरी आणि खाते स्थिती एकाच ठिकाणाहून पाहा.",
      searchPlaceholder: "एजंट शोधा",
      addAgent: "एजंट जोडा"
    },
    metrics: {
      agents: { label: "एजंट", caption: "या सोसायटीशी जोडलेली फील्ड खाती." },
      active: { label: "सक्रिय", caption: "सध्या साइन इन करू शकणारे एजंट." },
      today: { label: "आज", caption: "आज नोंदवलेली वसुली." },
      month: { label: "हा महिना", caption: "या महिन्यात नोंदवलेली वसुली." }
    },
    table: {
      agentDetails: "एजंट तपशील",
      identity: "ओळख",
      assignment: "असाइनमेंट",
      daily: "दैनिक",
      monthly: "मासिक",
      status: "स्थिती"
    },
    emptyState: "रजिस्ट्रमध्ये जुळणारे फील्ड ऑपरेटिव्हज सापडले नाहीत.",
    values: {
      activeModules: "{{count}} सक्रिय मॉड्यूल्स",
      mainSociety: "मुख्य सोसायटी",
      branchId: "आयडी: {{code}}",
      online: "ऑनलाइन",
      locked: "लॉक्ड",
      manageProfile: "प्रोफाइल व्यवस्थापित करा",
      defaultAvatar: "ए"
    },
    pagination: {
      rowsPerPage: "प्रति पान ओळी:",
      displayedRows: "{{from}}-{{to}} पैकी {{count}}"
    }
  }
};

export function getFieldOperativesCopy(locale: AppLocale) {
  return fieldOperativesCopy[locale] ?? fieldOperativesCopy.en;
}
