import express from "express";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
import {
  createTicket,
  getTicket,
  getTickets,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", verifyAuthToken, getTickets);
router.get("/:id", verifyAuthToken, getTicket);
router.post("/", verifyAuthToken, createTicket);

export default router;
