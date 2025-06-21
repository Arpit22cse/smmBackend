const express = require('express');
const router = express.Router();
const db = require('../../utils/db');

router.get('/me', async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ userId: req.user.id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            userId: user.userId,
            role: user.role,
            wallet: user.money
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;