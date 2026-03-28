import type { Metadata } from "next";
import { getWorkspaceDefinition, type WorkspaceRoleSlug } from "@/features/roles/workspace-definitions";

export function createWorkspaceMetadata(role: WorkspaceRoleSlug): Metadata {
  const workspace = getWorkspaceDefinition(role);

  if (!workspace) {
    return {
      title: "Workspace Not Found"
    };
  }

  return {
    title: workspace.title,
    description: workspace.subtitle,
    alternates: {
      canonical: workspace.href
    }
  };
}
