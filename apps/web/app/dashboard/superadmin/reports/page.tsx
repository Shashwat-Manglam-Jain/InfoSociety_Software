"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Grid, Typography, Stack, Box, Alert, Skeleton, Button, TextField, MenuItem,
  Chip, Avatar, Paper, Card, CardContent, Divider, LinearProgress, Table, TableHead,
  TableRow, TableCell, TableBody, Switch, FormControlLabel
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getSession, clearSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser } from "@/shared/types";

const REPORTS = [
  { id: "rp-1", name: "Global Financial Audit", type: "PDF", category: "Audit", generatedAt: "2026-03-31T10:00:00Z", status: "DONE" },
  { id: "rp-2", name: "Active Societies Overview", type: "CSV", category: "Governance", generatedAt: "2026-03-30T15:45:00Z", status: "DONE" },
  { id: "rp-3", name: "Network Agent Activity", type: "XLSX", category: "Operations", generatedAt: "2026-03-29T09:15:00Z", status: "DONE" },
  { id: "rp-4", name: "Platform Risk Analysis", type: "PDF", category: "Audit", generatedAt: "2026-03-31T18:30:00Z", status: "RUNNING" },
];

export default function SuperadminReports() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("all_societies");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function init() {
      const session = getSession();
      if (!session || session.role !== "SUPER_ADMIN") {
        router.replace("/admin");
        return;
      }
      try {
        const u = await getMe(session.accessToken);
        setUser(u);
      } catch (err) {
        clearSession();
        router.replace("/admin");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const customAccessibleModules = useMemo(() => [
      {
        heading: "EXECUTIVE SUITE",
        items: [
          { label: "Portfolio Snapshot", href: "/dashboard/superadmin", slug: "dashboard", icon: <InsightsRoundedIcon /> }
        ]
      },
      {
        heading: "PLATFORM GOVERNANCE",
        items: [
          { label: "Approvals & Requests", href: "/dashboard/superadmin/approvals", slug: "approvals", icon: <VerifiedUserRoundedIcon /> },
          { label: "Platform Analytics", href: "/dashboard/superadmin/analytics", slug: "analytics", icon: <BarChartRoundedIcon /> },
          { label: "Network Explorer", href: "/dashboard/superadmin/societies", slug: "societies", icon: <BusinessCenterRoundedIcon /> },
          { label: "Report Generation", href: "/dashboard/superadmin/reports", slug: "reports", active: true, icon: <AnalyticsRoundedIcon /> },
          { label: "System UI Settings", href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
  ], []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 2000);
  };

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;

  return (
    <DashboardShell
      user={user}
      accountTypeLabel={t("account.platform")}
      avatarDataUrl={null}
      onLogout={() => { clearSession(); router.replace("/"); }}
      t={t as any}
      accessibleModules={customAccessibleModules}
    >
      <Box sx={{ pb: 8 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 2 }}>
            COMMAND CENTER
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            Report Generation
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}>
            Generate and export global system reports, governance audits, and portfolio statements.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff", position: "sticky", top: 100 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, color: "#0f172a" }}>Generate Audit Report</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
                Configure platform metrics to compile an executive summary. Data is consolidated across all verified societies.
              </Typography>

              <Stack spacing={3}>
                <TextField
                  select
                  fullWidth
                  label="Report Type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 }
                  }}
                >
                  <MenuItem value="all_societies" sx={{ fontWeight: 700 }}>Active Societies Overview</MenuItem>
                  <MenuItem value="pending_audits" sx={{ fontWeight: 700 }}>Pending Approvals & Suspend Logs</MenuItem>
                  <MenuItem value="financial_audit" sx={{ fontWeight: 700 }}>Global Financial Portfolio (Liquidity)</MenuItem>
                  <MenuItem value="system_agents" sx={{ fontWeight: 700 }}>Network Agent & User Distribution</MenuItem>
                  <MenuItem value="custom_matrix" sx={{ fontWeight: 700 }}>Custom Data Matrix (Granular)</MenuItem>
                </TextField>

                {reportType === "custom_matrix" && (
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(15,23,42,0.02)", border: "1px dashed rgba(148,163,184,0.3)" }}>
                     <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, mb: 1.5, display: "block" }}>Custom Advanced Filters</Typography>
                     <Stack spacing={2}>
                        <TextField 
                           fullWidth size="small" label="Target Society ID (Optional)" 
                           placeholder="e.g. SOC-001 or Type 'ALL'"
                           sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }} 
                        />
                        <TextField 
                           fullWidth size="small" label="Agent Name / ID" 
                           placeholder="Filter users strictly under a specific agent"
                           sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }} 
                        />
                        <TextField 
                           fullWidth size="small" label="Specific Client Name / ID" 
                           placeholder="Generate isolated report for this user only"
                           sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }} 
                        />
                        <TextField 
                           select fullWidth size="small" label="Target Account Type" defaultValue="ALL"
                           sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontWeight: 700 } }}
                        >
                           <MenuItem value="ALL" sx={{ fontWeight: 700 }}>All Accounts (Mixed)</MenuItem>
                           <MenuItem value="LOAN" sx={{ fontWeight: 700 }}>Loans (Issuance & Recovery Only)</MenuItem>
                           <MenuItem value="SAVINGS" sx={{ fontWeight: 700 }}>Savings (Liquid Baseline)</MenuItem>
                           <MenuItem value="FIXED_DEPOSIT" sx={{ fontWeight: 700 }}>Fixed Deposits (Locked Assets)</MenuItem>
                        </TextField>

                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(148,163,184,0.3)", bgcolor: "#fff" }}>
                           <Typography variant="caption" sx={{ fontWeight: 800, color: "text.primary" }}>Boolean Toggles</Typography>
                           <Grid container spacing={1} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Include Inactive Users</Typography>} /></Grid>
                              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Include Closed Loans</Typography>} /></Grid>
                              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Embed KYC Metadata</Typography>} /></Grid>
                              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch size="small" defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 700 }}>PDF High-Resolution</Typography>} /></Grid>
                           </Grid>
                        </Paper>
                     </Stack>
                  </Paper>
                )}

                <Stack direction="row" spacing={2}>
                   <TextField
                     type="date"
                     label="From Date"
                     fullWidth
                     InputLabelProps={{ shrink: true }}
                     sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }}
                   />
                   <TextField
                     type="date"
                     label="To Date"
                     fullWidth
                     InputLabelProps={{ shrink: true }}
                     sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, fontWeight: 700 } }}
                   />
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerate}
                  disabled={generating}
                  startIcon={<AnalyticsRoundedIcon />}
                  sx={{ py: 1.5, borderRadius: 3, fontWeight: 900, fontSize: "1rem" }}
                >
                  {generating ? "Compiling Data..." : "Generate Audit"}
                </Button>
                {generating && <LinearProgress sx={{ borderRadius: 4, height: 6 }} />}
              </Stack>
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 7 }}>
             <Paper elevation={0} sx={{ borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff", overflow: "hidden" }}>
               <Box sx={{ p: 3, borderBottom: "1px solid rgba(148,163,184,0.12)", bgcolor: "#f8fafc" }}>
                 <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>Recent Generation Jobs</Typography>
                 <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", mt: 0.5 }}>
                   Generated artifacts are securely vaulted for up to 30 days.
                 </Typography>
               </Box>

               <Table>
                 <TableHead>
                   <TableRow>
                     <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", color: "text.secondary" }}>REPORT</TableCell>
                     <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", color: "text.secondary" }}>CATEGORY</TableCell>
                     <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", color: "text.secondary" }}>DATE</TableCell>
                     <TableCell sx={{ fontWeight: 900, fontSize: "0.75rem", color: "text.secondary", align: "right" }}>ACTIONS</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {REPORTS.map((rp) => (
                     <TableRow key={rp.id} sx={{ "&:hover": { bgcolor: "rgba(15,23,42,0.02)" } }}>
                       <TableCell>
                         <Stack direction="row" spacing={1.5} alignItems="center">
                           <Avatar sx={{ width: 36, height: 36, bgcolor: rp.type === "PDF" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: rp.type === "PDF" ? "#ef4444" : "#10b981" }}>
                             {rp.type === "PDF" ? <PictureAsPdfRoundedIcon sx={{ fontSize: 18 }} /> : <DescriptionRoundedIcon sx={{ fontSize: 18 }} />}
                           </Avatar>
                           <Box>
                             <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>{rp.name}</Typography>
                             <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 800 }}>{rp.type}</Typography>
                           </Box>
                         </Stack>
                       </TableCell>
                       <TableCell>
                         <Chip label={rp.category} size="small" sx={{ fontWeight: 800, fontSize: "0.65rem", bgcolor: alpha("#3b82f6", 0.08), color: "#3b82f6" }} />
                       </TableCell>
                       <TableCell>
                         <Typography variant="body2" sx={{ fontWeight: 700 }}>
                           {new Date(rp.generatedAt).toLocaleDateString()}
                         </Typography>
                       </TableCell>
                       <TableCell align="right">
                         {rp.status === "DONE" ? (
                           <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} sx={{ borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
                             Download
                           </Button>
                         ) : (
                           <Chip label="RUNNING" size="small" sx={{ fontWeight: 800, fontSize: "0.65rem", bgcolor: "#fef3c7", color: "#d97706" }} />
                         )}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </Paper>
          </Grid>
        </Grid>

      </Box>
    </DashboardShell>
  );
}
