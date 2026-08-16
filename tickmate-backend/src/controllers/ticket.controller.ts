import type { Request, Response } from "express";
import { inngest } from "../inngest/client.js";
import { usersTable, ticketsTable } from "../models/model.js";
import db from "../config/db.config.js";
import { and, desc, eq, gte, isNull, lt } from "drizzle-orm";
import {
  sendError,
  sendSuccess,
  sendZodValidationError,
} from "../utils/response.utils.js";
import {
  createTicketSchema,
  deleteTicketSchema,
  editTicketSchema,
  publicCompletedTicketsFilterSchema,
  similarTicketSearchSchema,
  ticketReplySchema,
} from "../schemas/ticket.schema.js";
import {
  deleteTicketVector,
  searchSimilarResolvedPublicTickets,
  upsertResolvedPublicTicketVector,
} from "../utils/vector-db.utils.js";
import { logAuditEventFromRequest } from "../utils/audit-log.utils.js";

export const getSimilarResolvedTickets = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const validation = similarTicketSearchSchema.safeParse(req.body);

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    const { title, description, category, limit } = validation.data;

    const searchInput: {
      title: string;
      description: string;
      category?: string;
      limit?: number;
    } = {
      title,
      description,
    };

    if (typeof category !== "undefined") {
      searchInput.category = category;
    }

    if (typeof limit !== "undefined") {
      searchInput.limit = limit;
    }

    const similarTickets =
      await searchSimilarResolvedPublicTickets(searchInput);
    const normalizedTickets = similarTickets.map((item) => item.ticket);

    if (normalizedTickets.length === 0) {
      return sendSuccess(res, 200, {
        message: "No similar tickets found",
        tickets: [],
      });
    }

    return sendSuccess(res, 200, {
      message: "Similar tickets fetched successfully",
      tickets: normalizedTickets,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching similar tickets", error.message);
    } else {
      console.error("Error fetching similar tickets", error);
    }

    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, Number(req.user.userId)));

    if (!user) {
      return sendError(res, 401, {
        message: "Unauthorized Access",
      });
    }

    const validation = createTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    const {
      title,
      description,
      category,
      deadline,
      priority,
      relatedSkills,
      helpfulNotes,
      isPublic,
    } = validation.data;

    const [newTicket] = await db
      .insert(ticketsTable)
      .values({
        title,
        description,
        category,
        createdBy: Number(req.user.userId),
        deadline,
        priority,
        relatedSkills,
        helpfulNotes,
        isPublic,
      })
      .returning();

    if (!newTicket) {
      return sendError(res, 500, { message: "Failed to create ticket" });
    }

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket.id.toString(),
        title,
        description,
        createdBy: req.user.userId,
      },
    });

    await logAuditEventFromRequest(req, {
      action: "ticket_created",
      entityType: "ticket",
      entityId: newTicket.id,
      ticketId: newTicket.id,
      targetUserId: newTicket.createdBy,
      description: "Ticket created",
      metadata: {
        title,
        category,
        priority,
      },
    });

    return sendSuccess(res, 201, {
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating ticket", error.message);
    } else {
      console.error("Error creating ticket", error);
    }
    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const userId = Number(req.user.userId);

    if (Number.isNaN(userId)) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const tickets = await db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      })
      .from(ticketsTable)
      .where(
        and(eq(ticketsTable.createdBy, userId), isNull(ticketsTable.deletedAt)),
      )
      .orderBy(desc(ticketsTable.createdAt));

    return sendSuccess(res, 200, {
      message: "Tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching tickets", error.message);
    } else {
      console.error("Error fetching tickets", error);
    }
    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const getPublicCompletedTickets = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const validation = publicCompletedTicketsFilterSchema.safeParse(req.query);

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    const { category, skills } = validation.data;

    let query = db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      })
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.status, "completed"),
          eq(ticketsTable.isPublic, true),
          isNull(ticketsTable.deletedAt),
          typeof category !== "undefined"
            ? eq(ticketsTable.category, category)
            : undefined,
        ),
      )
      .orderBy(desc(ticketsTable.updatedAt));

    let tickets = await query;

    if (skills && skills.length > 0) {
      const normalizedSkills = skills.map((skill) => skill.toLowerCase());
      tickets = tickets.filter((ticket) =>
        ticket.relatedSkills.some((relatedSkill) =>
          normalizedSkills.includes(relatedSkill.toLowerCase()),
        ),
      );
    }

    return sendSuccess(res, 200, {
      message: "Public completed tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching public completed tickets", error.message);
    } else {
      console.error("Error fetching public completed tickets", error);
    }

    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const toggleTicketStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const { id } = req.params;

    const ticketId = Number(id);

    if (!id || Number.isNaN(ticketId)) {
      return sendError(res, 400, {
        message: "Valid ticket id is required",
        errors: [{ field: "id", message: "Valid ticket id is required" }],
      });
    }

    const userId = Number(req.user.userId);

    const [ticket] = await db
      .select({
        id: ticketsTable.id,
        createdBy: ticketsTable.createdBy,
        title: ticketsTable.title,
        status: ticketsTable.status,
      })
      .from(ticketsTable)
      .where(
        and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)),
      );

    if (!ticket) {
      return sendError(res, 404, {
        message: "Ticket not found",
      });
    }

    const canManage = ticket.createdBy === userId;

    if (!canManage) {
      return sendError(res, 403, {
        message: "Only the ticket creator can mark this ticket as completed",
      });
    }

    const [updatedTicket] = await db
      .update(ticketsTable)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticketId))
      .returning({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      });

    if (!updatedTicket) {
      return sendError(res, 500, {
        message: "Failed to update ticket status",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "ticket_completed",
      entityType: "ticket",
      entityId: updatedTicket.id,
      ticketId: updatedTicket.id,
      targetUserId: updatedTicket.createdBy,
      description: "Ticket marked as completed",
      metadata: {
        previousStatus: "pending_or_in_progress",
        newStatus: "completed",
      },
    });

    try {
      if (updatedTicket.isPublic) {
        await upsertResolvedPublicTicketVector(updatedTicket);
      } else {
        await deleteTicketVector(updatedTicket.id);
      }
    } catch (vectorError) {
      if (vectorError instanceof Error) {
        console.error(
          "Vector sync failed after status update:",
          vectorError.message,
        );
      } else {
        console.error("Vector sync failed after status update:", vectorError);
      }
    }

    return sendSuccess(res, 200, {
      message: "Ticket status updated",
      ticket: updatedTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating ticket status", error.message);
    } else {
      console.error("Error updating ticket status", error);
    }

    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const assignedTickets = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const userId = Number(req.user.userId);

    if (Number.isNaN(userId)) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const tickets = await db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      })
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.assignedTo, userId),
          isNull(ticketsTable.deletedAt),
        ),
      )
      .orderBy(desc(ticketsTable.createdAt));

    return sendSuccess(res, 200, {
      message: "Tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching assigned tickets:", error.message);
    } else {
      console.error("Error fetching assigned tickets:", error);
    }

    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const ticketReply = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const validation = ticketReplySchema.safeParse(req.body);

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    const { message, ticketId } = validation.data;
    if (req.user.role !== "moderator" && req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Moderators and Admins only",
      });
    }

    const [ticket] = await db
      .select({
        id: ticketsTable.id,
        status: ticketsTable.status,
        assignedTo: ticketsTable.assignedTo,
        replies: ticketsTable.replies,
      })
      .from(ticketsTable)
      .where(
        and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)),
      );

    if (!ticket) {
      return sendError(res, 404, {
        message: "Ticket not found",
      });
    }

    if (ticket.status === "completed") {
      return sendError(res, 400, {
        message: "Ticket is already closed",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isAssignedModerator =
      ticket.assignedTo && ticket.assignedTo === Number(req.user.userId);

    if (!isAdmin && !isAssignedModerator) {
      return sendError(res, 403, {
        message: "You are not allowed to reply to this ticket",
      });
    }

    const existingReplies = Array.isArray(ticket.replies) ? ticket.replies : [];

    const updatedReplies = [
      ...existingReplies,
      {
        message,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId,
      },
    ];

    const [updatedTicket] = await db
      .update(ticketsTable)
      .set({
        replies: updatedReplies,
        updatedAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticketId))
      .returning({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      });

    if (!updatedTicket) {
      return sendError(res, 500, {
        message: "Failed to update ticket reply",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "ticket_updated",
      entityType: "ticket",
      entityId: updatedTicket.id,
      ticketId: updatedTicket.id,
      targetUserId: updatedTicket.createdBy,
      description: "Ticket reply added",
      metadata: {
        replyBy: req.user.userId,
        replyLength: message.length,
      },
    });

    return sendSuccess(res, 200, {
      message: "Ticket reply updated",
      ticket: updatedTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error replying to ticket:", error.message);
    } else {
      console.error("Error replying to ticket:", error);
    }
    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const getUserTicketSummary = async (req: Request, res: Response) => {
  try {
    const userIdRaw = req.user?.userId;

    if (!userIdRaw) {
      return sendError(res, 401, {
        message: "Unauthorized",
      });
    }

    const userId = Number(userIdRaw);

    if (Number.isNaN(userId)) {
      return sendError(res, 401, {
        message: "Unauthorized",
      });
    }

    const tickets = await db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        assignedTo: ticketsTable.assignedTo,
        priority: ticketsTable.priority,
        createdAt: ticketsTable.createdAt,
        status: ticketsTable.status,
        relatedSkills: ticketsTable.relatedSkills,
      })
      .from(ticketsTable)
      .where(
        and(eq(ticketsTable.createdBy, userId), isNull(ticketsTable.deletedAt)),
      )
      .orderBy(desc(ticketsTable.createdAt));

    // 🔹 Compute current summary
    const totalTickets = tickets.length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const completed = tickets.filter((t) => t.status === "completed").length;

    // 🔹 Define time windows (last 7 days vs previous 7 days)
    const now = new Date();
    const startOfCurrent = new Date();
    startOfCurrent.setDate(now.getDate() - 7);

    const startOfPrevious = new Date();
    startOfPrevious.setDate(now.getDate() - 14);
    const endOfPrevious = new Date();
    endOfPrevious.setDate(now.getDate() - 7);

    const previousTickets = await db
      .select({
        status: ticketsTable.status,
      })
      .from(ticketsTable)
      .where(
        and(
          eq(ticketsTable.createdBy, userId),
          isNull(ticketsTable.deletedAt),
          gte(ticketsTable.createdAt, startOfPrevious),
          lt(ticketsTable.createdAt, endOfPrevious),
        ),
      );

    const previousSummary = {
      totalTickets: previousTickets.length,
      inProgress: previousTickets.filter((t) => t.status === "in_progress")
        .length,
      completed: previousTickets.filter((t) => t.status === "completed").length,
    };

    return sendSuccess(res, 200, {
      message: "User ticket summary fetched successfully",
      summary: {
        totalTickets,
        inProgress,
        completed,
      },
      previousSummary,
      tickets,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user ticket summary:", error.message);
    } else {
      console.error("Error fetching user ticket summary:", error);
    }

    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const validation = deleteTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    const { ticketId } = validation.data;

    const [ticket] = await db
      .select({
        id: ticketsTable.id,
        createdBy: ticketsTable.createdBy,
        title: ticketsTable.title,
        status: ticketsTable.status,
      })
      .from(ticketsTable)
      .where(
        and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)),
      );

    if (!ticket) {
      return sendError(res, 404, {
        message: "Ticket not found",
      });
    }

    const userId = Number(req.user.userId);

    if (ticket.createdBy !== userId && req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "You are not allowed to delete this ticket",
      });
    }

    const [deletedTicket] = await db
      .update(ticketsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)))
      .returning({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      });

    if (!deletedTicket) {
      return sendError(res, 500, {
        message: "Failed to delete ticket",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "ticket_deleted",
      entityType: "ticket",
      entityId: ticket.id,
      ticketId: ticket.id,
      targetUserId: ticket.createdBy,
      description: "Ticket deleted",
      metadata: {
        title: ticket.title,
        status: ticket.status,
      },
    });

    try {
      await deleteTicketVector(deletedTicket.id);
    } catch (vectorError) {
      if (vectorError instanceof Error) {
        console.error(
          "Vector delete failed after ticket deletion:",
          vectorError.message,
        );
      } else {
        console.error(
          "Vector delete failed after ticket deletion:",
          vectorError,
        );
      }
    }

    return sendSuccess(res, 200, {
      message: "Ticket deleted successfully",
      ticket: deletedTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting ticket", error.message);
    } else {
      console.error("Error deleting ticket", error);
    }

    return sendError(res, 500, { message: "Internal Server Error" });
  }
};

export const editTicket = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const validation = editTicketSchema.safeParse(req.body);

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    const {
      ticketId,
      title,
      description,
      category,
      deadline,
      status,
      priority,
      assignedTo,
      helpfulNotes,
      relatedSkills,
      isPublic,
    } = validation.data;

    const [ticket] = await db
      .select({
        id: ticketsTable.id,
        status: ticketsTable.status,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
      })
      .from(ticketsTable)
      .where(
        and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)),
      );

    if (!ticket) {
      return sendError(res, 404, {
        message: "Ticket not found",
      });
    }

    const userId = Number(req.user.userId);

    if (ticket.createdBy !== userId && req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "You are not allowed to edit this ticket",
      });
    }

    if (ticket.status === "completed") {
      return sendError(res, 400, {
        message: "Completed tickets cannot be edited",
      });
    }

    if (typeof assignedTo !== "undefined" && assignedTo !== null) {
      const [assignedUser] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, assignedTo));

      if (!assignedUser) {
        return sendError(res, 404, {
          message: "Assigned user not found",
        });
      }
    }

    const updateData: Partial<{
      title: string;
      description: string;
      category: string;
      deadline: Date | null;
      status: "pending" | "in_progress" | "completed";
      priority: "low" | "medium" | "high";
      assignedTo: number | null;
      helpfulNotes: string | null;
      relatedSkills: string[];
      isPublic: boolean;
      updatedAt: Date;
    }> = {};

    if (typeof title !== "undefined") updateData.title = title;
    if (typeof description !== "undefined")
      updateData.description = description;
    if (typeof category !== "undefined") updateData.category = category;
    if (typeof deadline !== "undefined") updateData.deadline = deadline;
    if (typeof status !== "undefined") updateData.status = status;
    if (typeof priority !== "undefined") updateData.priority = priority;
    if (typeof assignedTo !== "undefined") updateData.assignedTo = assignedTo;
    if (typeof helpfulNotes !== "undefined")
      updateData.helpfulNotes = helpfulNotes;
    if (typeof relatedSkills !== "undefined")
      updateData.relatedSkills = relatedSkills;
    if (typeof isPublic !== "undefined") updateData.isPublic = isPublic;

    if (Object.keys(updateData).length === 0) {
      return sendSuccess(res, 200, {
        message: "No changes were provided",
      });
    }

    updateData.updatedAt = new Date();

    const [updatedTicket] = await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, ticketId))
      .returning({
        id: ticketsTable.id,
        title: ticketsTable.title,
        description: ticketsTable.description,
        status: ticketsTable.status,
        category: ticketsTable.category,
        priority: ticketsTable.priority,
        deadline: ticketsTable.deadline,
        helpfulNotes: ticketsTable.helpfulNotes,
        relatedSkills: ticketsTable.relatedSkills,
        replies: ticketsTable.replies,
        isPublic: ticketsTable.isPublic,
        createdBy: ticketsTable.createdBy,
        assignedTo: ticketsTable.assignedTo,
        createdAt: ticketsTable.createdAt,
        updatedAt: ticketsTable.updatedAt,
      });

    if (!updatedTicket) {
      return sendError(res, 500, {
        message: "Failed to update ticket",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "ticket_updated",
      entityType: "ticket",
      entityId: updatedTicket.id,
      ticketId: updatedTicket.id,
      targetUserId: updatedTicket.createdBy,
      description: "Ticket updated",
      metadata: {
        changedFields: Object.keys(updateData).filter(
          (field) => field !== "updatedAt",
        ),
      },
    });

    if (typeof assignedTo !== "undefined" && assignedTo !== ticket.assignedTo) {
      await logAuditEventFromRequest(req, {
        action: "ticket_assigned",
        entityType: "ticket",
        entityId: updatedTicket.id,
        ticketId: updatedTicket.id,
        assignedFromUserId: ticket.assignedTo,
        assignedToUserId: assignedTo,
        targetUserId: assignedTo,
        description: "Ticket assignee updated",
        metadata: {
          previousAssignedTo: ticket.assignedTo,
          newAssignedTo: assignedTo,
        },
      });
    }

    if (status === "completed" && updatedTicket.status === "completed") {
      await logAuditEventFromRequest(req, {
        action: "ticket_completed",
        entityType: "ticket",
        entityId: updatedTicket.id,
        ticketId: updatedTicket.id,
        targetUserId: updatedTicket.createdBy,
        description: "Ticket marked as completed via edit",
        metadata: {
          previousStatus: ticket.status,
          newStatus: updatedTicket.status,
        },
      });
    }

    return sendSuccess(res, 200, {
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error editing ticket", error.message);
    } else {
      console.error("Error editing ticket", error);
    }

    return sendError(res, 500, { message: "Internal Server Error" });
  }
};
