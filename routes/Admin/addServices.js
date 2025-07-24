const express = require('express');
const db = require('../../utils/db');
const router = express.Router();

// Make sure this exists

// POST /addService
router.post('/', (req, res) => {
    const { userId, serviceId } = req.payload; // Use req.body for POST data


    if (!userId || !serviceId) {
        return res.status(400).json({ message: 'userId and serviceId are required.' });
    }

    db.collection('users').findOne({ userId }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.' });
        }

        if (!user) {
            return res.status(404).json({ message: 'Invalid user.' });
        } else {
            // Add serviceId if not already present
            if (!user.services.includes(serviceId)) {
                db.collection('users').updateOne(
                    { userId },
                    { $push: { services: serviceId } },
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: 'Failed to update user.' });
                        }
                        user.services.push(serviceId);
                        res.status(200).json({ message: 'Service added successfully.', user });
                    }
                );
            } else {
                res.status(200).json({ message: 'Service already exists for user.', user });
            }
        }
    });
});

module.exports = router;