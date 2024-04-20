const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // Reference to the User model
    required: true
  },

  university: {
    type: String,
   // required: true
  },

  GPA: {
    type: String,
   // required: true
  },

  interviewScore: {
    type: Number,
   // required: true
  },

  interviewFeedback: {
    type: String,
   // required: true
  },


  mentor: {
    type: String,
    //required: true
  },
  accomplishments: {
    type: String,
   // required: true
  },
  Bio:{
    type: String,
    
  }
});

module.exports = mongoose.model("Intern", internSchema);
