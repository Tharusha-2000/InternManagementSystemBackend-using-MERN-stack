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




/*..........................................cv part................................................. */
router.put('/uploadcv',middleware.Auth,controller.uploadcvByAdmin);
router.put('/deletecv',middleware.Auth,controller.deletecvByAdmin);
/*..........................................evaluvationpart................................................. */













module.exports = router;



/*......................................sanugi.......................*/


/*......................................hansi.......................*/


/*......................................hansi.......................*/


/*......................................dilum.......................*/

//router.get("/interns",controller.getInterns);


router.get('/Evinterns', middleware.Auth, controller.getEvInterns);
//router to get evaluators
router.get('/evaluators', middleware.Auth, controller.getEvaluators);
//rout to post evaluator name into evaluationformdetails collection

router.post('/evaluatorname', middleware.Auth, controller.postEvaluatorName);

//router to delete evaluationform details
const {deleteeformData} = require('../authcontrol/controller');
router.delete('/deleteeformData', deleteeformData);





//mentor pages routes
const{checkMentor} = require('../authcontrol/controller');
router.get('/checkMentor/:userId', checkMentor);

//get critirias for mentor
const {getCriteriaById} = require('../authcontrol/controller');
router.get('/getCriteriaById/:id', getCriteriaById);


//tempory routing for adding remaining feilds in collection
const {setDefaultEformstates} = require('../authcontrol/controller');
router.post('/setDefaultEformstates', setDefaultEformstates);

//routes for store mentor scores of evaluation forms
const { storeMentorScoresById } = require('../authcontrol/controller');
router.post('/storeMentorScores/:id', storeMentorScoresById);


//tempory route for deleting data which is filled by mentor 
const{deleteInfoByIdTem}=require('../authcontrol/controller');
router.delete('/deleteInfoByIdTem/:id',deleteInfoByIdTem);
//routes for evaluators section
//get all the interns by evaluator
const{getInternsByEvaluator} = require('../authcontrol/controller');
router.get('/getInternsByEvaluator/:id',getInternsByEvaluator);

//post evaluator evaluation results by id
const{postEvaluatorResultById} = require('../authcontrol/controller');
router.post('/postEvaluatorResultById/:id',postEvaluatorResultById);

//manager page routes
const{getInternsForManager} = require('../authcontrol/controller');
router.get('/getInternsForManager',getInternsForManager);

//get al the mentors fordrop down
const{getAllMentors} = require('../authcontrol/controller');
router.get('/getAllMentors',getAllMentors);
/*......................................dilum.......................*/


