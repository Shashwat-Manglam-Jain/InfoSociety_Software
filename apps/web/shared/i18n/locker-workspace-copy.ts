import type { AppLocale } from "./translations";

type LockerStatus = "ACTIVE" | "EXPIRED" | "CLOSED";
type LockerSize = "SMALL" | "MEDIUM" | "LARGE";

type LockerWorkspaceCopy = {
  hero: { eyebrow: string; title: string; description: string };
  metrics: {
    visibleLockers: { label: string; caption: string };
    activeLockers: { label: string; caption: string };
    closedLockers: { label: string; caption: string };
    annualCharges: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    allStatuses: string;
    allocateLocker: string;
    saveLocker: string;
    deleteLocker: string;
    recordVisit: string;
    closeLocker: string;
  };
  alerts: {
    noActiveClients: string;
    visitGuidance: string;
    selfServiceMode: string;
  };
  table: {
    lockerNo: string;
    customer: string;
    customerCode: string;
    branch: string;
    size: string;
    opened: string;
    annualCharge: string;
    visits: string;
    status: string;
    emptyState: string;
  };
  drawers: {
    client: string;
    lockerNumber: string;
    allottedClient: string;
    annualCharge: string;
    allocationPreview: string;
    allocationPreviewClient: string;
    allocationPreviewBranch: string;
    noBranch: string;
    details: string;
    visitLog: string;
    visitLogDescription: string;
    visitRemark: string;
    visitRemarkPlaceholder: string;
    visitedAt: string;
    remarks: string;
    noVisitHistory: string;
    closeLocker: string;
    closingReason: string;
    closingReasonPlaceholder: string;
  };
  detailMetrics: {
    annualCharge: { label: string; caption: string };
    openedOn: { label: string; caption: string };
    closedOn: { label: string; caption: string };
  };
  errors: {
    loadLockers: string;
    loadVisits: string;
    createLocker: string;
    visitLocker: string;
    closeLocker: string;
    updateLocker: string;
    deleteLocker: string;
  };
  confirmDelete: string;
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  statuses: Record<LockerStatus, string>;
  sizes: Record<LockerSize, string>;
};

const lockerWorkspaceCopy: Record<AppLocale, LockerWorkspaceCopy> = {
  en: {
    hero: {
      eyebrow: "Locker",
      title: "Locker Registry",
      description: "Manage locker allocation, visits, annual charges, active status, and customer-linked access from one place."
    },
    metrics: {
      visibleLockers: { label: "Visible Lockers", caption: "Rows currently matching the locker filters." },
      activeLockers: { label: "Active Lockers", caption: "Allocated lockers available for visit logging." },
      closedLockers: { label: "Closed Lockers", caption: "Lockers already closed or expired." },
      annualCharges: { label: "Annual Charges", caption: "Annual charge total across the visible rows." }
    },
    actions: {
      searchPlaceholder: "Search locker, client, or customer code...",
      allStatuses: "All Statuses",
      allocateLocker: "Allocate Locker",
      saveLocker: "Save Locker",
      deleteLocker: "Delete Locker",
      recordVisit: "Record Visit",
      closeLocker: "Close Locker"
    },
    alerts: {
      noActiveClients: "No active client profiles are available for locker allocation yet.",
      visitGuidance: "Use visit remarks to record what was accessed, deposited, or removed from the locker during each visit.",
      selfServiceMode: "This locker desk is in self-service mode. Allocation, reassignment, and closure actions are hidden for this login."
    },
    table: {
      lockerNo: "Locker No",
      customer: "Customer",
      customerCode: "Customer Code",
      branch: "Branch",
      size: "Size",
      opened: "Opened",
      annualCharge: "Annual Charge",
      visits: "Visits",
      status: "Status",
      emptyState: "No locker rows matched the current filters."
    },
    drawers: {
      client: "Client",
      lockerNumber: "Locker Number",
      allottedClient: "Allotted Client",
      annualCharge: "Annual Charge",
      allocationPreview: "Allocation Preview",
      allocationPreviewClient: "Client: {{name}} ({{code}})",
      allocationPreviewBranch: "Branch: {{branch}}",
      noBranch: "No Branch",
      details: "Locker Details",
      visitLog: "Visit Log",
      visitLogDescription: "Capture what was deposited, collected, or inspected in the locker during each visit.",
      visitRemark: "Visit Remark",
      visitRemarkPlaceholder: "Example: gold packet verified, document envelope collected",
      visitedAt: "Visited At",
      remarks: "Remarks",
      noVisitHistory: "No visit history has been recorded yet.",
      closeLocker: "Close Locker",
      closingReason: "Closing Reason",
      closingReasonPlaceholder: "Optional closure reason"
    },
    detailMetrics: {
      annualCharge: { label: "Annual Charge", caption: "Configured yearly locker fee." },
      openedOn: { label: "Opened On", caption: "Locker allocation date." },
      closedOn: { label: "Closed On", caption: "Closing date when applicable." }
    },
    errors: {
      loadLockers: "Unable to load locker records.",
      loadVisits: "Unable to load locker visits.",
      createLocker: "Unable to create locker.",
      visitLocker: "Unable to record locker visit.",
      closeLocker: "Unable to close locker.",
      updateLocker: "Unable to update locker.",
      deleteLocker: "Unable to delete locker."
    },
    confirmDelete: "Delete locker {{lockerNumber}}?",
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    statuses: { ACTIVE: "Active", EXPIRED: "Expired", CLOSED: "Closed" },
    sizes: { SMALL: "Small", MEDIUM: "Medium", LARGE: "Large" }
  },
  hi: {
    hero: {
      eyebrow: "लॉकर",
      title: "लॉकर रजिस्ट्री",
      description: "एक ही जगह से लॉकर आवंटन, विजिट, वार्षिक शुल्क, सक्रिय स्थिति और ग्राहक-लिंक्ड एक्सेस प्रबंधित करें।"
    },
    metrics: {
      visibleLockers: { label: "दिखने वाले लॉकर", caption: "वर्तमान फ़िल्टर से मेल खाने वाली पंक्तियाँ।" },
      activeLockers: { label: "सक्रिय लॉकर", caption: "विजिट लॉगिंग के लिए उपलब्ध आवंटित लॉकर।" },
      closedLockers: { label: "बंद लॉकर", caption: "जो लॉकर पहले से बंद या समाप्त हो चुके हैं।" },
      annualCharges: { label: "वार्षिक शुल्क", caption: "दिखने वाली पंक्तियों का कुल वार्षिक शुल्क।" }
    },
    actions: {
      searchPlaceholder: "लॉकर, ग्राहक या कस्टमर कोड खोजें...",
      allStatuses: "सभी स्थितियाँ",
      allocateLocker: "लॉकर आवंटित करें",
      saveLocker: "लॉकर सहेजें",
      deleteLocker: "लॉकर हटाएँ",
      recordVisit: "विजिट दर्ज करें",
      closeLocker: "लॉकर बंद करें"
    },
    alerts: {
      noActiveClients: "लॉकर आवंटन के लिए अभी कोई सक्रिय ग्राहक प्रोफ़ाइल उपलब्ध नहीं है।",
      visitGuidance: "हर विजिट के दौरान लॉकर से क्या एक्सेस, जमा या निकाला गया, उसे दर्ज करने के लिए विजिट रिमार्क का उपयोग करें।",
      selfServiceMode: "यह लॉकर डेस्क सेल्फ-सर्विस मोड में है। इस लॉगिन के लिए आवंटन, पुनः आवंटन और बंद करने की क्रियाएँ छिपी हुई हैं।"
    },
    table: {
      lockerNo: "लॉकर नं.",
      customer: "ग्राहक",
      customerCode: "कस्टमर कोड",
      branch: "शाखा",
      size: "आकार",
      opened: "खोला गया",
      annualCharge: "वार्षिक शुल्क",
      visits: "विजिट",
      status: "स्थिति",
      emptyState: "वर्तमान फ़िल्टर से मेल खाने वाली कोई लॉकर पंक्ति नहीं मिली।"
    },
    drawers: {
      client: "ग्राहक",
      lockerNumber: "लॉकर नंबर",
      allottedClient: "आवंटित ग्राहक",
      annualCharge: "वार्षिक शुल्क",
      allocationPreview: "आवंटन पूर्वावलोकन",
      allocationPreviewClient: "ग्राहक: {{name}} ({{code}})",
      allocationPreviewBranch: "शाखा: {{branch}}",
      noBranch: "कोई शाखा नहीं",
      details: "लॉकर विवरण",
      visitLog: "विजिट लॉग",
      visitLogDescription: "हर विजिट के दौरान लॉकर में क्या जमा, निकाला या जांचा गया, उसे दर्ज करें।",
      visitRemark: "विजिट रिमार्क",
      visitRemarkPlaceholder: "उदाहरण: सोने का पैकेट सत्यापित, दस्तावेज़ लिफ़ाफ़ा प्राप्त",
      visitedAt: "विजिट समय",
      remarks: "रिमार्क",
      noVisitHistory: "अभी तक कोई विजिट इतिहास दर्ज नहीं किया गया है।",
      closeLocker: "लॉकर बंद करें",
      closingReason: "बंद करने का कारण",
      closingReasonPlaceholder: "वैकल्पिक बंद करने का कारण"
    },
    detailMetrics: {
      annualCharge: { label: "वार्षिक शुल्क", caption: "कॉन्फ़िगर किया गया वार्षिक लॉकर शुल्क।" },
      openedOn: { label: "खोला गया", caption: "लॉकर आवंटन की तारीख।" },
      closedOn: { label: "बंद किया गया", caption: "लागू होने पर बंद करने की तारीख।" }
    },
    errors: {
      loadLockers: "लॉकर रिकॉर्ड लोड नहीं हो सके।",
      loadVisits: "लॉकर विजिट लोड नहीं हो सके।",
      createLocker: "लॉकर बनाया नहीं जा सका।",
      visitLocker: "लॉकर विजिट दर्ज नहीं की जा सकी।",
      closeLocker: "लॉकर बंद नहीं किया जा सका।",
      updateLocker: "लॉकर अपडेट नहीं किया जा सका।",
      deleteLocker: "लॉकर हटाया नहीं जा सका।"
    },
    confirmDelete: "क्या लॉकर {{lockerNumber}} हटाना है?",
    pagination: {
      rowsPerPage: "प्रति पृष्ठ पंक्तियाँ:",
      displayedRows: "{{count}} में से {{from}}-{{to}}",
      nextPage: "अगला पृष्ठ",
      previousPage: "पिछला पृष्ठ"
    },
    statuses: { ACTIVE: "सक्रिय", EXPIRED: "समाप्त", CLOSED: "बंद" },
    sizes: { SMALL: "छोटा", MEDIUM: "मध्यम", LARGE: "बड़ा" }
  },
  mr: {
    hero: {
      eyebrow: "लॉकर",
      title: "लॉकर रजिस्ट्री",
      description: "एकाच ठिकाणी लॉकर वाटप, भेटी, वार्षिक शुल्क, सक्रिय स्थिती आणि ग्राहक-संबंधित प्रवेश व्यवस्थापित करा."
    },
    metrics: {
      visibleLockers: { label: "दिसणारे लॉकर", caption: "सध्याच्या फिल्टरशी जुळणाऱ्या नोंदी." },
      activeLockers: { label: "सक्रिय लॉकर", caption: "भेट नोंदणीसाठी उपलब्ध वाटप केलेले लॉकर." },
      closedLockers: { label: "बंद लॉकर", caption: "आधीच बंद किंवा कालबाह्य झालेले लॉकर." },
      annualCharges: { label: "वार्षिक शुल्क", caption: "दिसणाऱ्या नोंदींचे एकूण वार्षिक शुल्क." }
    },
    actions: {
      searchPlaceholder: "लॉकर, ग्राहक किंवा कस्टमर कोड शोधा...",
      allStatuses: "सर्व स्थिती",
      allocateLocker: "लॉकर वाटप करा",
      saveLocker: "लॉकर जतन करा",
      deleteLocker: "लॉकर हटवा",
      recordVisit: "भेट नोंदवा",
      closeLocker: "लॉकर बंद करा"
    },
    alerts: {
      noActiveClients: "लॉकर वाटपासाठी अजून कोणतीही सक्रिय ग्राहक प्रोफाइल उपलब्ध नाही.",
      visitGuidance: "प्रत्येक भेटीत लॉकरमधून काय पाहिले, जमा केले किंवा काढले, ते नोंदवण्यासाठी भेट टिपण वापरा.",
      selfServiceMode: "हा लॉकर डेस्क स्व-सेवा मोडमध्ये आहे. या लॉगिनसाठी वाटप, पुनर्वाटप आणि बंद करण्याच्या क्रिया लपविल्या आहेत."
    },
    table: {
      lockerNo: "लॉकर क्र.",
      customer: "ग्राहक",
      customerCode: "कस्टमर कोड",
      branch: "शाखा",
      size: "आकार",
      opened: "सुरू",
      annualCharge: "वार्षिक शुल्क",
      visits: "भेटी",
      status: "स्थिती",
      emptyState: "सध्याच्या फिल्टरशी जुळणाऱ्या कोणत्याही लॉकर नोंदी आढळल्या नाहीत."
    },
    drawers: {
      client: "ग्राहक",
      lockerNumber: "लॉकर क्रमांक",
      allottedClient: "वाटप केलेला ग्राहक",
      annualCharge: "वार्षिक शुल्क",
      allocationPreview: "वाटप पूर्वावलोकन",
      allocationPreviewClient: "ग्राहक: {{name}} ({{code}})",
      allocationPreviewBranch: "शाखा: {{branch}}",
      noBranch: "शाखा नाही",
      details: "लॉकर तपशील",
      visitLog: "भेट नोंद",
      visitLogDescription: "प्रत्येक भेटीत लॉकरमध्ये काय जमा, गोळा किंवा तपासले गेले ते नोंदवा.",
      visitRemark: "भेट टिपण",
      visitRemarkPlaceholder: "उदाहरण: सोन्याचे पॅकेट पडताळले, कागदपत्रांचे पाकीट घेतले",
      visitedAt: "भेट वेळ",
      remarks: "टिपण",
      noVisitHistory: "अजून कोणताही भेट इतिहास नोंदवलेला नाही.",
      closeLocker: "लॉकर बंद करा",
      closingReason: "बंद करण्याचे कारण",
      closingReasonPlaceholder: "पर्यायी बंद कारण"
    },
    detailMetrics: {
      annualCharge: { label: "वार्षिक शुल्क", caption: "कॉन्फिगर केलेले वार्षिक लॉकर शुल्क." },
      openedOn: { label: "सुरू दिनांक", caption: "लॉकर वाटपाची तारीख." },
      closedOn: { label: "बंद दिनांक", caption: "लागू असल्यास बंद करण्याची तारीख." }
    },
    errors: {
      loadLockers: "लॉकर नोंदी लोड करता आल्या नाहीत.",
      loadVisits: "लॉकर भेटी लोड करता आल्या नाहीत.",
      createLocker: "लॉकर तयार करता आला नाही.",
      visitLocker: "लॉकर भेट नोंदवता आली नाही.",
      closeLocker: "लॉकर बंद करता आला नाही.",
      updateLocker: "लॉकर अद्यतनित करता आला नाही.",
      deleteLocker: "लॉकर हटवता आला नाही."
    },
    confirmDelete: "लॉकर {{lockerNumber}} हटवायचा आहे का?",
    pagination: {
      rowsPerPage: "प्रति पान ओळी:",
      displayedRows: "{{count}} पैकी {{from}}-{{to}}",
      nextPage: "पुढील पान",
      previousPage: "मागील पान"
    },
    statuses: { ACTIVE: "सक्रिय", EXPIRED: "कालबाह्य", CLOSED: "बंद" },
    sizes: { SMALL: "लहान", MEDIUM: "मध्यम", LARGE: "मोठा" }
  }
};

export function getLockerWorkspaceCopy(locale: AppLocale) {
  return lockerWorkspaceCopy[locale] ?? lockerWorkspaceCopy.en;
}
