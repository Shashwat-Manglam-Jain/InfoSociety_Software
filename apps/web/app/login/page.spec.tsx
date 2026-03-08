import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import { login } from "@/shared/api/client";
import { setSession } from "@/shared/auth/session";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: jest.fn()
  })
}));

jest.mock("@/shared/api/client", () => ({
  login: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  setSession: jest.fn()
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("switches demo hints by selected role tab", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    expect(screen.getByText("Demo: client1 / Client@123")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Agent" }));
    expect(screen.getByText("Demo: agent1 / Agent@123")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Superuser" }));
    expect(screen.getByText("Demo: superuser / Super@123")).toBeInTheDocument();
  });

  it("stores session and redirects after successful login", async () => {
    const user = userEvent.setup();

    (login as jest.Mock).mockResolvedValue({
      accessToken: "token-1",
      user: {
        id: "u1",
        username: "agent1",
        fullName: "Agent User",
        role: "AGENT",
        society: { code: "SOC-HO", id: "soc-1", name: "Head Office" }
      }
    });

    render(<LoginPage />);

    await user.click(screen.getByRole("tab", { name: "Agent" }));
    const usernameInput = screen.getByRole("textbox", { name: /username/i });
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, "agent1");
    await user.type(passwordInput, "Agent@123");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(login).toHaveBeenCalledWith("agent1", "Agent@123");
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-1",
        role: "AGENT"
      })
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
