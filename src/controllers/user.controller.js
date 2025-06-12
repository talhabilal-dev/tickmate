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
      .json({ user, success: true, message: "User created successfully" });
  } catch (error) {
    console.log(error);
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
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      ENV.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ user, success: true, message: "User logged in successfully" });
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
    res.clearCookie("token");
    return res
      .status(200)
      .json({ message: "User logged out successfully", success: true });
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

  console.log(skills);
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
    const { fullName, email } = req.body;

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
        name: fullName ? fullName : existingUser.name,
        email: email ? email : existingUser.email,
      },
      { new: true }
    );
    return res.status(200).json(
      res.status(200).json({
        user: updatedUser,
        success: true,
        message: "User updated successfully",
      })
    );
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
