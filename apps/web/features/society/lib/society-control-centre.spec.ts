import { buildAccountResults, buildTeamPreview, selectSocietyModule } from "./society-control-centre";

describe("society control centre helpers", () => {
  it("falls back to preview accounts when live data is unavailable", () => {
    const result = buildAccountResults([], "", "Owner One", "Demo Society");

    expect(result.accountResultsUseDemoData).toBe(true);
    expect(result.accountResults.length).toBeGreaterThan(0);
    expect(result.previewReason).toContain("preview");
  });

  it("keeps the provided owner visible when directory data is missing", () => {
    const team = buildTeamPreview([], "Owner One", "Demo Society");

    expect(team[0]?.fullName).toBe("Owner One");
    expect(team[0]?.roleLabel).toBe("Society Owner");
  });

  it("uses the requested module when it exists and otherwise falls back to the first item", () => {
    const modules = [
      { slug: "customers", name: "Customers", summary: "Customer workspace", endpoints: ["/customers"] },
      { slug: "reports", name: "Reports", summary: "Reports workspace", endpoints: ["/reports"] }
    ];

    expect(selectSocietyModule(modules, "reports")?.slug).toBe("reports");
    expect(selectSocietyModule(modules, "missing")?.slug).toBe("customers");
  });
});
