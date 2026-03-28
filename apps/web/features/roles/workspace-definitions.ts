import { getAllowedModuleSlugs } from "@/features/banking/account-access";
import { localizeBankingModule } from "@/features/banking/module-localization";
import { modules, type BankingModule } from "@/features/banking/module-registry";
import { defaultLocale, type AppLocale } from "@/shared/i18n/translations";
import type { AppAccountType } from "@/shared/types";

export type WorkspaceRoleSlug = "client" | "agent" | "society-admin" | "platform-admin";

export type WorkspaceDefinition = {
  slug: WorkspaceRoleSlug;
  href: `/workspaces/${WorkspaceRoleSlug}`;
  accountType: AppAccountType;
  navLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  audience: string;
  dataScope: string;
  primaryResponsibility: string;
  visibleHighlights: string[];
  adminTools: string[];
  dailyWork: string[];
  hiddenFromRole: string[];
  provisioningNote: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction: {
    href: string;
    label: string;
  };
};

type WorkspaceLocalizedContent = {
  navLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  audience: string;
  dataScope: string;
  primaryResponsibility: string;
  visibleHighlights: string[];
  adminTools: string[];
  dailyWork: string[];
  hiddenFromRole: string[];
  provisioningNote: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
};

export type WorkspaceUiCopy = {
  overviewBadge: string;
  overviewTitle: string;
  overviewSubtitle: string;
  statRoleProfilesTitle: string;
  statRoleProfilesCaption: string;
  statModuleCoverageTitle: string;
  statModuleCoverageCaption: string;
  statProvisioningTitle: string;
  statProvisioningValue: string;
  statProvisioningCaption: string;
  homeSectionTitle: string;
  homeSectionSubtitle: string;
  reviewRoleButton: string;
  cardAudienceLabel: string;
  cardScopeLabel: string;
  cardProvisioningLabel: string;
  cardKeyModulesLabel: string;
  roleProfileOverline: string;
  roleProfileTitle: string;
  audienceLabel: string;
  dataScopeLabel: string;
  primaryResponsibilityLabel: string;
  operatingAuthorityOverline: string;
  operatingAuthorityTitle: string;
  modulePortfolioOverline: string;
  modulePortfolioTitle: string;
  operatingModelOverline: string;
  operatingModelTitle: string;
  typicalResponsibilitiesTitle: string;
  restrictedCapabilitiesTitle: string;
  restrictedModuleFamiliesLabel: string;
  provisioningRecommendationOverline: string;
  provisioningRecommendationTitle: string;
  provisioningRecommendationBodySuffix: string;
  cardAuthorizedModules: (count: number) => string;
  cardRestrictedCapabilities: (count: number) => string;
  cardModules: (count: number) => string;
  moduleApiCount: (count: number) => string;
};

const workspaceDefinitions: WorkspaceDefinition[] = [
  {
    slug: "client",
    href: "/workspaces/client",
    accountType: "CLIENT",
    navLabel: "Client Banking",
    badge: "Member Access",
    title: "Client Banking Workspace",
    subtitle:
      "A secure self-service workspace for members who need visibility into their own accounts, deposits, loans, and service activity.",
    audience: "Members and customers operating strictly on their own banking relationship.",
    dataScope: "Personal profile, owned accounts, deposits, loans, transactions, and enabled locker records.",
    primaryResponsibility: "Self-service visibility, enquiry, and personal account follow-up.",
    visibleHighlights: [
      "View balances, account activity, deposit status, loan servicing, and transaction history for the signed-in member",
      "Use approved theme and language preferences across the shared dashboard experience",
      "Operate without exposure to institution configuration, staff workflows, or other members' records"
    ],
    adminTools: [
      "Personal banking dashboards and status views",
      "Role-scoped access to enabled self-service modules",
      "Personalization controls for theme and language"
    ],
    dailyWork: [
      "Review balances, statements, and account activity",
      "Track deposit maturity and loan repayment status",
      "Check recent transactions and personal service activity",
      "Monitor locker usage where that service is enabled"
    ],
    hiddenFromRole: [
      "Customer master maintenance and staff servicing tools",
      "Society-wide reports, cash operations, and instrument workflows",
      "User administration, monitoring, and institution setup",
      "Billing, branch policy, and governance controls"
    ],
    provisioningNote: "Provision this role for end members who should only access their own data and self-service banking views.",
    primaryAction: {
      href: "/register?type=CLIENT",
      label: "Provision Client Access"
    },
    secondaryAction: {
      href: "/login",
      label: "Client Sign-In"
    }
  },
  {
    slug: "agent",
    href: "/workspaces/agent",
    accountType: "AGENT",
    navLabel: "Agent Operations",
    badge: "Operations Access",
    title: "Agent Operations Workspace",
    subtitle:
      "A controlled operations workspace for front-office and field staff executing day-to-day society banking activities.",
    audience: "Operational staff, branch teams, and field agents assigned to one society.",
    dataScope: "Society-scoped customer servicing, transaction execution, and day-to-day operational workflows.",
    primaryResponsibility: "Operational execution, customer servicing, and workflow completion.",
    visibleHighlights: [
      "Process customer onboarding, KYC review, account opening, deposits, loans, and day-to-day transactions",
      "Work with cashbook, clearing, demand drafts, instruments, locker servicing, and operational reporting",
      "Operate within one assigned institution without access to governance or billing controls"
    ],
    adminTools: [
      "Customer and account servicing workflows",
      "Cashbook, instruments, and assisted operations handling",
      "Society-scoped operational reports and exception follow-up"
    ],
    dailyWork: [
      "Create and maintain customer records",
      "Open and service accounts, deposits, and loan requests",
      "Process transaction entries, clearing, and instrument activity",
      "Run operational reports and collection-related tasks"
    ],
    hiddenFromRole: [
      "Institution profile, billing, and branch policy setup",
      "Society-wide user administration and strategic governance",
      "Cross-society monitoring and platform-level controls",
      "Portfolio-wide approvals outside the assigned society"
    ],
    provisioningNote: "Provision this role for staff who execute society operations but should not control institution-level setup.",
    primaryAction: {
      href: "/register?type=AGENT",
      label: "Provision Agent Access"
    },
    secondaryAction: {
      href: "/login",
      label: "Agent Sign-In"
    }
  },
  {
    slug: "society-admin",
    href: "/workspaces/society-admin",
    accountType: "SOCIETY",
    navLabel: "Society Administration",
    badge: "Institution Control",
    title: "Society Administration Workspace",
    subtitle:
      "A full institution control surface for society leadership, including profile management, branch setup, operations, reporting, and governance.",
    audience: "Society administrators, management users, and designated super users responsible for one institution.",
    dataScope: "Complete visibility across a single society, including operational, administrative, and monitoring functions.",
    primaryResponsibility: "Institution configuration, operational oversight, and internal governance.",
    visibleHighlights: [
      "Maintain institution master data, compliance records, billing details, and branch configuration",
      "Oversee all society operational modules, reports, users, and monitoring views",
      "Control one institution completely without access to cross-society platform governance"
    ],
    adminTools: [
      "Institution profile and society master configuration",
      "Branch setup, administration tools, and service controls",
      "User visibility, reports, and monitoring across the current society"
    ],
    dailyWork: [
      "Maintain institution identity, billing, and compliance settings",
      "Configure branches, service availability, and administrative controls",
      "Review operational reports, monitoring, and user activity",
      "Supervise staff and member-facing workspaces inside the society"
    ],
    hiddenFromRole: [
      "Cross-society approvals and portfolio governance",
      "Global platform configuration outside the assigned institution",
      "Multi-tenant monitoring decisions owned by platform administration"
    ],
    provisioningNote: "Provision this role for institution owners and administrators who are responsible for one society end-to-end.",
    primaryAction: {
      href: "/register?type=SOCIETY&plan=PREMIUM",
      label: "Provision Society Access"
    },
    secondaryAction: {
      href: "/login",
      label: "Society Admin Sign-In"
    }
  },
  {
    slug: "platform-admin",
    href: "/workspaces/platform-admin",
    accountType: "PLATFORM",
    navLabel: "Platform Governance",
    badge: "Enterprise Control",
    title: "Platform Governance Workspace",
    subtitle:
      "A centralized governance workspace for platform operators managing society onboarding, access control, monitoring, and reporting across institutions.",
    audience: "Platform super administrators responsible for the full multi-society deployment.",
    dataScope: "Cross-society visibility for governance, approvals, user oversight, and executive reporting.",
    primaryResponsibility: "Portfolio-wide governance, oversight, and platform health.",
    visibleHighlights: [
      "Approve, suspend, and supervise societies across the full platform portfolio",
      "Review executive reports, monitoring dashboards, and platform-wide user visibility",
      "Operate above individual society setup without member-facing or branch-level transaction entry"
    ],
    adminTools: [
      "Society onboarding, access control, and lifecycle decisions",
      "Platform-wide monitoring, reporting, and health review",
      "Global user-directory visibility and governance support"
    ],
    dailyWork: [
      "Approve or suspend societies and review onboarding readiness",
      "Track operational health and performance across institutions",
      "Review user distribution, access posture, and executive reports",
      "Coordinate portfolio-wide governance and compliance decisions"
    ],
    hiddenFromRole: [
      "Society-local daybook and branch servicing workflows",
      "Institution-specific setup owned by society administrators",
      "Member self-service activity and front-office transaction handling"
    ],
    provisioningNote: "Provision this role only for central platform operators who manage governance across multiple societies.",
    primaryAction: {
      href: "/login",
      label: "Platform Admin Sign-In"
    },
    secondaryAction: {
      href: "/workspaces",
      label: "View Workspace Overview"
    }
  }
];

const localizedWorkspaceContent: Partial<Record<AppLocale, Record<WorkspaceRoleSlug, WorkspaceLocalizedContent>>> = {
  hi: {
    client: {
      navLabel: "क्लाइंट बैंकिंग",
      badge: "सदस्य एक्सेस",
      title: "क्लाइंट बैंकिंग वर्कस्पेस",
      subtitle: "सदस्यों के लिए सुरक्षित सेल्फ-सर्विस वर्कस्पेस, जहां वे अपने खाते, जमा, ऋण और सेवा गतिविधि देख सकते हैं।",
      audience: "वे सदस्य और ग्राहक जो केवल अपने बैंकिंग संबंध पर काम करते हैं।",
      dataScope: "व्यक्तिगत प्रोफ़ाइल, अपने खाते, जमा, ऋण, लेनदेन और सक्षम लॉकर रिकॉर्ड।",
      primaryResponsibility: "स्व-सेवा दृश्यता, पूछताछ और व्यक्तिगत खाते की फॉलो-अप।",
      visibleHighlights: [
        "साइन-इन सदस्य के लिए बैलेंस, खाता गतिविधि, जमा स्थिति, ऋण सेवा और लेनदेन इतिहास देखें",
        "साझा डैशबोर्ड में स्वीकृत थीम और भाषा प्राथमिकताएं उपयोग करें",
        "संस्थान सेटअप, स्टाफ वर्कफ़्लो या अन्य सदस्यों के रिकॉर्ड के बिना सुरक्षित काम करें"
      ],
      adminTools: [
        "व्यक्तिगत बैंकिंग डैशबोर्ड और स्टेटस व्यू",
        "सक्षम सेल्फ-सर्विस मॉड्यूल तक भूमिका-आधारित पहुंच",
        "थीम और भाषा के लिए निजीकरण नियंत्रण"
      ],
      dailyWork: [
        "बैलेंस, स्टेटमेंट और खाता गतिविधि देखें",
        "जमा परिपक्वता और ऋण पुनर्भुगतान स्थिति ट्रैक करें",
        "हाल के लेनदेन और व्यक्तिगत सेवा गतिविधि जांचें",
        "जहां सेवा सक्षम हो वहां लॉकर उपयोग देखें"
      ],
      hiddenFromRole: [
        "ग्राहक मास्टर रखरखाव और स्टाफ सर्विसिंग टूल्स",
        "सोसाइटी-स्तरीय रिपोर्ट, कैश ऑपरेशन और इंस्ट्रूमेंट वर्कफ़्लो",
        "यूजर एडमिनिस्ट्रेशन, मॉनिटरिंग और संस्थान सेटअप",
        "बिलिंग, शाखा नीति और गवर्नेंस कंट्रोल"
      ],
      provisioningNote: "यह भूमिका उन अंतिम सदस्यों के लिए दें जिन्हें केवल अपना डेटा और सेल्फ-सर्विस बैंकिंग व्यू चाहिए।",
      primaryActionLabel: "क्लाइंट एक्सेस दें",
      secondaryActionLabel: "क्लाइंट साइन-इन"
    },
    agent: {
      navLabel: "एजेंट ऑपरेशंस",
      badge: "ऑपरेशंस एक्सेस",
      title: "एजेंट ऑपरेशंस वर्कस्पेस",
      subtitle: "फ्रंट-ऑफिस और फील्ड स्टाफ के लिए नियंत्रित ऑपरेशंस वर्कस्पेस, जहां वे रोज़मर्रा की सोसाइटी बैंकिंग गतिविधियां चला सकें।",
      audience: "एक सोसाइटी के लिए नियुक्त ऑपरेशनल स्टाफ, शाखा टीमें और फील्ड एजेंट।",
      dataScope: "सोसाइटी-स्तरीय ग्राहक सर्विसिंग, लेनदेन निष्पादन और दैनिक ऑपरेशनल वर्कफ़्लो।",
      primaryResponsibility: "ऑपरेशनल निष्पादन, ग्राहक सर्विसिंग और वर्कफ़्लो पूरा करना।",
      visibleHighlights: [
        "ग्राहक ऑनबोर्डिंग, KYC समीक्षा, खाता खोलना, जमा, ऋण और रोज़मर्रा के लेनदेन संभालें",
        "कैशबुक, क्लियरिंग, डिमांड ड्राफ्ट, इंस्ट्रूमेंट, लॉकर सर्विसिंग और ऑपरेशनल रिपोर्टिंग चलाएं",
        "एक असाइन संस्था के भीतर काम करें, बिना गवर्नेंस या बिलिंग कंट्रोल के"
      ],
      adminTools: [
        "ग्राहक और खाता सर्विसिंग वर्कफ़्लो",
        "कैशबुक, इंस्ट्रूमेंट और सहायक ऑपरेशंस हैंडलिंग",
        "सोसाइटी-स्तरीय ऑपरेशनल रिपोर्ट और अपवाद फॉलो-अप"
      ],
      dailyWork: [
        "ग्राहक रिकॉर्ड बनाएं और बनाए रखें",
        "खाते, जमा और ऋण अनुरोध खोलें और सर्विस करें",
        "लेनदेन एंट्री, क्लियरिंग और इंस्ट्रूमेंट गतिविधि प्रोसेस करें",
        "ऑपरेशनल रिपोर्ट और कलेक्शन-संबंधित कार्य चलाएं"
      ],
      hiddenFromRole: [
        "संस्थान प्रोफ़ाइल, बिलिंग और शाखा नीति सेटअप",
        "सोसाइटी-स्तरीय यूजर एडमिनिस्ट्रेशन और रणनीतिक गवर्नेंस",
        "क्रॉस-सोसाइटी मॉनिटरिंग और प्लेटफ़ॉर्म-स्तरीय कंट्रोल",
        "असाइन सोसाइटी से बाहर पोर्टफोलियो अनुमोदन"
      ],
      provisioningNote: "यह भूमिका उन स्टाफ को दें जो सोसाइटी ऑपरेशन चलाते हैं लेकिन संस्थान-स्तरीय सेटअप नियंत्रित नहीं करना चाहिए।",
      primaryActionLabel: "एजेंट एक्सेस दें",
      secondaryActionLabel: "एजेंट साइन-इन"
    },
    "society-admin": {
      navLabel: "सोसाइटी प्रशासन",
      badge: "संस्थान नियंत्रण",
      title: "सोसाइटी प्रशासन वर्कस्पेस",
      subtitle: "सोसाइटी नेतृत्व के लिए पूर्ण संस्थान नियंत्रण सतह, जिसमें प्रोफ़ाइल प्रबंधन, शाखा सेटअप, ऑपरेशन, रिपोर्टिंग और गवर्नेंस शामिल हैं।",
      audience: "एक संस्था के लिए जिम्मेदार सोसाइटी एडमिन, प्रबंधन उपयोगकर्ता और सुपर यूजर।",
      dataScope: "एकल सोसाइटी में ऑपरेशनल, प्रशासनिक और मॉनिटरिंग कार्यों पर पूर्ण दृश्यता।",
      primaryResponsibility: "संस्थान कॉन्फ़िगरेशन, ऑपरेशनल निगरानी और आंतरिक गवर्नेंस।",
      visibleHighlights: [
        "संस्थान मास्टर डेटा, अनुपालन रिकॉर्ड, बिलिंग विवरण और शाखा कॉन्फ़िगरेशन बनाए रखें",
        "सोसाइटी के सभी ऑपरेशनल मॉड्यूल, रिपोर्ट, यूजर और मॉनिटरिंग व्यू देखें",
        "एक संस्था को पूरी तरह नियंत्रित करें, बिना क्रॉस-सोसाइटी प्लेटफ़ॉर्म गवर्नेंस के"
      ],
      adminTools: [
        "संस्थान प्रोफ़ाइल और सोसाइटी मास्टर कॉन्फ़िगरेशन",
        "शाखा सेटअप, प्रशासनिक टूल्स और सेवा नियंत्रण",
        "वर्तमान सोसाइटी में यूजर दृश्यता, रिपोर्ट और मॉनिटरिंग"
      ],
      dailyWork: [
        "संस्थान पहचान, बिलिंग और अनुपालन सेटिंग बनाए रखें",
        "शाखाएं, सेवा उपलब्धता और प्रशासनिक नियंत्रण कॉन्फ़िगर करें",
        "ऑपरेशनल रिपोर्ट, मॉनिटरिंग और यूजर गतिविधि की समीक्षा करें",
        "सोसाइटी के अंदर स्टाफ और सदस्य वर्कस्पेस की देखरेख करें"
      ],
      hiddenFromRole: [
        "क्रॉस-सोसाइटी अनुमोदन और पोर्टफोलियो गवर्नेंस",
        "असाइन संस्था के बाहर ग्लोबल प्लेटफ़ॉर्म कॉन्फ़िगरेशन",
        "मल्टी-टेनेंट मॉनिटरिंग निर्णय जो प्लेटफ़ॉर्म एडमिन के लिए आरक्षित हैं"
      ],
      provisioningNote: "यह भूमिका उन संस्थान मालिकों और एडमिन को दें जो एक सोसाइटी के लिए एंड-टू-एंड जिम्मेदार हैं।",
      primaryActionLabel: "सोसाइटी एक्सेस दें",
      secondaryActionLabel: "सोसाइटी एडमिन साइन-इन"
    },
    "platform-admin": {
      navLabel: "प्लेटफ़ॉर्म गवर्नेंस",
      badge: "एंटरप्राइज़ नियंत्रण",
      title: "प्लेटफ़ॉर्म गवर्नेंस वर्कस्पेस",
      subtitle: "प्लेटफ़ॉर्म ऑपरेटरों के लिए केंद्रीकृत गवर्नेंस वर्कस्पेस, जहां वे सोसाइटी ऑनबोर्डिंग, एक्सेस कंट्रोल, मॉनिटरिंग और रिपोर्टिंग संभालते हैं।",
      audience: "पूरे मल्टी-सोसाइटी डिप्लॉयमेंट के लिए जिम्मेदार प्लेटफ़ॉर्म सुपर एडमिन।",
      dataScope: "गवर्नेंस, अनुमोदन, यूजर निगरानी और एग्जीक्यूटिव रिपोर्टिंग के लिए क्रॉस-सोसाइटी दृश्यता।",
      primaryResponsibility: "पोर्टफोलियो-स्तरीय गवर्नेंस, निगरानी और प्लेटफ़ॉर्म स्वास्थ्य।",
      visibleHighlights: [
        "पूरे प्लेटफ़ॉर्म पोर्टफोलियो में सोसाइटी को स्वीकृत, निलंबित और सुपरवाइज़ करें",
        "एग्जीक्यूटिव रिपोर्ट, मॉनिटरिंग डैशबोर्ड और प्लेटफ़ॉर्म-स्तरीय यूजर विज़िबिलिटी देखें",
        "व्यक्तिगत सोसाइटी सेटअप से ऊपर काम करें, बिना सदस्य-स्तरीय या शाखा-स्तरीय लेनदेन एंट्री के"
      ],
      adminTools: [
        "सोसाइटी ऑनबोर्डिंग, एक्सेस कंट्रोल और लाइफसाइकिल निर्णय",
        "प्लेटफ़ॉर्म-स्तरीय मॉनिटरिंग, रिपोर्टिंग और स्वास्थ्य समीक्षा",
        "ग्लोबल यूजर डायरेक्टरी दृश्यता और गवर्नेंस सपोर्ट"
      ],
      dailyWork: [
        "सोसाइटी स्वीकृत या निलंबित करें और ऑनबोर्डिंग तैयारी की समीक्षा करें",
        "संस्थाओं में ऑपरेशनल स्वास्थ्य और प्रदर्शन ट्रैक करें",
        "यूजर वितरण, एक्सेस स्थिति और एग्जीक्यूटिव रिपोर्ट देखें",
        "पोर्टफोलियो-स्तरीय गवर्नेंस और अनुपालन निर्णय समन्वित करें"
      ],
      hiddenFromRole: [
        "सोसाइटी-स्तरीय डे-बुक और शाखा सर्विसिंग वर्कफ़्लो",
        "संस्थान-विशेष सेटअप जो सोसाइटी एडमिन के स्वामित्व में है",
        "सदस्य सेल्फ-सर्विस गतिविधि और फ्रंट-ऑफिस लेनदेन हैंडलिंग"
      ],
      provisioningNote: "यह भूमिका केवल केंद्रीय प्लेटफ़ॉर्म ऑपरेटरों के लिए दें जो कई सोसाइटी पर गवर्नेंस संभालते हैं।",
      primaryActionLabel: "प्लेटफ़ॉर्म एडमिन साइन-इन",
      secondaryActionLabel: "वर्कस्पेस ओवरव्यू देखें"
    }
  },
  mr: {
    client: {
      navLabel: "क्लायंट बँकिंग",
      badge: "सदस्य प्रवेश",
      title: "क्लायंट बँकिंग वर्कस्पेस",
      subtitle: "सदस्यांसाठी सुरक्षित सेल्फ-सर्व्हिस वर्कस्पेस, जिथे ते आपली खाती, ठेवी, कर्जे आणि सेवा हालचाल पाहू शकतात.",
      audience: "फक्त स्वतःच्या बँकिंग नात्यावर काम करणारे सदस्य आणि ग्राहक.",
      dataScope: "वैयक्तिक प्रोफाइल, स्वतःची खाती, ठेवी, कर्जे, व्यवहार आणि सक्षम लॉकर नोंदी.",
      primaryResponsibility: "स्व-सेवा दृश्यमानता, चौकशी आणि वैयक्तिक खात्यांचा फॉलो-अप.",
      visibleHighlights: [
        "साइन-इन सदस्यासाठी बॅलन्स, खाते हालचाल, ठेव स्थिती, कर्ज सेवा आणि व्यवहार इतिहास पाहा",
        "सामायिक डॅशबोर्डवर मान्य थीम आणि भाषा प्राधान्ये वापरा",
        "संस्था सेटअप, स्टाफ वर्कफ्लो किंवा इतर सदस्यांच्या नोंदींशिवाय सुरक्षितपणे काम करा"
      ],
      adminTools: [
        "वैयक्तिक बँकिंग डॅशबोर्ड आणि स्टेटस दृश्ये",
        "सक्षम सेल्फ-सर्व्हिस मॉड्यूल्ससाठी भूमिका-आधारित प्रवेश",
        "थीम आणि भाषेसाठी वैयक्तिकरण नियंत्रण"
      ],
      dailyWork: [
        "बॅलन्स, स्टेटमेंट आणि खाते हालचाल तपासा",
        "ठेव परिपक्वता आणि कर्ज परतफेड स्थिती ट्रॅक करा",
        "अलीकडील व्यवहार आणि वैयक्तिक सेवा हालचाल पाहा",
        "सेवा सक्षम असल्यास लॉकर वापरावर नजर ठेवा"
      ],
      hiddenFromRole: [
        "ग्राहक मास्टर देखभाल आणि स्टाफ सर्व्हिसिंग साधने",
        "सोसायटी-स्तरीय रिपोर्ट्स, कॅश ऑपरेशन्स आणि इन्स्ट्रुमेंट वर्कफ्लो",
        "युजर प्रशासन, मॉनिटरिंग आणि संस्था सेटअप",
        "बिलिंग, शाखा धोरण आणि गव्हर्नन्स नियंत्रण"
      ],
      provisioningNote: "ही भूमिका त्या अंतिम सदस्यांसाठी द्या ज्यांना फक्त स्वतःचा डेटा आणि सेल्फ-सर्व्हिस बँकिंग दृश्ये हवी आहेत.",
      primaryActionLabel: "क्लायंट प्रवेश द्या",
      secondaryActionLabel: "क्लायंट साइन-इन"
    },
    agent: {
      navLabel: "एजंट ऑपरेशन्स",
      badge: "ऑपरेशन्स प्रवेश",
      title: "एजंट ऑपरेशन्स वर्कस्पेस",
      subtitle: "फ्रंट-ऑफिस आणि फील्ड स्टाफसाठी नियंत्रित ऑपरेशन्स वर्कस्पेस, जिथे ते दैनंदिन सोसायटी बँकिंग कामे चालवू शकतात.",
      audience: "एका सोसायटीला नियुक्त ऑपरेशनल स्टाफ, शाखा टीम्स आणि फील्ड एजंट्स.",
      dataScope: "सोसायटी-स्तरीय ग्राहक सेवा, व्यवहार अंमलबजावणी आणि दैनंदिन ऑपरेशनल वर्कफ्लो.",
      primaryResponsibility: "ऑपरेशनल अंमलबजावणी, ग्राहक सेवा आणि वर्कफ्लो पूर्ण करणे.",
      visibleHighlights: [
        "ग्राहक ऑनबोर्डिंग, KYC पुनरावलोकन, खाते उघडणे, ठेवी, कर्जे आणि दैनंदिन व्यवहार हाताळा",
        "कॅशबुक, क्लिअरिंग, डिमांड ड्राफ्ट, इन्स्ट्रुमेंट, लॉकर सेवा आणि ऑपरेशनल रिपोर्टिंग चालवा",
        "फक्त नियुक्त संस्थेमध्ये काम करा, गव्हर्नन्स किंवा बिलिंग नियंत्रणांशिवाय"
      ],
      adminTools: [
        "ग्राहक आणि खाते सेवा वर्कफ्लो",
        "कॅशबुक, इन्स्ट्रुमेंट्स आणि सहाय्यित ऑपरेशन्स हाताळणी",
        "सोसायटी-स्तरीय ऑपरेशनल रिपोर्ट्स आणि अपवाद फॉलो-अप"
      ],
      dailyWork: [
        "ग्राहक नोंदी तयार करा आणि सांभाळा",
        "खाती, ठेवी आणि कर्ज विनंत्या उघडा आणि सेवा द्या",
        "व्यवहार नोंदी, क्लिअरिंग आणि इन्स्ट्रुमेंट हालचाल प्रक्रिया करा",
        "ऑपरेशनल रिपोर्ट्स आणि कलेक्शन-संबंधित कामे चालवा"
      ],
      hiddenFromRole: [
        "संस्था प्रोफाइल, बिलिंग आणि शाखा धोरण सेटअप",
        "सोसायटी-स्तरीय युजर प्रशासन आणि धोरणात्मक गव्हर्नन्स",
        "क्रॉस-सोसायटी मॉनिटरिंग आणि प्लॅटफॉर्म-स्तरीय नियंत्रण",
        "नियुक्त सोसायटीबाहेरील पोर्टफोलिओ मंजुरी"
      ],
      provisioningNote: "ही भूमिका त्या स्टाफसाठी द्या जे सोसायटी ऑपरेशन्स चालवतात पण संस्था-स्तरीय सेटअप नियंत्रित करू नयेत.",
      primaryActionLabel: "एजंट प्रवेश द्या",
      secondaryActionLabel: "एजंट साइन-इन"
    },
    "society-admin": {
      navLabel: "सोसायटी प्रशासन",
      badge: "संस्था नियंत्रण",
      title: "सोसायटी प्रशासन वर्कस्पेस",
      subtitle: "सोसायटी नेतृत्वासाठी पूर्ण संस्था नियंत्रण कार्यक्षेत्र, ज्यात प्रोफाइल व्यवस्थापन, शाखा सेटअप, ऑपरेशन्स, रिपोर्टिंग आणि गव्हर्नन्स समाविष्ट आहे.",
      audience: "एका संस्थेसाठी जबाबदार सोसायटी अॅडमिन, व्यवस्थापन वापरकर्ते आणि सुपर युजर्स.",
      dataScope: "एका सोसायटीमधील ऑपरेशनल, प्रशासनिक आणि मॉनिटरिंग कार्यांवर पूर्ण दृश्यमानता.",
      primaryResponsibility: "संस्था कॉन्फिगरेशन, ऑपरेशनल देखरेख आणि अंतर्गत गव्हर्नन्स.",
      visibleHighlights: [
        "संस्था मास्टर डेटा, अनुपालन नोंदी, बिलिंग तपशील आणि शाखा कॉन्फिगरेशन जतन करा",
        "सोसायटीचे सर्व ऑपरेशनल मॉड्यूल्स, रिपोर्ट्स, युजर्स आणि मॉनिटरिंग दृश्ये पाहा",
        "क्रॉस-सोसायटी प्लॅटफॉर्म गव्हर्नन्सशिवाय एका संस्थेवर पूर्ण नियंत्रण ठेवा"
      ],
      adminTools: [
        "संस्था प्रोफाइल आणि सोसायटी मास्टर कॉन्फिगरेशन",
        "शाखा सेटअप, प्रशासनिक साधने आणि सेवा नियंत्रण",
        "सध्याच्या सोसायटीतील युजर दृश्यमानता, रिपोर्ट्स आणि मॉनिटरिंग"
      ],
      dailyWork: [
        "संस्थेची ओळख, बिलिंग आणि अनुपालन सेटिंग जतन करा",
        "शाखा, सेवा उपलब्धता आणि प्रशासनिक नियंत्रण कॉन्फिगर करा",
        "ऑपरेशनल रिपोर्ट्स, मॉनिटरिंग आणि युजर हालचाली तपासा",
        "सोसायटीतील स्टाफ आणि सदस्य वर्कस्पेसेसचे पर्यवेक्षण करा"
      ],
      hiddenFromRole: [
        "क्रॉस-सोसायटी मंजुरी आणि पोर्टफोलिओ गव्हर्नन्स",
        "नियुक्त संस्थेबाहेरील ग्लोबल प्लॅटफॉर्म कॉन्फिगरेशन",
        "प्लॅटफॉर्म प्रशासनासाठी राखीव मल्टी-टेनेन्ट मॉनिटरिंग निर्णय"
      ],
      provisioningNote: "ही भूमिका त्या संस्था मालकांना आणि अॅडमिनना द्या जे एका सोसायटीसाठी एंड-टू-एंड जबाबदार आहेत.",
      primaryActionLabel: "सोसायटी प्रवेश द्या",
      secondaryActionLabel: "सोसायटी अॅडमिन साइन-इन"
    },
    "platform-admin": {
      navLabel: "प्लॅटफॉर्म गव्हर्नन्स",
      badge: "एंटरप्राइझ नियंत्रण",
      title: "प्लॅटफॉर्म गव्हर्नन्स वर्कस्पेस",
      subtitle: "प्लॅटफॉर्म ऑपरेटरसाठी केंद्रीकृत गव्हर्नन्स वर्कस्पेस, जिथे ते सोसायटी ऑनबोर्डिंग, प्रवेश नियंत्रण, मॉनिटरिंग आणि रिपोर्टिंग हाताळतात.",
      audience: "संपूर्ण मल्टी-सोसायटी डिप्लॉयमेंटसाठी जबाबदार प्लॅटफॉर्म सुपर अॅडमिन.",
      dataScope: "गव्हर्नन्स, मंजुरी, युजर देखरेख आणि एक्झिक्युटिव्ह रिपोर्टिंगसाठी क्रॉस-सोसायटी दृश्यमानता.",
      primaryResponsibility: "पोर्टफोलिओ-स्तरीय गव्हर्नन्स, देखरेख आणि प्लॅटफॉर्म आरोग्य.",
      visibleHighlights: [
        "पूर्ण प्लॅटफॉर्म पोर्टफोलिओमध्ये सोसायट्या मंजूर करा, निलंबित करा आणि पर्यवेक्षण करा",
        "एक्झिक्युटिव्ह रिपोर्ट्स, मॉनिटरिंग डॅशबोर्ड्स आणि प्लॅटफॉर्म-स्तरीय युजर दृश्यमानता तपासा",
        "व्यक्तिगत सोसायटी सेटअपच्या वर काम करा, सदस्य-स्तरीय किंवा शाखा-स्तरीय व्यवहार नोंदींशिवाय"
      ],
      adminTools: [
        "सोसायटी ऑनबोर्डिंग, प्रवेश नियंत्रण आणि लाइफसायकल निर्णय",
        "प्लॅटफॉर्म-स्तरीय मॉनिटरिंग, रिपोर्टिंग आणि आरोग्य पुनरावलोकन",
        "ग्लोबल युजर डायरेक्टरी दृश्यमानता आणि गव्हर्नन्स समर्थन"
      ],
      dailyWork: [
        "सोसायट्या मंजूर किंवा निलंबित करा आणि ऑनबोर्डिंग तयारी तपासा",
        "संस्थांमधील ऑपरेशनल आरोग्य आणि कामगिरी ट्रॅक करा",
        "युजर वितरण, प्रवेश स्थिती आणि एक्झिक्युटिव्ह रिपोर्ट्स पाहा",
        "पोर्टफोलिओ-स्तरीय गव्हर्नन्स आणि अनुपालन निर्णय समन्वयित करा"
      ],
      hiddenFromRole: [
        "सोसायटी-स्थानिक डे-बुक आणि शाखा सर्व्हिसिंग वर्कफ्लो",
        "सोसायटी अॅडमिनच्या मालकीचे संस्था-विशिष्ट सेटअप",
        "सदस्य सेल्फ-सर्व्हिस हालचाल आणि फ्रंट-ऑफिस व्यवहार हाताळणी"
      ],
      provisioningNote: "ही भूमिका फक्त त्या केंद्रीय प्लॅटफॉर्म ऑपरेटरसाठी द्या जे अनेक सोसायट्यांवरील गव्हर्नन्स हाताळतात.",
      primaryActionLabel: "प्लॅटफॉर्म अॅडमिन साइन-इन",
      secondaryActionLabel: "वर्कस्पेस आढावा पहा"
    }
  }
};

const workspaceUiCopy: Record<AppLocale, WorkspaceUiCopy> = {
  en: {
    overviewBadge: "Access Architecture",
    overviewTitle: "Role-Based Workspace Architecture",
    overviewSubtitle:
      "Review the production access model for members, operational staff, society administrators, and platform governance teams before onboarding or deployment.",
    statRoleProfilesTitle: "Role Profiles",
    statRoleProfilesCaption: "Distinct workspace definitions with controlled access boundaries",
    statModuleCoverageTitle: "Module Coverage",
    statModuleCoverageCaption: "Operational banking modules mapped through role-based authorization",
    statProvisioningTitle: "Provisioning Model",
    statProvisioningValue: "Least Privilege",
    statProvisioningCaption: "Each role receives only the modules and controls required for its scope",
    homeSectionTitle: "Role-Based Workspaces",
    homeSectionSubtitle:
      "Clients, agents, society admins, and platform admins each get a different surface so users only see the tools they should actually operate.",
    reviewRoleButton: "View Role",
    cardAudienceLabel: "Audience",
    cardScopeLabel: "Scope",
    cardProvisioningLabel: "Provisioning note",
    cardKeyModulesLabel: "Key modules",
    roleProfileOverline: "Role Profile",
    roleProfileTitle: "Business Scope And Access Boundary",
    audienceLabel: "Audience",
    dataScopeLabel: "Data scope",
    primaryResponsibilityLabel: "Primary responsibility",
    operatingAuthorityOverline: "Operating Authority",
    operatingAuthorityTitle: "Administrative Tools And Controlled Actions",
    modulePortfolioOverline: "Module Portfolio",
    modulePortfolioTitle: "Authorized Banking Modules",
    operatingModelOverline: "Operating Model",
    operatingModelTitle: "Typical Responsibilities",
    typicalResponsibilitiesTitle: "Typical Responsibilities",
    restrictedCapabilitiesTitle: "Restricted Capabilities",
    restrictedModuleFamiliesLabel: "Restricted module families",
    provisioningRecommendationOverline: "Provisioning Recommendation",
    provisioningRecommendationTitle: "Assign The Right Workspace From Day One",
    provisioningRecommendationBodySuffix: "Use the corresponding sign-in or onboarding path so each user sees only the functions appropriate to their role.",
    cardAuthorizedModules: (count) => `${count} authorized modules`,
    cardRestrictedCapabilities: (count) => `${count} restricted capabilities`,
    cardModules: (count) => `${count} modules`,
    moduleApiCount: (count) => `${count} APIs`
  },
  hi: {
    overviewBadge: "एक्सेस आर्किटेक्चर",
    overviewTitle: "भूमिका-आधारित वर्कस्पेस आर्किटेक्चर",
    overviewSubtitle: "ऑनबोर्डिंग या डिप्लॉयमेंट से पहले सदस्य, ऑपरेशनल स्टाफ, सोसाइटी एडमिन और प्लेटफ़ॉर्म गवर्नेंस टीमों के लिए एक्सेस मॉडल देखें।",
    statRoleProfilesTitle: "रोल प्रोफ़ाइल",
    statRoleProfilesCaption: "नियंत्रित एक्सेस सीमाओं के साथ अलग-अलग वर्कस्पेस परिभाषाएं",
    statModuleCoverageTitle: "मॉड्यूल कवरेज",
    statModuleCoverageCaption: "भूमिका-आधारित अनुमति के साथ मैप किए गए बैंकिंग मॉड्यूल",
    statProvisioningTitle: "प्रोविजनिंग मॉडल",
    statProvisioningValue: "न्यूनतम एक्सेस",
    statProvisioningCaption: "हर भूमिका को केवल उसके काम के लिए जरूरी मॉड्यूल और कंट्रोल दिए जाते हैं",
    homeSectionTitle: "भूमिका-आधारित वर्कस्पेस",
    homeSectionSubtitle: "क्लाइंट, एजेंट, सोसाइटी एडमिन और प्लेटफ़ॉर्म एडमिन को अलग-अलग कार्यक्षेत्र मिलते हैं ताकि हर उपयोगकर्ता केवल वही टूल देखे जो उसे चलाने चाहिए।",
    reviewRoleButton: "भूमिका देखें",
    cardAudienceLabel: "उपयोगकर्ता",
    cardScopeLabel: "स्कोप",
    cardProvisioningLabel: "प्रोविजनिंग नोट",
    cardKeyModulesLabel: "मुख्य मॉड्यूल",
    roleProfileOverline: "रोल प्रोफ़ाइल",
    roleProfileTitle: "व्यावसायिक स्कोप और एक्सेस सीमा",
    audienceLabel: "उपयोगकर्ता",
    dataScopeLabel: "डेटा स्कोप",
    primaryResponsibilityLabel: "मुख्य जिम्मेदारी",
    operatingAuthorityOverline: "ऑपरेटिंग अधिकार",
    operatingAuthorityTitle: "एडमिन टूल्स और नियंत्रित क्रियाएं",
    modulePortfolioOverline: "मॉड्यूल पोर्टफोलियो",
    modulePortfolioTitle: "अनुमत बैंकिंग मॉड्यूल",
    operatingModelOverline: "ऑपरेटिंग मॉडल",
    operatingModelTitle: "सामान्य जिम्मेदारियां",
    typicalResponsibilitiesTitle: "सामान्य जिम्मेदारियां",
    restrictedCapabilitiesTitle: "प्रतिबंधित क्षमताएं",
    restrictedModuleFamiliesLabel: "प्रतिबंधित मॉड्यूल समूह",
    provisioningRecommendationOverline: "प्रोविजनिंग सिफारिश",
    provisioningRecommendationTitle: "पहले दिन से सही वर्कस्पेस दें",
    provisioningRecommendationBodySuffix: "उपयुक्त साइन-इन या ऑनबोर्डिंग पथ चुनें ताकि हर उपयोगकर्ता केवल अपनी भूमिका के अनुसार कार्य देखे।",
    cardAuthorizedModules: (count) => `${count} अनुमत मॉड्यूल`,
    cardRestrictedCapabilities: (count) => `${count} प्रतिबंधित क्षमताएं`,
    cardModules: (count) => `${count} मॉड्यूल`,
    moduleApiCount: (count) => `${count} API`
  },
  mr: {
    overviewBadge: "ॲक्सेस आर्किटेक्चर",
    overviewTitle: "भूमिका-आधारित वर्कस्पेस आर्किटेक्चर",
    overviewSubtitle: "ऑनबोर्डिंग किंवा डिप्लॉयमेंटपूर्वी सदस्य, ऑपरेशनल स्टाफ, सोसायटी अॅडमिन आणि प्लॅटफॉर्म गव्हर्नन्स टीमसाठी प्रवेश मॉडेल पाहा.",
    statRoleProfilesTitle: "रोल प्रोफाइल्स",
    statRoleProfilesCaption: "नियंत्रित प्रवेश मर्यादांसह वेगवेगळ्या वर्कस्पेस परिभाषा",
    statModuleCoverageTitle: "मॉड्यूल कव्हरेज",
    statModuleCoverageCaption: "भूमिका-आधारित अधिकृततेद्वारे मॅप केलेले बँकिंग मॉड्यूल्स",
    statProvisioningTitle: "प्रोव्हिजनिंग मॉडेल",
    statProvisioningValue: "किमान प्रवेश",
    statProvisioningCaption: "प्रत्येक भूमिकेला तिच्या कामासाठी आवश्यक तेवढेच मॉड्यूल्स आणि नियंत्रण मिळतात",
    homeSectionTitle: "भूमिका-आधारित वर्कस्पेसेस",
    homeSectionSubtitle: "क्लायंट, एजंट, सोसायटी अॅडमिन आणि प्लॅटफॉर्म अॅडमिन यांना वेगवेगळे कार्यक्षेत्र मिळते, त्यामुळे प्रत्येक वापरकर्त्याला फक्त त्याने वापरायची साधनेच दिसतात.",
    reviewRoleButton: "भूमिका पहा",
    cardAudienceLabel: "वापरकर्ता गट",
    cardScopeLabel: "स्कोप",
    cardProvisioningLabel: "प्रोव्हिजनिंग नोंद",
    cardKeyModulesLabel: "मुख्य मॉड्यूल्स",
    roleProfileOverline: "रोल प्रोफाइल",
    roleProfileTitle: "व्यावसायिक स्कोप आणि प्रवेश मर्यादा",
    audienceLabel: "वापरकर्ता गट",
    dataScopeLabel: "डेटा स्कोप",
    primaryResponsibilityLabel: "मुख्य जबाबदारी",
    operatingAuthorityOverline: "ऑपरेटिंग अधिकार",
    operatingAuthorityTitle: "प्रशासनिक साधने आणि नियंत्रित कृती",
    modulePortfolioOverline: "मॉड्यूल पोर्टफोलिओ",
    modulePortfolioTitle: "अधिकृत बँकिंग मॉड्यूल्स",
    operatingModelOverline: "ऑपरेटिंग मॉडेल",
    operatingModelTitle: "नेहमीच्या जबाबदाऱ्या",
    typicalResponsibilitiesTitle: "नेहमीच्या जबाबदाऱ्या",
    restrictedCapabilitiesTitle: "मर्यादित क्षमता",
    restrictedModuleFamiliesLabel: "मर्यादित मॉड्यूल समूह",
    provisioningRecommendationOverline: "प्रोव्हिजनिंग शिफारस",
    provisioningRecommendationTitle: "पहिल्या दिवसापासून योग्य वर्कस्पेस द्या",
    provisioningRecommendationBodySuffix: "योग्य साइन-इन किंवा ऑनबोर्डिंग मार्ग वापरा, जेणेकरून प्रत्येक वापरकर्त्याला त्याच्या भूमिकेनुसारच फंक्शन्स दिसतील.",
    cardAuthorizedModules: (count) => `${count} अधिकृत मॉड्यूल्स`,
    cardRestrictedCapabilities: (count) => `${count} मर्यादित क्षमता`,
    cardModules: (count) => `${count} मॉड्यूल्स`,
    moduleApiCount: (count) => `${count} API`
  }
};

function applyLocalization(base: WorkspaceDefinition, locale: AppLocale): WorkspaceDefinition {
  const localized = localizedWorkspaceContent[locale]?.[base.slug];

  if (!localized) {
    return base;
  }

  return {
    ...base,
    ...localized,
    primaryAction: {
      ...base.primaryAction,
      label: localized.primaryActionLabel
    },
    secondaryAction: {
      ...base.secondaryAction,
      label: localized.secondaryActionLabel
    }
  };
}

export function getWorkspaceUiCopy(locale: AppLocale = defaultLocale) {
  return workspaceUiCopy[locale] ?? workspaceUiCopy[defaultLocale];
}

export function getWorkspaceDefinition(role: WorkspaceRoleSlug, locale: AppLocale = defaultLocale) {
  const base = workspaceDefinitions.find((item) => item.slug === role) ?? null;

  if (!base) {
    return null;
  }

  return applyLocalization(base, locale);
}

export function getWorkspaceDefinitions(locale: AppLocale = defaultLocale) {
  return workspaceDefinitions.map((workspace) => applyLocalization(workspace, locale));
}

export function getWorkspaceModulesByAccountType(accountType: AppAccountType): BankingModule[] {
  const allowed = new Set(getAllowedModuleSlugs(accountType));
  return modules.filter((module) => allowed.has(module.slug));
}

export function getWorkspaceModules(role: WorkspaceRoleSlug, locale: AppLocale = defaultLocale) {
  const definition = getWorkspaceDefinition(role, locale);
  if (!definition) {
    return [];
  }

  return getWorkspaceModulesByAccountType(definition.accountType).map((module) => localizeBankingModule(module, locale));
}

export function getRestrictedWorkspaceModules(role: WorkspaceRoleSlug, locale: AppLocale = defaultLocale) {
  const allowed = new Set(getWorkspaceModules(role, defaultLocale).map((module) => module.slug));
  return modules.filter((module) => !allowed.has(module.slug)).map((module) => localizeBankingModule(module, locale));
}
