import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ReportStatus, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { ListReportJobsQueryDto } from "./dto/list-report-jobs-query.dto";
import { RunReportDto } from "./dto/run-report.dto";
import { reportCatalog } from "./report-catalog";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "reports",
      ...bankingFeatureMap["reports"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["reports"].workflows;
  }

  getCatalog() {
    return reportCatalog;
  }

  async runReport(currentUser: RequestUser, dto: RunReportDto) {
    const catalog = reportCatalog as Record<string, readonly string[]>;
    const options = catalog[dto.category] ?? [];

    if (!options.includes(dto.reportName)) {
      throw new NotFoundException("Report is not found in catalog");
    }

    const parameters = {
      ...(dto.parameters ?? {}),
      requestedByRole: currentUser.role,
      requestedAt: new Date().toISOString(),
      scope: currentUser.role === UserRole.SUPER_USER ? "all_societies" : currentUser.societyId
    };

    const job = await this.prisma.reportJob.create({
      data: {
        category: dto.category,
        reportName: dto.reportName,
        parameters,
        status: ReportStatus.RUNNING,
        requestedById: currentUser.sub
      }
    });

    return this.prisma.reportJob.update({
      where: { id: job.id },
      data: {
        status: ReportStatus.DONE,
        completedAt: new Date(),
        parameters: {
          ...parameters,
          summary: {
            generatedRecordCount: 0,
            note: "Report execution placeholder completed successfully."
          }
        }
      }
    });
  }

  async listJobs(currentUser: RequestUser, query: ListReportJobsQueryDto) {
    const where: Prisma.ReportJobWhereInput = {};

    if (currentUser.role !== UserRole.SUPER_USER) {
      where.requestedBy = {
        societyId: currentUser.societyId ?? ""
      };
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [rows, total] = await Promise.all([
      this.prisma.reportJob.findMany({
        where,
        include: {
          requestedBy: {
            select: {
              username: true,
              fullName: true,
              role: true,
              society: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          requestedAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.reportJob.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async getJobById(currentUser: RequestUser, id: string) {
    const job = await this.prisma.reportJob.findUnique({
      where: { id },
      include: {
        requestedBy: {
          select: {
            id: true,
            societyId: true
          }
        }
      }
    });

    if (!job) {
      throw new NotFoundException("Report job not found");
    }

    if (currentUser.role !== UserRole.SUPER_USER && job.requestedBy?.societyId !== currentUser.societyId) {
      throw new ForbiddenException("Report job belongs to another society");
    }

    return job;
  }
}
