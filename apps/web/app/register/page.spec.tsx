import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import { getBillingPlans, getPublicSocieties, registerClient, registerSociety } from "@/shared/api/client";
import { getDefaultDashboardPath, setSession } from "@/shared/auth/session";
import { LanguageProvider } from "@/shared/i18n/language-provider";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

jest.mock("@/shared/api/client", () => ({
  getBillingPlans: jest.fn(),
  getPublicSocieties: jest.fn(),
  registerClient: jest.fn(),
  registerAgentSelf: jest.fn(),
  registerSociety: jest.fn(),
  upgradeToPremium: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  getDefaultDashboardPath: jest.fn(),
  setSession: jest.fn()
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDefaultDashboardPath as jest.Mock).mockImplementation((accountType: string) =>
      accountType === "SOCIETY" ? "/dashboard/society" : "/dashboard"
    );
    (getPublicSocieties as jest.Mock).mockResolvedValue([
      { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" }
    ]);
    (getBillingPlans as jest.Mock).mockResolvedValue({
      currency: "INR",
      scope: "SOCIETY",
      plans: [
        { id: "FREE", name: "Common", monthlyPrice: 0, adsEnabled: true, description: "Common plan" },
        { id: "PREMIUM", name: "Premium", monthlyPrice: 299, adsEnabled: false, description: "Premium plan" }
      ]
    });
  });

  it("creates a client account inside an approved society", async () => {
    (registerClient as jest.Mock).mockResolvedValue({
      accessToken: "token-free",
      user: {
        id: "user-1",
        username: "client-free",
        fullName: "Free Client",
        role: "CLIENT",
        society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
        subscription: {
          id: "sub-1",
          plan: "FREE",
          scope: "SOCIETY"
        }
      }
    });

    render(
      <LanguageProvider>
        <RegisterPage />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Manual" }));
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Free Client" } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "client-free" } });
    fireEvent.change(screen.getByLabelText(/^password/i, { selector: "input" }), { target: { value: "Client@123" } });
    fireEvent.change(screen.getByLabelText(/^society code/i), { target: { value: "SOC-HO" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create Client Account" }).closest("form")!);

    await waitFor(() =>
      expect(registerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "client-free",
          societyCode: "SOC-HO"
        })
      )
    );

    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-free",
        accountType: "CLIENT",
        subscriptionPlan: "FREE"
      })
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  }, 15000);

  it("creates a society administrator account for an approved society", async () => {
    (registerSociety as jest.Mock).mockResolvedValue({
      accessToken: "token-society",
      user: {
        id: "user-2",
        username: "socadmin",
        fullName: "Society Admin",
        role: "SUPER_USER",
        society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
        subscription: {
          id: "soc-sub-1",
          plan: "FREE",
          scope: "SOCIETY"
        }
      }
    });

    render(
      <LanguageProvider>
        <RegisterPage />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole("tab", { name: "Society" }));
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Society Admin" } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "socadmin" } });
    fireEvent.change(screen.getByLabelText(/^password/i, { selector: "input" }), { target: { value: "Society@123" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create Society Account" }).closest("form")!);

    await waitFor(() =>
      expect(registerSociety).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "socadmin",
          societyCode: "SOCIETY-ADMI"
        })
      )
    );

    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-society",
        accountType: "SOCIETY",
        subscriptionPlan: "FREE"
      })
    );
    expect(push).toHaveBeenCalledWith("/dashboard/society");
  }, 15000);
});
