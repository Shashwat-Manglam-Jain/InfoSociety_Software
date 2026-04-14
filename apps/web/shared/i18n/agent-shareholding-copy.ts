import type { AppLocale } from "./translations";

type AgentShareholdingCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    addButton: string;
  };
  metrics: {
    authorizedCapital: { label: string; caption: string };
    equityHolders: { label: string; caption: string };
    stabilityScore: { label: string; caption: string };
    compliance: { label: string; caption: string };
  };
  table: {
    holderArtifact: string;
    capitalRange: string;
    totalUnits: string;
    totalValue: string;
    complianceReg: string;
    actions: string;
    certificatePrefix: string;
  };
  tooltips: {
    editRecord: string;
    viewCertificate: string;
    transferRecord: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
};

const agentShareholdingCopy: Record<AppLocale, AgentShareholdingCopy> = {
  en: {
    hero: {
      eyebrow: "Capital",
      title: "Institutional Equity",
      description: "Maintain detailed records of capital distribution, equity holdings, and share certificate compliance.",
      searchPlaceholder: "Search equity holders...",
      addButton: "Allot Capital"
    },
    metrics: {
      authorizedCapital: { label: "Authorized Capital", caption: "Institutional equity ceiling." },
      equityHolders: { label: "Equity Holders", caption: "Total capital unit owners." },
      stabilityScore: { label: "Stability Score", caption: "Institutional capital health." },
      compliance: { label: "Compliance", caption: "Share certificate regulatory status." }
    },
    table: {
      holderArtifact: "Holder Artifact",
      capitalRange: "Capital Range",
      totalUnits: "Total Units",
      totalValue: "Total Value (₹)",
      complianceReg: "Compliance Reg",
      actions: "Actions",
      certificatePrefix: "Cert:"
    },
    tooltips: {
      editRecord: "Edit Record",
      viewCertificate: "View Certificate SH-1",
      transferRecord: "Transfer SH-4"
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    }
  },
  hi: {
    hero: {
      eyebrow: "पूंजी",
      title: "संस्थागत इक्विटी",
      description: "पूंजी वितरण, इक्विटी होल्डिंग और शेयर प्रमाणपत्र अनुपालन के विस्तृत रिकॉर्ड बनाए रखें।",
      searchPlaceholder: "इक्विटी धारक खोजें...",
      addButton: "पूंजी आवंटित करें"
    },
    metrics: {
      authorizedCapital: { label: "अधिकृत पूंजी", caption: "संस्थागत इक्विटी की अधिकतम सीमा।" },
      equityHolders: { label: "इक्विटी धारक", caption: "कुल पूंजी इकाई धारक।" },
      stabilityScore: { label: "स्थिरता स्कोर", caption: "संस्थागत पूंजी की स्थिति।" },
      compliance: { label: "अनुपालन", caption: "शेयर प्रमाणपत्र की नियामक स्थिति।" }
    },
    table: {
      holderArtifact: "धारक विवरण",
      capitalRange: "पूंजी सीमा",
      totalUnits: "कुल इकाइयां",
      totalValue: "कुल मूल्य (₹)",
      complianceReg: "अनुपालन रजिस्टर",
      actions: "कार्यवाही",
      certificatePrefix: "प्रमाण:"
    },
    tooltips: {
      editRecord: "रिकॉर्ड संपादित करें",
      viewCertificate: "प्रमाणपत्र SH-1 देखें",
      transferRecord: "SH-4 ट्रांसफर करें"
    },
    pagination: {
      rowsPerPage: "प्रति पृष्ठ पंक्तियां:",
      displayedRows: "{{count}} में से {{from}}-{{to}}",
      nextPage: "अगला पृष्ठ",
      previousPage: "पिछला पृष्ठ"
    }
  },
  mr: {
    hero: {
      eyebrow: "भांडवल",
      title: "संस्थात्मक इक्विटी",
      description: "भांडवल वितरण, इक्विटी धारणा आणि शेअर प्रमाणपत्र अनुपालनाची सविस्तर नोंद ठेवा.",
      searchPlaceholder: "इक्विटी धारक शोधा...",
      addButton: "भांडवल वाटप करा"
    },
    metrics: {
      authorizedCapital: { label: "अधिकृत भांडवल", caption: "संस्थात्मक इक्विटीची कमाल मर्यादा." },
      equityHolders: { label: "इक्विटी धारक", caption: "एकूण भांडवली युनिट धारक." },
      stabilityScore: { label: "स्थैर्य गुण", caption: "संस्थात्मक भांडवलाची स्थिती." },
      compliance: { label: "अनुपालन", caption: "शेअर प्रमाणपत्राची नियामक स्थिती." }
    },
    table: {
      holderArtifact: "धारक तपशील",
      capitalRange: "भांडवल श्रेणी",
      totalUnits: "एकूण युनिट्स",
      totalValue: "एकूण मूल्य (₹)",
      complianceReg: "अनुपालन नोंद",
      actions: "कृती",
      certificatePrefix: "प्रमाण:"
    },
    tooltips: {
      editRecord: "नोंद संपादित करा",
      viewCertificate: "SH-1 प्रमाणपत्र पहा",
      transferRecord: "SH-4 हस्तांतरण"
    },
    pagination: {
      rowsPerPage: "प्रति पान ओळी:",
      displayedRows: "{{count}} पैकी {{from}}-{{to}}",
      nextPage: "पुढील पान",
      previousPage: "मागील पान"
    }
  }
};

export function getAgentShareholdingCopy(locale: AppLocale) {
  return agentShareholdingCopy[locale] ?? agentShareholdingCopy.en;
}
