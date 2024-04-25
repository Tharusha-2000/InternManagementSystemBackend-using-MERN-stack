const CVFiles = require("../models/Cvfiles.js");

const createCvfiles = async function(req, res) {
  const { fileURL, userId } = req.body;
  if (!fileURL || !userId) {
    return res.status(400).json({ msg: "Please provide both fileURL and userId" });
  }

  const newCvFile = new CVFiles({
    fileURL,
    userId
  });

  await newCvFile.save();

  res.status(201).json(newCvFile);
}


const getCvfiles = async function(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }
  
    try {
      const cvfiles = await CVFiles.find({ userId }, 'fileURL');
      res.status(200).json(cvfiles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }


  const deleteCvfile = async function(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }
  
    try {
      const cvfile = await CVFiles.findOneAndDelete({ userId });
      if (!cvfile) {
        return res.status(404).json({ msg: "CV file not found" });
      }
  
      res.status(200).json({ msg: "CV file deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }


module.exports = { createCvfiles, getCvfiles, deleteCvfile };


