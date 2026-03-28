import { AdminWorkspaceSkeleton } from "@/components/ui/admin-workspace-skeleton";

export default function Loading() {
  return (
    <AdminWorkspaceSkeleton
      title="Society Institutional Master"
      description="Configure central society attributes, compliance identifiers, and billing settings for the current institution."
      variant="society"
    />
  );
}
