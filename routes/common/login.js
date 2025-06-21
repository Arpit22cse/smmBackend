const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../utils/db'); // Assume db.getUserById(userId) returns user object
require('dotenv').config();

const router = express.Router();

// Replace with your actual DB logic

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const COOKIE_NAME = 'auth_token';

router.post('/', async (req, res) => {
    const { userId, password } = req.body;
    console.log(req.body);
    
    if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and password required.' });
    }

    try {
        const user = await db.collection('users').findOne({userId});

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const tokenPayload = { id: user.userId, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: false, // Not using HTTPS on localhost
            sameSite: 'lax', // Allow cross-site requests from your React frontend
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.status(200).json({ userId, role:user.role, money:user.money});
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;