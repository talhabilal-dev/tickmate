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
router.post("/login", login);
router.post("/logout", verifyAuthToken, logout);
router.put("/update", verifyAuthToken, updateUser);
router.get("/user", verifyAuthToken, getUser);

export default router;
