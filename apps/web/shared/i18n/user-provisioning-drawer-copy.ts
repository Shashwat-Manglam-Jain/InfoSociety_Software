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
    aadhaarNumber: string;
    aadhaarHelper: string;
    branch: string;
    headOfficeUnassigned: string;
    username: string;
    usernameHelper: string;
    resetPasswordOptional: string;
    temporaryPassword: string;
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
      add: "Create a staff, field agent, or client login using Aadhaar and the right modules.",
      update: "Update the login id, Aadhaar number, branch assignment, and password reset settings."
    },
    fields: {
      aadhaarNumber: "Aadhaar number",
      aadhaarHelper: "Use the 12-digit Aadhaar number so duplicate registrations are blocked.",
      branch: "Branch",
      headOfficeUnassigned: "Head office (default)",
      username: "Username",
      usernameHelper: "Use a clear login id. Contact details and personal profile fields are completed after first login.",
      resetPasswordOptional: "Reset password (optional)",
      temporaryPassword: "Temporary password"
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
        label: "Society Staff",
        shortLabel: "Staff",
        description: "Handles internal society operations. The society creator remains the admin account.",
        actionNoun: "staff"
      },
      AGENT: {
        label: "Agent",
        shortLabel: "Agent",
        description: "Handles field operations, member servicing, and collection workflows.",
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
      add: "आधार और सही मॉड्यूल्स के साथ स्टाफ, एजेंट या क्लाइंट लॉगिन बनाएँ।",
      update: "लॉगिन आईडी, आधार नंबर, शाखा असाइनमेंट और पासवर्ड रीसेट सेटिंग अपडेट करें।"
    },
    fields: {
      aadhaarNumber: "आधार नंबर",
      aadhaarHelper: "12 अंकों वाला आधार नंबर दर्ज करें ताकि डुप्लिकेट रजिस्ट्रेशन रुक सके।",
      branch: "शाखा",
      headOfficeUnassigned: "मुख्य कार्यालय (डिफ़ॉल्ट)",
      username: "यूज़रनेम",
      usernameHelper: "स्पष्ट लॉगिन आईडी का उपयोग करें। संपर्क जानकारी और प्रोफ़ाइल विवरण पहली लॉगिन के बाद भरे जाएँगे।",
      resetPasswordOptional: "पासवर्ड रीसेट करें (वैकल्पिक)",
      temporaryPassword: "अस्थायी पासवर्ड"
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
        label: "सोसायटी स्टाफ",
        shortLabel: "स्टाफ",
        description: "आंतरिक सोसायटी संचालन संभालता है। सोसायटी बनाने वाला खाता एडमिन बना रहता है।",
        actionNoun: "स्टाफ"
      },
      AGENT: {
        label: "एजेंट",
        shortLabel: "एजेंट",
        description: "फील्ड संचालन, सदस्य सेवा कार्य और कलेक्शन वर्कफ़्लो संभालता है।",
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
      add: "आधार आणि योग्य मॉड्यूल्ससह स्टाफ, एजंट किंवा क्लायंट लॉगिन तयार करा.",
      update: "लॉगिन आयडी, आधार क्रमांक, शाखा नेमणूक आणि पासवर्ड रीसेट सेटिंग अपडेट करा."
    },
    fields: {
      aadhaarNumber: "आधार क्रमांक",
      aadhaarHelper: "डुप्लिकेट नोंदणी टाळण्यासाठी 12 अंकी आधार क्रमांक वापरा.",
      branch: "शाखा",
      headOfficeUnassigned: "मुख्य कार्यालय (डीफॉल्ट)",
      username: "यूजरनेम",
      usernameHelper: "स्पष्ट लॉगिन आयडी वापरा. संपर्क माहिती आणि प्रोफाइल तपशील पहिल्या लॉगिननंतर भरले जातील.",
      resetPasswordOptional: "पासवर्ड रीसेट करा (ऐच्छिक)",
      temporaryPassword: "तात्पुरता पासवर्ड"
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
        label: "सोसायटी स्टाफ",
        shortLabel: "स्टाफ",
        description: "आतील सोसायटी ऑपरेशन्स हाताळतो. सोसायटी तयार करणारे खाते अॅडमिन राहते.",
        actionNoun: "स्टाफ"
      },
      AGENT: {
        label: "एजंट",
        shortLabel: "एजंट",
        description: "फिल्ड ऑपरेशन्स, सदस्य सेवा आणि कलेक्शन वर्कफ्लो हाताळतो.",
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
