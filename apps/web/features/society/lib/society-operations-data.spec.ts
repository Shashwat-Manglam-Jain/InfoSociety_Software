import {
  createEmptyAccount,
  createEmptyMember,
  getNextAccountNumber,
  getNextApplicationNumber,
  getNextClientNumber,
  getNextPlanCode,
  normalizeAgents,
  normalizeBranches,
  type PlanRecord
} from "./society-operations-data";

describe("society operations data helpers", () => {
  it("does not create fallback branch or agent rows when source data is empty", () => {
    expect(normalizeBranches([])).toEqual([]);
    expect(normalizeAgents([])).toEqual([]);
  });

  it("creates empty member records without seeded branch or agent defaults", () => {
    const member = createEmptyMember([], []);

    expect(member.branchId).toBe("");
    expect(member.branch).toBe("");
    expect(member.memberSourceName).toBe("");
    expect(member.permanentCity).toBe("");
    expect(member.permanentState).toBe("");
  });

  it("creates empty accounts without seeded branch or member defaults", () => {
    const account = createEmptyAccount([], [], []);

    expect(account.memberId).toBe("");
    expect(account.memberName).toBe("");
    expect(account.branchId).toBe("");
    expect(account.branch).toBe("");
    expect(account.nominee).toBe("");
  });

  it("generates readable next IDs for members, plans, and accounts", () => {
    expect(
      getNextClientNumber([
        { clientNo: "CL-00002" } as any,
        { clientNo: "CL-00011" } as any
      ])
    ).toBe("CL-00012");

    expect(
      getNextApplicationNumber([
        { applicationNo: "APP-2026-0009" } as any,
        { applicationNo: "APP-2026-0014" } as any
      ], new Date("2026-04-03"))
    ).toBe("APP-2026-0015");

    const plans: PlanRecord[] = [
      { id: "1", category: "fd", planCode: "FD-001", planName: "One", minAmount: 0, tenure: "", lockInPeriod: "", interestLockInPeriod: "", annualInterestRate: 0, seniorCitizen: "No" },
      { id: "2", category: "fd", planCode: "FD-004", planName: "Two", minAmount: 0, tenure: "", lockInPeriod: "", interestLockInPeriod: "", annualInterestRate: 0, seniorCitizen: "No" }
    ];

    expect(getNextPlanCode(plans, "fd")).toBe("FD-005");
    expect(getNextAccountNumber([{ accountNo: "DP000014" } as any, { accountNo: "DP000021" } as any], "fd")).toBe("DP000022");
    expect(getNextAccountNumber([{ accountNo: "LN000099" } as any], "gold-loan")).toBe("LN000100");
  });
});
