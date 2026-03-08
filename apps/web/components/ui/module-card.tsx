import Link from "next/link";
import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { BankingModule } from "@/features/banking/module-registry";

export function ModuleCard({ module }: { module: BankingModule }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">{module.name}</Typography>
          <Chip size="small" label="Module" color="primary" variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1.2}>
          {module.summary}
        </Typography>
        <Stack spacing={0.5}>
          {module.endpoints.slice(0, 2).map((endpoint) => (
            <Typography key={endpoint} variant="caption" color="text.secondary">
              {endpoint}
            </Typography>
          ))}
        </Stack>
      </CardContent>
      <CardActions>
        <Button component={Link} href={`/modules/${module.slug}`} size="small" variant="outlined">
          Open
        </Button>
      </CardActions>
    </Card>
  );
}
