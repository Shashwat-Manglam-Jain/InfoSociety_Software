import type { AppLocale } from "./translations";

type DashboardOverviewCopy = {
  localeTag: string;
  fallbackSocietyName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  stats: {
    today: string;
    weekly: string;
    pending: string;
    cleared: string;
  };
  growthTitle: string;
  growthSubtitle: string;
  networkPulseTitle: string;
  networkPulseStats: {
    agents: string;
    users: string;
    monthlyCollection: string;
  };
  weekDays: string[];
};

const dashboardOverviewCopy: Record<AppLocale, DashboardOverviewCopy> = {
  en: {
    localeTag: "en-IN",
    fallbackSocietyName: "Society Manager",
    welcomeTitle: "Welcome back, {{name}}",
    welcomeSubtitle: "Track branch performance, treasury movement, and operational activity from one place.",
    stats: {
      today: "Today",
      weekly: "Weekly",
      pending: "Pending",
      cleared: "Cleared"
    },
    growthTitle: "Weekly growth",
    growthSubtitle: "Snapshot of activity and collection momentum through the week.",
    networkPulseTitle: "Network pulse",
    networkPulseStats: {
      agents: "Agents",
      users: "Users",
      monthlyCollection: "Monthly collection"
    },
    weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  hi: {
    localeTag: "hi-IN",
    fallbackSocietyName: "सोसायटी प्रबंधक",
    welcomeTitle: "फिर से स्वागत है, {{name}}",
    welcomeSubtitle: "एक ही स्थान से शाखा प्रदर्शन, कोषागार की गतिविधि और संचालन पर नज़र रखें।",
    stats: {
      today: "आज",
      weekly: "साप्ताहिक",
      pending: "लंबित",
      cleared: "समाशोधित"
    },
    growthTitle: "साप्ताहिक वृद्धि",
    growthSubtitle: "सप्ताह भर की गतिविधि और संग्रह की गति का सारांश।",
    networkPulseTitle: "नेटवर्क स्थिति",
    networkPulseStats: {
      agents: "एजेंट",
      users: "उपयोगकर्ता",
      monthlyCollection: "मासिक संग्रह"
    },
    weekDays: ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
  },
  mr: {
    localeTag: "mr-IN",
    fallbackSocietyName: "सोसायटी व्यवस्थापक",
    welcomeTitle: "पुन्हा स्वागत आहे, {{name}}",
    welcomeSubtitle: "एकाच ठिकाणावरून शाखेची कामगिरी, तिजोरी हालचाल आणि दैनंदिन कामकाज पाहा.",
    stats: {
      today: "आज",
      weekly: "साप्ताहिक",
      pending: "प्रलंबित",
      cleared: "निकाली"
    },
    growthTitle: "साप्ताहिक वाढ",
    growthSubtitle: "आठवडाभरातील कामकाज आणि वसुली गतीचा आढावा.",
    networkPulseTitle: "नेटवर्क स्थिती",
    networkPulseStats: {
      agents: "एजंट",
      users: "वापरकर्ते",
      monthlyCollection: "मासिक वसुली"
    },
    weekDays: ["सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
  }
};

export function getSocietyDashboardOverviewCopy(locale: AppLocale) {
  return dashboardOverviewCopy[locale] ?? dashboardOverviewCopy.en;
}
