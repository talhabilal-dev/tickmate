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
    if (user.role !== "user") {
      tickets = Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user.userId })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
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

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = Ticket.findOne({
        createdBy: user.userId,
        _id: req.params.id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      return res
        .status(404)
        .json({ message: "Ticket not found", success: false });
    }
    return res.status(404).json({ ticket, success: true });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
