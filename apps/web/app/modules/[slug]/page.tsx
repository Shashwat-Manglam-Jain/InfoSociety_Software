"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Container, Stack, Typography } from "@mui/material";
import { modules } from "@/features/banking/module-registry";
import { ModuleWorkspace } from "@/features/banking/operations/module-workspace";

export default function ModuleDetailPage() {
  const params = useParams<{ slug: string }>();
  const module = modules.find((item) => item.slug === params.slug);

  if (!module) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5">Module not found</Typography>
        <Button component={Link} href="/dashboard" sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6">Operational Workspace</Typography>
          <Button component={Link} href="/dashboard" variant="outlined">
            Back to Dashboard
          </Button>
        </Stack>
      </Container>
      <ModuleWorkspace slug={module.slug} name={module.name} summary={module.summary} />
    </>
  );
}
