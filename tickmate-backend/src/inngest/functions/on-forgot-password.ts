import { NonRetriableError } from "inngest";
import { magicLinksTable, usersTable } from "../../models/model.js";
import db from "../../config/db.config.js";
import { and, eq } from "drizzle-orm";
import { sendEmail } from "../../utils/mailer.utils.js";
import { inngest } from "../client.js";
import { generateMagicLink } from "../../utils/magic-link.utils.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const onUserForgotPassword = inngest.createFunction(
    { id: "on-user-forgot-password", retries: 3 },
    { event: "user/forgot-password" },
    async ({ event, step }) => {
        try {
            const { email, userId } = event.data;

            const user = await step.run("get-user", async () => {
                if (!userId && !email) {
                    throw new NonRetriableError("userId or email is required");
                }

                const [userObject] = userId
                    ? await db
                        .select()
                        .from(usersTable)
                        .where(eq(usersTable.id, Number(userId)))
                    : await db.select().from(usersTable).where(eq(usersTable.email, email));

                if (!userObject) {
                    throw new NonRetriableError("User not found");
                }

                return userObject;
            });

            const magicLink = await step.run("create-password-reset-link", async () => {
                const { rawToken, link, expiresAt } = await generateMagicLink({
                    userId: String(user.id),
                    email: user.email,
                    purpose: "password_reset",
                });

                await db
                    .delete(magicLinksTable)
                    .where(
                        and(
                            eq(magicLinksTable.userId, user.id),
                            eq(magicLinksTable.purpose, "password_reset")
                        )
                    );

                await db.insert(magicLinksTable).values({
                    userId: user.id,
                    tokenHash: rawToken,
                    purpose: "password_reset",
                    expiresAt,
                });

                return { link };
            });

            await step.run("send-password-reset-email", async () => {
                const templatePath = resolve(process.cwd(), "public/emails/pass-reset-email.html");
                const template = await readFile(templatePath, "utf-8");
                const html = template.replaceAll("{{MAGIC_LINK}}", magicLink.link);

                await sendEmail(
                    user.email,
                    "Reset your TickMate password",
                    `Hi ${user.name}, reset your password using the magic link sent in this message.`,
                    html
                );
            });

            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error in onUserForgotPassword function:", error.message);
            } else {
                console.error("Unknown error in onUserForgotPassword function:", error);
            }
            throw error;
        }
    }
);
