"use client";

import { Box, Typography } from "@mui/material";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSuperadminExtraCopy } from "@/shared/i18n/superadmin-extra-copy";

export default function SecurityCenterPage() {
  const { locale } = useLanguage();
  const copy = getSuperadminExtraCopy(locale);

  return (
    <DashboardShell
      user={null}
      onLogout={() => {}}
      avatarDataUrl={null}
      t={(k: string) => k}
      accountTypeLabel={copy.security.accountTypeLabel}
      accessibleModules={[]}
    >
      <Box sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mb: 2 }}>
          {copy.security.title}
        </Typography>
        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700 }}>
          {copy.security.description}
        </Typography>
      </Box>
    </DashboardShell>
  );
}
