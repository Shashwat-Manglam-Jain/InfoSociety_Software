"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Grid, Typography, Stack, Box, Alert, Skeleton, Button,
  Chip, Avatar, Paper, Collapse, List, ListItem, ListItemIcon, ListItemText,
  IconButton, Divider, Tab, Tabs, TextField, InputAdornment, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Drawer, CloseIcon
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import GppBadRoundedIcon from "@mui/icons-material/GppBadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getMe } from "@/shared/api/client";
import { getSession, clearSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser } from "@/shared/types";

// Mock Data Structure representing the Prisma Schema relationships
const MOCK_DATA = [
  {
    id: "soc-1",
    name: "Capital Trust Co-operative",
    code: "CTC001",
    status: "ACTIVE",
    branches: [
      {
        id: "br-1",
        name: "Headquarters",
        code: "HQ",
        agents: [
          { id: "ag-1", name: "Ravi Kumar", role: "AGENT", accounts: [{ id: "acc-1", accNo: "PIGMY-0012", type: "PIGMY", balance: 145000 }] },
          { id: "ag-2", name: "Priya Sharma", role: "AGENT", accounts: [{ id: "acc-2", accNo: "PIGMY-0015", type: "PIGMY", balance: 85000 }] }
        ],
        users: [
          { id: "us-1", name: "Suresh Menon", role: "CLIENT", accounts: [{ id: "acc-3", accNo: "SAV-1002", type: "SAVINGS", balance: 500000 }] },
          { id: "us-2", name: "Anita Desai", role: "CLIENT", accounts: [{ id: "acc-4", accNo: "LOAN-502", type: "LOAN", balance: -250000 }, { id: "acc-5", accNo: "FD-105", type: "FIXED_DEPOSIT", balance: 100000 }] }
        ]
      },
      {
        id: "br-2",
        name: "North Branch",
        code: "NB",
        agents: [],
        users: [
          { id: "us-3", name: "Vikram Singh", role: "CLIENT", accounts: [{ id: "acc-6", accNo: "SAV-1008", type: "SAVINGS", balance: 24000 }] }
        ]
      }
    ]
  },
  {
    id: "soc-2",
    name: "Apex Finance Society",
    code: "AFS002",
    status: "PENDING",
    branches: [
      {
        id: "br-3",
        name: "Main Branch",
        code: "MB",
        agents: [
          { id: "ag-3", name: "Amit Patel", role: "AGENT", accounts: [{ id: "acc-7", accNo: "PIGMY-0088", type: "PIGMY", balance: 12000 }] }
        ],
        users: [
          { id: "us-4", name: "Deepa Nair", role: "CLIENT", accounts: [{ id: "acc-8", accNo: "SAV-2001", type: "SAVINGS", balance: 80000 }] }
        ]
      }
    ]
  }
];

function AccountsList({ accounts }: { accounts: any[] }) {
  const [tabIndex, setTabIndex] = useState(0);
  if (!accounts || accounts.length === 0) return <Typography variant="caption" color="text.secondary">No active accounts</Typography>;

  const loans = accounts.filter(a => a.type === "LOAN");
  const displayAccounts = tabIndex === 0 ? accounts : loans;

  return (
    <Box sx={{ mt: 1 }}>
      {loans.length > 0 && (
         <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ minHeight: 30, mb: 1, borderBottom: "1px solid rgba(148,163,184,0.1)" }}>
           <Tab label="All Accounts" sx={{ minHeight: 30, fontSize: "0.75rem", px: 1, py: 0, fontWeight: 800, textTransform: "none" }} />
           <Tab label={`Loans (${loans.length})`} sx={{ minHeight: 30, fontSize: "0.75rem", px: 1, py: 0, fontWeight: 800, color: "#ef4444", textTransform: "none", "&.Mui-selected": { color: "#ef4444" } }} />
         </Tabs>
      )}
      <Stack spacing={1} sx={{ mt: 1 }}>
        {displayAccounts.map(acc => (
          <Box key={acc.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(15,23,42,0.02)", border: "1px solid rgba(15,23,42,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {acc.type === "SAVINGS" ? <AccountBalanceWalletRoundedIcon sx={{ fontSize: 16, color: "#3b82f6" }} /> : 
               acc.type === "LOAN" ? <AccountBalanceRoundedIcon sx={{ fontSize: 16, color: "#ef4444" }} /> :
               acc.type === "FIXED_DEPOSIT" ? <BusinessCenterRoundedIcon sx={{ fontSize: 16, color: "#8b5cf6" }} /> :
               <AccountBalanceRoundedIcon sx={{ fontSize: 16, color: "#10b981" }} />}
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", lineHeight: 1 }}>{acc.type}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>{acc.accNo}</Typography>
              </Box>
            </Stack>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: acc.balance < 0 ? "#ef4444" : "#0f172a" }}>
              ₹{Math.abs(acc.balance).toLocaleString("en-IN")} {acc.balance < 0 ? "Dr" : "Cr"}
            </Typography>
          </Box>
        ))}
        {displayAccounts.length === 0 && <Typography variant="caption" sx={{ color: "text.secondary", py: 1 }}>No loan accounts found.</Typography>}
      </Stack>
    </Box>
  );
}

function UserNode({ user, icon, color }: { user: any, icon: React.ReactNode, color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mb: 1.5 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          border: `1px solid ${alpha(color, 0.2)}`, 
          bgcolor: alpha(color, 0.02),
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { bgcolor: alpha(color, 0.05), borderColor: alpha(color, 0.4) }
        }}
        onClick={() => setOpen(!open)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(color, 0.1), color: color }}>
              {icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>{user.name}</Typography>
              <Typography variant="caption" sx={{ color: color, fontWeight: 700 }}>{user.role}</Typography>
            </Box>
          </Stack>
          <IconButton size="small">
            {open ? <ExpandLessRoundedIcon sx={{ color }} /> : <ExpandMoreRoundedIcon sx={{ color }} />}
          </IconButton>
        </Stack>
      </Paper>
      <Collapse in={open}>
        <Box sx={{ pl: 4, pr: 1, py: 1, borderLeft: `2px dashed ${alpha(color, 0.2)}`, ml: 2, mt: 0.5 }}>
          <AccountsList accounts={user.accounts} />
        </Box>
      </Collapse>
    </Box>
  );
}

function BranchNode({ branch }: { branch: any }) {
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [userSearch, setUserSearch] = useState("");

  const filteredAgents = useMemo(() => 
    branch.agents.filter((a: any) => a.name.toLowerCase().includes(userSearch.toLowerCase())),
    [branch.agents, userSearch]
  );
  
  const filteredClients = useMemo(() => 
    branch.users.filter((u: any) => u.name.toLowerCase().includes(userSearch.toLowerCase())),
    [branch.users, userSearch]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 4, 
          border: "1px solid rgba(148,163,184,0.2)", 
          bgcolor: "#fff",
          boxShadow: "0 4px 12px rgba(15,23,42,0.02)",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { boxShadow: "0 8px 24px rgba(15,23,42,0.06)", borderColor: "rgba(148,163,184,0.4)" }
        }}
        onClick={() => setOpen(!open)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#f8fafc", color: "#475569" }}>
              <BusinessRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>{branch.name}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip label={`CODE: ${branch.code}`} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 800 }} />
                <Chip label={`${branch.agents.length} Agents`} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 800, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }} />
                <Chip label={`${branch.users.length} Clients`} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 800, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6" }} />
              </Stack>
            </Box>
          </Stack>
          <IconButton size="small">
            {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </Stack>
      </Paper>
      
      <Collapse in={open}>
        <Box sx={{ pl: { xs: 2, md: 5 }, pr: 1, pt: 2, pb: 2, borderLeft: "2px solid rgba(148,163,184,0.1)", ml: 3.5, mt: 1 }}>
          <Tabs 
            value={tabIndex} 
            onChange={(e, v) => setTabIndex(v)} 
            sx={{ mb: 2, minHeight: 36, borderBottom: "1px solid rgba(148,163,184,0.2)" }}
            TabIndicatorProps={{ sx: { height: 3, borderRadius: "3px 3px 0 0" } }}
          >
            <Tab 
              label={`Platform Agents (${branch.agents.length})`} 
              sx={{ minHeight: 36, fontWeight: 900, textTransform: "none", fontSize: "0.85rem", color: "#0f172a", "&.Mui-selected": { color: "#10b981" } }} 
            />
            <Tab 
              label={`Registered Clients (${branch.users.length})`} 
              sx={{ minHeight: 36, fontWeight: 900, textTransform: "none", fontSize: "0.85rem", color: "#0f172a", "&.Mui-selected": { color: "#3b82f6" } }} 
            />
          </Tabs>

          <Box sx={{ mb: 2 }}>
             <TextField
               fullWidth
               size="small"
               placeholder={tabIndex === 0 ? "Search agents by name..." : "Search clients by name..."}
               value={userSearch}
               onChange={(e) => setUserSearch(e.target.value)}
               InputProps={{
                 startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment>,
                 sx: { borderRadius: 3, bgcolor: "rgba(15,23,42,0.02)", fontSize: "0.85rem", "& fieldset": { borderColor: "rgba(148,163,184,0.3)" } }
               }}
             />
          </Box>

          <Box sx={{ mt: 2 }}>
            {tabIndex === 0 && (
              <Box>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((ag: any) => (
                    <UserNode key={ag.id} user={ag} icon={<PersonRoundedIcon />} color="#10b981" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>{userSearch ? "No matching agents found." : "No platform agents registered."}</Typography>
                )}
              </Box>
            )}

            {tabIndex === 1 && (
              <Box>
                {filteredClients.length > 0 ? (
                  filteredClients.map((us: any) => (
                    <UserNode key={us.id} user={us} icon={<PeopleRoundedIcon />} color="#3b82f6" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>{userSearch ? "No matching clients found." : "No clients registered."}</Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function SuperadminSocietiesExplorer() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSocietyId, setSelectedSocietyId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const session = getSession();
      if (!session || session.role !== "SUPER_ADMIN") {
        router.replace("/login");
        return;
      }
      try {
        const u = await getMe(session.accessToken);
        setUser(u);
      } catch (err) {
        clearSession();
        router.replace("/login");
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
          { label: "Network Explorer", href: "/dashboard/superadmin/societies", slug: "societies", active: true, icon: <BusinessCenterRoundedIcon /> },
          { label: "Report Generation", href: "/dashboard/superadmin/reports", slug: "reports", icon: <AnalyticsRoundedIcon /> },
          { label: "System UI Settings", href: "/dashboard/superadmin/settings", slug: "settings", icon: <SettingsSuggestRoundedIcon /> }
        ]
      }
  ], []);

  if (loading) return <Skeleton variant="rectangular" height="100vh" />;

  const filteredSocieties = MOCK_DATA.filter((soc) => 
    soc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    soc.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedSociety = MOCK_DATA.find(s => s.id === selectedSocietyId);

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
            GLOBAL INFRASTRUCTURE
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            Network Explorer
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}>
            Search and drill down into institutional operations. Monitor branches, field agents, and client portfolios across all registered societies.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: "1px solid rgba(148,163,184,0.2)", bgcolor: "#fff" }}>
          {/* Search Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Box sx={{ maxWidth: 400, width: "100%" }}>
              <TextField
                fullWidth
                placeholder="Search societies by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: "text.disabled" }} /></InputAdornment>,
                  sx: { borderRadius: 3, bgcolor: "#f8fafc", "& fieldset": { border: "none" } }
                }}
                size="small"
              />
            </Box>
            <Button variant="outlined" sx={{ borderRadius: 3, fontWeight: 800 }}>Export CSV</Button>
          </Box>

          {/* Data Table */}
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(15,23,42,0.02)" }}>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Society Network</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Total Branches</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }}>Total Members</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "#64748b", py: 2 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSocieties.map((soc) => {
                  const totalMembers = soc.branches.reduce((acc, br) => acc + br.agents.length + br.users.length, 0);
                  return (
                    <TableRow 
                      key={soc.id}
                      hover
                      onClick={() => setSelectedSocietyId(soc.id)}
                      sx={{ cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: "rgba(59,130,246,0.04)" } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6", fontWeight: 900, fontSize: "1rem" }}>
                            {soc.name[0]}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>{soc.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", color: "#64748b" }}>{soc.code}</Typography>
                      </TableCell>
                      <TableCell>
                         <Chip 
                            label={soc.status} 
                            size="small" 
                            sx={{ 
                              height: 24, fontSize: "0.7rem", fontWeight: 900,
                              bgcolor: soc.status === 'ACTIVE' ? alpha("#10b981", 0.1) : alpha("#f59e0b", 0.1),
                              color: soc.status === 'ACTIVE' ? "#10b981" : "#d97706"
                            }} 
                         />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{soc.branches.length}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{totalMembers}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          variant="text" 
                          size="small" 
                          endIcon={<ChevronRightRoundedIcon />}
                          sx={{ fontWeight: 800, textTransform: "none" }}
                        >
                          Explore
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredSocieties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">No societies found matching your search.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Detail View Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedSocietyId)}
        onClose={() => setSelectedSocietyId(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 600 }, p: { xs: 3, md: 5 }, bgcolor: "#f8fafc" } }}
      >
        {selectedSociety && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 6 }}>
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 900, color: "primary.main", letterSpacing: 3, fontSize: "0.85rem" }}>SOCIETY ID: {selectedSociety.code}</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", mt: 1, letterSpacing: "-0.03em" }}>{selectedSociety.name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1, fontWeight: 700 }}>
                   Administrator: {selectedSociety.admins?.[0]?.user?.fullName ?? "No Admin Assigned"}
                </Typography>
              </Box>
              <IconButton size="large" onClick={() => setSelectedSocietyId(null)} sx={{ bgcolor: "rgba(15,23,42,0.05)" }}>
                <CloseRoundedIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Stack>

            <Box sx={{ mb: 5, p: 3, borderRadius: 4, bgcolor: "#fff", border: "1px solid rgba(239,68,68,0.2)" }}>
               <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                     <GppBadRoundedIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                     <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#ef4444" }}>Emergency Access Revocation</Typography>
                     <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mt: 0.5 }}>
                       Suspend {selectedSociety.name}. This restricts ALL underlying agents and clients from logging in immediately.
                     </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    color="error" 
                    sx={{ fontWeight: 900, borderRadius: 2, px: 3, boxShadow: "none" }}
                    onClick={() => {
                      alert(`Access revoked for ${selectedSociety.name}`);
                    }}
                  >
                    Suspend Society
                  </Button>
               </Stack>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, color: "#0f172a" }}>Organizational Hierarchy</Typography>
            
            {selectedSociety.branches.map(br => (
              <BranchNode key={br.id} branch={br} />
            ))}
            
            {selectedSociety.branches.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>No branches have been registered for this society yet.</Alert>
            )}
          </Box>
        )}
      </Drawer>
    </DashboardShell>
  );
}
