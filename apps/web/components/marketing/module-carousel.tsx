"use client";

import { useEffect, useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

type ModuleSlide = {
  title: string;
  subtitle: string;
  bullets: string[];
  metric: string;
  accent: string;
};

const moduleSlides: ModuleSlide[] = [
  {
    title: "Customer Onboarding",
    subtitle: "Open accounts faster with guided KYC, validation checks, and status controls.",
    bullets: ["Single workflow for profile, nominee, and account setup", "Status-aware approvals for branch and admin teams"],
    metric: "4-step flow",
    accent: "#334155"
  },
  {
    title: "Deposit and Teller Desk",
    subtitle: "Handle savings, recurring deposits, and daily teller actions from one screen.",
    bullets: ["Receipt generation with role-based action controls", "Consistent daybook updates for operational accuracy"],
    metric: "Daily operation",
    accent: "#267d6f"
  },
  {
    title: "Loan Operations",
    subtitle: "Run application, sanction, disbursement, and repayment tracking in one module.",
    bullets: ["Clear lifecycle visibility from request to closure", "Supports review checkpoints and repayment discipline"],
    metric: "End-to-end lifecycle",
    accent: "#9f5c1f"
  },
  {
    title: "Monitoring and Reports",
    subtitle: "Give administrators decision-ready dashboards and downloadable report outputs.",
    bullets: ["Cross-module visibility for compliance and control", "Role-targeted operational reporting for leadership"],
    metric: "Audit-ready",
    accent: "#6d28d9"
  }
];

const AUTO_ROTATE_MS = 4500;

function normalizeIndex(index: number) {
  const totalSlides = moduleSlides.length;
  return (index + totalSlides) % totalSlides;
}

export function ModuleCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeSlide = moduleSlides[activeIndex];

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    // Autoplay keeps the hero dynamic for first-time visitors without requiring manual interaction.
    const timer = window.setInterval(() => {
      setActiveIndex((current) => normalizeIndex(current + 1));
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <Box
      role="region"
      aria-label="Highlighted product modules"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid #c8d7e6",
        p: { xs: 2, md: 2.4 },
        minHeight: 340,
        background: `
          radial-gradient(120% 110% at 100% 0%, ${alpha(activeSlide.accent, 0.28)} 0%, rgba(255,255,255,0) 60%),
          linear-gradient(158deg, #ffffff 0%, #f5f9fd 56%, #eef5fb 100%)
        `,
        boxShadow: "0 16px 30px rgba(11, 45, 70, 0.16)"
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Chip label="Module Carousel" size="small" color="primary" variant="outlined" />
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            aria-label="Previous module"
            onClick={() => setActiveIndex((current) => normalizeIndex(current - 1))}
            sx={{ border: "1px solid #cad8e7", bgcolor: "rgba(255, 255, 255, 0.82)" }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Next module"
            onClick={() => setActiveIndex((current) => normalizeIndex(current + 1))}
            sx={{ border: "1px solid #cad8e7", bgcolor: "rgba(255, 255, 255, 0.82)" }}
          >
            <ArrowForwardRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Typography variant="h5" sx={{ mt: 1.8, letterSpacing: "-0.02em" }}>
        {activeSlide.title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.6 }}>
        {activeSlide.subtitle}
      </Typography>

      <Stack spacing={0.7} mt={1.4}>
        {activeSlide.bullets.map((point) => (
          <Stack key={point} direction="row" spacing={0.8} alignItems="flex-start">
            <FiberManualRecordRoundedIcon sx={{ mt: "7px", fontSize: 10, color: alpha(activeSlide.accent, 0.86) }} />
            <Typography variant="body2" color="text.secondary">
              {point}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={0.8} mt={1.6}>
        <Chip
          size="small"
          label={activeSlide.metric}
          sx={{
            fontWeight: 700,
            border: `1px solid ${alpha(activeSlide.accent, 0.5)}`,
            bgcolor: alpha(activeSlide.accent, 0.1)
          }}
        />
        <Chip label={`Slide ${activeIndex + 1} / ${moduleSlides.length}`} size="small" variant="outlined" />
        <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: "auto" }, pt: { sm: 0.7 } }}>
          Hover to pause
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.6} mt={1.6}>
        {moduleSlides.map((slide, index) => (
          <Box
            key={slide.title}
            component="button"
            type="button"
            aria-label={`Show ${slide.title}`}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: index === activeIndex ? 24 : 10,
              height: 10,
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              transition: "all 220ms ease",
              bgcolor: index === activeIndex ? activeSlide.accent : "#b7c8d9"
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
