"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Container, Grid, Typography, Card, CardContent, Stack, Box, Alert, 
  Skeleton, Chip, Button, IconButton, Divider, Avatar, TextField, MenuItem, Drawer,
  InputAdornment, Tooltip, Paper, Switch, FormControlLabel, Snackbar,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

// Charts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Icons
import DomainIcon from "@mui/icons-material/Domain";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CorporateFareRoundedIcon from "@mui/icons-material/CorporateFareRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import ViewQuiltRoundedIcon from "@mui/icons-material/ViewQuiltRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { 
  adminListBranches, 
  adminCreateBranch, 
  createStaffUser, 
  mapAgentClient, 
  listAgentMappings, 
  getSocietyOverview, 
  listSocietyAgents, 
  updateSociety,
  listSocietyTransactions,
  getAgentPerformance
} from "@/shared/api/administration";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser } from "@/shared/types";

type DashboardView = "overview" | "directory" | "treasury" | "insights" | "settings";

const growthTrend = [
  { month: "Jan", capital: 4000, members: 240 },
  { month: "Feb", capital: 3000, members: 139 },
  { month: "Mar", capital: 5000, members: 980 },
  { month: "Apr", capital: 2780, members: 390 },
  { month: "May", capital: 6890, members: 480 },
  { month: "Jun", capital: 2390, members: 380 },
];

export default function SocietyDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { locale, t } = useLanguage();
  
  const currentView = (searchParams.get("view") as DashboardView) || "overview";

  // Data State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeDrawer, setActiveDrawer] = useState<"branch" | "agent" | "client" | "mapping" | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successData, setSuccessData] = useState<{ label: string, data: any } | null>(null);

  // Profile Form
  const [societyForm, setSocietyForm] = useState({
     name: "", billingEmail: "", billingPhone: "", billingAddress: "", registrationNumber: "", panNo: "", gstNo: "", category: "Credit Co-op", authorizedCapital: 1000000
  });

  // Provisioning Forms
  const [branchForm, setBranchForm] = useState({ code: "", name: "", isHead: false });
  const [staffForm, setStaffForm] = useState({ fullName: "", username: "", password: "", branchId: "", assignedAgentId: "" });
  const [mappingForm, setMappingForm] = useState({ agentId: "", customerId: "", installmentAmount: 0, depositUnits: 0 });

  const accountTypeLabel = "Institutional Administrator";

  useEffect(() => {
    async function loadData() {
      const session = getSession();
      if (!session) { router.replace("/login"); return; }
      try {
        const [profile, sOverview, bList, mList, aList, txs, perf] = await Promise.all([
          getMe(session.accessToken),
          getSocietyOverview(session.accessToken),
          adminListBranches(session.accessToken),
          listAgentMappings(session.accessToken),
          listSocietyAgents(session.accessToken),
          listSocietyTransactions(session.accessToken, searchQuery),
          getAgentPerformance(session.accessToken)
        ]);
        setUser(profile); setStats(sOverview); setBranches(bList as any); setMappings(mList as any); setAgents(aList as any); setTransactions(txs); setAgentPerformance(perf);
        if (profile.society) {
            setSocietyForm({
                name: profile.society.name || "",
                billingEmail: (profile.society as any).billingEmail || "",
                billingPhone: (profile.society as any).billingPhone || "",
                billingAddress: (profile.society as any).billingAddress || "",
                registrationNumber: (profile.society as any).registrationNumber || "",
                panNo: (profile.society as any).panNo || "",
                gstNo: (profile.society as any).gstNo || "",
                category: (profile.society as any).category || "Credit Co-op",
                authorizedCapital: Number((profile.society as any).authorizedCapital || 1000000)
            });
        }
      } catch (err) { setError("Data synchronization failed"); } finally { setLoading(false); }
    }
    void loadData();
  }, [router, searchQuery]);

  const sidebarItems = useMemo(() => [
    {
      heading: "COMMAND CENTER",
      items: [
        { label: "Executive Desk", href: "/dashboard/society?view=overview", icon: <ViewQuiltRoundedIcon />, active: currentView === "overview" },
        { label: "Corporate Directory", href: "/dashboard/society?view=directory", icon: <CorporateFareRoundedIcon />, active: currentView === "directory" },
        { label: "Institutional Treasury", href: "/dashboard/society?view=treasury", icon: <ReceiptLongRoundedIcon />, active: currentView === "treasury" },
        { label: "Growth Insights", href: "/dashboard/society?view=insights", icon: <AssessmentRoundedIcon />, active: currentView === "insights" },
      ]
    },
    {
      heading: "SYSTEM CONTROL",
      items: [
         { label: "Institutional Registry", href: "/dashboard/society?view=settings", icon: <SettingsSuggestRoundedIcon />, active: currentView === "settings" },
         { label: "System Logs", href: "/dashboard/society?view=logs", icon: <HistoryRoundedIcon />, active: false }
      ]
    }
  ], [currentView]);

  const handleUpdateSociety = async () => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try { await updateSociety(session.accessToken, societyForm); setSuccessData({ label: "Profile Commit Successful", data: {} }); }
    catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleCreateBranch = async () => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try { await adminCreateBranch(session.accessToken, { ...branchForm, code: undefined }); const updated = await adminListBranches(session.accessToken); setBranches(updated as any); setActiveDrawer(null); setSuccessData({ label: "Infrastructure Provisioned", data: {} }); }
    catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleCreateStaff = async (role: "AGENT" | "CLIENT") => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try {
      const res = await createStaffUser(session.accessToken, { ...staffForm, role: role as any });
      if (role === "CLIENT" && staffForm.assignedAgentId && res.customerId) { await mapAgentClient(session.accessToken, { agentId: staffForm.assignedAgentId, customerId: res.customerId, installmentAmount: 0, depositUnits: 0 }); }
      const [sN, mN, aN] = await Promise.all([ getSocietyOverview(session.accessToken), listAgentMappings(session.accessToken), listSocietyAgents(session.accessToken) ]);
      setStats(sN); setMappings(mN as any); setAgents(aN as any); setActiveDrawer(null);
      setSuccessData({ label: "Identity Provisioned", data: { username: staffForm.username, password: staffForm.password } });
    } catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;

  return (
    <DashboardShell user={user} accountTypeLabel={accountTypeLabel} onLogout={() => { clearSession(); router.replace("/"); }} t={t as any} accessibleModules={sidebarItems}>
      <Box sx={{ minHeight: "100vh", py: 2 }}>
        
        {/* VIEW: OVERVIEW */}
        {currentView === "overview" && (
           <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Institutional Command</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>SaaS control plane for {user?.society?.name}.</Typography>
              </Box>

              <Grid container spacing={3}>
                {[
                  { label: "Active network", value: stats?.totalBranches || 0, color: "#3b82f6", icon: <DomainIcon /> },
                  { label: "Operational Staff", value: stats?.totalStaff || 0, color: "#10b981", icon: <BadgeRoundedIcon /> },
                  { label: "Aggregated Capital", value: `₹${(stats?.totalCapital || 0).toLocaleString()}`, color: "#f59e0b", icon: <AccountBalanceWalletRoundedIcon /> },
                  { label: "Total Enrollments", value: stats?.totalMembers || 0, color: "#8b5cf6", icon: <GroupsRoundedIcon /> }
                ].map((k, i) => (
                   <Grid item xs={12} sm={6} md={3} key={i}>
                      <Card sx={{ borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                         <CardContent sx={{ p: 3 }}>
                            <Avatar sx={{ bgcolor: alpha(k.color, 0.08), color: k.color, borderRadius: 2, mb: 2 }}>{k.icon}</Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900 }}>{k.value}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", textTransform: "uppercase" }}>{k.label}</Typography>
                         </CardContent>
                      </Card>
                   </Grid>
                ))}
              </Grid>

              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                 <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, flex: 1 }}>Recent Tactical Pulses</Typography>
                    <Button variant="outlined" size="small" component={Link} href="/dashboard/society?view=treasury">View Treasury</Button>
                 </Stack>
                 <List disablePadding>
                    {transactions.slice(0, 5).map((tx, i) => (
                       <ListItem key={i} divider={i < 4} sx={{ px: 0 }}>
                          <ListItemIcon><Avatar sx={{ bgcolor: tx.type === "CREDIT" ? "#10b981" : "#ef4444", color: "#fff", width: 32, height: 32 }}><PaymentRoundedIcon fontSize="small" /></Avatar></ListItemIcon>
                          <ListItemText 
                            primary={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{tx.account.customer.firstName} - {tx.referenceNo}</Typography>}
                            secondary={new Date(tx.createdAt).toLocaleString()}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: tx.type === "CREDIT" ? "#10b981" : "#ef4444" }}>{tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toLocaleString()}</Typography>
                       </ListItem>
                    ))}
                 </List>
              </Paper>
           </Stack>
        )}

        {/* VIEW: TREASURY (The "Money" Page) */}
        {currentView === "treasury" && (
           <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Institutional Treasury</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Audit payments, monitor collections, and track operative performance.</Typography>
              </Box>

              <Grid container spacing={3}>
                 {/* Financial Overview Card */}
                 <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: "#0f172a", color: "#fff", backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)" }}>
                       <Grid container spacing={4} alignItems="center">
                          <Grid item xs={12} md={4}>
                             <Typography variant="overline" sx={{ opacity: 0.6, fontWeight: 900 }}>Total Society Liquidity</Typography>
                             <Typography variant="h2" sx={{ fontWeight: 900, mt: 1 }}>₹{(stats?.totalCapital || 0).toLocaleString()}</Typography>
                             <Chip label="Real-time Audit Active" size="small" icon={<VerifiedUserRoundedIcon sx={{ color: "#10b981 !important" }} />} sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 800, border: "none" }} />
                          </Grid>
                          <Grid item xs={12} md={8}>
                             <Grid container spacing={2}>
                                {[
                                   { l: "Daily Collections", v: `₹${agentPerformance.reduce((acc, a) => acc + a.daily, 0).toLocaleString()}`, color: "#10b981" },
                                   { l: "Weekly Target", v: `₹${agentPerformance.reduce((acc, a) => acc + a.weekly, 0).toLocaleString()}`, color: "#3b82f6" },
                                   { l: "Monthly Forecast", v: `₹${agentPerformance.reduce((acc, a) => acc + a.monthly, 0).toLocaleString()}`, color: "#8b5cf6" }
                                ].map((it, i) => (
                                   <Grid item xs={12} sm={4} key={i}>
                                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.05)" }}>
                                         <Typography variant="caption" display="block" sx={{ opacity: 0.6, fontWeight: 800 }}>{it.l}</Typography>
                                         <Typography variant="h6" sx={{ fontWeight: 900, color: it.color }}>{it.v}</Typography>
                                      </Box>
                                   </Grid>
                                ))}
                             </Grid>
                          </Grid>
                       </Grid>
                    </Paper>
                 </Grid>

                 {/* Agent Performance Matrix */}
                 <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Field Operative Performance Matrix</Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                       <Table>
                          <TableHead sx={{ bgcolor: "#f8fafc" }}>
                             <TableRow>
                                <TableCell sx={{ fontWeight: 900 }}>Field Operative</TableCell>
                                <TableCell sx={{ fontWeight: 900 }}>Collection ID</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>Daily Collective</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>Weekly Batch</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>Monthly Cumulative</TableCell>
                             </TableRow>
                          </TableHead>
                          <TableBody>
                             {agentPerformance.map((a) => (
                                <TableRow key={a.id} hover>
                                   <TableCell sx={{ fontWeight: 800 }}>{a.name}</TableCell>
                                   <TableCell><Chip label={a.code} size="small" sx={{ fontWeight: 900, borderRadius: 1 }} /></TableCell>
                                   <TableCell align="right">₹{a.daily.toLocaleString()}</TableCell>
                                   <TableCell align="right">₹{a.weekly.toLocaleString()}</TableCell>
                                   <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>₹{a.monthly.toLocaleString()}</TableCell>
                                </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </TableContainer>
                 </Grid>

                 {/* Detailed Transaction Search */}
                 <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                       <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, flex: 1 }}>Treasury Audit Log</Typography>
                          <TextField 
                            placeholder="Search member, staff, or TID..." size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: 300, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
                          />
                       </Stack>
                       <TableContainer>
                          <Table>
                             <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                <TableRow>
                                   <TableCell sx={{ fontWeight: 900 }}>Timestamp</TableCell>
                                   <TableCell sx={{ fontWeight: 900 }}>Beneficiary Member</TableCell>
                                   <TableCell sx={{ fontWeight: 900 }}>Reference</TableCell>
                                   <TableCell sx={{ fontWeight: 900 }}>Auth Member</TableCell>
                                   <TableCell align="right" sx={{ fontWeight: 900 }}>Impact</TableCell>
                                </TableRow>
                             </TableHead>
                             <TableBody>
                                {transactions.map((tx) => (
                                   <TableRow key={tx.id} hover>
                                      <TableCell variant="body2">{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                      <TableCell sx={{ fontWeight: 800 }}>{tx.account.customer.firstName} {tx.account.customer.lastName}</TableCell>
                                      <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace", bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}>{tx.referenceNo}</Typography></TableCell>
                                      <TableCell>{tx.createdBy.fullName}</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 900, color: tx.type === "CREDIT" ? "#10b981" : "#ef4444" }}>₹{tx.amount.toLocaleString()}</TableCell>
                                   </TableRow>
                                ))}
                             </TableBody>
                          </Table>
                       </TableContainer>
                    </Paper>
                 </Grid>
              </Grid>
           </Stack>
        )}

      </Box>

      {/* DRAWERS & DIALOGS (Preserved) */}
      <Drawer anchor="right" open={activeDrawer === "client"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, borderRadius: "20px 0 0 20px" } }}>
         <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Identity Onboarding</Typography>
            <Stack spacing={3}>
               <TextField fullWidth label="Legal Name" value={staffForm.fullName} onChange={e => setStaffForm({...staffForm, fullName: e.target.value})} />
               <TextField select fullWidth label="Branch" value={staffForm.branchId} onChange={e => setStaffForm({...staffForm, branchId: e.target.value})}>{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</TextField>
               <TextField select fullWidth label="Field Agent Assignment" value={staffForm.assignedAgentId} onChange={e => setStaffForm({...staffForm, assignedAgentId: e.target.value})}><MenuItem value="">None</MenuItem>{agents.map(a => <MenuItem key={a.id} value={a.id}>{a.firstName} {a.lastName}</MenuItem>)}</TextField>
               <Divider />
               <TextField fullWidth label="Login ID" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} />
               <TextField fullWidth label="Password" type="text" value={staffForm.password} InputProps={{ endAdornment: <IconButton size="small" onClick={() => setStaffForm({...staffForm, password: Math.random().toString(36).slice(-8)})}><KeyRoundedIcon fontSize="small" /></IconButton> }} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
               <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#8b5cf6" }} onClick={() => handleCreateStaff("CLIENT")} disabled={formLoading}>Provision Member</Button>
            </Stack>
         </Box>
      </Drawer>

      <Drawer anchor="right" open={activeDrawer === "agent"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 500 }, borderRadius: "20px 0 0 20px" } }}>
         <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Staff Provisioning</Typography>
            <Stack spacing={3}>
               <TextField fullWidth label="Full Name" value={staffForm.fullName} onChange={e => setStaffForm({...staffForm, fullName: e.target.value})} />
               <TextField select fullWidth label="Branch" value={staffForm.branchId} onChange={e => setStaffForm({...staffForm, branchId: e.target.value})}>{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</TextField>
               <Divider />
               <TextField fullWidth label="Login Username" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} />
               <TextField fullWidth label="Login Password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
               <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a" }} onClick={() => handleCreateStaff("AGENT")} disabled={formLoading}>Provision Staff</Button>
            </Stack>
         </Box>
      </Drawer>

      <Snackbar open={Boolean(successData)} autoHideDuration={8000} onClose={() => setSuccessData(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
         <Alert severity="success" sx={{ borderRadius: 3, border: "1px solid #10b981", bgcolor: "#fff", color: "#0f172a", minWidth: 400 }}>
            {successData?.label}
            {successData?.data?.username && <Typography variant="body2" sx={{ mt: 1, fontWeight: 900 }}>ID: {successData.data.username} | Pass: {successData.data.password}</Typography>}
         </Alert>
      </Snackbar>

    </DashboardShell>
  );
}
