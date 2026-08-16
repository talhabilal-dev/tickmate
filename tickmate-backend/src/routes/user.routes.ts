import express, { Router } from "express";
import {
  signup,
  verify,
  login,
  logout,
  forgotPassword,
  resetPassword,
  checkUsernameAvailability,
  resendVerificationEmail,
  getUser,
  updateUser,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";
import { verifyAuthToken } from "../middlewares/auth.middleware.js";

const router: Router = express.Router();

router.post("/register", signup);
router.post("/verify", verify);
router.post("/login", login);
router.post("/logout", verifyAuthToken, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check-username/:username", checkUsernameAvailability);
router.post("/resend-verification-email", resendVerificationEmail);
router.patch("/profile", verifyAuthToken, updateUser);
router.put("/update-password", verifyAuthToken, changePassword);
router.get("/profile", verifyAuthToken, getUser);
router.delete("/profile", verifyAuthToken, deleteAccount);

export default router;
