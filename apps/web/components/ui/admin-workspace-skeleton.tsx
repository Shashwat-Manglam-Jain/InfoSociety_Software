import { Box, Card, CardContent, Container, Divider, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

type AdminWorkspaceSkeletonProps = {
  title: string;
  description: string;
  variant: "society" | "branches";
};

type FieldSkeletonProps = {
  size: {
    xs: number;
    sm?: number;
    md?: number;
  };
};

function FieldSkeleton({ size }: FieldSkeletonProps) {
  return (
    <Grid size={size}>
      <Stack spacing={0.9}>
        <Skeleton variant="text" width="38%" height={16} />
        <Skeleton variant="rounded" height={56} />
      </Stack>
    </Grid>
  );
}

function SectionSkeleton({
  titleWidth,
  fields,
  spacingTop = 0
}: {
  titleWidth: string;
  fields: FieldSkeletonProps["size"][];
  spacingTop?: number;
}) {
  return (
    <Box sx={{ mt: spacingTop }}>
      <Skeleton variant="text" width={titleWidth} height={20} sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {fields.map((size, index) => (
          <FieldSkeleton key={`${titleWidth}-${index}`} size={size} />
        ))}
      </Grid>
    </Box>
  );
}

function SocietyAdminSkeletonContent() {
  return (
    <>
      <SectionSkeleton
        titleWidth="24%"
        fields={[
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 }
        ]}
      />

      <SectionSkeleton
        titleWidth="29%"
        spacingTop={4}
        fields={[
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 }
        ]}
      />

      <SectionSkeleton
        titleWidth="26%"
        spacingTop={4}
        fields={[
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 6 }
        ]}
      />

      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mt: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="28%" height={18} />
          <Skeleton variant="text" width="62%" height={18} />
        </Box>
        <Skeleton variant="rounded" width={180} height={42} />
      </Stack>
    </>
  );
}

function BranchAdminSkeletonContent() {
  return (
    <>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ mb: 3 }}
      >
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="rounded" width={190} height={40} />
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" width={156} height={32} />
        ))}
      </Stack>

      <SectionSkeleton
        titleWidth="23%"
        fields={[
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 },
          { xs: 12, sm: 3 }
        ]}
      />

      <SectionSkeleton
        titleWidth="21%"
        spacingTop={4}
        fields={[
          { xs: 12, sm: 6 },
          { xs: 12, sm: 6 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 }
        ]}
      />

      <SectionSkeleton
        titleWidth="25%"
        spacingTop={4}
        fields={[
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 },
          { xs: 12, sm: 4 }
        ]}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
        <Skeleton variant="rounded" width={176} height={42} />
        <Skeleton variant="rounded" width={132} height={42} />
      </Stack>
    </>
  );
}

export function AdminWorkspaceSkeleton({
  title,
  description,
  variant
}: AdminWorkspaceSkeletonProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>

      <Card elevation={0} className="surface-glass fade-rise" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>
          <Skeleton variant="text" width={variant === "society" ? "34%" : "28%"} height={34} />
          <Skeleton variant="text" width={variant === "society" ? "56%" : "52%"} height={18} />
        </Box>
        <Divider />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {variant === "society" ? <SocietyAdminSkeletonContent /> : <BranchAdminSkeletonContent />}
        </CardContent>
      </Card>
    </Container>
  );
}
