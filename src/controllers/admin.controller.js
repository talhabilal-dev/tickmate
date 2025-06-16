import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admins only",
        success: false,
      });
    }

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admins only",
        success: false,
      });
    }

    const tickets = await Ticket.find({})
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Tickets fetched successfully",
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admins only",
        success: false,
      });
    }

    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied", success: false });
    }
    console.log(admin);

    const [users, tickets, inProgressCount, completedCount, activeUsersCount] =
      await Promise.all([
        User.find().sort({ createdAt: -1 }),
        Ticket.find().populate("createdBy assignedTo", "name email").sort({
          createdAt: -1,
        }),
        Ticket.countDocuments({ status: "in_progress" }),
        Ticket.countDocuments({ status: "closed" }),
        User.countDocuments({ status: "active" }),
      ]);

    res.json({
      success: true,
      adminProfile: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        skills: admin.skills,
        status: admin.status,
      },
      users,
      tickets,
      stats: {
        totalUsers: users.length,
        totalTickets: tickets.length,
        inProgressTickets: inProgressCount,
        completedTickets: completedCount,
        activeUsers: activeUsersCount,
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res
      .status(500)
      .json({ message: "Server error loading dashboard", success: false });
  }
};
