import type { AppLocale } from "./translations";

type ChequeStatus = "ENTERED" | "CLEARED" | "RETURNED" | "CANCELLED";

type ChequeWorkspaceCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  metrics: {
    entries: { label: string; caption: string };
    pending: { label: string; caption: string };
    cleared: { label: string; caption: string };
    amount: { label: string; caption: string };
    returned: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    allStatuses: string;
    addCheque: string;
    updateChequeEntry: string;
    addChequeEntry: string;
    saveChanges: string;
    createEntry: string;
  };
  alerts: {
    noAccounts: string;
  };
  table: {
    chequeNo: string;
    account: string;
    bank: string;
    branch: string;
    amount: string;
    status: string;
    entryDate: string;
    emptyState: string;
    loading: string;
  };
  drawer: {
    account: string;
    chequeNumber: string;
    bankName: string;
    branchName: string;
    amount: string;
    accountPreview: string;
    statusActions: string;
  };
  errors: {
    loadFailed: string;
    saveFailed: string;
    updateStatusFailed: string;
  };
  success: {
    updated: string;
    created: string;
    marked: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  statuses: Record<ChequeStatus, string>;
};

const chequeWorkspaceCopy: Record<AppLocale, ChequeWorkspaceCopy> = {
  en: {
    hero: {
      eyebrow: "Cheque",
      title: "Cheque Clearing Desk",
      description: "Capture cheque entries, correct data before clearing, and update clearing outcomes directly from the society dashboard."
    },
    metrics: {
      entries: { label: "Entries", caption: "Cheque entries visible in this queue." },
      pending: { label: "Pending", caption: "Entered cheques waiting for final action." },
      cleared: { label: "Cleared", caption: "Cheques already cleared." },
      amount: { label: "Amount", caption: "Total amount across the filtered queue." },
      returned: { label: "Returned", caption: "Cheques sent back or failed to clear." }
    },
    actions: {
      searchPlaceholder: "Search cheque, bank, account...",
      allStatuses: "All Statuses",
      addCheque: "Add Cheque",
      updateChequeEntry: "Update Cheque Entry",
      addChequeEntry: "Add Cheque Entry",
      saveChanges: "Save Changes",
      createEntry: "Create Entry"
    },
    alerts: {
      noAccounts: "No accounts are available for cheque entry yet."
    },
    table: {
      chequeNo: "Cheque No",
      account: "Account",
      bank: "Bank",
      branch: "Branch",
      amount: "Amount",
      status: "Status",
      entryDate: "Entry Date",
      emptyState: "No cheque entries matched the current filters.",
      loading: "Loading cheque queue..."
    },
    drawer: {
      account: "Account",
      chequeNumber: "Cheque Number",
      bankName: "Bank Name",
      branchName: "Branch Name",
      amount: "Amount",
      accountPreview: "Account Preview",
      statusActions: "Status Actions"
    },
    errors: {
      loadFailed: "Unable to load cheque clearing workspace.",
      saveFailed: "Unable to save cheque entry.",
      updateStatusFailed: "Unable to update cheque status."
    },
    success: {
      updated: "Cheque entry updated.",
      created: "Cheque entry created.",
      marked: "Cheque marked {{status}}."
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    statuses: {
      ENTERED: "Entered",
      CLEARED: "Cleared",
      RETURNED: "Returned",
      CANCELLED: "Cancelled"
    }
  },
  hi: {
    hero: {
      eyebrow: "चेक",
      title: "चेक क्लियरिंग डेस्क",
      description: "चेक एंट्री दर्ज करें, क्लियरिंग से पहले डेटा ठीक करें और क्लियरिंग परिणाम सीधे सोसायटी डैशबोर्ड से अपडेट करें।"
    },
    metrics: {
      entries: { label: "एंट्री", caption: "इस कतार में दिख रही चेक एंट्री।" },
      pending: { label: "लंबित", caption: "अंतिम कार्रवाई की प्रतीक्षा में दर्ज चेक।" },
      cleared: { label: "क्लियर", caption: "जो चेक पहले ही क्लियर हो चुके हैं।" },
      amount: { label: "राशि", caption: "फ़िल्टर की गई कतार की कुल राशि।" },
      returned: { label: "वापस", caption: "वापस भेजे गए या क्लियर न हो सके चेक।" }
    },
    actions: {
      searchPlaceholder: "चेक, बैंक, खाता खोजें...",
      allStatuses: "सभी स्थितियाँ",
      addCheque: "चेक जोड़ें",
      updateChequeEntry: "चेक एंट्री अपडेट करें",
      addChequeEntry: "चेक एंट्री जोड़ें",
      saveChanges: "बदलाव सहेजें",
      createEntry: "एंट्री बनाएँ"
    },
    alerts: {
      noAccounts: "चेक एंट्री के लिए अभी कोई खाता उपलब्ध नहीं है।"
    },
    table: {
      chequeNo: "चेक नं.",
      account: "खाता",
      bank: "बैंक",
      branch: "शाखा",
      amount: "राशि",
      status: "स्थिति",
      entryDate: "एंट्री तारीख",
      emptyState: "वर्तमान फ़िल्टर से मेल खाने वाली कोई चेक एंट्री नहीं मिली।",
      loading: "चेक कतार लोड हो रही है..."
    },
    drawer: {
      account: "खाता",
      chequeNumber: "चेक नंबर",
      bankName: "बैंक का नाम",
      branchName: "शाखा का नाम",
      amount: "राशि",
      accountPreview: "खाता पूर्वावलोकन",
      statusActions: "स्थिति क्रियाएँ"
    },
    errors: {
      loadFailed: "चेक क्लियरिंग वर्कस्पेस लोड नहीं हो सका।",
      saveFailed: "चेक एंट्री सहेजी नहीं जा सकी।",
      updateStatusFailed: "चेक स्थिति अपडेट नहीं हो सकी।"
    },
    success: {
      updated: "चेक एंट्री अपडेट हो गई।",
      created: "चेक एंट्री बन गई।",
      marked: "चेक को {{status}} के रूप में चिह्नित किया गया।"
    },
    pagination: {
      rowsPerPage: "प्रति पृष्ठ पंक्तियाँ:",
      displayedRows: "{{count}} में से {{from}}-{{to}}",
      nextPage: "अगला पृष्ठ",
      previousPage: "पिछला पृष्ठ"
    },
    statuses: {
      ENTERED: "दर्ज",
      CLEARED: "क्लियर",
      RETURNED: "वापस",
      CANCELLED: "रद्द"
    }
  },
  mr: {
    hero: {
      eyebrow: "चेक",
      title: "चेक क्लियरिंग डेस्क",
      description: "चेक नोंदी करा, क्लियरिंगपूर्वी माहिती दुरुस्त करा आणि क्लियरिंगचे निकाल थेट सोसायटी डॅशबोर्डमधून अद्यतनित करा."
    },
    metrics: {
      entries: { label: "नोंदी", caption: "या रांगेत दिसणाऱ्या चेक नोंदी." },
      pending: { label: "प्रलंबित", caption: "अंतिम कारवाईची वाट पाहणारे नोंदवलेले चेक." },
      cleared: { label: "क्लियर", caption: "आधीच क्लियर झालेले चेक." },
      amount: { label: "रक्कम", caption: "फिल्टर केलेल्या रांगेतील एकूण रक्कम." },
      returned: { label: "परत", caption: "परत पाठवलेले किंवा क्लियर न झालेले चेक." }
    },
    actions: {
      searchPlaceholder: "चेक, बँक, खाते शोधा...",
      allStatuses: "सर्व स्थिती",
      addCheque: "चेक जोडा",
      updateChequeEntry: "चेक नोंद अद्यतनित करा",
      addChequeEntry: "चेक नोंद जोडा",
      saveChanges: "बदल जतन करा",
      createEntry: "नोंद तयार करा"
    },
    alerts: {
      noAccounts: "चेक नोंदीसाठी अजून कोणतेही खाते उपलब्ध नाही."
    },
    table: {
      chequeNo: "चेक क्र.",
      account: "खाते",
      bank: "बँक",
      branch: "शाखा",
      amount: "रक्कम",
      status: "स्थिती",
      entryDate: "नोंद दिनांक",
      emptyState: "सध्याच्या फिल्टरशी जुळणाऱ्या कोणत्याही चेक नोंदी सापडल्या नाहीत.",
      loading: "चेक रांग लोड होत आहे..."
    },
    drawer: {
      account: "खाते",
      chequeNumber: "चेक क्रमांक",
      bankName: "बँकेचे नाव",
      branchName: "शाखेचे नाव",
      amount: "रक्कम",
      accountPreview: "खाते पूर्वावलोकन",
      statusActions: "स्थिती क्रिया"
    },
    errors: {
      loadFailed: "चेक क्लियरिंग वर्कस्पेस लोड करता आला नाही.",
      saveFailed: "चेक नोंद जतन करता आली नाही.",
      updateStatusFailed: "चेक स्थिती अद्यतनित करता आली नाही."
    },
    success: {
      updated: "चेक नोंद अद्यतनित झाली.",
      created: "चेक नोंद तयार झाली.",
      marked: "चेक {{status}} म्हणून चिन्हांकित केला."
    },
    pagination: {
      rowsPerPage: "प्रति पान ओळी:",
      displayedRows: "{{count}} पैकी {{from}}-{{to}}",
      nextPage: "पुढील पान",
      previousPage: "मागील पान"
    },
    statuses: {
      ENTERED: "नोंद",
      CLEARED: "क्लियर",
      RETURNED: "परत",
      CANCELLED: "रद्द"
    }
  }
};

export function getChequeWorkspaceCopy(locale: AppLocale) {
  return chequeWorkspaceCopy[locale] ?? chequeWorkspaceCopy.en;
}
