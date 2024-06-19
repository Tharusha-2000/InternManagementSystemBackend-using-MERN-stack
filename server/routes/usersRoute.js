const express = require("express");
const router = express.Router();
const EvaluationFormDetails = require("../models/Evaluationformdetails");


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

router.get('/Evinterns', middleware.Auth, controller.getEvInterns);
router.get('/evaluators', middleware.Auth, controller.getEvaluators);//router to get evaluators
router.post('/evaluatorname', middleware.Auth, controller.postEvaluatorName);//router to post evaluator name into evaluationformdetails collection
const { deleteeformData, checkMentor, getCriteriaById,  storeMentorScoresById,  getInternsByEvaluator, postEvaluatorResultById, getInternsForManager, getAllMentors,getReviewDetailsById } = require('../authcontrol/controller');

// Route to delete evaluation form details
router.delete('/deleteeformData', middleware.Auth, deleteeformData);

// Mentor pages routes
// Get intern list for relevant mentor
router.get('/checkMentor/:userId', middleware.Auth, checkMentor);
// Get criteria for mentor
router.get('/getCriteriaById/:id', middleware.Auth, getCriteriaById);

// Routes for store mentor scores of evaluation forms
router.post('/storeMentorScores/:id', middleware.Auth, storeMentorScoresById);


// Routes for evaluators section
// Get all the interns for evaluator
router.get('/getInternsByEvaluator/:id', middleware.Auth, getInternsByEvaluator);
// Post evaluator evaluation results by id
router.post('/postEvaluatorResultById/:id', middleware.Auth, postEvaluatorResultById);

// Manager page routes
// Get all the evaluation details for manager
router.get('/getInternsForManager', middleware.Auth, getInternsForManager);
// Router for get evaluation details for review
router.get('/getAllMentors', middleware.Auth, getAllMentors);
// Route to get review details by ID
router.get('/getReviewDetailsById/:id', middleware.Auth, getReviewDetailsById);

/*......................................dilum.......................*/


