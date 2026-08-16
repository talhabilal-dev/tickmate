import express, { Router } from "express";
import {
  adminLogin,
  adminLogout,
  createTicketByAdmin,
  createUserByAdmin,
  getAllUsers,
  getAllTickets,
  getAiUsage,
  getAuditLogs,
  getAdminDashboard,
  getDeletedTickets,
  restoreTicket,
  updateUser,
  deleteUser,
  toggleTicketStatusByAdmin,
  deleteTicketByAdmin,
} from "../controllers/admin.controller.js";
import { verifyAdminToken } from "../middlewares/admin.middleware.js";
import { rateLimit } from "../middlewares/rate-limit.middleware.js";

const router: Router = express.Router();

const loginLimit = rateLimit({ windowMs: 60_000, max: 5 });
const createLimit = rateLimit({ windowMs: 60_000, max: 30 });

router.post("/login", loginLimit, adminLogin);
router.post("/logout", verifyAdminToken, adminLogout);
router.post("/users", verifyAdminToken, createLimit, createUserByAdmin);
router.post("/tickets", verifyAdminToken, createLimit, createTicketByAdmin);
router.get("/users", verifyAdminToken, getAllUsers);
router.get("/tickets", verifyAdminToken, getAllTickets);
router.get("/tickets/deleted", verifyAdminToken, getDeletedTickets);
router.get("/ai-usage", verifyAdminToken, getAiUsage);
router.get("/audit-logs", verifyAdminToken, getAuditLogs);
router.get("/dashboard", verifyAdminToken, getAdminDashboard);
router.patch("/users/:id", verifyAdminToken, updateUser);
router.delete("/users/:id", verifyAdminToken, deleteUser);
router.patch("/tickets/:id", verifyAdminToken, toggleTicketStatusByAdmin);
router.post("/tickets/:id/restore", verifyAdminToken, restoreTicket);
router.delete("/tickets/:id", verifyAdminToken, deleteTicketByAdmin);

export default router;