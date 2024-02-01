const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const userModel = require('./models/user')

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