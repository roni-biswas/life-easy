"use client";

import {
  LayoutDashboard,
  History,
  PiggyBank,
  FileText,
  User,
  ShieldCheck,
  ChartNoAxesCombined,
  LogOut, // Logout icon
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // signOut import kora hoyeche

const items = [
  { title: "Home", url: "/user", icon: LayoutDashboard },
  { title: "Analytics", url: "/user/analytics", icon: ChartNoAxesCombined },
  { title: "History", url: "/user/history", icon: History },
  { title: "Savings", url: "/user/savings", icon: PiggyBank },
  { title: "Statement", url: "/user/statement", icon: FileText },
];

const adminItems = [{ title: "Admin Panel", url: "/admin", icon: ShieldCheck }];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setOpenMobile } = useSidebar();

  const isAdmin = session?.user?.role === "admin";

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // Logout function
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/auth",
      redirect: true,
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-300 ease-in-out"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 cursor-default">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
            LE
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
            Life Easy
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-2.5">
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} onClick={handleLinkClick}>
                      <item.icon />
                      <span className="text-[18px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Group */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrative</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} onClick={handleLinkClick}>
                        <item.icon />
                        <span className="text-[18px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100">
        <SidebarMenu>
          {/* Profile Link */}
          <SidebarMenuItem className="mb-2.5">
            <SidebarMenuButton asChild isActive={pathname === "/user/profile"}>
              <Link href="/user/profile" onClick={handleLinkClick}>
                <User />
                <span className="text-[18px]">Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut />
              <span className="text-[18px]">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
