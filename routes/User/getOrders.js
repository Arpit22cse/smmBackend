const express = require('express');
const router = express.Router();
const db = require('../../utils/db');
require('dotenv').config();

router.get('/', async (req, res) => {

    try {
        // userId from authenticated user (assuming it's a unique string, not MongoDB's _id)
        const userId = req.user.id; // e.g., 'user123' from your UserSchema.userId

        // --- Pagination Parameters ---
        const page = parseInt(req.query['page[page]']) || 1;
        const limit = parseInt(req.query['page[limit]']) || 10;
        const skip = (page - 1) * limit;

        // 1. Find the user document to get their MongoDB _id
        const user = await db.collection('users').findOne({ userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const userObjectId = user._id; // This is the ObjectId we use for references

        // 2. Fetch orders for this user with pagination
        // Ensure you have an index on 'user' and 'createdAt' in the 'orders' collection for performance
        const orders = await db.collection('orders')
                               .find({ user: userObjectId })
                               .sort({ createdAt: -1 }) // Sort by creation date, newest first, crucial for consistent pagination
                               .skip(skip)
                               .limit(limit)
                               .toArray();


        

        // 5. Send the paginated and potentially updated orders data to the frontend
        res.status(200).json({ success: true, data: orders  });

    } catch (error) {
        console.error('Error in /orders route:', error);
        res.status(500).json({ success: false, message: 'Server Error: An error occurred while fetching and updating orders.' });
    }
});

module.exports = router;
