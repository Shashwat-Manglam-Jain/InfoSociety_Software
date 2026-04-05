"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { apiRequest } from "@/shared/api/client";
import { getSession } from "@/shared/auth/session";
import { getModuleWorkspaceConfig } from "./operation-catalog";
import type { ModuleOperation } from "./types";
import { buildOperationRequest, getDefaultValues } from "./workspace-utils";

type ModuleWorkspaceProps = {
  slug: string;
  name: string;
  summary: string;
  dashboardHref: string;
  accessibleModules: Array<{ slug: string; name: string; summary: string; href?: string }>;
  viewerName: string;
};

type ModuleOverviewPayload = {
  description?: string;
  workflows?: string[];
};

type SummaryItem = {
  label: string;
  value: string;
};

type RecordPreview = {
  title: string;
  subtitle?: string;
  details: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-IN");
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  if (isRecord(value)) {
    if (typeof value.fullName === "string") return value.fullName;
    if (typeof value.name === "string") return value.name;
    if (typeof value.code === "string") return value.code;
  }

  return "Available";
}

function getOverviewDescription(payload: unknown, fallbackSummary: string) {
  if (isRecord(payload) && typeof payload.description === "string" && payload.description.trim()) {
    return payload.description;
  }

  return fallbackSummary;
}

function getWorkflowList(overviewPayload: unknown, workflowsPayload: unknown) {
  if (Array.isArray(workflowsPayload)) {
    return workflowsPayload.filter((item): item is string => typeof item === "string");
  }

  if (isRecord(overviewPayload) && Array.isArray(overviewPayload.workflows)) {
    return overviewPayload.workflows.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function getActionTone(operation: ModuleOperation) {
  switch (operation.method) {
    case "GET":
      return "Review";
    case "POST":
      return "Create";
    case "PATCH":
      return "Update";
    case "DELETE":
      return "Close";
    default:
      return "Action";
  }
}

function getActionButtonLabel(operation: ModuleOperation) {
  switch (operation.method) {
    case "GET":
      return "Load results";
    case "POST":
      return "Create record";
    case "PATCH":
      return "Save changes";
    case "DELETE":
      return "Complete action";
    default:
      return "Run action";
  }
}

function getPreviewOperation(config: NonNullable<ReturnType<typeof getModuleWorkspaceConfig>>) {
  const operations = config.operations.filter(
    (operation) =>
      operation.method === "GET" &&
      !(operation.fields ?? []).some((field) => field.location === "path" && field.required)
  );

  return (
    operations.find((operation) => operation.id.includes("list")) ??
    operations.find((operation) => operation.id.includes("me")) ??
    operations[0] ??
    null
  );
}

function getSummaryItems(payload: unknown): SummaryItem[] {
  if (!isRecord(payload)) {
    return [];
  }

  const items: SummaryItem[] = [];

  if (typeof payload.total === "number") {
    items.push({ label: "Total", value: formatValue(payload.total) });
  }
  if (typeof payload.page === "number") {
    items.push({ label: "Page", value: formatValue(payload.page) });
  }
  if (typeof payload.limit === "number") {
    items.push({ label: "Page size", value: formatValue(payload.limit) });
  }

  if (isRecord(payload.totals)) {
    Object.entries(payload.totals)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
      .slice(0, 4)
      .forEach(([key, value]) => {
        items.push({ label: formatLabel(key), value: formatValue(value) });
      });
  }

  if (items.length > 0) {
    return items.slice(0, 4);
  }

  return Object.entries(payload)
    .filter(([key, value]) => key !== "description" && key !== "module" && ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 4)
    .map(([key, value]) => ({
      label: formatLabel(key),
      value: formatValue(value)
    }));
}

function getRecordCollection(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const preferredKeys = ["rows", "societies", "requests", "recentTransactions", "accounts", "customers", "visits"];

  for (const key of preferredKeys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value));
  return Array.isArray(firstArray) ? firstArray.filter(isRecord) : [];
}

function toRecordPreview(record: Record<string, unknown>): RecordPreview {
  const nameParts = [record.firstName, record.lastName]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();

  const title =
    nameParts ||
    (typeof record.fullName === "string" && record.fullName) ||
    (typeof record.name === "string" && record.name) ||
    (typeof record.title === "string" && record.title) ||
    (typeof record.accountNumber === "string" && record.accountNumber) ||
    (typeof record.customerCode === "string" && record.customerCode) ||
    (typeof record.code === "string" && record.code) ||
    (typeof record.id === "string" && record.id) ||
    "Record";

  const subtitleParts: string[] = [];
  if (typeof record.status === "string") subtitleParts.push(record.status);
  if (typeof record.type === "string") subtitleParts.push(record.type);
  if (typeof record.role === "string") subtitleParts.push(record.role);
  if (isRecord(record.society) && typeof record.society.name === "string") subtitleParts.push(record.society.name);
  if (isRecord(record.customer) && typeof record.customer.fullName === "string") subtitleParts.push(record.customer.fullName);

  const details = Object.entries(record)
    .filter(([key, value]) => {
      if (["id", "name", "fullName", "title", "firstName", "lastName", "status", "type", "role", "accountNumber", "customerCode", "code", "society", "customer"].includes(key)) {
        return false;
      }

      return ["string", "number", "boolean"].includes(typeof value);
    })
    .slice(0, 3)
    .map(([key, value]) => `${formatLabel(key)}: ${formatValue(value)}`);

  return {
    title,
    subtitle: subtitleParts.length > 0 ? subtitleParts.slice(0, 2).join(" · ") : undefined,
    details
  };
}

function ResponsePreview({
  payload,
  emptyState
}: {
  payload: unknown;
  emptyState: string;
}) {
  const summaryItems = getSummaryItems(payload);
  const allRecords = getRecordCollection(payload);
  const recordItems = allRecords.slice(0, 4).map(toRecordPreview);

  if (summaryItems.length === 0 && recordItems.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {emptyState}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {summaryItems.length > 0 ? (
        <Grid container spacing={1.2}>
          {summaryItems.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
              <Box className="surface-glass" sx={{ p: 1.4, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.6 }}>
                  {item.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {recordItems.length > 0 ? (
        <Stack spacing={1.1}>
          {allRecords.length > recordItems.length ? (
            <Chip
              label={`Showing ${recordItems.length} of ${allRecords.length} records`}
              size="small"
              sx={{ width: "fit-content" }}
            />
          ) : null}

          <Grid container spacing={1.2}>
            {recordItems.map((record, index) => (
              <Grid key={`${record.title}-${index}`} size={{ xs: 12, sm: 6 }}>
                <Box className="surface-glass" sx={{ p: 1.4, borderRadius: 2, height: "100%" }}>
                  <Typography fontWeight={700}>{record.title}</Typography>
                  {record.subtitle ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                      {record.subtitle}
                    </Typography>
                  ) : null}
                  {record.details.length > 0 ? (
                    <Stack spacing={0.45} sx={{ mt: 1 }}>
                      {record.details.map((detail) => (
                        <Typography key={detail} variant="caption" color="text.secondary">
                          {detail}
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      ) : null}
    </Stack>
  );
}

export function ModuleWorkspace({
  slug,
  name,
  summary,
  dashboardHref,
  accessibleModules,
  viewerName
}: ModuleWorkspaceProps) {
  const router = useRouter();
  const config = useMemo(() => getModuleWorkspaceConfig(slug), [slug]);

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [overviewPayload, setOverviewPayload] = useState<unknown>(null);
  const [workflowPayload, setWorkflowPayload] = useState<unknown>(null);

  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewPayload, setPreviewPayload] = useState<unknown>(null);

  const [valuesByOperation, setValuesByOperation] = useState<Record<string, Record<string, string>>>({});
  const [responseByOperation, setResponseByOperation] = useState<Record<string, unknown>>({});
  const [errorByOperation, setErrorByOperation] = useState<Record<string, string | null>>({});
  const [expandedResponseByOperation, setExpandedResponseByOperation] = useState<Record<string, boolean>>({});
  const [runningOperationId, setRunningOperationId] = useState<string | null>(null);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      return;
    }

    const defaults: Record<string, Record<string, string>> = {};
    for (const operation of config.operations) {
      defaults[operation.id] = getDefaultValues(operation);
    }

    setValuesByOperation(defaults);
  }, [config]);

  useEffect(() => {
    setActiveOperationId((current) =>
      config?.operations.some((operation) => operation.id === current) ? current : config?.operations[0]?.id ?? null
    );
  }, [config]);

  useEffect(() => {
    async function loadMeta() {
      const session = getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        setLoadingMeta(true);
        setMetaError(null);

        const [overview, workflows] = await Promise.allSettled([
          apiRequest<unknown>(session.accessToken, "GET", `/${slug}/overview`),
          apiRequest<unknown>(session.accessToken, "GET", `/${slug}/workflows`)
        ]);

        if (overview.status === "fulfilled") {
          setOverviewPayload(overview.value);
        }

        if (workflows.status === "fulfilled") {
          setWorkflowPayload(workflows.value);
        }

        if (overview.status === "rejected" && workflows.status === "rejected") {
          throw overview.reason instanceof Error ? overview.reason : new Error("Unable to load module details");
        }
      } catch (caught) {
        setMetaError(caught instanceof Error ? caught.message : "Unable to load module details");
      } finally {
        setLoadingMeta(false);
      }
    }

    void loadMeta();
  }, [router, slug]);

  const previewOperation = useMemo(() => (config ? getPreviewOperation(config) : null), [config]);
  const activeOperation = useMemo(
    () => config?.operations.find((operation) => operation.id === activeOperationId) ?? null,
    [activeOperationId, config]
  );
  const workspaceDescription = useMemo(
    () => getOverviewDescription(overviewPayload as ModuleOverviewPayload, summary),
    [overviewPayload, summary]
  );
  const workflowList = useMemo(() => getWorkflowList(overviewPayload, workflowPayload), [overviewPayload, workflowPayload]);
  const previewRecordCount = useMemo(() => getRecordCollection(previewPayload).length, [previewPayload]);

  async function loadPreview() {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!previewOperation) {
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError(null);
      const built = buildOperationRequest(previewOperation, valuesByOperation[previewOperation.id] ?? getDefaultValues(previewOperation));
      const payload = await apiRequest<unknown>(session.accessToken, built.method, built.path, built.body);
      setPreviewPayload(payload);
      setPreviewLoaded(true);
    } catch (caught) {
      setPreviewError(caught instanceof Error ? caught.message : "Unable to load current records");
      setPreviewLoaded(true);
    } finally {
      setPreviewLoading(false);
    }
  }

  function onFieldChange(operationId: string, key: string, value: string) {
    setValuesByOperation((previous) => ({
      ...previous,
      [operationId]: {
        ...(previous[operationId] ?? {}),
        [key]: value
      }
    }));
  }

  async function runOperation(operation: ModuleOperation, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setRunningOperationId(operation.id);
    setErrorByOperation((previous) => ({ ...previous, [operation.id]: null }));

    try {
      const built = buildOperationRequest(operation, valuesByOperation[operation.id] ?? {});
      const payload = await apiRequest<unknown>(session.accessToken, built.method, built.path, built.body);

      setResponseByOperation((previous) => ({
        ...previous,
        [operation.id]: payload
      }));

      if (previewOperation) {
        void loadPreview();
      }
    } catch (caught) {
      setErrorByOperation((previous) => ({
        ...previous,
        [operation.id]: caught instanceof Error ? caught.message : "Request failed"
      }));
    } finally {
      setRunningOperationId(null);
    }
  }

  if (!config) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">No workspace configuration is available for this service area.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 1, md: 1.5 } }}>
      <Container maxWidth={false} sx={{ px: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 3.2, xl: 2.9 }}>
            <Stack spacing={1.4} sx={{ position: { lg: "sticky" }, top: { lg: 18 } }}>
              <Card className="surface-glass" sx={{ borderRadius: 3.2 }}>
                <CardContent sx={{ p: { xs: 1.8, md: 2.2 } }}>
                  <Stack spacing={1.35}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.4,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "primary.main",
                        color: "#fff",
                        boxShadow: (theme) => `0 16px 28px ${alpha(theme.palette.primary.main, 0.24)}`
                      }}
                    >
                      <GridViewRoundedIcon />
                    </Box>

                    <Box>
                      <Typography variant="overline" color="primary.main">
                        Service Workspace
                      </Typography>
                      <Typography variant="h5" sx={{ mt: 0.45 }}>
                        {name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.7 }}>
                        {workspaceDescription}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2.6,
                        border: "1px solid rgba(148, 163, 184, 0.16)",
                        background: "rgba(255,255,255,0.84)"
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                        Signed in as
                      </Typography>
                      <Typography sx={{ fontWeight: 700, mt: 0.35 }}>{viewerName}</Typography>
                    </Box>

                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Box className="surface-glass" sx={{ p: 1.1, borderRadius: 2.2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Modules
                          </Typography>
                          <Typography variant="h6">{accessibleModules.length}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box className="surface-glass" sx={{ p: 1.1, borderRadius: 2.2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Actions
                          </Typography>
                          <Typography variant="h6">{config.operations.length}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box className="surface-glass" sx={{ p: 1.1, borderRadius: 2.2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Workflows
                          </Typography>
                          <Typography variant="h6">{workflowList.length || "-"}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box className="surface-glass" sx={{ p: 1.1, borderRadius: 2.2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Preview
                          </Typography>
                          <Typography variant="h6">
                            {previewLoaded ? (previewError ? "Issue" : previewRecordCount || "Loaded") : "On demand"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Stack spacing={0.9}>
                      <Button component={Link} href={dashboardHref} startIcon={<ArrowBackRoundedIcon />} variant="contained" fullWidth>
                        Back to Dashboard
                      </Button>
                      <Button startIcon={<RefreshIcon />} onClick={() => router.refresh()} variant="outlined" fullWidth>
                        Refresh Workspace
                      </Button>
                      {previewOperation ? (
                        <Button onClick={() => void loadPreview()} variant="outlined" fullWidth>
                          {previewLoaded ? "Reload Current Records" : "Load Current Records"}
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card className="surface-glass" sx={{ borderRadius: 3.2 }}>
                <CardContent sx={{ p: 1.2 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 0.8, display: "block", mb: 0.7 }}>
                    All Modules
                  </Typography>
                  <Stack spacing={0.65}>
                    {accessibleModules.map((module) => {
                      const isCurrent = module.slug === slug;

                      return (
                        <Button
                          key={module.slug}
                          component={Link}
                          href={module.href ?? dashboardHref}
                          endIcon={<ChevronRightRoundedIcon />}
                          fullWidth
                          sx={{
                            justifyContent: "space-between",
                            px: 1.1,
                            py: 1.05,
                            borderRadius: 2.2,
                            textTransform: "none",
                            color: isCurrent ? "primary.main" : "text.primary",
                            bgcolor: isCurrent ? "rgba(37, 99, 235, 0.1)" : "transparent",
                            border: isCurrent ? "1px solid rgba(37, 99, 235, 0.16)" : "1px solid transparent"
                          }}
                        >
                          <Stack alignItems="flex-start" sx={{ minWidth: 0 }}>
                            <Typography fontWeight={700} sx={{ textAlign: "left" }} noWrap>
                              {module.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: "left" }} noWrap>
                              {module.summary}
                            </Typography>
                          </Stack>
                        </Button>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>

              <Card className="surface-glass" sx={{ borderRadius: 3.2 }}>
                <CardContent sx={{ p: 1.2 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 0.8, display: "block", mb: 0.7 }}>
                    Action Shortcuts
                  </Typography>
                  <Stack spacing={0.65}>
                    {config.operations.map((operation) => {
                      const isActive = activeOperationId === operation.id;

                      return (
                        <Button
                          key={operation.id}
                          fullWidth
                          endIcon={<ChevronRightRoundedIcon />}
                          onClick={() => setActiveOperationId(operation.id)}
                          sx={{
                            justifyContent: "space-between",
                            px: 1.1,
                            py: 1,
                            borderRadius: 2.2,
                            textTransform: "none",
                            color: isActive ? "primary.main" : "text.primary",
                            bgcolor: isActive ? "rgba(37, 99, 235, 0.08)" : "transparent",
                            border: isActive ? "1px solid rgba(37, 99, 235, 0.16)" : "1px solid transparent"
                          }}
                        >
                          <Stack alignItems="flex-start" sx={{ minWidth: 0 }}>
                            <Typography fontWeight={700} sx={{ textAlign: "left" }} noWrap>
                              {operation.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: "left" }} noWrap>
                              {getActionTone(operation)} · {operation.fields?.length ? `${operation.fields.length} details` : "Direct action"}
                            </Typography>
                          </Stack>
                        </Button>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8.8, xl: 9.1 }}>
            <Stack spacing={2}>
              <Card className="surface-vibrant" sx={{ borderRadius: 3.2, overflow: "hidden" }}>
                <CardContent sx={{ p: { xs: 2, md: 2.6 } }}>
                  <Stack spacing={1.4}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
                      <Box
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 1.4,
                          py: 1.1,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.82)",
                          border: "1px solid rgba(148, 163, 184, 0.16)"
                        }}
                      >
                        <SearchRoundedIcon color="action" />
                        <Typography color="text.secondary" variant="body2" noWrap>
                          Search this workspace by ID, member, record, or reference before loading large result sets.
                        </Typography>
                      </Box>

                      {activeOperation ? (
                        <Chip
                          label={`${getActionTone(activeOperation)} mode`}
                          color="primary"
                          variant="outlined"
                          sx={{ width: "fit-content" }}
                        />
                      ) : null}
                    </Stack>

                    <Box>
                      <Typography variant="overline" color="primary.main">
                        Full-Width Module Shell
                      </Typography>
                      <Typography variant="h4" className="section-title" sx={{ mt: 0.45 }}>
                        {name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 880 }}>
                        This workspace keeps navigation and high-importance controls in the fixed left panel so large datasets stay easier to scan.
                        Load only the records you need and use the active form on the right for focused action work.
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {metaError ? <Alert severity="warning">{metaError}</Alert> : null}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, xl: 7.2 }}>
                  <Card className="surface-glass" sx={{ borderRadius: 3.2, height: "100%" }}>
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Stack spacing={1.2}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          alignItems={{ md: "center" }}
                          spacing={1}
                        >
                          <Box>
                            <Typography variant="overline" color="text.secondary">
                              Current Records
                            </Typography>
                            <Typography variant="h5" className="section-title" sx={{ mt: 0.35 }}>
                              Keep large record sets compact
                            </Typography>
                          </Box>
                          {previewOperation ? (
                            <Button onClick={() => void loadPreview()} variant="contained" disabled={previewLoading}>
                              {previewLoaded ? "Reload Records" : "Load Records"}
                            </Button>
                          ) : null}
                        </Stack>

                        <Typography color="text.secondary">
                          When there are thousands of records, this panel only shows the most useful preview and count signals instead of rendering everything at once.
                        </Typography>

                        {previewLoading ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={18} />
                            <Typography color="text.secondary" variant="body2">
                              Loading current records...
                            </Typography>
                          </Stack>
                        ) : null}

                        {previewError ? <Alert severity="error">{previewError}</Alert> : null}

                        {!previewLoaded && !previewLoading ? (
                          <Alert severity="info">
                            Use the left panel or the button above to fetch only the current records you want to inspect.
                          </Alert>
                        ) : null}

                        {previewLoaded && !previewLoading && !previewError ? (
                          <ResponsePreview payload={previewPayload} emptyState="No current records are available for this workspace yet." />
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, xl: 4.8 }}>
                  <Card className="surface-glass" sx={{ borderRadius: 3.2, height: "100%" }}>
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Stack spacing={1.25}>
                        <Box>
                          <Typography variant="overline" color="text.secondary">
                            Workspace Notes
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 0.35 }}>
                            Key guidance stays simple
                          </Typography>
                        </Box>

                        {loadingMeta ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={18} />
                            <Typography color="text.secondary" variant="body2">
                              Loading workflow guidance...
                            </Typography>
                          </Stack>
                        ) : null}

                        {workflowList.length > 0 ? (
                          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                            {workflowList.map((workflow) => (
                              <Chip key={workflow} label={workflow} variant="outlined" />
                            ))}
                          </Stack>
                        ) : (
                          <Typography color="text.secondary" variant="body2">
                            This module is ready to operate even without extra workflow metadata.
                          </Typography>
                        )}

                        <Box
                          sx={{
                            p: 1.35,
                            borderRadius: 2.5,
                            border: "1px solid rgba(148, 163, 184, 0.16)",
                            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,251,0.96) 100%)"
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 0.7 }}>
                            Current focus
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            {activeOperation
                              ? `${activeOperation.title} is selected. Fill only the fields you need on the form below.`
                              : "Choose an action from the left panel to begin."}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            p: 1.35,
                            borderRadius: 2.5,
                            border: "1px solid rgba(148, 163, 184, 0.16)",
                            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,251,0.96) 100%)"
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 0.7 }}>
                            High-volume pattern
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Keep module navigation fixed on the left, open one action at a time, and preview only filtered record batches when the dataset is large.
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {activeOperation ? (
                <Card className="surface-glass" sx={{ borderRadius: 3.2 }}>
                  <CardContent sx={{ p: { xs: 2.1, md: 2.8 } }}>
                    <Stack spacing={0.9} sx={{ mb: 2.2 }}>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={getActionTone(activeOperation)} color="primary" variant="outlined" />
                        <Chip
                          size="small"
                          label={activeOperation.fields?.length ? `${activeOperation.fields.length} details` : "No extra details"}
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="overline" color="text.secondary">
                        Active Action
                      </Typography>
                      <Typography variant="h5">{activeOperation.title}</Typography>
                      <Typography color="text.secondary">{activeOperation.description}</Typography>
                    </Stack>

                    <Box component="form" onSubmit={(event) => void runOperation(activeOperation, event)}>
                      <Stack spacing={2}>
                        {activeOperation.fields?.length ? (
                          <Grid container spacing={2}>
                            {activeOperation.fields.map((field) => {
                              const value = valuesByOperation[activeOperation.id]?.[field.key] ?? "";

                              if (field.type === "select") {
                                return (
                                  <Grid key={field.key} size={{ xs: 12, md: 6 }}>
                                    <TextField
                                      select
                                      fullWidth
                                      label={`${field.label}${field.required ? " *" : ""}`}
                                      value={value}
                                      onChange={(event) => onFieldChange(activeOperation.id, field.key, event.target.value)}
                                    >
                                      <MenuItem value="">Choose</MenuItem>
                                      {(field.options ?? []).map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                );
                              }

                              const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : "text";

                              return (
                                <Grid key={field.key} size={{ xs: 12, md: field.type === "json" ? 12 : 6 }}>
                                  <TextField
                                    fullWidth
                                    label={`${field.label}${field.required ? " *" : ""}`}
                                    type={inputType}
                                    value={value}
                                    onChange={(event) => onFieldChange(activeOperation.id, field.key, event.target.value)}
                                    placeholder={field.placeholder}
                                    multiline={field.type === "json"}
                                    minRows={field.type === "json" ? 4 : undefined}
                                    slotProps={field.type === "date" ? { inputLabel: { shrink: true } } : undefined}
                                  />
                                </Grid>
                              );
                            })}
                          </Grid>
                        ) : (
                          <Alert severity="info">This action does not require any additional details.</Alert>
                        )}

                        <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
                          <Button type="submit" variant="contained" disabled={runningOperationId === activeOperation.id}>
                            {runningOperationId === activeOperation.id ? "Processing..." : getActionButtonLabel(activeOperation)}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setValuesByOperation((previous) => ({
                                ...previous,
                                [activeOperation.id]: getDefaultValues(activeOperation)
                              }));
                              setErrorByOperation((previous) => ({ ...previous, [activeOperation.id]: null }));
                            }}
                          >
                            Reset Details
                          </Button>
                        </Stack>

                        {errorByOperation[activeOperation.id] ? <Alert severity="error">{errorByOperation[activeOperation.id]}</Alert> : null}

                        {responseByOperation[activeOperation.id] ? (
                          <>
                            <Divider />
                            <Alert severity="success">Action completed successfully.</Alert>
                            <ResponsePreview
                              payload={responseByOperation[activeOperation.id]}
                              emptyState="The action completed, but there is no business preview to show for this response."
                            />
                            <Box>
                              <Button
                                variant="text"
                                onClick={() =>
                                  setExpandedResponseByOperation((previous) => ({
                                    ...previous,
                                    [activeOperation.id]: !previous[activeOperation.id]
                                  }))
                                }
                              >
                                {expandedResponseByOperation[activeOperation.id] ? "Hide technical response" : "View technical response"}
                              </Button>
                            </Box>
                            {expandedResponseByOperation[activeOperation.id] ? (
                              <Box
                                component="pre"
                                sx={{
                                  m: 0,
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "#0f172a",
                                  color: "#dbeafe",
                                  overflowX: "auto",
                                  fontSize: 12,
                                  whiteSpace: "pre-wrap"
                                }}
                              >
                                {JSON.stringify(responseByOperation[activeOperation.id], null, 2)}
                              </Box>
                            ) : null}
                          </>
                        ) : null}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
