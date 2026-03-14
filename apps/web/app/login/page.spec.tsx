import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("switches demo hints by selected role tab", () => {
    render(<LoginPage />);

    expect(screen.getByText("Demo: client1 / Client@123")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Agent" }));
    expect(screen.getByText("Demo: agent1 / Agent@123")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Society" }));
    expect(screen.getByText("Demo: superuser / Super@123 (Society)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Superadmin" }));
    expect(screen.getByText("Demo: superadmin / Admin@123 (Platform)")).toBeInTheDocument();
  });

  it("stores session and redirects after successful login", async () => {
    (login as jest.Mock).mockResolvedValue({
      accessToken: "token-1",
      user: {
        id: "u1",
        username: "agent1",
        fullName: "Agent User",
        role: "AGENT",
        society: { code: "SOC-HO", id: "soc-1", name: "Head Office", status: "ACTIVE" }
      }
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByRole("tab", { name: "Agent" }));
    const usernameInput = screen.getByRole("textbox", { name: /username/i });
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "agent1" } });
    fireEvent.change(passwordInput, { target: { value: "Agent@123" } });
    fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

    await waitFor(() => expect(login).toHaveBeenCalledWith("agent1", "Agent@123"));
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "token-1",
        role: "AGENT",
        accountType: "AGENT"
      })
    );
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
