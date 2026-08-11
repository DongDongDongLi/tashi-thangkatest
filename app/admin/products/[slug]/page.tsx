import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isValidAdminSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  if (!isAdminConfigured()) {
    redirect("/admin/login");
  }
  const jar = await cookies();
  if (!isValidAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <AdminProductForm mode="edit" slug={slug} />
    </div>
  );
}
