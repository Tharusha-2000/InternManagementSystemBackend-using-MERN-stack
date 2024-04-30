const mongoose = require('mongoose');

const evaluationFormDetailsSchema = new mongoose.Schema({
    // Define your schema fields here
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Reference to the User model
        required: true
    },
    // Add more fields as needed
    
    eformstates: {
        type: String,
        required: true,
        default: 'not created'
    },
});

const Evaluationformdetails = mongoose.model('Evaluationformdetails', evaluationFormDetailsSchema);

module.exports = Evaluationformdetails;