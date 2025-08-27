import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    taskMaker: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    domain: {
        type: String,
        enum: ['Web Development', 'Content Writing', 'Graphic Designing', 'Video Editing', 'General'],
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["todo", "in-progress", "completed", "overdue"],
        default: "todo"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

// Add method to check if task is overdue
taskSchema.methods.isOverdue = function() {
    return new Date() > this.dueDate && this.status !== 'completed';
};

// Virtual to get task maker name
taskSchema.virtual('taskMakerName', {
    ref: 'User',
    localField: 'taskMaker',
    foreignField: '_id',
    justOne: true
});

// Virtual to get assigned user name
taskSchema.virtual('assignedToName', {
    ref: 'User', 
    localField: 'assignedTo',
    foreignField: '_id',
    justOne: true
});

export const Task = mongoose.model("Task", taskSchema);
