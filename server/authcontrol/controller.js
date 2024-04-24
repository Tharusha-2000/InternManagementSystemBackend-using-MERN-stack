const User = require("../models/user.js");
const Intern = require("../models/intern");
const EvaluationFormDetails = require('../models/Evaluationformdetails');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV = require("../config.js");
const otpGenerator = require("otp-generator");
var nodemailer = require("nodemailer");
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
      ENV.JWT_SECRET,
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

  const otpTimeout = setTimeout(() => {
    req.app.locals.OTP = null;
  }, 1 * 60 * 1000);

  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    clearTimeout(otpTimeout);
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
    //console.log(req.data.gender);
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
      res.send(e);
  });
};


exports.createTask=async(req, res) => {
  const { id } = req.data;
  console.log(id);
  if (req.data.role!=="intern"){
    return res.status(401).send({ error: "You are not authorized to set this data" });
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
      return res.status(404).send("task not found");
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
    return res.status(401).send({ error: "You are not authorized to set this data" });
   }
  Task.find({
      _userId:id
  }).then((tasks) => {
     res.json(tasks);
  }).catch((e) => {
      res.send(e);
  });
};









/*......................................sanugi.......................*/

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

/*......................................sanugi.......................*/

 
/*......................................dilum.......................*/


  /*......................................dilum.......................*/
