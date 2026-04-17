import { clearSession, getSession, setSession, subscribeToSession } from "./session";

describe("session helpers", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);
    window.localStorage.clear();
  });

  function buildToken(expiresAtUnixSeconds: number) {
    const encode = (value: unknown) =>
      Buffer.from(JSON.stringify(value))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");

    return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ exp: expiresAtUnixSeconds })}.signature`;
  }

  it("normalizes invalid persisted account types and subscription plans", () => {
    window.localStorage.setItem(
      "infopath_session",
      JSON.stringify({
        accessToken: "token-1",
        role: "SUPER_USER",
        accountType: "INVALID",
        username: "admin1",
        fullName: "Admin User",
        subscriptionPlan: "UNKNOWN"
      })
    );

    expect(getSession()).toEqual(
      expect.objectContaining({
        accessToken: "token-1",
        role: "SUPER_USER",
        accountType: "SOCIETY",
        subscriptionPlan: null
      })
    );
  });

  it("notifies same-tab subscribers when session changes", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToSession(listener);

    return (async () => {
      await setSession({
        accessToken: "token-2",
        role: "CLIENT",
        accountType: "CLIENT",
        username: "client1",
        fullName: "Client One",
        societyCode: "SOC-HO",
        subscriptionPlan: "FREE",
        avatarDataUrl: null,
        requiresPasswordChange: false
      });
      await clearSession();

      expect(listener).toHaveBeenCalledTimes(2);
      unsubscribe();
    })();
  });

  it("drops expired sessions from local storage", () => {
    const now = 1_800_000_000_000;
    jest.spyOn(Date, "now").mockReturnValue(now);

    window.localStorage.setItem(
      "infopath_session",
      JSON.stringify({
        accessToken: buildToken(Math.floor(now / 1000) - 60),
        role: "SUPER_USER",
        accountType: "SOCIETY",
        username: "expired-admin",
        fullName: "Expired Admin",
        requiresPasswordChange: false
      })
    );

    expect(getSession()).toBeNull();
    expect(window.localStorage.getItem("infopath_session")).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({
        method: "DELETE"
      })
    );
  });

  it("persists a slim session through the server-session api", async () => {
    await setSession({
      accessToken: "token-3",
      role: "SUPER_USER",
      accountType: "SOCIETY",
      username: "owner1",
      fullName: "Owner One",
      societyCode: "SOC-HO",
      subscriptionPlan: "PREMIUM",
      avatarDataUrl: "data:image/png;base64,abc123",
      requiresPasswordChange: false
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/session",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" }
      })
    );

    const requestInit = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit | undefined;
    const persistedPayload = JSON.parse(String(requestInit?.body)) as Record<string, unknown>;

    expect(persistedPayload).toEqual(
      expect.objectContaining({
        accessToken: "token-3",
        role: "SUPER_USER",
        accountType: "SOCIETY",
        username: "owner1",
        fullName: "Owner One",
        societyCode: "SOC-HO",
        subscriptionPlan: "PREMIUM",
        avatarDataUrl: null,
        requiresPasswordChange: false
      })
    );
  });
});
