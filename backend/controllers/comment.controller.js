import { Task } from "../models/Task.js";
import { User } from "../models/User.js";

// Add a comment to a task
export const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  // Validation is now handled by middleware
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  task.comments.push({ user: userId, text });
  await task.save();

  res.status(201).json({ message: "Comment added", comments: task.comments });
};

// Get all comments for a task
export const getComments = async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId).populate(
    "comments.user",
    "name email avatar"
  );
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json({ comments: task.comments });
};
