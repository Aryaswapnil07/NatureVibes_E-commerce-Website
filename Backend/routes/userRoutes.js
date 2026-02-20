const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {protect} = require("../middleware/authMiddleware")
const router = express.Router();

/*
========================================
REGISTER ROUTE
========================================
*/
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user._id,
                role: user.role,
            },
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
                if (err) throw err;

                res.status(201).json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    token,
                });
            }
        );

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});


/*
========================================
LOGIN ROUTE
========================================
*/
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user._id,
                role: user.role,
            },
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
                if (err) throw err;

                res.json({
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    token,
                });
            }
        );

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});
//  @route GET /Api/users/profile 
//  @desc Get logged in-user Profile 
// @acess Private 

router.get("/profile" ,  protect , async (req ,res ) => {
    res.json("req.user");
} )

module.exports = router;
