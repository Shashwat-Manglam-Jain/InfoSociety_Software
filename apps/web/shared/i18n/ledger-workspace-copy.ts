import type { AppLocale } from "./translations";

type LedgerWorkspaceCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  metrics: {
    visibleEntries: { label: string; caption: string };
    postedEntries: { label: string; caption: string };
    debitTotal: { label: string; caption: string };
    creditTotal: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    refreshLedger: string;
  };
  filters: {
    entryDate: string;
    postingStatus: string;
    allEntries: string;
  };
  table: {
    headCode: string;
    headName: string;
    type: string;
    mode: string;
    amount: string;
    entryDate: string;
    status: string;
    remark: string;
    emptyState: string;
  };
  headSummary: {
    title: string;
    description: string;
    debit: string;
    credit: string;
    emptyState: string;
  };
  errors: {
    loadFailed: string;
    refreshFailed: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  statuses: {
    posted: string;
    pending: string;
  };
};

const ledgerWorkspaceCopy: Record<AppLocale, LedgerWorkspaceCopy> = {
  en: {
    hero: {
      eyebrow: "Ledger",
      title: "Ledger Register",
      description:
        "View cashbook and ledger records in one searchable register. Use the refresh action to rebuild the head-wise summary for the selected date."
    },
    metrics: {
      visibleEntries: { label: "Visible Entries", caption: "Ledger rows matching the current filters." },
      postedEntries: { label: "Posted Entries", caption: "Entries already posted to the daily ledger." },
      debitTotal: { label: "Debit Total", caption: "Debit total in the current result set." },
      creditTotal: { label: "Credit Total", caption: "Credit total in the current result set." }
    },
    actions: {
      searchPlaceholder: "Search head code, head name, remark...",
      refreshLedger: "Refresh Ledger"
    },
    filters: {
      entryDate: "Entry Date",
      postingStatus: "Posting Status",
      allEntries: "All Entries"
    },
    table: {
      headCode: "Head Code",
      headName: "Head Name",
      type: "Type",
      mode: "Mode",
      amount: "Amount",
      entryDate: "Entry Date",
      status: "Status",
      remark: "Remark",
      emptyState: "No ledger records matched the current filters."
    },
    headSummary: {
      title: "Head Summary",
      description: "Debit and credit totals grouped by ledger head.",
      debit: "Debit",
      credit: "Credit",
      emptyState: "Refresh ledger to build the head summary."
    },
    errors: {
      loadFailed: "Unable to load ledger records.",
      refreshFailed: "Unable to refresh ledger summary."
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    statuses: {
      posted: "Posted",
      pending: "Pending"
    }
  },
  hi: {
    hero: {
      eyebrow: "लेजर",
      title: "लेजर रजिस्टर",
      description:
        "कैशबुक और लेजर रिकॉर्ड एक खोज योग्य रजिस्टर में देखें। चुनी गई तारीख के लिए हेड-वाइज सारांश दोबारा बनाने हेतु रिफ्रेश का उपयोग करें।"
    },
    metrics: {
      visibleEntries: { label: "दिखने वाली एंट्री", caption: "वर्तमान फ़िल्टर से मेल खाने वाली लेजर पंक्तियाँ।" },
      postedEntries: { label: "पोस्टेड एंट्री", caption: "जो एंट्री दैनिक लेजर में पोस्ट हो चुकी हैं।" },
      debitTotal: { label: "डेबिट कुल", caption: "वर्तमान परिणाम सेट में कुल डेबिट।" },
      creditTotal: { label: "क्रेडिट कुल", caption: "वर्तमान परिणाम सेट में कुल क्रेडिट।" }
    },
    actions: {
      searchPlaceholder: "हेड कोड, हेड नाम, रिमार्क खोजें...",
      refreshLedger: "लेजर रिफ्रेश करें"
    },
    filters: {
      entryDate: "एंट्री तारीख",
      postingStatus: "पोस्टिंग स्थिति",
      allEntries: "सभी एंट्री"
    },
    table: {
      headCode: "हेड कोड",
      headName: "हेड नाम",
      type: "प्रकार",
      mode: "मोड",
      amount: "राशि",
      entryDate: "एंट्री तारीख",
      status: "स्थिति",
      remark: "रिमार्क",
      emptyState: "वर्तमान फ़िल्टर से मेल खाने वाला कोई लेजर रिकॉर्ड नहीं मिला।"
    },
    headSummary: {
      title: "हेड सारांश",
      description: "लेजर हेड के अनुसार समूहित डेबिट और क्रेडिट कुल।",
      debit: "डेबिट",
      credit: "क्रेडिट",
      emptyState: "हेड सारांश बनाने के लिए लेजर रिफ्रेश करें।"
    },
    errors: {
      loadFailed: "लेजर रिकॉर्ड लोड नहीं हो सके।",
      refreshFailed: "लेजर सारांश रिफ्रेश नहीं हो सका।"
    },
    pagination: {
      rowsPerPage: "प्रति पृष्ठ पंक्तियाँ:",
      displayedRows: "{{count}} में से {{from}}-{{to}}",
      nextPage: "अगला पृष्ठ",
      previousPage: "पिछला पृष्ठ"
    },
    statuses: {
      posted: "पोस्टेड",
      pending: "लंबित"
    }
  },
  mr: {
    hero: {
      eyebrow: "लेजर",
      title: "लेजर रजिस्टर",
      description:
        "कॅशबुक आणि लेजर नोंदी एका शोधता येणाऱ्या रजिस्टरमध्ये पाहा. निवडलेल्या तारखेकरिता हेडनिहाय सारांश पुन्हा तयार करण्यासाठी रिफ्रेश वापरा."
    },
    metrics: {
      visibleEntries: { label: "दिसणाऱ्या नोंदी", caption: "सध्याच्या फिल्टरशी जुळणाऱ्या लेजर नोंदी." },
      postedEntries: { label: "पोस्टेड नोंदी", caption: "दैनंदिन लेजरमध्ये आधीच पोस्ट झालेल्या नोंदी." },
      debitTotal: { label: "डेबिट एकूण", caption: "सध्याच्या निकाल संचातील डेबिट एकूण." },
      creditTotal: { label: "क्रेडिट एकूण", caption: "सध्याच्या निकाल संचातील क्रेडिट एकूण." }
    },
    actions: {
      searchPlaceholder: "हेड कोड, हेड नाव, टिपण शोधा...",
      refreshLedger: "लेजर रिफ्रेश करा"
    },
    filters: {
      entryDate: "नोंद दिनांक",
      postingStatus: "पोस्टिंग स्थिती",
      allEntries: "सर्व नोंदी"
    },
    table: {
      headCode: "हेड कोड",
      headName: "हेड नाव",
      type: "प्रकार",
      mode: "मोड",
      amount: "रक्कम",
      entryDate: "नोंद दिनांक",
      status: "स्थिती",
      remark: "टिपण",
      emptyState: "सध्याच्या फिल्टरशी जुळणाऱ्या कोणत्याही लेजर नोंदी सापडल्या नाहीत."
    },
    headSummary: {
      title: "हेड सारांश",
      description: "लेजर हेडनुसार गटबद्ध डेबिट आणि क्रेडिट एकूण.",
      debit: "डेबिट",
      credit: "क्रेडिट",
      emptyState: "हेड सारांश तयार करण्यासाठी लेजर रिफ्रेश करा."
    },
    errors: {
      loadFailed: "लेजर नोंदी लोड करता आल्या नाहीत.",
      refreshFailed: "लेजर सारांश रिफ्रेश करता आला नाही."
    },
    pagination: {
      rowsPerPage: "प्रति पान ओळी:",
      displayedRows: "{{count}} पैकी {{from}}-{{to}}",
      nextPage: "पुढील पान",
      previousPage: "मागील पान"
    },
    statuses: {
      posted: "पोस्टेड",
      pending: "प्रलंबित"
    }
  }
};

export function getLedgerWorkspaceCopy(locale: AppLocale) {
  return ledgerWorkspaceCopy[locale] ?? ledgerWorkspaceCopy.en;
}
