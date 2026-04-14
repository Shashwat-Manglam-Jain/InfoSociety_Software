import type { AppLocale } from "./translations";

type SuperadminSettingsCopy = {
  modules: {
    headings: {
      executive: string;
      governance: string;
    };
    portfolioSnapshot: string;
    approvals: string;
    analytics: string;
    networkExplorer: string;
    reports: string;
    settings: string;
  };
  settings: {
    title: string;
    description: string;
    sections: {
      publicWebsite: string;
    };
    fields: {
      platformName: string;
      heroHeading: string;
      heroSubtext: string;
      contactEmail: string;
    };
    publishButton: string;
    notifications: {
      success: string;
    };
    info: {
      syncTitle: string;
      syncDesc: string;
      nameWarning: string;
    };
  };
  common: {
    deploying: string;
  };
};

const superadminSettingsCopy: Record<AppLocale, SuperadminSettingsCopy> = {
  en: {
    modules: {
      headings: {
        executive: "Executive",
        governance: "Governance"
      },
      portfolioSnapshot: "Portfolio Snapshot",
      approvals: "Approvals",
      analytics: "Analytics",
      networkExplorer: "Network Explorer",
      reports: "Reports",
      settings: "Settings"
    },
    settings: {
      title: "Platform Settings",
      description: "Manage the public-facing platform identity, homepage copy, and operational contact details from one place.",
      sections: {
        publicWebsite: "Public Website"
      },
      fields: {
        platformName: "Platform Name",
        heroHeading: "Hero Heading",
        heroSubtext: "Hero Subtext",
        contactEmail: "Contact Email"
      },
      publishButton: "Publish Changes",
      notifications: {
        success: "Platform settings updated."
      },
      info: {
        syncTitle: "Publishing sync",
        syncDesc: "These values are used across the platform marketing experience and admin-managed surfaces.",
        nameWarning: "Changing the platform name affects branding across the public website and dashboard surfaces."
      }
    },
    common: {
      deploying: "Publishing..."
    }
  },
  hi: {
    modules: {
      headings: {
        executive: "कार्यकारी",
        governance: "शासन"
      },
      portfolioSnapshot: "पोर्टफोलियो स्नैपशॉट",
      approvals: "अनुमोदन",
      analytics: "एनालिटिक्स",
      networkExplorer: "नेटवर्क एक्सप्लोरर",
      reports: "रिपोर्ट",
      settings: "सेटिंग्स"
    },
    settings: {
      title: "प्लेटफ़ॉर्म सेटिंग्स",
      description: "सार्वजनिक प्लेटफ़ॉर्म पहचान, होमपेज सामग्री और संचालन संपर्क विवरण एक ही स्थान से प्रबंधित करें।",
      sections: {
        publicWebsite: "सार्वजनिक वेबसाइट"
      },
      fields: {
        platformName: "प्लेटफ़ॉर्म नाम",
        heroHeading: "हीरो शीर्षक",
        heroSubtext: "हीरो उपपाठ",
        contactEmail: "संपर्क ईमेल"
      },
      publishButton: "परिवर्तन प्रकाशित करें",
      notifications: {
        success: "प्लेटफ़ॉर्म सेटिंग्स अपडेट हो गईं।"
      },
      info: {
        syncTitle: "प्रकाशन सिंक",
        syncDesc: "ये मान प्लेटफ़ॉर्म के मार्केटिंग अनुभव और एडमिन-प्रबंधित सतहों में उपयोग होते हैं।",
        nameWarning: "प्लेटफ़ॉर्म नाम बदलने से सार्वजनिक वेबसाइट और डैशबोर्ड पर ब्रांडिंग प्रभावित होगी।"
      }
    },
    common: {
      deploying: "प्रकाशित किया जा रहा है..."
    }
  },
  mr: {
    modules: {
      headings: {
        executive: "कार्यकारी",
        governance: "शासन"
      },
      portfolioSnapshot: "पोर्टफोलिओ स्नॅपशॉट",
      approvals: "मंजुरी",
      analytics: "विश्लेषण",
      networkExplorer: "नेटवर्क एक्सप्लोरर",
      reports: "अहवाल",
      settings: "सेटिंग्ज"
    },
    settings: {
      title: "प्लॅटफॉर्म सेटिंग्ज",
      description: "सार्वजनिक प्लॅटफॉर्म ओळख, होमपेज मजकूर आणि संपर्क तपशील एकाच ठिकाणाहून व्यवस्थापित करा.",
      sections: {
        publicWebsite: "सार्वजनिक वेबसाइट"
      },
      fields: {
        platformName: "प्लॅटफॉर्म नाव",
        heroHeading: "हीरो शीर्षक",
        heroSubtext: "हीरो उपमजकूर",
        contactEmail: "संपर्क ईमेल"
      },
      publishButton: "बदल प्रकाशित करा",
      notifications: {
        success: "प्लॅटफॉर्म सेटिंग्ज अपडेट झाल्या."
      },
      info: {
        syncTitle: "प्रकाशन समक्रमण",
        syncDesc: "ही मूल्ये प्लॅटफॉर्म मार्केटिंग अनुभवात आणि अॅडमिन-व्यवस्थापित पृष्ठांवर वापरली जातात.",
        nameWarning: "प्लॅटफॉर्मचे नाव बदलल्यास सार्वजनिक वेबसाइट आणि डॅशबोर्डवरील ब्रँडिंगवर परिणाम होईल."
      }
    },
    common: {
      deploying: "प्रकाशित केले जात आहे..."
    }
  }
};

export function getSuperadminSettingsCopy(locale: AppLocale) {
  return superadminSettingsCopy[locale] ?? superadminSettingsCopy.en;
}
