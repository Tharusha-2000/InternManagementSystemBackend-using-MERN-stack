const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    
    _userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    mentorEmail:{
        type: String,
    },
    isVerified:{
        type: Boolean,
        default: false
    }


}, {
    timestamps: true 
});

const Task = mongoose.model('tasks', TaskSchema);

module.exports = Task;
