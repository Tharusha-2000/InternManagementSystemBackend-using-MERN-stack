const express = require("express");
const router = express.Router();
const EvaluationFormDetails = require("../models/Evaluationformdetails");


const controller = require('../authcontrol/controller')
const mailer = require('../authcontrol/mailer')
const User = require("../models/user");
const Task = require("../models/task.js");
const middleware = require('../middleware/auth.js');


/*..........................................login.................................................... */
router.post("/login",controller.login);
router.post("/generateOTP&sendmail",middleware.localVariables,controller.generateOTP,mailer.sendingOTPMail);
router.get("/verifyOTP",controller.verifyOTP);
router.put("/resetPassword",controller.resetPassword); 

/*..........................................registration.................................................... */
router.get('/users',middleware.Auth,middleware.IsAdmin,controller.getUsers);
router.get('/user/:id',middleware.Auth,middleware.IsAdmin,controller.getUserById);
router.delete('/users/:id',middleware.Auth,middleware.IsAdmin,controller.deleteUser);
router.put('/users/:id',middleware.Auth,middleware.IsAdmin,controller.changeRole);
router.post("/register",middleware.Auth,middleware.IsAdmin,controller.register,mailer.sendWelcomeEmail);



/*..........................................project task part................................................ */
router.get('/taskinterns', middleware.Auth,middleware.IsNotIntern,controller.getInternsWithTasks);
router.get('/task',middleware.Auth,middleware.IsIntern,controller.getTask);
router.post('/task',middleware.Auth,middleware.IsIntern,controller.createTask);
router.delete('/task/:id',middleware.Auth,middleware.IsIntern,controller.deleteTask);
router.put('/task/:id',middleware.Auth,middleware.IsIntern,controller.updateTask);
router.get('/taskNotify',middleware.Auth,middleware.IsMentor,controller.getTasklistMentorNotification);
router.put('/taskVerify/:id',middleware.Auth,middleware.IsMentor,controller.getTaskVarify);
router.get('/task/:id',middleware.Auth,middleware.IsNotIntern,controller.getTaskIntern);

/*..........................................get intern list ................................................ */
router.get('/interns', middleware.Auth,middleware.IsNotIntern,controller.getInternList);
/*..........................................profile create................................................. */
router.put('/uploadImage',middleware.Auth,middleware.IsUser,controller.uploadImageByuser);

router.get('/user',middleware.Auth,middleware.IsUser,controller.getUser);
router.put("/updateuser",middleware.Auth,middleware.IsNotIntern,controller.updateuser);

/*..........................................SendeEmailToUsers................................................ */
router.post("/sendUserToEmail",middleware.Auth,middleware.IsUser,controller.sendEmailToUsers,mailer.sendEmail);

/*..........................................secure................................................. */
router.put('/secure',middleware.Auth,middleware.IsUser,controller.secure);

/*..........................................create intren profile................................................ */
router.get('/interns/:id', middleware.Auth,middleware.IsNotIntern,controller.getIntern);
router.put('/interns/:id',middleware.Auth,middleware.IsAdmin,controller.updatedIntern);
router.put('/updateinterns',middleware.Auth,middleware.IsIntern,controller.updateinternprofile);

/*..........................................cv part................................................. */
router.put('/:userId/uploadcv',middleware.Auth,middleware.IsAdmin,controller.uploadcvByAdmin);
router.put('/:userId/deletecv',middleware.Auth,middleware.IsAdmin,controller.deletecvByAdmin);

/*........................................work schedule................................................*/
router.post('/workschedule',middleware.Auth,middleware.IsUser,controller.createWorkSchedule);
router.delete('/schedule/:eventId', middleware.Auth, middleware.IsUser,controller.deleteWorkSchedule);
router.get('/allusers', middleware.Auth, middleware.IsNotIntern,controller.fetchAllUsers);
/*......................................Leave............................................*/ 
router.post('/applyLeave', middleware.Auth,middleware.IsUser,controller.applyLeave);
router.get('/getLeaveApplications', middleware.Auth,middleware.IsNotIntern, controller.getLeaveApplications);
router.put('/updateLeaveStatus', middleware.Auth, middleware.IsAdmin,controller.updateLeaveStatus,mailer.sendEmailToAssignIntern );

/*..........................................evaluvationpartadmin................................................. */
router.get('/Evinterns', middleware.Auth,middleware.IsAdmin, controller.getEvInterns);
router.get('/evaluators', middleware.Auth,middleware.IsAdmin, controller.getEvaluators);
router.post('/evaluatorname', middleware.Auth, middleware.IsAdmin,controller.postEvaluatorName);
router.delete('/deleteeformData', middleware.Auth,middleware.IsAdmin, controller.deleteeformData);
/*..........................................evaluation mentor&evaluvator................................................. */
router.get('/checkMentor', middleware.Auth,middleware.IsMentor,controller.getInternBymentor);
router.post('/storeMentorScores/:id', middleware.Auth,middleware.IsMentor,  controller.storeMentorScoresById);
router.get('/getInternsByEvaluator', middleware.Auth,middleware.IsEvaluator,controller.getInternsByEvaluator);
router.post('/postEvaluatorResultById/:id', middleware.Auth,middleware.IsEvaluator,controller.storeEvaluatorResultById);
 
 router.get('/getInternsForManager', middleware.Auth,middleware.IsManager, controller.getInternsForManager);
 router.get('/getAllMentors', middleware.Auth,middleware.IsUser, controller.getAllMentors);
 router.get('/getReviewDetailsById/:id', middleware.Auth, middleware.IsEvaluatorORIsMentor,controller.getReviewDetailsById);
 router.get('/getCommentsById', middleware.Auth,middleware.IsIntern, controller.getCommentsById);


module.exports = router;




