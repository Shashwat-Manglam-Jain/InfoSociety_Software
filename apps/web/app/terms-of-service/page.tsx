import type { Metadata } from "next";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for use of the ${appBranding.productName} platform.`,
  alternates: {
    canonical: "/terms-of-service"
  }
};

const clauses = [
  {
    title: "Authorized Use",
    text: "Use of this platform is limited to authorized organizational and individual users operating within assigned roles."
  },
  {
    title: "Operational Responsibility",
    text: "Users are responsible for accurate data entry, lawful process execution, and compliance with internal society operating rules."
  },
  {
    title: "Prohibited Actions",
    text: "Unauthorized access, data misuse, manipulation of records, and any attempt to bypass controls are strictly prohibited."
  },
  {
    title: "Service Evolution",
    text: "Features, workflows, and terms may be updated periodically. Continued usage indicates acceptance of current terms."
  }
];

export default function TermsPage() {
  return (
    <PublicContentShell
      badge="Legal"
      title="Terms of Service"
      subtitle={`These terms govern access to ${appBranding.productShortName} and define acceptable usage for all organizational users.`}
    >
      <Stack spacing={2}>
        {clauses.map((clause) => (
          <Card key={clause.title} className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.6 }}>
                {clause.title}
              </Typography>
              <Typography color="text.secondary">{clause.text}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PublicContentShell>
  );
}
