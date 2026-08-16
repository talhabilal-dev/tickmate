import zod from "zod";

export const createTicketSchema = zod
  .object({
    title: zod.string().trim().min(1, "Title is required").max(255, "Title is too long"),
    description: zod.string().trim().min(1, "Description is required").max(1000, "Description is too long"),
    category: zod.string().trim().min(1, "Category is required").max(255, "Category is too long"),
    priority: zod.enum(["low", "medium", "high"]).optional(),
    deadline: zod.coerce.date().optional(),
    relatedSkills: zod.array(zod.string().trim().min(1)).optional(),
    helpfulNotes: zod.string().trim().optional(),
    isPublic: zod.boolean().optional(),
  })
  .strip();

export const ticketReplySchema = zod
  .object({
    ticketId: zod.coerce.number().int().positive("Valid ticket id is required"),
    message: zod.string().trim().min(1, "Message is required"),
  })
  .strip();

export const deleteTicketSchema = zod
  .object({
    ticketId: zod.coerce.number().int().positive("Valid ticket id is required"),
  })
  .strip();

export const editTicketSchema = zod
  .object({
    ticketId: zod.coerce.number().int().positive("Valid ticket id is required"),
    title: zod.string().trim().min(1).max(255).optional(),
    description: zod.string().trim().min(1).optional(),
    category: zod.string().trim().min(1).max(255).optional(),
    deadline: zod.coerce.date().optional().nullable(),
    status: zod.enum(["pending", "in_progress", "completed"]).optional(),
    priority: zod.enum(["low", "medium", "high"]).optional(),
    assignedTo: zod.coerce.number().int().positive().optional().nullable(),
    helpfulNotes: zod.string().trim().optional().nullable(),
    relatedSkills: zod.array(zod.string().trim().min(1)).optional(),
    isPublic: zod.boolean().optional(),
  })
  .strip();

export const adminCreateTicketSchema = zod
  .object({
    title: zod.string().trim().min(1, "Title is required").max(255, "Title is too long"),
    description: zod.string().trim().min(1, "Description is required").max(1000, "Description is too long"),
    category: zod.string().trim().min(1, "Category is required").max(255, "Category is too long"),
    assignedTo: zod.coerce.number().int().positive("Valid moderator user id is required"),
    helpfulNotes: zod.string().trim().min(1, "Helpful notes are required"),
    priority: zod.enum(["low", "medium", "high"]).optional(),
    deadline: zod.coerce.date().optional(),
    relatedSkills: zod.array(zod.string().trim().min(1)).optional(),
    isPublic: zod.boolean().optional(),
  })
  .strip();

export const similarTicketSearchSchema = zod
  .object({
    title: zod.string().trim().min(1, "Title is required"),
    description: zod.string().trim().min(1, "Description is required"),
    category: zod.string().trim().optional(),
    limit: zod.coerce.number().int().min(1).max(20).optional(),
  })
  .strip();

export const publicCompletedTicketsFilterSchema = zod
  .object({
    category: zod
      .preprocess(
        (value) => (typeof value === "string" ? value.trim() : undefined),
        zod.string().min(1).max(255).optional()
      ),
    skills: zod
      .preprocess((value) => {
        if (typeof value !== "string") {
          return undefined;
        }

        const parsed = value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

        return parsed.length > 0 ? parsed : undefined;
      }, zod.array(zod.string().trim().min(1)).optional()),
  })
  .strip();
