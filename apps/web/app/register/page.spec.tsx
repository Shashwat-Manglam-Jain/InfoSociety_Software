import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import { getBillingPlans, registerClient, upgradeToPremium } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: jest.fn()
  })
}));

jest.mock("@/shared/api/client", () => ({
  getBillingPlans: jest.fn(),
  registerClient: jest.fn(),
  upgradeToPremium: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  setSession: jest.fn()
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getBillingPlans as jest.Mock).mockResolvedValue({
      currency: "INR",
      plans: [
        { id: "FREE", name: "Common", monthlyPrice: 0, adsEnabled: true, description: "Free plan" },
        { id: "PREMIUM", name: "Premium", monthlyPrice: 299, adsEnabled: false, description: "Premium plan" }
      ]
    });
  });

  it("creates a free account without triggering premium upgrade", async () => {
    (registerClient as jest.Mock).mockResolvedValue({
      accessToken: "token-free",
      user: {
        id: "user-1",
        username: "client-free",
        fullName: "Free Client",
        role: "CLIENT",
        society: { id: "soc-1", code: "SOC-HO", name: "Head Office" },
        subscription: {
          id: "sub-1",
          plan: "FREE"
        }
      }
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Free Client" } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "client-free" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Client@123" } });
    fireEvent.change(screen.getByLabelText(/society code/i), { target: { value: "SOC-HO" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(registerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "client-free",
          societyCode: "SOC-HO"
        })
      );
    });

    expect(upgradeToPremium).not.toHaveBeenCalled();
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-free",
        subscriptionPlan: "FREE"
      })
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("upgrades to premium when premium tab is selected", async () => {
    (registerClient as jest.Mock).mockResolvedValue({
      accessToken: "token-premium",
      user: {
        id: "user-2",
        username: "client-premium",
        fullName: "Premium Client",
        role: "CLIENT",
        society: { id: "soc-1", code: "SOC-HO", name: "Head Office" },
        subscription: {
          id: "sub-2",
          plan: "FREE"
        }
      }
    });
    (upgradeToPremium as jest.Mock).mockResolvedValue({
      message: "Premium plan activated",
      subscription: {
        id: "sub-2",
        plan: "PREMIUM"
      }
    });

    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("tab", { name: /premium/i }));
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Premium Client" } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "client-premium" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Client@123" } });
    fireEvent.change(screen.getByLabelText(/society code/i), { target: { value: "SOC-HO" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(upgradeToPremium).toHaveBeenCalledWith("token-premium");
    });

    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-premium",
        subscriptionPlan: "PREMIUM"
      })
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
