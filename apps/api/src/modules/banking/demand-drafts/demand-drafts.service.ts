import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InstrumentStatus, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateDemandDraftDto } from "./dto/create-demand-draft.dto";
import { ListDemandDraftsQueryDto } from "./dto/list-demand-drafts-query.dto";
import { UpdateDemandDraftDto } from "./dto/update-demand-draft.dto";
import { UpdateDemandDraftStatusDto } from "./dto/update-demand-draft-status.dto";

@Injectable()
export class DemandDraftsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "demand-drafts",
      ...bankingFeatureMap["demand-drafts"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["demand-drafts"].workflows;
  }

  async list(currentUser: RequestUser, query: ListDemandDraftsQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.demandDraft.findMany({
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
          issuedAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.demandDraft.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateDemandDraftDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot issue demand drafts");
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
      throw new BadRequestException("Unable to resolve society for this demand draft");
    }

    this.ensureScope(currentUser, societyId);

    if (account && customer && account.customerId !== customer.id) {
      throw new BadRequestException("Account and customer do not belong to the same profile");
    }

    const draftNumber = await this.generateDraftNumber();

    return this.prisma.demandDraft.create({
      data: {
        draftNumber,
        accountId: account?.id,
        customerId: customer?.id ?? account?.customerId,
        beneficiary: dto.beneficiary.trim(),
        amount: dto.amount,
        status: InstrumentStatus.ENTERED
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateDemandDraftDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot modify demand drafts");
    }

    const draft = await this.findByIdOrThrow(id);
    this.ensureScope(currentUser, this.resolveSocietyId(draft));

    if (draft.status !== InstrumentStatus.ENTERED) {
      throw new BadRequestException("Only entered drafts can be modified");
    }

    return this.prisma.demandDraft.update({
      where: { id },
      data: dto
    });
  }

  async updateStatus(currentUser: RequestUser, id: string, dto: UpdateDemandDraftStatusDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot update demand draft status");
    }

    const draft = await this.findByIdOrThrow(id);
    this.ensureScope(currentUser, this.resolveSocietyId(draft));

    return this.prisma.demandDraft.update({
      where: { id },
      data: {
        status: dto.status,
        clearedAt: dto.status === InstrumentStatus.CLEARED ? new Date() : null
      }
    });
  }

  private async getScopedWhere(
    currentUser: RequestUser,
    query: ListDemandDraftsQueryDto
  ): Promise<Prisma.DemandDraftWhereInput> {
    const conditions: Prisma.DemandDraftWhereInput[] = [];

    if (currentUser.role === UserRole.CLIENT) {
      conditions.push({ customerId: currentUser.customerId ?? "" });
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      conditions.push({
        OR: [{ account: { societyId: currentUser.societyId ?? "" } }, { customer: { societyId: currentUser.societyId ?? "" } }]
      });
    }

    if (query.status) {
      conditions.push({ status: query.status });
    }

    if (query.q) {
      conditions.push({
        OR: [
          { draftNumber: { contains: query.q, mode: "insensitive" } },
          { beneficiary: { contains: query.q, mode: "insensitive" } },
          { account: { accountNumber: { contains: query.q, mode: "insensitive" } } },
          { customer: { customerCode: { contains: query.q, mode: "insensitive" } } }
        ]
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  private async findByIdOrThrow(id: string) {
    const draft = await this.prisma.demandDraft.findUnique({
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

    if (!draft) {
      throw new NotFoundException("Demand draft not found");
    }

    return draft;
  }

  private resolveSocietyId(draft: { account: { societyId: string } | null; customer: { societyId: string } | null }) {
    return draft.account?.societyId ?? draft.customer?.societyId ?? "";
  }

  private ensureScope(currentUser: RequestUser, societyId: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Draft belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client scope does not allow this operation");
    }
  }

  private async generateDraftNumber() {
    const count = await this.prisma.demandDraft.count();
    return `DD${String(count + 1).padStart(8, "0")}`;
  }
}
