import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InstrumentStatus, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateIbcObcInstrumentDto } from "./dto/create-ibc-obc-instrument.dto";
import { ListIbcObcQueryDto } from "./dto/list-ibc-obc-query.dto";
import { UpdateIbcObcStatusDto } from "./dto/update-ibc-obc-status.dto";

@Injectable()
export class IbcObcService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "ibc-obc",
      ...bankingFeatureMap["ibc-obc"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["ibc-obc"].workflows;
  }

  async list(currentUser: RequestUser, query: ListIbcObcQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.ibcObcInstrument.findMany({
        where,
        include: {
          account: {
            select: {
              accountNumber: true,
              societyId: true
            }
          },
          customer: {
            select: {
              customerCode: true,
              firstName: true,
              lastName: true,
              societyId: true
            }
          }
        },
        orderBy: {
          entryDate: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.ibcObcInstrument.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateIbcObcInstrumentDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create IBC/OBC entries");
    }

    if (!dto.accountId && !dto.customerId) {
      throw new BadRequestException("Either accountId or customerId is required");
    }

    const [account, customer] = await Promise.all([
      dto.accountId
        ? this.prisma.account.findUnique({
            where: { id: dto.accountId },
            select: {
              id: true,
              societyId: true,
              customerId: true
            }
          })
        : Promise.resolve(null),
      dto.customerId
        ? this.prisma.customer.findUnique({
            where: { id: dto.customerId },
            select: {
              id: true,
              societyId: true
            }
          })
        : Promise.resolve(null)
    ]);

    if (dto.accountId && !account) {
      throw new NotFoundException("Account not found");
    }

    if (dto.customerId && !customer) {
      throw new NotFoundException("Customer not found");
    }

    const societyId = account?.societyId ?? customer?.societyId;
    if (!societyId) {
      throw new BadRequestException("Unable to resolve society for this entry");
    }

    this.ensureScope(currentUser, societyId);

    if (account && customer && account.customerId !== customer.id) {
      throw new BadRequestException("Account and customer do not match");
    }

    return this.prisma.ibcObcInstrument.create({
      data: {
        instrumentNumber: dto.instrumentNumber.trim(),
        type: dto.type,
        accountId: account?.id,
        customerId: customer?.id ?? account?.customerId,
        amount: dto.amount
      }
    });
  }

  async updateStatus(currentUser: RequestUser, id: string, dto: UpdateIbcObcStatusDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot update IBC/OBC status");
    }

    const instrument = await this.prisma.ibcObcInstrument.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        },
        customer: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!instrument) {
      throw new NotFoundException("Instrument not found");
    }

    const societyId = instrument.account?.societyId ?? instrument.customer?.societyId;
    if (!societyId) {
      throw new BadRequestException("Unable to resolve society for this entry");
    }

    this.ensureScope(currentUser, societyId);

    return this.prisma.ibcObcInstrument.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedDate:
          dto.status === InstrumentStatus.CLEARED || dto.status === InstrumentStatus.RETURNED
            ? new Date()
            : null
      }
    });
  }

  private async getScopedWhere(currentUser: RequestUser, query: ListIbcObcQueryDto): Promise<Prisma.IbcObcInstrumentWhereInput> {
    const conditions: Prisma.IbcObcInstrumentWhereInput[] = [];

    if (currentUser.role === UserRole.CLIENT) {
      conditions.push({ customerId: currentUser.customerId ?? "" });
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      conditions.push({
        OR: [{ account: { societyId: currentUser.societyId ?? "" } }, { customer: { societyId: currentUser.societyId ?? "" } }]
      });
    }

    if (query.type) {
      conditions.push({ type: query.type });
    }

    if (query.status) {
      conditions.push({ status: query.status });
    }

    if (query.q) {
      conditions.push({
        OR: [
          { instrumentNumber: { contains: query.q, mode: "insensitive" } },
          { account: { accountNumber: { contains: query.q, mode: "insensitive" } } },
          { customer: { customerCode: { contains: query.q, mode: "insensitive" } } }
        ]
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  private ensureScope(currentUser: RequestUser, societyId: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Instrument belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client scope does not allow this operation");
    }
  }
}
