const request = require('supertest');
const app = require('./index'); // Import your express app
const User = require('./models/user'); // Import your User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// User data that will be used for testing
const userData = {
  email: 'tharushadinuth21@gmail.com',
  password: 'tharusha@123'
};
//login page test
describe('POST /api/users/login', () => {
    test('should login existing user', async () => {
        let response;
        try {
          response = await request(app)
            .post('/api/users/login')
            .send(userData);
        } catch (error) {
          console.log(error);
        }
    
        // Check that a response was returned
        expect(response).toBeDefined();
    
        if (response) {
          // Check that the status is 200
          expect(response.status).toBe(200);
    
          // Check that a token was returned
          expect(response.body.token).toBeDefined();
    
          // Check that the token is valid
          const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
          expect(decoded.email).toEqual(userData.email);
        }
      });

  test('should not login non-existing user', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email:'nonexistuser@gmail.com',
        password:'tharusha@123'
      })
     .expect(401);
  });

  test('should not login user with wrong password', async () => {
    await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: 'wrongpassword'
      })
      .expect(401);
  });
  test('should not login non-existing user and wrong password', async () => {
     await request(app)
      .post('/api/users/login')
      .send({
        email:'nonexistuser@gmail.com',
        password:'wrongpassword'
      })
     .expect(401);
  });
});


//generateOTP&sendmail  check

describe('/api/users/generateOTP&sendmail', () => {
 
    test('should generate an OTP for a registered user', async () => {
        // User.findOne.mockResolvedValue({ email: 'registereduser@test.com' });
        // otpGenerator.generate.mockReturnValue('123456');
     
         const res = await request(app)
           .post('/api/users/generateOTP&sendmail')
           .send({ email: 'tharushadinuth21@gmail.com' });
     
         expect(res.statusCode).toEqual(201);
         expect(res.body).toHaveProperty('msg', 'otp send!');
         expect(res.body).toHaveProperty('code');
     
       });

    test('should return an error if the user is not registered', async () => {
    const res =await request(app)
      .post('/api/users/generateOTP&sendmail')
      .send({ email: 'nonexistentuser@gmail.com' })
      .expect(200);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ msg: 'User not registered' });
  });
  

});
//
// describe('/api/users/resetPassword', () => {
//     test('resetPassword should update the password for a registered user', async () => {
     
     
  
//       const res = await request(app)
//         .post('/api/users/resetPassword')
//         .send({ email:'tharushadinuth21@gmail.com', password: 'newpassword' });
  
//       expect(res.statusCode).toEqual(201);
//       expect(res.body).toEqual({ msg: 'Record Updated...!' });
//     });
  
//     test('resetPassword should return an error if the user is not registered', async () => {
     
  
//       const res = await request(app)
//         .post('/api/users/resetPassword')
//         .send({ email: 'nonexistentuser@test.com', password: 'newpassword' });
  
//       expect(res.statusCode).toEqual(401);
//       expect(res.body).toEqual({ message: 'User not registered' });
//     });
//   });