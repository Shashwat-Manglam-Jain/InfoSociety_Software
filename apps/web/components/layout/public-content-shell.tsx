import { ReactNode } from "react";
import { Box, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";

type PublicContentShellProps = {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
};

export function PublicContentShell({ title, subtitle, badge, children }: PublicContentShellProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Card className="surface-vibrant" sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.2, md: 3.2 } }}>
          <Stack spacing={1}>
            {badge ? <Chip label={badge} color="primary" variant="outlined" sx={{ width: "fit-content" }} /> : null}
            <Typography component="h1" variant="h4" className="section-title">
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              {subtitle}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Box>{children}</Box>
    </Container>
  );
}
