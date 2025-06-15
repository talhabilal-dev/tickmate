import express from "express";
import { getAllUsers, getAllTickets } from "../controllers/admin.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/users", verifyAuthToken, getAllUsers);
router.get("/tickets", verifyAuthToken, getAllTickets);

export default router;
