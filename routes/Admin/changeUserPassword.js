const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User'); // Adjust path as needed

const router = express.Router();

// Route: POST /admin/update-password
router.post('/', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

       
        // Check if user is authenticated and is admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate input
        if (!userId || !newPassword) {
            return res.status(400).json({ message: 'userId and password are required' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        const user = await User.findOneAndUpdate(
            { userId },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with userId and (plain) password as requested
        
        res.status(200).json({ userId, newPassword });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;