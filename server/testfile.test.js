const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('./index'); 
const User = require('./models/user'); 
const Task = require('./models/task'); 

const mongoURL = process.env.DBUrl;

const mockUserId = '66768df0855324512aa6c92b';

jest.mock('./models/user', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  updateOne: jest.fn(),
  deleteMany: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('./models/task', () => ({
  find: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  deleteMany: jest.fn(), 
  save: jest.fn(),
}));



const userData = {
  email: 'tharushadinuth21@gmail.com',
  password: 'tharusha@123'
};

let adminToken;

beforeAll(async () => {
  await mongoose.connect(mongoURL);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  User.create.mockResolvedValue({ email: userData.email, password: hashedPassword });

  // Create a mock admin user
  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'admin@example.com',
    role: 'admin',
  };

  // Generate a JWT for the admin user
  adminToken = jwt.sign({ userId: adminUser._id, role: 'admin' }, process.env.JWT_SECRET);
  

  // Mock the User.findById method to return the admin user
  User.findById.mockResolvedValue(adminUser);



});

afterAll(async () => {
  await mongoose.connection.close();
  jest.resetAllMocks(); // Reset all mocks after tests
});

describe('POST /api/users/login', () => {
  test('should login existing user', async () => {
    User.findOne.mockResolvedValue({ email: userData.email, password: await bcrypt.hash(userData.password, 10) });

    const response = await request(app)
      .post('/api/users/login')
      .send(userData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(decoded.email).toEqual(userData.email);
  });

  test('should not login non-existing user', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'nonexistuser@gmail.com',
        password: 'tharusha@123'
      });

    expect(response.status).toBe(401);
  });

  test('should not login user with wrong password', async () => {
    User.findOne.mockResolvedValue({ email: userData.email, password: await bcrypt.hash(userData.password, 10) });

    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: userData.email,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
  });

  test('should not login non-existing user and wrong password', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'nonexistuser@gmail.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
  });
});

describe('/api/users/generateOTP&sendmail', () => {
  test('should generate an OTP for a registered user', async () => {
    User.findOne.mockResolvedValue({ email: userData.email });

    const res = await request(app)
      .post('/api/users/generateOTP&sendmail')
      .send({ email: userData.email });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('msg', 'otp send!');
    expect(res.body).toHaveProperty('code');
  });

  test('should return an error if the user is not registered', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/users/generateOTP&sendmail')
      .send({ email: 'nonexistentuser@gmail.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ msg: 'User not registered' });
  });

  test('It should verify OTP', async () => {
    app.locals.OTP = '123456';

    const response = await request(app)
      .get('/api/users/verifyOTP')
      .query({ code: '123456' });

    expect(response.statusCode).toBe(201);
  });

  test('It should not verify invalid OTP', async () => {
    app.locals.OTP = '123456';

    const response = await request(app)
      .get('/api/users/verifyOTP')
      .query({ code: '654321' });

    expect(response.statusCode).toBe(400);
  });

  test('It should reset password for existing user', async () => {
    User.findOne.mockResolvedValue({ email: userData.email }); // Mock user existence
    User.updateOne.mockResolvedValue({ nModified: 1 }); // Mock password update success
    app.locals.resetSession = true;

    const response = await request(app)
      .put('/api/users/resetPassword')
      .send({ email: userData.email, password: 'newPassword' });

    expect(response.statusCode).toBe(201);
  });

  test('It should not reset password for non-existing user', async () => {
    User.findOne.mockResolvedValue(null); // Mock user does not exist

    const response = await request(app)
      .put('/api/users/resetPassword')
      .send({ email: 'test@example.com', password: 'newPassword' });

    expect(response.statusCode).toBe(440);
  });
});

describe('User API Tests', () => {
  let user1id='668527d8310a9f0d42992339';

  describe('GET /users', () => {
    it('should fetch all users', async () => {
      User.find.mockResolvedValue([
        { _id: new mongoose.Types.ObjectId(), email: 'user1@example.com', role: 'intern' },
        { _id: new mongoose.Types.ObjectId(), email: 'user2@example.com', role: 'manager' },
      ]);

      const res = await request(app)
        .get('/api/users/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('users');
    });
  });

  describe('GET /user/:id', () => {
    it('should fetch a user by ID', async () => {
      User.findById.mockResolvedValue({ _id: mockUserId, email: 'tharushadinuth21@gmail.com', role: 'admin' });

      const res = await request(app)
        .get(`/api/users/user/${mockUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(201); // Corrected expected status code
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.user).toHaveProperty('_id', mockUserId.toString());
      expect(res.body.user).toHaveProperty('email', 'tharushadinuth21@gmail.com');
    });

  });

  describe('DELETE /user/:id', () => {
    it('should delete a user by ID', async () => {
      User.findByIdAndDelete.mockResolvedValue({ _id:'668527d8310a9f0d42992339', email:'testadmin2@gmail.com', role: 'admin' });
        
      const res = await request(app)
        .delete(`/api/users/users/${user1id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200); // Corrected expected status code
      expect(res.body).toHaveProperty('msg', "User deleted"); 
     
    });

    it('should return 404 if user not found', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/users/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual('User not found');
    });
  });

  describe('PUT /user/:id', () => {
    it('should update a user by ID', async () => {
      User.findOne.mockResolvedValue({ _id: user1id}); // Mock user existence
      User.updateOne.mockResolvedValue({ nModified: 1 }); 
      const res = await request(app)
        .put(`/api/users/users/${user1id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'testadmin2@gmail.com', role: 'intern' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('msg', "Record Updated...!");
    });

    it('Role is already set to user input role', async () => {
      User.findOne.mockResolvedValue({ _id: null});
      const res = await request(app)
        .put(`/api/users/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'newemail@example.com', role: 'admin' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ 'msg': "Role is already set to admin" });
    });
  });


  describe('POST /register', () => {

      afterEach(() => {
             jest.clearAllMocks();
        });

    it('should register a new user and send a welcome email', async () => {
      User.findOne.mockResolvedValue(null);
      const newUser = {
        fname: 'Test',
        lname: 'User',
        dob: '2000-01-01',
        role: 'admin',
        gender: 'male',
        email: 'testuser2@gmail.com',
        password: 'password123',
        jobtitle: 'Developer',
        employmentType: 'Full-time',
        department: 'Engineering',
      };
  
      User.create.mockResolvedValue(newUser);
  
      const res = await request(app)
         .post('/api/users/register')
         .set('Authorization', `Bearer ${adminToken}`)
         .send(newUser);
        expect(res.statusCode).toBe(201); 
        expect(res.body).toHaveProperty('msg', 'User registered successfully');
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('user', newUser);

    });

  
    it('should not register a user if email already exists', async () => {
      
      User.findOne.mockResolvedValue({ email: userData.email }); // Existing user
  
      const res = await request(app)
        .post('/api/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fname: 'Test',
          lname: 'User',
          dob: '1990-01-01',
          role: 'user',
          gender: 'male',
          email: userData.email,
          password: userData.password,
          jobtitle: 'Developer',
          employmentType: 'Full-time',
          department: 'Engineering'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('msg', 'User already exists');
       });


  });

  describe('PUT /uploadImage', () => {
    it('should update the user image and return the updated user', async () => {
      const mockUser = {
        _id: 'user1',
        name: 'Test User',
        // ... other user properties
      };
  
      const updatedUser = {
        ...mockUser,
        image: 'new-image.jpg',
      };
      
      User.findOne.mockResolvedValue({ _id: user1id });
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);
  
      const res = await request(app)
        .put('/api/users/uploadImage')
        .set('Authorization', `Bearer ${adminToken}`) // Set the Authorization header to a valid token
        .send({ image: 'new-image.jpg' });
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('msg', 'update successfully');
      expect(res.body).toHaveProperty('updateduser', updatedUser);
    });

    })

});

describe('Task API', () => {
  const mockTasks = [
    { _id: '6676aa39855324512aa6dbbd', title: 'Test Task 1', _userId: '665eafb6862b65c4483af0aa' },
  ];
  const taskuser = '665eafb6862b65c4483af0aa';

  let internToken;

  beforeAll(() => {
    const internUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'intern@example.com',
      role: 'intern',
    };
    internToken = jwt.sign({ id: internUser._id, role: 'intern' }, process.env.JWT_SECRET);
    User.findById.mockResolvedValue(internUser);

    Task.find.mockResolvedValue(mockTasks);

    Task.create = jest.fn().mockResolvedValue({
      _id: '6676aa39855324512aa6dbbd',
      title: 'Test Task',
      _userId: taskuser
    });

    Task.findByIdAndDelete.mockResolvedValue({ _id: '6676aa39855324512aa6dbbd' });

    Task.findByIdAndUpdate.mockResolvedValue({
      _id: '6676aa39855324512aa6dbbd',
      title: 'Test Task 2',
      _userId: taskuser
    });
  });

  it('should get tasks for a user', async () => {
    const res = await request(app)
      .get(`/api/users/task`)
      .set('Authorization', `Bearer ${internToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTasks);
  });

  it('should create a new task', async () => {
    const newTask = {title:'Test Task'};
    const res = await request(app)
      .post(`/api/users/task`)
      .set('Authorization', `Bearer ${internToken}`)
      .send(newTask);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      _id: '6676aa39855324512aa6dbbd',
      title: 'Test Task',
      _userId: taskuser
    });
  });

  it('should delete a task', async () => {
    const taskId = '6676aa39855324512aa6dbbd';

    const res = await request(app)
      .delete(`/api/users/task/${taskId}`)
      .set('Authorization', `Bearer ${internToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "task deleted" });
  });

});
