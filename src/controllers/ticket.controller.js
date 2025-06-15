import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.model.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;

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
    let tickets = [];

    if (user.role === "admin") {
      // Admin or other privileged roles: get all tickets
      tickets = await Ticket.find({})
        .populate("assignedTo", "name email _id") // fetch full name + email
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Regular user: get only their created tickets
      tickets = await Ticket.find({ createdBy: user.userId })
        .select("title description status createdAt assignedTo helpfulNotes")
        .populate("assignedTo", "name")
        .sort({ createdAt: -1 })
        .lean();
    }

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
      .select("title description status createdAt assignedTo helpfulNotes")
      .populate("assignedTo", "name")
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
