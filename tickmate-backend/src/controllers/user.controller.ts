import argon2 from "argon2";
import db from "../config/db.config.js";
import {
  signupSchema,
  verifySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
  usernameAvailabilitySchema,
} from "../schemas/user.schema.js";
import { serializeUserResponse } from "../schemas/user-response.schema.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.config.js";
import { inngest } from "../inngest/client.js";
import type { Request, Response } from "express";
import {
  usersTable,
  magicLinksTable,
  ticketsTable,
  aiUsageLogsTable,
  auditLogsTable,
} from "../models/model.js";
import { and, eq, or } from "drizzle-orm";
import {
  sendError,
  sendSuccess,
  sendZodValidationError,
} from "../utils/response.utils.js";
import {
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} from "../utils/cookie.utils.js";
import { logAuditEventFromRequest } from "../utils/audit-log.utils.js";


export const signup = async (req: Request, res: Response) => {

  const { name, email, password, username, skills = [] } = req.body;

  const validation = signupSchema.safeParse({ name, email, password, username, skills });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }
  try {

    const [existingUser] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
      })
      .from(usersTable)
      .where(or(eq(usersTable.email, email), eq(usersTable.username, username)));

    if (existingUser) {
      const duplicateField = existingUser.email === email ? "email" : "username";
      const duplicateMessage =
        duplicateField === "email" ? "Email already exists" : "Username already exists";

      return sendError(res, 409, {
        message: duplicateMessage,
        errors: [{ field: duplicateField, message: duplicateMessage }],
      });
    }

    const hashedPassword = await argon2.hash(password);

    const [newUser] = await db.insert(usersTable).values({
      name,
      username,
      email,
      password: hashedPassword,
      skills,
    }).returning({
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

    await inngest.send({
      name: "user/signup",
      data: { userId: newUser?.id, email: newUser?.email },
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
      description: "User account created via signup",
      metadata: {
        method: "self_signup",
        role: newUser.role,
      },
    });

    return sendSuccess(res, 201, {
      message: "User created successfully",
      user: serializeUserResponse(newUser),
    });
  } catch (error) {

    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }

    return sendError(res, 500, {
      message: "Internal server error",
    });


  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {

  const { email } = req.body;

  const validation = forgotPasswordSchema.safeParse({ email });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (user && !user.isActive) {
      await inngest.send({
        name: "user/signup",
        data: { userId: user.id, email: user.email },
      });
    }

    return sendSuccess(res, 200, {
      message: "If an account exists for this email, a verification link has been sent.",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
}

export const verify = async (req: Request, res: Response) => {

  const { token } = req.body;
  const validation = verifySchema.safeParse({ token });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {

    if (!ENV.JWT_SECRET) {
      return sendError(res, 500, {
        message: "JWT_SECRET is not configured",
      });
    }

    const payload = jwt.verify(token, ENV.JWT_SECRET) as {
      userId?: string | number;
      email?: string;
      purpose?: string;
    };

    const userId = Number(payload.userId);
    const purpose = payload.purpose;

    if (!userId || !purpose) {
      return sendError(res, 400, {
        message: "Invalid token payload",
      });
    }

    const [isAlreadyVerified] = await db.select().from(usersTable).where(and(eq(usersTable.id, userId), eq(usersTable.isActive, true)));

    if (isAlreadyVerified) {
      return sendError(res, 400, {
        message: "Email is already verified",
      });
    }

    const [verificationRecords] = await db
      .select()
      .from(magicLinksTable)
      .where(
        and(
          eq(magicLinksTable.userId, userId),
          eq(magicLinksTable.purpose, purpose as "email_verification" | "password_reset" | "password_change")
        )
      );

    if (!verificationRecords) {
      return sendError(res, 400, {
        message: "Invalid or already used token",
      });
    }


    if (verificationRecords?.expiresAt < new Date()) {
      return sendError(res, 400, {
        message: "Token has expired",
      });
    }

    await db.update(usersTable).set({ isActive: true }).where(eq(usersTable.id, userId));
    await db.delete(magicLinksTable).where(eq(magicLinksTable.id, verificationRecords.id));

    return sendSuccess(res, 200, {
      message: "Email verified successfully",
    });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 400, {
        message: "Token has expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 400, {
        message: "Invalid token",
      });
    }

    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });

  }

}

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;


  const validation = loginSchema.safeParse({ identifier, password });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, identifier),
          eq(usersTable.username, identifier)
        )
      );

    if (!user) {
      return sendError(res, 401, {
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return sendError(res, 401, {
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return sendError(res, 401, {
        message: "User account is Not verified. Please check your email for verification instructions.",
      });
    }

    // Standard user token
    const token = jwt.sign(
      {
        userId: user.id.toString(),
        role: user.role,
        isActive: user.isActive,
      } as {
        userId: string;
        role: string;
        isActive: boolean;
      },
      ENV.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    await db.update(usersTable).set({ loginTime: new Date() }).where(eq(usersTable.id, user.id));

    res.cookie("token", token, getAuthCookieOptions(24 * 60 * 60 * 1000));

    await logAuditEventFromRequest(req, {
      action: "login",
      entityType: "auth",
      actorUserId: user.id,
      targetUserId: user.id,
      description: "User logged in",
      metadata: {
        role: user.role,
      },
    });

    return sendSuccess(res, 200, {
      message: "User logged in successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {

    if (!req.user?.userId) {
      return sendError(res, 401, {
        message: "Unauthorized Access",
      });
    }

    const actorUserId = Number(req.user.userId);
    await logAuditEventFromRequest(req, {
      action: "logout",
      entityType: "auth",
      actorUserId: Number.isInteger(actorUserId) ? actorUserId : null,
      targetUserId: Number.isInteger(actorUserId) ? actorUserId : null,
      description: "User logged out",
      metadata: {
        role: req.user.role,
      },
    });

    res.clearCookie("token", getClearAuthCookieOptions());
    return sendSuccess(res, 200, {
      message: "User logged out successfully",
    });
  } catch (error) {

    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }

    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized Access" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.user.userId)));
    if (!user) {
      return sendError(res, 404, { message: "Failed to get user" });
    }
    return sendSuccess(res, 200, { user: serializeUserResponse(user) });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { name, username, email, skills } = req.body;

  const validation = updateUserSchema.safeParse({ name, username, email, skills });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized Access" });
    }

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(req.user.userId)));

    if (!existingUser) {
      return sendError(res, 404, { message: "Failed to get user" });
    }

    const updateData: Partial<{
      name: string;
      username: string;
      email: string;
      skills: string[];
      isActive: boolean;
    }> = {};

    if (typeof name !== "undefined") {
      updateData.name = name;
    }

    if (typeof skills !== "undefined") {
      updateData.skills = skills;
    }

    if (typeof username !== "undefined" && username !== existingUser.username) {
      const [usernameInUse] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.username, username));

      if (usernameInUse && usernameInUse.id !== existingUser.id) {
        return sendError(res, 409, {
          message: "Username is already in use",
          errors: [{ field: "username", message: "Username is already in use" }],
        });
      }

      updateData.username = username;
    }

    if (typeof email !== "undefined" && email !== existingUser.email) {
      return sendError(res, 400, {
        message: "Email cannot be changed",
        errors: [{ field: "email", message: "Email cannot be changed" }],
      });
    }

    if (Object.keys(updateData).length === 0) {
      return sendSuccess(res, 200, {
        message: "No changes were provided",
        user: serializeUserResponse(existingUser),
      });
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, existingUser.id))
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
      return sendError(res, 500, {
        message: "Failed to update user",
      });
    }

    return sendSuccess(res, 200, {
      message: "Profile updated successfully",
      user: serializeUserResponse(updatedUser),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, currentPassword, newPassword } = req.body as {
      oldPassword?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const effectiveOldPassword = oldPassword ?? currentPassword;

    if (!effectiveOldPassword || !newPassword) {
      return sendError(res, 400, {
        message: "oldPassword and newPassword are required",
      });
    }

    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.user.userId)));

    if (!user) {
      return sendError(res, 404, { message: "Failed to get user" });
    }

    const passwordMatch = await argon2.verify(user.password, effectiveOldPassword);

    if (!passwordMatch) {
      return sendError(res, 401, { message: "Invalid old password" });
    }

    const hashedPassword = await argon2.hash(newPassword);

    const [updatedUser] = await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, Number(req.user.userId)))
      .returning({ id: usersTable.id });

    if (!updatedUser) {
      return sendError(res, 500, {
        message: "Failed to update password",
      });
    }

    return sendSuccess(res, 200, {
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const validation = forgotPasswordSchema.safeParse({ email });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (user) {
      await inngest.send({
        name: "user/forgot-password",
        data: { userId: user.id, email: user.email },
      });
    }

    return sendSuccess(res, 200, {
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const validation = resetPasswordSchema.safeParse({ token, newPassword });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    if (!ENV.JWT_SECRET) {
      return sendError(res, 500, {
        message: "JWT_SECRET is not configured",
      });
    }

    const payload = jwt.verify(token, ENV.JWT_SECRET) as {
      userId?: string | number;
      purpose?: string;
    };

    const userId = Number(payload.userId);
    const purpose = payload.purpose;

    if (!userId || purpose !== "password_reset") {
      return sendError(res, 400, {
        message: "Invalid token payload",
      });
    }

    const [resetRecord] = await db
      .select()
      .from(magicLinksTable)
      .where(
        and(
          eq(magicLinksTable.userId, userId),
          eq(magicLinksTable.purpose, "password_reset"),
          eq(magicLinksTable.tokenHash, token)
        )
      );

    if (!resetRecord) {
      return sendError(res, 400, {
        message: "Invalid or already used token",
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      return sendError(res, 400, {
        message: "Token has expired",
      });
    }

    const hashedPassword = await argon2.hash(newPassword);

    const [updatedUser] = await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (!updatedUser) {
      return sendError(res, 404, {
        message: "User not found",
      });
    }

    await db.delete(magicLinksTable).where(eq(magicLinksTable.id, resetRecord.id));

    return sendSuccess(res, 200, {
      message: "Password reset successfully",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 400, {
        message: "Token has expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 400, {
        message: "Invalid token",
      });
    }

    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }

    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};

export const checkUsernameAvailability = async (req: Request, res: Response) => {

  const { username } = req.params as { username: string };


  const validation = usernameAvailabilitySchema.safeParse({ username });

  if (!validation.success) {
    return sendZodValidationError(res, validation.error.issues);
  }

  try {
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    return sendSuccess(res, 200, {
      available: existingUser.length === 0,
      message: existingUser ? "Username is already taken" : "Username is available",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message)
    } else {
      console.error("Internal Server Error", error)
    }
    return sendError(res, 500, {

      message: "Internal server error",
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return sendError(res, 401, { message: "Unauthorized Access" });
    }

    const userId = Number(req.user.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return sendError(res, 401, { message: "Unauthorized Access" });
    }

    const [existingUser] = await db
      .select({
        id: usersTable.id,
        role: usersTable.role,
        email: usersTable.email,
        username: usersTable.username,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!existingUser) {
      return sendError(res, 404, {
        message: "User not found",
      });
    }

    await logAuditEventFromRequest(req, {
      action: "user_deleted",
      entityType: "user",
      entityId: existingUser.id,
      targetUserId: existingUser.id,
      description: "User deleted own account",
      metadata: {
        role: existingUser.role,
        username: existingUser.username,
      },
    });

    await db.transaction(async (tx) => {
      await tx.update(ticketsTable).set({ createdBy: null }).where(eq(ticketsTable.createdBy, userId));
      await tx.update(ticketsTable).set({ assignedTo: null }).where(eq(ticketsTable.assignedTo, userId));

      await tx.update(aiUsageLogsTable).set({ userId: null }).where(eq(aiUsageLogsTable.userId, userId));

      await tx.update(auditLogsTable).set({ actorUserId: null }).where(eq(auditLogsTable.actorUserId, userId));
      await tx.update(auditLogsTable).set({ targetUserId: null }).where(eq(auditLogsTable.targetUserId, userId));
      await tx.update(auditLogsTable).set({ assignedFromUserId: null }).where(eq(auditLogsTable.assignedFromUserId, userId));
      await tx.update(auditLogsTable).set({ assignedToUserId: null }).where(eq(auditLogsTable.assignedToUserId, userId));

      await tx.delete(magicLinksTable).where(eq(magicLinksTable.userId, userId));

      const [deletedUser] = await tx
        .delete(usersTable)
        .where(eq(usersTable.id, userId))
        .returning({ id: usersTable.id });

      if (!deletedUser) {
        throw new Error("Failed to delete user");
      }
    });

    res.clearCookie("token", getClearAuthCookieOptions());

    return sendSuccess(res, 200, {
      message: "Account deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Internal Server Error", error.message);
    } else {
      console.error("Internal Server Error", error);
    }

    return sendError(res, 500, {
      message: "Internal server error",
    });
  }
};
