"use client";

import Link from "next/link";
import { Button, Stack } from "@mui/material";
import { PublicContentShell } from "@/components/layout/public-content-shell";
import { useLanguage } from "@/shared/i18n/language-provider";
import { getSiteCopy } from "@/shared/i18n/site-copy";

export function NotFoundContent() {
  const { locale } = useLanguage();
  const copy = getSiteCopy(locale).errorStates;

  return (
    <PublicContentShell badge={copy.notFoundBadge} title={copy.notFoundTitle} subtitle={copy.notFoundDescription}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button component={Link} href="/" variant="contained" color="primary">
          {copy.home}
        </Button>
        <Button component={Link} href="/contact" variant="outlined" color="primary">
          {copy.contactSupport}
        </Button>
      </Stack>
    </PublicContentShell>
  );
}
