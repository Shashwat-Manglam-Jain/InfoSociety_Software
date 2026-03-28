import type { Metadata } from "next";
import { WorkspaceRoleContent } from "@/features/roles/components/workspace-role-content";
import { createWorkspaceMetadata } from "@/features/roles/workspace-metadata";

export const metadata: Metadata = createWorkspaceMetadata("client");
export const dynamic = "force-dynamic";

export default function ClientWorkspacePage() {
  return <WorkspaceRoleContent role="client" />;
}
