import type { AppLocale } from "./translations";

type SocietyDashboardPageCopy = {
  localeTag: string;
  shell: {
    accountTypeLabel: string;
    branchFallback: string;
    viewerFallback: string;
  };
  sections: {
    administration: string;
    operations: string;
    bankingServices: string;
    additionalServices: string;
    otherModules: string;
  };
  nav: {
    dashboard: string;
    societyProfile: string;
    branches: string;
    userAccess: string;
    fieldAgents: string;
    clients: string;
    shareRegister: string;
    guarantors: string;
    coApplicants: string;
    auditTrail: string;
    accounts: string;
    plans: string;
    ledger: string;
    loans: string;
    cheque: string;
    locker: string;
    investments: string;
    demandDrafts: string;
    ibcObc: string;
    reports: string;
    userDirectory: string;
    monitoring: string;
  };
  branchScope: {
    title: string;
    description: string;
    allBranches: string;
  };
  feedback: {
    loadDashboardError: string;
    saveSocietySuccess: string;
    saveSocietyError: string;
    saveBranchSuccessCreate: string;
    saveBranchSuccessUpdate: string;
    saveBranchError: string;
    deleteBranchConfirm: string;
    deleteBranchSuccess: string;
    deleteBranchError: string;
    saveUserSuccessCreate: string;
    saveUserSuccessUpdate: string;
    saveUserError: string;
    deleteUserConfirm: string;
    deleteUserSuccess: string;
    deleteUserError: string;
    userActivated: string;
    userDeactivated: string;
    userStatusError: string;
    accessUpdated: string;
    accessUpdateError: string;
    agentUnlinked: string;
    agentLoadError: string;
    agentSaveSuccess: string;
    agentSaveError: string;
  };
};

const societyDashboardPageCopy: Record<AppLocale, SocietyDashboardPageCopy> = {
  en: {
    localeTag: "en-IN",
    shell: {
      accountTypeLabel: "Society Dashboard",
      branchFallback: "Branch",
      viewerFallback: "Society User"
    },
    sections: {
      administration: "Administration",
      operations: "Operations",
      bankingServices: "Banking Services",
      additionalServices: "Additional Services",
      otherModules: "Other Modules"
    },
    nav: {
      dashboard: "Dashboard",
      societyProfile: "Society Profile",
      branches: "Branches",
      userAccess: "User Access",
      fieldAgents: "Field Agents",
      clients: "Clients",
      shareRegister: "Share Register",
      guarantors: "Guarantors",
      coApplicants: "Co-applicants",
      auditTrail: "Audit Trail",
      accounts: "Accounts",
      plans: "Plans",
      ledger: "Ledger",
      loans: "Loans",
      cheque: "Cheque",
      locker: "Locker",
      investments: "Investments",
      demandDrafts: "Demand Drafts",
      ibcObc: "IBC/OBC",
      reports: "Reports",
      userDirectory: "User Directory",
      monitoring: "Monitoring"
    },
    branchScope: {
      title: "Branch Scope",
      description: "Focus the administration workspace on a specific branch when you need a local view.",
      allBranches: "All branches"
    },
    feedback: {
      loadDashboardError: "Unable to load the society dashboard.",
      saveSocietySuccess: "Society profile saved.",
      saveSocietyError: "Unable to save the society profile.",
      saveBranchSuccessCreate: "Branch created.",
      saveBranchSuccessUpdate: "Branch updated.",
      saveBranchError: "Unable to save the branch.",
      deleteBranchConfirm: "Delete this branch?",
      deleteBranchSuccess: "Branch deleted.",
      deleteBranchError: "Unable to delete the branch.",
      saveUserSuccessCreate: "User account created.",
      saveUserSuccessUpdate: "User account updated.",
      saveUserError: "Unable to save the account.",
      deleteUserConfirm: "Remove {{name}}'s account?",
      deleteUserSuccess: "User account removed.",
      deleteUserError: "Unable to remove the account.",
      userActivated: "User activated.",
      userDeactivated: "User deactivated.",
      userStatusError: "Unable to update the user status.",
      accessUpdated: "Access updated.",
      accessUpdateError: "Unable to update module access.",
      agentUnlinked: "This agent is not linked to a customer profile yet.",
      agentLoadError: "Unable to load agent details.",
      agentSaveSuccess: "Agent updated.",
      agentSaveError: "Unable to save the agent."
    }
  },
  hi: {
    localeTag: "hi-IN",
    shell: {
      accountTypeLabel: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
      branchFallback: "\u0936\u093e\u0916\u093e",
      viewerFallback: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0909\u092a\u092f\u094b\u0917\u0915\u0930\u094d\u0924\u093e"
    },
    sections: {
      administration: "\u092a\u094d\u0930\u0936\u093e\u0938\u0928",
      operations: "\u0911\u092a\u0930\u0947\u0936\u0928",
      bankingServices: "\u092c\u0948\u0902\u0915\u093f\u0902\u0917 \u0938\u0947\u0935\u093e\u090f\u0902",
      additionalServices: "\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0938\u0947\u0935\u093e\u090f\u0902",
      otherModules: "\u0905\u0928\u094d\u092f \u092e\u0949\u0921\u094d\u092f\u0942\u0932"
    },
    nav: {
      dashboard: "\u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921",
      societyProfile: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
      branches: "\u0936\u093e\u0916\u093e\u090f\u0902",
      userAccess: "\u092f\u0942\u091c\u0930 \u090f\u0915\u094d\u0938\u0947\u0938",
      fieldAgents: "\u092b\u0940\u0932\u094d\u0921 \u090f\u091c\u0947\u0902\u091f",
      clients: "\u0915\u094d\u0932\u093e\u0907\u0902\u091f",
      shareRegister: "\u0936\u0947\u092f\u0930 \u0930\u091c\u093f\u0938\u094d\u091f\u0930",
      guarantors: "\u0917\u093e\u0930\u0902\u091f\u0930",
      coApplicants: "\u0938\u0939-\u0906\u0935\u0947\u0926\u0915",
      auditTrail: "\u0911\u0921\u093f\u091f \u091f\u094d\u0930\u0947\u0932",
      accounts: "\u0916\u093e\u0924\u0947",
      plans: "\u092f\u094b\u091c\u0928\u093e\u090f\u0902",
      ledger: "\u0932\u0947\u091c\u0930",
      loans: "\u0915\u0930\u094d\u091c",
      cheque: "\u091a\u0947\u0915",
      locker: "\u0932\u0949\u0915\u0930",
      investments: "\u0928\u093f\u0935\u0947\u0936",
      demandDrafts: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
      ibcObc: "IBC/OBC",
      reports: "\u0930\u093f\u092a\u094b\u0930\u094d\u091f",
      userDirectory: "\u092f\u0942\u091c\u0930 \u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940",
      monitoring: "\u092e\u0949\u0928\u093f\u091f\u0930\u093f\u0902\u0917"
    },
    branchScope: {
      title: "\u0936\u093e\u0916\u093e \u0926\u093e\u092f\u0930\u093e",
      description: "\u091c\u092c \u0906\u092a\u0915\u094b \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0926\u0943\u0936\u094d\u092f \u091a\u093e\u0939\u093f\u090f, \u0924\u092c \u092a\u094d\u0930\u0936\u093e\u0938\u0928 \u0935\u0930\u094d\u0915\u0938\u094d\u092a\u0947\u0938 \u0915\u094b \u0915\u093f\u0938\u0940 \u0935\u093f\u0936\u093f\u0937\u094d\u091f \u0936\u093e\u0916\u093e \u092a\u0930 \u0915\u0947\u0902\u0926\u094d\u0930\u093f\u0924 \u0915\u0930\u0947\u0902\u0964",
      allBranches: "\u0938\u092d\u0940 \u0936\u093e\u0916\u093e\u090f\u0902"
    },
    feedback: {
      loadDashboardError: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
      saveSocietySuccess: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0938\u0947\u0935 \u0939\u094b \u0917\u0908\u0964",
      saveSocietyError: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0940\u0964",
      saveBranchSuccessCreate: "\u0936\u093e\u0916\u093e \u092c\u0928\u093e \u0926\u0940 \u0917\u0908\u0964",
      saveBranchSuccessUpdate: "\u0936\u093e\u0916\u093e \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u0908\u0964",
      saveBranchError: "\u0936\u093e\u0916\u093e \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0940\u0964",
      deleteBranchConfirm: "\u0915\u094d\u092f\u093e \u0906\u092a \u0907\u0938 \u0936\u093e\u0916\u093e \u0915\u094b \u0939\u091f\u093e\u0928\u093e \u091a\u093e\u0939\u0924\u0947 \u0939\u0948\u0902?",
      deleteBranchSuccess: "\u0936\u093e\u0916\u093e \u0939\u091f\u093e \u0926\u0940 \u0917\u0908\u0964",
      deleteBranchError: "\u0936\u093e\u0916\u093e \u0939\u091f\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932\u0964",
      saveUserSuccessCreate: "\u092f\u0942\u091c\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u092c\u0928\u093e \u0926\u093f\u092f\u093e \u0917\u092f\u093e\u0964",
      saveUserSuccessUpdate: "\u092f\u0942\u091c\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u092f\u093e\u0964",
      saveUserError: "\u0905\u0915\u093e\u0909\u0902\u091f \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
      deleteUserConfirm: "{{name}} \u0915\u093e \u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u093e\u090f\u0901?",
      deleteUserSuccess: "\u092f\u0942\u091c\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u093e \u0926\u093f\u092f\u093e \u0917\u092f\u093e\u0964",
      deleteUserError: "\u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u093e\u0928\u0947 \u092e\u0947\u0902 \u0935\u093f\u092b\u0932\u0964",
      userActivated: "\u092f\u0942\u091c\u0930 \u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930 \u0926\u093f\u092f\u093e \u0917\u092f\u093e\u0964",
      userDeactivated: "\u092f\u0942\u091c\u0930 \u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f \u0915\u0930 \u0926\u093f\u092f\u093e \u0917\u092f\u093e\u0964",
      userStatusError: "\u092f\u0942\u091c\u0930 \u0938\u094d\u0925\u093f\u0924\u093f \u0905\u092a\u0921\u0947\u091f \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u0940\u0964",
      accessUpdated: "\u090f\u0915\u094d\u0938\u0947\u0938 \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u092f\u093e\u0964",
      accessUpdateError: "\u092e\u0949\u0921\u094d\u092f\u0942\u0932 \u090f\u0915\u094d\u0938\u0947\u0938 \u0905\u092a\u0921\u0947\u091f \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
      agentUnlinked: "\u092f\u0939 \u090f\u091c\u0947\u0902\u091f \u0905\u092d\u0940 \u0915\u0938\u094d\u091f\u092e\u0930 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0938\u0947 \u091c\u0941\u0921\u093c\u093e \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
      agentLoadError: "\u090f\u091c\u0947\u0902\u091f \u0935\u093f\u0935\u0930\u0923 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964",
      agentSaveSuccess: "\u090f\u091c\u0947\u0902\u091f \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u092f\u093e\u0964",
      agentSaveError: "\u090f\u091c\u0947\u0902\u091f \u0938\u0947\u0935 \u0928\u0939\u0940\u0902 \u0939\u094b \u0938\u0915\u093e\u0964"
    }
  },
  mr: {
    localeTag: "mr-IN",
    shell: {
      accountTypeLabel: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0921\u0945\u0936\u092c\u094b\u0930\u094d\u0921",
      branchFallback: "\u0936\u093e\u0916\u093e",
      viewerFallback: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0935\u093e\u092a\u0930\u0915\u0930\u094d\u0924\u093e"
    },
    sections: {
      administration: "\u092a\u094d\u0930\u0936\u093e\u0938\u0928",
      operations: "\u0911\u092a\u0930\u0947\u0936\u0928\u094d\u0938",
      bankingServices: "\u092c\u0945\u0902\u0915\u093f\u0902\u0917 \u0938\u0947\u0935\u093e",
      additionalServices: "\u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0938\u0947\u0935\u093e",
      otherModules: "\u0907\u0924\u0930 \u092e\u0949\u0921\u094d\u092f\u0942\u0932"
    },
    nav: {
      dashboard: "\u0921\u0945\u0936\u092c\u094b\u0930\u094d\u0921",
      societyProfile: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
      branches: "\u0936\u093e\u0916\u093e",
      userAccess: "\u092f\u0941\u091c\u0930 \u0905\u0945\u0915\u094d\u0938\u0947\u0938",
      fieldAgents: "\u092b\u0940\u0932\u094d\u0921 \u090f\u091c\u0902\u091f",
      clients: "\u0915\u094d\u0932\u093e\u092f\u0902\u091f",
      shareRegister: "\u0936\u0947\u0905\u0930 \u0930\u091c\u093f\u0938\u094d\u091f\u0930",
      guarantors: "\u0917\u0945\u0930\u0902\u091f\u0930",
      coApplicants: "\u0938\u0939-\u0905\u0930\u094d\u091c\u0926\u093e\u0930",
      auditTrail: "\u0911\u0921\u093f\u091f \u091f\u094d\u0930\u0947\u0932",
      accounts: "\u0916\u093e\u0924\u0947",
      plans: "\u092f\u094b\u091c\u0928\u093e",
      ledger: "\u0932\u0947\u091c\u0930",
      loans: "\u0915\u0930\u094d\u091c",
      cheque: "\u091a\u0947\u0915",
      locker: "\u0932\u0949\u0915\u0930",
      investments: "\u0917\u0941\u0902\u0924\u0935\u0923\u0942\u0915",
      demandDrafts: "\u0921\u093f\u092e\u093e\u0902\u0921 \u0921\u094d\u0930\u093e\u092b\u094d\u091f",
      ibcObc: "IBC/OBC",
      reports: "\u0905\u0939\u0935\u093e\u0932",
      userDirectory: "\u092f\u0941\u091c\u0930 \u0921\u093e\u092f\u0930\u0947\u0915\u094d\u091f\u0930\u0940",
      monitoring: "\u0928\u093f\u0930\u0940\u0915\u094d\u0937\u0923"
    },
    branchScope: {
      title: "\u0936\u093e\u0916\u093e \u0935\u094d\u092f\u093e\u092a\u094d\u0924\u0940",
      description: "\u091c\u0947\u0935\u094d\u0939\u093e \u0938\u094d\u0925\u093e\u0928\u093f\u0915 \u0926\u0943\u0936\u094d\u092f \u0939\u0935\u093e \u0905\u0938\u0947\u0932, \u0924\u0947\u0935\u094d\u0939\u093e \u092a\u094d\u0930\u0936\u093e\u0938\u0928 \u0935\u0930\u094d\u0915\u0938\u094d\u092a\u0947\u0938 \u090f\u0915\u093e \u0935\u093f\u0936\u093f\u0937\u094d\u091f \u0936\u093e\u0916\u0947\u0935\u0930 \u0915\u0947\u0902\u0926\u094d\u0930\u093f\u0924 \u0915\u0930\u093e.",
      allBranches: "\u0938\u0930\u094d\u0935 \u0936\u093e\u0916\u093e"
    },
    feedback: {
      loadDashboardError: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u0921\u0945\u0936\u092c\u094b\u0930\u094d\u0921 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u093e \u0928\u093e\u0939\u0940.",
      saveSocietySuccess: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u091c\u0924\u0928 \u0915\u0947\u0932\u0940.",
      saveSocietyError: "\u0938\u094b\u0938\u093e\u092f\u091f\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u091c\u0924\u0928 \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940.",
      saveBranchSuccessCreate: "\u0936\u093e\u0916\u093e \u0924\u092f\u093e\u0930 \u0915\u0947\u0932\u0940.",
      saveBranchSuccessUpdate: "\u0936\u093e\u0916\u093e \u0905\u092a\u0921\u0947\u091f \u0915\u0947\u0932\u0940.",
      saveBranchError: "\u0936\u093e\u0916\u093e \u091c\u0924\u0928 \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940.",
      deleteBranchConfirm: "\u0939\u0940 \u0936\u093e\u0916\u093e \u0939\u091f\u0935\u093e\u092f\u091a\u0940 \u0906\u0939\u0947 \u0915\u093e?",
      deleteBranchSuccess: "\u0936\u093e\u0916\u093e \u0939\u091f\u0935\u0932\u0940.",
      deleteBranchError: "\u0936\u093e\u0916\u093e \u0939\u091f\u0935\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940.",
      saveUserSuccessCreate: "\u092f\u0941\u091c\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u0924\u092f\u093e\u0930 \u0915\u0947\u0932\u0947.",
      saveUserSuccessUpdate: "\u092f\u0941\u091c\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u0905\u092a\u0921\u0947\u091f \u0915\u0947\u0932\u0947.",
      saveUserError: "\u0905\u0915\u093e\u0909\u0902\u091f \u091c\u0924\u0928 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940.",
      deleteUserConfirm: "{{name}} \u092f\u093e\u0902\u091a\u0947 \u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u0935\u093e\u092f\u091a\u0947 \u0915\u093e?",
      deleteUserSuccess: "\u092f\u0941\u091c\u0930 \u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u0935\u0932\u0947.",
      deleteUserError: "\u0905\u0915\u093e\u0909\u0902\u091f \u0939\u091f\u0935\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940.",
      userActivated: "\u092f\u0941\u091c\u0930 \u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0947\u0932\u093e.",
      userDeactivated: "\u092f\u0941\u091c\u0930 \u0928\u093f\u0937\u094d\u0915\u094d\u0930\u093f\u092f \u0915\u0947\u0932\u093e.",
      userStatusError: "\u092f\u0941\u091c\u0930 \u0938\u094d\u0925\u093f\u0924\u0940 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0924\u093e \u0906\u0932\u0940 \u0928\u093e\u0939\u0940.",
      accessUpdated: "\u0905\u0945\u0915\u094d\u0938\u0947\u0938 \u0905\u092a\u0921\u0947\u091f \u0915\u0947\u0932\u093e.",
      accessUpdateError: "\u092e\u0949\u0921\u094d\u092f\u0942\u0932 \u0905\u0945\u0915\u094d\u0938\u0947\u0938 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0924\u093e \u0906\u0932\u093e \u0928\u093e\u0939\u0940.",
      agentUnlinked: "\u0939\u093e \u090f\u091c\u0902\u091f \u0905\u091c\u0942\u0928 \u0917\u094d\u0930\u093e\u0939\u0915 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932\u0936\u0940 \u091c\u094b\u0921\u0932\u093e \u0917\u0947\u0932\u093e \u0928\u093e\u0939\u0940.",
      agentLoadError: "\u090f\u091c\u0902\u091f\u091a\u0947 \u0924\u092a\u0936\u0940\u0932 \u0932\u094b\u0921 \u0915\u0930\u0924\u093e \u0906\u0932\u0947 \u0928\u093e\u0939\u0940.",
      agentSaveSuccess: "\u090f\u091c\u0902\u091f \u0905\u092a\u0921\u0947\u091f \u0915\u0947\u0932\u093e.",
      agentSaveError: "\u090f\u091c\u0902\u091f \u091c\u0924\u0928 \u0915\u0930\u0924\u093e \u0906\u0932\u093e \u0928\u093e\u0939\u0940."
    }
  }
};

export function getSocietyDashboardPageCopy(locale: AppLocale) {
  return societyDashboardPageCopy[locale] ?? societyDashboardPageCopy.en;
}
