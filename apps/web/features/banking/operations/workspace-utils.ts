import type { ModuleOperation, OperationField } from "./types";

type BuiltRequest = {
  method: ModuleOperation["method"];
  path: string;
  body?: Record<string, unknown>;
};

function ensureRequired(field: OperationField, rawValue: string) {
  if (field.required && rawValue.trim() === "") {
    throw new Error(`Field '${field.label}' is required`);
  }
}

function parseFieldValue(field: OperationField, rawValue: string): unknown {
  if (rawValue.trim() === "") {
    return undefined;
  }

  if (field.type === "number") {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      throw new Error(`Field '${field.label}' must be a valid number`);
    }
    return parsed;
  }

  if (field.type === "boolean") {
    return rawValue === "true";
  }

  if (field.type === "select") {
    if (rawValue === "true") {
      return true;
    }
    if (rawValue === "false") {
      return false;
    }
    return rawValue;
  }

  if (field.type === "json") {
    try {
      return JSON.parse(rawValue);
    } catch {
      throw new Error(`Field '${field.label}' must be valid JSON`);
    }
  }

  return rawValue;
}

export function buildOperationRequest(operation: ModuleOperation, values: Record<string, string>): BuiltRequest {
  const fields = operation.fields ?? [];
  const pathParams = fields.filter((field) => field.location === "path");
  const queryParams = fields.filter((field) => field.location === "query");
  const bodyFields = fields.filter((field) => field.location === "body");

  let resolvedPath = operation.path;

  for (const field of pathParams) {
    const rawValue = values[field.key] ?? "";
    ensureRequired(field, rawValue);

    if (rawValue.trim() !== "") {
      resolvedPath = resolvedPath.replace(`:${field.key}`, encodeURIComponent(rawValue.trim()));
    }
  }

  const query = new URLSearchParams();
  for (const field of queryParams) {
    const rawValue = values[field.key] ?? "";
    ensureRequired(field, rawValue);

    if (rawValue.trim() !== "") {
      query.set(field.key, rawValue.trim());
    }
  }

  const queryString = query.toString();
  if (queryString) {
    resolvedPath = `${resolvedPath}?${queryString}`;
  }

  const body: Record<string, unknown> = {};
  for (const field of bodyFields) {
    const rawValue = values[field.key] ?? "";
    ensureRequired(field, rawValue);

    const parsed = parseFieldValue(field, rawValue);
    if (parsed !== undefined) {
      body[field.key] = parsed;
    }
  }

  if (operation.method === "GET" || operation.method === "DELETE") {
    return {
      method: operation.method,
      path: resolvedPath
    };
  }

  return {
    method: operation.method,
    path: resolvedPath,
    body
  };
}

export function getDefaultValues(operation: ModuleOperation): Record<string, string> {
  const values: Record<string, string> = {};

  for (const field of operation.fields ?? []) {
    values[field.key] = field.defaultValue ?? "";
  }

  return values;
}
