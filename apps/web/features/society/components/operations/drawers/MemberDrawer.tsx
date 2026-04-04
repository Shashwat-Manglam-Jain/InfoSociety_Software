"use client";

import React from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Grid,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { alpha } from "@mui/material/styles";
import { 
  MemberRecord, 
  buildLoginUsername,
  BranchOption,
  AgentOption
} from "../../../lib/society-operations-data";

type MemberDrawerProps = {
  open: boolean;
  onClose: () => void;
  memberForm: MemberRecord;
  setMemberForm: React.Dispatch<React.SetStateAction<MemberRecord>>;
  editingMemberId: string | null;
  branchOptions: BranchOption[];
  agentOptions: AgentOption[];
  onSave: () => void;
  formLoading?: boolean;
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="caption"
    sx={{
      fontWeight: 900,
      color: "primary.main",
      letterSpacing: "0.1em",
      display: "block",
      mb: 1.5,
      mt: 3,
    }}
  >
    {children}
  </Typography>
);

export function MemberDrawer({
  open,
  onClose,
  memberForm,
  setMemberForm,
  editingMemberId,
  branchOptions,
  agentOptions,
  onSave,
  formLoading = false,
}: MemberDrawerProps) {
  const isInvalid = !memberForm.name.trim() || !memberForm.branchId;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 640 },
          borderRadius: "24px 0 0 24px",
          bgcolor: "background.paper",
        },
      }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            p: 4,
            pb: 5,
            bgcolor: alpha("#0f172a", 0.02),
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
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
            {editingMemberId ? "Update Member Profile" : "Register New Member"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Capture institutional KYC and personal metadata for the member registry.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={0}>
            <Box>
              <FieldLabel>ORGANIZATIONAL PLACEMENT</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Primary Branch"
                    value={memberForm.branchId}
                    onChange={(event) => {
                      const branch = branchOptions.find((b) => b.id === event.target.value);
                      setMemberForm((prev) => ({
                        ...prev,
                        branchId: event.target.value,
                        branch: branch?.name ?? "",
                      }));
                    }}
                  >
                    {branchOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Assigned Agent / Staff"
                    value={memberForm.memberSourceName}
                    onChange={(event) =>
                      setMemberForm((prev) => ({
                        ...prev,
                        memberSourceName: event.target.value,
                      }))
                    }
                  >
                    {agentOptions.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name} ({option.code})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel>PERSONAL IDENTITY</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Full Legal Name"
                    value={memberForm.name}
                    onChange={(event) =>
                      setMemberForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                        loginDetails: {
                          ...prev.loginDetails,
                          username: buildLoginUsername(event.target.value),
                        },
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    value={memberForm.fatherName}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, fatherName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    value={memberForm.motherName}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, motherName: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Date of Birth"
                    value={memberForm.dob}
                    onChange={(event) =>
                      setMemberForm((prev: MemberRecord) => ({ ...prev, dob: event.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    value={memberForm.gender}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, gender: event.target.value }))
                    }
                  >
                    {["Male", "Female", "Other"].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    value={memberForm.occupation}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, occupation: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel>CONTACT MATRIX</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={memberForm.mobileNo}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, mobileNo: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={memberForm.email}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Permanent Address"
                    value={memberForm.permanentAddress}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, permanentAddress: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel>MEMBERSHIP STATUS</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Annual Income"
                    value={memberForm.annualIncomeRange}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, annualIncomeRange: event.target.value }))
                    }
                  >
                    {["0-3 Lakh", "3-6 Lakh", "6-12 Lakh", "12 Lakh+"].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={memberForm.membershipStatus}
                    onChange={(event) =>
                      setMemberForm((prev) => ({ ...prev, membershipStatus: event.target.value }))
                    }
                  >
                    {["Active", "Pending Verification", "Suspended"].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Membership Fee"
                    value={memberForm.membershipFeeCollected ? "Collected" : "Not Collected"}
                    onChange={(event) =>
                      setMemberForm((prev) => ({
                        ...prev,
                        membershipFeeCollected: event.target.value === "Collected",
                      }))
                    }
                  >
                    <MenuItem value="Collected">Collected</MenuItem>
                    <MenuItem value="Not Collected">Not Collected</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={isInvalid || formLoading}
                onClick={onSave}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 900,
                  bgcolor: "#0f172a",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                {editingMemberId ? "Update Member Identity" : "Provision Member Profile"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
