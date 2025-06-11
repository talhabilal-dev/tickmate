import express from "express";
import {
  signup,
  login,
  logout,
  updateUser,
  getUser,
} from "../controllers/user.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

export default router;
