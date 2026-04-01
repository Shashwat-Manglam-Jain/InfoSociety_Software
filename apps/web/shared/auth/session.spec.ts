import { clearSession, getSession, setSession, subscribeToSession } from "./session";

describe("session helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "infopath_session=; Max-Age=0; path=/";
  });

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

    setSession({
      accessToken: "token-2",
      role: "CLIENT",
      accountType: "CLIENT",
      username: "client1",
      fullName: "Client One",
      societyCode: "SOC-HO",
      subscriptionPlan: "FREE",
      avatarDataUrl: null
    });
    clearSession();

    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("mirrors a slim session into a cookie for server rendering", () => {
    setSession({
      accessToken: "token-3",
      role: "SUPER_USER",
      accountType: "SOCIETY",
      username: "owner1",
      fullName: "Owner One",
      societyCode: "SOC-HO",
      subscriptionPlan: "PREMIUM",
      avatarDataUrl: "data:image/png;base64,abc123"
    });

    expect(document.cookie).toContain("infopath_session=");
    expect(decodeURIComponent(document.cookie)).toContain('"accountType":"SOCIETY"');
    expect(decodeURIComponent(document.cookie)).not.toContain("abc123");
  });
});
