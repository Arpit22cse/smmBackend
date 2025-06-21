require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const cookie = require("cookie")

const validate = (req, res, next) => {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const token = cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ message: 'No auth token provided' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user
        req.payload = req.body;
        next();
    } catch (err) {
        console.log("it come here");
        return res.status(401).json({ message: 'Invalid request' });
    }
};

module.exports = validate;