const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    
    fname:{
      type: String,
      required: true,
    },

    lname:{
      type: String,
      required: true,
    },

    dob:{
      type: String,
      required: true,
    },

     role:{
      type: String,
      required: true,
    },

     email: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    jobtitle:{
      type: String,
      required:false,
    },
    employmentType:{
      type: String,
      required:false,
    },
    department:{
      type: String,
      required:false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    cvUrl :{
      type: String,
      required: false,
    },
 
  university: {
    type: String,
   // required: true
  },

  GPA: {
    type: Number,
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
  
  mentorEmail: {
    type: String,
  
  },
  phonenumber: {
    type: Number,
   // required: true
  },
  Bio:{
    type: String,
    
  },
  schedules: [{
    title: String,
    start: Date,
    end: Date,
  }],
  leaveApplications: [{
    leaveDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  }],
  
   },
  );
   userSchema.pre("save", async function () {
     this.password = await bcrypt.hash(this.password, 12);

     });
   
const User = mongoose.model("users", userSchema);

module.exports = User;