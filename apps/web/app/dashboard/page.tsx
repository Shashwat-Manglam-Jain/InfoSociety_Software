"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/shared/auth/session";
import { Skeleton } from "@mui/material";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    switch (session.role) {
      case "CLIENT":
        router.replace("/dashboard/client");
        break;
      case "AGENT":
        router.replace("/dashboard/agent");
        break;
      case "SUPER_USER":
        router.replace("/dashboard/society");
        break;
      case "SUPER_ADMIN":
        router.replace("/dashboard/superadmin");
        break;
      default:
        router.replace("/login");
    }
  }, [router]);

  return <Skeleton variant="rectangular" height="100vh" />;
}
