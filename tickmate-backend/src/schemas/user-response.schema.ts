import zod from "zod";

export const userResponseSchema = zod
  .object({
    id: zod.number(),
    name: zod.string(),
    username: zod.string(),
    email: zod.string().email(),
    role: zod.enum(["user", "moderator", "admin"]),
    skills: zod.array(zod.string()),
    isActive: zod.boolean(),
    loginTime: zod.date(),
    createdAt: zod.date(),
  })
  .strip();

export const usersListResponseSchema = zod.object({
  message: zod.string(),
  users: zod.array(userResponseSchema),
});

export const serializeUserResponse = (user: unknown) => userResponseSchema.parse(user);
