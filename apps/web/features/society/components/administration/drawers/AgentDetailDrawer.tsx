"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { AdministrationAgentDetails } from "@/shared/api/administration";

type AgentDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  agent: AdministrationAgentDetails | null;
  branchName?: string;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    isActive: boolean;
  }) => void;
};

type AgentFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isActive: boolean;
};

const emptyForm: AgentFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  isActive: true
};

export function AgentDetailDrawer({
  open,
  onClose,
  loading,
  agent,
  branchName,
  onSave
}: AgentDetailDrawerProps) {
  const [form, setForm] = useState<AgentFormState>(emptyForm);

  useEffect(() => {
    if (!agent) {
      setForm(emptyForm);
      return;
    }

    setForm({
      firstName: agent.firstName ?? "",
      lastName: agent.lastName ?? "",
      phone: agent.phone ?? "",
      email: agent.email ?? "",
      isActive: agent.user?.isActive ?? true
    });
  }, [agent]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 560 } }
      }}
    >
      <Box sx={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
        <Box sx={{ borderBottom: "1px solid rgba(15, 23, 42, 0.08)", px: 3, py: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Agent details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review profile details, activity, and assigned members.
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={3} sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
          {loading && !agent ? (
            <Typography variant="body2" color="text.secondary">
              Loading agent details...
            </Typography>
          ) : !agent ? (
            <Typography variant="body2" color="text.secondary">
              Agent details are unavailable right now.
            </Typography>
          ) : (
            <>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {[agent.firstName, agent.lastName].filter(Boolean).join(" ")}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip label={agent.customerCode} size="small" />
                  <Chip label={branchName ?? "Head office"} size="small" variant="outlined" />
                  <Chip
                    label={form.isActive ? "Active" : "Inactive"}
                    size="small"
                    color={form.isActive ? "success" : "default"}
                    variant={form.isActive ? "filled" : "outlined"}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Username: @{agent.user?.username ?? "unlinked"}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="First name"
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Last name"
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip label={`Today: INR ${Math.round(agent.performance?.daily ?? 0).toLocaleString("en-IN")}`} size="small" />
                <Chip
                  label={`Month: INR ${Math.round(agent.performance?.monthly ?? 0).toLocaleString("en-IN")}`}
                  size="small"
                />
                <Chip label={`${agent.pigmyClients?.length ?? 0} assigned members`} size="small" />
              </Stack>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Assigned members
                </Typography>
                <List dense disablePadding sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 2 }}>
                  {agent.pigmyClients?.length ? (
                    agent.pigmyClients.map((assignment, index) => (
                      <ListItem
                        key={assignment.id}
                        divider={index < agent.pigmyClients!.length - 1}
                        sx={{ py: 1.25, px: 2 }}
                      >
                        <ListItemText
                          primary={`${assignment.customer.firstName} ${assignment.customer.lastName ?? ""}`.trim()}
                          secondary={assignment.customer.customerCode}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem sx={{ py: 1.25, px: 2 }}>
                      <ListItemText primary="No members assigned yet." secondary="Mappings will appear here once created." />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading || !form.firstName.trim()}
                  onClick={() => onSave(form)}
                  sx={{ borderRadius: 2.5, py: 1.4, fontWeight: 800 }}
                >
                  Save agent
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
