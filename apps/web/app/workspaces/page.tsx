import type { Metadata } from "next";
import { WorkspacesOverviewContent } from "@/features/roles/components/workspaces-overview-content";

export const metadata: Metadata = {
  title: "Workspaces",
  description: "Compare client, agent operations, society administration, and platform governance workspaces for the Infopath platform.",
  alternates: {
    canonical: "/workspaces"
  }
};

export default function WorkspacesPage() {
  return <WorkspacesOverviewContent />;
}
