import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "./page";
import { getBillingPlans } from "@/shared/api/client";
import { getPublicSocieties } from "@/shared/api/auth";
import { getSession } from "@/shared/auth/session";
import { LanguageProvider } from "@/shared/i18n/language-provider";
import { AppThemeProvider } from "@/shared/theme/app-theme-provider";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace
  })
}));

jest.mock("@/shared/api/client", () => ({
  getBillingPlans: jest.fn()
}));

jest.mock("@/shared/api/auth", () => ({
  getPublicSocieties: jest.fn()
}));

jest.mock("@/shared/auth/session", () => ({
  getSession: jest.fn()
}));

function renderHomePage() {
  return render(
    <AppThemeProvider>
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>
    </AppThemeProvider>
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    (getSession as jest.Mock).mockReturnValue(null);
    (getBillingPlans as jest.Mock).mockResolvedValue({
      currency: "INR",
      scope: "SOCIETY",
      plans: []
    });
    (getPublicSocieties as jest.Mock).mockResolvedValue([]);
  });

  it("shows Hindi landing copy when the selected locale is Hindi", async () => {
    window.localStorage.setItem("infopath.locale.v1", "hi");

    renderHomePage();

    expect(await screen.findByText("आधुनिक सोसाइटी सेविंग्स और ब्याज ट्रैकिंग")).toBeInTheDocument();
    expect(screen.getByText("क्यों चुनें Infopath")).toBeInTheDocument();
    expect(screen.getByText("पूर्ण ऑपरेशन्स सूट")).toBeInTheDocument();
    await waitFor(() => expect(getBillingPlans).toHaveBeenCalled());
    await waitFor(() => expect(getPublicSocieties).toHaveBeenCalled());
  });
});
