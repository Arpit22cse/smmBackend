const express = require('express');
const Service = require('../../models/Service'); // Adjust path as needed

const router = express.Router();

// DELETE /admin/service/:serviceId
router.post('/', async (req, res) => {
    const { serviceId } = req.payload;
    try {
        const deletedService = await Service.findOneAndDelete({ serviceId });
        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting service', error: error.message });
    }
});

module.exports = router;