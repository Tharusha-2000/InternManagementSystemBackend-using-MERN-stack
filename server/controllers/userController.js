const User=require('../models/user.js');

const getInterns = async (req, res) => {
    try {
        const interns = await User.find({ role: "intern" });
        if (interns) {
          res.status(200).json({ success: true, interns });
        } else {
          res.status(404).json({ success: false, message: "No interns found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    };

    module.exports = {
        getInterns
    }