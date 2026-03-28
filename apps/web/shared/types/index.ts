export type UserRole = "CLIENT" | "AGENT" | "SUPER_USER" | "SUPER_ADMIN";
export type RegisterAccountType = "CLIENT" | "AGENT" | "SOCIETY";
export type AppAccountType = RegisterAccountType | "PLATFORM";
export type SubscriptionPlan = "FREE" | "PREMIUM";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";
export type SubscriptionScope = "USER" | "SOCIETY" | "PLATFORM";
export type SocietyStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type PaymentMethod = "UPI" | "DEBIT_CARD" | "CREDIT_CARD" | "NET_BANKING";
export type PaymentPurpose = "SUBSCRIPTION" | "SERVICE_CHARGE" | "LOAN_REPAYMENT" | "DEPOSIT_INSTALLMENT";
export type PaymentRequestStatus = "OPEN" | "PAID" | "EXPIRED" | "CANCELLED";
export type PaymentTransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";

export type Society = {
  id: string;
  code: string;
  name: string;
  status: SocietyStatus;
  acceptsDigitalPayments?: boolean;
  upiId?: string | null;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddress?: string | null;
  panNo?: string | null;
  tanNo?: string | null;
  gstNo?: string | null;
  category?: string | null;
  authorizedCapital?: number | null;
  paidUpCapital?: number | null;
  shareNominalValue?: number | null;
  registrationDate?: string | Date | null;
  registrationNumber?: string | null;
  registrationState?: string | null;
  registrationAuthority?: string | null;
};

export type Branch = {
  id: string;
  code: string;
  name: string;
  isHead: boolean;
  isActive: boolean;
  societyId: string;
  openingDate?: string | Date | null;
  contactEmail?: string | null;
  contactNo?: string | null;
  rechargeService: boolean;
  neftImpsService: boolean;
  ifscCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  lockerFacility: boolean;
};

export type AuthSubscription = {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyPrice: number;
  startsAt: string | Date;
  nextBillingDate?: string | Date | null;
  cancelAtPeriodEnd: boolean;
  scope: SubscriptionScope;
};

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive?: boolean;
  society?: Society | null;
  customerProfile?: {
    id: string;
    customerCode: string;
    firstName: string;
    lastName?: string | null;
    phone?: string | null;
  } | null;
  subscription?: AuthSubscription | null;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type Session = {
  accessToken: string;
  role: UserRole;
  accountType: AppAccountType;
  username: string;
  fullName: string;
  societyCode: string | null;
  subscriptionPlan: SubscriptionPlan | null;
  avatarDataUrl: string | null;
};

export type BillingPlansResponse = {
  currency: string;
  scope: "SOCIETY";
  plans: {
    id: SubscriptionPlan;
    name: string;
    monthlyPrice: number;
    adsEnabled: boolean;
    description: string;
  }[];
};

export type MonitoringOverview = {
  scope: "platform" | "assigned_society";
  totals: {
    societies: number;
    customers: number;
    accounts: number;
    transactions: number;
    totalBalance: number;
    successfulPaymentVolume: number;
  };
  userRoleBreakdown: Record<string, number>;
  societies: {
    id: string;
    code: string;
    name: string;
    status: SocietyStatus;
    isActive: boolean;
    activeUsers: number;
    customers: number;
    accounts: number;
    transactions: number;
    totalBalance: number;
    subscriptionPlan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatus;
    acceptsDigitalPayments: boolean;
    pendingPaymentRequests: number;
    successfulPaymentVolume: number;
  }[];
};

export type PaymentRequestItem = {
  id: string;
  title: string;
  description?: string | null;
  purpose: PaymentPurpose;
  amount: number;
  status: PaymentRequestStatus;
  dueDate?: string | Date | null;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  customer: {
    customerCode: string;
    fullName: string;
  };
  society: {
    code: string;
    name: string;
  };
};

export type PaymentTransactionItem = {
  id: string;
  purpose: PaymentPurpose;
  method: PaymentMethod;
  status: PaymentTransactionStatus;
  amount: number;
  gatewayReference: string;
  remark?: string | null;
  processedAt?: string | Date | null;
  createdAt: string | Date;
  customer: {
    customerCode: string;
    fullName: string;
  } | null;
  society: {
    code: string;
    name: string;
  };
};

export type PaymentsOverview = {
  scope: "platform" | "society" | "customer";
  society?: {
    id: string;
    code: string;
    name: string;
    acceptsDigitalPayments: boolean;
    upiId?: string | null;
  } | null;
  acceptsDigitalPayments: boolean;
  acceptedMethods: PaymentMethod[];
  societyCountWithDigitalCollections?: number;
  totals: {
    pendingRequests: number;
    completedPayments: number;
    totalPendingAmount: number;
    totalCollectedAmount: number;
  };
  requests: PaymentRequestItem[];
  recentTransactions: PaymentTransactionItem[];
};
