import type { AppLocale } from "./translations";

type TreasuryAuditCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
  };
  metrics: {
    entries: { label: string; caption: string };
    credits: { label: string; caption: string };
    debits: { label: string; caption: string };
    net: { label: string; caption: string };
  };
  table: {
    date: string;
    reference: string;
    account: string;
    customer: string;
    branch: string;
    type: string;
    amount: string;
  };
  emptyState: string;
  transactionType: {
    credit: string;
    debit: string;
  };
};

const treasuryAuditCopy: Record<AppLocale, TreasuryAuditCopy> = {
  en: {
    hero: {
      eyebrow: "Treasury",
      title: "Treasury audit",
      description: "Review transaction activity, branch impact, and debit-credit movement across the society.",
      searchPlaceholder: "Search transactions"
    },
    metrics: {
      entries: { label: "Entries", caption: "Transactions visible in the current audit view." },
      credits: { label: "Credits", caption: "Total incoming value." },
      debits: { label: "Debits", caption: "Total outgoing value." },
      net: { label: "Net", caption: "Credit minus debit impact." }
    },
    table: {
      date: "Date",
      reference: "Reference",
      account: "Account",
      customer: "Customer",
      branch: "Branch",
      type: "Type",
      amount: "Amount"
    },
    emptyState: "No transactions match the current search.",
    transactionType: {
      credit: "CREDIT",
      debit: "DEBIT"
    }
  },
  hi: {
    hero: {
      eyebrow: "कोषागार",
      title: "कोषागार ऑडिट",
      description: "समाज में लेनदेन गतिविधि, शाखा प्रभाव और डेबिट-क्रेडिट प्रवाह की समीक्षा करें।",
      searchPlaceholder: "लेनदेन खोजें"
    },
    metrics: {
      entries: { label: "प्रविष्टियाँ", caption: "वर्तमान ऑडिट दृश्य में दिख रहे लेनदेन।" },
      credits: { label: "जमा", caption: "कुल प्राप्त राशि।" },
      debits: { label: "निकासी", caption: "कुल भुगतान राशि।" },
      net: { label: "शुद्ध", caption: "जमा और निकासी का अंतर।" }
    },
    table: {
      date: "तारीख",
      reference: "संदर्भ",
      account: "खाता",
      customer: "ग्राहक",
      branch: "शाखा",
      type: "प्रकार",
      amount: "राशि"
    },
    emptyState: "वर्तमान खोज से मेल खाने वाला कोई लेनदेन नहीं मिला।",
    transactionType: {
      credit: "जमा",
      debit: "निकासी"
    }
  },
  mr: {
    hero: {
      eyebrow: "कोषागार",
      title: "कोषागार लेखापरीक्षण",
      description: "संस्थेतील व्यवहारांची हालचाल, शाखानिहाय परिणाम आणि डेबिट-क्रेडिट प्रवाह तपासा.",
      searchPlaceholder: "व्यवहार शोधा"
    },
    metrics: {
      entries: { label: "नोंदी", caption: "सध्याच्या लेखापरीक्षण दृश्यातील व्यवहार." },
      credits: { label: "जमा", caption: "एकूण प्राप्त रक्कम." },
      debits: { label: "डेबिट", caption: "एकूण खर्च रक्कम." },
      net: { label: "निव्वळ", caption: "जमा व डेबिट यांतील फरक." }
    },
    table: {
      date: "तारीख",
      reference: "संदर्भ",
      account: "खाते",
      customer: "ग्राहक",
      branch: "शाखा",
      type: "प्रकार",
      amount: "रक्कम"
    },
    emptyState: "सध्याच्या शोधाशी जुळणारा कोणताही व्यवहार सापडला नाही.",
    transactionType: {
      credit: "जमा",
      debit: "डेबिट"
    }
  }
};

export function getTreasuryAuditCopy(locale: AppLocale) {
  return treasuryAuditCopy[locale] ?? treasuryAuditCopy.en;
}
