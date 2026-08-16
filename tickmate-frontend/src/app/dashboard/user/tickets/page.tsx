"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";
import { EditTicketDialog } from "@/components/tickets/edit-ticket-dialog";
import { TicketCard } from "@/components/tickets/ticket-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authApi, getApiErrorMessage, ticketApi, userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TicketResponse } from "@/lib/schemas";
import { AlertCircle, LogOut } from "lucide-react";

export default function UserTicketsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<TicketResponse[]>([]);
  const [isModerator, setIsModerator] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "assigned">("my");
  const [isLoading, setIsLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<TicketResponse | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [completingTicketId, setCompletingTicketId] = useState<number | null>(
    null,
  );
  const [replyingTicketId, setReplyingTicketId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const [profileRes, ticketsRes] = await Promise.all([
          userApi.getProfile(),
          ticketApi.getMyTickets(),
        ]);

        const role = profileRes?.user?.role;
        const canSeeAssigned = role === "moderator";

        setIsModerator(canSeeAssigned);
        setTickets(Array.isArray(ticketsRes.tickets) ? ticketsRes.tickets : []);

        if (canSeeAssigned) {
          const assignedRes = await ticketApi.getAssignedTickets();
          setAssignedTickets(
            Array.isArray(assignedRes.tickets) ? assignedRes.tickets : [],
          );
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: getApiErrorMessage(error, "Failed to load tickets"),
          variant: "destructive",
        });

        if (error.response?.status === 401) {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
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

  const handleTicketCreated = (newTicket: TicketResponse) => {
    setTickets([newTicket, ...tickets]);
  };

  const handleEditTicket = (ticket: TicketResponse) => {
    setEditingTicket(ticket);
    setShowEditDialog(true);
  };

  const handleTicketUpdated = (updatedTicket: TicketResponse) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
    );
    setAssignedTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
    );
    setEditingTicket(null);
    setShowEditDialog(false);
  };

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await ticketApi.deleteTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setAssignedTickets((prev) => prev.filter((t) => t.id !== ticketId));
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to delete ticket"),
        variant: "destructive",
      });
    }
  };

  const handleMarkCompleted = async (ticketId: number) => {
    try {
      setCompletingTicketId(ticketId);
      const response = await ticketApi.markTicketCompleted(ticketId);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? response.ticket : ticket,
        ),
      );
      setAssignedTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? response.ticket : ticket,
        ),
      );
      toast({
        title: "Success",
        description: "Ticket marked as completed",
      });
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
      setCompletingTicketId(null);
    }
  };

  const handleReplyTicket = async (ticketId: number, message: string) => {
    try {
      setReplyingTicketId(ticketId);
      const response = await ticketApi.replyToTicket({ ticketId, message });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? response.ticket : ticket,
        ),
      );
      setAssignedTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? response.ticket : ticket,
        ),
      );
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to send reply"),
        variant: "destructive",
      });
    } finally {
      setReplyingTicketId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full gradient-ai mx-auto mb-4 animate-pulse"></div>
          <p className="text-muted-foreground">Loading your tickets...</p>
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
                My Tickets
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
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as "my" | "assigned")
          }
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="my">My Tickets</TabsTrigger>
              {isModerator && (
                <TabsTrigger value="assigned">Assigned Tickets</TabsTrigger>
              )}
            </TabsList>
            {activeTab === "my" && (
              <CreateTicketDialog
                onTicketCreated={handleTicketCreated}
                triggerClassName="w-full sm:w-auto"
              />
            )}
          </div>

          <TabsContent value="my" className="space-y-6">
            {tickets.length === 0 ? (
              <Card className="border-primary/10">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full gradient-ai/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">No tickets yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first ticket to get help and share your ideas
                    with the community
                  </p>
                  <CreateTicketDialog
                    onTicketCreated={handleTicketCreated}
                    triggerClassName="w-full sm:w-auto"
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onEdit={handleEditTicket}
                    onDelete={handleDeleteTicket}
                    onMarkCompleted={handleMarkCompleted}
                    isCompleting={completingTicketId === ticket.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {isModerator && (
            <TabsContent value="assigned" className="space-y-6">
              {assignedTickets.length === 0 ? (
                <Card className="border-primary/10">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full gradient-ai/10 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No assigned tickets
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tickets assigned to you will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {assignedTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onReply={handleReplyTicket}
                      isCompleting={replyingTicketId === ticket.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {editingTicket && (
          <EditTicketDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            ticket={editingTicket}
            onTicketUpdated={handleTicketUpdated}
          />
        )}
      </main>
    </div>
  );
}
