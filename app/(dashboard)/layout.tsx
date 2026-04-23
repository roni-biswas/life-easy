"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from "next/navigation";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // URL path-ke split kore array toiri kora (e.g., /user/statement -> ['user', 'statement'])
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger size={"lg"} className="p-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {/* Home/Dashboard base link */}
                <BreadcrumbItem>
                  <BreadcrumbLink>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>

                {pathSegments.map((segment, index) => {
                  // user/ dashboard-er base hole seta skip korbe jodi Dashboard text thake
                  if (segment === "user" && index === 0) return null;

                  const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                  const isLast = index === pathSegments.length - 1;
                  const title =
                    segment.charAt(0).toUpperCase() + segment.slice(1);

                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>

        {/* Dashboard Content */}
        <main className="p-6 bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
