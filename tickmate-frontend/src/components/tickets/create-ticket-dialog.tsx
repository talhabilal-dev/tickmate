"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z, ZodAny, ZodSchema } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, ticketApi } from "@/lib/api";
import {
  createTicketSchema,
  CreateTicketData,
  TicketResponse,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Plus, Search, CheckCircle2, AlertCircle } from "lucide-react";

interface CreateTicketDialogProps {
  onTicketCreated?: (ticket: TicketResponse) => void;
  triggerClassName?: string;
  prefill?: {
    title?: string;
    description?: string;
    category?: string;
    relatedSkills?: string[];
  };
  prefillNonce?: number;
}

type CreateTicketFormData = z.input<typeof createTicketSchema>;

export function CreateTicketDialog({
  onTicketCreated,
  triggerClassName,
  prefill,
  prefillNonce,
}: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"search" | "create">("search");
  const [similarTickets, setSimilarTickets] = useState<TicketResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema as any),
    mode: "onChange",
  });

  const title = watch("title");
  const description = watch("description");
  const category = watch("category");

  useEffect(() => {
    if (!prefill || typeof prefillNonce === "undefined") {
      return;
    }

    if (prefill.title) {
      setValue("title", prefill.title, { shouldValidate: true });
    }

    if (prefill.description) {
      setValue("description", prefill.description, { shouldValidate: true });
    }

    if (prefill.category) {
      setValue("category", prefill.category, { shouldValidate: true });
    }

    if (prefill.relatedSkills && prefill.relatedSkills.length > 0) {
      setValue("relatedSkills", prefill.relatedSkills, {
        shouldValidate: true,
      });
    }

    setOpen(true);
    setStep("create");
  }, [prefill, prefillNonce, setValue]);

  const handleSearchSimilar = async () => {
    if (!title || !description) {
      toast({
        title: "Error",
        description: "Please enter title and description",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const response = await ticketApi.searchSimilarTickets({
        title,
        description,
        category,
        limit: 5,
      });
      setSimilarTickets(response.tickets || []);
    } catch (error: any) {
      console.log("[v0] Search similar tickets error:", error);
      toast({
        title: "Error",
        description: getApiErrorMessage(
          error,
          "Failed to search similar tickets",
        ),
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (data: CreateTicketFormData) => {
    try {
      setIsCreating(true);
      const payload = createTicketSchema.parse(data);
      const response = await ticketApi.createTicket(payload);
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
      onTicketCreated?.(response.ticket);
      setOpen(false);
      setStep("search");
      reset();
      setSimilarTickets([]);
    } catch (error: any) {
      console.log("[v0] Create ticket error:", error);
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to create ticket"),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSkipToCreate = () => {
    setStep("create");
  };

  const handleBackToSearch = () => {
    setStep("search");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("ai-button font-semibold", triggerClassName)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "search" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-gradient-ai">
                Search Similar Tickets
              </DialogTitle>
              <DialogDescription>
                Let us help you find existing solutions before creating a new
                ticket
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Ticket Title</label>
                <Input
                  placeholder="e.g., How to integrate authentication"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Textarea
                  placeholder="Describe your issue or question in detail..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Category (Optional)
                </label>
                <Input
                  placeholder="e.g., Feature Request, Bug, Question"
                  {...register("category")}
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearchSimilar}
                disabled={isSearching || !title || !description}
                className="w-full"
                variant="outline"
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? "Searching..." : "Search Similar Tickets"}
              </Button>

              {/* Similar Tickets Results */}
              {similarTickets.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold">
                    Found {similarTickets.length} Similar Ticket(s)
                  </h3>
                  {similarTickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="border-primary/10 cursor-default"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-sm">
                              {ticket.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Category: {ticket.category} • Status:{" "}
                              {ticket.status}
                            </CardDescription>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {ticket.description.substring(0, 150)}...
                      </CardContent>
                    </Card>
                  ))}

                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          Found what you need?
                        </p>
                        <p className="text-green-800 dark:text-green-200 mt-1">
                          Click on a ticket above to view the discussion, or
                          create a new ticket if your issue is different.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isSearching === false &&
                title &&
                description &&
                similarTickets.length === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          No similar tickets found
                        </p>
                        <p className="text-blue-800 dark:text-blue-200 mt-1">
                          Your issue seems unique. Let's create a new ticket for
                          you.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSkipToCreate}
                  className="flex-1 ai-button"
                  disabled={!title || !description}
                >
                  Create New Ticket
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-gradient-ai">
                Create a New Ticket
              </DialogTitle>
              <DialogDescription>
                Provide details about your issue or request
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Title *</label>
                <Input
                  placeholder="Brief title of your issue"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Description *</label>
                <Textarea
                  placeholder="Provide detailed description..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Category and Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Category *</label>
                  <Input
                    placeholder="e.g., Bug, Feature, Question"
                    {...register("category")}
                  />
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Priority</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("priority", {
                      setValueAs: (value) => value || undefined,
                    })}
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Deadline (Optional)
                </label>
                <Input
                  type="date"
                  {...register("deadline", {
                    setValueAs: (value) => value || undefined,
                  })}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Related Skills (Optional)
                </label>
                <Input
                  placeholder="Comma-separated skills"
                  {...register("relatedSkills", {
                    setValueAs: (value) => {
                      if (!value) return undefined;

                      return String(value)
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean);
                    },
                  })}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToSearch}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !isValid}
                  className="flex-1 ai-button"
                >
                  {isCreating ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
