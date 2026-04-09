import type { AppLocale } from "./translations";

type PlanCatalogueCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    createPlan: string;
  };
  metrics: {
    activePlans: { label: string; caption: string };
    pendingSetup: { label: string; caption: string };
    productYield: { label: string; caption: string };
    riskExposure: { label: string; caption: string; value: string };
    fdPlans: { label: string; caption: string };
    rdPlans: { label: string; caption: string };
    avgInterest: { label: string; caption: string };
  };
  table: {
    planDetails: string;
    planCode: string;
    planName: string;
    type: string;
    requirements: string;
    tenureScope: string;
    tenure: string;
    months: string;
    returnsApr: string;
    interest: string;
    benefits: string;
    emptyState: string;
    seniorBonus: string;
  };
  info: {
    viewOnly: string;
  };
  drawer: {
    createDepositPlan: string;
    planCode: string;
    planName: string;
    planType: string;
    fixedDeposit: string;
    recurringDeposit: string;
    minMonths: string;
    maxMonths: string;
    interestRate: string;
    submitCreatePlan: string;
  };
  categories: Record<string, string>;
};

const planCatalogueCopy: Record<AppLocale, PlanCatalogueCopy> = {
  en: {
    hero: {
      eyebrow: "Plan",
      title: "Plan Catalogue",
      description:
        "Categorize and manage institutional deposit and loan plans, including interest rates and tenure configurations.",
      searchPlaceholder: "Search catalogue...",
      createPlan: "Create Plan"
    },
    metrics: {
      activePlans: { label: "Active Plans", caption: "Verified institutional products." },
      pendingSetup: { label: "Pending Setup", caption: "Draft templates requiring activation." },
      productYield: { label: "Product Yield", caption: "Average institutional return." },
      riskExposure: { label: "Risk Exposure", caption: "Institutional liability healthy.", value: "Low" },
      fdPlans: { label: "FD Plans", caption: "Fixed deposit options." },
      rdPlans: { label: "RD Plans", caption: "Recurring deposit options." },
      avgInterest: { label: "Avg Interest", caption: "Average advertised plan rate." }
    },
    table: {
      planDetails: "Plan Details",
      planCode: "Plan Code",
      planName: "Plan Name",
      type: "Type",
      requirements: "Requirements",
      tenureScope: "Tenure Scope",
      tenure: "Tenure",
      months: "months",
      returnsApr: "Returns (APR)",
      interest: "Interest",
      benefits: "Benefits",
      emptyState: "No plans matched the selected category and search.",
      seniorBonus: "+{{value}}% Senior"
    },
    info: {
      viewOnly: "This workspace is available in view mode for your account. Plan creation is reserved for staff with deposit setup access."
    },
    drawer: {
      createDepositPlan: "Create Deposit Plan",
      planCode: "Plan Code",
      planName: "Plan Name",
      planType: "Plan Type",
      fixedDeposit: "Fixed Deposit",
      recurringDeposit: "Recurring Deposit",
      minMonths: "Min Months",
      maxMonths: "Max Months",
      interestRate: "Interest Rate",
      submitCreatePlan: "Create Plan"
    },
    categories: {
      fd: "FD Account Plan",
      dd: "DD Account Plan",
      rd: "RD Accounts Plan",
      mis: "MIS Accounts Plan",
      "gold-loan": "Gold Loan Plan",
      "vehicle-loan": "Vehicle Loan Plan",
      "group-loan": "Group Loan Plan",
      "personal-loan": "Personal Loan Plan",
      "property-loan": "Property Loan Plan"
    }
  },
  hi: {
    hero: {
      eyebrow: "\u092f\u094b\u091c\u0928\u093e",
      title: "\u092f\u094b\u091c\u0928\u093e \u0915\u0948\u091f\u0932\u0949\u0917",
      description:
        "\u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u091c\u092e\u093e \u0914\u0930 \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e\u0913\u0902 \u0915\u094b \u0936\u094d\u0930\u0947\u0923\u0940\u092c\u0926\u094d\u0927 \u0915\u0930\u0947\u0902 \u0914\u0930 \u092c\u094d\u092f\u093e\u091c \u0926\u0930 \u0935 \u0905\u0935\u0927\u093f \u0915\u0949\u0928\u094d\u092b\u093f\u0917\u0930\u0947\u0936\u0928 \u0915\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0930\u0947\u0902\u0964",
      searchPlaceholder: "\u0915\u0948\u091f\u0932\u0949\u0917 \u0916\u094b\u091c\u0947\u0902...",
      createPlan: "\u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902"
    },
    metrics: {
      activePlans: { label: "\u0938\u0915\u094d\u0930\u093f\u092f \u092f\u094b\u091c\u0928\u093e\u090f\u0902", caption: "\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u0909\u0924\u094d\u092a\u093e\u0926\u0964" },
      pendingSetup: { label: "\u0932\u0902\u092c\u093f\u0924 \u0938\u0947\u091f\u0905\u092a", caption: "\u0938\u0915\u094d\u0930\u093f\u092f\u0915\u0930\u0923 \u0915\u0947 \u0932\u093f\u090f \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u091f\u0947\u092e\u094d\u092a\u0932\u0947\u091f\u094d\u0938\u0964" },
      productYield: { label: "\u0909\u0924\u094d\u092a\u093e\u0926 \u0930\u093f\u091f\u0930\u094d\u0928", caption: "\u0914\u0938\u0924 \u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u0930\u093f\u091f\u0930\u094d\u0928\u0964" },
      riskExposure: { label: "\u091c\u094b\u0916\u093f\u092e \u090f\u0915\u094d\u0938\u092a\u094b\u091c\u0930", caption: "\u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u0926\u093e\u092f\u093f\u0924\u094d\u0935 \u0938\u094d\u0925\u093f\u0930 \u0939\u0948\u0964", value: "\u0915\u092e" },
      fdPlans: { label: "FD \u092f\u094b\u091c\u0928\u093e\u090f\u0902", caption: "\u0938\u094d\u0925\u093f\u0930 \u091c\u092e\u093e \u0935\u093f\u0915\u0932\u094d\u092a\u0964" },
      rdPlans: { label: "RD \u092f\u094b\u091c\u0928\u093e\u090f\u0902", caption: "\u0906\u0935\u0930\u094d\u0924\u0940 \u091c\u092e\u093e \u0935\u093f\u0915\u0932\u094d\u092a\u0964" },
      avgInterest: { label: "\u0914\u0938\u0924 \u092c\u094d\u092f\u093e\u091c", caption: "\u092a\u094d\u0930\u0926\u0930\u094d\u0936\u093f\u0924 \u092f\u094b\u091c\u0928\u093e \u0926\u0930 \u0915\u093e \u0914\u0938\u0924\u0964" }
    },
    table: {
      planDetails: "\u092f\u094b\u091c\u0928\u093e \u0935\u093f\u0935\u0930\u0923",
      planCode: "\u092f\u094b\u091c\u0928\u093e \u0915\u094b\u0921",
      planName: "\u092f\u094b\u091c\u0928\u093e \u0928\u093e\u092e",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      requirements: "\u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e\u090f\u0902",
      tenureScope: "\u0905\u0935\u0927\u093f \u0938\u0940\u092e\u093e",
      tenure: "\u0905\u0935\u0927\u093f",
      months: "\u092e\u0939\u0940\u0928\u0947",
      returnsApr: "\u0930\u093f\u091f\u0930\u094d\u0928 (APR)",
      interest: "\u092c\u094d\u092f\u093e\u091c",
      benefits: "\u0932\u093e\u092d",
      emptyState: "\u091a\u092f\u0928\u093f\u0924 \u0936\u094d\u0930\u0947\u0923\u0940 \u0914\u0930 \u0916\u094b\u091c \u0915\u0947 \u0905\u0928\u0941\u0930\u0942\u092a \u0915\u094b\u0908 \u092f\u094b\u091c\u0928\u093e \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964",
      seniorBonus: "+{{value}}% \u0938\u0940\u0928\u093f\u092f\u0930"
    },
    info: {
      viewOnly: "\u092f\u0939 \u0935\u0930\u094d\u0915\u0938\u094d\u092a\u0947\u0938 \u0906\u092a\u0915\u0947 \u0916\u093e\u0924\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u0947\u0935\u0932 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u092e\u094b\u0921 \u092e\u0947\u0902 \u0909\u092a\u0932\u092c\u094d\u0927 \u0939\u0948\u0964 \u092f\u094b\u091c\u0928\u093e \u0928\u093f\u0930\u094d\u092e\u093e\u0923 \u0915\u0947\u0935\u0932 \u091c\u092e\u093e \u0938\u0947\u091f\u0905\u092a \u0905\u0927\u093f\u0915\u093e\u0930 \u0935\u093e\u0932\u0947 \u0938\u094d\u091f\u093e\u092b \u0915\u0947 \u0932\u093f\u090f \u0930\u0916\u093e \u0917\u092f\u093e \u0939\u0948\u0964"
    },
    drawer: {
      createDepositPlan: "\u091c\u092e\u093e \u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902",
      planCode: "\u092f\u094b\u091c\u0928\u093e \u0915\u094b\u0921",
      planName: "\u092f\u094b\u091c\u0928\u093e \u0928\u093e\u092e",
      planType: "\u092f\u094b\u091c\u0928\u093e \u092a\u094d\u0930\u0915\u093e\u0930",
      fixedDeposit: "\u0938\u094d\u0925\u093f\u0930 \u091c\u092e\u093e",
      recurringDeposit: "\u0906\u0935\u0930\u094d\u0924\u0940 \u091c\u092e\u093e",
      minMonths: "\u0928\u094d\u092f\u0942\u0928\u0924\u092e \u092e\u0939\u0940\u0928\u0947",
      maxMonths: "\u0905\u0927\u093f\u0915\u0924\u092e \u092e\u0939\u0940\u0928\u0947",
      interestRate: "\u092c\u094d\u092f\u093e\u091c \u0926\u0930",
      submitCreatePlan: "\u092f\u094b\u091c\u0928\u093e \u092c\u0928\u093e\u090f\u0902"
    },
    categories: {
      fd: "FD \u0916\u093e\u0924\u093e \u092f\u094b\u091c\u0928\u093e",
      dd: "DD \u0916\u093e\u0924\u093e \u092f\u094b\u091c\u0928\u093e",
      rd: "RD \u0916\u093e\u0924\u093e \u092f\u094b\u091c\u0928\u093e",
      mis: "MIS \u0916\u093e\u0924\u093e \u092f\u094b\u091c\u0928\u093e",
      "gold-loan": "\u0917\u094b\u0932\u094d\u0921 \u0932\u094b\u0928 \u092f\u094b\u091c\u0928\u093e",
      "vehicle-loan": "\u0935\u093e\u0939\u0928 \u0932\u094b\u0928 \u092f\u094b\u091c\u0928\u093e",
      "group-loan": "\u0917\u094d\u0930\u0941\u092a \u0932\u094b\u0928 \u092f\u094b\u091c\u0928\u093e",
      "personal-loan": "\u092a\u0930\u094d\u0938\u0928\u0932 \u0932\u094b\u0928 \u092f\u094b\u091c\u0928\u093e",
      "property-loan": "\u092a\u094d\u0930\u0949\u092a\u0930\u094d\u091f\u0940 \u0932\u094b\u0928 \u092f\u094b\u091c\u0928\u093e"
    }
  },
  mr: {
    hero: {
      eyebrow: "\u092f\u094b\u091c\u0928\u093e",
      title: "\u092f\u094b\u091c\u0928\u093e \u0915\u0945\u091f\u0932\u0949\u0917",
      description:
        "\u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u0920\u0947\u0935 \u0906\u0923\u093f \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e \u0935\u0930\u094d\u0917\u0940\u0915\u0943\u0924 \u0915\u0930\u093e \u0906\u0923\u093f \u0935\u094d\u092f\u093e\u091c\u0926\u0930 \u0935 \u092e\u0941\u0926\u0924 \u0930\u091a\u0928\u093e \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093f\u0924 \u0915\u0930\u093e.",
      searchPlaceholder: "\u0915\u0945\u091f\u0932\u0949\u0917 \u0936\u094b\u0927\u093e...",
      createPlan: "\u092f\u094b\u091c\u0928\u093e \u0924\u092f\u093e\u0930 \u0915\u0930\u093e"
    },
    metrics: {
      activePlans: { label: "\u0938\u0915\u094d\u0930\u093f\u092f \u092f\u094b\u091c\u0928\u093e", caption: "\u092a\u0921\u0924\u093e\u0933\u0932\u0947\u0932\u0940 \u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u0909\u0924\u094d\u092a\u093e\u0926\u0928\u0947." },
      pendingSetup: { label: "\u092a\u094d\u0930\u0932\u0902\u092c\u093f\u0924 \u0938\u0947\u091f\u0905\u092a", caption: "\u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930\u0923\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u092e\u0938\u0941\u0926\u093e \u091f\u0947\u092e\u094d\u092a\u094d\u0932\u0947\u091f\u094d\u0938." },
      productYield: { label: "\u0909\u0924\u094d\u092a\u093e\u0926 \u092a\u0930\u0924\u093e\u0935\u093e", caption: "\u0938\u0930\u093e\u0938\u0930\u0940 \u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u092a\u0930\u0924\u093e\u0935\u093e." },
      riskExposure: { label: "\u091c\u094b\u0916\u0940\u092e \u0909\u0918\u0921", caption: "\u0938\u0902\u0938\u094d\u0925\u093e\u0917\u0924 \u0926\u093e\u092f\u093f\u0924\u094d\u0935 \u0938\u0941\u0926\u0943\u0922 \u0906\u0939\u0947.", value: "\u0915\u092e\u0940" },
      fdPlans: { label: "FD \u092f\u094b\u091c\u0928\u093e", caption: "\u092e\u0941\u0926\u0924 \u0920\u0947\u0935 \u092a\u0930\u094d\u092f\u093e\u092f." },
      rdPlans: { label: "RD \u092f\u094b\u091c\u0928\u093e", caption: "\u0906\u0935\u0930\u094d\u0924\u0940 \u0920\u0947\u0935 \u092a\u0930\u094d\u092f\u093e\u092f." },
      avgInterest: { label: "\u0938\u0930\u093e\u0938\u0930\u0940 \u0935\u094d\u092f\u093e\u091c", caption: "\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u092f\u094b\u091c\u0928\u093e \u0926\u0930\u093e\u091a\u0940 \u0938\u0930\u093e\u0938\u0930\u0940." }
    },
    table: {
      planDetails: "\u092f\u094b\u091c\u0928\u093e \u0924\u092a\u0936\u0940\u0932",
      planCode: "\u092f\u094b\u091c\u0928\u093e \u0915\u094b\u0921",
      planName: "\u092f\u094b\u091c\u0928\u093e \u0928\u093e\u0935",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      requirements: "\u0906\u0935\u0936\u094d\u092f\u0915\u0924\u093e",
      tenureScope: "\u092e\u0941\u0926\u0924 \u0935\u094d\u092f\u093e\u092a\u094d\u0924\u0940",
      tenure: "\u092e\u0941\u0926\u0924",
      months: "\u092e\u0939\u093f\u0928\u0947",
      returnsApr: "\u092a\u0930\u0924\u093e\u0935\u093e (APR)",
      interest: "\u0935\u094d\u092f\u093e\u091c",
      benefits: "\u092b\u093e\u092f\u0926\u0947",
      emptyState: "\u0928\u093f\u0935\u0921\u0932\u0947\u0932\u094d\u092f\u093e \u0936\u094d\u0930\u0947\u0923\u0940 \u0906\u0923\u093f \u0936\u094b\u0927\u093e\u0938\u093e\u0920\u0940 \u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u092f\u094b\u091c\u0928\u093e \u0938\u093e\u092a\u0921\u0932\u0940 \u0928\u093e\u0939\u0940.",
      seniorBonus: "+{{value}}% \u091c\u0947\u0937\u094d\u0920"
    },
    info: {
      viewOnly: "\u0939\u093e \u0935\u0930\u094d\u0915\u0938\u094d\u092a\u0947\u0938 \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0916\u093e\u0924\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0915\u0947\u0935\u0933 \u092a\u0939\u093e\u0923\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0906\u0939\u0947. \u092f\u094b\u091c\u0928\u093e \u0924\u092f\u093e\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u091a\u093e \u0905\u0927\u093f\u0915\u093e\u0930 \u092b\u0915\u094d\u0924 \u0921\u093f\u092a\u0949\u091d\u093f\u091f \u0938\u0947\u091f\u0905\u092a \u0905\u0905\u0915\u094d\u0938\u0947\u0938 \u0905\u0938\u0932\u0947\u0932\u094d\u092f\u093e \u0938\u094d\u091f\u093e\u092b\u0938\u093e\u0920\u0940 \u0930\u093e\u0916\u0940\u0935 \u0906\u0939\u0947."
    },
    drawer: {
      createDepositPlan: "\u0920\u0947\u0935 \u092f\u094b\u091c\u0928\u093e \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      planCode: "\u092f\u094b\u091c\u0928\u093e \u0915\u094b\u0921",
      planName: "\u092f\u094b\u091c\u0928\u093e \u0928\u093e\u0935",
      planType: "\u092f\u094b\u091c\u0928\u093e \u092a\u094d\u0930\u0915\u093e\u0930",
      fixedDeposit: "\u092e\u0941\u0926\u0924 \u0920\u0947\u0935",
      recurringDeposit: "\u0906\u0935\u0930\u094d\u0924\u0940 \u0920\u0947\u0935",
      minMonths: "\u0915\u092e\u0940\u0924 \u0915\u092e\u0940 \u092e\u0939\u093f\u0928\u0947",
      maxMonths: "\u091c\u093e\u0938\u094d\u0924\u0940\u0924 \u091c\u093e\u0938\u094d\u0924 \u092e\u0939\u093f\u0928\u0947",
      interestRate: "\u0935\u094d\u092f\u093e\u091c \u0926\u0930",
      submitCreatePlan: "\u092f\u094b\u091c\u0928\u093e \u0924\u092f\u093e\u0930 \u0915\u0930\u093e"
    },
    categories: {
      fd: "FD \u0916\u093e\u0924\u0947 \u092f\u094b\u091c\u0928\u093e",
      dd: "DD \u0916\u093e\u0924\u0947 \u092f\u094b\u091c\u0928\u093e",
      rd: "RD \u0916\u093e\u0924\u0947 \u092f\u094b\u091c\u0928\u093e",
      mis: "MIS \u0916\u093e\u0924\u0947 \u092f\u094b\u091c\u0928\u093e",
      "gold-loan": "\u0938\u094b\u0928\u0947 \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e",
      "vehicle-loan": "\u0935\u093e\u0939\u0928 \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e",
      "group-loan": "\u0917\u091f \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e",
      "personal-loan": "\u0935\u0948\u092f\u0915\u094d\u0924\u093f\u0915 \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e",
      "property-loan": "\u092e\u093e\u0932\u092e\u0924\u094d\u0924\u093e \u0915\u0930\u094d\u091c \u092f\u094b\u091c\u0928\u093e"
    }
  }
};

export function getPlanCatalogueCopy(locale: AppLocale) {
  return planCatalogueCopy[locale] ?? planCatalogueCopy.en;
}
