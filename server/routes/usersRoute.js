const express = require("express");
const router = express.Router();


const controller = require('../authcontrol/controller')
const mailer = require('../authcontrol/mailer')
// const User = require("../models/user");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const ENV= require('../config.js');
const middleware = require('../middleware/auth.js');


// var nodemailer = require('nodemailer');

/*..........................................login.................................................... */
router.post("/login",controller.login);
router.post("/generateOTP&sendmail",middleware.localVariables,controller.generateOTP,mailer.sendingOTPMail);
router.get("/verifyOTP",controller.verifyOTP);
router.put("/resetPassword",controller.resetPassword); 

/*..........................................registration.................................................... */
router.get('/user',middleware.Auth,controller.getUser);
router.delete('/user/:id',middleware.Auth,controller.deleteUser);
router.put('/user/:id',middleware.Auth,controller.changeRole);
router.post("/register",middleware.Auth,controller.register,mailer.sendWelcomeEmail);


/*..........................................secure................................................. */
router.put('/secure',middleware.Auth,controller.secure);










/*..........................................evaluvationpart - dilum................................................. */
//router.get("/interns",controller.getInterns);
const {getInterns} = require('../authcontrol/controller');
router.get('/interns', getInterns);





module.exports = router;








// // successfully redirect user when OTP is valid
// /** GET: http://localhost:8000/api/users/createResetSession */
// const createResetSession = (req,res)=>{
//       if(req.app.locals.resetSession){
//           return res.status(201).send({ flag : req.app.locals.resetSession})
//       }
//       return res.status(440).send({msg : "Session expired!"})
//       }













 



// /** PUT: http://localhost:8000/api/updateuser 
// * @param: {
// "header" : "<token>"
// }
// body: {
//   firstName: '',
//   address : '',
//   profile : ''
// }
// */
// router.put('/updateuser',Auth, async (req, res) => {
//   //const id = req.query.id;
//   const { id } = req.user;
//   try {
    
//     if (!id) {
//       return res.status(401).send({ error: "User ID not provided" });
//     }

//     const body = req.body;

//     // Update the data
//     const result = await User.updateOne({ _id: id}, body);

//     if (result.nModified === 0) {
//       return res.status(404).send({ error: "User not found or no changes applied" });
//     }


//     return res.status(200).send({ msg: "Record Updated" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ error: "Internal Server Error" });
//   }
// });


// /* GET: http://localhost:8000/api/users/user/dinu */
// router.get("/user/:username", async (req, res) => {
//         const { username } = req.params;
//   try {
//       if (!username) return res.status(501).send({ error: "Invalid Username" });
//         const user = await User.findOne({ username });

//       if (!user) return res.status(501).send({ error: "Couldn't Find the User" });
//       //romove hash password
//         const {password,...rest} = Object.assign({}, user.toJSON());
//         return res.status(201).send(rest);

//       }catch(error){
//           return res.status(404).send({ error: "Cannot Find User Data" });
//       }
//       });





/*......................................sanugi.......................*/
/*
router.put("/secure", Auth, async (req, res) => {
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
});
*/
/*......................................hansi.......................*/


/*......................................hansi.......................*/

/*......................................dilum.......................*/




/*......................................dilum.......................*/

module.exports = router;
