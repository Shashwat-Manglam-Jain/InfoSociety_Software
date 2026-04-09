import type { AppLocale } from "./translations";

type ClientRegistryCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    addMember: string;
    createMemberTooltip: string;
    creationDisabledTooltip: string;
  };
  metrics: {
    totalMembers: {
      label: string;
      caption: string;
    };
    pendingKyc: {
      label: string;
      caption: string;
    };
    activeShares: {
      label: string;
      caption: string;
    };
    creditScore: {
      label: string;
      caption: string;
    };
  };
  table: {
    identity: string;
    profile: string;
    contact: string;
    location: string;
    date: string;
    memberId: string;
    noEmailOnFile: string;
    emptyState: string;
    viewProfile: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
};

const clientRegistryCopy: Record<AppLocale, ClientRegistryCopy> = {
  en: {
    hero: {
      eyebrow: "Members",
      title: "Client registry",
      description: "Browse registered society members, review profile details, and open individual records.",
      searchPlaceholder: "Search members",
      addMember: "Add member",
      createMemberTooltip: "Create a new member profile",
      creationDisabledTooltip: "Member creation is disabled in this view."
    },
    metrics: {
      totalMembers: {
        label: "Total Members",
        caption: "Registered members in the current registry view."
      },
      pendingKyc: {
        label: "Pending KYC",
        caption: "Members awaiting KYC completion."
      },
      activeShares: {
        label: "Active Shares",
        caption: "Members with active share participation."
      },
      creditScore: {
        label: "Credit Score",
        caption: "Current portfolio quality indicator."
      }
    },
    table: {
      identity: "Identity",
      profile: "Profile",
      contact: "Contact",
      location: "Location",
      date: "Date",
      memberId: "ID",
      noEmailOnFile: "No email on file",
      emptyState: "No members match the current search.",
      viewProfile: "View profile"
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
      eyebrow: "\u0938\u0926\u0938\u094d\u092f",
      title: "\u0915\u094d\u0932\u093e\u0907\u0902\u091f \u0930\u091c\u093f\u0938\u094d\u091f\u094d\u0930\u0940",
      description:
        "\u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0938\u0926\u0938\u094d\u092f\u094b\u0902 \u0915\u094b \u0926\u0947\u0916\u0947\u0902, \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0935\u093f\u0935\u0930\u0923 \u0915\u0940 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0930\u0947\u0902 \u0914\u0930 \u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0917\u0924 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0916\u094b\u0932\u0947\u0902\u0964",
      searchPlaceholder: "\u0938\u0926\u0938\u094d\u092f \u0916\u094b\u091c\u0947\u0902",
      addMember: "\u0938\u0926\u0938\u094d\u092f \u091c\u094b\u0921\u093c\u0947\u0902",
      createMemberTooltip: "\u0928\u0908 \u0938\u0926\u0938\u094d\u092f \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092c\u0928\u093e\u090f\u0902",
      creationDisabledTooltip: "\u0907\u0938 \u0926\u0943\u0936\u094d\u092f \u092e\u0947\u0902 \u0938\u0926\u0938\u094d\u092f \u0928\u093f\u0930\u094d\u092e\u093e\u0923 \u0905\u0915\u094d\u0937\u092e \u0939\u0948\u0964"
    },
    metrics: {
      totalMembers: {
        label: "\u0915\u0941\u0932 \u0938\u0926\u0938\u094d\u092f",
        caption: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0930\u091c\u093f\u0938\u094d\u091f\u094d\u0930\u0940 \u0926\u0943\u0936\u094d\u092f \u092e\u0947\u0902 \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u0938\u0926\u0938\u094d\u092f\u0964"
      },
      pendingKyc: {
        label: "\u0932\u0902\u092c\u093f\u0924 KYC",
        caption: "KYC \u092a\u0942\u0930\u093e \u0939\u094b\u0928\u0947 \u0915\u0940 \u092a\u094d\u0930\u0924\u0940\u0915\u094d\u0937\u093e \u092e\u0947\u0902 \u0938\u0926\u0938\u094d\u092f\u0964"
      },
      activeShares: {
        label: "\u0938\u0915\u094d\u0930\u093f\u092f \u0936\u0947\u092f\u0930",
        caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0936\u0947\u092f\u0930 \u092d\u093e\u0917\u0940\u0926\u093e\u0930\u0940 \u0935\u093e\u0932\u0947 \u0938\u0926\u0938\u094d\u092f\u0964"
      },
      creditScore: {
        label: "\u0915\u094d\u0930\u0947\u0921\u093f\u091f \u0938\u094d\u0915\u094b\u0930",
        caption: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u092a\u094b\u0930\u094d\u091f\u092b\u094b\u0932\u093f\u092f\u094b \u0917\u0941\u0923\u0935\u0924\u094d\u0924\u093e \u0938\u0902\u0915\u0947\u0924\u0915\u0964"
      }
    },
    table: {
      identity: "\u092a\u0939\u091a\u093e\u0928",
      profile: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
      contact: "\u0938\u0902\u092a\u0930\u094d\u0915",
      location: "\u0938\u094d\u0925\u093e\u0928",
      date: "\u0924\u093e\u0930\u0940\u0916",
      memberId: "\u0906\u0908\u0921\u0940",
      noEmailOnFile: "\u0908\u092e\u0947\u0932 \u0926\u0930\u094d\u091c \u0928\u0939\u0940\u0902 \u0939\u0948",
      emptyState: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0916\u094b\u091c \u0938\u0947 \u0915\u094b\u0908 \u0938\u0926\u0938\u094d\u092f \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964",
      viewProfile: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0926\u0947\u0916\u0947\u0902"
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
      eyebrow: "\u0938\u0926\u0938\u094d\u092f",
      title: "\u0915\u094d\u0932\u093e\u092f\u0902\u091f \u0928\u094b\u0902\u0926\u0935\u0939\u0940",
      description:
        "\u0928\u094b\u0902\u0926\u0923\u0940 \u091d\u093e\u0932\u0947\u0932\u0947 \u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0938\u0926\u0938\u094d\u092f \u092a\u0939\u093e, \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0924\u092a\u0936\u0940\u0932 \u0924\u092a\u093e\u0938\u093e \u0906\u0923\u093f \u0935\u0948\u092f\u0915\u094d\u0924\u093f\u0915 \u0928\u094b\u0902\u0926\u0940 \u0909\u0918\u0921\u093e.",
      searchPlaceholder: "\u0938\u0926\u0938\u094d\u092f \u0936\u094b\u0927\u093e",
      addMember: "\u0938\u0926\u0938\u094d\u092f \u091c\u094b\u0921\u093e",
      createMemberTooltip: "\u0928\u0935\u0940\u0928 \u0938\u0926\u0938\u094d\u092f \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      creationDisabledTooltip: "\u092f\u093e \u0926\u0943\u0936\u094d\u092f\u093e\u0924 \u0938\u0926\u0938\u094d\u092f \u0928\u093f\u0930\u094d\u092e\u093f\u0924\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u093e\u0939\u0940."
    },
    metrics: {
      totalMembers: {
        label: "\u090f\u0915\u0942\u0923 \u0938\u0926\u0938\u094d\u092f",
        caption: "\u0938\u0927\u094d\u092f\u093e\u091a\u094d\u092f\u093e \u0928\u094b\u0902\u0926\u0935\u0939\u0940 \u0926\u0943\u0936\u094d\u092f\u093e\u0924\u0940\u0932 \u0928\u094b\u0902\u0926\u0923\u0940\u0915\u0943\u0924 \u0938\u0926\u0938\u094d\u092f."
      },
      pendingKyc: {
        label: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924 KYC",
        caption: "KYC \u092a\u0942\u0930\u094d\u0924\u0924\u0947\u091a\u094d\u092f\u093e \u092a\u094d\u0930\u0924\u0940\u0915\u094d\u0937\u0947\u0924 \u0905\u0938\u0932\u0947\u0932\u0947 \u0938\u0926\u0938\u094d\u092f."
      },
      activeShares: {
        label: "\u0938\u0915\u094d\u0930\u093f\u092f \u0936\u0947\u0905\u0930\u094d\u0938",
        caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0936\u0947\u0905\u0930 \u0938\u0939\u092d\u093e\u0917 \u0905\u0938\u0932\u0947\u0932\u0947 \u0938\u0926\u0938\u094d\u092f."
      },
      creditScore: {
        label: "\u0915\u094d\u0930\u0947\u0921\u093f\u091f \u0938\u094d\u0915\u094b\u0905\u0930",
        caption: "\u0938\u0927\u094d\u092f\u093e\u091a\u093e \u092a\u094b\u0930\u094d\u091f\u092b\u094b\u0932\u093f\u0913 \u0917\u0941\u0923\u0935\u0924\u094d\u0924\u093e \u0928\u093f\u0930\u094d\u0926\u0947\u0936\u0915."
      }
    },
    table: {
      identity: "\u0913\u0933\u0916",
      profile: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
      contact: "\u0938\u0902\u092a\u0930\u094d\u0915",
      location: "\u0938\u094d\u0925\u093e\u0928",
      date: "\u0924\u093e\u0930\u0940\u0916",
      memberId: "\u0906\u092f\u0921\u0940",
      noEmailOnFile: "\u0908\u092e\u0947\u0932 \u0928\u094b\u0902\u0926\u0935\u0932\u0947\u0932\u093e \u0928\u093e\u0939\u0940",
      emptyState: "\u0938\u0927\u094d\u092f\u093e\u091a\u094d\u092f\u093e \u0936\u094b\u0927\u093e\u0936\u0940 \u091c\u0941\u0933\u0923\u093e\u0930\u093e \u0915\u094b\u0923\u0924\u093e\u0939\u0940 \u0938\u0926\u0938\u094d\u092f \u0938\u093e\u092a\u0921\u0932\u093e \u0928\u093e\u0939\u0940.",
      viewProfile: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092a\u0939\u093e"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    }
  }
};

export function getClientRegistryCopy(locale: AppLocale) {
  return clientRegistryCopy[locale] ?? clientRegistryCopy.en;
}
