"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { subscribeToToasts, ToastItem } from "@/shared/ui/toast";

const DEFAULT_DURATION_MS = 3200;

export function ToastViewport() {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [active, setActive] = useState<ToastItem | null>(null);
  const open = Boolean(active);

  const autoHideDuration = useMemo(() => {
    if (!active) return DEFAULT_DURATION_MS;
    return typeof active.durationMs === "number" && active.durationMs >= 800 ? active.durationMs : DEFAULT_DURATION_MS;
  }, [active]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setQueue((prev) => [...prev, toast]);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (active) return;
    if (queue.length === 0) return;

    setActive(queue[0]);
    setQueue((prev) => prev.slice(1));
  }, [active, queue]);

  function closeActive() {
    setActive(null);
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={closeActive}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={closeActive} severity={active?.severity ?? "info"} sx={{ width: "100%" }}>
        {active?.message ?? ""}
      </Alert>
    </Snackbar>
  );
}

