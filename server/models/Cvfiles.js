import mongoose from 'mongoose';	

const cvfilesSchema = new mongoose.Schema(
    {
        fileURL: {
            type: String,
            required: true,
        }
    }, 
        {
            timestamps: true,
        }
    
); 

export default mongoose.model("Cvfiles", cvfilesSchema);	