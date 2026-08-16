import zod from "zod";

export const signupSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
    username: zod.string().min(3, "Username must be at least 3 characters long"),
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters long"),
    skills: zod.array(zod.string()).optional(),
});

export const verifySchema = zod.object({
    token: zod.string().min(1, "Token is required"),
});

export const loginSchema = zod.object({
    identifier: zod.string().min(1, "Email or username is required"),
    password: zod.string().min(6, "Password must be at least 6 characters long"),
});

export const forgotPasswordSchema = zod.object({
    email: zod.string().email("Invalid email address"),
});

export const resetPasswordSchema = zod.object({
    token: zod.string().min(1, "Token is required"),
    newPassword: zod.string().min(6, "Password must be at least 6 characters long"),
});

export const updateUserSchema = zod.object({
    name: zod.string().min(1, "Name cannot be empty").optional(),
    username: zod.string().min(3, "Username must be at least 3 characters long").optional(),
    email: zod.string().email("Invalid email address").optional(),
    skills: zod.array(zod.string()).optional(),
});

export const usernameAvailabilitySchema = zod.object({
    username: zod.string().min(3, "Username must be at least 3 characters long"),
});

export const adminCreateUserSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
    username: zod.string().min(3, "Username must be at least 3 characters long"),
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters long"),
    skills: zod.array(zod.string()).optional(),
    role: zod.enum(["user", "moderator", "admin"]).optional(),
});

const idLikeSchema = zod.union([
    zod.number().int().positive(),
    zod.string().regex(/^\d+$/, "id must be a positive integer"),
]);

export const adminUpdateUserSchema = zod
    .object({
        _id: idLikeSchema.optional(),
        userId: idLikeSchema.optional(),
        role: zod.enum(["user", "moderator", "admin"]).optional(),
        isActive: zod.boolean().optional(),
    })