const express = require('express');
const Service = require('../../models/Service');
const router = express.Router();

// Mock Service model for demonstration
// Replace with your actual Service model (e.g., Mongoose model)

// PUT /admin/service/:id - Update a service by ID
router.put('/', async (req, res) => {
    try {
        const {serviceId,min,max,rate,refill}=req.payload;

        // Find service by ID and update
        const updateData = { min, max, rate, refill };
        const updatedService = await Service.findOneAndUpdate(
            { serviceId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
    

        res.json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
        res.status(500).json({ message: 'Error updating service', error: error.message });
    }
});

module.exports = router;