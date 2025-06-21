const express = require('express');
const db = require('../../utils/db');
const router = express.Router();

// Example controller function to get user by ID
router.post('/', async (req, res) => {
    try {
        const {userId} = req.payload;
        // Replace with your actual user fetching logic, e.g., from a database
        // const user = await User.findById(userId);
        const user = await db.collection('users').findOne({userId});

        const orders = await db.collection('orders').find({user:user._id}).toArray();

        const transactions = await db.collection('transactions').find({user:user._id}).toArray();

        const services = await db.collection('services').find({
            serviceId: { $in: user.services || [] }
        }).toArray();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({userId,balance:user.money,orders,transactions,services});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;