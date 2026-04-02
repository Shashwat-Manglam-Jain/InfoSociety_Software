const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = resolveTimeoutMs(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

function resolveTimeoutMs(value: string | undefined) {
  const parsed = Number(value ?? "12000");
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 12000;
}

function buildUrl(path: string) {
  return path.startsWith("http://") || path.startsWith("https://") ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractErrorMessage(payload: unknown, status: number) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null) {
    const obj = payload as Record<string, unknown>;
    
    // Check 'message' field
    if ("message" in obj) {
      if (Array.isArray(obj.message)) return obj.message.join(", ");
      if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    }

    // Check 'errors' array
    if ("errors" in obj && Array.isArray(obj.errors)) {
      const firstError = obj.errors[0];
      if (typeof firstError === "string") return firstError;
      if (typeof firstError === "object" && firstError !== null && "message" in firstError) {
        return String(firstError.message);
      }
    }

    // Check 'error' field
    if ("error" in obj && typeof obj.error === "string" && obj.error.trim()) {
      return obj.error;
    }
  }

  if (status === 401) return "Invalid credentials. Please verify your username and password.";
  if (status === 403) return "You do not have permission to access this resource.";
  if (status === 404) return "The requested resource was not found on the server.";
  if (status === 500) return "A server-side error occurred. Please try again later.";

  return `Request failed with status ${status}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      throw new Error("Received an invalid response from the server");
    }
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload, response.status));
    (error as any).status = response.status;
    throw error;
  }

  if (!payload && (response.status === 204 || !text)) {
    // If the caller expects JSON (T) but we got nothing, it's a structural error in this app's context.
    throw new Error(`The server returned an empty success (status ${response.status}). Expected data was missing.`);
  }

  return payload as T;
}

export type RequestOptions = {
  body?: unknown;
  method?: HttpMethod;
  path: string;
  token?: string;
};

export async function requestJson<T>({ body, method = "GET", path, token }: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const hasBody = method !== "GET" && method !== "DELETE";

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(hasBody ? { "Content-Type": "application/json" } : {})
      },
      cache: "no-store",
      signal: controller.signal,
      ...(hasBody ? { body: JSON.stringify(body ?? {}) } : {})
    });

    return parseResponse<T>(response);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }

    if (caught instanceof TypeError) {
      throw new Error("Unable to reach the server. Check your connection and API URL.");
    }

    throw caught;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiRequest<T = unknown>(
  token: string,
  method: HttpMethod,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  return requestJson<T>({
    token,
    method,
    path,
    body
  });
}

