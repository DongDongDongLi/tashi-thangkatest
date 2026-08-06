import { redirect } from "next/navigation";
import { isValidAdminSession, ADMIN_COOKIE, isAdminConfigured } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { AdminProductList } from "@/components/admin/AdminProductList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-serif text-3xl text-burgundy">后台未配置</h1>
        <p className="mt-4 text-stone">
          请在 Vercel 环境变量中设置 <code className="text-burgundy">ADMIN_PASSWORD</code>
          ，然后 Redeploy。
        </p>
      </div>
    );
  }

  const jar = await cookies();
  if (!isValidAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <AdminProductList />
    </div>
  );
}
