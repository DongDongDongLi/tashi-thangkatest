import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isValidAdminSession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-burgundy">后台未配置</h1>
        <p className="mt-4 text-stone">
          请设置环境变量 <code className="text-burgundy">ADMIN_PASSWORD</code> 后重新部署。
        </p>
      </div>
    );
  }

  const jar = await cookies();
  if (isValidAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center font-serif text-3xl text-burgundy">管理员登录</h1>
      <p className="mt-2 text-center text-sm text-stone">Tashi Thangka Admin</p>
      <AdminLoginForm />
    </div>
  );
}
