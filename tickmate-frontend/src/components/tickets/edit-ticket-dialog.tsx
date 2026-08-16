"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, ticketApi } from "@/lib/api";
import {
  editTicketSchema,
  EditTicketData,
  TicketResponse,
} from "@/lib/schemas";

type EditTicketFormData = z.input<typeof editTicketSchema>;

interface EditTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketResponse;
  onTicketUpdated?: (ticket: TicketResponse) => void;
}

export function EditTicketDialog({
  open,
  onOpenChange,
  ticket,
  onTicketUpdated,
}: EditTicketDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const defaultDeadline = ticket.deadline
    ? new Date(ticket.deadline).toISOString().slice(0, 10)
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTicketFormData>({
    resolver: zodResolver(editTicketSchema as any),
    defaultValues: {
      ticketId: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      deadline: defaultDeadline,
      helpfulNotes: ticket.helpfulNotes || "",
      isPublic: ticket.isPublic,
    },
  });

  const onSubmit = async (data: EditTicketFormData) => {
    try {
      setIsUpdating(true);
      const payload: EditTicketData = editTicketSchema.parse(data);
      const response = await ticketApi.updateTicket(payload);
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
      if (response.ticket) {
        onTicketUpdated?.(response.ticket);
      }
      onOpenChange(false);
    } catch (error: any) {
      console.log("[v0] Update ticket error:", error);
      toast({
        title: "Error",
        description: getApiErrorMessage(error, "Failed to update ticket"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-ai">Edit Ticket</DialogTitle>
          <DialogDescription>Update your ticket details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Title</label>
            <Input placeholder="Ticket title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <Textarea
              placeholder="Ticket description"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Category</label>
            <Input placeholder="Category" {...register("category")} />
          </div>

          {/* Priority and Deadline Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Priority</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("priority")}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Deadline</label>
              <Input
                type="date"
                {...register("deadline", {
                  setValueAs: (value) => value || undefined,
                })}
              />
            </div>
          </div>

          {/* Helpful Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Helpful Notes</label>
            <Textarea
              placeholder="Any additional notes..."
              rows={3}
              {...register("helpfulNotes", {
                setValueAs: (value) => value || undefined,
              })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 ai-button"
            >
              {isUpdating ? "Updating..." : "Update Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
