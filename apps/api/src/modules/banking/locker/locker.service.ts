import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { LockerStatus, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CloseLockerDto } from "./dto/close-locker.dto";
import { CreateLockerDto } from "./dto/create-locker.dto";
import { ListLockerQueryDto } from "./dto/list-locker-query.dto";
import { VisitLockerDto } from "./dto/visit-locker.dto";

@Injectable()
export class LockerService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "locker",
      ...bankingFeatureMap["locker"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["locker"].workflows;
  }

  async list(currentUser: RequestUser, query: ListLockerQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);
    const [rows, total] = await Promise.all([
      this.prisma.locker.findMany({
        where,
        include: {
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true,
              societyId: true
            }
          },
          _count: {
            select: {
              visits: true
            }
          }
        },
        orderBy: {
          openingDate: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.locker.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateLockerDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot open lockers");
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: {
        id: true,
        societyId: true
      }
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    this.ensureScope(currentUser, customer.societyId);

    return this.prisma.locker.create({
      data: {
        customerId: customer.id,
        lockerNumber: dto.lockerNumber.trim().toUpperCase(),
        size: dto.size,
        annualCharge: dto.annualCharge
      }
    });
  }

  async visit(currentUser: RequestUser, id: string, dto: VisitLockerDto) {
    const locker = await this.prisma.locker.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            societyId: true,
            id: true
          }
        }
      }
    });

    if (!locker) {
      throw new NotFoundException("Locker not found");
    }

    this.ensureScope(currentUser, locker.customer.societyId, locker.customer.id);

    if (locker.status !== LockerStatus.ACTIVE) {
      throw new BadRequestException("Only active lockers can record visits");
    }

    return this.prisma.lockerVisit.create({
      data: {
        lockerId: locker.id,
        remarks: dto.remarks
      }
    });
  }

  async close(currentUser: RequestUser, id: string, dto: CloseLockerDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot close lockers");
    }

    const locker = await this.prisma.locker.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!locker) {
      throw new NotFoundException("Locker not found");
    }

    this.ensureScope(currentUser, locker.customer.societyId);

    return this.prisma.locker.update({
      where: { id },
      data: {
        status: LockerStatus.CLOSED,
        closingDate: new Date()
      },
      include: {
        customer: {
          select: {
            customerCode: true
          }
        }
      }
    });
  }

  async getVisits(currentUser: RequestUser, id: string) {
    const locker = await this.prisma.locker.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            societyId: true,
            id: true
          }
        }
      }
    });

    if (!locker) {
      throw new NotFoundException("Locker not found");
    }

    this.ensureScope(currentUser, locker.customer.societyId, locker.customer.id);

    return this.prisma.lockerVisit.findMany({
      where: {
        lockerId: id
      },
      orderBy: {
        visitedAt: "desc"
      }
    });
  }

  private async getScopedWhere(currentUser: RequestUser, query: ListLockerQueryDto): Promise<Prisma.LockerWhereInput> {
    const where: Prisma.LockerWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.customerId = currentUser.customerId ?? "";
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      where.customer = {
        societyId: currentUser.societyId ?? ""
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.OR = [
        { lockerNumber: { contains: query.q, mode: "insensitive" } },
        { customer: { customerCode: { contains: query.q, mode: "insensitive" } } },
        { customer: { firstName: { contains: query.q, mode: "insensitive" } } },
        { customer: { lastName: { contains: query.q, mode: "insensitive" } } }
      ];
    }

    return where;
  }

  private ensureScope(currentUser: RequestUser, societyId: string, customerId?: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Locker belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT && currentUser.customerId !== customerId) {
      throw new ForbiddenException("Client can access only own locker profile");
    }
  }
}
