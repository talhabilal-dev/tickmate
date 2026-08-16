"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreateTicketDialog } from "@/components/tickets/create-ticket-dialog";
import { TicketCard } from "@/components/tickets/ticket-card";
import { authApi, getApiErrorMessage, ticketApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TicketResponse } from "@/lib/schemas";
import { AlertCircle, LogOut, Search } from "lucide-react";

export default function PublicTicketsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [similarTickets, setSimilarTickets] = useState<TicketResponse[]>([]);
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false);
  const [prefillTicket, setPrefillTicket] = useState<{
    title?: string;
    description?: string;
    category?: string;
    relatedSkills?: string[];
  } | null>(null);
  const [prefillNonce, setPrefillNonce] = useState(0);

  const fetchTickets = async (filters?: {
    category?: string;
    skills?: string[];
  }) => {
    try {
      setIsLoading(true);
      const response = await ticketApi.getPublicCompletedTickets(filters);
      setTickets(Array.isArray(response.tickets) ? response.tickets : []);
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to load public tickets"),
        variant: "destructive",
      });

      // Keep existing auth redirect behavior.
      if ((error as any)?.response?.status === 401) {
        router.push("/auth/signin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(tickets.map((ticket) => ticket.category))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [tickets]);

  const applyFilters = () => {
    const parsedSkills = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const filters: { category?: string; skills?: string[] } = {};

    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    if (parsedSkills.length > 0) {
      filters.skills = parsedSkills;
    }

    fetchTickets(filters);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSkillsInput("");
    fetchTickets();
  };

  const handleSearchByDescription = async () => {
    if (!searchDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description to search similar tickets",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearchingSimilar(true);
      const queryText = searchDescription.trim();
      const response = await ticketApi.searchSimilarTickets({
        title: queryText.slice(0, 80),
        description: queryText,
        limit: 5,
      });

      if(!response.tickets || response.tickets.length === 0) {
        toast({
          title: "No Similar Tickets Found",
          description: "Try adjusting your description to find related tickets.",
        });
      }

      setSimilarTickets(
        Array.isArray(response.tickets) ? response.tickets : [],
      );
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(
          error,
          "Failed to search similar tickets",
        ),
        variant: "destructive",
      });
    } finally {
      setIsSearchingSimilar(false);
    }
  };

  const handleClearSimilarSearch = () => {
    setSearchDescription("");
    setSimilarTickets([]);
  };

  const handleCreateFromSimilar = (ticket: TicketResponse) => {
    setPrefillTicket({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      relatedSkills: ticket.relatedSkills,
    });
    setPrefillNonce((value) => value + 1);
  };

  const handleTicketCreated = () => {
    toast({
      title: "Success",
      description: "Ticket created from selected template",
    });
  };

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
            Loading public completed tickets...
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
                Public Completed Tickets
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-6">
        <Card className="border-primary/10">
          <CardContent className="pt-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">
                Search Similar Tickets By Description
              </p>
              <CreateTicketDialog
                onTicketCreated={handleTicketCreated}
                triggerClassName="w-full sm:w-auto"
                prefill={prefillTicket ?? undefined}
                prefillNonce={prefillNonce}
              />
            </div>
            <Textarea
              placeholder="Describe your issue or question to find related completed public tickets"
              value={searchDescription}
              onChange={(event) => setSearchDescription(event.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSearchByDescription}
                disabled={isSearchingSimilar}
                variant="outline"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearchingSimilar ? "Searching..." : "Find Similar"}
              </Button>
              <Button variant="ghost" onClick={handleClearSimilarSearch}>
                Clear
              </Button>
            </div>

            {similarTickets.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-sm font-semibold">Similar Tickets</p>
                <div className="space-y-2">
                  {similarTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-md border border-primary/10 p-3"
                    >
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Category: {ticket.category} • Status: {ticket.status}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleCreateFromSimilar(ticket)}
                      >
                        Create from this
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="category-filter">Category</Label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills-filter">Skills</Label>
                <Input
                  id="skills-filter"
                  placeholder="Comma-separated skills (e.g. React, Node, API)"
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                />
              </div>

              <div className="flex gap-2 md:col-span-3">
                <Button onClick={applyFilters} className="ai-button">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {tickets.length === 0 ? (
          <Card className="border-primary/10">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full gradient-ai/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground mb-2">
                No public completed tickets found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting category or skills filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
