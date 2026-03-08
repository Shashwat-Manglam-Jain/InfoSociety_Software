export type UserRole = "CLIENT" | "AGENT" | "SUPER_USER";

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
