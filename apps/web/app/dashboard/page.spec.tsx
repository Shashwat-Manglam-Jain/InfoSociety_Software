import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "./page";
import { getMe, getPaymentsOverview } from "@/shared/api/client";
import { getSession } from "@/shared/auth/session";
import { LanguageProvider } from "@/shared/i18n/language-provider";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace
  })
}));

jest.mock("@/shared/api/client", () => ({
  getMe: jest.fn(),
  getMySubscription: jest.fn(),
  getMonitoringOverview: jest.fn(),
  getUserDirectory: jest.fn(),
  getPaymentsOverview: jest.fn(),
  listCustomers: jest.fn(),
  updateSocietyAccess: jest.fn(),
  createPaymentRequest: jest.fn(),
  payPaymentRequest: jest.fn(),
  upgradeToPremium: jest.fn(),
  cancelPremium: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  clearSession: jest.fn(),
  getSession: jest.fn(),
  setSession: jest.fn()
}));

describe("DashboardPage subscription ads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockReturnValue({
      accessToken: "token-1",
      role: "CLIENT",
      accountType: "CLIENT",
      username: "client1",
      fullName: "Demo Client",
      societyCode: "SOC-HO",
      subscriptionPlan: "FREE",
      avatarDataUrl: null
    });
    (getPaymentsOverview as jest.Mock).mockResolvedValue({
      scope: "customer",
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", acceptsDigitalPayments: true, upiId: "soc@upi" },
      acceptsDigitalPayments: true,
      acceptedMethods: ["UPI", "DEBIT_CARD"],
      totals: {
        pendingRequests: 1,
        completedPayments: 0,
        totalPendingAmount: 1200,
        totalCollectedAmount: 0
      },
      requests: [],
      recentTransactions: []
    });
  });

  it("shows sponsored ads card for free plan users", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      id: "user-1",
      username: "client1",
      fullName: "Demo Client",
      role: "CLIENT",
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
      subscription: {
        id: "sub-1",
        plan: "FREE",
        status: "ACTIVE",
        monthlyPrice: 0,
        startsAt: "2026-03-01T00:00:00.000Z",
        nextBillingDate: null,
        cancelAtPeriodEnd: false
      }
    });

    render(
      <LanguageProvider>
        <DashboardPage />
      </LanguageProvider>
    );

    expect(await screen.findByText("Sponsored")).toBeInTheDocument();
  });

  it("hides sponsored ads card for premium users", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      id: "user-2",
      username: "premium1",
      fullName: "Premium Client",
      role: "CLIENT",
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
      subscription: {
        id: "sub-2",
        plan: "PREMIUM",
        status: "ACTIVE",
        monthlyPrice: 299,
        startsAt: "2026-03-01T00:00:00.000Z",
        nextBillingDate: "2026-03-31T00:00:00.000Z",
        cancelAtPeriodEnd: false
      }
    });

    render(
      <LanguageProvider>
        <DashboardPage />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Sponsored")).not.toBeInTheDocument();
    });
  });
});
