"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { apiRequest } from "@/shared/api/client";
import { getSession } from "@/shared/auth/session";
import { getModuleWorkspaceConfig } from "./operation-catalog";
import { buildOperationRequest, getDefaultValues } from "./workspace-utils";
import type { ModuleOperation } from "./types";

type ModuleWorkspaceProps = {
  slug: string;
  name: string;
  summary: string;
};

export function ModuleWorkspace({ slug, name, summary }: ModuleWorkspaceProps) {
  const router = useRouter();
  const config = useMemo(() => getModuleWorkspaceConfig(slug), [slug]);

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [overviewPayload, setOverviewPayload] = useState<unknown>(null);
  const [workflowPayload, setWorkflowPayload] = useState<unknown>(null);

  const [valuesByOperation, setValuesByOperation] = useState<Record<string, Record<string, string>>>({});
  const [responseByOperation, setResponseByOperation] = useState<Record<string, string>>({});
  const [errorByOperation, setErrorByOperation] = useState<Record<string, string | null>>({});
  const [runningOperationId, setRunningOperationId] = useState<string | null>(null);

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
    async function loadMeta() {
      const session = getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const [overview, workflows] = await Promise.all([
          apiRequest<unknown>(session.accessToken, "GET", `/${slug}/overview`),
          apiRequest<unknown>(session.accessToken, "GET", `/${slug}/workflows`)
        ]);

        setOverviewPayload(overview);
        setWorkflowPayload(workflows);
      } catch (caught) {
        setMetaError(caught instanceof Error ? caught.message : "Unable to load module details");
      } finally {
        setLoadingMeta(false);
      }
    }

    void loadMeta();
  }, [router, slug]);

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
        [operation.id]: JSON.stringify(payload, null, 2)
      }));
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
        <Alert severity="warning">No operation config found for this module.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h4">{name}</Typography>
              <Chip label={slug} color="primary" variant="outlined" />
            </Stack>
            <Typography color="text.secondary">{summary}</Typography>
            <Button startIcon={<RefreshIcon />} onClick={() => window.location.reload()} sx={{ width: "fit-content" }}>
              Refresh Data
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loadingMeta ? (
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <CircularProgress size={20} />
          <Typography>Loading module details...</Typography>
        </Stack>
      ) : null}

      {metaError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {metaError}
        </Alert>
      ) : null}

      {!metaError && !loadingMeta ? (
        <Stack spacing={2} mb={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "#f5f7fa",
                  overflowX: "auto",
                  fontSize: 12,
                  whiteSpace: "pre-wrap"
                }}
              >
                {JSON.stringify(overviewPayload, null, 2)}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Workflows
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: "#f5f7fa",
                  overflowX: "auto",
                  fontSize: 12,
                  whiteSpace: "pre-wrap"
                }}
              >
                {JSON.stringify(workflowPayload, null, 2)}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      ) : null}

      <Typography variant="h5" mb={1.5}>
        Operations
      </Typography>

      {config.operations.map((operation) => {
        const operationValues = valuesByOperation[operation.id] ?? {};
        const operationError = errorByOperation[operation.id] ?? null;
        const operationResponse = responseByOperation[operation.id] ?? "";
        const isRunning = runningOperationId === operation.id;

        return (
          <Accordion key={operation.id} defaultExpanded={false} disableGutters sx={{ mb: 1.2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip size="small" label={operation.method} color="primary" />
                <Typography fontWeight={700}>{operation.title}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {operation.path}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary" mb={2}>
                {operation.description}
              </Typography>
              <Box component="form" onSubmit={(event) => void runOperation(operation, event)}>
                <Stack spacing={1.3}>
                  {(operation.fields ?? []).map((field) => {
                    const value = operationValues[field.key] ?? "";

                    if (field.type === "select") {
                      return (
                        <TextField
                          key={field.key}
                          select
                          fullWidth
                          label={`${field.label}${field.required ? " *" : ""}`}
                          value={value}
                          onChange={(event) => onFieldChange(operation.id, field.key, event.target.value)}
                          helperText={`${field.location.toUpperCase()} parameter`}
                        >
                          <MenuItem value="">
                            Select
                          </MenuItem>
                          {(field.options ?? []).map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      );
                    }

                    const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : "text";

                    return (
                      <TextField
                        key={field.key}
                        fullWidth
                        label={`${field.label}${field.required ? " *" : ""}`}
                        type={inputType}
                        value={value}
                        onChange={(event) => onFieldChange(operation.id, field.key, event.target.value)}
                        placeholder={field.placeholder}
                        multiline={field.type === "json"}
                        minRows={field.type === "json" ? 3 : undefined}
                        slotProps={field.type === "date" ? { inputLabel: { shrink: true } } : undefined}
                        helperText={`${field.location.toUpperCase()} parameter`}
                      />
                    );
                  })}

                  <Stack direction="row" spacing={1.2}>
                    <Button type="submit" variant="contained" startIcon={<PlayArrowIcon />} disabled={isRunning}>
                      {isRunning ? "Running..." : "Run Operation"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setValuesByOperation((previous) => ({
                          ...previous,
                          [operation.id]: getDefaultValues(operation)
                        }));
                        setErrorByOperation((previous) => ({ ...previous, [operation.id]: null }));
                      }}
                    >
                      Reset Fields
                    </Button>
                  </Stack>

                  {operationError ? <Alert severity="error">{operationError}</Alert> : null}

                  {operationResponse ? (
                    <>
                      <Divider />
                      <Typography variant="subtitle1">Response</Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: "#0f172a",
                          color: "#dbeafe",
                          overflowX: "auto",
                          fontSize: 12,
                          whiteSpace: "pre-wrap"
                        }}
                      >
                        {operationResponse}
                      </Box>
                    </>
                  ) : null}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Container>
  );
}
