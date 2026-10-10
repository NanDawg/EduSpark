import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { getCurrentUser } from "@/features/auth/user";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <AppNav user={{ name: user.name, classLevel: user.classLevel }} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}
