import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import { getBillingPlans, getPublicSocieties, registerSociety } from "@/shared/api/client";
import { LanguageProvider } from "@/shared/i18n/language-provider";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: jest.fn()
  })
}));

jest.mock("@/shared/api/client", () => ({
  getBillingPlans: jest.fn(),
  getPublicSocieties: jest.fn(),
  registerSociety: jest.fn()
}));

jest.mock("@/shared/ui/toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

function renderRegisterPage() {
  return render(
    <LanguageProvider>
      <RegisterPage />
    </LanguageProvider>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPublicSocieties as jest.Mock).mockResolvedValue([
      { id: "soc-1", code: "SOC-HO", name: "Head Office", status: "ACTIVE" },
      { id: "soc-2", code: "SOC-NB", name: "North Branch", status: "ACTIVE" }
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

  it("renders live platform data from the API", async () => {
    renderRegisterPage();

    await waitFor(() => expect(getPublicSocieties).toHaveBeenCalled());
    await waitFor(() => expect(getBillingPlans).toHaveBeenCalled());

    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("₹299/month")).toBeInTheDocument();
  });

  it("submits a pending society registration with generated credentials", async () => {
    (registerSociety as jest.Mock).mockResolvedValue({
      accessToken: "ignored-token",
      user: {
        id: "user-1",
        username: "adm_headoffice",
        fullName: "Head Office Admin",
        role: "SUPER_USER",
        requiresPasswordChange: false,
        society: { id: "soc-3", code: "HEAD-OFFICE", name: "Head Office", status: "PENDING" }
      }
    });

    renderRegisterPage();

    await waitFor(() => expect(getBillingPlans).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText("e.g. Skyline Cooperative Credit Society"), {
      target: { value: "Head Office" }
    });
    fireEvent.change(screen.getByPlaceholderText("Full name"), {
      target: { value: "Head Office Admin" }
    });
    fireEvent.change(screen.getByPlaceholderText("Create a secure password"), {
      target: { value: "Society@123" }
    });
    fireEvent.submit(screen.getByRole("button", { name: "Submit Society Enrollment" }).closest("form")!);

    await waitFor(() =>
      expect(registerSociety).toHaveBeenCalledWith({
        username: "adm_headoffice",
        password: "Society@123",
        fullName: "Head Office Admin",
        societyCode: "HEAD-OFFICE",
        societyName: "Head Office"
      })
    );

    expect(push).toHaveBeenCalledWith("/login?from=register");
  });
});
