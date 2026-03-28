import type { Metadata } from "next";
import { WorkspaceRoleContent } from "@/features/roles/components/workspace-role-content";
import { createWorkspaceMetadata } from "@/features/roles/workspace-metadata";

export const metadata: Metadata = createWorkspaceMetadata("society-admin");
export const dynamic = "force-dynamic";

export default function SocietyAdminWorkspacePage() {
  return <WorkspaceRoleContent role="society-admin" />;
}
