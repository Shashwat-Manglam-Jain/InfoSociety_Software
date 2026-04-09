import type { AppLocale } from "./translations";
import type { UserRole } from "@/shared/types";

type RoleCopy = {
  label: string;
  shortLabel: string;
  description: string;
  actionNoun: string;
};

type UserProvisioningDrawerCopy = {
  title: {
    add: string;
    update: string;
  };
  description: {
    add: string;
    update: string;
  };
  fields: {
    fullName: string;
    accountType: string;
    branch: string;
    headOfficeUnassigned: string;
    username: string;
    usernameHelper: string;
    resetPasswordOptional: string;
    temporaryPassword: string;
    phone: string;
    email: string;
    address: string;
  };
  password: {
    createHelper: string;
    editHelper: string;
  };
  actions: {
    updateAccount: string;
    createAccount: string;
  };
  roles: Record<UserRole, RoleCopy>;
};

const userProvisioningDrawerCopy: Record<AppLocale, UserProvisioningDrawerCopy> = {
  en: {
    title: {
      add: "Add account",
      update: "Update account"
    },
    description: {
      add: "Create a society admin, field agent, or client account with the right modules.",
      update: "Update account identity, branch assignment, login reset, and contact information."
    },
    fields: {
      fullName: "Full name",
      accountType: "Account type",
      branch: "Branch",
      headOfficeUnassigned: "Head office / unassigned",
      username: "Username",
      usernameHelper: "Use a clear login id. It is auto-filled from the name and can still be adjusted.",
      resetPasswordOptional: "Reset password (optional)",
      temporaryPassword: "Temporary password",
      phone: "Phone",
      email: "Email",
      address: "Address"
    },
    password: {
      createHelper: "Use 8+ chars with upper, lower, number, and special character.",
      editHelper: "Leave blank to keep the current password. New passwords need 8+ chars with upper, lower, number, and special character."
    },
    actions: {
      updateAccount: "Update {{role}} account",
      createAccount: "Create {{role}} account"
    },
    roles: {
      SUPER_USER: {
        label: "Society Admin",
        shortLabel: "Admin",
        description: "Manages society operations, administration, and privileged dashboard actions.",
        actionNoun: "admin"
      },
      AGENT: {
        label: "Agent",
        shortLabel: "Agent",
        description: "Handles field operations, member service tasks, and assigned collection workflows.",
        actionNoun: "agent"
      },
      CLIENT: {
        label: "Client",
        shortLabel: "Client",
        description: "Accesses member-facing services, account information, and personal activity.",
        actionNoun: "client"
      },
      SUPER_ADMIN: {
        label: "Platform Admin",
        shortLabel: "Platform",
        description: "Oversees platform-wide governance and visibility.",
        actionNoun: "platform"
      }
    }
  },
  hi: {
    title: {
      add: "खाता जोड़ें",
      update: "खाता अपडेट करें"
    },
    description: {
      add: "सही मॉड्यूल्स के साथ सोसायटी एडमिन, फील्ड एजेंट या क्लाइंट खाता बनाएँ।",
      update: "खाते की पहचान, शाखा असाइनमेंट, लॉगिन रीसेट और संपर्क जानकारी अपडेट करें।"
    },
    fields: {
      fullName: "पूरा नाम",
      accountType: "खाते का प्रकार",
      branch: "शाखा",
      headOfficeUnassigned: "मुख्य कार्यालय / असाइन नहीं",
      username: "यूज़रनेम",
      usernameHelper: "स्पष्ट लॉगिन आईडी का उपयोग करें। यह नाम से अपने-आप भरता है और बदला भी जा सकता है।",
      resetPasswordOptional: "पासवर्ड रीसेट करें (वैकल्पिक)",
      temporaryPassword: "अस्थायी पासवर्ड",
      phone: "फोन",
      email: "ईमेल",
      address: "पता"
    },
    password: {
      createHelper: "8+ अक्षरों का उपयोग करें जिसमें अपरकेस, लोअरकेस, संख्या और विशेष वर्ण हों।",
      editHelper: "मौजूदा पासवर्ड रखने के लिए खाली छोड़ें। नए पासवर्ड में 8+ अक्षर, अपरकेस, लोअरकेस, संख्या और विशेष वर्ण होने चाहिए।"
    },
    actions: {
      updateAccount: "{{role}} खाता अपडेट करें",
      createAccount: "{{role}} खाता बनाएँ"
    },
    roles: {
      SUPER_USER: {
        label: "सोसायटी एडमिन",
        shortLabel: "एडमिन",
        description: "सोसायटी संचालन, प्रशासन और विशेष डैशबोर्ड क्रियाओं का प्रबंधन करता है।",
        actionNoun: "एडमिन"
      },
      AGENT: {
        label: "एजेंट",
        shortLabel: "एजेंट",
        description: "फील्ड संचालन, सदस्य सेवा कार्य और सौंपे गए कलेक्शन वर्कफ़्लो संभालता है।",
        actionNoun: "एजेंट"
      },
      CLIENT: {
        label: "क्लाइंट",
        shortLabel: "क्लाइंट",
        description: "सदस्य-उन्मुख सेवाओं, खाता जानकारी और व्यक्तिगत गतिविधि तक पहुँचता है।",
        actionNoun: "क्लाइंट"
      },
      SUPER_ADMIN: {
        label: "प्लेटफ़ॉर्म एडमिन",
        shortLabel: "प्लेटफ़ॉर्म",
        description: "पूरे प्लेटफ़ॉर्म की गवर्नेंस और विज़िबिलिटी की निगरानी करता है।",
        actionNoun: "प्लेटफ़ॉर्म"
      }
    }
  },
  mr: {
    title: {
      add: "खाते जोडा",
      update: "खाते अपडेट करा"
    },
    description: {
      add: "योग्य मॉड्यूल्ससह सोसायटी अॅडमिन, फिल्ड एजंट किंवा क्लायंट खाते तयार करा.",
      update: "खात्याची ओळख, शाखा नेमणूक, लॉगिन रीसेट आणि संपर्क माहिती अपडेट करा."
    },
    fields: {
      fullName: "पूर्ण नाव",
      accountType: "खाते प्रकार",
      branch: "शाखा",
      headOfficeUnassigned: "मुख्य कार्यालय / नियुक्त नाही",
      username: "यूजरनेम",
      usernameHelper: "स्पष्ट लॉगिन आयडी वापरा. तो नावावरून आपोआप भरला जातो आणि बदलताही येतो.",
      resetPasswordOptional: "पासवर्ड रीसेट करा (ऐच्छिक)",
      temporaryPassword: "तात्पुरता पासवर्ड",
      phone: "फोन",
      email: "ईमेल",
      address: "पत्ता"
    },
    password: {
      createHelper: "8+ अक्षरे वापरा ज्यात अपरकेस, लोअरकेस, संख्या आणि विशेष चिन्ह असेल.",
      editHelper: "सध्याचा पासवर्ड ठेवण्यासाठी रिकामे सोडा. नव्या पासवर्डमध्ये 8+ अक्षरे, अपरकेस, लोअरकेस, संख्या आणि विशेष चिन्ह असावे."
    },
    actions: {
      updateAccount: "{{role}} खाते अपडेट करा",
      createAccount: "{{role}} खाते तयार करा"
    },
    roles: {
      SUPER_USER: {
        label: "सोसायटी अॅडमिन",
        shortLabel: "अॅडमिन",
        description: "सोसायटी ऑपरेशन्स, प्रशासन आणि विशेष डॅशबोर्ड कृती व्यवस्थापित करतो.",
        actionNoun: "अॅडमिन"
      },
      AGENT: {
        label: "एजंट",
        shortLabel: "एजंट",
        description: "फिल्ड ऑपरेशन्स, सदस्य सेवा कामे आणि नेमून दिलेले कलेक्शन वर्कफ्लो हाताळतो.",
        actionNoun: "एजंट"
      },
      CLIENT: {
        label: "क्लायंट",
        shortLabel: "क्लायंट",
        description: "सदस्य-केंद्रित सेवा, खाते माहिती आणि वैयक्तिक अॅक्टिव्हिटीपर्यंत प्रवेश करतो.",
        actionNoun: "क्लायंट"
      },
      SUPER_ADMIN: {
        label: "प्लॅटफॉर्म अॅडमिन",
        shortLabel: "प्लॅटफॉर्म",
        description: "संपूर्ण प्लॅटफॉर्मवरील गव्हर्नन्स आणि दृश्यता पाहतो.",
        actionNoun: "प्लॅटफॉर्म"
      }
    }
  }
};

export function getUserProvisioningDrawerCopy(locale: AppLocale) {
  return userProvisioningDrawerCopy[locale] ?? userProvisioningDrawerCopy.en;
}
