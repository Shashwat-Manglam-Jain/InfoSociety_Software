import {
  EMPTY_SOCIETY_OVERVIEW,
  buildBranchCollectionRows,
  buildLoanApplicationSummaryRows,
  countOpenLoanApplications,
  getMonthlyNetEarnings
} from "./dashboard-overview";

describe("dashboard overview helpers", () => {
  it("builds branch collection rows with zero fallbacks", () => {
    const rows = buildBranchCollectionRows(
      [
        { id: "head", name: "Head Office", code: "HEAD", isHead: true },
        { id: "branch-1", name: "North Branch", code: "NORTH", isHead: false }
      ] as any,
      {
        head: {
          ...EMPTY_SOCIETY_OVERVIEW,
          collectionApproved: {
            daily: 1200,
            weekly: 8400,
            monthly: 34000
          }
        }
      }
    );

    expect(rows).toEqual([
      {
        id: "head",
        name: "Head Office",
        code: "HEAD",
        todayCollection: 1200,
        weeklyCollection: 8400,
        monthlyCollection: 34000
      },
      {
        id: "branch-1",
        name: "North Branch",
        code: "NORTH",
        todayCollection: 0,
        weeklyCollection: 0,
        monthlyCollection: 0
      }
    ]);
  });

  it("calculates monthly net earnings from collection and loan disbursal", () => {
    expect(
      getMonthlyNetEarnings({
        ...EMPTY_SOCIETY_OVERVIEW,
        collectionApproved: { daily: 0, weekly: 0, monthly: 150000 },
        distributedApproved: { daily: 0, weekly: 0, monthly: 45000 }
      })
    ).toBe(105000);
  });

  it("maps and sorts loan applications by latest first", () => {
    const rows = buildLoanApplicationSummaryRows([
      {
        id: "loan-1",
        createdAt: "2026-04-10T10:00:00.000Z",
        status: "APPLIED",
        applicationAmount: 50000,
        sanctionedAmount: null,
        disbursedAmount: null,
        account: {
          accountNumber: "LN-001",
          branchId: "branch-1",
          branch: { id: "branch-1", name: "North Branch", code: "NORTH" }
        },
        customer: {
          customerCode: "CUS-001",
          firstName: "Asha",
          lastName: "Patil"
        }
      },
      {
        id: "loan-2",
        createdAt: "2026-04-12T09:30:00.000Z",
        status: "SANCTIONED",
        applicationAmount: 75000,
        sanctionedAmount: 70000,
        disbursedAmount: null,
        account: {
          accountNumber: "LN-002",
          branchId: null,
          branch: null
        },
        customer: {
          customerCode: "CUS-002",
          firstName: "Mohan",
          lastName: "Rao"
        }
      }
    ] as any);

    expect(rows[0]).toMatchObject({
      id: "loan-2",
      applicantName: "Mohan Rao",
      branchName: "Unassigned branch",
      applicationAmount: 75000
    });
    expect(rows[1]).toMatchObject({
      id: "loan-1",
      applicantName: "Asha Patil",
      branchName: "North Branch",
      branchCode: "NORTH"
    });
  });

  it("counts open loan applications only", () => {
    expect(
      countOpenLoanApplications([
        { status: "APPLIED" },
        { status: "SANCTIONED" },
        { status: "DISBURSED" },
        { status: "CLOSED" }
      ] as any)
    ).toBe(2);
  });
});
