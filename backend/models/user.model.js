import mongoose from "mongoose";

// Goal schema
const goalSchema = new mongoose.Schema({
    text: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ['timeles', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'timeles'
    },
}, { timestamps: true });

// Subtask Schema
const subtaskSchema = new mongoose.Schema({
    text: { type: String },
    completed: { type: Boolean, default: false },
}, { timestamps: true }); // Add timestamps to subtask schema

// Task Schema
const taskSchema = new mongoose.Schema({
    text: { type: String },
    description: { type: String },
    completed: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['backlog', 'ongoing', 'completed'],
        default: 'backlog'
    },
    dueDate: { type: Date },
    subtasks: [subtaskSchema], // Use subtask schema here
    timeSpent: { type: Number, default: 0 }, // Time spent in seconds
    isTracking: { type: Boolean, default: false }, // Whether tracking is active
    lastStartTime: { type: Date } 
}, { timestamps: true }); // Add timestamps to task schema

// User Schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        // Consider adding password hashing here
    },
    organization: {
        type: String,
        required: true, 
    },
    profileImage: {
        type: String
    },
    test: {
        type: String,
    },
    todayTasks: [taskSchema], // Use task schema here
    goals: [goalSchema],
    pages: [
        {
            slug: { type: String, required: true, unique: true },
            title: { type: String, required: true },
            iconClass: { type: String },
            content: { type: String },
            images: [{ type: String }]
        }
    ],
    pagesContent: { type: String },
    upcoming: { type: String }
}, { timestamps: true }); 

const User = mongoose.model("User", userSchema);

// Define the standalone functions
const findOne = async (criteria) => {
    try {
        return await User.findOne(criteria);
    } catch (error) {
        throw new Error(error);
    }
};

const findById = async (id) => {
    try {
        return await User.findById(id);
    } catch (error) {
        throw new Error(error);
    }
};

const findByIdAndUpdate = async (id, update) => {
    try {
        return await User.findByIdAndUpdate(id, update, { new: true });
    } catch (error) {
        throw new Error(error);
    }
};

// Export the functions and the model
export default User;
export { findOne, findById, findByIdAndUpdate };