const express = require("express");
const router = express.Router();


const controller = require('../authcontrol/controller')
const mailer = require('../authcontrol/mailer')
const User = require("../models/user");
const Task = require("../models/task.js");
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






/*..........................................profile create................................................. */

router.get('/user',middleware.Auth,controller.getUser);
router.put("/updateuser",middleware.Auth,controller.updateuser);

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
/*..........................................create intren profile................................................ */

router.get('/interns', middleware.Auth,controller.getInternList);
router.get('/interns/:id', middleware.Auth,controller.getIntern);
router.put('/interns/:id',middleware.Auth,controller.updatedIntern);
router.put('/updateinterns',middleware.Auth,controller.updateinternprofile);

/*..........................................evaluvationpart................................................. */








/*..........................................project task part................................................ */
router.get('/task',middleware.Auth,controller.getTask);
router.post('/task',middleware.Auth,controller.createTask);
router.delete('/task/:id',middleware.Auth,controller.deleteTask);
router.put('/task/:id',middleware.Auth,controller.updateTask,middleware.localVariables,mailer.sendingVerifyTaskMail);









module.exports = router;



 




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





=======
/*......................................sanugi.......................*/


/*......................................hansi.......................*/


/*......................................hansi.......................*/

/*......................................dilum.......................*/




/*......................................dilum.......................*/


