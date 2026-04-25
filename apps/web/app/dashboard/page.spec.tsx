import { render, waitFor } from "@testing-library/react";
import DashboardPage from "./page";
import { AppThemeProvider } from "@/shared/theme/app-theme-provider";
import { LanguageProvider } from "@/shared/i18n/language-provider";
import { getSession } from "@/shared/auth/session";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace
  })
}));

jest.mock("@/shared/auth/session", () => ({
  getDefaultDashboardPath: jest.fn((accountType: string) => {
    if (accountType === "CLIENT") return "/dashboard/client";
    if (accountType === "AGENT") return "/dashboard/agent";
    return "/dashboard/society";
  }),
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

  it("redirects society admins to the society dashboard", async () => {
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

    renderDashboard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/society"));
  });

  it("redirects clients to the client dashboard", async () => {
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

    renderDashboard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/client"));
  });

  it("redirects agents to the agent dashboard", async () => {
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

    renderDashboard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/agent"));
  });

  it("redirects anonymous visitors to login", async () => {
    (getSession as jest.Mock).mockReturnValue(null);

    renderDashboard();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
