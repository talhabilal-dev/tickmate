import type { Request } from "express";
import db from "../config/db.config.js";
import { auditLogsTable } from "../models/model.js";

type AuditAction =
  | "login"
  | "logout"
  | "user_created"
  | "user_deleted"
  | "user_role_updated"
  | "user_status_updated"
  | "ticket_created"
  | "ticket_updated"
  | "ticket_assigned"
  | "ticket_completed"
  | "ticket_deleted";

type AuditEntityType = "auth" | "user" | "ticket";

type LogAuditPayload = {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: number | null;
  actorUserId?: number | null;
  targetUserId?: number | null;
  ticketId?: number | null;
  assignedFromUserId?: number | null;
  assignedToUserId?: number | null;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

const parseActorIdFromRequest = (req: Request): number | null => {
  const rawUserId = req.user?.userId;
  if (!rawUserId) return null;

  const parsed = Number(rawUserId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const extractIpAddress = (req: Request): string | null => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0]?.trim() ?? null;
  }

  return req.ip ?? null;
};

export const logAuditEvent = async (payload: LogAuditPayload): Promise<void> => {
  try {
    await db.insert(auditLogsTable).values({
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? null,
      actorUserId: payload.actorUserId ?? null,
      targetUserId: payload.targetUserId ?? null,
      ticketId: payload.ticketId ?? null,
      assignedFromUserId: payload.assignedFromUserId ?? null,
      assignedToUserId: payload.assignedToUserId ?? null,
      description: payload.description ?? null,
      metadata: payload.metadata ?? {},
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to write audit log:", error.message);
    } else {
      console.error("Failed to write audit log:", error);
    }
  }
};

export const logAuditEventFromRequest = async (
  req: Request,
  payload: Omit<LogAuditPayload, "actorUserId" | "ipAddress" | "userAgent"> & {
    actorUserId?: number | null;
  }
): Promise<void> => {
  const actorUserId =
    typeof payload.actorUserId === "number" ? payload.actorUserId : parseActorIdFromRequest(req);

  const ipAddress = extractIpAddress(req);
  const userAgent = req.headers["user-agent"] ?? null;

  await logAuditEvent({
    ...payload,
    actorUserId,
    ipAddress,
    userAgent,
  });
};
