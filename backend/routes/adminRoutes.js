import express from "express";
import { User } from "../models/User.js";
import { AdminLog } from "../models/AdminLog.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminOperationsLimiter,
  sensitiveOperationLimiter,
} from "../middleware/rateLimiter.js";
import {
  validateAdminAction,
  validateObjectId,
} from "../middleware/validation.js";
import {
  sendUserApprovalEmail,
  sendUserRejectionEmail,
} from "../services/emailService.js";

const router = express.Router();

// Get pending users
router.get(
  "/users/pending",
  authenticate,
  requireAdmin,
  adminOperationsLimiter,
  async (req, res) => {
    try {
      const pendingUsers = await User.find({ status: "pending" })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        users: pendingUsers,
      });
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching pending users",
        error: error.message,
      });
    }
  }
);

// Get all users
router.get(
  "/users",
  authenticate,
  requireAdmin,
  adminOperationsLimiter,
  async (req, res) => {
    try {
      const users = await User.find({})
        .select("-password -refreshToken")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error.message,
      });
    }
  }
);

// Approve user
router.post(
  "/users/:id/approve",
  authenticate,
  requireAdmin,
  sensitiveOperationLimiter,
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "User is not in pending status",
        });
      }

      // Update user status
      user.status = "active";
      user.approvedBy = req.user._id;
      user.approvedAt = new Date();
      await user.save();

      // Log admin action
      const adminLog = new AdminLog({
        admin: req.user._id,
        action: "approve_user",
        targetUser: user._id,
        details: `Approved user: ${user.email}`,
      });
      await adminLog.save();

      // Send approval email
      try {
        await sendUserApprovalEmail(user.email, user.name);
        console.log("Approval email sent to user:", user.email);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Don't fail the approval if email fails
      }

      res.json({
        success: true,
        message: "User approved successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({
        success: false,
        message: "Error approving user",
        error: error.message,
      });
    }
  }
);

// Reject user
router.post(
  "/users/:id/reject",
  authenticate,
  requireAdmin,
  sensitiveOperationLimiter,
  validateObjectId,
  validateAdminAction,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "User is not in pending status",
        });
      }

      // Update user status
      user.status = "rejected";
      await user.save();

      // Log admin action
      const adminLog = new AdminLog({
        admin: req.user._id,
        action: "reject_user",
        targetUser: user._id,
        details: `Rejected user: ${user.email}. Reason: ${
          reason || "No reason provided"
        }`,
      });
      await adminLog.save();

      // Send rejection email
      try {
        await sendUserRejectionEmail(user.email, user.name, reason);
        console.log("Rejection email sent to user:", user.email);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Don't fail the rejection if email fails
      }

      res.json({
        success: true,
        message: "User rejected successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      res.status(500).json({
        success: false,
        message: "Error rejecting user",
        error: error.message,
      });
    }
  }
);

// Delete user (only non-admin users)
router.delete(
  "/users/:id",
  authenticate,
  requireAdmin,
  sensitiveOperationLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent deletion of admin users
      if (user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete admin users",
        });
      }

      // Prevent self-deletion
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete your own account",
        });
      }

      // Log admin action before deletion
      const adminLog = new AdminLog({
        admin: req.user._id,
        action: "delete_user",
        targetUser: user._id,
        details: `Deleted user: ${user.email} (${user.name})`,
      });
      await adminLog.save();

      // Delete the user
      await User.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error.message,
      });
    }
  }
);

// Get admin activity logs
router.get("/logs", authenticate, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AdminLog.find({})
      .populate("admin", "name email")
      .populate("targetUser", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalLogs = await AdminLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: {
        total: totalLogs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalLogs / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin logs",
      error: error.message,
    });
  }
});

// Get admin dashboard stats
router.get("/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const pendingCount = await User.countDocuments({ status: "pending" });
    const activeCount = await User.countDocuments({ status: "active" });
    const rejectedCount = await User.countDocuments({ status: "rejected" });
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ isAdmin: true });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          pending: pendingCount,
          active: activeCount,
          rejected: rejectedCount,
          admins: adminCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin stats",
      error: error.message,
    });
  }
});

export default router;
