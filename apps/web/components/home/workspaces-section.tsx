import { useState, useRef, useEffect } from "react";
import { Box, Chip, Container, Typography, alpha, IconButton, Stack } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { WorkspacePreviewCard } from "@/features/roles/components/workspace-preview-card";
import { getWorkspaceModules } from "@/features/roles/workspace-definitions";

interface WorkspacesSectionProps {
  workspaceUi: any;
  workspaces: any[];
  locale: any;
}

export function WorkspacesSection({ workspaceUi, workspaces, locale }: WorkspacesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalItems = workspaces.length;
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  // Auto-play logic
  useEffect(() => {
    if (isPaused) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, totalItems]);

  const CARD_WIDTH = 400;
  const CARD_GAP = 28;

  return (
    <Box
      id="workspaces"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        py: { xs: 8, md: 10 },
        background: (theme) =>
          `linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(244,247,252,1) 100%)`,
        overflow: "hidden",
        position: "relative"
      }}
    >
      <Container maxWidth="lg" sx={{ mb: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: "center" }}>
          <Chip
            label="Institutional Roles"
            sx={{
              mb: 2,
              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
              color: "secondary.main",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.75rem"
            }}
          />
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontWeight: 900,
              fontSize: { xs: "2.5rem", md: "3.2rem" },
              letterSpacing: "-0.04em",
              color: "#0f172a"
            }}
          >
            {workspaceUi.homeSectionTitle}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: "auto",
              fontSize: { md: "1.1rem" },
              lineHeight: 1.8
            }}
          >
            {workspaceUi.homeSectionSubtitle}
          </Typography>
        </Box>
      </Container>

      {/* Interactive Carousel */}
      <Box sx={{ position: "relative", width: "100%", mt: 2 }}>
        {/* Navigation Arrows - Only on desktop */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
           <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: { md: 40, lg: 80 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "#1e293b",
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.06)",
                width: 48,
                height: 48,
                "&:hover": { bgcolor: "#fff", color: "secondary.main" }
              }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>

            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: { md: 40, lg: 80 },
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                color: "#1e293b",
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.06)",
                width: 48,
                height: 48,
                "&:hover": { bgcolor: "#fff", color: "secondary.main" }
              }}
            >
              <ArrowForwardIosRoundedIcon />
            </IconButton>
        </Box>

        {/* Viewport Wrapper */}
        <Box
          sx={{
            width: "100%",
            maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            overflow: "hidden"
          }}
        >
          <Box
            sx={{
              display: "flex",
              transition: "transform 800ms cubic-bezier(0.4, 0, 0.2, 1)",
              gap: `${CARD_GAP}px`,
              px: { xs: "32px", md: `calc(50% - ${CARD_WIDTH / 2}px)` }, 
              transform: {
                 xs: `translateX(calc(-${activeIndex * 100}% - ${activeIndex > 0 ? 16 : 0}px))`,
                 md: `translateX(calc(-${activeIndex * (CARD_WIDTH + CARD_GAP)}px))`
              },
              pb: 6
            }}
          >
            {workspaces.map((workspace, index) => {
              const visibleModules = getWorkspaceModules(workspace.slug, locale);

              return (
                <Box 
                  key={workspace.slug} 
                  sx={{ 
                    width: { xs: "calc(100vw - 64px)", md: `${CARD_WIDTH}px` },
                    flexShrink: 0,
                    transition: "all 600ms ease",
                    opacity: activeIndex === index ? 1 : 0.65,
                    transform: activeIndex === index ? "scale(1)" : "scale(0.95)",
                    cursor: activeIndex === index ? "default" : "pointer"
                  }}
                  onClick={() => activeIndex !== index && setActiveIndex(index)}
                >
                  <WorkspacePreviewCard
                    workspace={workspace}
                    visibleModules={visibleModules}
                    workspaceUi={workspaceUi}
                    index={index}
                    variant="home"
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Indicator Dots */}
      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1 }}>
        {workspaces.map((_, index) => (
          <Box
            key={index}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: activeIndex === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: activeIndex === index ? "secondary.main" : alpha("#0f172a", 0.12),
              cursor: "pointer",
              transition: "all 400ms ease",
              "&:hover": {
                bgcolor: activeIndex === index ? "secondary.main" : alpha("#0f172a", 0.24)
              }
            }}
          />
        ))}
      </Stack>

      {/* Swipe Tip for Mobile */}
      <Typography 
        variant="caption" 
        sx={{ 
          display: { xs: "block", md: "none" }, 
          textAlign: "center", 
          mt: 2, 
          color: "text.disabled",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 1.2
        }}
      >
        Select a role to learn more
      </Typography>
    </Box>
  );
}
