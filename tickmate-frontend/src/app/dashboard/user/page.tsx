"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authApi, getApiErrorMessage, ticketApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface TicketStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const statsRes = await ticketApi.getTicketStats();

        const summary = statsRes.summary;
        const tickets = statsRes.tickets;

        if (summary) {
          const total = Number(summary.totalTickets ?? 0);
          const inProgress = Number(summary.inProgress ?? 0);
          const completed = Number(summary.completed ?? 0);
          const pending = Math.max(total - inProgress - completed, 0);

          setTicketStats({
            total,
            pending,
            inProgress,
            completed,
          });
          return;
        }

        // Fallback when summary is not returned.
        const ticketList = Array.isArray(tickets) ? tickets : [];
        setTicketStats({
          total: ticketList.length,
          pending: ticketList.filter((t) => t.status === "pending").length,
          inProgress: ticketList.filter((t) => t.status === "in_progress")
            .length,
          completed: ticketList.filter((t) => t.status === "completed").length,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: getApiErrorMessage(
            error,
            "Failed to load ticket summary",
          ),
          variant: "destructive",
        });

        if (error.response?.status === 401) {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      router.push("/auth/signin");
    } catch (_error) {
      router.push("/auth/signin");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-ai mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">
            Loading your ticket summary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-ai opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-ai-reverse opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <header className="border-b border-primary/10 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gradient-ai">
                User Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Tickets Summary</h2>
          <p className="text-muted-foreground">
            Overview of your ticket progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total</p>
                  <p className="text-3xl font-bold text-gradient-ai">
                    {ticketStats.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-ai/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200/50 dark:border-yellow-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {ticketStats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {ticketStats.inProgress}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200/50 dark:border-green-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Completed
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {ticketStats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-primary/10">
          <CardHeader>
            <CardTitle>Next Step</CardTitle>
            <CardDescription>
              Open the My Tickets tab from the sidebar to manage your tickets.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
