const express = require('express');
const User = require('../../models/User'); // Adjust path as needed'

const router = express.Router();

// Route to delete a serviceId from user's services array
router.post('/', async (req, res) => {
    const { userId, serviceId } = req.payload;


    if (!userId || !serviceId) {
        return res.status(400).json({ message: 'userId and serviceId are required.' });
    }

    try {
        const user = await User.findOne({ userId });
        if (user) {
            user.services.pull(serviceId);
            await user.save();
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Service deleted from user.', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;