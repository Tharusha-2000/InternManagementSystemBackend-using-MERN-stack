const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV= require('../config.js');
const middleware = require('../middleware/auth.js');
const Auth = middleware.Auth;
const localVariables = middleware.localVariables;
const otpGenerator = require('otp-generator');

/* POST: http://localhost:8090/api/users/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ loginStatus: false, Error: "Incorrect email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ loginStatus: false, Error: "Incorrect password" });
    }
   
    const token = jwt.sign(
      {  email: user.email, id: user._id,role: user.role },ENV.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.cookie('token', token);
    
   res.status(200).send({
      msg: "Login Successful...!",
      username: user.username,
      role: user.role,
      token
  });   

  } catch (error) {
    console.error(error);
    res.status(500).json({ loginStatus: false, Error: "Internal Server Error" });
  }
});



/* GET: http://localhost:8090/api/users/user/dinu */
router.get("/user/:username", async (req, res) => {
       const { username } = req.params;
try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });
        const user = await User.findOne({ username });

    if (!user) return res.status(501).send({ error: "Couldn't Find the User" });
      
        const {password,hashedPassword,...rest} = Object.assign({}, user.toJSON());
        return res.status(201).send(rest);
   
    }catch(error){
         return res.status(404).send({ error: "Cannot Find User Data" });
    }
});


/** PUT: http://localhost:8080/api/updateuser 
* @param: {
"header" : "<token>"
}
body: {
  firstName: '',
  address : '',
  profile : ''
}
*/
router.put('/updateuser',Auth, async (req, res) => {
  //const id = req.query.id;
  const { id } = req.user;
  try {
    
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
});

router.post("/register",async (req, res, next) => {
  
  try {
    const { email, password, username,role, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
       }
    const user = await User.create({ email, password, username,role, createdAt });
  
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
      
    next();
  } catch (error) {
    console.error(error);
  }

   });

 
/** POST: http://localhost:8080/api/users/generateOTP */
router.post("/generateOTP",localVariables,async (req,res)=>{
  const { email } = req.body;


  const existingUser = await User.findOne({ email });

   if (!existingUser) {
       return res.json({ message: "User not registered" });
      }
     req.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets: false,
                                                           upperCaseAlphabets: false,
                                                           specialChars: false})
     
     res.status(201).send({ code: req.app.locals.OTP })

});

/** GET: http://localhost:8080/api/users/verifyOTP */
router.get("/verifyOTP",async (req,res)=>{

  const { code } = req.query;
  if(parseInt(req.app.locals.OTP) === parseInt(code)){
      req.app.locals.OTP = null; // reset the OTP value
      req.app.locals.resetSession = true; // start session for reset password
      return res.status(201).send({ msg: 'Verify Successsfully!'})
  }
  return res.status(400).send({ error: "Invalid OTP"});
});

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/users/createResetSession */
const createResetSession = (req,res)=>{
   if(req.app.locals.resetSession){
        return res.status(201).send({ flag : req.app.locals.resetSession})
   }
   return res.status(440).send({error : "Session expired!"})
}

router.put( "/resetPassword",async (req,res)=>{
  try {
      
    //  if(!req.app.locals.resetSession) return res.status(440).send({error : "Session expired!"});

      const { email, password } = req.body;

      try {
         User.findOne({ email})
               .then(user => {
                     bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                                User.updateOne({ email:user.email},
                                { password: hashedPassword}, function(err, data){
                                           if(err) throw err;
                                           req.app.locals.resetSession = false; // reset session
                                           return res.status(201).send({ msg : "Record Updated...!"})
                                 });
                      })
                      .catch( e => {
                          return res.status(500).send({
                              error : "Enable to hashed password"
                          })
                      })
              })
              .catch(error => {
                  return res.status(404).send({ error : "Username not Found"});
              })

      } catch (error) {
          return res.status(500).send({ error })
      }

    } catch(error){
        return res.status(401).send({ error })
    }
});
























router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email' });
    }
    const auth = await bcrypt.compare(password, user.password);
    
    if (!auth) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    const token = jwt.sign(
      { role: "admin", email: User.email, id: User._id },ENV.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.cookie('token', token);
    res.json({ loginStatus: true });

    res.status(200).json({ message: "User logged in successfully", success: true });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

