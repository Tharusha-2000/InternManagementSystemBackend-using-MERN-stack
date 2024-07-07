var nodemailer = require('nodemailer');
const otpGenerator = require("otp-generator");
const User = require("../models/user.js");
const Task = require("../models/task.js");


exports.sendingOTPMail = async (req, res) => {
    try {
      const { email } = req.body;
      const otp = req.app.locals.OTP; 
     
      var transporter = nodemailer.createTransport({
        service: 'gmail',
         auth: {
           user: process.env.Email,
           pass: process.env.Password
         }
       });
     
     var mailOptions = {
        from: process.env.Email,
        to: email,
        subject: 'Sending otp',
        html:`
        <div style="width: 500px; padding: 20px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
                 <h1 style="color: blue; text-align: center;">Your OTP</h1>
                 <p style="text-align: center; color: #333; font-size: 20px;">${otp}</p>
        </div>
        `
   
     };

  transporter.sendMail(mailOptions, function(error, info){
     if (error) {
       console.log(error);
       res.status(500).json({ msg: "server error"});
     } else {
       console.log('Email sent: ' + info.response);

       res.status(201).send({ msg: "otp send!",code: otp})

     }
    });

    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  };


exports.sendWelcomeEmail = (req, res) => {
  
  try {
   const { email, password,user } = res.locals.userData;

    var transporter = nodemailer.createTransport({

        service: 'gmail',
        auth: {
          user: process.env.Email,
          pass: process.env.Password
        }
      });
      
      var mailOptions = {
        from: process.env.Email,
        to: email,
        subject: 'registeration successful',
        html:  `
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;">
              <h1 style="color: blue; text-align: center;">Welcome to Zionlogy</h1>
              <p style="text-align: center; color: #333;">You have successfully registered to the Zionlogy. Here are your details:</p>
              <div style="background-color: #fff; padding: 10px; border-radius: 10px; margin: 20px 0; color: #333;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
              </div>
              <p style="text-align: center; color: #333;">Your are welcome!</p>
              <p style="text-align: center; color: #333;"><a href="https://imsfrontend.vercel.app/">Visit our site</a></p>
            </div> `


      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
            res.status(500).json({ msg: "server error"});
        } else {
          console.log('Email sent: ' + info.response);

         res.status(201).json({ msg: "User registered successfully",success: true,user:user});
        }
      });
      

    }catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
 
};

exports.sendEmail = (req, res) => {
  
  try {
    const { email, subject, message,UserEmail } = res.locals.userData;
    console.log(UserEmail)
    var transporter = nodemailer.createTransport({

        service: 'gmail',
       // port: 534,
        auth: {
          user: process.env.Email,
          pass: process.env.Password 
        }
      });
      
      var mailOptions = {
        from: process.env.Email,
        to: email,
        subject: subject,
        html: `Message from ${UserEmail}: ${message}`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.status(201).json({ msg: "User send email successfully", success: true});
        }
      });
      
     
    }catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
 
};


exports.sendEmailToAssignIntern = (req, res) => {
   try {
      const {mentoremail,leavedate ,mentorname,users} = res.locals.userData;
      let date = new Date(leavedate);
       const formattedDate = date.toLocaleDateString();
      console.log(mentoremail,leavedate);
      const emails = users.map(user => user.email);

      var transporter = nodemailer.createTransport({
  
          service: 'gmail',
          auth: {
            user: process.env.Email,
            pass: process.env.Password 
          }
        });
        
        var mailOptions = {
          from: process.env.Email,
          to: emails,
          subject: 'Leave infromation',
          html: `Message from ${mentorname}:he is absent in this day ${formattedDate}`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
            res.status(201).json({ msg: "User send email successfully", success: true});
          }
        });
         
      }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }                         

};
