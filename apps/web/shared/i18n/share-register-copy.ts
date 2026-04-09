import type { AppLocale } from "./translations";

type ShareRegisterCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    issueShares: string;
  };
  filters: {
    shareholder: string;
    nominal: string;
  };
  table: {
    member: string;
    agent: string;
    range: string;
    shares: string;
    nominal: string;
    status: string;
    emptyState: string;
    documented: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
};

const shareRegisterCopy: Record<AppLocale, ShareRegisterCopy> = {
  en: {
    hero: {
      eyebrow: "Shareholding",
      title: "Share register",
      description: "Review shareholding records, filter member types, and maintain allotment documentation.",
      searchPlaceholder: "Search registry...",
      issueShares: "Issue shares"
    },
    filters: {
      shareholder: "Shareholder",
      nominal: "Nominal"
    },
    table: {
      member: "Member",
      agent: "Agent",
      range: "Range",
      shares: "Shares",
      nominal: "Nominal",
      status: "Status",
      emptyState: "No shareholding records match the current filters.",
      documented: "Documented"
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    }
  },
  hi: {
    hero: {
      eyebrow: "\u0936\u0947\u092f\u0930\u0927\u093e\u0930\u093f\u0924\u093e",
      title: "\u0936\u0947\u092f\u0930 \u0930\u091c\u093f\u0938\u094d\u091f\u0930",
      description:
        "\u0936\u0947\u092f\u0930\u0927\u093e\u0930\u093f\u0924\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0940 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0930\u0947\u0902, \u0938\u0926\u0938\u094d\u092f \u092a\u094d\u0930\u0915\u093e\u0930 \u092b\u093f\u0932\u094d\u091f\u0930 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0906\u0935\u0902\u091f\u0928 \u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c \u092c\u0928\u093e\u090f \u0930\u0916\u0947\u0902\u0964",
      searchPlaceholder: "\u0930\u091c\u093f\u0938\u094d\u091f\u094d\u0930\u0940 \u0916\u094b\u091c\u0947\u0902...",
      issueShares: "\u0936\u0947\u092f\u0930 \u091c\u093e\u0930\u0940 \u0915\u0930\u0947\u0902"
    },
    filters: {
      shareholder: "\u0936\u0947\u092f\u0930\u0927\u093e\u0930\u0915",
      nominal: "\u0928\u093e\u092e\u092e\u093e\u0924\u094d\u0930"
    },
    table: {
      member: "\u0938\u0926\u0938\u094d\u092f",
      agent: "\u090f\u091c\u0947\u0902\u091f",
      range: "\u0936\u094d\u0930\u0947\u0923\u0940",
      shares: "\u0936\u0947\u092f\u0930",
      nominal: "\u0928\u093e\u092e\u092e\u093e\u0924\u094d\u0930",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      emptyState: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u092b\u093f\u0932\u094d\u091f\u0930 \u0938\u0947 \u0915\u094b\u0908 \u0936\u0947\u092f\u0930\u0927\u093e\u0930\u093f\u0924\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0947\u0964",
      documented: "\u0926\u0938\u094d\u0924\u093e\u0935\u0947\u091c\u093f\u0924"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u0943\u0937\u094d\u0920 \u092a\u0902\u0915\u094d\u0924\u093f\u092f\u093e\u0901:",
      displayedRows: "{{count}} \u092e\u0947\u0902 \u0938\u0947 {{from}}-{{to}}",
      nextPage: "\u0905\u0917\u0932\u093e \u092a\u0943\u0937\u094d\u0920",
      previousPage: "\u092a\u093f\u091b\u0932\u093e \u092a\u0943\u0937\u094d\u0920"
    }
  },
  mr: {
    hero: {
      eyebrow: "\u0936\u0947\u0905\u0930\u0927\u093e\u0930\u0915\u0924\u094d\u0935",
      title: "\u0936\u0947\u0905\u0930 \u0928\u094b\u0902\u0926\u0935\u0939\u0940",
      description:
        "\u0936\u0947\u0905\u0930\u0927\u093e\u0930\u0915\u0924\u094d\u0935 \u0928\u094b\u0902\u0926\u0940 \u0924\u092a\u093e\u0938\u093e, \u0938\u0926\u0938\u094d\u092f \u092a\u094d\u0930\u0915\u093e\u0930 \u092b\u093f\u0932\u094d\u091f\u0930 \u0915\u0930\u093e \u0906\u0923\u093f \u0935\u093e\u091f\u092a \u0926\u0938\u094d\u0924\u090f\u0935\u091c \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093f\u0924 \u0920\u0947\u0935\u093e.",
      searchPlaceholder: "\u0928\u094b\u0902\u0926\u0935\u0939\u0940 \u0936\u094b\u0927\u093e...",
      issueShares: "\u0936\u0947\u0905\u0930 \u091c\u093e\u0930\u0940 \u0915\u0930\u093e"
    },
    filters: {
      shareholder: "\u0936\u0947\u0905\u0930\u0927\u093e\u0930\u0915",
      nominal: "\u0928\u093e\u092e\u092e\u093e\u0924\u094d\u0930"
    },
    table: {
      member: "\u0938\u0926\u0938\u094d\u092f",
      agent: "\u090f\u091c\u0902\u091f",
      range: "\u0936\u094d\u0930\u0947\u0923\u0940",
      shares: "\u0936\u0947\u0905\u0930\u094d\u0938",
      nominal: "\u0928\u093e\u092e\u092e\u093e\u0924\u094d\u0930",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      emptyState: "\u0938\u0927\u094d\u092f\u093e\u091a\u094d\u092f\u093e \u092b\u093f\u0932\u094d\u091f\u0930\u0938\u0940 \u091c\u0941\u0933\u0923\u093e\u0930\u0940 \u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0936\u0947\u0905\u0930\u0927\u093e\u0930\u0915\u0924\u094d\u0935 \u0928\u094b\u0902\u0926 \u0938\u093e\u092a\u0921\u0932\u0940 \u0928\u093e\u0939\u0940.",
      documented: "\u0928\u094b\u0902\u0926\u0935\u0932\u0947\u0932\u0947"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    }
  }
};

export function getShareRegisterCopy(locale: AppLocale) {
  return shareRegisterCopy[locale] ?? shareRegisterCopy.en;
}
