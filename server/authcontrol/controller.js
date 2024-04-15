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
/* POST: http://localhost:8000/api/users/login */
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

    //res.cookie('token', token);

    res.status(200).send({
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

/** POST: http://localhost:8000/api/users/generateOTP */
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

/** GET: http://localhost:8000/api/users/verifyOTP */
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

exports.resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ msg: "Session expired!" });

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
      return res.status(201).send({ msg: "Record Updated...!" });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error: "Invalid Request" });
  }
};

/*.............................registation add user table............................*/

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
    res.status(500).send("Internal Server Error");
  }
};

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
        .send({ msg: "You do not have permission to access this function" });
    }

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send({ msg: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.changeRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;
  try {
    if (req.data.role !== "admin") {
      return res
        .status(403)
        .send({ msg: "You do not have permission to access this function" });
    }

    // console.log(req.data.role);
   
    //console.log(id);
    const user = await User.findById(id);
    //not necessary
    if (!user) {
      return res.status(404).send("User not found");
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
          .send({ msg: "You do not have permission to access this function" });
      }
    }

    return res.status(201).send({ msg: "Record Updated...!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

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

const multer = require("multer");
//const upload = multer({ dest: "uploads/" });
/*..............................create user profile.............................. */
//exports.uploadImage = async (req, res) => {
//     const { base64} = req.body;
//     const { id } = req.data;
//     try {
//       const user = await User.findById(id);
//       if (!user) {
//         return res.status(404).json({ msg: "User not found" });
//       }
//       user.image = base64;
//       await user.save();
//       res.json({ msg: "Image uploaded successfully" });
//     } catch (error) {
//       res.status(500).json({ msg: "Internal Server Error" });
//     }
//   };
const fs = require('fs');
const path = require('path');

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
  // We want to return an array of all the lists that belong to the authenticated user 
  const { id } = req.data;
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
