import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import { getBillingPlans, registerSociety } from "@/shared/api/client";
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

    await waitFor(() => expect(getBillingPlans).toHaveBeenCalled());

    expect(screen.getByText("Society Enrollment Form")).toBeInTheDocument();
  });

  it("submits a pending society registration with generated credentials", async () => {
    (registerSociety as jest.Mock).mockResolvedValue({
      accessToken: "ignored-token",
      user: {
        id: "user-1",
        username: "headofficeadmin",
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
    fireEvent.change(screen.getByPlaceholderText("12-digit Aadhaar number"), {
      target: { value: "123456789012" }
    });
    fireEvent.change(screen.getByPlaceholderText("Create a secure password"), {
      target: { value: "Society@123" }
    });
    fireEvent.submit(screen.getByRole("button", { name: "Submit Society Enrollment" }).closest("form")!);

    await waitFor(() =>
      expect(registerSociety).toHaveBeenCalledWith({
        password: "Society@123",
        fullName: "Head Office Admin",
        societyName: "Head Office",
        aadhaarNumber: "123456789012",
        planId: "FREE"
      })
    );

    expect(push).toHaveBeenCalledWith("/login?from=register&societyCode=HEAD-OFFICE&username=headofficeadmin");
  });
});
