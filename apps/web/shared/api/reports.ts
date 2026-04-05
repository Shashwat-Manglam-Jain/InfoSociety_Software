import { apiRequest } from "./http";

export type ReportStatus = "QUEUED" | "RUNNING" | "DONE" | "FAILED";

export type ReportCatalog = Record<string, readonly string[]>;

export type ReportJobRecord = {
  id: string;
  category: string;
  reportName: string;
  status: ReportStatus;
  requestedAt: string;
  completedAt?: string | null;
  parameters?: Record<string, unknown> | null;
  requestedBy?: {
    username: string;
    fullName: string;
    role: string;
    society?: {
      code: string;
      name: string;
    } | null;
  } | null;
};

export type ReportJobListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: ReportJobRecord[];
};

export async function getReportCatalog(token: string) {
  return apiRequest<ReportCatalog>(token, "GET", "/reports/catalog");
}

export async function runReport(
  token: string,
  payload: {
    category: string;
    reportName: string;
    parameters?: Record<string, unknown>;
  }
) {
  return apiRequest<ReportJobRecord>(token, "POST", "/reports/run", payload);
}

export async function listReportJobs(
  token: string,
  params: {
    category?: string;
    status?: ReportStatus | "";
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<ReportJobListResponse>(token, "GET", `/reports/jobs${query ? `?${query}` : ""}`);
}

export async function getReportJob(token: string, jobId: string) {
  return apiRequest<ReportJobRecord>(token, "GET", `/reports/jobs/${jobId}`);
}
