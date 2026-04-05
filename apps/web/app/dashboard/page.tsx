"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { getDefaultDashboardPath, getSession } from "@/shared/auth/session";

export default function DashboardRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    // Role-based routing from Dashboard Root view
    switch (session.role) {
      case "CLIENT":
        router.replace(getDefaultDashboardPath(session.accountType, session.requiresPasswordChange, session.allowedModuleSlugs));
        break;
      case "AGENT":
        router.replace(getDefaultDashboardPath(session.accountType, session.requiresPasswordChange, session.allowedModuleSlugs));
        break;
      case "SUPER_ADMIN":
        router.replace("/dashboard/superadmin");
        break;
      case "SUPER_USER":
        window.location.href = getDefaultDashboardPath(
          session.accountType,
          session.requiresPasswordChange,
          session.allowedModuleSlugs
        );
        break;
      default:
        router.replace("/login");
    }
  }, [router]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
