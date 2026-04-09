import type { AppLocale } from "./translations";

type InstrumentStatus = "ENTERED" | "CLEARED" | "RETURNED" | "CANCELLED";

type DemandDraftsWorkspaceCopy = {
  hero: { eyebrow: string; title: string; description: string };
  metrics: {
    totalDrafts: { label: string; caption: string };
    totalAmount: { label: string; caption: string };
    cleared: { label: string; caption: string };
    returned: { label: string; caption: string };
  };
  actions: {
    searchPlaceholder: string;
    status: string;
    allStatuses: string;
    newDraft: string;
    edit: string;
    changeStatus: string;
    cancel: string;
    create: string;
    creating: string;
    update: string;
    updating: string;
  };
  table: {
    draftNumber: string;
    beneficiary: string;
    amount: string;
    issuedDate: string;
    status: string;
    actions: string;
    emptyState: string;
  };
  errors: {
    loadFailed: string;
    requiredFields: string;
    createFailed: string;
    updateFailed: string;
    selectDraft: string;
    statusUpdateFailed: string;
  };
  success: { created: string; updated: string; statusChanged: string };
  drawers: {
    newDemandDraft: string;
    editDemandDraft: string;
    changeStatus: string;
    accountIdOptional: string;
    customerIdOptional: string;
    beneficiary: string;
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
};

const demandDraftsWorkspaceCopy: Record<AppLocale, DemandDraftsWorkspaceCopy> = {
  en: {
    hero: { eyebrow: "Instruments", title: "Demand Drafts", description: "Manage demand draft issuance, tracking, and status updates." },
    metrics: {
      totalDrafts: { label: "Total Drafts", caption: "Demand draft records." },
      totalAmount: { label: "Total Amount", caption: "Total draft amount." },
      cleared: { label: "Cleared", caption: "Successfully cleared drafts." },
      returned: { label: "Returned", caption: "Returned drafts." }
    },
    actions: {
      searchPlaceholder: "Search by beneficiary, draft number...",
      status: "Status",
      allStatuses: "All Statuses",
      newDraft: "New Draft",
      edit: "Edit",
      changeStatus: "Change Status",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      update: "Update",
      updating: "Updating..."
    },
    table: {
      draftNumber: "Draft Number",
      beneficiary: "Beneficiary",
      amount: "Amount",
      issuedDate: "Issued Date",
      status: "Status",
      actions: "Actions",
      emptyState: "No demand drafts found."
    },
    errors: {
      loadFailed: "Unable to load demand drafts.",
      requiredFields: "Please fill required fields",
      createFailed: "Failed to create demand draft",
      updateFailed: "Failed to update demand draft",
      selectDraft: "Please select a draft",
      statusUpdateFailed: "Failed to update status"
    },
    success: {
      created: "Demand draft created successfully",
      updated: "Demand draft updated successfully",
      statusChanged: "Status changed to {{status}}"
    },
    drawers: {
      newDemandDraft: "New Demand Draft",
      editDemandDraft: "Edit Demand Draft",
      changeStatus: "Change Status",
      accountIdOptional: "Account ID (optional)",
      customerIdOptional: "Customer ID (optional)",
      beneficiary: "Beneficiary",
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
    }
  },
  hi: {
    hero: { eyebrow: "\u0907\u0902\u0938\u094d\u091f\u094d\u0930\u0942\u092e\u0947\u0902\u091f\u094d\u0938", title: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f", description: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u091c\u093e\u0930\u0940 \u0915\u0930\u0928\u0947, \u091f\u094d\u0930\u0948\u0915\u093f\u0902\u0917 \u0914\u0930 \u0938\u094d\u0925\u093f\u0924\u093f \u0905\u092a\u0921\u0947\u091f \u0915\u093e \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u0915\u0930\u0947\u0902\u0964" },
    metrics: {
      totalDrafts: { label: "\u0915\u0941\u0932 \u0921\u094d\u0930\u093e\u092b\u094d\u091f", caption: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0930\u093f\u0915\u0949\u0930\u094d\u0921\u094d\u0938\u0964" },
      totalAmount: { label: "\u0915\u0941\u0932 \u0930\u093e\u0936\u093f", caption: "\u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0915\u0940 \u0915\u0941\u0932 \u0930\u093e\u0936\u093f\u0964" },
      cleared: { label: "\u0915\u094d\u0932\u093f\u092f\u0930", caption: "\u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u0915\u094d\u0932\u093f\u092f\u0930 \u0939\u0941\u090f \u0921\u094d\u0930\u093e\u092b\u094d\u091f\u0964" },
      returned: { label: "\u0935\u093e\u092a\u0938", caption: "\u0935\u093e\u092a\u0938 \u0932\u094c\u091f\u0947 \u0917\u090f \u0921\u094d\u0930\u093e\u092b\u094d\u091f\u0964" }
    },
    actions: {
      searchPlaceholder: "\u0932\u093e\u092d\u093e\u0930\u094d\u0925\u0940, \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0928\u0902\u092c\u0930 \u0938\u0947 \u0916\u094b\u091c\u0947\u0902...",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      allStatuses: "\u0938\u092d\u0940 \u0938\u094d\u0925\u093f\u0924\u093f\u092f\u093e\u0901",
      newDraft: "\u0928\u092f\u093e \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
      edit: "\u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0947\u0902",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932\u0947\u0902",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902",
      create: "\u092c\u0928\u093e\u090f\u0902",
      creating: "\u092c\u0928\u093e\u092f\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948...",
      update: "\u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902",
      updating: "\u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0930\u0939\u093e \u0939\u0948..."
    },
    table: {
      draftNumber: "\u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0928\u0902\u092c\u0930",
      beneficiary: "\u0932\u093e\u092d\u093e\u0930\u094d\u0925\u0940",
      amount: "\u0930\u093e\u0936\u093f",
      issuedDate: "\u091c\u093e\u0930\u0940 \u0924\u093e\u0930\u0940\u0916",
      status: "\u0938\u094d\u0925\u093f\u0924\u093f",
      actions: "\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908",
      emptyState: "\u0915\u094b\u0908 \u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964"
    },
    errors: {
      loadFailed: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0947\u0964",
      requiredFields: "\u0915\u0943\u092a\u092f\u093e \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u0947\u0902",
      createFailed: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u092c\u0928\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932",
      updateFailed: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0905\u092a\u0921\u0947\u091f \u0935\u093f\u092b\u0932",
      selectDraft: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u091a\u0941\u0928\u0947\u0902",
      statusUpdateFailed: "\u0938\u094d\u0925\u093f\u0924\u093f \u0905\u092a\u0921\u0947\u091f \u0935\u093f\u092b\u0932"
    },
    success: {
      created: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u092c\u0928 \u0917\u092f\u093e",
      updated: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u0905\u092a\u0921\u0947\u091f \u0939\u0941\u0906",
      statusChanged: "\u0938\u094d\u0925\u093f\u0924\u093f {{status}} \u092e\u0947\u0902 \u092c\u0926\u0932 \u0917\u0908"
    },
    drawers: {
      newDemandDraft: "\u0928\u092f\u093e \u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
      editDemandDraft: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0947\u0902",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u093f \u092c\u0926\u0932\u0947\u0902",
      accountIdOptional: "\u0905\u0915\u093e\u0909\u0902\u091f ID (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      customerIdOptional: "\u0917\u094d\u0930\u093e\u0939\u0915 ID (\u0935\u0948\u0915\u0932\u094d\u092a\u093f\u0915)",
      beneficiary: "\u0932\u093e\u092d\u093e\u0930\u094d\u0925\u0940",
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
    }
  },
  mr: {
    hero: { eyebrow: "\u0907\u0928\u094d\u0938\u094d\u091f\u094d\u0930\u0941\u092e\u0947\u0902\u091f\u094d\u0938", title: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f", description: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u091c\u093e\u0930\u0940 \u0915\u0930\u0923\u0947, \u091f\u094d\u0930\u0945\u0915\u093f\u0902\u0917 \u0906\u0923\u093f \u0938\u094d\u0925\u093f\u0924\u0940 \u0905\u092a\u0921\u0947\u091f \u092f\u093e\u0902\u091a\u0947 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0928 \u0915\u0930\u093e." },
    metrics: {
      totalDrafts: { label: "\u090f\u0915\u0942\u0923 \u0921\u094d\u0930\u093e\u092b\u094d\u091f", caption: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0928\u094b\u0902\u0926\u0940." },
      totalAmount: { label: "\u090f\u0915\u0942\u0923 \u0930\u0915\u094d\u0915\u092e", caption: "\u0921\u094d\u0930\u093e\u092b\u094d\u091f\u091a\u0940 \u090f\u0915\u0942\u0923 \u0930\u0915\u094d\u0915\u092e." },
      cleared: { label: "\u0915\u094d\u0932\u093f\u0905\u0930", caption: "\u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0915\u094d\u0932\u093f\u0905\u0930 \u091d\u093e\u0932\u0947\u0932\u0947 \u0921\u094d\u0930\u093e\u092b\u094d\u091f." },
      returned: { label: "\u092a\u0930\u0924 \u0906\u0932\u0947\u0932\u0947", caption: "\u092a\u0930\u0924 \u0906\u0932\u0947\u0932\u0947 \u0921\u094d\u0930\u093e\u092b\u094d\u091f." }
    },
    actions: {
      searchPlaceholder: "\u0932\u093e\u092d\u093e\u0930\u094d\u0925\u0940, \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0915\u094d\u0930\u092e\u093e\u0902\u0915 \u0928\u0947 \u0936\u094b\u0927\u093e...",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      allStatuses: "\u0938\u0930\u094d\u0935 \u0938\u094d\u0925\u093f\u0924\u0940",
      newDraft: "\u0928\u0935\u0940\u0928 \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
      edit: "\u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u093e",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u0940 \u092c\u0926\u0932\u093e",
      cancel: "\u0930\u0926\u094d\u0926 \u0915\u0930\u093e",
      create: "\u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
      creating: "\u0924\u092f\u093e\u0930 \u0915\u0930\u0924 \u0906\u0939\u0947...",
      update: "\u0905\u092a\u0921\u0947\u091f \u0915\u0930\u093e",
      updating: "\u0905\u092a\u0921\u0947\u091f \u0939\u094b\u0924 \u0906\u0939\u0947..."
    },
    table: {
      draftNumber: "\u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0915\u094d\u0930\u092e\u093e\u0902\u0915",
      beneficiary: "\u0932\u093e\u092d\u093e\u0930\u094d\u0925\u0940",
      amount: "\u0930\u0915\u094d\u0915\u092e",
      issuedDate: "\u091c\u093e\u0930\u0940 \u0924\u093e\u0930\u0940\u0916",
      status: "\u0938\u094d\u0925\u093f\u0924\u0940",
      actions: "\u0915\u093e\u0930\u0935\u093e\u0908",
      emptyState: "\u0915\u094b\u0923\u0924\u0947\u0939\u0940 \u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0938\u093e\u092a\u0921\u0932\u0947 \u0928\u093e\u0939\u0940\u0924."
    },
    errors: {
      loadFailed: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940\u0924.",
      requiredFields: "\u0915\u0943\u092a\u092f\u093e \u0906\u0935\u0936\u094d\u092f\u0915 \u092b\u0940\u0932\u094d\u0921 \u092d\u0930\u093e",
      createFailed: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0924\u092f\u093e\u0930 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940",
      updateFailed: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940",
      selectDraft: "\u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0928\u093f\u0935\u0921\u093e",
      statusUpdateFailed: "\u0938\u094d\u0925\u093f\u0924\u0940 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940"
    },
    success: {
      created: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0924\u092f\u093e\u0930 \u091d\u093e\u0932\u093e",
      updated: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u092f\u0936\u0938\u094d\u0935\u0940\u0930\u093f\u0924\u094d\u092f\u093e \u0905\u092a\u0921\u0947\u091f \u091d\u093e\u0932\u093e",
      statusChanged: "\u0938\u094d\u0925\u093f\u0924\u0940 {{status}} \u092e\u0927\u094d\u092f\u0947 \u092c\u0926\u0932\u0932\u0940"
    },
    drawers: {
      newDemandDraft: "\u0928\u0935\u0940\u0928 \u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
      editDemandDraft: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u093e",
      changeStatus: "\u0938\u094d\u0925\u093f\u0924\u0940 \u092c\u0926\u0932\u093e",
      accountIdOptional: "\u0905\u0915\u093e\u0909\u0902\u091f ID (\u090f\u091a\u094d\u091b\u093f\u0915)",
      customerIdOptional: "\u0917\u094d\u0930\u093e\u0939\u0915 ID (\u090f\u091a\u094d\u091b\u093f\u0915)",
      beneficiary: "\u0932\u093e\u092d\u093e\u0930\u094d\u0925\u0940",
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
    }
  }
};

export function getDemandDraftsWorkspaceCopy(locale: AppLocale) {
  return demandDraftsWorkspaceCopy[locale] ?? demandDraftsWorkspaceCopy.en;
}
