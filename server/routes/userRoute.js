const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')


const userModel = require('./models/user')




router.post('/add_user', (req, res) => {
  // Hash the password before saving
  bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) return res.json({ status: false, error: "Hashing Error" });

      // Create a new user document
       const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
           
      });

      // Save the user document to the database
      newUser.save((err, result) => {
          if (err) return res.json({ status: false, error: err });
          return res.json({ status: true });
      });
  });
});


const app = express()
app.use(express.json())
app.use(cors())  
app.use(cookieParser())

app.post('/register', async (req, res) => {
    const { email, password} = req.body;
      bcrypt.hash(password, 10)
      .then(hash => {
         userModel.create({email,password:hash})  
            .then(user =>res.json({ status:"Ok" }))
            .catch(err => res.json({ err }))
      }).catch(err => res.json({ err }))
    });