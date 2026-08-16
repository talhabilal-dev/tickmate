import { Inngest } from "inngest";
import { ENV } from "../config/env.config.js";

const eventKey = ENV.INNGEST_EVENT_KEY;

export const inngest = new Inngest({
  id: "tick-mate",
  ...(eventKey ? { eventKey } : {}),
});

export const inngestAvailable = Boolean(eventKey);

export const publishEvent = async (name: string, data: unknown) => {
  if (!inngestAvailable) {
    console.warn(`[inngest] Not configured — skipping event "${name}"`);
    return null;
  }

  try {
    return await inngest.send({ name, data });
  } catch (error) {
    console.error(`[inngest] Failed to send event "${name}":`, error);
    return null;
  }
};