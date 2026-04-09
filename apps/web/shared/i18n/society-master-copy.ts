import type { AppLocale } from "./translations";

type SocietyMasterCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    openAccessWorkspace: string;
    saveProfile: string;
  };
  sections: {
    visualIdentity: string;
    institutionalLogo: string;
    manifestFavicon: string;
    corporateAttributes: string;
    legalCompliance: string;
    classificationEquity: string;
  };
  fields: {
    fullLegalEntityName: string;
    institutionalAbstract: string;
    institutionalAbstractPlaceholder: string;
    softwareUrl: string;
    officialEmailMatrix: string;
    registeredSecretariatAddress: string;
    cin: string;
    pan: string;
    gst: string;
    incorporationDate: string;
    entityCategory: string;
    institutionalClass: string;
    authorizedEquity: string;
    paidUpLiquidity: string;
    shareNominalScale: string;
    stateOfJurisdiction: string;
  };
  options: {
    notSet: string;
    category: {
      creditCoop: string;
      multiState: string;
      nidhi: string;
    };
    institutionalClass: {
      classA: string;
      classB: string;
    };
  };
};

const societyMasterCopy: Record<AppLocale, SocietyMasterCopy> = {
  en: {
    hero: {
      eyebrow: "Institution",
      title: "Society master profile",
      description: "Configure the legal, financial, and brand identity details for this society workspace.",
      openAccessWorkspace: "Open access workspace",
      saveProfile: "Save profile"
    },
    sections: {
      visualIdentity: "VISUAL IDENTITY",
      institutionalLogo: "INSTITUTIONAL LOGO",
      manifestFavicon: "MANIFEST FAVICON",
      corporateAttributes: "CORPORATE ATTRIBUTES",
      legalCompliance: "LEGAL & FISCAL COMPLIANCE",
      classificationEquity: "CLASSIFICATION & EQUITY"
    },
    fields: {
      fullLegalEntityName: "Full Legal Entity Name",
      institutionalAbstract: "Institutional Abstract",
      institutionalAbstractPlaceholder: "Describe the mission and history of the society...",
      softwareUrl: "SaaS Software URL",
      officialEmailMatrix: "Official Email Matrix",
      registeredSecretariatAddress: "Registered Secretariat Address",
      cin: "Corporate Identification Number (CIN)",
      pan: "Permanent Account Number (PAN)",
      gst: "GST Identification Number",
      incorporationDate: "Incorporation Pulse Date",
      entityCategory: "Entity Category",
      institutionalClass: "Institutional Class",
      authorizedEquity: "Authorized Equity",
      paidUpLiquidity: "Paid-up Liquidity",
      shareNominalScale: "Share Nominal Scale",
      stateOfJurisdiction: "State of Jurisdiction"
    },
    options: {
      notSet: "Not set",
      category: {
        creditCoop: "Credit Co-op",
        multiState: "Multi-State Society",
        nidhi: "Nidhi Company"
      },
      institutionalClass: {
        classA: "Class A (Premium)",
        classB: "Class B (Standard)"
      }
    }
  },
  hi: {
    hero: {
      eyebrow: "संस्था",
      title: "सोसायटी मास्टर प्रोफ़ाइल",
      description: "इस सोसायटी वर्कस्पेस के लिए कानूनी, वित्तीय और ब्रांड पहचान विवरण कॉन्फ़िगर करें।",
      openAccessWorkspace: "एक्सेस वर्कस्पेस खोलें",
      saveProfile: "प्रोफ़ाइल सहेजें"
    },
    sections: {
      visualIdentity: "दृश्य पहचान",
      institutionalLogo: "संस्थागत लोगो",
      manifestFavicon: "मैनिफेस्ट फेविकॉन",
      corporateAttributes: "कॉर्पोरेट गुण",
      legalCompliance: "कानूनी और वित्तीय अनुपालन",
      classificationEquity: "वर्गीकरण और इक्विटी"
    },
    fields: {
      fullLegalEntityName: "पूर्ण कानूनी इकाई नाम",
      institutionalAbstract: "संस्थागत सारांश",
      institutionalAbstractPlaceholder: "सोसायटी के मिशन और इतिहास का वर्णन करें...",
      softwareUrl: "SaaS सॉफ़्टवेयर URL",
      officialEmailMatrix: "आधिकारिक ईमेल मैट्रिक्स",
      registeredSecretariatAddress: "पंजीकृत सचिवालय पता",
      cin: "कॉर्पोरेट पहचान संख्या (CIN)",
      pan: "स्थायी खाता संख्या (PAN)",
      gst: "GST पहचान संख्या",
      incorporationDate: "पंजीकरण तिथि",
      entityCategory: "इकाई श्रेणी",
      institutionalClass: "संस्थागत वर्ग",
      authorizedEquity: "अधिकृत इक्विटी",
      paidUpLiquidity: "पेड-अप लिक्विडिटी",
      shareNominalScale: "शेयर नाममात्र मान",
      stateOfJurisdiction: "अधिकार क्षेत्र का राज्य"
    },
    options: {
      notSet: "सेट नहीं",
      category: {
        creditCoop: "क्रेडिट को-ऑप",
        multiState: "मल्टी-स्टेट सोसायटी",
        nidhi: "निधि कंपनी"
      },
      institutionalClass: {
        classA: "क्लास A (प्रीमियम)",
        classB: "क्लास B (मानक)"
      }
    }
  },
  mr: {
    hero: {
      eyebrow: "संस्था",
      title: "सोसायटी मास्टर प्रोफाइल",
      description: "या सोसायटी वर्कस्पेससाठी कायदेशीर, आर्थिक आणि ब्रँड ओळखीचे तपशील कॉन्फिगर करा.",
      openAccessWorkspace: "अॅक्सेस वर्कस्पेस उघडा",
      saveProfile: "प्रोफाइल जतन करा"
    },
    sections: {
      visualIdentity: "दृश्य ओळख",
      institutionalLogo: "संस्थात्मक लोगो",
      manifestFavicon: "मॅनिफेस्ट फेविकॉन",
      corporateAttributes: "कॉर्पोरेट गुणधर्म",
      legalCompliance: "कायदेशीर आणि आर्थिक अनुपालन",
      classificationEquity: "वर्गीकरण आणि इक्विटी"
    },
    fields: {
      fullLegalEntityName: "पूर्ण कायदेशीर संस्थेचे नाव",
      institutionalAbstract: "संस्थात्मक सारांश",
      institutionalAbstractPlaceholder: "सोसायटीचे ध्येय आणि इतिहास वर्णन करा...",
      softwareUrl: "SaaS सॉफ्टवेअर URL",
      officialEmailMatrix: "अधिकृत ईमेल मॅट्रिक्स",
      registeredSecretariatAddress: "नोंदणीकृत सचिवालय पत्ता",
      cin: "कॉर्पोरेट ओळख क्रमांक (CIN)",
      pan: "स्थायी खाते क्रमांक (PAN)",
      gst: "GST ओळख क्रमांक",
      incorporationDate: "नोंदणी तारीख",
      entityCategory: "संस्था श्रेणी",
      institutionalClass: "संस्थात्मक वर्ग",
      authorizedEquity: "अधिकृत इक्विटी",
      paidUpLiquidity: "पेड-अप लिक्विडिटी",
      shareNominalScale: "शेअर नाममात्र मूल्य",
      stateOfJurisdiction: "अधिकार क्षेत्राचे राज्य"
    },
    options: {
      notSet: "सेट नाही",
      category: {
        creditCoop: "क्रेडिट को-ऑप",
        multiState: "मल्टी-स्टेट सोसायटी",
        nidhi: "निधी कंपनी"
      },
      institutionalClass: {
        classA: "क्लास A (प्रीमियम)",
        classB: "क्लास B (स्टँडर्ड)"
      }
    }
  }
};

export function getSocietyMasterCopy(locale: AppLocale) {
  return societyMasterCopy[locale] ?? societyMasterCopy.en;
}
