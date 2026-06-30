import express from "express";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendNewUserNotificationToAdmins } from "../services/emailService.js";
import {
  authRateLimiter,
  sensitiveOperationLimiter,
} from "../middleware/rateLimiter.js";
import {
  validateUserRegistration,
  validateUserLogin,
} from "../middleware/validation.js";

const router = express.Router();

// Register user
router.post(
  "/register",
  authRateLimiter,
  validateUserRegistration,
  async (req, res) => {
    try {
      const { name, email, password, role, domain, domains } = req.body;
      console.log(name)
      // Prepare domains array (validation already handled by middleware)
      const userDomains =
        domains && domains.length > 0 ? domains : domain ? [domain] : null;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        role,
        domains: userDomains,
        domain: userDomains[0], // Set primary domain for backward compatibility
      });

      await user.save();

      // Generate token
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      }); // 15 min
      res.cookie("refreshToken", refreshToken, cookieOptions);

      // Return user data without password
      const {
        password: pwd,
        refreshToken: rt,
        ...userWithoutPassword
      } = user.toObject();

      // Send notification to admins
      try {
        await sendNewUserNotificationToAdmins(
          user.name,
          user.email,
          user._id,
          user.role,
          user.domains
        );
        console.log(
          "Admin notification sent successfully for new user:",
          user.email
        );
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // Continue with registration even if email fails
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully. Awaiting admin approval.",
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        pendingApproval: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
    }
  }
);

// Login user
router.post("/login", authRateLimiter, validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (validation already handled by middleware)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check user approval status
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is pending admin approval. Please wait for approval.",
        status: "pending",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected. Please contact support.",
        status: "rejected",
      });
    }

    // Generate token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    }); // 15 min
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Return user data without password
    const {
      password: pwd,
      refreshToken: rt,
      ...userWithoutPassword
    } = user.toObject();

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});
// Refresh access token
router.post("/refresh", sensitiveOperationLimiter, async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken();

    // Set new access token cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
});

// Logout user
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Find user and clear refresh token from database
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decoded._id);

      if (user) {
        await user.clearRefreshToken();
      }
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    // Even if token is invalid, clear cookies and return success
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
});

export default router;
