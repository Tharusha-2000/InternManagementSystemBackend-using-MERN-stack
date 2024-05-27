const mongoose = require("mongoose");

const evaluationFormDetailsSchema = new mongoose.Schema({
  // Define your schema fields here
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to the User model
    required: true,
  },
  // Add more fields as needed

  eformstates: {
    type: String,
    required: true,
    default: "not created",
  },
  evaluator: {
    type: String,
    required: true,
  },
  job_performance_criterias_evaluator: {
    type: [String],
  },
  core_values_criterias_evaluator: {
    type: [String],
  },
  job_performance_criterias_mentor: {
    type: [String],
  },
  core_values_criterias_mentor: {
    type: [String],
  },
  job_performance_scores_evaluator: {
    type: [Number],
  },
  core_values_scores_evaluator: {
    type: [Number],
  },
  job_performance_scores_mentor: {
    type: [Number],
  },
  core_values_scores_mentor: {
    type: [Number],
  },
  overall_performance_mentor: {
    type: Number,
    required: false,
  },
  overall_performance_evaluator: {
    type: Number,
    required: true,
  },
  action_taken_mentor: { 
    type: String, 
    required: false 
},
  comment_evaluator: { 
    type: String, 
    required: false 
},
  comment_mentor: {
     type: String, 
     required: false 
    },

  evaluate_before: {
    type: Date,
    required: true,
  },
});

const Evaluationformdetails = mongoose.model(
  "Evaluationformdetails",
  evaluationFormDetailsSchema
);

module.exports = Evaluationformdetails;
