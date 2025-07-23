const express = require('express');
const Service = require('../../models/Service'); // Adjust path as needed
const User = require('../../models/User');

const router = express.Router();

// DELETE /admin/service/:serviceId
router.post('/', async (req, res) => {
    const { serviceId } = req.payload;
    try {
        // Delete the service
        const deletedService = await Service.findOneAndDelete({ serviceId });

        // Remove the service from all users' services array
        if (deletedService) {
            await User.updateMany(
                { services: { $in: [serviceId] } },
                { $pull: { services: serviceId } }
            );
        }
        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error: error.message });
    }
});

module.exports = router;