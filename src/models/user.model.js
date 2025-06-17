import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  loginTime: { type: Date, default: Date.now },
  password: { type: String, required: true, select: false },
  role: { type: String, default: "user", enum: ["user", "moderator", "admin"] },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model("User", UserSchema);
