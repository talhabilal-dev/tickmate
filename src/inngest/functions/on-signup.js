import { NonRetriableError } from "inngest";
import userModel from "../../models/user.model.js";
import { inngest } from "../client.js";
import { sendEmail } from "../../utils/mailer.utils.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 3 },
  { event: "user/signup" },

  async ({ event, step }) => {
    try {
      const { email } = event.data;

      const user = await step.run("get-user-email", async () => {
        const userObject = await userModel.findOne({ email });
        if (!userObject) throw new NonRetriableError("User not found");
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        await sendEmail(
          user.email,
          "Welcome to TickMate",
          `Hi ${user.name}, we are happy to have you on board!`
        );
      });

      return { success: true };
    } catch (error) {
      console.error("Error in onUserSignup:", error);
      return { success: false, error: error.message };
    }
  }
);
