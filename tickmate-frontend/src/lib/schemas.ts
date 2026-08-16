import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    skills: z.array(z.string()).optional().default([]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpData = z.input<typeof signUpSchema>;

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["user", "admin"]).optional(),
});

export type SignInData = z.infer<typeof signInSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

const resetPasswordFieldRules = {
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
};

export const resetPasswordFormSchema = z
  .object(resetPasswordFieldRules)
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export const resetPasswordWithTokenSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    ...resetPasswordFieldRules,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordWithTokenData = z.infer<
  typeof resetPasswordWithTokenSchema
>;

export const checkUsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
});

export type CheckUsernameData = z.infer<typeof checkUsernameSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  skills: z.array(z.string()).optional(),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const userResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "moderator", "admin"]),
  skills: z.array(z.string()),
  isActive: z.boolean(),
  loginTime: z.date(),
  createdAt: z.date(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

// Ticket Schemas
export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(255, "Category is too long"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  deadline: z.coerce.date().optional(),
  relatedSkills: z.array(z.string().trim().min(1)).optional(),
  helpfulNotes: z.string().trim().optional(),
  isPublic: z.boolean().optional(),
});

export type CreateTicketData = z.infer<typeof createTicketSchema>;

export const similarTicketSearchSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export type SimilarTicketSearchData = z.infer<typeof similarTicketSearchSchema>;

export const editTicketSchema = z.object({
  ticketId: z.coerce.number().int().positive("Valid ticket id is required"),
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).max(255).optional(),
  deadline: z.coerce.date().optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  helpfulNotes: z.string().trim().optional().nullable(),
  relatedSkills: z.array(z.string().trim().min(1)).optional(),
  isPublic: z.boolean().optional(),
});

export type EditTicketData = z.infer<typeof editTicketSchema>;

export const deleteTicketSchema = z.object({
  ticketId: z.coerce.number().int().positive("Valid ticket id is required"),
});

export type DeleteTicketData = z.infer<typeof deleteTicketSchema>;

export const ticketResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "completed"]),
  deadline: z.date().nullable(),
  relatedSkills: z.array(z.string()),
  helpfulNotes: z.string().nullable(),
  isPublic: z.boolean(),
  createdBy: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TicketResponse = z.infer<typeof ticketResponseSchema>;
