import type { AppLocale } from "./translations";

type MarketingFeature = {
  title: string;
  description: string;
};

type HomePageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryAction: string;
  heroSecondaryAction: string;
  heroPanelTitle: string;
  heroPanelDescription: string;
  registerToast: string;
  loginToast: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: MarketingFeature[];
  capabilitiesTitle: string;
  capabilities: string[];
  freePlanFeatures: string[];
  premiumPlanFeatures: string[];
  premiumPriceFallback: string;
  premiumPerMonthSuffix: string;
  pricingSelection: (planLabel: string) => string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  ctaToast: string;
};

type FooterCopy = {
  aboutLabel: string;
  contactLabel: string;
  privacyLabel: string;
  termsLabel: string;
  advertisingLabel: string;
  summary: string;
  publicOperationsNote: string;
  workspaceOperationsNote: string;
  publicSupportNote: string;
  workspaceSupportNote: string;
  adsNotice: string;
};

type MarketingCopyBundle = {
  home: HomePageCopy;
  footer: FooterCopy;
};

const marketingCopy: Record<AppLocale, MarketingCopyBundle> = {
  en: {
    home: {
      heroBadge: "Society Savings Platform",
      heroTitle: "Modern Society Savings & Interest Tracking",
      heroDescription:
        "Collect savings, track interest, and manage member operations from one secure workspace. Built for societies and cooperative groups.",
      heroPrimaryAction: "Get Started Free",
      heroSecondaryAction: "Login",
      heroPanelTitle: "Everything your team needs",
      heroPanelDescription: "Built for members, field agents, and society administrators working from one trusted system.",
      registerToast: "Starting registration...",
      loginToast: "Redirecting to login...",
      featuresTitle: "Why Choose Infopath",
      featuresSubtitle: "Purpose-built for society collections with audit-ready security and role-based controls",
      features: [
        {
          title: "Secure & Compliant",
          description: "Role-based access controls and audit trails for enterprise compliance"
        },
        {
          title: "Smooth Collections",
          description: "Capture member contributions, track dues, and follow up pending payments"
        },
        {
          title: "Multi-Role Support",
          description: "Tailored workspaces for clients, agents, and administrators"
        },
        {
          title: "Real-time Reports",
          description: "Operational dashboards and monitoring for leadership visibility"
        }
      ],
      capabilitiesTitle: "Complete Operations Suite",
      capabilities: [
        "Member onboarding & verification",
        "Society membership and accounts",
        "Collections & interest tracking",
        "Payment requests & receipts",
        "Reports, statements, and exports",
        "Role-based access & approvals"
      ],
      freePlanFeatures: ["Core society workflows", "Standard support", "Ad-supported"],
      premiumPlanFeatures: ["Ad-free experience", "Priority support", "Advanced features"],
      premiumPriceFallback: "Monthly",
      premiumPerMonthSuffix: "/mo",
      pricingSelection: (planLabel) => `${planLabel} plan selected`,
      ctaTitle: "Ready to Streamline Society Savings?",
      ctaSubtitle: "Join societies running Infopath Savings",
      ctaButton: "Start Your Free Account",
      ctaToast: "Starting free account setup..."
    },
    footer: {
      aboutLabel: "About",
      contactLabel: "Contact",
      privacyLabel: "Privacy Policy",
      termsLabel: "Terms of Service",
      advertisingLabel: "Advertising Disclosure",
      summary: "Society savings workflows for members, agents, and administrators.",
      publicOperationsNote: "Frontend and API work together across onboarding, operations, monitoring, and reporting.",
      workspaceOperationsNote: "Operational workspaces remain role-based, secure, and ready for day-to-day public use.",
      publicSupportNote: "Support, product information, and policy guidance remain available across the public information pages.",
      workspaceSupportNote: "Support, policies, and onboarding guidance stay available through the public information pages at all times.",
      adsNotice:
        "Ads are shown for monetization. Please interact only when genuinely interested. Invalid traffic and forced clicks are not permitted."
    }
  },
  hi: {
    home: {
      heroBadge: "सोसाइटी सेविंग्स प्लेटफ़ॉर्म",
      heroTitle: "आधुनिक सोसाइटी सेविंग्स और ब्याज ट्रैकिंग",
      heroDescription:
        "एक सुरक्षित वर्कस्पेस से बचत संग्रहित करें, ब्याज ट्रैक करें, और सदस्य संचालन संभालें। यह सोसाइटी और सहकारी समूहों के लिए तैयार किया गया है।",
      heroPrimaryAction: "फ्री में शुरू करें",
      heroSecondaryAction: "लॉगिन",
      heroPanelTitle: "आपकी टीम के लिए ज़रूरी सब कुछ",
      heroPanelDescription: "सदस्यों, फील्ड एजेंटों और सोसाइटी प्रशासकों के लिए एक भरोसेमंद सिस्टम में तैयार।",
      registerToast: "रजिस्ट्रेशन शुरू हो रहा है...",
      loginToast: "लॉगिन पेज पर भेजा जा रहा है...",
      featuresTitle: "क्यों चुनें Infopath",
      featuresSubtitle: "सोसाइटी कलेक्शन के लिए विशेष रूप से बनाया गया, जिसमें ऑडिट-रेडी सुरक्षा और भूमिका-आधारित नियंत्रण हैं",
      features: [
        {
          title: "सुरक्षित और अनुपालन-उन्मुख",
          description: "एंटरप्राइज़ अनुपालन के लिए भूमिका-आधारित एक्सेस कंट्रोल और ऑडिट ट्रेल"
        },
        {
          title: "सुचारु कलेक्शंस",
          description: "सदस्य योगदान दर्ज करें, बकाया ट्रैक करें, और लंबित भुगतानों पर फॉलो-अप करें"
        },
        {
          title: "मल्टी-रोल सपोर्ट",
          description: "क्लाइंट, एजेंट और प्रशासकों के लिए अलग-अलग वर्कस्पेस"
        },
        {
          title: "रियल-टाइम रिपोर्ट्स",
          description: "लीडरशिप विज़िबिलिटी के लिए ऑपरेशनल डैशबोर्ड और मॉनिटरिंग"
        }
      ],
      capabilitiesTitle: "पूर्ण ऑपरेशन्स सूट",
      capabilities: [
        "सदस्य ऑनबोर्डिंग और सत्यापन",
        "सोसाइटी सदस्यता और खाते",
        "कलेक्शन और ब्याज ट्रैकिंग",
        "पेमेंट अनुरोध और रसीदें",
        "रिपोर्ट्स, स्टेटमेंट्स और एक्सपोर्ट",
        "भूमिका-आधारित एक्सेस और अप्रूवल"
      ],
      freePlanFeatures: ["मुख्य सोसाइटी वर्कफ़्लो", "स्टैंडर्ड सपोर्ट", "विज्ञापन समर्थित"],
      premiumPlanFeatures: ["विज्ञापन-मुक्त अनुभव", "प्राथमिक सपोर्ट", "उन्नत सुविधाएँ"],
      premiumPriceFallback: "मासिक",
      premiumPerMonthSuffix: "/माह",
      pricingSelection: (planLabel) => `${planLabel} प्लान चुना गया`,
      ctaTitle: "सोसाइटी सेविंग्स को सरल बनाने के लिए तैयार हैं?",
      ctaSubtitle: "उन सोसाइटी के साथ जुड़ें जो Infopath Savings चला रही हैं",
      ctaButton: "अपना फ्री अकाउंट शुरू करें",
      ctaToast: "फ्री अकाउंट सेटअप शुरू हो रहा है..."
    },
    footer: {
      aboutLabel: "हमारे बारे में",
      contactLabel: "संपर्क",
      privacyLabel: "गोपनीयता नीति",
      termsLabel: "सेवा की शर्तें",
      advertisingLabel: "विज्ञापन प्रकटीकरण",
      summary: "सदस्यों, एजेंटों और प्रशासकों के लिए सोसाइटी सेविंग्स वर्कफ़्लो।",
      publicOperationsNote: "फ्रंटएंड और API मिलकर ऑनबोर्डिंग, ऑपरेशन्स, मॉनिटरिंग और रिपोर्टिंग को सपोर्ट करते हैं।",
      workspaceOperationsNote: "ऑपरेशनल वर्कस्पेस भूमिका-आधारित, सुरक्षित और रोज़मर्रा के सार्वजनिक उपयोग के लिए तैयार हैं।",
      publicSupportNote: "सपोर्ट, उत्पाद जानकारी और नीति मार्गदर्शन सार्वजनिक सूचना पेजों पर उपलब्ध रहते हैं।",
      workspaceSupportNote: "सपोर्ट, नीतियाँ और ऑनबोर्डिंग मार्गदर्शन सार्वजनिक सूचना पेजों के माध्यम से हमेशा उपलब्ध रहते हैं।",
      adsNotice:
        "मॉनेटाइज़ेशन के लिए विज्ञापन दिखाए जाते हैं। कृपया तभी इंटरैक्ट करें जब आपकी वास्तविक रुचि हो। अमान्य ट्रैफ़िक और जबरन क्लिक अनुमत नहीं हैं।"
    }
  },
  mr: {
    home: {
      heroBadge: "सोसायटी सेव्हिंग्स प्लॅटफॉर्म",
      heroTitle: "आधुनिक सोसायटी सेव्हिंग्स आणि व्याज ट्रॅकिंग",
      heroDescription:
        "एकाच सुरक्षित वर्कस्पेसमधून बचत गोळा करा, व्याज ट्रॅक करा आणि सदस्य ऑपरेशन्स हाताळा. हे सोसायट्या आणि सहकारी गटांसाठी तयार केलेले आहे.",
      heroPrimaryAction: "फ्री सुरू करा",
      heroSecondaryAction: "लॉगिन",
      heroPanelTitle: "तुमच्या टीमसाठी आवश्यक सर्व काही",
      heroPanelDescription: "सदस्य, फील्ड एजंट आणि सोसायटी प्रशासकांसाठी एका विश्वासार्ह सिस्टममध्ये तयार केलेले.",
      registerToast: "नोंदणी सुरू होत आहे...",
      loginToast: "लॉगिन पानावर नेले जात आहे...",
      featuresTitle: "Infopath का निवडावे",
      featuresSubtitle: "ऑडिट-रेडी सुरक्षा आणि भूमिका-आधारित नियंत्रणांसह सोसायटी कलेक्शनसाठी खास तयार केलेले",
      features: [
        {
          title: "सुरक्षित आणि अनुरूप",
          description: "एंटरप्राइझ अनुपालनासाठी भूमिका-आधारित प्रवेश नियंत्रण आणि ऑडिट ट्रेल्स"
        },
        {
          title: "सुलभ कलेक्शन्स",
          description: "सदस्यांचे योगदान नोंदवा, थकबाकी ट्रॅक करा आणि प्रलंबित देयकांवर पाठपुरावा करा"
        },
        {
          title: "मल्टी-रोल सपोर्ट",
          description: "क्लायंट, एजंट आणि प्रशासकांसाठी वेगवेगळे वर्कस्पेसेस"
        },
        {
          title: "रिअल-टाइम रिपोर्ट्स",
          description: "नेतृत्वाच्या दृश्यमानतेसाठी ऑपरेशनल डॅशबोर्ड्स आणि मॉनिटरिंग"
        }
      ],
      capabilitiesTitle: "पूर्ण ऑपरेशन्स सूट",
      capabilities: [
        "सदस्य ऑनबोर्डिंग आणि पडताळणी",
        "सोसायटी सदस्यता आणि खाती",
        "कलेक्शन्स आणि व्याज ट्रॅकिंग",
        "पेमेंट विनंत्या आणि पावत्या",
        "रिपोर्ट्स, स्टेटमेंट्स आणि एक्सपोर्ट्स",
        "भूमिका-आधारित प्रवेश आणि मंजुरी"
      ],
      freePlanFeatures: ["मुख्य सोसायटी वर्कफ्लोज", "स्टँडर्ड सपोर्ट", "जाहिरात-समर्थित"],
      premiumPlanFeatures: ["जाहिरात-मुक्त अनुभव", "प्राधान्य सपोर्ट", "अॅडव्हान्स्ड फीचर्स"],
      premiumPriceFallback: "मासिक",
      premiumPerMonthSuffix: "/महिना",
      pricingSelection: (planLabel) => `${planLabel} प्लॅन निवडला गेला`,
      ctaTitle: "सोसायटी सेव्हिंग्स सुलभ करण्यास तयार आहात?",
      ctaSubtitle: "Infopath Savings वापरणाऱ्या सोसायट्यांमध्ये सहभागी व्हा",
      ctaButton: "तुमचे फ्री खाते सुरू करा",
      ctaToast: "फ्री खाते सेटअप सुरू होत आहे..."
    },
    footer: {
      aboutLabel: "माहिती",
      contactLabel: "संपर्क",
      privacyLabel: "गोपनीयता धोरण",
      termsLabel: "सेवेच्या अटी",
      advertisingLabel: "जाहिरात प्रकटीकरण",
      summary: "सदस्य, एजंट आणि प्रशासकांसाठी सोसायटी सेव्हिंग्स वर्कफ्लोज.",
      publicOperationsNote: "फ्रंटएंड आणि API एकत्र येऊन ऑनबोर्डिंग, ऑपरेशन्स, मॉनिटरिंग आणि रिपोर्टिंगला सपोर्ट करतात.",
      workspaceOperationsNote: "ऑपरेशनल वर्कस्पेसेस भूमिका-आधारित, सुरक्षित आणि दैनंदिन सार्वजनिक वापरासाठी तयार आहेत.",
      publicSupportNote: "सपोर्ट, उत्पादन माहिती आणि धोरण मार्गदर्शन सार्वजनिक माहिती पानांवर उपलब्ध राहतात.",
      workspaceSupportNote: "सपोर्ट, धोरणे आणि ऑनबोर्डिंग मार्गदर्शन सार्वजनिक माहिती पानांद्वारे नेहमी उपलब्ध राहते.",
      adsNotice:
        "मॉनेटायझेशनसाठी जाहिराती दाखवल्या जातात. कृपया खरोखर स्वारस्य असल्यासच परस्परसंवाद करा. अवैध ट्रॅफिक आणि जबरदस्तीचे क्लिक अनुमत नाहीत."
    }
  }
};

export function getHomePageCopy(locale: AppLocale) {
  return marketingCopy[locale]?.home ?? marketingCopy.en.home;
}

export function getFooterCopy(locale: AppLocale) {
  return marketingCopy[locale]?.footer ?? marketingCopy.en.footer;
}
