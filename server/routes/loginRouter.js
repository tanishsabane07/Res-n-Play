const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

router.post("/signup", async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if(!name || !email || !password || !phone)
    {
        return res.status(400).json("Please enter all required fields!");
    }

    if(password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long!" });
    }

    try
    {
        const user = await User.findOne({ email });
        if(user)
        {
            return res.status(400).json({message: "User already exists!"});
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'player'
        }); 

        await newUser.save();

        const token = generateToken(newUser);

        res.status(201).json({
            message: "User resgistered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role
            }
        });
    }
    catch(err)
    {
        console.log("Signup Error: ", err);
        return res.status(500).json({message: "Server Error"});
    }
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password)
    {
        return res.status(400).json("Please enter all fields!");
    }

    try {

        const found_user = await User.findOne({ email });
        if(!found_user)
        {
            return res.status(400).json({message: "Invalid Credentials!"});
        }
        const isMatch = await bcrypt.compare(password, found_user.password);

        if(!isMatch)
        {
            return res.status(400).json({message: "Invalid Credentials!"});
        }

        const token = generateToken(found_user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: found_user._id,
                name: found_user.name,
                email: found_user.email,
                phone: found_user.phone,
                role: found_user.role
            }
        });
    }
    catch(err)
    {
        console.log("Login Error: ", err);
        return res.status(500).json({message: "Server Error!"});
    }
});

module.exports = router;