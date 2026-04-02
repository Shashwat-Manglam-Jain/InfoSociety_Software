import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "./page";
import { getMe } from "@/shared/api/client";
import { getMonitoringOverview } from "@/shared/api/monitoring";
import { getUserDirectory } from "@/shared/api/users";
import { AppThemeProvider } from "@/shared/theme/app-theme-provider";
import { LanguageProvider } from "@/shared/i18n/language-provider";
import { clearSession, getSession } from "@/shared/auth/session";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace
  })
}));

jest.mock("@/shared/api/client", () => ({
  getMe: jest.fn()
}));

jest.mock("@/shared/api/monitoring", () => ({
  getMonitoringOverview: jest.fn()
}));

jest.mock("@/shared/api/users", () => ({
  getUserDirectory: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  clearSession: jest.fn(),
  getSession: jest.fn()
}));

function renderDashboard() {
  return render(
    <AppThemeProvider>
      <LanguageProvider>
        <DashboardPage />
      </LanguageProvider>
    </AppThemeProvider>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("shows translated society admin controls when dashboard language is Hindi", async () => {
    window.localStorage.setItem("infopath.locale.v1", "hi");

    (getSession as jest.Mock).mockReturnValue({
      accessToken: "token-society",
      role: "SUPER_USER",
      accountType: "SOCIETY",
      username: "superuser",
      fullName: "Society Admin",
      societyCode: "SOC-HO",
      subscriptionPlan: "FREE",
      avatarDataUrl: null
    });

    (getMe as jest.Mock).mockResolvedValue({
      id: "user-1",
      username: "superuser",
      fullName: "Society Admin",
      role: "SUPER_USER",
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
      subscription: null
    });
    (getUserDirectory as jest.Mock).mockResolvedValue([]);
    (getMonitoringOverview as jest.Mock).mockResolvedValue({
      scope: "assigned_society",
      totals: {
        societies: 1,
        customers: 24,
        accounts: 48,
        transactions: 102,
        totalBalance: 500000,
        successfulPaymentVolume: 75000
      },
      userRoleBreakdown: {},
      societies: []
    });

    renderDashboard();

    expect((await screen.findAllByRole("link", { name: "हमारे बारे में" })).length).toBeGreaterThan(0);
    expect((await screen.findAllByRole("link", { name: "संपर्क" })).length).toBeGreaterThan(0);
    expect(await screen.findByRole("button", { name: "लॉग आउट" })).toBeInTheDocument();
    expect(await screen.findByText("सोसाइटी वर्कस्पेस")).toBeInTheDocument();
    expect(screen.queryByText("वर्कफ़्लो क्षेत्र")).not.toBeInTheDocument();
  });

  it("logs the user out from the dashboard header", async () => {
    (getSession as jest.Mock).mockReturnValue({
      accessToken: "token-client",
      role: "CLIENT",
      accountType: "CLIENT",
      username: "client1",
      fullName: "Demo Client",
      societyCode: "SOC-HO",
      subscriptionPlan: "FREE",
      avatarDataUrl: null
    });

    (getMe as jest.Mock).mockResolvedValue({
      id: "user-2",
      username: "client1",
      fullName: "Demo Client",
      role: "CLIENT",
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
      subscription: null
    });
    (getUserDirectory as jest.Mock).mockResolvedValue([]);
    (getMonitoringOverview as jest.Mock).mockResolvedValue(null);

    renderDashboard();

    const logoutButton = await screen.findByRole("button", { name: "Log out" });
    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(clearSession).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });

  it("shows agent-facing service areas without society admin setup cards", async () => {
    (getSession as jest.Mock).mockReturnValue({
      accessToken: "token-agent",
      role: "AGENT",
      accountType: "AGENT",
      username: "agent1",
      fullName: "Field Agent",
      societyCode: "SOC-HO",
      subscriptionPlan: "FREE",
      avatarDataUrl: null
    });

    (getMe as jest.Mock).mockResolvedValue({
      id: "user-3",
      username: "agent1",
      fullName: "Field Agent",
      role: "AGENT",
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
      subscription: null
    });
    (getUserDirectory as jest.Mock).mockResolvedValue([]);
    (getMonitoringOverview as jest.Mock).mockResolvedValue(null);

    renderDashboard();

    expect((await screen.findAllByText(/Serve members, complete branch work, and keep daily banking operations moving with confidence\./)).length).toBeGreaterThan(0);
    expect(await screen.findByText("Customer & KYC")).toBeInTheDocument();
    expect(screen.queryByText("Institution Profile")).not.toBeInTheDocument();
  });
});
