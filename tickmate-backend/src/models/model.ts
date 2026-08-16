import { sql } from "drizzle-orm";
import {
    boolean,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    integer,
    varchar,
    index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "moderator", "admin"]);
export const ticketStatusEnum = pgEnum("ticket_status", [
    "pending",
    "in_progress",
    "completed",
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", [
    "low",
    "medium",
    "high",
]);
export const magicLinkPurposeEnum = pgEnum("magic_link_purpose", [
    "email_verification",
    "password_reset",
    "password_change",
]);
export const aiUsageStatusEnum = pgEnum("ai_usage_status", [
    "success",
    "error",
    "cache_hit",
]);
export const auditActionEnum = pgEnum("audit_action", [
    "login",
    "logout",
    "user_created",
    "user_deleted",
    "user_role_updated",
    "user_status_updated",
    "ticket_created",
    "ticket_updated",
    "ticket_assigned",
    "ticket_completed",
    "ticket_deleted",
]);
export const auditEntityTypeEnum = pgEnum("audit_entity_type", [
    "auth",
    "user",
    "ticket",
]);

export const usersTable = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    loginTime: timestamp("login_time", { withTimezone: true })
        .defaultNow()
        .notNull(),
    password: text("password").notNull(),
    role: userRoleEnum("role").default("user").notNull(),
    skills: text("skills").array().default(sql`'{}'`).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    isActive: boolean("is_active").default(false).notNull(),
});

type TicketReply = {
    message: string | null;
    createdAt: string | null;
    createdBy: string | null;
};

export const ticketsTable = pgTable("tickets", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: ticketStatusEnum("status").default("pending").notNull(),
    category: varchar("category", { length: 255 }).notNull(),
    priority: ticketPriorityEnum("priority").default("medium").notNull(),
    deadline: timestamp("deadline", { withTimezone: true }),
    helpfulNotes: text("helpful_notes"),
    isPublic: boolean("is_public").default(true).notNull(),
    relatedSkills: text("related_skills").array().default(sql`'{}'`).notNull(),
    replies: jsonb("replies").$type<TicketReply[]>().default(sql`'[]'::jsonb`).notNull(),
    createdBy: integer("created_by").references(() => usersTable.id),
    assignedTo: integer("assigned_to").references(() => usersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const magicLinksTable = pgTable("magic_links", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
        .references(() => usersTable.id)
        .notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    purpose: magicLinkPurposeEnum("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const aiUsageLogsTable = pgTable("ai_usage_logs", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => usersTable.id),
    ticketId: integer("ticket_id").references(() => ticketsTable.id),
    operation: varchar("operation", { length: 100 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    modelName: varchar("model_name", { length: 100 }).notNull(),
    requestId: varchar("request_id", { length: 150 }),
    promptTokens: integer("prompt_tokens").default(0).notNull(),
    completionTokens: integer("completion_tokens").default(0).notNull(),
    totalTokens: integer("total_tokens").default(0).notNull(),
    cachedPromptTokens: integer("cached_prompt_tokens").default(0).notNull(),
    isCacheHit: boolean("is_cache_hit").default(false).notNull(),
    status: aiUsageStatusEnum("status").default("success").notNull(),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export const auditLogsTable = pgTable("audit_logs", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    action: auditActionEnum("action").notNull(),
    entityType: auditEntityTypeEnum("entity_type").notNull(),
    entityId: integer("entity_id"),
    actorUserId: integer("actor_user_id").references(() => usersTable.id),
    targetUserId: integer("target_user_id").references(() => usersTable.id),
    ticketId: integer("ticket_id").references(() => ticketsTable.id),
    assignedFromUserId: integer("assigned_from_user_id").references(() => usersTable.id),
    assignedToUserId: integer("assigned_to_user_id").references(() => usersTable.id),
    description: text("description"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("idx_audit_logs_created_at").on(table.createdAt),
    actionCreatedAtIdx: index("idx_audit_logs_action_created_at").on(table.action, table.createdAt),
    actorCreatedAtIdx: index("idx_audit_logs_actor_created_at").on(table.actorUserId, table.createdAt),
    targetUserCreatedAtIdx: index("idx_audit_logs_target_user_created_at").on(table.targetUserId, table.createdAt),
    ticketCreatedAtIdx: index("idx_audit_logs_ticket_created_at").on(table.ticketId, table.createdAt),
    assignedToCreatedAtIdx: index("idx_audit_logs_assigned_to_created_at").on(table.assignedToUserId, table.createdAt),
}));
