import express from "express";
import ENV from "./config/env.config.js";
import connectDB from "./config/db.config.js";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import { serve } from "inngest/express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
const corsOptions = {
  origin: ENV.APP_URL,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/admin", adminRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

app.get("/", (req, res) => res.send("Hello from tickmate backend!"));

const port = ENV.PORT || 3000;
connectDB()
  .then(() => {
    console.log("✅ Connected to DB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
  });
