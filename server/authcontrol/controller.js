const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV = require("../config.js");
const otpGenerator = require("otp-generator");
var nodemailer = require("nodemailer");

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

exports.getUser = async (req, res) => {
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
    //console.log(req.data.id);
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

    const { fname, lname, dob, role, gender, email, password } = req.body;
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
    });

    res.locals.userData = { email, password };
    next();
  } catch (error) {
    console.error(error);
  }
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



  /*......................................hansi.......................*/

  exports.getIntern = async (req, res) => {
    try {
      if (req.data.role !== "intern") {
        return res
          .status(403)
          .json({ msg: "You do not have permission to access this function" });
      }
      // Fetch all users with the role of "intern" from the database
      const users = await User.find({ role: "intern" });
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };

  /*......................................hansi.......................*/