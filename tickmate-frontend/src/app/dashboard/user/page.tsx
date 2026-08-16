"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { getApiErrorMessage, ticketApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
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

interface RecentTicket {
  id: number;
  title: string;
  status: "pending" | "in_progress" | "completed";
  priority?: "low" | "medium" | "high";
  createdAt?: string;
}

const RECENT_TICKETS_LIMIT = 5;

export default function UserDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const statsRes = await ticketApi.getTicketStats();

        const summary = statsRes.summary;
        const tickets = statsRes.tickets;

        const recent = Array.isArray(tickets)
          ? [...tickets]
              .sort(
                (a, b) =>
                  Date.parse(String(b.createdAt ?? "")) -
                  Date.parse(String(a.createdAt ?? "")),
              )
              .slice(0, RECENT_TICKETS_LIMIT)
          : [];
        setRecentTickets(recent);

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

      <DashboardHeader title="User Dashboard" />

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

        {recentTickets.length > 0 && (
          <Card className="mt-8 border-primary/10">
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Your most recently created tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between gap-4 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString()
                        : "Created recently"}
                      {ticket.priority
                        ? ` · ${ticket.priority} priority`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={
                      ticket.status === "completed"
                        ? "text-xs font-medium text-green-600 dark:text-green-400"
                        : ticket.status === "in_progress"
                          ? "text-xs font-medium text-blue-600 dark:text-blue-400"
                          : "text-xs font-medium text-yellow-600 dark:text-yellow-400"
                    }
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
