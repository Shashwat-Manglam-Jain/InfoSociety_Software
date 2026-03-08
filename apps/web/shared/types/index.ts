export type UserRole = "CLIENT" | "AGENT" | "SUPER_USER";
export type SubscriptionPlan = "FREE" | "PREMIUM";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

export type Society = {
  id: string;
  code: string;
  name: string;
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

export type AuthSubscription = {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyPrice: number;
  startsAt: string;
  nextBillingDate?: string | null;
  cancelAtPeriodEnd: boolean;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type Session = {
  accessToken: string;
  role: UserRole;
  username: string;
  fullName: string;
  societyCode: string | null;
  subscriptionPlan: SubscriptionPlan | null;
};

export type BillingPlansResponse = {
  currency: string;
  plans: {
    id: SubscriptionPlan;
    name: string;
    monthlyPrice: number;
    adsEnabled: boolean;
    description: string;
  }[];
};

export type MonitoringOverview = {
  scope: "all_societies" | "assigned_society";
  totals: {
    societies: number;
    customers: number;
    accounts: number;
    transactions: number;
    totalBalance: number;
  };
  userRoleBreakdown: Record<string, number>;
  societies: {
    id: string;
    code: string;
    name: string;
    activeUsers: number;
    customers: number;
    accounts: number;
    transactions: number;
    totalBalance: number;
  }[];
};
