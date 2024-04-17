import Cvfiles from "../models/Cvfiles.js";

export const createCvfiles = async (req, res) => {
    const { fileURL } = req.body;

    if (!fileURL) {
        res.status(400);
        throw new Error("fileURL is required");
    }

    try {
        const cvfiles = await Cvfiles.create({
            fileURL,
        });

        res.status(201).json({
            sucess: true,
            cvfiles,
        });
    }
    catch (error) {
        console.log(error);
        res.status(400);
        throw error;
    }
};
