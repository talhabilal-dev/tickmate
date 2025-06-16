import express from "express";
import {
  getAllUsers,
  getAllTickets,
  getAdminDashboard,
} from "../controllers/admin.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", verifyAuthToken, getAllUsers);
router.get("/tickets", verifyAuthToken, getAllTickets);
router.get("/dashboard", verifyAuthToken, getAdminDashboard);

export default router;
