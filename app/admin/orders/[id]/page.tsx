import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isValidAdminSession,
} from "@/lib/admin-auth";
import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  if (!isAdminConfigured()) {
    redirect("/admin");
  }
  const jar = await cookies();
  if (!isValidAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <AdminOrderDetail orderId={id} />
    </div>
  );
}
