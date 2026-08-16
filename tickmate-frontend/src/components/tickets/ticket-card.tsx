"use client";

import { useState } from "react";
import { TicketResponse } from "@/lib/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Trash2, Edit, Clock, CheckCircle2, Eye } from "lucide-react";

interface TicketCardProps {
  ticket: TicketResponse;
  onEdit?: (ticket: TicketResponse) => void;
  onDelete?: (ticketId: number) => void;
  onMarkCompleted?: (ticketId: number) => void;
  onReply?: (ticketId: number, message: string) => Promise<void> | void;
  isCompleting?: boolean;
}

type TicketReplyItem = {
  message: string;
  createdAt: string;
  createdBy: string | number;
};

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  medium:
    "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onMarkCompleted,
  onReply,
  isCompleting = false,
}: TicketCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const deadlineDate = ticket.deadline ? new Date(ticket.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date();
  const isCompleted = ticket.status === "completed";
  const replies = Array.isArray((ticket as any).replies)
    ? ((ticket as any).replies as TicketReplyItem[])
    : [];

  const handleReply = async () => {
    const message = replyMessage.trim();
    if (!onReply || !message) return;

    try {
      setIsReplying(true);
      await onReply(ticket.id, message);
      setReplyMessage("");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <>
      <Card className="border-primary/10 hover:border-primary/20 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base">{ticket.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Category: {ticket.category}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(true)}
                aria-label="Show ticket details"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {onEdit && !isCompleted && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(ticket)}
                  aria-label="Edit ticket"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete "{ticket.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(ticket.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {ticket.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[ticket.status]}>
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge className={priorityColors[ticket.priority]}>
              {ticket.priority}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {ticket.relatedSkills.length > 0 && (
              <div className="flex gap-1">
                {ticket.relatedSkills.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {ticket.relatedSkills.length > 2 && (
                  <span>+{ticket.relatedSkills.length - 2}</span>
                )}
              </div>
            )}

            {deadlineDate && (
              <div className="flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                <span className={isOverdue ? "text-red-500" : ""}>
                  {deadlineDate.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(true)}
              className={onMarkCompleted ? "flex-1" : "w-full"}
            >
              Show
            </Button>
            {onMarkCompleted && (
              <Button
                type="button"
                size="sm"
                onClick={() => onMarkCompleted(ticket.id)}
                disabled={isCompleted || isCompleting}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isCompleted
                  ? "Completed"
                  : isCompleting
                    ? "Updating..."
                    : "Mark Completed"}
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground pt-1">
            Created {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ticket.title}</DialogTitle>
            <DialogDescription>Full ticket details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="mt-1 whitespace-pre-wrap wrap-break-word">
                {ticket.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p>{ticket.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Priority</p>
                <p>{ticket.priority}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p>{ticket.status.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Deadline</p>
                <p>
                  {deadlineDate ? deadlineDate.toLocaleDateString() : "Not set"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Related Skills</p>
              <p>
                {ticket.relatedSkills.length
                  ? ticket.relatedSkills.join(", ")
                  : "None"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Helpful Notes</p>
              <p className="mt-1 whitespace-pre-wrap wrap-break-word">
                {ticket.helpfulNotes || "None"}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Replies</p>
              {replies.length === 0 ? (
                <p className="mt-1">No replies yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {replies.map((reply, index) => (
                    <div
                      key={`${reply.createdAt}-${index}`}
                      className="rounded-md border p-2"
                    >
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {reply.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleString()} by{" "}
                        {reply.createdBy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {onReply && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-muted-foreground">Add Reply</p>
                <Textarea
                  placeholder="Write a reply..."
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  rows={3}
                  disabled={isCompleted || isReplying}
                />
                <Button
                  type="button"
                  onClick={handleReply}
                  disabled={isCompleted || isReplying || !replyMessage.trim()}
                >
                  {isReplying
                    ? "Sending..."
                    : isCompleted
                      ? "Closed"
                      : "Send Reply"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
