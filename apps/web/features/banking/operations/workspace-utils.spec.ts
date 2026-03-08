import { buildOperationRequest, getDefaultValues } from "./workspace-utils";
import type { ModuleOperation } from "./types";

describe("workspace-utils", () => {
  const operation: ModuleOperation = {
    id: "sample",
    title: "Sample",
    description: "sample",
    method: "POST",
    path: "/accounts/:id/status",
    fields: [
      { key: "id", label: "Account ID", type: "text", location: "path", required: true },
      { key: "societyCode", label: "Society", type: "text", location: "query" },
      { key: "status", label: "Status", type: "text", location: "body", required: true },
      { key: "priority", label: "Priority", type: "number", location: "body", defaultValue: "1" }
    ]
  };

  it("builds path, query, and body payload", () => {
    const request = buildOperationRequest(operation, {
      id: "abc-123",
      societyCode: "SOC-HO",
      status: "ACTIVE",
      priority: "2"
    });

    expect(request.path).toBe("/accounts/abc-123/status?societyCode=SOC-HO");
    expect(request.body).toEqual({ status: "ACTIVE", priority: 2 });
  });

  it("returns default values for operation fields", () => {
    expect(getDefaultValues(operation)).toEqual({
      id: "",
      societyCode: "",
      status: "",
      priority: "1"
    });
  });

  it("throws for missing required fields", () => {
    expect(() =>
      buildOperationRequest(operation, {
        id: "",
        status: ""
      })
    ).toThrow("required");
  });

  it("throws when json field has invalid json", () => {
    const jsonOperation: ModuleOperation = {
      id: "json",
      title: "JSON",
      description: "json",
      method: "POST",
      path: "/reports/run",
      fields: [{ key: "parameters", label: "Parameters", type: "json", location: "body" }]
    };

    expect(() =>
      buildOperationRequest(jsonOperation, {
        parameters: "{invalid-json}"
      })
    ).toThrow("valid JSON");
  });
});
