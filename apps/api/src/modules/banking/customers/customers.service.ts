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

    return this.getById(currentUser, currentUser.customerId);
  }

  private async resolveSociety(currentUser: RequestUser, societyCode?: string) {
    if (currentUser.role === UserRole.AGENT) {
      if (!currentUser.societyId) {
        throw new ForbiddenException("Agent is not mapped to any society");
      }

      const society = await this.prisma.society.findUnique({ where: { id: currentUser.societyId } });
      if (!society) {
        throw new NotFoundException("Assigned society not found");
      }

      return society;
    }

    if (!societyCode) {
      throw new NotFoundException("societyCode is required for super user operations");
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

    if (currentUser.role === UserRole.AGENT) {
      where.societyId = currentUser.societyId ?? "";
    }

    if (currentUser.role === UserRole.SUPER_USER && query.societyCode) {
      const society = await this.prisma.society.findUnique({
        where: { code: query.societyCode.trim().toUpperCase() },
        select: { id: true }
      });

      where.societyId = society?.id ?? "";
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
    if (currentUser.role === UserRole.SUPER_USER) {
      return;
    }

    if (currentUser.role === UserRole.AGENT && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Customer belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT && customerId !== currentUser.customerId) {
      throw new ForbiddenException("You can access only your own profile");
    }
  }
}
