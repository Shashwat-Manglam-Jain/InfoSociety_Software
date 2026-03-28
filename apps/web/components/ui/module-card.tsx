"use client";

import Link from "next/link";
import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { BankingModule } from "@/features/banking/module-registry";
import { useLanguage } from "@/shared/i18n/language-provider";

export function ModuleCard({ module }: { module: BankingModule }) {
  const { locale, t } = useLanguage();
  const moduleCardGuidance =
    locale === "hi"
      ? "इस वर्कस्पेस को खोलकर लाइव रिकॉर्ड देखें, ज़रूरी फॉर्म पूरे करें और दैनिक ऑपरेशन्स को एक साफ निर्देशित प्रवाह में आगे बढ़ाएँ।"
      : locale === "mr"
        ? "हा वर्कस्पेस उघडून लाईव्ह नोंदी पाहा, आवश्यक फॉर्म पूर्ण करा आणि दैनंदिन ऑपरेशन्स स्वच्छ मार्गदर्शित प्रवाहात पुढे न्या."
        : "Open this workspace to review live records, complete forms, and continue daily operations in a cleaner guided flow.";

  return (
    <Card className="hover-lift surface-glass" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} mb={1}>
          <Typography variant="h6" sx={{ fontSize: "1.06rem", maxWidth: 220 }}>
            {module.name}
          </Typography>
          <Chip size="small" label={t("module.card.badge")} color="primary" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1.2}>
          {module.summary}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {moduleCardGuidance}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          {t("module.card.ready")}
        </Typography>
        <Button component={Link} href={`/modules/${module.slug}`} size="small" variant="contained" color="primary">
          {t("module.card.open")}
        </Button>
      </CardActions>
    </Card>
  );
}
