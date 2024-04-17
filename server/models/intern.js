const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  university: {
    type: String,
    required: true
  },
  GPA: {
    type: String,
    required: true
  },
  interviewScore: {
    type: Number,
    required: true
  },
  interviewFeedback: {
    type: String,
    required: true
  },
  evaluationScore: {
    type: Number,
    required: true
  },
  evaluationFeedback: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  mentor: {
    type: String,
    required: true
  },
  accomplishments: {
    type: String,
    required: true
  },
  Bio:{
    type: String,
    required: false
  },

  fileURL: {
    type: String,
    required: false
  }
  /*
  fileURL: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cvfiles', // Reference to the Cvfiles model
    required: false
  }
*/
});

const Intern = mongoose.model("Interns", internSchema);

module.exports = Intern;
