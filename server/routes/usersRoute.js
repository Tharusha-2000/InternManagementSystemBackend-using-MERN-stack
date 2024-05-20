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



/*..........................................project task part................................................ */
router.get('/task',middleware.Auth,controller.getTask);
router.post('/task',middleware.Auth,controller.createTask);
router.delete('/task/:id',middleware.Auth,controller.deleteTask);
router.put('/task/:id',middleware.Auth,controller.updateTask);
router.get('/taskNotify',middleware.Auth,controller.getTasklistMentorNotification);
router.put('/taskVerify/:id',middleware.Auth,controller.getTaskVarify);
router.get('/task/:id',middleware.Auth,controller.getTaskIntern);

/*..........................................secure................................................. */
router.put('/secure',middleware.Auth,controller.secure);
/*..........................................create intren profile................................................ */

router.get('/interns', middleware.Auth,controller.getInternList);
router.get('/interns/:id', middleware.Auth,controller.getIntern);
router.put('/interns/:id',middleware.Auth,controller.updatedIntern);
router.put('/updateinterns',middleware.Auth,controller.updateinternprofile);

/*..........................................profile create................................................. */

router.get('/user',middleware.Auth,controller.getUser);
router.put("/updateuser",middleware.Auth,controller.updateuser);
router.put('/uploadImage',middleware.Auth,controller.uploadImageByuser);



/*..........................................evaluvationpart................................................. */













module.exports = router;



/*......................................sanugi.......................*/


/*......................................hansi.......................*/


/*......................................hansi.......................*/

/*......................................dilum.......................*/




/*......................................dilum.......................*/


