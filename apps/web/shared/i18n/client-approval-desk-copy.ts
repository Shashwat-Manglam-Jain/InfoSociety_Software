import type { AppLocale } from "./translations";

type ClientApprovalDeskCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
  };
  table: {
    client: string;
    customerCode: string;
    loginUsername: string;
    approvedBy: string;
    createdOn: string;
    status: string;
    emptyState: string;
    approved: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
};

const clientApprovalDeskCopy: Record<AppLocale, ClientApprovalDeskCopy> = {
  en: {
    hero: {
      eyebrow: "Approvals",
      title: "Client Access Approval Desk",
      description: "This view shows the client records that were created from User Access and their society-admin approval trail for portal login.",
      searchPlaceholder: "Search approvals..."
    },
    table: {
      client: "Client",
      customerCode: "Customer Code",
      loginUsername: "Login Username",
      approvedBy: "Approved By",
      createdOn: "Created On",
      status: "Status",
      emptyState: "No client approval records matched the current search.",
      approved: "Approved"
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
      eyebrow: "\u0905\u0928\u0941\u092e\u094b\u0926\u0928",
      title: "\u0915\u094d\u0932\u093e\u0907\u0902\u091f \u090f\u0915\u094d\u0938\u0947\u0938 \u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u0921\u0947\u0938\u094d\u0915",
      description: "\u092f\u0939 \u0926\u0943\u0936\u094d\u092f User Access \u0938\u0947 \u092c\u0928\u0947 \u0915\u094d\u0932\u093e\u0907\u0902\u091f \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0914\u0930 \u092a\u094b\u0930\u094d\u091f\u0932 \u0932\u0949\u0917\u093f\u0928 \u0915\u0947 \u0932\u093f\u090f \u0909\u0928\u0915\u0940 \u0938\u094b\u0938\u093e\u092f\u091f\u0940-\u090f\u0921\u092e\u093f\u0928 \u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u091f\u094d\u0930\u0947\u0932 \u0926\u093f\u0916\u093e\u0924\u093e \u0939\u0948\u0964",
      searchPlaceholder: "\u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u0916\u094b\u091c\u0947\u0902..."
    },
    table: {
      client: "\u0915\u094d\u0932\u093e\u0907\u0902\u091f",
      customerCode: "\u0915\u0938\u094d\u091f\u092e\u0930 \u0915\u094b\u0921",
      loginUsername: "\u0932\u0949\u0917\u093f\u0928 \u092f\u0942\u091c\u0930\u0928\u0947\u092e",
      approvedBy: "\u0905\u0928\u0941\u092e\u094b\u0926\u093f\u0924 \u0915\u093f\u092f\u093e \u0917\u092f\u093e \u0926\u094d\u0935\u093e\u0930\u093e",
      createdOn: "\u092c\u0928\u093e\u092f\u093e \u0917\u092f\u093e",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      emptyState: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0916\u094b\u091c \u0915\u0947 \u0905\u0928\u0941\u0930\u0942\u092a \u0915\u094b\u0908 \u0915\u094d\u0932\u093e\u0907\u0902\u091f \u0905\u0928\u0941\u092e\u094b\u0926\u0928 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964",
      approved: "\u0905\u0928\u0941\u092e\u094b\u0926\u093f\u0924"
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
      eyebrow: "\u092e\u0902\u091c\u0941\u0930\u0940",
      title: "\u0915\u094d\u0932\u093e\u092f\u0902\u091f \u0905\u0945\u0915\u094d\u0938\u0947\u0938 \u092e\u0902\u091c\u0941\u0930\u0940 \u0921\u0947\u0938\u094d\u0915",
      description: "\u092f\u093e \u0926\u0943\u0936\u094d\u092f\u093e\u0924 User Access \u092e\u0927\u0942\u0928 \u0924\u092f\u093e\u0930 \u091d\u093e\u0932\u0947\u0932\u0947 \u0915\u094d\u0932\u093e\u092f\u0902\u091f \u0930\u0947\u0915\u0949\u0930\u094d\u0921\u094d\u0938 \u0906\u0923\u093f \u092a\u094b\u0930\u094d\u091f\u0932 \u0932\u0949\u0917\u093f\u0928\u0938\u093e\u0920\u0940 \u0924\u094d\u092f\u093e\u0902\u091a\u093e \u0938\u094b\u0938\u093e\u092f\u091f\u0940-\u0905\u0945\u0921\u092e\u093f\u0928 \u092e\u0902\u091c\u0941\u0930\u0940 \u091f\u094d\u0930\u0947\u0932 \u0926\u093f\u0938\u0924\u094b.",
      searchPlaceholder: "\u092e\u0902\u091c\u0941\u0930\u0940 \u0936\u094b\u0927\u093e..."
    },
    table: {
      client: "\u0915\u094d\u0932\u093e\u092f\u0902\u091f",
      customerCode: "\u0917\u094d\u0930\u093e\u0939\u0915 \u0915\u094b\u0921",
      loginUsername: "\u0932\u0949\u0917\u093f\u0928 \u092f\u0941\u091c\u0930\u0928\u0947\u092e",
      approvedBy: "\u092e\u0902\u091c\u0941\u0930 \u0915\u0947\u0932\u0947",
      createdOn: "\u0924\u092f\u093e\u0930 \u0926\u093f\u0928\u093e\u0902\u0915",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      emptyState: "\u0938\u0927\u094d\u092f\u093e\u091a\u094d\u092f\u093e \u0936\u094b\u0927\u093e\u0928\u0941\u0938\u093e\u0930 \u0915\u094b\u0923\u0924\u0947\u0939\u0940 \u0915\u094d\u0932\u093e\u092f\u0902\u091f \u092e\u0902\u091c\u0941\u0930\u0940 \u0930\u0947\u0915\u0949\u0930\u094d\u0921 \u0938\u093e\u092a\u0921\u0932\u0947 \u0928\u093e\u0939\u0940.",
      approved: "\u092e\u0902\u091c\u0941\u0930"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    }
  }
};

export function getClientApprovalDeskCopy(locale: AppLocale) {
  return clientApprovalDeskCopy[locale] ?? clientApprovalDeskCopy.en;
}
