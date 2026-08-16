"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  FileClock,
  Sparkles,
  Ticket,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminNavItems = [
  {
    title: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "AI Usage",
    href: "/dashboard/admin/ai-usage",
    icon: Bot,
  },
  {
    title: "User Management",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Ticket Management",
    href: "/dashboard/admin/tickets",
    icon: Ticket,
  },
  {
    title: "Logs",
    href: "/dashboard/admin/logs",
    icon: FileClock,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="rounded-lg border border-sidebar-border px-3 py-2">
          <p className="text-sm font-semibold">TickMate</p>
          <p className="text-xs text-sidebar-foreground/70">Admin Dashboard</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isItemActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-xs text-sidebar-foreground/80">
          <Sparkles className="size-4" />
          <span>Ctrl/Cmd + B to toggle</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
