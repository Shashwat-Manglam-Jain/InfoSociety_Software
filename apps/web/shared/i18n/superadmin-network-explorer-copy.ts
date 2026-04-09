import type { AppLocale } from "./translations";

type SuperadminNetworkExplorerCopy = {
  localeTag: string;
  nav: {
    executiveSuite: string;
    platformGovernance: string;
    portfolioSnapshot: string;
    approvalsRequests: string;
    platformAnalytics: string;
    networkExplorer: string;
    reportGeneration: string;
    systemUiSettings: string;
  };
  page: {
    eyebrow: string;
    title: string;
    description: string;
    societiesInScope: string;
    pendingApprovals: string;
    searchPlaceholder: string;
    clearSearch: string;
    retry: string;
    table: {
      society: string;
      code: string;
      status: string;
      users: string;
      customers: string;
      accounts: string;
      balance: string;
      actions: string;
      inspect: string;
      regionNotProvided: string;
      noResults: string;
    };
    drawer: {
      societyId: string;
      planSuffix: string;
      pendingAlert: string;
      suspendedAlert: string;
      updating: string;
      suspendSociety: string;
      approveSociety: string;
      openApprovalQueue: string;
      openAnalytics: string;
      liveMetrics: string;
      transactions: string;
      totalBalance: string;
      paymentVolume: string;
      apiBackedDetails: string;
      registrationState: string;
      registrationNumber: string;
      registrationAuthority: string;
      category: string;
      billingEmail: string;
      billingPhone: string;
      billingAddress: string;
      digitalPayments: string;
      upiId: string;
      notProvided: string;
      enabled: string;
      disabled: string;
      footer: string;
    };
    messages: {
      loadError: string;
      approveSuccess: string;
      suspendSuccess: string;
      updateAccessError: string;
      recoveryAdminCreated: string;
    };
  };
};

const copy: Record<AppLocale, SuperadminNetworkExplorerCopy> = {
  en: {
    localeTag: "en-IN",
    nav: {
      executiveSuite: "EXECUTIVE SUITE",
      platformGovernance: "PLATFORM GOVERNANCE",
      portfolioSnapshot: "Portfolio Snapshot",
      approvalsRequests: "Approvals & Requests",
      platformAnalytics: "Platform Analytics",
      networkExplorer: "Network Explorer",
      reportGeneration: "Report Generation",
      systemUiSettings: "System UI Settings"
    },
    page: {
      eyebrow: "LIVE NETWORK DATA",
      title: "Network Explorer",
      description: "This view is driven by the monitoring API. Search societies, inspect approval state, and review live operational totals without any mock hierarchy.",
      societiesInScope: "{{count}} societies in monitoring scope",
      pendingApprovals: "{{count}} pending approvals",
      searchPlaceholder: "Search societies by name or code...",
      clearSearch: "Clear Search",
      retry: "Retry",
      table: {
        society: "Society",
        code: "Code",
        status: "Status",
        users: "Users",
        customers: "Customers",
        accounts: "Accounts",
        balance: "Balance",
        actions: "Actions",
        inspect: "Inspect",
        regionNotProvided: "Region not provided",
        noResults: "No societies found matching your search."
      },
      drawer: {
        societyId: "SOCIETY ID",
        planSuffix: "Plan",
        pendingAlert: "This society is still waiting for platform approval.",
        suspendedAlert: "This society is currently suspended and its users should not be able to log in.",
        updating: "Updating...",
        suspendSociety: "Suspend Society",
        approveSociety: "Approve Society",
        openApprovalQueue: "Open Approval Queue",
        openAnalytics: "Open Analytics",
        liveMetrics: "Live Metrics",
        transactions: "Transactions",
        totalBalance: "Total Balance",
        paymentVolume: "Payment Volume",
        apiBackedDetails: "API-backed Details",
        registrationState: "Registration State",
        registrationNumber: "Registration Number",
        registrationAuthority: "Registration Authority",
        category: "Category",
        billingEmail: "Billing Email",
        billingPhone: "Billing Phone",
        billingAddress: "Billing Address",
        digitalPayments: "Digital Payments",
        upiId: "UPI ID",
        notProvided: "Not provided",
        enabled: "Enabled",
        disabled: "Disabled",
        footer: "This drawer now shows only values returned by the monitoring API. Branches, agents, and account trees are intentionally not mocked here anymore."
      },
      messages: {
        loadError: "Unable to load the live society network.",
        approveSuccess: "{{name}} is now approved.",
        suspendSuccess: "{{name}} has been suspended.",
        updateAccessError: "Unable to update society access.",
        recoveryAdminCreated: "{{name}} is now approved. Recovery admin @{{username}} was created with temporary password {{password}}."
      }
    }
  },
  hi: {
    localeTag: "hi-IN",
    nav: {
      executiveSuite: "कार्यकारी सूट",
      platformGovernance: "प्लेटफ़ॉर्म शासन",
      portfolioSnapshot: "पोर्टफोलियो स्नैपशॉट",
      approvalsRequests: "अनुमोदन और अनुरोध",
      platformAnalytics: "प्लेटफ़ॉर्म एनालिटिक्स",
      networkExplorer: "नेटवर्क एक्सप्लोरर",
      reportGeneration: "रिपोर्ट जनरेशन",
      systemUiSettings: "सिस्टम UI सेटिंग्स"
    },
    page: {
      eyebrow: "लाइव नेटवर्क डेटा",
      title: "नेटवर्क एक्सप्लोरर",
      description: "यह दृश्य मॉनिटरिंग API द्वारा संचालित है। सोसायटी खोजें, अनुमोदन स्थिति देखें, और बिना किसी मॉक पदानुक्रम के लाइव संचालन आँकड़ों की समीक्षा करें।",
      societiesInScope: "मॉनिटरिंग दायरे में {{count}} सोसायटी",
      pendingApprovals: "{{count}} लंबित अनुमोदन",
      searchPlaceholder: "नाम या कोड से सोसायटी खोजें...",
      clearSearch: "खोज साफ करें",
      retry: "फिर से प्रयास करें",
      table: {
        society: "सोसायटी",
        code: "कोड",
        status: "स्थिति",
        users: "उपयोगकर्ता",
        customers: "ग्राहक",
        accounts: "खाते",
        balance: "शेष",
        actions: "कार्रवाई",
        inspect: "देखें",
        regionNotProvided: "क्षेत्र उपलब्ध नहीं",
        noResults: "आपकी खोज से मेल खाने वाली कोई सोसायटी नहीं मिली।"
      },
      drawer: {
        societyId: "सोसायटी आईडी",
        planSuffix: "योजना",
        pendingAlert: "यह सोसायटी अभी भी प्लेटफ़ॉर्म अनुमोदन की प्रतीक्षा कर रही है।",
        suspendedAlert: "यह सोसायटी वर्तमान में निलंबित है और इसके उपयोगकर्ता लॉग इन नहीं कर पाने चाहिए।",
        updating: "अपडेट हो रहा है...",
        suspendSociety: "सोसायटी निलंबित करें",
        approveSociety: "सोसायटी अनुमोदित करें",
        openApprovalQueue: "अनुमोदन कतार खोलें",
        openAnalytics: "एनालिटिक्स खोलें",
        liveMetrics: "लाइव मेट्रिक्स",
        transactions: "लेनदेन",
        totalBalance: "कुल शेष",
        paymentVolume: "भुगतान मात्रा",
        apiBackedDetails: "API-आधारित विवरण",
        registrationState: "पंजीकरण राज्य",
        registrationNumber: "पंजीकरण संख्या",
        registrationAuthority: "पंजीकरण प्राधिकरण",
        category: "श्रेणी",
        billingEmail: "बिलिंग ईमेल",
        billingPhone: "बिलिंग फ़ोन",
        billingAddress: "बिलिंग पता",
        digitalPayments: "डिजिटल भुगतान",
        upiId: "UPI आईडी",
        notProvided: "प्रदान नहीं किया गया",
        enabled: "सक्रिय",
        disabled: "निष्क्रिय",
        footer: "यह ड्रॉअर अब केवल मॉनिटरिंग API से लौटाए गए मान दिखाता है। शाखाएँ, एजेंट और खाता ट्री अब जानबूझकर यहाँ मॉक नहीं किए जाते।"
      },
      messages: {
        loadError: "लाइव सोसायटी नेटवर्क लोड नहीं हो सका।",
        approveSuccess: "{{name}} अब अनुमोदित है।",
        suspendSuccess: "{{name}} को निलंबित कर दिया गया है।",
        updateAccessError: "सोसायटी एक्सेस अपडेट नहीं हो सका।",
        recoveryAdminCreated: "{{name}} अब अनुमोदित है। रिकवरी एडमिन @{{username}} अस्थायी पासवर्ड {{password}} के साथ बनाया गया।"
      }
    }
  },
  mr: {
    localeTag: "mr-IN",
    nav: {
      executiveSuite: "कार्यकारी संच",
      platformGovernance: "प्लॅटफॉर्म शासन",
      portfolioSnapshot: "पोर्टफोलिओ स्नॅपशॉट",
      approvalsRequests: "मंजुरी आणि विनंत्या",
      platformAnalytics: "प्लॅटफॉर्म विश्लेषण",
      networkExplorer: "नेटवर्क एक्सप्लोरर",
      reportGeneration: "अहवाल निर्मिती",
      systemUiSettings: "सिस्टम UI सेटिंग्ज"
    },
    page: {
      eyebrow: "लाइव्ह नेटवर्क डेटा",
      title: "नेटवर्क एक्सप्लोरर",
      description: "हा दृश्य मॉनिटरिंग API वर चालतो. सोसायट्या शोधा, मंजुरी स्थिती तपासा आणि कोणत्याही मॉक श्रेणीशिवाय लाइव्ह ऑपरेशनल आकडे पहा.",
      societiesInScope: "मॉनिटरिंग कार्यक्षेत्रात {{count}} सोसायट्या",
      pendingApprovals: "{{count}} प्रलंबित मंजुरी",
      searchPlaceholder: "नाव किंवा कोडने सोसायट्या शोधा...",
      clearSearch: "शोध साफ करा",
      retry: "पुन्हा प्रयत्न करा",
      table: {
        society: "सोसायटी",
        code: "कोड",
        status: "स्थिती",
        users: "वापरकर्ते",
        customers: "ग्राहक",
        accounts: "खाती",
        balance: "शिल्लक",
        actions: "क्रिया",
        inspect: "पहा",
        regionNotProvided: "प्रदेश उपलब्ध नाही",
        noResults: "तुमच्या शोधाशी जुळणारी कोणतीही सोसायटी सापडली नाही."
      },
      drawer: {
        societyId: "सोसायटी आयडी",
        planSuffix: "योजना",
        pendingAlert: "ही सोसायटी अजूनही प्लॅटफॉर्म मंजुरीची वाट पाहत आहे.",
        suspendedAlert: "ही सोसायटी सध्या निलंबित आहे आणि तिच्या वापरकर्त्यांना लॉग इन करता येऊ नये.",
        updating: "अपडेट होत आहे...",
        suspendSociety: "सोसायटी निलंबित करा",
        approveSociety: "सोसायटी मंजूर करा",
        openApprovalQueue: "मंजुरी रांग उघडा",
        openAnalytics: "विश्लेषण उघडा",
        liveMetrics: "लाइव्ह मेट्रिक्स",
        transactions: "व्यवहार",
        totalBalance: "एकूण शिल्लक",
        paymentVolume: "देयक खंड",
        apiBackedDetails: "API-आधारित तपशील",
        registrationState: "नोंदणी राज्य",
        registrationNumber: "नोंदणी क्रमांक",
        registrationAuthority: "नोंदणी प्राधिकरण",
        category: "श्रेणी",
        billingEmail: "बिलिंग ईमेल",
        billingPhone: "बिलिंग फोन",
        billingAddress: "बिलिंग पत्ता",
        digitalPayments: "डिजिटल पेमेंट्स",
        upiId: "UPI आयडी",
        notProvided: "उपलब्ध नाही",
        enabled: "सक्रिय",
        disabled: "निष्क्रिय",
        footer: "हा ड्रॉवर आता फक्त मॉनिटरिंग API मधून आलेली मूल्ये दाखवतो. शाखा, एजंट आणि खाते वृक्ष येथे जाणूनबुजून मॉक केलेले नाहीत."
      },
      messages: {
        loadError: "लाइव्ह सोसायटी नेटवर्क लोड करता आले नाही.",
        approveSuccess: "{{name}} आता मंजूर आहे.",
        suspendSuccess: "{{name}} निलंबित केली आहे.",
        updateAccessError: "सोसायटी प्रवेश अपडेट करता आला नाही.",
        recoveryAdminCreated: "{{name}} आता मंजूर आहे. रिकव्हरी अॅडमिन @{{username}} तात्पुरता पासवर्ड {{password}} सह तयार केला गेला."
      }
    }
  }
};

export function getSuperadminNetworkExplorerCopy(locale: AppLocale) {
  return copy[locale] ?? copy.en;
}
