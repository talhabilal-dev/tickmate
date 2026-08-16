import { Inngest } from "inngest";
import { ENV } from "../config/env.config.js";

if (!ENV.INNGEST_EVENT_KEY) {
  throw new Error("INNGEST_EVENT_KEY is not defined in environment variables.");
}

export const inngest = new Inngest({
  id: "tick-mate",
  eventKey: ENV.INNGEST_EVENT_KEY,
});
