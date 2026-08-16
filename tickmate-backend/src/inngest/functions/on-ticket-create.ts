import { inngest } from "../client.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.utils.js";
import analyzeTicket from "../../utils/agent.utils.js";
import db from "../../config/db.config.js";
import { ticketsTable, usersTable } from "../../models/model.js";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { logAuditEvent } from "../../utils/audit-log.utils.js";
import { upsertResolvedPublicTicketVector } from "../../utils/vector-db.utils.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      const parsedTicketId = Number(ticketId);

      if (Number.isNaN(parsedTicketId)) {
        throw new NonRetriableError("Invalid ticket id");
      }

      const ticket = await step.run("fetch-ticket", async () => {
        const [ticketObject] = await db
          .select({
            id: ticketsTable.id,
            title: ticketsTable.title,
            description: ticketsTable.description,
            relatedSkills: ticketsTable.relatedSkills,
            createdBy: ticketsTable.createdBy,
            assignedTo: ticketsTable.assignedTo,
          })
          .from(ticketsTable)
          .where(eq(ticketsTable.id, parsedTicketId));

        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }

        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await db
          .update(ticketsTable)
          .set({
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(ticketsTable.id, ticket.id));
      });

      const aiResponse = await analyzeTicket({
        title: ticket.title,
        description: ticket.description,
        userId: ticket.createdBy,
        ticketId: ticket.id,
      });

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills: string[] = [];

        if (aiResponse) {
          const priority = ["low", "medium", "high"].includes(
            aiResponse.priority
          )
            ? aiResponse.priority
            : "medium";

          const mergedSkills = Array.from(
            new Set([
              ...(ticket.relatedSkills ?? []),
              ...aiResponse.relatedSkills,
            ])
          );

          await db
            .update(ticketsTable)
            .set({
              priority,
              helpfulNotes: aiResponse.helpfulNotes,
              status: "in_progress",
              relatedSkills: mergedSkills,
              updatedAt: new Date(),
            })
            .where(eq(ticketsTable.id, ticket.id));

          skills = mergedSkills;
        }

        return skills;
      });

      await step.run("create-vector-embedding-if-completed", async () => {
        try {
          const [currentTicket] = await db
            .select({
              id: ticketsTable.id,
              title: ticketsTable.title,
              description: ticketsTable.description,
              category: ticketsTable.category,
              status: ticketsTable.status,
              priority: ticketsTable.priority,
              helpfulNotes: ticketsTable.helpfulNotes,
              relatedSkills: ticketsTable.relatedSkills,
              isPublic: ticketsTable.isPublic,
              createdBy: ticketsTable.createdBy,
              assignedTo: ticketsTable.assignedTo,
              createdAt: ticketsTable.createdAt,
              updatedAt: ticketsTable.updatedAt,
            })
            .from(ticketsTable)
            .where(eq(ticketsTable.id, ticket.id));

          if (currentTicket && currentTicket.status === "completed" && currentTicket.isPublic) {
            await upsertResolvedPublicTicketVector(currentTicket);
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error("Failed to create vector embedding:", error.message);
          } else {
            console.error("Failed to create vector embedding:", error);
          }
        }
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user:
          | {
              id: number;
              email: string;
            }
          | undefined;

        if (relatedSkills.length > 0) {
          const skillMatchConditions = relatedSkills.map((skill) =>
            sql`EXISTS (
              SELECT 1
              FROM unnest(${usersTable.skills}) AS user_skill
              WHERE ${ilike(sql`user_skill`, `%${skill}%`)}
            )`
          );

          const [moderator] = await db
            .select({ id: usersTable.id, email: usersTable.email })
            .from(usersTable)
            .where(
              and(
                eq(usersTable.role, "moderator"),
                or(...skillMatchConditions)
              )
            )
            .limit(1);

          user = moderator;
        }

        if (!user) {
          const [admin] = await db
            .select({ id: usersTable.id, email: usersTable.email })
            .from(usersTable)
            .where(eq(usersTable.role, "admin"))
            .limit(1);

          user = admin;
        }

        await db
          .update(ticketsTable)
          .set({
            assignedTo: user?.id ?? null,
            updatedAt: new Date(),
          })
          .where(eq(ticketsTable.id, ticket.id));

        if ((ticket.assignedTo ?? null) !== (user?.id ?? null)) {
          await logAuditEvent({
            action: "ticket_assigned",
            entityType: "ticket",
            entityId: ticket.id,
            ticketId: ticket.id,
            targetUserId: user?.id ?? null,
            assignedFromUserId: ticket.assignedTo ?? null,
            assignedToUserId: user?.id ?? null,
            description: "Ticket assigned by automation",
            metadata: {
              assignedBy: "system",
              matchedSkills: relatedSkills,
            },
          });
        }

        return user;
      });

      await step.run("send-email-notification", async () => {
        if (moderator) {
          const [finalTicket] = await db
            .select({ title: ticketsTable.title })
            .from(ticketsTable)
            .where(eq(ticketsTable.id, ticket.id));

          if (!finalTicket) {
            return;
          }

          await sendEmail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error running the step", message);
      return { success: false };
    }
  }
);
