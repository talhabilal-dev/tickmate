import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";

export const createTicket = async (req, res) => {
  try {
    if (!req.user.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const { title, description, category, deadline } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title and description are required",
        success: false,
      });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      category,
      createdBy: req.user.userId,
      deadline,
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user.userId.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created and processing started",
      success: true,
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;

    // Regular user: get only their created tickets
    const tickets = await Ticket.find({ createdBy: user.userId })
      .select(
        "title description status createdAt assignedTo helpfulNotes relatedSkills updatedAt priority deadline category createdBy updatedAt"
      )
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Tickets fetched successfully",
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const toggleTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { status: "closed" },
      { new: true }
    );
    return res.status(200).json({
      message: "Ticket status updated",
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket status", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const assignedTickets = async (req, res) => {
  const user = req.user;

  try {
    const tickets = await Ticket.find({ assignedTo: user.userId })
      .select(
        "title description status createdAt assignedTo helpfulNotes updatedAt relatedSkills priority deadline category createdBy updatedAt"
      )
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Tickets fetched successfully",
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching assigned tickets:", error.message);
    return res.status(500).json({
      error: error.message,
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const ticketReply = async (req, res) => {
  try {
    const { message, ticketId } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
        success: false,
      });
    }

    if (req.user.role !== "moderator" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Moderators and Admins only",
        success: false,
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({
        message: "Ticket is already closed",
        success: false,
      });
    }

    if (ticket.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to reply to this ticket",
        success: false,
      });
    }
    ticket.replies.push({
      message,
      createdAt: new Date(),
      createdBy: req.user.userId,
    });
    await ticket.save();
    return res.status(200).json({
      message: "Ticket reply updated",
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Error replying to ticket:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getUserTicketSummary = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔹 Fetch all user's tickets for display
    const tickets = await Ticket.find({ createdBy: userId })
      .select("title assignedTo priority createdAt status relatedSkills")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .lean();

    // 🔹 Compute current summary
    const totalTickets = tickets.length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const completed = tickets.filter((t) => t.status === "closed").length;

    // 🔹 Define time windows (last 7 days vs previous 7 days)
    const now = new Date();
    const startOfCurrent = new Date();
    startOfCurrent.setDate(now.getDate() - 7);

    const startOfPrevious = new Date();
    startOfPrevious.setDate(now.getDate() - 14);
    const endOfPrevious = new Date();
    endOfPrevious.setDate(now.getDate() - 7);

    // 🔹 Fetch previous period tickets for comparison
    const previousTickets = await Ticket.find({
      createdBy: userId,
      createdAt: { $gte: startOfPrevious, $lt: endOfPrevious },
    })
      .select("status")
      .lean();

    const previousSummary = {
      totalTickets: previousTickets.length,
      inProgress: previousTickets.filter((t) => t.status === "in_progress")
        .length,
      completed: previousTickets.filter((t) => t.status === "closed").length,
    };
    return res.status(200).json({
      success: true,
      message: "User ticket summary fetched successfully",
      summary: {
        totalTickets,
        inProgress,
        completed,
      },
      previousSummary,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching user ticket summary:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        message: "Ticket ID is required",
        success: false,
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    if (
      ticket.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this ticket",
        success: false,
      });
    }

    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    return res.status(200).json({
      message: "Ticket deleted successfully",
      success: true,
      ticket: deletedTicket,
    });
  } catch (error) {
    console.error("Error deleting ticket", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

export const editTicket = async (req, res) => {
  try {
    const {
      _id,
      title,
      description,
      category,
      deadline,
      status,
      priority,
      assignedTo,
      helpfulNotes,
      relatedSkills,
    } = req.body;

    const ticketId = await _id.toString();

    if (!req.user.userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    if (!ticketId) {
      return res.status(400).json({
        message: "Ticket ID is required",
        success: false,
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    if (
      ticket.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to edit this ticket",
        success: false,
      });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (deadline) ticket.deadline = deadline;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (helpfulNotes) ticket.helpfulNotes = helpfulNotes;

    ticket.updatedAt = new Date();

    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({
          message: "Assigned user not found",
          success: false,
        });
      }
      ticket.assignedTo = user._id;
    }

    if (relatedSkills) {
      if (Array.isArray(relatedSkills)) {
        ticket.relatedSkills = relatedSkills.map((skill) => skill.trim());
      } else if (typeof relatedSkills === "string") {
        ticket.relatedSkills = relatedSkills.split(",").map((s) => s.trim());
      } else {
        return res.status(400).json({
          message: "Related skills must be an array or comma-separated string",
          success: false,
        });
      }
    }

    await ticket.save();
    const updatedTicket = await Ticket.findById(ticketId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .select(
        "title description status createdAt assignedTo helpfulNotes relatedSkills updatedAt priority deadline category createdBy updatedAt"
      )
      .lean();

    return res.status(200).json({
      message: "Ticket updated successfully",
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error editing ticket", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
