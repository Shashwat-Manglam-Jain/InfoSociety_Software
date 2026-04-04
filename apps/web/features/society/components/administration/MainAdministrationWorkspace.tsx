"use client";

import React from "react";
import { Stack, Box, Typography, Paper } from "@mui/material";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { SocietyMaster } from "./SocietyMaster";
import { BranchInfrastructure } from "./BranchInfrastructure";
import { DirectorGovernance } from "./DirectorGovernance";
import { TeamOperations } from "./TeamOperations";
import { TreasuryAudit } from "./TreasuryAudit";
import { FieldOperatives } from "./FieldOperatives";
import { AgentShareholding } from "./AgentShareholding";

export type AdminView = 
  | "overview"
  | "master_company" 
  | "master_branches" 
  | "master_directors" 
  | "directory" 
  | "treasury_audit" 
  | "promoter_agents" 
  | "promoter_shareholding"
  | "logs";

export type MainAdministrationWorkspaceProps = {
  view: AdminView;
  societyForm: any;
  setSocietyForm: (v: any) => void;
  handleUpdateSociety: () => void;
  formLoading: boolean;
  branches: any[];
  handleOpenDrawer: (type: any, data?: any) => void;
  handleDeleteBranch: (id: string) => void;
  directors: any[];
  handleDeleteDirector: (id: string) => void;
  managedUsers: any[];
  userSearch: string;
  setUserSearch: (v: string) => void;
  handleToggleUserStatus: (id: string, current: boolean) => void;
  setSelectedUserAccess: (user: any) => void;
  transactions: any[];
  transactionSearch: string;
  setTransactionSearch: (v: string) => void;
  formatCurrency: (v: number) => string;
  formatDate: (v: string) => string;
  agents: any[];
  agentSearch: string;
  setAgentSearch: (v: string) => void;
  agentPage: number;
  setAgentPage: (p: number) => void;
  agentRowsPerPage: number;
  setAgentRowsPerPage: (r: number) => void;
  setEditingAgent: (agent: any) => void;
  shareholdings: any[];
  shareholdingSearch: string;
  setShareholdingSearch: (v: string) => void;
  shareholdingPage: number;
  setShareholdingPage: (p: number) => void;
  shareholdingRowsPerPage: number;
  setShareholdingRowsPerPage: (r: number) => void;
  setActiveShareholdingDrawer: (v: any) => void;
  setShareholdingForm: (v: any) => void;
  setEditingShareholding: (v: any) => void;
};

export function MainAdministrationWorkspace(props: MainAdministrationWorkspaceProps) {
  const { view } = props;

  switch (view) {
    case "overview":
    case "master_company":
      return (
        <SocietyMaster 
          societyForm={props.societyForm} 
          setSocietyForm={props.setSocietyForm} 
          handleUpdateSociety={props.handleUpdateSociety} 
          formLoading={props.formLoading} 
        />
      );
    
    case "master_branches":
      return (
        <BranchInfrastructure 
          branches={props.branches} 
          handleOpenDrawer={props.handleOpenDrawer} 
          handleDeleteBranch={props.handleDeleteBranch} 
        />
      );

    case "master_directors":
      return (
        <DirectorGovernance 
          directors={props.directors} 
          handleOpenDrawer={props.handleOpenDrawer} 
          handleDeleteDirector={props.handleDeleteDirector} 
        />
      );

    case "directory":
      return (
        <TeamOperations 
          managedUsers={props.managedUsers} 
          userSearch={props.userSearch} 
          setUserSearch={props.setUserSearch} 
          handleOpenDrawer={props.handleOpenDrawer} 
          handleToggleUserStatus={props.handleToggleUserStatus} 
          setSelectedUserAccess={props.setSelectedUserAccess} 
        />
      );

    case "treasury_audit":
      return (
        <TreasuryAudit 
          transactions={props.transactions} 
          transactionSearch={props.transactionSearch} 
          setTransactionSearch={props.setTransactionSearch} 
          formatCurrency={props.formatCurrency} 
          formatDate={props.formatDate} 
        />
      );

    case "promoter_agents":
      return (
        <FieldOperatives 
          agents={props.agents} 
          agentSearch={props.agentSearch} 
          setAgentSearch={props.setAgentSearch} 
          agentPage={props.agentPage} 
          setAgentPage={props.setAgentPage} 
          agentRowsPerPage={props.agentRowsPerPage} 
          setAgentRowsPerPage={props.setAgentRowsPerPage} 
          handleOpenDrawer={props.handleOpenDrawer} 
          setEditingAgent={props.setEditingAgent} 
        />
      );

    case "promoter_shareholding":
      return (
        <AgentShareholding 
          shareholdings={props.shareholdings} 
          shareholdingSearch={props.shareholdingSearch} 
          setShareholdingSearch={props.setShareholdingSearch} 
          shareholdingPage={props.shareholdingPage} 
          setShareholdingPage={props.setShareholdingPage} 
          shareholdingRowsPerPage={props.shareholdingRowsPerPage} 
          setShareholdingRowsPerPage={props.setShareholdingRowsPerPage} 
          setActiveShareholdingDrawer={props.setActiveShareholdingDrawer} 
          setShareholdingForm={props.setShareholdingForm} 
          setEditingShareholding={props.setEditingShareholding} 
        />
      );

    case "logs":
      return (
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
      );

    default:
      return null;
  }
}
