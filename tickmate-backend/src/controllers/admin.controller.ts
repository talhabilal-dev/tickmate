import db from "../config/db.config.js";
import { and, desc, eq, ilike, isNull, ne, sql } from "drizzle-orm";
import { aiUsageLogsTable, auditLogsTable, usersTable, ticketsTable } from "../models/model.js";
import { sendError, sendSuccess, sendZodValidationError } from "../utils/response.utils.js";
import type { Request, Response } from "express";
import { usersListResponseSchema } from "../schemas/user-response.schema.js";
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  loginSchema,
} from "../schemas/user.schema.js";
import { adminCreateTicketSchema } from "../schemas/ticket.schema.js";
import { deleteTicketSchema } from "../schemas/ticket.schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
import {
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} from "../utils/cookie.utils.js";
import { logAuditEventFromRequest } from "../utils/audit-log.utils.js";
import {
  deleteTicketVector,
  upsertResolvedPublicTicketVector,
} from "../utils/vector-db.utils.js";


export const adminLogin = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  const validation = loginSchema.safeParse({ identifier, password });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    const [admin] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, identifier));

    if (!admin || admin.role !== "admin") {
      return sendError(res, 401, {
        message: "Invalid admin credentials",
      });
    }

    const isPasswordValid = await argon2.verify(admin.password, password);

    if (!isPasswordValid) {
      return sendError(res, 401, {
        message: "Invalid admin credentials",
      });
    }

    if (!admin.isActive) {
      return sendError(res, 401, {
        message: "Admin is not active",
      });
    }

    if (!ENV.JWT_SECRET) {
      return sendError(res, 500, {
        message: "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: admin.id.toString(),
        role: admin.role,
        isActive: admin.isActive,
      },
      ENV.JWT_SECRET,
      { expiresIn: "12h" }
    );

    await db
      .update(usersTable)
      .set({ loginTime: new Date() })
      .where(eq(usersTable.id, admin.id));

    res.cookie("token", token, getAuthCookieOptions(12 * 60 * 60 * 1000));

    await logAuditEventFromRequest(req, {
      action: "login",
      entityType: "auth",
      actorUserId: admin.id,
      targetUserId: admin.id,
      description: "Admin logged in",
      metadata: {
        role: admin.role,
      },
    });

    return sendSuccess(res, 200, {
      message: "Admin logged in successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in admin login:", error.message);
    } else {
      console.error("Error in admin login:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const adminLogout = async (req: Request, res: Response) => {

  try {

    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const actorUserId = Number(req.user.userId);
    await logAuditEventFromRequest(req, {
      action: "logout",
      entityType: "auth",
      actorUserId: Number.isInteger(actorUserId) ? actorUserId : null,
      targetUserId: Number.isInteger(actorUserId) ? actorUserId : null,
      description: "Admin logged out",
      metadata: {
        role: req.user.role,
      },
    });

    res.clearCookie("token", getClearAuthCookieOptions());

    return sendSuccess(res, 200, {
      message: "Admin logged out successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in admin logout:", error.message);
    } else {
      console.error("Error in admin logout:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        skills: usersTable.skills,
        isActive: usersTable.isActive,
        loginTime: usersTable.loginTime,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(ne(usersTable.role, "admin"))
      .orderBy(desc(usersTable.createdAt));

    const validation = usersListResponseSchema.safeParse({
      message: "Users fetched successfully",
      users,
    });

    if (!validation.success) {
      return sendZodValidationError(res, validation.error.issues);
    }

    return sendSuccess(res, 200, {
      message: validation.data.message,
      users: validation.data.users,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
    } else {
      console.error("Error fetching users:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const createUserByAdmin = async (req: Request, res: Response) => {
  const { name, username, email, password, skills = [], role = "user" } = req.body;

  const validation = adminCreateUserSchema.safeParse({
    name,
    username,
    email,
    password,
    skills,
    role,
  });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const [existingUser] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser) {
      return sendError(res, 409, {
        message: "Email already exists",
      });
    }

    const [existingUsername] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username));

    if (existingUsername) {
      return sendError(res, 409, {
        message: "Username already exists",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        username,
        email,
        password: hashedPassword,
        skills,
        role,
        isActive: true,
      })
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        skills: usersTable.skills,
        isActive: usersTable.isActive,
        loginTime: usersTable.loginTime,
        createdAt: usersTable.createdAt,
      });

    if (!newUser) {
      return sendError(res, 500, {
        message: "Failed to create user",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "user_created",
      entityType: "user",
      entityId: newUser.id,
      targetUserId: newUser.id,
      description: "Admin created a new user",
      metadata: {
        role: newUser.role,
        createdByRole: "admin",
      },
    });

    return sendSuccess(res, 201, {
      message: "User created by admin successfully",
      user: newUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating user by admin:", error.message);
    } else {
      console.error("Error creating user by admin:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const getAllTickets = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const parsedPage = Number(req.query.page ?? 1);
    const parsedPageSize = Number(req.query.pageSize ?? 10);

    const page = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;
    const pageSize = Number.isFinite(parsedPageSize)
      ? Math.min(100, Math.max(5, Math.floor(parsedPageSize)))
      : 10;

    const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const rawCategory = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const rawStatus = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const rawPriority = typeof req.query.priority === "string" ? req.query.priority.trim() : "";

    const allowedStatuses = ["pending", "in_progress", "completed"] as const;
    const allowedPriorities = ["low", "medium", "high"] as const;

    if (rawStatus && !allowedStatuses.includes(rawStatus as (typeof allowedStatuses)[number])) {
      return sendError(res, 400, {
        message: "Invalid status filter",
      });
    }

    if (rawPriority && !allowedPriorities.includes(rawPriority as (typeof allowedPriorities)[number])) {
      return sendError(res, 400, {
        message: "Invalid priority filter",
      });
    }

    const conditions = [isNull(ticketsTable.deletedAt)];

    if (rawStatus) {
      conditions.push(eq(ticketsTable.status, rawStatus as (typeof allowedStatuses)[number]));
    }

    if (rawPriority) {
      conditions.push(eq(ticketsTable.priority, rawPriority as (typeof allowedPriorities)[number]));
    }

    if (rawCategory) {
      conditions.push(ilike(ticketsTable.category, `%${rawCategory}%`));
    }

    if (rawSearch) {
      conditions.push(
        sql`(
          ${ticketsTable.title} ilike ${`%${rawSearch}%`}
          or ${ticketsTable.description} ilike ${`%${rawSearch}%`}
          or ${ticketsTable.category} ilike ${`%${rawSearch}%`}
        )`
      );
    }

    const whereClause = and(...conditions);

    const [countRow] = await db
      .select({ total: sql<number>`count(*)` })
      .from(ticketsTable)
      .where(whereClause);

    const total = Number(countRow?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const offset = (currentPage - 1) * pageSize;

    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(whereClause)
      .orderBy(desc(ticketsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    return sendSuccess(res, 200, {
      message: "Tickets fetched successfully",
      tickets,
      pagination: {
        page: currentPage,
        pageSize,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching tickets:", error.message);
    } else {
      console.error("Error fetching tickets:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const getAiUsage = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const parsedLimit = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 200)
      : 50;

    const rawUserId = req.query.userId;
    const parsedUserId =
      typeof rawUserId === "string" && rawUserId.trim() !== ""
        ? Number(rawUserId)
        : undefined;

    if (typeof parsedUserId !== "undefined" && (!Number.isInteger(parsedUserId) || parsedUserId <= 0)) {
      return sendError(res, 400, {
        message: "userId must be a positive integer",
      });
    }

    const usageFilter =
      typeof parsedUserId === "number"
        ? eq(aiUsageLogsTable.userId, parsedUserId)
        : undefined;

    const [summary] = await db
      .select({
        totalRequests: sql<number>`count(*)`,
        totalPromptTokens: sql<number>`coalesce(sum(${aiUsageLogsTable.promptTokens}), 0)`,
        totalCompletionTokens: sql<number>`coalesce(sum(${aiUsageLogsTable.completionTokens}), 0)`,
        totalTokens: sql<number>`coalesce(sum(${aiUsageLogsTable.totalTokens}), 0)`,
        totalCacheHits: sql<number>`coalesce(sum(case when ${aiUsageLogsTable.isCacheHit} then 1 else 0 end), 0)`,
        totalErrors: sql<number>`coalesce(sum(case when ${aiUsageLogsTable.status} = 'error' then 1 else 0 end), 0)`,
      })
      .from(aiUsageLogsTable)
      .where(usageFilter);

    const logs = await db
      .select({
        id: aiUsageLogsTable.id,
        userId: aiUsageLogsTable.userId,
        userName: usersTable.name,
        userEmail: usersTable.email,
        ticketId: aiUsageLogsTable.ticketId,
        operation: aiUsageLogsTable.operation,
        provider: aiUsageLogsTable.provider,
        modelName: aiUsageLogsTable.modelName,
        requestId: aiUsageLogsTable.requestId,
        promptTokens: aiUsageLogsTable.promptTokens,
        completionTokens: aiUsageLogsTable.completionTokens,
        totalTokens: aiUsageLogsTable.totalTokens,
        cachedPromptTokens: aiUsageLogsTable.cachedPromptTokens,
        isCacheHit: aiUsageLogsTable.isCacheHit,
        status: aiUsageLogsTable.status,
        errorMessage: aiUsageLogsTable.errorMessage,
        metadata: aiUsageLogsTable.metadata,
        createdAt: aiUsageLogsTable.createdAt,
      })
      .from(aiUsageLogsTable)
      .leftJoin(usersTable, eq(aiUsageLogsTable.userId, usersTable.id))
      .where(usageFilter)
      .orderBy(desc(aiUsageLogsTable.createdAt))
      .limit(limit);

    return sendSuccess(res, 200, {
      message: "AI usage fetched successfully",
      summary: {
        totalRequests: Number(summary?.totalRequests ?? 0),
        totalPromptTokens: Number(summary?.totalPromptTokens ?? 0),
        totalCompletionTokens: Number(summary?.totalCompletionTokens ?? 0),
        totalTokens: Number(summary?.totalTokens ?? 0),
        totalCacheHits: Number(summary?.totalCacheHits ?? 0),
        totalErrors: Number(summary?.totalErrors ?? 0),
      },
      logs,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching AI usage:", error.message);
    } else {
      console.error("Error fetching AI usage:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const parsedPage = Number(req.query.page ?? 1);
    const parsedPageSize = Number(req.query.pageSize ?? 20);

    const page = Number.isFinite(parsedPage) ? Math.max(1, Math.floor(parsedPage)) : 1;
    const pageSize = Number.isFinite(parsedPageSize)
      ? Math.min(100, Math.max(10, Math.floor(parsedPageSize)))
      : 20;

    const offset = (page - 1) * pageSize;

    const [countRow] = await db
      .select({ total: sql<number>`count(*)` })
      .from(auditLogsTable);

    const total = Number(countRow?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const logs = await db
      .select({
        id: auditLogsTable.id,
        action: auditLogsTable.action,
        entityType: auditLogsTable.entityType,
        entityId: auditLogsTable.entityId,
        actorUserId: auditLogsTable.actorUserId,
        actorName: sql<string | null>`(
          select ${usersTable.name}
          from ${usersTable}
          where ${usersTable.id} = ${auditLogsTable.actorUserId}
          limit 1
        )`,
        targetUserId: auditLogsTable.targetUserId,
        targetName: sql<string | null>`(
          select ${usersTable.name}
          from ${usersTable}
          where ${usersTable.id} = ${auditLogsTable.targetUserId}
          limit 1
        )`,
        ticketId: auditLogsTable.ticketId,
        assignedFromUserId: auditLogsTable.assignedFromUserId,
        assignedFromName: sql<string | null>`(
          select ${usersTable.name}
          from ${usersTable}
          where ${usersTable.id} = ${auditLogsTable.assignedFromUserId}
          limit 1
        )`,
        assignedToUserId: auditLogsTable.assignedToUserId,
        assignedToName: sql<string | null>`(
          select ${usersTable.name}
          from ${usersTable}
          where ${usersTable.id} = ${auditLogsTable.assignedToUserId}
          limit 1
        )`,
        description: auditLogsTable.description,
        metadata: auditLogsTable.metadata,
        ipAddress: auditLogsTable.ipAddress,
        userAgent: auditLogsTable.userAgent,
        createdAt: auditLogsTable.createdAt,
      })
      .from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    return sendSuccess(res, 200, {
      message: "Audit logs fetched successfully",
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching audit logs:", error.message);
    } else {
      console.error("Error fetching audit logs:", error);
    }

    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const createTicketByAdmin = async (req: Request, res: Response) => {
  const validation = adminCreateTicketSchema.safeParse(req.body);

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  const {
    title,
    description,
    category,
    assignedTo,
    helpfulNotes,
    priority,
    deadline,
    relatedSkills,
    isPublic,
  } = validation.data;

  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const [moderator] = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, assignedTo));

    if (!moderator) {
      return sendError(res, 404, {
        message: "Assigned user not found",
      });
    }

    if (moderator.role !== "moderator") {
      return sendError(res, 400, {
        message: "Ticket can only be assigned to a moderator",
      });
    }

    if (!moderator.isActive) {
      return sendError(res, 400, {
        message: "Assigned moderator is not active",
      });
    }

    const [newTicket] = await db
      .insert(ticketsTable)
      .values({
        title,
        description,
        category,
        createdBy: Number(req.user.userId),
        assignedTo,
        helpfulNotes,
        priority,
        deadline,
        relatedSkills,
        isPublic,
      })
      .returning();

    if (!newTicket) {
      return sendError(res, 500, {
        message: "Failed to create ticket",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "ticket_created",
      entityType: "ticket",
      entityId: newTicket.id,
      ticketId: newTicket.id,
      targetUserId: assignedTo,
      description: "Admin created ticket",
      metadata: {
        title,
        priority,
        status: newTicket.status,
      },
    });

    await logAuditEventFromRequest(req, {
      action: "ticket_assigned",
      entityType: "ticket",
      entityId: newTicket.id,
      ticketId: newTicket.id,
      assignedFromUserId: null,
      assignedToUserId: assignedTo,
      description: "Ticket assigned by admin during creation",
      metadata: {
        title,
      },
    });

    return sendSuccess(res, 201, {
      message: "Ticket created and assigned to moderator successfully",
      ticket: newTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating ticket by admin:", error.message);
    } else {
      console.error("Error creating ticket by admin:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const { userId } = req.body;
    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      return sendError(res, 400, {
        message: "Valid userId is required",
      });
    }

    const [userToDelete] = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, parsedUserId));

    if (!userToDelete) {
      return sendError(res, 404, {
        message: "User not found",
      });
    }

    const [deletedUser] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, parsedUserId))
      .returning({ id: usersTable.id });

    if (!deletedUser) {
      return sendError(res, 404, {
        message: "User not found",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "user_deleted",
      entityType: "user",
      entityId: parsedUserId,
      targetUserId: parsedUserId,
      description: "Admin deleted a user",
      metadata: {
        deletedRole: userToDelete.role,
        wasActive: userToDelete.isActive,
      },
    });

    return sendSuccess(res, 200, {
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting user:", error.message);
    } else {
      console.error("Error deleting user:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const admin = req.user;
    if (!admin || admin.role !== "admin") {
      return sendError(res, 403, { message: "Access denied" });
    }

    const [adminProfile] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        skills: usersTable.skills,
        isActive: usersTable.isActive,
        loginTime: usersTable.loginTime,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, Number(admin.userId)));

    if (!adminProfile) {
      return sendError(res, 404, { message: "Admin profile not found" });
    }

    if (!adminProfile.isActive) {
      return sendError(res, 403, { message: "Admin is not active" });
    }

    const [users, tickets] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          email: usersTable.email,
          role: usersTable.role,
          skills: usersTable.skills,
          isActive: usersTable.isActive,
          loginTime: usersTable.loginTime,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt)),
      db
        .select()
        .from(ticketsTable)
        .where(isNull(ticketsTable.deletedAt))
        .orderBy(desc(ticketsTable.createdAt)),
    ]);

    const inProgressCount = tickets.filter((ticket) => ticket.status === "in_progress").length;
    const completedCount = tickets.filter((ticket) => ticket.status === "completed").length;
    const activeUsersCount = users.filter((user) => user.isActive).length;

    return sendSuccess(res, 200, {
      adminProfile: adminProfile,
      users,
      tickets,
      stats: {
        totalUsers: users.length,
        totalTickets: tickets.length,
        inProgressTickets: inProgressCount,
        completedTickets: completedCount,
        activeUsers: activeUsersCount,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Dashboard Error:", error.message);
    } else {
      console.error("Dashboard Error:", error);
    }
    return sendError(res, 500, { message: "Server error loading dashboard" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const validation = adminUpdateUserSchema.safeParse(req.body);

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  const { _id, userId, role, isActive } = validation.data;

  if (!req.user || req.user.role !== "admin") {
    return sendError(res, 403, {
      message: "Forbidden: Admins only",
    });
  }

  try {
    const parsedUserId = Number(_id ?? userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      return sendError(res, 400, {
        message: "Valid userId is required",
      });
    }

    const [existingUser] = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, parsedUserId));

    if (!existingUser) {
      return sendError(res, 404, {
        message: "User not found",
      });
    }

    const updateData: Partial<{
      name: string;
      username: string;
      email: string;
      skills: string[];
      role: "user" | "moderator" | "admin";
      isActive: boolean;
    }> = {};

    if (typeof role !== "undefined") updateData.role = role;
    if (typeof isActive !== "undefined") updateData.isActive = isActive;

    const [updatedUser] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, parsedUserId))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        skills: usersTable.skills,
        isActive: usersTable.isActive,
        loginTime: usersTable.loginTime,
        createdAt: usersTable.createdAt,
      });

    if (!updatedUser) {
      return sendError(res, 404, {
        message: "User not found",
      });
    }

    if (typeof role !== "undefined" && role !== existingUser.role) {
      await logAuditEventFromRequest(req, {
        action: "user_role_updated",
        entityType: "user",
        entityId: parsedUserId,
        targetUserId: parsedUserId,
        description: "Admin updated user role",
        metadata: {
          oldRole: existingUser.role,
          newRole: role,
        },
      });
    }

    if (typeof isActive !== "undefined" && isActive !== existingUser.isActive) {
      await logAuditEventFromRequest(req, {
        action: "user_status_updated",
        entityType: "user",
        entityId: parsedUserId,
        targetUserId: parsedUserId,
        description: "Admin updated user active status",
        metadata: {
          oldIsActive: existingUser.isActive,
          newIsActive: isActive,
        },
      });
    }

    return sendSuccess(res, 200, {
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating user:", error.message);
    } else {
      console.error("Error updating user:", error);
    }
    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const toggleTicketStatusByAdmin = async (req: Request, res: Response) => {
  const validation = deleteTicketSchema.safeParse(req.body);

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  const { ticketId } = validation.data;

  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const [existingTicket] = await db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        status: ticketsTable.status,
        createdBy: ticketsTable.createdBy,
        isPublic: ticketsTable.isPublic,
      })
      .from(ticketsTable)
      .where(and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)));

    if (!existingTicket) {
      return sendError(res, 404, {
        message: "Ticket not found",
      });
    }

    const newStatus = existingTicket.status === "completed" ? "pending" : "completed";

    const [updatedTicket] = await db
      .update(ticketsTable)
      .set({
        status: newStatus,
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
      action: newStatus === "completed" ? "ticket_completed" : "ticket_updated",
      entityType: "ticket",
      entityId: updatedTicket.id,
      ticketId: updatedTicket.id,
      targetUserId: updatedTicket.createdBy,
      description: "Admin toggled ticket status",
      metadata: {
        title: existingTicket.title,
        oldStatus: existingTicket.status,
        newStatus,
      },
    });

    try {
      if (updatedTicket.status === "completed" && updatedTicket.isPublic) {
        await upsertResolvedPublicTicketVector(updatedTicket);
      } else {
        await deleteTicketVector(updatedTicket.id);
      }
    } catch (vectorError) {
      if (vectorError instanceof Error) {
        console.error("Vector sync failed after admin status toggle:", vectorError.message);
      } else {
        console.error("Vector sync failed after admin status toggle:", vectorError);
      }
    }

    return sendSuccess(res, 200, {
      message: "Ticket status updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error toggling ticket status by admin:", error.message);
    } else {
      console.error("Error toggling ticket status by admin:", error);
    }

    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};

export const deleteTicketByAdmin = async (req: Request, res: Response) => {
  const validation = deleteTicketSchema.safeParse(req.body);

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  const { ticketId } = validation.data;

  try {
    if (!req.user || req.user.role !== "admin") {
      return sendError(res, 403, {
        message: "Forbidden: Admins only",
      });
    }

    const [existingTicket] = await db
      .select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        status: ticketsTable.status,
        createdBy: ticketsTable.createdBy,
      })
      .from(ticketsTable)
      .where(and(eq(ticketsTable.id, ticketId), isNull(ticketsTable.deletedAt)));

    if (!existingTicket) {
      return sendError(res, 404, {
        message: "Ticket not found",
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
      });

    if (!deletedTicket) {
      return sendError(res, 500, {
        message: "Failed to delete ticket",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "ticket_deleted",
      entityType: "ticket",
      entityId: existingTicket.id,
      ticketId: existingTicket.id,
      targetUserId: existingTicket.createdBy,
      description: "Admin deleted ticket",
      metadata: {
        title: existingTicket.title,
        status: existingTicket.status,
      },
    });

    try {
      await deleteTicketVector(existingTicket.id);
    } catch (vectorError) {
      if (vectorError instanceof Error) {
        console.error("Vector delete failed after admin ticket deletion:", vectorError.message);
      } else {
        console.error("Vector delete failed after admin ticket deletion:", vectorError);
      }
    }

    return sendSuccess(res, 200, {
      message: "Ticket deleted successfully",
      ticket: deletedTicket,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting ticket by admin:", error.message);
    } else {
      console.error("Error deleting ticket by admin:", error);
    }

    return sendError(res, 500, {
      message: "Internal Server Error",
    });
  }
};
