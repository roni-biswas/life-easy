import AdminDashboard from "@/components/admin/AdminDashboard";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrative controls and user financial monitoring system.",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") redirect("/user");
  // In a real app, check if session.user.role === 'admin'
  // If not, redirect('/user')

  return (
    <main>
      <AdminDashboard />
    </main>
  );
}
