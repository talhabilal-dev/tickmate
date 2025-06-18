import mongoose, { Schema } from "mongoose";

const TicketSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed"],
      default: "todo",
      required: true,
    },
    category: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    deadline: Date,
    helpfulNotes: String,
    relatedSkills: [String],
    replies: {
      type: [
        {
          message: String,
          createdAt: Date,
          createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      default: [],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
