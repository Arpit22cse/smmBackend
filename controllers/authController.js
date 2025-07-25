const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

class AuthController {

    async login(req, res) {
        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
        const COOKIE_NAME = 'auth_token';

        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ message: 'User ID and password required.' });
        }

        try {
            const user = await User.findOne({ userId });

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
                secure: true,
                sameSite: 'none',
                maxAge: 60 * 60 * 1000
            });

            res.status(200).json({ userId, role: user.role, money: user.money });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ message: 'Server error.' });
        }
    }

    async getMe(req, res) {
        try {
            const user = await User.findOne({ userId: req.user.id });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({
                userId: user.userId,
                role: user.role,
                wallet: user.money
            });
        } catch (error) {
            console.error('AuthMe error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new AuthController();