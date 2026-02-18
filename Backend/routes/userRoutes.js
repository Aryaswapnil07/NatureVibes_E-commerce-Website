const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user 
// @access Public

router.post("/register" , async (req , res) => {
    const{name , email , password  } = req.body;

    try {
        //  REGISTRATION LOGIC
      let user = await User.findOne({email }); // for checking uniqueness

      if (user) return res.status(400).json({message : "User already exists"});
      user = new User({name, email , password});
      await user.save();


    //  CREATE JWT PayLoad
        const payload = {user : {id : user._id, role : user.role}};

     // Sign and return the token  along with user data    
     jwt.sign(payload , process.env.JWT_SECRET , {expiresIn : "40h"}, (err , token) => {
        if(err) throw err;

        // send the user and token in response 
        res.status(201).json({
            user: {
                _id : user._id,
                name : user.name,
                email : user.email,
                role : user.role,
            },
            token,
        });
        
     });


    } catch (error) {
        console.error("Not valid Inputs ")
        res.status(500).send("Server Error")
    }
}) 


//  @route POST /API/USERS/LOGIN
// @desc Authenticate user 
// @acceess PUBLIC 

router.post("/login" , async(req , res) => {
    const {email , password} = req.body;

    try {
        //  FINDING USER BY EMAIL 
        let user = await User.findOne({ email });

        if(!user) return res.status(400).json({message : "Invalid Credentials"});
        const isMatch = await user.res.status(400)
        
    } catch (error) {
        console.log(error)
    }
})

module.exports = router ;
