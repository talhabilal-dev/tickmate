import express from "express";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
import {
  assignedTickets,
  createTicket,
  getTickets,
  toggleTicketStatus,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", verifyAuthToken, getTickets);
router.post("/", verifyAuthToken, createTicket);
router.put("/status/:id", verifyAuthToken, toggleTicketStatus);
router.get("/get-assigned", verifyAuthToken, assignedTickets);

export default router;
