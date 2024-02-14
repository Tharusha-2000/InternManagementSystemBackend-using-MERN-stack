const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV= require('../config.js');
const middleware = require('../middleware/auth.js');
const Auth = middleware.Auth;
const localVariables = middleware.localVariables;

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


/** GET: http://localhost:8080/api/user/example123 */
router.get("/user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) return res.status(501).send({ error: "Invalid Username" });
        const user = await User.findOne({ username });

    if (!user) return res.status(501).send({ error: "Couldn't Find the User" });
      
        const {password,...rest} = Object.assign({}, user.toJSON());
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

router.put('/updateuser', Auth ,async function updateUser(req,res){
  try {
      // const id = req.query.id;
      const { userId } = req.user;
      if(userId){
          const body = req.body;
          // update the data
          UserModel.updateOne({ _id : userId }, body, function(err, data){
              if(err) throw err;
              return res.status(201).send({ msg : "Record Updated...!"});
          })

      }else{
          return res.status(401).send({ error : "User Not Found...!"});
      }

  } catch (error) {
      return res.status(401).send({ error });
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
    const token = jwt.sign({email: user.email,role: user.role},ENV.JWT_SECRET,{expiresIn: "1d"})

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
      });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user,token });
      
    next();
  } catch (error) {
    console.error(error);
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

