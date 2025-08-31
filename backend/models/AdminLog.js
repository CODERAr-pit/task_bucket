import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const adminLogSchema = new Schema({
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['approve_user', 'reject_user', 'delete_user'],
        required: true
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    details: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
