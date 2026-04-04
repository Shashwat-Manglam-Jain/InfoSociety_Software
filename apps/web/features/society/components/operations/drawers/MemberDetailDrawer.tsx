"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { alpha } from "@mui/material/styles";
import { MemberRecord, AccountRecord, ShareholdingRecord } from "../../../lib/society-operations-data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const InfoPair = ({ label, value }: { label: string; value: string | number | boolean | undefined | null }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" sx={{ fontWeight: 900, color: "text.secondary", letterSpacing: "0.05em", display: "block" }}>
      {(label ?? "").toUpperCase()}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
      {value === true ? "YES" : value === false ? "NO" : value || "-"}
    </Typography>
  </Box>
);

const TabPanel = ({ active, children }: { active: boolean; children: React.ReactNode }) =>
  active ? <Box>{children}</Box> : null;

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  member: MemberRecord | null;
  accounts: AccountRecord[];
  shareholdings: ShareholdingRecord[];
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
  onEditMember: (m: MemberRecord) => void;
  onAddShareholding: () => void;
  onEditShareholding: (s: ShareholdingRecord) => void;
  onAddDocument?: (doc: any) => void;
  onEditDocument?: (id: string, doc: any) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function MemberDetailDrawer({
  open,
  onClose,
  member,
  accounts,
  shareholdings,
  formatCurrency,
  formatDate,
  onEditMember,
  onAddShareholding,
  onEditShareholding,
}: MemberDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("member");

  if (!member) return null;

  const memberAccounts      = accounts.filter((a) => a.memberId === member.id);
  const memberShareholdings = shareholdings.filter((s) => s.memberId === member.id);

  const safeDate = (d?: string) => (d ? formatDate(d) : "-");

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 800 }, borderRadius: "24px 0 0 24px" } }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box sx={{ p: 4, bgcolor: "#0f172a", color: "#fff", position: "relative" }}>
          <IconButton onClick={onClose} sx={{ position: "absolute", right: 16, top: 16, color: "#fff", opacity: 0.6 }}>
            <CloseRoundedIcon />
          </IconButton>

          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ width: 80, height: 80, bgcolor: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 3 }}>
              {member.name?.charAt(0) ?? "?"}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
                {member.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={member.clientNo} size="small" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 800 }} />
                <Chip
                  label={member.membershipStatus}
                  size="small"
                  sx={{
                    bgcolor: alpha(member.membershipStatus === "Active" ? "#10b981" : "#f59e0b", 0.2),
                    color: member.membershipStatus === "Active" ? "#10b981" : "#f59e0b",
                    fontWeight: 800,
                  }}
                />
              </Stack>
            </Box>
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mt: 4,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              "& .MuiTab-root": { color: "rgba(255,255,255,0.6)", fontWeight: 900 },
              "& .Mui-selected": { color: "#fff !important" },
              "& .MuiTabs-indicator": { bgcolor: "primary.main" },
            }}
          >
            <Tab label="Registry Info"  value="member" />
            <Tab label="Nominee"        value="nominee" />
            <Tab label="Location"       value="address" />
            <Tab label="Equity"         value="shareholding" />
            <Tab label="KYC Compliance" value="kyc" />
            <Tab label="Accounts"       value="account" />
          </Tabs>
        </Box>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>

          {/* Registry Tab */}
          <TabPanel active={activeTab === "member"}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Client No"       value={member.clientNo} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Application No"  value={member.applicationNo} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Father Name"     value={member.fatherName} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Mother Name"     value={member.motherName} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Date of Birth"   value={safeDate(member.dob)} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Gender"          value={member.gender} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Occupation"      value={member.occupation} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Income Range"    value={member.annualIncomeRange} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Mobile"          value={member.mobileNo} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Email"           value={member.email} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Branch"          value={member.branch} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Joined On"       value={safeDate(member.joinedOn)} /></Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEditMember(member)} sx={{ borderRadius: 2 }}>
                Edit Member
              </Button>
            </Box>
          </TabPanel>

          {/* Nominee Tab */}
          <TabPanel active={activeTab === "nominee"}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Nominee Name"   value={member.nomineeName} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Relation"       value={member.nomineeRelation} /></Grid>
              <Grid size={{ xs: 12 }}>       <InfoPair label="Address"        value={member.nomineeAddress} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Mobile No"      value={member.nomineeMobileNo} /></Grid>
              <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Aadhaar No"     value={member.nomineeAadhaarNo} /></Grid>
            </Grid>
          </TabPanel>

          {/* Location Tab */}
          <TabPanel active={activeTab === "address"}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>       <InfoPair label="Permanent Address"      value={member.permanentAddress} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><InfoPair label="City"                   value={member.permanentCity} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><InfoPair label="State"                  value={member.permanentState} /></Grid>
              <Grid size={{ xs: 12, md: 4 }}><InfoPair label="Pincode"                value={member.permanentPincode} /></Grid>
              <Grid size={{ xs: 12 }}><Divider /></Grid>
              <Grid size={{ xs: 12 }}>       <InfoPair label="Correspondence Address"  value={member.correspondingAddress} /></Grid>
            </Grid>
          </TabPanel>

          {/* Shareholding Tab */}
          <TabPanel active={activeTab === "shareholding"}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Equity Distribution</Typography>
                <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={onAddShareholding} sx={{ borderRadius: 2 }}>
                  Allot Shares
                </Button>
              </Stack>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 900 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 900 }}>Range</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">Units</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">Total Val</TableCell>
                      <TableCell sx={{ fontWeight: 900 }} align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {memberShareholdings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">No shares allotted yet.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      memberShareholdings.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell sx={{ fontWeight: 800 }}>{s.shareholderType}</TableCell>
                          <TableCell>{s.shareRange}</TableCell>
                          <TableCell align="right">{s.totalShareHold}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 900 }}>{formatCurrency(s.totalShareVal ?? 0)}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => onEditShareholding(s)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </TabPanel>

          {/* KYC Tab */}
          <TabPanel active={activeTab === "kyc"}>
            <Stack spacing={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>PAN Card Verification</Typography>
                  {member.kyc?.pan?.verified && (
                    <Chip label="Verified" size="small" color="success" icon={<VerifiedUserRoundedIcon />} sx={{ fontWeight: 900 }} />
                  )}
                </Stack>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}><InfoPair label="PAN Number"  value={member.kyc?.pan?.number} /></Grid>
                  <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Verified On" value={safeDate(member.kyc?.pan?.verifiedOn)} /></Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Aadhaar Card Verification</Typography>
                  {member.kyc?.aadhaar?.verified && (
                    <Chip label="Verified" size="small" color="success" icon={<VerifiedUserRoundedIcon />} sx={{ fontWeight: 900 }} />
                  )}
                </Stack>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Aadhaar Number" value={member.kyc?.aadhaar?.number} /></Grid>
                  <Grid size={{ xs: 12, md: 6 }}><InfoPair label="Verified On"    value={safeDate(member.kyc?.aadhaar?.verifiedOn)} /></Grid>
                </Grid>
              </Paper>
            </Stack>
          </TabPanel>

          {/* Accounts Tab */}
          <TabPanel active={activeTab === "account"}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Account No</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 900 }} align="right">Balance</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No operational accounts found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    memberAccounts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell sx={{ fontWeight: 800 }}>{a.accountNo}</TableCell>
                        <TableCell>{a.planName}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, color: "primary.main" }}>{formatCurrency(a.amount ?? 0)}</TableCell>
                        <TableCell><Chip label={a.status} size="small" sx={{ fontWeight: 800 }} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

        </Box>
      </Box>
    </Drawer>
  );
}
