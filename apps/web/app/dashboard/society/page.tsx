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
  getAgentPerformance,
  getCustomerDetails,
  getAgentDetails
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
  const [selectedProfile, setSelectedProfile] = useState<{ type: 'AGENT' | 'CLIENT', data: any } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Profile Form
  const [societyForm, setSocietyForm] = useState({
     name: "", billingEmail: "", billingPhone: "", billingAddress: "", registrationNumber: "", panNo: "", gstNo: "", category: "Credit Co-op", authorizedCapital: 1000000
  });

  // Provisioning Forms
  const [branchForm, setBranchForm] = useState({ code: "", name: "", isHead: false });
  const [staffForm, setStaffForm] = useState({ fullName: "", username: "", password: "", branchId: "", assignedAgentId: "" });
  const [mappingForm, setMappingForm] = useState({ agentId: "", customerId: "", installmentAmount: 0, depositUnits: 0 });

  const updateBranchName = (name: string) => {
    const sCode = user?.society?.code || "";
    const bSuffix = name.trim().slice(0, 1).toUpperCase();
    const code = sCode ? `${sCode}-${bSuffix}` : bSuffix;
    setBranchForm(prev => ({
      ...prev,
      name,
      code
    }));
  };

  const updateStaffName = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^\w.]/g, '');
    setStaffForm(prev => ({
        ...prev,
        fullName: name,
        username: slug
    }));
  };

  const handleOpenDrawer = (type: "branch" | "agent" | "client" | "mapping") => {
    if (type === "branch") {
        setBranchForm({ code: "", name: "", isHead: false });
    } else if (type === "agent" || type === "client") {
        setStaffForm({ 
            fullName: "", 
            username: "", 
            password: Math.random().toString(36).slice(-8), 
            branchId: branches[0]?.id || "", 
            assignedAgentId: "" 
        });
    } else if (type === "mapping") {
        setMappingForm({ agentId: "", customerId: "", installmentAmount: 0, depositUnits: 0 });
    }
    setActiveDrawer(type);
  };

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
          { label: "System Logs", href: "/dashboard/society?view=logs", icon: <HistoryRoundedIcon />, active: currentView === "logs" }
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
    try { await adminCreateBranch(session.accessToken, branchForm); const updated = await adminListBranches(session.accessToken); setBranches(updated as any); setActiveDrawer(null); setSuccessData({ label: "Infrastructure Provisioned", data: {} }); }
    catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleCreateStaff = async (role: "AGENT" | "CLIENT") => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try {
      const { assignedAgentId, ...payload } = staffForm;
      const res = await createStaffUser(session.accessToken, { ...payload, role: role as any });
      if (role === "CLIENT" && assignedAgentId && res.customerId) { 
        await mapAgentClient(session.accessToken, { 
          agentId: assignedAgentId, 
          customerId: res.customerId, 
          installmentAmount: 0, 
          depositUnits: "0" 
        }); 
      }
      const [sN, mN, aN] = await Promise.all([ getSocietyOverview(session.accessToken), listAgentMappings(session.accessToken), listSocietyAgents(session.accessToken) ]);
      setStats(sN); setMappings(mN as any); setAgents(aN as any); setActiveDrawer(null);
      setSuccessData({ label: "Identity Provisioned", data: { username: staffForm.username, password: staffForm.password } });
    } catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleViewProfile = async (id: string, type: 'AGENT' | 'CLIENT') => {
    const session = getSession(); if (!session) return;
    setDetailLoading(true);
    try {
      const data = type === 'AGENT' ? await getAgentDetails(session.accessToken, id) : await getCustomerDetails(session.accessToken, id);
      setSelectedProfile({ type, data });
    } catch (e: any) { alert("Failed to load profile details"); } finally { setDetailLoading(false); }
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

        {/* VIEW: DIRECTORY (Infrastructure & Staff) */}
        {currentView === "directory" && (
           <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Corporate Directory</Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Manage operational branches, staff operatives, and institutional members.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<HomeWorkRoundedIcon />} onClick={() => handleOpenDrawer("branch")} sx={{ bgcolor: "#0f172a", borderRadius: 2 }}>Add Branch</Button>
                  <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => handleOpenDrawer("agent")} sx={{ bgcolor: "#3b82f6", borderRadius: 2 }}>Add Agent</Button>
                  <Button variant="contained" startIcon={<GroupsRoundedIcon />} onClick={() => handleOpenDrawer("client")} sx={{ bgcolor: "#8b5cf6", borderRadius: 2 }}>Add Client</Button>
                </Stack>
              </Box>

              <Grid container spacing={3}>
                {/* Branch Registry */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Branch Infrastructure</Typography>
                    <List disablePadding>
                      {branches.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No branches provisioned yet.</Typography>
                      ) : (
                        branches.map((b, i) => (
                          <ListItem key={i} divider={i < branches.length - 1} sx={{ px: 0 }}>
                            <ListItemIcon><Avatar sx={{ bgcolor: b.isHead ? "#3b82f6" : "#f1f5f9", color: b.isHead ? "#fff" : "#64748b" }}><DomainIcon /></Avatar></ListItemIcon>
                            <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{b.name}</Typography>} secondary={b.isHead ? "Headquarters" : "Regional Branch"} />
                            {b.isHead && <Chip label="HQ" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6" }} />}
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Paper>
                </Grid>

                {/* Agent Roster */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Field Operatives</Typography>
                    <List disablePadding>
                      {agents.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No staff operatives assigned.</Typography>
                      ) : (
                        agents.map((a, i) => (
                          <ListItem key={i} divider={i < agents.length - 1} sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: alpha("#f1f5f9", 0.5) } }} onClick={() => handleViewProfile(a.id, "AGENT")}>
                            <ListItemIcon><Avatar sx={{ bgcolor: "#f1f5f9", color: "#64748b" }}><BadgeRoundedIcon /></Avatar></ListItemIcon>
                            <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{a.firstName} {a.lastName}</Typography>} secondary={`Code: ${a.code || a.customerCode || 'N/A'}`} />
                            <Chip label="AGENT" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981", borderRadius: 1 }} />
                          </ListItem>
                        ))
                      )}
                    </List>
                  </Paper>
                </Grid>

                {/* Mapping Info */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                     <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Institutional Assignments</Typography>
                     <TableContainer>
                        <Table>
                           <TableHead sx={{ bgcolor: "#f8fafc" }}>
                              <TableRow>
                                 <TableCell sx={{ fontWeight: 900 }}>Member Identity</TableCell>
                                 <TableCell sx={{ fontWeight: 900 }}>Account Reference</TableCell>
                                 <TableCell sx={{ fontWeight: 900 }}>Assigned Agent</TableCell>
                                 <TableCell align="right" sx={{ fontWeight: 900 }}>Commitment Units</TableCell>
                              </TableRow>
                           </TableHead>
                           <TableBody>
                              {mappings.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>No agent-member mappings established.</Typography></TableCell></TableRow>
                              ) : (
                                mappings.map((m, i) => (
                                  <TableRow key={i} hover sx={{ cursor: 'pointer' }} onClick={() => handleViewProfile(m.customerId, "CLIENT")}>
                                    <TableCell sx={{ fontWeight: 800 }}>{(m.customer as any)?.firstName} {(m.customer as any)?.lastName}</TableCell>
                                    <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace", bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}>{m.customerId?.slice(-8).toUpperCase()}</Typography></TableCell>
                                    <TableCell>{(m.agent as any)?.firstName} {(m.agent as any)?.lastName}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>{m.depositUnits} Units</TableCell>
                                  </TableRow>
                                ))
                              )}
                           </TableBody>
                        </Table>
                     </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
           </Stack>
        )}

        {/* VIEW: INSIGHTS (Growth & Visualizations) */}
        {currentView === "insights" && (
           <Stack spacing={4}>
              <Box sx={{ p: 4, borderRadius: 4, bgcolor: "#0f172a", color: "#fff", backgroundImage: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                   <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.6, letterSpacing: '0.2em' }}>ANALYTIC INTELLIGENCE</Typography>
                   <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, letterSpacing: "-0.04em" }}>Growth Insights</Typography>
                   <Typography variant="body1" sx={{ opacity: 0.8, mt: 1, maxWidth: 600 }}>Visualized trajectory of institutional liquidity, member participation, and regional performance distributions.</Typography>
                </Box>
                <InsightsRoundedIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 200, opacity: 0.05, color: '#fff' }} />
              </Box>

              {/* KPI STRIP */}
              <Grid container spacing={3}>
                 {[
                    { label: "Quarterly Growth", value: "+24.8%", sub: "vs Last Q", color: "#10b981", icon: <TrendingUpRoundedIcon /> },
                    { label: "New Enrollments", value: "842", sub: "Last 30 Days", color: "#3b82f6", icon: <GroupsRoundedIcon /> },
                    { label: "Revenue Momentum", value: "₹4.2M", sub: "Projected Monthly", color: "#8b5cf6", icon: <QueryStatsRoundedIcon /> },
                    { label: "Branch Coverage", value: "100%", sub: "Active Deployment", color: "#f59e0b", icon: <MapRoundedIcon /> }
                 ].map((k, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                       <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", height: '100%' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                             <Avatar sx={{ bgcolor: alpha(k.color, 0.1), color: k.color, borderRadius: 2 }}>{k.icon}</Avatar>
                             <Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", display: 'block' }}>{k.label}</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900 }}>{k.value}</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: k.color }}>{k.sub}</Typography>
                             </Box>
                          </Stack>
                       </Paper>
                    </Grid>
                 ))}
              </Grid>

              <Grid container spacing={3}>
                {/* Main Trend Chart */}
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                       <Box>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>Institutional Liquidity Accumulation</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FISCAL YEAR 2024 (DATA IN INR)</Typography>
                       </Box>
                       <Stack direction="row" spacing={1}>
                          <Chip label="Capital" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6" }} />
                          <Chip label="Members" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#8b5cf6", 0.1), color: "#8b5cf6" }} />
                       </Stack>
                    </Stack>
                    <Box sx={{ height: 400, width: "100%" }}>
                       <ResponsiveContainer>
                          <AreaChart data={growthTrend}>
                             <defs>
                                <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} />
                             <ChartTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', fontWeight: 800 }} />
                             <Area type="monotone" dataKey="capital" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCap)" />
                             <Area type="monotone" dataKey="members" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorMem)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                   <Stack spacing={3} sx={{ height: '100%' }}>
                      {/* Distribution Piece */}
                      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", flex: 1 }}>
                         <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Asset Distribution</Typography>
                         <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 4 }}>CAPITAL BY BRANCH ENTITY</Typography>
                         <Box sx={{ height: 220, position: 'relative' }}>
                            <ResponsiveContainer>
                               <PieChart>
                                  <Pie data={[{n: 'Main', v: 45}, {n: 'North', v: 25}, {n: 'South', v: 30}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="v">
                                     <Cell fill="#3b82f6" />
                                     <Cell fill="#10b981" />
                                     <Cell fill="#f59e0b" />
                                  </Pie>
                               </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                               <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>₹12M</Typography>
                               <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Total Assets</Typography>
                            </Box>
                         </Box>
                         <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {[{l: 'Main Branch', p: '45%', c: '#3b82f6'}, {l: 'North Sector', p: '25%', c: '#10b981'}, {l: 'South Sector', p: '30%', c: '#f59e0b'}].map((dist, idx) => (
                               <Stack key={idx} direction="row" alignItems="center" justifyContent="space-between">
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                     <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dist.c }} />
                                     <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>{dist.l}</Typography>
                                  </Stack>
                                  <Typography variant="body2" sx={{ fontWeight: 900 }}>{dist.p}</Typography>
                               </Stack>
                            ))}
                         </Stack>
                      </Paper>

                      {/* Growth Velocity */}
                      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: alpha("#8b5cf6", 0.05), border: "1px solid rgba(139, 92, 246, 0.1)" }}>
                         <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2, color: "#8b5cf6" }}>Institutional Velocity</Typography>
                         <Typography variant="body2" sx={{ color: "rgba(15, 23, 42, 0.7)", fontWeight: 700, mb: 3 }}>The society is currently tracking at 1.4x the average onboarding frequency across the network.</Typography>
                         <Button fullWidth variant="contained" sx={{ bgcolor: "#8b5cf6", borderRadius: 2, py: 1.5, fontWeight: 900 }}>Expand Market Share</Button>
                      </Paper>
                   </Stack>
                </Grid>
              </Grid>
           </Stack>
        )}

        {/* VIEW: SETTINGS (Institutional Registry) */}
        {currentView === "settings" && (
           <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Institutional Registry</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Configure organizational profile, compliance identifiers, and core operational parameters.</Typography>
              </Box>

              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                 <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                       <TextField fullWidth label="Society Name" value={societyForm.name} onChange={e => setSocietyForm({...societyForm, name: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <TextField fullWidth label="Registration Number" value={societyForm.registrationNumber} onChange={e => setSocietyForm({...societyForm, registrationNumber: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                       <TextField fullWidth label="PAN Number" value={societyForm.panNo} onChange={e => setSocietyForm({...societyForm, panNo: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                       <TextField fullWidth label="GST Number" value={societyForm.gstNo} onChange={e => setSocietyForm({...societyForm, gstNo: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                       <TextField fullWidth label="Authorized Capital (₹)" type="number" value={societyForm.authorizedCapital} onChange={e => setSocietyForm({...societyForm, authorizedCapital: Number(e.target.value)})} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <TextField fullWidth label="Contact Email" value={societyForm.billingEmail} onChange={e => setSocietyForm({...societyForm, billingEmail: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                       <TextField fullWidth label="Contact Phone" value={societyForm.billingPhone} onChange={e => setSocietyForm({...societyForm, billingPhone: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                       <TextField fullWidth multiline rows={3} label="Institutional Address" value={societyForm.billingAddress} onChange={e => setSocietyForm({...societyForm, billingAddress: e.target.value})} />
                    </Grid>
                    <Grid item xs={12}>
                       <Button variant="contained" size="large" onClick={handleUpdateSociety} disabled={formLoading} sx={{ px: 6, py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a" }}>Save Registry Updates</Button>
                    </Grid>
                 </Grid>
              </Paper>
           </Stack>
        )}

        {/* VIEW: LOGS */}
        {currentView === "logs" && (
           <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>System Logs</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Security audit and institutional event stream.</Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 8, borderRadius: 3, border: "1px dashed rgba(15, 23, 42, 0.2)", textAlign: 'center' }}>
                 <HistoryRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                 <Typography variant="h6" sx={{ fontWeight: 800 }}>Audit Engine Initializing</Typography>
                 <Typography variant="body2" color="text.secondary">Detailed system logs will be streaming here after the next synchronization cycle.</Typography>
              </Paper>
           </Stack>
        )}

      </Box>

      {/* DRAWERS & DIALOGS (Enhanced Premium UI) */}
      <Drawer anchor="right" open={activeDrawer === "client"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, borderRadius: "20px 0 0 20px" } }}>
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#8b5cf6", 0.05), borderBottom: "1px solid rgba(139, 92, 246, 0.1)", position: 'relative' }}>
               <IconButton onClick={() => setActiveDrawer(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#64748b" }}><CloseRoundedIcon /></IconButton>
               <Avatar sx={{ bgcolor: "#8b5cf6", width: 56, height: 56, mb: 2, boxShadow: "0 8px 16px -4px rgba(139, 92, 246, 0.4)" }}><GroupsRoundedIcon fontSize="large" /></Avatar>
               <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Member Onboarding</Typography>
               <Typography variant="body2" color="text.secondary">Register a new institutional member with automated ID generation.</Typography>
            </Box>
            <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
               <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main", mb: 1, display: 'block' }}>PERSONAL IDENTITY</Typography>
                    <TextField fullWidth label="Legal Name" value={staffForm.fullName} onChange={e => updateStaffName(e.target.value)} placeholder="Full legal name" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main", mb: 1, display: 'block' }}>ORGANIZATIONAL PLACEMENT</Typography>
                    <Stack spacing={2}>
                      <TextField select fullWidth label="Primary Branch" value={staffForm.branchId} onChange={e => setStaffForm({...staffForm, branchId: e.target.value})}>{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</TextField>
                      <TextField select fullWidth label="Designated Agent" value={staffForm.assignedAgentId} onChange={e => setStaffForm({...staffForm, assignedAgentId: e.target.value})}><MenuItem value="">None</MenuItem>{agents.map(a => <MenuItem key={a.id} value={a.id}>{a.firstName} {a.lastName}</MenuItem>)}</TextField>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", mb: 2, display: 'block' }}>SECURITY CREDENTIALS</Typography>
                    <Stack spacing={2}>
                      <TextField fullWidth label="Login ID" value={staffForm.username} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><VerifiedUserRoundedIcon fontSize="small" sx={{ color: "success.main" }} /></InputAdornment> }} helperText="System generated login identifier" />
                      <TextField fullWidth label="Secure Password" type="text" value={staffForm.password} InputProps={{ endAdornment: <IconButton size="small" onClick={() => setStaffForm({...staffForm, password: Math.random().toString(36).slice(-8)})}><KeyRoundedIcon fontSize="small" /></IconButton> }} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
                    </Stack>
                  </Box>
                  <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#8b5cf6", boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.3)", '&:hover': { bgcolor: "#7c3aed" } }} onClick={() => handleCreateStaff("CLIENT")} disabled={formLoading}>Provision Member Identity</Button>
               </Stack>
            </Box>
         </Box>
      </Drawer>

      <Drawer anchor="right" open={activeDrawer === "agent"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 500 }, borderRadius: "20px 0 0 20px" } }}>
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#0f172a", 0.03), borderBottom: "1px solid rgba(15, 23, 42, 0.1)", position: 'relative' }}>
               <IconButton onClick={() => setActiveDrawer(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#64748b" }}><CloseRoundedIcon /></IconButton>
               <Avatar sx={{ bgcolor: "#0f172a", width: 56, height: 56, mb: 2, boxShadow: "0 8px 16px -4px rgba(15, 23, 42, 0.4)" }}><BadgeRoundedIcon fontSize="large" /></Avatar>
               <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Staff Provisioning</Typography>
               <Typography variant="body2" color="text.secondary">Create a new operative account with system-level access.</Typography>
            </Box>
            <Box sx={{ p: 4, flex: 1 }}>
               <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main", mb: 1, display: 'block' }}>PERSONAL DETAILS</Typography>
                    <TextField fullWidth label="Full Name" value={staffForm.fullName} onChange={e => updateStaffName(e.target.value)} placeholder="Agent full name" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main", mb: 1, display: 'block' }}>ORGANIZATIONAL UNIT</Typography>
                    <TextField select fullWidth label="Assigned Branch" value={staffForm.branchId} onChange={e => setStaffForm({...staffForm, branchId: e.target.value})}>{branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</TextField>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: "#f1f5f9", borderRadius: 3, border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", mb: 2, display: 'block' }}>AUTH CREDENTIALS</Typography>
                    <Stack spacing={2}>
                      <TextField fullWidth label="Login Username" value={staffForm.username} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><VerifiedUserRoundedIcon fontSize="small" sx={{ color: "primary.main" }} /></InputAdornment> }} helperText="Protected system handle" />
                      <TextField fullWidth label="Login Password" value={staffForm.password} InputProps={{ endAdornment: <IconButton size="small" onClick={() => setStaffForm({...staffForm, password: Math.random().toString(36).slice(-8)})}><KeyRoundedIcon fontSize="small" /></IconButton> }} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
                    </Stack>
                  </Box>
                  <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a", '&:hover': { bgcolor: "#1e293b" } }} onClick={() => handleCreateStaff("AGENT")} disabled={formLoading}>Provision Staff Account</Button>
               </Stack>
            </Box>
         </Box>
      </Drawer>

      <Drawer anchor="right" open={activeDrawer === "branch"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 500 }, borderRadius: "20px 0 0 20px" } }}>
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#3b82f6", 0.05), borderBottom: "1px solid rgba(59, 130, 246, 0.1)", position: 'relative' }}>
               <IconButton onClick={() => setActiveDrawer(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#64748b" }}><CloseRoundedIcon /></IconButton>
               <Avatar sx={{ bgcolor: "#3b82f6", width: 56, height: 56, mb: 2, boxShadow: "0 8px 16px -4px rgba(59, 130, 246, 0.4)" }}><DomainIcon fontSize="large" /></Avatar>
               <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Infrastructure Provisioning</Typography>
               <Typography variant="body2" color="text.secondary">Expand your geographical coverage by adding a new branch entity.</Typography>
            </Box>
            <Box sx={{ p: 4, flex: 1 }}>
               <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "primary.main", mb: 1, display: 'block' }}>BRANCH ATTRIBUTES</Typography>
                    <Stack spacing={2}>
                      <TextField fullWidth label="Branch Name" value={branchForm.name} onChange={e => updateBranchName(e.target.value)} placeholder="e.g. North Sector Branch" />
                      <TextField fullWidth label="Branch Code" value={branchForm.code} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><VerifiedUserRoundedIcon fontSize="small" sx={{ color: "info.main" }} /></InputAdornment> }} helperText="Calculated from society code and initials" />
                    </Stack>
                  </Box>
                  <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #e2e8f0" }}>
                    <FormControlLabel 
                        control={<Switch checked={branchForm.isHead} onChange={e => setBranchForm({...branchForm, isHead: e.target.checked})} />} 
                        label={<Typography variant="body2" sx={{ fontWeight: 800 }}>Mark as Institutional Headquarters</Typography>}
                    />
                  </Box>
                  <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a", '&:hover': { bgcolor: "#1e293b" } }} onClick={handleCreateBranch} disabled={formLoading}>Deploy Infrastructure</Button>
               </Stack>
            </Box>
         </Box>
      </Drawer>

      {/* Profile Detail Drawer (NEW) */}
      <Drawer anchor="right" open={Boolean(selectedProfile)} onClose={() => setSelectedProfile(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 600 }, borderRadius: "24px 0 0 24px" } }}>
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedProfile && (
              <>
                <Box sx={{ p: 4, pb: 6, bgcolor: selectedProfile.type === 'AGENT' ? "#0f172a" : "#8b5cf6", color: "#fff", position: 'relative' }}>
                   <IconButton onClick={() => setSelectedProfile(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#fff", opacity: 0.6 }}><CloseRoundedIcon /></IconButton>
                   <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)" }}>{selectedProfile.type === 'AGENT' ? <BadgeRoundedIcon fontSize="large" /> : <GroupsRoundedIcon fontSize="large" />}</Avatar>
                   <Typography variant="h4" sx={{ fontWeight: 900 }}>{selectedProfile.data.firstName} {selectedProfile.data.lastName}</Typography>
                   <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                     <Chip label={selectedProfile.data.customerCode} size="small" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 800, border: "none" }} />
                     <Chip label={selectedProfile.type} size="small" sx={{ bgcolor: alpha(selectedProfile.type === 'AGENT' ? "#10b981" : "#fff", 0.2), color: "#fff", fontWeight: 800, border: "none" }} />
                   </Stack>
                </Box>
                <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
                   <Grid container spacing={4}>
                      {/* Contact Section */}
                      <Grid item xs={12}>
                         <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: '0.1em', display: 'block', mb: 2 }}>CONTACT INFORMATION</Typography>
                         <Stack spacing={2}>
                           <Stack direction="row" spacing={2}><Avatar sx={{ width: 32, height: 32, bgcolor: "#f1f5f9", color: "#64748b" }}><EmailRoundedIcon fontSize="small" /></Avatar><Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedProfile.data.email || 'No email registered'}</Typography></Stack>
                           <Stack direction="row" spacing={2}><Avatar sx={{ width: 32, height: 32, bgcolor: "#f1f5f9", color: "#64748b" }}><LocalPhoneRoundedIcon fontSize="small" /></Avatar><Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedProfile.data.phone || 'No phone registered'}</Typography></Stack>
                           <Stack direction="row" spacing={2}><Avatar sx={{ width: 32, height: 32, bgcolor: "#f1f5f9", color: "#64748b" }}><HomeWorkRoundedIcon fontSize="small" /></Avatar><Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedProfile.data.address || 'No address registered'}</Typography></Stack>
                         </Stack>
                      </Grid>

                      <Divider sx={{ width: "100%", my: 2 }} />

                      {/* Role Specific Section */}
                      {selectedProfile.type === 'CLIENT' && (
                         <Grid item xs={12}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: '0.1em', display: 'block', mb: 2 }}>INSTITUTIONAL HOLDINGS</Typography>
                            {selectedProfile.data.accounts?.length === 0 ? (
                               <Typography variant="body2" color="text.secondary">No active accounts found.</Typography>
                            ) : (
                               <Stack spacing={2}>
                                 {selectedProfile.data.accounts.map((acc: any) => (
                                    <Box key={acc.id} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                       <Stack direction="row" justifyContent="space-between" alignItems="center">
                                          <Box>
                                             <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{acc.type}</Typography>
                                             <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>#{acc.accountNumber}</Typography>
                                          </Box>
                                          <Typography variant="h6" sx={{ fontWeight: 900, color: "primary.main" }}>₹{Number(acc.currentBalance).toLocaleString()}</Typography>
                                       </Stack>
                                    </Box>
                                 ))}
                               </Stack>
                            )}
                            
                            <Box sx={{ mt: 4 }}>
                               <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: '0.1em', display: 'block', mb: 2 }}>FIELD ASSIGNMENT</Typography>
                               <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                     <Avatar sx={{ bgcolor: alpha("#10b981", 0.1), color: "#10b981" }}><BadgeRoundedIcon /></Avatar>
                                     <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{selectedProfile.data.agentClients?.[0]?.agent?.firstName} {selectedProfile.data.agentClients?.[0]?.agent?.lastName || 'Unassigned'}</Typography>
                                        <Typography variant="caption" color="text.secondary">Assigned Field Operative</Typography>
                                     </Box>
                                  </Stack>
                               </Paper>
                            </Box>
                         </Grid>
                      )}

                      {selectedProfile.type === 'AGENT' && (
                         <Grid item xs={12}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: '0.1em', display: 'block', mb: 2 }}>OPERATIONAL PERFORMANCE</Typography>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                               <Grid item xs={6}>
                                  <Box sx={{ p: 2, bgcolor: alpha("#10b981", 0.05), borderRadius: 2, border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                                     <Typography variant="caption" sx={{ fontWeight: 800, color: "#10b981" }}>TODAY</Typography>
                                     <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{selectedProfile.data.performance?.daily.toLocaleString()}</Typography>
                                  </Box>
                               </Grid>
                               <Grid item xs={6}>
                                  <Box sx={{ p: 2, bgcolor: alpha("#3b82f6", 0.05), borderRadius: 2, border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                                     <Typography variant="caption" sx={{ fontWeight: 800, color: "#3b82f6" }}>THIS MONTH</Typography>
                                     <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{selectedProfile.data.performance?.monthly.toLocaleString()}</Typography>
                                  </Box>
                               </Grid>
                            </Grid>

                            <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: '0.1em', display: 'block', mb: 2 }}>MANAGED PORTFOLIO ({selectedProfile.data.pigmyClients?.length || 0} Members)</Typography>
                            <List sx={{ p: 0 }}>
                               {selectedProfile.data.pigmyClients?.map((m: any, idx: number) => (
                                  <ListItem key={idx} divider={idx < selectedProfile.data.pigmyClients.length - 1} sx={{ px: 0 }}>
                                     <ListItemAvatar><Avatar sx={{ width: 32, height: 32 }}><GroupsRoundedIcon fontSize="small" /></Avatar></ListItemAvatar>
                                     <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{m.customer.firstName} {m.customer.lastName}</Typography>} />
                                  </ListItem>
                               ))}
                            </List>
                         </Grid>
                      )}
                   </Grid>
                </Box>
              </>
            )}
         </Box>
      </Drawer>

      <Snackbar open={Boolean(successData)} autoHideDuration={8000} onClose={() => setSuccessData(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
         <Alert severity="success" sx={{ borderRadius: 3, border: "1px solid #10b981", bgcolor: "#fff", color: "#0f172a", minWidth: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <Typography sx={{ fontWeight: 900 }}>{successData?.label}</Typography>
            {successData?.data?.username && (
              <Box sx={{ mt: 1, p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', mb: 0.5, color: "text.secondary" }}>CREDENTIALS (NOT STORED IN CLEAR TEXT)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, color: "primary.main" }}>ID: {successData.data.username}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, color: "primary.main" }}>PASS: {successData.data.password}</Typography>
              </Box>
            )}
         </Alert>
      </Snackbar>

    </DashboardShell>
  );
}
