"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  UserCircle,
  Sparkles,
  Globe,
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

const mainNavItems = [
  {
    title: "Overview",
    href: "/dashboard/user",
    icon: LayoutDashboard,
  },
  {
    title: "My Tickets",
    href: "/dashboard/user/tickets",
    icon: Ticket,
  },
  {
    title: "Public Tickets",
    href: "/dashboard/user/public-tickets",
    icon: Globe,
  },
  {
    title: "Profile",
    href: "/dashboard/user/profile",
    icon: UserCircle,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/dashboard/user") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="rounded-lg border border-sidebar-border px-3 py-2">
          <p className="text-sm font-semibold">TickMate</p>
          <p className="text-xs text-sidebar-foreground/70">User Dashboard</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
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
