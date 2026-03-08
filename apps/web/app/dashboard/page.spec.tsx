import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "./page";
import { getMe } from "@/shared/api/client";
import { getSession } from "@/shared/auth/session";

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
      username: "client1",
      fullName: "Demo Client",
      societyCode: "SOC-HO",
      subscriptionPlan: "FREE"
    });
  });

  it("shows sponsored ads card for free plan users", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      id: "user-1",
      username: "client1",
      fullName: "Demo Client",
      role: "CLIENT",
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

    render(<DashboardPage />);

    expect(await screen.findByText("Sponsored")).toBeInTheDocument();
  });

  it("hides sponsored ads card for premium users", async () => {
    (getMe as jest.Mock).mockResolvedValue({
      id: "user-2",
      username: "premium1",
      fullName: "Premium Client",
      role: "CLIENT",
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

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText("Sponsored")).not.toBeInTheDocument();
    });
  });
});
