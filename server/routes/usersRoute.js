const express = require("express");
const router = express.Router();


const controller = require('../authcontrol/controller')
const mailer = require('../authcontrol/mailer')
const User = require("../models/user");
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
router.get('/users',middleware.Auth,controller.getUsers);
router.delete('/users/:id',middleware.Auth,controller.deleteUser);
router.put('/users/:id',middleware.Auth,controller.changeRole);
router.post("/register",middleware.Auth,controller.register,mailer.sendWelcomeEmail);


/*..........................................secure................................................. */
router.put('/secure',middleware.Auth,controller.secure);


router.get('/user',middleware.Auth,controller.getUser);
//router.put('/uploadImage',middleware.Auth,controller.uploadImage);

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + '-' +file.originalname );
  }
})

const upload = multer({ storage: storage })

router.post('/uploadImage', middleware.Auth,upload.single('image'), async (req, res) => {
  const { id } = req.data;
  console.log("hi");
      try {
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ msg: "User not found" });
        }
        user.image = req.file.path;
        await user.save();
        res.json({ msg: "Image uploaded successfully",imageUrl: user.image });
      } catch (error) {
        res.status(500).json({ msg: "Internal Server Error" });
      }

});




/*..........................................evaluvationpart................................................. */
router.get("/interns",controller.getInterns);


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


/*......................................hansi.......................*/


/*......................................hansi.......................*/

/*......................................dilum.......................*/




/*......................................dilum.......................*/

module.exports = router;
