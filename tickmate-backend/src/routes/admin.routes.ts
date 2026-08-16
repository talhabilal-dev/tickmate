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
  updateUser,
  deleteUser,
  toggleTicketStatusByAdmin,
  deleteTicketByAdmin,
} from "../controllers/admin.controller.js";
import { verifyAdminToken } from "../middlewares/admin.middleware.js";

const router: Router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", verifyAdminToken, adminLogout);
router.post("/create-user", verifyAdminToken, createUserByAdmin);
router.post("/create-ticket", verifyAdminToken, createTicketByAdmin);
router.get("/users", verifyAdminToken, getAllUsers);
router.get("/tickets", verifyAdminToken, getAllTickets);
router.get("/ai-usage", verifyAdminToken, getAiUsage);
router.get("/audit-logs", verifyAdminToken, getAuditLogs);
router.get("/dashboard", verifyAdminToken, getAdminDashboard);
router.put("/update-user", verifyAdminToken, updateUser);
router.delete("/delete-user", verifyAdminToken, deleteUser);
router.put("/tickets/toggle-status", verifyAdminToken, toggleTicketStatusByAdmin);
router.delete("/tickets/delete-ticket", verifyAdminToken, deleteTicketByAdmin);

export default router;
