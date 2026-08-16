import { NonRetriableError } from "inngest";
import { magicLinksTable, usersTable } from "../../models/model.js";
import db from "../../config/db.config.js";
import { eq } from "drizzle-orm";
import { sendEmail } from "../../utils/mailer.utils.js";
import { inngest } from "../client.js";
import { generateMagicLink } from "../../utils/magic-link.utils.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 3 },
  { event: "user/signup" },

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

        if (!userObject) throw new NonRetriableError("User not found");
        return userObject;
      });

      const magicLink = await step.run("create-email-verification-link", async () => {
        const { rawToken, link, expiresAt } = await generateMagicLink({
          userId: String(user.id),
          email: user.email,
          purpose: "email_verification",
        });

        await db.insert(magicLinksTable).values({
          userId: user.id,
          tokenHash: rawToken,
          purpose: "email_verification",
          expiresAt,
        });

        return { link };
      });

      await step.run("send-verification-email", async () => {
        const templatePath = resolve(
          process.cwd(),
          "public/emails/verification-email.html"
        );
        const template = await readFile(templatePath, "utf-8");
        const html = template.replaceAll("{{MAGIC_LINK}}", magicLink.link);

        await sendEmail(
          user.email,
          "Verify your TickMate account",
          `Hi ${user.name}, verify your email using the magic link sent in this message.`,
          html
        );
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in onUserSignup function:", error.message);
      } else {
        console.error("Unknown error in onUserSignup function:", error);
      }
      throw error;
    }
  }
);
