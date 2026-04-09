import type { AppLocale } from "./translations";

type InvestmentsWorkspaceCopy = {
  hero: { eyebrow: string; title: string; description: string };
  metrics: {
    totalInvestments: { label: string; caption: string };
    investedAmount: { label: string; caption: string };
    maturityValue: { label: string; caption: string };
    active: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    newInvestment: string;
    renew: string;
    withdraw: string;
    cancel: string;
    create: string;
    creating: string;
    processing: string;
  };
  table: {
    bank: string;
    type: string;
    amount: string;
    interestRate: string;
    startDate: string;
    maturityDate: string;
    status: string;
    actions: string;
    emptyState: string;
    active: string;
    withdrawn: string;
  };
  errors: {
    loadFailed: string;
    requiredCreateFields: string;
    createFailed: string;
    requiredActionFields: string;
    selectInvestment: string;
    renewFailed: string;
    withdrawFailed: string;
  };
  success: { created: string; renewed: string; withdrawn: string };
  drawers: {
    newInvestment: string;
    renewInvestment: string;
    withdrawInvestment: string;
    bankName: string;
    investmentType: string;
    investmentTypePlaceholder: string;
    amount: string;
    interestRate: string;
    startDate: string;
    maturityDate: string;
    maturityAmount: string;
    newStartDate: string;
    newMaturityDate: string;
    amountOptional: string;
    interestRateOptional: string;
    withdrawnDate: string;
    maturityAmountReceived: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
};

const investmentsWorkspaceCopy: Record<AppLocale, InvestmentsWorkspaceCopy> = {
  en: {
    hero: { eyebrow: "Treasury", title: "Investments", description: "Manage bank investments, renewals, and withdrawals." },
    metrics: {
      totalInvestments: { label: "Total Investments", caption: "Active investment records." },
      investedAmount: { label: "Invested Amount", caption: "Total invested capital." },
      maturityValue: { label: "Maturity Value", caption: "Expected maturity returns." },
      active: { label: "Active", caption: "Non-withdrawn investments." }
    },
    actions: {
      searchPlaceholder: "Search by bank name...",
      newInvestment: "New Investment",
      renew: "Renew",
      withdraw: "Withdraw",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      processing: "Processing..."
    },
    table: {
      bank: "Bank",
      type: "Type",
      amount: "Amount",
      interestRate: "Interest Rate",
      startDate: "Start Date",
      maturityDate: "Maturity Date",
      status: "Status",
      actions: "Actions",
      emptyState: "No investments found.",
      active: "Active",
      withdrawn: "Withdrawn"
    },
    errors: {
      loadFailed: "Unable to load investments.",
      requiredCreateFields: "Please fill all required fields",
      createFailed: "Failed to create investment",
      requiredActionFields: "Please fill required fields",
      selectInvestment: "Please select an investment",
      renewFailed: "Failed to renew investment",
      withdrawFailed: "Failed to withdraw investment"
    },
    success: {
      created: "Investment created successfully",
      renewed: "Investment renewed successfully",
      withdrawn: "Investment withdrawn successfully"
    },
    drawers: {
      newInvestment: "New Investment",
      renewInvestment: "Renew Investment",
      withdrawInvestment: "Withdraw Investment",
      bankName: "Bank Name",
      investmentType: "Investment Type",
      investmentTypePlaceholder: "e.g., FD, Bonds, etc.",
      amount: "Amount",
      interestRate: "Interest Rate (%)",
      startDate: "Start Date",
      maturityDate: "Maturity Date",
      maturityAmount: "Maturity Amount",
      newStartDate: "New Start Date",
      newMaturityDate: "New Maturity Date",
      amountOptional: "Amount (optional)",
      interestRateOptional: "Interest Rate (optional)",
      withdrawnDate: "Withdrawn Date",
      maturityAmountReceived: "Maturity Amount Received"
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    }
  },
  hi: {
    hero: { eyebrow: "\u091f\u094d\u0930\u0947\u091c\u0930\u0940", title: "\u0928\u093f\u0935\u0947\u0936", description: "\u092c\u0948\u0902\u0915 \u0928\u093f\u0935\u0947\u0936, \u0928\u0935\u0940\u0915\u0930\u0923 \u0914\u0930 \u0928\u093f\u0915\u093e\u0938\u0940 \u0915\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0930\u0947\u0902\u0964" },
    metrics: {
      totalInvestments: { label: "\u0915\u0941\u0932 \u0928\u093f\u0935\u0947\u0936", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0928\u093f\u0935\u0947\u0936 \u0930\u093f\u0915\u0949\u0930\u094d\u0921\u094d\u0938\u0964" },
      investedAmount: { label: "\u0928\u093f\u0935\u0947\u0936 \u0930\u093e\u0936\u093f", caption: "\u0915\u0941\u0932 \u0928\u093f\u0935\u0947\u0936\u093f\u0924 \u092a\u0942\u0901\u091c\u0940\u0964" },
      maturityValue: { label: "\u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u092e\u0942\u0932\u094d\u092f", caption: "\u0905\u092a\u0947\u0915\u094d\u0937\u093f\u0924 \u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u0930\u093f\u091f\u0930\u094d\u0928\u0964" },
      active: { label: "\u0938\u0915\u094d\u0930\u093f\u092f", caption: "\u091c\u093f\u0928\u094d\u0939\u0947\u0902 \u0928\u093f\u0915\u093e\u0932\u093e \u0928\u0939\u0940\u0902 \u0917\u092f\u093e \u0939\u0948\u0964" }
    },
    actions: {
      searchPlaceholder: "\u092c\u0948\u0902\u0915 \u0928\u093e\u092e \u0938\u0947 \u0916\u094b\u091c\u0947\u0902...",
      newInvestment: "\u0928\u092f\u093e \u0928\u093f\u0935\u0947\u0936",
      renew: "\u0928\u0935\u0940\u0915\u0930\u0923",
      withdraw: "\u0928\u093f\u0915\u093e\u0938\u0940",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902",
      create: "\u092c\u0928\u093e\u090f\u0902",
      creating: "\u092c\u0928\u093e\u092f\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948...",
      processing: "\u092a\u094d\u0930\u094b\u0938\u0947\u0938 \u0939\u094b \u0930\u0939\u093e \u0939\u0948..."
    },
    table: {
      bank: "\u092c\u0948\u0902\u0915",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      amount: "\u0930\u093e\u0936\u093f",
      interestRate: "\u092c\u094d\u092f\u093e\u091c \u0926\u0930",
      startDate: "\u0936\u0941\u0930\u0942 \u0924\u093e\u0930\u0940\u0916",
      maturityDate: "\u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u0924\u093e\u0930\u0940\u0916",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      actions: "\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908",
      emptyState: "\u0915\u094b\u0908 \u0928\u093f\u0935\u0947\u0936 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964",
      active: "\u0938\u0915\u094d\u0930\u093f\u092f",
      withdrawn: "\u0928\u093f\u0915\u093e\u0932\u093e \u0917\u092f\u093e"
    },
    errors: {
      loadFailed: "\u0928\u093f\u0935\u0947\u0936 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
      requiredCreateFields: "\u0915\u0943\u092a\u092f\u093e \u0938\u092d\u0940 \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u0947\u0902",
      createFailed: "\u0928\u093f\u0935\u0947\u0936 \u092c\u0928\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932",
      requiredActionFields: "\u0915\u0943\u092a\u092f\u093e \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u0947\u0902",
      selectInvestment: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0928\u093f\u0935\u0947\u0936 \u091a\u0941\u0928\u0947\u0902",
      renewFailed: "\u0928\u093f\u0935\u0947\u0936 \u0928\u0935\u0940\u0915\u0930\u0923 \u0935\u093f\u092b\u0932",
      withdrawFailed: "\u0928\u093f\u0935\u0947\u0936 \u0928\u093f\u0915\u093e\u0938\u0940 \u0935\u093f\u092b\u0932"
    },
    success: {
      created: "\u0928\u093f\u0935\u0947\u0936 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u092c\u0928 \u0917\u092f\u093e",
      renewed: "\u0928\u093f\u0935\u0947\u0936 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u0928\u0935\u0940\u0915\u0943\u0924 \u0939\u0941\u0906",
      withdrawn: "\u0928\u093f\u0935\u0947\u0936 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u0928\u093f\u0915\u093e\u0932\u093e \u0917\u092f\u093e"
    },
    drawers: {
      newInvestment: "\u0928\u092f\u093e \u0928\u093f\u0935\u0947\u0936",
      renewInvestment: "\u0928\u093f\u0935\u0947\u0936 \u0928\u0935\u0940\u0915\u0930\u0923",
      withdrawInvestment: "\u0928\u093f\u0935\u0947\u0936 \u0928\u093f\u0915\u093e\u0938\u0940",
      bankName: "\u092c\u0948\u0902\u0915 \u0915\u093e \u0928\u093e\u092e",
      investmentType: "\u0928\u093f\u0935\u0947\u0936 \u092a\u094d\u0930\u0915\u093e\u0930",
      investmentTypePlaceholder: "\u091c\u0948\u0938\u0947, FD, \u092c\u0949\u0928\u094d\u0921 \u0906\u0926\u093f",
      amount: "\u0930\u093e\u0936\u093f",
      interestRate: "\u092c\u094d\u092f\u093e\u091c \u0926\u0930 (%)",
      startDate: "\u0936\u0941\u0930\u0942 \u0924\u093e\u0930\u0940\u0916",
      maturityDate: "\u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u0924\u093e\u0930\u0940\u0916",
      maturityAmount: "\u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u0930\u093e\u0936\u093f",
      newStartDate: "\u0928\u0908 \u0936\u0941\u0930\u0942 \u0924\u093e\u0930\u0940\u0916",
      newMaturityDate: "\u0928\u0908 \u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u0924\u093e\u0930\u0940\u0916",
      amountOptional: "\u0930\u093e\u0936\u093f (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      interestRateOptional: "\u092c\u094d\u092f\u093e\u091c \u0926\u0930 (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      withdrawnDate: "\u0928\u093f\u0915\u093e\u0938\u0940 \u0924\u093e\u0930\u0940\u0916",
      maturityAmountReceived: "\u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u092a\u0930\u093f\u092a\u0915\u094d\u0935\u0924\u093e \u0930\u093e\u0936\u093f"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u0943\u0937\u094d\u0920 \u092a\u0902\u0915\u094d\u0924\u093f\u092f\u093e\u0901:",
      displayedRows: "{{count}} \u092e\u0947\u0902 \u0938\u0947 {{from}}-{{to}}",
      nextPage: "\u0905\u0917\u0932\u093e \u092a\u0943\u0937\u094d\u0920",
      previousPage: "\u092a\u093f\u091b\u0932\u093e \u092a\u0943\u0937\u094d\u0920"
    }
  },
  mr: {
    hero: { eyebrow: "\u0915\u094b\u0937\u093e\u0917\u093e\u0930", title: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915", description: "\u092c\u0901\u0915 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915, \u0928\u0942\u0924\u0928\u0940\u0915\u0930\u0923 \u0906\u0923\u093f \u092a\u0930\u0924\u092e\u093e\u0917\u0947 \u092f\u093e\u0902\u091a\u0947 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0928 \u0915\u0930\u093e." },
    metrics: {
      totalInvestments: { label: "\u090f\u0915\u0942\u0923 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0928\u094b\u0902\u0926\u0940." },
      investedAmount: { label: "\u0917\u0941\u0902\u0924\u0935\u0932\u0947\u0932\u0940 \u0930\u0915\u094d\u0915\u092e", caption: "\u090f\u0915\u0942\u0923 \u0917\u0941\u0902\u0924\u0935\u0932\u0947\u0932\u0947 \u092d\u093e\u0902\u0921\u0935\u0932." },
      maturityValue: { label: "\u092e\u0941\u0926\u0924\u092a\u0942\u0930\u094d\u0924\u0940 \u092e\u0942\u0932\u094d\u092f", caption: "\u0905\u092a\u0947\u0915\u094d\u0937\u093f\u0924 \u092a\u0930\u0924\u093e\u0935\u093e." },
      active: { label: "\u0938\u0915\u094d\u0930\u093f\u092f", caption: "\u0905\u0926\u094d\u092f\u093e\u092a \u092a\u0930\u0924 \u0928 \u0918\u0947\u0924\u0932\u0947\u0932\u0940 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915." }
    },
    actions: {
      searchPlaceholder: "\u092c\u0901\u0915\u0947\u091a\u094d\u092f\u093e \u0928\u093e\u0935\u093e\u0928\u0947 \u0936\u094b\u0927\u093e...",
      newInvestment: "\u0928\u0935\u0940\u0928 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915",
      renew: "\u0928\u0942\u0924\u0928\u0940\u0915\u0930\u0923",
      withdraw: "\u092a\u0930\u0924 \u0915\u093e\u0922\u093e",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u093e",
      create: "\u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      creating: "\u0924\u092f\u093e\u0930 \u0915\u0930\u0924 \u0906\u0939\u0947...",
      processing: "\u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0938\u0941\u0930\u0942 \u0906\u0939\u0947..."
    },
    table: {
      bank: "\u092c\u0901\u0915",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      amount: "\u0930\u0915\u094d\u0915\u092e",
      interestRate: "\u0935\u094d\u092f\u093e\u091c\u0926\u0930",
      startDate: "\u0938\u0941\u0930\u0942 \u0926\u093f\u0928\u093e\u0902\u0915",
      maturityDate: "\u092e\u0941\u0926\u0924\u092a\u0942\u0930\u094d\u0924\u0940 \u0926\u093f\u0928\u093e\u0902\u0915",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      actions: "\u0915\u093e\u0930\u0935\u093e\u0908",
      emptyState: "\u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0938\u093e\u092a\u0921\u0932\u0940 \u0928\u093e\u0939\u0940.",
      active: "\u0938\u0915\u094d\u0930\u093f\u092f",
      withdrawn: "\u092a\u0930\u0924 \u0918\u0947\u0924\u0932\u0947\u0932\u0940"
    },
    errors: {
      loadFailed: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940.",
      requiredCreateFields: "\u0915\u0943\u092a\u092f\u093e \u0938\u0930\u094d\u0935 \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u093e",
      createFailed: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0924\u092f\u093e\u0930 \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940",
      requiredActionFields: "\u0915\u0943\u092a\u092f\u093e \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u093e",
      selectInvestment: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0928\u093f\u0935\u0921\u093e",
      renewFailed: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0928\u0942\u0924\u0928\u0940\u0915\u0930\u0923 \u0905\u092f\u0936\u0938\u094d\u0935\u0940",
      withdrawFailed: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u092a\u0930\u0924 \u0915\u093e\u0922\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940"
    },
    success: {
      created: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0924\u092f\u093e\u0930 \u091d\u093e\u0932\u0940",
      renewed: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0928\u0942\u0924\u0928\u0940\u0915\u0930\u0923 \u091d\u093e\u0932\u0947",
      withdrawn: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u092a\u0930\u0924 \u0915\u093e\u0922\u0932\u0940"
    },
    drawers: {
      newInvestment: "\u0928\u0935\u0940\u0928 \u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915",
      renewInvestment: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u0928\u0942\u0924\u0928\u0940\u0915\u0930\u0923",
      withdrawInvestment: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u092a\u0930\u0924 \u0915\u093e\u0922\u0923\u0947",
      bankName: "\u092c\u0901\u0915\u0947\u091a\u0947 \u0928\u093e\u0935",
      investmentType: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915 \u092a\u094d\u0930\u0915\u093e\u0930",
      investmentTypePlaceholder: "\u0909\u0926\u093e. FD, Bonds \u0907.",
      amount: "\u0930\u0915\u094d\u0915\u092e",
      interestRate: "\u0935\u094d\u092f\u093e\u091c\u0926\u0930 (%)",
      startDate: "\u0938\u0941\u0930\u0942 \u0926\u093f\u0928\u093e\u0902\u0915",
      maturityDate: "\u092e\u0941\u0926\u0924\u092a\u0942\u0930\u094d\u0924\u0940 \u0926\u093f\u0928\u093e\u0902\u0915",
      maturityAmount: "\u092e\u0941\u0926\u0924\u092a\u0942\u0930\u094d\u0924\u0940 \u0930\u0915\u094d\u0915\u092e",
      newStartDate: "\u0928\u0935\u0940\u0928 \u0938\u0941\u0930\u0942 \u0926\u093f\u0928\u093e\u0902\u0915",
      newMaturityDate: "\u0928\u0935\u0940\u0928 \u092e\u0941\u0926\u0924\u092a\u0942\u0930\u094d\u0924\u0940 \u0926\u093f\u0928\u093e\u0902\u0915",
      amountOptional: "\u0930\u0915\u094d\u0915\u092e (\u090f\u091a\u094d\u091b\u093f\u0915)",
      interestRateOptional: "\u0935\u094d\u092f\u093e\u091c\u0926\u0930 (\u090f\u091a\u094d\u091b\u093f\u0915)",
      withdrawnDate: "\u092a\u0930\u0924 \u0915\u093e\u0922\u0932\u0947\u0932\u093e \u0926\u093f\u0928\u093e\u0902\u0915",
      maturityAmountReceived: "\u092e\u093f\u0933\u093e\u0932\u0947\u0932\u0940 \u092e\u0941\u0926\u0924\u092a\u0942\u0930\u094d\u0924\u0940 \u0930\u0915\u094d\u0915\u092e"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    }
  }
};

export function getInvestmentsWorkspaceCopy(locale: AppLocale) {
  return investmentsWorkspaceCopy[locale] ?? investmentsWorkspaceCopy.en;
}
