import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/auth/server-session";
import { SocietyUserManagementView } from "@/features/society/components/society-user-management-view";

export const dynamic = "force-dynamic";

export default async function SocietyUsersPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.accountType !== "SOCIETY") {
    redirect("/login");
  }

  return <SocietyUserManagementView />;
}
