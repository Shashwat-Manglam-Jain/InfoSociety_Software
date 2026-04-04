"use client";

import React from "react";
import { 
  Avatar, 
  Box,
  Button, 
  Chip, 
  Grid, 
  Paper, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { SectionHero } from "../operations/SectionHero";
import { MetricCard } from "../operations/MetricCard";
import { DESIGN_SYSTEM } from "@/shared/theme/design-system";

export type DirectorGovernanceProps = {
  directors: any[];
  handleOpenDrawer: (type: "director", director?: any) => void;
  handleDeleteDirector: (id: string) => void;
};

export function DirectorGovernance({
  directors,
  handleOpenDrawer,
  handleDeleteDirector
}: DirectorGovernanceProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const surfaces = isDark ? DESIGN_SYSTEM.SURFACES.DARK : DESIGN_SYSTEM.SURFACES.LIGHT;

  const metrics = [
    { label: "Board Members", value: String(directors.length), caption: "Institutional governance body." },
    { label: "Signatories", value: String(directors.filter(d => d.isAuthorizedSignatory).length), caption: "Financial signing authorities." },
    { label: "Stability Score", value: "98%", caption: "Institutional governance health." },
    { label: "Compliance", value: "MCA Verified", caption: "Regulatory filing status." }
  ];

  return (
    <Stack spacing={4}>
      <SectionHero
        icon={<ManageAccountsRoundedIcon />}
        eyebrow="Governance"
        title="Institutional Body"
        description="Monitor the sovereign governing body, board members, and authorized financial signatories of the society."
        colorScheme="rose"
        actions={
          <Button 
            variant="contained" 
            startIcon={<PersonAddAlt1RoundedIcon />} 
            onClick={() => handleOpenDrawer("director")}
            sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: 2.5, fontWeight: 900, "&:hover": { bgcolor: "#f1f5f9" } }}
          >
            Appoint Director
          </Button>
        }
      />

      <Grid container spacing={3}>
        {metrics.map((m, idx) => (
          <Grid key={m.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 6, border: `1px solid ${surfaces.border}`, overflow: 'hidden', bgcolor: surfaces.paper }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: surfaces.tableHead }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, py: 2.5 }}>Director Identity</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>DIN Artifact</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Governance Role</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Compliance Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {directors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 8, textAlign: 'center' }}>
                    <BusinessRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>No Directors Documented</Typography>
                    <Typography variant="body2" color="text.secondary">Start by appointing the institutional board members.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                directors.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", fontWeight: 900, borderRadius: 2 }}>
                          {d.firstName ? d.firstName[0] : ""}{d.lastName ? d.lastName[0] : ""}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{d.firstName} {d.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">{d.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 900 }}>{d.din}</Typography>
                      <Typography variant="caption" color="text.secondary">Director Identification Number</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.designation}</Typography>
                      {d.isAuthorizedSignatory && (
                        <Chip 
                          label="Authorized Signatory" 
                          size="small" 
                          icon={<VerifiedUserRoundedIcon sx={{ fontSize: 14 }} />} 
                          sx={{ mt: 0.5, fontWeight: 900, color: "primary.main", bgcolor: alpha("#2563eb", 0.05), border: "none" }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label="Onboarded" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <IconButton size="small" sx={{ color: "primary.main" }} onClick={() => handleOpenDrawer("director", d)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "error.main" }} onClick={() => handleDeleteDirector(d.id)}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
