"use client";

import { SocietyMaster } from "./SocietyMaster";
import { DashboardOverview } from "./DashboardOverview";
import { BranchInfrastructure } from "./BranchInfrastructure";

import { TeamOperations } from "./TeamOperations";
import { TreasuryAudit } from "./TreasuryAudit";
import { FieldOperatives } from "./FieldOperatives";

export type AdminView = 
  | "overview"
  | "master_company" 
  | "master_branches" 

  | "directory" 
  | "treasury_audit"
  | "promoter_agents";

export type MainAdministrationWorkspaceProps = {
  view: AdminView;
  societyForm: any;
  setSocietyForm: (v: any) => void;
  handleUpdateSociety: () => void;
  handleOpenWorkspace: () => void;
  formLoading: boolean;
  branches: any[];
  handleOpenDrawer: (type: any, data?: any) => void;
  handleDeleteBranch: (id: string) => void;

  managedUsers: any[];
  userSearch: string;
  setUserSearch: (v: string) => void;
  handleToggleUserStatus: (id: string, current: boolean) => void;
  setSelectedUserAccess: (user: any) => void;
  handleEditUser: (user: any) => void;
  handleDeleteUser: (user: any) => void;
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
};

export function MainAdministrationWorkspace(props: MainAdministrationWorkspaceProps) {
  const { view } = props;

  switch (view) {
    case "overview":
      return (
        <DashboardOverview
          societyForm={props.societyForm}
          transactions={props.transactions}
          agents={props.agents}
          managedUsers={props.managedUsers}
        />
      );

    case "master_company":
      return (
        <SocietyMaster 
          societyForm={props.societyForm} 
          setSocietyForm={props.setSocietyForm} 
          handleUpdateSociety={props.handleUpdateSociety} 
          handleOpenWorkspace={props.handleOpenWorkspace}
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



    case "directory":
      return (
        <TeamOperations 
          managedUsers={props.managedUsers} 
          userSearch={props.userSearch} 
          setUserSearch={props.setUserSearch} 
          handleOpenDrawer={props.handleOpenDrawer} 
          handleToggleUserStatus={props.handleToggleUserStatus} 
          setSelectedUserAccess={props.setSelectedUserAccess} 
          handleEditUser={props.handleEditUser}
          handleDeleteUser={props.handleDeleteUser}
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

    default:
      return null;
  }
}
