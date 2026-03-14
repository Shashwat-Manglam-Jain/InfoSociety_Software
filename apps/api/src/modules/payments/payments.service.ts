import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PaymentMethod, PaymentRequestStatus, PaymentTransactionStatus, Prisma, SocietyStatus, UserRole } from "@prisma/client";
import { RequestUser } from "../../common/auth/request-user.interface";
import { PrismaService } from "../../common/database/prisma.service";
import { CreatePaymentRequestDto } from "./dto/create-payment-request.dto";
import { PayPaymentRequestDto } from "./dto/pay-payment-request.dto";

const paymentMethodCatalog = [PaymentMethod.UPI, PaymentMethod.DEBIT_CARD, PaymentMethod.CREDIT_CARD, PaymentMethod.NET_BANKING];

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverviewDefinition() {
    return {
      module: "payments",
      description: "Digital collection workflows for society billing, member dues, and in-app payment tracking.",
      workflows: [
        "Create service payment requests for members",
        "Collect payments through UPI, debit card, credit card, or net banking",
        "Track successful and pending collections",
        "Review society or platform payment activity"
      ]
    };
  }

  getWorkflows() {
    return this.getOverviewDefinition().workflows;
  }

  async getOverview(currentUser: RequestUser) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.getPlatformOverview();
    }

    if (currentUser.customerId) {
      return this.getCustomerOverview(currentUser);
    }

    return this.getSocietyOverview(currentUser);
  }

  async listRequests(currentUser: RequestUser) {
    const where = await this.getScopedRequestWhere(currentUser);

    const requests = await this.prisma.paymentRequest.findMany({
      where,
      include: {
        customer: {
          select: {
            customerCode: true,
            firstName: true,
            lastName: true
          }
        },
        society: {
          select: {
            code: true,
            name: true
          }
        }
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });

    return requests.map((request) => this.formatRequest(request));
  }

  async listTransactions(currentUser: RequestUser) {
    const where = await this.getScopedTransactionWhere(currentUser);

    const transactions = await this.prisma.paymentTransaction.findMany({
      where,
      include: {
        customer: {
          select: {
            customerCode: true,
            firstName: true,
            lastName: true
          }
        },
        society: {
          select: {
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return transactions.map((transaction) => this.formatTransaction(transaction));
  }

  async createRequest(currentUser: RequestUser, dto: CreatePaymentRequestDto) {
    if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Only society teams can create payment requests");
    }

    if (!currentUser.societyId) {
      throw new UnauthorizedException("Society context not found");
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: {
        id: true,
        societyId: true
      }
    });

    if (!customer || customer.societyId !== currentUser.societyId) {
      throw new NotFoundException("Customer not found in your society");
    }

    const request = await this.prisma.paymentRequest.create({
      data: {
        societyId: currentUser.societyId,
        customerId: dto.customerId,
        title: dto.title.trim(),
        description: dto.description?.trim() || undefined,
        purpose: dto.purpose,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        createdById: currentUser.sub
      },
      include: {
        customer: {
          select: {
            customerCode: true,
            firstName: true,
            lastName: true
          }
        },
        society: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    return this.formatRequest(request);
  }

  async payRequest(id: string, currentUser: RequestUser, dto: PayPaymentRequestDto) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: {
        society: {
          select: {
            id: true,
            code: true,
            name: true,
            acceptsDigitalPayments: true,
            upiId: true
          }
        },
        customer: {
          select: {
            id: true,
            customerCode: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!request) {
      throw new NotFoundException("Payment request not found");
    }

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (!currentUser.societyId || currentUser.societyId !== request.societyId) {
        throw new ForbiddenException("This payment request is outside your society scope");
      }

      if (currentUser.customerId && currentUser.customerId !== request.customerId) {
        throw new ForbiddenException("You can only pay your own requests");
      }
    }

    if (request.status !== PaymentRequestStatus.OPEN) {
      throw new BadRequestException("This payment request is no longer open");
    }

    if (request.dueDate && request.dueDate.getTime() < Date.now()) {
      throw new BadRequestException("This payment request has expired");
    }

    if (!request.society.acceptsDigitalPayments) {
      throw new BadRequestException("Digital payments are not enabled for this society");
    }

    const now = new Date();

    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        societyId: request.societyId,
        paymentRequestId: request.id,
        customerId: request.customerId,
        initiatedById: currentUser.sub,
        purpose: request.purpose,
        method: dto.method,
        status: PaymentTransactionStatus.SUCCESS,
        amount: request.amount,
        gatewayReference: this.buildGatewayReference("PAY"),
        remark: dto.remark?.trim() || `Paid ${request.title}`,
        processedAt: now
      },
      include: {
        customer: {
          select: {
            customerCode: true,
            firstName: true,
            lastName: true
          }
        },
        society: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    const updatedRequest = await this.prisma.paymentRequest.update({
      where: { id: request.id },
      data: {
        status: PaymentRequestStatus.PAID,
        paidAt: now
      },
      include: {
        customer: {
          select: {
            customerCode: true,
            firstName: true,
            lastName: true
          }
        },
        society: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    return {
      request: this.formatRequest(updatedRequest),
      transaction: this.formatTransaction(transaction),
      paymentInstructions: {
        acceptsDigitalPayments: request.society.acceptsDigitalPayments,
        upiId: request.society.upiId,
        acceptedMethods: paymentMethodCatalog
      }
    };
  }

  private async getPlatformOverview() {
    const [pendingRequests, successfulTransactions, pendingAmount, successfulAmount, societies, transactions] = await Promise.all([
      this.prisma.paymentRequest.count({ where: { status: PaymentRequestStatus.OPEN } }),
      this.prisma.paymentTransaction.count({ where: { status: PaymentTransactionStatus.SUCCESS } }),
      this.prisma.paymentRequest.aggregate({
        where: { status: PaymentRequestStatus.OPEN },
        _sum: { amount: true }
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { status: PaymentTransactionStatus.SUCCESS },
        _sum: { amount: true }
      }),
      this.prisma.society.count({
        where: { acceptsDigitalPayments: true, isActive: true }
      }),
      this.prisma.paymentTransaction.findMany({
        include: {
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true
            }
          },
          society: {
            select: {
              code: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

    return {
      scope: "platform",
      acceptsDigitalPayments: true,
      acceptedMethods: paymentMethodCatalog,
      societyCountWithDigitalCollections: societies,
      totals: {
        pendingRequests,
        completedPayments: successfulTransactions,
        totalPendingAmount: this.decimalToNumber(pendingAmount._sum.amount),
        totalCollectedAmount: this.decimalToNumber(successfulAmount._sum.amount)
      },
      requests: [],
      recentTransactions: transactions.map((transaction) => this.formatTransaction(transaction))
    };
  }

  private async getSocietyOverview(currentUser: RequestUser) {
    if (!currentUser.societyId) {
      throw new UnauthorizedException("Society context not found");
    }

    const [society, pendingRequests, successfulTransactions, pendingAmount, successfulAmount, requests, transactions] = await Promise.all([
      this.prisma.society.findUnique({
        where: { id: currentUser.societyId },
        select: {
          id: true,
          code: true,
          name: true,
          acceptsDigitalPayments: true,
          upiId: true
        }
      }),
      this.prisma.paymentRequest.count({
        where: { societyId: currentUser.societyId, status: PaymentRequestStatus.OPEN }
      }),
      this.prisma.paymentTransaction.count({
        where: { societyId: currentUser.societyId, status: PaymentTransactionStatus.SUCCESS }
      }),
      this.prisma.paymentRequest.aggregate({
        where: { societyId: currentUser.societyId, status: PaymentRequestStatus.OPEN },
        _sum: { amount: true }
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { societyId: currentUser.societyId, status: PaymentTransactionStatus.SUCCESS },
        _sum: { amount: true }
      }),
      this.prisma.paymentRequest.findMany({
        where: { societyId: currentUser.societyId },
        include: {
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true
            }
          },
          society: {
            select: {
              code: true,
              name: true
            }
          }
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 6
      }),
      this.prisma.paymentTransaction.findMany({
        where: { societyId: currentUser.societyId },
        include: {
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true
            }
          },
          society: {
            select: {
              code: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

    if (!society) {
      throw new NotFoundException("Society not found");
    }

    return {
      scope: "society",
      society,
      acceptsDigitalPayments: society.acceptsDigitalPayments,
      acceptedMethods: society.acceptsDigitalPayments ? paymentMethodCatalog : [],
      totals: {
        pendingRequests,
        completedPayments: successfulTransactions,
        totalPendingAmount: this.decimalToNumber(pendingAmount._sum.amount),
        totalCollectedAmount: this.decimalToNumber(successfulAmount._sum.amount)
      },
      requests: requests.map((request) => this.formatRequest(request)),
      recentTransactions: transactions.map((transaction) => this.formatTransaction(transaction))
    };
  }

  private async getCustomerOverview(currentUser: RequestUser) {
    if (!currentUser.customerId) {
      throw new UnauthorizedException("Customer context not found");
    }

    const [society, pendingRequests, successfulTransactions, pendingAmount, successfulAmount, requests, transactions] = await Promise.all([
      this.prisma.society.findUnique({
        where: { id: currentUser.societyId ?? "" },
        select: {
          id: true,
          code: true,
          name: true,
          acceptsDigitalPayments: true,
          upiId: true
        }
      }),
      this.prisma.paymentRequest.count({
        where: { customerId: currentUser.customerId, status: PaymentRequestStatus.OPEN }
      }),
      this.prisma.paymentTransaction.count({
        where: { customerId: currentUser.customerId, status: PaymentTransactionStatus.SUCCESS }
      }),
      this.prisma.paymentRequest.aggregate({
        where: { customerId: currentUser.customerId, status: PaymentRequestStatus.OPEN },
        _sum: { amount: true }
      }),
      this.prisma.paymentTransaction.aggregate({
        where: { customerId: currentUser.customerId, status: PaymentTransactionStatus.SUCCESS },
        _sum: { amount: true }
      }),
      this.prisma.paymentRequest.findMany({
        where: { customerId: currentUser.customerId },
        include: {
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true
            }
          },
          society: {
            select: {
              code: true,
              name: true
            }
          }
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 6
      }),
      this.prisma.paymentTransaction.findMany({
        where: { customerId: currentUser.customerId },
        include: {
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true
            }
          },
          society: {
            select: {
              code: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 8
      })
    ]);

    return {
      scope: "customer",
      society,
      acceptsDigitalPayments: Boolean(society?.acceptsDigitalPayments),
      acceptedMethods: society?.acceptsDigitalPayments ? paymentMethodCatalog : [],
      totals: {
        pendingRequests,
        completedPayments: successfulTransactions,
        totalPendingAmount: this.decimalToNumber(pendingAmount._sum.amount),
        totalCollectedAmount: this.decimalToNumber(successfulAmount._sum.amount)
      },
      requests: requests.map((request) => this.formatRequest(request)),
      recentTransactions: transactions.map((transaction) => this.formatTransaction(transaction))
    };
  }

  private async getScopedRequestWhere(currentUser: RequestUser) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return {};
    }

    if (currentUser.customerId) {
      return { customerId: currentUser.customerId };
    }

    if (!currentUser.societyId) {
      throw new UnauthorizedException("Society context not found");
    }

    return { societyId: currentUser.societyId };
  }

  private async getScopedTransactionWhere(currentUser: RequestUser) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return {};
    }

    if (currentUser.customerId) {
      return { customerId: currentUser.customerId };
    }

    if (!currentUser.societyId) {
      throw new UnauthorizedException("Society context not found");
    }

    return { societyId: currentUser.societyId };
  }

  private formatRequest(request: {
    id: string;
    title: string;
    description: string | null;
    purpose: string;
    amount: Prisma.Decimal | number;
    status: PaymentRequestStatus;
    dueDate: Date | null;
    paidAt: Date | null;
    createdAt: Date;
    customer: {
      customerCode: string;
      firstName: string;
      lastName: string | null;
    };
    society: {
      code: string;
      name: string;
    };
  }) {
    const amount = typeof request.amount === "number" ? request.amount : Number(request.amount.toString());
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      purpose: request.purpose,
      amount,
      status: request.status,
      dueDate: request.dueDate,
      paidAt: request.paidAt,
      createdAt: request.createdAt,
      customer: {
        customerCode: request.customer.customerCode,
        fullName: [request.customer.firstName, request.customer.lastName].filter(Boolean).join(" ")
      },
      society: request.society
    };
  }

  private formatTransaction(transaction: {
    id: string;
    purpose: string;
    method: PaymentMethod;
    status: PaymentTransactionStatus;
    amount: Prisma.Decimal | number;
    gatewayReference: string;
    remark: string | null;
    processedAt: Date | null;
    createdAt: Date;
    customer: {
      customerCode: string;
      firstName: string;
      lastName: string | null;
    } | null;
    society: {
      code: string;
      name: string;
    };
  }) {
    const amount = typeof transaction.amount === "number" ? transaction.amount : Number(transaction.amount.toString());
    return {
      id: transaction.id,
      purpose: transaction.purpose,
      method: transaction.method,
      status: transaction.status,
      amount,
      gatewayReference: transaction.gatewayReference,
      remark: transaction.remark,
      processedAt: transaction.processedAt,
      createdAt: transaction.createdAt,
      customer: transaction.customer
        ? {
            customerCode: transaction.customer.customerCode,
            fullName: [transaction.customer.firstName, transaction.customer.lastName].filter(Boolean).join(" ")
          }
        : null,
      society: transaction.society
    };
  }

  private decimalToNumber(value: Prisma.Decimal | null | undefined) {
    return value ? Number(value.toString()) : 0;
  }

  private buildGatewayReference(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
