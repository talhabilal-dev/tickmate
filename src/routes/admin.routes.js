import express from "express";
import {
  getAllUsers,
  getAllTickets,
  getAdminDashboard,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", verifyAuthToken, getAllUsers);
router.get("/tickets", verifyAuthToken, getAllTickets);
router.get("/dashboard", verifyAuthToken, getAdminDashboard);
router.put("/update-user", verifyAuthToken, updateUser);
router.delete("/delete-user", verifyAuthToken, deleteUser);

export default router;
