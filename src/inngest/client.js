import { Inngest } from "inngest";
import ENV from "../config/env.config.js";

export const inngest = new Inngest({
  id: "tick-mate",
  eventKey: ENV.INNGEST_EVENT_KEY,

});
