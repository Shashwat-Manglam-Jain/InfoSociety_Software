import { modules } from "@/features/banking/module-registry";
import { getModuleWorkspaceConfig } from "./operation-catalog";

describe("operation-catalog", () => {
  it("has operation configuration for every dashboard module", () => {
    for (const module of modules) {
      const config = getModuleWorkspaceConfig(module.slug);
      expect(config).toBeDefined();
      expect(config?.operations.length).toBeGreaterThan(0);
    }
  });
});
