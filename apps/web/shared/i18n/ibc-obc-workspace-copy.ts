import type { AppLocale } from "./translations";

type InstrumentStatus = "ENTERED" | "CLEARED" | "RETURNED" | "CANCELLED";
type IbcObcType = "IBC" | "OBC";

type IbcObcWorkspaceCopy = {
  hero: { eyebrow: string; title: string; description: string };
  metrics: {
    totalInstruments: { label: string; caption: string };
    totalAmount: { label: string; caption: string };
    ibc: { label: string; caption: string };
    obc: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    type: string;
    allTypes: string;
    status: string;
    allStatuses: string;
    newInstrument: string;
    changeStatus: string;
    cancel: string;
    create: string;
    creating: string;
    update: string;
    updating: string;
  };
  table: {
    instrumentNumber: string;
    type: string;
    amount: string;
    entryDate: string;
    status: string;
    actions: string;
    emptyState: string;
  };
  errors: {
    loadFailed: string;
    requiredFields: string;
    createFailed: string;
    selectInstrument: string;
    statusUpdateFailed: string;
  };
  success: {
    created: string;
    statusChanged: string;
  };
  drawers: {
    newInstrument: string;
    changeStatus: string;
    instrumentNumber: string;
    type: string;
    accountIdOptional: string;
    customerIdOptional: string;
    amount: string;
    currentStatus: string;
    newStatus: string;
  };
  pagination: {
    rowsPerPage: string;
    displayedRows: string;
    nextPage: string;
    previousPage: string;
  };
  statuses: Record<InstrumentStatus, string>;
  types: Record<IbcObcType, string>;
};

const ibcObcWorkspaceCopy: Record<AppLocale, IbcObcWorkspaceCopy> = {
  en: {
    hero: { eyebrow: "Collections", title: "IBC/OBC Instruments", description: "Manage inward and outward bill collection." },
    metrics: {
      totalInstruments: { label: "Total Instruments", caption: "Total IBC/OBC records." },
      totalAmount: { label: "Total Amount", caption: "Total instrument amount." },
      ibc: { label: "IBC", caption: "Inward Bill Collection." },
      obc: { label: "OBC", caption: "Outward Bill Collection." }
    },
    actions: {
      searchPlaceholder: "Search by instrument number...",
      type: "Type",
      allTypes: "All Types",
      status: "Status",
      allStatuses: "All Statuses",
      newInstrument: "New Instrument",
      changeStatus: "Change Status",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      update: "Update",
      updating: "Updating..."
    },
    table: {
      instrumentNumber: "Instrument Number",
      type: "Type",
      amount: "Amount",
      entryDate: "Entry Date",
      status: "Status",
      actions: "Actions",
      emptyState: "No IBC/OBC instruments found."
    },
    errors: {
      loadFailed: "Unable to load IBC/OBC instruments.",
      requiredFields: "Please fill required fields",
      createFailed: "Failed to create instrument",
      selectInstrument: "Please select an instrument",
      statusUpdateFailed: "Failed to update status"
    },
    success: {
      created: "Instrument created successfully",
      statusChanged: "Status changed to {{status}}"
    },
    drawers: {
      newInstrument: "New Instrument",
      changeStatus: "Change Status",
      instrumentNumber: "Instrument Number",
      type: "Type",
      accountIdOptional: "Account ID (optional)",
      customerIdOptional: "Customer ID (optional)",
      amount: "Amount",
      currentStatus: "Current Status: {{status}}",
      newStatus: "New Status"
    },
    pagination: {
      rowsPerPage: "Rows per page:",
      displayedRows: "{{from}}-{{to}} of {{count}}",
      nextPage: "Next page",
      previousPage: "Previous page"
    },
    statuses: {
      ENTERED: "Entered",
      CLEARED: "Cleared",
      RETURNED: "Returned",
      CANCELLED: "Cancelled"
    },
    types: {
      IBC: "IBC",
      OBC: "OBC"
    }
  },
  hi: {
    hero: { eyebrow: "\u0915\u0932\u0947\u0915\u094d\u0936\u0928", title: "IBC/OBC \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f", description: "\u0907\u0928\u0935\u0930\u094d\u0921 \u0914\u0930 \u0906\u0909\u091f\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928 \u0915\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0930\u0947\u0902\u0964" },
    metrics: {
      totalInstruments: { label: "\u0915\u0941\u0932 \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f", caption: "\u0915\u0941\u0932 IBC/OBC \u0930\u093f\u0915\u0949\u0930\u094d\u0921\u094d\u0938\u0964" },
      totalAmount: { label: "\u0915\u0941\u0932 \u0930\u093e\u0936\u093f", caption: "\u0915\u0941\u0932 \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0930\u093e\u0936\u093f\u0964" },
      ibc: { label: "IBC", caption: "\u0907\u0928\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928\u0964" },
      obc: { label: "OBC", caption: "\u0906\u0909\u091f\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928\u0964" }
    },
    actions: {
      searchPlaceholder: "\u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0928\u0902\u092c\u0930 \u0938\u0947 \u0916\u094b\u091c\u0947\u0902...",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      allTypes: "\u0938\u092d\u0940 \u092a\u094d\u0930\u0915\u093e\u0930",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      allStatuses: "\u0938\u092d\u0940 \u0938\u094d\u0925\u093f\u0924\u093f\u092f\u093e\u0901",
      newInstrument: "\u0928\u092f\u093e \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932\u0947\u0902",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902",
      create: "\u092c\u0928\u093e\u090f\u0902",
      creating: "\u092c\u0928\u093e\u092f\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948...",
      update: "\u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902",
      updating: "\u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0930\u0939\u093e \u0939\u0948..."
    },
    table: {
      instrumentNumber: "\u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0928\u0902\u092c\u0930",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      amount: "\u0930\u093e\u0936\u093f",
      entryDate: "\u090f\u0902\u091f\u094d\u0930\u0940 \u0924\u093e\u0930\u0940\u0916",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      actions: "\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908",
      emptyState: "\u0915\u094b\u0908 IBC/OBC \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964"
    },
    errors: {
      loadFailed: "IBC/OBC \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0947\u0964",
      requiredFields: "\u0915\u0943\u092a\u092f\u093e \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u0947\u0902",
      createFailed: "\u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u092c\u0928\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932",
      selectInstrument: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u091a\u0941\u0928\u0947\u0902",
      statusUpdateFailed: "\u0938\u094d\u0925\u093f\u0924\u093f \u0905\u092a\u0921\u0947\u091f \u0935\u093f\u092b\u0932"
    },
    success: {
      created: "\u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u092c\u0928 \u0917\u092f\u093e",
      statusChanged: "\u0938\u094d\u0925\u093f\u0924\u093f {{status}} \u092e\u0947\u0902 \u092c\u0926\u0932 \u0917\u0908"
    },
    drawers: {
      newInstrument: "\u0928\u092f\u093e \u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932\u0947\u0902",
      instrumentNumber: "\u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f \u0928\u0902\u092c\u0930",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      accountIdOptional: "\u0905\u0915\u093e\u0909\u0902\u091f ID (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      customerIdOptional: "\u0917\u094d\u0930\u093e\u0939\u0915 ID (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      amount: "\u0930\u093e\u0936\u093f",
      currentStatus: "\u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0938\u094d\u0925\u093f\u0924\u093f: {{status}}",
      newStatus: "\u0928\u0908 \u0938\u094d\u0925\u093f\u0924\u093f"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u0943\u0937\u094d\u0920 \u092a\u0902\u0915\u094d\u0924\u093f\u092f\u093e\u0901:",
      displayedRows: "{{count}} \u092e\u0947\u0902 \u0938\u0947 {{from}}-{{to}}",
      nextPage: "\u0905\u0917\u0932\u093e \u092a\u0943\u0937\u094d\u0920",
      previousPage: "\u092a\u093f\u091b\u0932\u093e \u092a\u0943\u0937\u094d\u0920"
    },
    statuses: {
      ENTERED: "\u0926\u0930\u094d\u091c",
      CLEARED: "\u0915\u094d\u0932\u093f\u092f\u0930",
      RETURNED: "\u0935\u093e\u092a\u0938",
      CANCELLED: "\u0930\u0926\u094d\u0926"
    },
    types: {
      IBC: "\u0907\u0928\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928",
      OBC: "\u0906\u0909\u091f\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928"
    }
  },
  mr: {
    hero: { eyebrow: "\u0915\u0932\u0947\u0915\u094d\u0936\u0928", title: "IBC/OBC \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f\u094d\u0938", description: "\u0907\u0928\u0935\u0930\u094d\u0921 \u0906\u0923\u093f \u0906\u0909\u091f\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928\u091a\u0947 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0928 \u0915\u0930\u093e." },
    metrics: {
      totalInstruments: { label: "\u090f\u0915\u0942\u0923 \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f\u094d\u0938", caption: "\u090f\u0915\u0942\u0923 IBC/OBC \u0928\u094b\u0902\u0926\u0940." },
      totalAmount: { label: "\u090f\u0915\u0942\u0923 \u0930\u0915\u094d\u0915\u092e", caption: "\u090f\u0915\u0942\u0923 \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u0930\u0915\u094d\u0915\u092e." },
      ibc: { label: "IBC", caption: "\u0907\u0928\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928." },
      obc: { label: "OBC", caption: "\u0906\u0909\u091f\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928." }
    },
    actions: {
      searchPlaceholder: "\u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u0915\u094d\u0930\u092e\u093e\u0902\u0915\u093e\u0928\u0947 \u0936\u094b\u0927\u093e...",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      allTypes: "\u0938\u0930\u094d\u0935 \u092a\u094d\u0930\u0915\u093e\u0930",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      allStatuses: "\u0938\u0930\u094d\u0935 \u0938\u094d\u0925\u093f\u0924\u0940",
      newInstrument: "\u0928\u0935\u0940\u0928 \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u0940 \u092c\u0926\u0932\u093e",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u093e",
      create: "\u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      creating: "\u0924\u092f\u093e\u0930 \u0915\u0930\u0924 \u0906\u0939\u0947...",
      update: "\u0905\u092a\u0921\u0947\u091f \u0915\u0930\u093e",
      updating: "\u0905\u092a\u0921\u0947\u091f \u0939\u094b\u0924 \u0906\u0939\u0947..."
    },
    table: {
      instrumentNumber: "\u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u0915\u094d\u0930\u092e\u093e\u0902\u0915",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      amount: "\u0930\u0915\u094d\u0915\u092e",
      entryDate: "\u0928\u094b\u0902\u0926 \u0926\u093f\u0928\u093e\u0902\u0915",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      actions: "\u0915\u093e\u0930\u0935\u093e\u0908",
      emptyState: "\u0915\u094b\u0923\u0924\u0947\u0939\u0940 IBC/OBC \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f\u094d\u0938 \u0938\u093e\u092a\u0921\u0932\u0947 \u0928\u093e\u0939\u0940\u0924."
    },
    errors: {
      loadFailed: "IBC/OBC \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f\u094d\u0938 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940\u0924.",
      requiredFields: "\u0915\u0943\u092a\u092f\u093e \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u093e",
      createFailed: "\u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u0924\u092f\u093e\u0930 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940",
      selectInstrument: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u0928\u093f\u0935\u0921\u093e",
      statusUpdateFailed: "\u0938\u094d\u0925\u093f\u0924\u0940 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940"
    },
    success: {
      created: "\u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0924\u092f\u093e\u0930 \u091d\u093e\u0932\u0947",
      statusChanged: "\u0938\u094d\u0925\u093f\u0924\u0940 {{status}} \u092e\u0927\u094d\u092f\u0947 \u092c\u0926\u0932\u0932\u0940"
    },
    drawers: {
      newInstrument: "\u0928\u0935\u0940\u0928 \u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u0940 \u092c\u0926\u0932\u093e",
      instrumentNumber: "\u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f \u0915\u094d\u0930\u092e\u093e\u0902\u0915",
      type: "\u092a\u094d\u0930\u0915\u093e\u0930",
      accountIdOptional: "\u0905\u0915\u093e\u0909\u0902\u091f ID (\u090f\u091a\u094d\u091b\u093f\u0915)",
      customerIdOptional: "\u0917\u094d\u0930\u093e\u0939\u0915 ID (\u090f\u091a\u094d\u091b\u093f\u0915)",
      amount: "\u0930\u0915\u094d\u0915\u092e",
      currentStatus: "\u0938\u0927\u094d\u092f\u093e\u091a\u0940 \u0938\u094d\u0925\u093f\u0924\u0940: {{status}}",
      newStatus: "\u0928\u0935\u0940\u0928 \u0938\u094d\u0925\u093f\u0924\u0940"
    },
    pagination: {
      rowsPerPage: "\u092a\u094d\u0930\u0924\u093f \u092a\u093e\u0928 \u0913\u0933\u0940:",
      displayedRows: "{{count}} \u092a\u0948\u0915\u0940 {{from}}-{{to}}",
      nextPage: "\u092a\u0941\u0922\u0940\u0932 \u092a\u093e\u0928",
      previousPage: "\u092e\u093e\u0917\u0940\u0932 \u092a\u093e\u0928"
    },
    statuses: {
      ENTERED: "\u0928\u094b\u0902\u0926",
      CLEARED: "\u0915\u094d\u0932\u093f\u0905\u0930",
      RETURNED: "\u092a\u0930\u0924 \u0906\u0932\u0947\u0932\u0947",
      CANCELLED: "\u0930\u0926\u094d\u0926"
    },
    types: {
      IBC: "\u0907\u0928\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928",
      OBC: "\u0906\u0909\u091f\u0935\u0930\u094d\u0921 \u092c\u093f\u0932 \u0915\u0932\u0947\u0915\u094d\u0936\u0928"
    }
  }
};

export function getIbcObcWorkspaceCopy(locale: AppLocale) {
  return ibcObcWorkspaceCopy[locale] ?? ibcObcWorkspaceCopy.en;
}
