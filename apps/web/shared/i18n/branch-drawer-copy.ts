import type { AppLocale } from "./translations";

type BranchDrawerCopy = {
  title: {
    add: string;
    edit: string;
  };
  description: string;
  fields: {
    branchName: string;
    branchCode: string;
    branchCodeHelper: string;
    contactEmail: string;
    contactNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    openingDate: string;
  };
  toggles: {
    headOffice: string;
    lockerFacility: string;
    digitalTransfers: string;
    branchActive: string;
  };
  actions: {
    save: string;
    create: string;
  };
};

const branchDrawerCopy: Record<AppLocale, BranchDrawerCopy> = {
  en: {
    title: {
      add: "Add branch",
      edit: "Edit branch"
    },
    description: "Capture the public-facing details of this branch.",
    fields: {
      branchName: "Branch name",
      branchCode: "Branch code",
      branchCodeHelper: "Short internal code, for example PUN-01",
      contactEmail: "Contact email",
      contactNumber: "Contact number",
      addressLine1: "Address line 1",
      addressLine2: "Address line 2",
      city: "City",
      state: "State",
      pincode: "Pincode",
      openingDate: "Opening date"
    },
    toggles: {
      headOffice: "Mark as head office",
      lockerFacility: "Locker facility available",
      digitalTransfers: "Digital transfer services available",
      branchActive: "Branch is active"
    },
    actions: {
      save: "Save branch",
      create: "Create branch"
    }
  },
  hi: {
    title: {
      add: "शाखा जोड़ें",
      edit: "शाखा संपादित करें"
    },
    description: "इस शाखा का सार्वजनिक रूप से दिखाई देने वाला विवरण दर्ज करें।",
    fields: {
      branchName: "शाखा का नाम",
      branchCode: "शाखा कोड",
      branchCodeHelper: "छोटा आंतरिक कोड, उदाहरण के लिए PUN-01",
      contactEmail: "संपर्क ईमेल",
      contactNumber: "संपर्क नंबर",
      addressLine1: "पता पंक्ति 1",
      addressLine2: "पता पंक्ति 2",
      city: "शहर",
      state: "राज्य",
      pincode: "पिनकोड",
      openingDate: "खुलने की तारीख"
    },
    toggles: {
      headOffice: "मुख्य कार्यालय के रूप में चिह्नित करें",
      lockerFacility: "लॉकर सुविधा उपलब्ध",
      digitalTransfers: "डिजिटल ट्रांसफर सेवाएँ उपलब्ध",
      branchActive: "शाखा सक्रिय है"
    },
    actions: {
      save: "शाखा सहेजें",
      create: "शाखा बनाएँ"
    }
  },
  mr: {
    title: {
      add: "शाखा जोडा",
      edit: "शाखा संपादित करा"
    },
    description: "या शाखेचे सार्वजनिकपणे दिसणारे तपशील नोंदवा.",
    fields: {
      branchName: "शाखेचे नाव",
      branchCode: "शाखा कोड",
      branchCodeHelper: "लहान अंतर्गत कोड, उदाहरणार्थ PUN-01",
      contactEmail: "संपर्क ईमेल",
      contactNumber: "संपर्क क्रमांक",
      addressLine1: "पत्ता ओळ 1",
      addressLine2: "पत्ता ओळ 2",
      city: "शहर",
      state: "राज्य",
      pincode: "पिनकोड",
      openingDate: "सुरुवातीची तारीख"
    },
    toggles: {
      headOffice: "मुख्य कार्यालय म्हणून चिन्हांकित करा",
      lockerFacility: "लॉकर सुविधा उपलब्ध",
      digitalTransfers: "डिजिटल ट्रान्सफर सेवा उपलब्ध",
      branchActive: "शाखा सक्रिय आहे"
    },
    actions: {
      save: "शाखा जतन करा",
      create: "शाखा तयार करा"
    }
  }
};

export function getBranchDrawerCopy(locale: AppLocale) {
  return branchDrawerCopy[locale] ?? branchDrawerCopy.en;
}
