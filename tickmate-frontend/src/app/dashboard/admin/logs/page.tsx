"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, authApi, getApiErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut } from "lucide-react";

type AuditLogRow = {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  actorUserId: number | null;
  actorName: string | null;
  targetUserId: number | null;
  targetName: string | null;
  ticketId: number | null;
  assignedFromUserId: number | null;
  assignedFromName: string | null;
  assignedToUserId: number | null;
  assignedToName: string | null;
  description: string | null;
  createdAt: string;
};

export default function AdminLogsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const formatDate = (value: string) => new Date(value).toLocaleDateString();
  const formatTime = (value: string) => new Date(value).toLocaleTimeString();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push("/auth/signin");
    } catch (_error) {
      router.push("/auth/signin");
    }
  };

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);

        const response = await adminApi.getAuditLogs({
          page,
          pageSize,
        });

        setLogs(Array.isArray(response.logs) ? response.logs : []);
        setTotal(response.pagination?.total ?? 0);
        setTotalPages(response.pagination?.totalPages ?? 1);
        setHasNextPage(Boolean(response.pagination?.hasNextPage));
        setHasPreviousPage(Boolean(response.pagination?.hasPreviousPage));
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessage(error, "Failed to load audit logs"),
          variant: "destructive",
        });

        if (
          (error as any)?.response?.status === 401 ||
          (error as any)?.response?.status === 403
        ) {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [page, pageSize, router, toast]);

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
                Admin Logs
              </h1>
              <p className="text-sm text-muted-foreground">
                Paginated activity history of admin and system actions
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
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Audit Logs</CardTitle>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <label
                className="text-sm text-muted-foreground"
                htmlFor="pageSize"
              >
                Rows per page
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No logs found.</p>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {logs.map((log) => {
                    const actor = `${log.actorName ?? "System"}${log.actorUserId ? ` (ID ${log.actorUserId})` : ""}`;
                    const target = `${log.targetName ?? "N/A"}${log.targetUserId ? ` (ID ${log.targetUserId})` : ""}${log.ticketId ? ` | Ticket #${log.ticketId}` : ""}`;
                    const assignment =
                      log.assignedFromUserId || log.assignedToUserId
                        ? `${log.assignedFromName ?? "Unassigned"} -> ${log.assignedToName ?? "Unassigned"}`
                        : "N/A";

                    return (
                      <div
                        key={log.id}
                        className="rounded-lg border border-primary/10 bg-background/70 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="shrink-0 text-xs text-muted-foreground">
                            {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                          </p>
                        </div>
                        <dl className="space-y-1 text-sm">
                          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 px-3 py-1.5">
                            <dt className="text-muted-foreground">Entity</dt>
                            <dd className="text-right wrap-break-word leading-snug">
                              {log.entityType}
                              {log.entityId ? ` #${log.entityId}` : ""}
                            </dd>
                          </div>
                          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 px-3 py-1.5">
                            <dt className="text-muted-foreground">By</dt>
                            <dd className="text-right wrap-break-word leading-snug">{actor}</dd>
                          </div>
                          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 px-3 py-1.5">
                            <dt className="text-muted-foreground">Target</dt>
                            <dd className="text-right wrap-break-word leading-snug">{target}</dd>
                          </div>
                          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 px-3 py-1.5">
                            <dt className="text-muted-foreground">Assignment</dt>
                            <dd className="text-right wrap-break-word leading-snug">{assignment}</dd>
                          </div>
                          <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 px-3 py-1.5">
                            <dt className="text-muted-foreground">Description</dt>
                            <dd className="text-right wrap-break-word leading-snug">
                              {log.description ?? "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block">
                  <Table className="table-fixed min-w-245">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[16%]">Time</TableHead>
                        <TableHead className="w-[10%]">Action</TableHead>
                        <TableHead className="w-[8%]">Entity</TableHead>
                        <TableHead className="w-[13%]">By</TableHead>
                        <TableHead className="w-[17%]">Target</TableHead>
                        <TableHead className="w-[17%]">Assignment</TableHead>
                        <TableHead className="w-[19%]">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="align-top">
                            <div className="leading-tight">
                              <p className="whitespace-nowrap">
                                {formatDate(log.createdAt)}
                              </p>
                              <p className="whitespace-nowrap text-xs text-muted-foreground">
                                {formatTime(log.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium whitespace-normal wrap-break-word align-top">
                            <p className="line-clamp-2" title={log.action}>
                              {log.action}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-normal wrap-break-word align-top">
                            {log.entityType}
                            {log.entityId ? ` #${log.entityId}` : ""}
                          </TableCell>
                          <TableCell className="whitespace-normal wrap-break-word align-top">
                            <p
                              className="line-clamp-2"
                              title={`${log.actorName ?? "System"}${log.actorUserId ? ` (ID ${log.actorUserId})` : ""}`}
                            >
                              {log.actorName ?? "System"}
                              {log.actorUserId ? ` (ID ${log.actorUserId})` : ""}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-normal wrap-break-word align-top">
                            <p
                              className="line-clamp-2"
                              title={`${log.targetName ?? "N/A"}${log.targetUserId ? ` (ID ${log.targetUserId})` : ""}${log.ticketId ? ` | Ticket #${log.ticketId}` : ""}`}
                            >
                              {log.targetName ?? "N/A"}
                              {log.targetUserId ? ` (ID ${log.targetUserId})` : ""}
                              {log.ticketId ? ` | Ticket #${log.ticketId}` : ""}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-normal wrap-break-word align-top">
                            <p
                              className="line-clamp-2"
                              title={
                                log.assignedFromUserId || log.assignedToUserId
                                  ? `${log.assignedFromName ?? "Unassigned"} -> ${log.assignedToName ?? "Unassigned"}`
                                  : "N/A"
                              }
                            >
                              {log.assignedFromUserId || log.assignedToUserId
                                ? `${log.assignedFromName ?? "Unassigned"} -> ${log.assignedToName ?? "Unassigned"}`
                                : "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-normal wrap-break-word align-top">
                            <p
                              className="line-clamp-2"
                              title={log.description ?? "N/A"}
                            >
                              {log.description ?? "N/A"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing page {page} of {totalPages} ({total} total logs)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPreviousPage || isLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage || isLoading}
                  onClick={() => setPage((prev) => prev + 1)}
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
