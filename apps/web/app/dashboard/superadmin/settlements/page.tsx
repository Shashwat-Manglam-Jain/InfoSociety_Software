"use client";

import { Box, Typography } from "@mui/material";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function SettlementsPage() {
  return (
    <DashboardShell user={null} onLogout={() => {}} avatarDataUrl={null} t={(k: string) => k} accountTypeLabel="Platform Superadmin" accessibleModules={[]}>
      <Box sx={{ py: 10, textAlign: "center" }}>
         <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>Settlements & Recon</Typography>
         <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700 }}>
            Under development. This will host Global automated multi-society settlement ledger.
         </Typography>
      </Box>
    </DashboardShell>
  );
}
