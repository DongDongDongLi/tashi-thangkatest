import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isValidAdminSession,
} from "@/lib/admin-auth";
import { AdminOrderList } from "@/components/admin/AdminOrderList";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!isAdminConfigured()) {
    redirect("/admin");
  }
  const jar = await cookies();
  if (!isValidAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <AdminOrderList />
    </div>
  );
}
