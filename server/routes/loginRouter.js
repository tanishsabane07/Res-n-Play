const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/users");
const { sendVerificationEmail } = require("../config/email");

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

        // Generate verification token
        // const verificationToken = crypto.randomBytes(32).toString('hex');
        // const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: role || 'player',
            // verificationToken,
            // verificationTokenExpiry: tokenExpiry
        }); 

        await newUser.save();

        // Send verification email
        // await sendVerificationEmail(email, name, verificationToken);

        //token
        const token = generateToken(newUser);

        res.status(201).json({
            message: "User registered successfully!", // Please check your email to verify your account.
            token: token
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
            return res.status(400).json({message: "User not found!"});
        }
        const isMatch = await bcrypt.compare(password, found_user.password);

        if(!isMatch)
        {
            return res.status(400).json({message: "Invalid Credentials!"});
        }

        // Check if email is verified
        // if(!found_user.isVerified)
        // {
        //     return res.status(403).json({
        //         message: "Please verify your email before logging in.",
        //         needsVerification: true
        //     });
        // }

        const token = generateToken(found_user);

        res.status(200).json({
            message: "Login Successful!",
            token,
            user: {
                id: found_user._id,
                name: found_user.name,
                email: found_user.email,
                phone: found_user.phone,
                role: found_user.role,
                //isVerified: found_user.isVerified
            }
        });
    }
    catch(err)
    {
        console.log("Login Error: ", err);
        return res.status(500).json({message: "Server Error!"});
    }
});

// Verify email
// router.get("/verify-email", async (req, res) => {
//     try {
//         const { token } = req.query;

//         if (!token) {
//             return res.status(400).json({ message: "Verification token is required" });
//         }

//         // Find user with valid token
//         const user = await User.findOne({
//             verificationToken: token,
//             verificationTokenExpiry: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.status(400).json({ 
//                 message: "Invalid or expired verification token" 
//             });
//         }

//         // Mark user as verified
//         user.isVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpiry = undefined;
//         await user.save();

//         res.json({ 
//             message: "Email verified successfully! You can now login.",
//             verified: true
//         });

//     } catch (error) {
//         console.error("Verification error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// });

// // Resend verification email
// router.post("/resend-verification", async (req, res) => {
//     try {
//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({ message: "Email is required" });
//         }

//         const user = await User.findOne({ email });
        
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (user.isVerified) {
//             return res.status(400).json({ message: "Email is already verified" });
//         }

//         // Generate new token
//         const verificationToken = crypto.randomBytes(32).toString('hex');
//         user.verificationToken = verificationToken;
//         user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
//         await user.save();

//         // Send email
//         await sendVerificationEmail(email, user.name, verificationToken);

//         res.json({ message: "Verification email sent! Please check your inbox." });

//     } catch (error) {
//         console.error("Resend verification error:", error);
//         res.status(500).json({ message: "Server Error" });
//     }
// });

module.exports = router;