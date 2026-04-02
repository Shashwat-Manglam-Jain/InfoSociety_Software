"use client";

import { Box, Typography } from "@mui/material";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function SecurityCenterPage() {
  return (
    <DashboardShell user={null} onLogout={() => {}} avatarDataUrl={null} t={(k: string) => k} accountTypeLabel="Platform Superadmin" accessibleModules={[]}>
      <Box sx={{ py: 10, textAlign: "center" }}>
         <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>Security Center Central Hub</Typography>
         <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700 }}>
            Under development. This will host Global Firewall rules and advanced MFA controls.
         </Typography>
      </Box>
    </DashboardShell>
  );
}
