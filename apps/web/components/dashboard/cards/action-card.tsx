"use client";

import { Box, Button, Card, CardContent, Typography, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { type ReactNode } from "react";

export type ActionCardItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  ctaLabel: string;
};

export function ActionCard({ item }: { item: ActionCardItem }) {
  return (
    <Card 
      className="surface-glass hover-lift" 
      sx={{ 
        height: "100%", 
        borderRadius: 2.8,
        overflow: "hidden",
        border: `2px solid ${alpha("#fff", 0.12)}`,
        background: (theme) =>
          `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.88)} 0%,
            ${alpha(theme.palette.background.paper, 0.92)} 100%)`,
        transition: "all 220ms ease",
        "&:hover": {
          boxShadow: `0 20px 40px ${alpha("#000", 0.12)}`,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.24),
          transform: "translateY(-4px)"
        }
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2.8 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.8 }}>
          <Box
            sx={{
              p: 1.4,
              borderRadius: 2.4,
              background: (theme) =>
                `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.14)} 0%, 
                  ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: (theme) => theme.palette.primary.main,
              fontSize: "1.5rem",
              flexShrink: 0
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#102a43" }}>
              {item.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.8, fontSize: "0.95rem", lineHeight: 1.5 }}>
              {item.description}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: "auto", pt: 2, borderTop: (theme) => `2px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Button 
            component={Link} 
            href={item.href} 
            variant="contained" 
            fullWidth
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: "capitalize",
              py: 1.2,
              transition: "all 220ms ease",
              boxShadow: `0 8px 16px ${alpha("#000", 0.12)}`,
              "&:hover": {
                boxShadow: `0 12px 24px ${alpha("#000", 0.16)}`,
                transform: "translateY(-2px)"
              }
            }}
          >
            {item.ctaLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
