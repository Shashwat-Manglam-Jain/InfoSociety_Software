"use client";

import React from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";
import { 
  AccountRecord, 
  MemberRecord, 
  PlanRecord,
  getNextAccountNumber 
} from "../../../lib/society-operations-data";

type AccountDrawerProps = {
  open: boolean;
  onClose: () => void;
  accountForm: AccountRecord;
  setAccountForm: React.Dispatch<React.SetStateAction<AccountRecord>>;
  editingAccountId: string | null;
  members: MemberRecord[];
  plans: PlanRecord[];
  onSave: () => void;
  allAccounts: AccountRecord[];
};

export function AccountDrawer({
  open,
  onClose,
  accountForm,
  setAccountForm,
  editingAccountId,
  members,
  plans,
  onSave,
  allAccounts,
}: AccountDrawerProps) {
  const isInvalid = !accountForm.memberId || !accountForm.planName;

  const syncMemberData = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setAccountForm((prev: AccountRecord) => ({
        ...prev,
        memberId,
        memberName: member.name,
        branchId: member.branchId,
        branch: member.branch,
        agent: member.memberSourceName,
        nominee: member.nomineeName,
        nomineeRelation: member.nomineeRelation,
      }));
    }
  };

  const syncPlanData = (planName: string) => {
    const plan = plans.find((p) => p.planName === planName);
    if (plan) {
      setAccountForm((prev: AccountRecord) => ({
        ...prev,
        planName,
        planCategory: plan.category,
        accountType: plan.category.includes("loan") ? "Loan Account" : "Deposit Account",
        accountNo: prev.accountNo || getNextAccountNumber(allAccounts, plan.category),
      }));
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 640 },
          borderRadius: "24px 0 0 24px",
        },
      }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            p: 4,
            pb: 5,
            bgcolor: alpha("#8b5cf6", 0.02),
            borderBottom: "1px solid rgba(139, 92, 246, 0.08)",
            position: "relative",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 16, color: "text.secondary" }}
          >
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
            {editingAccountId ? "Update Account Register" : "Open Institutional Account"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Initialize new deposit or loan accounts with product plan mappings.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={4}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Member"
                  value={accountForm.memberId}
                  onChange={(e) => syncMemberData(e.target.value)}
                >
                  {members.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name} ({m.clientNo})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Product Plan"
                  value={accountForm.planName}
                  onChange={(e) => syncPlanData(e.target.value)}
                >
                  {plans.map((p) => (
                    <MenuItem key={p.id} value={p.planName}>
                      {p.planName} ({p.planCode})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={accountForm.accountNo}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="date"
                  fullWidth
                  label="Opening Date"
                  value={accountForm.openDate}
                  onChange={(e) => setAccountForm((prev: AccountRecord) => ({ ...prev, openDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="number"
                  fullWidth
                  label={accountForm.accountType.includes("Loan") ? "Sanctioned Amount" : "Initial Deposit"}
                  value={accountForm.amount}
                  onChange={(e) => setAccountForm((prev: AccountRecord) => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Auto Renew"
                  value={accountForm.autoRenew ? "Yes" : "No"}
                  onChange={(e) => setAccountForm((prev: AccountRecord) => ({ ...prev, autoRenew: e.target.value === "Yes" }))}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Joint Account"
                  value={accountForm.jointAccount ? "Yes" : "No"}
                  onChange={(e) => setAccountForm((prev: AccountRecord) => ({ ...prev, jointAccount: e.target.value === "Yes" }))}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={accountForm.status}
                  onChange={(e) => setAccountForm((prev: AccountRecord) => ({ ...prev, status: e.target.value }))}
                >
                  {["Active", "Matured", "Closed", "On Hold"].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={isInvalid}
              onClick={onSave}
              sx={{ py: 2, borderRadius: 3, fontWeight: 900, bgcolor: "#0f172a" }}
            >
              {editingAccountId ? "Update Account Record" : "Provision New Account"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
