"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { appBranding } from "@/shared/config/branding";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSiteCopy } from "@/shared/i18n/site-copy";

type LegalPageKind = "privacyPolicy" | "termsOfService";

export function LegalPageContent({ kind }: { kind: LegalPageKind }) {
  const { locale } = useLanguage();
  const copy = getSiteCopy(locale)[kind];

  return (
    <PublicContentShell badge={copy.badge} title={copy.title} subtitle={copy.subtitle.replaceAll("Infopath", appBranding.productShortName)}>
      <Stack spacing={2}>
        {copy.sections.map((section) => (
          <Card key={section.title} className="surface-glass">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.7 }}>
                {section.title}
              </Typography>
              {section.points?.map((point) => (
                <Typography key={point} color="text.secondary" sx={{ mb: 0.45 }}>
                  {"\u2022"} {point}
                </Typography>
              ))}
              {section.text ? <Typography color="text.secondary">{section.text}</Typography> : null}
            </CardContent>
          </Card>
        ))}
        {copy.contactLabel ? (
          <Card className="surface-glass">
            <CardContent>
              <Typography color="text.secondary">
                {copy.contactLabel} <strong>{appBranding.supportEmail}</strong>
              </Typography>
            </CardContent>
          </Card>
        ) : null}
      </Stack>
    </PublicContentShell>
  );
}
