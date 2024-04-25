const mongoose = require('mongoose');	

const CVFilesSchema = new mongoose.Schema(
    {
        fileURL: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    }, 
        {
            timestamps: true,
        }
    
); 

const CVFiles = mongoose.model("cvfiles", CVFilesSchema);

module.exports = CVFiles;	
