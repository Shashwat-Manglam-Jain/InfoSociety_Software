import type { AppLocale } from "./translations";

type LoanStatus = "APPLIED" | "SANCTIONED" | "DISBURSED" | "OVERDUE" | "CLOSED";

type LoanWorkspaceCopy = {
  hero: {
    eyebrow: string;
    title: string;
    manageDescription: string;
    reviewDescription: string;
  };
  metrics: {
    loanCases: { label: string; caption: string };
    appliedAmount: { label: string; caption: string };
    activeLoans: { label: string; caption: string };
    overdue: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    allStatuses: string;
    applyLoan: string;
    applyNewLoan: string;
    createLoanApplication: string;
    saveSanction: string;
    disburseAmount: string;
    recordRecovery: string;
    updateOverdue: string;
  };
  alerts: {
    noClients: string;
    restrictedActions: string;
  };
  table: {
    borrower: string;
    account: string;
    guarantors: string;
    applied: string;
    overdue: string;
    status: string;
    emptyState: string;
    loading: string;
    noGuarantorAssigned: string;
  };
  drawer: {
    borrower: string;
    applicationAmount: string;
    interestRate: string;
    expiryDate: string;
    primaryGuarantor: string;
    secondaryGuarantor: string;
    thirdGuarantor: string;
    remarks: string;
    notAssigned: string;
    borrowerPreview: string;
    branch: string;
    guarantorResponsibility: string;
    noGuarantorsAssigned: string;
    sanctionLoan: string;
    sanctionedAmount: string;
    sanctionDate: string;
    disburse: string;
    recovery: string;
    recoverAmount: string;
    overdueControl: string;
    overdueAmount: string;
    appliedChip: string;
    overdueChip: string;
  };
  detailMetrics: {
    applied: { label: string; caption: string };
    sanctioned: { label: string; caption: string };
    disbursed: { label: string; caption: string };
  };
  errors: {
    loadFailed: string;
    createFailed: string;
    updateFailed: string;
  };
  success: {
    created: string;
    sanctioned: string;
    disbursed: string;
    recovered: string;
    overdueUpdated: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  statuses: Record<LoanStatus, string>;
};

const loanWorkspaceCopy: Record<AppLocale, LoanWorkspaceCopy> = {
  en: {
    hero: {
      eyebrow: "Loans",
      title: "Loan Desk",
      manageDescription:
        "Create loan applications, assign guarantors, and manage sanction, disbursement, recovery, and overdue tracking from the society dashboard.",
      reviewDescription:
        "Review live loan records, track repayment progress, and submit new loan requests within your allowed customer scope."
    },
    metrics: {
      loanCases: { label: "Loan Cases", caption: "Loan applications visible in this registry." },
      appliedAmount: { label: "Applied Amount", caption: "Total application amount across visible loans." },
      activeLoans: { label: "Active Loans", caption: "Loan cases still in progress or collectible." },
      overdue: { label: "Overdue", caption: "Loans flagged overdue against disbursed cases." }
    },
    actions: {
      searchPlaceholder: "Search borrower, guarantor, or account...",
      allStatuses: "All Statuses",
      applyLoan: "Apply Loan",
      applyNewLoan: "Apply New Loan",
      createLoanApplication: "Create Loan Application",
      saveSanction: "Save Sanction",
      disburseAmount: "Disburse Amount",
      recordRecovery: "Record Recovery",
      updateOverdue: "Update Overdue"
    },
    alerts: {
      noClients: "No active client accounts are available for loan processing yet.",
      restrictedActions:
        "Administrative loan actions are hidden for this login. You can still review live loan data and open your own loan requests if your access allows it."
    },
    table: {
      borrower: "Borrower",
      account: "Account",
      guarantors: "Guarantors",
      applied: "Applied",
      overdue: "Overdue",
      status: "Status",
      emptyState: "No loan records matched the current filters.",
      loading: "Loading loan registry...",
      noGuarantorAssigned: "No guarantor assigned"
    },
    drawer: {
      borrower: "Borrower",
      applicationAmount: "Application Amount",
      interestRate: "Interest Rate",
      expiryDate: "Expiry Date",
      primaryGuarantor: "Primary Guarantor",
      secondaryGuarantor: "Secondary Guarantor",
      thirdGuarantor: "Third Guarantor",
      remarks: "Remarks",
      notAssigned: "Not assigned",
      borrowerPreview: "Borrower Preview",
      branch: "Branch: {{branch}}",
      guarantorResponsibility: "Guarantor Responsibility",
      noGuarantorsAssigned: "No guarantors assigned to this loan.",
      sanctionLoan: "Sanction Loan",
      sanctionedAmount: "Sanctioned Amount",
      sanctionDate: "Sanction Date",
      disburse: "Disburse",
      recovery: "Recovery",
      recoverAmount: "Recover Amount",
      overdueControl: "Overdue Control",
      overdueAmount: "Overdue Amount",
      appliedChip: "Applied {{amount}}",
      overdueChip: "Overdue {{amount}}"
    },
    detailMetrics: {
      applied: { label: "Applied", caption: "Borrower application amount." },
      sanctioned: { label: "Sanctioned", caption: "Latest sanctioned amount." },
      disbursed: { label: "Disbursed", caption: "Amount already disbursed." }
    },
    errors: {
      loadFailed: "Unable to load loan records.",
      createFailed: "Unable to create loan application.",
      updateFailed: "Unable to update the loan."
    },
    success: {
      created: "Loan application created.",
      sanctioned: "Loan sanctioned.",
      disbursed: "Loan amount disbursed.",
      recovered: "Recovery recorded.",
      overdueUpdated: "Overdue updated."
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    statuses: {
      APPLIED: "Applied",
      SANCTIONED: "Sanctioned",
      DISBURSED: "Disbursed",
      OVERDUE: "Overdue",
      CLOSED: "Closed"
    }
  },
  hi: {
    hero: {
      eyebrow: "ऋण",
      title: "ऋण डेस्क",
      manageDescription:
        "ऋण आवेदन बनाएँ, गारंटर असाइन करें और सोसायटी डैशबोर्ड से स्वीकृति, वितरण, वसूली और ओवरड्यू ट्रैकिंग प्रबंधित करें।",
      reviewDescription:
        "लाइव ऋण रिकॉर्ड देखें, पुनर्भुगतान प्रगति ट्रैक करें और अपने अनुमत ग्राहक दायरे में नए ऋण अनुरोध जमा करें।"
    },
    metrics: {
      loanCases: { label: "ऋण मामले", caption: "इस रजिस्ट्ररी में दिख रहे ऋण आवेदन।" },
      appliedAmount: { label: "आवेदन राशि", caption: "दिख रहे ऋणों की कुल आवेदन राशि।" },
      activeLoans: { label: "सक्रिय ऋण", caption: "जो ऋण मामले अभी प्रगति में हैं या वसूलने योग्य हैं।" },
      overdue: { label: "ओवरड्यू", caption: "वितरित मामलों के मुकाबले ओवरड्यू चिह्नित ऋण।" }
    },
    actions: {
      searchPlaceholder: "उधारकर्ता, गारंटर या खाता खोजें...",
      allStatuses: "सभी स्थितियाँ",
      applyLoan: "ऋण आवेदन करें",
      applyNewLoan: "नया ऋण आवेदन करें",
      createLoanApplication: "ऋण आवेदन बनाएँ",
      saveSanction: "स्वीकृति सहेजें",
      disburseAmount: "राशि वितरित करें",
      recordRecovery: "वसूली दर्ज करें",
      updateOverdue: "ओवरड्यू अपडेट करें"
    },
    alerts: {
      noClients: "ऋण प्रक्रिया के लिए अभी कोई सक्रिय ग्राहक खाता उपलब्ध नहीं है।",
      restrictedActions:
        "इस लॉगिन के लिए प्रशासनिक ऋण क्रियाएँ छिपी हुई हैं। आपकी अनुमति अनुसार आप लाइव ऋण डेटा देख सकते हैं और अपने ऋण अनुरोध खोल सकते हैं।"
    },
    table: {
      borrower: "उधारकर्ता",
      account: "खाता",
      guarantors: "गारंटर",
      applied: "आवेदित",
      overdue: "ओवरड्यू",
      status: "स्थिति",
      emptyState: "वर्तमान फ़िल्टर से मेल खाने वाला कोई ऋण रिकॉर्ड नहीं मिला।",
      loading: "ऋण रजिस्ट्ररी लोड हो रही है...",
      noGuarantorAssigned: "कोई गारंटर असाइन नहीं"
    },
    drawer: {
      borrower: "उधारकर्ता",
      applicationAmount: "आवेदन राशि",
      interestRate: "ब्याज दर",
      expiryDate: "समाप्ति तिथि",
      primaryGuarantor: "प्राथमिक गारंटर",
      secondaryGuarantor: "द्वितीय गारंटर",
      thirdGuarantor: "तृतीय गारंटर",
      remarks: "टिप्पणी",
      notAssigned: "असाइन नहीं",
      borrowerPreview: "उधारकर्ता पूर्वावलोकन",
      branch: "शाखा: {{branch}}",
      guarantorResponsibility: "गारंटर ज़िम्मेदारी",
      noGuarantorsAssigned: "इस ऋण के लिए कोई गारंटर असाइन नहीं है।",
      sanctionLoan: "ऋण स्वीकृत करें",
      sanctionedAmount: "स्वीकृत राशि",
      sanctionDate: "स्वीकृति तिथि",
      disburse: "वितरण",
      recovery: "वसूली",
      recoverAmount: "वसूली राशि",
      overdueControl: "ओवरड्यू नियंत्रण",
      overdueAmount: "ओवरड्यू राशि",
      appliedChip: "आवेदित {{amount}}",
      overdueChip: "ओवरड्यू {{amount}}"
    },
    detailMetrics: {
      applied: { label: "आवेदित", caption: "उधारकर्ता की आवेदन राशि।" },
      sanctioned: { label: "स्वीकृत", caption: "नवीनतम स्वीकृत राशि।" },
      disbursed: { label: "वितरित", caption: "पहले से वितरित राशि।" }
    },
    errors: {
      loadFailed: "ऋण रिकॉर्ड लोड नहीं हो सके।",
      createFailed: "ऋण आवेदन बनाया नहीं जा सका।",
      updateFailed: "ऋण अपडेट नहीं हो सका।"
    },
    success: {
      created: "ऋण आवेदन बन गया।",
      sanctioned: "ऋण स्वीकृत हो गया।",
      disbursed: "ऋण राशि वितरित हो गई।",
      recovered: "वसूली दर्ज हो गई।",
      overdueUpdated: "ओवरड्यू अपडेट हो गया।"
    },
    pagination: {
      rowsPerPage: "प्रति पृष्ठ पंक्तियाँ:",
      displayedRows: "{{count}} में से {{from}}-{{to}}",
      nextPage: "अगला पृष्ठ",
      previousPage: "पिछला पृष्ठ"
    },
    statuses: {
      APPLIED: "आवेदित",
      SANCTIONED: "स्वीकृत",
      DISBURSED: "वितरित",
      OVERDUE: "ओवरड्यू",
      CLOSED: "बंद"
    }
  },
  mr: {
    hero: {
      eyebrow: "कर्ज",
      title: "कर्ज डेस्क",
      manageDescription:
        "कर्ज अर्ज तयार करा, हमीदार नियुक्त करा आणि सोसायटी डॅशबोर्डमधून मंजुरी, वितरण, वसुली आणि ओव्हरड्यू ट्रॅकिंग व्यवस्थापित करा.",
      reviewDescription:
        "लाइव्ह कर्ज नोंदी पाहा, परतफेड प्रगती ट्रॅक करा आणि आपल्या अनुमत ग्राहक मर्यादेत नवीन कर्ज विनंत्या सादर करा."
    },
    metrics: {
      loanCases: { label: "कर्ज प्रकरणे", caption: "या नोंदवहीत दिसणारे कर्ज अर्ज." },
      appliedAmount: { label: "अर्ज रक्कम", caption: "दिसणाऱ्या कर्जांची एकूण अर्ज रक्कम." },
      activeLoans: { label: "सक्रिय कर्जे", caption: "अजून प्रक्रियेत किंवा वसुलीयोग्य असलेली कर्ज प्रकरणे." },
      overdue: { label: "ओव्हरड्यू", caption: "वितरित प्रकरणांच्या तुलनेत ओव्हरड्यू चिन्हांकित कर्जे." }
    },
    actions: {
      searchPlaceholder: "कर्जदार, हमीदार किंवा खाते शोधा...",
      allStatuses: "सर्व स्थिती",
      applyLoan: "कर्ज अर्ज करा",
      applyNewLoan: "नवीन कर्ज अर्ज करा",
      createLoanApplication: "कर्ज अर्ज तयार करा",
      saveSanction: "मंजुरी जतन करा",
      disburseAmount: "रक्कम वितरित करा",
      recordRecovery: "वसुली नोंदवा",
      updateOverdue: "ओव्हरड्यू अद्यतनित करा"
    },
    alerts: {
      noClients: "कर्ज प्रक्रियेसाठी अजून कोणतीही सक्रिय ग्राहक खाती उपलब्ध नाहीत.",
      restrictedActions:
        "या लॉगिनसाठी प्रशासकीय कर्ज क्रिया लपविल्या आहेत. तुमच्या परवानगीनुसार तुम्ही लाइव्ह कर्ज डेटा पाहू शकता आणि स्वतःच्या कर्ज विनंत्या उघडू शकता."
    },
    table: {
      borrower: "कर्जदार",
      account: "खाते",
      guarantors: "हमीदार",
      applied: "अर्जित",
      overdue: "ओव्हरड्यू",
      status: "स्थिती",
      emptyState: "सध्याच्या फिल्टरशी जुळणाऱ्या कोणत्याही कर्ज नोंदी सापडल्या नाहीत.",
      loading: "कर्ज नोंदवही लोड होत आहे...",
      noGuarantorAssigned: "कोणताही हमीदार नियुक्त नाही"
    },
    drawer: {
      borrower: "कर्जदार",
      applicationAmount: "अर्ज रक्कम",
      interestRate: "व्याज दर",
      expiryDate: "समाप्ती दिनांक",
      primaryGuarantor: "प्राथमिक हमीदार",
      secondaryGuarantor: "द्वितीय हमीदार",
      thirdGuarantor: "तृतीय हमीदार",
      remarks: "शेरा",
      notAssigned: "नियुक्त नाही",
      borrowerPreview: "कर्जदार पूर्वावलोकन",
      branch: "शाखा: {{branch}}",
      guarantorResponsibility: "हमीदार जबाबदारी",
      noGuarantorsAssigned: "या कर्जासाठी कोणतेही हमीदार नियुक्त नाहीत.",
      sanctionLoan: "कर्ज मंजूर करा",
      sanctionedAmount: "मंजूर रक्कम",
      sanctionDate: "मंजुरी दिनांक",
      disburse: "वितरण",
      recovery: "वसुली",
      recoverAmount: "वसुली रक्कम",
      overdueControl: "ओव्हरड्यू नियंत्रण",
      overdueAmount: "ओव्हरड्यू रक्कम",
      appliedChip: "अर्जित {{amount}}",
      overdueChip: "ओव्हरड्यू {{amount}}"
    },
    detailMetrics: {
      applied: { label: "अर्जित", caption: "कर्जदाराची अर्ज रक्कम." },
      sanctioned: { label: "मंजूर", caption: "नवीनतम मंजूर रक्कम." },
      disbursed: { label: "वितरित", caption: "आधीच वितरित रक्कम." }
    },
    errors: {
      loadFailed: "कर्ज नोंदी लोड करता आल्या नाहीत.",
      createFailed: "कर्ज अर्ज तयार करता आला नाही.",
      updateFailed: "कर्ज अद्यतनित करता आले नाही."
    },
    success: {
      created: "कर्ज अर्ज तयार झाला.",
      sanctioned: "कर्ज मंजूर झाले.",
      disbursed: "कर्ज रक्कम वितरित झाली.",
      recovered: "वसुली नोंदवली गेली.",
      overdueUpdated: "ओव्हरड्यू अद्यतनित झाले."
    },
    pagination: {
      rowsPerPage: "प्रति पान ओळी:",
      displayedRows: "{{count}} पैकी {{from}}-{{to}}",
      nextPage: "पुढील पान",
      previousPage: "मागील पान"
    },
    statuses: {
      APPLIED: "अर्जित",
      SANCTIONED: "मंजूर",
      DISBURSED: "वितरित",
      OVERDUE: "ओव्हरड्यू",
      CLOSED: "बंद"
    }
  }
};

export function getLoanWorkspaceCopy(locale: AppLocale) {
  return loanWorkspaceCopy[locale] ?? loanWorkspaceCopy.en;
}
