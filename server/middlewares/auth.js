const jwt = require("jsonwebtoken");
const User = require("..models/users");
require("dotenv").config();

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorisation'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if(!token) {
            return res.status(401).json({ message: 'Access token required' }); 
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if(!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user; // Attach user to request object
        next();
    }
    catch(error) {
        console.error("Auth Middleware Error: ", error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};