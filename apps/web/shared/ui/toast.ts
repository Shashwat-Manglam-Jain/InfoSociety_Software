export type ToastSeverity = "success" | "info" | "warning" | "error";

export type ToastItem = {
  id: string;
  message: string;
  severity: ToastSeverity;
  durationMs?: number;
};

type ToastListener = (toast: ToastItem) => void;

const listeners = new Set<ToastListener>();
let idCounter = 0;

function nextId() {
  idCounter = (idCounter + 1) % Number.MAX_SAFE_INTEGER;
  return `${Date.now()}-${idCounter}`;
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(toast: ToastItem) {
  listeners.forEach((listener) => listener(toast));
}

type ToastOptions = {
  durationMs?: number;
};

function pushToast(severity: ToastSeverity, message: string, options: ToastOptions = {}) {
  const trimmed = message.trim();
  if (!trimmed) return;

  emit({
    id: nextId(),
    message: trimmed,
    severity,
    durationMs: options.durationMs
  });
}

export const toast = {
  success: (message: string, options?: ToastOptions) => pushToast("success", message, options),
  info: (message: string, options?: ToastOptions) => pushToast("info", message, options),
  warning: (message: string, options?: ToastOptions) => pushToast("warning", message, options),
  error: (message: string, options?: ToastOptions) => pushToast("error", message, options)
};

