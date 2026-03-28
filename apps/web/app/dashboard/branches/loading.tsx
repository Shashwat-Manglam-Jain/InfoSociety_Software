import { AdminWorkspaceSkeleton } from "@/components/ui/admin-workspace-skeleton";

export default function Loading() {
  return (
    <AdminWorkspaceSkeleton
      title="Branches Management"
      description="Configure branch locations, service flags, and routing details for the current society workspace."
      variant="branches"
    />
  );
}
