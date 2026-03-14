import Link from "next/link";
import { Box, Button, Card, CardActions, CardContent, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { BankingModule } from "@/features/banking/module-registry";

export function ModuleCard({ module }: { module: BankingModule }) {
  return (
    <Card className="hover-lift surface-glass" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} mb={1}>
          <Typography variant="h6" sx={{ fontSize: "1.06rem", maxWidth: 220 }}>
            {module.name}
          </Typography>
          <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap justifyContent="flex-end">
            <Chip size="small" label="Module" color="primary" variant="outlined" />
            <Chip size="small" label={`${module.endpoints.length} APIs`} color="secondary" variant="outlined" />
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1.2}>
          {module.summary}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.8 }}>
          Common endpoints
        </Typography>
        <Stack spacing={0.7}>
          {module.endpoints.slice(0, 2).map((endpoint) => (
            <Box
              key={endpoint}
              sx={{ fontFamily: '"Consolas", "Lucida Console", monospace' }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "inline-flex",
                  px: 1,
                  py: 0.45,
                  borderRadius: "999px",
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.92)}`,
                  bgcolor: (theme) =>
                    theme.palette.mode === "light"
                      ? alpha(theme.palette.primary.main, 0.05)
                      : alpha(theme.palette.primary.main, 0.12)
                }}
              >
                {endpoint}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Ready for workspace execution
        </Typography>
        <Button component={Link} href={`/modules/${module.slug}`} size="small" variant="contained" color="primary">
          Open Workspace
        </Button>
      </CardActions>
    </Card>
  );
}
