import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { ListCustomersQueryDto } from "./dto/list-customers-query.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "customers",
      ...bankingFeatureMap["customers"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["customers"].workflows;
  }

  async list(currentUser: RequestUser, query: ListCustomersQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          society: {
            select: {
              code: true,
              name: true
            }
          },
          _count: {
            select: {
              accounts: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.customer.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async getById(currentUser: RequestUser, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        society: {
          select: {
            code: true,
            name: true
          }
        },
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            type: true,
            status: true,
            currentBalance: true
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    this.ensureScope(currentUser, customer.societyId, customer.id);
    return customer;
  }

  async create(currentUser: RequestUser, dto: CreateCustomerDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create customers");
    }

    const society = await this.resolveSociety(currentUser, dto.societyCode);
    const count = await this.prisma.customer.count({ where: { societyId: society.id } });
    const customerCode = `${society.code}-C${String(count + 1).padStart(5, "0")}`;

    return this.prisma.customer.create({
      data: {
        customerCode,
        societyId: society.id,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        kycVerified: dto.kycVerified ?? false
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateCustomerDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot modify customers");
    }

    const existing = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        societyId: true
      }
    });

    if (!existing) {
      throw new NotFoundException("Customer not found");
    }

    this.ensureScope(currentUser, existing.societyId);

    return this.prisma.customer.update({
      where: { id },
      data: dto
    });
  }

  async myProfile(currentUser: RequestUser) {
    if (currentUser.role !== UserRole.CLIENT || !currentUser.customerId) {
      throw new ForbiddenException("Only client users can access this endpoint");
    }

    const customerId = currentUser.customerId;
    const customer = await this.getById(currentUser, customerId);

    // Aggregate statistics
    const accounts = await this.prisma.account.findMany({
      where: { customerId },
      include: {
        transactions: {
          where: { isPassed: true },
          select: { type: true, amount: true, remark: true }
        }
      }
    });

    let totalInvested = 0;
    let interestEarned = 0;
    let totalWithdrawn = 0;

    accounts.forEach(acc => {
      acc.transactions.forEach(tx => {
        const amt = Number(tx.amount);
        if (tx.type === "CREDIT") {
          // Identify interest by looking for keywords or specific account behavior
          const isInterest = tx.remark?.toLowerCase().includes("interest") || tx.remark?.toLowerCase().includes("div") || tx.remark?.toLowerCase().includes("intt");
          if (isInterest) {
            interestEarned += amt;
          } else {
            totalInvested += amt;
          }
        } else {
          totalWithdrawn += amt;
        }
      });
    });

    // Get Allotted Agent Mapping
    const agentMapping = await this.prisma.agentClient.findFirst({
      where: { customerId },
      include: {
        agent: {
          select: {
            id: true,
            customerCode: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: { select: { username: true } }
          }
        }
      }
    });

    return {
      ...customer,
      dashboardStats: {
        totalInvested,
        interestEarned,
        totalWithdrawn,
        netBalance: accounts.reduce((acc, a) => acc + Number(a.currentBalance), 0)
      },
      allottedAgent: agentMapping?.agent || null
    };
  }

  private async resolveSociety(currentUser: RequestUser, societyCode?: string) {
    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      if (!currentUser.societyId) {
        throw new ForbiddenException("Operator is not mapped to any society");
      }

      const society = await this.prisma.society.findUnique({ where: { id: currentUser.societyId } });
      if (!society) {
        throw new NotFoundException("Assigned society not found");
      }

      return society;
    }

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only platform administrators can choose a different society");
    }

    if (!societyCode) {
      throw new NotFoundException("societyCode is required for platform operations");
    }

    const society = await this.prisma.society.findUnique({
      where: { code: societyCode.trim().toUpperCase() }
    });

    if (!society) {
      throw new NotFoundException("Society not found");
    }

    return society;
  }

  private async getScopedWhere(currentUser: RequestUser, query: ListCustomersQueryDto): Promise<Prisma.CustomerWhereInput> {
    const where: Prisma.CustomerWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.id = currentUser.customerId ?? "";
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      where.societyId = currentUser.societyId ?? "";
    }

    if (query.q) {
      where.OR = [
        { customerCode: { contains: query.q, mode: "insensitive" } },
        { firstName: { contains: query.q, mode: "insensitive" } },
        { lastName: { contains: query.q, mode: "insensitive" } },
        { phone: { contains: query.q, mode: "insensitive" } }
      ];
    }

    return where;
  }

  private ensureScope(currentUser: RequestUser, societyId: string, customerId?: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Customer belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT && customerId !== currentUser.customerId) {
      throw new ForbiddenException("You can access only your own profile");
    }
  }
}
