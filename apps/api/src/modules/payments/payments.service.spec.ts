import { PaymentMethod, PaymentPurpose, PaymentRequestStatus, PaymentTransactionStatus, UserRole } from "@prisma/client";
import { PaymentsService } from "./payments.service";

describe("PaymentsService", () => {
  function buildService() {
    const prisma = {
      customer: {
        findUnique: jest.fn()
      },
      paymentRequest: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      },
      paymentTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn()
      },
      society: {
        findUnique: jest.fn(),
        count: jest.fn()
      }
    };

    return {
      service: new PaymentsService(prisma as never),
      prisma
    };
  }

  it("creates a payment request for a customer in the same society", async () => {
    const { service, prisma } = buildService();

    prisma.customer.findUnique.mockResolvedValue({
      id: "cust-1",
      societyId: "soc-1"
    });
    prisma.paymentRequest.create.mockResolvedValue({
      id: "req-1",
      title: "Locker Renewal",
      description: "Annual locker charge",
      purpose: PaymentPurpose.SERVICE_CHARGE,
      amount: 1500,
      status: PaymentRequestStatus.OPEN,
      dueDate: null,
      paidAt: null,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      customer: {
        customerCode: "SOC-HO-C00001",
        firstName: "Demo",
        lastName: "Client"
      },
      society: {
        code: "SOC-HO",
        name: "Head Office"
      }
    });

    const result = await service.createRequest(
      {
        sub: "user-1",
        username: "societyadmin1",
        role: UserRole.SUPER_USER,
        societyId: "soc-1",
        customerId: null
      },
      {
        customerId: "cust-1",
        title: "Locker Renewal",
        description: "Annual locker charge",
        purpose: PaymentPurpose.SERVICE_CHARGE,
        amount: 1500
      }
    );

    expect(prisma.paymentRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          societyId: "soc-1",
          customerId: "cust-1",
          title: "Locker Renewal"
        })
      })
    );
    expect(result.status).toBe(PaymentRequestStatus.OPEN);
  });

  it("marks a payment request as paid and records the transaction", async () => {
    const { service, prisma } = buildService();

    prisma.paymentRequest.findUnique.mockResolvedValue({
      id: "req-1",
      societyId: "soc-1",
      customerId: "cust-1",
      title: "Loan EMI",
      purpose: PaymentPurpose.LOAN_REPAYMENT,
      amount: 2500,
      status: PaymentRequestStatus.OPEN,
      dueDate: null,
      society: {
        id: "soc-1",
        code: "SOC-HO",
        name: "Head Office",
        acceptsDigitalPayments: true,
        upiId: "soc@upi"
      },
      customer: {
        id: "cust-1",
        customerCode: "SOC-HO-C00001",
        firstName: "Demo",
        lastName: "Client"
      }
    });
    prisma.paymentTransaction.create.mockResolvedValue({
      id: "txn-1",
      purpose: PaymentPurpose.LOAN_REPAYMENT,
      method: PaymentMethod.UPI,
      status: PaymentTransactionStatus.SUCCESS,
      amount: 2500,
      gatewayReference: "PAY-REF-1",
      remark: "Paid Loan EMI",
      processedAt: new Date("2026-03-02T00:00:00.000Z"),
      createdAt: new Date("2026-03-02T00:00:00.000Z"),
      customer: {
        customerCode: "SOC-HO-C00001",
        firstName: "Demo",
        lastName: "Client"
      },
      society: {
        code: "SOC-HO",
        name: "Head Office"
      }
    });
    prisma.paymentRequest.update.mockResolvedValue({
      id: "req-1",
      title: "Loan EMI",
      description: null,
      purpose: PaymentPurpose.LOAN_REPAYMENT,
      amount: 2500,
      status: PaymentRequestStatus.PAID,
      dueDate: null,
      paidAt: new Date("2026-03-02T00:00:00.000Z"),
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      customer: {
        customerCode: "SOC-HO-C00001",
        firstName: "Demo",
        lastName: "Client"
      },
      society: {
        code: "SOC-HO",
        name: "Head Office"
      }
    });

    const result = await service.payRequest(
      "req-1",
      {
        sub: "user-2",
        username: "client1",
        role: UserRole.CLIENT,
        societyId: "soc-1",
        customerId: "cust-1"
      },
      {
        method: PaymentMethod.UPI
      }
    );

    expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentRequestId: "req-1",
          customerId: "cust-1",
          method: PaymentMethod.UPI,
          status: PaymentTransactionStatus.SUCCESS
        })
      })
    );
    expect(prisma.paymentRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "req-1" },
        data: expect.objectContaining({
          status: PaymentRequestStatus.PAID
        })
      })
    );
    expect(result.transaction.status).toBe(PaymentTransactionStatus.SUCCESS);
  });
});
