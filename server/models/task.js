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
        required: true
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    mentorEmail:{
        type: String,
    }


})

const Task = mongoose.model('tasks', TaskSchema);

module.exports = Task;
