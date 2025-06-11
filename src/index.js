import express from "express";
import ENV from "./config/env.config.js";
import connectDB from "./config/db.config.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

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
