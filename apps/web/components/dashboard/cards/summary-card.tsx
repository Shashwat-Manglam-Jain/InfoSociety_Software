"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { type ReactNode } from "react";

export type SummaryCardItem = {
  key: string;
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
};

export function SummaryCard({ item }: { item: SummaryCardItem }) {
  return (
    <Card 
      className="surface-glass hover-lift" 
      sx={{ 
        height: "100%", 
        borderRadius: 2.8,
        overflow: "hidden", 
        position: "relative",
        border: `2px solid ${alpha("#fff", 0.12)}`,
        background: (theme) =>
          `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.88)} 0%,
            ${alpha(theme.palette.background.paper, 0.92)} 100%)`,
        transition: "all 220ms ease",
        "&:hover": {
          boxShadow: `0 20px 40px ${alpha("#000", 0.12)}`,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.24)
        }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 4,
          background: (theme) =>
            `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`
        }}
      />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2.2,
              background: (theme) => 
                `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.12)} 0%, 
                  ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: (theme) => theme.palette.primary.main,
              fontSize: "1.3rem",
              flexShrink: 0
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 0.8,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              {item.label}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                lineHeight: 1.1,
                fontWeight: 900,
                color: "#102a43"
              }}
            >
              {item.value}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 0.8,
                fontSize: "0.85rem"
              }}
            >
              {item.caption}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
