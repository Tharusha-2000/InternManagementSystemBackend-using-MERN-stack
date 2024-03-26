router.put("/resetPassword" ,async (req,res)=>{
    try {
        
      //  if(!req.app.locals.resetSession) return res.status(440).send({error : "Session expired!"});
  
        const { email, password } = req.body;
  
        try {
            User.findOne({ email})
  
                   await User.updateOne(
                       {
                          email: email,
                       },
                       {
                       $set: {
                          password: password,
                        },
                       }
                  );
                      req.app.locals.resetSession = false; // reset session
                      return res.status(201).send({ msg : "Record Updated...!"})    
  
        } catch (error) {
            return res.status(500).send({ error })
        }
  
    } catch (error) {
        return res.status(401).send({ error: "Invalid Request"})
    }
  });
  