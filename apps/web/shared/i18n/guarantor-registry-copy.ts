import type { AppLocale } from "./translations";

type GuarantorRegistryCopy = {
  guarantor: {
    eyebrow: string;
    title: string;
    description: string;
    emptyState: string;
    columns: {
      name: string;
      branch: string;
      accountRef: string;
      facilityType: string;
      linkedPlan: string;
      status: string;
      actions: string;
    };
  };
  coapplicant: {
    eyebrow: string;
    title: string;
    description: string;
    emptyState: string;
    columns: {
      name: string;
      branch: string;
      coApplicant: string;
      relationship: string;
      linkedAccount: string;
      status: string;
      actions: string;
    };
  };
  common: {
    searchPlaceholder: string;
    statuses: {
      active: string;
      verified: string;
      pending: string;
    };
    pagination: {
      rowsPerPage: string;
      displayedRows: string;
      nextPage: string;
      previousPage: string;
    };
    actions: {
      edit: string;
    };
  };
};

const guarantorRegistryCopy: Record<AppLocale, GuarantorRegistryCopy> = {
  en: {
    guarantor: {
      eyebrow: "Guarantors",
      title: "Loan Responsibility Desk",
      description: "See exactly which guarantor is taking responsibility for each loan account created in the society.",
      emptyState: "No guarantor records are documented in the current view.",
      columns: {
        name: "Name",
        branch: "Branch",
        accountRef: "Account Ref",
        facilityType: "Facility Type",
        linkedPlan: "Linked Plan",
        status: "Status",
        actions: "Actions"
      }
    },
    coapplicant: {
      eyebrow: "Co-applicants",
      title: "Co-applicant registry",
      description: "Review co-applicant relationships, linked accounts, and current verification status.",
      emptyState: "No co-applicant records are documented in the current view.",
      columns: {
        name: "Name",
        branch: "Branch",
        coApplicant: "Co-applicant",
        relationship: "Relationship",
        linkedAccount: "Linked Account",
        status: "Status",
        actions: "Actions"
      }
    },
    common: {
      searchPlaceholder: "Search registry...",
      statuses: {
        active: "Active",
        verified: "Verified",
        pending: "Pending"
      },
      pagination: {
        rowsPerPage: "Rows per page:",
        displayedRows: "{{from}}-{{to}} of {{count}}",
        nextPage: "Next page",
        previousPage: "Previous page"
      },
      actions: {
        edit: "Edit"
      }
    }
  },
  hi: {
    guarantor: {
      eyebrow: "गारंटर",
      title: "लोन जिम्मेदारी डेस्क",
      description: "सोसायटी में बनाए गए हर लोन खाते की जिम्मेदारी कौन-सा गारंटर ले रहा है, यह साफ तौर पर देखें।",
      emptyState: "वर्तमान दृश्य में कोई गारंटर रिकॉर्ड दर्ज नहीं है।",
      columns: {
        name: "नाम",
        branch: "शाखा",
        accountRef: "खाता संदर्भ",
        facilityType: "सुविधा प्रकार",
        linkedPlan: "लिंक्ड योजना",
        status: "स्थिति",
        actions: "कार्रवाई"
      }
    },
    coapplicant: {
      eyebrow: "सह-आवेदक",
      title: "सह-आवेदक रजिस्ट्रि",
      description: "सह-आवेदक संबंध, लिंक किए गए खाते और वर्तमान सत्यापन स्थिति की समीक्षा करें।",
      emptyState: "वर्तमान दृश्य में कोई सह-आवेदक रिकॉर्ड दर्ज नहीं है।",
      columns: {
        name: "नाम",
        branch: "शाखा",
        coApplicant: "सह-आवेदक",
        relationship: "संबंध",
        linkedAccount: "लिंक्ड खाता",
        status: "स्थिति",
        actions: "कार्रवाई"
      }
    },
    common: {
      searchPlaceholder: "रजिस्ट्रि खोजें...",
      statuses: {
        active: "सक्रिय",
        verified: "सत्यापित",
        pending: "लंबित"
      },
      pagination: {
        rowsPerPage: "प्रति पृष्ठ पंक्तियां:",
        displayedRows: "{{count}} में से {{from}}-{{to}}",
        nextPage: "अगला पृष्ठ",
        previousPage: "पिछला पृष्ठ"
      },
      actions: {
        edit: "संपादित करें"
      }
    }
  },
  mr: {
    guarantor: {
      eyebrow: "हमीदार",
      title: "कर्ज जबाबदारी डेस्क",
      description: "सोसायटीमध्ये तयार झालेल्या प्रत्येक कर्ज खात्याची जबाबदारी नेमका कोणता हमीदार घेत आहे ते स्पष्टपणे पाहा.",
      emptyState: "सध्याच्या दृश्यात कोणतीही हमीदार नोंद आढळली नाही.",
      columns: {
        name: "नाव",
        branch: "शाखा",
        accountRef: "खाते संदर्भ",
        facilityType: "सुविधा प्रकार",
        linkedPlan: "जोडलेली योजना",
        status: "स्थिती",
        actions: "कृती"
      }
    },
    coapplicant: {
      eyebrow: "सह-अर्जदार",
      title: "सह-अर्जदार नोंदवही",
      description: "सह-अर्जदार संबंध, जोडलेली खाती आणि सध्याची पडताळणी स्थिती तपासा.",
      emptyState: "सध्याच्या दृश्यात कोणतीही सह-अर्जदार नोंद आढळली नाही.",
      columns: {
        name: "नाव",
        branch: "शाखा",
        coApplicant: "सह-अर्जदार",
        relationship: "नाते",
        linkedAccount: "जोडलेले खाते",
        status: "स्थिती",
        actions: "कृती"
      }
    },
    common: {
      searchPlaceholder: "नोंदवही शोधा...",
      statuses: {
        active: "सक्रिय",
        verified: "पडताळलेले",
        pending: "प्रलंबित"
      },
      pagination: {
        rowsPerPage: "प्रति पान ओळी:",
        displayedRows: "{{count}} पैकी {{from}}-{{to}}",
        nextPage: "पुढील पान",
        previousPage: "मागील पान"
      },
      actions: {
        edit: "संपादित करा"
      }
    }
  }
};

export function getGuarantorRegistryCopy(locale: AppLocale) {
  return guarantorRegistryCopy[locale] ?? guarantorRegistryCopy.en;
}
