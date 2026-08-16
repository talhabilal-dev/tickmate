import express, { Router } from "express";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rate-limit.middleware.js";
import {
  assignedTickets,
  createTicket,
  deleteTicket,
  editTicket,
  getPublicCompletedTickets,
  getSimilarResolvedTickets,
  getTicketById,
  getTickets,
  getUserTicketSummary,
  ticketReply,
  toggleTicketStatus,
} from "../controllers/ticket.controller.js";

const router: Router = express.Router();

const createLimit = rateLimit({ windowMs: 60_000, max: 20 });
const replyLimit = rateLimit({ windowMs: 60_000, max: 30 });
const searchLimit = rateLimit({ windowMs: 60_000, max: 20 });
const mutateLimit = rateLimit({ windowMs: 60_000, max: 30 });

router.get("/", verifyAuthToken, getTickets);
router.get("/assigned", verifyAuthToken, assignedTickets);
router.get("/summary", verifyAuthToken, getUserTicketSummary);
router.get("/public/completed", verifyAuthToken, getPublicCompletedTickets);
router.post("/search/similar", verifyAuthToken, searchLimit, getSimilarResolvedTickets);
router.post("/", verifyAuthToken, createLimit, createTicket);
router.post("/:id/replies", verifyAuthToken, replyLimit, ticketReply);
router.get("/:id", verifyAuthToken, getTicketById);
router.patch("/:id", verifyAuthToken, mutateLimit, editTicket);
router.patch("/:id/status", verifyAuthToken, mutateLimit, toggleTicketStatus);
router.delete("/:id", verifyAuthToken, mutateLimit, deleteTicket);

export default router;