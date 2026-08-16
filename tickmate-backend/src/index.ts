import express, { type Request, type Response } from "express";
import { ENV } from "./config/env.config.js";
import db from "./config/db.config.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onUserForgotPassword } from "./inngest/functions/on-forgot-password.js";
import { serve } from "inngest/express";
import ticketRoutes from "./routes/ticket.routes.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import adminRoutes from "./routes/admin.routes.js";
import { sql } from "drizzle-orm";


const app = express();
app.set("trust proxy", 1);

const normalizeOrigin = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return new URL(trimmed).origin;
  } catch {
    return undefined;
  }
};

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]);

if (ENV.APP_URL) {
  const normalizedAppUrl = normalizeOrigin(ENV.APP_URL);
  if (normalizedAppUrl) {
    allowedOrigins.add(normalizedAppUrl);
  }
}

if (ENV.CORS_ORIGINS) {
  for (const origin of ENV.CORS_ORIGINS.split(",")) {
    const normalizedOrigin = normalizeOrigin(origin);
    if (normalizedOrigin) {
      allowedOrigins.add(normalizedOrigin);
    }
  }
}

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onUserForgotPassword, onTicketCreated],
  })
);
app.use("/api/auth", userRoutes
);

app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (_req: Request, res: Response) => res.send("Hello World!"));

const port = ENV.PORT || 3000;

const startServer = async () => {
  try {
    // Run a minimal query to verify DB connectivity before starting the API.
    await db.execute(sql`select 1`);
    console.log("✅ Connected to DB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("❌ Failed to connect to DB:", error);
  }
};

void startServer();
