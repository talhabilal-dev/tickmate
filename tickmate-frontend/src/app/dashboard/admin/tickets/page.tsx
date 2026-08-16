"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, authApi, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Search, Trash2, RefreshCw } from "lucide-react";
import type { TicketResponse } from "@/lib/schemas";

type AdminTicket = TicketResponse & {
  assignedTo: number | null;
};

type TicketsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type StatusFilter = "all" | "pending" | "in_progress" | "completed";
type PriorityFilter = "all" | "low" | "medium" | "high";

const statusStyles: Record<AdminTicket["status"], string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
};

const priorityStyles: Record<AdminTicket["priority"], string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  medium:
    "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<TicketsPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<number | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await adminApi.getTickets({
        page,
        pageSize,
        search: searchTerm || undefined,
        category: categoryFilter.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
      });

      setTickets(Array.isArray(response.tickets) ? response.tickets : []);

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to load tickets"),
        variant: "destructive",
      });

      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        router.push("/auth/signin");
      }

      if (
        (error as { response?: { status?: number } })?.response?.status === 403
      ) {
        router.push("/auth/signin");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    categoryFilter,
    page,
    pageSize,
    priorityFilter,
    router,
    searchTerm,
    statusFilter,
    toast,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [searchInput]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push("/auth/signin");
    } catch (_error) {
      router.push("/auth/signin");
    }
  };

  const handleToggleStatus = async (ticketId: number) => {
    try {
      setUpdatingTicketId(ticketId);
      const response = await adminApi.toggleTicketStatus(ticketId);
      setTickets((previousTickets) =>
        previousTickets.map((ticket) =>
          ticket.id === ticketId ? response.ticket : ticket,
        ),
      );

      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });

      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(
          error,
          "Failed to update ticket status",
        ),
        variant: "destructive",
      });
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      setDeletingTicketId(ticketId);
      await adminApi.deleteTicket(ticketId);

      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });

      const isLastTicketOnPage = tickets.length === 1 && page > 1;

      if (isLastTicketOnPage) {
        setPage((previousPage) => previousPage - 1);
      } else {
        fetchTickets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to delete ticket"),
        variant: "destructive",
      });
    } finally {
      setDeletingTicketId(null);
    }
  };

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
                Ticket Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Toggle ticket status and remove invalid tickets
              </p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-6">
        <Card className="border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
              <div className="space-y-2 md:col-span-2 xl:col-span-2">
                <Label htmlFor="ticket-search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ticket-search"
                    value={searchInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchInput(event.target.value)
                    }
                    placeholder="Title, description, category"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-1 xl:col-span-1">
                <Label htmlFor="ticket-category">Category</Label>
                <Input
                  id="ticket-category"
                  value={categoryFilter}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCategoryFilter(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Feature, Bug..."
                />
              </div>

              <div className="space-y-2 md:col-span-1 xl:col-span-1">
                <Label>Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: StatusFilter) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1 xl:col-span-1">
                <Label>Priority</Label>
                <Select
                  value={priorityFilter}
                  onValueChange={(value: PriorityFilter) => {
                    setPriorityFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1 xl:col-span-1">
                <Label>Page Size</Label>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value: string) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                  setCategoryFilter("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading tickets...
              </p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket) => {
                  const isUpdating = updatingTicketId === ticket.id;
                  const isDeleting = deletingTicketId === ticket.id;
                  const isCompleted = ticket.status === "completed";

                  return (
                    <Card
                      key={ticket.id}
                      className="border-primary/10 min-w-0 overflow-hidden"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="text-base wrap-break-word">
                              {ticket.title}
                            </CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Ticket #{ticket.id} | Category: {ticket.category}
                            </p>
                          </div>
                          <div className="flex flex-wrap justify-end gap-2 shrink-0">
                            <Badge className={statusStyles[ticket.status]}>
                              {ticket.status.replace("_", " ")}
                            </Badge>
                            <Badge className={priorityStyles[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {ticket.description}
                        </p>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Created by user #{ticket.createdBy}</p>
                          <p>
                            Assigned to:{" "}
                            {ticket.assignedTo
                              ? `user #${ticket.assignedTo}`
                              : "Unassigned"}
                          </p>
                          <p>
                            Created:{" "}
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleToggleStatus(ticket.id)}
                            disabled={isUpdating || isDeleting}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isUpdating
                              ? "Updating..."
                              : isCompleted
                                ? "Mark Pending"
                                : "Mark Completed"}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                disabled={isUpdating || isDeleting}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isDeleting ? "Deleting..." : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete this ticket?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone and will remove "
                                  {ticket.title}" from active tickets.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTicket(ticket.id)}
                                >
                                  Delete Ticket
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} |{" "}
                {pagination.total} total tickets
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((currentPage) => Math.max(1, currentPage - 1))
                  }
                  disabled={isLoading || !pagination.hasPreviousPage}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={isLoading || !pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
