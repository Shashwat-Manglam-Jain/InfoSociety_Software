import { getWorkspaceDefinition, getWorkspaceModules, getWorkspaceUiCopy } from "./workspace-definitions";

describe("workspace localization", () => {
  it("returns Hindi workspace content for the client role", () => {
    const workspace = getWorkspaceDefinition("client", "hi");

    expect(workspace?.title).toBe("क्लाइंट बैंकिंग वर्कस्पेस");
    expect(workspace?.primaryAction.label).toBe("क्लाइंट एक्सेस दें");
  });

  it("returns Marathi shared workspace copy", () => {
    const copy = getWorkspaceUiCopy("mr");

    expect(copy.homeSectionTitle).toBe("भूमिका-आधारित वर्कस्पेसेस");
    expect(copy.reviewRoleButton).toBe("भूमिका पहा");
    expect(copy.overviewHeroTitle).toBe("पहिल्याच स्क्रीनपासून आकर्षक आणि भूमिका-जाणणारा बँकिंग अनुभव");
    expect(copy.statProvisioningHelper).toBe("नियंत्रित ऑनबोर्डिंग");
  });

  it("localizes visible module names for non-English locales", () => {
    const modules = getWorkspaceModules("client", "mr");

    expect(modules.some((module) => module.name === "खाते उघडणे आणि देखभाल")).toBe(true);
  });
});
