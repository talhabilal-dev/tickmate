"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import Link from "next/link";
import { adminApi, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Users, BarChart3, AlertCircle, Ticket } from "lucide-react";

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalTickets: number;
  inProgressTickets: number;
  completedTickets: number;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<{
    stats: DashboardStats;
    tickets: Array<{ status: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stats = useMemo(() => {
    const current = dashboard?.stats;
    return {
      totalUsers: current?.totalUsers ?? 0,
      activeUsers: current?.activeUsers ?? 0,
      totalTickets: current?.totalTickets ?? 0,
      inProgressTickets: current?.inProgressTickets ?? 0,
      completedTickets: current?.completedTickets ?? 0,
    };
  }, [dashboard]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getDashboard();
        setDashboard(response);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessage(error, "Failed to load dashboard"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [toast]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-ai opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-ai-reverse opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <DashboardHeader
        title="Admin Control Panel"
        subtitle="Manage system and users"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Admin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Users Management Card */}
          <Card className="border-primary/20 shadow-md ai-glow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">User Management</CardTitle>
                <div className="w-10 h-10 rounded-full gradient-ai flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and manage all users
              </p>
              <Button className="w-full ai-button" size="sm" asChild>
                <Link href="/dashboard/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="border-primary/20 shadow-md ai-glow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Analytics</CardTitle>
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-secondary to-primary flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View system analytics and reports
              </p>
              <Button className="w-full ai-button" size="sm" asChild>
                <Link href="/dashboard/admin/ai-usage">View AI Usage</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Management Card */}
          <Card className="border-primary/20 shadow-md ai-glow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ticket Management</CardTitle>
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-secondary flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Toggle ticket status and delete tickets
              </p>
              <Button className="w-full ai-button" size="sm" asChild>
                <Link href="/dashboard/admin/tickets">Manage Tickets</Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Logs Card */}
          <Card className="border-primary/20 shadow-md ai-glow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">System Logs</CardTitle>
                <div className="w-10 h-10 rounded-full gradient-ai flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View system logs and events
              </p>
              <Button className="w-full ai-button" size="sm" asChild>
                <Link href="/dashboard/admin/logs">View Logs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Stats Section */}
        <div>
          <h3 className="text-xl font-bold mb-6">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: "Total Users", value: String(stats.totalUsers) },
              { label: "Active Users", value: String(stats.activeUsers) },
              { label: "Total Tickets", value: String(stats.totalTickets) },
              {
                label: "In Progress",
                value: String(stats.inProgressTickets),
              },
              { label: "Completed", value: String(stats.completedTickets) },
            ].map((stat) => (
              <Card key={stat.label} className="border-primary/10">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gradient-ai">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground mt-10">
            Loading overview stats...
          </p>
        )}
      </main>
    </div>
  );
}
