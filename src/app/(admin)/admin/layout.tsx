import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only signed-in owners and staff may open the admin area.
  const user = await getCurrentUser();
  if (!user || user.role === "CUSTOMER") redirect("/account");

  return (
    <div className="flex min-h-screen bg-[#f6f3ee]">
      {/* Responsive Sidebar (Desktop fixed / Mobile slide-out) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
