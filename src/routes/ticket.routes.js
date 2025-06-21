import express from "express";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
import {
  assignedTickets,
  createTicket,
  deleteTicket,
  editTicket,
  getTickets,
  getUserTicketSummary,
  ticketReply,
  toggleTicketStatus,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", verifyAuthToken, getTickets);
router.post("/", verifyAuthToken, createTicket);
router.put("/status/:id", verifyAuthToken, toggleTicketStatus);
router.get("/get-assigned", verifyAuthToken, assignedTickets);
router.put("/ticket-reply", verifyAuthToken, ticketReply);
router.get("/tickets-summary", verifyAuthToken, getUserTicketSummary);
router.delete("/delete-ticket", verifyAuthToken, deleteTicket);
router.put("/edit-ticket", verifyAuthToken, editTicket);

export default router;
