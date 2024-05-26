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

  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.resetSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ msg: "Invalid OTP" });
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
    if (req.data.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
    // Fetch all users from the database
    const users = await User.find();
    const data = res.status(201).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal Server Error");
  }
};

 // deleteuser  from the user database
exports.deleteUser = async (req, res) => {
  try {
    if (req.data.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
    let id = req.params.id;
    const user = await User.findByIdAndDelete(id);
        
    //not nessary
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
    if (req.data.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
    //console.log(id);
    const user = await User.findById(id);
    //not necessary
    if (!user) {
      return res.status(404).json("User not found");
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

    if (req.data.id === id) {
      if (role !== "admin") {
        return res
          .status(403)
          .json({ msg: "You do not have permission to access this function" });
      }
    }

    return res.status(201).json({ msg: "Record Updated...!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

//register user

exports.register = async (req, res, next) => {
  try {
    if (req.data.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
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

    res.locals.userData = { email, password };
    next();
  } catch (error) {
    console.error(error);
  }
};

/*..............................create user profile.............................. */
//read user profile
exports.getUser = async (req, res) => {
     const { id } = req.data;
   try {
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
      if(req.data.role === "intern"){
          return res.status(403).send({msg: "You do not have permission to access this function"});
      }
       if (!id) {
        return res.status(401).send({ error: "User ID not provided" });
      }
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
    if (req.data.role === "intern") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });

    }
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
    if (req.data.role === "intern") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });

    }
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
    if (req.data.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
    const updatedIntern = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedIntern) {
      return res.status(404).json({ message: 'Intern user not found' });
    }
    res.json({msg:"update successfully", updatedIntern});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

 /*......................................intern profile create.......................*/

 exports.updateinternprofile=async (req, res) => {
  const { id } = req.data;
  
  try {
     if(req.data.role !== "intern"){
        return res.status(403).send({msg: "You do not have permission to access this function"});
     }
     if (!id) {
      return res.status(401).send({ error: "User ID not provided" });
    }
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

exports.getTask=async (req, res)=> {
  const { id } = req.data;
  if (req.data.role!=="intern"){
    return res.status(401).send({ error: "You are not authorized to set this data" });
   }
  Task.find({
      _userId:id
  }).then((tasks) => {
     res.json(tasks);
  }).catch((e) => {
      res.json(e);
  });
};


exports.createTask=async(req, res) => {
  const { id } = req.data;
  console.log(id);
  if (req.data.role!=="intern"){
    return res.status(401).json({ error: "You are not authorized to set this data" });
   }

  let title = req.body.title;
  try{
  const  newTask = new Task({
      title,
      _userId: id
  });
   const task=await newTask.save()
  res.status(201).json(task);
  }catch(error){
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteTask= async (req, res) => {
  try {
    if (req.data.role !== "intern") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
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
  try {
    const { id } = req.params;
    
    if (req.data.role !== "intern") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
    const updatedtask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedtask) {
      return res.status(404).json({ message: 'task not found' });
    }
    res.json({msg:"update successfully", updatedtask});
    console.log(updatedtask);
    console.log(updatedtask.isComplete);
    
    if(updatedtask.isComplete){
      const user = await User.findById(req.data.id);
      const mentorEmail = user.mentorEmail;
      updatedtask.mentorEmail = mentorEmail;
      await updatedtask.save();
      console.log(mentorEmail);
      
    }
    if(!updatedtask.isComplete){
      updatedtask.mentorEmail = null;
      await updatedtask.save();
     
      
     }

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getTasklistMentorNotification= async (req, res) => {
  try {
    const { id } = req.data;
    const user = await User.findById(id);
    if (req.data.role !== "mentor") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }
    const email = user.email;
    console.log(email);

    const tasks = await Task.find({ mentorEmail:email, isComplete: true, isVerified: false})
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
   if (req.data.role !== "mentor") {
     return res
       .status(403)
       .json({ msg: "You do not have permission to access this function" });
   }
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
  if (req.data.role ==="intern"){
    return res.status(401).json({ error: "You are not authorized to set this data" });
   }
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
    console.log(user);
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
    // hansi oya haduvata passe meke admin vithane hadanne
    // const { role } = req.data;
    // if (role !== "admin") {
    //   return res.status(403).json({ error: "You are not allowed to access this function" });
    // } 
    // const { id } = req.params;
    //meka tike add keranne

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

  exports.deletecvByAdmin=async (req, res) => {
    // hansi oya haduvata passe meke admin vithane hadanne
    // const { role } = req.data;
    // if (role !== "admin") {
    //   return res.status(403).json({ error: "You are not allowed to access this function" });
    // } 
    // const { id } = req.params;
    //meka tike add keranne

    const { id } = req.data;
    console.log(hi);
    console.log(req.body);
        try {
          const user = await User.findById(id);
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          if (user.cvurl === null) {
          return res.json({ msg: "CV URL is null", user });
         }
          user.cvurl = null;
          await user.save();
          res.json({ msg: "CV URL deleted", user });
        } catch (error) {
          res.status(500).json({ msg: "Internal Server Error" });
        }
  
  };


/*......................................dilum.......................*/
exports.getEvInterns = async (req, res) => {
  try {
    const users = await User.find({ role: 'intern' }).lean();

    const promises = users.map(async user => {
      let evaluationFormDetails = await EvaluationFormDetails.findOne({ user: user._id }).lean();

      // If there's no EvaluationFormDetails document for this user, create one
      if (!evaluationFormDetails) {
        evaluationFormDetails = new EvaluationFormDetails({
          user: user._id, // Set the user field to the id of the user
          evaluator: ' ',
          overall_performance_mentor: 0,
          overall_performance_evaluator: 0,
          action_taken_mentor: ' ',
          comment_mentor: ' ',
          comment_evaluator: ' ',
          evaluate_before: new Date(),
          // Set other fields as needed
        });

        // Save the EvaluationFormDetails document
        await evaluationFormDetails.save();
      }

      return {
        name: user.fname + ' ' + user.lname,
        mentor: user.mentor,
        eformStatus: evaluationFormDetails ? evaluationFormDetails.eformstates : null,
        evaluationFormDetailsId: evaluationFormDetails ? evaluationFormDetails._id : null // Add the ObjectId of the EvaluationFormDetails document
      };
    });

    const userDetails = await Promise.all(promises);

    // Get the ids of all interns
    const internIds = users.map(user => user._id);

    // Remove EvaluationFormDetails documents that don't have a corresponding intern
    await EvaluationFormDetails.deleteMany({ user: { $nin: internIds } });

    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//get all the evaluators for evaluation form dropdown
exports.getEvaluators = async (req, res) => {
  try {
    if (req.data.role === "intern") {
      return res
        .status(403)
        .json({ msg: "You do not have permission to access this function" });
    }

// Find all users where role is 'evaluator' or 'evaluator ' and only return the fname and lname fields
const evaluators = await User.find({ role: { $in: ['evaluator', 'evaluator '] } }, 'fname lname').lean();

    // Map over the evaluators and combine the fname and lname fields into a single name field
    const evaluatorNames = evaluators.map(evaluator => evaluator.fname + ' ' + evaluator.lname);

    // Send the evaluator names in the response
    res.json(evaluatorNames);
  } catch (err) {
    // Send an error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};



//post evalutor name into evaluation form details collection
exports.postEvaluatorName = async (req, res) => {
  try {
    const { id, evaluatorName, jobPerformanceCriteriasEvaluator, coreValuesCriteriasEvaluator, jobPerformanceCriteriasMentor, coreValuesCriteriasMentor, evaluateBefore } = req.body;
  
    // Check if all the fields are filled
    const allFieldsFilled = evaluatorName && jobPerformanceCriteriasEvaluator && coreValuesCriteriasEvaluator && jobPerformanceCriteriasMentor && coreValuesCriteriasMentor && evaluateBefore;

    // Log evaluateBefore
    console.log('evaluateBefore:', evaluateBefore);

    // Log the request body
    console.log('Request body:', req.body);
  
    // Find the EvaluationFormDetails document with the given ObjectId and update it
    const updatedDocument = await EvaluationFormDetails.findByIdAndUpdate(id, 
      { 
        evaluator: evaluatorName, 
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


// Delete all the data from the specified fields
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
        evaluate_before: null, // Set evaluate_before to its default value
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

  exports.checkMentor = async (req, res) => {
    try {
      // Get the logged-in user's id from the request parameters
      const userId = req.params.userId;
  
      // Find the User document with the given id
      const user = await User.findById(userId).lean();
  
      // Get the full name of the logged-in user
      const fullName = user.fname + ' ' + user.lname;
  
      // Find all User documents where mentor is the logged-in user
      const users = await User.find({ mentor: fullName }).lean();
  
      // For each user, find the related Evaluationformdetails document where eformstates is 'created'
      const mentorDetails = [];
      for (let user of users) {
        const evaluationFormDetails = await EvaluationFormDetails.find({ eformstates: 'created', user: user._id }).lean();
        for (let doc of evaluationFormDetails) {
          const isMentorFormFilled = (
            doc.job_performance_scores_mentor.length > 0 &&
            doc.core_values_scores_mentor.length > 0 &&
            doc.overall_performance_mentor > 0 &&
            doc.action_taken_mentor !== '' &&
            doc.comment_mentor !== ''
          );
          mentorDetails.push({
            internName: user.fname + ' ' + user.lname,
            evaluateBefore: doc.evaluate_before,
            eformstates: doc.eformstates,
            jobPerformanceCriteriasEvaluator: doc.job_performance_criterias_evaluator,
            coreValuesCriteriasEvaluator: doc.core_values_criterias_evaluator,
            jobPerformanceCriteriasMentor: doc.job_performance_criterias_mentor,
            coreValuesCriteriasMentor: doc.core_values_criterias_mentor,
            evaluator: doc.evaluator,
            internId: doc._id,
            isMentorFormFilled: isMentorFormFilled
          });
        }
      }
  
      // Send the result in the response
      res.json(mentorDetails);
    } catch (err) {
      // Log the error details
      console.error('Error details:', err);
  
      // Send an error response if something goes wrong
      res.status(500).json({ error: err.message });
    }
};

  
  exports.getCriteriaById = async (req, res) => {
    try {
      // Get the ID from the request parameters
      const id = req.params.id;
  
      // Find the EvaluationFormDetails document with the provided ID and only return the job_performance_criterias_mentor and core_values_criterias_mentor fields
      const evaluationFormDetails = await EvaluationFormDetails.findById(id, 'job_performance_criterias_mentor core_values_criterias_mentor').lean();
  
      // Send the result in the response
      res.json(evaluationFormDetails);
    } catch (err) {
      // Log the error details
      console.error('Error details:', err);
  
      // Send an error response if something goes wrong
      res.status(500).json({ error: err.message });
    }
  };


  // tempory code for add remaining fields to evaluationformdetails collection
  exports.setDefaultEformstates = async (req, res) => {
    try {
      // Define the new fields to add
      const newFields = {
        job_performance_scores_evaluator: [],
        core_values_scores_evaluator: [],
        job_performance_scores_mentor: [],
        core_values_scores_mentor: [],
        overall_performance_mentor: 0,
        overall_performance_evaluator: 0,
        action_taken_mentor: '',
        comment_mentor: '',
        comment_evaluator: '',
       
      };
  
      // Update all documents in the EvaluationFormDetails collection
      const updatedDocuments = await EvaluationFormDetails.updateMany({}, 
        { 
          $set: newFields
        });
  
      // Send the number of updated documents in the response
      res.json({ updatedCount: updatedDocuments.nModified });
    } catch (err) {
      // Log the error details
      console.error('Error details:', err);
  
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
  
      // Save the document
      await evaluationFormDetails.save();
  
      res.json({ message: 'Scores stored successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send(`Server error: ${err.message}`);
    }
};

//tempory code to delete metor filled details

exports.deleteInfoByIdTem = async (req, res) => {
  try {
    const id = req.params.id;
    const evaluationFormDetails = await EvaluationFormDetails.findById(id);

    if (!evaluationFormDetails) {
      return res.status(404).json({ message: 'No evaluation form details found with this id' });
    }

    evaluationFormDetails.job_performance_scores_evaluator = [];
    evaluationFormDetails.core_values_scores_evaluator = [];
    evaluationFormDetails.job_performance_scores_mentor = [];
    evaluationFormDetails.core_values_scores_mentor = [];
    evaluationFormDetails.overall_performance_mentor = null;
    
    evaluationFormDetails.action_taken_mentor = null;
    evaluationFormDetails.comment_evaluator = null;
    evaluationFormDetails.comment_mentor = null;
    evaluationFormDetails.date = null;

    await evaluationFormDetails.save();

    res.json({ message: 'Fields reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//evaluator backend apis


exports.getInternsByEvaluator = async (req, res) => {
  try {
    // Get the user's id from the request parameters
    const id = req.params.id;

    // Find the User document with the given id
    const evaluator = await User.findById(id).lean();

    // Check if the user exists
    if (!evaluator) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is an evaluator
    if (evaluator.role !== 'evaluator') {
      return res.status(403).json({ error: 'User is not an evaluator' });
    }

    // Get the full name of the evaluator
    const evaluatorName = evaluator.fname + ' ' + evaluator.lname;

    // Find all EvaluationFormDetails documents where evaluator is the evaluator's name
    const evaluationFormDetails = await EvaluationFormDetails.find({ evaluator: evaluatorName }).lean();

    // Get the ids of the users (interns) from the EvaluationFormDetails documents
    const userIds = evaluationFormDetails.map(doc => doc.user);

    // Find all User documents with the ids from the EvaluationFormDetails documents
    const users = await User.find({ _id: { $in: userIds } }).lean();

    // Get the full names of the users (interns) and their evaluate_before dates
    const internDetails = users.map(user => {
      const userFormDetails = evaluationFormDetails.find(doc => doc.user.toString() === user._id.toString());
      return {
        name: user.fname + ' ' + user.lname,
        evaluate_before: userFormDetails ? userFormDetails.evaluate_before : null
      };
    });

    // Send the result in the response
    res.json(internDetails);
  } catch (err) {
    // Log the error details
    console.error('Error details:', err);

    // Send an error response if something goes wrong
    res.status(500).json({ error: err.message });
  }
};

  /*......................................dilum.......................*/



  /*......................................hansi.......................*/


  /*......................................hansi.......................*/
