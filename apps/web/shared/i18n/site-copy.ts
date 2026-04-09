import type { AppLocale } from "./translations";

type SocietyDirectoryCopy = {
  eyebrow: string;
  title: string;
  description: string;
  loadError: string;
  retry: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction: string;
  authorityPrefix: string;
  loginTitle: string;
  roleAgent: string;
  roleStaff: string;
  roleClient: string;
};

type LegalSection = {
  title: string;
  points?: string[];
  text?: string;
};

type LegalPageCopy = {
  badge: string;
  title: string;
  subtitle: string;
  contactLabel?: string;
  sections: LegalSection[];
};

type AdminLoginCopy = {
  success: string;
  fallbackError: string;
  heading: string;
  terminalLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  usernameLabel: string;
  passwordLabel: string;
  submit: string;
  footerNote: string;
};

type PortalCopy = {
  headOffice: string;
  credentialError: string;
  fallbackError: string;
  usernameLabel: string;
  passwordLabel: string;
  branchLabel: string;
  usernamePlaceholder: string;
  passwordPlaceholder: string;
  submit: string;
  helperNote: string;
  chip: string;
  heroTitle: string;
  heroDescription: string;
  statusLabel: string;
  statusValue: string;
  imageAlt: string;
  formTitle: string;
  formDescription: string;
  success: string;
};

type ChangePasswordCopy = {
  mismatchError: string;
  minLengthError: string;
  success: string;
  fallbackError: string;
  title: string;
  description: string;
  currentLabel: string;
  currentPlaceholder: string;
  newLabel: string;
  newPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  submit: string;
  footerNote: string;
};

type ErrorCopy = {
  genericTitle: string;
  genericFallback: string;
  retry: string;
  home: string;
  notFoundBadge: string;
  notFoundTitle: string;
  notFoundDescription: string;
  contactSupport: string;
};

type SiteCopy = {
  societyDirectory: SocietyDirectoryCopy;
  privacyPolicy: LegalPageCopy;
  termsOfService: LegalPageCopy;
  adminLogin: AdminLoginCopy;
  agentPortal: PortalCopy;
  clientPortal: PortalCopy;
  staffPortal: PortalCopy;
  changePassword: ChangePasswordCopy;
  errorStates: ErrorCopy;
};

const siteCopy: Record<AppLocale, SiteCopy> = {
  en: {
    societyDirectory: {
      eyebrow: "INSTITUTIONAL DIRECTORY",
      title: "Registered Societies",
      description:
        "Select your institution to access your secure workspace. Our multi-tenant architecture keeps each society's data inside its own protected vault.",
      loadError: "Failed to load directory",
      retry: "Try Again",
      emptyTitle: "No societies available yet",
      emptyDescription:
        "Once a society is approved, it will appear here for secure agent and client access. Until then, you can register your institution to get started.",
      emptyAction: "Enroll Society",
      authorityPrefix: "Institutional Authority",
      loginTitle: "LOGIN TO WORKSPACE",
      roleAgent: "Agent",
      roleStaff: "Staff",
      roleClient: "Client"
    },
    privacyPolicy: {
      badge: "Legal",
      title: "Privacy Policy",
      subtitle:
        "This page describes how Infopath handles operational data, technical metadata, and ad-related processing for public pages.",
      contactLabel: "For privacy or data handling questions, contact:",
      sections: [
        {
          title: "Information We Process",
          points: [
            "Account and operational records required to deliver workflow features.",
            "Basic technical and usage signals required for performance and security.",
            "Role and access data necessary to enforce permission boundaries."
          ]
        },
        {
          title: "How Data Is Used",
          points: [
            "To provide account, transaction, reporting, and administrative operations.",
            "To monitor platform integrity, detect misuse, and maintain reliability.",
            "To support legitimate customer service and onboarding requests."
          ]
        },
        {
          title: "Advertising and Cookies",
          points: [
            "Selected public areas may display advertisements.",
            "Third-party vendors may use cookies to personalize ad delivery.",
            "Users can manage ad personalization through supported ad settings."
          ]
        },
        {
          title: "Security and Retention",
          points: [
            "Role-based access controls are used to separate operational responsibilities.",
            "Data is retained based on business, compliance, and audit requirements.",
            "Security controls are regularly reviewed as the platform evolves."
          ]
        }
      ]
    },
    termsOfService: {
      badge: "Legal",
      title: "Terms of Service",
      subtitle:
        "These terms govern access to Infopath and define acceptable usage for all organizational users.",
      sections: [
        {
          title: "Authorized Use",
          text: "Use of this platform is limited to authorized organizational and individual users operating within assigned roles."
        },
        {
          title: "Operational Responsibility",
          text: "Users are responsible for accurate data entry, lawful process execution, and compliance with internal society operating rules."
        },
        {
          title: "Prohibited Actions",
          text: "Unauthorized access, data misuse, manipulation of records, and any attempt to bypass controls are strictly prohibited."
        },
        {
          title: "Service Evolution",
          text: "Features, workflows, and terms may be updated periodically. Continued usage indicates acceptance of current terms."
        }
      ]
    },
    adminLogin: {
      success: "Executive terminal initialized. Accessing Platform Governance Hub.",
      fallbackError: "Authentication failed.",
      heading: "Governance Hub",
      terminalLabel: "PLATFORM EXECUTIVE TERMINAL",
      sectionTitle: "Secure Initialize",
      sectionDescription: "Provide platform credentials to access governance and monitoring.",
      usernameLabel: "Executive Handle",
      passwordLabel: "Access Key",
      submit: "AUTHENTICATE TERMINAL",
      footerNote:
        "Unauthorized access to this terminal is strictly monitored. IP and session logs are transmitted to the platform audit system."
    },
    agentPortal: {
      headOffice: "Main Head Quarter",
      credentialError: "Credentials required",
      fallbackError: "Authentication failed.",
      usernameLabel: "Username",
      passwordLabel: "Password",
      branchLabel: "Branch",
      usernamePlaceholder: "e.g. john.doe",
      passwordPlaceholder: "Enter your password",
      submit: "Sign In",
      helperNote: "Forgot credentials? Contact your Society Administrator for recovery.",
      chip: "Agent Portal",
      heroTitle: "{{society}} Operations Portal",
      heroDescription:
        "Access your dedicated operations desk for {{code}}. Handle member transactions, society requests, and departmental workflows.",
      statusLabel: "IDENTIFIER",
      statusValue: "{{code}}",
      imageAlt: "Secure operational login",
      formTitle: "Agent Authorization",
      formDescription: "Please provide your operative credentials to access the {{society}} administrative surface.",
      success: "Welcome back, {{name}}!"
    },
    clientPortal: {
      headOffice: "Main Head Quarter",
      credentialError: "Credentials required",
      fallbackError: "Access failed.",
      usernameLabel: "Username",
      passwordLabel: "Password",
      branchLabel: "Branch",
      usernamePlaceholder: "e.g. john.doe",
      passwordPlaceholder: "Enter your password",
      submit: "Sign In",
      helperNote: "New member? Accounts are provisioned internally by the Society Administrator.",
      chip: "Member Portal",
      heroTitle: "Connect to {{society}}",
      heroDescription:
        "Securely manage your personal holdings, view transaction history, and access society services from your private dashboard.",
      statusLabel: "SECURE CHANNEL",
      statusValue: "Institutional Code: {{code}}",
      imageAlt: "Secure member login",
      formTitle: "Member Access",
      formDescription: "Log in to your private {{society}} dashboard.",
      success: "Welcome, {{name}}!"
    },
    staffPortal: {
      headOffice: "Main Head Quarter",
      credentialError: "Username and password are required.",
      fallbackError: "Authentication failed.",
      usernameLabel: "Staff Username",
      passwordLabel: "Password",
      branchLabel: "Branch",
      usernamePlaceholder: "e.g. branch.manager",
      passwordPlaceholder: "Enter your password",
      submit: "Sign In",
      helperNote: "",
      chip: "Staff Portal",
      heroTitle: "{{society}} Staff Login",
      heroDescription:
        "Sign in with your staff username, branch scope, and password. The dashboard will reflect the access modules assigned to your account.",
      statusLabel: "ACCESS BOUND TO",
      statusValue: "{{code}}",
      imageAlt: "Secure staff login",
      formTitle: "Staff Access",
      formDescription: "Choose the working branch for this session and log in with your society-issued staff credentials.",
      success: "Access granted to {{name}}."
    },
    changePassword: {
      mismatchError: "New passwords do not match.",
      minLengthError: "Password must be at least 6 characters.",
      success: "Security credentials updated. Dashboard access authorized.",
      fallbackError: "Failed to update security credentials.",
      title: "Security Verification",
      description: "Institutional policy requires a mandatory credential update on the first login to secure your workspace.",
      currentLabel: "System Password (Temporary)",
      currentPlaceholder: "Provisioned password",
      newLabel: "Personal Secure Password",
      newPlaceholder: "Enter new password",
      confirmLabel: "Confirm New Password",
      confirmPlaceholder: "Confirm new password",
      submit: "Secure Account & Continue",
      footerNote:
        "Your new password must be at least 6 characters long. By securing your account, you authorize your institutional credentials for this session."
    },
    errorStates: {
      genericTitle: "Something went wrong",
      genericFallback: "An unexpected error occurred.",
      retry: "Retry",
      home: "Go to Home",
      notFoundBadge: "404",
      notFoundTitle: "Page Not Found",
      notFoundDescription: "The page you are looking for does not exist or has been moved.",
      contactSupport: "Contact support"
    }
  },
  hi: {
    societyDirectory: {
      eyebrow: "संस्थागत निर्देशिका",
      title: "पंजीकृत सोसाइटी",
      description:
        "अपने सुरक्षित वर्कस्पेस तक पहुंचने के लिए अपनी संस्था चुनें। हमारी मल्टी-टेनेंट संरचना प्रत्येक सोसाइटी के डेटा को उसके अपने सुरक्षित वॉल्ट में रखती है।",
      loadError: "निर्देशिका लोड नहीं हो सकी",
      retry: "फिर से प्रयास करें",
      emptyTitle: "अभी कोई सोसाइटी उपलब्ध नहीं है",
      emptyDescription:
        "जैसे ही कोई सोसाइटी स्वीकृत होगी, वह सुरक्षित एजेंट और क्लाइंट एक्सेस के लिए यहां दिखाई देगी। तब तक आप अपनी संस्था का पंजीकरण कर सकते हैं।",
      emptyAction: "सोसाइटी पंजीकृत करें",
      authorityPrefix: "संस्थागत प्राधिकरण",
      loginTitle: "वर्कस्पेस में लॉगिन करें",
      roleAgent: "एजेंट",
      roleStaff: "स्टाफ",
      roleClient: "क्लाइंट"
    },
    privacyPolicy: {
      badge: "कानूनी",
      title: "गोपनीयता नीति",
      subtitle: "यह पेज बताता है कि Infopath सार्वजनिक पेजों के लिए परिचालन डेटा, तकनीकी मेटाडेटा और विज्ञापन-संबंधित प्रोसेसिंग को कैसे संभालता है।",
      contactLabel: "गोपनीयता या डेटा उपयोग संबंधी प्रश्नों के लिए संपर्क करें:",
      sections: [
        {
          title: "हम कौन-सी जानकारी प्रोसेस करते हैं",
          points: [
            "वर्कफ़्लो सुविधाएं प्रदान करने के लिए आवश्यक खाता और परिचालन रिकॉर्ड।",
            "प्रदर्शन और सुरक्षा के लिए आवश्यक मूल तकनीकी और उपयोग संकेत।",
            "अनुमति सीमाएं लागू करने के लिए आवश्यक भूमिका और एक्सेस डेटा।"
          ]
        },
        {
          title: "डेटा का उपयोग कैसे होता है",
          points: [
            "खाता, लेन-देन, रिपोर्टिंग और प्रशासनिक संचालन उपलब्ध कराने के लिए।",
            "प्लेटफ़ॉर्म की अखंडता की निगरानी, दुरुपयोग पहचानने और विश्वसनीयता बनाए रखने के लिए।",
            "वैध ग्राहक सहायता और ऑनबोर्डिंग अनुरोधों का समर्थन करने के लिए।"
          ]
        },
        {
          title: "विज्ञापन और कुकीज़",
          points: [
            "कुछ सार्वजनिक क्षेत्रों में विज्ञापन दिखाए जा सकते हैं।",
            "तृतीय-पक्ष विक्रेता विज्ञापन वैयक्तिकरण के लिए कुकीज़ का उपयोग कर सकते हैं।",
            "उपयोगकर्ता समर्थित विज्ञापन सेटिंग्स के माध्यम से विज्ञापन वैयक्तिकरण प्रबंधित कर सकते हैं।"
          ]
        },
        {
          title: "सुरक्षा और संरक्षण अवधि",
          points: [
            "परिचालन जिम्मेदारियों को अलग रखने के लिए भूमिका-आधारित एक्सेस नियंत्रण उपयोग किए जाते हैं।",
            "डेटा को व्यापार, अनुपालन और ऑडिट आवश्यकताओं के अनुसार सुरक्षित रखा जाता है।",
            "प्लेटफ़ॉर्म के विकसित होने के साथ सुरक्षा नियंत्रणों की नियमित समीक्षा की जाती है।"
          ]
        }
      ]
    },
    termsOfService: {
      badge: "कानूनी",
      title: "सेवा की शर्तें",
      subtitle: "ये शर्तें Infopath तक पहुंच और सभी संगठनात्मक उपयोगकर्ताओं के लिए स्वीकार्य उपयोग को परिभाषित करती हैं।",
      sections: [
        {
          title: "अधिकृत उपयोग",
          text: "इस प्लेटफ़ॉर्म का उपयोग केवल निर्धारित भूमिकाओं के भीतर काम करने वाले अधिकृत संगठनात्मक और व्यक्तिगत उपयोगकर्ताओं तक सीमित है।"
        },
        {
          title: "परिचालन जिम्मेदारी",
          text: "उपयोगकर्ता सही डेटा प्रविष्टि, वैध प्रक्रिया निष्पादन और आंतरिक सोसाइटी संचालन नियमों के अनुपालन के लिए जिम्मेदार हैं।"
        },
        {
          title: "प्रतिबंधित क्रियाएं",
          text: "अनधिकृत पहुंच, डेटा का दुरुपयोग, रिकॉर्ड में हेरफेर और नियंत्रणों को दरकिनार करने का कोई भी प्रयास सख्त वर्जित है।"
        },
        {
          title: "सेवा में परिवर्तन",
          text: "सुविधाएं, वर्कफ़्लो और शर्तें समय-समय पर अपडेट की जा सकती हैं। लगातार उपयोग वर्तमान शर्तों की स्वीकृति माना जाएगा।"
        }
      ]
    },
    adminLogin: {
      success: "कार्यकारी टर्मिनल प्रारंभ हो गया। प्लेटफ़ॉर्म गवर्नेंस हब खोला जा रहा है।",
      fallbackError: "प्रमाणीकरण विफल हुआ।",
      heading: "गवर्नेंस हब",
      terminalLabel: "प्लेटफ़ॉर्म एग्जीक्यूटिव टर्मिनल",
      sectionTitle: "सुरक्षित प्रारंभ",
      sectionDescription: "गवर्नेंस और मॉनिटरिंग तक पहुंचने के लिए प्लेटफ़ॉर्म क्रेडेंशियल दर्ज करें।",
      usernameLabel: "एग्जीक्यूटिव हैंडल",
      passwordLabel: "एक्सेस की",
      submit: "टर्मिनल प्रमाणित करें",
      footerNote: "इस टर्मिनल पर अनधिकृत पहुंच की कड़ी निगरानी की जाती है। IP और सत्र लॉग प्लेटफ़ॉर्म ऑडिट सिस्टम को भेजे जाते हैं।"
    },
    agentPortal: {
      headOffice: "मुख्य प्रधान कार्यालय",
      credentialError: "क्रेडेंशियल आवश्यक हैं",
      fallbackError: "प्रमाणीकरण विफल हुआ।",
      usernameLabel: "यूज़रनेम",
      passwordLabel: "पासवर्ड",
      branchLabel: "शाखा",
      usernamePlaceholder: "उदा. john.doe",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      submit: "साइन इन करें",
      helperNote: "क्रेडेंशियल भूल गए? रिकवरी के लिए अपने सोसाइटी एडमिनिस्ट्रेटर से संपर्क करें।",
      chip: "एजेंट पोर्टल",
      heroTitle: "{{society}} संचालन पोर्टल",
      heroDescription: "{{code}} के लिए अपने समर्पित संचालन डेस्क तक पहुंचें। सदस्य लेन-देन, सोसाइटी अनुरोध और विभागीय वर्कफ़्लो संभालें।",
      statusLabel: "पहचान",
      statusValue: "{{code}}",
      imageAlt: "सुरक्षित परिचालन लॉगिन",
      formTitle: "एजेंट प्रमाणीकरण",
      formDescription: "{{society}} प्रशासनिक सतह तक पहुंचने के लिए अपने ऑपरेटिव क्रेडेंशियल दर्ज करें।",
      success: "वापसी पर स्वागत है, {{name}}!"
    },
    clientPortal: {
      headOffice: "मुख्य प्रधान कार्यालय",
      credentialError: "क्रेडेंशियल आवश्यक हैं",
      fallbackError: "प्रवेश विफल हुआ।",
      usernameLabel: "यूज़रनेम",
      passwordLabel: "पासवर्ड",
      branchLabel: "शाखा",
      usernamePlaceholder: "उदा. john.doe",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      submit: "साइन इन करें",
      helperNote: "नए सदस्य? खाते आंतरिक रूप से सोसाइटी एडमिनिस्ट्रेटर द्वारा बनाए जाते हैं।",
      chip: "सदस्य पोर्टल",
      heroTitle: "{{society}} से जुड़ें",
      heroDescription: "अपने निजी डैशबोर्ड से अपनी व्यक्तिगत होल्डिंग्स सुरक्षित रूप से प्रबंधित करें, लेन-देन इतिहास देखें और सोसाइटी सेवाओं तक पहुंचें।",
      statusLabel: "सुरक्षित चैनल",
      statusValue: "संस्थागत कोड: {{code}}",
      imageAlt: "सुरक्षित सदस्य लॉगिन",
      formTitle: "सदस्य प्रवेश",
      formDescription: "अपने निजी {{society}} डैशबोर्ड में लॉगिन करें।",
      success: "स्वागत है, {{name}}!"
    },
    staffPortal: {
      headOffice: "मुख्य प्रधान कार्यालय",
      credentialError: "यूज़रनेम और पासवर्ड आवश्यक हैं।",
      fallbackError: "प्रमाणीकरण विफल हुआ।",
      usernameLabel: "स्टाफ यूज़रनेम",
      passwordLabel: "पासवर्ड",
      branchLabel: "शाखा",
      usernamePlaceholder: "उदा. branch.manager",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      submit: "साइन इन करें",
      helperNote: "",
      chip: "स्टाफ पोर्टल",
      heroTitle: "{{society}} स्टाफ लॉगिन",
      heroDescription: "अपने स्टाफ यूज़रनेम, शाखा सीमा और पासवर्ड से साइन इन करें। डैशबोर्ड आपके खाते को दिए गए मॉड्यूल एक्सेस को दिखाएगा।",
      statusLabel: "एक्सेस बाउंड टू",
      statusValue: "{{code}}",
      imageAlt: "सुरक्षित स्टाफ लॉगिन",
      formTitle: "स्टाफ प्रवेश",
      formDescription: "इस सत्र के लिए कार्यरत शाखा चुनें और अपनी सोसाइटी द्वारा जारी स्टाफ क्रेडेंशियल से लॉगिन करें।",
      success: "{{name}} को प्रवेश दिया गया।"
    },
    changePassword: {
      mismatchError: "नए पासवर्ड मेल नहीं खाते।",
      minLengthError: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      success: "सुरक्षा क्रेडेंशियल अपडेट हो गए। डैशबोर्ड एक्सेस अधिकृत है।",
      fallbackError: "सुरक्षा क्रेडेंशियल अपडेट नहीं हो सके।",
      title: "सुरक्षा सत्यापन",
      description: "वर्कस्पेस सुरक्षित करने के लिए पहली लॉगिन पर संस्थागत नीति के अनुसार क्रेडेंशियल अपडेट आवश्यक है।",
      currentLabel: "सिस्टम पासवर्ड (अस्थायी)",
      currentPlaceholder: "प्रदत्त पासवर्ड",
      newLabel: "व्यक्तिगत सुरक्षित पासवर्ड",
      newPlaceholder: "नया पासवर्ड दर्ज करें",
      confirmLabel: "नया पासवर्ड पुष्टि करें",
      confirmPlaceholder: "नया पासवर्ड फिर से दर्ज करें",
      submit: "खाता सुरक्षित करें और आगे बढ़ें",
      footerNote: "आपका नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए। खाता सुरक्षित करके आप इस सत्र के लिए अपने संस्थागत क्रेडेंशियल अधिकृत करते हैं।"
    },
    errorStates: {
      genericTitle: "कुछ गलत हो गया",
      genericFallback: "एक अनपेक्षित त्रुटि हुई।",
      retry: "फिर से प्रयास करें",
      home: "होम पर जाएं",
      notFoundBadge: "404",
      notFoundTitle: "पेज नहीं मिला",
      notFoundDescription: "जिस पेज को आप खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित हो गया है।",
      contactSupport: "सहायता से संपर्क करें"
    }
  },
  mr: {
    societyDirectory: {
      eyebrow: "संस्थात्मक निर्देशिका",
      title: "नोंदणीकृत सोसायट्या",
      description:
        "तुमच्या सुरक्षित वर्कस्पेसमध्ये प्रवेश करण्यासाठी तुमची संस्था निवडा. आमची मल्टी-टेनंट रचना प्रत्येक सोसायटीचा डेटा तिच्याच सुरक्षित व्हॉल्टमध्ये ठेवते.",
      loadError: "निर्देशिका लोड करता आली नाही",
      retry: "पुन्हा प्रयत्न करा",
      emptyTitle: "अद्याप कोणतीही सोसायटी उपलब्ध नाही",
      emptyDescription:
        "सोसायटी मंजूर झाल्यावर ती सुरक्षित एजंट आणि क्लायंट प्रवेशासाठी येथे दिसेल. तोपर्यंत तुम्ही तुमची संस्था नोंदवू शकता.",
      emptyAction: "सोसायटी नोंदवा",
      authorityPrefix: "संस्थात्मक प्राधिकरण",
      loginTitle: "वर्कस्पेसमध्ये लॉगिन करा",
      roleAgent: "एजंट",
      roleStaff: "स्टाफ",
      roleClient: "क्लायंट"
    },
    privacyPolicy: {
      badge: "कायदेशीर",
      title: "गोपनीयता धोरण",
      subtitle:
        "या पानावर Infopath सार्वजनिक पानांसाठी ऑपरेशनल डेटा, तांत्रिक मेटाडेटा आणि जाहिरात-संबंधित प्रक्रिया कशी हाताळते ते स्पष्ट केले आहे.",
      contactLabel: "गोपनीयता किंवा डेटा हाताळणीसंबंधी प्रश्नांसाठी संपर्क करा:",
      sections: [
        {
          title: "आम्ही कोणती माहिती प्रक्रिया करतो",
          points: [
            "वर्कफ्लो सुविधा देण्यासाठी आवश्यक खाते आणि ऑपरेशनल नोंदी.",
            "कार्यक्षमता आणि सुरक्षिततेसाठी आवश्यक मूलभूत तांत्रिक व वापर संकेत.",
            "परवानगी मर्यादा अंमलात आणण्यासाठी आवश्यक भूमिका आणि प्रवेश डेटा."
          ]
        },
        {
          title: "डेटाचा वापर कसा होतो",
          points: [
            "खाते, व्यवहार, रिपोर्टिंग आणि प्रशासकीय कामकाज उपलब्ध करून देण्यासाठी.",
            "प्लॅटफॉर्मची अखंडता तपासण्यासाठी, गैरवापर शोधण्यासाठी आणि विश्वसनीयता राखण्यासाठी.",
            "वैध ग्राहक सहाय्य आणि ऑनबोर्डिंग विनंत्यांना समर्थन देण्यासाठी."
          ]
        },
        {
          title: "जाहिराती आणि कुकीज",
          points: [
            "काही सार्वजनिक भागांमध्ये जाहिराती दाखवल्या जाऊ शकतात.",
            "तृतीय-पक्ष विक्रेते जाहिरात वैयक्तिकरणासाठी कुकीज वापरू शकतात.",
            "वापरकर्ते समर्थित जाहिरात सेटिंग्जमधून वैयक्तिकरण नियंत्रित करू शकतात."
          ]
        },
        {
          title: "सुरक्षा आणि साठवण",
          points: [
            "ऑपरेशनल जबाबदाऱ्या वेगळ्या ठेवण्यासाठी भूमिका-आधारित प्रवेश नियंत्रण वापरले जाते.",
            "डेटा व्यवसाय, अनुपालन आणि ऑडिट गरजेनुसार साठवला जातो.",
            "प्लॅटफॉर्म विकसित होत असताना सुरक्षा नियंत्रणांची नियमित पाहणी केली जाते."
          ]
        }
      ]
    },
    termsOfService: {
      badge: "कायदेशीर",
      title: "सेवेच्या अटी",
      subtitle: "या अटी Infopath वरील प्रवेश आणि सर्व संस्थात्मक वापरकर्त्यांसाठी स्वीकारार्ह वापर स्पष्ट करतात.",
      sections: [
        {
          title: "अधिकृत वापर",
          text: "या प्लॅटफॉर्मचा वापर फक्त नियुक्त भूमिकांमध्ये काम करणाऱ्या अधिकृत संस्थात्मक आणि वैयक्तिक वापरकर्त्यांपुरता मर्यादित आहे."
        },
        {
          title: "कारभाराची जबाबदारी",
          text: "योग्य डेटा नोंद, कायदेशीर प्रक्रिया अंमलबजावणी आणि अंतर्गत सोसायटी नियमांचे पालन यासाठी वापरकर्ते जबाबदार आहेत."
        },
        {
          title: "प्रतिबंधित कृती",
          text: "अनधिकृत प्रवेश, डेटा गैरवापर, नोंदींमध्ये फेरफार आणि नियंत्रणांना बगल देण्याचा कोणताही प्रयत्न सक्त मनाई आहे."
        },
        {
          title: "सेवेत बदल",
          text: "वैशिष्ट्ये, वर्कफ्लो आणि अटी वेळोवेळी बदलू शकतात. सातत्याने वापर केल्यास सध्याच्या अटी मान्य केल्या आहेत असे मानले जाईल."
        }
      ]
    },
    adminLogin: {
      success: "कार्यकारी टर्मिनल सुरू झाले. प्लॅटफॉर्म गव्हर्नन्स हब उघडत आहे.",
      fallbackError: "प्रमाणीकरण अयशस्वी झाले.",
      heading: "गव्हर्नन्स हब",
      terminalLabel: "प्लॅटफॉर्म एक्झिक्युटिव्ह टर्मिनल",
      sectionTitle: "सुरक्षित प्रारंभ",
      sectionDescription: "गव्हर्नन्स आणि मॉनिटरिंगमध्ये प्रवेश करण्यासाठी प्लॅटफॉर्म क्रेडेन्शियल द्या.",
      usernameLabel: "एक्झिक्युटिव्ह हँडल",
      passwordLabel: "अॅक्सेस की",
      submit: "टर्मिनल प्रमाणित करा",
      footerNote: "या टर्मिनलवरील अनधिकृत प्रवेशावर कडक लक्ष ठेवले जाते. IP आणि सेशन लॉग प्लॅटफॉर्म ऑडिट सिस्टीमकडे पाठवले जातात."
    },
    agentPortal: {
      headOffice: "मुख्य प्रधान कार्यालय",
      credentialError: "क्रेडेन्शियल आवश्यक आहेत",
      fallbackError: "प्रमाणीकरण अयशस्वी झाले.",
      usernameLabel: "युजरनेम",
      passwordLabel: "पासवर्ड",
      branchLabel: "शाखा",
      usernamePlaceholder: "उदा. john.doe",
      passwordPlaceholder: "तुमचा पासवर्ड टाका",
      submit: "साइन इन करा",
      helperNote: "क्रेडेन्शियल विसरलात? पुनर्प्राप्तीसाठी तुमच्या सोसायटी प्रशासकाशी संपर्क करा.",
      chip: "एजंट पोर्टल",
      heroTitle: "{{society}} ऑपरेशन्स पोर्टल",
      heroDescription: "{{code}} साठी तुमच्या समर्पित ऑपरेशन्स डेस्कमध्ये प्रवेश करा. सदस्य व्यवहार, सोसायटी विनंत्या आणि विभागीय वर्कफ्लो हाताळा.",
      statusLabel: "ओळख",
      statusValue: "{{code}}",
      imageAlt: "सुरक्षित ऑपरेशनल लॉगिन",
      formTitle: "एजंट प्रमाणीकरण",
      formDescription: "{{society}} प्रशासकीय पृष्ठभागात प्रवेश करण्यासाठी तुमची ऑपरेटिव्ह क्रेडेन्शियल द्या.",
      success: "पुन्हा स्वागत आहे, {{name}}!"
    },
    clientPortal: {
      headOffice: "मुख्य प्रधान कार्यालय",
      credentialError: "क्रेडेन्शियल आवश्यक आहेत",
      fallbackError: "प्रवेश अयशस्वी झाला.",
      usernameLabel: "युजरनेम",
      passwordLabel: "पासवर्ड",
      branchLabel: "शाखा",
      usernamePlaceholder: "उदा. john.doe",
      passwordPlaceholder: "तुमचा पासवर्ड टाका",
      submit: "साइन इन करा",
      helperNote: "नवीन सदस्य? खाती अंतर्गत पातळीवर सोसायटी प्रशासकाद्वारे तयार केली जातात.",
      chip: "सदस्य पोर्टल",
      heroTitle: "{{society}} शी जोडा",
      heroDescription: "तुमच्या खाजगी डॅशबोर्डमधून वैयक्तिक होल्डिंग्स सुरक्षितपणे व्यवस्थापित करा, व्यवहार इतिहास पाहा आणि सोसायटी सेवांचा वापर करा.",
      statusLabel: "सुरक्षित चॅनल",
      statusValue: "संस्थात्मक कोड: {{code}}",
      imageAlt: "सुरक्षित सदस्य लॉगिन",
      formTitle: "सदस्य प्रवेश",
      formDescription: "तुमच्या खाजगी {{society}} डॅशबोर्डमध्ये लॉगिन करा.",
      success: "स्वागत आहे, {{name}}!"
    },
    staffPortal: {
      headOffice: "मुख्य प्रधान कार्यालय",
      credentialError: "युजरनेम आणि पासवर्ड आवश्यक आहेत.",
      fallbackError: "प्रमाणीकरण अयशस्वी झाले.",
      usernameLabel: "स्टाफ युजरनेम",
      passwordLabel: "पासवर्ड",
      branchLabel: "शाखा",
      usernamePlaceholder: "उदा. branch.manager",
      passwordPlaceholder: "तुमचा पासवर्ड टाका",
      submit: "साइन इन करा",
      helperNote: "",
      chip: "स्टाफ पोर्टल",
      heroTitle: "{{society}} स्टाफ लॉगिन",
      heroDescription: "तुमच्या स्टाफ युजरनेम, शाखा-व्याप्ती आणि पासवर्डसह साइन इन करा. डॅशबोर्डवर तुमच्या खात्याला दिलेले मॉड्यूल प्रवेश दिसतील.",
      statusLabel: "प्रवेश मर्यादित",
      statusValue: "{{code}}",
      imageAlt: "सुरक्षित स्टाफ लॉगिन",
      formTitle: "स्टाफ प्रवेश",
      formDescription: "या सत्रासाठी कामकाजाची शाखा निवडा आणि सोसायटीने दिलेल्या स्टाफ क्रेडेन्शियलने लॉगिन करा.",
      success: "{{name}} यांना प्रवेश देण्यात आला."
    },
    changePassword: {
      mismatchError: "नवीन पासवर्ड जुळत नाहीत.",
      minLengthError: "पासवर्ड किमान 6 अक्षरांचा असावा.",
      success: "सुरक्षा क्रेडेन्शियल अद्ययावत झाले. डॅशबोर्ड प्रवेश अधिकृत झाला आहे.",
      fallbackError: "सुरक्षा क्रेडेन्शियल अद्ययावत करता आले नाहीत.",
      title: "सुरक्षा पडताळणी",
      description: "वर्कस्पेस सुरक्षित करण्यासाठी पहिल्या लॉगिनवेळी संस्थात्मक धोरणानुसार क्रेडेन्शियल अद्ययावत करणे आवश्यक आहे.",
      currentLabel: "सिस्टम पासवर्ड (तात्पुरता)",
      currentPlaceholder: "प्रोव्हिजन केलेला पासवर्ड",
      newLabel: "वैयक्तिक सुरक्षित पासवर्ड",
      newPlaceholder: "नवीन पासवर्ड टाका",
      confirmLabel: "नवीन पासवर्डची पुष्टी करा",
      confirmPlaceholder: "नवीन पासवर्ड पुन्हा टाका",
      submit: "खाते सुरक्षित करा आणि पुढे जा",
      footerNote: "तुमचा नवीन पासवर्ड किमान 6 अक्षरांचा असावा. खाते सुरक्षित करून तुम्ही या सत्रासाठी तुमची संस्थात्मक क्रेडेन्शियल अधिकृत करता."
    },
    errorStates: {
      genericTitle: "काहीतरी चुकले",
      genericFallback: "अनपेक्षित त्रुटी आली.",
      retry: "पुन्हा प्रयत्न करा",
      home: "मुख्यपृष्ठावर जा",
      notFoundBadge: "404",
      notFoundTitle: "पृष्ठ सापडले नाही",
      notFoundDescription: "तुम्ही शोधत असलेले पृष्ठ उपलब्ध नाही किंवा हलवले गेले आहे.",
      contactSupport: "सपोर्टशी संपर्क करा"
    }
  }
};

export function interpolateCopy(template: string, vars?: Record<string, string>) {
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce((result, [key, value]) => result.replaceAll(`{{${key}}}`, value), template);
}

export function getSiteCopy(locale: AppLocale) {
  return siteCopy[locale] ?? siteCopy.en;
}
