import argon2 from "argon2";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ENV from "../config/env.config.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  const { name, email, password, skills = [] } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Missing required fields", success: false });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await argon2.hash(password);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      skills,
    });

    await inngest.send({
      name: "user/signup",
      data: { email },
    });

    return res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "User is not active",
        success: false,
      });
    }

    // Standard user token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        isActive: user.isActive,
      },
      ENV.JWT_SECRET,
      { expiresIn: "1d" }
    );

    let adminToken = null;
    if (user.role === "admin") {
      adminToken = jwt.sign(
        {
          adminId: user._id.toString(),
          role: "admin",
          scope: "full-access",
        },
        ENV.JWT_SECRET,
        { expiresIn: "12h" }
      );
    }

    user.password = undefined;
    user.loginTime = Date.now();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    if (adminToken) {
      res.cookie("adminToken", adminToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 12 * 60 * 60 * 1000,
      });
    }

    return res.status(200).json({
      user,
      success: true,
      message: "User logged in successfully",
      ...(adminToken && { adminToken }),
    });
  } catch (error) {
    console.error("Error in login:", error);

    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    // Clear both tokens
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateSkills = async (req, res) => {
  const { skills, role } = req.body;

  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    if (role && req.user.role !== "user") {
      return res.status(403).json({ message: "Forbidden", success: false });
    }

    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Forbidden", success: false });
    // }

    const existingUser = await userModel.findById(req.user.userId);
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.userId,
      { skills: skills ? skills : existingUser.skills },
      { new: true }
    );

    return res.status(200).json({
      user: updatedUser,
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Forbidden", success: false });
    }

    const existingUser = await userModel.findById(req.user.userId);
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.userId,
      {
        name: name ? name : existingUser.name,
        email: email ? email : existingUser.email,
      },
      { new: true }
    );
    return res.status(200).json({
      user: updatedUser,
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Failed to get user", success: false });
    }
    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Forbidden", success: false });
    }

    const user = await userModel.findById(req.user.userId).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ message: "Failed to get user", success: false });
    }

    const passwordMatch = await argon2.verify(user.password, oldPassword);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid old password", success: false });
    }

    const hashedPassword = await argon2.hash(newPassword);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Internal server error",
    });
  }
};
