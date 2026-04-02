// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Container, Grid, Typography, Card, CardContent, Stack, Box, Alert, 
  Skeleton, Chip, Button, IconButton, Divider, Avatar, TextField, MenuItem, Drawer,
  InputAdornment, Tooltip, Paper, Switch, FormControlLabel, Snackbar,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
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
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
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
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PriceCheckRoundedIcon from "@mui/icons-material/PriceCheckRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { LedgerWorkspace } from "@/features/society/components/ledger-workspace";
import { LockerWorkspace } from "@/features/society/components/locker-workspace";
import { SocietyOperationsWorkspace } from "@/features/society/components/society-operations-workspace";
import { UserAccessSelector } from "@/features/society/components/user-access-selector";
import { getAllowedModuleSlugs } from "@/features/banking/account-access";
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
  getAgentDetails,
  adminUpdateBranch,
  adminDeleteBranch,
  adminListDirectors,
  adminCreateDirector,
  adminUpdateDirector,
  adminDeleteDirector,
  listStaffUsers,
  updateUserStatus,
  updateUserAccess
} from "@/shared/api/administration";
import { clearSession, getSession } from "@/shared/auth/session";
import { useLanguage } from "@/shared/i18n/language-provider";
import type { AuthUser } from "@/shared/types";

type DashboardView = "overview" | "directory" | "treasury" | "insights" | "settings" | "master_company" | "master_branches" | "master_directors" | "logs" | "promoter_agents" | "promoter_shareholding" | "promoter_sharecertificate" | "membership_clients" | "membership_shareholding" | "membership_guarantors" | "membership_coapplicants" | "plan_catalogue" | "account_registry" | "locker_registry" | "ledger_registry";

const growthTrend = [
  { month: "Jan", capital: 4000, members: 240 },
  { month: "Feb", capital: 3000, members: 139 },
  { month: "Mar", capital: 5000, members: 980 },
  { month: "Apr", capital: 2780, members: 390 },
  { month: "May", capital: 6890, members: 480 },
  { month: "Jun", capital: 2390, members: 380 },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { locale, t } = useLanguage();
  
  const currentView = (searchParams.get("view") as DashboardView) || "overview";

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    // Role-based routing from Dashboard Root view
    switch (session.role) {
      case "CLIENT":
        router.replace("/dashboard/client");
        break;
      case "AGENT":
        router.replace("/dashboard/agent");
        break;
      case "SUPER_ADMIN":
        router.replace("/dashboard/superadmin");
        break;
      case "SUPER_USER":
        // Stay here - this IS the society dashboard
        break;
      default:
        router.replace("/login");
    }
  }, [router]);

  // Data State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  // UI State
  const [activeDrawer, setActiveDrawer] = useState<"branch" | "agent" | "client" | "mapping" | "director" | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [successData, setSuccessData] = useState<{ label: string, data: any } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{ type: 'AGENT' | 'CLIENT', data: any } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUserAccess, setSelectedUserAccess] = useState<any | null>(null);
  const [userAccessDraft, setUserAccessDraft] = useState<string[]>([]);

  // Master States
  const [branchFilters, setBranchFilters] = useState({ name: "", code: "", city: "", state: "", status: "" });
  const [branchPage, setBranchPage] = useState(0);
  const [branchRowsPerPage, setBranchRowsPerPage] = useState(10);
  const [directorFilters, setDirectorFilters] = useState({ designation: "", fullName: "", appointmentDate: "", resignationDate: "", isAuthorizedSignatory: "" });
  const [directorPage, setDirectorPage] = useState(0);
  const [directorRowsPerPage, setDirectorRowsPerPage] = useState(10);
  
  // Promoter Agent States
  const [promoterAgentPage, setPromoterAgentPage] = useState(0);
  const [promoterAgentRowsPerPage, setPromoterAgentRowsPerPage] = useState(10);
  const [promoterAgentSearch, setPromoterAgentSearch] = useState("");
  const [agentDetailActiveTab, setAgentDetailActiveTab] = useState<"basic" | "docs" | "accounts" | "loans">("basic");
  const [editingAgent, setEditingAgent] = useState<any>(null);

  // Shareholding States
  const [shareholdings, setShareholdings] = useState<any[]>([]);
  const [shareholdingSearch, setShareholdingSearch] = useState("");
  const [shareholdingPage, setShareholdingPage] = useState(0);
  const [shareholdingRowsPerPage, setShareholdingRowsPerPage] = useState(10);
  const [activeShareholdingDrawer, setActiveShareholdingDrawer] = useState<"add" | "edit" | null>(null);
  const [editingShareholding, setEditingShareholding] = useState<any>(null);
  const [shareholdingForm, setShareholdingForm] = useState({
    agentName: "", shareRange: "", totalShares: 0, nominalVal: 10, totalValue: 0, allottedDate: new Date().toISOString().split('T')[0], transferDate: "", folioNo: "", certNo: "", status: "Active"
  });

  // Profile Form
  const [societyForm, setSocietyForm] = useState({
     name: "", billingEmail: "", billingPhone: "", billingAddress: "", registrationNumber: "", panNo: "", gstNo: "", category: "Credit Co-op", authorizedCapital: 1000000,
     logoUrl: "", faviconUrl: "", about: "", softwareUrl: "", cin: "", class: "", paidUpCapital: 0, shareNominalValue: 0, registrationState: "", registrationDate: ""
  });

  // Provisioning Forms
  const [branchForm, setBranchForm] = useState({ 
    id: "", code: "", name: "Digital Growth Hub", isHead: false, 
    contactEmail: "ops@society.com", contactNo: "+91 9000000000", addressLine1: "Smart Park, Building 4", addressLine2: "Central Plaza", city: "Mumbai", state: "Maharashtra", pincode: "400001",
    openingDate: new Date().toISOString().split('T')[0], lockerFacility: true, neftImpsService: true, isActive: true
  });
  const [staffForm, setStaffForm] = useState({ fullName: "", username: "", password: "", branchId: "", assignedAgentId: "", allowedModuleSlugs: [] as string[] });
  const [mappingForm, setMappingForm] = useState({ agentId: "", customerId: "", installmentAmount: 0, depositUnits: 0 });
  const [directorForm, setDirectorForm] = useState({
    id: "", designation: "Director", din: "", registrationDate: new Date().toISOString().split('T')[0], firstName: "John", lastName: "Doe", dob: "1985-01-01", email: "director@example.com", fatherName: "Robert Doe", occupation: "Business", panNo: "ABCDE1234F", appointmentDate: new Date().toISOString().split('T')[0], resignationDate: "", isAuthorizedSignatory: true, gender: "MALE", mobileNo: "+91 9876543210", motherName: "Jane Doe", aadharNo: "123456789012", accountNo: "9100100200300", bankName: "Global Trust Bank", correspondingAddress: "404 Innovation Way, Tech Park", permanentAddress: "404 Innovation Way, Tech Park", ifscCode: "GTB0001234"
  });

  const [membershipClientFilters, setMembershipClientFilters] = useState({ search: "", branch: "", status: "" });
  const [membershipClientPage, setMembershipClientPage] = useState(0);
  const [membershipClientRowsPerPage, setMembershipClientRowsPerPage] = useState(10);
  const [activeClientDetail, setActiveClientDetail] = useState<any>(null);
  const [clientDetailTab, setClientDetailTab] = useState("member");
  const [clientForm, setClientForm] = useState({
    branchId: "", agentId: "", applicationNo: "", firstName: "", lastName: "", fatherName: "", motherName: "", dob: "", gender: "MALE", phone: "", email: "", annualIncomeRange: "0-3L", occupation: "", 
    photoUrl: "", signatureUrl: "",
    nomineeName: "", nomineeRelation: "", nomineeAddress: "", nomineeAadhar: "", nomineeVoterId: "", nomineePan: "", nomineeMobile: "", nomineeRation: "",
    correspondenceAddress: "", correspondenceGPS: "", permanentAddress: "", permanentCity: "", permanentState: "", permanentPincode: "",
    bankName: "", accountNo: "", ifscCode: "",
    kycAadhar: "", kycPan: "", kycVoter: ""
  });

  const updateBranchName = (name: string) => {
    if (branchForm.id) {
        setBranchForm(prev => ({ ...prev, name }));
        return;
    }
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

  const handleOpenDrawer = (type: "branch" | "agent" | "client" | "mapping" | "director") => {
    if (type === "branch") {
        setBranchForm({ 
            id: "", code: "", name: "Digital Services Branch", isHead: false, 
            contactEmail: "ops@society.com", contactNo: "+91 9000000000", addressLine1: "Prime Business Square", addressLine2: "Main Tower", city: "Mumbai", state: "Maharashtra", pincode: "400001",
            openingDate: new Date().toISOString().split('T')[0], lockerFacility: true, neftImpsService: true, isActive: true
        });
    } else if (type === "agent" || type === "client") {
        const role = type === "agent" ? "AGENT" : "CLIENT";
        setStaffForm({ 
            fullName: "", 
            username: "", 
            password: Math.random().toString(36).slice(-8), 
            branchId: branches[0]?.id || "", 
            assignedAgentId: "",
            allowedModuleSlugs: getAllowedModuleSlugs(role)
        });
    } else if (type === "mapping") {
        setMappingForm({ agentId: "", customerId: "", installmentAmount: 0, depositUnits: 0 });
    } else if (type === "director") {
        setDirectorForm({
            id: "", designation: "Director", din: "", registrationDate: new Date().toISOString().split('T')[0], firstName: "John", lastName: "Doe", dob: "1985-01-01", email: "director@example.com", fatherName: "Robert Doe", occupation: "Business", panNo: "ABCDE1234F", appointmentDate: new Date().toISOString().split('T')[0], resignationDate: "", isAuthorizedSignatory: true, gender: "MALE", mobileNo: "+91 9876543210", motherName: "Jane Doe", aadharNo: "123456789012", accountNo: "9100100200300", bankName: "Global Trust Bank", correspondingAddress: "404 Innovation Way, Tech Park", permanentAddress: "404 Innovation Way, Tech Park", ifscCode: "GTB0001234"
        });
    }
    setActiveDrawer(type);
  };

  const handleOpenUserAccess = (entry: any) => {
    if (!entry || !["AGENT", "CLIENT"].includes(entry.role)) {
      return;
    }

    setSelectedUserAccess(entry);
    setUserAccessDraft(
      entry.allowedModuleSlugs?.length ? entry.allowedModuleSlugs : getAllowedModuleSlugs(entry.role)
    );
  };

  const accountTypeLabel = "Institutional Administrator";
  const shouldLoadTransactions = currentView === "overview" || currentView === "logs";
  const shouldLoadAgentPerformance = currentView === "overview" || currentView === "promoter_agents";
  const shouldLoadDirectors = currentView === "master_directors";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    async function loadBaseData() {
      const session = getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      setSessionToken(session.accessToken);

      try {
        const [profile, bList, mList, aList, uList] = await Promise.all([
          getMe(session.accessToken),
          adminListBranches(session.accessToken),
          listAgentMappings(session.accessToken),
          listSocietyAgents(session.accessToken),
          listStaffUsers(session.accessToken)
        ]);

        setUser(profile);
        setBranches(bList as any);
        setMappings(mList as any);
        setAgents(aList as any);
        setStaffUsers(uList as any);

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
            authorizedCapital: Number((profile.society as any).authorizedCapital || 1000000),
            logoUrl: (profile.society as any).logoUrl || "",
            faviconUrl: (profile.society as any).faviconUrl || "",
            about: (profile.society as any).about || "",
            softwareUrl: (profile.society as any).softwareUrl || "",
            cin: (profile.society as any).cin || "",
            class: (profile.society as any).class || "",
            paidUpCapital: Number((profile.society as any).paidUpCapital || 0),
            shareNominalValue: Number((profile.society as any).shareNominalValue || 0),
            registrationState: (profile.society as any).registrationState || "",
            registrationDate: (profile.society as any).registrationDate ? new Date((profile.society as any).registrationDate).toISOString().split('T')[0] : ""
          });
        }
      } catch (err) {
        setError("Data synchronization failed");
      } finally {
        setLoading(false);
      }
    }

    void loadBaseData();
  }, [router]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    async function loadOverviewStats() {
      try {
        const response = await getSocietyOverview(sessionToken, selectedBranchId);
        setStats(response);
      } catch {
        setError("Unable to load society overview");
      }
    }

    void loadOverviewStats();
  }, [selectedBranchId, sessionToken]);

  useEffect(() => {
    if (!sessionToken || !shouldLoadTransactions) {
      return;
    }

    async function loadTransactions() {
      try {
        const response = await listSocietyTransactions(sessionToken, debouncedSearchQuery);
        setTransactions(response);
      } catch {
        setError("Unable to load transactions");
      }
    }

    void loadTransactions();
  }, [debouncedSearchQuery, sessionToken, shouldLoadTransactions]);

  useEffect(() => {
    if (!sessionToken || !shouldLoadAgentPerformance) {
      return;
    }

    async function loadPerformance() {
      try {
        const response = await getAgentPerformance(sessionToken);
        setAgentPerformance(response);
      } catch {
        setError("Unable to load agent performance");
      }
    }

    void loadPerformance();
  }, [sessionToken, shouldLoadAgentPerformance]);

  useEffect(() => {
    if (!sessionToken || !shouldLoadDirectors) {
      return;
    }

    async function loadDirectors() {
      try {
        const response = await adminListDirectors(sessionToken);
        setDirectors(response as any);
      } catch {
        setError("Unable to load directors");
      }
    }

    void loadDirectors();
  }, [sessionToken, shouldLoadDirectors]);

  const sidebarItems = useMemo(() => [
    {
      items: [
        { label: "Home", href: "/dashboard?view=overview", icon: <ViewQuiltRoundedIcon />, active: currentView === "overview" },
      ]
    },
    {
      heading: "Users & Access",
      items: [
        { label: "Staff & Users", href: "/dashboard?view=directory", icon: <ManageAccountsRoundedIcon />, active: currentView === "directory" },
        { label: "Agents", href: "/dashboard?view=promoter_agents", icon: <BadgeRoundedIcon />, active: currentView === "promoter_agents" },
      ]
    },
    {
      heading: "Members",
      items: [
        { label: "Clients", href: "/dashboard?view=membership_clients", icon: <GroupsRoundedIcon />, active: currentView === "membership_clients" },
        { label: "Share Register", href: "/dashboard?view=membership_shareholding", icon: <AccountBalanceWalletRoundedIcon />, active: currentView === "membership_shareholding" },
        { label: "Guarantors", href: "/dashboard?view=membership_guarantors", icon: <ShieldRoundedIcon />, active: currentView === "membership_guarantors" },
        { label: "Co-Applicants", href: "/dashboard?view=membership_coapplicants", icon: <GroupAddRoundedIcon />, active: currentView === "membership_coapplicants" },
      ]
    },
    {
      heading: "Plans & Accounts",
      items: [
        { label: "Plans", href: "/dashboard?view=plan_catalogue", icon: <VerifiedUserRoundedIcon />, active: currentView === "plan_catalogue" },
        { label: "Account Register", href: "/dashboard?view=account_registry", icon: <PaymentsRoundedIcon />, active: currentView === "account_registry" },
        { label: "Ledger", href: "/dashboard?view=ledger_registry", icon: <ReceiptLongRoundedIcon />, active: currentView === "ledger_registry" },
      ]
    },
    {
      heading: "Lockers",
      items: [
        { label: "Locker Register", href: "/dashboard?view=locker_registry", icon: <KeyRoundedIcon />, active: currentView === "locker_registry" },
      ]
    },
    {
      heading: "Society Setup",
      items: [
        { label: "Society Profile", href: "/dashboard?view=master_company", icon: <BusinessRoundedIcon />, active: currentView === "master_company" },
        { label: "Branches", href: "/dashboard?view=master_branches", icon: <StoreRoundedIcon />, active: currentView === "master_branches" },
        { label: "Directors", href: "/dashboard?view=master_directors", icon: <BadgeRoundedIcon />, active: currentView === "master_directors" },
      ]
    },
    {
      heading: "Activity",
      items: [
          { label: "Activity Log", href: "/dashboard?view=logs", icon: <HistoryRoundedIcon />, active: currentView === "logs" }
      ]
    }
  ], [currentView]);

  const managedUsers = useMemo(
    () => staffUsers.filter((entry) => entry.role !== "SUPER_ADMIN"),
    [staffUsers]
  );

  const lockerClients = useMemo(
    () =>
      managedUsers
        .filter((entry) => entry.role === "CLIENT" && entry.customerProfile?.id)
        .map((entry) => ({
          id: entry.id,
          fullName: entry.fullName,
          branchId: entry.branchId,
          customerProfile: entry.customerProfile,
          isActive: entry.isActive
        })),
    [managedUsers]
  );

  const handleUpdateSociety = async () => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try { await updateSociety(session.accessToken, societyForm); setSuccessData({ label: "Profile Commit Successful", data: {} }); }
    catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleCreateBranch = async () => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try { 
        if (branchForm.id) {
            await adminUpdateBranch(session.accessToken, branchForm.id, branchForm);
        } else {
            await adminCreateBranch(session.accessToken, branchForm); 
        }
        const updated = await adminListBranches(session.accessToken); 
        setBranches(updated as any); setActiveDrawer(null); 
        setSuccessData({ label: branchForm.id ? "Branch Configuration Updated" : "Infrastructure Provisioned", data: {} }); 
    }
    catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleToggleBranchStatus = async (branch: any) => {
    const session = getSession(); if (!session) return;
    try {
        await adminUpdateBranch(session.accessToken, branch.id, { isActive: !branch.isActive });
        const updated = await adminListBranches(session.accessToken);
        setBranches(updated as any);
    } catch (e: any) { alert(e.message); }
  };

  const downloadBranchesCSV = () => {
    const headers = ["Name", "Code", "Opening Date", "City", "State", "Status"];
    const rows = branches.map(b => [
        b.name,
        b.code,
        b.openingDate ? new Date(b.openingDate).toLocaleDateString() : 'N/A',
        b.city,
        b.state,
        b.isActive ? "Active" : "Deactive"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `branches_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this infrastructure entity? This action cannot be reversed if accounts are mapped.")) return;
    const session = getSession(); if (!session) return;
    try {
        await adminDeleteBranch(session.accessToken, id);
        const updated = await adminListBranches(session.accessToken);
        setBranches(updated as any);
        setSuccessData({ label: "Infrastructure Decommissioned", data: {} });
    } catch (e: any) { alert(e.message); }
  };

  const handleSaveDirector = async () => {
    const session = getSession(); if (!session) return; setFormLoading(true);
    try {
        if (directorForm.id) {
            await adminUpdateDirector(session.accessToken, directorForm.id, directorForm);
        } else {
            await adminCreateDirector(session.accessToken, directorForm);
        }
        const updated = await adminListDirectors(session.accessToken);
        setDirectors(updated as any);
        setActiveDrawer(null);
        setSuccessData({ label: "Institutional Governance Synchronized", data: {} });
    } catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleDeleteDirector = async (id: string) => {
    if (!confirm("Are you sure you want to remove this director from institutional records?")) return;
    const session = getSession(); if (!session) return;
    try {
        await adminDeleteDirector(session.accessToken, id);
        const updated = await adminListDirectors(session.accessToken);
        setDirectors(updated as any);
    } catch (e: any) { alert(e.message); }
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
      const [sN, mN, aN, uN] = await Promise.all([
        getSocietyOverview(session.accessToken),
        listAgentMappings(session.accessToken),
        listSocietyAgents(session.accessToken),
        listStaffUsers(session.accessToken)
      ]);
      setStats(sN); setMappings(mN as any); setAgents(aN as any); setStaffUsers(uN as any); setActiveDrawer(null);
      setSuccessData({ label: "Identity Provisioned", data: { username: staffForm.username, password: staffForm.password } });
    } catch (e: any) { alert(e.message); } finally { setFormLoading(false); }
  };

  const handleToggleStaffStatus = async (entry: any) => {
    const session = getSession(); if (!session) return;
    try {
      const updated = await updateUserStatus(session.accessToken, entry.id, !entry.isActive);
      setStaffUsers((prev) => prev.map((row) => row.id === entry.id ? { ...row, isActive: updated.isActive } : row));
      if (selectedUserAccess?.id === entry.id) {
        setSelectedUserAccess((prev: any) => prev ? { ...prev, isActive: updated.isActive } : prev);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveUserAccess = async () => {
    if (!selectedUserAccess) return;
    const session = getSession(); if (!session) return; setFormLoading(true);
    try {
      const updated = await updateUserAccess(session.accessToken, selectedUserAccess.id, userAccessDraft);
      setStaffUsers((prev) =>
        prev.map((row) => row.id === selectedUserAccess.id ? { ...row, allowedModuleSlugs: updated.allowedModuleSlugs } : row)
      );
      setSelectedUserAccess(null);
      setSuccessData({ label: "Access Matrix Updated", data: { username: selectedUserAccess.username } });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setFormLoading(false);
    }
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
                  { label: "Total Balance", value: `₹${(stats?.totalCapital || 0).toLocaleString()}`, color: "#3b82f6", icon: <AccountBalanceWalletRoundedIcon /> },
                  { label: "Bank Balance", value: `₹${(stats?.bankBalance || 0).toLocaleString()}`, color: "#10b981", icon: <AccountBalanceRoundedIcon /> },
                  { label: "Cash Balance", value: `₹${(stats?.cashBalance || 0).toLocaleString()}`, color: "#f59e0b", icon: <PaymentsRoundedIcon /> },
                  { label: "Total Distributed", value: `₹${(stats?.totalDistributed || 0).toLocaleString()}`, color: "#ef4444", icon: <MonetizationOnRoundedIcon /> },
                  { label: "Total Collected", value: `₹${(stats?.totalCollected || 0).toLocaleString()}`, color: "#8b5cf6", icon: <PriceCheckRoundedIcon /> },
                  { label: "Total Interest", value: `₹${(stats?.totalInterest || 0).toLocaleString()}`, color: "#06b6d4", icon: <TrendingUpRoundedIcon /> },
                  { label: "Active network", value: stats?.totalBranches || 0, color: "#64748b", icon: <DomainIcon /> },
                  { label: "Total Enrollments", value: stats?.totalMembers || 0, color: "#ec4899", icon: <GroupsRoundedIcon /> }
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

              {/* TIMELINE PERFORMANCE MATRICES */}
              <Grid container spacing={3}>
                 {/* Collections Matrix */}
                 <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                       <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Collection Stream Analysis</Typography>
                       <Table size="small">
                          <TableHead sx={{ bgcolor: "#f8fafc" }}>
                             <TableRow>
                                <TableCell sx={{ fontWeight: 900 }}>Metric Period</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>Approved</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>Pending</TableCell>
                             </TableRow>
                          </TableHead>
                          <TableBody>
                             {[
                                { l: "Daily Stream", a: stats?.collectionApproved?.daily, p: stats?.collectionPending?.daily },
                                { l: "Weekly Batch", a: stats?.collectionApproved?.weekly, p: stats?.collectionPending?.weekly },
                                { l: "Monthly Forecast", a: stats?.collectionApproved?.monthly, p: stats?.collectionPending?.monthly }
                             ].map((row, idx) => (
                                <TableRow key={idx}>
                                   <TableCell sx={{ fontWeight: 800 }}>{row.l}</TableCell>
                                   <TableCell align="right" sx={{ color: "#10b981", fontWeight: 900 }}>₹{row.a?.toLocaleString()}</TableCell>
                                   <TableCell align="right" sx={{ color: "#f59e0b", fontWeight: 900 }}>₹{row.p?.toLocaleString()}</TableCell>
                                </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </Paper>
                 </Grid>

                 {/* Distribution Matrix */}
                 <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                       <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Distribution Pulse Analysis</Typography>
                       <Table size="small">
                          <TableHead sx={{ bgcolor: "#f8fafc" }}>
                             <TableRow>
                                <TableCell sx={{ fontWeight: 900 }}>Metric Period</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>Approved</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900 }}>Pending Loan</TableCell>
                             </TableRow>
                          </TableHead>
                          <TableBody>
                             {[
                                { l: "Daily Pulse", a: stats?.distributedApproved?.daily, p: stats?.distributedPending?.daily },
                                { l: "Weekly Aggregation", a: stats?.distributedApproved?.weekly, p: stats?.distributedPending?.weekly },
                                { l: "Monthly Projection", a: stats?.distributedApproved?.monthly, p: stats?.distributedPending?.monthly }
                             ].map((row, idx) => (
                                <TableRow key={idx}>
                                   <TableCell sx={{ fontWeight: 800 }}>{row.l}</TableCell>
                                   <TableCell align="right" sx={{ color: "#3b82f6", fontWeight: 900 }}>₹{row.a?.toLocaleString()}</TableCell>
                                   <TableCell align="right" sx={{ color: "#ef4444", fontWeight: 900 }}>₹{row.p?.toLocaleString()}</TableCell>
                                </TableRow>
                             ))}
                          </TableBody>
                       </Table>
                    </Paper>
                 </Grid>
              </Grid>

              {/* BRANCH GOVERNANCE SELECTOR */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: alpha("#0f172a", 0.02) }}>
                 <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar sx={{ bgcolor: "#0f172a", color: "#fff" }}><DomainIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                       <Typography variant="h6" sx={{ fontWeight: 900 }}>Branch-Specific Insight & Governance</Typography>
                       <Typography variant="body2" color="text.secondary">Select an operational branch to filter insights or perform regional administrative tasks.</Typography>
                    </Box>
                    <TextField 
                      select 
                      size="small" 
                      value={selectedBranchId} 
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      sx={{ width: 280, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
                    >
                       <MenuItem value="">Aggregate Society View</MenuItem>
                       {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                    </TextField>
                    <Button 
                      variant="contained" 
                      disabled={!selectedBranchId} 
                      startIcon={<EngineeringRoundedIcon />}
                      onClick={() => router.push(`/dashboard?view=directory&branch=${selectedBranchId}`)}
                      sx={{ bgcolor: "#0f172a", borderRadius: 2, fontWeight: 900 }}
                    >
                       Govern Branch
                    </Button>
                 </Stack>
              </Paper>


              {/* ANALYTIC INTELLIGENCE (Integrated Growth Data) */}
              <Grid container spacing={3}>
                  <Grid item xs={12} sx={{ mt: 2 }} />
                  {[
                     { label: "Quarterly Growth", value: "+24.8%", sub: "vs Last Q", color: "#10b981", icon: <TrendingUpRoundedIcon /> },
                     { label: "New Enrollments", value: "842", sub: "Last 30 Days", color: "#3b82f6", icon: <GroupsRoundedIcon /> },
                     { label: "Revenue Momentum", value: "₹4.2M", sub: "Projected Monthly", color: "#8b5cf6", icon: <QueryStatsRoundedIcon /> },
                     { label: "Branch Coverage", value: "100%", sub: "Active Deployment", color: "#f59e0b", icon: <MapRoundedIcon /> }
                  ].map((k, i) => (
                     <Grid item xs={12} sm={6} md={3} key={i}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: alpha(k.color, 0.02) }}>
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
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                       <Box>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>Institutional Liquidity Trend</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FISCAL YEAR STREAM ANALYTICS</Typography>
                       </Box>
                       <Stack direction="row" spacing={1}>
                          <Chip label="Capital Flow" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6" }} />
                          <Chip label="User Velocity" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#8b5cf6", 0.1), color: "#8b5cf6" }} />
                       </Stack>
                    </Stack>
                    <Box sx={{ height: 350, width: "100%" }}>
                       <ResponsiveContainer>
                          <AreaChart data={growthTrend}>
                             <defs>
                                <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} />
                             <ChartTooltip />
                             <Area type="monotone" dataKey="capital" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCap)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                   <Stack spacing={3} sx={{ height: '100%' }}>
                      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", flex: 1 }}>
                         <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Capital Distribution</Typography>
                         <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 4 }}>BY OPERATIONAL ENTITY</Typography>
                         <Box sx={{ height: 200, position: 'relative' }}>
                            <ResponsiveContainer>
                               <PieChart>
                                  <Pie data={[{n: 'M', v: 45}, {n: 'N', v: 25}, {n: 'S', v: 30}]} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="v">
                                     <Cell fill="#3b82f6" />
                                     <Cell fill="#10b981" />
                                     <Cell fill="#f59e0b" />
                                  </Pie>
                               </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                               <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>₹12M</Typography>
                            </Box>
                         </Box>
                         <Stack spacing={1} sx={{ mt: 2 }}>
                            {[{l: 'Main', p: '45%', c: '#3b82f6'}, {l: 'North', p: '25%', c: '#10b981'}, {l: 'South', p: '30%', c: '#f59e0b'}].map((dist, idx) => (
                               <Stack key={idx} direction="row" alignItems="center" justifyContent="space-between">
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{dist.l}</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 900 }}>{dist.p}</Typography>
                                </Stack>
                            ))}
                         </Stack>
                      </Paper>

                      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: alpha("#0f172a", 0.05), border: "1px solid rgba(15, 23, 42, 0.1)" }}>
                         <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>Network Velocity</Typography>
                         <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>Tracking at 1.4x industry average.</Typography>
                      </Paper>
                   </Stack>
                </Grid>
              </Grid>

           </Stack>
        )}

        {["membership_clients", "membership_shareholding", "membership_guarantors", "membership_coapplicants", "plan_catalogue", "account_registry"].includes(currentView) && (
          <SocietyOperationsWorkspace view={currentView} branches={branches} agents={agents} />
        )}

        {currentView === "ledger_registry" && sessionToken && (
          <LedgerWorkspace token={sessionToken} />
        )}

        {currentView === "locker_registry" && sessionToken && (
          <LockerWorkspace token={sessionToken} clients={lockerClients} branches={branches} />
        )}

        {/* VIEW: MASTER COMPANY */}
        {currentView === "master_company" && (
           <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Corporate Pulse</Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Sovereign identity and constitutional details of the institution.</Typography>
                </Box>
                <Button variant="contained" size="large" sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 900, bgcolor: "#0f172a", boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.4)" }} onClick={handleUpdateSociety} disabled={formLoading}>Commit Integrity Updates</Button>
              </Box>

              <Grid container spacing={4}>
                 <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", height: "100%" }}>
                       <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>VISUAL IDENTITY</Typography>
                       <Stack spacing={4} alignItems="center">
                          <Box sx={{ position: 'relative' }}>
                             <Avatar src={societyForm.logoUrl} sx={{ width: 140, height: 140, borderRadius: 4, border: "4px solid #f8fafc", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                                <BusinessRoundedIcon sx={{ fontSize: 60 }} />
                             </Avatar>
                             <IconButton size="small" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: "#fff", boxShadow: 1, "&:hover": { bgcolor: "#f1f5f9" } }}>
                                <CloudUploadRoundedIcon fontSize="small" />
                             </IconButton>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>INSTITUTIONAL LOGO</Typography>

                          <Box sx={{ position: 'relative' }}>
                             <Avatar src={societyForm.faviconUrl} sx={{ width: 64, height: 64, borderRadius: 2, border: "2px solid #f8fafc" }}>
                                <LanguageRoundedIcon />
                             </Avatar>
                             <IconButton size="small" sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: "#fff", boxShadow: 1 }}>
                                <CloudUploadRoundedIcon sx={{ fontSize: 14 }} />
                             </IconButton>
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary" }}>MANIFEST FAVICON</Typography>
                       </Stack>
                    </Paper>
                 </Grid>

                 <Grid item xs={12} md={8}>
                    <Stack spacing={4}>
                       <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                          <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>CORPORATE ATTRIBUTES</Typography>
                          <Grid container spacing={3}>
                             <Grid item xs={12}><TextField fullWidth label="Full Legal Entity Name" value={societyForm.name} onChange={e => setSocietyForm({...societyForm, name: e.target.value})} /></Grid>
                             <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Institutional Abstract" value={societyForm.about} onChange={e => setSocietyForm({...societyForm, about: e.target.value})} placeholder="Describe the mission and history of the society..." /></Grid>
                             <Grid item xs={12} md={6}><TextField fullWidth label="SaaS Software URL" value={societyForm.softwareUrl} onChange={e => setSocietyForm({...societyForm, softwareUrl: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><LanguageRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                             <Grid item xs={12} md={6}><TextField fullWidth label="Official Email Matrix" value={societyForm.billingEmail} onChange={e => setSocietyForm({...societyForm, billingEmail: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                             <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Registered Secretariat Address" value={societyForm.billingAddress} onChange={e => setSocietyForm({...societyForm, billingAddress: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><StoreRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                          </Grid>
                       </Paper>

                       <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                          <Typography variant="caption" sx={{ fontWeight: 1000, color: "secondary.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>LEGAL & FISCAL COMPLIANCE</Typography>
                          <Grid container spacing={3}>
                             <Grid item xs={12} md={6}><TextField fullWidth label="Corporate Identification Number (CIN)" value={societyForm.cin} onChange={e => setSocietyForm({...societyForm, cin: e.target.value})} /></Grid>
                             <Grid item xs={12} md={6}><TextField fullWidth label="Permanent Account Number (PAN)" value={societyForm.panNo} onChange={e => setSocietyForm({...societyForm, panNo: e.target.value})} /></Grid>
                             <Grid item xs={12} md={6}><TextField fullWidth label="GST Identification Number" value={societyForm.gstNo} onChange={e => setSocietyForm({...societyForm, gstNo: e.target.value})} /></Grid>
                             <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Incorporation Pulse Date" value={societyForm.registrationDate} onChange={e => setSocietyForm({...societyForm, registrationDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                          </Grid>
                       </Paper>

                       <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                          <Typography variant="caption" sx={{ fontWeight: 1000, color: "success.main", letterSpacing: "0.1em", display: 'block', mb: 3 }}>CLASSIFICATION & EQUITY</Typography>
                          <Grid container spacing={3}>
                             <Grid item xs={12} md={6}><TextField select fullWidth label="Entity Category" value={societyForm.category} onChange={e => setSocietyForm({...societyForm, category: e.target.value})}><MenuItem value="Credit Co-op">Credit Co-op</MenuItem><MenuItem value="Multi-State">Multi-State Society</MenuItem><MenuItem value="Nidhi">Nidhi Company</MenuItem></TextField></Grid>
                             <Grid item xs={12} md={6}><TextField select fullWidth label="Institutional Class" value={societyForm.class} onChange={e => setSocietyForm({...societyForm, class: e.target.value})}><MenuItem value="Class A">Class A (Premium)</MenuItem><MenuItem value="Class B">Class B (Standard)</MenuItem></TextField></Grid>
                             <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Authorized Equity" value={societyForm.authorizedCapital} onChange={e => setSocietyForm({...societyForm, authorizedCapital: Number(e.target.value)})} /></Grid>
                             <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Paid-up Liquidity" value={societyForm.paidUpCapital} onChange={e => setSocietyForm({...societyForm, paidUpCapital: Number(e.target.value)})} /></Grid>
                             <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Share Nominal Scale" value={societyForm.shareNominalValue} onChange={e => setSocietyForm({...societyForm, shareNominalValue: Number(e.target.value)})} /></Grid>
                             <Grid item xs={12}><TextField fullWidth label="State of Jurisdiction" value={societyForm.registrationState} onChange={e => setSocietyForm({...societyForm, registrationState: e.target.value})} /></Grid>
                          </Grid>
                       </Paper>
                    </Stack>
                 </Grid>
              </Grid>
           </Stack>
        )}

        {/* VIEW: MASTER BRANCHES */}
        {currentView === "master_branches" && (
           <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Branch Infrastructure</Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Geographical distribution and operational status of your institutions.</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                   <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} sx={{ borderRadius: 2, fontWeight: 900 }} onClick={downloadBranchesCSV}>Export Master</Button>
                   <Button variant="contained" startIcon={<AddLocationAltRoundedIcon />} onClick={() => handleOpenDrawer("branch")} sx={{ bgcolor: "#0f172a", borderRadius: 2, fontWeight: 900 }}>Provision New Branch</Button>
                </Stack>
              </Box>

              <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: 'hidden' }}>
                 <TableContainer>
                    <Table stickyHeader>
                       <TableHead>
                          <TableRow sx={{ "& th": { bgcolor: "#f8fafc", fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", py: 2 } }}>
                             <TableCell>Entity Details</TableCell>
                             <TableCell>Branch Code</TableCell>
                             <TableCell>Activation Date</TableCell>
                             <TableCell>Contact Matrix</TableCell>
                             <TableCell>Regional Scope</TableCell>
                             <TableCell>Status</TableCell>
                             <TableCell align="right">Governance</TableCell>
                          </TableRow>
                          <TableRow sx={{ "& td": { py: 1, bgcolor: "#fff", borderBottom: "1px solid rgba(15, 23, 42, 0.04)" } }}>
                             <TableCell><TextField placeholder="Search Name..." size="small" fullWidth variant="standard" value={branchFilters.name} onChange={e => setBranchFilters({...branchFilters, name: e.target.value})} /></TableCell>
                             <TableCell><TextField placeholder="Code..." size="small" fullWidth variant="standard" value={branchFilters.code} onChange={e => setBranchFilters({...branchFilters, code: e.target.value})} /></TableCell>
                             <TableCell />
                             <TableCell />
                             <TableCell><TextField placeholder="City/State..." size="small" fullWidth variant="standard" value={branchFilters.city} onChange={e => setBranchFilters({...branchFilters, city: e.target.value})} /></TableCell>
                             <TableCell />
                             <TableCell />
                          </TableRow>
                       </TableHead>
                       <TableBody>
                          {branches.filter(b => 
                            (b.name || "").toLowerCase().includes(branchFilters.name.toLowerCase()) && 
                            (b.code || "").toLowerCase().includes(branchFilters.code.toLowerCase()) &&
                            ((b.city || "") + (b.state || "")).toLowerCase().includes(branchFilters.city.toLowerCase())
                          ).slice(branchPage * branchRowsPerPage, branchPage * branchRowsPerPage + branchRowsPerPage).map((b) => (
                             <TableRow key={b.id} hover>
                                <TableCell>
                                   <Stack direction="row" spacing={2} alignItems="center">
                                      <Avatar sx={{ bgcolor: b.isHead ? alpha("#3b82f6", 0.1) : alpha("#64748b", 0.05), color: b.isHead ? "#3b82f6" : "#64748b", borderRadius: 2 }}>
                                         <StoreRoundedIcon />
                                      </Avatar>
                                      <Box>
                                         <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{b.name}</Typography>
                                         {b.isHead && <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 900 }}>INSTITUTIONAL HQ</Typography>}
                                      </Box>
                                   </Stack>
                                </TableCell>
                                <TableCell><Chip label={b.code} size="small" sx={{ fontWeight: 900, borderRadius: 1.5, bgcolor: "#f1f5f9" }} /></TableCell>
                                <TableCell><Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>{b.openingDate ? new Date(b.openingDate).toLocaleDateString() : 'Pending'}</Typography></TableCell>
                                <TableCell>
                                   <Stack spacing={0.5}>
                                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailRoundedIcon sx={{ fontSize: 12 }} /> {b.contactEmail}</Typography>
                                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}><LocalPhoneRoundedIcon sx={{ fontSize: 12 }} /> {b.contactNo}</Typography>
                                   </Stack>
                                </TableCell>
                                <TableCell>
                                   <Typography variant="body2" sx={{ fontWeight: 800 }}>{[b.city, b.state].filter(Boolean).join(", ")}</Typography>
                                   <Typography variant="caption" color="text.secondary">{b.pincode}</Typography>
                                </TableCell>
                                <TableCell>
                                   <IconButton onClick={() => handleToggleBranchStatus(b)} color={b.isActive ? "success" : "default"}>
                                      {b.isActive ? <ToggleOnRoundedIcon /> : <ToggleOffRoundedIcon />}
                                   </IconButton>
                                </TableCell>
                                <TableCell align="right">
                                   <Stack direction="row" spacing={1} justifyContent="flex-end">
                                      <IconButton size="small" onClick={() => { setBranchForm({...b, openingDate: b.openingDate ? new Date(b.openingDate).toISOString().split('T')[0] : ""}); setActiveDrawer("branch"); }}><EditRoundedIcon fontSize="small" /></IconButton>
                                      <IconButton size="small" onClick={() => handleDeleteBranch(b.id)} color="error"><DeleteRoundedIcon fontSize="small" /></IconButton>
                                   </Stack>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </TableContainer>
                 <TablePagination component="div" count={branches.length} page={branchPage} onPageChange={(_, p) => setBranchPage(p)} rowsPerPage={branchRowsPerPage} onRowsPerPageChange={e => setBranchRowsPerPage(parseInt(e.target.value, 10))} />
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
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Create users, control module access, and maintain branch, staff, and member visibility from one place.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<HomeWorkRoundedIcon />} onClick={() => handleOpenDrawer("branch")} sx={{ bgcolor: "#0f172a", borderRadius: 2 }}>Add Branch</Button>
                  <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => handleOpenDrawer("agent")} sx={{ bgcolor: "#3b82f6", borderRadius: 2 }}>Add Agent</Button>
                  <Button variant="contained" startIcon={<GroupsRoundedIcon />} onClick={() => handleOpenDrawer("client")} sx={{ bgcolor: "#8b5cf6", borderRadius: 2 }}>Add Client</Button>
                </Stack>
              </Box>

              <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: "hidden" }}>
                <Box sx={{ p: 3, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", bgcolor: "#f8fafc" }}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>User Access Control</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    New users are provisioned with role-safe defaults, and you can reduce access module by module after creation.
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#fcfdff" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Branch</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Access</TableCell>
                        <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {managedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                            <Typography variant="body2" color="text.secondary">No users have been provisioned for this society yet.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        managedUsers.map((entry) => {
                          const branchName = branches.find((branch) => branch.id === entry.branchId)?.name || "Unassigned";
                          const moduleCount = entry.allowedModuleSlugs?.length || 0;
                          const canManageAccess = ["AGENT", "CLIENT"].includes(entry.role);

                          return (
                            <TableRow key={entry.id} hover>
                              <TableCell>
                                <Stack spacing={0.35}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{entry.fullName}</Typography>
                                  <Typography variant="caption" color="text.secondary">@{entry.username}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={entry.role}
                                  size="small"
                                  sx={{
                                    fontWeight: 900,
                                    bgcolor: entry.role === "AGENT" ? alpha("#3b82f6", 0.1) : entry.role === "CLIENT" ? alpha("#8b5cf6", 0.1) : alpha("#0f172a", 0.08),
                                    color: entry.role === "AGENT" ? "#2563eb" : entry.role === "CLIENT" ? "#7c3aed" : "#0f172a"
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>{branchName}</TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip label={`${moduleCount} modules`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                                  {entry.customerProfile?.customerCode ? (
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                                      {entry.customerProfile.customerCode}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={entry.isActive ? "ACTIVE" : "INACTIVE"}
                                  size="small"
                                  sx={{
                                    fontWeight: 900,
                                    bgcolor: entry.isActive ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1),
                                    color: entry.isActive ? "#059669" : "#dc2626"
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenUserAccess(entry)}
                                    disabled={!canManageAccess}
                                    sx={{ borderRadius: 2, fontWeight: 800 }}
                                  >
                                    Access
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color={entry.isActive ? "error" : "success"}
                                    onClick={() => handleToggleStaffStatus(entry)}
                                    sx={{ borderRadius: 2, fontWeight: 800 }}
                                  >
                                    {entry.isActive ? "Disable" : "Enable"}
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Grid container spacing={3}>
                {/* Branch Registry */}
                {branches.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Branch Infrastructure</Typography>
                      <List disablePadding>
                        {branches.map((b, i) => (
                            <ListItem key={i} divider={i < branches.length - 1} sx={{ px: 0 }}>
                              <ListItemIcon><Avatar sx={{ bgcolor: b.isHead ? "#3b82f6" : "#f1f5f9", color: b.isHead ? "#fff" : "#64748b" }}><DomainIcon /></Avatar></ListItemIcon>
                              <ListItemText primary={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{b.name}</Typography>} secondary={b.isHead ? "Headquarters" : "Regional Branch"} />
                              {b.isHead && <Chip label="HQ" size="small" sx={{ fontWeight: 900, bgcolor: alpha("#3b82f6", 0.1), color: "#3b82f6" }} />}
                            </ListItem>
                          ))}
                      </List>
                    </Paper>
                  </Grid>
                )}

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



         {/* VIEW: MASTER COMPANY PROFILE */}
         {currentView === "master_company" && (
           <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Company Profile</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Maintain institutional legal and operational characteristics.</Typography>
              </Box>

              <Grid container spacing={4}>
                 <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", textAlign: 'center' }}>
                       <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                          <Avatar src={societyForm.logoUrl} sx={{ width: 120, height: 120, borderRadius: 4, border: "4px solid #f8fafc", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
                             <BusinessRoundedIcon sx={{ fontSize: 64 }} />
                          </Avatar>
                          <IconButton size="small" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: "#0f172a", color: "#fff", '&:hover': { bgcolor: "#1e293b" } }}>
                             <CloudUploadRoundedIcon fontSize="small" />
                          </IconButton>
                       </Box>
                       <Typography variant="h5" sx={{ fontWeight: 900 }}>{societyForm.name || 'Untitled Society'}</Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{societyForm.category || 'Institutional Entity'}</Typography>
                       <Divider sx={{ my: 3 }} />
                       <Stack spacing={2} sx={{ textAlign: 'left' }}>
                          <Stack direction="row" spacing={2}><Avatar sx={{ width: 32, height: 32, bgcolor: "#f1f5f9", color: "#64748b" }}><EmailRoundedIcon fontSize="small" /></Avatar><Typography variant="body2" sx={{ fontWeight: 700 }}>{societyForm.billingEmail || 'No official email'}</Typography></Stack>
                          <Stack direction="row" spacing={2}><Avatar sx={{ width: 32, height: 32, bgcolor: "#f1f5f9", color: "#64748b" }}><LocalPhoneRoundedIcon fontSize="small" /></Avatar><Typography variant="body2" sx={{ fontWeight: 700 }}>{societyForm.billingPhone || 'No contact number'}</Typography></Stack>
                          <Stack direction="row" spacing={2}><Avatar sx={{ width: 32, height: 32, bgcolor: "#f1f5f9", color: "#64748b" }}><StoreRoundedIcon fontSize="small" /></Avatar><Typography variant="body2" sx={{ fontWeight: 700 }}>{societyForm.billingAddress || 'No secretariat address'}</Typography></Stack>
                       </Stack>
                    </Paper>
                 </Grid>

                 <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)" }}>
                       <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Institutional Master Configuration</Typography>
                       <Grid container spacing={3}>
                          <Grid item xs={12}><TextField fullWidth label="Full Corporate Name" value={societyForm.name} onChange={e => setSocietyForm({...societyForm, name: e.target.value})} /></Grid>
                          <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Institutional History / Vision" value={societyForm.about} onChange={e => setSocietyForm({...societyForm, about: e.target.value})} /></Grid>
                          <Grid item xs={12} md={6}><TextField fullWidth label="SaaS Portal URL" value={societyForm.softwareUrl} onChange={e => setSocietyForm({...societyForm, softwareUrl: e.target.value})} /></Grid>
                          <Grid item xs={12} md={6}><TextField fullWidth label="Registration State" value={societyForm.registrationState} onChange={e => setSocietyForm({...societyForm, registrationState: e.target.value})} /></Grid>
                          <Grid item xs={12} md={6}><TextField fullWidth label="Equity Scale" value={societyForm.authorizedCapital} type="number" onChange={e => setSocietyForm({...societyForm, authorizedCapital: Number(e.target.value)})} /></Grid>
                          <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Incorporation Date" value={societyForm.registrationDate} onChange={e => setSocietyForm({...societyForm, registrationDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                          <Grid item xs={12}><Button variant="contained" size="large" fullWidth onClick={handleUpdateSociety} sx={{ mt: 2, py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}>Commit Corporate Identity</Button></Grid>
                       </Grid>
                    </Paper>
                 </Grid>
              </Grid>
           </Stack>
         )}

         {/* VIEW: MASTER DIRECTORS */}
         {currentView === "master_directors" && (
           <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Institutional Governance</Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Maintain the high-level decision making and compliant director roster.</Typography>
                </Box>
                <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => handleOpenDrawer("director" as any)} sx={{ bgcolor: "#0f172a", borderRadius: 2, fontWeight: 900 }}>Appoint Director</Button>
              </Box>

              <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: 'hidden' }}>
                 <TableContainer>
                    <Table>
                       <TableHead sx={{ bgcolor: "#f8fafc" }}>
                          <TableRow>
                             <TableCell sx={{ fontWeight: 900 }}>Full Name</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Designation</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>DIN / Identification</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Appointment Pulse</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Signatory</TableCell>
                             <TableCell align="right" sx={{ fontWeight: 900 }}>Governance</TableCell>
                          </TableRow>
                       </TableHead>
                       <TableBody>
                          {directors.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><Typography variant="body2" color="text.secondary">No governance records provisioned.</Typography></TableCell></TableRow>
                          ) : (
                            directors.slice(directorPage * directorRowsPerPage, directorPage * directorRowsPerPage + directorRowsPerPage).map((d) => (
                              <TableRow key={d.id} hover>
                                 <TableCell sx={{ fontWeight: 800 }}>{d.firstName} {d.lastName}</TableCell>
                                 <TableCell><Chip label={d.designation} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5, borderColor: "primary.main", color: "primary.main" }} /></TableCell>
                                 <TableCell><Typography variant="caption" sx={{ fontFamily: "monospace", bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 1 }}>{d.din || d.id.slice(-8).toUpperCase()}</Typography></TableCell>
                                 <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>{d.appointmentDate ? new Date(d.appointmentDate).toLocaleDateString() : 'Pending'}</TableCell>
                                 <TableCell>
                                    <Chip 
                                      label={d.isAuthorizedSignatory ? "Authorized" : "Non-Signatory"} 
                                      size="small" 
                                      icon={d.isAuthorizedSignatory ? <VerifiedUserRoundedIcon /> : undefined}
                                      sx={{ fontWeight: 900, borderRadius: 1.5, bgcolor: d.isAuthorizedSignatory ? alpha("#10b981", 0.1) : alpha("#64748b", 0.1), color: d.isAuthorizedSignatory ? "#10b981" : "#64748b" }} 
                                    />
                                 </TableCell>
                                 <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                      <IconButton size="small" onClick={() => { setDirectorForm({...d, appointmentDate: d.appointmentDate ? new Date(d.appointmentDate).toISOString().split('T')[0] : "", resignationDate: d.resignationDate ? new Date(d.resignationDate).toISOString().split('T')[0] : "", dob: d.dob ? new Date(d.dob).toISOString().split('T')[0] : "", registrationDate: d.registrationDate ? new Date(d.registrationDate).toISOString().split('T')[0] : ""}); setActiveDrawer("director" as any); }}><EditRoundedIcon fontSize="small" /></IconButton>
                                      <IconButton size="small" color="error" onClick={() => handleDeleteDirector(d.id)}><DeleteRoundedIcon fontSize="small" /></IconButton>
                                    </Stack>
                                 </TableCell>
                              </TableRow>
                            ))
                          )}
                       </TableBody>
                    </Table>
                 </TableContainer>
                 <TablePagination component="div" count={directors.length} page={directorPage} onPageChange={(_, p) => setDirectorPage(p)} rowsPerPage={directorRowsPerPage} onRowsPerPageChange={e => setDirectorRowsPerPage(parseInt(e.target.value, 10))} />
              </Paper>
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

        {/* VIEW: PROMOTER AGENTS */}
        {currentView === "promoter_agents" && (
           <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Promoter Agents</Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Detailed roster and operational control for field operatives.</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField 
                    placeholder="Search agents by name or code..." 
                    size="small" 
                    value={promoterAgentSearch} 
                    onChange={(e) => setPromoterAgentSearch(e.target.value)}
                    sx={{ width: 320, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
                  />
                  <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => handleOpenDrawer("agent")} sx={{ bgcolor: "#0f172a", borderRadius: 2, fontWeight: 900 }}>Provision Agent</Button>
                </Stack>
              </Box>

              <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: 'hidden' }}>
                 <TableContainer>
                    <Table>
                       <TableHead sx={{ bgcolor: "#f8fafc" }}>
                          <TableRow>
                             <TableCell sx={{ fontWeight: 900 }}>Name</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Last Name</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Branch</TableCell>
                             <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                          </TableRow>
                       </TableHead>
                       <TableBody>
                          {agents
                            .filter(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(promoterAgentSearch.toLowerCase()))
                            .slice(promoterAgentPage * promoterAgentRowsPerPage, promoterAgentPage * promoterAgentRowsPerPage + promoterAgentRowsPerPage)
                            .map((a) => (
                             <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setEditingAgent(a); setAgentDetailActiveTab("basic"); }}>
                                <TableCell sx={{ fontWeight: 800 }}>{a.firstName}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>{a.lastName}</TableCell>
                                <TableCell>
                                   <Chip 
                                     label={a.isActive !== false ? "Active" : "Inactive"} 
                                     size="small" 
                                     sx={{ fontWeight: 900, borderRadius: 1.5, bgcolor: a.isActive !== false ? alpha("#10b981", 0.1) : alpha("#ef4444", 0.1), color: a.isActive !== false ? "#10b981" : "#ef4444" }} 
                                   />
                                </TableCell>
                                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>{a.branch?.name || 'N/A'}</TableCell>
                                <TableCell align="right">
                                   <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingAgent(a); setAgentDetailActiveTab("basic"); }}><EditRoundedIcon fontSize="small" /></IconButton>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </TableContainer>
                 <TablePagination 
                    component="div" 
                    count={agents.length} 
                    page={promoterAgentPage} 
                    onPageChange={(_, p) => setPromoterAgentPage(p)} 
                    rowsPerPage={promoterAgentRowsPerPage} 
                    onRowsPerPageChange={e => setPromoterAgentRowsPerPage(parseInt(e.target.value, 10))} 
                 />
              </Paper>
           </Stack>
        )}

        {/* VIEW: SHAREHOLDING REGISTRY */}
        {currentView === "promoter_shareholding" && (
           <Stack spacing={4}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>Share Holding Registry</Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>Maintain detailed records of capital distribution and equity holdings.</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField 
                    placeholder="Search by agent or folio..." 
                    size="small" 
                    value={shareholdingSearch} 
                    onChange={(e) => setShareholdingSearch(e.target.value)}
                    sx={{ width: 280, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<AddRoundedIcon />} 
                    onClick={() => { setShareholdingForm({ agentName: "", shareRange: "", totalShares: 0, nominalVal: 10, totalValue: 0, allottedDate: new Date().toISOString().split('T')[0], transferDate: "", folioNo: "", certNo: "", status: "Active" }); setActiveShareholdingDrawer("add"); }}
                    sx={{ bgcolor: "#0f172a", borderRadius: 2, fontWeight: 900 }}
                  >
                    Add Shareholder
                  </Button>
                </Stack>
              </Box>

              <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(15, 23, 42, 0.08)", overflow: 'hidden' }}>
                 <TableContainer>
                    <Table>
                       <TableHead sx={{ bgcolor: "#f8fafc" }}>
                          <TableRow>
                             <TableCell sx={{ fontWeight: 900 }}>Agent Name</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Share Range</TableCell>
                             <TableCell align="right" sx={{ fontWeight: 900 }}>Total Units</TableCell>
                             <TableCell align="right" sx={{ fontWeight: 900 }}>Nominal Val (₹)</TableCell>
                             <TableCell align="right" sx={{ fontWeight: 900 }}>Total Val (₹)</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Folio No</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Cert No</TableCell>
                             <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                             <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                          </TableRow>
                       </TableHead>
                       <TableBody>
                          {shareholdings
                            .filter(s => (s.agentName || "").toLowerCase().includes(shareholdingSearch.toLowerCase()) || (s.folioNo || "").toLowerCase().includes(shareholdingSearch.toLowerCase()))
                            .slice(shareholdingPage * shareholdingRowsPerPage, shareholdingPage * shareholdingRowsPerPage + shareholdingRowsPerPage)
                            .map((s) => (
                             <TableRow key={s.id} hover>
                                <TableCell sx={{ fontWeight: 800 }}>{s.agentName}</TableCell>
                                <TableCell><Chip label={s.shareRange} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5 }} /></TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>{s.totalShares}</TableCell>
                                <TableCell align="right">₹{s.nominalVal}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>₹{s.totalValue.toLocaleString()}</TableCell>
                                <TableCell sx={{ fontFamily: "monospace", color: "text.secondary" }}>{s.folioNo}</TableCell>
                                <TableCell sx={{ fontFamily: "monospace", color: "text.secondary" }}>{s.certNo}</TableCell>
                                <TableCell>
                                   <Chip label={s.status} size="small" sx={{ fontWeight: 900, bgcolor: alpha("#10b981", 0.1), color: "#10b981" }} />
                                </TableCell>
                                <TableCell align="right">
                                   <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                      <Tooltip title="Edit Record"><IconButton size="small" onClick={() => { setShareholdingForm(s); setEditingShareholding(s); setActiveShareholdingDrawer("edit"); }}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                                      <Tooltip title="View Certificate SH-1"><IconButton size="small" color="primary"><VerifiedUserRoundedIcon fontSize="small" /></IconButton></Tooltip>
                                      <Tooltip title="Transfer SH-4"><IconButton size="small" color="secondary"><AccountBalanceRoundedIcon fontSize="small" /></IconButton></Tooltip>
                                   </Stack>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </TableContainer>
                 <TablePagination 
                    component="div" 
                    count={shareholdings.length} 
                    page={shareholdingPage} 
                    onPageChange={(_, p) => setShareholdingPage(p)} 
                    rowsPerPage={shareholdingRowsPerPage} 
                    onRowsPerPageChange={e => setShareholdingRowsPerPage(parseInt(e.target.value, 10))} 
                 />
              </Paper>
           </Stack>
        )}

        {currentView === "promoter_sharecertificate" && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <VerifiedUserRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Share Certificate Ledger</Typography>
            <Typography variant="body2" color="text.secondary">Automated certificate generation and ledger management is being provisioned.</Typography>
          </Box>
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

      {/* PROMOTER AGENT DETAIL DRAWER */}
      <Drawer 
        anchor="right" 
        open={Boolean(editingAgent)} 
        onClose={() => setEditingAgent(null)} 
        PaperProps={{ sx: { width: { xs: "100%", sm: 700 }, borderRadius: "24px 0 0 24px" } }}
      >
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {editingAgent && (
              <>
                <Box sx={{ p: 4, pb: 4, bgcolor: "#0f172a", color: "#fff", position: 'relative' }}>
                   <IconButton onClick={() => setEditingAgent(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#fff", opacity: 0.6 }}><CloseRoundedIcon /></IconButton>
                   <Avatar sx={{ width: 64, height: 64, mb: 2, bgcolor: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)" }}><BadgeRoundedIcon fontSize="large" /></Avatar>
                   <Typography variant="h5" sx={{ fontWeight: 900 }}>{editingAgent.firstName} {editingAgent.lastName}</Typography>
                   <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700 }}>AGENT ID: {editingAgent.code || editingAgent.id.slice(-8).toUpperCase()}</Typography>
                   
                   <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                      {[
                        { id: "basic", label: "Basic Information" },
                        { id: "docs", label: "Documents" },
                        { id: "accounts", label: "Accounts Info" },
                        { id: "loans", label: "Loan Account Info" }
                      ].map(tab => (
                        <Button 
                          key={tab.id}
                          size="small"
                          onClick={() => setAgentDetailActiveTab(tab.id as any)}
                          sx={{ 
                            borderRadius: 2, 
                            px: 2,
                            bgcolor: agentDetailActiveTab === tab.id ? "rgba(255,255,255,0.15)" : "transparent",
                            color: "#fff",
                            fontWeight: 900,
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                          }}
                        >
                          {tab.label}
                        </Button>
                      ))}
                   </Stack>
                </Box>

                <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
                   {agentDetailActiveTab === "basic" && (
                     <Grid container spacing={3}>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Branch" value={editingAgent.branch?.name || ''} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Enrollment Date" value={editingAgent.createdAt ? new Date(editingAgent.createdAt).toISOString().split('T')[0] : ''} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Title" value="Mr." onChange={() => {}} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="First Name" value={editingAgent.firstName} onChange={(e) => setEditingAgent({...editingAgent, firstName: e.target.value})} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Middle Name" value={editingAgent.middleName || ''} onChange={(e) => setEditingAgent({...editingAgent, middleName: e.target.value})} /></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth label="Last Name" value={editingAgent.lastName} onChange={(e) => setEditingAgent({...editingAgent, lastName: e.target.value})} /></Grid>
                        <Grid item xs={12} md={4}><TextField select fullWidth label="Gender" value={editingAgent.gender || 'MALE'} onChange={(e) => setEditingAgent({...editingAgent, gender: e.target.value})}><MenuItem value="MALE">Male</MenuItem><MenuItem value="FEMALE">Female</MenuItem></TextField></Grid>
                        <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Date of Birth" value={editingAgent.dob || ''} onChange={(e) => setEditingAgent({...editingAgent, dob: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Father's Name" value={editingAgent.fatherName || ''} onChange={(e) => setEditingAgent({...editingAgent, fatherName: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Occupation" value={editingAgent.occupation || ''} onChange={(e) => setEditingAgent({...editingAgent, occupation: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Sub-branch" value={editingAgent.subBranch || ''} onChange={(e) => setEditingAgent({...editingAgent, subBranch: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Agent No" value={editingAgent.code || ''} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Phone No" value={editingAgent.phone || ''} onChange={(e) => setEditingAgent({...editingAgent, phone: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={editingAgent.email || ''} onChange={(e) => setEditingAgent({...editingAgent, email: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Spouse Husband/Wife Name" value={editingAgent.spouseName || ''} onChange={(e) => setEditingAgent({...editingAgent, spouseName: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField select fullWidth label="Status" value={editingAgent.isActive !== false ? 'Active' : 'Inactive'} onChange={(e) => setEditingAgent({...editingAgent, isActive: e.target.value === 'Active'})}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Aadhar No" value={editingAgent.aadharNo || ''} onChange={(e) => setEditingAgent({...editingAgent, aadharNo: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Bank Name" value={editingAgent.bankName || ''} onChange={(e) => setEditingAgent({...editingAgent, bankName: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="IFSC Code" value={editingAgent.ifscCode || ''} onChange={(e) => setEditingAgent({...editingAgent, ifscCode: e.target.value})} /></Grid>
                        
                        <Grid item xs={12} sx={{ mt: 2 }}>
                           <Button variant="contained" fullWidth size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a" }}>Save Changes</Button>
                        </Grid>
                     </Grid>
                   )}

                   {agentDetailActiveTab === "docs" && (
                     <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Other Documents</Typography>
                        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, border: "2px dashed #e2e8f0", textAlign: 'center' }}>
                           <CloudUploadRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                           <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Upload Document</Typography>
                           <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>SVG, PNG, JPG or PDF (max. 5MB)</Typography>
                           <TextField size="small" placeholder="Document Name (e.g. Pan Card)" sx={{ mb: 2, width: 250 }} />
                           <Box><Button variant="contained" component="label" sx={{ borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a" }}>Select File <input type="file" hidden /></Button></Box>
                        </Paper>
                     </Box>
                   )}

                   {agentDetailActiveTab === "accounts" && (
                     <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Operational Accounts</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                           <Table size="small">
                              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                 <TableRow>
                                    <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                                    <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>Amount</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>Balance</TableCell>
                                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No active operative accounts found.</Typography></TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Box>
                   )}

                   {agentDetailActiveTab === "loans" && (
                     <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Loan Account Portfolios</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                           <Table size="small">
                              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                 <TableRow>
                                    <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                                    <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>Principal</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900 }}>Interest</TableCell>
                                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No loan portfolios mapped to this operative.</Typography></TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Box>
                   )}
                </Box>
              </>
            )}
         </Box>
      </Drawer>

      {/* SHAREHOLDING MANAGEMENT DRAWER */}
      <Drawer 
        anchor="right" 
        open={Boolean(activeShareholdingDrawer)} 
        onClose={() => setActiveShareholdingDrawer(null)} 
        PaperProps={{ sx: { width: { xs: "100%", sm: 550 }, borderRadius: "24px 0 0 24px" } }}
      >
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#0f172a", 0.03), borderBottom: "1px solid rgba(15, 23, 42, 0.1)", position: 'relative' }}>
               <IconButton onClick={() => setActiveShareholdingDrawer(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#64748b" }}><CloseRoundedIcon /></IconButton>
               <Avatar sx={{ bgcolor: "#0f172a", width: 56, height: 56, mb: 2, boxShadow: "0 8px 16px -4px rgba(15, 23, 42, 0.4)" }}><GroupsRoundedIcon fontSize="large" /></Avatar>
               <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>{activeShareholdingDrawer === "edit" ? "Update Equity Record" : "New Share Allotment"}</Typography>
               <Typography variant="body2" color="text.secondary">Record institutional capital units and generate compliance certificates.</Typography>
            </Box>
            <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
               <Stack spacing={4}>
                  <Box>
                     <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 2 }}>HOLDER IDENTIFICATION</Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={12}><TextField select fullWidth label="Agent / Holder Name" value={shareholdingForm.agentName} onChange={e => setShareholdingForm({...shareholdingForm, agentName: e.target.value})}>{agents.length > 0 ? agents.map(a => <MenuItem key={a.id} value={`${a.firstName} ${a.lastName}`}>{a.firstName} {a.lastName}</MenuItem>) : <MenuItem value={shareholdingForm.agentName}>{shareholdingForm.agentName || "No agents available"}</MenuItem>}</TextField></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Folio Number" value={shareholdingForm.folioNo} onChange={e => setShareholdingForm({...shareholdingForm, folioNo: e.target.value})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Certificate Number" value={shareholdingForm.certNo} onChange={e => setShareholdingForm({...shareholdingForm, certNo: e.target.value})} /></Grid>
                     </Grid>
                  </Box>

                  <Box>
                     <Typography variant="caption" sx={{ fontWeight: 1000, color: "secondary.main", letterSpacing: "0.1em", display: 'block', mb: 2 }}>CAPITAL ALLOTMENT</Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Share Range" value={shareholdingForm.shareRange} onChange={e => setShareholdingForm({...shareholdingForm, shareRange: e.target.value})} placeholder="e.g. 1001-1100" /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Total Shares Hold" value={shareholdingForm.totalShares} onChange={e => setShareholdingForm({...shareholdingForm, totalShares: Number(e.target.value), totalValue: Number(e.target.value) * shareholdingForm.nominalVal})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="number" label="Nominal Value (₹)" value={shareholdingForm.nominalVal} onChange={e => setShareholdingForm({...shareholdingForm, nominalVal: Number(e.target.value), totalValue: shareholdingForm.totalShares * Number(e.target.value)})} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Total Share Value (₹)" value={shareholdingForm.totalValue} InputProps={{ readOnly: true }} /></Grid>
                     </Grid>
                  </Box>

                  <Box>
                     <Typography variant="caption" sx={{ fontWeight: 1000, color: "success.main", letterSpacing: "0.1em", display: 'block', mb: 2 }}>CHRONOLOGY & STATUS</Typography>
                     <Grid container spacing={2}>
                        <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Allotted Date" value={shareholdingForm.allottedDate} onChange={e => setShareholdingForm({...shareholdingForm, allottedDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Transfer Date" value={shareholdingForm.transferDate} onChange={e => setShareholdingForm({...shareholdingForm, transferDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField select fullWidth label="Equity Status" value={shareholdingForm.status} onChange={e => setShareholdingForm({...shareholdingForm, status: e.target.value})}><MenuItem value="Active">Active</MenuItem><MenuItem value="Transferred">Transferred</MenuItem><MenuItem value="Surrendered">Surrendered</MenuItem></TextField></Grid>
                     </Grid>
                  </Box>

                  {activeShareholdingDrawer === "edit" && (
                    <Box sx={{ p: 2, bgcolor: alpha("#3b82f6", 0.05), borderRadius: 2, border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                       <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, color: "primary.main" }}>Compliance Certificates</Typography>
                       <Stack direction="row" spacing={2}>
                          <Button variant="outlined" size="small" fullWidth startIcon={<VerifiedUserRoundedIcon />} sx={{ borderRadius: 2, fontWeight: 900 }}>Issue SH-1</Button>
                          <Button variant="outlined" size="small" fullWidth startIcon={<AccountBalanceRoundedIcon />} sx={{ borderRadius: 2, fontWeight: 900 }}>Draft SH-4</Button>
                       </Stack>
                    </Box>
                  )}

                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a", '&:hover': { bgcolor: "#1e293b" } }}
                    onClick={() => {
                      if (activeShareholdingDrawer === "edit") {
                        setShareholdings(shareholdings.map(s => s.id === editingShareholding.id ? { ...shareholdingForm, id: s.id } : s));
                      } else {
                        setShareholdings([...shareholdings, { ...shareholdingForm, id: Math.random().toString(36).slice(-8) }]);
                      }
                      setActiveShareholdingDrawer(null);
                    }}
                  >
                    {activeShareholdingDrawer === "edit" ? "Commit Equity Changes" : "Allot Shares"}
                  </Button>
               </Stack>
            </Box>
         </Box>
      </Drawer>

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
                  <UserAccessSelector
                    accountType="CLIENT"
                    value={staffForm.allowedModuleSlugs}
                    onChange={(next) => setStaffForm({ ...staffForm, allowedModuleSlugs: next })}
                    helperText="Members can be limited to only the client modules they need."
                  />
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
                  <UserAccessSelector
                    accountType="AGENT"
                    value={staffForm.allowedModuleSlugs}
                    onChange={(next) => setStaffForm({ ...staffForm, allowedModuleSlugs: next })}
                    helperText="Grant only the field and operations modules this staff user should see."
                  />
                  <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a", '&:hover': { bgcolor: "#1e293b" } }} onClick={() => handleCreateStaff("AGENT")} disabled={formLoading}>Provision Staff Account</Button>
               </Stack>
            </Box>
         </Box>
      </Drawer>

      <Drawer anchor="right" open={Boolean(selectedUserAccess)} onClose={() => setSelectedUserAccess(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, borderRadius: "24px 0 0 24px" } }}>
        {selectedUserAccess ? (
          <Box sx={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 4, pb: 5, bgcolor: alpha("#2563eb", 0.05), borderBottom: "1px solid rgba(37, 99, 235, 0.12)", position: "relative" }}>
              <IconButton onClick={() => setSelectedUserAccess(null)} sx={{ position: "absolute", right: 16, top: 16, color: "#64748b" }}>
                <CloseRoundedIcon />
              </IconButton>
              <Avatar sx={{ bgcolor: "#2563eb", width: 56, height: 56, mb: 2 }}>
                <ManageAccountsRoundedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Access Matrix</Typography>
              <Typography variant="body2" color="text.secondary">
                Update which modules are visible to {selectedUserAccess.fullName}.
              </Typography>
            </Box>
            <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{selectedUserAccess.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    @{selectedUserAccess.username} · {selectedUserAccess.role}
                  </Typography>
                </Paper>
                <UserAccessSelector
                  accountType={selectedUserAccess.role}
                  value={userAccessDraft}
                  onChange={setUserAccessDraft}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ py: 2, borderRadius: 2.5, fontWeight: 900, bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}
                  onClick={handleSaveUserAccess}
                  disabled={formLoading}
                >
                  Save Access
                </Button>
              </Stack>
            </Box>
          </Box>
        ) : null}
      </Drawer>

      <Drawer anchor="right" open={activeDrawer === "branch"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 600 }, borderRadius: "24px 0 0 24px" } }}>
         <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, pb: 6, bgcolor: alpha("#0f172a", 0.03), borderBottom: "1px solid rgba(15, 23, 42, 0.1)", position: 'relative' }}>
               <IconButton onClick={() => setActiveDrawer(null)} sx={{ position: 'absolute', right: 16, top: 16, color: "#64748b" }}><CloseRoundedIcon /></IconButton>
               <Avatar sx={{ bgcolor: "#0f172a", width: 64, height: 64, mb: 2, boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.4)" }}><AddLocationAltRoundedIcon fontSize="large" /></Avatar>
               <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>Infrastructure Provisioning</Typography>
               <Typography variant="body2" color="text.secondary">Expand your geographical coverage or update existing entity attributes.</Typography>
            </Box>
            <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
               <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", display: 'block', mb: 2 }}>CORE IDENTITY</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}><TextField fullWidth label="Legal Branch Name" value={branchForm.name} onChange={e => updateBranchName(e.target.value)} placeholder="e.g. Metro Hub Branch" /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth label="Entity Code" value={branchForm.code} disabled InputProps={{ startAdornment: <InputAdornment position="start"><InfoRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                      <Grid item xs={12} md={6}><TextField select fullWidth label="Operational Status" value={String(branchForm.isActive)} onChange={e => setBranchForm({...branchForm, isActive: e.target.value === 'true'})}><MenuItem value="true">Active & Operational</MenuItem><MenuItem value="false">Deactivated / Maintenance</MenuItem></TextField></Grid>
                      <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Activation Date" value={branchForm.openingDate} onChange={e => setBranchForm({...branchForm, openingDate: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 1000, color: "secondary.main", letterSpacing: "0.1em", display: 'block', mb: 2 }}>CONTACT MATRIX</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}><TextField fullWidth label="Official Contact Email" value={branchForm.contactEmail} onChange={e => setBranchForm({...branchForm, contactEmail: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                      <Grid item xs={12} md={6}><TextField fullWidth label="Corporate Phone Matrix" value={branchForm.contactNo} onChange={e => setBranchForm({...branchForm, contactNo: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start"><LocalPhoneRoundedIcon fontSize="small" /></InputAdornment> }} /></Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 1000, color: "success.main", letterSpacing: "0.1em", display: 'block', mb: 2 }}>GEOGRAPHICAL SCOPE</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}><TextField fullWidth label="Primary Logistics Address" value={branchForm.addressLine1} onChange={e => setBranchForm({...branchForm, addressLine1: e.target.value})} /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Secondary Logistics / Suite" value={branchForm.addressLine2} onChange={e => setBranchForm({...branchForm, addressLine2: e.target.value})} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth label="City Pulse" value={branchForm.city} onChange={e => setBranchForm({...branchForm, city: e.target.value})} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth label="Jurisdiction State" value={branchForm.state} onChange={e => setBranchForm({...branchForm, state: e.target.value})} /></Grid>
                      <Grid item xs={12} md={4}><TextField fullWidth label="Logistics Pincode" value={branchForm.pincode} onChange={e => setBranchForm({...branchForm, pincode: e.target.value})} /></Grid>
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 1000, color: "#eb4432", letterSpacing: "0.1em", display: 'block', mb: 2 }}>INFRASTRUCTURE CAPABILITIES</Typography>
                    <Stack spacing={1}>
                       <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                             <Box><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Secure Locker Vault</Typography><Typography variant="caption" color="text.secondary">Physical asset security available at location.</Typography></Box>
                             <Switch checked={branchForm.lockerFacility} onChange={e => setBranchForm({...branchForm, lockerFacility: e.target.checked})} />
                          </Stack>
                       </Paper>
                       <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                             <Box><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>NEFT/IMPS Online Portal</Typography><Typography variant="caption" color="text.secondary">Digital inter-bank fund transfer support.</Typography></Box>
                             <Switch checked={branchForm.neftImpsService} onChange={e => setBranchForm({...branchForm, neftImpsService: e.target.checked})} />
                          </Stack>
                       </Paper>
                       <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                             <Box><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Institutional Headquarters</Typography><Typography variant="caption" color="text.secondary">Principal administrative hub for entire society.</Typography></Box>
                             <Switch checked={branchForm.isHead} onChange={e => setBranchForm({...branchForm, isHead: e.target.checked})} />
                          </Stack>
                       </Paper>
                    </Stack>
                  </Box>

                  <Button fullWidth variant="contained" size="large" sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a", '&:hover': { bgcolor: "#1e293b" }, boxShadow: "0 15px 25px -10px rgba(15, 23, 42, 0.4)" }} onClick={handleCreateBranch} disabled={formLoading}>
                    {branchForm.id ? "Commit Architectural Changes" : "Deploy Infrastructure Entity"}
                  </Button>
               </Stack>
            </Box>
         </Box>
      </Drawer>

      {/* Institutional Governance (Director) Provisioning Drawer */}
      <Drawer anchor="right" open={activeDrawer === "director"} onClose={() => setActiveDrawer(null)} PaperProps={{ sx: { width: { xs: "100%", sm: 600, md: 800 }, borderRadius: "24px 0 0 24px" } }}>
         <Box sx={{ p: 4, height: '100%', overflowY: 'auto' }}>
            <Stack spacing={3}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Director Identification & Governance</Typography>
                  <IconButton onClick={() => setActiveDrawer(null)}><CloseRoundedIcon /></IconButton>
               </Box>
               
               <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em" }}>CORE IDENTITY & DIN</Typography>
               <Grid container spacing={3}>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Designation" value={directorForm.designation} onChange={e => setDirectorForm({...directorForm, designation: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="DIN (Director ID)" value={directorForm.din} onChange={e => setDirectorForm({...directorForm, din: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="First Name" value={directorForm.firstName} onChange={e => setDirectorForm({...directorForm, firstName: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Last Name" value={directorForm.lastName} onChange={e => setDirectorForm({...directorForm, lastName: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} value={directorForm.dob} onChange={e => setDirectorForm({...directorForm, dob: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField select fullWidth label="Gender" value={directorForm.gender} onChange={e => setDirectorForm({...directorForm, gender: e.target.value})}><MenuItem value="MALE">Male</MenuItem><MenuItem value="FEMALE">Female</MenuItem><MenuItem value="OTHER">Other</MenuItem></TextField></Grid>
               </Grid>

               <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", mt: 2 }}>CONTACT & LEGAL</Typography>
               <Grid container spacing={3}>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Email Address" value={directorForm.email} onChange={e => setDirectorForm({...directorForm, email: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Mobile Number" value={directorForm.mobileNo} onChange={e => setDirectorForm({...directorForm, mobileNo: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="PAN Number" value={directorForm.panNo} onChange={e => setDirectorForm({...directorForm, panNo: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Aadhar Number" value={directorForm.aadharNo} onChange={e => setDirectorForm({...directorForm, aadharNo: e.target.value})} /></Grid>
               </Grid>

               <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", mt: 2 }}>APPOINTMENT PHILOSOPHY</Typography>
               <Grid container spacing={3}>
                  <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Appointment Date" InputLabelProps={{ shrink: true }} value={directorForm.appointmentDate} onChange={e => setDirectorForm({...directorForm, appointmentDate: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth type="date" label="Resignation Date (If Applicable)" InputLabelProps={{ shrink: true }} value={directorForm.resignationDate} onChange={e => setDirectorForm({...directorForm, resignationDate: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Father's Name" value={directorForm.fatherName} onChange={e => setDirectorForm({...directorForm, fatherName: e.target.value})} /></Grid>
                  <Grid item xs={12} md={6}><TextField fullWidth label="Mother's Name" value={directorForm.motherName} onChange={e => setDirectorForm({...directorForm, motherName: e.target.value})} /></Grid>
                  <Grid item xs={12} md={12}><FormControlLabel control={<Switch checked={directorForm.isAuthorizedSignatory} onChange={e => setDirectorForm({...directorForm, isAuthorizedSignatory: e.target.checked})} />} label="Authorized Signatory (Signing Rights)" /></Grid>
               </Grid>

               <Typography variant="caption" sx={{ fontWeight: 1000, color: "primary.main", letterSpacing: "0.1em", mt: 2 }}>BANKING & ADDRESS</Typography>
               <Grid container spacing={3}>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Bank Name" value={directorForm.bankName} onChange={e => setDirectorForm({...directorForm, bankName: e.target.value})} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Account Number" value={directorForm.accountNo} onChange={e => setDirectorForm({...directorForm, accountNo: e.target.value})} /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="IFSC Code" value={directorForm.ifscCode} onChange={e => setDirectorForm({...directorForm, ifscCode: e.target.value})} /></Grid>
                  <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Corresponding Address" value={directorForm.correspondingAddress} onChange={e => setDirectorForm({...directorForm, correspondingAddress: e.target.value})} /></Grid>
                  <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Permanent Address" value={directorForm.permanentAddress} onChange={e => setDirectorForm({...directorForm, permanentAddress: e.target.value})} /></Grid>
               </Grid>

               <Button fullWidth variant="contained" size="large" onClick={handleSaveDirector} disabled={formLoading} sx={{ py: 2, mt: 4, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}>
                  {formLoading ? <CircularProgress size={24} color="inherit" /> : directorForm.id ? "Update Governance Record" : "Appoint Director"}
               </Button>
            </Stack>
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
