import db from "../config/db.config.js";
import { ticketsTable, usersTable } from "../models/model.js";
import { eq } from "drizzle-orm";
import { sendEmail } from "./mailer.utils.js";

const appName = "TickMate";

const loadTicketAndCreator = async (ticketId: number) => {
  const [ticket] = await db
    .select({
      id: ticketsTable.id,
      title: ticketsTable.title,
      status: ticketsTable.status,
      createdBy: ticketsTable.createdBy,
    })
    .from(ticketsTable)
    .where(eq(ticketsTable.id, ticketId))
    .limit(1);

  if (!ticket?.createdBy) return null;

  const [creator] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isActive: usersTable.isActive,
    })
    .from(usersTable)
    .where(eq(usersTable.id, ticket.createdBy))
    .limit(1);

  if (!creator || !creator.email || !creator.isActive) return null;

  return { ticket, creator };
};

export const notifyCreatorOfReply = async (
  ticketId: number,
  replyMessage: string,
  replierName: string
) => {
  try {
    const context = await loadTicketAndCreator(ticketId);
    if (!context) return;

    const { ticket, creator } = context;
    const text = `Hi ${creator.name},\n\n${replierName} replied to your ticket "${ticket.title}":\n\n${replyMessage}`;

    await sendEmail(
      creator.email,
      `New reply on your ticket — ${ticket.title}`,
      text
    );
  } catch (error) {
    console.error(`[notifier] Failed to notify creator of reply on ticket ${ticketId}:`, error);
  }
};

export const notifyCreatorOfCompletion = async (
  ticketId: number,
  completerName: string
) => {
  try {
    const context = await loadTicketAndCreator(ticketId);
    if (!context) return;

    const { ticket, creator } = context;
    const text = `Hi ${creator.name},\n\nYour ticket "${ticket.title}" was marked as completed by ${completerName}.`;

    await sendEmail(
      creator.email,
      `Ticket completed — ${ticket.title}`,
      text
    );
  } catch (error) {
    console.error(`[notifier] Failed to notify creator of completion on ticket ${ticketId}:`, error);
  }
};

export { appName };