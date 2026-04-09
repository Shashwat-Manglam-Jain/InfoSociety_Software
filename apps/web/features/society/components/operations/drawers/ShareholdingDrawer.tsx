"use client";

import React from "react";
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";
import {
  ShareholdingRecord,
  MemberRecord,
  ShareholdingType
} from "../../../lib/society-operations-data";

type ShareholdingDrawerProps = {
  open: boolean;
  onClose: () => void;
  shareForm: ShareholdingRecord;
  setShareForm: React.Dispatch<React.SetStateAction<ShareholdingRecord>>;
  editingShareId: string | null;
  members: MemberRecord[];
  onSave: () => void;
};

const FieldLabel = ({ children, color = "primary.main" }: { children: React.ReactNode; color?: string }) => (
  <Typography variant="caption" sx={{ fontWeight: 1000, color, letterSpacing: "0.1em", mb: 2, display: "block" }}>
    {String(children).toUpperCase()}
  </Typography>
);

export function ShareholdingDrawer({
  open,
  onClose,
  shareForm,
  setShareForm,
  editingShareId,
  members,
  onSave,
}: ShareholdingDrawerProps) {
  const isInvalid = !shareForm.memberId || shareForm.totalShareHold <= 0;

  const syncMemberData = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setShareForm((prev: ShareholdingRecord) => ({
        ...prev,
        memberId,
        memberName: member.name,
        agent: member.memberSourceName
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
          width: { xs: "100%", sm: 600 },
          borderRadius: "14px 0 0 14px",
          bgcolor: "background.paper"
        },
      }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            p: 4,
            pb: 5,
            bgcolor: alpha("#10b981", 0.02),
            borderBottom: "1px solid rgba(16, 185, 129, 0.08)",
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
            {editingShareId ? "Edit shareholding" : "New shareholding"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Capture the allotment details for this member's shareholding record.
          </Typography>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <FieldLabel>Beneficiary</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    fullWidth
                    label="Select member"
                    value={shareForm.memberId}
                    onChange={(e) => syncMemberData(e.target.value)}
                  >
                    {members.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name} ({m.clientNo})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <FieldLabel color="secondary.main">Share details</FieldLabel>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Quantity"
                    value={shareForm.totalShareHold}
                    onChange={(e) =>
                      setShareForm((prev: ShareholdingRecord) => ({
                        ...prev,
                        totalShareHold: Number(e.target.value),
                        totalShareVal: Number(e.target.value) * prev.nominalVal
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Nominal value"
                    value={shareForm.nominalVal}
                    onChange={(e) =>
                      setShareForm((prev: ShareholdingRecord) => ({
                        ...prev,
                        nominalVal: Number(e.target.value),
                        totalShareVal: Number(e.target.value) * prev.totalShareHold
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={shareForm.shareholderType}
                    onChange={(e) =>
                      setShareForm((prev: ShareholdingRecord) => ({
                        ...prev,
                        shareholderType: e.target.value as ShareholdingType
                      }))
                    }
                  >
                    <MenuItem value="shareholder">Regular shareholder</MenuItem>
                    <MenuItem value="shareTransferee">Share transferee</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Allotted date"
                    value={shareForm.allottedDate}
                    onChange={(e) =>
                      setShareForm((prev: ShareholdingRecord) => ({ ...prev, allottedDate: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ p: 4, bgcolor: alpha("#0f172a", 0.03), borderRadius: 1, border: "1px solid rgba(15, 23, 42, 0.05)" }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: "0.1em", display: "block", mb: 1 }}>
                COMPUTED VALUE
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 1000, color: "#0f172a", letterSpacing: "-0.04em" }}>
                Rs {((shareForm.totalShareHold || 0) * (shareForm.nominalVal || 0)).toLocaleString("en-IN")}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={isInvalid}
              onClick={onSave}
              sx={{ py: 2, borderRadius: 2, fontWeight: 900, bgcolor: "#0f172a", textTransform: "none" }}
            >
              {editingShareId ? "Update shareholding" : "Create shareholding"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
