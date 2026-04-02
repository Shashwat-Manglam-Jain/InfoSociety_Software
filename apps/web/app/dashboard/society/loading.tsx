import { AdminWorkspaceSkeleton } from "@/components/ui/admin-workspace-skeleton";

export default function Loading() {
  return (
    <AdminWorkspaceSkeleton
      title="Society Control Centre"
      description="Load the server-rendered society workspace with the module rail, member search, and owner overview."
      variant="society"
    />
  );
}
