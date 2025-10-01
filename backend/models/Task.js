import { Schema } from "mongoose";
import mongoose from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title must not exceed 200 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, "Description must not exceed 5000 characters"],
    },
    taskMaker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    domain: {
      type: String,
      enum: [
        "Web Development",
        "Content Writing",
        "Graphic Designing",
        "Video Editing",
        "General",
      ],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed", "overdue"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    notifications: {
      assigned: {
        type: Boolean,
        default: false,
      },
      reminded: {
        type: Date,
        default: null,
      },
      remindersSent: {
        fiveDays: {
          type: Boolean,
          default: false,
        },
        threeDays: {
          type: Boolean,
          default: false,
        },
        oneDay: {
          type: Boolean,
          default: false,
        },
        overdue: {
          type: Boolean,
          default: false,
        },
      },
    },
    reminderStart: {
      type: Date,
      default: null,
    },
    reminderEnd: {
      type: Date,
      default: null,
    },
    reminderIntervalMinutes: {
      type: Number,
      default: 1440, // Default to daily (24*60)
    },
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Add method to check if task is overdue
taskSchema.methods.isOverdue = function () {
  return new Date() > this.dueDate && this.status !== "completed";
};

// Virtual to get task maker name
taskSchema.virtual("taskMakerName", {
  ref: "User",
  localField: "taskMaker",
  foreignField: "_id",
  justOne: true,
});

// Virtual to get assigned user name
taskSchema.virtual("assignedToName", {
  ref: "User",
  localField: "assignedTo",
  foreignField: "_id",
  justOne: true,
});

export const Task = mongoose.model("Task", taskSchema);
