import type { AppLocale } from "./translations";
import { appBranding } from "@/shared/config/branding";

type AboutValueCard = {
  title: string;
  detail: string;
};

type AboutCopy = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  excellenceTitle: string;
  excellenceParagraphOne: string;
  excellenceParagraphTwo: string;
  snapshotTitle: string;
  snapshotItems: string[];
  valueCards: [AboutValueCard, AboutValueCard, AboutValueCard];
};

const aboutCopy: Record<AppLocale, AboutCopy> = {
  en: {
    heroBadge: "OUR MISSION AT INFOPATH",
    heroTitle: "Digital Sovereignty for Societies",
    heroDescription: `${appBranding.companyName} builds software that helps societies run structured savings collections, interest tracking, and reporting with disciplined, role-based workflows.`,
    excellenceTitle: "Institutional Excellence Delivered",
    excellenceParagraphOne: `${appBranding.productShortName} combines member onboarding, savings collections, interest tracking, and reporting into a unified executive surface. We believe that professional cooperative management requires more than spreadsheets; it requires auditable workflows and verified data.`,
    excellenceParagraphTwo:
      "The product supports clients, agents, and administrators with specialized tools, ensuring that every financial interaction is recorded and every institutional policy is enforced systematically.",
    snapshotTitle: "Platform Snapshot",
    snapshotItems: [
      "Hierarchical role-based access control",
      "Automated interest and dividend engines",
      "Real-time operational monitoring",
      "Verified institutional record keeping",
      "SaaS deployment for universal access"
    ],
    valueCards: [
      {
        title: "Operational Clarity",
        detail: "We design around real day-to-day society savings operations so teams can execute with fewer handoffs."
      },
      {
        title: "Cooperative Focus",
        detail: `${appBranding.productShortName} is built specifically for societies and cooperative groups, not generic enterprise workflows.`
      },
      {
        title: "Platform Scalability",
        detail: "Our architecture is structured for role-based workflows, auditable records, and repeatable operational quality across institutions."
      }
    ]
  },
  hi: {
    heroBadge: "इन्फोपाथ में हमारा मिशन",
    heroTitle: "सोसाइटियों के लिए डिजिटल स्वायत्तता",
    heroDescription: `${appBranding.companyName} ऐसा सॉफ्टवेयर बनाता है जो सोसाइटियों को संरचित बचत संग्रह, ब्याज ट्रैकिंग और रिपोर्टिंग को अनुशासित, भूमिका-आधारित कार्यप्रवाहों के साथ चलाने में मदद करता है।`,
    excellenceTitle: "संस्थागत उत्कृष्टता, व्यवस्थित रूप में",
    excellenceParagraphOne: `${appBranding.productShortName} सदस्य ऑनबोर्डिंग, बचत संग्रह, ब्याज ट्रैकिंग और रिपोर्टिंग को एकीकृत संचालन सतह में जोड़ता है। हमारा मानना है कि पेशेवर सहकारी प्रबंधन के लिए केवल स्प्रेडशीट पर्याप्त नहीं हैं; इसके लिए ऑडिट योग्य कार्यप्रवाह और सत्यापित डेटा आवश्यक है।`,
    excellenceParagraphTwo:
      "यह उत्पाद क्लाइंट, एजेंट और प्रशासकों के लिए विशेष उपकरण प्रदान करता है, जिससे हर वित्तीय गतिविधि दर्ज होती है और हर संस्थागत नीति का व्यवस्थित पालन सुनिश्चित होता है।",
    snapshotTitle: "प्लेटफ़ॉर्म झलक",
    snapshotItems: [
      "स्तरीय भूमिका-आधारित एक्सेस नियंत्रण",
      "स्वचालित ब्याज और लाभांश इंजन",
      "रियल-टाइम संचालन निगरानी",
      "सत्यापित संस्थागत रिकॉर्ड प्रबंधन",
      "सार्वभौमिक पहुँच के लिए SaaS परिनियोजन"
    ],
    valueCards: [
      {
        title: "संचालन में स्पष्टता",
        detail: "हम वास्तविक दैनिक सोसाइटी बचत संचालन को ध्यान में रखकर डिज़ाइन करते हैं, ताकि टीम कम हस्तांतरणों के साथ काम पूरा कर सके।"
      },
      {
        title: "सहकारी केंद्रित दृष्टि",
        detail: `${appBranding.productShortName} विशेष रूप से सोसाइटियों और सहकारी समूहों के लिए बनाया गया है, न कि सामान्य एंटरप्राइज कार्यप्रवाहों के लिए।`
      },
      {
        title: "प्लेटफ़ॉर्म की विस्तार क्षमता",
        detail: "हमारी आर्किटेक्चर भूमिका-आधारित कार्यप्रवाह, ऑडिट योग्य रिकॉर्ड और संस्थानों में दोहराने योग्य परिचालन गुणवत्ता के लिए तैयार की गई है।"
      }
    ]
  },
  mr: {
    heroBadge: "इन्फोपाथमधील आमचे ध्येय",
    heroTitle: "सोसायट्यांसाठी डिजिटल स्वायत्तता",
    heroDescription: `${appBranding.companyName} असे सॉफ्टवेअर तयार करते जे सोसायट्यांना संरचित बचत संकलन, व्याज ट्रॅकिंग आणि रिपोर्टिंग शिस्तबद्ध, भूमिका-आधारित कार्यप्रवाहांद्वारे चालविण्यास मदत करते.`,
    excellenceTitle: "संस्थात्मक उत्कृष्टता, प्रत्यक्ष वापरात",
    excellenceParagraphOne: `${appBranding.productShortName} सदस्य नोंदणी, बचत संकलन, व्याज ट्रॅकिंग आणि रिपोर्टिंग यांना एकसंध कार्यकारी पटलावर आणते. आमच्या मते व्यावसायिक सहकारी व्यवस्थापनासाठी फक्त स्प्रेडशीट पुरेसे नाही; त्यासाठी ऑडिटयोग्य कार्यप्रवाह आणि सत्यापित डेटा आवश्यक असतो.`,
    excellenceParagraphTwo:
      "हे उत्पादन क्लायंट, एजंट आणि प्रशासकांसाठी विशेष साधने पुरवते, ज्यामुळे प्रत्येक आर्थिक व्यवहार नोंदवला जातो आणि प्रत्येक संस्थात्मक धोरण पद्धतशीरपणे अंमलात येते.",
    snapshotTitle: "प्लॅटफॉर्म झलक",
    snapshotItems: [
      "स्तरबद्ध भूमिका-आधारित प्रवेश नियंत्रण",
      "स्वयंचलित व्याज आणि लाभांश इंजिन",
      "रिअल-टाइम ऑपरेशनल मॉनिटरिंग",
      "सत्यापित संस्थात्मक नोंद व्यवस्थापन",
      "सर्वांसाठी प्रवेशयोग्य SaaS तैनाती"
    ],
    valueCards: [
      {
        title: "कारभारातील स्पष्टता",
        detail: "आम्ही प्रत्यक्ष दैनंदिन सोसायटी बचत कार्यांभोवती डिझाइन करतो, ज्यामुळे टीम कमी हँडऑफसह काम पूर्ण करू शकते."
      },
      {
        title: "सहकारी दृष्टिकोन",
        detail: `${appBranding.productShortName} हे सर्वसाधारण एंटरप्राइज वर्कफ्लोसाठी नाही, तर खास सोसायट्या आणि सहकारी गटांसाठी तयार केले आहे.`
      },
      {
        title: "प्लॅटफॉर्मची स्केलेबिलिटी",
        detail: "आमची आर्किटेक्चर भूमिका-आधारित कार्यप्रवाह, ऑडिटयोग्य नोंदी आणि विविध संस्थांमध्ये सातत्यपूर्ण कार्यक्षमतेसाठी तयार केलेली आहे."
      }
    ]
  }
};

export function getAboutPageCopy(locale: AppLocale) {
  return aboutCopy[locale] ?? aboutCopy.en;
}
