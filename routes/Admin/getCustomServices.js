const express = require('express');
const Service = require('../../models/Service'); // Adjust the path as needed

const router = express.Router();

// GET /admin/custom-services - Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({});
        services.push({
            service: 1,
            name:"install followers",
            max:10,
            min:1
        })
        
        res.status(200).json({ data:services });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

module.exports = router;