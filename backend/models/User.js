import { Schema } from "mongoose";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must not exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, "Email must not exceed 100 characters"],
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password must not exceed 128 characters"],
      validate: {
        validator: function (password) {
          // Only validate if this is a new password (not already hashed)
          if (this.isModified("password") && !password.startsWith("$2a$")) {
            const hasLower = /[a-z]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            return hasLower && hasUpper && hasNumber && hasSpecial;
          }
          return true; // Skip validation for already hashed passwords
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    role: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
      required: true,
    },
    domains: {
      type: [String],
      enum: [
        "Web Development",
        "Content Writing",
        "Graphic Designing",
        "Video Editing",
        "General",
      ],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one domain must be selected",
      },
    },
    // Keep the old domain field for backward compatibility (can be removed later)
    domain: {
      type: String,
      enum: [
        "Web Development",
        "Content Writing",
        "Graphic Designing",
        "Video Editing",
        "General",
      ],
      required: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
      domain: this.domain,
      domains: this.domains, // Include domains array in token
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

userSchema.methods.clearRefreshToken = function () {
  this.refreshToken = null;
  return this.save();
};

export const User = mongoose.model("User", userSchema);
