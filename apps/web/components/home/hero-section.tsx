"use client";

import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface HeroSectionProps {
  homeCopy: any;
  handleAction: (msg: string) => void;
}

export function HeroSection({ homeCopy, handleAction }: HeroSectionProps) {
  return (
    <Box
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 45%, ${theme.palette.secondary.light} 100%)`,
        color: "white",
        py: { xs: 8, md: 14 },
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-15%",
          left: "-5%",
          width: "45%",
          height: "70%",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float 20s infinite alternate ease-in-out",
          zIndex: 0
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-10%",
          right: "5%",
          width: "35%",
          height: "60%",
          background: "radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "float 15s infinite alternate-reverse ease-in-out",
          zIndex: 0
        },
        "@keyframes float": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(30px, 40px) scale(1.1)" }
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: "rgba(255,255,255,0.8)", 
                  fontWeight: 900, 
                  letterSpacing: 2,
                  bgcolor: "rgba(255,255,255,0.1)",
                  px: 2,
                  py: 0.8,
                  borderRadius: 5,
                  display: "inline-block"
                }}
              >
                {homeCopy.heroBadge}
              </Typography>
            </Box>
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 2.5, 
                fontWeight: 900, 
                lineHeight: 1.15,
                fontSize: { xs: "2.8rem", md: "4.2rem" },
                letterSpacing: "-0.04em",
                textShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              {homeCopy.heroTitle}
            </Typography>
            <Typography sx={{ fontSize: { xs: "1.05rem", md: "1.25rem" }, mb: 4.5, color: "rgba(255,255,255,0.9)", maxWidth: 580, lineHeight: 1.7 }}>
              {homeCopy.heroDescription}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                disableElevation
                sx={{ 
                  height: 56,
                  px: 4,
                  bgcolor: "white", 
                  color: "secondary.main",
                  fontWeight: 900,
                  borderRadius: 3,
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.92)", transform: "translateY(-2px)" },
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease"
                }}
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleAction(homeCopy.registerToast)}
              >
                {homeCopy.heroPrimaryAction}
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                sx={{ 
                  height: 56,
                  px: 4,
                  color: "white", 
                  borderColor: "rgba(255,255,255,0.5)",
                  borderWidth: 2,
                  fontWeight: 900,
                  borderRadius: 3,
                  fontSize: "1rem",
                  "&:hover": { borderColor: "white", borderWidth: 2, bgcolor: "rgba(255,255,255,0.1)" }
                }}
                onClick={() => handleAction(homeCopy.loginToast)}
              >
                {homeCopy.heroSecondaryAction}
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ 
              background: "rgba(255,255,255,0.12)", 
              backdropFilter: "blur(12px)", 
              borderRadius: 5, 
              p: 4.5, 
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 40px 100px -20px rgba(15, 23, 42, 0.25)"
            }}>
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,1)", fontWeight: 900, letterSpacing: 1.5 }}>
                {homeCopy.heroPanelTitle} 
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.95)", mt: 1, mb: 3.5, maxWidth: 440, fontSize: "0.95rem", lineHeight: 1.6 }}>
                {homeCopy.heroPanelDescription}
              </Typography>
              <Stack spacing={2.2}>
                {homeCopy.capabilities?.slice(0, 3).map((cap: string) => (
                  <Stack key={cap} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "rgba(78, 203, 113, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircleIcon sx={{ color: "#4ECB71", fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ color: "rgba(255,255,255,0.95)", fontWeight: 700, fontSize: "0.98rem" }}>{cap}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
