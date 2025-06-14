import express from "express";
import {
  signup,
  login,
  logout,
  updateSkills,
  getUser,
  updateUser,
  changePassword,
} from "../controllers/user.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/logout", verifyAuthToken, logout);
router.put("/update-skills", verifyAuthToken, updateSkills);
router.put("/update", verifyAuthToken, updateUser);
router.put("/update-password", verifyAuthToken, changePassword);

router.get("/user", verifyAuthToken, getUser);

export default router;
