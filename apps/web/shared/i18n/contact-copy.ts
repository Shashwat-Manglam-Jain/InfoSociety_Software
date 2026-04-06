import type { AppLocale } from "./translations";
import { appBranding } from "@/shared/config/branding";

type ContactMethodCopy = {
  title: string;
  detail: string;
  email: string;
  hours?: string;
  location?: string;
};

type ContactCopy = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  labels: {
    email: string;
    hours: string;
    location: string;
  };
  methods: [ContactMethodCopy, ContactMethodCopy, ContactMethodCopy];
  commitmentTitle: string;
  commitmentBody: string;
};

const supportEmail = "support@infopath.local";
const businessEmail = "business@infopath.local";
const adminEmail = "admin@infopath.local";

const contactCopy: Record<AppLocale, ContactCopy> = {
  en: {
    heroBadge: "REACH OUT TO US",
    heroTitle: "Get the Support You Need",
    heroDescription:
      "Whether you're a society owner looking to onboard or an agent requiring operational assistance, our team is ready to help.",
    labels: {
      email: "EMAIL",
      hours: "WORKING HOURS",
      location: "LOCATION"
    },
    methods: [
      {
        title: "General Support",
        detail: "Operational assistance and implementation support.",
        email: supportEmail,
        hours: "Mon - Sat, 9:30 AM - 6:30 PM"
      },
      {
        title: "Business & Sales",
        detail: "Enterprise onboarding and pricing inquiries.",
        email: businessEmail,
        hours: "Mon - Fri, 10:00 AM - 6:00 PM"
      },
      {
        title: "Corporate HQ",
        detail: `${appBranding.companyName} Society Operations`,
        location: "New Delhi, India",
        email: adminEmail
      }
    ],
    commitmentTitle: "Our Support Commitment",
    commitmentBody:
      "All requests are triaged by role impact and priority. For production-related inquiries, please ensure your society identifier and regional code are included in the subject line for faster processing."
  },
  hi: {
    heroBadge: "हमसे संपर्क करें",
    heroTitle: "आपको आवश्यक सहायता प्राप्त करें",
    heroDescription:
      "चाहे आप ऑनबोर्डिंग की तैयारी कर रहे सोसाइटी संचालक हों या संचालन सहायता चाहने वाले एजेंट, हमारी टीम आपकी मदद के लिए तैयार है।",
    labels: {
      email: "ईमेल",
      hours: "कार्य समय",
      location: "स्थान"
    },
    methods: [
      {
        title: "सामान्य सहायता",
        detail: "ऑपरेशनल सहायता और कार्यान्वयन सहयोग।",
        email: supportEmail,
        hours: "सोम - शनि, 9:30 AM - 6:30 PM"
      },
      {
        title: "व्यवसाय और बिक्री",
        detail: "एंटरप्राइज ऑनबोर्डिंग और प्राइसिंग संबंधी पूछताछ।",
        email: businessEmail,
        hours: "सोम - शुक्र, 10:00 AM - 6:00 PM"
      },
      {
        title: "कॉर्पोरेट मुख्यालय",
        detail: `${appBranding.companyName} सोसाइटी ऑपरेशंस`,
        location: "नई दिल्ली, भारत",
        email: adminEmail
      }
    ],
    commitmentTitle: "हमारी सहायता प्रतिबद्धता",
    commitmentBody:
      "सभी अनुरोधों को भूमिका-प्रभाव और प्राथमिकता के आधार पर क्रमबद्ध किया जाता है। उत्पादन-संबंधित प्रश्नों के लिए कृपया विषय पंक्ति में अपनी सोसाइटी पहचान और क्षेत्रीय कोड अवश्य जोड़ें, ताकि प्रक्रिया तेज हो सके।"
  },
  mr: {
    heroBadge: "आमच्याशी संपर्क साधा",
    heroTitle: "तुम्हाला हवी ती मदत मिळवा",
    heroDescription:
      "तुम्ही ऑनबोर्डिंगसाठी तयारी करणारे सोसायटी मालक असाल किंवा कार्यकारी मदत हवी असलेले एजंट, आमची टीम मदतीसाठी तयार आहे.",
    labels: {
      email: "ईमेल",
      hours: "कामकाजाची वेळ",
      location: "स्थान"
    },
    methods: [
      {
        title: "सामान्य सहाय्य",
        detail: "ऑपरेशनल मदत आणि अंमलबजावणी सहाय्य.",
        email: supportEmail,
        hours: "सोम - शनि, 9:30 AM - 6:30 PM"
      },
      {
        title: "व्यवसाय आणि विक्री",
        detail: "एंटरप्राइज ऑनबोर्डिंग आणि किंमतविषयक चौकशी.",
        email: businessEmail,
        hours: "सोम - शुक्र, 10:00 AM - 6:00 PM"
      },
      {
        title: "कॉर्पोरेट मुख्यालय",
        detail: `${appBranding.companyName} सोसायटी ऑपरेशन्स`,
        location: "नवी दिल्ली, भारत",
        email: adminEmail
      }
    ],
    commitmentTitle: "आमची सपोर्ट बांधिलकी",
    commitmentBody:
      "सर्व विनंत्या भूमिका-प्रभाव आणि प्राधान्य यानुसार वर्गीकृत केल्या जातात. प्रॉडक्शन-संबंधित चौकशीसाठी कृपया विषय ओळीत तुमचा सोसायटी आयडेंटिफायर आणि प्रादेशिक कोड नमूद करा, म्हणजे प्रक्रिया अधिक जलद होईल."
  }
};

export function getContactPageCopy(locale: AppLocale) {
  return contactCopy[locale] ?? contactCopy.en;
}
