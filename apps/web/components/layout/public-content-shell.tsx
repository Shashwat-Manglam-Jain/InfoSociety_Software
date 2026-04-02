"use client";

import { ReactNode } from "react";
import { Box, Card, CardContent, Chip, Container, Stack, Typography, alpha } from "@mui/material";
import type { ContainerProps } from "@mui/material";

type PublicContentShellProps = {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
};

export function PublicContentShell({ title, subtitle, badge, children, maxWidth = "lg" }: PublicContentShellProps) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 3.2, md: 4.2 } }}>
      <Card 
        className="surface-vibrant" 
        sx={{ 
          mb: 3.2,
          borderRadius: 3.2,
          border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.primary.main, 0.08)}`
        }}
      >
        <CardContent sx={{ p: { xs: 2.4, md: 3.2 } }}>
          <Stack spacing={1.5}>
            {badge ? (
              <Chip 
                label={badge} 
                color="primary" 
                variant="outlined" 
                sx={{ 
                  width: "fit-content",
                  fontWeight: 700,
                  letterSpacing: 0.04
                }} 
              />
            ) : null}
            <Typography 
              component="h1" 
              variant="h4" 
              className="section-title"
              sx={{
                fontWeight: 900,
                letterSpacing: -0.02,
                color: "#102a43"
              }}
            >
              {title}
            </Typography>
            <Typography 
              color="text.secondary" 
              sx={{ 
                maxWidth: 760,
                lineHeight: 1.7,
                fontSize: 1.05
              }}
            >
              {subtitle}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ position: "relative" }}>{children}</Box>
    </Container>
  );
}
