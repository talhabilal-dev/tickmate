export const TICKET_CATEGORIES = [
  "Bug",
  "Feature Request",
  "Question",
  "Performance",
  "UI/UX",
  "Security",
  "Integration",
  "Other",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];