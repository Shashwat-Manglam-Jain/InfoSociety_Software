export const localeOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" }
] as const;

export type AppLocale = (typeof localeOptions)[number]["code"];

export const defaultLocale: AppLocale = "en";

export const translationKeys = [
  "nav.home",
  "nav.plans",
  "nav.modules",
  "nav.about",
  "nav.contact",
  "nav.login",
  "nav.register",
  "nav.dashboard",
  "nav.theme",
  "nav.language",
  "nav.register.client",
  "nav.register.agent",
  "nav.register.society",
  "pricing.title",
  "pricing.subtitle",
  "pricing.free.title",
  "pricing.free.description",
  "pricing.premium.title",
  "pricing.premium.description",
  "pricing.recommended",
  "pricing.get_started",
  "register.plan.title",
  "register.plan.subtitle",
  "register.plan.free",
  "register.plan.premium",
  "register.plan.premium_note",
  "register.plan.payment_method",
  "register.plan.upgrade_pending",
  "settings.theme",
  "settings.language",
  "settings.light_mode",
  "settings.dark_mode"
] as const;

export type TranslationKey = (typeof translationKeys)[number];

type Translations = Record<TranslationKey, string>;

export const translations: Record<AppLocale, Translations> = {
  en: {
    "nav.home": "Home",
    "nav.plans": "Plans",
    "nav.modules": "Modules",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.dashboard": "Dashboard",
    "nav.theme": "Theme",
    "nav.language": "Language",
    "nav.register.client": "Register Client",
    "nav.register.agent": "Register Agent",
    "nav.register.society": "Register Society",
    "pricing.title": "Simple Pricing",
    "pricing.subtitle": "Start free, upgrade when you need premium features",
    "pricing.free.title": "Free",
    "pricing.free.description": "Perfect for getting started",
    "pricing.premium.title": "Premium",
    "pricing.premium.description": "For production societies",
    "pricing.recommended": "Recommended",
    "pricing.get_started": "Get Started",
    "register.plan.title": "Choose a Plan",
    "register.plan.subtitle": "Society plans apply monthly charges and remove ads.",
    "register.plan.free": "Common (Free)",
    "register.plan.premium": "Premium (Monthly)",
    "register.plan.premium_note": "Monthly charges will be applicable after activation.",
    "register.plan.payment_method": "Preferred Payment",
    "register.plan.upgrade_pending": "Activating Premium plan...",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.light_mode": "Light mode",
    "settings.dark_mode": "Dark mode"
  },
  hi: {
    "nav.home": "होम",
    "nav.plans": "प्लान",
    "nav.modules": "मॉड्यूल",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क",
    "nav.login": "लॉगिन",
    "nav.register": "रजिस्टर",
    "nav.dashboard": "डैशबोर्ड",
    "nav.theme": "थीम",
    "nav.language": "भाषा",
    "nav.register.client": "क्लाइंट रजिस्टर",
    "nav.register.agent": "एजेंट रजिस्टर",
    "nav.register.society": "सोसाइटी रजिस्टर",
    "pricing.title": "सरल प्राइसिंग",
    "pricing.subtitle": "फ्री से शुरू करें, ज़रूरत पर प्रीमियम लें",
    "pricing.free.title": "फ्री",
    "pricing.free.description": "शुरुआत के लिए सही",
    "pricing.premium.title": "प्रीमियम",
    "pricing.premium.description": "प्रोडक्शन सोसाइटी के लिए",
    "pricing.recommended": "सुझाया गया",
    "pricing.get_started": "शुरू करें",
    "register.plan.title": "प्लान चुनें",
    "register.plan.subtitle": "सोसाइटी प्लान पर मासिक शुल्क लगता है और विज्ञापन हट जाते हैं।",
    "register.plan.free": "कॉमन (फ्री)",
    "register.plan.premium": "प्रीमियम (मासिक)",
    "register.plan.premium_note": "एक्टिवेशन के बाद मासिक शुल्क लागू होगा।",
    "register.plan.payment_method": "पेमेंट मेथड",
    "register.plan.upgrade_pending": "प्रीमियम एक्टिवेट हो रहा है...",
    "settings.theme": "थीम",
    "settings.language": "भाषा",
    "settings.light_mode": "लाइट मोड",
    "settings.dark_mode": "डार्क मोड"
  },
  mr: {
    "nav.home": "मुख्यपृष्ठ",
    "nav.plans": "प्लॅन्स",
    "nav.modules": "मॉड्यूल्स",
    "nav.about": "माहिती",
    "nav.contact": "संपर्क",
    "nav.login": "लॉगिन",
    "nav.register": "नोंदणी",
    "nav.dashboard": "डॅशबोर्ड",
    "nav.theme": "थीम",
    "nav.language": "भाषा",
    "nav.register.client": "क्लायंट नोंदणी",
    "nav.register.agent": "एजंट नोंदणी",
    "nav.register.society": "सोसायटी नोंदणी",
    "pricing.title": "सोपे प्रायसिंग",
    "pricing.subtitle": "फ्रीने सुरू करा, गरजेनुसार प्रीमियम घ्या",
    "pricing.free.title": "फ्री",
    "pricing.free.description": "सुरुवातीसाठी योग्य",
    "pricing.premium.title": "प्रीमियम",
    "pricing.premium.description": "प्रोडक्शन सोसायटीसाठी",
    "pricing.recommended": "शिफारस केलेले",
    "pricing.get_started": "सुरू करा",
    "register.plan.title": "प्लॅन निवडा",
    "register.plan.subtitle": "सोसायटी प्लॅनवर मासिक शुल्क लागू होते आणि जाहिराती हटतात.",
    "register.plan.free": "कॉमन (फ्री)",
    "register.plan.premium": "प्रीमियम (मासिक)",
    "register.plan.premium_note": "अॅक्टिवेशननंतर मासिक शुल्क लागू होईल.",
    "register.plan.payment_method": "पेमेंट पद्धत",
    "register.plan.upgrade_pending": "प्रीमियम अॅक्टिवेट होत आहे...",
    "settings.theme": "थीम",
    "settings.language": "भाषा",
    "settings.light_mode": "लाइट मोड",
    "settings.dark_mode": "डार्क मोड"
  }
};

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;

  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`{{${key}}}`, String(value));
  }, template);
}

export function translate(locale: AppLocale, key: TranslationKey, vars?: Record<string, string | number>) {
  const bundle = translations[locale] ?? translations[defaultLocale];
  const template = bundle[key] ?? translations[defaultLocale][key] ?? key;
  return interpolate(template, vars);
}
