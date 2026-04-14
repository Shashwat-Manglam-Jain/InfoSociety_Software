import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "./page";
import { getPublicSocieties, login } from "@/shared/api/client";
import { getDefaultDashboardPath, getSession, setSession } from "@/shared/auth/session";

const replace = jest.fn();
const prefetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace,
    prefetch
  })
}));

jest.mock("@/shared/api/client", () => ({
  getPublicSocieties: jest.fn(),
  login: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  getDefaultDashboardPath: jest.fn(),
  getSession: jest.fn(),
  setSession: jest.fn()
}));

jest.mock("@/shared/i18n/language-provider", () => ({
  useLanguage: () => ({
    locale: "en",
    localeOptions: [],
    setLocale: jest.fn(),
    t: jest.fn()
  })
}));

jest.mock("@/shared/ui/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockReturnValue(null);
    (getPublicSocieties as jest.Mock).mockResolvedValue([
      { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE", registrationState: "Maharashtra" }
    ]);
    (getDefaultDashboardPath as jest.Mock).mockImplementation((accountType: string) =>
      accountType === "SOCIETY" ? "/dashboard/society" : "/dashboard"
    );
  });

  it("renders the society-only login fields", async () => {
    render(<LoginPage />);

    await waitFor(() => expect(getPublicSocieties).toHaveBeenCalled());
    expect(screen.getByPlaceholderText("Search by society name or code")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. SOC-001")).toBeInTheDocument();
    expect(screen.getByText("Access Role")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("stores session and redirects after successful society login", async () => {
    (login as jest.Mock).mockResolvedValue({
      accessToken: "token-1",
      user: {
        id: "u1",
        username: "adm_skyline",
        fullName: "Society User",
        role: "SUPER_USER",
        requiresPasswordChange: false,
        allowedModuleSlugs: ["administration", "users"],
        society: { code: "SOC-HO", id: "soc-1", name: "Head Office", status: "ACTIVE" }
      }
    });

    render(<LoginPage />);

    const societySearchInput = screen.getByPlaceholderText("Search by society name or code");

    await waitFor(() => expect(getPublicSocieties).toHaveBeenCalled());
    fireEvent.change(societySearchInput, { target: { value: "Head Office" } });
    await waitFor(() => expect(screen.getByDisplayValue("SOC-HO")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText("e.g. adm_skyline"), { target: { value: "adm_skyline" } });
    fireEvent.change(screen.getByPlaceholderText("********"), { target: { value: "Agent@123" } });
    fireEvent.submit(screen.getByRole("button", { name: "Open Society Workspace" }).closest("form")!);

    await waitFor(() => expect(login).toHaveBeenCalledWith("adm_skyline", "Agent@123", "SOC-HO", "SUPER_USER"));
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-1",
        role: "SUPER_USER",
        accountType: "SOCIETY",
        allowedModuleSlugs: ["administration", "users"]
      })
    );
    expect(replace).toHaveBeenCalledWith("/dashboard/society");
  }, 15000);
});
