const User = require("../models/user.js");
const EvaluationFormDetails = require('../models/Evaluationformdetails');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const Task = require("../models/task.js");

/*..............................login page.............................................*/

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ loginStatus: false, msg: "Incorrect email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ loginStatus: false, msg: "Incorrect password" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(200).json({
      msg: "Login Successful...!",
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ loginStatus: false, Error: "Internal Server Error" });
  }
};


/*generateOTP in 6 digit */
exports.generateOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.json({ msg: "User not registered" });
    } else {
      const otp = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      // Store OTP in req.app.locals for later verification if needed
      req.app.locals.OTP = otp;

      const otpTimeout = setTimeout(() => {
        req.app.locals.OTP = null;
      }, 1 * 60 * 1000);


      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};


/* verifyOTP that email */
exports.verifyOTP = async (req, res) => {
  const { code } = req.query;
  

  // Check if the OTP is valid
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.resetSession = true; // start session for reset password
    res.status(201).send({ msg: "Verify Successsfully!" });
  } else {
    res.status(400).send({ msg: "Invalid OTP" });
  }

  // Reset the OTP value regardless of whether it was valid or not
  req.app.locals.OTP = null;
};


/* reset password */
exports.resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).json({ msg: "Session expired!" });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ message: "User not registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.updateOne(
        {
          email: email,
        },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      req.app.locals.resetSession = false; // reset session
      return res.status(201).json({ msg: "Record Updated...!" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  } catch (error) {
    return res.status(401).json({ error: "Invalid Request" });
  }
};

/*.............................registation add user table............................*/

 // Fetch all users from the user database
exports.getUsers = async (req, res) => {
  try {
  
    // Fetch all users from the database
    const users = await User.find();
    const data = res.status(201).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};

// Get user by ID
exports.getUserById= async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

   
      res.status(201).json({ success: true, user});
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 // deleteuser  from the user database
exports.deleteUser = async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findByIdAndDelete(id);
     // Delete tasks associated with the user
                 await Task.deleteMany({ _userId: id });   
                 await EvaluationFormDetails.deleteMany({ user: id });  

    //if loguser delete him  then active this 
     if (req.data.id === id) {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }

    if (!user) {
      return res.status(404).json("User not found");
    }
      

    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};


// changerole  from the user database
exports.changeRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;
  try {
   
    //console.log(id);
    const user = await User.findById(id);

    //not necessary
    if (!user) {
      return res.status(404).json("User not found");
    }
    
    if (req.data.id === id) {
      return res.status(403).json({ msg: "You cannot change your own role" });
    }
    
     if(user.role === role){
      return res.status(400).json({ msg: "Role is already set to " + role });
    }
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          role: role,
        },
      }
    );

 

    return res.status(201).json({ msg: "Record Updated...!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};





//register user
exports.register = async (req, res, next) => {
  try {
 
    const { fname, lname, dob, role, gender, email, password,jobtitle,employmentType,department} = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ msg: "User already exists" });
    }
    const user = await User.create({
      fname,
      lname,
      dob,
      role,
      gender,
      email,
      password,
      jobtitle,
      employmentType,
      department,
    });

    console.log(req.data); 

      res.locals.userData = { email, password , user};
    next();
  } catch (error) {
    console.error(error);
  }
};

/*..............................create user profile.............................. */
//read user profile
exports.getUser = async (req, res) => {
  try {  
    const {id} = req.data;
    const user = await User.findById(id);
    
    
      res.status(201).json({ success: true,user });
      } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };


//update user profile
exports.updateuser=async (req, res) => {
    const { id } = req.data;
    try {
    
      const body = req.body;
      // Update the data
      const result = await User.updateOne({ _id: id}, body);
      
      if (result.nModified === 0) {
        return res.status(404).send({ error: "User not found or no changes applied" });
      }
      return res.status(200).send({ msg: "Record Updated" });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  };

  //upload photo user
  exports.uploadImageByuser=async (req, res) => {

    const { id } = req.data;
    console.log(req.body);
    
        try {
          const updateduser = await User.findByIdAndUpdate(id, req.body, { new: true });
          if (!updateduser) {
            return res.status(404).json({ message: ' user not found' });
          }
          res.json({msg:"update successfully", updateduser});
          
        } catch (error) {
          res.status(500).json({ msg: "Internal Server Error" });
        }
  
  };

  /*......................................intern table create.......................*/
// Read Intern Users
exports.getInternList = async (req, res) => {
  try {
  
    // Fetch all users from the database
    const interns = await User.find({ role: 'intern' });
                   res.status(201).json({ success: true, interns });
  }catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Intern by ID
exports.getIntern= async (req, res) => {
  try {
    const intern = await User.findById(req.params.id);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
   
      res.status(201).json({ success: true, intern});
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Intern User
exports.updatedIntern= async (req, res) => {
  try {
    const { id } = req.params;

    const updatedIntern = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedIntern) {
      return res.status(404).json({ message: 'Intern user not found' });
    }
    res.json({msg:"update successfully", updatedIntern});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }, 'fname lname email').lean();

    const mentorsWithFullName = mentors.map(mentor => ({
      fullName: mentor.fname + ' ' + mentor.lname,
      email: mentor.email
    }));

    res.json(mentorsWithFullName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


 /*......................................intern profile create.......................*/

 exports.updateinternprofile=async (req, res) => {
  const { id } = req.data;
  
  try {
    const body = req.body;
    // Update the data
    const result = await User.updateOne({ _id: id}, body);

    if (result.nModified === 0) {
      return res.status(404).send({ error: "User not found or no changes applied" });
    }
    return res.status(200).send({ msg: "Record Updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};



/*......................................project details.......................*/

exports.getInternsWithTasks = async (req, res) => {
  try {
    // Find all tasks
    const tasks = await Task.find();

    // Extract unique user IDs from tasks
    const userIds = [...new Set(tasks.map(task => task._userId.toString()))];

    // Find users with those IDs and role 'intern'
    const interns = await User.find({
      _id: { $in: userIds },
      role: 'intern'
    });

    if (!interns.length) {
      return res.status(404).json({ message: 'No interns with tasks found' });
    }

    res.status(200).json({ success: true, interns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getTask=async (req, res)=> {
  const { id } = req.data;
  Task.find({
      _userId:id
  }).then((tasks) => {
     res.json(tasks);
  }).catch((e) => {
      res.json(e);
  });
};


exports.createTask=async(req, res) =>{
  const { id } = req.data;
  let title = req.body.title;
  
  try{
    const task = await Task.create({
      title: title,
      _userId: id
    });
    console.log(task);
  res.status(201).json(task);
  }catch(error){
    res.status(400).json({ error: error.message });
   
  }
};

exports.deleteTask= async (req, res) => {
  try {
  
    let id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
      
    if (!task) {
      return res.status(404).json("task not found");
    }
    

    res.status(200).send({ msg: "task deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


exports.updateTask= async (req, res) => {
  const {mentorEmail}=req.user;
  const {id}=req.data;
  console.log(id);
  console.log(mentorEmail);
  try {
    const { id } = req.params;
 
    const updatedtask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedtask) {
      return res.status(404).json({ message: 'task not found' });
    }
    res.json({msg:"update successfully", updatedtask});
    console.log(updatedtask);
    console.log(updatedtask.isComplete);
    
    if(updatedtask.isComplete){
      updatedtask.mentorEmail = mentorEmail;
      await updatedtask.save();
      console.log(mentorEmail);
    }
    if(!updatedtask.isComplete){
      updatedtask.mentorEmail = null;
      await updatedtask.save(); 
     // console.log(updatedtask.mentorEmail);
     }

  } catch (err) {
   
    res.status(400).json({ message: err.message });
  }
};


exports.getTasklistMentorNotification= async (req, res) => {
  try {
    const {email}=req.user;
   // const email = user.email;
    console.log(email);

    const tasks = await Task.find({ mentorEmail:email, isComplete: true })
                         .populate('_userId');
    console.log(tasks);

    
    if (!tasks) {
      return res.status(404).json({ message: 'task not found' });
    }
    res.json(tasks);
   
   } catch (err) {
     res.status(500).json({ message: err.message });
   }
  
}

exports.getTaskVarify= async (req, res) => {
  const id= req.params.id;
  console.log(id);
  try {
  
   const varifytask = await Task.findByIdAndUpdate(id, req.body, { new: true });
   if (!varifytask) {
     return res.status(404).json({ message: 'Task not found' });
   }
   console.log(varifytask.isVerified);
   if(!varifytask.isVerified){
     varifytask.isComplete = false;
     await varifytask.save();
    }

    res.json({msg:"update successfully ", varifytask});
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
};

exports.getTaskIntern=async (req, res)=> {
  const { id } = req.params;
  
  Task.find({
      _userId:id
  }).then((tasks) => {
     res.json(tasks);
  }).catch((e) => {
      res.send(e);
  });

  
};


//secure password
exports.secure = async (req, res) => {
  const { id } = req.data;
  const { Oldpassword, Newpassword } = req.body;

  try {
    const user = await User.findById(id);
    
    const validPassword = await bcrypt.compare(Oldpassword, user.password);
    if (!validPassword) {
      return res.status(400).send({ msg: "Invalid old password." });
    }
    const hashedPassword = await bcrypt.hash(Newpassword, 12);
    user.password = hashedPassword;

    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    return res.status(201).send({ msg: "Record Updated...!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
};

/*......................................cv upload.......................*/

   //upload cv user
   exports.uploadcvByAdmin=async (req, res) => {
  
   const { cvUrl } = req.body;
   const { userId } = req.params; 
 
    if (!cvUrl || !userId) {
      return res.status(400).json({ msg: "Please provide both cvfileURL and userId" });
    }
        try {
          const updateduser = await User.findByIdAndUpdate(userId, { cvUrl }, { new: true });
          if (!updateduser) {
            return res.status(404).json({ message: ' user not found' });
          }
          res.json({msg:" Update cv file successfully", updateduser});
          
        } catch (error) {
          res.status(500).json({ msg: "Internal Server Error" });
        }
  
  };

  exports.deletecvByAdmin=async (req, res) => {
   const { userId } = req.params;
    console.log(req.body);
        try {
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          if (user.cvUrl === null) {
          return res.json({ msg: "CV URL is null", user });
         }
         await User.updateOne({ _id: userId }, { cvUrl: null });
         user.cvUrl = null;
          res.json({ msg: "CV URL deleted", user });
        } catch (error) {
          res.status(500).json({ msg: "Internal Server Error" });
        }
  
  };

 /*......................................work schedule.......................*/

 exports.createWorkSchedule = async (req, res) => {

  const { id } = req.data;  
  const { schedules: newSchedules } = req.body;  
   try {
    const user = await User.findById(id);
    const updatedSchedules = [...user.schedules, ...newSchedules];
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { schedules: updatedSchedules },
      { new: true }
    );
    res.json({ msg: "Schedules updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

exports.deleteWorkSchedule = async (req, res) => {
  const {id} = req.data;  
  const {eventId} = req.params;
  console.log(id);
   try {
    const user = await User.findById(id);
    await User.updateOne({ _id: id }, { $pull: { schedules: { _id: eventId } } });
    user.schedules = user.schedules.filter(schedule => schedule._id.toString() !== eventId);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error("Error deleting work schedule:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.fetchAllUsers = async (req, res) => {
  try {
  
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};

/*......................................Leave............................................*/
exports.applyLeave = async (req, res) => { 
  const {id}= req.data;
  const {  leaveDate, reason } = req.body;

  if ( !leaveDate || !reason) {
    return res.status(400).json({ message: 'Please provide userId, leaveDate, and reason for the leave.' });
  }

  try {
    const leaveApplication = { leaveDate, reason };
    await User.updateOne({ _id: id }, { $push: { leaveApplications: leaveApplication } });

    res.status(201).json({ message: 'Leave application submitted successfully', leaveApplication });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaveApplications = async (req, res) => {


  try {
  
    const usersWithLeaveApplications = await User.find({ leaveApplications: { $exists: true, $not: { $size: 0 } } })
      .select('leaveApplications fname lname jobtitle imageUrl') 
      .lean();
    const leaveApplications = usersWithLeaveApplications.flatMap(user => 
      user.leaveApplications.map(application => ({
        ...application,
        user: { userid:user._id,fname: user.fname, lname: user.lname, jobtitle: user.jobtitle, imageUrl: user.imageUrl } 
      }))
    );
    res.status(200).json({ leaveApplications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.updateLeaveStatus = async (req, res, next) => {
  const {id}=req.data;
  const {userId,leaveApplicationId, status } = req.body;
  try {
  const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(id===userId){
      return res.status(403).json({ message: 'You do not have permission to access this function' });
    }
      
    const leaveApplication = user.leaveApplications.id(leaveApplicationId);
    if (!leaveApplication) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

      await User.updateOne(
      { _id: userId },
      { $set: { "leaveApplications.$[elem].status" : status } },
      { arrayFilters: [ { "elem._id": leaveApplicationId } ] }
    );

  
    if (status === 'Approved' && user.role === 'mentor') {
           leavedate=leaveApplication.leaveDate;
           mentoremail=user.email;
           mentorname=user.fname + " " + user.lname;
           console.log(mentoremail,leavedate,mentorname);
           const users = await User.find({ mentorEmail: mentoremail, role: 'intern' });
           res.locals.userData = { mentoremail,leavedate,mentorname ,users};
         next();
    }
    res.status(200).json({ message: 'Leave status updated successfully', leaveApplication });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


/*......................................send email to user.......................*/
  exports.sendEmailToUsers = async (req, res, next) => {
    const { email, subject, message } = req.body;
    try {
     
      UserEmail=req.user.email;
      
      const emailUser = await User.findOne({ email});
      if (!emailUser) {
        return res.status(403).json({msg: "user not found "});
      }
      res.locals.userData = { email, subject, message,UserEmail };
      next();
    } catch (error) {
      console.error(error);
    }
  };
 

  

/*......................................evaluvation......................*/
exports.getEvInterns = async (req, res) => {
  try {

    const users = await User.find({ role: "intern" }).lean();

    const promises = users.map(async (user) => {
      let evaluationFormDetails = await EvaluationFormDetails.findOne({
        user: user._id,
      }).lean();

      // If there's no EvaluationFormDetails document for this user, create one
      if (!evaluationFormDetails) {
        evaluationFormDetails = new EvaluationFormDetails({
          user: user._id, // Set the user field to the id of the user
          evaluator: " ",
          overall_performance_mentor: 0,
          overall_performance_evaluator: 0,
          action_taken_mentor: " ",
          comment_mentor: " ",
          comment_evaluator: " ",
          evaluate_before: new Date(),
          // Set other fields as needed
        });

        // Save the EvaluationFormDetails document
        await evaluationFormDetails.save();
      }

      return {
        name: user.fname + " " + user.lname,
        mentor: user.mentor,
        eformStatus: evaluationFormDetails ? evaluationFormDetails.eformstates : null,
        evaluationFormDetailsId: evaluationFormDetails ? evaluationFormDetails._id : null,
        imageUrl: user.imageUrl // Correctly placed outside the ternary operator
      };
    });

    const userDetails = await Promise.all(promises);

    // Get the ids of all interns
    const internIds = users.map((user) => user._id);

    // Remove EvaluationFormDetails documents that don't have a corresponding intern
    await EvaluationFormDetails.deleteMany({ user: { $nin: internIds } });

    res.json(userDetails); // Send the userDetails as the response
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvaluators = async (req, res) => {
  try {
    // Find all users where role is 'evaluator' and only return the _id, fname, lname, and email fields
    const evaluators = await User.find({ role: { $in: ['evaluator'] } }, '_id fname lname email').lean();

    // Map over the evaluators and combine the _id, fname, lname, and email fields
    const evaluatorDetails = evaluators.map(evaluator => ({
      id: evaluator._id, // Include the user ID
      name: evaluator.fname + ' ' + evaluator.lname,
      email: evaluator.email
    }));

    // Send the evaluator details in the response
    res.json(evaluatorDetails);
  } catch (err) {
    // Send an error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};

exports.postEvaluatorName = async (req, res) => {
  try {
    const { id, evaluatorName, evaluatorEmail, evaluatorId, jobPerformanceCriteriasEvaluator, coreValuesCriteriasEvaluator, jobPerformanceCriteriasMentor, coreValuesCriteriasMentor, evaluateBefore } = req.body;
    // Check if all the fields are filled
    const allFieldsFilled = evaluatorName && evaluatorEmail && jobPerformanceCriteriasEvaluator && coreValuesCriteriasEvaluator && jobPerformanceCriteriasMentor && coreValuesCriteriasMentor && evaluateBefore;

    // Log evaluateBefore
    console.log('evaluateBefore:', evaluateBefore);

    // Log the request body
    console.log('Request body:', req.body);
  
    // Find the EvaluationFormDetails document with the given ObjectId and update it
    const updatedDocument = await EvaluationFormDetails.findByIdAndUpdate(id, 
      { 
        evaluator: evaluatorName,
        evaluator_email: evaluatorEmail, // Add this line to include the evaluator's email
        evaluator_id: evaluatorId, 
        job_performance_criterias_evaluator: jobPerformanceCriteriasEvaluator,
        core_values_criterias_evaluator: coreValuesCriteriasEvaluator,
        job_performance_criterias_mentor: jobPerformanceCriteriasMentor,
        core_values_criterias_mentor: coreValuesCriteriasMentor,
        evaluate_before: evaluateBefore ? new Date(evaluateBefore) : undefined,
        eformstates: allFieldsFilled ? 'created' : 'not created'
      }, 
      { new: true }).lean();
  
    // Send the updated document in the response
    res.json(updatedDocument);
  } catch (err) {
    // Log the error details
    console.error('Error details:', err);
  
    // Send an error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};

// Delete all the data from the specified fields and set them to their default values
exports.deleteeformData = async (req, res) => {
  try {
    const { id } = req.body;

    // Find the EvaluationFormDetails document with the given ObjectId and update it
    const updatedDocument = await EvaluationFormDetails.findByIdAndUpdate(id, 
      { 
        evaluator: '', // Set evaluator to its default value
        job_performance_criterias_evaluator: [], // Set job_performance_criterias_evaluator to its default value
        core_values_criterias_evaluator: [], // Set core_values_criterias_evaluator to its default value
        job_performance_criterias_mentor: [], // Set job_performance_criterias_mentor to its default value
        core_values_criterias_mentor: [], // Set core_values_criterias_mentor to its default value
        job_performance_scores_evaluator: [], // Set job_performance_scores_evaluator to its default value
        core_values_scores_evaluator: [], // Set core_values_scores_evaluator to its default value
        job_performance_scores_mentor: [], // Set job_performance_scores_mentor to its default value
        core_values_scores_mentor: [], // Set core_values_scores_mentor to its default value
        overall_performance_mentor: null, // Set overall_performance_mentor to its default value
        overall_performance_evaluator: null, // Set overall_performance_evaluator to its default value
        action_taken_mentor: '', // Set action_taken_mentor to its default value
        comment_evaluator: '', // Set comment_evaluator to its default value
        comment_mentor: '', // Set comment_mentor to its default value
        evaluate_before: null, // Set evaluate_before to its default value
        evaluated_date_Evaluator: null, // Set evaluated_date_Evaluator to its default value
        evaluated_date_Mentor: null, // Set evaluated_date_Mentor to its default value
        eformstates: 'not created' // Set eformstates to 'not created'
      }, 
      { new: true }).lean();
  
    // Send the updated document in the response
    res.json(updatedDocument);
  } catch (err) {
    // Log the error details
    console.error('Error details:', err);
  
    // Send an error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};



  /*......................................mmentors page apis.......................*/
  exports.getInternBymentor = async (req, res) => {
    try {
      const { id } = req.data;
      const user = await User.findById(id).lean();
  
      // Use the email of the logged-in user instead of the full name
      const mentorEmail = user.email;
  
      // Find all User documents where mentorEmail is the logged-in user's email
      const users = await User.find({ mentorEmail: mentorEmail }).lean();
  
      // For each user, find the related EvaluationFormDetails document where eformstates is 'created'
      const mentorDetails = [];
      for (let user of users) {
        const evaluationFormDetails = await EvaluationFormDetails.find({
          eformstates: "created",
          user: user._id,
        }).lean();
        for (let doc of evaluationFormDetails) {
          const isMentorFormFilled =
            (doc.job_performance_scores_mentor?.length || 0) > 0 &&
            (doc.core_values_scores_mentor?.length || 0) > 0 &&
            doc.overall_performance_mentor > 0 &&
            doc.action_taken_mentor !== "" &&
            doc.comment_mentor !== "";
          mentorDetails.push({
            internName: user.fname + " " + user.lname,
            evaluateBefore: doc.evaluate_before,
            eformstates: doc.eformstates,
            jobPerformanceCriteriasEvaluator: doc.job_performance_criterias_evaluator,
            coreValuesCriteriasEvaluator: doc.core_values_criterias_evaluator,
            jobPerformanceCriteriasMentor: doc.job_performance_criterias_mentor,
            coreValuesCriteriasMentor: doc.core_values_criterias_mentor,
            evaluator: doc.evaluator,
            internId: doc._id,
            isMentorFormFilled: isMentorFormFilled,
            imageUrl: user.imageUrl // Include imageUrl from the user object
          });
        }
      }
  
      // Send the result in the response
      res.json(mentorDetails);
    } catch (err) {
      // Log the error details
      console.error("Error details:", err);
  
      // Send an error response if something goes wrong
      res.status(500).json({ error: err.message });
    }
  };
  

  //this api to store mentor submiting details.
  exports.storeMentorScoresById = async (req, res) => {
    const { 
      coreValuesScoresMentor, 
      jobPerformanceScoresMentor, 
      overall_performance_mentor = null, 
      action_taken_mentor = null, 
      comment_mentor = null 
    } = req.body;
    const { id } = req.params; // Get the ID from the URL parameters
  
    try {
      // Find the document for the intern
      let evaluationFormDetails = await EvaluationFormDetails.findById(id);
  
      // If the document doesn't exist, return an error
      if (!evaluationFormDetails) {
        return res.status(404).json({ message: 'No evaluation form found for this intern' });
      }
  
      // Update the scores
      evaluationFormDetails.core_values_scores_mentor = coreValuesScoresMentor;
      evaluationFormDetails.job_performance_scores_mentor = jobPerformanceScoresMentor;
      evaluationFormDetails.overall_performance_mentor = overall_performance_mentor;
      evaluationFormDetails.action_taken_mentor = action_taken_mentor;
      evaluationFormDetails.comment_mentor = comment_mentor;
  
      // Store the current date as the evaluated_date_Mentor
      evaluationFormDetails.evaluated_date_Mentor = new Date();
  
      // Save the document
      await evaluationFormDetails.save();
  
      res.json({ message: 'Scores stored successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send(`Server error: ${err.message}`);
    }
  };

//evaluator backend apis
exports.getInternsByEvaluator = async (req, res) => {
  try {
    const { id } = req.data;
    // No need to find the evaluator by name since we are using the evaluator's ID directly
    const evaluationFormDetails = await EvaluationFormDetails.find({ evaluator_id: id }).lean();
    const userIds = evaluationFormDetails.map((doc) => doc.user);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    const internDetails = users.map((user) => {
      const userFormDetails = evaluationFormDetails.find((doc) => doc.user.toString() === user._id.toString());
      const isEvaluated = userFormDetails && Array.isArray(userFormDetails.job_performance_scores_evaluator) && userFormDetails.job_performance_scores_evaluator.length > 0 && Array.isArray(userFormDetails.core_values_scores_evaluator) && userFormDetails.core_values_scores_evaluator.length > 0 && typeof userFormDetails.overall_performance_evaluator === "number" && typeof userFormDetails.comment_evaluator === "string";

      return {
        id: user._id,
        name: user.fname + " " + user.lname,
        evaluate_before: userFormDetails ? userFormDetails.evaluate_before : null,
        job_performance_criterias_evaluator: userFormDetails ? userFormDetails.job_performance_criterias_evaluator : null,
        core_values_criterias_evaluator: userFormDetails ? userFormDetails.core_values_criterias_evaluator : null,
        evaluationFormDetailsId: userFormDetails ? userFormDetails._id : null,
        isEvaluated: isEvaluated,
        imageUrl: user.imageUrl,
      };
    });

    res.json(internDetails);
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getInternsForManager = async (req, res) => {
  try {
    // Find all User documents where role is 'intern'
    const interns = await User.find({ role: "intern" }).lean();

    // For each intern, find the corresponding EvaluationFormDetails document
    const internsWithDetails = await Promise.all(
      interns.map(async (intern) => {
        const evaluationFormDetails = await EvaluationFormDetails.findOne({
          user: intern._id,
        }).lean();

        if (!evaluationFormDetails) {
          // If no evaluation details are found, skip this intern
          return null;
        }

        // Check if the specified fields are filled
        const fields = [
          "job_performance_criterias_evaluator",
          "core_values_criterias_evaluator",
          "job_performance_criterias_mentor",
          "core_values_criterias_mentor",
          "job_performance_scores_evaluator",
          "core_values_scores_evaluator",
          "job_performance_scores_mentor",
          "core_values_scores_mentor",
          "overall_performance_mentor",
          "overall_performance_evaluator",
          "action_taken_mentor",
          "comment_evaluator",
          "comment_mentor",
        ];
        const fieldsAreFilled = fields.every((field) => {
          const value = evaluationFormDetails[field];
          return Array.isArray(value) ? value.length > 0 : Boolean(value);
        });

        // If the fields are filled, include the intern in the response
        if (fieldsAreFilled) {
          return { ...intern, evaluationFormDetails };
        } else {
          return null;
        }
      })
    );

    // Filter out any null values (interns where the fields were not filled or evaluationFormDetails was null)
    const filteredInternsWithDetails = internsWithDetails.filter(Boolean);

    // Send the result in the response
    res.json(filteredInternsWithDetails);
  } catch (err) {
    // Log the error details
    console.error("Error details:", err);

    // Send an error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};


//intern evaluation pdf generate
exports.getCommentsById = async (req, res) => {
  try {
    const { id } = req.data;

  
    const evaluationFormDetails = await EvaluationFormDetails.findOne({ user: id })
      .populate('user', 'fname lname dob role email gender jobtitle employmentType mentor')
      .select("comment_evaluator overall_performance_mentor overall_performance_evaluator action_taken_mentor comment_mentor evaluated_date_Evaluator evaluated_date_Mentor evaluator");

    if (!evaluationFormDetails) {
      return res.status(404).json({
        message: "Evaluation form details not found for the given user ID",
      });
    }

    // Check if any of the specified fields are not filled
    const fieldsToCheck = ['comment_evaluator', 'overall_performance_mentor', 'overall_performance_evaluator', 'action_taken_mentor', 'comment_mentor', 'evaluated_date_Evaluator', 'evaluated_date_Mentor'];
    let isEvaluated = true;
    for (const field of fieldsToCheck) {
      if (!evaluationFormDetails[field]) {
        isEvaluated = false;
        break;
      }
    }

    // Return the evaluationFormDetails object including user data, evaluator and mentor names, and isEvaluated status
    res.json({ ...evaluationFormDetails.toObject(), isEvaluated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReviewDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluationDetails = await EvaluationFormDetails.findOne(
      { _id: id },
        "job_performance_criterias_evaluator core_values_criterias_evaluator job_performance_criterias_mentor core_values_criterias_mentor job_performance_scores_evaluator core_values_scores_evaluator job_performance_scores_mentor core_values_scores_mentor overall_performance_mentor overall_performance_evaluator action_taken_mentor comment_evaluator comment_mentor evaluated_date_Evaluator evaluated_date_Mentor evaluator evaluator_email  evaluate_before"
    );

    if (!evaluationDetails) {
      return res
        .status(404)
        .json({ message: "Evaluation details not found for the given ID" });
    }

    res.json(evaluationDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.storeEvaluatorResultById = async (req, res) => {
  try {
    const id = req.params.id; // Intern's ID

    // Find the EvaluationFormDetails document with the given id
    const evaluationFormDetails = await EvaluationFormDetails.findById(
      id
    ).lean();

    // Check if the EvaluationFormDetails exists
    if (!evaluationFormDetails) {
      return res.status(404).json({ error: "Evaluation form not found" });
    }

    // Update the EvaluationFormDetails document with the evaluator's results
    const updatedFormDetails = await EvaluationFormDetails.findByIdAndUpdate(
      id,
      {
        job_performance_scores_evaluator:
          req.body.job_performance_scores_evaluator,
        core_values_scores_evaluator: req.body.core_values_scores_evaluator,
        overall_performance_evaluator: req.body.overall_performance_evaluator,
        comment_evaluator: req.body.comment_evaluator,
        evaluated_date_Evaluator: new Date(), // Store the current date
      },
      { new: true }
    );

    // Send the updated EvaluationFormDetails document in the response
    res.json(updatedFormDetails);
    console.log(updatedFormDetails);
  } catch (err) {
    // Log the error details
    console.error("Error details:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the evaluation form" });
  }
};





