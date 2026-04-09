import type { AppLocale } from "./translations";

type BranchInfrastructureCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    addBranch: string;
  };
  metrics: {
    branches: { label: string; caption: string };
    active: { label: string; caption: string };
    headOffices: { label: string; caption: string };
    digitalServices: { label: string; caption: string };
  };
  table: {
    branchDetails: string;
    location: string;
    contactInfo: string;
    support: string;
    status: string;
  };
  emptyState: string;
  branch: {
    headOfficeSuffix: string;
    geoLocationUnset: string;
    noPincode: string;
    phoneEntryMissing: string;
    emailUnassigned: string;
  };
  tooltips: {
    certifiedHeadOffice: string;
    secureLockerAccess: string;
    digitalBankingEnabled: string;
    editInfrastructure: string;
    decommissionBranch: string;
  };
  status: {
    operating: string;
    closed: string;
  };
};

const branchInfrastructureCopy: Record<AppLocale, BranchInfrastructureCopy> = {
  en: {
    hero: {
      eyebrow: "Infrastructure",
      title: "Branch network",
      description: "Maintain branch identity, location, and available services for each operating point.",
      addBranch: "Add branch"
    },
    metrics: {
      branches: { label: "Branches", caption: "Registered branches in this society." },
      active: { label: "Active", caption: "Currently available for operations." },
      headOffices: { label: "Head Offices", caption: "Main operating hubs." },
      digitalServices: { label: "Digital Services", caption: "Branches with online transfer support." }
    },
    table: {
      branchDetails: "Branch Details",
      location: "Location",
      contactInfo: "Contact Info",
      support: "Support",
      status: "Status"
    },
    emptyState: "No branches registered yet. Start by defining your local presence.",
    branch: {
      headOfficeSuffix: "Head Office",
      geoLocationUnset: "Geo-location Unset",
      noPincode: "No Pincode",
      phoneEntryMissing: "Phone Entry Missing",
      emailUnassigned: "Email Unassigned"
    },
    tooltips: {
      certifiedHeadOffice: "Certified Head Office",
      secureLockerAccess: "Secure Locker Access",
      digitalBankingEnabled: "Digital Banking Enabled",
      editInfrastructure: "Edit Infrastructure",
      decommissionBranch: "Decommission Branch"
    },
    status: {
      operating: "Operating",
      closed: "Closed"
    }
  },
  hi: {
    hero: {
      eyebrow: "इन्फ्रास्ट्रक्चर",
      title: "शाखा नेटवर्क",
      description: "हर संचालन केंद्र के लिए शाखा की पहचान, स्थान और उपलब्ध सेवाओं का रखरखाव करें।",
      addBranch: "शाखा जोड़ें"
    },
    metrics: {
      branches: { label: "शाखाएँ", caption: "इस सोसायटी में पंजीकृत शाखाएँ।" },
      active: { label: "सक्रिय", caption: "वर्तमान में संचालन के लिए उपलब्ध।" },
      headOffices: { label: "मुख्य कार्यालय", caption: "मुख्य संचालन केंद्र।" },
      digitalServices: { label: "डिजिटल सेवाएँ", caption: "ऑनलाइन ट्रांसफर सहायता वाली शाखाएँ।" }
    },
    table: {
      branchDetails: "शाखा विवरण",
      location: "स्थान",
      contactInfo: "संपर्क जानकारी",
      support: "सुविधाएँ",
      status: "स्थिति"
    },
    emptyState: "अभी तक कोई शाखा पंजीकृत नहीं है। अपनी स्थानीय उपस्थिति निर्धारित करके शुरुआत करें।",
    branch: {
      headOfficeSuffix: "मुख्य कार्यालय",
      geoLocationUnset: "भौगोलिक स्थान उपलब्ध नहीं",
      noPincode: "पिनकोड उपलब्ध नहीं",
      phoneEntryMissing: "फोन प्रविष्टि नहीं",
      emailUnassigned: "ईमेल आवंटित नहीं"
    },
    tooltips: {
      certifiedHeadOffice: "प्रमाणित मुख्य कार्यालय",
      secureLockerAccess: "सुरक्षित लॉकर सुविधा",
      digitalBankingEnabled: "डिजिटल बैंकिंग सक्षम",
      editInfrastructure: "इन्फ्रास्ट्रक्चर संपादित करें",
      decommissionBranch: "शाखा निष्क्रिय करें"
    },
    status: {
      operating: "चालू",
      closed: "बंद"
    }
  },
  mr: {
    hero: {
      eyebrow: "इन्फ्रास्ट्रक्चर",
      title: "शाखा नेटवर्क",
      description: "प्रत्येक कार्यरत केंद्रासाठी शाखेची ओळख, स्थान आणि उपलब्ध सेवा जतन करा.",
      addBranch: "शाखा जोडा"
    },
    metrics: {
      branches: { label: "शाखा", caption: "या सोसायटीतील नोंदणीकृत शाखा." },
      active: { label: "सक्रिय", caption: "सध्या कामकाजासाठी उपलब्ध." },
      headOffices: { label: "मुख्य कार्यालये", caption: "मुख्य कार्यरत केंद्रे." },
      digitalServices: { label: "डिजिटल सेवा", caption: "ऑनलाइन हस्तांतरण सुविधेसह शाखा." }
    },
    table: {
      branchDetails: "शाखा तपशील",
      location: "स्थान",
      contactInfo: "संपर्क माहिती",
      support: "सुविधा",
      status: "स्थिती"
    },
    emptyState: "अद्याप कोणतीही शाखा नोंदणीकृत नाही. तुमची स्थानिक उपस्थिती निश्चित करून सुरुवात करा.",
    branch: {
      headOfficeSuffix: "मुख्य कार्यालय",
      geoLocationUnset: "भौगोलिक स्थान उपलब्ध नाही",
      noPincode: "पिनकोड नाही",
      phoneEntryMissing: "फोन नोंद नाही",
      emailUnassigned: "ईमेल नियुक्त नाही"
    },
    tooltips: {
      certifiedHeadOffice: "प्रमाणित मुख्य कार्यालय",
      secureLockerAccess: "सुरक्षित लॉकर सुविधा",
      digitalBankingEnabled: "डिजिटल बँकिंग सक्षम",
      editInfrastructure: "इन्फ्रास्ट्रक्चर संपादित करा",
      decommissionBranch: "शाखा बंद करा"
    },
    status: {
      operating: "कार्यरत",
      closed: "बंद"
    }
  }
};

export function getBranchInfrastructureCopy(locale: AppLocale) {
  return branchInfrastructureCopy[locale] ?? branchInfrastructureCopy.en;
}
